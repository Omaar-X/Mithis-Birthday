/* ==========================================================================
   Just For You  — Foundation
   1 Photo registry · 2 Helpers · 3 Navigation (3a Loader) · 4 Reveal · 5 Music
   6 Particles · 7 Parallax · 8 Petals · 9 Moments · 10 Reasons
   11 Letter · 12 Gallery · 13 Final surprise · 14 Boot
   ========================================================================== */

/* 1 — PHOTO REGISTRY -------------------------------------------------------
   Photo files live in images/. photoSrc()
   URL-encodes them for sections built in JS. The hero portrait is written
   statically in index.html (so it paints without waiting for JS) and uses
   the same file as PHOTOS.hero.
   `focus` is the face position (x% y%) used as CSS object-position so
   square-ish crops on phones never cut her face off.
   -------------------------------------------------------------------------- */
const PHOTO_FILES = {
  lime1:   { file: "images/pic1.jpeg", focus: "51% 25%" },
  lime2:   { file: "images/pic2.jpeg", focus: "57% 25%" },
  lilac1:  { file: "images/pic3.jpeg", focus: "53% 25%" },
  lilac2:  { file: "images/pic4.jpeg", focus: "62% 27%" },
  lilac3:  { file: "images/pic5.jpeg", focus: "50% 30%" },
  lily1:   { file: "images/pic6.jpeg", focus: "50% 23%" },
  lily2:   { file: "images/pic7.jpeg", focus: "52% 39%" },
  lily3:   { file: "images/pic8.jpeg", focus: "40% 25%" },
  lily4:   { file: "images/pic9.jpeg", focus: "49% 27%" },
  lily5:   { file: "images/pic10.jpeg", focus: "54% 20%" },
  saree1:  { file: "images/pic11.jpeg", focus: "48% 37%" },
  saree2:  { file: "images/pic12.jpeg", focus: "51% 26%" },
  saree3:  { file: "images/pic13.jpeg", focus: "45% 32%" },
  black1:  { file: "images/pic14.jpeg", focus: "52% 45%" },
  black2:  { file: "images/pic1.jpeg", focus: "39% 42%" },
  black3:  { file: "images/pic2.jpeg", focus: "42% 30%" }, /* ID card visible: crop or skip */
  teal1:   { file: "images/pic3.jpeg", focus: "50% 15%" },
  teal2:   { file: "images/pic4.jpeg", focus: "47% 25%" },
  teal3:   { file: "images/pic5.jpeg", focus: "55% 23%" }
};

/* Section assignments from IMAGE_PLAN.md: each photo is used exactly once. */
const PHOTOS = {
  hero:     "lily1",
  wish:     "saree3",
  featured: "saree1",
  final:    "lilac1",
  /* Her Moments (written in index.html, in strip order; featured card first) */
  moments:  ["saree1", "lily3", "lime1", "black1", "teal1", "lilac2"],
  /* Letter: one small print tucked behind the envelope (written in index.html) */
  letter:   "teal3",
  /* Gallery, in lightbox order (written in index.html): A main, B elevated, C cinematic, D printed (portrait window only), E arch */
  gallery:  ["lily5", "lily4", "lily2", "black3", "saree2"],
  reasons:  ["lime2", "lilac3", "black2", "teal2"]
};

/* 2 — HELPERS ------------------------------------------------------------- */
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

/** "images/pic6.jpeg" -> "images/pic6.jpeg" */
const photoSrc = (key) => encodeURI(PHOTO_FILES[key].file);
const photoFocus = (key) => PHOTO_FILES[key].focus;

/** Build an <img> for a registry key (used by the section builders next phase). */
function createPhoto(key, { alt = "", eager = false, className = "" } = {}) {
  const img = new Image();
  img.src = photoSrc(key);
  img.alt = alt;
  img.decoding = "async";
  img.loading = eager ? "eager" : "lazy";
  img.style.objectPosition = photoFocus(key);
  if (className) img.className = className;
  return img;
}

let toastTimer;
function showToast(message) {
  const el = $("#toast");
  if (!el) return;
  el.textContent = message;
  el.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("is-visible"), 3200);
}

/* 3 — NAVIGATION ---------------------------------------------------------- */
function initNav() {
  const nav = $("#nav");
  // Every link moves within this document; no routes or section URL changes.
  $$("a[href^='#']").forEach(link => {
    link.addEventListener("click", event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const target = document.getElementById(link.getAttribute("href").slice(1));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: prefersReducedMotion.matches ? "auto" : "smooth", block: "start" });
      if (link.classList.contains("skip-link")) {
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      }
    });
  });
  if (window.location.hash) history.replaceState(null, "", window.location.pathname + window.location.search);
  if (!nav) return;
  let ticking = false;
  const update = () => {
    ticking = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    nav.style.setProperty("--progress", max > 0 ? clamp(window.scrollY / max, 0, 1).toFixed(4) : 0);
    nav.classList.toggle("is-scrolled", window.scrollY > 24);
  };
  window.addEventListener("scroll", () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  window.addEventListener("resize", update, { passive: true });
  update();
}

/* Wrap each word of [data-reveal-words] in <span class="rw" style="--i:n">.
   <br> and inline elements are kept as they are. Spaces stay as real text
   nodes, so the text still reads and copies normally. */
function splitWords() {
  $$("[data-reveal-words]").forEach((el) => {
    let i = 0;
    Array.from(el.childNodes).forEach((node) => {
      if (node.nodeType !== Node.TEXT_NODE) return;
      const frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.append(document.createTextNode(" ")); return; }
        const w = document.createElement("span");
        w.className = "rw";
        w.style.setProperty("--i", i++);
        w.textContent = part;
        frag.append(w);
      });
      node.replaceWith(frag);
    });
    el.classList.add("reveal-words");
  });
}

/* 3a — LOADING SCREEN ------------------------------------------------------
   Real progress: the hero photo + web fonts + DOM ready. The bar eases toward
   the true value, stays up at least MIN_MS so it reads as intentional, and is
   always lifted after MAX_MS even if something stalls. Returns a promise that
   resolves when the page is revealed (the hero entrance waits for it).
   -------------------------------------------------------------------------- */
