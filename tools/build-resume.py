#!/usr/bin/env python3
"""Render a résumé .docx into the PDF and preview PNG a portfolio page links to.

Each page folder keeps its own résumé (see CLAUDE.md): `resume.docx` is the source,
`resume.pdf` is the download, `resume.png` is the image shown on the page. Edit the
.docx, then rebuild the other two:

    python3 tools/build-resume.py wayfinder      # -> wayfinder/resume.pdf + resume.png
    python3 tools/build-resume.py assets         # the root page's résumé

Needs LibreOffice Writer and Poppler, which the cloud container does not ship with:

    apt-get install -y --no-install-recommends libreoffice-writer poppler-utils

The PDF is tagged (headings, lists, reading order) and takes its title from the
.docx's core properties. The script refuses to write anything that isn't one page,
or one whose name, contact line and summary aren't centred on the page (checked
on the rendered PDF, so an indent or a tab stop tuned for a shorter URL shows up),
or a résumé whose site link doesn't point at its own page: a tailored résumé in
`playlab/` shows and links rahulshah.design/playlab, the master in `assets/` the
bare domain, so whoever reads the PDF lands on the version made for them.
"""
import argparse, os, re, shutil, subprocess, sys, tempfile, zipfile

DPI = 216  # Letter at 216 dpi = 1836x2376, the size the pages were designed around
SITE = "rahulshah.design"
PDF_FILTER = 'pdf:writer_pdf_Export:{"UseTaggedPDF":{"type":"boolean","value":"true"}}'


def run(cmd, **kw):
    r = subprocess.run(cmd, capture_output=True, text=True, **kw)
    if r.returncode:
        sys.exit(f"{cmd[0]} failed:\n{r.stdout}{r.stderr}")
    return r.stdout


def check_site_link(folder, src):
    """The header's site link must name the page this résumé ships with."""
    repo = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    slug = os.path.relpath(folder, repo).replace(os.sep, "/")
    want = SITE if slug == "assets" else f"{SITE}/{slug}"
    with zipfile.ZipFile(src) as z:
        doc = z.read("word/document.xml").decode("utf-8")
        rels = z.read("word/_rels/document.xml.rels").decode("utf-8")
    # the visible text: a run reading exactly the URL (the email shares its prefix)
    shown = re.findall(rf">({re.escape(SITE)}(?:/[\w-]+)?)</w:t>", doc)
    linked = re.findall(rf'Target="https?://({re.escape(SITE)}(?:/[\w-]+)?)/?"', rels)
    if shown != [want] or linked != [want]:
        sys.exit(f"site link in {os.path.relpath(src)} should read and point to {want}; "
                 f"it reads {shown or 'nothing'} and points to {linked or 'nothing'}. "
                 "Edit the header run in word/document.xml and the hyperlink Target in "
                 "word/_rels/document.xml.rels")


HEADER_LINES = 3     # name, contact line, summary
CENTRE_TOLERANCE = 3  # points; a stray indent or left-aligned line is far more


def check_header_centred(pdf):
    """The header lines must sit on the page's centre line, as rendered."""
    xml = run(["pdftotext", "-bbox-layout", "-f", "1", "-l", "1", pdf, "-"])
    width = float(re.search(r'<page width="([\d.]+)"', xml).group(1))
    lines = re.findall(r'<line xMin="([\d.]+)" yMin="[\d.]+" xMax="([\d.]+)"[^>]*>(.*?)</line>', xml, re.S)
    for x0, x1, body in lines[:HEADER_LINES]:
        text = " ".join(re.findall(r">([^<]+)</word>", body))
        off = (float(x0) + float(x1)) / 2 - width / 2
        if abs(off) > CENTRE_TOLERANCE:
            sys.exit(f"header line {text!r} sits {off:+.1f}pt off centre; give its paragraph "
                     '<w:jc w:val="center"/> and no left, right or first-line indent')


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("folder", help="folder holding resume.docx (e.g. wayfinder, assets)")
    folder = os.path.abspath(ap.parse_args().folder)
    src = os.path.join(folder, "resume.docx")
    if not os.path.isfile(src):
        sys.exit(f"no resume.docx in {folder}")
    for tool in ("soffice", "pdfinfo", "pdftoppm"):
        if not shutil.which(tool):
            sys.exit(f"{tool} not found; see the install line at the top of this script")
    check_site_link(folder, src)

    with tempfile.TemporaryDirectory() as tmp:
        # a private profile keeps a stale or locked user profile from failing the run
        run(["soffice", f"-env:UserInstallation=file://{tmp}/profile", "--headless", "--norestore",
             "--convert-to", PDF_FILTER, "--outdir", tmp, src])
        pdf = os.path.join(tmp, "resume.pdf")
        pages = next(int(l.split()[1]) for l in run(["pdfinfo", pdf]).splitlines() if l.startswith("Pages:"))
        if pages != 1:
            sys.exit(f"résumé renders to {pages} pages; tighten spacing or copy until it fits on one")
        check_header_centred(pdf)
        run(["pdftoppm", "-png", "-r", str(DPI), "-singlefile", pdf, os.path.join(tmp, "resume")])
        shutil.copy(pdf, os.path.join(folder, "resume.pdf"))
        shutil.copy(os.path.join(tmp, "resume.png"), os.path.join(folder, "resume.png"))
    print(f"wrote {os.path.relpath(folder)}/resume.pdf and resume.png (1 page)")


if __name__ == "__main__":
    main()
