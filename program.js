/* program.js — el programa completo: fases, plantillas, rotación y prescripción. */
(function () {
  const SURGERY = '2026-05-08';
  const START = '2026-10-01';
  const END = '2027-02-15';
  const WEEK1 = '2026-09-28'; // lunes de la semana 1

  const PHASES = [
    {
      n: 1, name: 'Construir fuerza', short: 'Fuerza base', start: '2026-10-01', end: '2026-10-31',
      goal: ['Estímulo real de fuerza desde la semana 1', 'Recuperar la capacidad de cargar cuádriceps, isquios y glúteos', 'Introducir trabajo unilateral con control', 'Técnica sólida en todos los patrones'],
      focus: '3–4 series · 10–12 reps · RPE 6–7 · bajada en 3 s'
    },
    {
      n: 2, name: 'Desarrollo de fuerza', short: 'Más carga', start: '2026-11-01', end: '2026-11-30',
      goal: ['Subir cargas de forma progresiva', 'Más volumen unilateral', 'Control excéntrico', 'Core más exigente'],
      focus: '4 series · 8–10 reps · RPE 7–8'
    },
    {
      n: 3, name: 'Fuerza + estabilidad', short: 'Fuerza y control', start: '2026-12-01', end: '2026-12-31',
      goal: ['Más fuerza con reps más bajas', 'Mayor control unilateral y de cadera', 'Excéntricos lentos (4 s)', 'Propiocepción y capacidad de trabajo'],
      focus: '4 series · 6–8 reps · RPE 7–8 · bajada en 4 s'
    },
    {
      n: 4, name: 'Fuerza + preparación específica', short: 'Ski prep', start: '2027-01-01', end: '2027-01-31',
      goal: ['Mantener y consolidar fuerza', 'Trabajo lateral y de desaceleración controlado', 'Propiocepción específica de esquí', 'Ejercicios dinámicos SOLO si están autorizados'],
      focus: '3–4 series · 5–6 reps · RPE 7–8 + bloque SKI PREP'
    },
    {
      n: 5, name: 'Puesta a punto', short: 'Taper', start: '2027-02-01', end: '2027-02-15',
      goal: ['Mantener la fuerza con menos volumen', 'Reducir fatiga', 'Calidad de movimiento', 'Llegar fresco al viaje, sin buscar récords'],
      focus: '2–3 series · 5–8 reps · RPE 6–7'
    }
  ];

  const DELOAD_WEEKS = [9, 14];

  /* ---------- Prescripciones por tipo de slot y fase ---------- */
  const RX = {
    main: {
      1: { s: 3, r: '10–12', rpe: '6–7', rest: '90 s', tempo: '3-1-1' },
      2: { s: 4, r: '8–10', rpe: '7–8', rest: '2 min', tempo: '3-0-1' },
      3: { s: 4, r: '6–8', rpe: '7–8', rest: '2 min', tempo: '4-1-1' },
      4: { s: 4, r: '5–6', rpe: '7–8', rest: '2–2.5 min', tempo: '3-0-1' },
      5: { s: 3, r: '5', rpe: '6–7', rest: '2 min', tempo: '2-0-1' }
    },
    uni: {
      1: { s: 3, r: '10', rpe: '6–7', rest: '60–75 s', tempo: '3-1-1' },
      2: { s: 3, r: '8–10', rpe: '7–8', rest: '75 s', tempo: '3-0-1' },
      3: { s: 4, r: '6–8', rpe: '7–8', rest: '90 s', tempo: '4-1-1' },
      4: { s: 3, r: '6–8', rpe: '7–8', rest: '90 s', tempo: '3-0-1' },
      5: { s: 2, r: '6–8', rpe: '6–7', rest: '90 s', tempo: '2-0-1' }
    },
    acc: {
      1: { s: 3, r: '12–15', rpe: '7', rest: '60 s', tempo: '2-1-2' },
      2: { s: 3, r: '10–12', rpe: '7–8', rest: '60 s', tempo: '3-0-1' },
      3: { s: 3, r: '8–10', rpe: '8', rest: '75 s', tempo: '3-1-1' },
      4: { s: 3, r: '8–10', rpe: '7–8', rest: '75 s', tempo: '3-0-1' },
      5: { s: 2, r: '10', rpe: '6–7', rest: '60 s', tempo: '2-0-1' }
    },
    upper: {
      1: { s: 3, r: '10–12', rpe: '7', rest: '60–75 s', tempo: '2-0-1' },
      2: { s: 4, r: '8–10', rpe: '7–8', rest: '75 s', tempo: '2-0-1' },
      3: { s: 4, r: '6–8', rpe: '8', rest: '90 s', tempo: '3-0-1' },
      4: { s: 3, r: '6–8', rpe: '8', rest: '90 s', tempo: '2-0-1' },
      5: { s: 2, r: '8', rpe: '7', rest: '75 s', tempo: '2-0-1' }
    },
    small: {
      1: { s: 3, r: '12–15', rpe: '7–8', rest: '45 s' }, 2: { s: 3, r: '12–15', rpe: '8', rest: '45 s' },
      3: { s: 3, r: '10–12', rpe: '8', rest: '45 s' }, 4: { s: 3, r: '10–12', rpe: '8', rest: '45 s' }, 5: { s: 2, r: '12', rpe: '7', rest: '45 s' }
    },
    kb: {
      1: { s: 3, r: '10', rpe: '6–7', rest: '60 s', tempo: '3-0-1' }, 2: { s: 3, r: '8–10', rpe: '7', rest: '75 s', tempo: '3-0-1' },
      3: { s: 4, r: '8', rpe: '7–8', rest: '75 s', tempo: '4-0-1' }, 4: { s: 3, r: '8', rpe: '7–8', rest: '75 s', tempo: '3-0-1' }, 5: { s: 2, r: '8', rpe: '6–7', rest: '60 s' }
    },
    core: {
      1: { s: 3, r: '8/lado', rpe: '6–7', rest: '30–45 s' }, 2: { s: 3, r: '10/lado', rpe: '7', rest: '30–45 s' },
      3: { s: 3, r: '10/lado', rpe: '7–8', rest: '30–45 s' }, 4: { s: 3, r: '8/lado', rpe: '7–8', rest: '30–45 s' }, 5: { s: 2, r: '8/lado', rpe: '6', rest: '30 s' }
    },
    stab: {
      1: { s: 3, r: '6/lado', rpe: '5–6', rest: '30 s' }, 2: { s: 3, r: '8/lado', rpe: '6', rest: '30 s' },
      3: { s: 3, r: '8/lado', rpe: '6–7', rest: '30 s' }, 4: { s: 3, r: '8/lado', rpe: '6–7', rest: '30 s' }, 5: { s: 2, r: '6/lado', rpe: '5–6', rest: '30 s' }
    },
    pow: { 4: { s: 3, r: '4–5', rpe: '6–7', rest: '90 s', note: 'Calidad máxima, aterrizaje suave. Para si se pierde la técnica.' }, 5: { s: 2, r: '4', rpe: '6', rest: '90 s' } },
    cond: { 1: { s: 1, r: '8 min suave', rpe: '3–4', rest: '—' }, 2: { s: 1, r: '6 × 30 s fuerte / 60 s suave', rpe: '7–8', rest: '—' }, 3: { s: 1, r: '8 × 30 s / 60 s', rpe: '7–8', rest: '—' }, 4: { s: 1, r: '8 × 30 s / 60 s', rpe: '7–8', rest: '—' }, 5: { s: 1, r: '10 min suave', rpe: '3–4', rest: '—' } }
  };
  const TIME_RX = { 1: '30–40 s', 2: '40 s', 3: '45 s', 4: '45 s', 5: '30 s' };
  const ISO_RX = { 1: '45 s', 2: '45 s', 3: '45–60 s', 4: '45 s', 5: '30 s' };
  const DIST_RX = { 1: '20–30 m', 2: '30 m', 3: '30–40 m', 4: '30–40 m', 5: '20 m' };

  /* ---------- Plantillas por día ---------- */
  // ex: {fase: [rotación]} — se rota cada 2 semanas; una fase hereda de la anterior si no se define.
  const S = (code, type, ex, note) => ({ code, type, ex, note });

  const DAYS = {
    1: {
      kind: 'gym', title: 'Fuerza pierna A + torso', sub: 'Dominante de rodilla · empuje y tirón',
      blocks: [
        ['A', S('A1', 'main', { 1: ['leg_press'] }, 'Ejercicio principal: progresa la carga aquí.'), S('A2', 'upper', { 1: ['chest_press', 'db_bench'], 2: ['db_bench', 'incline_db'], 5: ['db_bench'] })],
        ['B', S('B1', 'uni', { 1: ['split_squat_assisted', 'low_step_up'], 2: ['split_squat', 'step_up'], 3: ['bulgarian_split_squat', 'step_up'], 5: ['split_squat'] }), S('B2', 'upper', { 1: ['lat_pulldown', 'neutral_pulldown'] })],
        ['C', S('C1', 'acc', { 1: ['sl_leg_extension'] }, 'Prueba clave de simetría de cuádriceps: registra ambos lados.'), S('C2', 'small', { 1: ['lateral_raise', 'face_pull'] })],
        ['D', S('D1', 'acc', { 1: ['standing_calf', 'seated_calf'], 3: ['sl_calf', 'standing_calf'] }), S('D2', 'core', { 1: ['dead_bug', 'plank'], 2: ['dead_bug_w', 'pallof'], 3: ['dead_bug_w', 'side_plank'] })]
      ],
      finisher: [S('F', 'iso', { 1: ['spanish_squat'], 4: ['ski_hold'], 5: [] })]
    },
    2: {
      kind: 'kb', title: 'Kettlebell + core + estabilidad A', sub: 'Bisagra, sentadilla goblet, cargas y equilibrio',
      blocks: [
        ['A', S('A1', 'kb', { 1: ['kb_deadlift'], 2: ['kb_rdl'], 5: ['kb_deadlift'] }), S('A2', 'kb', { 1: ['kb_halo'], 2: ['hk_kb_press', 'kb_halo'] })],
        ['B', S('B1', 'kb', { 1: ['goblet_squat'], 3: ['goblet_squat', 'lateral_lunge'], 4: ['lateral_lunge', 'goblet_squat'], 5: ['goblet_squat'] }), S('B2', 'kb', { 1: ['kb_row'] })],
        ['C', S('C1', 'stab', { 1: ['sl_balance_reach', 'star_excursion'], 2: ['star_excursion', 'y_balance'], 3: ['y_balance', 'star_excursion'], 4: ['y_balance', 'unstable_balance'], 5: ['y_balance'] }), S('C2', 'core', { 1: ['pallof', 'hk_pallof'] })],
        ['D', S('D1', 'carry', { 1: ['kb_suitcase'] }), S('D2', 'core', { 1: ['dead_bug', 'side_plank'], 2: ['side_plank', 'bird_dog'], 3: ['side_plank', 'bear_plank'], 5: ['bird_dog'] })]
      ],
      finisher: [S('F1', 'small', { 1: ['tib_raise'] }), S('F2', 'small', { 1: ['ankle_eversion', 'ankle_inversion'] })],
      ski: { 4: [S('E1', 'uni', { 4: ['lateral_step_up'] }), S('E2', 'iso', { 4: ['ski_hold'] })], 5: [S('E1', 'iso', { 5: ['ski_hold'] })] },
      auth: { 4: [['drop_landing', 'step_down']], 5: [['drop_landing', 'step_down']] }
    },
    3: {
      kind: 'gym', title: 'Fuerza pierna B + torso', sub: 'Dominante de cadera · isquios y glúteo',
      blocks: [
        ['A', S('A1', 'main', { 1: ['db_rdl'], 2: ['rdl'], 5: ['db_rdl'] }, 'Ejercicio principal: progresa la carga aquí.'), S('A2', 'upper', { 1: ['cable_row', 'cs_db_row'] })],
        ['B', S('B1', 'main', { 1: ['hip_thrust'], 3: ['hip_thrust', 'sl_hip_thrust'], 5: ['hip_thrust'] }), S('B2', 'upper', { 1: ['shoulder_press', 'db_shoulder_press'], 2: ['db_shoulder_press', 'shoulder_press'] })],
        ['C', S('C1', 'acc', { 1: ['seated_leg_curl', 'lying_leg_curl'], 2: ['sl_leg_curl', 'seated_leg_curl'], 3: ['sl_leg_curl', 'slider_curl'], 5: ['seated_leg_curl'] }), S('C2', 'small', { 1: ['rear_delt_fly', 'face_pull'] })],
        ['D', S('D1', 'acc', { 1: ['hip_adductor', 'hip_abductor'], 3: ['copenhagen', 'hip_abductor'], 5: ['hip_abductor'] }), S('D2', 'small', { 1: ['db_curl', 'hammer_curl'], 3: ['incline_curl', 'hammer_curl'] })]
      ],
      finisher: [S('F', 'stab', { 1: ['sl_balance'], 2: ['sl_balance_reach'], 3: ['unstable_balance', 'sl_balance_reach'], 5: ['sl_balance'] })]
    },
    4: {
      kind: 'kb', title: 'Kettlebell + core + estabilidad B', sub: 'Unilateral, control excéntrico y anti-rotación',
      blocks: [
        ['A', S('A1', 'uni', { 1: ['sl_rdl'] }, 'Pierna izquierda primero.'), S('A2', 'kb', { 1: ['kb_floor_press'], 2: ['sa_kb_floor_press', 'kb_floor_press'] })],
        ['B', S('B1', 'uni', { 1: ['step_down'], 2: ['step_down', 'reverse_step_down'], 3: ['step_down', 'lateral_step_down'], 4: ['lateral_step_down', 'step_down'], 5: ['step_down'] }, 'Calidad sobre altura: rodilla alineada.'), S('B2', 'small', { 1: ['kb_chest_pass', 'straight_arm_pd'] })],
        ['C', S('C1', 'stab', { 1: ['band_lateral_walk', 'monster_walk'], 2: ['monster_walk', 'band_abduction'], 3: ['band_abduction', 'band_lateral_walk'] }), S('C2', 'core', { 1: ['cable_chop', 'cable_lift'] })],
        ['D', S('D1', 'carry', { 1: ['kb_farmer', 'kb_front_rack'], 2: ['kb_front_rack', 'kb_farmer'] }), S('D2', 'core', { 1: ['bird_dog', 'bear_plank'], 2: ['bear_plank', 'kb_atw'], 3: ['tgu'], 5: ['bird_dog'] }, null)]
      ],
      finisher: [S('F', 'iso', { 1: ['side_plank'], 2: ['copenhagen'], 3: ['ski_hold'], 5: [] }, null)],
      ski: { 4: [S('E1', 'uni', { 4: ['lateral_lunge'] }), S('E2', 'stab', { 4: ['unstable_balance'] })], 5: [S('E1', 'stab', { 5: ['sl_balance_reach'] })] },
      auth: { 4: [['kb_swing', 'kb_deadlift'], ['lateral_bound', 'lateral_step_down']], 5: [['kb_swing', 'kb_deadlift']] }
    },
    5: {
      kind: 'gym', title: 'Full body fuerza', sub: 'Sentadilla, unilateral, torso completo y carga',
      blocks: [
        ['A', S('A1', 'main', { 1: ['goblet_box'], 2: ['goblet_squat'], 3: ['box_squat'], 5: ['goblet_squat'] }, 'Ejercicio principal: progresa la carga aquí.'), S('A2', 'upper', { 1: ['incline_chest_press', 'incline_db'], 2: ['incline_db', 'push_up'], 5: ['incline_db'] })],
        ['B', S('B1', 'uni', { 1: ['sl_leg_press'] }, 'Prueba clave de simetría: registra ambos lados.'), S('B2', 'upper', { 1: ['db_row', 'kb_row'] })],
        ['C', S('C1', 'uni', { 1: ['sl_glute_bridge'], 2: ['reverse_lunge', 'sl_hip_thrust'], 4: ['reverse_lunge'], 5: ['sl_glute_bridge'] }), S('C2', 'small', { 1: ['rope_pushdown', 'db_oh_ext'], 2: ['oh_cable_ext', 'cg_push_up'], 5: ['rope_pushdown'] })],
        ['D', S('D1', 'small', { 1: ['tib_raise', 'seated_calf'] }), S('D2', 'carry', { 1: ['kb_farmer', 'kb_suitcase'] })]
      ],
      finisher: [S('F', 'cond', { 1: ['bike_easy'], 2: ['bike_intervals'], 5: ['bike_easy'] })],
      ski: { 3: [S('E1', 'iso', { 3: ['ski_hold'] })], 4: [S('E1', 'iso', { 4: ['ski_hold'] }), S('E2', 'stab', { 4: ['band_lateral_walk'] })] },
      auth: { 4: [['squat_jump', 'goblet_squat'], ['lateral_shuffle', 'band_lateral_walk']] }
    }
  };

  const WARMUP = {
    gym: [['bike_easy', 'Bicicleta suave', '5–8 min'], ['glute_bridge', 'Glute bridge', '12'], ['band_lateral_walk', 'Banded lateral walk', '10 pasos/lado'], ['goblet_box', 'Sentadilla a banco sin peso', '10'], ['sl_balance', 'Single-leg balance', '20 s/lado']],
    kb: [['bike_easy', 'Bici o caminata', '5 min'], ['kb_halo', 'KB halo', '5/dirección'], ['kb_atw', 'KB around the world', '5/dirección'], ['dead_bug', 'Dead bug', '6/lado'], ['glute_bridge', 'Glute bridge', '12'], ['sl_balance', 'Single-leg balance', '20 s/lado']]
  };

  /* ---------- Utilidades de fecha (todo en fechas locales YYYY-MM-DD) ---------- */
  const parse = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const addDays = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return fmt(d); };
  const diffDays = (a, b) => Math.round((parse(b) - parse(a)) / 86400000);
  const today = () => fmt(new Date());

  const weekOf = (s) => Math.floor(diffDays(WEEK1, s) / 7) + 1;
  const phaseOf = (s) => PHASES.find((p) => s >= p.start && s <= p.end) || null;
  const inProgram = (s) => s >= START && s <= END;
  const TOTAL_WEEKS = weekOf('2027-02-14');

  function pick(exMap, phase, weekInPhase) {
    let pool = null;
    for (let p = phase; p >= 1 && pool == null; p--) if (exMap[p]) pool = exMap[p];
    if (!pool || !pool.length) return null;
    return pool[Math.floor(weekInPhase / 2) % pool.length];
  }

  function rxFor(slot, ex, phase, deload, wk) {
    const type = slot.type;
    let base;
    if (type === 'iso') base = { s: phase >= 5 ? 2 : 3, r: ISO_RX[phase], rpe: '6–7', rest: '45 s' };
    else if (type === 'carry') base = { s: 3, r: DIST_RX[phase], rpe: '7', rest: '60 s' };
    else base = Object.assign({}, (RX[type] || RX.acc)[phase] || RX.acc[phase]);
    base = Object.assign({}, base);
    if (ex.unit === 'time' && type !== 'iso' && type !== 'cond') base.r = TIME_RX[phase] + (ex.uni ? '/lado' : '');
    if (ex.unit === 'dist' && type !== 'carry') base.r = DIST_RX[phase];
    if (ex.unit === 'cm') base.r = (base.r || '6/lado');
    if (ex.uni && ex.unit === 'reps' && !/lado/.test(base.r)) base.r += '/lado';
    if (deload) { base.s = Math.max(2, base.s - 1); base.deload = true; }
    if (wk === 20 && phase === 5) base.s = Math.min(base.s, 2);
    return base;
  }

  const LEVELS = [null, { k: 'green', name: 'Verde', label: 'Suave' }, { k: 'blue', name: 'Azul', label: 'Moderado' }, { k: 'black', name: 'Negra', label: 'Exigente' }, { k: 'dblack', name: 'Doble negra', label: 'Muy exigente' }];

  function levelFor(kind, phase, deload) {
    let l = kind === 'gym' ? [0, 2, 3, 3, 3, 2][phase] : kind === 'kb' ? [0, 1, 2, 2, 3, 1][phase] : 1;
    if (deload) l = Math.max(1, l - 1);
    return l;
  }

  function resolveSlot(slot, phase, wip, deload, wk) {
    const id = pick(slot.ex, phase, wip);
    if (!id) return null;
    const ex = window.EX.BY[id];
    if (!ex) { console.warn('Ejercicio no encontrado', id); return null; }
    return { code: slot.code, id, rx: rxFor(slot, ex, phase, deload, wk), note: slot.note || null, type: slot.type };
  }

  const MUSCLE_ORDER = ['quads', 'hams', 'glutes', 'adductors', 'abductors', 'calves', 'core', 'chest', 'back', 'shoulders', 'biceps', 'triceps', 'balance', 'stability'];

  const cache = {};
  function session(date) {
    if (cache[date]) return cache[date];
    if (!inProgram(date)) return null;
    const d = parse(date), dow = d.getDay();
    const ph = phaseOf(date), phase = ph.n, wk = weekOf(date);
    const deload = DELOAD_WEEKS.includes(wk);
    const wip = wk - weekOf(ph.start);
    const base = { date, dow, phase, week: wk, deload };
    let s;
    if (date === END) {
      s = Object.assign(base, { kind: 'travel', title: 'Viaje de esquí', sub: 'Evaluación final por traumatólogo/fisioterapeuta antes de esquiar', duration: 0, level: 0 });
    } else if (dow === 0) {
      s = Object.assign(base, { kind: 'rest', title: 'Descanso', sub: 'Recuperación total. Dormir bien también es entrenar.', duration: 0, level: 0 });
    } else if (dow === 6) {
      s = Object.assign(base, { kind: 'recovery', title: 'Recovery Saturday', sub: 'Opcional · bici suave, caminata, movilidad o fisio', duration: 30, level: 1 });
    } else if (date === '2027-02-12') {
      s = Object.assign(base, {
        kind: 'gym', title: 'Activación pre-viaje', sub: 'Sesión corta: moverse bien, nada pesado', duration: 35, level: 1,
        warmup: WARMUP.gym.slice(0, 3).map(([id, n, dose]) => ({ id, n, dose })),
        blocks: [
          { code: 'A', items: [{ code: 'A1', id: 'goblet_squat', rx: { s: 2, r: '5', rpe: '5–6', rest: '90 s' } }, { code: 'A2', id: 'pallof', rx: { s: 2, r: '8/lado', rpe: '5', rest: '30 s' } }] },
          { code: 'B', items: [{ code: 'B1', id: 'sl_rdl', rx: { s: 2, r: '5/lado', rpe: '5–6', rest: '60 s' } }, { code: 'B2', id: 'step_down', rx: { s: 2, r: '5/lado', rpe: '5', rest: '60 s' } }] }
        ],
        finisher: [{ code: 'F', id: 'ski_hold', rx: { s: 2, r: '20 s', rpe: '5', rest: '30 s' } }], ski: [], auth: []
      });
    } else {
      const T = DAYS[dow];
      const lightTue = wk === 20 && (dow === 2 || dow === 4);
      const blocks = T.blocks.map(([code, ...slots]) => ({ code, items: slots.map((sl) => resolveSlot(sl, phase, wip, deload, wk)).filter(Boolean) })).filter((b) => b.items.length);
      if (lightTue) blocks.splice(2);
      const finisher = (T.finisher || []).map((sl) => resolveSlot(sl, phase, wip, deload, wk)).filter(Boolean);
      const ski = ((T.ski || {})[phase] || []).map((sl) => resolveSlot(sl, phase, wip, deload, wk)).filter(Boolean);
      const auth = ((T.auth || {})[phase] || []).map(([id, alt]) => ({ code: 'X' + id, id, alt, rx: RX.pow[phase] || RX.pow[4] }));
      const duration = T.kind === 'gym' ? (phase === 5 ? 50 : 60) : (phase === 5 ? 45 : 55);
      s = Object.assign(base, {
        kind: T.kind, title: T.title, sub: T.sub, duration: lightTue ? 35 : duration, level: levelFor(T.kind, phase, deload || lightTue),
        warmup: (WARMUP[T.kind] || []).concat(phase >= 2 && T.kind === 'gym' ? [['step_down', 'Step-down lento', '5/lado']] : []).map(([id, n, dose]) => ({ id, n, dose })),
        blocks, finisher, ski, auth
      });
    }
    if (s.blocks) {
      const count = {};
      [...s.blocks.flatMap((b) => b.items), ...s.finisher, ...s.ski].forEach((it) => {
        window.EX.BY[it.id].tags.forEach((t) => { count[t] = (count[t] || 0) + 1; });
      });
      s.muscles = MUSCLE_ORDER.filter((m) => count[m]).sort((a, b) => count[b] - count[a]).slice(0, 4);
    } else s.muscles = [];
    cache[date] = s;
    return s;
  }

  function allItems(s) {
    if (!s || !s.blocks) return [];
    return [...s.blocks.flatMap((b) => b.items), ...s.finisher, ...s.ski];
  }

  const MILESTONES = [
    { date: '2026-10-01', title: 'Inicio del programa · Fase 1', kind: 'phase' },
    { date: '2026-10-02', title: 'Pruebas base: balance, step-down, Y-balance y fuerza unilateral', kind: 'test' },
    { date: '2026-10-30', title: 'Revisión sugerida con tu fisio: cierre de Fase 1', kind: 'pro' },
    { date: '2026-11-01', title: 'Fase 2 · Desarrollo de fuerza', kind: 'phase' },
    { date: '2026-11-23', title: 'Semana de descarga', kind: 'deload' },
    { date: '2026-11-27', title: 'Pruebas del mes 2', kind: 'test' },
    { date: '2026-12-01', title: 'Fase 3 · Fuerza + estabilidad', kind: 'phase' },
    { date: '2026-12-18', title: 'Pruebas del mes 3', kind: 'test' },
    { date: '2026-12-28', title: 'Semana de descarga (fiestas)', kind: 'deload' },
    { date: '2026-12-30', title: 'Pregunta a tu traumatólogo/fisio qué trabajo dinámico, lateral o de impacto autoriza para enero', kind: 'pro' },
    { date: '2027-01-01', title: 'Fase 4 · Fuerza + preparación específica', kind: 'phase' },
    { date: '2027-01-29', title: 'Pruebas del mes 4', kind: 'test' },
    { date: '2027-02-01', title: 'Fase 5 · Puesta a punto', kind: 'phase' },
    { date: '2027-02-10', title: 'Evaluación final con tu traumatólogo/fisio (antes del viaje)', kind: 'pro' },
    { date: '2027-02-15', title: 'Viaje de esquí', kind: 'goal' }
  ];

  const TESTS = [
    { id: 'balance_eo', name: 'Equilibrio a una pierna · ojos abiertos', unit: 's', how: 'Brazos cruzados, rodilla suave. Cronometra hasta que apoyes el otro pie o muevas el pie de apoyo. Máximo 60 s.', chart: 'balance' },
    { id: 'balance_ec', name: 'Equilibrio a una pierna · ojos cerrados', unit: 's', how: 'Igual, con ojos cerrados, junto a una pared. Máximo 30 s.', chart: 'balance' },
    { id: 'step_down_q', name: 'Step-down controlado', unit: 'reps / 30 s', how: 'Escalón de 15–20 cm. Cuenta solo reps con la rodilla alineada sobre el pie y sin apoyar el talón.', chart: 'stepdown' },
    { id: 'ybal_ant', name: 'Y-balance anterior', unit: 'cm', how: 'Mejor de 3 intentos tocando ligero con la punta, sin despegar el talón de apoyo.', chart: 'control' },
    { id: 'sl_squat', name: 'Sentadilla a una pierna a caja', unit: 'reps', how: 'Caja a la altura de la rodilla. Reps controladas tocando la caja sin sentarte, máximo 15.', chart: 'control' },
    { id: 'sl_press', name: 'Single-leg leg press · 8 reps', unit: 'kg', how: 'Carga con la que completas 8 reps a RPE 8 con buena técnica. No es un máximo.', chart: 'strength' },
    { id: 'sl_ext', name: 'Single-leg leg extension · 8 reps', unit: 'kg', how: 'Carga para 8 reps a RPE 8, en el rango que autorizó tu fisio.', chart: 'strength' }
  ];

  const READINESS = [
    { id: 'strength', name: 'Fuerza', why: 'Las piernas sostienen la postura flexionada durante toda la bajada.', how: 'Ejercicios principales: leg press, RDL, sentadillas.', metric: 'main' },
    { id: 'uni', name: 'Fuerza unilateral', why: 'En cada curva una pierna recibe más carga que la otra.', how: 'Single-leg press y extension, split squats, step-ups. Índice de simetría (LSI).', metric: 'lsi' },
    { id: 'knee', name: 'Control de rodilla', why: 'La rodilla debe mantenerse alineada bajo carga y en flexión.', how: 'Step-down, lateral step-down, single-leg squat.', metric: 'step_down_q' },
    { id: 'stability', name: 'Estabilidad', why: 'Tronco y cadera estables mientras las piernas trabajan.', how: 'Pallof, carries, Copenhagen, side plank.', metric: null },
    { id: 'balance', name: 'Equilibrio', why: 'Nieve irregular, cambios de terreno y transiciones.', how: 'Single-leg balance, star excursion, superficies inestables.', metric: 'balance_eo' },
    { id: 'eccentric', name: 'Control excéntrico', why: 'Absorber y frenar es la acción dominante del cuádriceps al esquiar.', how: 'Tempos de 3–4 s, step-downs, slider curl.', metric: null },
    { id: 'decel', name: 'Desaceleración', why: 'Frenar y detenerse con control.', how: 'Progresión a aterrizajes y frenados SOLO con autorización.', metric: null },
    { id: 'lateral', name: 'Capacidad lateral', why: 'Los cantos y las curvas exigen fuerza en el plano lateral.', how: 'Lateral step-down/up, lateral lunge lento. Laterales rápidos SOLO con autorización.', metric: null },
    { id: 'tolerance', name: 'Tolerancia al esfuerzo', why: 'Varios días seguidos de esquí con buena técnica pese al cansancio.', how: 'Adherencia, capacidad de trabajo, intervalos en bici, respuesta de la rodilla al día siguiente.', metric: 'adherence' }
  ];

  const RECOVERY = [
    { id: 'bike', name: 'Bicicleta suave', dose: '20–40 min · RPE 3–4', desc: 'Pedaleo cómodo, podrías conversar. Ayuda a la movilidad y la recuperación de la rodilla.' },
    { id: 'walk', name: 'Caminata', dose: '30–45 min', desc: 'Terreno plano o cuesta suave. Ritmo cómodo.' },
    { id: 'mobility', name: 'Movilidad', dose: '15–20 min', desc: 'Rutina abajo. Movimientos suaves, sin forzar rangos.' },
    { id: 'recovery', name: 'Recuperación', dose: 'Libre', desc: 'Foam roller suave en cuádriceps, glúteos y pantorrillas; estiramientos ligeros; buen descanso.' },
    { id: 'physio', name: 'Ejercicios de fisioterapia', dose: 'Según indicación', desc: 'Los ejercicios que tu fisio te haya prescrito. Anótalos para tener registro.' }
  ];
  const MOBILITY = [
    ['Movilidad de tobillo rodilla a la pared', '10/lado'], ['Estiramiento de flexor de cadera medio arrodillado', '30 s/lado'],
    ['Estiramiento de cuádriceps (de pie o de lado)', '30 s/lado'], ['90/90 de cadera', '6/lado'], ['Gato-camello', '8'],
    ['Rotaciones torácicas en cuatro puntos', '6/lado'], ['Extensión de rodilla pasiva (talón sobre un soporte)', '2 min'], ['Respiración diafragmática boca arriba', '1 min']
  ];

  window.PROG = {
    SURGERY, START, END, WEEK1, PHASES, DELOAD_WEEKS, TOTAL_WEEKS, LEVELS, MILESTONES, TESTS, READINESS, RECOVERY, MOBILITY,
    session, allItems, parse, fmt, addDays, diffDays, today, weekOf, phaseOf, inProgram
  };
})();
