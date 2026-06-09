/* ============================================================
   FE Feed — application logic
   Endless shuffled card feed + gamification, all client-side.
   ============================================================ */
(() => {
  "use strict";

  const TOPICS = window.FE_TOPICS || [];
  const CARDS = window.FE_CARDS || [];
  const TOPIC_BY = Object.fromEntries(TOPICS.map(t => [t.key, t]));
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const todayStr = () => new Date().toISOString().slice(0, 10);
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

  /* ---------- Persistent state ---------- */
  const KEY = "fefeed.v1";
  const defaults = () => ({
    xp: 0,
    seen: [],          // card ids ever seen
    mastered: [],      // card ids marked known
    saved: [],         // bookmarked card ids
    streak: 0,
    lastStudy: null,   // YYYY-MM-DD
    goalDate: null,    // day the goal counter belongs to
    goalCount: 0,      // cards seen today
    goalTarget: 20,
    badges: [],        // unlocked achievement ids
    topicsSeen: [],    // distinct topic keys seen
    explains: {},      // cache: cardId -> AI explanation text (saved on device)
    settings: { hideMastered: false, theme: "dark", coached: false, aiKey: "" }
  });
  let S = load();
  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY));
      if (!raw) return defaults();
      return Object.assign(defaults(), raw, { settings: Object.assign(defaults().settings, raw.settings || {}) });
    } catch { return defaults(); }
  }
  let saveTimer = null;
  function persist() { clearTimeout(saveTimer); saveTimer = setTimeout(() => localStorage.setItem(KEY, JSON.stringify(S)), 120); }

  const seenSet = new Set(S.seen);
  const masterSet = new Set(S.mastered);
  const savedSet = new Set(S.saved);
  const topicSeenSet = new Set(S.topicsSeen);

  /* ---------- Leveling ---------- */
  // Cumulative XP to *reach* level L (1-indexed). Each level L needs L*100 XP.
  const xpForLevel = L => 50 * (L - 1) * L;                 // 0,100,300,600,1000,...
  function levelInfo(xp) {
    let L = 1; while (xpForLevel(L + 1) <= xp) L++;
    const base = xpForLevel(L), next = xpForLevel(L + 1);
    return { level: L, into: xp - base, span: next - base, pct: clamp((xp - base) / (next - base) * 100, 0, 100) };
  }

  /* ---------- Formula rendering (KaTeX + graceful fallback) ---------- */
  function prettyFallback(tex) {
    return tex
      .replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, "($1)/($2)")
      .replace(/\\sqrt\{([^{}]*)\}/g, "√($1)")
      .replace(/\\(pm|mp)/g, "±").replace(/\\times/g, "×").replace(/\\cdot/g, "·")
      .replace(/\\pi/g, "π").replace(/\\theta/g, "θ").replace(/\\omega/g, "ω").replace(/\\zeta/g, "ζ")
      .replace(/\\mu/g, "μ").replace(/\\varepsilon/g, "ε").replace(/\\lambda/g, "λ").replace(/\\Phi/g, "Φ")
      .replace(/\\infty/g, "∞").replace(/\\angle/g, "∠").replace(/\\pm/g, "±")
      .replace(/\\sum/g, "Σ").replace(/\\int/g, "∫").replace(/\\partial/g, "∂").replace(/\\approx/g, "≈")
      .replace(/\\le/g, "≤").replace(/\\ge/g, "≥").replace(/\\to/g, "→").replace(/\\bar\{([^{}]*)\}/g, "$1̄")
      .replace(/[\\{}]/g, "").replace(/\^/g, "^").replace(/_/g, "_");
  }
  function renderFormula(el, tex, display = false) {
    if (window.katex) {
      try { window.katex.render(tex, el, { throwOnError: false, displayMode: display, output: "htmlAndMathml" }); return; }
      catch { /* fall through */ }
    }
    el.innerHTML = `<span class="formula-fallback">${prettyFallback(tex)}</span>`;
  }
  // If KaTeX arrives after first paint, re-render anything still in fallback.
  window.addEventListener("load", () => {
    if (window.katex) $$(".formula-fallback").forEach(n => {
      const host = n.parentElement; const tex = host.dataset.tex;
      if (tex) renderFormula(host, tex, host.classList.contains("card__formula"));
    });
  });

  /* ---------- Topic helpers ---------- */
  const topicMeta = k => TOPIC_BY[k] || { name: k, short: k, color: "#22D3EE", icon: "" };
  const svgPath = d => `<svg viewBox="0 0 24 24"><path d="${d}"/></svg>`;

  /* ============================================================
     FEED
     ============================================================ */
  const feedTrack = $("#feedTrack");
  let filterTopic = null;     // null = all topics
  let queue = [];             // upcoming shuffled cards
  let lastQueuedId = null;
  let activeCardEl = null;

  // global feed overlays
  const combo = document.createElement("div");
  combo.className = "combo";
  combo.innerHTML = `<svg viewBox="0 0 24 24"><path d="M12 3c1 3-1 4-1 6a3 3 0 0 0 6 0c0-1 1 2 1 4a6 6 0 1 1-11.5-2.3C7.7 7.7 11 6 12 3z"/></svg><span id="comboN">2</span>x`;
  $("#screen-feed").appendChild(combo);

  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0;[a[i], a[j]] = [a[j], a[i]]; } return a; }
  function pool() {
    let p = CARDS.filter(c => !filterTopic || c.t === filterTopic);
    if (S.settings.hideMastered) {
      const np = p.filter(c => !masterSet.has(c.id));
      if (np.length >= 4) p = np;       // keep feed non-empty
    }
    return p;
  }
  function refillQueue() {
    const p = shuffle(pool().slice());
    if (p.length > 1 && p[0].id === lastQueuedId) { p.push(p.shift()); }
    queue = queue.concat(p);
  }
  function nextCard() {
    if (queue.length === 0) refillQueue();
    const c = queue.shift();
    lastQueuedId = c ? c.id : lastQueuedId;
    return c;
  }

  const KIND_LABEL = { formula: "Formula", fact: "Key Fact", concept: "Concept", tip: "Exam Tip" };

  function buildCard(c, idx) {
    const tm = topicMeta(c.t);
    const el = document.createElement("article");
    el.className = "card";
    el.style.setProperty("--accent", tm.color);
    el.dataset.id = c.id;
    if (masterSet.has(c.id)) el.classList.add("mastered");

    const saved = savedSet.has(c.id), mastered = masterSet.has(c.id);
    el.innerHTML = `
      <span class="card__mastered">${svgPath("M20 6 9 17l-5-5")}Mastered</span>
      <div class="card__top">
        <span class="chip"><span class="dot">${svgPath(tm.icon)}</span>${tm.name}</span>
        <span class="kind">${KIND_LABEL[c.k] || c.k}</span>
      </div>
      <h2 class="card__title"></h2>
      ${c.formula ? `<div class="card__formula" data-tex="${escapeAttr(c.formula)}"></div>` : ""}
      <p class="card__body"></p>
      ${c.ref ? `<div class="card__ref">${escapeHtml(c.ref)}</div>` : ""}
      <div class="rail">
        <button class="rail__btn rail__explain" aria-label="Explain this simply">
          <span class="bubble">${svgPath("M12 3l1.7 4.6L18 9l-4.3 1.4L12 15l-1.7-4.6L6 9l4.3-1.4zM18 14l.9 2.2L21 17l-2.1.8L18 20l-.9-2.2L15 17l2.1-.8z")}</span>
          <small>Explain</small>
        </button>
        <button class="rail__btn rail__save ${saved ? "on" : ""}" aria-pressed="${saved}" aria-label="Save card">
          <span class="bubble">${svgPath("M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z")}</span>
          <small>Save</small>
        </button>
        <button class="rail__btn rail__master ${mastered ? "on" : ""}" aria-pressed="${mastered}" aria-label="Mark mastered">
          <span class="bubble">${svgPath("M20 6 9 17l-5-5")}</span>
          <small>Got it</small>
        </button>
        <button class="rail__btn rail__share" aria-label="Share card">
          <span class="bubble">${svgPath("M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13")}</span>
          <small>Share</small>
        </button>
      </div>
      ${idx === 0 && !S.settings.coached ? "" : ""}`;

    el.querySelector(".card__title").textContent = c.title;
    el.querySelector(".card__body").textContent = c.body;
    if (c.formula) renderFormula(el.querySelector(".card__formula"), c.formula, false);

    // first-ever card gets a swipe hint
    if (idx === 0) {
      const hint = document.createElement("div");
      hint.className = "swipe-hint";
      hint.innerHTML = `${svgPath("M12 19V5M6 11l6-6 6 6")}<span>Swipe up</span>`;
      el.appendChild(hint);
    }

    // interactions
    const saveBtn = el.querySelector(".rail__save");
    const masterBtn = el.querySelector(".rail__master");
    saveBtn.addEventListener("click", () => toggleSave(c, el, saveBtn));
    masterBtn.addEventListener("click", () => toggleMaster(c, el, masterBtn));
    el.querySelector(".rail__share").addEventListener("click", () => shareCard(c));
    el.querySelector(".rail__explain").addEventListener("click", () => openExplain(c));
    attachDoubleTap(el, c, saveBtn);

    formulaObserver.observe(el);
    activeObserver.observe(el);
    return el;
  }

  function appendBatch(n) {
    const start = feedTrack.children.length;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < n; i++) frag.appendChild(buildCard(nextCard(), start + i));
    feedTrack.appendChild(frag);
  }

  function resetFeed() {
    feedTrack.innerHTML = "";
    queue = []; lastQueuedId = null; activeCardEl = null;
    appendBatch(14);
    feedTrack.scrollTop = 0;
    if (feedTrack.firstElementChild) setActive(feedTrack.firstElementChild);
  }

  // lazy KaTeX (already rendered at build, this is a safety net for fallback re-render)
  const formulaObserver = new IntersectionObserver((es) => {
    es.forEach(e => {
      if (!e.isIntersecting) return;
      const host = e.target.querySelector(".card__formula .formula-fallback")?.parentElement;
      if (host && window.katex) renderFormula(host, host.dataset.tex, false);
      formulaObserver.unobserve(e.target);
    });
  }, { root: feedTrack, rootMargin: "150% 0px" });

  // active-card detection drives progression
  const activeObserver = new IntersectionObserver((es) => {
    es.forEach(e => { if (e.isIntersecting && e.intersectionRatio >= 0.55) setActive(e.target); });
  }, { root: feedTrack, threshold: [0.55, 0.8] });

  let comboCount = 0, comboTimer = null;
  function setActive(el) {
    if (el === activeCardEl) return;
    activeCardEl = el;
    const id = el.dataset.id;
    const card = CARDS.find(c => c.id === id);
    markSeen(card);

    // endless feed: top up as we approach the end
    const idx = [...feedTrack.children].indexOf(el);
    if (idx >= feedTrack.children.length - 5) appendBatch(10);
  }

  function markSeen(card) {
    if (!card) return;
    const fresh = !seenSet.has(card.id);
    if (fresh) {
      seenSet.add(card.id); S.seen.push(card.id);
      if (!topicSeenSet.has(card.t)) { topicSeenSet.add(card.t); S.topicsSeen.push(card.t); }
      addXP(5);
    }
    bumpGoal();
    bumpStreak();
    bumpCombo();
    persist();
    checkBadges();
    refreshTopbar();
  }

  function bumpCombo() {
    comboCount++;
    clearTimeout(comboTimer);
    if (comboCount >= 3) {
      $("#comboN", combo).textContent = comboCount;
      combo.classList.add("show");
    }
    comboTimer = setTimeout(() => { comboCount = 0; combo.classList.remove("show"); }, 4500);
  }

  /* ---------- Goal / streak ---------- */
  function bumpGoal() {
    const t = todayStr();
    if (S.goalDate !== t) { S.goalDate = t; S.goalCount = 0; }
    if (S.goalCount < S.goalTarget) {
      S.goalCount++;
      if (S.goalCount === S.goalTarget) {
        addXP(50);
        unlock("goal");
        celebrate("Daily goal complete!", "🎯", "+50 XP — see you tomorrow to keep the streak!");
      }
    }
  }
  function bumpStreak() {
    const t = todayStr();
    if (S.lastStudy === t) return;
    if (S.lastStudy) {
      const diff = (new Date(t) - new Date(S.lastStudy)) / 86400000;
      S.streak = diff === 1 ? S.streak + 1 : 1;
    } else S.streak = 1;
    S.lastStudy = t;
    if (S.streak >= 2) toast(`${S.streak}-day streak! 🔥`);
  }

  function addXP(n) {
    const before = levelInfo(S.xp).level;
    S.xp += n;
    const after = levelInfo(S.xp).level;
    if (after > before) {
      celebrate(`Level ${after}!`, "⚡", "You leveled up. New mastery unlocked — keep the momentum going.");
    }
  }

  /* ---------- Save / master / share ---------- */
  function toggleSave(card, cardEl, btn) {
    const on = savedSet.has(card.id);
    if (on) { savedSet.delete(card.id); S.saved = S.saved.filter(x => x !== card.id); }
    else { savedSet.add(card.id); S.saved.push(card.id); addXP(2); }
    btn?.classList.toggle("on", !on); btn?.setAttribute("aria-pressed", String(!on));
    btn?.classList.add("pop"); setTimeout(() => btn?.classList.remove("pop"), 420);
    if (cardEl) cardEl.querySelectorAll(".rail__save").forEach(b => { b.classList.toggle("on", !on); });
    toast(on ? "Removed from saved" : "Saved");
    persist(); checkBadges(); updateSavedBadge();
  }
  function toggleMaster(card, cardEl, btn) {
    const on = masterSet.has(card.id);
    if (on) { masterSet.delete(card.id); S.mastered = S.mastered.filter(x => x !== card.id); }
    else { masterSet.add(card.id); S.mastered.push(card.id); addXP(15); }
    btn?.classList.toggle("on", !on); btn?.setAttribute("aria-pressed", String(!on));
    btn?.classList.add("pop"); setTimeout(() => btn?.classList.remove("pop"), 420);
    cardEl?.classList.toggle("mastered", !on);
    toast(on ? "Marked to review again" : "Mastered! +15 XP");
    persist(); checkBadges(); refreshTopbar();
  }
  async function shareCard(card) {
    const tm = topicMeta(card.t);
    const text = `${card.title} — ${tm.name}\n${card.body}${card.formula ? "\n[" + prettyFallback(card.formula) + "]" : ""}\n\nStudying for the FE with FE Feed.`;
    try {
      if (navigator.share) { await navigator.share({ title: card.title, text }); return; }
      await navigator.clipboard.writeText(text); toast("Copied to clipboard");
    } catch { /* user cancelled */ }
  }

  function attachDoubleTap(el, card, saveBtn) {
    let last = 0, sx = 0, sy = 0;
    el.addEventListener("pointerdown", (e) => { sx = e.clientX; sy = e.clientY; });
    el.addEventListener("pointerup", (ev) => {
      if (ev.target.closest(".rail")) return;            // don't hijack rail buttons
      if (Math.hypot((ev.clientX || sx) - sx, (ev.clientY || sy) - sy) > 12) { last = 0; return; } // it was a swipe
      const now = Date.now();
      if (now - last < 320) {
        if (!savedSet.has(card.id)) toggleSave(card, el, saveBtn);
        heartPop(el, ev);
        last = 0;
      } else last = now;
    });
  }
  function heartPop(el, ev) {
    const rect = el.getBoundingClientRect();
    const h = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    h.setAttribute("viewBox", "0 0 24 24"); h.setAttribute("class", "heart-pop");
    h.innerHTML = `<path d="M12 21s-7.5-4.6-10-9.3C.3 8 2 4.5 5.4 4.5c2 0 3.4 1.2 4.6 2.8 1.2-1.6 2.6-2.8 4.6-2.8 3.4 0 5.1 3.5 3.4 7.2C19.5 16.4 12 21 12 21z"/>`;
    h.style.left = ((ev.clientX || rect.left + rect.width / 2) - rect.left) + "px";
    h.style.top = ((ev.clientY || rect.top + rect.height / 2) - rect.top) + "px";
    el.appendChild(h);
    setTimeout(() => h.remove(), 720);
  }

  /* ============================================================
     AI "Explain simply" — bring-your-own Gemini key, stored on device.
     The key lives only in localStorage and is sent straight from the
     browser to Google; it is never bundled into the app or the repo.
     ============================================================ */
  const AI_MODEL = "gemini-2.0-flash";
  const sheetBackdrop = $("#sheetBackdrop"), explainSheet = $("#explainSheet"), exBodyEl = $("#exBody");
  let exReq = 0, exOpen = false;

  function showSheet() {
    sheetBackdrop.hidden = false; explainSheet.hidden = false; exOpen = true;
    requestAnimationFrame(() => { sheetBackdrop.classList.add("show"); explainSheet.classList.add("show"); });
  }
  function closeSheet() {
    exOpen = false; exReq++;                       // invalidate any in-flight render
    sheetBackdrop.classList.remove("show"); explainSheet.classList.remove("show");
    setTimeout(() => { sheetBackdrop.hidden = true; explainSheet.hidden = true; }, 260);
  }
  $("#exClose").addEventListener("click", closeSheet);
  sheetBackdrop.addEventListener("click", closeSheet);

  const DISCLAIMER = `<p class="explain-disclaimer">AI-generated to aid understanding — always verify against the NCEES FE Reference Handbook.</p>`;

  function renderExplain(text) {
    exBodyEl.innerHTML = "";
    text.split(/\n{2,}/).forEach(para => {
      if (!para.trim()) return;
      const p = document.createElement("p");
      para.split(/(\$\$[^$]+\$\$|\$[^$]+\$)/g).forEach(tok => {
        const disp = /^\$\$[^$]+\$\$$/.test(tok), inl = /^\$[^$]+\$$/.test(tok);
        if (disp || inl) {
          const span = document.createElement("span");
          renderFormula(span, tok.replace(/^\$+|\$+$/g, ""), disp);
          p.appendChild(span);
        } else {
          tok.split(/(\*\*[^*]+\*\*)/g).forEach(f => {
            if (/^\*\*[^*]+\*\*$/.test(f)) { const b = document.createElement("b"); b.textContent = f.slice(2, -2); p.appendChild(b); }
            else if (f) p.appendChild(document.createTextNode(f));
          });
        }
      });
      exBodyEl.appendChild(p);
    });
    exBodyEl.insertAdjacentHTML("beforeend", DISCLAIMER);
  }

  function openExplain(card) {
    $("#exTitle").textContent = card.title;
    showSheet();
    const cached = S.explains[card.id];
    if (cached) { renderExplain(cached); return; }

    const key = (S.settings.aiKey || "").trim();
    if (!key) {
      exBodyEl.innerHTML = `<div class="explain-cta">
        <p>Add your free Google Gemini API key to unlock plain-language explanations for any card.</p>
        <button class="btn-primary" id="exAddKey">Add API key</button>
        <p class="explain-disclaimer">Get one at aistudio.google.com/apikey · stored only on this device.</p></div>`;
      $("#exAddKey").addEventListener("click", () => {
        closeSheet(); go("stats");
        setTimeout(() => { const k = $("#aiKey"); k.scrollIntoView({ block: "center" }); k.focus(); }, 340);
      });
      return;
    }

    const my = ++exReq;
    exBodyEl.innerHTML = `<div class="explain-loading"><i></i><i></i><i></i><i></i><div class="thinking">Thinking…</div></div>`;
    fetchExplanation(card, key).then(txt => {
      S.explains[card.id] = txt; persist();
      if (exOpen && my === exReq) { renderExplain(txt); addXP(3); }
    }).catch(err => {
      if (!exOpen || my !== exReq) return;
      exBodyEl.innerHTML = `<div class="explain-cta">
        <p>Couldn't fetch an explanation.</p>
        <div class="explain-error__detail">${escapeHtml(String(err && err.message || err))}</div>
        <button class="btn-primary" id="exRetry">Try again</button></div>`;
      $("#exRetry").addEventListener("click", () => openExplain(card));
    });
  }

  async function fetchExplanation(card, key) {
    const tm = topicMeta(card.t);
    const prompt =
`You are a warm, encouraging tutor helping a student prepare for the NCEES FE Electrical & Computer exam. Explain the concept below as if it is the student's very first time encountering it.

Topic: ${tm.name}
Concept: ${card.title}
What the flashcard says: ${card.body}${card.formula ? `\nFormula (LaTeX): ${card.formula}` : ""}

Guidelines:
- At most about 110 words, in 1-2 short paragraphs.
- Plain, everyday language. Define every symbol in words.
- Include one simple real-world analogy.
- No markdown headings or bullet lists. You may use inline math wrapped in single dollar signs.`;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 30000);
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${AI_MODEL}:generateContent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.7, maxOutputTokens: 320 } }),
        signal: ctrl.signal
      });
      if (!res.ok) {
        let detail = `HTTP ${res.status}`;
        try { detail = (await res.json()).error?.message || detail; } catch {}
        if (res.status === 400 || res.status === 403) detail += " — check the key is valid and the Generative Language API is enabled.";
        if (res.status === 429) detail = "Free-tier rate limit reached. Wait a minute and try again.";
        throw new Error(detail);
      }
      const data = await res.json();
      const txt = (data.candidates?.[0]?.content?.parts || []).map(p => p.text || "").join("").trim();
      if (!txt) throw new Error(data.promptFeedback?.blockReason ? "Response blocked by a safety filter." : "Empty response from the model.");
      return txt;
    } catch (e) {
      if (e.name === "AbortError") throw new Error("Request timed out — check your connection and retry.");
      throw e;
    } finally { clearTimeout(timer); }
  }

  /* ============================================================
     Topbar
     ============================================================ */
  const goalRing = $("#goalRingFill");
  const RING_LEN = 2 * Math.PI * 18;
  function refreshTopbar() {
    const li = levelInfo(S.xp);
    $("#levelNum").textContent = li.level;
    $("#xpBarFill").style.width = li.pct + "%";

    if (S.goalDate !== todayStr()) { S.goalCount = 0; S.goalDate = todayStr(); }
    $("#goalDone").textContent = S.goalCount;
    $("#goalTarget").textContent = S.goalTarget;
    const gp = clamp(S.goalCount / S.goalTarget, 0, 1);
    goalRing.style.strokeDashoffset = RING_LEN * (1 - gp);
    $("#goalBtn .goal-ring").classList.toggle("done", gp >= 1);

    $("#streakCount").textContent = S.streak;
    $("#streakBtn").classList.toggle("lit", S.lastStudy === todayStr() && S.streak > 0);
  }

  /* ============================================================
     Toast / celebration / confetti
     ============================================================ */
  const toastEl = $("#toast"); let toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg; toastEl.hidden = false;
    requestAnimationFrame(() => toastEl.classList.add("show"));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toastEl.classList.remove("show"); setTimeout(() => toastEl.hidden = true, 260); }, 2200);
  }

  const backdrop = $("#modalBackdrop"), milestone = $("#milestone");
  function celebrate(title, burst, body) {
    $("#msTitle").textContent = title; $("#msBurst").textContent = burst; $("#msBody").textContent = body;
    backdrop.hidden = false; milestone.hidden = false;
    requestAnimationFrame(() => { backdrop.classList.add("show"); milestone.classList.add("show"); });
    confettiBurst();
  }
  function closeMilestone() {
    backdrop.classList.remove("show"); milestone.classList.remove("show");
    setTimeout(() => { backdrop.hidden = true; milestone.hidden = true; }, 260);
  }
  $("#msClose").addEventListener("click", closeMilestone);
  backdrop.addEventListener("click", closeMilestone);

  // lightweight confetti
  const cvs = $("#confetti"), ctx = cvs.getContext("2d");
  let parts = [], raf = null;
  function sizeCanvas() { cvs.width = cvs.clientWidth * devicePixelRatio; cvs.height = cvs.clientHeight * devicePixelRatio; }
  function confettiBurst() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    sizeCanvas();
    const colors = ["#22D3EE", "#3B82F6", "#FB923C", "#34D399", "#F43F5E", "#A855F7"];
    const cx = cvs.width / 2, cy = cvs.height * 0.42;
    for (let i = 0; i < 120; i++) {
      const a = Math.random() * Math.PI * 2, sp = (4 + Math.random() * 9) * devicePixelRatio;
      parts.push({ x: cx, y: cy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 6 * devicePixelRatio,
        g: 0.28 * devicePixelRatio, s: (4 + Math.random() * 5) * devicePixelRatio, c: colors[i % colors.length],
        rot: Math.random() * 6, vr: (Math.random() - .5) * .4, life: 90 + Math.random() * 40 });
    }
    if (!raf) raf = requestAnimationFrame(tick);
  }
  function tick() {
    ctx.clearRect(0, 0, cvs.width, cvs.height);
    parts.forEach(p => { p.vy += p.g; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life--;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.c; ctx.globalAlpha = clamp(p.life / 40, 0, 1);
      ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.6); ctx.restore(); });
    parts = parts.filter(p => p.life > 0 && p.y < cvs.height + 40);
    if (parts.length) raf = requestAnimationFrame(tick); else { raf = null; ctx.clearRect(0, 0, cvs.width, cvs.height); }
  }

  /* ============================================================
     Achievements
     ============================================================ */
  const ACHIEVEMENTS = [
    { id: "first", name: "First Spark", color: "#22D3EE", icon: "M12 3c1 3-1 4-1 6a3 3 0 0 0 6 0c0-1 1 2 1 4a6 6 0 1 1-11.5-2.3C7.7 7.7 11 6 12 3z", test: () => seenSet.size >= 1 },
    { id: "goal", name: "Daily Goal", color: "#34D399", icon: "M12 2a10 10 0 1 0 10 10M22 4 12 14l-3-3", test: () => S.goalDate === todayStr() && S.goalCount >= S.goalTarget || S.badges.includes("goal") },
    { id: "streak3", name: "On a Roll", color: "#FB923C", icon: "M12 3c1 3-1 4-1 6a3 3 0 0 0 6 0c0-1 1 2 1 4a6 6 0 1 1-11.5-2.3C7.7 7.7 11 6 12 3z", test: () => S.streak >= 3 },
    { id: "streak7", name: "Unstoppable", color: "#F43F5E", icon: "M13 2 4 14h6l-1 8 9-12h-6l1-8z", test: () => S.streak >= 7 },
    { id: "century", name: "Centurion", color: "#A855F7", icon: "M5 19V9m7 10V5m7 14v-7M3 21h18", test: () => seenSet.size >= 100 },
    { id: "master10", name: "Sharp Mind", color: "#3B82F6", icon: "M20 6 9 17l-5-5", test: () => masterSet.size >= 10 },
    { id: "master50", name: "FE Ready", color: "#84CC16", icon: "M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z", test: () => masterSet.size >= 50 },
    { id: "explorer", name: "Polymath", color: "#EC4899", icon: "M12 2v20M2 12h20M5 5l14 14M19 5 5 19", test: () => topicSeenSet.size >= TOPICS.length },
    { id: "level5", name: "Rising Star", color: "#FBBF24", icon: "M12 2l2.9 6.3 6.9.6-5.2 4.6 1.6 6.8L12 17.8 5.8 20l1.6-6.8L2.2 8.9l6.9-.6z", test: () => levelInfo(S.xp).level >= 5 }
  ];
  function unlock(badgeId) {
    const a = ACHIEVEMENTS.find(x => x.id === badgeId);
    if (a && !S.badges.includes(a.id)) { S.badges.push(a.id); persist(); }
  }
  function checkBadges() {
    let newly = null;
    ACHIEVEMENTS.forEach(a => { if (!S.badges.includes(a.id) && a.test()) { S.badges.push(a.id); newly = a; } });
    if (newly) {
      persist();
      toast(`Achievement: ${newly.name} 🏅`);
      if (["streak7", "master50", "explorer", "century"].includes(newly.id))
        celebrate("Achievement unlocked!", "🏅", newly.name + " — you're crushing it.");
      else confettiBurst();
      if (currentScreen === "stats") renderBadges();
    }
  }

  /* ============================================================
     Navigation
     ============================================================ */
  let currentScreen = "feed";
  function go(screen) {
    if (screen === currentScreen && screen === "feed") return;
    currentScreen = screen;
    $$(".screen").forEach(s => { const on = s.id === "screen-" + screen; s.classList.toggle("is-active", on); s.hidden = !on; });
    $$(".tab").forEach(t => t.classList.toggle("is-active", t.dataset.screen === screen));
    $("#topbar").classList.toggle("is-hidden", screen !== "feed");
    if (screen === "topics") renderTopics();
    if (screen === "saved") renderSaved();
    if (screen === "stats") renderStats();
  }
  $$(".tab").forEach(t => t.addEventListener("click", () => go(t.dataset.screen)));
  $("#streakBtn").addEventListener("click", () => go("stats"));
  $("#goalBtn").addEventListener("click", () => go("stats"));
  $("#xpBtn").addEventListener("click", () => go("stats"));

  /* ============================================================
     Topics screen
     ============================================================ */
  function topicCounts(k) {
    const all = CARDS.filter(c => c.t === k);
    const seen = all.filter(c => seenSet.has(c.id)).length;
    const mastered = all.filter(c => masterSet.has(c.id)).length;
    return { total: all.length, seen, mastered };
  }
  function renderTopics() {
    $("#allCount").textContent = CARDS.length;
    const grid = $("#topicGrid"); grid.innerHTML = "";
    TOPICS.forEach(t => {
      const c = topicCounts(t.key);
      const pct = c.total ? Math.round(c.mastered / c.total * 100) : 0;
      const b = document.createElement("button");
      b.className = "topic-card"; b.style.setProperty("--accent", t.color);
      b.innerHTML = `
        <span class="topic-card__icon">${svgPath(t.icon)}</span>
        <div>
          <div class="topic-card__name">${t.name}</div>
          <div class="topic-card__meta"><span>${c.mastered}/${c.total} mastered</span><span>${pct}%</span></div>
          <span class="topic-card__bar"><i style="width:${pct}%"></i></span>
        </div>`;
      b.addEventListener("click", () => { openFeed(t.key); });
      grid.appendChild(b);
    });
  }
  $("#topicAll").addEventListener("click", () => openFeed(null));
  function openFeed(topicKey) {
    filterTopic = topicKey;
    resetFeed();
    go("feed");
    if (topicKey) toast(`${topicMeta(topicKey).name} feed`);
  }

  /* ============================================================
     Saved screen
     ============================================================ */
  function renderSaved() {
    const list = $("#savedList"), empty = $("#savedEmpty"), studyBtn = $("#studySavedBtn");
    list.innerHTML = "";
    const items = S.saved.map(id => CARDS.find(c => c.id === id)).filter(Boolean).reverse();
    empty.hidden = items.length > 0;
    studyBtn.hidden = items.length === 0;
    items.forEach(c => {
      const tm = topicMeta(c.t);
      const card = document.createElement("div");
      card.className = "saved-card"; card.style.setProperty("--accent", tm.color);
      card.innerHTML = `
        <button class="saved-card__remove" aria-label="Remove">${svgPath("M18 6 6 18M6 6l12 12")}</button>
        <div class="saved-card__top"><span class="saved-card__chip">${tm.short}</span></div>
        <div class="saved-card__title"></div>
        ${c.formula ? `<div class="saved-card__formula" data-tex="${escapeAttr(c.formula)}"></div>` : ""}
        <div class="saved-card__body"></div>`;
      card.querySelector(".saved-card__title").textContent = c.title;
      card.querySelector(".saved-card__body").textContent = c.body;
      if (c.formula) renderFormula(card.querySelector(".saved-card__formula"), c.formula, false);
      card.querySelector(".saved-card__remove").addEventListener("click", () => {
        savedSet.delete(c.id); S.saved = S.saved.filter(x => x !== c.id); persist();
        renderSaved(); updateSavedBadge();
      });
      list.appendChild(card);
    });
  }
  $("#studySavedBtn").addEventListener("click", () => {
    // build a feed exclusively from saved cards
    queue = shuffle(S.saved.map(id => CARDS.find(c => c.id === id)).filter(Boolean));
    feedTrack.innerHTML = ""; activeCardEl = null;
    if (queue.length) { appendBatch(Math.min(queue.length, 14)); feedTrack.scrollTop = 0; setActive(feedTrack.firstElementChild); }
    go("feed"); toast("Studying your saved cards");
  });
  function updateSavedBadge() {
    const b = $("#savedBadge"), n = savedSet.size;
    b.textContent = n; b.hidden = n === 0;
  }

  /* ============================================================
     Stats screen
     ============================================================ */
  function renderStats() {
    const li = levelInfo(S.xp);
    $("#bStreak").textContent = S.streak;
    $("#bSeen").textContent = seenSet.size;
    $("#bMastered").textContent = masterSet.size;
    $("#bLevel").textContent = li.level;
    $("#bXp").textContent = S.xp;
    if (S.goalDate !== todayStr()) { S.goalCount = 0; }
    $("#bGoalTxt").textContent = `${S.goalCount} / ${S.goalTarget}`;
    $("#bGoalBar").style.width = clamp(S.goalCount / S.goalTarget * 100, 0, 100) + "%";
    const masteredPct = Math.round(masterSet.size / CARDS.length * 100);
    $("#statsGreeting").textContent = masterSet.size === 0
      ? "Start mastering cards to fill these up."
      : `You've mastered ${masterSet.size} of ${CARDS.length} cards (${masteredPct}%). Keep going!`;

    const tp = $("#topicProgress"); tp.innerHTML = "";
    TOPICS.forEach(t => {
      const c = topicCounts(t.key);
      const pct = c.total ? Math.round(c.mastered / c.total * 100) : 0;
      const row = document.createElement("div");
      row.className = "tp-row"; row.style.setProperty("--accent", t.color);
      row.innerHTML = `
        <span class="tp-row__icon">${svgPath(t.icon)}</span>
        <div><div class="tp-row__name">${t.name}</div><span class="tp-row__bar"><i style="width:${pct}%"></i></span></div>
        <span class="tp-row__num">${c.mastered}/${c.total}</span>`;
      tp.appendChild(row);
    });
    renderBadges();
  }
  function renderBadges() {
    const wrap = $("#badges"); wrap.innerHTML = "";
    ACHIEVEMENTS.forEach(a => {
      const got = S.badges.includes(a.id);
      const el = document.createElement("div");
      el.className = "badge" + (got ? " unlocked" : ""); el.style.setProperty("--badge", a.color);
      el.innerHTML = `<span class="badge__emoji">${svgPath(a.icon)}</span><span class="badge__name">${a.name}</span>`;
      wrap.appendChild(el);
    });
  }

  /* ---------- Settings ---------- */
  const hideMasteredEl = $("#hideMastered"), themeEl = $("#themeToggle");
  hideMasteredEl.checked = S.settings.hideMastered;
  themeEl.checked = S.settings.theme === "light";
  hideMasteredEl.addEventListener("change", () => { S.settings.hideMastered = hideMasteredEl.checked; persist(); toast(hideMasteredEl.checked ? "Hiding mastered cards" : "Showing all cards"); });
  themeEl.addEventListener("change", () => { S.settings.theme = themeEl.checked ? "light" : "dark"; applyTheme(); persist(); });

  // AI key (stored on device only)
  const aiKeyEl = $("#aiKey"), aiKeyStatusEl = $("#aiKeyStatus");
  aiKeyEl.value = S.settings.aiKey || "";
  function refreshKeyStatus() {
    const k = (S.settings.aiKey || "").trim();
    aiKeyStatusEl.textContent = k ? `Key saved (…${k.slice(-4)}). Explain is enabled.` : "No key saved — Explain will ask you to add one.";
    aiKeyStatusEl.classList.toggle("ok", !!k);
  }
  refreshKeyStatus();
  $("#aiKeySave").addEventListener("click", () => {
    S.settings.aiKey = aiKeyEl.value.trim(); persist(); refreshKeyStatus();
    toast(S.settings.aiKey ? "API key saved on this device" : "API key cleared");
  });
  function applyTheme() {
    $("#app").dataset.theme = S.settings.theme;
    $('meta[name="theme-color"]').setAttribute("content", S.settings.theme === "light" ? "#EEF1F8" : "#0B0F1A");
  }
  $("#resetBtn").addEventListener("click", () => {
    if (!confirm("Reset all progress, streaks, and saved cards? This can't be undone.")) return;
    localStorage.removeItem(KEY); location.reload();
  });

  /* ---------- Coach mark (first run) ---------- */
  const coach = $("#coach");
  if (!S.settings.coached) coach.hidden = false;
  $("#coachStart").addEventListener("click", () => {
    coach.hidden = true; S.settings.coached = true; persist();
  });

  /* ---------- utils ---------- */
  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m])); }
  function escapeAttr(s) { return escapeHtml(s); }

  window.addEventListener("resize", () => { if (raf) sizeCanvas(); });
  window.addEventListener("keydown", e => {
    if (e.key !== "Escape") return;
    if (exOpen) closeSheet();
    else if (!milestone.hidden) closeMilestone();
  });

  /* ============================================================
     Boot
     ============================================================ */
  function init() {
    applyTheme();
    // new day → reset goal counter view
    if (S.goalDate !== todayStr()) { S.goalCount = 0; S.goalDate = todayStr(); }
    resetFeed();
    refreshTopbar();
    updateSavedBadge();
    checkBadges();
  }
  init();

  // Service worker (only registers over http/https, not file://)
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  }
})();
