import json
import sys
from pathlib import Path

from pypdf import PdfReader


def normalize_text(text: str) -> str:
    normalized = (
        (text or "")
        .replace("\ufb00", "ff")
        .replace("\ufb01", "fi")
        .replace("\ufb02", "fl")
        .replace("\ufb03", "ffi")
        .replace("\ufb04", "ffl")
    )
    return normalized.encode("utf-8", "ignore").decode("utf-8", "ignore")


def extract_pdf(pdf_path: Path) -> dict:
    reader = PdfReader(str(pdf_path))
    pages = []
    for page in reader.pages:
        text = normalize_text(page.extract_text() or "")
        if text.strip():
            pages.append(text.strip())

    metadata = reader.metadata or {}
    title = metadata.get("/Title") if isinstance(metadata, dict) else None
    if not title:
        title = pdf_path.stem

    return {
        "title": title,
        "page_count": len(reader.pages),
        "text": "\n\n".join(pages).strip(),
    }


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")

    if len(sys.argv) != 2:
        print("usage: extract_pdf_text.py <pdf-path>", file=sys.stderr)
        return 1

    pdf_path = Path(sys.argv[1]).resolve()
    if not pdf_path.exists():
        print(f"PDF not found: {pdf_path}", file=sys.stderr)
        return 1

    payload = extract_pdf(pdf_path)
    print(json.dumps(payload, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