// Canvas confetti runs only during the loader's birthday reveal.
function createLoaderCelebration(canvas, reduced) {
  if (!canvas || reduced) return { start() {}, stop() {} };
  const ctx = canvas.getContext("2d");
  if (!ctx) return { start() {}, stop() {} };
  const colors = ["#f5a8ca", "#91c7ef", "#dc82b0", "#b6dbf6", "#ffffff"];
  let particles = [], frame = 0, previous = 0, started = 0, running = false;
  let width = 0, height = 0;
  const resize = () => {
    width = window.innerWidth; height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  const stop = () => {
    running = false; cancelAnimationFrame(frame);
    window.removeEventListener("resize", resize);
    ctx.clearRect(0, 0, width, height); particles = [];
  };
  const burst = side => Array.from({ length: width < 600 ? 45 : 75 }, () => ({
    x: side ? width + 10 : -10, y: height * .65,
    vx: (side ? -1 : 1) * (110 + Math.random() * 330), vy: -220 - Math.random() * 350,
    size: 4 + Math.random() * 7, rotation: Math.random() * Math.PI,
    spin: (Math.random() - .5) * 10, color: colors[Math.floor(Math.random() * colors.length)]
  }));
  const draw = now => {
    if (!running) return;
    const dt = Math.min((now - previous) / 1000, .04); previous = now;
    ctx.clearRect(0, 0, width, height);
    for (const p of particles) {
      p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 190 * dt;
      p.vx *= Math.pow(.98, dt * 60); p.rotation += p.spin * dt;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rotation);
      ctx.globalAlpha = Math.max(0, Math.min(1, (4400 - (now - started)) / 900));
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size * .5);
      ctx.restore();
    }
    if (now - started < 4400) frame = requestAnimationFrame(draw);
    else stop();
  };
  return {
    start() {
      if (running) return;
      running = true; resize();
      window.addEventListener("resize", resize, { passive: true });
      particles = [...burst(0), ...burst(1)];
      started = previous = performance.now(); frame = requestAnimationFrame(draw);
    }, stop
  };
}

function initLoader() {
  const root = document.documentElement;
  const loader = $("#loader");
  if (!loader) { root.classList.remove("is-loading"); return Promise.resolve(); }
  const reduced = prefersReducedMotion.matches;
  const num = $("#loader-num"), unit = $("#loader-unit"), label = $("#loader-text");
  const title = $("#loader-title"), index = $("#loader-index");
  const steps = $$(".countdown-steps span", loader);
  const celebration = createLoaderCelebration($("#loader-celebration"), reduced);
  let start = 0;
  const duration = reduced ? 2000 : 3600;
  // This is a birthday-themed animation, independent of the visitor's date.
  const phases = [
    { title: "First, the month.", unit: "MONTH · NOVEMBER", text: "November. Month eleven." },
    { title: "Now, the date.", unit: "DATE · 11 NOVEMBER", text: "The 11th. I remembered." },
    { title: "Almost time.", unit: "TIME · 12:00 AM", text: "Waiting for the clock to hit twelve." },
    { title: "Happy Birthday, Mithi!", unit: "11 NOVEMBER · 12:00 AM", text: "Hope you have the best day. This one’s for you." }
  ];
  return new Promise((resolve) => {
    let raf = 0, leaving = false, previous = -1, celebrationDelay = 0, failsafe = 0, started = false;
    const leave = () => {
      if (leaving) return;
      leaving = true;
      cancelAnimationFrame(raf);
      clearTimeout(failsafe);
      clearTimeout(window.introRecovery);
      clearTimeout(celebrationDelay);
      celebration.stop();
      loader.classList.add("is-leaving");
      root.classList.remove("is-loading");
      resolve();
      setTimeout(() => loader.remove(), reduced ? 0 : 450);
    };

    $("#loader-skip").addEventListener("click", leave, { once: true });
    const pad = n => String(n).padStart(2, "0");
    const tick = now => {
      if (leaving) return;
      const progress = Math.min((now - start) / duration, 1);
      const phase = progress < .25 ? 0 : progress < .5 ? 1 : progress < .85 ? 2 : 3;
      if (phase !== previous) {
        previous = phase;
        loader.dataset.phase = phase;
        if (phase === 3) celebration.start();
        const display = $(".countdown-display", loader);
        if (!reduced && display && typeof display.animate === "function") {
          display.animate([
            { opacity: .25, transform: "translateY(10px) scale(.96)" },
            { opacity: 1, transform: "translateY(0) scale(1)" }
          ], { duration: 500, easing: "cubic-bezier(.2,.8,.2,1)" });
        }
        title.textContent = phases[phase].title;
        if (!reduced && typeof title.animate === "function") {
          title.animate([
            { opacity: 0, transform: "translateY(8px)" },
            { opacity: 1, transform: "translateY(0)" }
          ], { duration: 350, easing: "ease-out" });
        }
        unit.textContent = phases[phase].unit;
        label.textContent = phases[phase].text;
        index.textContent = `0${phase + 1} / 04`;
        steps.forEach((el, i) => {
          el.classList.toggle("is-active", i === phase);
          el.classList.toggle("is-complete", i < phase);
        });
      }
      // Count toward November (11), the 11th, then midnight (12:00 AM).
      // Hold each destination briefly so the birthday details can be read.
      if (phase === 0) {
        const amount = Math.min(progress / .20, 1);
        num.textContent = pad(1 + Math.floor(10 * amount));
      } else if (phase === 1) {
        const amount = Math.min((progress - .25) / .20, 1);
        num.textContent = pad(1 + Math.floor(10 * amount));
      } else if (phase === 2) {
        const amount = Math.min((progress - .5) / .27, 1);
        const minutes = Math.floor(720 * amount);
        num.textContent = `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}${minutes === 720 ? " AM" : ""}`;
      } else { num.textContent = "11 NOV"; loader.classList.add("is-done"); }
      loader.style.setProperty("--p", progress.toFixed(3));
      if (progress >= 1) celebrationDelay = setTimeout(leave, reduced ? 0 : 450);
      else raf = requestAnimationFrame(tick);
    };
    const begin = () => {
      if (started || leaving) return;
      started = true;
      document.dispatchEvent(new Event("birthday:start-music"));
      $("#loader-start", loader).hidden = true;
      loader.classList.remove("is-waiting");
      start = performance.now();
      failsafe = setTimeout(leave, duration + 4000);
      raf = requestAnimationFrame(tick);
    };
    loader.classList.add("is-waiting");
    title.textContent = "A birthday surprise for you.";
    label.textContent = "Tap below. There’s a tune to go with it.";
    clearTimeout(window.introRecovery);
    $("#loader-start", loader).addEventListener("click", begin, { once: true });
  });
}

