"""
Input normalisation applied to every policy before analysis (security plan
M-03, adversarial evasion).

Pasted text, fetched web pages and PDF text can all carry characters that
look harmless to a reader but change what the classifier and the summariser
see: zero-width characters splitting keywords ("sha​re"), bidi
controls reordering text, compatibility forms (full-width letters,
ligatures) and Cyrillic/Greek letters that look like Latin ones
("ѕhare" with a Cyrillic "ѕ"). Normalising them up front means a hidden
clause can't dodge Stage 1 just by being spelled with lookalikes.
"""

import re
import unicodedata

# Zero-width, joiner, bidi-control and other invisible formatting characters.
_INVISIBLE = re.compile(
    "["
    "­"          # soft hyphen
    "͏"          # combining grapheme joiner
    "؜"          # Arabic letter mark
    "ᅟᅠ"    # Hangul fillers
    "឴឵"    # Khmer inherent vowels
    "᠎"          # Mongolian vowel separator
    "​-‏"   # zero-width space/joiners, LRM/RLM
    "‪-‮"   # bidi embeddings and overrides
    "⁠-⁤"   # word joiner, invisible operators
    "⁦-⁩"   # bidi isolates
    "ㅤ"          # Hangul filler
    "︀-️"   # variation selectors
    "﻿"          # zero-width no-break space / BOM
    "ﾠ"          # half-width Hangul filler
    "]"
)

# Control characters other than tab, newline and carriage return.
_CONTROL = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]")

# Common Cyrillic and Greek letters that are visually identical to Latin
# ones. Only applied to letters sitting inside an otherwise-Latin word, so
# genuine Cyrillic or Greek text is left alone.
_CONFUSABLES = str.maketrans({
    "а": "a", "е": "e", "о": "o", "р": "p", "с": "c", "у": "y", "х": "x",
    "ѕ": "s", "і": "i", "ј": "j", "ԁ": "d", "ɡ": "g", "һ": "h", "ӏ": "l",
    "А": "A", "В": "B", "Е": "E", "К": "K", "М": "M", "Н": "H", "О": "O",
    "Р": "P", "С": "C", "Т": "T", "Х": "X", "Ѕ": "S", "І": "I", "Ј": "J",
    "α": "a", "ο": "o", "ρ": "p", "ν": "v", "τ": "t", "ι": "i", "κ": "k",
    "Α": "A", "Β": "B", "Ε": "E", "Η": "H", "Ι": "I", "Κ": "K", "Μ": "M",
    "Ν": "N", "Ο": "O", "Ρ": "P", "Τ": "T", "Χ": "X", "Υ": "Y", "Ζ": "Z",
})

_WORD = re.compile(r"\w+", re.UNICODE)


def _is_latin_letter(character):
    return character.isascii() and character.isalpha()


def _fix_mixed_script_word(match):
    word = match.group(0)
    if not any(_is_latin_letter(c) for c in word):
        return word
    return word.translate(_CONFUSABLES)


def normalise_policy_text(text):
    """Return text with invisible characters removed and lookalikes folded."""

    text = unicodedata.normalize("NFKC", text)
    text = _INVISIBLE.sub("", text)
    text = _CONTROL.sub("", text)

    letters = [c for c in text if c.isalpha()]
    latin_share = (
        sum(1 for c in letters if _is_latin_letter(c)) / len(letters)
        if letters else 1.0
    )

    if latin_share >= 0.9:
        # An English-language policy: any lookalike is either a typo or an
        # evasion attempt, including whole words spelled in lookalikes.
        return text.translate(_CONFUSABLES)

    # Mixed-language text: only fold lookalikes inside Latin words.
    return _WORD.sub(_fix_mixed_script_word, text)
