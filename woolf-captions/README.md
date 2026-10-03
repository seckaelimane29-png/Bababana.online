# Woolf Captions

AI auto-captions video editor for **iOS and Android** (Expo / React Native). Upload or record a video, generate word-by-word animated captions with AI, style them, cut the video, add text, and export.

## Features

| Area | What you get |
| --- | --- |
| **AI captions** | Word-level timestamps (OpenAI Whisper), 18 languages + auto-detect, regroup by words-per-line |
| **Caption styles** | 8 templates (Woolf, Hype, Karaoke, Boxed, Cinema, Neon, Marker, Clean), 6 fonts, size, position (drag on the video), text / active-word / keyword / outline colors, background box, ALL CAPS, shadow |
| **Animations** | Pop, Bounce, Karaoke fill, Fade, None — same look in the preview and in the exported MP4 |
| **Editing** | Split (cut), Delete, Trim start / end, Duplicate, Undo / Redo (60 steps), Restore original, multi-track timeline with thumbnails and zoom |
| **Text** | Add text, drag to move, double-tap to edit, fonts, colors, background, outline, duration, split |
| **Audio** | Volume 0–200 % (boost on export), mute, speed 0.25×–3× |
| **AI Magic** | Cut silences (jump cuts), remove filler words (um / uh), highlight keywords + emojis, translate captions |
| **Transcript** | Edit every caption line like a document, add / delete lines, tap a timestamp to jump |
| **Export** | MP4 720p / 1080p / original with burned-in animated captions (via the render server), SRT, WebVTT, plain transcript, save to Photos, share |

## Project layout

```
src/app/            screens (Expo Router): home, editor/[id], export/[id], settings
src/components/     video stage, caption renderer, timeline, toolbar, bottom-sheet panels
src/lib/            AI (transcribe / translate / keywords), caption + timeline logic, templates, render client
src/store/          projects library + editor state with undo/redo (zustand, saved on device)
server/             Node + ffmpeg render server (export MP4, transcription for long videos)
```

## Run it

```bash
npm install
npx expo start          # scan the QR code with a development build
npm run typecheck
```

The app uses native modules (video, file system, secure storage), so use a **development build** rather than Expo Go:

```bash
npx eas-cli@latest build --profile development --platform ios      # or android
```

## API key

Open **Settings** in the app and paste your **OpenAI API key**. It is stored encrypted on the device (iOS Keychain / Android Keystore) and used for:

- speech-to-text (`whisper-1`, word timestamps)
- translate captions + highlight keywords (`gpt-4o-mini` by default, editable in Settings)

For a public App Store / Play Store release, don't ship your own key inside the app. Run the server with `OPENAI_API_KEY` set and switch **Transcribe with → Woolf server** so the key stays on the server.

## Export server

Burning animated captions into an MP4 needs ffmpeg, which runs on the server in `server/` (see [server/README.md](server/README.md)). Without the server, the app can still export SRT / VTT / TXT caption files.

## Publish to the App Store and Google Play

1. `npm i -g eas-cli && eas login` (free Expo account)
2. `eas init` — links the project and writes the project ID into `app.json`
3. Check `ios.bundleIdentifier` / `android.package` in `app.json` (currently `online.bababana.woolfcaptions`) and replace the icons in `assets/`
4. Build: `npm run build:ios` and `npm run build:android` (EAS handles signing certificates)
5. Submit: `npx eas-cli@latest submit -p ios` (needs an Apple Developer account, $99/yr) and `npx eas-cli@latest submit -p android` (needs a Google Play Console account, $25 once)
