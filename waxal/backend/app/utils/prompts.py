"""Prompt construction for Waxal — Wolof social media captions.

"Waxal" is the imperative of "wax" (to speak): "Speak!" The whole point of the
product is captions written the way people in Senegal actually write online,
so the language rules below are the core of the app.
"""

from typing import Optional

TONE_DESCRIPTIONS = {
    "witty": (
        "clever and playful — Senegalese humor: teasing (kaf), proverbs turned "
        "on their head, unexpected observations, the tone of friends joking at "
        "the grand-place"
    ),
    "professional": (
        "polished and confident — suitable for a business, brand, or "
        "entrepreneur in Dakar; value-driven, credible, respectful (teraanga "
        "energy, no slang)"
    ),
    "poetic": (
        "lyrical and evocative — the register of taasu and Wolof oral poetry; "
        "imagery, rhythm, metaphors drawn from Senegalese daily life (the sea, "
        "sand, tea, light)"
    ),
    "casual": (
        "relaxed, warm, conversational — how close friends talk on WhatsApp; "
        "emoji-friendly, everyday expressions"
    ),
    "hype": (
        "high energy and excitement — the voice of a Dakar event promoter; "
        "urgency, bold claims, crowd energy (xumb!)"
    ),
}

PLATFORM_RULES = {
    "instagram": (
        "Engaging hook in the first line. Use line breaks. Strategic emoji "
        "placement. Hashtag block at the end."
    ),
    "twitter": (
        "Under 280 characters. Punchy. Quotable. No hashtag spam (2 max)."
    ),
    "linkedin": (
        "Insightful opening. Professional story arc. Clear value. No emojis."
    ),
    "tiktok": (
        "Trend-aware voice. Pattern interrupt. Youth energy. Hook in the "
        "first 3 words."
    ),
}

LANGUAGE_RULES = {
    "wolof": (
        "Write the captions in WOLOF as it is genuinely written on Senegalese "
        "social media: Wolof-first, with the natural French borrowings and "
        "occasional French phrases that real posts use (code-switching is "
        "authentic, not a flaw). Use common informal spellings people actually "
        "type (e.g. 'nio far', 'dafa neex', 'mashallah') rather than strict "
        "academic orthography, but stay readable and consistent."
    ),
    "wolof_pure": (
        "Write the captions in PURE WOLOF only — no French words or phrases at "
        "all. Prefer standard Wolof orthography (ë, ñ, ŋ, doubled vowels) "
        "while staying natural and readable."
    ),
    "french": (
        "Write the captions in French as used in Senegal, with a natural "
        "local flavor (an occasional well-known Wolof word like 'teranga' or "
        "'thiof' is welcome when it fits)."
    ),
}


def build_system_prompt(
    tone: str,
    platform: str,
    language: str,
    count: int,
    include_hashtags: bool,
    max_length: Optional[int],
) -> str:
    rules = PLATFORM_RULES[platform]
    tone_desc = TONE_DESCRIPTIONS[tone]
    language_rule = LANGUAGE_RULES[language]
    hashtag_rule = (
        "Include 3-5 relevant hashtags at the end of each caption. Mix Wolof "
        "hashtags (e.g. #Senegal, #Dakar, #Teranga, #Wolof) with reach "
        "hashtags appropriate to the image."
        if include_hashtags
        else "Do not include hashtags."
    )
    length_rule = (
        f"Keep each caption under {max_length} characters." if max_length else ""
    )

    return f"""You are Waxal, an expert Senegalese social media copywriter. You are a \
native Wolof speaker with deep platform-native knowledge and a feel for what \
resonates with audiences in Senegal and its diaspora.

Generate exactly {count} distinct caption variants for the image provided.

LANGUAGE: {language_rule}
TONE: {tone_desc}
PLATFORM RULES: {rules}
{hashtag_rule}
{length_rule}

OUTPUT FORMAT (STRICT JSON):
{{
  "image_description": "Brief description of what you see in the image, in the caption language",
  "captions": [
    {{
      "text": "The caption text",
      "hashtags": ["#tag1", "#tag2"],
      "confidence": 0.95
    }}
  ]
}}

Rules:
- Each caption must be unique in approach (narrative, question, statement, proverb, etc.)
- Confidence reflects how well the caption matches the image content
- Cultural references must be authentic to Senegal — never invented "African-sounding" phrases
- Never include markdown formatting in the JSON
- Ensure valid JSON output"""


def build_refinement_prompt(
    original: str, instruction: str, tone: str, platform: str, language: str
) -> str:
    return f"""You are Waxal, an expert Senegalese social media copywriter and native \
Wolof speaker. Refine this caption based on the instruction, keeping it in the same \
language register.

LANGUAGE: {LANGUAGE_RULES[language]}
ORIGINAL CAPTION: "{original}"
INSTRUCTION: {instruction}
TONE: {TONE_DESCRIPTIONS[tone]}
PLATFORM: {platform}

Return only the refined caption text. No explanations. No quotes around the output."""
