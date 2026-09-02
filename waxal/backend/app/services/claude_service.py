import base64
import json
import re
from datetime import datetime, timezone
from uuid import uuid4

import anthropic

from app.config import get_settings
from app.exceptions import GenerationError
from app.models.schemas import (
    CaptionRequest,
    CaptionVariant,
    RefineRequest,
)
from app.utils.prompts import build_refinement_prompt, build_system_prompt


class ClaudeService:
    def __init__(self) -> None:
        settings = get_settings()
        self.model = settings.anthropic_model
        self._api_key = settings.anthropic_api_key or None
        self._client: anthropic.AsyncAnthropic | None = None

    @property
    def client(self) -> anthropic.AsyncAnthropic:
        # Lazy so the app can boot (and non-AI routes work) before a key is
        # configured. Falls back to ANTHROPIC_API_KEY / an `ant auth login`
        # profile when the .env value is empty.
        if self._client is None:
            try:
                self._client = anthropic.AsyncAnthropic(api_key=self._api_key)
            except anthropic.AnthropicError:
                raise GenerationError(
                    "No Anthropic API key configured on the server. "
                    "Set ANTHROPIC_API_KEY in backend/.env."
                )
        return self._client

    async def generate_captions(
        self, image_path: str, media_type: str, request: CaptionRequest
    ) -> dict:
        """Returns {"captions": [CaptionVariant, ...], "image_description": str,
        "generated_at": datetime}."""
        with open(image_path, "rb") as f:
            image_b64 = base64.standard_b64encode(f.read()).decode("utf-8")

        system_prompt = build_system_prompt(
            tone=request.tone.value,
            platform=request.platform.value,
            language=request.language.value,
            count=request.count,
            include_hashtags=request.include_hashtags,
            max_length=request.max_length,
        )

        user_text = (
            f"Additional context from the user: {request.context}"
            if request.context
            else "Generate the captions."
        )

        try:
            message = await self.client.messages.create(
                model=self.model,
                max_tokens=2000,
                system=system_prompt,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "image",
                                "source": {
                                    "type": "base64",
                                    "media_type": media_type,
                                    "data": image_b64,
                                },
                            },
                            {"type": "text", "text": user_text},
                        ],
                    }
                ],
            )
        except anthropic.AuthenticationError:
            raise GenerationError("The server's AI key is invalid or missing.")
        except anthropic.RateLimitError:
            raise GenerationError("The AI service is busy. Try again in a moment.")
        except anthropic.APIError:
            raise GenerationError("The AI service is unavailable. Try again shortly.")
        except TypeError:
            # The SDK raises TypeError when no credentials could be resolved.
            raise GenerationError(
                "No Anthropic API key configured on the server. "
                "Set ANTHROPIC_API_KEY in backend/.env."
            )

        data = self._parse_json_response(message)

        raw_captions = data.get("captions")
        if not isinstance(raw_captions, list) or not raw_captions:
            raise GenerationError("The AI returned no captions. Try again.")

        captions = []
        for i, c in enumerate(raw_captions):
            if not isinstance(c, dict) or not c.get("text"):
                continue
            hashtags = c.get("hashtags", [])
            if not isinstance(hashtags, list):
                hashtags = []
            try:
                confidence = min(1.0, max(0.0, float(c.get("confidence", 0.9))))
            except (TypeError, ValueError):
                confidence = 0.9
            captions.append(
                CaptionVariant(
                    id=f"cap_{uuid4().hex[:8]}_{i}",
                    text=str(c["text"]),
                    hashtags=[str(h) for h in hashtags],
                    tone=request.tone,
                    confidence=confidence,
                )
            )
        if not captions:
            raise GenerationError("The AI returned no usable captions. Try again.")

        return {
            "captions": captions,
            "image_description": str(data.get("image_description", "")),
            "generated_at": datetime.now(timezone.utc),
        }

    async def refine_caption(self, request: RefineRequest) -> CaptionVariant:
        prompt = build_refinement_prompt(
            original=request.original_caption,
            instruction=request.instruction,
            tone=request.tone.value,
            platform=request.platform.value,
            language=request.language.value,
        )

        try:
            message = await self.client.messages.create(
                model=self.model,
                max_tokens=1000,
                messages=[{"role": "user", "content": prompt}],
            )
        except anthropic.APIError:
            raise GenerationError("The AI service is unavailable. Try again shortly.")
        except TypeError:
            raise GenerationError(
                "No Anthropic API key configured on the server. "
                "Set ANTHROPIC_API_KEY in backend/.env."
            )

        refined_text = self._first_text(message).strip().strip('"')
        if not refined_text:
            raise GenerationError("The AI returned an empty refinement. Try again.")

        return CaptionVariant(
            id=f"refined_{uuid4().hex[:8]}",
            text=refined_text,
            hashtags=re.findall(r"#[\wÀ-ɏ]+", refined_text),
            tone=request.tone,
            confidence=0.92,
        )

    @staticmethod
    def _first_text(message) -> str:
        for block in message.content:
            if block.type == "text":
                return block.text
        return ""

    def _parse_json_response(self, message) -> dict:
        raw_text = self._first_text(message)
        # Strip a markdown code fence if present, else grab the outermost object.
        fenced = re.search(r"```(?:json)?\s*(.*?)\s*```", raw_text, re.DOTALL)
        if fenced:
            raw_text = fenced.group(1)
        else:
            braced = re.search(r"\{.*\}", raw_text, re.DOTALL)
            if braced:
                raw_text = braced.group(0)
        try:
            data = json.loads(raw_text)
        except json.JSONDecodeError:
            raise GenerationError("The AI response could not be read. Try again.")
        if not isinstance(data, dict):
            raise GenerationError("The AI response could not be read. Try again.")
        return data


claude_service = ClaudeService()
