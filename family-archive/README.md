# Secka Family Archive: UI/UX redesign

A mobile-first redesign of the private family history app: "our family's home on the internet."

Open `index.html` in a browser. The page holds a **working phone prototype** (tap anything), a gallery of the 12 key screens (tap one to open it in the phone), the user flow, the information architecture and the design system.

People, stories and photos are sample content. The drawn photo scenes mark where real family photographs go.

## Information architecture

Five tabs, each with one job:

| Tab | Question it answers | What lives there |
|---|---|---|
| **Home** | "This is us." | Family name, tree preview, featured person, new memories, stories to listen to, timeline and places highlights, Ask |
| **Family** | "Who are we?" | Tree (by generation), find a person, person pages, **Timeline**, **Places** |
| **Memories** | "What did it look like?" | Photos, videos, voices and family moments, grouped by decade |
| **Stories** | "What did they say?" | **Tell a story** (record), questions waiting for answers, stories by theme |
| **Profile** | "Who can see it?" | Privacy and roles, members and invitations, larger text, download and legacy keeper |

Always within reach: the floating **+ Add** button, **Ask about your family** (Home and every person page) and a mini player that keeps a story playing while you browse.

## Core flow

Discover (Home) → Learn (Family → Person) → Preserve (Stories / Memories / + Add) → Invite (Profile / Home) → Build together (Ask, timeline, places all grow from each new story).

### Recording a story (no typing)
Stories → **Tell a story** → *Who is it about?* (tap a face) → *What is it about?* (Childhood, Parents, Marriage, Work, Migration, Family traditions, Important events, Life lessons, Other) → tap the microphone and talk → **Done**. The app transcribes it, suggests a title, and links it to the people, place and year it mentions.

### Ask the archive
Answers come only from what the family has saved. Every claim carries a numbered citation that opens the story, recording, photo or document behind it. When the archive has no answer, the app says so and suggests who could record it.

### Privacy
Private by default and never searchable. Roles are written in plain words: **Viewer** (look and listen), **Contributor** (also add), **Keeper** (also edit people, approve members, change privacy). A Keeper approves every new member. Living relatives' details are visible to Keepers only.

## Design system

- **Colour:** cream `#F6F0E5`, paper `#FCF9F3`, charcoal `#26221D`, secondary ink `#5C554B`, muted gold `#A5834A`, gold wash `#EEE4CF`. There is a matching dark theme.
- **Type:** Newsreader for names, headings, quotes and transcripts. Atkinson Hyperlegible (designed for low-vision readers) for controls and labels, at a 17px base.
- **Accessibility:** tap targets are at least 44px and primary buttons are 56px. Every icon has a text label. A "Larger text" switch scales the whole UI by 16%, and reduced motion is respected.