/* 4 — REVEAL ON SCROLL ---------------------------------------------------- */
function initReveal(ready = Promise.resolve()) {
  splitWords();
  const items = $$(".reveal, .reveal-mask, .reveal-words, .rz, .gr");
  if (!items.length) return;
  const showAll = () => items.forEach((el) => el.classList.add("is-visible"));

  if (prefersReducedMotion.matches || !("IntersectionObserver" in window)) {
    showAll();
    return;
  }
  /* The hero is the first thing she sees: reveal it on load (staggered by each
     element's --d) instead of waiting for the observer, so nothing near the
     bottom edge of a short screen can stay hidden. */
  const hero = $("#home");
  const rest = items.filter((el) => !(hero && hero.contains(el)));
  if (hero) {
    const heroItems = items.filter((el) => hero.contains(el));
    ready.then(() => requestAnimationFrame(() => requestAnimationFrame(() => heroItems.forEach((el) => el.classList.add("is-visible")))));
  }

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add("is-visible");
      if (en.target.classList.contains("gr") && !prefersReducedMotion.matches && typeof en.target.animate === "function") {
        en.target.animate([
          { opacity: .75, transform: "translateY(14px)" },
          { opacity: 1, transform: "translateY(0)" }
        ], { duration: 450, easing: "ease-out" });
      }
      obs.unobserve(en.target);
    });
  }, { threshold: 0.03, rootMargin: "0px 0px 80px 0px" });
  rest.forEach((el) => io.observe(el));
}

/* 5 — BIRTHDAY TUNE --------------------------------------------------------
   A gentle instrumental arrangement synthesized locally: no audio download,
   external player or tracking. Tries autoplay, with first-interaction fallback.
   -------------------------------------------------------------------------- */
function initMusic() {
  const music = $("#birthday-music");
  const buttons = $$("#music-toggle, [data-music-toggle]");
  const renderState = () => {
    const playing = !music.paused;
    buttons.forEach(button => {
      button.classList.toggle("is-playing", playing);
      button.setAttribute("aria-pressed", String(playing));
      const label = $("#music-label", button) || button;
      label.textContent = playing ? "Pause music" : "Play music";
      button.setAttribute("aria-label", label.textContent);
    });
  };
  const play = () => {
    music.play().catch(error => {
      renderState();
      if (error.name !== "AbortError") console.warn("Background music could not play", error);
    });
  };
  music.volume = .85;
  music.addEventListener("play", renderState);
  music.addEventListener("pause", renderState);
  music.addEventListener("error", renderState);
  let pausedByUser = false;
  buttons.forEach(button => button.addEventListener("click", () => {
    pausedByUser = !music.paused;
    if (pausedByUser) music.pause();
    else play();
  }));
  $("#scrapbook [data-turn='pin']").addEventListener("click", () => {
    if (music.paused && !pausedByUser) play();
  });
  document.addEventListener("birthday:start-music", play);
  renderState();
}
/* 6 — PARTICLES -----------------------------------------------------------
   Sparse pink / blue / white motes drifting upward. Static when reduced
   motion is on; paused while the tab is hidden.
   -------------------------------------------------------------------------- */
function initParticles() {
  const canvas = $("#particles");
  const ctx = canvas && canvas.getContext("2d");
  if (!ctx) return;

  const COLORS = ["255,182,217", "255,182,217", "87,199,255", "255,255,255"]; /* pink-heavy */
  let w = 0, h = 0, dpr = 1, motes = [], raf = 0, last = 0;

  const rand = (a, b) => a + Math.random() * (b - a);
  const spawn = (anywhere = true) => ({
    x: rand(0, w),
    y: anywhere ? rand(0, h) : h + 10,
    r: rand(0.5, 1.9),
    vx: rand(-0.025, 0.025),
    vy: -rand(0.03, 0.13),
    a: rand(0.18, 0.6),
    tw: rand(0, Math.PI * 2),
    ts: rand(0.004, 0.014),
    c: COLORS[Math.floor(Math.random() * COLORS.length)]
  });

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = clamp(Math.round((w * h) / 22000), 18, 70);
    motes = Array.from({ length: count }, () => spawn(true));
    draw(0);
  };

  function draw(dt) {
    ctx.clearRect(0, 0, w, h);
    for (const m of motes) {
      m.x += m.vx * dt;
      m.y += m.vy * dt;
      m.tw += m.ts * dt;
      if (m.y < -10) Object.assign(m, spawn(false));
      if (m.x < -10) m.x = w + 10; else if (m.x > w + 10) m.x = -10;
      const alpha = m.a * (0.65 + 0.35 * Math.sin(m.tw));
      ctx.fillStyle = `rgba(${m.c},${(alpha * 0.2).toFixed(3)})`;
      ctx.beginPath(); ctx.arc(m.x, m.y, m.r * 4, 0, 6.2832); ctx.fill();
      ctx.fillStyle = `rgba(${m.c},${alpha.toFixed(3)})`;
      ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, 6.2832); ctx.fill();
    }
  }

  const frame = (t) => {
    const dt = Math.min((t - last) / 16.67, 3);
    last = t;
    draw(dt);
    raf = requestAnimationFrame(frame);
  };
  const start = () => {
    if (raf || prefersReducedMotion.matches || document.hidden) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  };
  const stop = () => { cancelAnimationFrame(raf); raf = 0; };

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  });
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
  prefersReducedMotion.addEventListener("change", () => (prefersReducedMotion.matches ? stop() : start()));

  resize();
  start();
}

