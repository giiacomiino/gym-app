/* exercises.js — biblioteca de ejercicios.
   tags: quads hams glutes adductors abductors calves core chest back shoulders
         biceps triceps stability balance kettlebell acl ski
   auth: categoría que requiere autorización médica (impact, explosive, lateral, cod, run) */
(function () {
  const P = (...a) => Object.assign({}, ...a);
  const ST = { t: 0, l: [0, 0], r: [0, 0] };
  const HANG = { la: [0, 0], ra: [0, 0] };
  const GOB = { la: [28, 158], ra: [28, 158] };
  const SQ = { t: 40, l: [88, -28], r: [88, -28] };
  const BOXSQ = { t: 34, l: [90, -18], r: [90, -18] };
  const HINGE = { t: 74, l: [12, -8], r: [12, -8], la: [0, 0], ra: [0, 0] };
  const SEAT = { t: -6, l: [90, 0], r: [90, 0], la: [20, 40], ra: [20, 40] };
  const F = { v: 'front' };
  const FR = { v: 'front', raw: true };
  const seat = { k: 'seat' };
  const yt = (q) => 'https://www.youtube.com/results?search_query=' + encodeURIComponent(q);

  const LIST = [
    /* ---------------- CUÁDRICEPS / RODILLA ---------------- */
    {
      id: 'leg_extension', n: 'Leg extension', es: 'Extensión de rodilla en máquina', tags: ['quads', 'acl'], eq: 'Máquina', lvl: 1,
      start: 'Sentado con la espalda apoyada, rodilla alineada con el eje de la máquina y el rodillo sobre el tobillo.',
      move: 'Extiende ambas rodillas hasta casi bloquear, pausa 1 s arriba y baja en 3 s.',
      mus: 'Cuádriceps (los cuatro vientres, en especial el recto femoral)',
      err: ['Despegar la cadera del asiento', 'Soltar el peso en la bajada', 'Usar impulso en lugar de control'],
      safe: ['Rango y carga según tu fisio: tras un injerto se suele limitar el rango al inicio y avanzar por etapas.', 'Sin dolor en la rodilla durante ni después.'],
      reg: 'Rango parcial (90°→45°) o isométrico a 60–90° de flexión.', prog: 'Single-leg leg extension o tempo 4 s en la bajada.',
      fig: { frames: [P(SEAT), P(SEAT, { l: [90, 84], r: [90, 84] })], anchor: 'hip', fix: 52, props: [seat, { k: 'roll', at: 'lank', dy: -4 }], guides: [{ k: 'arrow', j: 'lank' }] }
    },
    {
      id: 'sl_leg_extension', n: 'Single-leg leg extension', es: 'Extensión de rodilla a una pierna', tags: ['quads', 'acl'], eq: 'Máquina', uni: true, lvl: 2,
      start: 'Igual que la extensión bilateral, con el rodillo sobre un solo tobillo.',
      move: 'Extiende una pierna, pausa arriba y baja lento. Empieza con la izquierda y repite con la derecha el mismo número de reps.',
      mus: 'Cuádriceps, de forma aislada por lado',
      err: ['Compensar girando la cadera', 'Hacer la derecha con más reps que la izquierda'],
      safe: ['Es la mejor forma de ver la diferencia de fuerza entre piernas. Registra cada lado.', 'Rango autorizado por tu fisio.'],
      reg: 'Bilateral con énfasis en la izquierda.', prog: 'Más carga o pausa de 2 s arriba.',
      fig: { frames: [P(SEAT), P(SEAT, { l: [90, 84] })], anchor: 'hip', fix: 52, props: [seat, { k: 'roll', at: 'lank', dy: -4 }], guides: [{ k: 'arrow', j: 'lank' }] }
    },
    {
      id: 'leg_press', n: 'Leg press', es: 'Prensa de piernas', tags: ['quads', 'glutes', 'acl'], eq: 'Máquina', lvl: 1,
      start: 'Espalda y cadera pegadas al respaldo, pies al ancho de cadera en el centro de la plataforma.',
      move: 'Baja hasta ~90° de rodilla en 3 s, empuja con todo el pie sin bloquear las rodillas.',
      mus: 'Cuádriceps, glúteo mayor, aductores',
      err: ['Rodillas hacia adentro (valgo)', 'Despegar la cadera abajo', 'Bloquear las rodillas arriba'],
      safe: ['Rodillas alineadas con el segundo dedo del pie.', 'Profundidad que no genere molestia.'],
      reg: 'Rango corto o carga menor.', prog: 'Single-leg leg press.',
      fig: { frames: [{ t: -45, l: [162, 74], r: [162, 74], la: [30, 60], ra: [30, 60] }, { t: -45, l: [128, 128], r: [128, 128], la: [30, 60], ra: [30, 60] }], anchor: 'hip', fix: 34, props: [seat, { k: 'platform', at: 'lank', ang: 128 }], guides: [{ k: 'arrow', j: 'lank' }] }
    },
    {
      id: 'sl_leg_press', n: 'Single-leg leg press', es: 'Prensa a una pierna', tags: ['quads', 'glutes', 'acl'], eq: 'Máquina', uni: true, lvl: 2,
      start: 'Un pie al centro de la plataforma, el otro apoyado fuera o en el marco.',
      move: 'Baja controlado en 3 s y empuja. Primero la izquierda, la derecha iguala las reps.',
      mus: 'Cuádriceps, glúteo, por lado',
      err: ['Cadera que rota o se despega', 'Rodilla que se va hacia adentro'],
      safe: ['Empieza con ~40–50 % de la carga bilateral y ajusta.'],
      reg: 'Leg press bilateral.', prog: 'Tempo 4 s o pausa abajo.',
      fig: { frames: [{ t: -45, l: [162, 74], r: [150, 60], la: [30, 60], ra: [30, 60] }, { t: -45, l: [128, 128], r: [150, 60], la: [30, 60], ra: [30, 60] }], anchor: 'hip', fix: 34, props: [seat, { k: 'platform', at: 'lank', ang: 128 }], guides: [{ k: 'arrow', j: 'lank' }] }
    },
    {
      id: 'goblet_squat', n: 'Goblet squat', es: 'Sentadilla goblet', tags: ['quads', 'glutes', 'core', 'kettlebell'], eq: 'Kettlebell / mancuerna', lvl: 1,
      start: 'De pie, pies un poco más abiertos que la cadera, KB pegada al pecho sujeta por los cuernos.',
      move: 'Baja en 3 s llevando la cadera atrás y abajo, rodillas siguiendo la punta de los pies. Sube empujando el piso.',
      mus: 'Cuádriceps, glúteos, aductores, core',
      err: ['Talones que se levantan', 'Rodillas hacia adentro', 'Pecho que se cae'],
      safe: ['Profundidad cómoda y sin dolor.'],
      reg: 'Goblet squat to bench.', prog: 'Pausa abajo de 2 s o más peso.',
      fig: { frames: [P(ST, GOB), P(SQ, GOB)], props: [{ k: 'kb', h: 'c' }], guides: [{ k: 'arrow', j: 'hip' }] }
    },
    {
      id: 'goblet_box', n: 'Goblet squat to bench', es: 'Sentadilla goblet a banco', tags: ['quads', 'glutes', 'acl'], eq: 'Kettlebell + banco', lvl: 1,
      start: 'De pie frente a un banco (o caja) a la altura de la rodilla, KB al pecho.',
      move: 'Baja controlado hasta rozar el banco sin sentarte del todo y sube.',
      mus: 'Cuádriceps, glúteos',
      err: ['Dejarse caer sobre el banco', 'Balancearse para subir'],
      safe: ['El banco da una profundidad fija y segura para empezar a cargar.'],
      reg: 'Banco más alto.', prog: 'Banco más bajo, luego goblet squat libre.',
      fig: { frames: [P(ST, GOB), P(BOXSQ, GOB)], props: [{ k: 'kb', h: 'c' }, { k: 'box', at: 'hip', f: 1, dx: -6, dy: 4, w: 30 }], guides: [{ k: 'arrow', j: 'hip' }] }
    },
    {
      id: 'box_squat', n: 'Box squat', es: 'Sentadilla a caja', tags: ['quads', 'glutes', 'hams'], eq: 'Barra / mancuernas', lvl: 2,
      start: 'Caja detrás a la altura de la rodilla, carga en la espalda o mancuernas a los lados.',
      move: 'Lleva la cadera atrás hasta tocar la caja con control, pausa 1 s sin relajarte y sube.',
      mus: 'Cuádriceps, glúteos, isquiotibiales',
      err: ['Rebotar en la caja', 'Perder la tensión del tronco'],
      safe: ['Introdúcela con poca carga y aumenta poco a poco.'],
      reg: 'Goblet squat to bench.', prog: 'Más carga o caja más baja.',
      fig: { frames: [P(ST, { la: [-35, 150], ra: [-35, 150] }), P(BOXSQ, { t: 40, la: [-25, 160], ra: [-25, 160] })], props: [{ k: 'plate', at: 'neck', dx: -4, dy: 2, r: 10 }, { k: 'box', at: 'hip', f: 1, dx: -6, dy: 4, w: 30 }], guides: [{ k: 'arrow', j: 'hip' }] }
    },
    {
      id: 'wall_sit', n: 'Wall sit', es: 'Sentadilla isométrica en pared', tags: ['quads', 'ski', 'acl'], eq: 'Peso corporal', unit: 'time', lvl: 1,
      start: 'Espalda pegada a la pared, pies adelantados al ancho de cadera.',
      move: 'Desliza hasta ~60–90° de rodilla y mantén la posición el tiempo indicado.',
      mus: 'Cuádriceps (isométrico), glúteos',
      err: ['Rodillas por delante de la punta del pie', 'Cargar más una pierna'],
      safe: ['Elige un ángulo sin molestia. Se parece mucho a la postura de esquí.'],
      reg: 'Ángulo más alto (menos flexión).', prog: 'Más tiempo, disco en las piernas o mayor flexión.',
      fig: { frames: [{ t: 0, l: [40, -8], r: [40, -8], la: [10, 10], ra: [10, 10] }, { t: 0, l: [86, 2], r: [86, 2], la: [60, 40], ra: [60, 40] }], props: [{ k: 'wall', at: 'neck', f: 1, dx: -5 }], guides: [{ k: 'arrow', j: 'hip' }] }
    },
    {
      id: 'spanish_squat', n: 'Spanish squat', es: 'Sentadilla española', tags: ['quads', 'acl', 'ski', 'stability'], eq: 'Banda gruesa', unit: 'time', lvl: 1, sp: true,
      start: 'Banda gruesa anclada a un poste a la altura de la rodilla. Pasa la banda por detrás de ambas rodillas y aléjate hasta que tense.',
      move: 'Siéntate hacia atrás con el tronco casi vertical: las espinillas quedan verticales porque la banda sostiene las rodillas. Mantén la posición o haz reps lentas.',
      mus: 'Cuádriceps con gran carga isométrica, glúteos',
      err: ['Inclinar el tronco hacia adelante', 'Banda demasiado floja', 'Rodillas que se adelantan'],
      safe: ['Sin dolor anterior de rodilla. Suele tolerarse muy bien.'],
      reg: 'Menos profundidad o menos tiempo.', prog: 'Más profundidad, más tiempo o sujetar una KB al pecho.',
      why: 'La banda permite cargar mucho el cuádriceps con poca fuerza de cizalla en la rodilla. Es una forma eficiente y bien tolerada de recuperar fuerza del cuádriceps izquierdo. La postura (rodilla flexionada sostenida, tronco estable) se parece a la de esquí.',
      fig: { frames: [P(ST, { la: [40, 70], ra: [40, 70] }), { t: 8, l: [82, 8], r: [82, 8], la: [70, 90], ra: [70, 90] }], props: [{ k: 'band', from: { at: 'lknee', f: 1, dx: 62 }, to: 'lknee' }], guides: [{ k: 'v', j: 'lank', f: 1, top: -60 }, { k: 'arrow', j: 'hip' }] }
    },
    {
      id: 'step_up', n: 'Step-up', es: 'Subida al cajón', tags: ['quads', 'glutes', 'acl', 'ski'], eq: 'Cajón + mancuernas', uni: true, lvl: 2,
      start: 'Pie completo de la pierna de trabajo sobre un cajón a ~media espinilla o rodilla.',
      move: 'Empuja con la pierna de arriba hasta quedar de pie sobre el cajón, sin impulsarte con la de abajo. Baja lento.',
      mus: 'Cuádriceps, glúteo mayor y medio',
      err: ['Impulsarse con la pierna de abajo', 'Rodilla hacia adentro', 'Bajar dejándose caer'],
      safe: ['Altura que permita controlar la rodilla en todo el recorrido.'],
      reg: 'Low step-up.', prog: 'Cajón más alto o más peso.',
      fig: { frames: [P(ST, { l: [74, -14], r: [0, 0], la: [0, 0], ra: [0, 0] }), P(ST, { l: [0, 0], r: [22, -40], la: [0, 0], ra: [0, 0] })], props: [{ k: 'box', at: 'lank', dy: 2, w: 36, dx: 4 }, { k: 'db', h: 'both' }], guides: [{ k: 'arrow', j: 'hip' }] }
    },
    {
      id: 'low_step_up', n: 'Low step-up', es: 'Subida a escalón bajo', tags: ['quads', 'glutes', 'acl'], eq: 'Escalón', uni: true, lvl: 1,
      start: 'Escalón de 10–20 cm, pie de trabajo completo arriba.',
      move: 'Sube despacio con la pierna de arriba controlando la rodilla. Baja en 3 s.',
      mus: 'Cuádriceps, glúteo medio',
      err: ['Valgo de rodilla', 'Cadera que se cae del lado contrario'],
      safe: ['Buen punto de partida para unilateral.'],
      reg: 'Apoyo con la mano en la pared.', prog: 'Step-up a cajón más alto.',
      fig: { frames: [P(ST, { l: [48, -14], la: [0, 0], ra: [0, 0] }), P(ST, { r: [18, -30], la: [0, 0], ra: [0, 0] })], props: [{ k: 'box', at: 'lank', dy: 2, w: 36, dx: 4 }], guides: [{ k: 'arrow', j: 'hip' }] }
    },
    {
      id: 'step_down', n: 'Step-down', es: 'Bajada controlada del escalón', tags: ['quads', 'acl', 'ski', 'stability', 'balance'], eq: 'Escalón', uni: true, lvl: 2, sp: true,
      start: 'De pie con la pierna izquierda sobre un escalón de 10–20 cm; la otra pierna cuelga por delante.',
      move: 'Flexiona la rodilla de apoyo en 3 s hasta que el talón libre roce el piso, sin apoyarlo. Sube con la misma pierna.',
      mus: 'Cuádriceps (excéntrico), glúteo medio, estabilizadores de cadera',
      err: ['Rodilla que se va hacia adentro', 'Cadera que se cae', 'Apoyar el talón y empujar con él'],
      safe: ['Empieza con escalón bajo. La calidad (rodilla alineada) importa más que la altura.'],
      reg: 'Escalón más bajo o mano en la pared.', prog: 'Escalón más alto, tempo 4 s o mancuerna en la mano contraria.',
      why: 'Entrena el control excéntrico del cuádriceps y la alineación de rodilla en una pierna: frenar el cuerpo con la rodilla flexionada. Esquiar es justo eso, controlar y absorber en flexión. También es una de las mejores pruebas para ver la calidad de movimiento de la pierna operada.',
      fig: { frames: [P(ST, { r: [18, 8], la: [20, 10], ra: [20, 10] }), { t: 24, l: [60, -38], r: [30, 25], la: [65, 10], ra: [65, 10] }], lift: 22, props: [{ k: 'box', at: 'lank', dy: 2, w: 30, dx: -2 }], guides: [{ k: 'arrow', j: 'rank', bow: -0.2 }] }
    },
    {
      id: 'reverse_step_down', n: 'Reverse step-down', es: 'Bajada hacia atrás del escalón', tags: ['quads', 'glutes', 'acl', 'ski'], eq: 'Escalón', uni: true, lvl: 2,
      start: 'De pie sobre el escalón con la pierna de trabajo.',
      move: 'Lleva el pie libre hacia atrás y abajo controlando con la rodilla de apoyo; toca con la punta y sube.',
      mus: 'Cuádriceps y glúteo (excéntrico)',
      err: ['Dejarse caer al final', 'Torso muy inclinado'],
      safe: ['Altura baja al principio.'],
      reg: 'Escalón bajo.', prog: 'Escalón alto o tempo lento.',
      fig: { frames: [P(ST, { r: [-5, -10], la: [20, 10], ra: [20, 10] }), { t: 20, l: [58, -36], r: [-25, -12], la: [55, 10], ra: [55, 10] }], lift: 24, props: [{ k: 'box', at: 'lank', dy: 2, w: 30 }], guides: [{ k: 'arrow', j: 'rank' }] }
    },
    {
      id: 'lateral_step_down', n: 'Lateral step-down', es: 'Bajada lateral del escalón', tags: ['quads', 'ski', 'stability', 'acl'], eq: 'Escalón', uni: true, lvl: 2,
      start: 'De pie de lado sobre un escalón con la pierna izquierda; la derecha cuelga por fuera.',
      move: 'Baja el pie libre hacia el lado flexionando la rodilla de apoyo; la rodilla sigue alineada sobre el segundo dedo. Sube lento.',
      mus: 'Cuádriceps, glúteo medio, control frontal de rodilla',
      err: ['Valgo (rodilla hacia adentro)', 'Inclinar el tronco para compensar'],
      safe: ['Prioriza la alineación sobre la profundidad.'],
      reg: 'Escalón más bajo.', prog: 'Escalón más alto o carga ligera.',
      fig: { frames: [P(F, { l: [2, 0], r: [8, 0], la: [40, 20], ra: [40, 20] }), P(F, { t: -6, th: 0.72, l: [2, -2], r: [22, 4], la: [70, 40], ra: [70, 40] })], lift: 20, props: [{ k: 'box', at: 'lank', dy: 2, w: 30, dx: 4 }], guides: [{ k: 'v', j: 'ltoe', f: 0, top: -70 }] }
    },
    {
      id: 'sl_squat_assisted', n: 'Single-leg squat asistida', es: 'Sentadilla a una pierna con apoyo', tags: ['quads', 'balance', 'stability', 'acl'], eq: 'Poste / TRX', uni: true, lvl: 2,
      start: 'De pie sobre una pierna sujetando un poste o TRX.',
      move: 'Baja controlado a la profundidad que domines con la rodilla alineada y sube. Usa las manos solo lo necesario.',
      mus: 'Cuádriceps, glúteos, estabilizadores',
      err: ['Rodilla hacia adentro', 'Jalarse con los brazos'],
      safe: ['Profundidad progresiva.'],
      reg: 'A banco alto.', prog: 'Menos ayuda de manos o más profundidad.',
      fig: { frames: [P(ST, { r: [40, 20], la: [70, 10], ra: [70, 10] }), { t: 32, l: [80, -28], r: [62, 50], la: [80, 30], ra: [80, 30] }], props: [{ k: 'post', at: 'lhand', f: 0, dx: 2 }], guides: [{ k: 'arrow', j: 'hip' }] }
    },
    {
      id: 'split_squat_assisted', n: 'Split squat asistido', es: 'Sentadilla dividida con apoyo', tags: ['glutes', 'quads', 'acl'], eq: 'Poste', uni: true, lvl: 1,
      start: 'Postura de zancada fija (pie izquierdo adelante), una mano en un poste.',
      move: 'Baja vertical hasta casi tocar el piso con la rodilla de atrás y sube empujando con la pierna de adelante.',
      mus: 'Cuádriceps, glúteo mayor',
      err: ['Paso demasiado corto', 'Empujar con la pierna de atrás'],
      safe: ['Rango que toleres sin molestia.'],
      reg: 'Rango parcial.', prog: 'Sin apoyo o con mancuernas.',
      fig: { frames: [{ t: 0, l: [25, -5], r: [-25, -30], la: [60, 20], ra: [0, 0] }, { t: 4, l: [80, -8], r: [-10, -100], la: [60, 40], ra: [0, 0] }], props: [{ k: 'post', at: 'lhand', f: 0, dx: 4 }], guides: [{ k: 'arrow', j: 'hip' }] }
    },
    {
      id: 'split_squat', n: 'Split squat', es: 'Sentadilla dividida', tags: ['glutes', 'quads', 'acl', 'ski'], eq: 'Mancuernas', uni: true, lvl: 2,
      start: 'Zancada fija con mancuernas a los lados.',
      move: 'Baja vertical en 3 s y sube con la pierna de adelante.',
      mus: 'Cuádriceps, glúteo mayor, aductores',
      err: ['Rodilla que colapsa hacia adentro', 'Tronco inestable'],
      safe: ['Primero domina la versión asistida.'],
      reg: 'Split squat asistido.', prog: 'Bulgarian split squat.',
      fig: { frames: [{ t: 0, l: [25, -5], r: [-25, -30], la: [0, 0], ra: [0, 0] }, { t: 4, l: [80, -8], r: [-10, -100], la: [0, 0], ra: [0, 0] }], props: [{ k: 'db', h: 'both' }], guides: [{ k: 'arrow', j: 'hip' }] }
    },

    /* ---------------- GLÚTEOS ---------------- */
    {
      id: 'hip_thrust', n: 'Hip thrust', es: 'Empuje de cadera', tags: ['glutes', 'hams'], eq: 'Barra / máquina', lvl: 1,
      start: 'Escápulas apoyadas en un banco, pies firmes, barra (con pad) sobre la cadera.',
      move: 'Empuja la cadera hasta alinear rodilla, cadera y hombro. Pausa 1 s apretando glúteos y baja controlado.',
      mus: 'Glúteo mayor, isquiotibiales',
      err: ['Arquear la zona lumbar arriba', 'Pies demasiado lejos o cerca'],
      safe: ['Mentón ligeramente metido, costillas abajo.'],
      reg: 'Glute bridge en el piso.', prog: 'Single-leg hip thrust o más carga.',
      fig: { frames: [{ t: -60, l: [128, -18], r: [128, -18], la: [60, 60], ra: [60, 60] }, { t: -92, l: [90, -2], r: [90, -2], la: [92, 92], ra: [92, 92] }], props: [{ k: 'bench', at: 'neck', dy: 4, w: 32, dx: -6 }, { k: 'plate', at: 'hip', dy: -9, r: 10 }], guides: [{ k: 'arrow', j: 'hip' }] }
    },
    {
      id: 'sl_hip_thrust', n: 'Single-leg hip thrust', es: 'Empuje de cadera a una pierna', tags: ['glutes', 'hams', 'stability'], eq: 'Banco', uni: true, lvl: 2,
      start: 'Como el hip thrust, con una pierna extendida en el aire.',
      move: 'Empuja con una pierna manteniendo la pelvis nivelada.',
      mus: 'Glúteo mayor y medio, isquiotibiales',
      err: ['Pelvis que se inclina hacia un lado', 'Empujar con la espalda baja'],
      safe: ['Empieza sin carga.'],
      reg: 'Hip thrust bilateral.', prog: 'Mancuerna sobre la cadera.',
      fig: { frames: [{ t: -60, l: [128, -18], r: [150, 150], la: [60, 60], ra: [60, 60] }, { t: -92, l: [90, -2], r: [95, 95], la: [92, 92], ra: [92, 92] }], props: [{ k: 'bench', at: 'neck', dy: 4, w: 32, dx: -6 }], guides: [{ k: 'arrow', j: 'hip' }] }
    },
    {
      id: 'glute_bridge', n: 'Glute bridge', es: 'Puente de glúteo', tags: ['glutes', 'hams', 'core'], eq: 'Peso corporal', lvl: 1,
      start: 'Boca arriba, rodillas flexionadas, pies apoyados al ancho de cadera.',
      move: 'Eleva la cadera apretando glúteos hasta alinear rodilla-cadera-hombro. Pausa y baja.',
      mus: 'Glúteo mayor, isquiotibiales',
      err: ['Empujar con la espalda baja', 'Rodillas que se abren o cierran'],
      safe: ['Buen calentamiento de glúteo.'],
      reg: 'Rango corto.', prog: 'Single-leg glute bridge o banda en rodillas.',
      fig: { frames: [{ t: -90, l: [135, -25], r: [135, -25], la: [90, 90], ra: [90, 90] }, { t: -114, l: [104, -6], r: [104, -6], la: [90, 90], ra: [90, 90] }], guides: [{ k: 'arrow', j: 'hip' }] }
    },
    {
      id: 'sl_glute_bridge', n: 'Single-leg glute bridge', es: 'Puente de glúteo a una pierna', tags: ['glutes', 'hams', 'stability'], eq: 'Peso corporal', uni: true, lvl: 1,
      start: 'Boca arriba, un pie apoyado y la otra pierna extendida.',
      move: 'Eleva la cadera con una pierna sin que la pelvis se incline.',
      mus: 'Glúteo mayor y medio, isquiotibiales',
      err: ['Pelvis que cae del lado libre'],
      safe: ['Compara sensación izquierda vs derecha.'],
      reg: 'Glute bridge.', prog: 'Pie sobre un escalón o pausa de 3 s.',
      fig: { frames: [{ t: -90, l: [135, -25], r: [135, 135], la: [90, 90], ra: [90, 90] }, { t: -114, l: [104, -6], r: [104, 104], la: [90, 90], ra: [90, 90] }], guides: [{ k: 'arrow', j: 'hip' }] }
    },
    {
      id: 'cable_kickback', n: 'Cable kickback', es: 'Patada de glúteo en polea', tags: ['glutes'], eq: 'Cable', uni: true, lvl: 1,
      start: 'Tobillera en polea baja, de frente a la máquina, manos en el soporte, ligera inclinación.',
      move: 'Lleva la pierna hacia atrás con la rodilla casi extendida, aprieta el glúteo y regresa lento.',
      mus: 'Glúteo mayor',
      err: ['Arquear la espalda baja', 'Balancear la pierna'],
      safe: ['La pierna de apoyo trabaja estabilidad: rodilla suave.'],
      reg: 'Banded kickback.', prog: 'Más carga y pausa.',
      fig: { frames: [{ t: 22, l: [0, 0], r: [0, 0], la: [60, 60], ra: [60, 60] }, { t: 28, l: [0, 0], r: [-42, -45], la: [60, 60], ra: [60, 60] }], props: [{ k: 'cable', from: { at: 'rank', f: 0, dx: 48, dy: -4 }, to: 'rank' }], guides: [{ k: 'arrow', j: 'rank' }] }
    },
    {
      id: 'band_kickback', n: 'Banded kickback', es: 'Patada de glúteo con banda', tags: ['glutes'], eq: 'Banda', uni: true, lvl: 1,
      start: 'En cuatro puntos con una banda alrededor de los pies.',
      move: 'Extiende una pierna hacia atrás sin arquear la espalda y regresa.',
      mus: 'Glúteo mayor',
      err: ['Girar la cadera', 'Hundir la zona lumbar'],
      safe: ['Columna neutra.'],
      reg: 'Sin banda.', prog: 'Banda más fuerte.',
      fig: { frames: [{ t: 80, l: [0, -90], r: [0, -90], la: [0, 0], ra: [0, 0] }, { t: 80, l: [0, -90], r: [-95, -95], la: [0, 0], ra: [0, 0] }], anchor: 'lhand', props: [{ k: 'band', a: 'lank', b: 'rank' }], guides: [{ k: 'arrow', j: 'rank' }] }
    },
    {
      id: 'reverse_lunge', n: 'Reverse lunge', es: 'Zancada hacia atrás', tags: ['glutes', 'quads', 'ski'], eq: 'Mancuernas', uni: true, lvl: 2,
      start: 'De pie, mancuernas a los lados.',
      move: 'Da un paso atrás y baja controlado; regresa empujando con la pierna de adelante.',
      mus: 'Glúteo mayor, cuádriceps',
      err: ['Rodilla de adelante hacia adentro', 'Desequilibrio lateral'],
      safe: ['Más amable con la rodilla que la zancada hacia adelante. Paso lento, sin rebote.'],
      reg: 'Split squat asistido.', prog: 'Más carga o déficit pequeño.',
      fig: { frames: [P(ST, HANG), { t: 4, l: [80, -8], r: [-10, -100], la: [0, 0], ra: [0, 0] }], props: [{ k: 'db', h: 'both' }], guides: [{ k: 'arrow', j: 'rank' }] }
    },
    {
      id: 'bulgarian_split_squat', n: 'Bulgarian split squat', es: 'Sentadilla búlgara', tags: ['glutes', 'quads', 'acl', 'ski', 'balance'], eq: 'Banco + mancuernas', uni: true, lvl: 3,
      start: 'Empeine del pie de atrás sobre un banco, pie de adelante a un paso largo.',
      move: 'Baja vertical en 3 s hasta que el muslo de adelante quede cerca de paralelo y sube.',
      mus: 'Cuádriceps, glúteo mayor, aductores',
      err: ['Pie de adelante muy cerca', 'Rodilla que colapsa', 'Rebotar abajo'],
      safe: ['Exigente para la rodilla de adelante: agrégala cuando el split squat sea sólido.'],
      reg: 'Split squat.', prog: 'Más carga o tempo 4 s.',
      fig: { frames: [{ t: 2, l: [25, -5], r: [-30, -85], la: [0, 0], ra: [0, 0] }, { t: 10, l: [78, -10], r: [-12, -120], la: [0, 0], ra: [0, 0] }], props: [{ k: 'bench', at: 'rank', f: 0, dy: 3, w: 30, dx: -4 }, { k: 'db', h: 'both' }], guides: [{ k: 'arrow', j: 'hip' }] }
    },

    /* ---------------- ISQUIOTIBIALES ---------------- */
    {
      id: 'seated_leg_curl', n: 'Seated leg curl', es: 'Curl femoral sentado', tags: ['hams', 'acl'], eq: 'Máquina', lvl: 1,
      start: 'Sentado, rodillas alineadas con el eje, rodillo detrás de los tobillos.',
      move: 'Flexiona las rodillas jalando hacia abajo, pausa y regresa en 3 s.',
      mus: 'Isquiotibiales',
      err: ['Despegar la cadera', 'Soltar el peso al regresar'],
      safe: ['Isquios fuertes protegen el LCA: son prioridad.'],
      reg: 'Menos carga.', prog: 'Single-leg leg curl.',
      fig: { frames: [{ t: -10, l: [92, 84], r: [92, 84], la: [20, 40], ra: [20, 40] }, { t: -10, l: [92, -12], r: [92, -12], la: [20, 40], ra: [20, 40] }], anchor: 'hip', fix: 54, props: [seat, { k: 'roll', at: 'lank', dy: 5 }], guides: [{ k: 'arrow', j: 'lank' }] }
    },
    {
      id: 'lying_leg_curl', n: 'Lying leg curl', es: 'Curl femoral acostado', tags: ['hams', 'acl'], eq: 'Máquina', lvl: 1,
      start: 'Boca abajo en la máquina, rodillo sobre los tobillos.',
      move: 'Flexiona las rodillas sin despegar la cadera y baja en 3 s.',
      mus: 'Isquiotibiales, gemelos',
      err: ['Levantar la cadera', 'Movimientos bruscos'],
      safe: ['Controla la bajada.'],
      reg: 'Rango parcial.', prog: 'Single-leg.',
      fig: { frames: [{ t: 90, l: [-90, -90], r: [-90, -90], la: [10, 50], ra: [10, 50] }, { t: 90, l: [-90, -170], r: [-90, -170], la: [10, 50], ra: [10, 50] }], anchor: 'hip', fix: 46, props: [{ k: 'bench', at: 'hip', dy: 4, w: 70, dx: 20 }, { k: 'roll', at: 'lank', dy: -5 }], guides: [{ k: 'arrow', j: 'lank' }] }
    },
    {
      id: 'sl_leg_curl', n: 'Single-leg leg curl', es: 'Curl femoral a una pierna', tags: ['hams', 'acl'], eq: 'Máquina', uni: true, lvl: 2,
      start: 'Igual que el curl sentado o acostado, una pierna a la vez.',
      move: 'Flexiona una pierna con control. Izquierda primero, derecha iguala reps.',
      mus: 'Isquiotibiales por lado',
      err: ['Rotar la cadera'],
      safe: ['Útil para comparar lados.'],
      reg: 'Bilateral.', prog: 'Más carga o pausa.',
      fig: { frames: [{ t: -10, l: [92, 84], r: [92, 84], la: [20, 40], ra: [20, 40] }, { t: -10, l: [92, -12], r: [92, 84], la: [20, 40], ra: [20, 40] }], anchor: 'hip', fix: 54, props: [seat, { k: 'roll', at: 'lank', dy: 5 }], guides: [{ k: 'arrow', j: 'lank' }] }
    },
    {
      id: 'rdl', n: 'Romanian deadlift', es: 'Peso muerto rumano', tags: ['hams', 'glutes', 'back'], eq: 'Barra', lvl: 2,
      start: 'De pie, barra en las manos frente a los muslos, rodillas suaves.',
      move: 'Lleva la cadera atrás con la espalda neutra y la barra pegada a las piernas hasta sentir tensión en isquios. Sube apretando glúteos.',
      mus: 'Isquiotibiales, glúteos, erectores',
      err: ['Redondear la espalda', 'Flexionar demasiado la rodilla (se vuelve sentadilla)', 'Barra lejos del cuerpo'],
      safe: ['Rango hasta donde mantengas la espalda neutra.'],
      reg: 'Dumbbell / KB RDL.', prog: 'Más carga o tempo 4 s.',
      fig: { frames: [P(ST, HANG), P(HINGE)], props: [{ k: 'plate', at: 'lhand', r: 11 }], guides: [{ k: 'arrow', j: 'hip', bow: 0.3 }] }
    },
    {
      id: 'db_rdl', n: 'Dumbbell RDL', es: 'Peso muerto rumano con mancuernas', tags: ['hams', 'glutes'], eq: 'Mancuernas', lvl: 1,
      start: 'De pie con mancuernas frente a los muslos.',
      move: 'Bisagra de cadera con espalda neutra, mancuernas cerca de las piernas, y regreso.',
      mus: 'Isquiotibiales, glúteos',
      err: ['Espalda redonda', 'Mirar hacia arriba'],
      safe: ['Aprende la bisagra con poca carga.'],
      reg: 'Bisagra con palo en la espalda.', prog: 'RDL con barra.',
      fig: { frames: [P(ST, HANG), P(HINGE)], props: [{ k: 'db', h: 'l' }], guides: [{ k: 'arrow', j: 'hip', bow: 0.3 }] }
    },
    {
      id: 'kb_rdl', n: 'Kettlebell RDL', es: 'Peso muerto rumano con KB', tags: ['hams', 'glutes', 'kettlebell'], eq: 'Kettlebell', lvl: 1,
      start: 'De pie, KB sujeta con ambas manos frente a la cadera.',
      move: 'Bisagra de cadera manteniendo la KB cerca, hasta tensión en isquios, y regreso.',
      mus: 'Isquiotibiales, glúteos',
      err: ['Redondear la espalda', 'Bajar la KB lejos'],
      safe: ['Columna neutra siempre.'],
      reg: 'KB deadlift desde un escalón.', prog: 'Single-leg RDL.',
      fig: { frames: [P(ST, HANG), P(HINGE)], props: [{ k: 'kb', h: 'c' }], guides: [{ k: 'arrow', j: 'hip', bow: 0.3 }] }
    },
    {
      id: 'sl_rdl', n: 'Single-leg RDL', es: 'Peso muerto a una pierna', tags: ['hams', 'glutes', 'balance', 'stability', 'acl', 'ski', 'kettlebell'], eq: 'Kettlebell / mancuerna', uni: true, lvl: 2, sp: true,
      start: 'De pie sobre la pierna izquierda, rodilla suave, KB en la mano contraria (derecha).',
      move: 'Inclina el tronco mientras la pierna libre se va atrás en línea con la espalda. Cadera nivelada. Regresa apretando el glúteo de apoyo.',
      mus: 'Isquiotibiales, glúteo mayor y medio, estabilizadores de tobillo y rodilla',
      err: ['Abrir la cadera (rotar hacia afuera)', 'Bloquear la rodilla de apoyo', 'Espalda redonda'],
      safe: ['Empieza tocando una pared o poste con la mano libre si pierdes el equilibrio.'],
      reg: 'Apoyo de la punta del pie de atrás (kickstand RDL).', prog: 'Más peso o sin apoyo y más lento.',
      why: 'Combina fuerza de isquiotibiales y glúteo con equilibrio en una pierna y control de rotación de cadera y rodilla. Los isquiotibiales ayudan a proteger el LCA y el control unilateral es clave cuando una pierna recibe más carga en las curvas.',
      fig: { frames: [P(ST, HANG), { t: 80, l: [10, -6], r: [-96, -96], la: [0, 0], ra: [0, 0] }], props: [{ k: 'kb', h: 'r' }], guides: [{ k: 'arrow', j: 'rank' }] }
    },
    {
      id: 'ham_bridge', n: 'Hamstring bridge', es: 'Puente de isquiotibiales', tags: ['hams', 'glutes'], eq: 'Peso corporal', lvl: 1,
      start: 'Boca arriba con los talones apoyados más lejos que en el puente normal (rodillas casi extendidas).',
      move: 'Empuja con los talones y eleva la cadera; baja lento.',
      mus: 'Isquiotibiales, glúteos',
      err: ['Empujar con la espalda', 'Calambre: acerca un poco los pies'],
      safe: ['Buena opción para isquios sin máquina.'],
      reg: 'Glute bridge.', prog: 'Una pierna o talones en banco.',
      fig: { frames: [{ t: -90, l: [100, 40], r: [100, 40], la: [90, 90], ra: [90, 90] }, { t: -106, l: [88, 34], r: [88, 34], la: [90, 90], ra: [90, 90] }], guides: [{ k: 'arrow', j: 'hip' }] }
    },
    {
      id: 'slider_curl', n: 'Slider hamstring curl', es: 'Curl de isquios con deslizadores', tags: ['hams', 'glutes', 'core'], eq: 'Deslizadores / toalla', lvl: 3,
      start: 'Boca arriba, talones sobre deslizadores, cadera elevada y piernas casi rectas.',
      move: 'Jala los talones hacia la cadera manteniendo la cadera arriba y vuelve a extender lento.',
      mus: 'Isquiotibiales (excéntrico), glúteos',
      err: ['Dejar caer la cadera', 'Extender demasiado rápido'],
      safe: ['La fase de regreso es exigente: empieza con pocas reps.'],
      reg: 'Solo la fase excéntrica (extender lento).', prog: 'Una pierna.',
      fig: { frames: [{ t: -113, l: [77, 77], r: [77, 77], la: [90, 90], ra: [90, 90] }, { t: -122, l: [118, -20], r: [118, -20], la: [90, 90], ra: [90, 90] }], anchor: 'neck', props: [{ k: 'slider', at: 'lank' }], guides: [{ k: 'arrow', j: 'lank' }] }
    },

    /* ---------------- ADUCTORES / ABDUCTORES ---------------- */
    {
      id: 'hip_abductor', n: 'Hip abductor machine', es: 'Abductores en máquina', tags: ['abductors', 'glutes', 'stability'], eq: 'Máquina', lvl: 1,
      start: 'Sentado con la espalda apoyada, pads por fuera de las rodillas.',
      move: 'Abre las piernas, pausa y regresa en 3 s.',
      mus: 'Glúteo medio y menor, tensor de la fascia lata',
      err: ['Rebotar', 'Inclinarse adelante'],
      safe: ['El glúteo medio controla el valgo de rodilla.'],
      reg: 'Banded lateral walk.', prog: 'Más carga.',
      fig: { frames: [P(F, { th: 0.38, l: [8, 0], r: [8, 0], la: [20, 10], ra: [20, 10] }), P(F, { th: 0.38, l: [55, -10], r: [55, -10], la: [20, 10], ra: [20, 10] })], anchor: 'hip', fix: 46, props: [{ k: 'seat', back: false }], guides: [{ k: 'arrow', j: 'lknee' }] }
    },
    {
      id: 'hip_adductor', n: 'Hip adductor machine', es: 'Aductores en máquina', tags: ['adductors', 'stability'], eq: 'Máquina', lvl: 1,
      start: 'Sentado, pads por dentro de las rodillas, piernas abiertas.',
      move: 'Cierra las piernas, pausa y abre controlado.',
      mus: 'Aductores',
      err: ['Abrir más de lo cómodo', 'Soltar el peso'],
      safe: ['Rango progresivo.'],
      reg: 'Squeeze isométrico con balón.', prog: 'Copenhagen plank.',
      fig: { frames: [P(F, { th: 0.38, l: [55, -10], r: [55, -10], la: [20, 10], ra: [20, 10] }), P(F, { th: 0.38, l: [8, 0], r: [8, 0], la: [20, 10], ra: [20, 10] })], anchor: 'hip', fix: 46, props: [{ k: 'seat', back: false }], guides: [{ k: 'arrow', j: 'lknee' }] }
    },
    {
      id: 'band_lateral_walk', n: 'Banded lateral walk', es: 'Caminata lateral con banda', tags: ['abductors', 'glutes', 'stability', 'ski'], eq: 'Banda', unit: 'reps', lvl: 1,
      start: 'Banda arriba de las rodillas o en los tobillos, media sentadilla.',
      move: 'Pasos laterales cortos sin juntar los pies y sin que las rodillas se cierren.',
      mus: 'Glúteo medio',
      err: ['Rodillas que se juntan', 'Balancear el tronco'],
      safe: ['Pasos lentos y controlados.'],
      reg: 'Banda más suave.', prog: 'Banda en tobillos o más baja la postura.',
      fig: { frames: [P(F, { th: 0.85, l: [8, -4], r: [8, -4], la: [30, 20], ra: [30, 20] }), P(F, { th: 0.85, l: [24, -10], r: [4, -2], la: [30, 20], ra: [30, 20] })], anchor: 'rank', props: [{ k: 'band', a: 'lknee', b: 'rknee' }], guides: [{ k: 'arrow', j: 'lank' }] }
    },
    {
      id: 'monster_walk', n: 'Monster walks', es: 'Caminata en diagonal con banda', tags: ['abductors', 'glutes', 'stability'], eq: 'Banda', lvl: 1,
      start: 'Banda en tobillos, media sentadilla.',
      move: 'Pasos en diagonal hacia adelante, manteniendo tensión en la banda.',
      mus: 'Glúteo medio y mayor',
      err: ['Perder la tensión', 'Rodillas hacia adentro'],
      safe: ['Postura atlética estable.'],
      reg: 'Banda en rodillas.', prog: 'Banda más fuerte.',
      fig: { frames: [{ t: 18, l: [40, -18], r: [40, -18], la: [40, 20], ra: [40, 20] }, { t: 18, l: [62, -6], r: [24, -30], la: [40, 20], ra: [40, 20] }], anchor: 'rank', props: [{ k: 'band', a: 'lank', b: 'rank' }], guides: [{ k: 'arrow', j: 'lank' }] }
    },
    {
      id: 'band_abduction', n: 'Standing band abduction', es: 'Abducción de pie con banda', tags: ['abductors', 'glutes', 'balance'], eq: 'Banda', uni: true, lvl: 1,
      start: 'De pie, banda en tobillos, mano en la pared.',
      move: 'Lleva una pierna al lado sin inclinar el tronco y regresa lento. La pierna de apoyo también trabaja.',
      mus: 'Glúteo medio (ambos lados)',
      err: ['Inclinarse hacia el lado contrario', 'Rotar el pie hacia afuera'],
      safe: ['Movimiento corto y controlado.'],
      reg: 'Sin banda.', prog: 'Banda más fuerte o sin apoyo.',
      fig: { frames: [P(F, { l: [2, 0], r: [2, 0], la: [10, 0], ra: [80, 10] }), P(F, { l: [30, 0], r: [2, 0], la: [10, 0], ra: [80, 10] })], anchor: 'rank', props: [{ k: 'band', a: 'lank', b: 'rank' }], guides: [{ k: 'arrow', j: 'lank' }] }
    },
    {
      id: 'side_lying_raise', n: 'Side-lying leg raise', es: 'Elevación lateral acostado', tags: ['abductors', 'glutes'], eq: 'Peso corporal', uni: true, lvl: 1,
      start: 'Acostado de lado, cuerpo en línea, pierna de abajo ligeramente flexionada.',
      move: 'Eleva la pierna de arriba con el talón un poco atrás y baja lento.',
      mus: 'Glúteo medio',
      err: ['Llevar la pierna hacia adelante', 'Rodar la cadera hacia atrás'],
      safe: ['Simple y efectivo para glúteo medio.'],
      reg: 'Rango corto.', prog: 'Tobillera o banda.',
      fig: { frames: [P(FR, { t: -90, l: [90, 90], r: [92, 92], la: [80, 40], ra: [-90, -100] }), P(FR, { t: -90, l: [124, 124], r: [92, 92], la: [80, 40], ra: [-90, -100] })], anchor: 'hip', guides: [{ k: 'arrow', j: 'lank' }] }
    },
    {
      id: 'copenhagen', n: 'Copenhagen plank', es: 'Plancha Copenhague', tags: ['adductors', 'core', 'stability', 'ski'], eq: 'Banco', uni: true, unit: 'time', lvl: 3, sp: true,
      start: 'Plancha lateral sobre el antebrazo, con la pierna de arriba apoyada en un banco (rodilla en versión corta, tobillo en versión larga).',
      move: 'Eleva la cadera hasta alinear el cuerpo y, si puedes, sube la pierna de abajo hacia el banco. Mantén la posición.',
      mus: 'Aductores (mucho), oblicuos, glúteo medio',
      err: ['Cadera que se cae', 'Hombro fuera de la línea del codo'],
      safe: ['Empieza con palanca corta (rodilla en el banco). La palanca larga carga mucho la rodilla de arriba: consúltalo con tu fisio.'],
      reg: 'Palanca corta (rodilla apoyada) o plancha lateral normal.', prog: 'Palanca larga, más tiempo o elevar la pierna de abajo.',
      why: 'Es de los ejercicios con mejor evidencia para fortalecer aductores, que estabilizan la rodilla y la cadera en el plano frontal. En esquí los aductores trabajan todo el tiempo para controlar los esquís y mantener las rodillas estables en las curvas.',
      fig: { frames: [P(FR, { t: -116, l: [96, 96], r: [70, 70], ra: [0, -70], la: [130, 60] }), P(FR, { t: -100, l: [100, 100], r: [100, 100], ra: [0, -70], la: [130, 60] })], anchor: 'rel', props: [{ k: 'bench', at: 'lank', f: 1, dy: 4, w: 28 }], guides: [{ k: 'arrow', j: 'hip' }] }
    },

    /* ---------------- PANTORRILLA / TOBILLO ---------------- */
    {
      id: 'standing_calf', n: 'Standing calf raise', es: 'Elevación de talones de pie', tags: ['calves'], eq: 'Máquina / mancuernas', lvl: 1,
      start: 'De pie, puntas sobre un escalón o en la máquina.',
      move: 'Sube los talones lo más alto posible, pausa 1 s, baja en 3 s.',
      mus: 'Gastrocnemio, sóleo',
      err: ['Rebotar abajo', 'Rango corto'],
      safe: ['Pantorrillas fuertes ayudan a absorber carga en las piernas.'],
      reg: 'En el piso.', prog: 'Single-leg calf raise.',
      fig: { frames: [P(ST, { la: [10, 0], ra: [10, 0] }), P(ST, { lf: -48, rf: -48, la: [10, 0], ra: [10, 0] })], anchor: 'ltoe', guides: [{ k: 'arrow', j: 'lank' }] }
    },
    {
      id: 'seated_calf', n: 'Seated calf raise', es: 'Elevación de talones sentado', tags: ['calves'], eq: 'Máquina', lvl: 1,
      start: 'Sentado, pad sobre los muslos, puntas en la plataforma.',
      move: 'Sube talones, pausa, baja lento.',
      mus: 'Sóleo',
      err: ['Rebotar'],
      safe: ['El sóleo es clave para la postura flexionada del esquí.'],
      reg: 'Menos carga.', prog: 'Más carga o pausas.',
      fig: { frames: [P(SEAT, { lf: 8, rf: 8 }), P(SEAT, { l: [82, 0], r: [82, 0], lf: -40, rf: -40 })], anchor: 'ltoe', props: [{ k: 'roll', at: 'lknee', dy: -6 }], guides: [{ k: 'arrow', j: 'lknee' }] }
    },
    {
      id: 'sl_calf', n: 'Single-leg calf raise', es: 'Elevación de talón a una pierna', tags: ['calves', 'balance'], eq: 'Peso corporal', uni: true, lvl: 1,
      start: 'De pie sobre una pierna, mano en la pared.',
      move: 'Sube el talón al máximo, pausa, baja en 3 s.',
      mus: 'Gastrocnemio, sóleo',
      err: ['Rango incompleto', 'Inclinarse'],
      safe: ['Compara reps izquierda vs derecha.'],
      reg: 'Dos piernas.', prog: 'Con mancuerna.',
      fig: { frames: [P(ST, { r: [10, -60], la: [70, 20] }), P(ST, { r: [10, -60], lf: -48, la: [70, 20] })], anchor: 'ltoe', guides: [{ k: 'arrow', j: 'lank' }] }
    },
    {
      id: 'tib_raise', n: 'Tibialis raises', es: 'Elevación de puntas (tibial anterior)', tags: ['calves', 'ski', 'acl'], eq: 'Pared', lvl: 1, sp: true,
      start: 'Espalda apoyada en la pared, talones a ~30 cm de ella, piernas rectas.',
      move: 'Levanta las puntas de los pies lo más alto posible, pausa y baja lento.',
      mus: 'Tibial anterior',
      err: ['Flexionar las rodillas', 'Hacerlo rápido'],
      safe: ['Muy seguro. Puede generar ardor intenso, es normal.'],
      reg: 'Pies más cerca de la pared.', prog: 'Pies más lejos o tibia bar / banda.',
      why: 'El tibial anterior controla el tobillo y la espinilla hacia adelante. En la bota de esquí empujas la lengüeta con la espinilla y absorbes irregularidades. Un tibial fuerte mejora el control y la tolerancia a la postura flexionada.',
      fig: { frames: [{ t: -12, l: [12, 12], r: [12, 12], la: [-10, -10], ra: [-10, -10] }, { t: -12, l: [12, 12], r: [12, 12], lf: 34, rf: 34, la: [-10, -10], ra: [-10, -10] }], anchor: 'lank', props: [{ k: 'wall', at: 'neck', dx: -4 }], guides: [{ k: 'arrow', j: 'ltoe' }] }
    },
    {
      id: 'ankle_inversion', n: 'Band ankle inversion', es: 'Inversión de tobillo con banda', tags: ['calves', 'stability'], eq: 'Banda', uni: true, lvl: 1,
      start: 'Sentado con la pierna extendida, banda alrededor del antepié anclada hacia afuera.',
      move: 'Gira la planta del pie hacia adentro contra la banda y regresa lento. Solo se mueve el tobillo.',
      mus: 'Tibial posterior',
      err: ['Rotar toda la pierna'],
      safe: ['Movimiento pequeño y controlado.'],
      reg: 'Banda suave.', prog: 'Banda más fuerte.',
      fig: { custom: 'ankle', opt: { dir: 'in' } }
    },
    {
      id: 'ankle_eversion', n: 'Band ankle eversion', es: 'Eversión de tobillo con banda', tags: ['calves', 'stability'], eq: 'Banda', uni: true, lvl: 1,
      start: 'Sentado, banda en el antepié anclada hacia adentro.',
      move: 'Gira la planta hacia afuera contra la banda y regresa lento.',
      mus: 'Peroneos',
      err: ['Rotar la cadera'],
      safe: ['Los peroneos protegen ante torceduras de tobillo.'],
      reg: 'Banda suave.', prog: 'Banda más fuerte.',
      fig: { custom: 'ankle', opt: { dir: 'out' } }
    },

    /* ---------------- EQUILIBRIO / PROPIOCEPCIÓN ---------------- */
    {
      id: 'sl_balance', n: 'Single-leg balance', es: 'Equilibrio a una pierna', tags: ['balance', 'stability', 'acl', 'ski'], eq: 'Peso corporal', uni: true, unit: 'time', lvl: 1,
      start: 'De pie sobre una pierna, rodilla suave, mirada al frente.',
      move: 'Mantén la posición el tiempo indicado. Progresa con ojos cerrados o movimientos de brazos.',
      mus: 'Estabilizadores de tobillo, rodilla y cadera',
      err: ['Bloquear la rodilla', 'Cadera que se cae'],
      safe: ['Cerca de una pared o poste.'],
      reg: 'Punta del pie libre tocando el piso.', prog: 'Ojos cerrados o superficie inestable (si te lo indican).',
      fig: { frames: [P(ST, { r: [40, -40], la: [20, 0], ra: [20, 0] }), P(ST, { l: [6, -4], r: [50, -50], la: [40, 10], ra: [30, 0] })], guides: [{ k: 'v', j: 'lank', live: true, top: -110 }] }
    },
    {
      id: 'sl_balance_reach', n: 'Single-leg balance + reach', es: 'Equilibrio con alcance', tags: ['balance', 'stability', 'acl', 'ski'], eq: 'Peso corporal', uni: true, lvl: 2,
      start: 'Sobre una pierna, rodilla ligeramente flexionada.',
      move: 'Alcanza con la mano hacia adelante y abajo (o hacia un cono) controlando la rodilla, y regresa.',
      mus: 'Glúteos, cuádriceps, estabilizadores',
      err: ['Rodilla hacia adentro', 'Perder la postura al regresar'],
      safe: ['Alcances cortos al principio.'],
      reg: 'Alcance corto.', prog: 'Alcances más lejanos o en varias direcciones.',
      fig: { frames: [P(ST, { r: [10, -20], la: [10, 0], ra: [10, 0] }), { t: 50, l: [42, -26], r: [-40, -40], la: [80, 80], ra: [10, 10] }], guides: [{ k: 'arrow', j: 'lhand' }] }
    },
    {
      id: 'star_excursion', n: 'Star excursion', es: 'Alcances en estrella', tags: ['balance', 'stability', 'acl', 'ski'], eq: 'Cinta en el piso', uni: true, lvl: 2, sp: true,
      start: 'De pie sobre la pierna izquierda en el centro de una estrella de 8 líneas.',
      move: 'Con la otra pierna, toca lo más lejos posible cada línea con la punta del pie, sin apoyarte, y regresa al centro. Rodilla de apoyo alineada.',
      mus: 'Cuádriceps, glúteos, estabilizadores de tobillo, propiocepción',
      err: ['Apoyar peso en el pie que alcanza', 'Valgo de rodilla', 'Levantar el talón de apoyo'],
      safe: ['Empieza con alcances cortos; la calidad importa más que la distancia.'],
      reg: 'Solo 3 direcciones (Y-balance) o alcances cortos.', prog: 'Más distancia o tempo lento.',
      why: 'Obliga a la rodilla operada a controlar el cuerpo en muchas direcciones con flexión. Mejora propiocepción y control neuromuscular, que suelen quedar disminuidos tras una reconstrucción y son esenciales en terreno irregular.',
      fig: { custom: 'star' }
    },
    {
      id: 'y_balance', n: 'Y-balance', es: 'Alcances en Y', tags: ['balance', 'stability', 'acl', 'ski'], eq: 'Cinta en el piso', uni: true, unit: 'cm', lvl: 2, sp: true,
      start: 'Sobre una pierna en el centro de una Y: anterior, posteromedial y posterolateral.',
      move: 'Alcanza con el pie libre lo más lejos posible en cada dirección, toca ligero y regresa. Registra la distancia anterior en cm.',
      mus: 'Control de rodilla, cadera y tobillo',
      err: ['Apoyar el pie que alcanza', 'Despegar el talón de apoyo'],
      safe: ['También sirve como prueba: compara izquierda vs derecha.'],
      reg: 'Solo dirección anterior.', prog: 'Más distancia manteniendo la calidad.',
      why: 'Es una prueba muy usada en rehabilitación de rodilla para comparar el control de ambas piernas. Entrenarla y medirla te da un dato objetivo de simetría para mostrarle a tu fisio.',
      fig: { custom: 'ybal' }
    },
    {
      id: 'unstable_balance', n: 'Balance en superficie inestable', es: 'Equilibrio sobre cojín o pad', tags: ['balance', 'stability', 'ski'], eq: 'Pad / cojín', uni: true, unit: 'time', lvl: 2,
      start: 'Sobre un pad de espuma con una pierna.',
      move: 'Mantén el equilibrio con la rodilla ligeramente flexionada. Progresa con alcances o pases de balón.',
      mus: 'Propiocepción de tobillo y rodilla',
      err: ['Rodilla rígida', 'Mirar al piso todo el tiempo'],
      safe: ['Solo cuando el equilibrio en piso firme sea sólido y tu fisio lo apruebe.'],
      reg: 'Piso firme.', prog: 'Ojos cerrados o perturbaciones.',
      fig: { frames: [P(ST, { l: [10, -8], r: [40, -40], la: [30, 0], ra: [20, 0] }), P(ST, { l: [16, -12], r: [50, -55], la: [50, 10], ra: [40, 0] })], props: [{ k: 'box', at: 'lank', dy: 2, w: 26 }], lift: 5 }
    },

    /* ---------------- KETTLEBELLS ---------------- */
    {
      id: 'kb_deadlift', n: 'KB deadlift', es: 'Peso muerto con kettlebell', tags: ['hams', 'glutes', 'kettlebell', 'back'], eq: 'Kettlebell', lvl: 1,
      start: 'KB en el piso entre los pies. Bisagra de cadera, espalda neutra, manos en el asa.',
      move: 'Empuja el piso y extiende cadera y rodillas a la vez. Baja con la misma bisagra.',
      mus: 'Glúteos, isquiotibiales, cuádriceps, espalda',
      err: ['Espalda redonda', 'Jalar con los brazos'],
      safe: ['Base de todos los patrones de KB.'],
      reg: 'KB sobre un escalón.', prog: 'Más peso o KB RDL.',
      fig: { frames: [{ t: 58, l: [55, -22], r: [55, -22], la: [0, 0], ra: [0, 0] }, P(ST, HANG)], props: [{ k: 'kb', h: 'c' }], guides: [{ k: 'arrow', j: 'hip' }] }
    },
    {
      id: 'kb_suitcase', n: 'KB suitcase carry', es: 'Carga tipo maleta', tags: ['core', 'stability', 'kettlebell', 'ski', 'abductors'], eq: 'Kettlebell', unit: 'dist', lvl: 1, sp: true,
      start: 'De pie con una KB en una sola mano a un lado del cuerpo.',
      move: 'Camina erguido sin inclinarte hacia la KB, pasos normales. Cambia de mano a la mitad.',
      mus: 'Oblicuos, cuadrado lumbar, glúteo medio, agarre',
      err: ['Inclinarse hacia la KB', 'Hombro que se cae', 'Pasos rígidos'],
      safe: ['Peso moderado, postura impecable.'],
      reg: 'Menos peso o distancia corta.', prog: 'Más peso o caminar más lento.',
      why: 'El peso de un solo lado obliga al tronco y al glúteo medio a evitar la inclinación lateral. Así trabajas estabilidad de cadera y core en una pierna en cada paso. Es transferible al control del tronco sobre los esquís y es de bajo impacto.',
      fig: { frames: [P(F, { l: [3, 0], r: [3, 0], la: [8, 0], ra: [3, 0] }), P(F, { l: [6, 0], r: [1, 0], la: [8, 0], ra: [3, 0] })], anchor: 'hip', props: [{ k: 'kb', h: 'r' }], guides: [{ k: 'v', j: 'head', f: 0, top: -90 }] }
    },
    {
      id: 'kb_farmer', n: 'KB farmer carry', es: 'Caminata del granjero', tags: ['core', 'back', 'kettlebell', 'stability'], eq: 'Kettlebells', unit: 'dist', lvl: 1,
      start: 'Una KB en cada mano, hombros abajo y atrás.',
      move: 'Camina con pasos controlados y tronco firme.',
      mus: 'Agarre, trapecio, core, glúteos',
      err: ['Hombros encogidos', 'Pasos largos y rápidos'],
      safe: ['Bajo impacto y muy completo.'],
      reg: 'Menos peso.', prog: 'Más peso o distancia.',
      fig: { frames: [P(ST, { l: [18, -2], r: [-16, -14], la: [0, 0], ra: [0, 0] }), P(ST, { l: [-16, -14], r: [18, -2], la: [0, 0], ra: [0, 0] })], anchor: 'hip', fix: 84, props: [{ k: 'kb', h: 'both' }] }
    },
    {
      id: 'kb_front_rack', n: 'KB front rack carry', es: 'Caminata con KB en rack', tags: ['core', 'kettlebell', 'stability', 'shoulders'], eq: 'Kettlebell', unit: 'dist', lvl: 2,
      start: 'KB en posición de rack (apoyada en antebrazo y pecho), codo abajo.',
      move: 'Camina erguido sin arquear la espalda.',
      mus: 'Core anterior, hombro, espalda alta',
      err: ['Arquear la zona lumbar', 'Codo abierto'],
      safe: ['Empieza con una sola KB.'],
      reg: 'Goblet carry.', prog: 'Doble rack.',
      fig: { frames: [P(ST, { l: [18, -2], r: [-16, -14], la: [24, 165], ra: [24, 165] }), P(ST, { l: [-16, -14], r: [18, -2], la: [24, 165], ra: [24, 165] })], anchor: 'hip', fix: 84, props: [{ k: 'kb', h: 'l' }] }
    },
    {
      id: 'kb_atw', n: 'KB around the world', es: 'KB alrededor de la cintura', tags: ['core', 'kettlebell', 'stability'], eq: 'Kettlebell', lvl: 1,
      start: 'De pie, KB frente a la cadera con ambas manos.',
      move: 'Pasa la KB de una mano a otra rodeando la cintura sin mover la cadera. Cambia de sentido.',
      mus: 'Core (anti-rotación), hombros, agarre',
      err: ['Girar la cadera', 'Arquear la espalda'],
      safe: ['KB ligera.'],
      reg: 'Más lento.', prog: 'KB más pesada.',
      fig: { frames: [P(F, { lhT: [0, 10], rhT: [0, 10], kbh: 'l' }), P(F, { lhT: [22, -2], rhT: [-14, 0], kbh: 'l' }), P(F, { lhT: [8, -6], rhT: [-8, -6], kbh: 'r' }), P(F, { lhT: [14, 0], rhT: [-22, -2], kbh: 'r' })], anchor: 'hip', fix: 84, props: [{ k: 'kb', h: 'frame' }] }
    },
    {
      id: 'kb_halo', n: 'KB halo', es: 'Halo con kettlebell', tags: ['shoulders', 'core', 'kettlebell'], eq: 'Kettlebell', lvl: 1,
      start: 'KB invertida sujeta por los cuernos frente al pecho.',
      move: 'Rodea la cabeza con la KB cerca del cuello, sin arquear la espalda. Alterna sentidos.',
      mus: 'Hombros, core, movilidad torácica',
      err: ['Arquear la zona lumbar', 'Mover la cadera'],
      safe: ['KB ligera, movimiento suave.'],
      reg: 'Medio arrodillado.', prog: 'Más peso.',
      fig: { frames: [P(F, { lhT: [0, -50], rhT: [0, -50] }), P(F, { lhT: [-16, -70], rhT: [-16, -70] }), P(F, { lhT: [0, -84], rhT: [0, -84] }), P(F, { lhT: [16, -70], rhT: [16, -70] })], anchor: 'hip', fix: 84, props: [{ k: 'kb', h: 'c' }] }
    },
    {
      id: 'kb_floor_press', n: 'KB floor press', es: 'Press de piso con kettlebells', tags: ['chest', 'triceps', 'kettlebell'], eq: 'Kettlebells', lvl: 1,
      start: 'Boca arriba, rodillas flexionadas, KB en cada mano con codos apoyados en el piso.',
      move: 'Empuja las KB hacia arriba hasta extender los brazos y baja hasta que los codos toquen el piso.',
      mus: 'Pectoral, tríceps, deltoides anterior',
      err: ['Golpear el codo en el piso', 'Muñeca doblada'],
      safe: ['El piso limita el rango: amable con los hombros.'],
      reg: 'Una KB con dos manos.', prog: 'Single-arm.',
      fig: { frames: [{ t: -90, l: [140, -20], r: [140, -20], la: [0, 180], ra: [0, 180], us: 0.3 }, { t: -90, l: [140, -20], r: [140, -20], la: [180, 180], ra: [180, 180] }], anchor: 'hip', props: [{ k: 'kb', h: 'l' }], guides: [{ k: 'arrow', j: 'lhand' }] }
    },
    {
      id: 'sa_kb_floor_press', n: 'Single-arm KB floor press', es: 'Press de piso a un brazo', tags: ['chest', 'core', 'kettlebell'], eq: 'Kettlebell', uni: true, lvl: 2,
      start: 'Como el floor press, con una sola KB.',
      move: 'Empuja con un brazo sin que el cuerpo gire hacia el lado de la KB.',
      mus: 'Pectoral, tríceps, core anti-rotación',
      err: ['Rotar el tronco'],
      safe: ['Controla la bajada.'],
      reg: 'Bilateral.', prog: 'Más peso.',
      fig: { frames: [{ t: -90, l: [140, -20], r: [140, -20], la: [0, 180], ra: [100, 100], us: 0.3 }, { t: -90, l: [140, -20], r: [140, -20], la: [180, 180], ra: [100, 100] }], anchor: 'hip', props: [{ k: 'kb', h: 'l' }], guides: [{ k: 'arrow', j: 'lhand' }] }
    },
    {
      id: 'kb_chest_pass', n: 'KB chest-level crossover', es: 'Pase cruzado de KB al pecho', tags: ['core', 'chest', 'kettlebell'], eq: 'Kettlebell', lvl: 1,
      start: 'De pie, KB sujeta por los cuernos frente al pecho, brazos semiflexionados.',
      move: 'Lleva la KB en arco horizontal de un lado al otro a la altura del pecho sin girar la cadera.',
      mus: 'Core anti-rotación, pectoral, hombros',
      err: ['Girar la cadera y las rodillas', 'Arquear la espalda'],
      safe: ['KB ligera, rodillas quietas.'],
      reg: 'Rango más corto.', prog: 'KB más pesada o brazos más extendidos.',
      fig: { frames: [P(F, { lhT: [-10, -36], rhT: [-26, -36] }), P(F, { lhT: [26, -36], rhT: [10, -36] })], anchor: 'hip', fix: 84, props: [{ k: 'kb', h: 'c' }], guides: [{ k: 'arrow', j: 'chand' }] }
    },
    {
      id: 'kb_row', n: 'One-arm KB row', es: 'Remo a un brazo con KB', tags: ['back', 'biceps', 'kettlebell'], eq: 'Kettlebell + banco', uni: true, lvl: 1,
      start: 'Bisagra de cadera con una mano apoyada en un banco, KB colgando en la otra mano.',
      move: 'Jala la KB hacia la cadera llevando el codo atrás. Baja controlado.',
      mus: 'Dorsal ancho, romboides, bíceps',
      err: ['Girar el tronco', 'Jalar con el hombro encogido'],
      safe: ['Espalda neutra.'],
      reg: 'Menos peso.', prog: 'Más peso o pausa arriba.',
      fig: { frames: [{ t: 72, l: [22, -10], r: [0, -6], la: [12, 0], ra: [0, 0] }, { t: 72, l: [22, -10], r: [0, -6], la: [12, 0], ra: [-52, 18] }], props: [{ k: 'bench', at: 'lhand', dy: 1, w: 30 }, { k: 'kb', h: 'r' }], guides: [{ k: 'arrow', j: 'rhand' }] }
    },
    {
      id: 'hk_kb_press', n: 'Half-kneeling KB press', es: 'Press de KB medio arrodillado', tags: ['shoulders', 'core', 'kettlebell', 'stability'], eq: 'Kettlebell', uni: true, lvl: 2,
      start: 'Medio arrodillado, rodilla de abajo del mismo lado que la KB. KB en rack.',
      move: 'Presiona la KB por encima de la cabeza sin arquear la espalda y baja controlado al rack.',
      mus: 'Deltoides, tríceps, core, glúteo de la pierna de abajo',
      err: ['Arquear la zona lumbar', 'Inclinarse al lado contrario'],
      safe: ['Aprieta el glúteo de la pierna arrodillada.'],
      reg: 'De pie.', prog: 'Más peso.',
      fig: { frames: [{ t: 0, l: [88, 0], r: [0, -88], la: [6, 0], ra: [16, 168] }, { t: 0, l: [88, 0], r: [0, -88], la: [6, 0], ra: [178, 178] }], anchor: 'rknee', props: [{ k: 'kb', h: 'r' }], guides: [{ k: 'arrow', j: 'rhand' }] }
    },
    {
      id: 'kb_clean', n: 'KB clean', es: 'Cargada con kettlebell', tags: ['kettlebell', 'glutes', 'hams', 'shoulders'], eq: 'Kettlebell', uni: true, lvl: 3, auth: 'explosive',
      start: 'KB entre los pies, bisagra de cadera.',
      move: 'Extensión explosiva de cadera llevando la KB al rack sin que golpee el antebrazo.',
      mus: 'Glúteos, isquiotibiales, espalda, hombro',
      err: ['Jalar con el brazo', 'La KB golpea el antebrazo'],
      safe: ['Movimiento explosivo: solo con autorización y técnica supervisada.'],
      reg: 'KB deadlift + rack sin impulso.', prog: 'Clean & press.',
      fig: { frames: [{ t: 60, l: [45, -18], r: [45, -18], la: [-10, -10], ra: [-10, -10] }, P(ST, { la: [6, 0], ra: [24, 165] })], props: [{ k: 'kb', h: 'r' }], guides: [{ k: 'arrow', j: 'rhand' }] }
    },
    {
      id: 'kb_clean_press', n: 'KB clean & press', es: 'Cargada y press con KB', tags: ['kettlebell', 'shoulders', 'glutes', 'core'], eq: 'Kettlebell', uni: true, lvl: 3, auth: 'explosive',
      start: 'KB entre los pies, bisagra de cadera.',
      move: 'Clean al rack, pausa y press por encima de la cabeza. Regresa al rack y luego entre las piernas.',
      mus: 'Cadena posterior, hombro, core',
      err: ['Arquear la espalda en el press'],
      safe: ['Solo con autorización. Domina primero el press y el clean por separado.'],
      reg: 'Half-kneeling KB press.', prog: 'Más peso.',
      fig: { frames: [{ t: 60, l: [45, -18], r: [45, -18], la: [-10, -10], ra: [-10, -10] }, P(ST, { la: [6, 0], ra: [24, 165] }), P(ST, { la: [6, 0], ra: [178, 178] })], props: [{ k: 'kb', h: 'r' }] }
    },
    {
      id: 'kb_swing', n: 'KB swing', es: 'Swing con kettlebell', tags: ['kettlebell', 'glutes', 'hams', 'core'], eq: 'Kettlebell', lvl: 3, auth: 'explosive',
      start: 'KB un paso adelante, bisagra de cadera, manos en el asa.',
      move: 'Lleva la KB atrás entre las piernas y proyéctala al frente con una extensión explosiva de cadera hasta la altura del pecho.',
      mus: 'Glúteos, isquiotibiales, core',
      err: ['Sentadilla en vez de bisagra', 'Levantar con los brazos', 'Hiperextender la espalda arriba'],
      safe: ['Movimiento balístico: SOLO con autorización de tu traumatólogo/fisioterapeuta.'],
      reg: 'KB deadlift o hip thrust.', prog: 'Más peso o swing a una mano.',
      fig: { frames: [{ t: 72, l: [22, -12], r: [22, -12], la: [-28, -30], ra: [-28, -30] }, P(ST, { la: [88, 90], ra: [88, 90] })], props: [{ k: 'kb', h: 'c' }], guides: [{ k: 'arrow', j: 'chand' }] }
    },
    {
      id: 'tgu', n: 'Turkish get-up', es: 'Levantada turca', tags: ['core', 'shoulders', 'kettlebell', 'stability', 'ski'], eq: 'Kettlebell', uni: true, lvl: 3, sp: true,
      start: 'Boca arriba con la KB arriba en la mano derecha (brazo vertical), rodilla derecha flexionada, pierna izquierda extendida y brazo izquierdo en el piso a 45°.',
      move: 'Sube por pasos sin dejar de mirar la KB: al codo → a la mano → puente alto → barre la pierna izquierda bajo el cuerpo → medio arrodillado → de pie. Regresa por los mismos pasos.',
      mus: 'Todo el cuerpo: hombro, core, glúteos, cuádriceps',
      err: ['Brazo de la KB que se dobla', 'Pasos apresurados', 'Rodilla que colapsa al pasar a medio arrodillado'],
      safe: ['Aprende cada paso sin peso (o con un zapato en el puño). Cada paso debe ser cómodo para la rodilla izquierda.'],
      reg: 'Solo hasta el codo o la mano (partial get-up).', prog: 'Get-up completo y luego más peso.',
      why: 'Enseña a moverte con control entre el piso y estar de pie con carga y estabilidad de hombro y tronco. Pasa por posiciones de rodilla (medio arrodillado, puente) que exigen control. Desarrolla la coordinación total del cuerpo que necesitas para levantarte en la nieve tras una caída.',
      fig: {
        anchor: 'rank', speed: 900,
        labels: ['Boca arriba', 'Al codo', 'A la mano', 'Puente alto', 'Barrido', 'Medio arrodillado', 'De pie'],
        frames: [
          { t: -90, l: [90, 90], r: [140, -20], la: [96, 96], ra: [180, 180] },
          { t: -58, l: [90, 90], r: [140, -20], la: [-12, 90], ra: [180, 180] },
          { t: -36, l: [90, 90], r: [140, -20], la: [-36, -36], ra: [180, 180] },
          { t: -68, l: [72, 72], r: [110, -10], la: [-34, -34], ra: [180, 180] },
          { t: -25, l: [0, -90], r: [82, 0], la: [-20, -10], ra: [180, 180] },
          { t: 0, l: [0, -90], r: [86, 0], la: [8, 0], ra: [180, 180] },
          { t: 0, l: [0, 0], r: [0, 0], la: [8, 0], ra: [180, 180] }
        ],
        props: [{ k: 'kb', h: 'r' }]
      }
    },

    /* ---------------- PECHO ---------------- */
    {
      id: 'chest_press', n: 'Chest press', es: 'Press de pecho en máquina', tags: ['chest', 'triceps', 'shoulders'], eq: 'Máquina', lvl: 1,
      start: 'Sentado, manijas a la altura media del pecho, espalda apoyada.',
      move: 'Empuja hasta casi extender los codos y regresa en 2–3 s.',
      mus: 'Pectoral, tríceps, deltoides anterior',
      err: ['Hombros que suben', 'Despegar la espalda'],
      safe: ['Ideal para cargar torso sin exigir equilibrio.'],
      reg: 'Menos carga.', prog: 'DB bench press.',
      fig: { frames: [P(SEAT, { la: [-70, 90], ra: [-70, 90] }), P(SEAT, { la: [86, 88], ra: [86, 88] })], anchor: 'hip', fix: 46, props: [seat], guides: [{ k: 'arrow', j: 'lhand' }] }
    },
    {
      id: 'incline_chest_press', n: 'Incline chest press', es: 'Press inclinado en máquina', tags: ['chest', 'shoulders', 'triceps'], eq: 'Máquina', lvl: 1,
      start: 'Sentado en máquina inclinada, manijas a la altura del pecho alto.',
      move: 'Empuja arriba y al frente, regresa controlado.',
      mus: 'Pectoral superior, deltoides anterior, tríceps',
      err: ['Arquear la espalda'],
      safe: ['Rango cómodo para el hombro.'],
      reg: 'Menos carga.', prog: 'Incline DB press.',
      fig: { frames: [{ t: -28, l: [90, 0], r: [90, 0], la: [-60, 120], ra: [-60, 120] }, { t: -28, l: [90, 0], r: [90, 0], la: [125, 125], ra: [125, 125] }], anchor: 'hip', fix: 46, props: [seat], guides: [{ k: 'arrow', j: 'lhand' }] }
    },
    {
      id: 'db_bench', n: 'Dumbbell bench press', es: 'Press de banca con mancuernas', tags: ['chest', 'triceps', 'shoulders'], eq: 'Mancuernas + banco', lvl: 2,
      start: 'Acostado en banco plano, pies firmes, mancuernas a los lados del pecho.',
      move: 'Empuja hacia arriba juntando ligeramente las mancuernas y baja en 3 s.',
      mus: 'Pectoral, tríceps, deltoides anterior',
      err: ['Codos muy abiertos (90°)', 'Rebotar abajo'],
      safe: ['Codos a ~45° del torso.'],
      reg: 'Chest press.', prog: 'Más peso.',
      fig: { frames: [{ t: -90, l: [86, -26], r: [86, -26], la: [0, 180], ra: [0, 180], us: 0.6 }, { t: -90, l: [86, -26], r: [86, -26], la: [180, 180], ra: [180, 180] }], anchor: 'hip', fix: 44, props: [{ k: 'bench', at: 'hip', dy: 3, w: 66, dx: -22 }, { k: 'db', h: 'l' }], guides: [{ k: 'arrow', j: 'lhand' }] }
    },
    {
      id: 'incline_db', n: 'Incline dumbbell press', es: 'Press inclinado con mancuernas', tags: ['chest', 'shoulders', 'triceps'], eq: 'Mancuernas + banco', lvl: 2,
      start: 'Banco a 30–45°, mancuernas a la altura del pecho alto.',
      move: 'Empuja arriba y baja en 3 s.',
      mus: 'Pectoral superior, deltoides anterior, tríceps',
      err: ['Banco demasiado vertical', 'Perder el control abajo'],
      safe: ['Pies firmes en el piso.'],
      reg: 'Incline chest press.', prog: 'Más peso.',
      fig: { frames: [{ t: -48, l: [90, 0], r: [90, 0], la: [-10, 170], ra: [-10, 170], us: 0.7 }, { t: -48, l: [90, 0], r: [90, 0], la: [140, 140], ra: [140, 140] }], anchor: 'hip', fix: 46, props: [seat, { k: 'db', h: 'l' }], guides: [{ k: 'arrow', j: 'lhand' }] }
    },
    {
      id: 'push_up', n: 'Push-ups', es: 'Lagartijas', tags: ['chest', 'triceps', 'core'], eq: 'Peso corporal', lvl: 2,
      start: 'Manos un poco más abiertas que los hombros, cuerpo en línea recta.',
      move: 'Baja el pecho cerca del piso con codos a ~45° y empuja.',
      mus: 'Pectoral, tríceps, core',
      err: ['Cadera caída', 'Cabeza adelantada'],
      safe: ['Sin carga para la rodilla.'],
      reg: 'Incline push-ups.', prog: 'Pausa abajo o pies elevados.',
      fig: { frames: [{ t: 67, l: [-67, -67], r: [-67, -67], la: [0, 0], ra: [0, 0] }, { t: 76, l: [-76, -76], r: [-76, -76], la: [-70, 20], ra: [-70, 20] }], anchor: 'ltoe', guides: [{ k: 'arrow', j: 'neck' }] }
    },
    {
      id: 'incline_push_up', n: 'Incline push-ups', es: 'Lagartijas inclinadas', tags: ['chest', 'triceps', 'core'], eq: 'Banco', lvl: 1,
      start: 'Manos en un banco o barra, cuerpo en línea.',
      move: 'Baja el pecho al banco y empuja.',
      mus: 'Pectoral, tríceps',
      err: ['Cadera caída'],
      safe: ['Más alto = más fácil.'],
      reg: 'Superficie más alta.', prog: 'Push-ups en el piso.',
      fig: { frames: [{ t: 46, l: [-46, -46], r: [-46, -46], la: [0, 0], ra: [0, 0] }, { t: 58, l: [-58, -58], r: [-58, -58], la: [-60, 20], ra: [-60, 20] }], anchor: 'ltoe', props: [{ k: 'bench', at: 'lhand', dy: 1, w: 30 }], guides: [{ k: 'arrow', j: 'neck' }] }
    },

    /* ---------------- ESPALDA ---------------- */
    {
      id: 'lat_pulldown', n: 'Lat pulldown', es: 'Jalón al pecho', tags: ['back', 'biceps'], eq: 'Cable', lvl: 1,
      start: 'Sentado con los muslos bajo el pad, agarre algo más abierto que los hombros.',
      move: 'Jala la barra al pecho alto llevando los codos abajo, regresa lento.',
      mus: 'Dorsal ancho, bíceps, romboides',
      err: ['Balancear el tronco', 'Jalar detrás de la nuca'],
      safe: ['Pecho arriba, hombros abajo.'],
      reg: 'Menos carga.', prog: 'Más carga o pausa abajo.',
      fig: { frames: [P(SEAT, { t: -12, la: [176, 176], ra: [176, 176] }), P(SEAT, { t: -14, la: [14, 165], ra: [14, 165] })], anchor: 'hip', fix: 46, props: [{ k: 'seat', back: false }, { k: 'cable', from: { at: 'lhand', f: 0, dy: -10 }, to: 'lhand' }], guides: [{ k: 'arrow', j: 'lhand' }] }
    },
    {
      id: 'neutral_pulldown', n: 'Neutral-grip pulldown', es: 'Jalón con agarre neutro', tags: ['back', 'biceps'], eq: 'Cable', lvl: 1,
      start: 'Agarre en V o manijas paralelas.',
      move: 'Jala hacia el pecho con los codos pegados y regresa lento.',
      mus: 'Dorsal ancho, bíceps',
      err: ['Tronco que se va hacia atrás'],
      safe: ['Amable para hombros.'],
      reg: 'Menos carga.', prog: 'Más carga.',
      fig: { frames: [P(SEAT, { t: -12, la: [176, 176], ra: [176, 176] }), P(SEAT, { t: -14, la: [8, 160], ra: [8, 160] })], anchor: 'hip', fix: 46, props: [{ k: 'seat', back: false }, { k: 'cable', from: { at: 'lhand', f: 0, dy: -10 }, to: 'lhand' }], guides: [{ k: 'arrow', j: 'lhand' }] }
    },
    {
      id: 'cable_row', n: 'Seated cable row', es: 'Remo sentado en polea', tags: ['back', 'biceps'], eq: 'Cable', lvl: 1,
      start: 'Sentado, pies en la plataforma, tronco erguido, brazos extendidos.',
      move: 'Jala hacia el abdomen llevando los codos atrás y juntando escápulas. Regresa lento.',
      mus: 'Dorsal, romboides, trapecio medio, bíceps',
      err: ['Balancear el tronco', 'Encoger hombros'],
      safe: ['Columna neutra.'],
      reg: 'Menos carga.', prog: 'Pausa de 2 s atrás.',
      fig: { frames: [P(SEAT, { t: 0, la: [86, 90], ra: [86, 90] }), P(SEAT, { t: -4, la: [-45, 92], ra: [-45, 92] })], anchor: 'hip', fix: 46, props: [{ k: 'seat', back: false }, { k: 'cable', from: { at: 'lhand', f: 0, dx: 34 }, to: 'lhand' }], guides: [{ k: 'arrow', j: 'lhand' }] }
    },
    {
      id: 'cs_db_row', n: 'Chest-supported dumbbell row', es: 'Remo con pecho apoyado', tags: ['back', 'biceps'], eq: 'Mancuernas + banco inclinado', lvl: 1,
      start: 'Pecho apoyado en un banco inclinado, mancuernas colgando.',
      move: 'Rema llevando los codos atrás, pausa y baja.',
      mus: 'Dorsal, romboides, deltoides posterior',
      err: ['Despegar el pecho del banco'],
      safe: ['Cero carga en la zona lumbar.'],
      reg: 'Menos peso.', prog: 'Pausas.',
      fig: { frames: [{ t: 48, l: [16, -6], r: [16, -6], la: [0, 0], ra: [0, 0] }, { t: 48, l: [16, -6], r: [16, -6], la: [-55, 15], ra: [-55, 15] }], props: [{ k: 'db', h: 'l' }], guides: [{ k: 'arrow', j: 'lhand' }] }
    },
    {
      id: 'db_row', n: 'One-arm dumbbell row', es: 'Remo a un brazo con mancuerna', tags: ['back', 'biceps'], eq: 'Mancuerna + banco', uni: true, lvl: 1,
      start: 'Mano y rodilla apoyadas en el banco (o postura dividida), espalda paralela al piso.',
      move: 'Jala la mancuerna a la cadera y baja con control.',
      mus: 'Dorsal ancho, romboides, bíceps',
      err: ['Rotar el tronco'],
      safe: ['Si apoyar la rodilla operada en el banco molesta, usa postura dividida de pie.'],
      reg: 'Menos peso.', prog: 'Más peso.',
      fig: { frames: [{ t: 72, l: [22, -10], r: [0, -6], la: [12, 0], ra: [0, 0] }, { t: 72, l: [22, -10], r: [0, -6], la: [12, 0], ra: [-52, 18] }], props: [{ k: 'bench', at: 'lhand', dy: 1, w: 30 }, { k: 'db', h: 'r' }], guides: [{ k: 'arrow', j: 'rhand' }] }
    },
    {
      id: 'straight_arm_pd', n: 'Straight-arm pulldown', es: 'Jalón con brazos rectos', tags: ['back', 'core'], eq: 'Cable', lvl: 1,
      start: 'De pie frente a la polea alta, ligera bisagra, brazos rectos al frente.',
      move: 'Lleva la barra hacia los muslos con los brazos rectos, regresa lento.',
      mus: 'Dorsal ancho, core',
      err: ['Doblar los codos', 'Arquear la espalda'],
      safe: ['Costillas abajo.'],
      reg: 'Menos carga.', prog: 'Pausa abajo.',
      fig: { frames: [{ t: 22, l: [10, -6], r: [10, -6], la: [150, 150], ra: [150, 150] }, { t: 22, l: [10, -6], r: [10, -6], la: [8, 8], ra: [8, 8] }], props: [{ k: 'cable', from: { at: 'lhand', f: 0, dx: 26, dy: -16 }, to: 'lhand' }], guides: [{ k: 'arrow', j: 'lhand', bow: -0.3 }] }
    },
    {
      id: 'face_pull', n: 'Face pulls', es: 'Jalón a la cara', tags: ['back', 'shoulders'], eq: 'Cable', lvl: 1,
      start: 'Cuerda en polea a la altura de la cara, brazos al frente.',
      move: 'Jala hacia la cara separando la cuerda, codos altos, y rota hacia afuera. Regresa lento.',
      mus: 'Deltoides posterior, manguito rotador, trapecio medio',
      err: ['Codos bajos', 'Usar impulso'],
      safe: ['Salud de hombro.'],
      reg: 'Banda.', prog: 'Más carga con pausa.',
      fig: { frames: [{ t: -4, la: [88, 90], ra: [88, 90] }, { t: -4, lhT: [6, -64], rhT: [6, -64], lb: -1, rb: -1 }], anchor: 'lank', props: [{ k: 'cable', from: { at: 'lhand', f: 0, dx: 30 }, to: 'lhand' }], guides: [{ k: 'arrow', j: 'lhand' }] }
    },

    /* ---------------- HOMBROS ---------------- */
    {
      id: 'shoulder_press', n: 'Shoulder press', es: 'Press de hombro en máquina', tags: ['shoulders', 'triceps'], eq: 'Máquina', lvl: 1,
      start: 'Sentado, manijas a la altura de los hombros.',
      move: 'Empuja arriba sin arquear la espalda y baja controlado.',
      mus: 'Deltoides, tríceps',
      err: ['Arquear la zona lumbar'],
      safe: ['Rango cómodo.'],
      reg: 'Menos carga.', prog: 'Dumbbell shoulder press.',
      fig: { frames: [P(SEAT, { la: [10, 172], ra: [10, 172] }), P(SEAT, { la: [178, 178], ra: [178, 178] })], anchor: 'hip', fix: 46, props: [seat], guides: [{ k: 'arrow', j: 'lhand' }] }
    },
    {
      id: 'db_shoulder_press', n: 'Dumbbell shoulder press', es: 'Press de hombro con mancuernas', tags: ['shoulders', 'triceps', 'core'], eq: 'Mancuernas', lvl: 2,
      start: 'Sentado o de pie, mancuernas a la altura de los hombros.',
      move: 'Empuja arriba y baja en 2–3 s.',
      mus: 'Deltoides, tríceps, core',
      err: ['Arquear la espalda', 'Mancuernas que chocan'],
      safe: ['Sentado si la estabilidad es un reto.'],
      reg: 'Shoulder press en máquina.', prog: 'De pie o a un brazo.',
      fig: { frames: [P(SEAT, { la: [10, 172], ra: [10, 172] }), P(SEAT, { la: [178, 178], ra: [178, 178] })], anchor: 'hip', fix: 46, props: [seat, { k: 'db', h: 'l' }], guides: [{ k: 'arrow', j: 'lhand' }] }
    },
    {
      id: 'lateral_raise', n: 'Lateral raises', es: 'Elevaciones laterales', tags: ['shoulders'], eq: 'Mancuernas', lvl: 1,
      start: 'De pie, mancuernas a los lados, codos ligeramente flexionados.',
      move: 'Eleva los brazos a los lados hasta la altura de los hombros y baja lento.',
      mus: 'Deltoides medio',
      err: ['Encoger los hombros', 'Balancearse'],
      safe: ['Peso ligero, técnica estricta.'],
      reg: 'Un brazo a la vez.', prog: 'Cable lateral raise.',
      fig: { frames: [P(F, { la: [8, 4], ra: [8, 4] }), P(F, { la: [84, 88], ra: [84, 88] })], anchor: 'hip', fix: 84, props: [{ k: 'db', h: 'both' }], guides: [{ k: 'arrow', j: 'lhand' }] }
    },
    {
      id: 'rear_delt_fly', n: 'Rear-delt fly', es: 'Aperturas posteriores', tags: ['shoulders', 'back'], eq: 'Mancuernas / máquina', lvl: 1,
      start: 'Tronco inclinado hacia adelante (o en máquina pec-deck invertida), brazos colgando.',
      move: 'Abre los brazos a los lados con codos suaves, pausa y baja.',
      mus: 'Deltoides posterior, romboides',
      err: ['Usar impulso', 'Encoger hombros'],
      safe: ['Peso ligero.'],
      reg: 'Máquina.', prog: 'Pausas.',
      fig: { frames: [P(F, { ts: 0.55, la: [4, 4], ra: [4, 4] }), P(F, { ts: 0.55, la: [80, 84], ra: [80, 84] })], anchor: 'hip', fix: 80, props: [{ k: 'db', h: 'both' }], guides: [{ k: 'arrow', j: 'lhand' }] }
    },

    /* ---------------- BÍCEPS ---------------- */
    {
      id: 'db_curl', n: 'Dumbbell curls', es: 'Curl con mancuernas', tags: ['biceps'], eq: 'Mancuernas', lvl: 1,
      start: 'De pie, mancuernas a los lados con palmas al frente.',
      move: 'Flexiona los codos sin moverlos de lugar y baja en 3 s.',
      mus: 'Bíceps braquial',
      err: ['Balancear el cuerpo', 'Codos que se adelantan'],
      safe: ['—'],
      reg: 'Menos peso.', prog: 'Incline curl.',
      fig: { frames: [P(ST, { la: [2, 0], ra: [2, 0] }), P(ST, { la: [6, 150], ra: [6, 150] })], props: [{ k: 'db', h: 'l' }], guides: [{ k: 'arrow', j: 'lhand' }] }
    },
    {
      id: 'hammer_curl', n: 'Hammer curls', es: 'Curl martillo', tags: ['biceps'], eq: 'Mancuernas', lvl: 1,
      start: 'De pie, mancuernas con agarre neutro (palmas enfrentadas).',
      move: 'Flexiona los codos manteniendo el agarre neutro.',
      mus: 'Braquiorradial, braquial, bíceps',
      err: ['Balanceo'],
      safe: ['—'],
      reg: 'Menos peso.', prog: 'Más peso.',
      fig: { frames: [P(ST, { la: [2, 0], ra: [2, 0] }), P(ST, { la: [6, 150], ra: [6, 150] })], props: [{ k: 'db', h: 'l' }], guides: [{ k: 'arrow', j: 'lhand' }] }
    },
    {
      id: 'incline_curl', n: 'Incline dumbbell curls', es: 'Curl inclinado', tags: ['biceps'], eq: 'Mancuernas + banco', lvl: 2,
      start: 'Sentado en banco a 45–60°, brazos colgando detrás del tronco.',
      move: 'Flexiona sin adelantar los codos.',
      mus: 'Bíceps (porción larga)',
      err: ['Adelantar los hombros'],
      safe: ['Peso moderado.'],
      reg: 'Curl de pie.', prog: 'Más peso.',
      fig: { frames: [{ t: -35, l: [90, 0], r: [90, 0], la: [-14, -14], ra: [-14, -14] }, { t: -35, l: [90, 0], r: [90, 0], la: [-14, 130], ra: [-14, 130] }], anchor: 'hip', fix: 46, props: [seat, { k: 'db', h: 'l' }], guides: [{ k: 'arrow', j: 'lhand' }] }
    },
    {
      id: 'cable_curl', n: 'Cable curls', es: 'Curl en polea', tags: ['biceps'], eq: 'Cable', lvl: 1,
      start: 'De pie frente a la polea baja con barra.',
      move: 'Flexiona los codos, pausa arriba y baja lento.',
      mus: 'Bíceps',
      err: ['Balanceo'],
      safe: ['Tensión constante.'],
      reg: 'Menos carga.', prog: 'Single-arm.',
      fig: { frames: [P(ST, { la: [4, 10], ra: [4, 10] }), P(ST, { la: [8, 150], ra: [8, 150] })], props: [{ k: 'cable', from: { at: 'lank', f: 0, dx: 30, dy: -6 }, to: 'lhand' }], guides: [{ k: 'arrow', j: 'lhand' }] }
    },
    {
      id: 'sa_cable_curl', n: 'Single-arm cable curls', es: 'Curl en polea a un brazo', tags: ['biceps'], eq: 'Cable', uni: true, lvl: 1,
      start: 'De pie, manija en una mano, polea baja.',
      move: 'Flexiona el codo y baja lento.',
      mus: 'Bíceps',
      err: ['Rotar el tronco'],
      safe: ['—'],
      reg: 'Menos carga.', prog: 'Más carga.',
      fig: { frames: [P(ST, { la: [4, 10] }), P(ST, { la: [8, 150] })], props: [{ k: 'cable', from: { at: 'lank', f: 0, dx: 30, dy: -6 }, to: 'lhand' }], guides: [{ k: 'arrow', j: 'lhand' }] }
    },

    /* ---------------- TRÍCEPS ---------------- */
    {
      id: 'rope_pushdown', n: 'Rope pushdown', es: 'Extensión de tríceps con cuerda', tags: ['triceps'], eq: 'Cable', lvl: 1,
      start: 'De pie frente a la polea alta, codos pegados a los costados.',
      move: 'Extiende los codos separando la cuerda abajo, regresa lento.',
      mus: 'Tríceps',
      err: ['Codos que se mueven', 'Inclinarse demasiado'],
      safe: ['—'],
      reg: 'Menos carga.', prog: 'Pausa abajo.',
      fig: { frames: [{ t: 8, la: [6, 140], ra: [6, 140] }, { t: 8, la: [4, 4], ra: [4, 4] }], props: [{ k: 'cable', from: { at: 'lhand', f: 0, dx: 12, dy: -58 }, to: 'lhand' }], guides: [{ k: 'arrow', j: 'lhand', bow: -0.3 }] }
    },
    {
      id: 'cable_tri_ext', n: 'Cable triceps extension', es: 'Extensión de tríceps en polea', tags: ['triceps'], eq: 'Cable', lvl: 1,
      start: 'De pie, barra recta en polea alta, codos pegados.',
      move: 'Extiende los codos y regresa controlado.',
      mus: 'Tríceps',
      err: ['Usar el hombro'],
      safe: ['—'],
      reg: 'Menos carga.', prog: 'Más carga.',
      fig: { frames: [{ t: 8, la: [6, 140], ra: [6, 140] }, { t: 8, la: [4, 4], ra: [4, 4] }], props: [{ k: 'cable', from: { at: 'lhand', f: 0, dx: 12, dy: -58 }, to: 'lhand' }], guides: [{ k: 'arrow', j: 'lhand', bow: -0.3 }] }
    },
    {
      id: 'oh_cable_ext', n: 'Overhead cable extension', es: 'Extensión de tríceps por encima de la cabeza', tags: ['triceps'], eq: 'Cable', lvl: 2,
      start: 'De espaldas a la polea, cuerda detrás de la cabeza, codos arriba.',
      move: 'Extiende los codos hacia adelante y arriba, regresa lento.',
      mus: 'Tríceps (porción larga)',
      err: ['Arquear la espalda', 'Codos que se abren'],
      safe: ['Postura dividida estable.'],
      reg: 'Rope pushdown.', prog: 'Más carga.',
      fig: { frames: [{ t: 22, l: [22, -6], r: [-14, -14], la: [160, -10], ra: [160, -10] }, { t: 22, l: [22, -6], r: [-14, -14], la: [160, 162], ra: [160, 162] }], props: [{ k: 'cable', from: { at: 'hip', f: 0, dx: -44, dy: -10 }, to: 'lhand' }], guides: [{ k: 'arrow', j: 'lhand' }] }
    },
    {
      id: 'db_oh_ext', n: 'Dumbbell overhead extension', es: 'Extensión de tríceps con mancuerna', tags: ['triceps'], eq: 'Mancuerna', lvl: 1,
      start: 'Sentado o de pie, mancuerna sujeta con ambas manos por encima de la cabeza.',
      move: 'Baja la mancuerna detrás de la cabeza flexionando los codos y extiende.',
      mus: 'Tríceps',
      err: ['Codos muy abiertos', 'Arquear la espalda'],
      safe: ['Sentado con respaldo si molesta la zona lumbar.'],
      reg: 'Rope pushdown.', prog: 'Más peso.',
      fig: { frames: [P(ST, { la: [176, 176], ra: [176, 176] }), P(ST, { la: [172, -6], ra: [172, -6] })], props: [{ k: 'db', h: 'l' }], guides: [{ k: 'arrow', j: 'lhand' }] }
    },
    {
      id: 'cg_push_up', n: 'Close-grip push-ups', es: 'Lagartijas con agarre cerrado', tags: ['triceps', 'chest', 'core'], eq: 'Peso corporal', lvl: 2,
      start: 'Lagartija con manos a la anchura de los hombros o un poco menos.',
      move: 'Baja con los codos pegados al cuerpo y empuja.',
      mus: 'Tríceps, pectoral',
      err: ['Codos abiertos', 'Cadera caída'],
      safe: ['—'],
      reg: 'Inclinadas.', prog: 'Pausas.',
      fig: { frames: [{ t: 67, l: [-67, -67], r: [-67, -67], la: [0, 0], ra: [0, 0] }, { t: 76, l: [-76, -76], r: [-76, -76], la: [-70, 20], ra: [-70, 20] }], anchor: 'ltoe', guides: [{ k: 'arrow', j: 'neck' }] }
    },

    /* ---------------- CORE ---------------- */
    {
      id: 'dead_bug', n: 'Dead bug', es: 'Bicho muerto', tags: ['core', 'stability'], eq: 'Peso corporal', lvl: 1,
      start: 'Boca arriba, brazos hacia el techo, cadera y rodillas a 90°. Zona lumbar pegada al piso.',
      move: 'Extiende brazo y pierna contrarios lentamente sin despegar la espalda baja; regresa y alterna.',
      mus: 'Transverso del abdomen, recto abdominal',
      err: ['Arquear la espalda', 'Moverse rápido'],
      safe: ['Exhala al extender.'],
      reg: 'Solo piernas o solo brazos.', prog: 'Dead bug con peso.',
      fig: { frames: [{ t: -90, l: [180, 90], r: [180, 90], la: [180, 180], ra: [180, 180] }, { t: -90, l: [180, 90], r: [96, 96], la: [-96, -96], ra: [180, 180] }], anchor: 'hip', guides: [{ k: 'arrow', j: 'rank' }] }
    },
    {
      id: 'dead_bug_w', n: 'Dead bug con peso', es: 'Bicho muerto con KB', tags: ['core', 'stability', 'kettlebell'], eq: 'Kettlebell / disco', lvl: 2,
      start: 'Como el dead bug, sosteniendo una KB arriba con ambas manos.',
      move: 'Extiende una pierna a la vez manteniendo la KB inmóvil.',
      mus: 'Core anterior',
      err: ['Perder la espalda neutra'],
      safe: ['KB ligera.'],
      reg: 'Dead bug.', prog: 'Más peso o más lento.',
      fig: { frames: [{ t: -90, l: [180, 90], r: [180, 90], la: [180, 180], ra: [180, 180] }, { t: -90, l: [96, 96], r: [180, 90], la: [180, 180], ra: [180, 180] }], anchor: 'hip', props: [{ k: 'kb', h: 'c' }], guides: [{ k: 'arrow', j: 'lank' }] }
    },
    {
      id: 'bird_dog', n: 'Bird dog', es: 'Bird dog', tags: ['core', 'glutes', 'stability'], eq: 'Peso corporal', lvl: 1,
      start: 'En cuatro puntos, manos bajo hombros, rodillas bajo cadera.',
      move: 'Extiende brazo y pierna contrarios sin girar la cadera, pausa 2 s y regresa.',
      mus: 'Erectores, glúteos, core',
      err: ['Rotar la cadera', 'Arquear la espalda'],
      safe: ['Si arrodillarte molesta, usa un cojín.'],
      reg: 'Solo piernas.', prog: 'Pausas largas o banda.',
      fig: { frames: [{ t: 80, l: [0, -90], r: [0, -90], la: [0, 0], ra: [0, 0] }, { t: 80, l: [-96, -96], r: [0, -90], la: [0, 0], ra: [96, 96] }], anchor: 'lhand', guides: [{ k: 'arrow', j: 'lank' }] }
    },
    {
      id: 'pallof', n: 'Pallof press', es: 'Press Pallof', tags: ['core', 'stability', 'ski'], eq: 'Cable / banda', uni: true, lvl: 1, sp: true,
      start: 'De pie de lado a la polea (o banda) a la altura del pecho, manos en la manija pegadas al esternón.',
      move: 'Empuja las manos al frente sin dejar que el cable gire tu tronco, pausa 2 s y regresa. Haz ambos lados.',
      mus: 'Oblicuos, transverso (anti-rotación), glúteos',
      err: ['Girar hacia la polea', 'Arquear la espalda', 'Hombros encogidos'],
      safe: ['Ejercicio muy seguro; la clave es no moverse.'],
      reg: 'Más cerca de la polea o menos carga.', prog: 'Medio arrodillado, más lejos o con pasos laterales.',
      why: 'Enseña al tronco a resistir la rotación mientras las extremidades generan fuerza. Al esquiar el tronco debe mantenerse estable mientras las piernas giran y absorben. Un core anti-rotación fuerte protege rodilla y espalda.',
      fig: { custom: 'pallof' }
    },
    {
      id: 'hk_pallof', n: 'Half-kneeling Pallof press', es: 'Pallof medio arrodillado', tags: ['core', 'stability', 'glutes'], eq: 'Cable / banda', uni: true, lvl: 2,
      start: 'Medio arrodillado de lado a la polea, rodilla de abajo del lado de la polea.',
      move: 'Presiona al frente sin girar, pausa y regresa.',
      mus: 'Core anti-rotación, glúteos',
      err: ['Perder la alineación de cadera'],
      safe: ['Cojín bajo la rodilla.'],
      reg: 'De pie.', prog: 'Más carga.',
      fig: { custom: 'pallof', opt: { kneel: true } }
    },
    {
      id: 'plank', n: 'Plank', es: 'Plancha', tags: ['core'], eq: 'Peso corporal', unit: 'time', lvl: 1,
      start: 'Antebrazos en el piso, cuerpo en línea recta.',
      move: 'Mantén la posición apretando abdomen y glúteos.',
      mus: 'Core anterior',
      err: ['Cadera caída o muy alta'],
      safe: ['Respira normal.'],
      reg: 'Con rodillas apoyadas.', prog: 'Tocar hombros o elevar una pierna.',
      fig: { frames: [{ t: 79, l: [-79, -79], r: [-79, -79], la: [0, 90], ra: [0, 90] }, { t: 79, l: [-79, -79], r: [-79, -79], la: [0, 90], ra: [0, 90] }], anchor: 'ltoe' }
    },
    {
      id: 'side_plank', n: 'Side plank', es: 'Plancha lateral', tags: ['core', 'abductors', 'stability'], eq: 'Peso corporal', uni: true, unit: 'time', lvl: 1,
      start: 'De lado sobre el antebrazo, codo bajo el hombro, piernas extendidas.',
      move: 'Eleva la cadera y mantén el cuerpo en línea.',
      mus: 'Oblicuos, cuadrado lumbar, glúteo medio',
      err: ['Cadera caída', 'Rotar el tronco'],
      safe: ['Versión con rodillas si es necesario.'],
      reg: 'Con rodillas flexionadas.', prog: 'Copenhagen plank.',
      fig: { frames: [P(FR, { t: -70, l: [86, 86], r: [88, 88], ra: [0, -70], la: [120, 60] }), P(FR, { t: -79, l: [79, 79], r: [80, 80], ra: [0, -70], la: [120, 60] })], anchor: 'rel', guides: [{ k: 'arrow', j: 'hip' }] }
    },
    {
      id: 'cable_chop', n: 'Cable chop', es: 'Leñador en polea (de arriba a abajo)', tags: ['core', 'stability', 'ski'], eq: 'Cable', uni: true, lvl: 2,
      start: 'De lado a la polea alta, manos juntas en la manija arriba a un lado.',
      move: 'Lleva la manija en diagonal hacia la cadera contraria con el tronco firme; la cadera gira poco. Regresa lento.',
      mus: 'Oblicuos, core, hombros',
      err: ['Doblar mucho los brazos', 'Girar las rodillas'],
      safe: ['Movimiento controlado, sin tirones.'],
      reg: 'Medio arrodillado.', prog: 'Más carga.',
      fig: { frames: [P(F, { lhT: [-34, -86], rhT: [-34, -86] }), P(F, { lhT: [24, -4], rhT: [24, -4] })], anchor: 'hip', fix: 84, props: [{ k: 'cable', from: { at: 'lhand', f: 0, dx: -22, dy: -12 }, to: 'lhand' }], guides: [{ k: 'arrow', j: 'lhand' }] }
    },
    {
      id: 'cable_lift', n: 'Cable lift', es: 'Leñador inverso (de abajo a arriba)', tags: ['core', 'stability', 'glutes'], eq: 'Cable', uni: true, lvl: 2,
      start: 'De lado a la polea baja, manos juntas abajo a un lado.',
      move: 'Lleva la manija en diagonal hacia arriba al lado contrario sin arquear la espalda.',
      mus: 'Oblicuos, glúteos, hombros',
      err: ['Hiperextender la espalda'],
      safe: ['Controlado.'],
      reg: 'Medio arrodillado.', prog: 'Más carga.',
      fig: { frames: [P(F, { lhT: [-26, 6], rhT: [-26, 6] }), P(F, { lhT: [34, -86], rhT: [34, -86] })], anchor: 'hip', fix: 84, props: [{ k: 'cable', from: { at: 'lhand', f: 0, dx: -24, dy: 10 }, to: 'lhand' }], guides: [{ k: 'arrow', j: 'lhand' }] }
    },
    {
      id: 'bear_plank', n: 'Bear plank', es: 'Plancha de oso', tags: ['core', 'shoulders', 'stability'], eq: 'Peso corporal', unit: 'time', lvl: 1,
      start: 'En cuatro puntos, manos bajo hombros, rodillas bajo cadera.',
      move: 'Despega las rodillas 3–5 cm del piso y mantén sin mover la espalda.',
      mus: 'Core, hombros, cuádriceps (isométrico)',
      err: ['Subir la cadera', 'Contener la respiración'],
      safe: ['Bajo impacto, carga ligera de rodilla.'],
      reg: 'Menos tiempo.', prog: 'Tocar hombros o caminar como oso.',
      fig: { frames: [{ t: 80, l: [0, -90], r: [0, -90], la: [0, 0], ra: [0, 0] }, { t: 80, l: [22, -78], r: [22, -78], la: [0, 0], ra: [0, 0] }], anchor: 'lhand', guides: [{ k: 'arrow', j: 'lknee' }] }
    },

    /* ---------------- SKI PREP (bajo impacto) ---------------- */
    {
      id: 'ski_hold', n: 'Ski stance hold', es: 'Isométrico en postura de esquí', tags: ['quads', 'ski', 'stability', 'glutes'], eq: 'Peso corporal / KB', unit: 'time', lvl: 2,
      start: 'Pies al ancho de cadera, tobillos, rodillas y cadera flexionados como sobre los esquís, brazos al frente como con bastones.',
      move: 'Mantén la postura con peso repartido en todo el pie. Progresa con pequeños cambios de peso de un pie a otro.',
      mus: 'Cuádriceps, glúteos, core (resistencia isométrica)',
      err: ['Sentarse atrás (peso en talones)', 'Rodillas hacia adentro'],
      safe: ['Tiempo progresivo, sin dolor.'],
      reg: 'Wall sit.', prog: 'Más tiempo o con cambios de peso lentos.',
      fig: { frames: [P(ST, { la: [20, 20], ra: [20, 20] }), { t: 36, l: [62, -30], r: [62, -30], la: [55, 30], ra: [55, 30] }], guides: [{ k: 'arrow', j: 'hip' }] }
    },
    {
      id: 'lateral_lunge', n: 'Lateral lunge lento', es: 'Zancada lateral controlada', tags: ['adductors', 'glutes', 'quads', 'ski'], eq: 'Peso corporal / KB', uni: true, lvl: 2,
      start: 'De pie con los pies juntos.',
      move: 'Da un paso lateral, flexiona esa rodilla (alineada con el pie) y mantén la otra pierna recta. Regresa lento. Sin rebote ni velocidad.',
      mus: 'Aductores, glúteos, cuádriceps',
      err: ['Rodilla que se va hacia adentro', 'Paso explosivo'],
      safe: ['Rango y velocidad que apruebe tu fisio. No es un movimiento rápido.'],
      reg: 'Rango corto o con apoyo.', prog: 'Goblet lateral lunge.',
      fig: { frames: [P(F, { l: [3, 0], r: [3, 0], la: [10, 0], ra: [10, 0] }), P(F, { t: 12, th: 0.8, l: [44, 0], r: [30, 30], la: [40, 30], ra: [40, 30] })], anchor: 'rank', guides: [{ k: 'arrow', j: 'lank' }] }
    },
    {
      id: 'lateral_step_up', n: 'Lateral step-up', es: 'Subida lateral al cajón', tags: ['quads', 'glutes', 'ski', 'abductors'], eq: 'Cajón', uni: true, lvl: 2,
      start: 'De lado al cajón, pie izquierdo arriba.',
      move: 'Sube lateralmente empujando con la pierna de arriba, rodilla alineada. Baja lento.',
      mus: 'Cuádriceps, glúteo medio',
      err: ['Impulsarse con la pierna de abajo', 'Valgo'],
      safe: ['Cajón bajo al inicio.'],
      reg: 'Cajón más bajo.', prog: 'Más altura o carga.',
      fig: { frames: [P(F, { th: 0.75, l: [24, -6], r: [6, 0], la: [20, 10], ra: [20, 10] }), P(F, { l: [6, 0], r: [10, 4], la: [20, 10], ra: [20, 10] })], props: [{ k: 'box', at: 'lank', dy: 2, w: 30, dx: 4 }], guides: [{ k: 'arrow', j: 'hip' }] }
    },
    {
      id: 'bike_easy', n: 'Bicicleta suave', es: 'Cardio de bajo impacto', tags: ['quads', 'ski', 'acl'], eq: 'Bicicleta estática', unit: 'time', lvl: 1,
      start: 'Asiento a una altura con la rodilla casi extendida abajo.',
      move: 'Pedalea a ritmo cómodo (puedes conversar). RPE 3–4.',
      mus: 'Cuádriceps, glúteos, sistema cardiovascular',
      err: ['Asiento muy bajo (carga la rodilla)'],
      safe: ['Excelente para recuperación y movilidad de rodilla.'],
      reg: 'Menos tiempo.', prog: 'Más tiempo o intervalos.',
      fig: { frames: [{ t: 38, l: [70, -10], r: [95, 40], la: [60, 40], ra: [60, 40] }, { t: 38, l: [95, 40], r: [70, -10], la: [60, 40], ra: [60, 40] }], anchor: 'hip', fix: 74, props: [{ k: 'bike' }] }
    },
    {
      id: 'bike_intervals', n: 'Intervalos en bicicleta', es: 'Acondicionamiento sin impacto', tags: ['quads', 'ski'], eq: 'Bicicleta estática', unit: 'time', lvl: 2,
      start: 'En bicicleta estática tras calentar.',
      move: 'Alterna 30 s fuerte (RPE 7–8) con 60–90 s suave. Resistencia firme, cadencia controlada.',
      mus: 'Cuádriceps, glúteos, capacidad aeróbica',
      err: ['Cadencia descontrolada', 'Esforzarte con la rodilla molesta'],
      safe: ['Solo si tu fisio permite intensidad en bici.'],
      reg: 'Bici suave.', prog: 'Más intervalos.',
      fig: { frames: [{ t: 45, l: [70, -10], r: [95, 40], la: [70, 30], ra: [70, 30] }, { t: 45, l: [95, 40], r: [70, -10], la: [70, 30], ra: [70, 30] }], anchor: 'hip', fix: 74, props: [{ k: 'bike' }], speed: 700 }
    },

    /* ---------------- REQUIERE AUTORIZACIÓN ---------------- */
    {
      id: 'squat_jump', n: 'Squat jump', es: 'Salto desde sentadilla', tags: ['quads', 'glutes', 'ski'], eq: 'Peso corporal', lvl: 3, auth: 'impact',
      start: 'Media sentadilla con brazos atrás.',
      move: 'Salta vertical y aterriza suave en media sentadilla, rodillas alineadas.',
      mus: 'Cuádriceps, glúteos, potencia',
      err: ['Aterrizar con rodillas hacia adentro', 'Aterrizaje rígido'],
      safe: ['IMPACTO: solo con autorización y progresión indicada por tu fisio.'],
      reg: 'Sentadilla rápida sin salto.', prog: 'Saltos continuos.',
      fig: { frames: [{ t: 40, l: [80, -26], r: [80, -26], la: [-40, -30], ra: [-40, -30] }, { t: 0, l: [0, 0], r: [0, 0], lf: -40, rf: -40, la: [170, 170], ra: [170, 170], oy: -26 }] }
    },
    {
      id: 'drop_landing', n: 'Snap-down / aterrizaje', es: 'Aterrizaje y frenado', tags: ['quads', 'ski', 'stability'], eq: 'Peso corporal', lvl: 3, auth: 'impact',
      start: 'De pie en puntas con brazos arriba.',
      move: 'Baja rápido a postura atlética (media sentadilla) y "congela" la posición con rodillas alineadas.',
      mus: 'Cuádriceps excéntrico, control de desaceleración',
      err: ['Valgo', 'Peso en talones'],
      safe: ['Desaceleración: solo con autorización.'],
      reg: 'Bajada lenta a postura atlética.', prog: 'Desde un escalón bajo.',
      fig: { frames: [P(ST, { lf: -40, rf: -40, la: [170, 170], ra: [170, 170] }), { t: 38, l: [62, -30], r: [62, -30], la: [-20, -10], ra: [-20, -10] }] }
    },
    {
      id: 'lateral_bound', n: 'Skater bounds', es: 'Saltos laterales de patinador', tags: ['glutes', 'ski', 'stability'], eq: 'Peso corporal', uni: true, lvl: 3, auth: 'lateral',
      start: 'Sobre una pierna en postura atlética.',
      move: 'Salta lateral a la otra pierna, aterriza suave y estabiliza 2 s antes del siguiente.',
      mus: 'Glúteo medio, cuádriceps, potencia lateral',
      err: ['Rodilla que colapsa al aterrizar'],
      safe: ['Lateral rápido + impacto: SOLO con autorización. Empieza con distancias cortas y pausa.'],
      reg: 'Lateral step-down o paso lateral sin salto.', prog: 'Más distancia.',
      fig: { frames: [P(F, { t: 14, th: 0.8, l: [6, -4], r: [-20, -40], la: [30, 20], ra: [60, 30] }), P(F, { t: -14, th: 0.8, l: [20, 40], r: [6, -4], la: [60, 30], ra: [30, 20], ox: -60 })] }
    },
    {
      id: 'lateral_shuffle', n: 'Lateral shuffle', es: 'Desplazamiento lateral rápido', tags: ['ski', 'abductors'], eq: 'Peso corporal', lvl: 3, auth: 'cod',
      start: 'Postura atlética.',
      move: 'Desplázate lateralmente con pasos rápidos sin cruzar los pies; frena y cambia de sentido.',
      mus: 'Glúteo medio, cuádriceps, agilidad',
      err: ['Cruzar los pies', 'Frenar con la rodilla hacia adentro'],
      safe: ['Cambio de dirección: SOLO con autorización.'],
      reg: 'Banded lateral walk.', prog: 'Más velocidad.',
      fig: { frames: [P(F, { th: 0.82, l: [14, -6], r: [14, -6], la: [40, 20], ra: [40, 20] }), P(F, { th: 0.82, l: [26, -8], r: [4, -2], la: [40, 20], ra: [40, 20], ox: 20 })], anchor: 'rank' }
    },
    {
      id: 'box_jump_low', n: 'Box jump bajo', es: 'Salto a cajón bajo', tags: ['quads', 'glutes'], eq: 'Cajón', lvl: 3, auth: 'impact',
      start: 'Frente a un cajón bajo.',
      move: 'Salta al cajón y aterriza suave en media sentadilla. Baja caminando, nunca saltando.',
      mus: 'Potencia de piernas',
      err: ['Aterrizar rígido', 'Bajar saltando'],
      safe: ['Impacto: solo con autorización.'],
      reg: 'Step-up rápido.', prog: 'Cajón más alto.',
      fig: { frames: [{ t: 40, l: [80, -26], r: [80, -26], la: [-40, -30], ra: [-40, -30] }, { t: 30, l: [60, -26], r: [60, -26], la: [60, 30], ra: [60, 30], ox: 34, oy: -26 }], props: [{ k: 'box', at: 'lank', f: 1, dy: 2, w: 34 }] }
    }
  ];

  LIST.forEach((e) => {
    e.unit = e.unit || 'reps';
    e.q = yt(e.n + ' exercise technique');
  });
  const BY = Object.fromEntries(LIST.map((e) => [e.id, e]));

  const TAGS = [
    ['quads', 'Quadriceps'], ['hams', 'Hamstrings'], ['glutes', 'Glutes'], ['adductors', 'Adductors'], ['abductors', 'Abductors'],
    ['calves', 'Calves'], ['core', 'Core'], ['chest', 'Chest'], ['back', 'Back'], ['shoulders', 'Shoulders'], ['biceps', 'Biceps'],
    ['triceps', 'Triceps'], ['stability', 'Stability'], ['balance', 'Balance'], ['kettlebell', 'Kettlebell'], ['acl', 'ACL'], ['ski', 'Ski Prep']
  ];
  const TAG_ES = { quads: 'Cuádriceps', hams: 'Isquios', glutes: 'Glúteos', adductors: 'Aductores', abductors: 'Abductores', calves: 'Pantorrilla', core: 'Core', chest: 'Pecho', back: 'Espalda', shoulders: 'Hombros', biceps: 'Bíceps', triceps: 'Tríceps', stability: 'Estabilidad', balance: 'Equilibrio', kettlebell: 'KB', acl: 'LCA', ski: 'Esquí' };

  const AUTH = {
    impact: 'Impacto / saltos',
    run: 'Carrera',
    cod: 'Cambios de dirección',
    explosive: 'Explosivos (swing, clean)',
    lateral: 'Laterales rápidos'
  };

  window.EX = { LIST, BY, TAGS, TAG_ES, AUTH };
})();
