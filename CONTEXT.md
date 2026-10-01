# CONTEXT — gym-app (ACL → SKI PREP)

Documento para retomar el proyecto en una sesión nueva sin perder contexto. Léelo completo antes de tocar código.

---

## 1. Qué es

App web personal (PWA) de entrenamiento de Giacomo para **terminar de rehabilitar la rodilla izquierda después de una reconstrucción de LCA y prepararse para esquiar**. Programa del **1 oct 2026 al 15 feb 2027** (viaje de esquí). Se usa desde el iPhone en el gimnasio, agregada a la pantalla de inicio.

- **Link en producción:** https://giiacomiino.github.io/gym-app/
- **Repo:** https://github.com/giiacomiino/gym-app (público, rama `main`, GitHub Pages desde `main` / root)
- **Código local:** `~/acl-ski-prep` (remote `origin` → el repo de arriba)
- **No tiene nada que ver con JAX** (`~/Giacomo AI/jax`). Giacomo pidió explícitamente no mezclarlos. No tocar JAX.

## 2. Perfil y contexto médico (fuente: Giacomo)

- Reconstrucción de LCA **rodilla izquierda el 8 may 2026**, injerto **tendón de Aquiles de donador (aloinjerto)**.
- ~15 sesiones de rehab deportiva previas (isométricos, ligas, BFR, fuerza). Sin dolor, inflamación ni inestabilidad al empezar.
- Traumatólogo autorizó gimnasio con pesas progresivas.
- **Peso 76 kg, estatura 1.80 m** (editable en Perfil; recalcula pesos sugeridos).
- **Indicación del doctor (dicha el 1 oct 2026):** el músculo se refuerza con **6–8 semanas de actividad**; en ese momento podría **regresar al "box"** para hacer cambios de dirección y cosas más avanzadas. → Ventana box: **12–26 nov 2026**. Trabajo dinámico entra en la **semana 8 (16 nov)**.
- Objetivo: mucha más fuerza en ambas piernas (sobre todo la izquierda), simetría, control, y torso cada vez mejor. La app **nunca** debe decir "estás listo para esquiar": la evaluación final es del traumatólogo/fisio.

## 3. Preferencias de Giacomo para esta app (importante)

- **"Que vaya al día":** la app abre directo en el entrenamiento de hoy (`#hoy`, también ruta por defecto). Se re-sincroniza la fecha si la app queda abierta de un día a otro.
- **NO quiere registrar datos** (peso/reps/RPE/pruebas/semáforo). Solo quiere **llevar la rutina** (palomitas por ejercicio y sesión) y **ver su avance**. Se eliminaron el tracker, las pruebas, el formulario del semáforo y Supabase.
- **No quiere un flujo centrado en autorizaciones del doctor.** Se quitaron los toggles de autorización; el trabajo dinámico entra por calendario (semana 8) con una alternativa por ejercicio.
- Quiere **pesos sugeridos** en **kg y lb** (su gym tiene máquinas en ambas unidades).
- Martes y jueves (los "días de movilidad/estabilidad") deben ser **full body con una kettlebell** (+ banda + peso corporal), sin máquinas.
- **Sin encabezado fijo/sticky** — en modo app de iPhone se encimaba con la hora. Se quitó el header completo.
- Estilo de respuesta general (memoria): respuestas concisas, en español, sin recapitular de más. Implementar directo tras acordar, sin planes largos. Él corre los `git push` cuando no hay token disponible.

## 4. Arquitectura

HTML/JS estático, **sin build ni dependencias**. Todo corre en el navegador.