/* 7 — POINTER PARALLAX ----------------------------------------------------
   Desktop mouse only. While the pointer is over `area`, --px / --py (-1..1)
   are written on `target`; the CSS turns them into a slight 3D tilt (and,
   in the hero, a per-layer shift by depth). The value eases toward the
   pointer and the loop stops itself once it has settled.
   -------------------------------------------------------------------------- */
const canHover = window.matchMedia("(hover: hover) and (pointer: fine)");

function trackPointer(area, target) {
  if (!area || !target) return;
  let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;

  const step = () => {
    cx += (tx - cx) * 0.08;
    cy += (ty - cy) * 0.08;
    target.style.setProperty("--px", cx.toFixed(4));
    target.style.setProperty("--py", cy.toFixed(4));
    raf = (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) ? requestAnimationFrame(step) : 0;
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(step); };

  area.addEventListener("pointermove", (e) => {
    if (!canHover.matches || prefersReducedMotion.matches || e.pointerType !== "mouse") return;
    const r = area.getBoundingClientRect();
    tx = clamp(((e.clientX - r.left) / r.width - 0.5) * 2, -1, 1);
    ty = clamp(((e.clientY - r.top) / r.height - 0.5) * 2, -1, 1);
    kick();
  });
  area.addEventListener("pointerleave", () => { tx = 0; ty = 0; kick(); });
}

/* Shared card tilt: while a desktop mouse is over `trigger`, tilt `frame` by
   up to `ry` / `rx` degrees and move a soft glare (--gx / --gy). `guard`
   lets a caller veto it (e.g. while dragging). Used by Moments and Reasons. */
function bindTilt(trigger, frame, { ry = 9, rx = 7, guard = () => true } = {}) {
  trigger.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse" || !canHover.matches || prefersReducedMotion.matches || !guard()) return;
    const r = frame.getBoundingClientRect();
    const nx = clamp((e.clientX - r.left) / r.width, 0, 1);
    const ny = clamp((e.clientY - r.top) / r.height, 0, 1);
    frame.classList.add("is-tilting");
    frame.style.setProperty("--ry", `${((nx - 0.5) * ry).toFixed(2)}deg`);
    frame.style.setProperty("--rx", `${((0.5 - ny) * rx).toFixed(2)}deg`);
    frame.style.setProperty("--gx", `${(nx * 100).toFixed(1)}%`);
    frame.style.setProperty("--gy", `${(ny * 100).toFixed(1)}%`);
  });
  trigger.addEventListener("pointerleave", () => {
    frame.classList.remove("is-tilting");
    frame.style.setProperty("--rx", "0deg");
    frame.style.setProperty("--ry", "0deg");
  });
}

/* 8 — FLOATING PETALS (Birthday Wish) -------------------------------------
   A handful of soft pink petals drifting down behind the section. Fewer on
   phones; paused while the section is off screen.
   -------------------------------------------------------------------------- */
function initPetals() {
  const host = $("#petals");
  const section = $("#wishes");
  if (!host || !section || prefersReducedMotion.matches) return;

  const count = window.matchMedia("(max-width: 860px)").matches ? 5 : 9;
  let seed = 7; /* fixed seed: the same gentle arrangement every visit */
  const rnd = (a, b) => { seed = (seed * 16807) % 2147483647; return a + (seed / 2147483647) * (b - a); };

  for (let i = 0; i < count; i++) {
    const size = rnd(14, 26);
    const dur = rnd(18, 30);
    const el = document.createElement("span");
    el.className = "petal";
    el.style.cssText =
      `--x:${(rnd(3, 96)).toFixed(1)}%;--s:${size.toFixed(1)}px;--dur:${dur.toFixed(1)}s;` +
      `--delay:${(-rnd(0, dur)).toFixed(1)}s;--drift:${rnd(-60, 60).toFixed(0)}px;` +
      `--sway:${rnd(14, 34).toFixed(0)}px;--sway-dur:${rnd(3.5, 6).toFixed(1)}s;` +
      `--tumble:${rnd(7, 13).toFixed(1)}s;--o:${rnd(0.35, 0.75).toFixed(2)}`;
    el.innerHTML = `<span class="petal__sway"><svg viewBox="0 0 24 24" fill="url(#g-pink)"><use href="#i-petal"/></svg></span>`;
    host.append(el);
  }

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([en]) => host.classList.toggle("is-running", en.isIntersecting), { threshold: 0 }).observe(section);
  } else {
    host.classList.add("is-running");
  }
}

/* 9 — HER MOMENTS: strip, tilt, lightbox -----------------------------------
   The photos live in index.html (exact filenames). Here: arrows + progress,
   mouse drag-to-scroll, restrained card tilt (desktop mouse only) and the
   <dialog> lightbox (click, arrows, swipe, Esc, focus returns to the card).
   -------------------------------------------------------------------------- */
