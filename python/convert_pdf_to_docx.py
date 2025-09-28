#!/usr/bin/env python3
import sys
from pdf2docx import Converter

if len(sys.argv) < 3:
    print("Usage: convert_pdf_to_docx.py input.pdf output.docx", file=sys.stderr)
    sys.exit(1)

pdf_path = sys.argv[1]
docx_path = sys.argv[2]

try:
    cv = Converter(pdf_path)
    cv.convert(docx_path, start=0, end=None)
    cv.close()
    print("OK")
except Exception as e:
    print(f"ERROR: {e}", file=sys.stderr)
    sys.exit(2)
