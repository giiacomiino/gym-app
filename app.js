/* app.js — interfaz: rutina del día, calendario, biblioteca, avance y pesos sugeridos.
   Guarda solo en el celular: marcas, cómo te fue (un toque), modo/duración del día,
   cambios de ejercicio y pruebas de la ruta de impacto. */
(function () {
  const { PROG, EX, FIG } = window;
  const $ = (s, el = document) => el.querySelector(s);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ================= estado local ================= */
  const KEY = 'gymapp.v2';
  const blank = () => ({ checks: {}, done: {}, recovery: {}, profile: { weight: 76, height: 180 }, fb: {}, swaps: {}, gates: {}, days: {}, rounds: {}, log: {} });
  let ST;
  try { ST = Object.assign(blank(), JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { ST = blank(); }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(ST)); } catch (e) { /* sin almacenamiento: la app sigue funcionando */ } };
  PROG.setProfile(ST.profile);
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});

  let T = PROG.today();
  // el programa recalcula las sesiones con lo que guardaste
  // días con algo hecho: 'w' entrenamiento, 'r' solo opciones de recuperación
  function activeDays() {
    const a = {};
    Object.keys(ST.recovery).forEach((d) => { if (Object.values(ST.recovery[d]).some(Boolean)) a[d] = 'r'; });
    [ST.checks, ST.fb].forEach((o) => Object.keys(o).forEach((d) => { if (Object.values(o[d] || {}).some(Boolean)) a[d] = 'w'; }));
    Object.keys(ST.done).forEach((d) => { if (ST.done[d] && a[d] !== 'r') a[d] = 'w'; });
    return a;
  }
  const sync = () => PROG.setState({ fb: ST.fb, swaps: ST.swaps, gates: ST.gates, days: ST.days, log: ST.log, active: activeDays(), today: T });
  // al tocar algo de una sesión, ese día queda registrado con el tipo que tenía (A, B, C o Extra)
  function logDay(date) {
    const s = PROG.session(date);
    if (!ST.log[date] && s && ['gym', 'extra', 'cardio'].includes(s.kind)) ST.log[date] = s.type;
  }
  function unlogIfEmpty(date) {
    const any = (o) => Object.values(o[date] || {}).some(Boolean);
    if (!any(ST.checks) && !any(ST.fb) && !ST.done[date] && !any(ST.rounds)) delete ST.log[date];
  }
  sync();
  const isDone = (d) => !!ST.done[d];
  const checked = (d, k) => !!(ST.checks[d] || {})[k];

  /* ================= utilidades ================= */
  const DOW = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const DOW3 = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const MON = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const MONL = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const dLong = (s) => { const d = PROG.parse(s); return `${DOW[d.getDay()]} ${d.getDate()} ${MON[d.getMonth()]}`; };
  const dShort = (s) => { const d = PROG.parse(s); return `${d.getDate()} ${MON[d.getMonth()]}`; };
  const num = (s) => (String(s || '').match(/\d+(?:[.,]\d+)?/g) || []).map((x) => parseFloat(x.replace(',', '.')));
  const topOf = (s) => { const n = num(s); return n.length ? Math.max(...n) : null; };
  const isWorkout = (s) => s && (s.kind === 'gym' || s.kind === 'kb');
  const BOX_FROM = '2026-11-12', BOX_TO = '2026-11-26';

  const ICON = {
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    bolt: '<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>',
    play: '<path d="M8 5v14l11-7z"/>',
    pause: '<path d="M7 5h4v14H7zM13 5h4v14h-4z"/>',
    timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6"/>',
    mountain: '<path d="M2 20l7-12 4 6 3-4 6 10z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    ext: '<path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6"/>',
    star: '<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/>',
    glove: '<path d="M7 10V6a3 3 0 016 0v1h1a3 3 0 013 3v4a6 6 0 01-6 6H9a3 3 0 01-3-3v-4a2 2 0 011-2z"/><path d="M7 14h6"/>',
    weight: '<path d="M6 9h12l2 11H4z"/><circle cx="12" cy="6" r="2.5"/>',
    swap: '<path d="M4 8h13l-3-3M20 16H7l3 3"/>',
    home: '<path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z"/>',
    jump: '<circle cx="12" cy="4.5" r="2"/><path d="M8 21l2-6-2-3 4-3 3 3h3M10 15l4 2v4"/>'
  };
  const ico = (n, cls = '') => `<svg class="ico ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICON[n]}</svg>`;

  function piste(level, withText) {
    const L = PROG.LEVELS[level];
    if (!L) return '';
    const shape = { green: '<circle cx="8" cy="8" r="6"/>', blue: '<rect x="2.5" y="2.5" width="11" height="11"/>', black: '<path d="M8 1.5l6.5 6.5L8 14.5 1.5 8z"/>', dblack: '<path d="M5 3l4 5-4 5-4-5zM11 3l4 5-4 5-4-5z"/>' }[L.k];
    return `<span class="piste piste-${L.k}" title="Dificultad: ${L.name}"><svg viewBox="0 0 16 16" aria-hidden="true">${shape}</svg>${withText ? `<span>${L.label}</span>` : ''}</span>`;
  }

  const thumbCache = new Map();
  const thumb = (id) => { if (!thumbCache.has(id)) thumbCache.set(id, FIG.staticSVG(EX.BY[id].fig, null, 'fig-thumb')); return thumbCache.get(id); };

  let toastT;
  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg; el.hidden = false;
    clearTimeout(toastT); toastT = setTimeout(() => { el.hidden = true; }, 2400);
  }

  /* ================= sheet ================= */
  let stopAnim = null, curEx = null;
  const closeAnim = () => { if (stopAnim) { stopAnim(); stopAnim = null; } };
  function openSheet(html) {
    closeAnim();
    $('#sheet-body').innerHTML = html;
    $('#sheet').hidden = false; $('#scrim').hidden = false;
    document.body.classList.add('locked');
    $('#sheet-body').scrollTop = 0;
  }
  function closeSheet() {
    closeAnim();
    $('#sheet').hidden = true; $('#scrim').hidden = true;
    document.body.classList.remove('locked');
  }

  /* ================= cálculos de avance ================= */
  // Meta: 3 sesiones (A, B, C) por semana; la semana 1 empezó en jueves, ahí la meta es 2.
  const PER_WEEK = (w) => (w === 1 ? 2 : 3);
  const wkMonday = (w) => PROG.addDays(PROG.WEEK1, (w - 1) * 7);
  function weekDoneCount(w) {
    let n = 0;
    for (let i = 0; i < 7; i++) { const d = PROG.addDays(wkMonday(w), i); if (PROG.inProgram(d) && isDone(d) && isWorkout(PROG.session(d))) n++; }
    return n;
  }
  function cardioCount(w) {
    let n = 0;
    for (let d = w ? wkMonday(w) : PROG.START, i = 0; d <= PROG.END && (!w || i < 7); d = PROG.addDays(d, 1), i++) { const s = PROG.session(d); if (s && s.kind === 'cardio' && isDone(d)) n++; }
    return n;
  }
  function trainingDays(upto) {
    const wNow = Math.min(Math.max(PROG.weekOf(upto), 1), PROG.TOTAL_WEEKS);
    let planned = 0, done = 0;
    for (let w = 1; w <= wNow; w++) { const n = weekDoneCount(w); done += n; planned += w < wNow ? PER_WEEK(w) : Math.min(PER_WEEK(w), n); }
    return { planned, done };
  }
  const totalWorkouts = () => { let n = 0; for (let w = 1; w <= PROG.TOTAL_WEEKS; w++) n += PER_WEEK(w); return n; };
  // semanas seguidas cumpliendo la meta (la semana en curso cuenta solo si ya la cumpliste)
  function streak() {
    let n = 0;
    const wNow = Math.min(PROG.weekOf(T), PROG.TOTAL_WEEKS);
    for (let w = wNow; w >= 1; w--) {
      const ok = weekDoneCount(w) >= PER_WEEK(w);
      if (ok) n++; else if (w < wNow) break;
    }
    return n;
  }
  function nextWorkout(from) {
    for (let d = from; d <= PROG.END; d = PROG.addDays(d, 1)) { const s = PROG.session(d); if (isWorkout(s) && !isDone(d)) return s; }
    return null;
  }
  // carga sugerida a lo largo del programa para un ejercicio
  // plain = el plan original, sin tus ajustes; se calcula sobre la sesión de gimnasio del calendario
  function loadSeries(idOrIds, plain) {
    const ids = [].concat(idOrIds), pts = [];
    for (let d = PROG.START; d <= PROG.END; d = PROG.addDays(d, 1)) {
      const s = PROG.baseSession(d);
      if (!isWorkout(s)) continue;
      const it = PROG.allItems(s).find((i) => ids.includes(i.id));
      if (!it) continue;
      const l = PROG.loadFor(it.id, d, it.type, plain);
      if (l) pts.push({ x: d, y: l.kg, done: isDone(d), wk: PROG.weekOf(d) });
    }
    // un punto por semana (la carga más alta) para no mezclar días con distinta intensidad
    const byWk = new Map();
    pts.forEach((p) => { const cur = byWk.get(p.wk); if (!cur || p.y > cur.y) byWk.set(p.wk, Object.assign({}, p, { done: p.done || (cur && cur.done) })); else if (p.done) cur.done = true; });
    return [...byWk.values()];
  }

  /* ================= gráficas ================= */
  function lineChart({ series, unit = '', empty, height = 170, yMin = null }) {
    const W = 340, H = height, pl = 36, pr = 16, pt = 14, pb = 24;
    const x0 = PROG.parse(PROG.START).getTime(), x1 = PROG.parse(PROG.END).getTime();
    const X = (s) => pl + ((PROG.parse(s).getTime() - x0) / (x1 - x0)) * (W - pl - pr);
    const pts = series.flatMap((s) => s.points);
    let lo = pts.length ? Math.min(...pts.map((p) => p.y)) : 0, hi = pts.length ? Math.max(...pts.map((p) => p.y)) : 10;
    if (yMin != null) lo = Math.min(lo, yMin);
    if (hi === lo) { hi += 1; lo = Math.max(0, lo - 1); }
    const raw = (hi - lo) / 3, mag = Math.pow(10, Math.floor(Math.log10(raw))), step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((x) => x >= raw);
    lo = Math.floor(lo / step) * step; hi = Math.ceil(hi / step) * step;
    const Y = (v) => pt + (1 - (v - lo) / (hi - lo)) * (H - pt - pb);
    let g = '';
    for (let v = lo; v <= hi + 1e-9; v += step) g += `<line x1="${pl}" x2="${W - pr}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}" class="c-grid"/><text x="${pl - 6}" y="${(Y(v) + 3.5).toFixed(1)}" class="c-ax" text-anchor="end">${+v.toFixed(2)}</text>`;
    [['2026-10-01', 'oct'], ['2026-11-01', 'nov'], ['2026-12-01', 'dic'], ['2027-01-01', 'ene'], ['2027-02-01', 'feb']].forEach(([d, n]) => { g += `<line x1="${X(d).toFixed(1)}" x2="${X(d).toFixed(1)}" y1="${H - pb}" y2="${H - pb + 4}" class="c-axl"/><text x="${(X(d) + 2).toFixed(1)}" y="${H - 8}" class="c-ax">${n}</text>`; });
    g += `<line x1="${pl}" x2="${W - pr}" y1="${H - pb}" y2="${H - pb}" class="c-axl"/>`;
    const tIn = T >= PROG.START && T <= PROG.END;
    if (tIn) g += `<line x1="${X(T).toFixed(1)}" x2="${X(T).toFixed(1)}" y1="${pt}" y2="${H - pb}" class="c-today"/>`;
    series.forEach((s) => {
      const p = s.points.slice().sort((a, b) => (a.x < b.x ? -1 : 1));
      if (!p.length) return;
      // corta la línea donde el ejercicio deja de aparecer más de 2 semanas
      const runs = [[p[0]]];
      for (let i = 1; i < p.length; i++) { if (PROG.diffDays(p[i - 1].x, p[i].x) > 22) runs.push([]); runs[runs.length - 1].push(p[i]); }
      runs.forEach((r) => {
        const d = r.map((q, i) => `${i ? 'L' : 'M'}${X(q.x).toFixed(1)} ${Y(q.y).toFixed(1)}`).join(' ');
        if (r.length > 1) g += `<path d="${d} L${X(r[r.length - 1].x).toFixed(1)} ${H - pb} L${X(r[0].x).toFixed(1)} ${H - pb} Z" class="c-area c-${s.cls}"/>`;
        g += r.length > 1 ? `<path d="${d}" class="c-line c-${s.cls}"/>` : `<circle cx="${X(r[0].x).toFixed(1)}" cy="${Y(r[0].y).toFixed(1)}" r="2.4" class="c-pt c-${s.cls}"/>`;
      });
      if (s.marks) p.forEach((q) => { if (q.done) g += `<circle cx="${X(q.x).toFixed(1)}" cy="${Y(q.y).toFixed(1)}" r="2.6" class="c-pt c-${s.cls}"/>`; });
      const cur = (tIn && p.filter((q) => q.x <= T).pop()) || p[0];
      g += `<circle cx="${X(cur.x).toFixed(1)}" cy="${Y(cur.y).toFixed(1)}" r="4.5" class="c-now c-${s.cls}"/>`;
      g += `<text x="${Math.min(X(cur.x) + 7, W - pr - 30).toFixed(1)}" y="${(Y(cur.y) - 7).toFixed(1)}" class="c-val c-${s.cls}">${+cur.y.toFixed(1)}${unit}</text>`;
      const last = p[p.length - 1], peak = p.reduce((m, q) => (q.y > m.y ? q : m), p[0]);
      if (peak !== cur && X(peak.x) - X(cur.x) > 40) g += `<text x="${(X(peak.x)).toFixed(1)}" y="${(Y(peak.y) - 7).toFixed(1)}" class="c-val c-${s.cls}" text-anchor="middle">${+peak.y.toFixed(1)}${unit}</text>`;
      if (last !== cur && last !== peak) g += `<circle cx="${X(last.x).toFixed(1)}" cy="${Y(last.y).toFixed(1)}" r="2.4" class="c-pt c-${s.cls}"/>`;
    });
    const legend = series.length > 1 ? `<div class="legend">${series.map((s) => `<span><i class="sw sw-${s.cls}"></i>${esc(s.name)}</span>`).join('')}</div>` : '';
    const emptyMsg = !pts.length ? `<div class="c-empty"><p>${esc(empty || 'Sin datos.')}</p></div>` : '';
    return `<div class="chart">${legend}<div class="c-wrap"><svg viewBox="0 0 ${W} ${H}" role="img">${g}</svg>${emptyMsg}</div></div>`;
  }
  function weekBars() {
    const W = 340, H = 130, pl = 22, pr = 6, pt = 10, pb = 22, n = PROG.TOTAL_WEEKS;
    const bw = (W - pl - pr) / n;
    let g = '';
    for (let v = 0; v <= 4; v += 2) { const y = pt + (1 - v / 4) * (H - pt - pb); g += `<line x1="${pl}" x2="${W - pr}" y1="${y}" y2="${y}" class="c-grid"/><text x="${pl - 5}" y="${y + 3.5}" class="c-ax" text-anchor="end">${v}</text>`; }
    for (let w = 1; w <= n; w++) {
      const mon = PROG.addDays(PROG.WEEK1, (w - 1) * 7);
      const planned = PER_WEEK(w), done = Math.min(4, weekDoneCount(w));
      const x = pl + (w - 1) * bw + 2, h = (v) => (v / 4) * (H - pt - pb);
      g += `<rect x="${x.toFixed(1)}" y="${(H - pb - h(planned)).toFixed(1)}" width="${(bw - 4).toFixed(1)}" height="${h(planned).toFixed(1)}" rx="2" class="b-plan${PROG.weekOf(T) === w ? ' b-now' : ''}"/>`;
      if (done) g += `<rect x="${x.toFixed(1)}" y="${(H - pb - h(done)).toFixed(1)}" width="${(bw - 4).toFixed(1)}" height="${h(done).toFixed(1)}" rx="2" class="b-done"/>`;
      if (w === 1 || w % 4 === 0) g += `<text x="${(x + (bw - 4) / 2).toFixed(1)}" y="${H - 8}" class="c-ax" text-anchor="middle">S${w}</text>`;
    }
    return `<div class="chart"><div class="legend"><span><i class="sw sw-done"></i>Completadas</span><span><i class="sw sw-plan"></i>Planeadas</span></div><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Sesiones por semana">${g}</svg></div>`;
  }

  /* ================= vistas ================= */
  const view = () => $('#view');
  let route = { name: 'day', date: T };
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function mountain() {
    const W = 360, H = 120, x0 = PROG.parse(PROG.SURGERY).getTime(), x1 = PROG.parse(PROG.END).getTime();
    const X = (s) => 10 + ((PROG.parse(s).getTime() - x0) / (x1 - x0)) * (W - 20);
    const Y = (x) => { const t = (x - 10) / (W - 20); return H - 20 - (Math.pow(t, 1.35) * 78 + Math.sin(t * 19) * 3 * t + 6); };
    const segs = [{ a: PROG.SURGERY, b: PROG.START, lbl: 'Rehab', cls: 'm-rehab' }].concat(PROG.PHASES.map((p) => ({ a: p.start, b: p.end, lbl: 'F' + p.n, cls: 'm-f' + p.n })));
    let s = '';
    segs.forEach((g) => {
      const xa = X(g.a), xb = X(g.b);
      let d = `M${xa.toFixed(1)} ${H - 20}`;
      for (let x = xa; x <= xb; x += 3) d += ` L${x.toFixed(1)} ${Y(x).toFixed(1)}`;
      d += ` L${xb.toFixed(1)} ${Y(xb).toFixed(1)} L${xb.toFixed(1)} ${H - 20} Z`;
      s += `<path d="${d}" class="${g.cls}"/><text x="${((xa + xb) / 2).toFixed(1)}" y="${H - 6}" class="m-lbl" text-anchor="middle">${g.lbl}</text>`;
    });
    let ridge = '';
    for (let x = 10; x <= W - 10; x += 3) ridge += (ridge ? ' L' : 'M') + `${x.toFixed(1)} ${Y(x).toFixed(1)}`;
    s += `<path d="${ridge}" class="m-ridge"/>`;
    const bx = X(BOX_FROM), bx2 = X(BOX_TO);
    s += `<rect x="${bx.toFixed(1)}" y="${(Y(bx2) - 24).toFixed(1)}" width="${(bx2 - bx).toFixed(1)}" height="4" rx="2" class="m-box"/><text x="${((bx + bx2) / 2).toFixed(1)}" y="${(Y(bx2) - 28).toFixed(1)}" class="m-tick" text-anchor="middle">box</text>`;
    const tx = X(T < PROG.SURGERY ? PROG.SURGERY : T > PROG.END ? PROG.END : T);
    s += `<line x1="${tx}" y1="${Y(tx) - 4}" x2="${tx}" y2="${H - 20}" class="m-now-line"/><circle cx="${tx}" cy="${Y(tx)}" r="5" class="m-now"/><text x="${tx}" y="${Y(tx) - 10}" class="m-now-lbl" text-anchor="middle">Hoy</text>`;
    const ex = X(PROG.END);
    s += `<path d="M${ex} ${Y(ex)} v-16 l10 4 l-10 4" class="m-flag"/><text x="12" y="${H - 26}" class="m-tick">8 may</text><text x="${ex - 4}" y="${Y(ex) - 6}" class="m-tick" text-anchor="end">15 feb</text>`;
    return `<svg class="mountain" viewBox="0 0 ${W} ${H}" role="img" aria-label="Avance desde la cirugía hasta el viaje">${s}</svg>`;
  }

  function boxCard() {
    let title, txt;
    if (T < BOX_FROM) { title = `Regreso al box: faltan ${PROG.diffDays(T, BOX_FROM)} días`; txt = 'Tu doctor estimó que tras 6–8 semanas de actividad el músculo ya se reforzó lo suficiente para cambios de dirección y trabajo más avanzado. La ventana va del 12 al 26 de noviembre.'; }
    else if (T <= BOX_TO) { title = 'Ventana para regresar al box'; txt = 'Ya llevas 6–8 semanas de actividad. Confírmalo con tu doctor en tu próxima consulta y empieza con poco volumen.'; }
    else { title = 'Ventana de 6–8 semanas cumplida'; txt = 'Los cambios de dirección, saltos y trabajo lateral ya están dentro de tu rutina, en progresión.'; }
    const pct = Math.max(0, Math.min(100, Math.round((PROG.diffDays(PROG.START, T) / PROG.diffDays(PROG.START, BOX_TO)) * 100)));
    return `<section class="card box-card">${ico('glove')}<div><span class="eyebrow">6–8 semanas de actividad</span><b>${title}</b><p class="muted small">${txt}</p><div class="bar"><i style="width:${pct}%"></i></div></div></section>`;
  }

  function renderHome() {
    const ph = PROG.phaseOf(T) || (T < PROG.START ? PROG.PHASES[0] : PROG.PHASES[4]);
    const wk = Math.min(Math.max(PROG.weekOf(T), 1), PROG.TOTAL_WEEKS);
    const td = trainingDays(T), tot = totalWorkouts();
    const today = PROG.session(T);
    const nxt = nextWorkout(today && isDone(T) ? PROG.addDays(T, 1) : T);
    const pct = Math.round(Math.min(1, Math.max(0, PROG.diffDays(PROG.START, T) / PROG.diffDays(PROG.START, PROG.END))) * 100);
    const miles = PROG.MILESTONES.filter((m) => m.date >= T).slice(0, 4);
    const p = PROG.getProfile();
    view().innerHTML = `
      <section class="hero">
        <p class="eyebrow">8 MAYO 2026 → 15 FEBRERO 2027</p>
        <h1 class="display">ACL <span class="arrow">→</span> SKI PREP</h1>
        <div class="hero-stats">
          <div><b class="num">${wk}</b><span>Semana de ${PROG.TOTAL_WEEKS}</span></div>
          <div><b class="num">${PROG.diffDays(PROG.SURGERY, T)}</b><span>Días post-op</span></div>
          <div><b class="num">${Math.max(0, PROG.diffDays(T, PROG.END))}</b><span>Días al viaje</span></div>
        </div>
        ${mountain()}
        <div class="phase-row"><span class="chip chip-accent">Fase ${ph.n}</span><b>${esc(ph.name)}</b><span class="muted small">${pct}% del programa</span></div>
        <div class="bar"><i style="width:${pct}%"></i></div>
      </section>
      ${today ? `<a class="card today-card" href="#dia/${T}">
        <div class="today-top"><span class="eyebrow">${today.kind === 'gym' ? 'Te toca' : today.kind === 'extra' ? 'Ya cumpliste tus 3 de la semana' : "Today's workout"} · ${dLong(T)}</span>${isDone(T) ? '<span class="pill pill-ok">Completado</span>' : ''}</div>
        <h2>${esc(today.title)}</h2><p class="muted">${esc(today.sub)}</p>
        ${isWorkout(today) || today.kind === 'extra' ? `<div class="meta-row">${piste(today.level, true)}<span>≈${today.duration} min</span>${today.deload ? '<span class="chip">Descarga</span>' : ''}</div><span class="btn btn-primary btn-block">${isDone(T) ? 'Ver entrenamiento' : 'Empezar entrenamiento'}</span>` : ''}
      </a>` : ''}
      <div class="grid-2">
        <div class="card stat"><span class="eyebrow">Días entrenados</span><b class="num big">${td.done}<small>/${tot}</small></b><span class="muted small">${td.planned ? Math.round((td.done / td.planned) * 100) : 0}% de lo planeado a hoy</span></div>
        <div class="card stat"><span class="eyebrow">Esta semana</span><b class="num big">${weekDoneCount(wk)}<small>/${PER_WEEK(wk)}</small></b><span class="muted small">${cardioCount(wk) ? `+ ${cardioCount(wk)} de cardio · ` : ''}Racha: ${streak()} ${streak() === 1 ? 'semana' : 'semanas'} con la meta</span></div>
      </div>
      ${boxCard()}
      ${impactCard()}
      ${nxt && nxt.date !== T ? `<a class="card next-card" href="#dia/${nxt.date}"><span class="eyebrow">Después te toca</span><div class="next-row"><b>${esc(nxt.title)}</b>${piste(nxt.level)}</div><span class="muted small">Sugerido el ${dLong(nxt.date).toLowerCase()} · o el día que puedas ir</span></a>` : ''}
      <section class="card"><span class="eyebrow">Objetivo de la fase ${ph.n}</span><h3>${esc(ph.name)}</h3>
        <ul class="ticks">${ph.goal.map((g) => `<li>${esc(g)}</li>`).join('')}</ul><p class="muted small">${esc(ph.focus)}</p></section>
      <section class="card"><span class="eyebrow">Próximos hitos</span>
        <ol class="miles">${miles.map((m) => `<li class="mile mile-${m.kind}"><span class="mile-date num">${dShort(m.date)}</span><span>${esc(m.title)}</span></li>`).join('')}</ol></section>
      <a class="card link-card wide-link" href="#fases">${ico('mountain')}<b>Fases del programa</b><span class="muted small">Qué ejercicios hay en cada fase y cómo cambian: piernas de esquiador y torso</span></a>
      <div class="grid-2">
        <a class="card link-card" href="#ski">${ico('mountain')}<b>Ski readiness</b><span class="muted small">Capacidades y avance</span></a>
        <a class="card link-card" href="#sabado">${ico('sun')}<b>Recovery Saturday</b><span class="muted small">Opciones suaves</span></a>
      </div>
      <a class="card profile-card" href="#ajustes">${ico('weight')}<span><b>${p.weight} kg · ${(p.height / 100).toFixed(2)} m</b><span class="muted small">Los pesos sugeridos se calculan con estos datos</span></span></a>
      <p class="disclaimer">No sustituye tu rehabilitación. Si la rodilla duele, se inflama o se siente inestable, detente y consulta con tu doctor.</p>`;
  }

  /* ---------- calendario ---------- */
  let calMode = 'week';
  let calCursor = T < PROG.START ? PROG.START : T > PROG.END ? PROG.END : T;
  const mondayOf = (s) => { const d = PROG.parse(s); return PROG.addDays(s, -((d.getDay() + 6) % 7)); };
  function dayStatus(date) {
    const s = PROG.session(date);
    if (!s) return '';
    if (s.kind === 'rest' || s.kind === 'off') return date < T ? 'rest' : date === T ? 'today' : 'rest';
    if (isDone(date)) return 'done';
    if (date === T) return 'today';
    if (date < T) return isWorkout(s) || s.kind === 'extra' || s.kind === 'cardio' ? 'missed' : 'rest';
    return 'pending';
  }
  const STATUS_TXT = { done: 'Completado', today: 'Hoy', missed: 'A medias', pending: 'Sugerido', rest: '' };
  function renderCalendar() {
    let body = '';
    if (calMode === 'week') {
      const mon = mondayOf(calCursor), wk = PROG.weekOf(mon);
      body += `<div class="cal-nav"><button class="icon-btn" data-act="cal-prev" aria-label="Semana anterior">‹</button><b>Semana ${wk} · ${dShort(mon)} – ${dShort(PROG.addDays(mon, 6))}</b><button class="icon-btn" data-act="cal-next" aria-label="Semana siguiente">›</button></div>`;
      body += `<div class="banner"><span>Semana ${wk}: <b>${weekDoneCount(wk)} de ${PER_WEEK(wk)}</b> sesiones de fuerza${cardioCount(wk) ? ` · ${cardioCount(wk)} de cardio` : ''}. Los días futuros son una sugerencia: ve cuando puedas y la app te da la siguiente en orden (A → B → C).</span></div>`;
      if (PROG.DELOAD_WEEKS.includes(wk)) body += '<div class="banner">Semana de descarga: una serie menos y cargas ~15% más bajas.</div>';
      const stIn = PROG.IMPACT.find((x) => x.n && x.from >= mon && x.from <= PROG.addDays(mon, 6));
      if (stIn) body += `<a class="banner banner-dyn" href="#impacto">${ico('jump')}<span>Ruta de impacto · etapa ${stIn.n}: ${esc(stIn.name.toLowerCase())}, si pasas la prueba.</span></a>`;
      body += '<div class="week-list">';
      for (let i = 0; i < 7; i++) {
        const d = PROG.addDays(mon, i), s = PROG.session(d), st = dayStatus(d);
        if (!s) { body += `<div class="day-row day-out"><div class="day-date"><span>${DOW3[(i + 1) % 7]}</span><b class="num">${PROG.parse(d).getDate()}</b></div><span class="muted">Fuera del programa</span></div>`; continue; }
        body += `<a class="day-row st-${st} kind-${s.kind}" href="#dia/${d}">
          <div class="day-date"><span>${DOW3[s.dow]}</span><b class="num">${PROG.parse(d).getDate()}</b></div>
          <div class="day-main"><b>${esc(s.title)}</b>
            <div class="meta-row small">${s.level ? piste(s.level, true) : ''}${s.duration ? `<span>${s.duration} min</span>` : ''}${s.where === 'home' ? '<span class="tag tag-home">Casa</span>' : ''}${(s.imp || []).concat(s.cond || []).some((i) => EX.BY[i.id].auth) ? '<span class="tag tag-dyn">Impacto</span>' : ''}${s.muscles.slice(0, 3).map((m) => `<span class="tag">${EX.TAG_ES[m]}</span>`).join('')}</div></div>
          <span class="status st-${st}">${st === 'done' ? ico('check') : ''}${STATUS_TXT[st] || ''}</span></a>`;
      }
      body += '</div>';
    } else {
      const d0 = PROG.parse(calCursor), y = d0.getFullYear(), m = d0.getMonth();
      const first = PROG.fmt(new Date(y, m, 1)), days = new Date(y, m + 1, 0).getDate();
      body += `<div class="cal-nav"><button class="icon-btn" data-act="cal-prev" aria-label="Mes anterior">‹</button><b>${MONL[m]} ${y}</b><button class="icon-btn" data-act="cal-next" aria-label="Mes siguiente">›</button></div>`;
      body += '<div class="month"><div class="month-head">' + ['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((x) => `<span>${x}</span>`).join('') + '</div><div class="month-grid">';
      for (let i = 0; i < (PROG.parse(first).getDay() + 6) % 7; i++) body += '<span class="mcell empty"></span>';
      for (let i = 1; i <= days; i++) {
        const d = PROG.fmt(new Date(y, m, i)), s = PROG.session(d), st = dayStatus(d);
        if (!s) { body += `<span class="mcell out"><b class="num">${i}</b></span>`; continue; }
        body += `<a class="mcell st-${st} kind-${s.kind}${d === T ? ' is-today' : ''}" href="#dia/${d}" aria-label="${dLong(d)}: ${esc(s.title)}"><b class="num">${i}</b><i class="dot"></i>${st === 'done' ? '<i class="tick">✓</i>' : ''}</a>`;
      }
      body += '</div></div><div class="legend"><span><i class="dot kind-gym"></i>Sesión A/B/C</span><span><i class="dot kind-extra"></i>Extra</span><span><i class="dot kind-cardio"></i>Cardio</span><span><i class="dot kind-recovery"></i>Recuperación</span><span><i class="dot kind-rest"></i>Descanso</span><span>✓ Completado</span></div>';
    }
    view().innerHTML = `<header class="page-head"><h1 class="display">Calendario</h1>${calSeg(calMode)}</header>${body}`;
  }


  /* ---------- fases ---------- */
  const PHASE_STORY = {
    1: { legs: 'Base de fuerza: cuádriceps, isquios y glúteo con bajada lenta, unilateral con apoyo y equilibrio estático.', torso: 'Máquinas y mancuernas a 10–12 reps para recuperar volumen de trabajo en pecho, espalda y hombros.' },
    2: { legs: 'Más carga y unilateral sin apoyo. Desde la semana 8, ruta de impacto: cuerda, pogos, aterrizajes y trote–caminata (con prueba). Ventana para regresar al box.', torso: 'Mancuernas y lagartijas a 8–10 reps con más series para ganar músculo.' },
    3: { legs: 'Excéntricos de 4 s (esquiar es frenar con las piernas), búlgaras, Copenhagen, trote continuo y saltos laterales a dos pies.', torso: 'Fuerza real a 6–8 reps: press, remo, jalón, brazos y Turkish get-up.' },
    4: { legs: 'Específico de esquí: saltos a una pierna con freno, ski hops, giros, intervalos de carrera y resistencia en postura de esquí.', torso: 'Mantener la fuerza a 6–8 reps y core anti-rotación para estabilidad en la pista.' },
    5: { legs: 'Puesta a punto: mismos patrones con menos volumen para llegar fresco al viaje.', torso: 'Volumen bajo para conservar lo ganado sin cansarte.' }
  };
  const LEG_TAGS = ['quads', 'hams', 'glutes'];
  const LATERAL = ['lateral_step_down', 'lateral_step_up', 'lateral_lunge', 'ski_hold', 'band_lateral_walk', 'monster_walk', 'band_abduction', 'copenhagen', 'hip_abductor', 'hip_adductor', 'side_lying_raise'];
  const LEG_PATTERNS = ['Rodilla · cuádriceps', 'Cadera · isquios y glúteo', 'Unilateral', 'Lateral y postura de esquí', 'Equilibrio y control', 'Dinámico · esquí', 'Pantorrilla y tobillo', 'Acondicionamiento'];
  const TORSO_PATTERNS = ['Empuje · pecho', 'Tirón · espalda', 'Hombros', 'Brazos', 'Core y cargas'];
  function patternOf(e) {
    const t = e.tags, first = t[0];
    if (e.auth) return 'Dinámico · esquí';
    if (e.id.startsWith('bike')) return 'Acondicionamiento';
    if (LATERAL.includes(e.id)) return 'Lateral y postura de esquí';
    if (t.includes('balance') && !t.some((x) => LEG_TAGS.includes(x))) return 'Equilibrio y control';
    if (e.uni && t.some((x) => LEG_TAGS.includes(x))) return 'Unilateral';
    if (first === 'hams' || first === 'glutes') return 'Cadera · isquios y glúteo';
    if (first === 'quads') return 'Rodilla · cuádriceps';
    if (first === 'calves') return 'Pantorrilla y tobillo';
    if (first === 'chest' || first === 'triceps' && t.includes('chest')) return 'Empuje · pecho';
    if (first === 'back') return 'Tirón · espalda';
    if (first === 'shoulders') return 'Hombros';
    if (first === 'biceps' || first === 'triceps') return 'Brazos';
    return 'Core y cargas';
  }
  const phaseCache = {};
  function phaseExercises(n) {
    if (phaseCache[n]) return phaseCache[n];
    const ph = PROG.PHASES[n - 1], map = new Map();
    for (let d = ph.start; d <= ph.end; d = PROG.addDays(d, 1)) {
      const s = PROG.planSession(d);
      if (!isWorkout(s)) continue;
      PROG.allItems(s).forEach((it) => {
        let r = map.get(it.id);
        if (!r) { r = { id: it.id, days: new Set(), first: d, peak: d, type: it.type, rx: it.rx, peakKg: -1 }; map.set(it.id, r); }
        r.days.add(s.type);
        const l = PROG.loadFor(it.id, d, it.type);
        if (l && l.kg > r.peakKg) { r.peakKg = l.kg; r.peak = d; r.type = it.type; }
      });
    }
    return (phaseCache[n] = map);
  }
  let phaseSel = (PROG.phaseOf(T) || PROG.PHASES[0]).n;
  function pxCard(r, n, isNew) {
    const e = EX.BY[r.id];
    const a = PROG.loadFor(r.id, r.first, r.type), b = PROG.loadFor(r.id, r.peak, r.type);
    const load = a ? (a.kg === b.kg ? a.label : `${a.kg} → ${b.kg} kg · ${a.lb} → ${b.lb} lb`) : '';
    const days = 'Sesión ' + ['A', 'B', 'C'].filter((x) => r.days.has(x)).join(', ');
    return `<button class="px" data-act="ex" data-id="${r.id}"><span class="item-thumb">${thumb(r.id)}</span><span><b>${esc(e.n)}${isNew ? `<span class="badge-new${e.auth ? ' badge-dyn' : ''}">${e.auth ? 'Dinámico' : 'Nuevo'}</span>` : ''}</b>
      <span class="muted small">${esc(days)} · ${esc(r.rx.s + ' × ' + r.rx.r)}</span>${load ? `<span class="small load-txt">${esc(load)}</span>` : ''}</span></button>`;
  }
  function trackHTML(n, patterns, icon, title, lead) {
    const cur = phaseExercises(n), prev = n > 1 ? phaseExercises(n - 1) : null;
    let html = `<section class="card"><div class="track-head">${ico(icon)}<h2>${title}</h2></div><p class="small track-lead">${esc(lead)}</p>`;
    patterns.forEach((pat) => {
      const list = [...cur.values()].filter((r) => patternOf(EX.BY[r.id]) === pat);
      if (!list.length) return;
      html += `<div class="pat"><div class="pat-name">${pat}</div>${list.map((r) => pxCard(r, n, prev && !prev.has(r.id))).join('')}</div>`;
    });
    if (prev) {
      const gone = [...prev.keys()].filter((id) => !cur.has(id) && patterns.includes(patternOf(EX.BY[id])));
      if (gone.length) html += `<p class="gone"><b>Sale de la rutina:</b> ${gone.map((id) => esc(EX.BY[id].n)).join(', ')}</p>`;
    }
    return html + '</section>';
  }
  function evolutionHTML(patterns) {
    return patterns.map((pat) => {
      const steps = PROG.PHASES.map((ph) => {
        const names = [...phaseExercises(ph.n).values()].filter((r) => patternOf(EX.BY[r.id]) === pat).map((r) => EX.BY[r.id].n);
        return `<span class="num">F${ph.n}</span><span>${names.length ? esc(names.slice(0, 4).join(' · ')) + (names.length > 4 ? ` +${names.length - 4}` : '') : '<span class="muted">—</span>'}</span>`;
      }).join('');
      return `<div class="evo-row"><b>${pat}</b><div class="evo-steps">${steps}</div></div>`;
    }).join('');
  }
  function renderPhases() {
    const n = phaseSel, ph = PROG.PHASES[n - 1], story = PHASE_STORY[n], nowN = (PROG.phaseOf(T) || {}).n;
    const rxM = { 1: '10–12', 2: '8–10', 3: '6–8', 4: '5–6', 5: '5' }[n];
    view().innerHTML = `<header class="page-head"><h1 class="display">Calendario</h1>${calSeg('phases')}</header>
      <div class="phase-tabs">${PROG.PHASES.map((p) => `<button class="${p.n === n ? 'on' : ''}${p.n === nowN ? ' now' : ''}" data-act="phase" data-n="${p.n}"><b>F${p.n}</b><span>${esc(p.short)}</span></button>`).join('')}</div>
      <section class="card phase-hero"><span class="eyebrow">Fase ${n} · ${dShort(ph.start)} – ${dShort(ph.end)}</span><h2>${esc(ph.name)}</h2>
        <ul class="ticks">${ph.goal.map((g) => `<li>${esc(g)}</li>`).join('')}</ul>
        <div class="rx-chips"><span class="chip">Principales ${rxM} reps</span><span class="chip">${esc(ph.focus.split('·').slice(-1)[0].trim())}</span>${n === 2 ? '<span class="chip chip-accent">Semana 8: dinámico</span>' : ''}</div></section>
      ${trackHTML(n, LEG_PATTERNS, 'mountain', 'Piernas · plan de esquiador', story.legs)}
      ${trackHTML(n, TORSO_PATTERNS, 'weight', 'Torso · físico', story.torso)}
      <section class="card"><h2>Cómo cambia cada patrón</h2><p class="muted small">De F1 a F5: los ejercicios se vuelven más unilaterales, más pesados y más parecidos al esquí.</p>
        <h3>Piernas</h3><div class="evo">${evolutionHTML(LEG_PATTERNS)}</div>
        <h3>Torso</h3><div class="evo">${evolutionHTML(TORSO_PATTERNS)}</div></section>`;
  }
  const calSeg = (mode) => `<div class="seg" role="tablist"><button role="tab" class="${mode === 'week' ? 'on' : ''}" data-act="cal-mode" data-mode="week">Semana</button><button role="tab" class="${mode === 'month' ? 'on' : ''}" data-act="cal-mode" data-mode="month">Mes</button><button role="tab" class="${mode === 'phases' ? 'on' : ''}" data-act="cal-mode" data-mode="phases">Fases</button></div>`;

  /* ---------- día / today's workout ---------- */
  const isLegUni = (ex) => ex.uni && ex.tags.some((t) => ['quads', 'hams', 'glutes'].includes(t));
  const rxParts = (rx, ex) => [rx.iv && (/×/.test(rx.r) || rx.iv.n === 1) ? rx.r : `${rx.s} × ${rx.r}`].concat(rx.rpe ? [`RPE ${rx.rpe}`] : [], rx.tempo && ex.unit === 'reps' ? [`Tempo ${rx.tempo}`] : []);
  const ADJ_TXT = { up: '↑ subió por tu "Fácil"', hold: '= mismo peso por tu "Pesado"', down: '↓ bajó por dos "Pesado"', pain: '↓ bajó por molestia', real: 'ajustado a tu peso real' };
  const FB = [['easy', 'Fácil'], ['ok', 'Bien'], ['hard', 'Pesado'], ['pain', 'Molestia']];
  const timed = (it) => !!(it.rx.iv || EX.BY[it.id].unit === 'time');
  const fbOf = (date, code) => (ST.fb[date] || {})[code] || null;

  function fbHint(item, f) {
    if (!f || !f.r) return '';
    const ladder = !item.load;
    if (f.r === 'pain') return `Próxima vez: ${ladder ? 'variante más fácil' : 'unos 10 % menos'}. Si la molestia sigue mañana, semáforo amarillo y consúltalo con tu fisio.`;
    if (f.r === 'easy') return ladder ? 'Dos "Fácil" seguidos y pasas a una variante más difícil.' : 'Próxima vez: un escalón más de peso.';
    if (f.r === 'hard') return ladder ? 'Dos "Pesado" seguidos y bajas de variante.' : 'Próxima vez: mismo peso. Dos "Pesado" seguidos bajan ~5 %.';
    return 'Sigue la progresión del plan.';
  }
  function fbRow(item, date) {
    const f = fbOf(date, item.code);
    const kg = f && f.kg ? f.kg : item.load ? item.load.kg : null;
    return `<div class="fb-row"><span class="fb-q">¿Cómo te fue?</span><div class="fb-btns">${FB.map(([k, n]) => `<button class="fb-b fb-${k} ${f && f.r === k ? 'on' : ''}" data-act="fb" data-date="${date}" data-code="${item.code}" data-r="${k}">${n}</button>`).join('')}</div>
      ${item.load ? `<div class="fb-kg"><span class="small muted">Usé</span><button class="icon-btn sm" data-act="kg" data-date="${date}" data-code="${item.code}" data-d="-1" aria-label="Menos peso">−</button><b class="num">${kg} kg</b><button class="icon-btn sm" data-act="kg" data-date="${date}" data-code="${item.code}" data-d="1" aria-label="Más peso">+</button></div>` : ''}
      ${f && f.r ? `<p class="fb-hint small">${esc(fbHint(item, f))}</p>` : ''}</div>`;
  }

  function itemCard(item, date, opts = {}) {
    const ex = EX.BY[item.id];
    const done = checked(date, item.code);
    const load = item.load;
    const notes = [];
    if (item.from) notes.push(`En lugar de: ${EX.BY[item.from].n}${item.noBand ? ' (en el gym no hay bandas)' : ''}`);
    if (item.swappedFrom) notes.push(`Lo cambiaste (antes: ${EX.BY[item.swappedFrom].n})`);
    if (item.laddered) notes.push(item.laddered === 'up' ? `Subiste de variante por tus "Fácil" (antes: ${EX.BY[item.ladderFrom].n})` : `Variante más fácil por tu última respuesta (antes: ${EX.BY[item.ladderFrom].n})`);
    if (item.pain) notes.push(`Molestia reciente: usa la regresión si hace falta (${ex.reg})`);
    if (item.painAlt) notes.push('Alternativa por la molestia que marcaste: 2 semanas');
    return `<div class="item ${done ? 'is-done' : ''}">
      <button class="item-main" data-act="ex" data-id="${item.id}" data-date="${date}" data-code="${item.code}">
        <span class="item-thumb">${thumb(item.id)}</span>
        <span class="item-txt"><span class="item-top"><span class="code">${esc(opts.label || item.code)}</span>${ex.uni ? '<span class="tag tag-uni">Unilateral</span>' : ''}${ex.sp ? `<span class="tag tag-sp">${ico('star')}Clave</span>` : ''}${item.rx.xl ? '<span class="tag tag-xl">+1 serie izquierda</span>' : ''}</span>
        <b>${esc(ex.n)}</b><span class="rx">${rxParts(item.rx, ex).map((x) => `<span class="nw">${esc(x)}</span>`).join(' · ')}</span>
        ${load ? `<span class="load">${ico('weight')}${esc(load.label)}${isLegUni(ex) ? ' · mismo peso en ambas piernas' : ''}</span>${load.adj && ADJ_TXT[load.adj] ? `<span class="adj">${esc(ADJ_TXT[load.adj])}</span>` : ''}` : ''}
        ${item.note ? `<span class="note">${esc(item.note)}</span>` : ''}${notes.map((n) => `<span class="note note-adj">${esc(n)}</span>`).join('')}${opts.extra || ''}</span>
      </button>
      <div class="item-side">${timed(item) ? `<button class="go" data-act="go" data-date="${date}" data-code="${item.code}" aria-label="Iniciar temporizador de ${esc(ex.n)}">${ico('play')}</button>` : ''}<button class="check ${done ? 'on' : ''}" data-act="check" data-date="${date}" data-key="${item.code}" aria-pressed="${done}" aria-label="Marcar ${esc(ex.n)} como hecho">${ico('check')}</button></div>
      ${done ? fbRow(item, date) : ''}</div>`;
  }
  const findItem = (date, code) => { const s = PROG.session(date); return s ? PROG.allItems(s).find((i) => i.code === code) : null; };

  const KNEE = `<details class="knee-guide"><summary><span class="lights"><i class="g"></i><i class="y"></i><i class="r"></i></span><span><b>Semáforo de rodilla</b><span class="muted small">Revísalo antes de empezar</span></span></summary>
    <p><i class="g"></i><span><b>Verde.</b> Sin dolor significativo, sin inflamación y sin inestabilidad: entrena normal.</span></p>
    <p><i class="y"></i><span><b>Amarillo.</b> Molestia, fatiga o respuesta inusual: no subas pesos hoy, baja volumen y vigila.</span></p>
    <p><i class="r"></i><span><b>Rojo.</b> Dolor significativo, inflamación, inestabilidad o pérdida de movimiento: <b>DETÉN EL EJERCICIO Y CONSULTA CON TU PROFESIONAL DE SALUD.</b></span></p></details>`;

  const DURS = [20, 30, 45, 60];
  function dayOpts(s) {
    const o = ST.days[s.date] || {};
    const pick = o.pick || '', canPick = s.date >= T && !ST.log[s.date];
    return `<section class="day-opts card">
      ${canPick ? `<div class="opt-row"><span class="eyebrow">Hoy hago</span><div class="seg seg-3" role="group" aria-label="Qué haces hoy"><button class="${!pick ? 'on' : ''}" data-act="pick" data-date="${s.date}" data-v="">Fuerza</button><button class="${pick === 'Y' ? 'on' : ''}" data-act="pick" data-date="${s.date}" data-v="Y">Cardio</button><button class="${pick === 'X' ? 'on' : ''}" data-act="pick" data-date="${s.date}" data-v="X">Extra</button></div></div>` : ''}
      <div class="opt-row"><span class="eyebrow">Dónde</span><div class="seg seg-2" role="group" aria-label="Dónde entrenas"><button class="${s.where === 'gym' ? 'on' : ''}" data-act="where" data-date="${s.date}" data-v="gym">Gimnasio</button><button class="${s.where === 'home' ? 'on' : ''}" data-act="where" data-date="${s.date}" data-v="home">${ico('home')}Casa</button></div></div>
      <div class="opt-row"><span class="eyebrow">Tiempo</span><div class="dur-chips" role="group" aria-label="Tiempo disponible">${DURS.map((m) => `<button class="chipf ${o.min === m ? 'on' : ''}" data-act="dur" data-date="${s.date}" data-v="${m}" ${m >= s.full ? 'disabled' : ''}>${m}</button>`).join('')}<button class="chipf ${!o.min ? 'on' : ''}" data-act="dur" data-date="${s.date}" data-v="">75 máx</button></div></div>
      ${s.where === 'home' ? '<p class="small muted opt-note">En casa: cada ejercicio cambió por uno del mismo patrón con peso corporal o bandas. Sin peso, la intensidad sale del tempo lento: llega a RPE 8.</p>' : ''}
      ${o.min ? `<p class="small muted opt-note">Recortado de ${s.full} a ~${s.duration} min: primero bajan series y salen accesorios pequeños; el cuádriceps, un empuje y un tirón siempre se quedan.</p>` : s.full > s.duration ? `<p class="small muted opt-note">El plan completo de hoy suma ~${s.full} min; se acotó a ${s.duration} (tu máximo es 1:15) quitando accesorios pequeños.</p>` : ''}
    </section>`;
  }

  function gateBox(st, inline) {
    const g = ST.gates[st.id] || {}, checks = g.checks || [];
    const open = st.early || T >= PROG.addDays(st.from, -7);
    return `<div class="gate ${g.date ? 'gate-ok' : ''}">${inline ? `<span class="eyebrow">Prueba para avanzar · etapa ${st.n}</span><b>${esc(st.name)}</b>` : ''}
      ${g.date ? `<p class="pill pill-ok">${ico('check')}Aprobada el ${dShort(g.date)}</p>` : ''}
      ${st.gate.map((q, i) => `<label class="gate-q ${open ? '' : 'locked'}"><button class="check sm ${checks[i] ? 'on' : ''}" data-act="gate" data-st="${st.id}" data-i="${i}" ${open ? '' : 'disabled'} aria-pressed="${!!checks[i]}">${ico('check')}</button><span>${esc(q)}</span></label>`).join('')}
      ${!open ? `<p class="small muted">Se abre el ${dShort(PROG.addDays(st.from, -7))}.</p>` : g.date ? '' : '<p class="small muted">Marca todo y la etapa entra en tu rutina. Si algo no se cumple, sigues en la etapa actual y lo intentas la próxima semana.</p>'}</div>`;
  }

  function renderDay(date) {
    const s = PROG.session(date);
    if (!s) {
      const target = date < PROG.START ? PROG.START : PROG.END;
      view().innerHTML = `<header class="page-head"><h1 class="display">Today's workout</h1></header><div class="card empty"><p>${date < PROG.START ? 'El programa empieza el jueves 1 de octubre de 2026.' : 'El programa terminó el 15 de febrero de 2027.'}</p><a class="btn btn-primary" href="#dia/${target}">Ir al ${date < PROG.START ? 'primer' : 'último'} día</a></div>`;
      return;
    }
    const prevD = PROG.addDays(date, -1), nextD = PROG.addDays(date, 1);
    const nav = `<div class="day-nav">${PROG.inProgram(prevD) ? `<a class="icon-btn" href="#dia/${prevD}" aria-label="Día anterior">‹</a>` : '<span></span>'}<span class="muted small">${date === T ? '' : `<a href="#hoy" class="mini-link">Ir a hoy</a> · `}Fase ${s.phase} · Semana ${s.week}</span>${PROG.inProgram(nextD) ? `<a class="icon-btn" href="#dia/${nextD}" aria-label="Día siguiente">›</a>` : '<span></span>'}</div>`;
    const head = `<header class="page-head day-head"><p class="eyebrow">${date === T ? "Today's workout" : 'Entrenamiento'} · ${dLong(date)}</p><h1 class="display">${esc(s.title)}</h1><p class="muted">${esc(s.sub)}</p></header>`;
    if (s.kind === 'recovery') { view().innerHTML = nav + head + recoveryBody(date); return; }
    if (s.kind === 'rest' || s.kind === 'off') {
      const nx = nextWorkout(date > T ? date : T);
      view().innerHTML = nav + head + `<div class="card"><p>${date < T ? 'No entrenaste este día. Sin problema: la siguiente sesión te espera en orden.' : 'Sin sesión sugerida. Si este día sí puedes ir, abre la app ese día y te da tu siguiente sesión.'}</p>${nx ? `<p class="muted small">Siguiente en orden: <b>${esc(nx.title)}</b></p>` : ''}
        <button class="btn btn-ghost btn-block" data-act="${date < T ? 'logcardio' : 'pick'}" data-date="${date}" data-v="Y">${ico('jump')}${date < T ? '¿Hiciste cardio? Regístralo' : 'Planear cardio este día'}</button></div>`;
      return;
    }
    if (s.kind === 'travel') {
      view().innerHTML = nav + head + '<div class="banner banner-pro"><b>EVALUACIÓN FINAL POR TRAUMATÓLOGO/FISIOTERAPEUTA ANTES DE REGRESAR AL ESQUÍ.</b></div><div class="card"><p>Llegaste al final del programa. Revisa tu <a href="#ski">Ski readiness</a> y tu <a href="#progreso">avance</a>. ¡Buen viaje!</p></div>';
      return;
    }
    const mainRx = s.blocks[0] && s.blocks[0].items[0] ? s.blocks[0].items[0].rx : null;
    const items = PROG.allItems(s);
    const nDone = items.filter((i) => checked(date, i.code)).length;
    let html = nav + head;
    html += `<div class="meta-strip">${piste(s.level, true)}<span>${ico('timer')}≈${s.duration} min</span>${mainRx && mainRx.rpe ? `<span>RPE ${mainRx.rpe}</span>` : ''}${s.deload ? '<span class="chip">Descarga</span>' : ''}${s.where === 'home' ? `<span class="chip">${ico('home')}Casa</span>` : ''}</div>`;
    html += `<div class="day-progress"><div class="bar"><i style="width:${Math.round((nDone / items.length) * 100)}%"></i></div><span class="small muted num">${nDone}/${items.length}</span></div>`;
    const pain = recentPain(date);
    if (pain) html += `<div class="banner banner-yellow"><span><b>Marcaste molestia el ${dShort(pain)}.</b> Revisa el semáforo: si sigue, hoy no subas pesos y consúltalo con tu fisio.</span></div>`;
    const due = date === T ? PROG.gateDue(date) : null;
    if (due) html += `<section class="card gate-card">${gateBox(due, true)}<a class="mini-link small" href="#impacto">Ver la ruta de impacto completa</a></section>`;
    if (s.kind === 'cardio') html += `<div class="banner"><span><b>Para aguantar el ritmo.</b> Intervalos primero (▶ marca los cambios) y luego base aeróbica a ritmo de conversación: podrías hablar en frases, no cantar. Cuenta aparte de tus 3 de fuerza. Si la rodilla molesta al día siguiente, baja la intensidad.</span></div>`;
    else if (s.kind === 'extra') html += `<div class="banner">Opcional: ya hiciste tus ${weekDoneCount(s.week)} sesiones de la semana. Hazlo solo si te sientes bien; descansar también suma. También puedes elegir una opción de <a href="#sabado">recuperación</a>.</div>`;
    else if (date >= T && s.kind === 'gym') html += `<p class="muted small type-note">Te toca la <b>${esc(s.title.split('·')[0].trim())}</b> por orden (A → B → C), el día que vayas. Esta semana llevas ${weekDoneCount(s.week)} de ${PER_WEEK(s.week)}.</p>`;
    if (!s.short) html += dayOpts(s);
    html += KNEE;
    const warm = s.warmShort ? s.warmup.slice(0, 3) : s.warmup;
    html += `<section class="block"><div class="block-head"><h2>Calentamiento</h2><span class="muted small">${s.warmShort ? '5' : '8–10'} min</span></div><div class="warm">${warm.map((w, i) => {
      const k = 'w' + i, on = checked(date, k);
      return `<div class="warm-row ${on ? 'is-done' : ''}"><button class="check sm ${on ? 'on' : ''}" data-act="check" data-date="${date}" data-key="${k}" aria-pressed="${on}" aria-label="Marcar ${esc(w.n)}">${ico('check')}</button><button class="warm-txt" data-act="ex" data-id="${w.id}"><b>${esc(w.n)}</b><span>${esc(w.dose)}</span></button></div>`;
    }).join('')}</div></section>`;
    if (s.imp.length) {
      const st = PROG.IMPACT[s.stage];
      html += `<section class="block block-dyn"><div class="block-head"><h2>${ico('jump')}Impacto</h2><a class="muted small" href="#impacto">Etapa ${st.n} · ${esc(st.name)}</a></div>
        <p class="small dyn-note">Con las piernas frescas, justo después del calentamiento. Aterrizajes suaves y silenciosos. Si algo molesta, márcalo y la app te da la alternativa.</p>
        ${s.imp.map((it) => itemCard(it, date, { extra: it.alt ? `<span class="alt">Alternativa: ${esc(EX.BY[it.alt].n)}</span>` : '' })).join('')}</section>`;
    }
    s.blocks.forEach((b) => {
      const sets = Math.max(...b.items.map((i) => i.rx.s));
      const restSec = PROG.restSecOf(b.items[0].rx.rest) || 60;
      const n = ((ST.rounds[date] || {})[b.code]) || 0;
      const btn = n >= sets
        ? `<button class="rest-btn rest-done" data-act="round-reset" data-date="${date}" data-block="${b.code}">${ico('check')}Bloque listo</button>`
        : `<button class="rest-btn" data-act="round" data-date="${date}" data-block="${b.code}" data-sec="${restSec}" data-sets="${sets}">${ico('timer')}Vuelta ${n + 1}/${sets} hecha · ${esc(b.items[0].rx.rest)}</button>`;
      html += `<section class="block"><div class="block-head"><h2>Bloque ${b.code}</h2>${btn}</div>
        <p class="muted small block-hint">Alterna ${b.items.map((i) => i.code).join(' → ')}; al terminar cada vuelta toca el botón y arranca el descanso.</p>${b.items.map((it) => itemCard(it, date)).join('')}</section>`;
    });
    if (s.ski.length) html += `<section class="block block-ski"><div class="block-head"><h2>${ico('mountain')}SKI PREP</h2><span class="muted small">Bajo impacto</span></div>${s.ski.map((it) => itemCard(it, date)).join('')}</section>`;
    if (s.cond.length) html += `<section class="block block-dyn"><div class="block-head"><h2>${ico('jump')}Cardio</h2><span class="muted small">Al final · ▶ marca los cambios</span></div>${s.cond.map((it) => itemCard(it, date, { extra: it.alt ? `<span class="alt">Alternativa: ${esc(EX.BY[it.alt].n)}</span>` : '' })).join('')}</section>`;
    html += `<div class="finish">${isDone(date)
      ? `<div class="pill pill-ok big">${ico('check')}Sesión completada</div><button class="btn btn-ghost" data-act="undo-finish" data-date="${date}">Marcar como pendiente</button>`
      : `<button class="btn btn-primary btn-block" data-act="finish" data-date="${date}">Terminar sesión</button>`}</div>`;
    view().innerHTML = html;
  }
  function recentPain(date) {
    let last = null;
    Object.keys(ST.fb).forEach((d) => { if (d < date && PROG.diffDays(d, date) <= 3 && Object.values(ST.fb[d]).some((f) => f && f.r === 'pain')) last = !last || d > last ? d : last; });
    return last;
  }

  /* ---------- ruta de impacto ---------- */
  function impactCard() {
    const k = PROG.stageAt(T), cur = PROG.IMPACT[k], nx = PROG.IMPACT[k + 1];
    return `<a class="card link-card wide-link impact-card" href="#impacto">${ico('jump')}<b>Ruta de impacto · etapa ${cur.n}: ${esc(cur.name)}</b><span class="muted small">${nx ? `Siguiente: ${esc(nx.name.toLowerCase())} desde el ${dShort(nx.from)}${(ST.gates[nx.id] || {}).date ? ' · prueba aprobada' : ' · con prueba'}` : esc(cur.what)}</span></a>`;
  }
  function renderImpact() {
    const k = PROG.stageAt(T);
    view().innerHTML = `<header class="page-head"><h1 class="display">Ruta de impacto</h1><p class="muted">Cuerda, saltos y carrera por etapas, para llegar con las piernas listas a finales de enero.</p></header>
      <div class="banner banner-yellow"><span>Trotar y saltar requiere la luz verde de tu doctor o fisio. La rutina avanza de etapa solo cuando pasas su prueba; si no, repites la etapa. La app no decide si estás listo para esquiar.</span></div>
      <ol class="stages">${PROG.IMPACT.map((st) => {
        const state = st.n < k ? 'done' : st.n === k ? 'now' : 'next';
        return `<li class="stage st-${state}"><div class="stage-top"><span class="num stage-n">${st.n}</span><div><b>${esc(st.name)}</b><span class="muted small">${st.n === 0 ? 'Desde el inicio' : `Desde el ${dShort(st.from)}${st.early ? ' (antes, si tu fisio te da luz verde)' : ''}`}</span></div>${state === 'now' ? '<span class="pill pill-ok">Actual</span>' : ''}</div>
          <p class="small">${esc(st.what)}</p>${st.gate ? gateBox(st, false) : ''}</li>`;
      }).join('')}
        <li class="stage"><div class="stage-top"><span class="num stage-n">5</span><div><b>Afinar</b><span class="muted small">1 – 10 feb</span></div></div><p class="small">Mismo trabajo de la etapa a la que llegaste, con la mitad del volumen. Nada nuevo. Luego, la evaluación del 10 de febrero.</p></li></ol>`;
  }

  /* ---------- sábado ---------- */
  function recoveryBody(date) {
    const r = ST.recovery[date] || {};
    return `<div class="banner">Opcional. No lo conviertas en otro día pesado: sal sintiéndote mejor de lo que entraste.</div>
      <div class="rec-list">${PROG.RECOVERY.map((o) => {
        const on = !!r[o.id];
        return `<div class="rec ${on ? 'is-done' : ''}"><button class="check ${on ? 'on' : ''}" data-act="rec-opt" data-date="${date}" data-opt="${o.id}" aria-pressed="${on}" aria-label="Marcar ${esc(o.name)}">${ico('check')}</button><div><b>${esc(o.name)}</b><span class="dose">${esc(o.dose)}</span><p class="muted small">${esc(o.desc)}</p></div></div>`;
      }).join('')}</div>
      <section class="card"><span class="eyebrow">Rutina de movilidad · 15–20 min</span><ol class="mob">${PROG.MOBILITY.map(([n, d]) => `<li><span>${esc(n)}</span><b>${esc(d)}</b></li>`).join('')}</ol></section>`;
  }
  function renderSaturday() {
    const dow = PROG.parse(T).getDay();
    let d = PROG.addDays(T, (6 - dow + 7) % 7);
    if (!PROG.inProgram(d)) d = '2026-10-03';
    view().innerHTML = `<header class="page-head"><p class="eyebrow">${dLong(d)}</p><h1 class="display">Recovery Saturday</h1><p class="muted">Bicicleta suave, caminata, full body ligero con KB, movilidad o ejercicios de fisio.</p></header>` + recoveryBody(d);
  }

  /* ---------- biblioteca ---------- */
  let libTag = null, libQ = '';
  const libFilter = () => { const q = libQ.trim().toLowerCase(); return EX.LIST.filter((e) => (!libTag || e.tags.includes(libTag)) && (!q || (e.n + ' ' + e.es + ' ' + e.eq).toLowerCase().includes(q))); };
  function renderLibrary() {
    view().innerHTML = `<header class="page-head"><h1 class="display">Exercise library</h1><p class="muted">${EX.LIST.length} ejercicios. Toca uno para ver cómo se hace.</p></header>
      <label class="search"><span class="sr">Buscar ejercicio</span><input id="lib-q" type="search" placeholder="Buscar: step-down, curl, KB…" value="${esc(libQ)}" data-act="lib-q" autocomplete="off"></label>
      <div class="chips" role="group" aria-label="Filtrar por grupo"><button class="chipf ${!libTag ? 'on' : ''}" data-act="tag" data-tag="">Todos</button>${EX.TAGS.map(([k, n]) => `<button class="chipf ${libTag === k ? 'on' : ''}" data-act="tag" data-tag="${k}">${n}</button>`).join('')}</div>
      <div class="lib-grid" id="lib-grid">${libCards(libFilter())}</div>`;
  }
  function libCards(list) {
    if (!list.length) return '<p class="muted">Ningún ejercicio coincide. Prueba otro filtro.</p>';
    return list.map((e) => `<button class="lib-card" data-act="ex" data-id="${e.id}">
      <span class="lib-thumb">${thumb(e.id)}${e.auth ? `<span class="dyn-badge">${ico('bolt')}</span>` : ''}${e.sp ? `<span class="sp-badge">${ico('star')}</span>` : ''}</span>
      <b>${esc(e.n)}</b><span class="muted small">${esc(e.es)}</span>
      <span class="lib-tags">${e.tags.slice(0, 3).map((t) => `<span class="tag">${EX.TAG_ES[t]}</span>`).join('')}</span></button>`).join('');
  }

  /* ---------- detalle de ejercicio ---------- */
  function showExercise(id, date, code) {
    const ex = EX.BY[id];
    if (!ex) return;
    curEx = id;
    const item = date && code ? findItem(date, code) : null;
    const n = FIG.frameCount(ex.fig), labels = ex.fig.labels;
    const frames = ex.fig.custom ? '' : n > 2
      ? `<div class="frames frames-many">${ex.fig.frames.map((_, i) => `<figure>${FIG.staticSVG(ex.fig, i)}<figcaption>${i + 1}. ${esc(labels ? labels[i] : '')}</figcaption></figure>`).join('')}</div>`
      : n === 2 ? `<div class="frames"><figure>${FIG.staticSVG(ex.fig, 0)}<figcaption>1 · Posición inicial</figcaption></figure><span class="frames-arrow">→</span><figure>${FIG.staticSVG(ex.fig, 1)}<figcaption>2 · Movimiento</figcaption></figure></div>` : '';
    const series = loadSeries(id), plan = loadSeries(id, true);
    const adjusted = series.some((p, i) => plan[i] && plan[i].y !== p.y);
    const load = item ? item.load : null;
    const loadNow = PROG.loadFor(id, T < PROG.START ? PROG.START : T, 'main');
    openSheet(`
      <div class="sheet-head"><div><p class="eyebrow">${esc(ex.eq)}${ex.uni ? ' · Unilateral' : ''}</p><h2>${esc(ex.n)}</h2><p class="muted">${esc(ex.es)}</p></div><button class="icon-btn" data-act="close" aria-label="Cerrar">${ico('x')}</button></div>
      ${ex.auth ? `<a class="banner banner-dyn" href="#impacto">${ico('jump')}<span><b>Ruta de impacto</b> · entra por etapas, con la luz verde de tu fisio y una prueba aprobada.</span></a>` : ''}
      <div class="anim-wrap"><div class="anim" id="anim"></div><button class="icon-btn play" data-act="play" aria-label="Reproducir o pausar">${ico('pause')}</button>
        <div class="legend fig-legend"><span><i class="sw sw-left"></i>Pierna izquierda (LCA)</span><span><i class="sw sw-body"></i>Resto del cuerpo</span></div></div>
      ${frames}
      ${item ? `<div class="rx-box"><div><span class="eyebrow">${dLong(date)}</span><b>${esc(rxParts(item.rx, ex).join(' · '))}</b><span class="muted small">Descanso ${esc(item.rx.rest || '—')}</span></div>${load ? `<div class="rx-load"><span class="eyebrow">Sugerido</span><b class="num">${esc(load.label)}</b></div>` : ''}</div>` : ''}
      ${item && !ex.auth ? swapBox(item, date) : ''}
      ${series.length > 1 ? `<section class="card"><span class="eyebrow">Pesos sugeridos en el programa</span>${lineChart({ series: adjusted ? [{ name: 'Ajustado a ti', cls: 'accent', points: series, marks: true }, { name: 'Plan original', cls: 'ink', points: plan }] : [{ name: ex.n, cls: 'accent', points: series, marks: true }], unit: ' kg', height: 150 })}
        <p class="muted small">Calculado para ${PROG.getProfile().weight} kg (gráfica en kg; 1 kg = 2.2 lb). Si el RPE queda arriba del objetivo, baja un escalón; si queda muy fácil, sube uno. ${isLegUni(ex) ? 'Usa el mismo peso en ambas piernas y empieza con la izquierda.' : ''}</p></section>`
        : !item && loadNow ? `<div class="rx-box"><div><span class="eyebrow">Peso sugerido de referencia</span><b class="num">${esc(loadNow.label)}</b></div></div>` : ''}
      ${ex.why ? `<section class="why"><span class="eyebrow">Por qué es útil para tu objetivo</span><p>${esc(ex.why)}</p></section>` : ''}
      <dl class="howto">
        <dt>Posición inicial</dt><dd>${esc(ex.start)}</dd>
        <dt>Movimiento</dt><dd>${esc(ex.move)}</dd>
        <dt>Músculos principales</dt><dd>${esc(ex.mus)}</dd>
        <dt>Errores comunes</dt><dd><ul>${ex.err.map((e) => `<li>${esc(e)}</li>`).join('')}</ul></dd>
        <dt>Seguridad</dt><dd><ul>${ex.safe.filter((x) => x !== '—').map((e) => `<li>${esc(e)}</li>`).join('') || '<li>Técnica controlada y sin dolor.</li>'}</ul></dd>
        <dt>Regresión</dt><dd>${esc(ex.reg)}</dd>
        <dt>Progresión</dt><dd>${esc(ex.prog)}</dd>
      </dl>
      <a class="btn btn-ghost btn-block" href="${ex.q}" target="_blank" rel="noopener">${ico('ext')}VER CÓMO SE HACE · buscar en YouTube</a>
      <p class="muted small center">Abre una búsqueda de videos; elige demostraciones de fisioterapeutas o entrenadores certificados.</p>`);
    const el = $('#anim');
    if (reduceMotion) { el.innerHTML = FIG.staticSVG(ex.fig, null, 'fig-anim'); $('[data-act="play"]').innerHTML = ico('play'); }
    else stopAnim = FIG.animate(el, ex.fig);
  }

  // ⇄ otros ejercicios del mismo patrón (en casa, solo sin equipo)
  function swapBox(item, date) {
    const cur = EX.BY[item.id], s = PROG.session(date), key = item.swappedFrom || item.ladderFrom || item.id;
    const pat = patternOf(cur), home = s && s.where === 'home';
    const cands = EX.LIST.filter((e) => e.id !== item.id && !e.auth && patternOf(e) === pat && (home ? PROG.homeOk(e) : PROG.gymOk(e)))
      .map((e) => ({ e, sc: e.tags.filter((t) => cur.tags.includes(t)).length + (e.tags[0] === cur.tags[0] ? 3 : 0) + (e.uni === cur.uni ? 1 : 0) }))
      .sort((a, b) => b.sc - a.sc).slice(0, 8);
    return `<details class="card swap-box"${item.swappedFrom ? ' open' : ''}><summary>${ico('swap')}<b>Cambiar ejercicio</b><span class="muted small">Máquina ocupada o no te late: elige otro del mismo patrón${home ? ' (peso corporal o bandas)' : ' (sin bandas: en el gym no hay)'}. Se recuerda para los próximos días.</span></summary>
      ${item.swappedFrom ? `<button class="btn btn-ghost btn-block" data-act="unswap" data-from="${item.swappedFrom}">Volver a ${esc(EX.BY[item.swappedFrom].n)}</button>` : ''}
      <div class="swap-list">${cands.map(({ e }) => `<button class="px" data-act="swap" data-date="${date}" data-from="${key}" data-to="${e.id}"><span class="item-thumb">${thumb(e.id)}</span><span><b>${esc(e.n)}</b><span class="muted small">${esc(e.es)} · ${esc(e.eq)}</span></span></button>`).join('') || '<p class="muted small">No hay otra opción del mismo patrón.</p>'}</div></details>`;
  }

  /* ---------- mi avance ---------- */
  const KEY_LIFTS = [
    ['leg_press', 'Leg press', 'sesión A · principal'],
    [['db_rdl', 'rdl'], 'Peso muerto rumano', 'sesión B · mancuernas c/u en oct, barra desde nov'],
    [['goblet_box', 'goblet_squat', 'box_squat'], 'Sentadilla', 'sesión C · goblet con KB → box squat con barra'],
    ['hip_thrust', 'Hip thrust', 'sesión B · barra'],
    ['sl_leg_press', 'Single-leg leg press', 'sesión C · por pierna'],
    ['sl_leg_extension', 'Single-leg leg extension', 'sesión A · por pierna'],
    ['sl_rdl', 'Single-leg RDL', 'sesión C · KB'],
    [['chest_press', 'db_bench'], 'Pecho', 'sesión A · máquina → mancuernas c/u'],
    [[['lat_pulldown', 'neutral_pulldown']], 'Jalón al pecho', 'sesión A · agarre abierto o neutro']
  ];
  function renderProgress() {
    const td = trainingDays(T), tot = totalWorkouts();
    const wkNow = Math.min(Math.max(PROG.weekOf(T), 1), PROG.TOTAL_WEEKS);
    const p = PROG.getProfile();
    const charts = KEY_LIFTS.map(([ids, name, sub]) => {
      const list = Array.isArray(ids) ? ids : [ids];
      const series = list.map((id, i) => ({ name: Array.isArray(id) ? name : EX.BY[id].n, cls: ['accent', 'ink', 'right'][i], points: loadSeries(id), marks: true })).filter((s) => s.points.length);
      if (list.length === 1 && series.length) {
        const plan = loadSeries(list[0], true);
        if (plan.some((q, i) => series[0].points[i] && series[0].points[i].y !== q.y)) { series[0].name = 'Ajustado a ti'; series.push({ name: 'Plan original', cls: 'ink', points: plan }); }
      }
      return `<h3>${esc(name)} <small class="muted">${esc(sub)}</small></h3>${lineChart({ series, unit: ' kg', height: 150 })}`;
    }).join('');
    view().innerHTML = `<header class="page-head"><h1 class="display">My progress</h1><p class="muted">Lo que llevas hecho y cómo suben tus pesos de octubre a febrero.</p></header>
      <div class="grid-2">
        <div class="card stat"><span class="eyebrow">Sesiones</span><b class="num big">${td.done}<small>/${tot}</small></b><span class="muted small">${Math.round((td.done / tot) * 100)}% del programa</span></div>
        <div class="card stat"><span class="eyebrow">Cardio</span><b class="num big">${cardioCount()}</b><span class="muted small">sesiones · semana ${wkNow} de ${PROG.TOTAL_WEEKS}</span></div>
      </div>
      <section class="card"><h3 class="flush">Sesiones por semana</h3>${weekBars()}</section>
      ${fbSummary()}
      ${impactCard()}
      <section class="card"><h2>Pesos sugeridos</h2>
        <p class="muted small">Para ${p.weight} kg y ${(p.height / 100).toFixed(2)} m. Gráficas en kg (1 kg = 2.2 lb; en cada ejercicio ves ambos). El punto grande es tu peso de esta semana; los puntos pequeños, sesiones que ya completaste. Las bajadas son descargas y la puesta a punto de febrero. Cuando tus respuestas (Fácil / Pesado / peso real) mueven la curva, ves tu curva ajustada junto al plan original.</p>
        ${charts}</section>
      <section class="card"><h3 class="flush">Cómo se calculan</h3><p class="small">Cada ejercicio parte de un porcentaje conservador de tu peso corporal para 10–12 reps con RPE 6–7. La carga sube ~2.5% por semana en octubre y da un salto cada vez que bajan las reps: noviembre (8–10), diciembre (6–8) y enero (5–6). Baja en las semanas de descarga y en febrero. Las máquinas cambian de una marca a otra: si una serie se siente más pesada que el RPE objetivo, quédate en el peso anterior.</p></section>`;
  }

  function fbSummary() {
    const from = PROG.addDays(T, -14), c = { easy: 0, ok: 0, hard: 0, pain: 0 };
    Object.keys(ST.fb).forEach((d) => { if (d >= from && d <= T) Object.values(ST.fb[d]).forEach((f) => { if (f && c[f.r] != null) c[f.r]++; }); });
    const tot = c.easy + c.ok + c.hard + c.pain;
    if (!tot) return '<section class="card"><h3 class="flush">Cómo te ha ido</h3><p class="muted small">Al palomear un ejercicio, toca Fácil / Bien / Pesado / Molestia. Con eso los pesos y las variantes se ajustan a tu avance real.</p></section>';
    return `<section class="card"><h3 class="flush">Cómo te ha ido · últimas 2 semanas</h3><div class="fb-sum">${FB.map(([k, n]) => `<div class="fb-${k}"><b class="num">${c[k]}</b><span class="small">${n}</span></div>`).join('')}</div>
      <p class="muted small">${c.pain ? 'Marcaste molestia: esos ejercicios bajaron de carga o de variante. Si se repite, coméntalo con tu fisio.' : tot < 4 ? 'Sigue respondiendo: con unas cuantas sesiones más se ve la tendencia.' : c.easy > c.hard * 2 ? 'Vas sobrado en varios ejercicios: la app ya les está subiendo peso o variante.' : c.hard > c.easy ? 'Varios ejercicios se sienten pesados: la app congela esas cargas hasta que te acomodes.' : 'Vas en línea con el plan.'}</p></section>`;
  }

  /* ---------- ski readiness ---------- */
  const READY_MATCH = {
    strength: (e, it) => it.type === 'main',
    uni: (e) => e.uni && e.tags.some((t) => ['quads', 'glutes', 'hams'].includes(t)),
    knee: (e) => ['step_down', 'reverse_step_down', 'lateral_step_down', 'sl_squat_assisted', 'spanish_squat'].includes(e.id),
    stability: (e) => e.tags.includes('stability'),
    balance: (e) => e.tags.includes('balance'),
    eccentric: (e, it) => /^4-/.test(it.rx.tempo || '') || ['step_down', 'reverse_step_down', 'slider_curl'].includes(e.id),
    impact: (e) => e.auth === 'impact' || e.auth === 'run',
    decel: (e) => ['drop_landing', 'squat_jump', 'box_jump_low', 'sl_hop_stick', 'lateral_sl_hop', 'jump_turn_90'].includes(e.id),
    lateral: (e) => ['lateral_step_down', 'lateral_step_up', 'lateral_lunge', 'lateral_bound', 'lateral_shuffle', 'band_lateral_walk', 'copenhagen', 'lateral_hop', 'lateral_sl_hop', 'ski_hops'].includes(e.id),
    tolerance: () => true
  };
  function readiness(capId) {
    let planned = 0, done = 0, first = null;
    for (let d = PROG.START; d <= PROG.END; d = PROG.addDays(d, 1)) {
      const s = PROG.session(d);
      if (!isWorkout(s)) continue;
      if (PROG.allItems(s).some((it) => READY_MATCH[capId](EX.BY[it.id], it))) { planned++; if (!first) first = d; if (isDone(d)) done++; }
    }
    return { planned, done, first };
  }
  function renderSki() {
    view().innerHTML = `<header class="page-head"><h1 class="display">Ski readiness</h1><p class="muted">Las capacidades que necesitas para esquiar y cuánto del trabajo de cada una llevas hecho.</p></header>
      <div class="banner banner-pro"><b>EVALUACIÓN FINAL POR TRAUMATÓLOGO/FISIOTERAPEUTA ANTES DE REGRESAR AL ESQUÍ.</b></div>
      <div class="ready-list">${PROG.READINESS.map((c, i) => {
        const r = readiness(c.id), pct = r.planned ? Math.round((r.done / r.planned) * 100) : 0;
        return `<section class="card ready"><div class="ready-top"><span class="num ready-n">${i + 1}</span><h3>${esc(c.name)}</h3><span class="ready-pct num">${pct}%</span></div>
          <p>${esc(c.why)}</p><p class="muted small"><b>Cómo lo desarrollamos:</b> ${esc(c.how)}</p>
          <div class="bar"><i style="width:${pct}%"></i></div><p class="muted small">${r.done} de ${r.planned} sesiones con este trabajo${r.first && r.first > T ? ` · empieza el ${dShort(r.first)}` : ''}</p></section>`;
      }).join('')}</div>`;
  }

  /* ---------- perfil ---------- */
  let confirmReset = false;
  function renderSettings() {
    const p = PROG.getProfile();
    const bmi = (p.weight / Math.pow(p.height / 100, 2)).toFixed(1);
    view().innerHTML = `<header class="page-head"><h1 class="display">Perfil</h1></header>
      <section class="card"><h2>Tus datos</h2><p class="muted small">Los pesos sugeridos se recalculan al cambiar tu peso.</p>
        <div class="grid-2"><label class="field"><span>Peso (kg)</span><input id="pf-w" type="number" inputmode="decimal" min="40" max="150" step="0.5" value="${p.weight}" data-act="profile" data-f="weight"></label>
        <label class="field"><span>Estatura (cm)</span><input id="pf-h" type="number" inputmode="numeric" min="140" max="210" value="${p.height}" data-act="profile" data-f="height"></label></div>
        <p class="muted small">IMC ${bmi}</p></section>
      <section class="card"><h2>Marcas</h2><p class="muted small">Tus marcas, respuestas (Fácil / Pesado…), cambios de ejercicio y pruebas de impacto se guardan solo en este celular. Borrar quita todo eso.</p>
        <button class="btn ${confirmReset ? 'btn-danger' : 'btn-ghost'} btn-block" data-act="reset">${confirmReset ? 'Toca otra vez para borrar todo' : 'Borrar todas las marcas'}</button></section>
      <section class="card"><h2>Seguridad</h2><p class="small">Esta app no sustituye tu rehabilitación médica ni diagnostica. Es ambiciosa con la fuerza y conservadora con la rodilla. Si sientes dolor significativo, inflamación o inestabilidad, detente y consulta con tu doctor. La decisión de volver a esquiar es de tus profesionales de salud.</p></section>`;
  }

  /* ================= router ================= */
  function parseRoute() {
    const [name, arg] = location.hash.replace(/^#/, '').split('/');
    if (name === 'dia' && arg) return { name: 'day', date: arg };
    if (name === 'ejercicio' && arg) return { name: 'library', ex: arg };
    if (!name || name === 'hoy') return { name: 'day', date: T };
    return { name: { inicio: 'home', calendario: 'calendar', fases: 'phases', ejercicios: 'library', progreso: 'progress', ski: 'ski', sabado: 'saturday', ajustes: 'settings', impacto: 'impact' }[name] || 'day', date: T };
  }
  let lastHash = null;
  function render() {
    route = parseRoute();
    const same = lastHash === location.hash, y = window.scrollY;
    ({ home: renderHome, calendar: renderCalendar, phases: renderPhases, day: () => renderDay(route.date), library: renderLibrary, progress: renderProgress, ski: renderSki, saturday: renderSaturday, settings: renderSettings, impact: renderImpact })[route.name]();
    const tab = route.name === 'day' ? (route.date === T ? 'today' : 'calendar') : route.name === 'phases' ? 'calendar' : route.name === 'impact' ? 'home' : route.name;
    document.querySelectorAll('.tabbar a').forEach((a) => a.classList.toggle('on', a.dataset.r === tab));
    if (route.ex) showExercise(route.ex);
    window.scrollTo(0, same ? y : 0);
    lastHash = location.hash;
  }
  window.addEventListener('hashchange', () => { closeSheet(); confirmReset = false; render(); });
  // si la app queda abierta de un día para otro, se pone al día sola
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') return;
    const now = PROG.today();
    if (now !== T) { T = now; sync(); render(); }
    if (TM && !wake) keepAwake(true);
  });

  /* ================= eventos ================= */
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-act]');
    if (!t) { if (e.target.id === 'scrim') closeSheet(); return; }
    const a = t.dataset.act, date = t.dataset.date;
    if (a === 'close') closeSheet();
    else if (a === 'ex') showExercise(t.dataset.id, date, t.dataset.code);
    else if (a === 'check') {
      logDay(date);
      const c = Object.assign({}, ST.checks[date]);
      c[t.dataset.key] = !c[t.dataset.key];
      ST.checks[date] = c;
      const s = PROG.session(date);
      if ((isWorkout(s) || s.kind === 'extra' || s.kind === 'cardio') && !ST.done[date] && PROG.allItems(s).every((i) => c[i.code])) { ST.done[date] = true; toast('¡Sesión completada!'); }
      unlogIfEmpty(date); save(); sync(); render();
    } else if (a === 'finish') { logDay(date); ST.done[date] = true; save(); sync(); toast('¡Sesión completada!'); render(); }
    else if (a === 'undo-finish') { delete ST.done[date]; unlogIfEmpty(date); save(); sync(); render(); }
    else if (a === 'timer-stop') stopTimer();
    else if (a === 'timer-add') { if (TM) { TM.end += 15000; TM.last = null; } }
    else if (a === 'timer-skip') { if (TM) TM.end = Date.now(); }
    else if (a === 'go') { const it = findItem(date, t.dataset.code); if (it) runTimer(segsFor(it)); }
    else if (a === 'round' || a === 'round-reset') {
      logDay(date);
      const b = t.dataset.block, r = Object.assign({}, ST.rounds[date]);
      if (a === 'round-reset') delete r[b];
      else {
        const sets = +t.dataset.sets;
        r[b] = (r[b] || 0) + 1;
        if (r[b] >= sets) {
          // última vuelta: palomea los ejercicios del bloque
          const s = PROG.session(date), blk = s.blocks.find((x) => x.code === b), c = Object.assign({}, ST.checks[date]);
          if (blk) blk.items.forEach((i) => { c[i.code] = true; });
          ST.checks[date] = c;
          if (!ST.done[date] && PROG.allItems(s).every((i) => c[i.code])) { ST.done[date] = true; toast('¡Sesión completada!'); } else toast(`Bloque ${b} completo`);
          stopTimer();
        } else runTimer([{ l: `Descanso · vuelta ${r[b] + 1}/${sets}`, s: +t.dataset.sec, k: 'rest' }]);
      }
      ST.rounds[date] = r; unlogIfEmpty(date); save(); sync(); render();
    } else if (a === 'fb' || a === 'kg') {
      const it = findItem(date, t.dataset.code);
      if (!it) return;
      logDay(date);
      const day = Object.assign({}, ST.fb[date]), cur = Object.assign({}, day[it.code]);
      const base = { id: it.id, type: it.type, sug: it.load ? it.load.kg : null };
      if (a === 'fb') {
        if (cur.r === t.dataset.r) { delete cur.r; if (!cur.kg) { delete day[it.code]; } else day[it.code] = Object.assign(cur, base, { r: 'ok' }); }
        else day[it.code] = Object.assign(cur, base, { r: t.dataset.r });
        if (t.dataset.r === 'pain' && cur.r === 'pain') toast('Anotado. Revisa el semáforo de rodilla.');
      } else {
        const kg = kgStep(it.load.kind, cur.kg || it.load.kg, +t.dataset.d);
        day[it.code] = Object.assign(cur, base, { kg, r: cur.r || 'ok' });
      }
      ST.fb[date] = day; save(); sync(); render();
    } else if (a === 'pick') {
      const o = Object.assign({}, ST.days[date]);
      if (t.dataset.v) o.pick = t.dataset.v; else delete o.pick;
      if (Object.keys(o).length) ST.days[date] = o; else delete ST.days[date];
      save(); sync(); render();
    } else if (a === 'logcardio') {
      ST.log[date] = 'Y'; save(); sync(); render();
    } else if (a === 'where' || a === 'dur') {
      const o = Object.assign({}, ST.days[date]), v = t.dataset.v;
      if (a === 'where') { if (v === 'home') o.where = 'home'; else delete o.where; }
      else if (v) o.min = +v; else delete o.min;
      if (Object.keys(o).length) ST.days[date] = o; else delete ST.days[date];
      save(); sync(); render();
    } else if (a === 'gate') {
      const st = PROG.IMPACT.find((x) => x.id === t.dataset.st), g = Object.assign({}, ST.gates[st.id]);
      g.checks = (g.checks || []).slice(); g.checks[+t.dataset.i] = !g.checks[+t.dataset.i];
      const all = st.gate.every((_, j) => g.checks[j]);
      if (all && !g.date) { g.date = T; toast(st.early || T >= st.from ? `Etapa ${st.n} desbloqueada: entra en tu rutina` : `Prueba aprobada: la etapa ${st.n} entra el ${dShort(st.from)}`); }
      if (!all) delete g.date;
      ST.gates[st.id] = g; save(); sync(); render();
    } else if (a === 'swap') {
      ST.swaps[t.dataset.from] = { to: t.dataset.to, from: date };
      save(); sync(); closeSheet(); toast(`Cambiado por ${EX.BY[t.dataset.to].n}`); render();
    } else if (a === 'unswap') {
      delete ST.swaps[t.dataset.from];
      save(); sync(); closeSheet(); toast('Ejercicio original de vuelta'); render();
    }
    else if (a === 'cal-mode') {
      if (t.dataset.mode === 'phases') { if (location.hash !== '#fases') location.hash = '#fases'; else renderPhases(); }
      else { calMode = t.dataset.mode; if (location.hash !== '#calendario') location.hash = '#calendario'; else renderCalendar(); }
    } else if (a === 'phase') { phaseSel = +t.dataset.n; renderPhases(); window.scrollTo(0, 0); }
    else if (a === 'cal-prev' || a === 'cal-next') {
      const dir = a === 'cal-next' ? 1 : -1;
      if (calMode === 'week') calCursor = PROG.addDays(calCursor, 7 * dir);
      else { const d = PROG.parse(calCursor); calCursor = PROG.fmt(new Date(d.getFullYear(), d.getMonth() + dir, 1)); }
      if (calCursor < '2026-09-28') calCursor = PROG.START;
      if (calCursor > PROG.END) calCursor = PROG.END;
      renderCalendar();
    } else if (a === 'tag') { libTag = t.dataset.tag || null; renderLibrary(); }
    else if (a === 'rec-opt') {
      const r = Object.assign({}, ST.recovery[date]); r[t.dataset.opt] = !r[t.dataset.opt];
      ST.recovery[date] = r;
      if (Object.values(r).some(Boolean)) ST.done[date] = true; else delete ST.done[date];
      save(); sync(); render();
    } else if (a === 'play') {
      if (stopAnim) { closeAnim(); t.innerHTML = ico('play'); }
      else if (curEx) { stopAnim = FIG.animate($('#anim'), EX.BY[curEx].fig); t.innerHTML = ico('pause'); }
    } else if (a === 'reset') {
      if (!confirmReset) { confirmReset = true; renderSettings(); return; }
      ST.checks = {}; ST.done = {}; ST.recovery = {}; ST.fb = {}; ST.swaps = {}; ST.gates = {}; ST.days = {}; ST.rounds = {}; ST.log = {}; confirmReset = false; save(); sync(); toast('Marcas borradas'); renderSettings();
    }
  });
  document.addEventListener('input', (e) => {
    const t = e.target;
    if (t.dataset.act === 'lib-q') { libQ = t.value; $('#lib-grid').innerHTML = libCards(libFilter()); }
  });
  document.addEventListener('change', (e) => {
    const t = e.target;
    if (t.dataset.act !== 'profile') return;
    const v = parseFloat(t.value);
    if (isNaN(v)) return;
    ST.profile = Object.assign({}, ST.profile, { [t.dataset.f]: v });
    PROG.setProfile(ST.profile); save(); toast('Perfil actualizado'); renderSettings();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('#sheet').hidden) closeSheet(); });

  /* ================= temporizador ================= */
  // Segmentos [{l, s, k}] con pitido en 3-2-1 y en cada cambio; la pantalla no se apaga mientras corre.
  // En iPhone el sonido necesita el interruptor de silencio apagado y la app abierta.
  let TM = null, audio = null, wake = null;
  function beep(freq, dur = 0.12, vol = 0.3) {
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      if (audio.state === 'suspended') audio.resume();
      const o = audio.createOscillator(), g = audio.createGain(), t0 = audio.currentTime;
      o.frequency.value = freq; g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
      o.connect(g); g.connect(audio.destination); o.start(t0); o.stop(t0 + dur + 0.02);
    } catch (e) { /* sin audio: el contador sigue */ }
    if (navigator.vibrate) navigator.vibrate(dur > 0.2 ? 250 : 60);
  }
  async function keepAwake(on) {
    try {
      if (on && !wake && navigator.wakeLock) { wake = await navigator.wakeLock.request('screen'); wake.addEventListener('release', () => { wake = null; }); }
      else if (!on && wake) { await wake.release(); wake = null; }
    } catch (e) { wake = null; }
  }
  const KB_STEPS = [4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32];
  function kgStep(kind, kg, dir) {
    if (kind === 'k' || kind === 'k2') { const i = KB_STEPS.indexOf(kg); return KB_STEPS[Math.max(0, Math.min(KB_STEPS.length - 1, (i < 0 ? KB_STEPS.findIndex((x) => x > kg) : i) + dir))]; }
    const st = PROG.stepOf(kind, dir > 0 ? kg : kg - 0.01) || 2.5;
    return Math.max(st, Math.round((kg + dir * st) * 10) / 10);
  }
  function segsFor(it) {
    const ex = EX.BY[it.id], rx = it.rx, out = [{ l: 'Prepárate', s: 5, k: 'prep' }];
    if (rx.iv) {
      for (let i = 0; i < rx.iv.n; i++) {
        out.push({ l: rx.iv.n > 1 ? `${rx.iv.onL} · ${i + 1}/${rx.iv.n}` : rx.iv.onL, s: rx.iv.on, k: 'work' });
        if (rx.iv.off && i < rx.iv.n - 1) out.push({ l: rx.iv.offL, s: rx.iv.off, k: 'rest' });
      }
      return out;
    }
    const sec = PROG.topNum(rx.r) * (/min/.test(rx.r) ? 60 : 1) || 30;
    if (/lado/.test(rx.r)) out.push({ l: 'Izquierda', s: sec, k: 'work' }, { l: 'Cambia de lado', s: 5, k: 'prep' }, { l: 'Derecha', s: sec, k: 'work' });
    else out.push({ l: ex.n, s: sec, k: 'work' });
    const rest = PROG.restSecOf(rx.rest);
    if (rest) out.push({ l: 'Descanso', s: rest, k: 'rest' });
    return out;
  }
  function runTimer(segs) {
    stopTimer();
    TM = { segs, i: 0, end: Date.now() + segs[0].s * 1000, last: null };
    $('#timer').hidden = false;
    $('#timer-skip').hidden = segs.length < 2;
    keepAwake(true);
    beep(880, 0.06, 0.12); // desbloquea el audio con el toque
    TM.iv = setInterval(tick, 200);
    tick();
  }
  function tick() {
    if (!TM || TM.done) return;
    const seg = TM.segs[TM.i], left = Math.max(0, Math.ceil((TM.end - Date.now()) / 1000));
    if (left !== TM.last) {
      TM.last = left;
      if (left > 0 && left <= 3) beep(660);
      $('#timer-l').textContent = seg.l;
      $('#timer-v').textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
      $('#timer').dataset.k = seg.k;
    }
    if (left > 0) return;
    TM.i++;
    if (TM.i >= TM.segs.length) {
      TM.done = true; clearInterval(TM.iv);
      beep(990, 0.18); setTimeout(() => beep(1320, 0.35), 230);
      $('#timer-l').textContent = ''; $('#timer-v').textContent = '¡Listo!';
      const mine = TM;
      setTimeout(() => { if (TM === mine) stopTimer(); }, 2500);
      return;
    }
    const nx = TM.segs[TM.i];
    beep(nx.k === 'work' ? 990 : 520, 0.3);
    TM.end = Math.max(TM.end, Date.now() - 1000) + nx.s * 1000; TM.last = null;
  }
  function stopTimer() { if (TM) clearInterval(TM.iv); TM = null; $('#timer').hidden = true; keepAwake(false); }

  render();
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
})();