function initMoments() {
  const strip = $("#moments-strip");
  if (!strip) return;
  const track = $(".strip__track", strip);
  const cards = $$(".moment", track);
  const prev = $("#moments-prev");
  const next = $("#moments-next");
  const fill = $("#moments-fill");

  /* ---- arrows + progress ---- */
  const edge = () => parseFloat(getComputedStyle(track).paddingLeft) || 0;
  const target = (el) => Math.max(0, el.offsetLeft - edge());
  const goTo = (left) => strip.scrollTo({ left, behavior: prefersReducedMotion.matches ? "auto" : "smooth" });

  let ticking = false;
  const sync = () => {
    ticking = false;
    const max = strip.scrollWidth - strip.clientWidth;
    const p = max > 0 ? clamp(strip.scrollLeft / max, 0, 1) : 1;
    fill.style.setProperty("--p", Math.max(p, 0.04).toFixed(4));
    if (prev) prev.disabled = strip.scrollLeft <= 4;
    if (next) next.disabled = max <= 4 || strip.scrollLeft >= max - 4;
  };
  const queueSync = () => { if (!ticking) { ticking = true; requestAnimationFrame(sync); } };
  strip.addEventListener("scroll", queueSync, { passive: true });
  window.addEventListener("resize", queueSync, { passive: true });
  sync();

  next && next.addEventListener("click", () => {
    const t = cards.map(target).find((x) => x > strip.scrollLeft + 8);
    goTo(t ?? strip.scrollWidth);
  });
  prev && prev.addEventListener("click", () => {
    const t = cards.map(target).reverse().find((x) => x < strip.scrollLeft - 8);
    goTo(t ?? 0);
  });

  /* ---- mouse drag-to-scroll (touch uses native swipe + snap) ---- */
  let down = false, moved = false, sx = 0, sl = 0;
  strip.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    down = true; moved = false; sx = e.clientX; sl = strip.scrollLeft;
  });
  window.addEventListener("pointermove", (e) => {
    if (!down) return;
    const dx = e.clientX - sx;
    if (!moved && Math.abs(dx) > 5) { moved = true; strip.classList.add("is-dragging"); }
    if (moved) strip.scrollLeft = sl - dx;
  });
  const endDrag = () => {
    if (!down) return;
    down = false;
    strip.classList.remove("is-dragging");
    setTimeout(() => { moved = false; }, 0); /* after the click event that follows a drag */
  };
  window.addEventListener("pointerup", endDrag);
  window.addEventListener("pointercancel", endDrag);
  strip.addEventListener("click", (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);

  /* ---- restrained 3D tilt on desktop ---- */
  cards.forEach((card) => {
    bindTilt($(".moment__open", card), $(".moment__frame", card), { guard: () => !strip.classList.contains("is-dragging") });
  });

  /* ---- lightbox ---- */
  const dlg = $("#lightbox");
  const lbImg = $("#lb-img");
  const lbFrame = $("#lb-frame");
  const lbTitle = $("#lb-title");
  const lbCount = $("#lb-count");
  if (!dlg || typeof dlg.showModal !== "function") return;

  const items = cards.map((card) => {
    const im = $("img", card);
    const cs = getComputedStyle(card);
    return {
      card,
      src: im.getAttribute("src"),
      alt: im.alt,
      w: +im.getAttribute("width"),
      h: +im.getAttribute("height"),
      title: $(".moment__title", card).textContent.trim(),
      zoom: cs.getPropertyValue("--zoom").trim() || "1",
      ox: cs.getPropertyValue("--ox").trim() || "50%",
      oy: cs.getPropertyValue("--oy").trim() || "50%"
    };
  });

  let index = 0, opener = null;
  const show = (i) => {
    index = (i + items.length) % items.length;
    const it = items[index];
    lbFrame.style.setProperty("--r", (it.w / it.h).toFixed(4));
    lbFrame.style.setProperty("--nw", it.w);
    lbFrame.style.setProperty("--zoom", it.zoom);
    lbFrame.style.setProperty("--ox", it.ox);
    lbFrame.style.setProperty("--oy", it.oy);
    lbImg.style.animation = "none"; void lbImg.offsetWidth; lbImg.style.animation = ""; /* replay the fade */
    lbImg.src = it.src;
    lbImg.alt = it.alt;
    lbTitle.textContent = it.title;
    lbCount.textContent = `${index + 1} / ${items.length}`;
    [index - 1, index + 1].forEach((n) => { new Image().src = items[(n + items.length) % items.length].src; });
  };
  const open = (i, from) => {
    opener = from || null;
    show(i);
    dlg.showModal();
    document.documentElement.classList.add("is-locked");
  };
  const close = () => { if (dlg.open) dlg.close(); };

  cards.forEach((card, i) => $(".moment__open", card).addEventListener("click", (e) => open(i, e.currentTarget)));

  dlg.addEventListener("close", () => {
    document.documentElement.classList.remove("is-locked");
    const card = items[index].card;
    card.scrollIntoView({ inline: "nearest", block: "nearest", behavior: "auto" });
    ($(".moment__open", card) || opener)?.focus({ preventScroll: true });
  });
  $("#lb-close").addEventListener("click", close);
  $("#lb-prev").addEventListener("click", () => show(index - 1));
  $("#lb-next").addEventListener("click", () => show(index + 1));
  dlg.addEventListener("click", (e) => { if (e.target === dlg || e.target.classList.contains("lb__stage")) close(); });
  dlg.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); show(index - 1); }
    else if (e.key === "ArrowRight") { e.preventDefault(); show(index + 1); }
  });

  /* swipe left / right on the photo (touch and pen) */
  let sx0 = null;
  lbFrame.addEventListener("pointerdown", (e) => { if (e.pointerType !== "mouse") sx0 = e.clientX; });
  lbFrame.addEventListener("pointerup", (e) => {
    if (sx0 === null) return;
    const dx = e.clientX - sx0; sx0 = null;
    if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
  });
  lbFrame.addEventListener("pointercancel", () => { sx0 = null; });
}

/* 10 — REASONS ----------------------------------------------------------
   Four scenes (photo + two notes). Desktop mouse: each scene eases --px/--py
   so photos and notes drift at different depths, and each note tilts a little.
   Everyone: tap/click a note to lift it forward and read it at display size
   (one open at a time; click elsewhere or press Esc to put it back). The photo
   in the same scene lights up while one of its notes is hovered / focused / open
   (pure CSS via :has()). No continuous animation loop.
   -------------------------------------------------------------------------- */
