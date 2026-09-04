#!/usr/bin/env python3
"""Generate the self-contained Artifact preview from a deployed page.

The page under modern-classroom-project/ is the source of truth. It loads its
images by relative path and pulls its typefaces from Google Fonts, which is
right for GitHub Pages and impossible for an Artifact: Artifacts render under a
CSP that blocks every external host, so the preview copy has to carry each byte
inline as a data: URI.

Keeping a second hand-edited copy in sync is what this replaces. That copy drifts
silently -- an asset swapped in one file and not the other renders fine locally
and breaks only once published, and a preview that quietly falls back to Georgia
means design decisions get made against type the deployed page never uses.

Usage:
    python3 tools/build-artifact.py                       # build the default page
    python3 tools/build-artifact.py --page some-dir --out /tmp/x.html

The build is a pure function of the repo: same input, same bytes out. Downloaded
fonts are cached under .artifact-cache/ so repeat builds need no network.
"""

from __future__ import annotations

import argparse
import base64
import hashlib
import mimetypes
import re
import sys
import urllib.request
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
CACHE = REPO / ".artifact-cache"

# Artifacts wrap the file in their own document, so these must not survive.
SCAFFOLD = [
    r"<!DOCTYPE html>\s*",
    r"</?html[^>]*>\s*",
    r"</?head>\s*",
    r"</?body>\s*",
    r'<meta charset="[^"]*">\s*',
    r'<meta name="viewport"[^>]*>\s*',
    r'<link rel="preconnect"[^>]*>\s*',
]

ASSET_SUFFIXES = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".pdf", ".ico"}

# Google serves a different subset per script; the page is English-only.
KEEP_SUBSETS = {"latin", "latin-ext"}

# Without a modern UA Google returns TTF instead of the far smaller woff2.
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/120.0 Safari/537.36")


def fetch(url: str) -> bytes:
    """GET with an on-disk cache keyed by URL, so rebuilds work offline."""
    CACHE.mkdir(exist_ok=True)
    key = CACHE / (hashlib.sha256(url.encode()).hexdigest()[:24] + Path(url).suffix)
    if key.exists():
        return key.read_bytes()
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=60) as r:
        data = r.read()
    key.write_bytes(data)
    return data


def data_uri(payload: bytes, mime: str) -> str:
    return f"data:{mime};base64," + base64.b64encode(payload).decode()


def inline_fonts(html: str) -> tuple[str, list[str]]:
    """Swap the Google Fonts <link> for @font-face rules with embedded woff2."""
    link = re.search(r'<link href="(https://fonts\.googleapis\.com/css2\?[^"]+)"[^>]*>', html)
    if not link:
        return html, []

    css = fetch(link.group(1)).decode()

    # Each @font-face is preceded by a /* subset */ comment naming its script.
    blocks, families = [], []
    for subset, block in re.findall(r"/\*\s*([\w-]+)\s*\*/\s*(@font-face\s*\{.*?\})", css, re.S):
        if subset not in KEEP_SUBSETS:
            continue
        for url in re.findall(r"url\((https://[^)]+?)\)", block):
            block = block.replace(url, data_uri(fetch(url), "font/woff2"))
        blocks.append(block)
        fam = re.search(r"font-family:\s*'([^']+)'", block)
        if fam and fam.group(1) not in families:
            families.append(fam.group(1))

    if not blocks:
        raise SystemExit("font CSS returned no usable @font-face blocks")

    return html.replace(link.group(0), "<style>\n" + "\n".join(blocks) + "\n</style>"), families


def inline_scripts(html: str, page: Path) -> str:
    """Replace <script src="local.js"> with the script body."""
    def sub(m: re.Match) -> str:
        target = page / m.group(1)
        if not target.exists():
            return m.group(0)
        # A literal </script> inside the payload would close the tag early.
        body = target.read_text(errors="replace").replace("</script>", "<\\/script>")
        return "<script>\n" + body + "\n</script>"

    return re.sub(r'<script src="([^"]+)"\s*>\s*</script>', sub, html)


