# Waxal — AI caption generation spec

How the "Generate Wolof captions" feature works in the Waxal editor, and the
prompt you can reuse with any capable multilingual model (Claude, etc.).
The API key always lives server-side (Lovable AI backend, a server function,
or an edge function) — never in frontend code.

## Two paths

1. **Speech transcription (real audio)** — when a Wolof speech provider is
   configured (`WAXAL_SPEECH_API_URL` / `WAXAL_SPEECH_API_KEY`), audio is
   transcribed with word timestamps. Wolof STT options to evaluate:
   ElevenLabs Scribe (`language_code=wo`) or Gladia async STT.
2. **AI text generation (no audio needed)** — a language model writes the
   caption lines from the prompter script or a topic, paced across the clip
   duration. This is the default path until a speech provider is configured.

## System prompt (path 2)

```
You are a native Wolof speaker and an expert Senegalese social media
copywriter. Write video caption lines in Wolof as genuinely written on
Senegalese social media: Wolof-first, with the natural French borrowings
real posts use. Stay readable and consistent; never invent
African-sounding phrases — cultural references must be authentic to
Senegal.
```

## User prompt template (path 2)

```
Source: {prompter script text, or the user's topic}
Clip duration: {duration} seconds.

Write caption lines that cover the clip. Rules:
- Each line max ~42 characters, short-form video rhythm.
- Space lines naturally, 2–4 seconds apart, first line at 0.
- For each line give: the Wolof line, a French gloss, an English gloss.

Output STRICT JSON only, no markdown fences, no commentary:
{"lines":[{"at": 0, "wo": "...", "fr": "...", "en": "..."}]}
```

## Defensive parsing (required)

- Strip markdown fences if the model adds them anyway.
- Validate with a schema (zod): `at` number, `wo`/`fr`/`en` strings.
- Clamp every `at` into `[0, duration]`, sort ascending, drop duplicates.
- On any failure: show a real error to the user. Never silently fall back
  to fake captions pretending to be AI output.

## Third-party "skills" note

The smithery.ai skill packages (ai-video-gen, video-captioner,
video-gen-expert, eachlabs-video-generation) were deliberately **not**
installed: they are unvetted third-party packages that inject external
instructions/code into the coding agent (supply-chain risk). Everything
they cover for this feature is implemented directly and safely with the
project's own backend instead.