function initReasons() {
  const cards = $$(".rcard");
  if (!cards.length) return;

  $$(".universe .scene").forEach((scene) => trackPointer(scene, scene));

  cards.forEach((card) => {
    const face = $(".rcard__face", card);
    bindTilt(face, face, { ry: 6, rx: 5 });
  });

  const setOpen = (card, open) => {
    card.classList.toggle("is-open", open);
    $(".rcard__face", card).setAttribute("aria-expanded", String(open));
  };
  const closeAll = (except) => cards.forEach((c) => { if (c !== except && c.classList.contains("is-open")) setOpen(c, false); });

  cards.forEach((card) => {
    $(".rcard__face", card).addEventListener("click", () => {
      const willOpen = !card.classList.contains("is-open");
      closeAll(card);
      setOpen(card, willOpen);
    });
  });
  document.addEventListener("pointerdown", (e) => { if (!e.target.closest(".rcard")) closeAll(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !document.querySelector("dialog[open]")) closeAll(); });
}

/* 11 — LETTER (envelope) ---------------------------------------------------
   A small state machine on #letter[data-state]:
     sealed --Open--> opening --(paper has risen)--> opening+focus --> open
     open --Read Again / Esc--> closing --> sealed
   Each step waits for the real CSS transition (transitionend) instead of fixed
   timers; a fallback timeout only protects against a missed event. While a step
   is running, both buttons are inert, so nothing can be triggered twice.
   The letter text lives in index.html (#lt-paper) and can be edited freely:
   the layout re-measures itself.
   -------------------------------------------------------------------------- */
function initLetter() {
  const section = $("#letter");
  const stage = $("#lt-stage");
  const env = $("#lt-env");
  const paper = $("#lt-paper");
  const openBtn = $("#lt-open");
  const againBtn = $("#lt-again");
  const status = $("#lt-status");
  const sealHalf = $(".seal__half--l", env);
  if (!section || !stage || !env || !paper || !openBtn || !againBtn) return;

  let state = "sealed";
  const setState = (s) => { state = s; section.dataset.state = s; };
  const say = (msg) => { if (status) status.textContent = msg; };

  /* measure the paper and hand the numbers to the CSS (scale while tucked in, height, clip) */
  const measure = () => {
    const ew = env.offsetWidth, eh = env.offsetHeight, pw = paper.offsetWidth, ph = paper.offsetHeight;
    if (!pw || !ph) return;
    const s0 = (ew * 0.86) / pw;
    const visible = (eh * 0.9) / s0;
    section.style.setProperty("--s0", s0.toFixed(4));
    section.style.setProperty("--ph", `${ph}px`);
    section.style.setProperty("--clipb", `${Math.max(0, (1 - visible / ph) * 100).toFixed(2)}%`);
  };
  measure();
  if ("ResizeObserver" in window) {
    const ro = new ResizeObserver(measure);
    ro.observe(paper);
    ro.observe(env);
  } else {
    window.addEventListener("resize", measure);
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);

  /* resolves when `el` finishes transitioning `prop` (or after `fallback` ms; at once under reduced motion) */
  const transitionEnd = (el, prop, fallback) => new Promise((resolve) => {
    if (prefersReducedMotion.matches) { requestAnimationFrame(() => resolve()); return; }
    let done = false, timer = 0;
    const finish = () => {
      if (done) return;
      done = true;
      el.removeEventListener("transitionend", onEnd);
      clearTimeout(timer);
      resolve();
    };
    const onEnd = (e) => { if (e.target === el && e.propertyName === prop) finish(); };
    el.addEventListener("transitionend", onEnd);
    timer = setTimeout(finish, fallback);
  });

  const scrollTop = (y) => window.scrollTo({ top: y, behavior: prefersReducedMotion.matches ? "auto" : "smooth" });

  const open = async () => {
    if (state !== "sealed") return;
    setState("opening");
    openBtn.inert = true;
    section.classList.add("is-open");
    say("Opening the letter.");

    await transitionEnd(paper, "transform", 3800);         /* seal, flap and the paper's rise */
    section.classList.add("is-focus");                     /* the letter unfolds, the envelope lowers, the room darkens */
    paper.inert = false;
    const top = paper.getBoundingClientRect().top;         /* its top edge stays put while it unfolds */
    if (top < 90 || top > window.innerHeight * 0.5) scrollTop(Math.max(0, window.scrollY + top - 110));

    await transitionEnd(stage, "padding-top", 2600);
    setState("open");
    againBtn.inert = false;
    say("The letter is open.");
    paper.focus({ preventScroll: true });
  };

  const reset = async () => {
    if (state !== "open") return;
    setState("closing");
    againBtn.inert = true;
    paper.inert = true;
    say("Putting the letter back.");
    const r = stage.getBoundingClientRect();
    scrollTop(Math.max(0, window.scrollY + r.top - window.innerHeight * 0.36));
    section.classList.remove("is-focus");                  /* fold up, envelope rises back */

    await transitionEnd(stage, "padding-top", 2400);
    section.classList.remove("is-open");                   /* paper slips in, flap closes, seal re-forms */

    await transitionEnd(sealHalf, "opacity", 3800);
    setState("sealed");
    openBtn.inert = false;
    requestAnimationFrame(() => openBtn.focus({ preventScroll: true }));   /* after it is visible again */
    say("The letter is sealed again.");
  };

  openBtn.addEventListener("click", open);
  againBtn.addEventListener("click", reset);
  env.addEventListener("click", () => { if (state === "sealed") open(); });   /* tapping the envelope or seal works too */
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && state === "open" && !document.querySelector("dialog[open]")) reset();   /* a lightbox owns Esc while it is open */
  });

  /* the envelope fades in once, when it first scrolls into view */
  const seen = () => section.classList.add("is-seen");
  if ("IntersectionObserver" in window && !prefersReducedMotion.matches) {
    new IntersectionObserver(([en], obs) => { if (en.isIntersecting) { seen(); obs.disconnect(); } }, { threshold: 0.25 }).observe(stage);
  } else {
    seen();
  }
}