def inline_assets(html: str, page: Path) -> tuple[str, list[str]]:
    """Embed every local file referenced by a quoted string.

    Deliberately matches quoted strings anywhere rather than only HTML
    attributes: the slideshows list their frames in a JS array, and an earlier
    hand-sync inlined the attributes but missed the array.
    """
    used: list[str] = []

    def sub(m: re.Match) -> str:
        quote, name = m.group(1), m.group(2)
        target = page / name
        if Path(name).suffix.lower() not in ASSET_SUFFIXES or not target.exists():
            return m.group(0)
        mime = mimetypes.guess_type(name)[0] or "application/octet-stream"
        used.append(name)
        return quote + data_uri(target.read_bytes(), mime) + quote

    # ("|') then a bare relative filename -- no scheme, no leading slash.
    pattern = r"([\"'])(?!https?:|data:|#|/)([\w][\w ./-]*\.\w{2,5})\1"
    return re.sub(pattern, sub, html), used


def verify(html: str, page: Path) -> None:
    """Fail loudly rather than publish a page with a hole in it."""
    problems = []

    for tag_m in re.finditer(r"<(\w+)\b([^>]*)>", html, re.S):
        tag, attrs = tag_m.group(1).lower(), tag_m.group(2)
        for m in re.finditer(r"(src|href)\s*=\s*\"([^\"]+)\"", attrs):
            attr, ref = m.group(1), m.group(2)
            if ref.startswith(("data:", "#", "mailto:", "tel:")):
                continue
            if ref.startswith(("http://", "https://")):
                # an <a href> is somewhere the reader navigates *to*, not a
                # subresource the page fetches, so the CSP has no say in it --
                # only flag externals the browser would try to load inline
                if not (tag == "a" and attr == "href"):
                    problems.append(f"external reference survives CSP-blocked: {ref[:80]}")
            elif (page / ref).exists():
                # still applies to anchors: a local file has to be inlined or
                # the link is dead once the page is lifted out of the repo
                problems.append(f"local asset left as a relative path: {ref}")

    for m in re.finditer(r"[\"']([\w][\w ./-]*\.(?:png|jpe?g|gif|webp|svg|pdf))[\"']", html):
        if (page / m.group(1)).exists():
            problems.append(f"local asset left un-inlined in a string: {m.group(1)}")

    # word boundary so <header> and <headline> do not read as a leftover <head>
    for tag in ("<!DOCTYPE", "<html", "<body", "<head"):
        if re.search(re.escape(tag) + r"\b", html, re.I):
            problems.append(f"document scaffolding survives: {tag}")

    if problems:
        raise SystemExit("verification failed:\n  " + "\n  ".join(sorted(set(problems))))


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--page", default="modern-classroom-project",
                    help="directory holding index.html (default: %(default)s)")
    ap.add_argument("--out", default=None,
                    help="output path (default: build/<page>.artifact.html)")
    args = ap.parse_args()

    page = (REPO / args.page).resolve()
    source = page / "index.html"
    if not source.exists():
        raise SystemExit(f"no index.html under {page}")

    out = Path(args.out) if args.out else REPO / "build" / f"{page.name}.artifact.html"
    out.parent.mkdir(parents=True, exist_ok=True)

    html = source.read_text()
    html, families = inline_fonts(html)
    html = inline_scripts(html, page)
    html, assets = inline_assets(html, page)
    for rx in SCAFFOLD:
        html = re.sub(rx, "", html, flags=re.I)
    html = html.strip() + "\n"

    verify(html, page)
    out.write_text(html)

    print(f"built  {out.relative_to(REPO) if out.is_relative_to(REPO) else out}")
    print(f"  fonts   {len(families)} embedded: {', '.join(families)}")
    print(f"  assets  {len(assets)} embedded ({len(set(assets))} distinct)")
    print(f"  size    {out.stat().st_size / 1048576:.2f} MB of the 16 MB budget")
    return 0


if __name__ == "__main__":
    sys.exit(main())