| Archivo | Qué hace |
|---|---|
| `index.html` | Shell + **todo el CSS** (tokens claro/oscuro), barra de pestañas inferior, sheet, timer, toast. Carga los scripts en orden: `figures.js → exercises.js → program.js → app.js`. |
| `figures.js` | Motor de **figuras de palitos paramétricas animadas** (SVG). Poses por ángulos de articulaciones, anclaje a una articulación fija, interpolación entre keyframes, props (KB, mancuerna, barra, banco, cajón, polea, banda, pared, bici…), guías y flechas. Diagramas especiales vistos desde arriba: `ybal`, `star`, `pallof`, `ankle`. Expone `window.FIG = { staticSVG, animate, frameCount }`. |
| `exercises.js` | **Biblioteca de 114 ejercicios** (`window.EX = { LIST, BY, TAGS, TAG_ES, AUTH }`). Cada uno: `id, n` (nombre), `es` (nombre en español), `tags`, `eq`, `uni`, `unit` (`reps/time/dist/cm`), `lvl`, `sp` (especial ⭐), `auth` (categoría dinámica: impact/explosive/lateral/cod), `start, move, mus, err[], safe[], reg, prog, why?`, `fig` (keyframes + props), `q` (URL de búsqueda en YouTube). |
| `program.js` | **El programa**: fases, plantillas semanales, rotación, prescripciones, trabajo dinámico, **pesos sugeridos**, hitos, readiness, opciones de sábado. Expone `window.PROG`. |
| `app.js` | UI: router por hash, vistas, checkboxes en `localStorage`, gráficas SVG hechas a mano, temporizador de descanso, sheet de ejercicio con animación. |
| `sw.js` | Service worker: shell en caché (offline), red primero para archivos propios, caché para Google Fonts. **Subir la versión de `CACHE` (`gymapp-vN`) en cada cambio** para que los teléfonos tomen la nueva versión. Actual: `gymapp-v4`. |
| `manifest.webmanifest` | PWA (start_url `./#hoy`, standalone, íconos). |
| `icons/` | `icon.svg`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` (generados con Playwright desde el SVG). |
| `.nojekyll` | Para que GitHub Pages sirva tal cual. |

### Estado guardado (solo en el celular)
`localStorage['gymapp.v2'] = { checks: {fecha: {codigo: true}}, done: {fecha: true}, recovery: {fecha: {opcion: true}}, profile: {weight, height} }`.
Una sesión se marca como completada al tocar "Terminar sesión" o al palomear todos sus ejercicios. Sábado: completado si se marca alguna opción.

### Rutas (hash)
`#hoy` / vacío → día de hoy · `#dia/YYYY-MM-DD` · `#inicio` · `#calendario` (Semana/Mes) · `#fases` · `#ejercicios` · `#ejercicio/<id>` · `#progreso` · `#ski` · `#sabado` · `#ajustes` (Perfil).
Pestañas inferiores: Inicio · Calendario · **Hoy** (botón central) · Ejercicios · Progreso. Ski readiness, Recovery Saturday, Fases y Perfil se abren desde tarjetas en Inicio (Fases también desde Calendario).

## 5. El programa (program.js)

- `START 2026-10-01` (jueves), `END 2027-02-15` (lunes = día del viaje), `WEEK1 2026-09-28` (lunes de la semana 1). 20 semanas + día de viaje. 97 sesiones de entrenamiento (L–V).
- **Fases (por mes):**
  1. **Construir fuerza** (oct) — principales 3×10–12, RPE 6–7, tempo 3-1-1
  2. **Desarrollo de fuerza** (nov) — 4×8–10, RPE 7–8 · semana 8 entra lo dinámico
  3. **Fuerza + estabilidad** (dic) — 4×6–8, RPE 7–8, excéntricos 4 s
  4. **Fuerza + preparación específica** (ene) — 4×5–6 + bloque SKI PREP
  5. **Puesta a punto** (1–15 feb) — 2–3×5–8, RPE 6–7. Vie 12 feb = "Activación pre-viaje" corta.
