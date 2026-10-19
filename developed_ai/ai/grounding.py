"""
Deterministic grounding check for Stage 2 output (security plan M-02;
Iteration 2 vulnerability report finding N6).

The prompt asks the model not to invent facts, but nothing enforced it.
This check runs on every parsed response, before anything reaches a user:

- Hard facts must appear in the evidence: every number (retention periods,
  ages, dollar amounts) and every capitalised name (organisations,
  countries, products) in a field must occur in the evidence text.
- Wording must be mostly drawn from the evidence: at least
  MIN_CONTENT_SUPPORT of a factual field's content words must appear in the
  evidence (after light stemming), which allows paraphrase but not
  invention.

A factual detail field that fails is removed (set to None) and logged, so
the user sees less rather than something unsupported. If the summary
itself fails, or no factual field survives, a Stage2OutputError is raised
so the existing retry-once logic gets a second attempt.

why_this_matters is commentary on significance, not a factual claim, so
only the hard-fact rule applies to it.
"""

import logging
import re

logger = logging.getLogger("uvicorn.error")

MIN_CONTENT_SUPPORT = 0.4
# Fields with fewer content words than this are too short to judge by
# overlap; they still have to pass the hard-fact rule.
MIN_WORDS_TO_SCORE = 3

_STOPWORDS = frozenset("""
a about above after again all also an and any are as at be because been
before being below between both but by can could did do does doing down
during each either etc few for from further had has have having here how
however i if in into is it its itself may might more most must no nor not
of off on once only or other our ours out over own per same shall should
so some such than that the their theirs them then there these they this
those through to too under until up upon us very via was we were what when
where whether which while who whom why will with within without would you
your yours information data personal service services policy user users
including include includes used use uses using provide provided provides
""".split())

_WORD = re.compile(r"[a-z0-9]+(?:'[a-z]+)?")
_NUMBER = re.compile(r"\d+(?:[.,]\d+)*")
# A capitalised word that isn't sentence-initial: likely a proper noun.
_PROPER_NOUN = re.compile(r"(?<![.!?:]\s)(?<!^)(?<!\n)\b([A-Z][a-zA-Z0-9&]{1,})\b")
_ALWAYS_ALLOWED_CAPS = frozenset({
    "I", "You", "We", "Our", "Your", "The", "This", "These", "Data",
    "Personal", "Information", "Privacy", "Policy", "Policies",
})


def _stem(word):
    for suffix in ("ations", "ation", "ings", "ing", "ies", "ied", "es", "ed", "s"):
        if word.endswith(suffix) and len(word) - len(suffix) >= 3:
            word = word[: -len(suffix)]
            break
    return word[:6]


def _content_stems(text):
    return {
        _stem(word)
        for word in _WORD.findall(text.lower())
        if len(word) >= 3 and word not in _STOPWORDS
    }


_NUMBER_WORDS = {
    word: str(value)
    for value, word in enumerate(
        "zero one two three four five six seven eight nine ten eleven twelve "
        "thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty".split()
    )
}
_NUMBER_WORDS.update({
    "thirty": "30", "forty": "40", "fifty": "50", "sixty": "60",
    "seventy": "70", "eighty": "80", "ninety": "90", "hundred": "100",
})


def _numbers(text, include_words=False):
    found = {number.replace(",", "") for number in _NUMBER.findall(text)}
    if include_words:
        found |= {
            _NUMBER_WORDS[word]
            for word in _WORD.findall(text.lower())
            if word in _NUMBER_WORDS
        }
    return found


def _proper_nouns(text):
    return {
        word for word in _PROPER_NOUN.findall(text)
        if word not in _ALWAYS_ALLOWED_CAPS
    }


# A pluralised acronym such as "IDs", "TVs" or "URLs".
_PLURAL_ACRONYM = re.compile(r"[A-Z]{2,}s")


def _name_in_evidence(name, evidence_lower):
    if name.lower() in evidence_lower:
        return True

    # The model pluralises acronyms the policy uses in the singular
    # ("device ID" -> "IDs"), which failed live summaries and cost a retry
    # each. Match the singular as a whole word: a short acronym like "id"
    # would otherwise match inside words such as "provide".
    if _PLURAL_ACRONYM.fullmatch(name):
        singular = re.escape(name[:-1].lower())
        return re.search(rf"\b{singular}\b", evidence_lower) is not None

    return False


def unsupported_reason(value, evidence_text, score_words=True):
    """Return why value isn't supported by evidence_text, or None if it is."""

    evidence_lower = evidence_text.lower()

    missing_numbers = _numbers(value) - _numbers(evidence_text, include_words=True)
    if missing_numbers:
        return f"numbers not in evidence: {sorted(missing_numbers)}"

    missing_names = {
        name for name in _proper_nouns(value)
        if not _name_in_evidence(name, evidence_lower)
    }
    if missing_names:
        return f"names not in evidence: {sorted(missing_names)}"

    if score_words:
        stems = _content_stems(value)
        if len(stems) >= MIN_WORDS_TO_SCORE:
            supported = stems & _content_stems(evidence_text)
            share = len(supported) / len(stems)
            if share < MIN_CONTENT_SUPPORT:
                return f"only {share:.0%} of its wording appears in the evidence"

    return None


def evidence_text_of(evidence):
    return "\n".join(
        " ".join(filter(None, [item.get("heading"), item.get("text")]))
        for item in evidence
    )


def enforce_grounding(result, evidence, category, error_cls):
    """
    Remove unsupported detail fields from a parsed Stage 2 result in place.
    Raises error_cls (retryable) if the summary is unsupported or nothing
    factual survives.
    """

    if result["summary"] is None:
        return result

    evidence_text = evidence_text_of(evidence)
    details = result["detailed_explanation"]

    for field, value in details.items():
        if value is None:
            continue

        reason = unsupported_reason(
            value,
            evidence_text,
            score_words=field != "why_this_matters",
        )

        if reason:
            # The kind of failure only, not the rejected words, which may
            # include personal details (security plan L-01).
            logger.warning(
                "%s: removed unsupported field %s (%s).",
                category,
                field,
                reason.split(":")[0],
            )
            details[field] = None

    summary_reason = unsupported_reason(result["summary"], evidence_text)
    if summary_reason:
        raise error_cls(f"{category}: summary not supported by evidence ({summary_reason}).")

    if not any(
        value is not None
        for field, value in details.items()
        if field != "why_this_matters"
    ):
        raise error_cls(f"{category}: no factual field survived the grounding check.")

    return result
