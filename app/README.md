# FE Feed ⚡

An addictive, Instagram/Reels-style study app for the **NCEES FE Electrical & Computer exam**. Swipe up through an endless feed of bite-sized formulas, key facts, and concepts — short enough to stay fun, important enough to matter. Build a daily streak, earn XP, and master cards topic by topic.

It's a self-contained **Progressive Web App**: no build step, no framework, no accounts. Everything runs in the browser and saves to your device. Add it to your phone's home screen and it works offline.

**▶ Live:** enable GitHub Pages for this repo, then open the URL on your phone and tap **Share → Add to Home Screen**.

## Features
- **~196 cards** across all 16 FE Electrical & Computer knowledge areas
- Endless, shuffled vertical-snap feed with **KaTeX**-rendered formulas
- Gamified: day **streak 🔥**, daily-goal ring, XP/levels, combos, achievements, confetti
- Save (double-tap), mark mastered, per-topic mastery tracking
- Dark **and** light themes · installable · offline-capable · mobile-first

## Add or edit content
All study content lives in [`data/cards.js`](data/cards.js) as a plain array — add an object and it appears in the feed on reload:

```js
{
  id: "ckt-ohm", t: "circuits", k: "formula",   // t = topic key (see data/topics.js); k = formula|fact|concept|tip
  title: "Ohm's Law",
  body: "Short, punchy explanation — 1–2 sentences.",
  formula: String.raw`V = IR`,                   // optional LaTeX (KaTeX). Always use String.raw!
  ref: "FE Ref Handbook"                         // optional
}
```

## Run locally
Serve the folder over HTTP (needed for the offline service worker):
```bash
python -m http.server 8000
```
…then open `http://localhost:8000`.

---
Built mobile-first with accessibility in mind (44px+ touch targets, reduced-motion support, semantic color). Good luck on the exam. ⚡
