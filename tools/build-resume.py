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
.docx's core properties. The script refuses to write anything that isn't one page.
"""
import argparse, os, shutil, subprocess, sys, tempfile

DPI = 216  # Letter at 216 dpi = 1836x2376, the size the pages were designed around
PDF_FILTER = 'pdf:writer_pdf_Export:{"UseTaggedPDF":{"type":"boolean","value":"true"}}'


def run(cmd, **kw):
    r = subprocess.run(cmd, capture_output=True, text=True, **kw)
    if r.returncode:
        sys.exit(f"{cmd[0]} failed:\n{r.stdout}{r.stderr}")
    return r.stdout


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

    with tempfile.TemporaryDirectory() as tmp:
        # a private profile keeps a stale or locked user profile from failing the run
        run(["soffice", f"-env:UserInstallation=file://{tmp}/profile", "--headless", "--norestore",
             "--convert-to", PDF_FILTER, "--outdir", tmp, src])
        pdf = os.path.join(tmp, "resume.pdf")
        pages = next(int(l.split()[1]) for l in run(["pdfinfo", pdf]).splitlines() if l.startswith("Pages:"))
        if pages != 1:
            sys.exit(f"résumé renders to {pages} pages; tighten spacing or copy until it fits on one")
        run(["pdftoppm", "-png", "-r", str(DPI), "-singlefile", pdf, os.path.join(tmp, "resume")])
        shutil.copy(pdf, os.path.join(folder, "resume.pdf"))
        shutil.copy(os.path.join(tmp, "resume.png"), os.path.join(folder, "resume.png"))
    print(f"wrote {os.path.relpath(folder)}/resume.pdf and resume.png (1 page)")


if __name__ == "__main__":
    main()
