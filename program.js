/* program.js — el programa completo: fases, plantillas, rotación y prescripción,
   más lo personal: modo casa, duración, cambios de ejercicio, ajuste por cómo te fue
   y la ruta de impacto (saltos, cuerda y carrera por etapas con pruebas). */
(function () {
  const SURGERY = '2026-05-08';
  const START = '2026-10-01';
  const END = '2027-02-15';
  const WEEK1 = '2026-09-28'; // lunes de la semana 1

  const PHASES = [
    {
      n: 1, name: 'Construir fuerza', short: 'Fuerza base', start: '2026-10-01', end: '2026-10-31',
      goal: ['Estímulo real de fuerza desde la semana 1', 'Recuperar la capacidad de cargar cuádriceps, isquios y glúteos', 'Introducir trabajo unilateral con control', 'Torso completo: pecho, espalda, hombros y brazos'],
      focus: '3–4 series · 10–12 reps · RPE 6–7 · bajada en 3 s'
    },
    {
      n: 2, name: 'Desarrollo de fuerza', short: 'Más carga', start: '2026-11-01', end: '2026-11-30',
      goal: ['Subir cargas de forma progresiva', 'Más volumen unilateral y control excéntrico', 'Semana 8: ruta de impacto (cuerda, saltos y trote–caminata) si pasas la prueba', 'Ventana de 6–8 semanas para regresar al box'],
      focus: '4 series · 8–10 reps · RPE 7–8'
    },
    {
      n: 3, name: 'Fuerza + estabilidad', short: 'Fuerza y control', start: '2026-12-01', end: '2026-12-31',
      goal: ['Más fuerza con reps más bajas', 'Correr de forma continua', 'Excéntricos lentos (4 s)', 'Propiocepción y capacidad de trabajo'],
      focus: '4 series · 6–8 reps · RPE 7–8 · bajada en 4 s'
    },
    {
      n: 4, name: 'Fuerza + preparación específica', short: 'Ski prep', start: '2027-01-01', end: '2027-01-31',
      goal: ['Mantener y consolidar fuerza', 'Saltos a una pierna y laterales con freno', 'Ski hops, giros y cambios de dirección', 'Intervalos de carrera: esfuerzos cortos como las bajadas'],
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
    }
  };
  const TIME_RX = { 1: '30–40 s', 2: '40 s', 3: '45 s', 4: '45 s', 5: '30 s' };
  const ISO_RX = { 1: '45 s', 2: '45 s', 3: '45–60 s', 4: '45 s', 5: '30 s' };
  const DIST_RX = { 1: '20–30 m', 2: '30 m', 3: '30–40 m', 4: '30–40 m', 5: '20 m' };
  // sin peso: la intensidad sale de más reps, tempo lento y pausas
  const CASA_RX = {
    legs: { 1: ['12–15', '3-1-1'], 2: ['12–15', '4-1-1'], 3: ['10–12', '4-2-1'], 4: ['10–12', '3-1-1'], 5: ['10', '3-0-1'] },
    upper: { 1: ['8–15', '3-1-1'], 2: ['8–15', '3-1-1'], 3: ['8–12', '4-1-1'], 4: ['8–12', '3-1-1'], 5: ['8–10', '2-1-1'] }
  };

  /* ---------- Plantillas por día ---------- */
  // ex: {fase: [rotación]} — se rota cada 2 semanas; una fase hereda de la anterior si no se define.
  const S = (code, type, ex, note) => ({ code, type, ex, note });
  const QUAD2 = 'Segundo ejercicio de cuádriceps del día.';

  const DAYS = {
    1: {
      kind: 'gym', title: 'Fuerza pierna A + torso', sub: 'Dominante de rodilla · pecho, espalda, hombro y tríceps',
      blocks: [
        ['A', S('A1', 'main', { 1: ['leg_press'] }, 'Ejercicio principal: progresa la carga aquí.'), S('A2', 'upper', { 1: ['chest_press', 'db_bench'], 2: ['db_bench', 'incline_db'], 5: ['db_bench'] })],
        ['B', S('B1', 'uni', { 1: ['split_squat_assisted', 'low_step_up'], 2: ['split_squat', 'step_up'], 3: ['bulgarian_split_squat', 'step_up'], 5: ['split_squat'] }), S('B2', 'upper', { 1: ['lat_pulldown', 'neutral_pulldown'] })],
        ['C', S('C1', 'acc', { 1: ['sl_leg_extension'] }, 'Prueba clave de simetría de cuádriceps.'), S('C2', 'small', { 1: ['lateral_raise', 'face_pull'] }), S('C3', 'small', { 1: ['rope_pushdown', 'oh_cable_ext'], 3: ['oh_cable_ext', 'cable_tri_ext'] })],
        ['D', S('D1', 'iso', { 1: ['spanish_squat'], 4: ['ski_hold', 'spanish_squat'], 5: ['spanish_squat'] }, 'Isométrico de cuádriceps: aguanta la postura el tiempo indicado.'), S('D2', 'core', { 1: ['dead_bug', 'plank'], 2: ['dead_bug_w', 'pallof'], 3: ['dead_bug_w', 'side_plank'] }), S('D3', 'small', { 1: ['standing_calf', 'seated_calf'], 3: ['sl_calf', 'standing_calf'] })]
      ]
    },
    2: {
      kind: 'kb', title: 'Full body kettlebell A', sub: 'Una KB + banda: bisagra, sentadilla, empuje, tirón, core y equilibrio',
      blocks: [
        ['A', S('A1', 'kb', { 1: ['kb_deadlift'], 2: ['kb_rdl'], 5: ['kb_deadlift'] }), S('A2', 'kb', { 1: ['sa_kb_floor_press', 'push_up'], 2: ['hk_kb_press', 'push_up'] })],
        ['B', S('B1', 'kb', { 1: ['goblet_squat'], 3: ['goblet_squat', 'lateral_lunge'], 4: ['lateral_lunge', 'goblet_squat'], 5: ['goblet_squat'] }), S('B2', 'kb', { 1: ['kb_row'] })],
        ['C', S('C1', 'stab', { 1: ['sl_balance_reach', 'star_excursion'], 2: ['star_excursion', 'y_balance'], 3: ['y_balance', 'star_excursion'], 4: ['y_balance', 'unstable_balance'], 5: ['y_balance'] }), S('C2', 'core', { 1: ['pallof', 'kb_halo'] }, 'Pallof con banda anclada a un poste.')],
        ['D', S('D1', 'carry', { 1: ['kb_suitcase'] }), S('D2', 'core', { 1: ['dead_bug', 'side_plank'], 2: ['side_plank', 'bird_dog'], 3: ['side_plank', 'bear_plank'], 5: ['bird_dog'] }), S('D3', 'small', { 1: ['tib_raise', 'ankle_eversion'] })]
      ],
      ski: { 4: [S('E1', 'uni', { 4: ['lateral_step_up'] }), S('E2', 'iso', { 4: ['ski_hold'] })], 5: [S('E1', 'iso', { 5: ['ski_hold'] })] }
    },
    3: {
      kind: 'gym', title: 'Fuerza pierna B + torso', sub: 'Dominante de cadera + cuádriceps · espalda, hombro y bíceps',
      blocks: [
        ['A', S('A1', 'main', { 1: ['db_rdl'], 2: ['rdl'], 5: ['db_rdl'] }, 'Ejercicio principal: progresa la carga aquí.'), S('A2', 'upper', { 1: ['cable_row', 'cs_db_row'] })],
        ['B', S('B1', 'main', { 1: ['hip_thrust'], 3: ['hip_thrust', 'sl_hip_thrust'], 5: ['hip_thrust'] }), S('B2', 'upper', { 1: ['shoulder_press', 'db_shoulder_press'], 2: ['db_shoulder_press', 'shoulder_press'] })],
        ['C', S('C1', 'acc', { 1: ['seated_leg_curl', 'lying_leg_curl'], 2: ['sl_leg_curl', 'seated_leg_curl'], 3: ['sl_leg_curl', 'slider_curl'], 5: ['seated_leg_curl'] }), S('C2', 'small', { 1: ['rear_delt_fly', 'face_pull'] }), S('C3', 'small', { 1: ['db_curl', 'hammer_curl'], 3: ['incline_curl', 'hammer_curl'] })],
        ['D', S('D1', 'acc', { 1: ['leg_extension', 'reverse_step_down'], 2: ['reverse_step_down', 'leg_extension'], 3: ['reverse_step_down', 'sl_squat_assisted'], 5: ['leg_extension'] }, QUAD2), S('D2', 'acc', { 1: ['hip_adductor', 'hip_abductor'], 3: ['copenhagen', 'hip_abductor'], 5: ['hip_abductor'] }), S('D3', 'core', { 1: ['side_plank', 'bird_dog'], 2: ['pallof', 'side_plank'], 5: ['side_plank'] })]
      ]
    },
    4: {
      kind: 'kb', title: 'Full body kettlebell B', sub: 'Una KB + banda: unilateral, empuje, tirón y anti-rotación',
      blocks: [
        ['A', S('A1', 'uni', { 1: ['sl_rdl'] }, 'Pierna izquierda primero.'), S('A2', 'kb', { 1: ['push_up', 'sa_kb_floor_press'], 2: ['sa_kb_floor_press', 'hk_kb_press'] })],
        ['B', S('B1', 'uni', { 1: ['step_down'], 2: ['step_down', 'reverse_step_down'], 3: ['step_down', 'lateral_step_down'], 4: ['lateral_step_down', 'step_down'], 5: ['step_down'] }, 'Sirve cualquier escalón. Calidad sobre altura: rodilla alineada.'), S('B2', 'kb', { 1: ['kb_row'] })],
        ['C', S('C1', 'stab', { 1: ['band_lateral_walk', 'monster_walk'], 2: ['monster_walk', 'band_abduction'], 3: ['band_abduction', 'band_lateral_walk'] }), S('C2', 'core', { 1: ['kb_atw', 'kb_chest_pass'], 3: ['kb_atw', 'kb_halo'] })],
        ['D', S('D1', 'carry', { 1: ['kb_front_rack', 'kb_suitcase'] }), S('D2', 'core', { 1: ['bird_dog', 'bear_plank'], 2: ['bear_plank', 'dead_bug_w'], 3: ['tgu'], 5: ['bird_dog'] }), S('D3', 'iso', { 1: ['side_plank'], 2: ['copenhagen', 'side_plank'], 3: ['ski_hold', 'copenhagen'], 5: ['side_plank'] })]
      ],
      ski: { 4: [S('E1', 'uni', { 4: ['lateral_lunge'] }), S('E2', 'stab', { 4: ['unstable_balance'] })], 5: [S('E1', 'stab', { 5: ['sl_balance_reach'] })] }
    },
    5: {
      kind: 'gym', title: 'Full body fuerza', sub: 'Sentadilla, unilateral y torso completo: pecho, espalda y brazos',
      blocks: [
        ['A', S('A1', 'main', { 1: ['goblet_box'], 2: ['goblet_squat'], 3: ['box_squat'], 5: ['goblet_squat'] }, 'Ejercicio principal: progresa la carga aquí.'), S('A2', 'upper', { 1: ['incline_chest_press', 'incline_db'], 2: ['incline_db', 'push_up'], 5: ['incline_db'] })],
        ['B', S('B1', 'uni', { 1: ['sl_leg_press'] }, 'Prueba clave de simetría: compara ambos lados.'), S('B2', 'upper', { 1: ['db_row', 'kb_row'] })],
        ['C', S('C1', 'uni', { 1: ['sl_glute_bridge'], 2: ['reverse_lunge', 'sl_hip_thrust'], 4: ['reverse_lunge'], 5: ['sl_glute_bridge'] }), S('C2', 'small', { 1: ['db_oh_ext', 'rope_pushdown'], 2: ['cg_push_up', 'oh_cable_ext'], 5: ['rope_pushdown'] }), S('C3', 'small', { 1: ['hammer_curl', 'cable_curl'] })],
        ['D', S('D1', 'small', { 1: ['tib_raise', 'seated_calf'] }), S('D2', 'carry', { 1: ['kb_farmer', 'kb_suitcase'] }), S('D3', 'small', { 1: ['lateral_raise', 'face_pull'] })]
      ],
      ski: { 3: [S('E1', 'iso', { 3: ['ski_hold'] })], 4: [S('E1', 'iso', { 4: ['ski_hold'] }), S('E2', 'stab', { 4: ['band_lateral_walk'] })] }
    }
  };

  /* ---------- Ruta de impacto: etapas con prueba para avanzar ---------- */
  const IMPACT = [
    { id: 'prep', n: 0, name: 'Preparar', from: START, short: 'Sin impacto',
      what: 'Pantorrilla y tibial, elevaciones de talón rápidas, skips caminando. Prepara tendones y técnica antes de saltar.' },
    { id: 'jump', n: 1, name: 'Primeros saltos', from: '2026-11-16', early: true, short: 'Cuerda, pogos, trote–caminata',
      what: 'Cuerda a dos pies, pogos, aterrizajes, squat jumps, KB swing y trote–caminata (1 min / 1 min).',
      gate: ['Tu doctor o fisio te dio luz verde para trotar y saltar', '20 sentadillas a una pierna por lado (a una silla), con la rodilla alineada', 'Puente de glúteo a una pierna 30 s por lado sin calambre', 'Sin dolor ni inflamación al día siguiente de entrenar pierna'] },
    { id: 'run', n: 2, name: 'Correr', from: '2026-11-30', short: 'Trote continuo',
      what: 'Trote continuo de 15 a 25 min, cuerda alternando pies, saltos laterales a dos pies, box jump bajo y desplazamientos.',
      gate: ['10 saltos a dos pies aterrizando suave y silencioso', '20 min de trote–caminata sin molestia al día siguiente', 'Cuerda a dos pies 6 × 30 s sin molestia'] },
    { id: 'single', n: 3, name: 'Una pierna', from: '2026-12-28', short: 'Saltos a una pierna',
      what: 'Saltitos y saltos con freno a una pierna, skater bounds, KB clean, cambios de dirección e intervalos de carrera.',
      gate: ['Trote continuo de 20 min sin molestia al día siguiente', 'Cuerda alternando pies 3 × 1 min', '10 saltitos en una pierna en el lugar por lado, sin miedo ni dolor'] },
    { id: 'ski', n: 4, name: 'Esquí', from: '2027-01-18', short: 'Ski hops y giros',
      what: 'Ski hops, saltos laterales a una pierna con freno, giros de 90°, cuerda 5 min e intervalos cortos.',
      gate: ['Salto al frente en una pierna y te quedas firme 3 s, con cada pierna', 'La izquierda salta casi lo mismo que la derecha (marca con cinta, mismo esfuerzo)', 'Skater bounds 5 por lado con aterrizaje estable'] }
  ];
  const TAPER_FROM = '2027-02-01';
  const IV = (on, off, n, onL, offL) => ({ on, off, n, onL, offL });
  const R = (s, r, rpe, rest, iv) => ({ s, r, rpe, rest, iv });
  // por etapa: pre = después del calentamiento (frescos) · post = cardio al final. [id, rx, alternativa]
  const IMP = {
    0: { pre: { 2: [['a_skip', R(2, '20 m', '4', '30 s'), 'sl_balance'], ['fast_calf', R(2, '15', '5', '30 s'), 'sl_calf']], 4: [['fast_calf', R(2, '15', '5', '30 s'), 'sl_calf']], 5: [['a_skip', R(2, '20 m', '4', '30 s'), 'sl_balance']] } },
    1: {
      pre: {
        2: [['pogo', R(3, '15', '5', '60 s'), 'fast_calf'], ['drop_landing', R(3, '5', '5–6', '60 s'), 'step_down']],
        4: [['jump_rope', R(6, '30 s', '5', '30 s', IV(30, 30, 6, 'Salta', 'Descansa')), 'pogo'], ['squat_jump', R(3, '5', '6', '90 s'), 'goblet_squat'], ['kb_swing', R(3, '10', '6–7', '60 s'), 'kb_deadlift']]
      },
      post: { 5: [['walk_run', R(1, '10 × (1 min trote / 1 min caminar)', '4–5', '—', IV(60, 60, 10, 'Trota', 'Camina')), 'bike_easy']] }
    },
    2: {
      pre: {
        2: [['jump_rope_alt', R(3, '1 min', '6', '45 s', IV(60, 45, 3, 'Alterna pies', 'Descansa')), 'jump_rope'], ['lateral_hop', R(3, '10', '6', '60 s'), 'pogo']],
        4: [['box_jump_low', R(3, '5', '6–7', '90 s'), 'step_up'], ['kb_swing', R(3, '12', '7', '60 s'), 'kb_deadlift'], ['lateral_shuffle', R(3, '10 m ida y vuelta', '6', '60 s'), 'band_lateral_walk']]
      },
      post: { 5: [['easy_run', R(1, 'RUN', '5', '—'), 'walk_run']] }
    },
    3: {
      pre: {
        2: [['sl_hop_place', R(3, '10/lado', '6', '60 s'), 'pogo'], ['sl_hop_stick', R(3, '4/lado', '6–7', '90 s'), 'drop_landing']],
        4: [['lateral_bound', R(3, '5/lado', '7', '90 s'), 'lateral_step_down'], ['kb_clean', R(3, '5/lado', '7', '60 s'), 'kb_swing'], ['jump_rope_alt', R(3, '1 min', '6', '45 s', IV(60, 45, 3, 'Alterna pies', 'Descansa')), 'jump_rope']],
        5: [['lateral_shuffle', R(3, '15 m ida y vuelta', '7', '60 s'), 'band_lateral_walk']]
      },
      post: { 5: [['run_intervals', R(1, '6 × (1 min rápido / 1 min suave)', '7–8', '—', IV(60, 60, 6, 'Rápido', 'Suave')), 'easy_run']] }
    },
    4: {
      pre: {
        2: [['ski_hops', R(4, '30 s', '7', '45 s', IV(30, 45, 4, 'Ski hops', 'Descansa')), 'lateral_hop'], ['lateral_sl_hop', R(3, '4/lado', '7', '90 s'), 'lateral_bound']],
        4: [['jump_turn_90', R(3, '6', '6–7', '60 s'), 'squat_jump'], ['lateral_bound', R(3, '6/lado', '7', '90 s'), 'lateral_step_down'], ['jump_rope', R(5, '1 min', '6', '20 s', IV(60, 20, 5, 'Cuerda', 'Pausa')), 'pogo']],
        5: [['sl_hop_stick', R(3, '4/lado', '7', '90 s'), 'drop_landing']]
      },
      post: { 5: [['run_intervals', R(1, '8 × (40 s rápido / 80 s suave)', '7–8', '—', IV(40, 80, 8, 'Rápido', 'Suave')), 'easy_run']] }
    }
  };

  /* ---------- Pesos sugeridos ---------- */
  // [factor × peso corporal para 10–12 reps a RPE 6–7 en la semana 1, tipo de equipo]
  // m = máquina/polea · b = barra (total) · d = mancuernas (c/u) · d1 = una mancuerna · k = una KB · k2 = dos KB (c/u)
  const LOADS = {
    leg_press: [0.9, 'm'], sl_leg_press: [0.4, 'm'], leg_extension: [0.3, 'm'], sl_leg_extension: [0.13, 'm'],
    goblet_squat: [0.21, 'k'], goblet_box: [0.16, 'k'], box_squat: [0.4, 'b'],
    step_up: [0.08, 'd'], split_squat: [0.1, 'd'], reverse_lunge: [0.1, 'd'], bulgarian_split_squat: [0.08, 'd'],
    hip_thrust: [0.6, 'b'], seated_leg_curl: [0.33, 'm'], lying_leg_curl: [0.26, 'm'], sl_leg_curl: [0.13, 'm'],
    rdl: [0.55, 'b'], db_rdl: [0.16, 'd'], kb_rdl: [0.21, 'k'], sl_rdl: [0.16, 'k'], kb_deadlift: [0.26, 'k'],
    hip_abductor: [0.45, 'm'], hip_adductor: [0.4, 'm'], standing_calf: [0.5, 'm'], seated_calf: [0.33, 'm'], cable_kickback: [0.07, 'm'],
    chest_press: [0.45, 'm'], incline_chest_press: [0.35, 'm'], db_bench: [0.2, 'd'], incline_db: [0.17, 'd'],
    lat_pulldown: [0.55, 'm'], neutral_pulldown: [0.55, 'm'], cable_row: [0.55, 'm'], cs_db_row: [0.2, 'd'], db_row: [0.24, 'd1'], kb_row: [0.21, 'k'],
    straight_arm_pd: [0.25, 'm'], face_pull: [0.2, 'm'], shoulder_press: [0.3, 'm'], db_shoulder_press: [0.13, 'd'], lateral_raise: [0.07, 'd'], rear_delt_fly: [0.05, 'd'],
    db_curl: [0.11, 'd'], hammer_curl: [0.13, 'd'], incline_curl: [0.09, 'd'], cable_curl: [0.25, 'm'], sa_cable_curl: [0.1, 'm'],
    rope_pushdown: [0.25, 'm'], cable_tri_ext: [0.25, 'm'], oh_cable_ext: [0.2, 'm'], db_oh_ext: [0.16, 'd1'],
    kb_floor_press: [0.16, 'k2'], sa_kb_floor_press: [0.21, 'k'], kb_halo: [0.1, 'k'], kb_atw: [0.16, 'k'], kb_chest_pass: [0.1, 'k'], hk_kb_press: [0.16, 'k'],
    kb_suitcase: [0.26, 'k'], kb_farmer: [0.26, 'k2'], kb_front_rack: [0.16, 'k'], dead_bug_w: [0.06, 'k'],
    cable_chop: [0.13, 'm'], cable_lift: [0.13, 'm'],
    tgu: [0.1, 'k'], kb_swing: [0.21, 'k'], kb_clean: [0.16, 'k'], kb_clean_press: [0.12, 'k']
  };
  const KB_SIZES = [4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32];
  let PROFILE = { weight: 76, height: 180 };

  // crecimiento de la carga respecto a la semana 1 (técnica → volumen → carga)
  function growth(date) {
    const ph = phaseOf(date), wk = weekOf(date);
    if (!ph) return 1;
    const wip = Math.max(0, wk - weekOf(ph.start));
    let g = [0, 1 + 0.025 * wip, 1.12 + 0.03 * wip, 1.26 + 0.025 * wip, 1.38 + 0.015 * wip, 1.3][ph.n];
    if (DELOAD_WEEKS.includes(wk)) g *= 0.85;
    if (wk >= 20) g *= 0.92;
    return g;
  }
  const SOFT = { acc: 0.6, small: 0.6, core: 0.5, carry: 0.5, stab: 0.5, iso: 0.5, imp: 0.5 };
  function roundLoad(v, kind) {
    if (kind === 'm') return v < 20 ? Math.max(2.5, Math.round(v / 2.5) * 2.5) : Math.round(v / 5) * 5;
    if (kind === 'b') return Math.max(20, Math.round(v / 2.5) * 2.5);
    if (kind === 'd' || kind === 'd1') return Math.max(2, Math.round(v / 2) * 2);
    const k = KB_SIZES.filter((x) => x <= v * 1.06);
    return k.length ? k[k.length - 1] : 4;
  }
  // el siguiente escalón real de peso para ese equipo
  function nextUp(kg, kind) {
    if (kind === 'm') return kg < 20 ? kg + 2.5 : kg + 5;
    if (kind === 'b') return kg + 2.5;
    if (kind === 'd' || kind === 'd1') return kg + 2;
    return KB_SIZES.find((x) => x > kg) || kg;
  }
  function stepOf(kind, kg) { return kind === 'm' ? (kg < 20 ? 2.5 : 5) : kind === 'b' ? 2.5 : kind === 'd' || kind === 'd1' ? 2 : null; }
  const rawKg = (id, date, type) => { const L = LOADS[id]; if (!L) return 0; const soft = SOFT[type] != null ? SOFT[type] : 1; return PROFILE.weight * L[0] * (1 + (growth(date) - 1) * soft); };
  function label(kg, kind) {
    const lb = Math.max(5, Math.round((kg * 2.20462) / 5) * 5);
    const each = kind === 'd' || kind === 'k2' ? ' c/u' : '';
    return { kg, lb, kind, label: (kind === 'k' ? 'KB ' : '') + `${kg} kg · ${lb} lb${each}` + (kind === 'b' ? ' (con barra)' : '') };
  }

  /* ---------- Ajuste por cómo te fue (retroalimentación de un toque) ---------- */
  // Por ejercicio y en orden: Fácil sube un escalón, Bien sigue la curva desde el peso real,
  // Pesado congela el peso (dos seguidos bajan ~5 %), Molestia baja ~10 % y sugiere la regresión.
  function adjState(id, date) {
    const ev = FBI[id];
    if (!ev || !LOADS[id]) return null;
    const kind = LOADS[id][1];
    let st = null, hard = 0;
    for (const e of ev) {
      if (e.date >= date) break;
      const used = e.kg || e.sug, plan = rawKg(id, e.date, e.type);
      if (!used || !plan) continue;
      if (e.r === 'easy') { hard = 0; st = { mult: (used * 1.08) / plan, floor: nextUp(used, kind), kind: 'up', from: e.date }; }
      else if (e.r === 'ok') { hard = 0; st = { mult: used / plan, kind: e.kg && e.kg !== e.sug ? 'real' : 'ok', from: e.date }; }
      else if (e.r === 'hard') { hard++; const f = hard >= 2 ? 0.95 : 1; st = { mult: (used * f) / plan, cap: used * f, kind: hard >= 2 ? 'down' : 'hold', from: e.date }; if (hard >= 2) hard = 0; }
      else if (e.r === 'pain') { hard = 0; st = { mult: (used * 0.9) / plan, cap: used * 0.9, kind: 'pain', from: e.date }; }
    }
    return st;
  }
  function loadFor(id, date, type, plain) {
    const L = LOADS[id];
    if (!L) return null;
    let raw = rawKg(id, date, type);
    const a = plain ? null : adjState(id, date);
    if (a) { raw *= a.mult; if (a.cap) raw = Math.min(raw, a.cap); }
    let kg = roundLoad(raw, L[1]);
    if (a && a.floor && !DELOAD_WEEKS.includes(weekOf(date)) && weekOf(date) < 20) kg = Math.max(kg, a.floor);
    return Object.assign(label(kg, L[1]), { adj: a ? a.kind : null });
  }

  // progresiones de variantes (sobre todo sin peso): dos "Fácil" seguidos suben un peldaño;
  // "Molestia" o dos "Pesado" seguidos bajan uno.
  const LADDERS = [
    ['incline_push_up', 'push_up', 'decline_push_up'],
    ['pause_squat', 'bw_split_squat', 'bw_bulgarian'],
    ['glute_bridge', 'sl_glute_bridge', 'sl_hip_thrust'],
    ['ham_bridge', 'slider_curl', 'nordic_assisted'],
    ['wall_sit', 'sissy_squat_assisted'],
    ['low_step_up', 'bw_step_up'],
    ['towel_row', 'table_row'],
    ['plank', 'bear_plank'],
    ['chair_dip', 'cg_push_up']
  ];
  const LADDER_OF = {};
  LADDERS.forEach((l, i) => l.forEach((id) => { LADDER_OF[id] = i; }));
  function ladderOffset(li, date) {
    let off = 0, easy = 0, hard = 0;
    (FBL[li] || []).forEach((e) => {
      if (e.date >= date) return;
      if (e.r === 'easy') { hard = 0; if (++easy >= 2) { off++; easy = 0; } }
      else if (e.r === 'hard') { easy = 0; if (++hard >= 2) { off--; hard = 0; } }
      else if (e.r === 'pain') { easy = 0; hard = 0; off--; }
      else { easy = 0; hard = 0; }
    });
    return off;
  }

  const WARMUP = {
    gym: [['bike_easy', 'Bicicleta suave', '5–8 min'], ['glute_bridge', 'Glute bridge', '12'], ['band_lateral_walk', 'Banded lateral walk', '10 pasos/lado'], ['goblet_box', 'Sentadilla a banco sin peso', '10'], ['sl_balance', 'Single-leg balance', '20 s/lado']],
    kb: [['bike_easy', 'Bici o caminata', '5 min'], ['kb_halo', 'KB halo', '5/dirección'], ['kb_atw', 'KB around the world', '5/dirección'], ['dead_bug', 'Dead bug', '6/lado'], ['glute_bridge', 'Glute bridge', '12'], ['sl_balance', 'Single-leg balance', '20 s/lado']],
    home: [['a_skip', 'Marcha con rodillas altas en el lugar', '2 min'], ['glute_bridge', 'Glute bridge', '12'], ['pause_squat', 'Sentadilla a silla sin peso', '10'], ['bird_dog', 'Bird dog', '5/lado'], ['side_lying_raise', 'Elevación lateral acostado', '10/lado'], ['sl_balance', 'Single-leg balance', '20 s/lado']]
  };

  /* ---------- Casa: sustitutos sin equipo (el primero que no esté ya en la sesión) ---------- */
  const HOME_EQ = ['Peso corporal', 'Escalón', 'Pared', 'Deslizadores / toalla', 'Cinta en el piso', 'Pad / cojín', 'Banco', 'Poste', 'Poste / TRX', 'Peso corporal / KB', 'Cajón', 'Silla', 'Silla / sofá', 'Marco de puerta', 'Mesa firme', 'Toalla + puerta', 'Toalla', 'Sofá o alguien que sujete', 'Línea en el piso', 'Cuerda (o imaginaria)', 'Caminadora o calle plana'];
  const homeOk = (ex) => HOME_EQ.includes(ex.eq) && ex.id !== 'box_jump_low';
  const HOME = {
    leg_press: ['bw_bulgarian', 'bw_split_squat'], sl_leg_press: ['sl_squat_assisted', 'bw_step_up'],
    leg_extension: ['sissy_squat_assisted', 'wall_sit'], sl_leg_extension: ['sissy_squat_assisted', 'wall_sit'],
    goblet_squat: ['bw_split_squat', 'pause_squat'], goblet_box: ['pause_squat', 'bw_split_squat'], box_squat: ['bw_split_squat', 'pause_squat'],
    split_squat: ['bw_split_squat', 'bw_reverse_lunge'], split_squat_assisted: ['bw_split_squat', 'bw_reverse_lunge'], bulgarian_split_squat: ['bw_bulgarian', 'bw_split_squat'],
    step_up: ['bw_step_up', 'low_step_up'], reverse_lunge: ['bw_reverse_lunge', 'bw_split_squat'],
    hip_thrust: ['sl_hip_thrust', 'sl_glute_bridge'], cable_kickback: ['sl_glute_bridge'], band_kickback: ['sl_glute_bridge'],
    seated_leg_curl: ['slider_curl', 'ham_bridge', 'nordic_assisted'], lying_leg_curl: ['slider_curl', 'ham_bridge'], sl_leg_curl: ['slider_curl', 'nordic_assisted'],
    rdl: ['bw_sl_rdl', 'ham_bridge'], db_rdl: ['bw_sl_rdl', 'ham_bridge'], kb_rdl: ['bw_sl_rdl', 'ham_bridge'], kb_deadlift: ['bw_sl_rdl', 'ham_bridge'], sl_rdl: ['bw_sl_rdl'],
    hip_abductor: ['side_lying_raise'], hip_adductor: ['copenhagen', 'lateral_lunge'],
    band_lateral_walk: ['side_lying_raise', 'side_plank'], monster_walk: ['side_lying_raise', 'side_plank'], band_abduction: ['side_lying_raise', 'side_plank'],
    standing_calf: ['sl_calf'], seated_calf: ['sl_calf'], ankle_inversion: ['sl_balance', 'tib_raise'], ankle_eversion: ['sl_balance', 'tib_raise'],
    chest_press: ['push_up', 'decline_push_up'], db_bench: ['push_up', 'decline_push_up'], incline_chest_press: ['decline_push_up', 'push_up'], incline_db: ['decline_push_up', 'push_up'],
    kb_floor_press: ['push_up', 'cg_push_up'], sa_kb_floor_press: ['push_up', 'cg_push_up'], kb_chest_pass: ['bear_plank', 'plank'],
    lat_pulldown: ['table_row', 'towel_row'], neutral_pulldown: ['table_row', 'towel_row'], cable_row: ['towel_row', 'table_row'], cs_db_row: ['table_row', 'towel_row'],
    db_row: ['towel_row', 'table_row'], kb_row: ['towel_row', 'table_row'], straight_arm_pd: ['superman'], face_pull: ['prone_ytw'], rear_delt_fly: ['prone_ytw'], lateral_raise: ['prone_ytw', 'pike_push_up'],
    shoulder_press: ['pike_push_up'], db_shoulder_press: ['pike_push_up'], hk_kb_press: ['pike_push_up'],
    db_curl: ['towel_curl'], hammer_curl: ['towel_curl'], incline_curl: ['towel_curl'], cable_curl: ['towel_curl'], sa_cable_curl: ['towel_curl'],
    rope_pushdown: ['chair_dip', 'cg_push_up'], cable_tri_ext: ['chair_dip', 'cg_push_up'], oh_cable_ext: ['chair_dip', 'cg_push_up'], db_oh_ext: ['chair_dip', 'cg_push_up'],
    kb_halo: ['dead_bug', 'bird_dog'], kb_atw: ['dead_bug', 'bird_dog'], pallof: ['side_plank', 'bird_dog'], hk_pallof: ['side_plank', 'bird_dog'],
    cable_chop: ['side_plank', 'bear_plank'], cable_lift: ['side_plank', 'bear_plank'], dead_bug_w: ['dead_bug'], tgu: ['bear_plank', 'superman'],
    kb_suitcase: ['side_plank', 'bear_plank', 'plank'], kb_farmer: ['bear_plank', 'plank'], kb_front_rack: ['plank', 'bear_plank'],
    kb_swing: ['squat_jump', 'glute_bridge'], kb_clean: ['squat_jump', 'glute_bridge'], kb_clean_press: ['pike_push_up'], box_jump_low: ['squat_jump'],
    spanish_squat: ['wall_sit'], bike_easy: ['a_skip'], bike_intervals: ['a_skip']
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

  const isQuadUni = (ex) => ex.uni && ex.tags.includes('quads') && ex.unit === 'reps' && !ex.auth;
  function rxFor(type, ex, phase, deload, wk) {
    let base;
    if (type === 'iso') base = { s: phase >= 5 ? 2 : 3, r: ISO_RX[phase], rpe: '6–7', rest: '45 s' };
    else if (type === 'carry') base = { s: 3, r: DIST_RX[phase], rpe: '7', rest: '60 s' };
    else base = Object.assign({}, (RX[type] || RX.acc)[phase] || RX.acc[phase]);
    base = Object.assign({}, base);
    if (ex.unit === 'time' && type !== 'iso') base.r = TIME_RX[phase] + (ex.uni ? '/lado' : '');
    if (ex.unit === 'time' && type === 'iso' && ex.uni && !/lado/.test(base.r)) base.r += '/lado';
    if (ex.unit === 'dist' && type !== 'carry') base.r = DIST_RX[phase];
    if (ex.unit === 'cm') base.r = (base.r || '6/lado');
    if (ex.uni && ex.unit === 'reps' && !/lado/.test(base.r)) base.r += '/lado';
    if (ex.unit !== 'reps') delete base.tempo;
    if (deload) { base.s = Math.max(2, base.s - 1); base.deload = true; }
    if (wk === 20 && phase === 5) base.s = Math.min(base.s, 2);
    // la pierna operada va atrasada: una serie extra solo con la izquierda en cuádriceps unilateral
    if (isQuadUni(ex) && phase <= 4 && !deload) base.xl = true;
    return base;
  }
  function casaRx(rx, ex, type, phase) {
    if (ex.unit !== 'reps' || !['main', 'uni', 'acc', 'kb', 'upper'].includes(type)) return rx;
    const legs = ex.tags.some((t) => ['quads', 'hams', 'glutes'].includes(t));
    const [r, tempo] = (legs ? CASA_RX.legs : CASA_RX.upper)[phase];
    return Object.assign({}, rx, { r: r + (ex.uni ? '/lado' : ''), tempo, rpe: '8', home: true });
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
    return { code: slot.code, id, rx: rxFor(slot.type, ex, phase, deload, wk), note: slot.note || null, type: slot.type };
  }

  const MUSCLE_ORDER = ['quads', 'hams', 'glutes', 'adductors', 'abductors', 'calves', 'core', 'chest', 'back', 'shoulders', 'biceps', 'triceps', 'balance', 'stability'];

  /* ---------- Sesión base (solo calendario; se guarda en caché) ---------- */
  const baseCache = {};
  function baseSession(date) {
    if (baseCache[date]) return baseCache[date];
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
        kind: 'gym', title: 'Activación pre-viaje', sub: 'Sesión corta: moverse bien, nada pesado', level: 1, short: true,
        warmup: WARMUP.gym.slice(0, 3).map(([id, n, dose]) => ({ id, n, dose })),
        blocks: [
          { code: 'A', items: [{ code: 'A1', id: 'goblet_squat', type: 'main', rx: { s: 2, r: '5', rpe: '5–6', rest: '90 s' } }, { code: 'A2', id: 'pallof', type: 'core', rx: { s: 2, r: '8/lado', rpe: '5', rest: '30 s' } }] },
          { code: 'B', items: [{ code: 'B1', id: 'sl_rdl', type: 'uni', rx: { s: 2, r: '5/lado', rpe: '5–6', rest: '60 s' } }, { code: 'B2', id: 'step_down', type: 'uni', rx: { s: 2, r: '5/lado', rpe: '5', rest: '60 s' } }] },
          { code: 'C', items: [{ code: 'C1', id: 'ski_hold', type: 'iso', rx: { s: 2, r: '20 s', rpe: '5', rest: '30 s' } }] }
        ],
        ski: []
      });
    } else {
      const T = DAYS[dow];
      const lightTue = wk === 20 && (dow === 2 || dow === 4);
      const blocks = T.blocks.map(([code, ...slots]) => ({ code, items: slots.map((sl) => resolveSlot(sl, phase, wip, deload, wk)).filter(Boolean) })).filter((b) => b.items.length);
      if (lightTue) blocks.splice(2);
      const ski = ((T.ski || {})[phase] || []).map((sl) => resolveSlot(sl, phase, wip, deload, wk)).filter(Boolean);
      s = Object.assign(base, {
        kind: T.kind, title: T.title, sub: T.sub, level: levelFor(T.kind, phase, deload || lightTue), short: lightTue,
        warmup: (WARMUP[T.kind] || []).concat(phase >= 2 && T.kind === 'gym' ? [['step_down', 'Step-down lento', '5/lado']] : []).map(([id, n, dose]) => ({ id, n, dose })),
        blocks, ski
      });
    }
    if (!s.blocks) s.muscles = [];
    baseCache[date] = s;
    return s;
  }

  /* ---------- Estado personal (lo pone app.js) ---------- */
  let ST = { fb: {}, swaps: {}, gates: {}, days: {}, today: null };
  let FBI = {}, FBL = {}, VER = 0;
  const pcache = new Map();
  function setState(st) {
    ST = Object.assign({ fb: {}, swaps: {}, gates: {}, days: {}, today: null }, st);
    FBI = {}; FBL = {};
    Object.keys(ST.fb).sort().forEach((date) => {
      Object.values(ST.fb[date] || {}).forEach((e) => {
        if (!e || !e.r || !e.id) return;
        const ev = Object.assign({ date }, e);
        (FBI[e.id] = FBI[e.id] || []).push(ev);
        if (LADDER_OF[e.id] != null) (FBL[LADDER_OF[e.id]] = FBL[LADDER_OF[e.id]] || []).push(ev);
      });
    });
    VER++; pcache.clear();
  }
  const nowDate = () => ST.today || today();

  /* ---------- Ruta de impacto: etapa vigente ---------- */
  // Hasta hoy: la etapa avanza solo con la prueba aprobada (y no antes de su fecha, salvo la 1 con luz verde).
  // Días futuros: se planea por calendario.
  function stageAt(date) {
    const t = nowDate();
    let k = 0;
    for (let i = 1; i < IMPACT.length; i++) {
      const st = IMPACT[i], g = (ST.gates[st.id] || {}).date;
      const ok = date > t ? (date >= st.from || (g && st.early)) : (g && g <= date && (st.early || date >= st.from));
      if (ok) k = i; else break;
    }
    return k;
  }
  function gateDue(date) {
    const k = stageAt(date), nx = IMPACT[k + 1];
    if (!nx || !nx.gate || (ST.gates[nx.id] || {}).date) return null;
    return date >= addDays(nx.from, -7) ? nx : null;
  }
  function runMinutes(date) { const st = IMPACT[2], w = Math.floor(diffDays(st.from, date) / 7); return Math.min(25, 15 + Math.max(0, w) * 5); }

  function painRecent(date, id, days) {
    return (FBI[id] || []).some((e) => e.r === 'pain' && e.date < date && diffDays(e.date, date) <= days);
  }

  /* ---------- Sesión personalizada ---------- */
  const BY = () => window.EX.BY;
  function mkItem(code, id, type, rx, extra) { return Object.assign({ code, id, type, rx }, extra || {}); }

  function impactItems(s, where) {
    const k = stageAt(s.date), plan = IMP[k], taper = s.date >= TAPER_FROM, out = { pre: [], post: [] };
    if (!plan) return out;
    ['pre', 'post'].forEach((when) => {
      ((plan[when] || {})[s.dow] || []).forEach(([id, rx0, alt], i) => {
        let use = id, swapped = false;
        if (painRecent(s.date, id, 14) && alt) { use = alt; swapped = true; }
        if (where === 'home' && !homeOk(BY()[use])) use = (HOME[use] || []).find((h) => homeOk(BY()[h]) && (k >= 1 || !BY()[h].auth)) || 'glute_bridge';
        const rx = Object.assign({}, rx0);
        if (rx.iv) rx.iv = Object.assign({}, rx.iv);
        if (rx.r === 'RUN') { const m = taper ? 15 : runMinutes(s.date); rx.r = `${m} min`; rx.iv = IV(m * 60, 0, 1, 'Trote suave', ''); }
        if (s.deload) { rx.s = Math.max(2, rx.s - 1); if (rx.iv && rx.iv.n > 2) rx.iv.n -= 2; }
        if (taper) { rx.s = Math.min(rx.s, 2); if (rx.iv && rx.iv.n > 1) rx.iv.n = Math.ceil(rx.iv.n / 2); }
        if (rx.iv && rx.iv.n > 1 && /^\d+ ×/.test(rx.r)) rx.r = rx.r.replace(/^\d+/, rx.iv.n);
        if (rx.iv && rx.iv.n > 1 && !/×/.test(rx.r)) rx.s = rx.iv.n;
        const ex = BY()[use];
        if (use !== id && !rx.iv && ex.unit === 'time') rx.r = TIME_RX[s.phase] + (ex.uni ? '/lado' : '');
        out[when].push(mkItem((when === 'pre' ? 'X' : 'Z') + (i + 1), use, when === 'pre' ? 'imp' : 'cond', rx, { alt: use === id ? alt : null, painAlt: swapped, stage: k }));
      });
    });
    return out;
  }

  const restSecOf = (rest) => { const n = (String(rest || '').match(/\d+(?:[.,]\d+)?/g) || []).map((x) => parseFloat(x.replace(',', '.'))); if (!n.length) return 0; const v = Math.max(...n); return /min/.test(rest) ? v * 60 : v; };
  const topNum = (r) => { const n = (String(r || '').match(/\d+(?:[.,]\d+)?/g) || []).map((x) => parseFloat(x.replace(',', '.'))); return n.length ? Math.max(...n) : 0; };
  const ivSec = (iv) => iv.n * iv.on + Math.max(0, iv.n - 1) * iv.off;
  function workSec(it) {
    const ex = BY()[it.id], r = it.rx.r;
    if (it.rx.iv) return ivSec(it.rx.iv) + 60;
    let per;
    if (ex.unit === 'time') per = topNum(r) * (/min/.test(r) ? 60 : 1) * (/lado/.test(r) ? 2 : 1);
    else if (ex.unit === 'dist') per = 45;
    else per = (topNum(r) || 10) * 3 * (/lado/.test(r) ? 2 : 1);
    return it.rx.s * (per + 25) + (it.rx.xl ? per + 25 : 0);
  }
  function groupSec(items) {
    if (!items.length) return 0;
    const sets = Math.max(...items.map((i) => (i.rx.iv ? 1 : i.rx.s)));
    return items.reduce((a, i) => a + workSec(i), 0) + Math.max(0, sets - 1) * restSecOf(items[0].rx.rest) + 60;
  }
  function estimate(s) {
    let sec = (s.warmShort ? 5 : 8) * 60;
    s.blocks.forEach((b) => { sec += groupSec(b.items); });
    s.imp.forEach((it) => { sec += groupSec([it]); });
    s.cond.forEach((it) => { sec += groupSec([it]); });
    if (s.ski.length) sec += groupSec(s.ski);
    return Math.max(15, Math.round(sec / 300) * 5);
  }

  // lo que se recorta primero cuando eliges una sesión más corta (número bajo = sale antes)
  function keepScore(it) {
    const ex = BY()[it.id], t = ex.tags, first = t[0];
    if (it.type === 'main') return 100;
    if (it.type === 'imp') return 60;
    if (it.type === 'cond') return 45;
    if (first === 'quads' || (ex.uni && t.includes('quads'))) return 80;
    if (it.type === 'upper' || (it.type === 'kb' && ['chest', 'back', 'shoulders'].includes(first))) return 70;
    if (it.type === 'uni' || it.type === 'kb') return 65;
    if (it.type === 'iso') return 55;
    if (first === 'hams') return 58;
    if (it.type === 'acc') return 40;
    if (it.type === 'stab') return 42;
    if (it.type === 'core') return 35;
    if (it.type === 'carry') return 30;
    if (['biceps', 'triceps', 'shoulders', 'back'].includes(first)) return 25;
    return 20;
  }
  const isPush = (ex) => ex.tags[0] === 'chest' || (ex.tags[0] === 'shoulders' && ex.tags.includes('triceps'));
  const isPull = (ex) => ex.tags[0] === 'back' && !ex.tags.includes('core');
  const isQuad = (ex) => ex.tags[0] === 'quads' || (ex.uni && ex.tags.includes('quads'));

  function trim(s, target) {
    if (!target || estimate(s) <= target) return;
    const all = () => [...s.blocks.flatMap((b) => b.items), ...s.ski, ...s.imp, ...s.cond];
    const remove = (it) => {
      s.blocks.forEach((b) => { b.items = b.items.filter((x) => x !== it); });
      s.blocks = s.blocks.filter((b) => b.items.length);
      ['ski', 'imp', 'cond'].forEach((k) => { s[k] = s[k].filter((x) => x !== it); });
    };
    const minQuad = target <= 20 ? 1 : 2;
    // primero menos series y calentamiento corto; luego, si aún no cabe, salen ejercicios
    all().forEach((it) => { if (!it.rx.iv && keepScore(it) < 60 && it.rx.s > 2) it.rx.s--; });
    if (target <= 30) s.warmShort = true;
    const order = all().slice().sort((a, b) => keepScore(a) - keepScore(b));
    for (const it of order) {
      if (estimate(s) <= target) break;
      if (it.type === 'main') continue;
      const ex = BY()[it.id], rest = all().filter((x) => x !== it).map((x) => BY()[x.id]);
      if (isPush(ex) && !rest.some(isPush)) continue;
      if (isPull(ex) && !rest.some(isPull)) continue;
      if (isQuad(ex) && rest.filter(isQuad).length < minQuad) continue;
      if (it.type === 'imp' && target >= 30 && s.imp.length <= 1) continue;
      remove(it);
    }
    if (estimate(s) > target) all().forEach((it) => { if (!it.rx.iv && it.type !== 'main' && it.rx.s > 2) it.rx.s--; });
    if (estimate(s) > target) s.warmShort = true;
    if (estimate(s) > target && target <= 20) all().forEach((it) => { if (!it.rx.iv) it.rx.s = 2; });
  }

  // sin elección, la sesión completa se acota a ~75 min (lo que sale primero: accesorios pequeños)
  const DEFAULT_MIN = 75;
  const HOME_SUB = { 1: 'cuádriceps + pecho, espalda, hombro y tríceps', 2: 'cuerpo completo', 3: 'cadera y cuádriceps + espalda, hombro y bíceps', 4: 'unilateral + empuje y tirón', 5: 'cuerpo completo' };
  function session(date) {
    const hit = pcache.get(date);
    if (hit) return hit;
    const b = baseSession(date);
    if (!b) return null;
    if (!b.blocks) { pcache.set(date, b); return b; }
    const s = JSON.parse(JSON.stringify(b));
    const opt = ST.days[date] || {}, where = opt.where === 'home' ? 'home' : 'gym';
    s.where = where; s.target = opt.min || DEFAULT_MIN; s.chosen = !!opt.min;
    const imp = impactItems(s, where);
    s.imp = imp.pre; s.cond = imp.post;
    s.stage = stageAt(date);
    const items = () => [...s.blocks.flatMap((x) => x.items), ...s.ski];
    const reRx = (it, id) => { it.id = id; it.rx = rxFor(it.type, BY()[id], s.phase, s.deload, s.week); };

    // casa: cada ejercicio sin equipo cambia por uno del mismo patrón
    if (where === 'home') {
      s.warmup = WARMUP.home.map(([id, n, dose]) => ({ id, n, dose }));
      const used = new Set(items().map((it) => it.id).filter((id) => homeOk(BY()[id])));
      items().forEach((it) => {
        if (homeOk(BY()[it.id])) return;
        const opts = (HOME[it.id] || []).filter((h) => BY()[h] && homeOk(BY()[h]));
        const to = opts.find((h) => !used.has(h)) || opts[0] || 'plank';
        used.add(to); it.from = it.id; reRx(it, to);
      });
    }
    // cambios que elegiste (⇄), desde el día en que los hiciste
    items().forEach((it) => {
      const sw = ST.swaps[it.id];
      if (!sw || sw.from > date || !BY()[sw.to]) return;
      if (where === 'home' && !homeOk(BY()[sw.to])) return;
      it.swappedFrom = it.id; reRx(it, sw.to);
    });
    // progresión de variantes por tu retroalimentación
    items().forEach((it) => {
      const li = LADDER_OF[it.id];
      if (li == null) return;
      const lad = LADDERS[li], off = ladderOffset(li, date);
      if (!off) return;
      let to = lad[Math.max(0, Math.min(lad.length - 1, lad.indexOf(it.id) + off))];
      if (where === 'home' && !homeOk(BY()[to])) to = it.id;
      if (to !== it.id) { it.laddered = off > 0 ? 'up' : 'down'; it.ladderFrom = it.id; reRx(it, to); }
    });
    // prescripción final y peso sugerido
    items().forEach((it) => {
      const ex = BY()[it.id];
      if (where === 'home') { it.rx = casaRx(it.rx, ex, it.type, s.phase); it.load = null; }
      else it.load = loadFor(it.id, date, it.type);
      if (painRecent(date, it.id, 10)) it.pain = true;
    });
    [...s.imp, ...s.cond].forEach((it) => { it.load = where === 'home' ? null : loadFor(it.id, date, 'imp'); });

    s.full = estimate(s);
    trim(s, s.target);
    s.duration = estimate(s);
    const count = {};
    allItems(s).forEach((it) => { BY()[it.id].tags.forEach((t) => { count[t] = (count[t] || 0) + 1; }); });
    s.muscles = MUSCLE_ORDER.filter((m) => count[m]).sort((a, c) => count[c] - count[a]).slice(0, 4);
    if (where === 'home') { s.sub = 'En casa, sin equipo · ' + HOME_SUB[s.dow]; if (s.kind === 'kb') s.title = s.title.replace('kettlebell', 'en casa'); }
    pcache.set(date, s);
    return s;
  }

  function allItems(s) {
    if (!s || !s.blocks) return [];
    return [...(s.imp || []), ...s.blocks.flatMap((b) => b.items), ...(s.ski || []), ...(s.cond || [])];
  }

  const MILESTONES = [
    { date: '2026-10-01', title: 'Inicio del programa · Fase 1', kind: 'phase' },
    { date: '2026-10-30', title: 'Revisión sugerida con tu fisio: cierre de Fase 1. Pregunta por trote y saltos', kind: 'pro' },
    { date: '2026-11-01', title: 'Fase 2 · Desarrollo de fuerza', kind: 'phase' },
    { date: '2026-11-12', title: '6 semanas de actividad: se abre la ventana para regresar al box (hasta el 26 nov). Confírmalo con tu doctor', kind: 'box' },
    { date: '2026-11-16', title: 'Impacto · etapa 1: cuerda, pogos y trote–caminata (con la prueba aprobada)', kind: 'impact' },
    { date: '2026-11-23', title: 'Semana de descarga', kind: 'deload' },
    { date: '2026-11-30', title: 'Impacto · etapa 2: correr de forma continua', kind: 'impact' },
    { date: '2026-12-01', title: 'Fase 3 · Fuerza + estabilidad', kind: 'phase' },
    { date: '2026-12-28', title: 'Semana de descarga · Impacto etapa 3: saltos a una pierna', kind: 'impact' },
    { date: '2027-01-01', title: 'Fase 4 · Fuerza + preparación específica', kind: 'phase' },
    { date: '2027-01-18', title: 'Impacto · etapa 4: ski hops, giros e intervalos', kind: 'impact' },
    { date: '2027-01-31', title: 'Meta: piernas listas. Febrero es solo para afinar', kind: 'goal' },
    { date: '2027-02-01', title: 'Fase 5 · Puesta a punto', kind: 'phase' },
    { date: '2027-02-10', title: 'Evaluación final con tu traumatólogo/fisio (antes del viaje)', kind: 'pro' },
    { date: '2027-02-15', title: 'Viaje de esquí', kind: 'goal' }
  ];

  const READINESS = [
    { id: 'strength', name: 'Fuerza', why: 'Las piernas sostienen la postura flexionada durante toda la bajada.', how: 'Ejercicios principales: leg press, RDL, sentadillas.' },
    { id: 'uni', name: 'Fuerza unilateral', why: 'En cada curva una pierna recibe más carga que la otra.', how: 'Single-leg press y extension, split squats, step-ups, con una serie extra para la izquierda.' },
    { id: 'knee', name: 'Control de rodilla', why: 'La rodilla debe mantenerse alineada bajo carga y en flexión.', how: 'Step-down, lateral step-down, single-leg squat.' },
    { id: 'stability', name: 'Estabilidad', why: 'Tronco y cadera estables mientras las piernas trabajan.', how: 'Pallof, carries, Copenhagen, side plank.' },
    { id: 'balance', name: 'Equilibrio', why: 'Nieve irregular, cambios de terreno y transiciones.', how: 'Single-leg balance, star excursion, superficies inestables.' },
    { id: 'eccentric', name: 'Control excéntrico', why: 'Absorber y frenar es la acción dominante del cuádriceps al esquiar.', how: 'Tempos de 3–4 s, step-downs, slider curl.' },
    { id: 'impact', name: 'Impacto y carrera', why: 'Aterrizar, saltar y trotar: la rodilla debe tolerar fuerzas de varias veces tu peso, una y otra vez.', how: 'Ruta de impacto: cuerda, pogos, trote–caminata → trote continuo → intervalos.' },
    { id: 'decel', name: 'Desaceleración', why: 'Frenar y detenerse con control.', how: 'Aterrizajes, saltos con freno a una pierna y giros, por etapas.' },
    { id: 'lateral', name: 'Capacidad lateral', why: 'Los cantos y las curvas exigen fuerza en el plano lateral.', how: 'Lateral step-down/up, lateral lunge, saltos laterales, skater bounds y ski hops.' },
    { id: 'tolerance', name: 'Tolerancia al esfuerzo', why: 'Varios días seguidos de esquí con buena técnica pese al cansancio.', how: 'Adherencia, capacidad de trabajo, intervalos de carrera y respuesta de la rodilla al día siguiente.' }
  ];

  const RECOVERY = [
    { id: 'bike', name: 'Bicicleta suave', dose: '20–40 min · RPE 3–4', desc: 'Pedaleo cómodo, podrías conversar. Ayuda a la movilidad y la recuperación de la rodilla.' },
    { id: 'walk', name: 'Caminata', dose: '30–45 min', desc: 'Terreno plano o cuesta suave. Ritmo cómodo.' },
    { id: 'run', name: 'Trote suave', dose: '20–30 min · RPE 4', desc: 'Solo si ya estás en la etapa 2 (correr) de la ruta de impacto. Plano y a ritmo de conversación.' },
    { id: 'kbflow', name: 'Full body ligero con kettlebell', dose: '20–25 min · RPE 4–5', desc: 'Circuito suave con una KB: KB deadlift ×10, goblet squat ×8, KB row ×8/lado, halo ×5/dirección y suitcase carry 20 m/lado. 2–3 vueltas sin prisa.' },
    { id: 'mobility', name: 'Movilidad', dose: '15–20 min', desc: 'Rutina abajo. Movimientos suaves, sin forzar rangos.' },
    { id: 'recovery', name: 'Recuperación', dose: 'Libre', desc: 'Foam roller suave en cuádriceps, glúteos y pantorrillas; estiramientos ligeros; buen descanso.' },
    { id: 'physio', name: 'Ejercicios de fisioterapia', dose: 'Según indicación', desc: 'Los ejercicios que tu fisio te haya prescrito.' }
  ];
  const MOBILITY = [
    ['Movilidad de tobillo rodilla a la pared', '10/lado'], ['Estiramiento de flexor de cadera medio arrodillado', '30 s/lado'],
    ['Estiramiento de cuádriceps (de pie o de lado)', '30 s/lado'], ['90/90 de cadera', '6/lado'], ['Gato-camello', '8'],
    ['Rotaciones torácicas en cuatro puntos', '6/lado'], ['Extensión de rodilla pasiva (talón sobre un soporte)', '2 min'], ['Respiración diafragmática boca arriba', '1 min']
  ];

  window.PROG = {
    SURGERY, START, END, WEEK1, PHASES, DELOAD_WEEKS, TOTAL_WEEKS, LEVELS, MILESTONES, READINESS, RECOVERY, MOBILITY, IMPACT, TAPER_FROM, LOADS, HOME_EQ,
    session, baseSession, DEFAULT_MIN, allItems, loadFor, growth, nextUp, stepOf, homeOk, stageAt, gateDue, setState, restSecOf, topNum,
    setProfile: (p) => { PROFILE = Object.assign({}, PROFILE, p); pcache.clear(); }, getProfile: () => PROFILE,
    parse, fmt, addDays, diffDays, today, weekOf, phaseOf, inProgram
  };
})();