- **Semanas de descarga:** 9 (23 nov) y 14 (28 dic): una serie menos, carga ×0.85. Semana 20: carga ×0.92 y martes/jueves cortos.
- **Semana tipo (formato A1+A2 … D1+D2, ~60 min):**
  - **Lun – Fuerza pierna A + torso** (rodilla dominante): A1 leg press · A2 pecho · B1 unilateral · B2 jalón · C1 single-leg extension · C2 hombro · D1 pantorrilla · D2 core · finisher Spanish squat (F4: ski hold).
  - **Mar – Full body kettlebell A** (una KB + banda): KB deadlift/RDL · press de piso a un brazo / lagartijas / half-kneeling press · goblet squat (F3–4 lateral lunge) · KB row · equilibrio (star/Y-balance) · Pallof con banda / halo · suitcase carry · core · tibial + tobillo.
  - **Mié – Fuerza pierna B + torso** (cadera dominante): A1 DB RDL → RDL con barra · A2 remo · B1 hip thrust · B2 press hombro · C1 leg curl · C2 deltoide posterior · D1 aductor/abductor (F3: Copenhagen) · D2 bíceps · finisher equilibrio.
  - **Jue – Full body kettlebell B**: single-leg RDL · lagartijas / press a un brazo · step-down (cualquier escalón) · KB row / chest pass · banda lateral · around the world / halo · front rack / suitcase carry · bird dog / bear plank / Turkish get-up (F3+) · finisher side plank / Copenhagen / ski hold.
  - **Vie – Full body fuerza**: A1 goblet a banco → goblet → box squat · A2 press inclinado · B1 single-leg leg press · B2 remo a un brazo · C1 unilateral (glute bridge → reverse lunge) · C2 tríceps · D1 tibial/pantorrilla · D2 carry · finisher bici (intervalos desde F2).
  - **Sáb – Recovery Saturday** (opcional): bici suave, caminata, **full body ligero con KB** (circuito 20–25 min RPE 4–5), movilidad (rutina incluida), recuperación, ejercicios de fisio.
  - **Dom** descanso.
- **Rotación:** cada slot tiene un pool por fase (`{fase: [ids]}`, hereda de la fase anterior si no se define); rota **cada 2 semanas** (`wip = semana - semana de inicio de la fase`). Los ejercicios principales son fijos por fase para progresar carga.
- **Prescripción:** `RX[tipo][fase]` con tipos `main, uni, acc, upper, small, kb, core, stab, cond`, más `iso`, `carry` (distancias) y tiempos según `unit` del ejercicio.
- **Dinámico (desde semana 8, sin toggles):** `DYN[dow][etapa]` con etapas s1 (sem 8–9), s2 (10–14), s3 (15–18), s4 (19–20). Mar: snap-down → +squat jump → box jump bajo. Jue: KB swing → +skater bounds → KB clean. Vie: lateral shuffle → +squat jump (ene). Cada uno con **alternativa** (`alt`). Bloque con borde ámbar "Dinámico · desde la semana 8".
- **SKI PREP** (F3 vie, F4–F5 mar/jue/vie): lateral step-up, ski stance hold, lateral lunge, unstable balance, banded lateral walk.

### Pesos sugeridos (`LOADS`, `loadFor(id, date, type)`)
- Base = factor × peso corporal (76 kg) para 10–12 reps a RPE 6–7 en la semana 1. Ej.: leg press 0.9 (≈70 kg), sl leg press 0.4, RDL barra 0.55, hip thrust 0.6, goblet 0.21 (KB 16), lat pulldown 0.55, DB bench 0.2 c/u.
- Tipos de equipo: `m` máquina/polea (redondeo 2.5 si <20, si no 5), `b` barra total (mín 20, paso 2.5), `d` mancuernas c/u y `d1` una mancuerna (paso 2 kg), `k` una KB y `k2` dos KB (tamaños reales 4–32 kg).
- **Crecimiento** (`growth`): F1 1.00 + 2.5 %/sem · F2 1.12 + 3 %/sem · F3 1.26 + 2.5 %/sem · F4 1.38 + 1.5 %/sem · F5 1.30; descarga ×0.85; semana 20 ×0.92. Accesorios crecen 60 %, core/carries/iso 50 %.
- Etiqueta en **kg y lb**: lb = kg × 2.20462 redondeado a múltiplos de 5. Ej.: `70 kg · 155 lb`, `KB 16 kg · 35 lb`, `16 kg · 35 lb c/u`, `47.5 kg · 105 lb (con barra)`. Gráficas en kg.
- Ejercicios con banda o peso corporal no llevan peso (Pallof se quitó de LOADS por ser con banda).
- En unilaterales de pierna se muestra "mismo peso en ambas piernas" (empezar con la izquierda).

