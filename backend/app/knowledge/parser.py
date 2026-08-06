from io import BytesIO
from pathlib import Path

import docx
from pypdf import PdfReader

from app.knowledge.exceptions import DocumentProcessingError, UnsupportedFileTypeError


class DocumentParser:
    """
    Parses PDF, DOCX, TXT, and Markdown files into plain UTF-8 text per page.
    """

    SUPPORTED_EXTENSIONS = {".pdf", ".docx", ".txt", ".md"}

    @classmethod
    def parse_bytes(cls, file_bytes: bytes, filename: str) -> list[tuple[int, str]]:
        ext = Path(filename).suffix.lower()
        if ext not in cls.SUPPORTED_EXTENSIONS:
            raise UnsupportedFileTypeError(
                f"File extension '{ext}' is not supported. "
                f"Supported types: {', '.join(cls.SUPPORTED_EXTENSIONS)}"
            )

        try:
            if ext == ".pdf":
                return cls._parse_pdf(file_bytes)
            elif ext == ".docx":
                return cls._parse_docx(file_bytes)
            elif ext in {".txt", ".md"}:
                return cls._parse_text(file_bytes)
            else:
                raise UnsupportedFileTypeError(f"Unsupported file type: {ext}")
        except Exception as err:
            if isinstance(err, (UnsupportedFileTypeError, DocumentProcessingError)):
                raise
            raise DocumentProcessingError(
                f"Failed to parse document content: {str(err)}"
            ) from err

    @classmethod
    def _parse_pdf(cls, file_bytes: bytes) -> list[tuple[int, str]]:
        pages: list[tuple[int, str]] = []
        reader = PdfReader(BytesIO(file_bytes))
        for page_idx, page in enumerate(reader.pages, start=1):
            text = page.extract_text() or ""
            if text.strip():
                pages.append((page_idx, text.strip()))
        if not pages:
            pages.append((1, ""))
        return pages

    @classmethod
    def _parse_docx(cls, file_bytes: bytes) -> list[tuple[int, str]]:
        doc = docx.Document(BytesIO(file_bytes))
        full_text = "\n".join([p.text for p in doc.paragraphs if p.text.strip()])
        return [(1, full_text.strip())]

    @classmethod
    def _parse_text(cls, file_bytes: bytes) -> list[tuple[int, str]]:
        try:
            text = file_bytes.decode("utf-8")
        except UnicodeDecodeError:
            text = file_bytes.decode("latin-1", errors="replace")
        return [(1, text.strip())]
