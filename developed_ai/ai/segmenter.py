## Parse the policy into segments


import re
from typing import List, Dict, Optional


# ============================================================
# Configuration
# ============================================================



# Recommended starting values.
# These are segmentation limits, NOT the model's maximum context length.
TARGET_TOKENS = 60
MAX_TOKENS = 100

# ============================================================
# Token utilities
# ============================================================

def count_tokens(text: str, tokenizer) -> int:
    return len(
        tokenizer.encode(
            text,
            add_special_tokens=False,
        )
    )

# ============================================================
# Basic text processing
# ============================================================

def clean_text(text: str) -> str:

    text = text.replace("\r\n", "\n")
    text = text.replace("\r", "\n")

    # Remove unnecessary spaces
    text = re.sub(
        r"[ \t]+",
        " ",
        text
    )

    return text.strip()


def split_paragraphs(text: str) -> List[str]:
    """
    True paragraphs are separated by blank lines.
    """

    text = clean_text(text)

    paragraphs = re.split(
        r"\n\s*\n+",
        text
    )

    paragraphs = [
        re.sub(
            r"\s+",
            " ",
            paragraph
        ).strip()
        for paragraph in paragraphs
        if paragraph.strip()
    ]

    return paragraphs


def split_sentences(text: str) -> List[str]:

    # Convert single line breaks into spaces first.
    # This fixes wrapped privacy-policy text.
    text = re.sub(
        r"\s*\n\s*",
        " ",
        text
    )

    sentences = re.split(
        r'(?<=[.!?])\s+(?=[A-Z0-9“"])',
        text
    )

    return [
        s.strip()
        for s in sentences
        if s.strip()
    ]


# ============================================================
# Heading detection
# ============================================================

def is_heading(text: str) -> bool:

    text = text.strip()

    if not text:
        return False

    words = text.split()

    if len(words) > 15:
        return False

    # Normal sentence → probably not heading
    if text.endswith((".", "?", "!")):
        return False

    # Numbered heading
    if re.match(
        r"^\d+(?:\.\d+)*[\.\)]?\s+\S+",
        text
    ):
        return True

    # Colon heading
    if text.endswith(":"):
        return True

    # ALL CAPS
    letters = [
        c for c in text
        if c.isalpha()
    ]

    if letters:

        uppercase_ratio = (
            sum(c.isupper() for c in letters)
            / len(letters)
        )

        if uppercase_ratio >= 0.8:
            return True

    # Title Case
    title_words = sum(
        1
        for word in words
        if word[:1].isupper()
    )

    if (
        len(words) <= 12
        and title_words / len(words) >= 0.7
    ):
        return True

    return False

# ============================================================
# Long-text splitting
# ============================================================

def hard_token_split(
    sentence: str,
    tokenizer,
    max_tokens: int = MAX_TOKENS,
) -> List[str]:
    token_ids = tokenizer.encode(
        sentence,
        add_special_tokens=False,
    )

    chunks = []

    for start in range(0, len(token_ids), max_tokens):
        chunk_ids = token_ids[start:start + max_tokens]

        chunk_text = tokenizer.decode(
            chunk_ids,
            skip_special_tokens=True,
        ).strip()

        if chunk_text:
            chunks.append(chunk_text)

    return chunks

# ============================================================
# Paragraph accumulation
# ============================================================

def pack_sentences(
    text: str,
    tokenizer,
    target_tokens: int = TARGET_TOKENS,
    max_tokens: int = MAX_TOKENS,
    max_sentences: int = 2
):

    sentences = split_sentences(text)

    if not sentences:
        return []

    chunks = []
    current = []

    for sentence in sentences:

        # --------------------------------
        # Extremely long single sentence
        # --------------------------------

        if count_tokens(sentence,tokenizer) > max_tokens:

            if current:
                chunks.append(
                    " ".join(current)
                )
                current = []

            chunks.extend(
                hard_token_split(
                    sentence,
                    max_tokens=max_tokens
                )
            )

            continue

        # --------------------------------
        # First sentence
        # --------------------------------

        if not current:

            current = [sentence]
            continue

        current_text = " ".join(current)

        candidate = (
            current_text
            + " "
            + sentence
        )

        # --------------------------------
        # Stop if token limit exceeded
        # --------------------------------

        if count_tokens(candidate, tokenizer) > max_tokens:

            chunks.append(
                current_text
            )

            current = [sentence]

            continue

        # --------------------------------
        # Stop if enough sentences
        # --------------------------------

        if len(current) >= max_sentences:

            chunks.append(
                current_text
            )

            current = [sentence]

            continue

        # --------------------------------
        # Stop if target size reached
        # --------------------------------

        if count_tokens(current_text, tokenizer) >= target_tokens:

            chunks.append(
                current_text
            )

            current = [sentence]

            continue

        current.append(sentence)

    if current:

        chunks.append(
            " ".join(current)
        )

    return chunks

# ============================================================
# Section processing
# ============================================================

def create_section_segments(
    heading: Optional[str],
    text: str,
    tokenizer,
) -> List[Dict]:
    chunks = pack_sentences(text, tokenizer)

    return [
        {
            "heading": heading,
            "text": chunk,
        }
        for chunk in chunks
    ]


# ============================================================
# Main segmentation function
# ============================================================

"""
    Segment a complete privacy policy.

    Rules
    -----
    1. Split policy into paragraphs.
    2. Detect section headings.
    3. If headings exist:
         group paragraphs under their heading.
    4. Pack paragraphs within each section.
    5. Split sections that are too long.
    6. If no headings exist:
         perform paragraph-aware token chunking.
    7. Preserve heading metadata.
"""

def segment_policy(
    policy_text: str,
    tokenizer,
) -> List[Dict]:
    paragraphs = split_paragraphs(policy_text)

    if not paragraphs:
        return []

    segments = []

    def append_section(heading, content):
        if content:
            segments.extend(
                create_section_segments(
                    heading,
                    " ".join(content),
                    tokenizer,
                )
            )
        elif heading:
            # if there is only heading, still keep the heading
            segments.extend(
                create_section_segments(
                    None,
                    heading,
                    tokenizer,
                )
            )

    if any(is_heading(p) for p in paragraphs):
        current_heading = None
        current_content = []

        for paragraph in paragraphs:
            if is_heading(paragraph):
                append_section(
                    current_heading,
                    current_content,
                )
                current_heading = paragraph
                current_content = []
            else:
                current_content.append(paragraph)

        append_section(current_heading, current_content)

    else:
        for paragraph in paragraphs:
            segments.extend(
                create_section_segments(
                    None,
                    paragraph,
                    tokenizer,
                )
            )

    # if no segments generated, process again
    if not segments:
        segments = create_section_segments(
            None,
            clean_text(policy_text),
            tokenizer,
        )

    final_segments = []

    for segment in segments:
        text = segment["text"].strip()
        heading = segment["heading"]

        if not text:
            continue

        model_input = (
            f"Section: {heading}\n\nText: {text}"
            if heading
            else text
        )

        final_segments.append({
            "segment_id": len(final_segments),
            "heading": heading,
            "text": text,
            "text_token_count": count_tokens(
                text,
                tokenizer,
            ),
            "model_input_token_count": count_tokens(
                model_input,
                tokenizer,
            ),
            "model_input": model_input,
        })

    return final_segments