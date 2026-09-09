# URGENT pending Lovable prompt — app left mid-edit, build broken

The Lovable agent stopped halfway through the export/transcription fix
(out of credits). The editor preview does NOT build until this is sent.
The published live site is unaffected — do not Publish until this fix
lands. After adding credits, paste this into the Waxal project chat or
ask Claude to send it:

---

Yes — continue and finish now. The app currently doesn't build, so this is urgent, in order:
1. Repair src/routes/editor.tsx: wire the export sheet to the new saveVideo fallback chain (share → download → inline full-screen save view with "long-press → Save to Photos" guidance on iPhone), remove all references to the old handlers, and make the build green.
2. Finish the Captions panel work: relabel the two actions "Transcribe my voice" (primary, real audio via the transcribe endpoint) and "Write with AI" (existing topic/script path); transcribing shows progress with a cancel button and a 3-minute timeout; the no_key and bad_key error codes surface as clear banners; empty transcript says so honestly.
3. Store the transcribed word timings on the project and use them in the karaoke-style caption templates so the highlighted word matches the real speech timing (fall back to even interpolation for AI-written captions as now).
Then run the build, verify the export sheet and both caption actions in the browser (error paths included since no key is configured), and report.
