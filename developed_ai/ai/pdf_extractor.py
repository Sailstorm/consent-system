import logging
import re
import time
from io import BytesIO

from pypdf import PdfReader


logger = logging.getLogger("uvicorn.error")

MAX_PDF_BYTES = 10 * 1024 * 1024
MAX_PDF_PAGES = 50
MAX_POLICY_CHARACTERS = 100_000
MIN_POLICY_CHARACTERS = 100

# Conservative quality check, not a reliable OCR detector.
MIN_PAGE_TEXT_CHARACTERS = 30


class PdfExtractionError(RuntimeError):
    def __init__(self, message, status_code=422):
        super().__init__(message)
        self.status_code = status_code


def _clean_page_text(text):
    """
    Conservatively normalise extracted PDF text.

    Preserve:
    - line order
    - blank-line paragraph boundaries
    - internal horizontal spacing

    Do not guess reading order or merge hyphenated words.
    """
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = text.replace("\x00", "")
    text = text.replace("\u00a0", " ")

    # Remove trailing whitespace, but retain internal spacing.
    lines = [
        line.rstrip(" \t")
        for line in text.split("\n")
    ]

    # Remove whitespace-only lines.
    lines = [
        "" if not line.strip() else line
        for line in lines
    ]

    # Remove the shared left margin without removing relative indent.
    nonempty_lines = [
        line for line in lines if line.strip()
    ]

    if nonempty_lines:
        common_indent = min(
            len(line) - len(line.lstrip(" "))
            for line in nonempty_lines
        )

        if common_indent:
            lines = [
                line[common_indent:] if line else ""
                for line in lines
            ]

    text = "\n".join(lines)

    # Keep a single blank line between blocks.
    text = re.sub(r"\n{3,}", "\n\n", text)

    return text.strip()


def extract_policy_from_pdf(pdf_bytes):
    """
    Extract text from an uploaded PDF.

    Does not perform OCR.
    Does not create AI segments.
    Does not assign page numbers to downstream evidence.
    """
    started_at = time.perf_counter()

    if not pdf_bytes:
        raise PdfExtractionError(
            "The uploaded file is empty.",
            status_code=400,
        )

    if len(pdf_bytes) > MAX_PDF_BYTES:
        raise PdfExtractionError(
            "The PDF exceeds the 10 MiB file size limit.",
            status_code=413,
        )

    # A filename or MIME type alone does not prove this is a PDF.
    if not pdf_bytes.startswith(b"%PDF-"):
        raise PdfExtractionError(
            "The uploaded file does not have a valid PDF header.",
            status_code=415,
        )

    pages = []
    low_text_pages = []
    total_characters = 0

    try:
        with BytesIO(pdf_bytes) as stream:
            reader = PdfReader(stream, strict=False)

            # First version does not accept encrypted PDFs.
            if reader.is_encrypted:
                raise PdfExtractionError(
                    "Encrypted or password-protected PDFs are not "
                    "supported. Please upload an unencrypted copy.",
                    status_code=422,
                )

            page_count = len(reader.pages)

            if page_count == 0:
                raise PdfExtractionError(
                    "The PDF contains no pages."
                )

            if page_count > MAX_PDF_PAGES:
                raise PdfExtractionError(
                    f"The PDF exceeds the {MAX_PDF_PAGES}-page limit. "
                    "No pages have been silently omitted.",
                    status_code=413,
                )

            for page_number, page in enumerate(
                reader.pages,
                start=1,
            ):
                try:
                    raw_text = page.extract_text(
                        extraction_mode="layout",
                        layout_mode_space_vertically=True,
                    ) or ""
                except Exception as exc:
                    raise PdfExtractionError(
                        f"Text could not be extracted from page "
                        f"{page_number}. Please check the file or "
                        "paste the policy text."
                    ) from exc

                text = _clean_page_text(raw_text)

                meaningful_characters = sum(
                    character.isalnum()
                    for character in text
                )

                if (
                    meaningful_characters
                    < MIN_PAGE_TEXT_CHARACTERS
                ):
                    low_text_pages.append(page_number)

                # Include the separators used when merging pages.
                total_characters += len(text)
                if page_number > 1:
                    total_characters += 2

                if total_characters > MAX_POLICY_CHARACTERS:
                    raise PdfExtractionError(
                        "The extracted policy exceeds the "
                        "100,000-character limit. "
                        "The text has not been truncated.",
                        status_code=413,
                    )

                pages.append({
                    "page_number": page_number,
                    "text": text,
                })

    except PdfExtractionError:
        raise

    except Exception as exc:
        logger.exception("Could not parse the uploaded PDF.")
        raise PdfExtractionError(
            "The PDF could not be read. It may be damaged or "
            "use an unsupported format."
        ) from exc

    if low_text_pages:
        page_list = ", ".join(
            str(number) for number in low_text_pages
        )

        raise PdfExtractionError(
            f"Very little readable text was found on page(s): "
            f"{page_list}. These may be scanned, blank, or "
            "image-heavy pages. Analysis was stopped to avoid "
            "silently missing content. Please use a searchable "
            "PDF or paste the complete policy text."
        )

    text = "\n\n".join(
        page["text"] for page in pages
    ).strip()

    if len(text) < MIN_POLICY_CHARACTERS:
        raise PdfExtractionError(
            "Too little text was extracted for policy analysis."
        )

    elapsed = time.perf_counter() - started_at

    logger.info(
        "PDF extraction complete: pages=%d characters=%d "
        "elapsed=%.2fs",
        page_count,
        len(text),
        elapsed,
    )

    return {
        "text": text,
        "pages": pages,
        "page_count": page_count,
        "character_count": len(text),
        "extraction_seconds": round(elapsed, 2),
    }