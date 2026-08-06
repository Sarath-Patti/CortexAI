from typing import Any

from pydantic import BaseModel


class TextChunk(BaseModel):
    chunk_index: int
    text: str
    page_number: int
    metadata: dict[str, Any]


class DocumentChunker:
    """
    Recursive text chunker for breaking parsed document pages into chunks
    with target size ≈ 800 characters and overlap ≈ 150 characters.
    """

    def __init__(self, chunk_size: int = 800, chunk_overlap: int = 150) -> None:
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def chunk_pages(
        self,
        pages: list[tuple[int, str]],
        filename: str,
        document_id: str,
        workspace_id: str | None = None,
    ) -> list[TextChunk]:
        chunks: list[TextChunk] = []
        global_index = 0

        for page_num, text in pages:
            if not text or not text.strip():
                continue

            page_chunks = self._split_text(text)
            for sub_text in page_chunks:
                meta = {
                    "filename": filename,
                    "document_id": str(document_id),
                    "workspace_id": str(workspace_id) if workspace_id else "",
                    "page_number": page_num,
                    "chunk_index": global_index,
                }
                chunks.append(
                    TextChunk(
                        chunk_index=global_index,
                        text=sub_text,
                        page_number=page_num,
                        metadata=meta,
                    )
                )
                global_index += 1

        return chunks

    def _split_text(self, text: str) -> list[str]:
        text = text.strip()
        if len(text) <= self.chunk_size:
            return [text]

        chunks: list[str] = []
        start = 0

        while start < len(text):
            end = start + self.chunk_size
            if end >= len(text):
                chunk = text[start:].strip()
                if chunk:
                    chunks.append(chunk)
                break

            # Try finding natural break (newline or period)
            break_idx = text.rfind("\n", start, end)
            if break_idx == -1 or break_idx <= start:
                break_idx = text.rfind(". ", start, end)
            if break_idx == -1 or break_idx <= start:
                break_idx = text.rfind(" ", start, end)
            if break_idx == -1 or break_idx <= start:
                break_idx = end
            else:
                break_idx += 1  # Include space/period

            chunk = text[start:break_idx].strip()
            if chunk:
                chunks.append(chunk)

            start = max(start + 1, break_idx - self.chunk_overlap)

        return chunks
