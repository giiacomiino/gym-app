/* app.js — interfaz, registro local-first y sincronización con Supabase. */
(function () {
  const { PROG, EX, FIG } = window;
  const $ = (s, el = document) => el.querySelector(s);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const nowISO = () => new Date().toISOString();

  /* ================= almacenamiento local ================= */
  const KEY = 'aclski.v1';
  const TABLES = {
    sessions: { remote: 'workout_sessions', cols: ['id', 'date', 'kind', 'phase', 'week', 'status', 'checks', 'notes', 'duration_min', 'recovery', 'updated_at', 'deleted'] },
    sets: { remote: 'exercise_sets', cols: ['id', 'date', 'exercise_id', 'slot', 'set_no', 'side', 'weight', 'reps', 'rpe', 'updated_at', 'deleted'] },
    knee: { remote: 'knee_checks', cols: ['id', 'date', 'moment', 'pain', 'swelling', 'instability', 'motion_loss', 'unusual', 'light', 'notes', 'updated_at', 'deleted'] },
    tests: { remote: 'readiness_tests', cols: ['id', 'date', 'test', 'side', 'value', 'notes', 'updated_at', 'deleted'] },
    settings: { remote: 'user_settings', cols: ['id', 'data', 'updated_at', 'deleted'] }
  };
  const blank = () => ({ sessions: {}, sets: {}, knee: {}, tests: {}, settings: {}, outbox: {}, sync: { lastPull: null, lastOk: null, error: null }, auth: null });
  let DB;
  try { DB = Object.assign(blank(), JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { DB = blank(); }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(DB)); } catch (e) { toast('No se pudo guardar en el celular: ' + e.message); } };
  function put(table, rec) {
    rec.updated_at = nowISO();
    if (rec.deleted == null) rec.deleted = false;
    DB[table][rec.id] = rec;
    DB.outbox[table + '|' + rec.id] = 1;
    save();
    scheduleSync();
  }
  const live = (table) => Object.values(DB[table]).filter((r) => !r.deleted);
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});

  const settings = () => (DB.settings.main && DB.settings.main.data) || { auth: {}, ski: {} };
  function saveSettings(data) { put('settings', { id: 'main', data }); }

  /* ================= consultas ================= */
  const T = PROG.today();
  const sessRec = (date) => DB.sessions[date] && !DB.sessions[date].deleted ? DB.sessions[date] : null;
  function ensureSess(date) {
    const s = PROG.session(date);
    return sessRec(date) || { id: date, date, kind: s ? s.kind : 'gym', phase: s ? s.phase : null, week: s ? s.week : null, status: 'pending', checks: {}, notes: '', duration_min: null, recovery: null };
  }
  const isDone = (date) => (sessRec(date) || {}).status === 'done';
  const setsOf = (date, exId) => live('sets').filter((r) => r.date === date && r.exercise_id === exId).sort((a, b) => a.set_no - b.set_no || (a.side > b.side ? 1 : -1));
  const kneeOf = (date, moment) => { const r = DB.knee[date + '|' + moment]; return r && !r.deleted ? r : null; };
  const latestKnee = (date) => kneeOf(date, 'post') || kneeOf(date, 'pre') || kneeOf(date, 'next');
  function exDates(exId) {
    const ds = new Set(live('sets').filter((r) => r.exercise_id === exId).map((r) => r.date));
    return [...ds].sort();
  }
  const cap = (s) => (s.weight > 0 ? s.weight * (1 + (s.reps || 0) / 30) : (s.reps || 0)); // capacidad estimada (Epley) o reps si es peso corporal
  function bestBySide(sets) {
    const out = {};
    sets.forEach((s) => { const k = s.side || 'b'; if (!out[k] || cap(s) > cap(out[k])) out[k] = s; });
    return out;
  }
  const num = (s) => (String(s || '').match(/\d+(?:[.,]\d+)?/g) || []).map((x) => parseFloat(x.replace(',', '.')));
  const topOf = (s) => { const n = num(s); return n.length ? Math.max(...n) : null; };

  /* ================= semáforo ================= */
  function kneeLight(r) {
    if (!r) return null;
    if (r.pain >= 5 || r.swelling === 'si' || r.instability || r.motion_loss) return 'red';
    if (r.pain >= 3 || r.swelling === 'leve' || r.unusual) return 'yellow';
    return 'green';
  }
  const LIGHT = {
    green: { name: 'Verde', txt: 'Sin dolor significativo, sin inflamación y sin inestabilidad.' },
    yellow: { name: 'Amarillo', txt: 'Molestia, fatiga o respuesta inusual: vigila y ajusta. Hoy no subas cargas y reduce volumen si hace falta.' },
    red: { name: 'Rojo', txt: 'DETÉN EL EJERCICIO Y CONSULTA CON TU PROFESIONAL DE SALUD.' }
  };

  /* ================= progresión ================= */
  function lastLogged(exId, before) {
    const ds = exDates(exId).filter((d) => d < before);
    return ds.length ? ds[ds.length - 1] : null;
  }
  function suggestion(item, date) {
    const ex = EX.BY[item.id];
    const prev = lastLogged(item.id, date);
    if (!prev) return { k: 'first', t: 'Primera vez: elige una carga con la que completes todas las series con técnica perfecta y RPE dentro del objetivo. Anótala.' };
    const sets = setsOf(prev, item.id);
    const lights = [kneeLight(kneeOf(prev, 'post')), kneeLight(kneeOf(prev, 'next')), kneeLight(kneeOf(PROG.addDays(prev, 1), 'pre'))];
    if (lights.includes('red')) return { k: 'stop', prev, t: 'La última vez el semáforo quedó en rojo. No progreses y consulta con tu profesional de salud.' };
    const top = topOf(item.rx.r), rpeTop = topOf(item.rx.rpe);
    const sides = ex.uni ? ['L', 'R'] : ['B'];
    const per = sides.map((sd) => {
      const ss = sets.filter((s) => (s.side || 'B') === sd);
      const allTop = ss.length >= item.rx.s && ss.every((s) => (s.reps || 0) >= top);
      const rpeOk = ss.every((s) => s.rpe == null || s.rpe === '' || s.rpe <= rpeTop);
      return { sd, n: ss.length, allTop, rpeOk, best: bestBySide(ss)[sd] };
    });
    const unit = ex.unit === 'time' ? 's' : ex.unit === 'dist' ? 'm' : ex.unit === 'cm' ? 'cm' : 'reps';
    let msg, k;
    if (lights.includes('yellow')) { k = 'hold'; msg = 'La rodilla respondió en amarillo la última vez: mantén la carga y vigila la respuesta.'; }
    else if (per.every((p) => p.allTop && p.rpeOk)) {
      k = 'up';
      const inc = ex.unit === 'time' ? '+5 s' : ex.unit === 'dist' ? '+5–10 m o algo más de peso' : /Máquina/.test(ex.eq) && /press|Prensa/i.test(ex.n + ex.es) ? '+5 kg' : /Kettlebell/.test(ex.eq) ? 'la siguiente KB (o más reps)' : '+1–2.5 kg';
      msg = `Completaste todas las series en el tope del rango con RPE adecuado. Puedes considerar ${inc} hoy si no hubo dolor ni inflamación y tu rehabilitador está de acuerdo.`;
    } else if (per.some((p) => !p.rpeOk)) { k = 'hold'; msg = `El RPE pasó de ${rpeTop}. Mantén la carga hasta que se sienta más fácil.`; }
    else { k = 'reps'; msg = `Mantén la carga y busca +1 ${unit === 'reps' ? 'rep' : unit} por serie hasta llegar a ${top} en todas.`; }
    if (ex.uni) {
      const L = per[0].best, R = per[1].best;
      if (L && R && cap(R) > 0) {
        const lsi = Math.round((cap(L) / cap(R)) * 100);
        if (lsi < 90) msg += ` La izquierda está al ${lsi}% de la derecha: la derecha no sube de carga, iguala lo que logre la izquierda.`;
      }
    }
    return { k, prev, t: msg };
  }
  const fmtSet = (s, ex) => {
    if (!s) return '—';
    const u = ex.unit === 'time' ? ' s' : ex.unit === 'dist' ? ' m' : ex.unit === 'cm' ? ' cm' : '';
    return (s.weight ? `${+s.weight} kg × ` : '') + `${s.reps ?? '—'}${u}` + (s.rpe ? ` @${+s.rpe}` : '');
  };

  /* ================= utilidades de UI ================= */
  const DOW = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const DOW3 = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const MON = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const MONL = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const dLong = (s) => { const d = PROG.parse(s); return `${DOW[d.getDay()]} ${d.getDate()} ${MON[d.getMonth()]}`; };
  const dShort = (s) => { const d = PROG.parse(s); return `${d.getDate()} ${MON[d.getMonth()]}`; };

  const ICON = {
    home: '<path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z"/>',
    cal: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
    bolt: '<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>',
    lib: '<path d="M5 4h4v16H5zM10 4h4v16h-4zM15.5 4.5l3.8 1 -3.9 15-3.8-1z"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    gear: '<circle cx="12" cy="12" r="3.2"/><path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1L7 17M17 7l2.1-2.1"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>',
    play: '<path d="M8 5v14l11-7z"/>',
    pause: '<path d="M7 5h4v14H7zM13 5h4v14h-4z"/>',
    timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6"/>',
    mountain: '<path d="M2 20l7-12 4 6 3-4 6 10z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    ext: '<path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6"/>',
    star: '<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/>'
  };
  const ico = (n, cls = '') => `<svg class="ico ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICON[n]}</svg>`;

  function piste(level, withText) {
    const L = PROG.LEVELS[level];
    if (!L) return '';
    const shape = { green: '<circle cx="8" cy="8" r="6"/>', blue: '<rect x="2.5" y="2.5" width="11" height="11"/>', black: '<path d="M8 1.5l6.5 6.5L8 14.5 1.5 8z"/>', dblack: '<path d="M5 3l4 5-4 5-4-5zM11 3l4 5-4 5-4-5z"/>' }[L.k];
    return `<span class="piste piste-${L.k}" title="Dificultad: ${L.name}"><svg viewBox="0 0 16 16" aria-hidden="true">${shape}</svg>${withText ? `<span>${L.label}</span>` : ''}</span>`;
  }

  const thumbCache = new Map();
  function thumb(id) {
    if (!thumbCache.has(id)) thumbCache.set(id, FIG.staticSVG(EX.BY[id].fig, null, 'fig-thumb'));
    return thumbCache.get(id);
  }

  let toastT;
  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toastT);
    toastT = setTimeout(() => { el.hidden = true; }, 2600);
  }

  /* ================= hoja inferior (sheet) ================= */
  let stopAnim = null;
  function openSheet(html, cls = '') {
    closeAnim();
    const sh = $('#sheet');
    sh.className = 'sheet ' + cls;
    $('#sheet-body').innerHTML = html;
    sh.hidden = false;
    $('#scrim').hidden = false;
    document.body.classList.add('locked');
    $('#sheet-body').scrollTop = 0;
  }
  function closeSheet() {
    closeAnim();
    $('#sheet').hidden = true;
    $('#scrim').hidden = true;
    document.body.classList.remove('locked');
  }
  function closeAnim() { if (stopAnim) { stopAnim(); stopAnim = null; } }

  /* ================= vistas ================= */
  const view = () => $('#view');
  let route = { name: 'home' };
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function nextWorkout(from) {
    for (let d = from; d <= PROG.END; d = PROG.addDays(d, 1)) {
      const s = PROG.session(d);
      if (s && (s.kind === 'gym' || s.kind === 'kb') && !isDone(d)) return s;
    }
    return null;
  }
  function trainingDays(upto) {
    let planned = 0, done = 0;
    for (let d = PROG.START; d <= PROG.END && d <= upto; d = PROG.addDays(d, 1)) {
      const s = PROG.session(d);
      if (s && (s.kind === 'gym' || s.kind === 'kb')) { planned++; if (isDone(d)) done++; }
    }
    return { planned, done };
  }
  function streak() {
    let n = 0;
    for (let d = T; d >= PROG.START; d = PROG.addDays(d, -1)) {
      const s = PROG.session(d);
      if (!s || s.kind === 'rest' || s.kind === 'recovery') continue;
      if (isDone(d)) n++; else if (d < T) break;
    }
    return n;
  }

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
      s += `<path d="${d}" class="${g.cls}"/>`;
      s += `<text x="${((xa + xb) / 2).toFixed(1)}" y="${H - 6}" class="m-lbl" text-anchor="middle">${g.lbl}</text>`;
    });
    let ridge = '';
    for (let x = 10; x <= W - 10; x += 3) ridge += (ridge ? ' L' : 'M') + `${x.toFixed(1)} ${Y(x).toFixed(1)}`;
    s += `<path d="${ridge}" class="m-ridge"/>`;
    const tx = X(T < PROG.SURGERY ? PROG.SURGERY : T > PROG.END ? PROG.END : T);
    s += `<line x1="${tx}" y1="${Y(tx) - 4}" x2="${tx}" y2="${H - 20}" class="m-now-line"/><circle cx="${tx}" cy="${Y(tx)}" r="5" class="m-now"/>`;
    s += `<text x="${tx}" y="${Y(tx) - 10}" class="m-now-lbl" text-anchor="middle">Hoy</text>`;
    const ex = X(PROG.END);
    s += `<path d="M${ex} ${Y(ex)} v-16 l10 4 l-10 4" class="m-flag"/>`;
    s += `<text x="12" y="${H - 26}" class="m-tick">8 may</text><text x="${ex - 4}" y="${Y(ex) - 6}" class="m-tick" text-anchor="end">15 feb</text>`;
    return `<svg class="mountain" viewBox="0 0 ${W} ${H}" role="img" aria-label="Progreso de fases desde la cirugía hasta el viaje">${s}</svg>`;
  }

  function renderHome() {
    const ph = PROG.phaseOf(T) || (T < PROG.START ? PROG.PHASES[0] : PROG.PHASES[4]);
    const wk = Math.min(Math.max(PROG.weekOf(T), 1), PROG.TOTAL_WEEKS);
    const postop = PROG.diffDays(PROG.SURGERY, T);
    const toGo = PROG.diffDays(T, PROG.END);
    const td = trainingDays(T);
    const today = PROG.session(T);
    const nxt = nextWorkout(today && isDone(T) ? PROG.addDays(T, 1) : T);
    const pct = Math.round(Math.min(1, Math.max(0, PROG.diffDays(PROG.START, T) / PROG.diffDays(PROG.START, PROG.END))) * 100);
    const kn = latestKnee(T);
    const light = kneeLight(kn);
    const yday = PROG.addDays(T, -1);
    const askNext = isDone(yday) && !kneeOf(yday, 'next');
    const miles = PROG.MILESTONES.filter((m) => m.date >= T).slice(0, 4);

    view().innerHTML = `
      <section class="hero">
        <p class="eyebrow">8 MAYO 2026 → 15 FEBRERO 2027</p>
        <h1 class="display">ACL <span class="arrow">→</span> SKI PREP</h1>
        <div class="hero-stats">
          <div><b class="num">${wk}</b><span>Semana de ${PROG.TOTAL_WEEKS}</span></div>
          <div><b class="num">${postop}</b><span>Días post-op</span></div>
          <div><b class="num">${Math.max(0, toGo)}</b><span>Días al viaje</span></div>
        </div>
        ${mountain()}
        <div class="phase-row"><span class="chip chip-accent">Fase ${ph.n}</span><b>${esc(ph.name)}</b><span class="muted small">${pct}% del programa</span></div>
        <div class="bar"><i style="width:${pct}%"></i></div>
      </section>

      ${askNext ? `<button class="banner banner-ask" data-act="knee" data-date="${yday}" data-moment="next">${ico('sun')}<span><b>¿Cómo amaneció tu rodilla?</b> Registra la respuesta al entrenamiento de ayer.</span></button>` : ''}

      ${today && (today.kind === 'gym' || today.kind === 'kb') ? `
      <a class="card today-card" href="#dia/${T}">
        <div class="today-top"><span class="eyebrow">Today's workout · ${dLong(T)}</span>${isDone(T) ? '<span class="pill pill-ok">Completado</span>' : ''}</div>
        <h2>${esc(today.title)}</h2>
        <p class="muted">${esc(today.sub)}</p>
        <div class="meta-row">${piste(today.level, true)}<span>≈${today.duration} min</span>${today.deload ? '<span class="chip">Descarga</span>' : ''}</div>
        <span class="btn btn-primary btn-block">${isDone(T) ? 'Ver entrenamiento' : 'Empezar entrenamiento'}</span>
      </a>` : today ? `
      <a class="card today-card" href="#dia/${T}">
        <span class="eyebrow">Hoy · ${dLong(T)}</span>
        <h2>${esc(today.title)}</h2><p class="muted">${esc(today.sub)}</p>
      </a>` : ''}

      <div class="grid-2">
        <div class="card stat"><span class="eyebrow">Días entrenados</span><b class="num big">${td.done}<small>/${td.planned}</small></b><span class="muted small">${td.planned ? Math.round((td.done / td.planned) * 100) : 0}% de adherencia</span></div>
        <div class="card stat"><span class="eyebrow">Racha</span><b class="num big">${streak()}</b><span class="muted small">sesiones seguidas</span></div>
      </div>

      <button class="card knee-card light-${light || 'none'}" data-act="knee" data-date="${T}" data-moment="${kneeOf(T, 'pre') ? 'post' : 'pre'}">
        <div class="knee-dots"><i class="g"></i><i class="y"></i><i class="r"></i></div>
        <div><span class="eyebrow">Semáforo de rodilla</span>
        <b>${light ? LIGHT[light].name : 'Sin registro hoy'}</b>
        <span class="muted small">${light ? esc(LIGHT[light].txt) : 'Toca para registrar dolor, inflamación e inestabilidad.'}</span></div>
      </button>
      ${light === 'red' ? `<div class="banner banner-red">${LIGHT.red.txt}</div>` : ''}

      ${nxt ? `<a class="card next-card" href="#dia/${nxt.date}"><span class="eyebrow">Próximo entrenamiento</span><div class="next-row"><b>${dLong(nxt.date)}</b>${piste(nxt.level)}</div><span>${esc(nxt.title)}</span></a>` : ''}

      <section class="card">
        <span class="eyebrow">Objetivo de la fase ${ph.n}</span>
        <h3>${esc(ph.name)}</h3>
        <ul class="ticks">${ph.goal.map((g) => `<li>${esc(g)}</li>`).join('')}</ul>
        <p class="muted small">${esc(ph.focus)}</p>
      </section>

      <section class="card">
        <span class="eyebrow">Próximos hitos</span>
        <ol class="miles">${miles.map((m) => `<li class="mile mile-${m.kind}"><span class="mile-date num">${dShort(m.date)}</span><span>${esc(m.title)}</span></li>`).join('')}</ol>
      </section>

      <div class="grid-2">
        <a class="card link-card" href="#ski">${ico('mountain')}<b>Ski readiness</b><span class="muted small">Capacidades a evaluar</span></a>
        <a class="card link-card" href="#sabado">${ico('sun')}<b>Recovery Saturday</b><span class="muted small">Opciones suaves</span></a>
      </div>
      <p class="disclaimer">Esta app no sustituye tu rehabilitación ni diagnostica. Toda progresión de impacto, saltos, carrera, cambios de dirección, movimientos explosivos o laterales rápidos depende de la autorización de tu traumatólogo/fisioterapeuta.</p>`;
  }

  /* ---------- calendario ---------- */
  let calMode = 'week';
  let calCursor = T < PROG.START ? PROG.START : T > PROG.END ? PROG.END : T;
  const mondayOf = (s) => { const d = PROG.parse(s); const off = (d.getDay() + 6) % 7; return PROG.addDays(s, -off); };
  function dayStatus(date) {
    const s = PROG.session(date);
    if (!s) return '';
    if (s.kind === 'rest') return 'rest';
    if (isDone(date)) return 'done';
    if (date === T) return 'today';
    if (date < T && (s.kind === 'gym' || s.kind === 'kb')) return 'missed';
    return 'pending';
  }
  const STATUS_TXT = { done: 'Completado', today: 'Hoy', missed: 'No registrado', pending: 'Pendiente', rest: 'Descanso' };

  function renderCalendar() {
    let body = '';
    if (calMode === 'week') {
      const mon = mondayOf(calCursor);
      const wk = PROG.weekOf(mon);
      body += `<div class="cal-nav"><button class="icon-btn" data-act="cal-prev" aria-label="Semana anterior">‹</button><b>Semana ${wk} · ${dShort(mon)} – ${dShort(PROG.addDays(mon, 6))}</b><button class="icon-btn" data-act="cal-next" aria-label="Semana siguiente">›</button></div>`;
      if (PROG.DELOAD_WEEKS.includes(wk)) body += '<div class="banner">Semana de descarga: una serie menos y RPE un punto más bajo.</div>';
      body += '<div class="week-list">';
      for (let i = 0; i < 7; i++) {
        const d = PROG.addDays(mon, i), s = PROG.session(d), st = dayStatus(d);
        if (!s) { body += `<div class="day-row day-out"><div class="day-date"><span>${DOW3[(i + 1) % 7]}</span><b class="num">${PROG.parse(d).getDate()}</b></div><span class="muted">Fuera del programa</span></div>`; continue; }
        body += `<a class="day-row st-${st} kind-${s.kind}" href="#dia/${d}">
          <div class="day-date"><span>${DOW3[s.dow]}</span><b class="num">${PROG.parse(d).getDate()}</b></div>
          <div class="day-main"><b>${esc(s.title)}</b>
            <div class="meta-row small">${s.level ? piste(s.level, true) : ''}${s.duration ? `<span>${s.duration} min</span>` : ''}${s.muscles.slice(0, 3).map((m) => `<span class="tag">${EX.TAG_ES[m]}</span>`).join('')}</div></div>
          <span class="status st-${st}">${st === 'done' ? ico('check') : ''}${STATUS_TXT[st] || ''}</span></a>`;
      }
      body += '</div>';
    } else {
      const d0 = PROG.parse(calCursor), y = d0.getFullYear(), m = d0.getMonth();
      const first = PROG.fmt(new Date(y, m, 1)), days = new Date(y, m + 1, 0).getDate();
      body += `<div class="cal-nav"><button class="icon-btn" data-act="cal-prev" aria-label="Mes anterior">‹</button><b>${MONL[m]} ${y}</b><button class="icon-btn" data-act="cal-next" aria-label="Mes siguiente">›</button></div>`;
      body += '<div class="month"><div class="month-head">' + ['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((x) => `<span>${x}</span>`).join('') + '</div><div class="month-grid">';
      const lead = (PROG.parse(first).getDay() + 6) % 7;
      for (let i = 0; i < lead; i++) body += '<span class="mcell empty"></span>';
      for (let i = 1; i <= days; i++) {
        const d = PROG.fmt(new Date(y, m, i)), s = PROG.session(d), st = dayStatus(d);
        if (!s) { body += `<span class="mcell out"><b class="num">${i}</b></span>`; continue; }
        body += `<a class="mcell st-${st} kind-${s.kind}${d === T ? ' is-today' : ''}" href="#dia/${d}" aria-label="${dLong(d)}: ${esc(s.title)}"><b class="num">${i}</b><i class="dot"></i>${st === 'done' ? '<i class="tick">✓</i>' : ''}</a>`;
      }
      body += '</div></div><div class="legend"><span><i class="dot kind-gym"></i>Gimnasio</span><span><i class="dot kind-kb"></i>Kettlebell</span><span><i class="dot kind-recovery"></i>Recuperación</span><span><i class="dot kind-rest"></i>Descanso</span><span>✓ Completado</span></div>';
    }
    view().innerHTML = `<header class="page-head"><h1 class="display">Calendario</h1>
      <div class="seg" role="tablist"><button role="tab" class="${calMode === 'week' ? 'on' : ''}" data-act="cal-mode" data-mode="week">Semana</button><button role="tab" class="${calMode === 'month' ? 'on' : ''}" data-act="cal-mode" data-mode="month">Mes</button></div></header>${body}`;
  }

  /* ---------- día / today's workout ---------- */
  function rxLine(rx, ex) {
    const parts = [`${rx.s} × ${rx.r}`];
    if (rx.rpe) parts.push(`RPE ${rx.rpe}`);
    if (rx.tempo && ex.unit === 'reps') parts.push(`Tempo ${rx.tempo}`);
    return parts.join(' · ');
  }
  function itemCard(item, date, opts = {}) {
    const ex = EX.BY[item.id];
    const rec = ensureSess(date);
    const done = !!rec.checks[item.code];
    const logged = setsOf(date, item.id);
    const best = bestBySide(logged);
    const summary = logged.length ? (ex.uni ? `Izq ${fmtSet(best.L, ex)} · Der ${fmtSet(best.R, ex)}` : `${logged.length} series · mejor ${fmtSet(best.B || best.b, ex)}`) : '';
    return `<div class="item ${done ? 'is-done' : ''} ${opts.locked ? 'is-locked' : ''}">
      <button class="item-main" data-act="ex" data-id="${item.id}" data-date="${date}" data-code="${item.code}">
        <span class="item-thumb">${thumb(item.id)}</span>
        <span class="item-txt"><span class="item-top"><span class="code">${esc(opts.label || item.code)}</span>${ex.uni ? '<span class="tag tag-uni">Unilateral</span>' : ''}${ex.sp ? `<span class="tag tag-sp">${ico('star')}Clave</span>` : ''}</span>
        <b>${esc(ex.n)}</b><span class="rx">${esc(rxLine(item.rx, ex)).split(' · ').map((x) => `<span class="nw">${x}</span>`).join(' · ')}</span>
        ${summary ? `<span class="logged">${esc(summary)}</span>` : ''}${item.note ? `<span class="note">${esc(item.note)}</span>` : ''}</span>
      </button>
      <div class="item-side">
        <button class="check ${done ? 'on' : ''}" data-act="check" data-date="${date}" data-key="${item.code}" aria-pressed="${done}" aria-label="Marcar ${esc(ex.n)} como completado">${ico('check')}</button>
        <button class="mini-btn" data-act="log" data-date="${date}" data-code="${item.code}">Anotar</button>
      </div></div>`;
  }

  function findItem(date, code) {
    const s = PROG.session(date);
    if (!s) return null;
    const all = PROG.allItems(s);
    let it = all.find((i) => i.code === code);
    if (!it && s.auth) {
      const a = s.auth.find((x) => x.code === code || 'ALT' + x.id === code);
      if (a) it = code.startsWith('ALT') ? { code, id: a.alt, rx: RX_ALT(a) } : a;
    }
    return it;
  }
  const RX_ALT = (a) => ({ s: a.rx.s, r: '6–8', rpe: '6–7', rest: a.rx.rest, tempo: '3-1-1' });

  function renderDay(date) {
    const s = PROG.session(date);
    if (!s) {
      view().innerHTML = `<header class="page-head"><h1 class="display">Today's workout</h1></header><div class="card empty"><p>${date < PROG.START ? 'El programa empieza el jueves 1 de octubre de 2026.' : 'El programa terminó el 15 de febrero de 2027.'}</p><a class="btn btn-primary" href="#dia/${date < PROG.START ? PROG.START : PROG.END}">Ir al ${date < PROG.START ? 'primer' : 'último'} día</a></div>`;
      return;
    }
    const prevD = PROG.addDays(date, -1), nextD = PROG.addDays(date, 1);
    const nav = `<div class="day-nav">${PROG.inProgram(prevD) ? `<a class="icon-btn" href="#dia/${prevD}" aria-label="Día anterior">‹</a>` : '<span></span>'}<span class="muted small">Fase ${s.phase} · Semana ${s.week}</span>${PROG.inProgram(nextD) ? `<a class="icon-btn" href="#dia/${nextD}" aria-label="Día siguiente">›</a>` : '<span></span>'}</div>`;
    const head = `<header class="page-head day-head"><p class="eyebrow">${date === T ? "Today's workout" : 'Entrenamiento'} · ${dLong(date)}</p><h1 class="display">${esc(s.title)}</h1><p class="muted">${esc(s.sub)}</p></header>`;

    if (s.kind === 'recovery') { view().innerHTML = nav + head + recoveryBody(date); return; }
    if (s.kind === 'rest') {
      view().innerHTML = nav + head + `<div class="card"><p>Domingo de descanso. Si la rodilla está bien, una caminata corta es opcional. Prioriza sueño, hidratación y comida.</p></div>${kneeRow(date)}`;
      return;
    }
    if (s.kind === 'travel') {
      view().innerHTML = nav + head + `<div class="banner banner-pro"><b>EVALUACIÓN FINAL POR TRAUMATÓLOGO/FISIOTERAPEUTA ANTES DE REGRESAR AL ESQUÍ.</b></div>
        <div class="card"><p>Llegaste al final del programa. Revisa tu <a href="#ski">Ski readiness</a> y lleva tus gráficas de <a href="#progreso">progreso</a> a la evaluación. La decisión de volver a esquiar es de tus profesionales de salud.</p></div>`;
      return;
    }

    const rec = ensureSess(date);
    const auth = settings().auth || {};
    const mainRx = s.blocks[0] && s.blocks[0].items[0] ? s.blocks[0].items[0].rx : null;
    const kn = latestKnee(date), light = kneeLight(kn);
    let html = nav + head;
    html += `<div class="meta-strip">${piste(s.level, true)}<span>${ico('timer')}≈${s.duration} min</span>${mainRx ? `<span>RPE ${mainRx.rpe}</span>` : ''}${s.deload ? '<span class="chip">Descarga</span>' : ''}</div>`;
    html += kneeRow(date);
    if (light === 'red') html += `<div class="banner banner-red">${LIGHT.red.txt}</div>`;
    else if (light === 'yellow') html += `<div class="banner banner-yellow">${LIGHT.yellow.txt}</div>`;

    html += `<section class="block"><div class="block-head"><h2>Calentamiento</h2><span class="muted small">8–10 min</span></div><div class="warm">${s.warmup.map((w, i) => {
      const k = 'w' + i, on = !!rec.checks[k];
      return `<div class="warm-row ${on ? 'is-done' : ''}"><button class="check sm ${on ? 'on' : ''}" data-act="check" data-date="${date}" data-key="${k}" aria-pressed="${on}" aria-label="Marcar ${esc(w.n)}">${ico('check')}</button><button class="warm-txt" data-act="ex" data-id="${w.id}"><b>${esc(w.n)}</b><span>${esc(w.dose)}</span></button></div>`;
    }).join('')}</div></section>`;

    s.blocks.forEach((b) => {
      const rest = b.items[0].rx.rest;
      const restSec = Math.round((topOf(rest) || 60) * (/min/.test(rest) ? 60 : 1));
      html += `<section class="block"><div class="block-head"><h2>Bloque ${b.code}</h2><button class="rest-btn" data-act="timer" data-sec="${restSec}">${ico('timer')}Descanso ${esc(rest)}</button></div>
        <p class="muted small block-hint">Alterna ${b.items.map((i) => i.code).join(' → ')} y descansa tras cada vuelta.</p>${b.items.map((it) => itemCard(it, date)).join('')}</section>`;
    });
    if (s.finisher.length) html += `<section class="block"><div class="block-head"><h2>Finisher</h2></div>${s.finisher.map((it) => itemCard(it, date)).join('')}</section>`;
    if (s.ski.length) html += `<section class="block block-ski"><div class="block-head"><h2>${ico('mountain')}SKI PREP</h2><span class="muted small">Bajo impacto</span></div>${s.ski.map((it) => itemCard(it, date)).join('')}</section>`;
    if (s.auth.length) {
      html += `<section class="block block-auth"><div class="block-head"><h2>${ico('lock')}Dinámico</h2></div><div class="auth-note">SOLO SI TRAUMATÓLOGO/FISIOTERAPEUTA LO AUTORIZA</div>`;
      s.auth.forEach((a) => {
        const ex = EX.BY[a.id], ok = auth[ex.auth] && auth[ex.auth].ok;
        if (ok) html += itemCard(a, date, { label: 'Autorizado' }) + `<p class="muted small">Autorizado ${auth[ex.auth].by ? 'por ' + esc(auth[ex.auth].by) : ''} ${auth[ex.auth].date ? 'el ' + dShort(auth[ex.auth].date) : ''}. ${esc(a.rx.note || '')}</p>`;
        else html += `<div class="locked-row"><button class="locked" data-act="ex" data-id="${a.id}">${ico('lock')}<span><b>${esc(ex.n)}</b><span class="muted small">Requiere autorización: ${esc(EX.AUTH[ex.auth])}</span></span></button></div>` + itemCard({ code: 'ALT' + a.id, id: a.alt, rx: RX_ALT(a) }, date, { label: 'En su lugar' });
      });
      html += '<a class="mini-link" href="#ajustes">Registrar autorizaciones</a></section>';
    }

    html += `<section class="block"><label class="field"><span>Notas de la sesión</span><textarea id="notes-${date}" data-act="notes" data-date="${date}" rows="3" placeholder="Cómo te sentiste, ajustes de carga, indicaciones del fisio…">${esc(rec.notes || '')}</textarea></label></section>`;
    html += `<div class="finish">${isDone(date)
      ? `<div class="pill pill-ok big">${ico('check')}Sesión completada</div><button class="btn btn-ghost" data-act="undo-finish" data-date="${date}">Marcar como pendiente</button>`
      : `<button class="btn btn-primary btn-block" data-act="finish" data-date="${date}">Terminar sesión</button>`}
      <button class="btn btn-ghost btn-block" data-act="knee" data-date="${date}" data-moment="post">Semáforo después de entrenar</button>
      ${date < T ? `<button class="btn btn-ghost btn-block" data-act="knee" data-date="${date}" data-moment="next">¿Cómo amaneció la rodilla al día siguiente?</button>` : ''}</div>`;
    view().innerHTML = html;
  }

  function kneeRow(date) {
    const moments = [['pre', 'Antes'], ['post', 'Después'], ['next', 'Día siguiente']];
    return `<div class="knee-row"><span class="eyebrow">Semáforo de rodilla</span><div class="knee-pills">${moments.map(([m, n]) => {
      const l = kneeLight(kneeOf(date, m));
      return `<button class="kpill light-${l || 'none'}" data-act="knee" data-date="${date}" data-moment="${m}"><i></i>${n}</button>`;
    }).join('')}</div></div>`;
  }

  /* ---------- sábado ---------- */
  function recoveryBody(date) {
    const rec = ensureSess(date);
    const r = rec.recovery || {};
    return `<div class="banner">Opcional. No lo conviertas en otro día pesado: sal sintiéndote mejor de lo que entraste.</div>
      <div class="rec-list">${PROG.RECOVERY.map((o) => {
        const on = !!(r.opts || {})[o.id];
        return `<div class="rec ${on ? 'is-done' : ''}"><button class="check ${on ? 'on' : ''}" data-act="rec-opt" data-date="${date}" data-opt="${o.id}" aria-pressed="${on}" aria-label="Marcar ${esc(o.name)}">${ico('check')}</button><div><b>${esc(o.name)}</b><span class="dose">${esc(o.dose)}</span><p class="muted small">${esc(o.desc)}</p></div></div>`;
      }).join('')}</div>
      <section class="card"><span class="eyebrow">Rutina de movilidad · 15–20 min</span><ol class="mob">${PROG.MOBILITY.map(([n, d]) => `<li><span>${esc(n)}</span><b>${esc(d)}</b></li>`).join('')}</ol></section>
      <section class="card"><label class="field"><span>Minutos totales</span><input id="recmin-${date}" type="number" inputmode="numeric" min="0" max="240" value="${esc(rec.duration_min ?? '')}" data-act="rec-min" data-date="${date}" placeholder="p. ej. 30"></label>
      <label class="field"><span>Notas (incluye ejercicios de fisio)</span><textarea id="notes-${date}" data-act="notes" data-date="${date}" rows="3">${esc(rec.notes || '')}</textarea></label></section>
      ${kneeRow(date)}`;
  }
  function renderSaturday() {
    let d = T;
    const dow = PROG.parse(T).getDay();
    if (dow !== 6) d = PROG.addDays(T, (6 - dow + 7) % 7);
    if (!PROG.inProgram(d)) d = '2026-10-03';
    view().innerHTML = `<header class="page-head"><p class="eyebrow">${dLong(d)}</p><h1 class="display">Recovery Saturday</h1><p class="muted">Bicicleta suave, caminata, movilidad, recuperación o ejercicios de fisio.</p></header>` + recoveryBody(d);
  }

  /* ---------- biblioteca ---------- */
  let libTag = null, libQ = '';
  function renderLibrary() {
    const q = libQ.trim().toLowerCase();
    const list = EX.LIST.filter((e) => (!libTag || e.tags.includes(libTag)) && (!q || (e.n + ' ' + e.es + ' ' + e.eq).toLowerCase().includes(q)));
    view().innerHTML = `<header class="page-head"><h1 class="display">Exercise library</h1><p class="muted">${EX.LIST.length} ejercicios. Toca uno para ver cómo se hace.</p></header>
      <label class="search"><span class="sr">Buscar ejercicio</span><input id="lib-q" type="search" placeholder="Buscar: step-down, curl, KB…" value="${esc(libQ)}" data-act="lib-q" autocomplete="off"></label>
      <div class="chips" role="group" aria-label="Filtrar por grupo"><button class="chipf ${!libTag ? 'on' : ''}" data-act="tag" data-tag="">Todos</button>${EX.TAGS.map(([k, n]) => `<button class="chipf ${libTag === k ? 'on' : ''}" data-act="tag" data-tag="${k}">${n}</button>`).join('')}</div>
      <div class="lib-grid" id="lib-grid">${libCards(list)}</div>`;
  }
  function libCards(list) {
    if (!list.length) return '<p class="muted">Ningún ejercicio coincide. Prueba otro filtro.</p>';
    return list.map((e) => `<button class="lib-card" data-act="ex" data-id="${e.id}">
      <span class="lib-thumb">${thumb(e.id)}${e.auth ? `<span class="lock-badge">${ico('lock')}</span>` : ''}${e.sp ? `<span class="sp-badge">${ico('star')}</span>` : ''}</span>
      <b>${esc(e.n)}</b><span class="muted small">${esc(e.es)}</span>
      <span class="lib-tags">${e.tags.slice(0, 3).map((t) => `<span class="tag">${EX.TAG_ES[t]}</span>`).join('')}</span></button>`).join('');
  }

  /* ---------- detalle de ejercicio ---------- */
  let curEx = null;
  function showExercise(id, date, code) {
    const ex = EX.BY[id];
    if (!ex) return;
    curEx = id;
    const item = date && code ? findItem(date, code) : null;
    const n = FIG.frameCount(ex.fig);
    const labels = ex.fig.labels;
    const frames = ex.fig.custom ? '' : n > 2
      ? `<div class="frames frames-many">${ex.fig.frames.map((_, i) => `<figure>${FIG.staticSVG(ex.fig, i)}<figcaption>${i + 1}. ${esc(labels ? labels[i] : '')}</figcaption></figure>`).join('')}</div>`
      : n === 2 ? `<div class="frames"><figure>${FIG.staticSVG(ex.fig, 0)}<figcaption>1 · Posición inicial</figcaption></figure><span class="frames-arrow">→</span><figure>${FIG.staticSVG(ex.fig, 1)}<figcaption>2 · Movimiento</figcaption></figure></div>` : '';
    const hist = exDates(id).slice(-5).reverse();
    const sug = item ? suggestion(item, date) : null;
    const html = `
      <div class="sheet-head"><div><p class="eyebrow">${esc(ex.eq)}${ex.uni ? ' · Unilateral' : ''}</p><h2>${esc(ex.n)}</h2><p class="muted">${esc(ex.es)}</p></div><button class="icon-btn" data-act="close" aria-label="Cerrar">${ico('x')}</button></div>
      ${ex.auth ? `<div class="banner banner-auth">${ico('lock')}<b>SOLO SI TRAUMATÓLOGO/FISIOTERAPEUTA LO AUTORIZA</b> · ${esc(EX.AUTH[ex.auth])}</div>` : ''}
      <div class="anim-wrap"><div class="anim" id="anim"></div><button class="icon-btn play" data-act="play" aria-label="Reproducir o pausar">${ico('pause')}</button>
      <div class="legend fig-legend"><span><i class="sw sw-left"></i>Pierna izquierda (LCA)</span><span><i class="sw sw-body"></i>Resto del cuerpo</span></div></div>
      ${frames}
      ${item ? `<div class="rx-box"><div><span class="eyebrow">Hoy</span><b>${esc(rxLine(item.rx, ex))}</b><span class="muted small">Descanso ${esc(item.rx.rest || '—')}</span></div><button class="btn btn-primary" data-act="log" data-date="${date}" data-code="${code}">Anotar series</button></div>
        ${sug ? `<div class="sug sug-${sug.k}"><span class="eyebrow">Progresión</span><p>${esc(sug.t)}</p></div>` : ''}` : ''}
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
      <p class="muted small center">Abre una búsqueda de videos; elige demostraciones de fisioterapeutas o entrenadores certificados.</p>
      ${hist.length ? `<section><span class="eyebrow">Historial reciente</span><ul class="hist">${hist.map((d) => { const b = bestBySide(setsOf(d, id)); return `<li><span class="num">${dShort(d)}</span><span>${ex.uni ? `Izq ${esc(fmtSet(b.L, ex))} · Der ${esc(fmtSet(b.R, ex))}` : esc(fmtSet(b.B || b.b, ex))}</span></li>`; }).join('')}</ul></section>` : ''}`;
    openSheet(html, 'sheet-ex');
    const el = $('#anim');
    if (reduceMotion) { el.innerHTML = FIG.staticSVG(ex.fig, null, 'fig-anim'); $('[data-act="play"]').innerHTML = ico('play'); }
    else stopAnim = FIG.animate(el, ex.fig);
  }

  /* ---------- registro de series ---------- */
  function openLog(date, code) {
    const item = findItem(date, code);
    if (!item) return;
    const ex = EX.BY[item.id];
    const sides = ex.uni ? [['L', 'Izq'], ['R', 'Der']] : [['B', '']];
    const existing = setsOf(date, item.id);
    const prev = lastLogged(item.id, date);
    const prevSets = prev ? setsOf(prev, item.id) : [];
    const nSets = Math.max(item.rx.s, existing.reduce((m, s) => Math.max(m, s.set_no), 0));
    const repLbl = ex.unit === 'time' ? 'seg' : ex.unit === 'dist' ? 'm' : ex.unit === 'cm' ? 'cm' : 'reps';
    const val = (n, sd, f) => { const r = existing.find((s) => s.set_no === n && (s.side || 'B') === sd); return r && r[f] != null ? r[f] : ''; };
    const ph = (n, sd, f) => { const r = prevSets.find((s) => s.set_no === n && (s.side || 'B') === sd); return r && r[f] != null ? r[f] : ''; };
    let rows = '';
    for (let n = 1; n <= nSets; n++) {
      rows += `<div class="set"><span class="set-n num">${n}</span><div class="set-sides">${sides.map(([sd, lbl]) => `
        <div class="set-line">${lbl ? `<span class="side side-${sd}">${lbl}</span>` : ''}
          <label><span class="sr">Peso serie ${n} ${lbl}</span><input id="w-${n}-${sd}" type="number" inputmode="decimal" step="0.5" min="0" placeholder="${esc(ph(n, sd, 'weight')) || 'kg'}" value="${esc(val(n, sd, 'weight'))}"></label>
          <label><span class="sr">${repLbl} serie ${n} ${lbl}</span><input id="r-${n}-${sd}" type="number" inputmode="decimal" min="0" placeholder="${esc(ph(n, sd, 'reps')) || repLbl}" value="${esc(val(n, sd, 'reps'))}"></label>
          <label><span class="sr">RPE serie ${n} ${lbl}</span><input id="p-${n}-${sd}" type="number" inputmode="decimal" step="0.5" min="1" max="10" placeholder="RPE" value="${esc(val(n, sd, 'rpe'))}"></label>
        </div>`).join('')}</div></div>`;
    }
    const sug = suggestion(item, date);
    openSheet(`
      <div class="sheet-head"><div><p class="eyebrow">${esc(item.code)} · ${dLong(date)}</p><h2>${esc(ex.n)}</h2><p class="rx">${esc(rxLine(item.rx, ex))}</p></div><button class="icon-btn" data-act="close" aria-label="Cerrar">${ico('x')}</button></div>
      <div class="sug sug-${sug.k}"><span class="eyebrow">Progresión</span><p>${esc(sug.t)}</p>${prev ? `<p class="muted small">Última vez (${dShort(prev)}): ${ex.uni ? `Izq ${esc(fmtSet(bestBySide(prevSets).L, ex))} · Der ${esc(fmtSet(bestBySide(prevSets).R, ex))}` : esc(fmtSet(bestBySide(prevSets).B, ex))}</p>` : ''}</div>
      ${ex.uni ? '<p class="muted small">Empieza con la izquierda. La derecha hace las mismas reps que logró la izquierda.</p>' : ''}
      <div class="set-head"><span></span><span>kg</span><span>${repLbl}</span><span>RPE</span></div>
      <div id="sets" data-n="${nSets}">${rows}</div>
      <button class="btn btn-ghost btn-block" data-act="add-set" data-date="${date}" data-code="${code}">+ Agregar serie</button>
      <p class="muted small">Peso vacío = peso corporal. RPE 10 = no podías hacer ni una rep más.</p>
      <button class="btn btn-primary btn-block" data-act="save-sets" data-date="${date}" data-code="${code}">Guardar</button>`, 'sheet-log');
  }

  function saveSets(date, code) {
    const item = findItem(date, code);
    const ex = EX.BY[item.id];
    const sides = ex.uni ? ['L', 'R'] : ['B'];
    const n = +$('#sets').dataset.n;
    const read = (id) => { const el = $('#' + id); if (!el || el.value === '') return null; const v = parseFloat(el.value.replace(',', '.')); return isNaN(v) ? null : v; };
    let count = 0;
    for (let i = 1; i <= n; i++) sides.forEach((sd) => {
      const id = `${date}|${item.id}|${i}|${sd}`;
      const w = read(`w-${i}-${sd}`), r = read(`r-${i}-${sd}`), p = read(`p-${i}-${sd}`);
      if (r == null && w == null) { if (DB.sets[id] && !DB.sets[id].deleted) put('sets', Object.assign({}, DB.sets[id], { deleted: true })); return; }
      put('sets', { id, date, exercise_id: item.id, slot: code, set_no: i, side: sd, weight: w, reps: r, rpe: p });
      count++;
    });
    if (count) {
      const rec = ensureSess(date);
      rec.checks = Object.assign({}, rec.checks, { [code]: true });
      put('sessions', rec);
    }
    closeSheet();
    toast(count ? 'Series guardadas' : 'Sin series para guardar');
    render();
  }

  /* ---------- semáforo (formulario) ---------- */
  function openKnee(date, moment) {
    const r = kneeOf(date, moment) || { pain: 0, swelling: 'no', instability: false, motion_loss: false, unusual: false, notes: '' };
    const title = { pre: 'Antes de entrenar', post: 'Después de entrenar', next: 'Al día siguiente' }[moment];
    openSheet(`
      <div class="sheet-head"><div><p class="eyebrow">Semáforo de rodilla · ${dLong(date)}</p><h2>${title}</h2></div><button class="icon-btn" data-act="close" aria-label="Cerrar">${ico('x')}</button></div>
      <form id="knee-form" data-date="${date}" data-moment="${moment}">
        <label class="field"><span>Dolor en la rodilla izquierda: <b id="pain-v" class="num">${r.pain}</b>/10</span><input id="k-pain" type="range" min="0" max="10" step="1" value="${r.pain}"></label>
        <fieldset class="field"><legend>Inflamación</legend><div class="seg seg-wide">${[['no', 'No'], ['leve', 'Leve'], ['si', 'Sí, notable']].map(([v, n]) => `<label><input type="radio" name="sw" value="${v}" ${r.swelling === v ? 'checked' : ''}><span>${n}</span></label>`).join('')}</div></fieldset>
        <label class="toggle"><input id="k-inst" type="checkbox" ${r.instability ? 'checked' : ''}><span>Sensación de inestabilidad o que la rodilla "se va"</span></label>
        <label class="toggle"><input id="k-mot" type="checkbox" ${r.motion_loss ? 'checked' : ''}><span>Pérdida de movimiento (no extiende o no flexiona como antes)</span></label>
        <label class="toggle"><input id="k-unu" type="checkbox" ${r.unusual ? 'checked' : ''}><span>Molestia, fatiga o respuesta inusual</span></label>
        <label class="field"><span>Notas</span><textarea id="k-notes" rows="2">${esc(r.notes || '')}</textarea></label>
        <div id="k-result"></div>
        <button class="btn btn-primary btn-block" type="submit">Guardar</button>
      </form>
      <div class="legend-lights"><p><i class="g"></i><b>Verde</b> ${LIGHT.green.txt}</p><p><i class="y"></i><b>Amarillo</b> Molestia, fatiga o respuesta inusual que requiere vigilancia y posible ajuste.</p><p><i class="r"></i><b>Rojo</b> Dolor significativo, inflamación, inestabilidad o pérdida de movimiento.</p></div>`, 'sheet-knee');
    updateKneeResult();
  }
  function kneeFormValue() {
    const f = $('#knee-form');
    return { pain: +$('#k-pain').value, swelling: (f.querySelector('input[name="sw"]:checked') || {}).value || 'no', instability: $('#k-inst').checked, motion_loss: $('#k-mot').checked, unusual: $('#k-unu').checked, notes: $('#k-notes').value };
  }
  function updateKneeResult() {
    const v = kneeFormValue(), l = kneeLight(v);
    $('#pain-v').textContent = v.pain;
    $('#k-result').innerHTML = `<div class="k-result light-${l}"><i></i><div><b>${LIGHT[l].name}</b><p>${esc(LIGHT[l].txt)}</p></div></div>`;
  }

  /* ---------- progreso ---------- */
  let progEx = null;
  function lineChart({ series, unit = '', empty, height = 170, yMin = null, ref = null }) {
    const W = 340, H = height, pl = 36, pr = 14, pt = 14, pb = 24;
    const x0 = PROG.parse(PROG.START).getTime(), x1 = PROG.parse(PROG.END).getTime();
    const X = (s) => pl + ((PROG.parse(s).getTime() - x0) / (x1 - x0)) * (W - pl - pr);
    const pts = series.flatMap((s) => s.points);
    let lo, hi;
    if (pts.length) { lo = Math.min(...pts.map((p) => p.y)); hi = Math.max(...pts.map((p) => p.y)); }
    else { lo = 0; hi = 10; }
    if (ref != null) { lo = Math.min(lo, ref); hi = Math.max(hi, ref); }
    if (yMin != null) lo = Math.min(lo, yMin);
    if (hi === lo) { hi += 1; lo = Math.max(0, lo - 1); }
    const raw = (hi - lo) / 3, mag = Math.pow(10, Math.floor(Math.log10(raw))), step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw);
    lo = Math.floor(lo / step) * step; hi = Math.ceil(hi / step) * step;
    const Y = (v) => pt + (1 - (v - lo) / (hi - lo)) * (H - pt - pb);
    let g = '';
    for (let v = lo; v <= hi + 1e-9; v += step) g += `<line x1="${pl}" x2="${W - pr}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}" class="c-grid"/><text x="${pl - 6}" y="${(Y(v) + 3.5).toFixed(1)}" class="c-ax" text-anchor="end">${+v.toFixed(2)}</text>`;
    [['2026-10-01', 'oct'], ['2026-11-01', 'nov'], ['2026-12-01', 'dic'], ['2027-01-01', 'ene'], ['2027-02-01', 'feb']].forEach(([d, n]) => { g += `<line x1="${X(d).toFixed(1)}" x2="${X(d).toFixed(1)}" y1="${H - pb}" y2="${H - pb + 4}" class="c-axl"/><text x="${(X(d) + 2).toFixed(1)}" y="${H - 8}" class="c-ax">${n}</text>`; });
    g += `<line x1="${pl}" x2="${W - pr}" y1="${H - pb}" y2="${H - pb}" class="c-axl"/>`;
    if (ref != null) g += `<line x1="${pl}" x2="${W - pr}" y1="${Y(ref).toFixed(1)}" y2="${Y(ref).toFixed(1)}" class="c-ref"/><text x="${W - pr}" y="${(Y(ref) - 4).toFixed(1)}" class="c-ax" text-anchor="end">${ref}${unit}</text>`;
    if (T >= PROG.START && T <= PROG.END) g += `<line x1="${X(T).toFixed(1)}" x2="${X(T).toFixed(1)}" y1="${pt}" y2="${H - pb}" class="c-today"/>`;
    series.forEach((s) => {
      const p = s.points.slice().sort((a, b) => (a.x < b.x ? -1 : 1));
      if (!p.length) return;
      const d = p.map((q, i) => `${i ? 'L' : 'M'}${X(q.x).toFixed(1)} ${Y(q.y).toFixed(1)}`).join(' ');
      if (p.length > 1) g += `<path d="${d} L${X(p[p.length - 1].x).toFixed(1)} ${H - pb} L${X(p[0].x).toFixed(1)} ${H - pb} Z" class="c-area c-${s.cls}"/>`;
      g += `<path d="${d}" class="c-line c-${s.cls}"/>`;
      p.forEach((q, i) => { g += `<circle cx="${X(q.x).toFixed(1)}" cy="${Y(q.y).toFixed(1)}" r="${i === p.length - 1 ? 4 : 2.4}" class="c-pt c-${s.cls}"/>`; });
      const last = p[p.length - 1];
      g += `<text x="${Math.min(X(last.x) + 6, W - pr - 2).toFixed(1)}" y="${(Y(last.y) - 6).toFixed(1)}" class="c-val c-${s.cls}">${+last.y.toFixed(1)}${unit}</text>`;
    });
    const legend = series.length > 1 ? `<div class="legend">${series.map((s) => `<span><i class="sw sw-${s.cls}"></i>${esc(s.name)}</span>`).join('')}</div>` : '';
    const emptyMsg = !pts.length ? `<div class="c-empty"><p>${esc(empty || 'Sin datos todavía.')}</p></div>` : '';
    return `<div class="chart">${legend}<div class="c-wrap"><svg viewBox="0 0 ${W} ${H}" role="img">${g}</svg>${emptyMsg}</div></div>`;
  }

  function seriesFromSets(exId) {
    const ex = EX.BY[exId];
    const ds = exDates(exId);
    const out = { w: {}, r: {}, p: {}, lsi: [] };
    const sides = ex.uni ? ['L', 'R'] : ['B'];
    sides.forEach((sd) => { out.w[sd] = []; out.r[sd] = []; out.p[sd] = []; });
    ds.forEach((d) => {
      const ss = setsOf(d, exId);
      const best = bestBySide(ss);
      sides.forEach((sd) => {
        const b = best[sd]; if (!b) return;
        if (b.weight != null) out.w[sd].push({ x: d, y: +b.weight });
        if (b.reps != null) out.r[sd].push({ x: d, y: +b.reps });
        const rp = ss.filter((s) => (s.side || 'B') === sd && s.rpe != null).map((s) => +s.rpe);
        if (rp.length) out.p[sd].push({ x: d, y: rp.reduce((a, c) => a + c, 0) / rp.length });
      });
      if (ex.uni && best.L && best.R && cap(best.R) > 0) out.lsi.push({ x: d, y: Math.round((cap(best.L) / cap(best.R)) * 100) });
    });
    return out;
  }
  function weeklyLSI() {
    const byWeek = {};
    EX.LIST.filter((e) => e.uni).forEach((e) => {
      seriesFromSets(e.id).lsi.forEach((p) => { const w = PROG.weekOf(p.x); (byWeek[w] = byWeek[w] || []).push(p); });
    });
    return Object.keys(byWeek).map((w) => { const a = byWeek[w]; return { x: a[a.length - 1].x, y: Math.round(a.reduce((s, p) => s + p.y, 0) / a.length) }; });
  }
  function testSeries(testId) {
    const rs = live('tests').filter((r) => r.test === testId);
    return { L: rs.filter((r) => r.side === 'L').map((r) => ({ x: r.date, y: +r.value })), R: rs.filter((r) => r.side === 'R').map((r) => ({ x: r.date, y: +r.value })) };
  }
  const LR = (s, a = 'Izquierda', b = 'Derecha') => [{ name: a, cls: 'left', points: s.L }, { name: b, cls: 'right', points: s.R }];

  function renderProgress() {
    const withData = EX.LIST.filter((e) => exDates(e.id).length);
    if (!progEx || !EX.BY[progEx]) progEx = (withData.find((e) => e.uni) || withData[0] || EX.BY.sl_leg_press).id;
    const ex = EX.BY[progEx];
    const S = seriesFromSets(progEx);
    const sides = ex.uni ? [['L', 'Izquierda', 'left'], ['R', 'Derecha', 'right']] : [['B', ex.n, 'ink']];
    const mk = (key) => sides.map(([sd, n, cls]) => ({ name: n, cls, points: S[key][sd] }));
    const emptyEx = 'Todavía no hay series de este ejercicio. Anótalas desde Today\'s workout con el botón "Anotar".';
    const strL = testSeries('sl_press'), strE = testSeries('sl_ext');
    const lsiTest = (s) => s.L.filter((p) => s.R.find((q) => q.x === p.x)).map((p) => ({ x: p.x, y: Math.round((p.y / s.R.find((q) => q.x === p.x).y) * 100) }));
    const pain = live('knee').filter((k) => k.moment !== 'pre').map((k) => ({ x: k.date, y: +k.pain }));
    const opts = EX.LIST.slice().sort((a, b) => (exDates(b.id).length > 0) - (exDates(a.id).length > 0) || a.n.localeCompare(b.n));

    view().innerHTML = `<header class="page-head"><h1 class="display">My progress</h1><p class="muted">Octubre → febrero. Los datos salen solo de lo que registras.</p></header>
      <section class="card">
        <label class="field"><span>Ejercicio</span><select id="prog-ex" data-act="prog-ex">${opts.map((e) => `<option value="${e.id}" ${e.id === progEx ? 'selected' : ''}>${esc(e.n)}${exDates(e.id).length ? ` (${exDates(e.id).length})` : ''}</option>`).join('')}</select></label>
        <h3>Peso utilizado <small class="muted">mejor serie (kg)</small></h3>${lineChart({ series: mk('w'), unit: '', empty: emptyEx })}
        <h3>Repeticiones <small class="muted">en la mejor serie</small></h3>${lineChart({ series: mk('r'), empty: emptyEx })}
        <h3>RPE <small class="muted">promedio de la sesión</small></h3>${lineChart({ series: mk('p'), empty: emptyEx, yMin: 5 })}
        ${ex.uni ? `<h3>Diferencia izquierda / derecha <small class="muted">LSI %</small></h3>${lineChart({ series: [{ name: 'LSI', cls: 'accent', points: S.lsi }], unit: '%', ref: 90, empty: 'Anota ambos lados en ejercicios unilaterales para ver el índice de simetría.' })}<p class="muted small">LSI = capacidad estimada izquierda ÷ derecha × 100. En rehabilitación se suele usar 90% como referencia; tu fisio define el criterio.</p>` : ''}
      </section>
      <section class="card">
        <h3>Simetría global <small class="muted">promedio semanal de ejercicios unilaterales</small></h3>
        ${lineChart({ series: [{ name: 'LSI', cls: 'accent', points: weeklyLSI() }], unit: '%', ref: 90, empty: 'Se llena solo cuando anotes izquierda y derecha en ejercicios unilaterales.' })}
      </section>
      <section class="card">
        <div class="row-between"><h2>Pruebas</h2><button class="btn btn-primary" data-act="test">+ Registrar prueba</button></div>
        <p class="muted small">Hazlas en las fechas de "Pruebas" del calendario (una vez al mes), de preferencia con tu fisio.</p>
        <h3>Fuerza izquierda vs derecha <small class="muted">single-leg press, 8 reps (kg)</small></h3>${lineChart({ series: LR(strL), empty: 'Registra la prueba "Single-leg leg press · 8 reps".' })}
        <h3>Fuerza de cuádriceps <small class="muted">single-leg extension, 8 reps (kg)</small></h3>${lineChart({ series: LR(strE), empty: 'Registra la prueba "Single-leg leg extension · 8 reps".' })}
        <h3>Diferencia izq/der en pruebas de fuerza <small class="muted">LSI %</small></h3>${lineChart({ series: [{ name: 'Leg press', cls: 'accent', points: lsiTest(strL) }, { name: 'Leg extension', cls: 'ink', points: lsiTest(strE) }], unit: '%', ref: 90, empty: 'Aparece cuando registres la misma prueba con ambas piernas el mismo día.' })}
        <h3>Balance <small class="muted">ojos abiertos (s)</small></h3>${lineChart({ series: LR(testSeries('balance_eo')), unit: ' s', empty: 'Registra "Equilibrio a una pierna · ojos abiertos".' })}
        <h3>Step-down <small class="muted">reps controladas en 30 s</small></h3>${lineChart({ series: LR(testSeries('step_down_q')), empty: 'Registra "Step-down controlado".' })}
        <h3>Single-leg control <small class="muted">Y-balance anterior (cm)</small></h3>${lineChart({ series: LR(testSeries('ybal_ant')), unit: ' cm', empty: 'Registra "Y-balance anterior".' })}
        <h3>Single-leg control <small class="muted">sentadilla a una pierna a caja (reps)</small></h3>${lineChart({ series: LR(testSeries('sl_squat')), empty: 'Registra "Sentadilla a una pierna a caja".' })}
      </section>
      <section class="card">
        <h3>Rodilla <small class="muted">dolor después de entrenar y al día siguiente (0–10)</small></h3>
        ${lineChart({ series: [{ name: 'Dolor', cls: 'bad', points: pain }], empty: 'Registra el semáforo después de cada sesión.', yMin: 0 })}
      </section>
      ${testsTable()}`;
  }
  function testsTable() {
    const rs = live('tests').sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 30);
    if (!rs.length) return '';
    const name = (id) => (PROG.TESTS.find((t) => t.id === id) || {}).name || id;
    return `<section class="card"><h3>Registros de pruebas</h3><div class="table-wrap"><table><thead><tr><th>Fecha</th><th>Prueba</th><th>Lado</th><th>Valor</th></tr></thead><tbody>${rs.map((r) => `<tr><td class="num">${dShort(r.date)}</td><td>${esc(name(r.test))}</td><td>${r.side === 'L' ? 'Izq' : 'Der'}</td><td class="num">${+r.value}</td></tr>`).join('')}</tbody></table></div></section>`;
  }
  function openTest() {
    openSheet(`<div class="sheet-head"><div><p class="eyebrow">Pruebas</p><h2>Registrar prueba</h2></div><button class="icon-btn" data-act="close" aria-label="Cerrar">${ico('x')}</button></div>
      <form id="test-form">
        <label class="field"><span>Prueba</span><select id="t-test">${PROG.TESTS.map((t) => `<option value="${t.id}">${esc(t.name)}</option>`).join('')}</select></label>
        <p class="muted small" id="t-how">${esc(PROG.TESTS[0].how)}</p>
        <label class="field"><span>Fecha</span><input id="t-date" type="date" value="${T}" min="2026-09-01" max="2027-03-31"></label>
        <div class="grid-2"><label class="field"><span class="side side-L">Izquierda</span><input id="t-L" type="number" inputmode="decimal" step="0.5" min="0"></label>
        <label class="field"><span class="side side-R">Derecha</span><input id="t-R" type="number" inputmode="decimal" step="0.5" min="0"></label></div>
        <p class="muted small">Unidad: <b id="t-unit">${esc(PROG.TESTS[0].unit)}</b></p>
        <label class="field"><span>Notas</span><input id="t-notes" type="text"></label>
        <button class="btn btn-primary btn-block" type="submit">Guardar</button>
      </form>`);
  }

  /* ---------- ski readiness ---------- */
  function metricText(m) {
    if (!m) return 'Se evalúa con tu fisio (observación de calidad de movimiento).';
    if (m === 'adherence') { const t = trainingDays(T); return t.planned ? `Adherencia: ${t.done}/${t.planned} sesiones (${Math.round((t.done / t.planned) * 100)}%).` : 'Aún no hay sesiones planeadas a la fecha.'; }
    if (m === 'lsi') { const w = weeklyLSI(); return w.length ? `Último LSI semanal: ${w[w.length - 1].y}%.` : 'Sin datos de simetría aún.'; }
    if (m === 'main') {
      const ids = ['leg_press', 'rdl', 'db_rdl', 'goblet_squat', 'box_squat', 'hip_thrust'];
      const parts = ids.map((id) => { const s = seriesFromSets(id).w.B || []; return s.length >= 1 ? `${EX.BY[id].n}: ${s[0].y}→${s[s.length - 1].y} kg` : null; }).filter(Boolean);
      return parts.length ? parts.slice(0, 3).join(' · ') : 'Sin registros de los ejercicios principales aún.';
    }
    const s = testSeries(m);
    const l = s.L[s.L.length - 1], r = s.R[s.R.length - 1];
    return l || r ? `Última prueba: Izq ${l ? l.y : '—'} · Der ${r ? r.y : '—'}` : 'Sin pruebas registradas aún.';
  }
  function renderSki() {
    const st = settings();
    const ski = st.ski || {};
    const auth = st.auth || {};
    const STATUS = [['', 'Sin evaluar'], ['dev', 'En desarrollo'], ['pro', 'Revisado con mi fisio/traumatólogo']];
    view().innerHTML = `<header class="page-head"><h1 class="display">Ski readiness</h1><p class="muted">Las capacidades que tus profesionales deberán evaluar antes de que vuelvas a esquiar. La app muestra datos, no decide.</p></header>
      <div class="banner banner-pro"><b>EVALUACIÓN FINAL POR TRAUMATÓLOGO/FISIOTERAPEUTA ANTES DE REGRESAR AL ESQUÍ.</b></div>
      <div class="ready-list">${PROG.READINESS.map((c, i) => {
        const v = ski[c.id] || {};
        return `<section class="card ready st-${v.status || 'none'}"><div class="ready-top"><span class="num ready-n">${i + 1}</span><h3>${esc(c.name)}</h3></div>
          <p>${esc(c.why)}</p><p class="muted small"><b>Cómo lo desarrollamos:</b> ${esc(c.how)}</p>
          <p class="metric">${esc(metricText(c.metric))}</p>
          <label class="field"><span>Estado según tu profesional</span><select id="ski-st-${c.id}" data-act="ski-status" data-id="${c.id}">${STATUS.map(([k, n]) => `<option value="${k}" ${(v.status || '') === k ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
          <label class="field"><span>Notas de la evaluación</span><input id="ski-note-${c.id}" type="text" data-act="ski-note" data-id="${c.id}" value="${esc(v.note || '')}" placeholder="Lo que te dijo tu fisio/traumatólogo"></label></section>`;
      }).join('')}</div>
      <section class="card"><h3>Autorizaciones registradas</h3><ul class="auth-sum">${Object.entries(EX.AUTH).map(([k, n]) => `<li class="${auth[k] && auth[k].ok ? 'ok' : ''}">${auth[k] && auth[k].ok ? ico('check') : ico('lock')}<span>${esc(n)}</span><span class="muted small">${auth[k] && auth[k].ok ? `${auth[k].date ? dShort(auth[k].date) : ''} ${esc(auth[k].by || '')}` : 'No autorizado'}</span></li>`).join('')}</ul><a class="btn btn-ghost btn-block" href="#ajustes">Editar autorizaciones</a></section>`;
  }

  /* ---------- ajustes ---------- */
  function renderSettings() {
    const st = settings(), auth = st.auth || {};
    const logged = DB.auth && DB.auth.access_token;
    const pending = Object.keys(DB.outbox).length;
    view().innerHTML = `<header class="page-head"><h1 class="display">Ajustes</h1></header>
      <section class="card"><h2>Autorizaciones médicas</h2><p class="muted small">Actívalas solo cuando tu traumatólogo/fisioterapeuta lo autorice. Mientras estén apagadas, la app muestra una alternativa segura.</p>
        ${Object.entries(EX.AUTH).map(([k, n]) => { const a = auth[k] || {}; return `<div class="auth-item">
          <label class="toggle"><input id="auth-${k}" type="checkbox" data-act="auth-ok" data-cat="${k}" ${a.ok ? 'checked' : ''}><span><b>${esc(n)}</b></span></label>
          <div class="grid-2"><label class="field"><span>Fecha</span><input id="auth-d-${k}" type="date" data-act="auth-f" data-cat="${k}" data-f="date" value="${esc(a.date || '')}"></label>
          <label class="field"><span>Autorizado por</span><input id="auth-b-${k}" type="text" data-act="auth-f" data-cat="${k}" data-f="by" value="${esc(a.by || '')}" placeholder="Dr./Fisio"></label></div></div>`; }).join('')}
      </section>
      <section class="card"><h2>Base de datos</h2>
        ${!HAS_DB ? '<p>Base de datos todavía no configurada. Tus datos se guardan en este celular; usa el respaldo de abajo mientras tanto.</p>'
          : logged ? `<p>Conectado como <b>${esc(DB.auth.email || '')}</b>.</p><p class="muted small">${pending ? `${pending} cambios pendientes de sincronizar.` : 'Todo sincronizado.'} ${DB.sync.lastOk ? 'Última sincronización: ' + new Date(DB.sync.lastOk).toLocaleString('es-MX') : ''}</p>${DB.sync.error ? `<p class="bad small">Último error: ${esc(DB.sync.error)}</p>` : ''}<div class="grid-2"><button class="btn btn-primary" data-act="sync">Sincronizar ahora</button><button class="btn btn-ghost" data-act="logout">Cerrar sesión</button></div>`
          : `<form id="login-form"><p class="muted small">Inicia sesión una vez para respaldar tus registros en Supabase. Sin conexión todo se sigue guardando en el celular.</p><label class="field"><span>Email</span><input id="lg-email" type="email" autocomplete="username" required></label><label class="field"><span>Contraseña</span><input id="lg-pass" type="password" autocomplete="current-password" required></label><button class="btn btn-primary btn-block" type="submit">Iniciar sesión</button></form>`}
      </section>
      <section class="card"><h2>Respaldo</h2><p class="muted small">Descarga un archivo con todos tus registros o restaura uno.</p>
        <div class="grid-2"><button class="btn btn-ghost" data-act="export">Exportar</button><label class="btn btn-ghost file-btn">Importar<input id="imp-file" type="file" accept="application/json" data-act="import"></label></div></section>
      <section class="card"><h2>Seguridad</h2><p class="small">Esta app no sustituye tu rehabilitación médica, no diagnostica y no determina si estás listo para esquiar. Es ambiciosa con la fuerza y conservadora con la rodilla: toda progresión de impacto, saltos, carrera, cambios de dirección, movimientos explosivos o laterales rápidos depende de la autorización de tus profesionales. Si el semáforo marca rojo, detén el ejercicio y consulta con tu profesional de salud.</p></section>`;
  }

  /* ================= router ================= */
  function parseRoute() {
    const h = location.hash.replace(/^#/, '');
    const [name, arg] = h.split('/');
    if (name === 'dia' && arg) return { name: 'day', date: arg };
    if (name === 'hoy') return { name: 'day', date: T };
    if (name === 'ejercicio' && arg) return { name: 'library', ex: arg };
    return { name: { calendario: 'calendar', ejercicios: 'library', progreso: 'progress', ski: 'ski', sabado: 'saturday', ajustes: 'settings' }[name] || 'home' };
  }
  function render() {
    route = parseRoute();
    const keepScroll = render._same === location.hash;
    const y = window.scrollY;
    ({ home: renderHome, calendar: renderCalendar, day: () => renderDay(route.date), library: renderLibrary, progress: renderProgress, ski: renderSki, saturday: renderSaturday, settings: renderSettings })[route.name]();
    document.querySelectorAll('.tabbar a').forEach((a) => a.classList.toggle('on', a.dataset.r === (route.name === 'day' && route.date === T ? 'today' : route.name)));
    if (route.ex) showExercise(route.ex);
    if (keepScroll) window.scrollTo(0, y); else window.scrollTo(0, 0);
    render._same = location.hash;
    syncBadge();
  }
  window.addEventListener('hashchange', () => { closeSheet(); render(); });

  /* ================= eventos ================= */
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-act]');
    if (!t) { if (e.target.id === 'scrim') closeSheet(); return; }
    const a = t.dataset.act, date = t.dataset.date;
    if (['lib-q', 'notes', 'rec-min', 'prog-ex', 'ski-status', 'ski-note', 'auth-ok', 'auth-f', 'import'].includes(a)) return;
    if (a === 'close') closeSheet();
    else if (a === 'ex') showExercise(t.dataset.id, date, t.dataset.code);
    else if (a === 'log') openLog(date, t.dataset.code);
    else if (a === 'save-sets') saveSets(date, t.dataset.code);
    else if (a === 'add-set') addSetRow(date, t.dataset.code);
    else if (a === 'check') {
      const rec = ensureSess(date);
      rec.checks = Object.assign({}, rec.checks, { [t.dataset.key]: !rec.checks[t.dataset.key] });
      put('sessions', rec); render();
    } else if (a === 'finish' || a === 'undo-finish') {
      const rec = ensureSess(date);
      rec.status = a === 'finish' ? 'done' : 'pending';
      if (a === 'finish') { const s = PROG.session(date); rec.duration_min = rec.duration_min || s.duration; }
      put('sessions', rec);
      toast(a === 'finish' ? 'Sesión completada. Registra el semáforo de después.' : 'Marcada como pendiente');
      render();
    } else if (a === 'knee') openKnee(date, t.dataset.moment);
    else if (a === 'timer') startTimer(+t.dataset.sec);
    else if (a === 'timer-stop') stopTimer();
    else if (a === 'timer-add') timerEnd += 15000;
    else if (a === 'cal-mode') { calMode = t.dataset.mode; renderCalendar(); }
    else if (a === 'cal-prev' || a === 'cal-next') {
      const dir = a === 'cal-next' ? 1 : -1;
      if (calMode === 'week') calCursor = PROG.addDays(calCursor, 7 * dir);
      else { const d = PROG.parse(calCursor); calCursor = PROG.fmt(new Date(d.getFullYear(), d.getMonth() + dir, 1)); }
      if (calCursor < '2026-09-28') calCursor = PROG.START; if (calCursor > PROG.END) calCursor = PROG.END;
      renderCalendar();
    } else if (a === 'tag') { libTag = t.dataset.tag || null; renderLibrary(); }
    else if (a === 'rec-opt') {
      const rec = ensureSess(date), r = Object.assign({ opts: {} }, rec.recovery);
      r.opts = Object.assign({}, r.opts, { [t.dataset.opt]: !r.opts[t.dataset.opt] });
      rec.recovery = r; rec.status = Object.values(r.opts).some(Boolean) ? 'done' : 'pending';
      put('sessions', rec); render();
    } else if (a === 'play') {
      const ex = EX.BY[curEx];
      if (stopAnim) { closeAnim(); t.innerHTML = ico('play'); }
      else if (ex) { stopAnim = FIG.animate($('#anim'), ex.fig); t.innerHTML = ico('pause'); }
    } else if (a === 'test') openTest();
    else if (a === 'export') exportData();
    else if (a === 'sync') syncNow(true);
    else if (a === 'logout') { DB.auth = null; save(); render(); toast('Sesión cerrada. Los datos siguen en el celular.'); }
  });

  let noteT;
  document.addEventListener('input', (e) => {
    const t = e.target, a = t.dataset.act;
    if (a === 'lib-q') { libQ = t.value; const q = libQ.trim().toLowerCase(); $('#lib-grid').innerHTML = libCards(EX.LIST.filter((x) => (!libTag || x.tags.includes(libTag)) && (!q || (x.n + ' ' + x.es + ' ' + x.eq).toLowerCase().includes(q)))); }
    else if (a === 'notes' || a === 'rec-min') {
      clearTimeout(noteT);
      noteT = setTimeout(() => { const rec = ensureSess(t.dataset.date); if (a === 'notes') rec.notes = t.value; else rec.duration_min = t.value === '' ? null : +t.value; put('sessions', rec); }, 600);
    }
    if (t.closest('#knee-form')) updateKneeResult();
  });
  document.addEventListener('change', (e) => {
    const t = e.target, a = t.dataset.act;
    if (a === 'prog-ex') { progEx = t.value; renderProgress(); }
    else if (a === 'ski-status' || a === 'ski-note') {
      const st = JSON.parse(JSON.stringify(settings())); st.ski = st.ski || {};
      st.ski[t.dataset.id] = Object.assign({}, st.ski[t.dataset.id], a === 'ski-status' ? { status: t.value, date: T } : { note: t.value });
      saveSettings(st); toast('Guardado');
      if (a === 'ski-status') renderSki();
    } else if (a === 'auth-ok' || a === 'auth-f') {
      const st = JSON.parse(JSON.stringify(settings())); st.auth = st.auth || {};
      const c = t.dataset.cat; st.auth[c] = Object.assign({}, st.auth[c]);
      if (a === 'auth-ok') { st.auth[c].ok = t.checked; if (t.checked && !st.auth[c].date) st.auth[c].date = T; }
      else st.auth[c][t.dataset.f] = t.value;
      saveSettings(st); toast('Autorización actualizada'); if (a === 'auth-ok') renderSettings();
    } else if (a === 'import') importData(t.files[0]);
    else if (t.id === 't-test') { const ts = PROG.TESTS.find((x) => x.id === t.value); $('#t-how').textContent = ts.how; $('#t-unit').textContent = ts.unit; }
    else if (t.closest('#knee-form')) updateKneeResult();
  });
  document.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.target;
    if (f.id === 'knee-form') {
      const v = kneeFormValue();
      put('knee', Object.assign({ id: f.dataset.date + '|' + f.dataset.moment, date: f.dataset.date, moment: f.dataset.moment, light: kneeLight(v) }, v));
      closeSheet(); render();
      toast(kneeLight(v) === 'red' ? 'Rojo: detén el ejercicio y consulta con tu profesional de salud.' : 'Semáforo guardado');
    } else if (f.id === 'test-form') {
      const test = $('#t-test').value, date = $('#t-date').value || T, notes = $('#t-notes').value;
      let n = 0;
      [['L', '#t-L'], ['R', '#t-R']].forEach(([sd, sel]) => { const v = $(sel).value; if (v !== '') { put('tests', { id: `${date}|${test}|${sd}`, date, test, side: sd, value: parseFloat(v), notes }); n++; } });
      closeSheet(); render(); toast(n ? 'Prueba guardada' : 'Escribe al menos un valor');
    } else if (f.id === 'login-form') login($('#lg-email').value, $('#lg-pass').value);
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('#sheet').hidden) closeSheet(); });

  function addSetRow(date, code) {
    const box = $('#sets'), n = +box.dataset.n + 1;
    const ex = EX.BY[findItem(date, code).id];
    const sides = ex.uni ? [['L', 'Izq'], ['R', 'Der']] : [['B', '']];
    box.insertAdjacentHTML('beforeend', `<div class="set"><span class="set-n num">${n}</span><div class="set-sides">${sides.map(([sd, lbl]) => `<div class="set-line">${lbl ? `<span class="side side-${sd}">${lbl}</span>` : ''}<label><span class="sr">Peso</span><input id="w-${n}-${sd}" type="number" inputmode="decimal" step="0.5" min="0" placeholder="kg"></label><label><span class="sr">Reps</span><input id="r-${n}-${sd}" type="number" inputmode="decimal" min="0" placeholder="reps"></label><label><span class="sr">RPE</span><input id="p-${n}-${sd}" type="number" inputmode="decimal" step="0.5" min="1" max="10" placeholder="RPE"></label></div>`).join('')}</div></div>`);
    box.dataset.n = n;
  }

  /* ================= temporizador de descanso ================= */
  let timerEnd = 0, timerRaf = 0;
  function startTimer(sec) {
    timerEnd = Date.now() + sec * 1000;
    $('#timer').hidden = false;
    cancelAnimationFrame(timerRaf);
    const tick = () => {
      const left = Math.max(0, Math.ceil((timerEnd - Date.now()) / 1000));
      $('#timer-v').textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
      if (left <= 0) { $('#timer-v').textContent = '¡Listo!'; if (navigator.vibrate) navigator.vibrate([200, 100, 200]); setTimeout(stopTimer, 2500); return; }
      timerRaf = requestAnimationFrame(tick);
    };
    tick();
  }
  function stopTimer() { cancelAnimationFrame(timerRaf); $('#timer').hidden = true; }

  /* ================= respaldo ================= */
  function exportData() {
    const data = { app: 'acl-ski-prep', version: 1, exported_at: nowISO(), sessions: DB.sessions, sets: DB.sets, knee: DB.knee, tests: DB.tests, settings: DB.settings };
    const blob = new Blob([JSON.stringify(data, null, 1)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `acl-ski-prep-${T}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
  function importData(file) {
    if (!file) return;
    const rd = new FileReader();
    rd.onload = () => {
      try {
        const d = JSON.parse(rd.result);
        if (d.app !== 'acl-ski-prep') throw new Error('El archivo no es un respaldo de esta app.');
        let n = 0;
        Object.keys(TABLES).forEach((t) => Object.values(d[t] || {}).forEach((r) => {
          const cur = DB[t][r.id];
          if (!cur || (r.updated_at || '') > (cur.updated_at || '')) { DB[t][r.id] = r; DB.outbox[t + '|' + r.id] = 1; n++; }
        }));
        save(); render(); scheduleSync(); toast(`Importados ${n} registros`);
      } catch (err) { toast('No se pudo importar: ' + err.message); }
    };
    rd.readAsText(file);
  }

  /* ================= sincronización (Supabase REST) ================= */
  const CFG = window.ACL_CONFIG || {};
  const HAS_DB = !!(CFG.supabaseUrl && CFG.supabaseAnonKey);
  const base = (CFG.supabaseUrl || '').replace(/\/$/, '');
  const jwtSub = (tok) => { try { return JSON.parse(atob(tok.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).sub; } catch (e) { return null; } };

  async function login(email, password) {
    try {
      const res = await fetch(`${base}/auth/v1/token?grant_type=password`, { method: 'POST', headers: { apikey: CFG.supabaseAnonKey, 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error_description || j.msg || 'Email o contraseña incorrectos');
      setAuth(j, email);
      toast('Sesión iniciada');
      Object.keys(TABLES).forEach((t) => Object.keys(DB[t]).forEach((id) => { DB.outbox[t + '|' + id] = 1; }));
      save(); render(); syncNow(true);
    } catch (err) { toast(err.message === 'Failed to fetch' ? 'Sin conexión. Intenta cuando tengas señal.' : err.message); }
  }
  function setAuth(j, email) {
    DB.auth = { access_token: j.access_token, refresh_token: j.refresh_token, expires_at: Date.now() + (j.expires_in || 3600) * 1000 - 60000, email: email || (j.user && j.user.email) || (DB.auth && DB.auth.email), uid: jwtSub(j.access_token) };
    save();
  }
  async function token() {
    if (!DB.auth) return null;
    if (Date.now() < DB.auth.expires_at) return DB.auth.access_token;
    const res = await fetch(`${base}/auth/v1/token?grant_type=refresh_token`, { method: 'POST', headers: { apikey: CFG.supabaseAnonKey, 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh_token: DB.auth.refresh_token }) });
    if (!res.ok) { if (res.status === 400 || res.status === 401) { DB.auth = null; save(); throw new Error('La sesión expiró. Inicia sesión de nuevo en Ajustes.'); } throw new Error('No se pudo renovar la sesión'); }
    setAuth(await res.json());
    return DB.auth.access_token;
  }
  let syncing = false, syncT;
  function scheduleSync() { if (!HAS_DB || !DB.auth) { syncBadge(); return; } clearTimeout(syncT); syncT = setTimeout(() => syncNow(false), 1500); syncBadge(); }
  async function syncNow(verbose) {
    if (!HAS_DB || !DB.auth || syncing) return;
    if (!navigator.onLine) { if (verbose) toast('Sin conexión. Se sincroniza al volver la señal.'); return; }
    syncing = true; syncBadge();
    try {
      const tok = await token();
      const H = { apikey: CFG.supabaseAnonKey, Authorization: 'Bearer ' + tok, 'Content-Type': 'application/json' };
      const uid = DB.auth.uid;
      for (const t of Object.keys(TABLES)) {
        const keys = Object.keys(DB.outbox).filter((k) => k.startsWith(t + '|'));
        if (!keys.length) continue;
        const rows = keys.map((k) => DB[t][k.slice(t.length + 1)]).filter(Boolean).map((r) => { const o = { user_id: uid }; TABLES[t].cols.forEach((c) => { o[c] = r[c] === undefined ? null : r[c]; }); return o; });
        for (let i = 0; i < rows.length; i += 400) {
          const res = await fetch(`${base}/rest/v1/${TABLES[t].remote}?on_conflict=user_id,id`, { method: 'POST', headers: Object.assign({ Prefer: 'resolution=merge-duplicates,return=minimal' }, H), body: JSON.stringify(rows.slice(i, i + 400)) });
          if (!res.ok) throw new Error(`${TABLES[t].remote}: ${(await res.text()).slice(0, 160)}`);
        }
        keys.forEach((k) => delete DB.outbox[k]);
        save();
      }
      const since = DB.sync.lastPull || '1970-01-01T00:00:00Z';
      let maxTs = since, changed = 0;
      for (const t of Object.keys(TABLES)) {
        const res = await fetch(`${base}/rest/v1/${TABLES[t].remote}?select=*&updated_at=gt.${encodeURIComponent(since)}&order=updated_at.asc&limit=10000`, { headers: H });
        if (!res.ok) throw new Error(`${TABLES[t].remote}: ${(await res.text()).slice(0, 160)}`);
        (await res.json()).forEach((r) => {
          delete r.user_id;
          if (r.updated_at > maxTs) maxTs = r.updated_at;
          const cur = DB[t][r.id];
          if (!cur || (r.updated_at > cur.updated_at && !DB.outbox[t + '|' + r.id])) { DB[t][r.id] = r; changed++; }
        });
      }
      DB.sync.lastPull = maxTs; DB.sync.lastOk = nowISO(); DB.sync.error = null; save();
      if (changed) render();
      if (verbose) toast('Sincronizado');
    } catch (err) {
      DB.sync.error = err.message; save();
      if (verbose) toast('Error al sincronizar: ' + err.message);
    } finally { syncing = false; syncBadge(); }
  }
  function syncBadge() {
    const el = $('#sync');
    if (!el) return;
    const pending = Object.keys(DB.outbox).length;
    let cls = 'local', txt = 'En este celular';
    if (HAS_DB && DB.auth) {
      if (syncing) { cls = 'busy'; txt = 'Sincronizando…'; }
      else if (DB.sync.error) { cls = 'err'; txt = 'Error de sync'; }
      else if (pending) { cls = 'pending'; txt = `${pending} pendientes`; }
      else { cls = 'ok'; txt = 'Sincronizado'; }
    }
    el.className = 'sync sync-' + cls;
    el.innerHTML = `<i></i>${txt}`;
  }
  window.addEventListener('online', () => syncNow(false));
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') syncNow(false); });

  /* ================= arranque ================= */
  render();
  syncNow(false);
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
})();
