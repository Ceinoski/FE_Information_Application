# FE Feed ⚡

An addictive, Instagram/Reels-style study app for the **FE Electrical & Computer exam**. Swipe up through a never-ending feed of bite-sized formulas, key facts, and concepts — short enough to stay fun, important enough to matter. Build a daily streak, level up, and master cards topic by topic.

It's a self-contained **Progressive Web App**: no build step, no Node, no accounts. Everything runs in the browser and saves to your device.

---

## Run it

### Option A — one click (recommended)
Double-click **`Start FE Feed.bat`**. It serves the app on `http://localhost:8000` and opens your browser. Keep the little window open while you study. Running it this way enables **offline mode** and **"Install to home screen."**

### Option B — open directly
Open `app/index.html` in a browser. Works fine, but the offline service worker and install prompt are disabled on the `file://` protocol (formulas still render when you're online).

### Put it on your phone
1. Run `Start FE Feed.bat` on your PC.
2. Find your PC's local IP (`ipconfig` → IPv4, e.g. `192.168.1.42`).
3. On your phone (same Wi-Fi) visit `http://192.168.1.42:8000`.
4. Browser menu → **Add to Home Screen**. It now opens full-screen like a native app.

*(For a permanent install, drop the contents of `app/` onto any static host — GitHub Pages, Netlify, Vercel — and open the URL on your phone.)*

---

## How to use

| Gesture / control | What it does |
|---|---|
| **Swipe up / down** | Next / previous card (endless, shuffled) |
| **Double-tap a card** | Save it (heart pop) |
| **Save** (bookmark) | Stash a card for later — see the **Saved** tab |
| **Got it** (✓) | Mark a card mastered (+15 XP); counts toward topic progress |
| **Share** | Share/copy the card text |
| **Topics tab** | Jump into a single topic's feed; see per-topic mastery |
| **Stats tab** | Streak, XP/level, daily goal, mastery bars, achievements, settings |

**Gamification:** +5 XP per new card, +15 per mastered, a daily goal ring, a day **streak 🔥**, combo momentum, level-ups, and unlockable achievements with confetti.

---

## Project structure

```
FE_Info_App/
├─ Start FE Feed.bat        ← launcher
├─ README.md
├─ Data/                    ← your original source notes (School of PE)
└─ app/                     ← the web app
   ├─ index.html
   ├─ manifest.webmanifest
   ├─ sw.js                 ← service worker (offline cache)
   ├─ css/styles.css
   ├─ js/app.js             ← feed engine + gamification
   ├─ data/
   │  ├─ topics.js          ← 16 topics (name, color, icon)
   │  └─ cards.js           ← the knowledge deck  ← add cards here
   └─ icons/                ← app icons (+ make_icons.py generator)
```

---

## Add or edit content

All study content lives in **`app/data/cards.js`** as a plain array. Add an object and it shows up in the feed immediately (just reload):

```js
{
  id: "ckt-ohm",                 // unique id
  t: "circuits",                 // topic key (see data/topics.js)
  k: "formula",                  // formula | fact | concept | tip
  title: "Ohm's Law",
  body: "Short, punchy explanation — 1–2 sentences.",
  formula: String.raw`V = IR`,   // optional LaTeX (KaTeX-rendered). Use String.raw!
  ref: "FE Ref Handbook"         // optional source note
}
```

- **Formulas** are LaTeX, rendered with [KaTeX](https://katex.org/). Always wrap them in `` String.raw`...` `` so backslashes survive (`\frac`, `\sqrt`, `\omega`, …). If KaTeX can't load, a readable plaintext fallback is shown.
- **Topics** are defined in `app/data/topics.js` — to add one, give it a `key`, `name`, `color`, and a 24×24 SVG `icon` path.

The deck currently ships **~190 cards** across all 16 FE Electrical & Computer knowledge areas:
Mathematics · Probability & Statistics · Engineering Economics · Ethics & Professional Practice · Circuit Analysis · Electromagnetics · Electronics · Power · Control Systems · Communications · Signal Processing · Linear Systems · Digital Systems · Computer Networks · Computer Systems · Software Engineering.

---

## Notes
- Progress is stored in `localStorage` on the device — **Reset all progress** lives in the Stats tab.
- The source PDFs under `Data/` are OCR-extracted course notes; the curated cards were written from that syllabus, cleaned and verified for the feed.
- Built mobile-first with accessibility in mind (44px+ touch targets, reduced-motion support, semantic color, light/dark themes).

Good luck on the exam. ⚡
