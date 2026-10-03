import assert from 'node:assert/strict';
import { test } from 'node:test';

import { assColor, buildASS } from '../src/ass.js';
import { sourceRangeToTimeline } from '../src/timeline.js';

test('assColor converts RGB(A) to ASS BGR with inverted alpha', () => {
  assert.equal(assColor('#FF8800'), '&H000088FF');
  assert.equal(assColor('#000000CC'), '&H33000000');
});

test('ranges crossing a cut are split onto the timeline', () => {
  const clips = [{ start: 0, end: 3 }, { start: 4.5, end: 8 }];
  assert.deepEqual(sourceRangeToTimeline(clips, 2, 5.5), [
    { start: 2, end: 3 },
    { start: 3, end: 4 },
  ]);
  assert.deepEqual(sourceRangeToTimeline(clips, 3.2, 4.4), []);
});

test('buildASS emits one event per word state and highlights the active word', () => {
  const ass = buildASS(
    {
      clips: [{ start: 0, end: 10 }],
      captions: [{ start: 0, end: 1, words: [{ text: 'hi', start: 0, end: 0.5 }, { text: 'you', start: 0.5, end: 1, emphasis: true }] }],
      // 'you' is a keyword: yellow while 'hi' is spoken, highlight green once it is the active word.
      texts: [],
      style: { fontFamily: 'Anton', size: 0.07, color: '#FFFFFF', highlightColor: '#00FF00', emphasisColor: '#FFFF00', strokeColor: '#000000', strokeWidth: 3, background: null, uppercase: true, animation: 'pop', positionY: 0.7, shadow: true },
    },
    1080,
    1920,
  );
  const events = ass.split('\n').filter((l) => l.startsWith('Dialogue:'));
  assert.equal(events.length, 2);
  assert.match(events[0], /0:00:00\.00,0:00:00\.50/);
  assert.match(events[0], /\\1c&H0000FF00\\fscx88.*HI.*\\1c&H0000FFFF\}YOU/s); // active word green, keyword yellow
  assert.match(events[1], /\\1c&H00FFFFFF\}HI.*\\1c&H0000FF00.*YOU/s); // active word wins over keyword color
});