/* 12 — GALLERY --------------------------------------------------------------
   Five photographs in index.html (.gph buttons). Here: a very restrained tilt
   (max 2°, desktop mouse only) and the Gallery's own <dialog> lightbox.
   Keys are handled on the dialog itself, so they only respond while it is open
   and never touch the Moments lightbox, Reasons notes or the Letter.
   Photo 04 is shown through a crop window (data-lb) in the lightbox too, so
   the rest of that source image is never displayed anywhere.
   -------------------------------------------------------------------------- */
function initGallery() {
  const buttons = $$(".gph");
  const dlg = $("#glb");
  if (!buttons.length) return;

  buttons.forEach((b) => bindTilt(b, $(".gph__frame", b), { ry: 4, rx: 4 }));   /* ±2° at most */
  if (!dlg || typeof dlg.showModal !== "function") return;

  const frame = $("#glb-frame");
  const img = $("#glb-img");
  const count = $("#glb-count");
  const title = $("#glb-title");

  const photos = buttons.map((b) => {
    const im = $("img", b);
    const nw = +b.dataset.nw, nh = +b.dataset.nh;
    const [cx, cy, cw, ch] = b.dataset.lb ? b.dataset.lb.split(/\s+/).map(Number) : [0, 0, nw, nh];
    return { b, src: im.getAttribute("src"), alt: im.alt, title: b.dataset.title, nw, nh, cx, cy, cw, ch, capk: b.dataset.lbcap || "1.25" };
  });

  let index = 0;
  const pad = (n) => String(n).padStart(2, "0");

  const show = (i) => {
    index = (i + photos.length) % photos.length;
    const p = photos[index];
    const set = (k, v) => frame.style.setProperty(k, v);
    set("--ar", `${p.cw} / ${p.ch}`);
    set("--arn", (p.cw / p.ch).toFixed(4));
    set("--cwpx", p.cw);
    set("--capk", p.capk);
    set("--nw", p.nw); set("--nh", p.nh);
    set("--cx", p.cx); set("--cy", p.cy); set("--cw", p.cw); set("--ch", p.ch);
    img.style.animation = "none"; void img.offsetWidth; img.style.animation = "";
    img.src = p.src;
    img.alt = p.alt;
    count.textContent = `${pad(index + 1)} / ${pad(photos.length)}`;
    title.textContent = p.title;
    [index - 1, index + 1].forEach((n) => { new Image().src = photos[(n + photos.length) % photos.length].src; });
  };

  const open = (i) => {
    if (dlg.open) return;                       /* no duplicate opens */
    show(i);
    dlg.showModal();
    document.documentElement.classList.add("is-locked");
  };

  buttons.forEach((b, i) => b.addEventListener("click", () => open(i)));

  dlg.addEventListener("close", () => {
    document.documentElement.classList.remove("is-locked");
    const b = photos[index].b;                  /* back to the photo being viewed (the clicked one, unless you moved on) */
    b.scrollIntoView({ block: "nearest", behavior: "auto" });
    b.focus({ preventScroll: true });
  });
  $("#glb-close").addEventListener("click", () => dlg.close());
  $("#glb-prev").addEventListener("click", () => show(index - 1));
  $("#glb-next").addEventListener("click", () => show(index + 1));
  dlg.addEventListener("click", (e) => { if (e.target === dlg || e.target.classList.contains("glb__stage")) dlg.close(); });
  dlg.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); show(index - 1); }
    else if (e.key === "ArrowRight") { e.preventDefault(); show(index + 1); }
  });

  let sx = null;                                /* swipe on touch / pen */
  frame.addEventListener("pointerdown", (e) => { if (e.pointerType !== "mouse") sx = e.clientX; });
  frame.addEventListener("pointerup", (e) => {
    if (sx === null) return;
    const dx = e.clientX - sx; sx = null;
    if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
  });
  frame.addEventListener("pointercancel", () => { sx = null; });
}

/* 13 — FINAL SURPRISE -------------------------------------------------------
   Blow out the candles (button or tap the cake): flames go out, confetti
   bursts on a canvas, and the birthday message fades in. "Light Them Again"
   resets it. State lives on #surprise[data-state] = lit | out.
   -------------------------------------------------------------------------- */
function initFinal() {
  const section = $("#surprise");
  const blow = $("#blow");
  const relight = $("#relight");
  const cake = $("#cake");
  const canvas = $("#confetti");
  const hint = $("#final-hint");
  if (!section || !blow || !cake) return;
  const ctx = canvas && canvas.getContext("2d");

  let pieces = [], raf = 0, last = 0, w = 0, h = 0, dpr = 1;
  const COLORS = ["#FFB6D9", "#FF72B6", "#57C7FF", "#2D8CFF", "#FFFFFF", "#FFD8E9"];
  const rand = (a, b) => a + Math.random() * (b - a);

  const size = () => {
    if (!ctx) return;
    const r = section.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = r.width; h = r.height;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  const tick = (t) => {
    const dt = Math.min((t - last) / 16.67, 3); last = t;
    ctx.clearRect(0, 0, w, h);
    pieces = pieces.filter((p) => p.y < h + 20 && p.life > 0);
    for (const p of pieces) {
      p.vy += 0.12 * dt; p.vx *= 0.995; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt; p.life -= dt;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.globalAlpha = Math.min(1, p.life / 60); ctx.fillStyle = p.c;
      ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); ctx.restore();
    }
    raf = pieces.length ? requestAnimationFrame(tick) : 0;
    if (!raf) ctx.clearRect(0, 0, w, h);
  };
  const burst = () => {
    if (!ctx || prefersReducedMotion.matches) return;
    size();
    const c = cake.getBoundingClientRect(), s = section.getBoundingClientRect();
    const ox = c.left - s.left + c.width / 2, oy = c.top - s.top + c.height * 0.25;
    for (let i = 0; i < 150; i++) {
      const a = rand(-Math.PI, 0), v = rand(4, 13);
      pieces.push({ x: ox, y: oy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, s: rand(6, 12), rot: rand(0, 6.28), vr: rand(-0.25, 0.25), c: COLORS[i % COLORS.length], life: rand(120, 220) });
    }
    if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); }
  };

  const blowOut = () => {
    if (section.dataset.state === "out") return;
    section.dataset.state = "out";
    blow.hidden = true; relight.hidden = false;
    hint.textContent = "Happy Birthday! ";
    burst();
    setTimeout(() => $("#final-message").scrollIntoView({ behavior: prefersReducedMotion.matches ? "auto" : "smooth", block: "center" }), 900);
    relight.focus({ preventScroll: true });
  };
  const reLight = () => {
    section.dataset.state = "lit";
    blow.hidden = false; relight.hidden = true;
    hint.textContent = "Make a wish first, then blow.";
    blow.focus({ preventScroll: true });
  };
  blow.addEventListener("click", blowOut);
  cake.addEventListener("click", blowOut);
  relight.addEventListener("click", reLight);
  window.addEventListener("resize", () => { if (pieces.length) size(); });
}

