# Landing-page inspiration section — ready-to-send Lovable prompt

The Lovable workspace ran out of credits before this step could be sent.
After adding credits (https://lovable.dev/settings/billing), paste the
prompt below into the Waxal project chat
(https://lovable.dev/projects/c079f7f2-de41-4991-aa27-5fee22a8c707).

The three images were generated with Higgsfield (Soul model, 9:16) and
also live in the Higgsfield account's generations history if these
temporary URLs expire — re-download them from there if needed.

---

Add an inspiration section to the home/landing page (Projects list route)
to show people what they can make with Waxal before they start.

First, download these three AI-generated 9:16 images and save them as
local project assets (do not hotlink them — the URLs are temporary):

1. https://d8j0ntlcm91z4.cloudfront.net/user_32PxqDPA8X9noHlN2LbLCwF301t/hf_20260906_215032_e4ae76a9-f473-42a4-b4fe-ba9cc8e670b5.png
   — a woman vlogger on a Dakar rooftop → save as src/assets/waxal/inspo-vlog.png
2. https://d8j0ntlcm91z4.cloudfront.net/user_32PxqDPA8X9noHlN2LbLCwF301t/hf_20260906_215032_a1a6d473-d2f5-4fa0-8ef6-5fdbfffc462a.png
   — a man recording a talking-head video with a mic → save as src/assets/waxal/inspo-talkinghead.png
3. https://d8j0ntlcm91z4.cloudfront.net/user_32PxqDPA8X9noHlN2LbLCwF301t/hf_20260906_215032_405c0d23-2d62-46fa-880d-937a626b1335.png
   — a storyteller filming in Sandaga market → save as src/assets/waxal/inspo-film.png

Then build the section: below RECENT and above GENERATE, add a
horizontally scrolling row titled "INSPIRATION" (mono uppercase label,
same style as the other section labels) of three tall 9:16 rounded cards,
each showing one of the images with a LIVE ANIMATED caption overlay
rendered on top using our existing caption template system (reuse the
caption template preview/overlay components — do not duplicate their CSS):

- Card 1 (inspo-vlog): "Vlog" — caption style "Daily" cycling the words
  "Tey la ñëw Dakar" word by word.
- Card 2 (inspo-talkinghead): "Talking head" — caption style "Karaoke"
  cycling "Waxal léegi dégg naa la".
- Card 3 (inspo-film): "Film" — caption style "Cinema" cycling
  "Benn réew benn taariix".

Each card has a small bottom gradient with its category name in bold cream
and a tiny mono sub-line ("Caption: Daily", etc.). Tapping a card opens the
editor with that caption template pre-selected on the demo project. Cards
use snap horizontal scrolling on mobile, lazy-load the images, and keep the
warm dark visual identity. Keep everything else on the page unchanged.