### Hitos (MILESTONES)
1 oct inicio · 30 oct revisión sugerida con fisio · 1 nov F2 · **12 nov ventana box (hasta 26 nov)** · **16 nov semana 8: dinámico** · 23 nov descarga · 1 dic F3 · 28 dic descarga · 1 ene F4 · 1 feb F5 · 10 feb evaluación final con traumatólogo/fisio · 15 feb viaje.

## 6. Pantallas (app.js)

- **Hoy / día:** navegación ‹ ›, título, dificultad (símbolos de pista de esquí: verde ● / azul ■ / negra ◆), duración, RPE, barra de avance del día, **semáforo de rodilla como guía plegable** (verde/amarillo/rojo; rojo = "DETÉN EL EJERCICIO Y CONSULTA CON TU PROFESIONAL DE SALUD"), calentamiento con palomitas, bloques A–D con botón de descanso (timer), finisher, SKI PREP, Dinámico, "Terminar sesión". Cada ejercicio: miniatura, código, nombre, series × reps · RPE · tempo, **peso sugerido kg·lb**, palomita.
- **Sheet de ejercicio:** animación (pausa/play; respeta reduced-motion), cuadros "posición inicial → movimiento" (o pasos numerados, ej. TGU 7 pasos), prescripción del día + peso sugerido, **gráfica de pesos sugeridos en todo el programa**, "por qué es útil" (ejercicios ⭐), posición, movimiento, músculos, errores, seguridad, regresión, progresión, botón "VER CÓMO SE HACE" (búsqueda de YouTube, no URLs inventadas).
- **Inicio:** "ACL → SKI PREP", semana/días post-op/días al viaje, **perfil de montaña** con fases y marca de "box", fase actual, tarjeta de hoy, días entrenados y racha, **tarjeta "Regreso al box"** con cuenta regresiva, próximo entrenamiento, objetivo de fase, próximos hitos, accesos a Fases / Ski readiness / Recovery Saturday, tarjeta de perfil.
- **Calendario:** Semana (lista con tipo, duración, músculos, dificultad, estado) · Mes (cuadrícula) · **Fases**.
- **Fases (`#fases`):** selector F1–F5 ("hoy" en la actual), objetivos y esquema, **Piernas · plan de esquiador** y **Torso · físico** agrupados por patrón, con días, series × reps, rango de peso (inicio → pico de la fase, kg·lb), etiquetas **Nuevo**/**Dinámico**, "Sale de la rutina", y "Cómo cambia cada patrón" F1→F5. Clasificación en `patternOf()`.
- **My progress:** sesiones completadas, semana actual, barras de sesiones por semana (completadas vs planeadas), **curvas de pesos sugeridos** de los ejercicios clave (leg press, RDL, sentadilla del viernes, hip thrust, sl leg press, sl leg extension, sl RDL, pecho, jalón) con "hoy" marcado y sesiones completadas como puntos; un punto por semana (la carga más alta); la línea se corta si el ejercicio no aparece más de 22 días.
- **Ski readiness:** banner "EVALUACIÓN FINAL POR TRAUMATÓLOGO/FISIOTERAPEUTA ANTES DE REGRESAR AL ESQUÍ" y 9 capacidades (fuerza, unilateral, control de rodilla, estabilidad, equilibrio, excéntrico, desaceleración, lateral, tolerancia) con % del trabajo completado según sesiones marcadas (`READY_MATCH`).
- **Recovery Saturday:** opciones con palomitas + rutina de movilidad.
- **Perfil (`#ajustes`):** peso y estatura (recalcula pesos), IMC, borrar marcas (doble toque, sin `confirm()`), nota de seguridad.

## 7. Diseño

- Tipografías Google Fonts: **Barlow Condensed** (display/números) + **Barlow** (texto).
- Paleta "nieve + noche alpina": fondo `#eef2f6`, tinta `#0f1b2a`, acento **naranja patrulla de esquí `#e2531b`** (= pierna izquierda en las figuras), azul pista `#2f6db3` (derecha). Modo oscuro completo vía `prefers-color-scheme` y `data-theme`.
- Mobile-first, columna máx. 560 px, tab bar fija abajo con safe-area, `main` con `padding-top: env(safe-area-inset-top)` (no hay header).

## 8. Cómo trabajar en este repo

### Verificación visual (no hay tests)
Playwright está disponible en el venv de otro proyecto: `~/FFMSivaBot/.venv/bin/python` (Chromium ya instalado).
```bash
cd ~/acl-ski-prep && python3 -m http.server 8765 &
# script de ejemplo: abrir rutas a 390x844, capturar pageerror, screenshot
~/FFMSivaBot/.venv/bin/python script.py
pkill -f "http.server 8765"
```
Revisar siempre: `pageerror` vacío; `#hoy`, `#inicio`, `#fases`, `#progreso`, `#ejercicio/<id>`, modo oscuro (`color_scheme='dark'`).
Chequeo rápido de lógica con Node:
```bash
node -e "global.window={};require('./exercises.js');require('./program.js');const P=window.PROG;console.log(P.session('2026-11-17'), P.loadFor('leg_press','2026-10-05','main'))"
```
Galería de todas las figuras: crear un HTML temporal que cargue `figures.js` + `exercises.js` y pinte `FIG.staticSVG(e.fig, 0/último)` de cada ejercicio (así se revisaron las poses).

### Publicar
1. Commit (mensaje explicando el porqué; terminar con `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`).
2. **Subir `CACHE` en `sw.js`** si cambió algo visible.
3. `git push` — **lo corre Giacomo** desde su terminal (no hay credencial válida guardada; el PAT que estaba en el remote de JAX expiró → "Bad credentials"). Si Giacomo da un token nuevo, usarlo solo inline en el comando de push, nunca guardarlo en archivos ni en `git remote`.
4. GitHub Pages reconstruye en 1–2 min. En el iPhone hay que cerrar y reabrir la app para tomar la versión nueva (service worker).

### Gotchas conocidos
- `requestAnimationFrame` puede dar un timestamp menor que `performance.now()` → en `figures.js` el tiempo se normaliza con módulo positivo (bug ya corregido; no revertir).
- Las figuras son esquemáticas: algunas poses de cadena cerrada (hip thrust, búlgara, Copenhagen, TGU) se deslizan un poco entre keyframes. Aceptado.
- GitHub Pages no construyó la primera vez porque se activó después del push → se resolvió con un commit nuevo (`.nojekyll`).
- Next.js/JAX: no aplica aquí. Este repo no tiene build.
- El repo es **público**: no meter tokens ni datos sensibles más allá de lo que ya está (fecha de cirugía, rodilla, peso/estatura).

## 9. Historial de decisiones

1. Se pidió primero un Artifact de claude.ai; se recomendó y aceptó **PWA en GitHub Pages** (offline en el gym, ícono en pantalla de inicio).
2. Primera versión: tracker completo (series, RPE, izquierda/derecha, pruebas, semáforo con formulario, LSI) + sync local-first con Supabase (proyecto nuevo) + toggles de autorización médica.
3. Giacomo cambió el enfoque: **no registrar nada**, seguir la rutina y ver avance; pesos sugeridos con 76 kg / 1.80; dinámico tras 6–8 semanas (box). → Se quitó Supabase, el tracker, las pruebas y las autorizaciones.
4. Quiso subirlo a JAX → se canceló para no mezclar; se creó el repo `gym-app`.
5. Header sticky fuera; martes/jueves full body con KB; kg + lb.
6. Header eliminado por completo (se encimaba con la barra de estado); módulo **Fases**.

## 10. Ideas pendientes / posibles siguientes pasos (no pedidas aún)

- Elegir "solo tengo una KB de X kg" en Perfil y ajustar los pesos sugeridos de KB.
- Notas por sesión opcionales (se quitaron junto con el registro).
- Exportar el plan de una fase a PDF/imagen para el fisio.
- Ajustar factores de `LOADS` si Giacomo reporta que algún peso sugerido le queda muy pesado o muy ligero (es la palanca principal; cambiar el factor del ejercicio, no la curva global).