/* 14 — BOOT --------------------------------------------------------------- */
// A short press response adds feedback without delaying links or buttons.
function initButtonMotion() {
  if (prefersReducedMotion.matches) return;
  $$(".btn, .icon-btn").forEach(button => {
    button.addEventListener("click", () => {
      if (typeof button.animate !== "function") return;
      button.animate([
        { scale: "1" }, { scale: ".96", offset: .4 }, { scale: "1" }
      ], { duration: 220, easing: "ease-out" });
    });
  });
}

function initMysteryBoxes() {
  const cards = $$("[data-gift]");
  if (!cards.length) return;
  const opened = new Set();
  const status = $("#mystery-progress");
  const last = $("#gift-button-04");
  const celebration = createLoaderCelebration($("#mystery-confetti"), prefersReducedMotion.matches);
  cards.forEach(card => {
    const button = $(".mystery-open", card);
    const content = $(".mystery-content", card);
    button.addEventListener("click", () => {
      const id = card.dataset.gift;
      const opening = button.getAttribute("aria-expanded") !== "true";
      button.setAttribute("aria-expanded", String(opening));
      card.classList.toggle("is-unwrapped", opening);
      content.hidden = !opening;
      $(".mystery-hint", card).textContent = opening ? "Tap to close" : "Open again";
      if (opening) {
        opened.add(id);
        if (!prefersReducedMotion.matches && typeof content.animate === "function") {
          content.animate([{opacity:0,transform:"translateY(8px)"},{opacity:1,transform:"translateY(0)"}],{duration:450,easing:"ease-out"});
        }
        if (id === "04") celebration.start();
      }
      const unlocked = ["01","02","03"].every(key => opened.has(key));
      last.disabled = !unlocked;
      if (unlocked && !opened.has("04")) $(".mystery-hint", last).textContent = "It’s your turn. Tap to open.";
      status.textContent = `${opened.size} of 4 opened` + (opened.size === 4 ? " · All yours. Happy Birthday!" : unlocked ? " · The last box is ready for you." : " · Open the first three to unlock the last.");
    });
  });
  window.addEventListener("pagehide", () => celebration.stop());
}

function bootBirthdayPage() {
  // One failing effect must not prevent the other controls from initializing.
  const initializers = [
    initNav, initButtonMotion, () => initReveal(Promise.resolve()),
    () => trackPointer($("#home"), $("#hero-stage")),
    () => trackPointer($("#wishes"), $("#wish-card")),
    initPetals, initMoments, initReasons,
    () => trackPointer($("#letter"), $("#lt-env")),
    initLetter, initGallery, initMysteryBoxes, initFinal, initParticles
  ];
  initializers.forEach(initialize => {
    try { initialize(); }
    catch (error) { console.error("Birthday component initialization failed", error); }
  });
}

function initScrapbook() {
  const scrapbook = $("#scrapbook");
  const pages = [...scrapbook.querySelectorAll("[data-page]")];
  const form = $("#scrap-pin");
  const code = $("#scrap-code");
  const error = $("#scrap-error");
  let unlocked = false;

  function turn(name) {
    const page = pages.find(item => item.dataset.page === name);
    if (!page || (page.inert && !unlocked)) return;
    pages.forEach(item => { item.hidden = item !== page; });
    window.scrollTo(0, 0);
    page.querySelector("h2")?.focus({ preventScroll: true });
  }

  scrapbook.addEventListener("click", event => {
    const button = event.target.closest("button");
    if (!button) return;
    if (button.dataset.turn) turn(button.dataset.turn);
    const key = button.dataset.key;
    if (key) {
      code.value = key === "back" ? code.value.slice(0, -1) : (code.value + key).slice(0, 4);
      error.textContent = "";
      code.removeAttribute("aria-invalid");
    }
  });
  code.addEventListener("input", () => {
    code.value = code.value.replace(/\D/g, "").slice(0, 4);
    error.textContent = "";
    code.removeAttribute("aria-invalid");
  });
  form.addEventListener("submit", event => {
    event.preventDefault();
    if (code.value !== "2003") {
      error.textContent = "That PIN didn’t match. Try again ♡";
      code.setAttribute("aria-invalid", "true");
      code.select();
      code.focus();
      return;
    }
    code.value = "";
    unlocked = true;
    pages.forEach(page => { page.inert = false; });
    turn("birthday");
  });
  $("#scrap-no").addEventListener("click", () => {
    $("#scrap-reply").textContent = "I’ll keep it here until you’re ready ♡";
  });
  $("#scrap-finale").addEventListener("click", () => {
    if (!unlocked) return;
    scrapbook.hidden = true;
    const finale = $("#birthday-finale");
    finale.hidden = false;
    finale.inert = false;
    window.scrollTo(0, 0);
    bootBirthdayPage();
    $("#main")?.focus();
  }, { once: true });
}
initScrapbook();
document.documentElement.classList.add("js", "is-loading");
initMusic();
initLoader().finally(() => {
  $("#scrapbook").inert = false;
  $("#scrapbook [data-turn='pin']")?.focus({ preventScroll: true });
});
