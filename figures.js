/* figures.js — figuras paramétricas para ilustrar ejercicios.
   Cada ejercicio define keyframes de pose (ángulos en grados). La figura se
   ancla a una articulación que no se mueve (pie de apoyo, cadera en asiento…)
   y se interpola entre keyframes para animar el movimiento.

   Convención (vista lateral, figura mirando a la derecha):
   - t: inclinación del tronco desde la vertical (+ = hacia adelante)
   - l / r: [muslo, espinilla] ángulo absoluto desde "hacia abajo" (+ = adelante)
   - la / ra: [brazo, antebrazo] igual que las piernas (180 = arriba)
   - Vista frontal (v:'front'): + = hacia afuera; el lado derecho se espeja
     salvo raw:true. lhT / rhT: objetivo de mano (IK) relativo a la cadera. */
(function () {
  const L = { torso: 50, neck: 14, head: 8.5, thigh: 44, shin: 42, ua: 27, fa: 25, foot: 12 };
  const RAD = Math.PI / 180;
  const seg = (o, a, len) => [o[0] + Math.sin(a * RAD) * len, o[1] + Math.cos(a * RAD) * len];
  const add = (a, b) => [a[0] + b[0], a[1] + b[1]];

  const DEF = { t: 0, l: [0, 0], r: [0, 0], la: [6, 0], ra: [6, 0], ts: 1, th: 1, us: 1, lf: 0, rf: 0, ox: 0, oy: 0 };
  const norm = (p) => Object.assign({}, DEF, p);

  function ik(sh, target, up, lo, bend) {
    const dx = target[0] - sh[0], dy = target[1] - sh[1];
    let d = Math.hypot(dx, dy);
    d = Math.min(Math.max(d, Math.abs(up - lo) + 0.1), up + lo - 0.01);
    const base = Math.atan2(dy, dx);
    const alpha = Math.acos((up * up + d * d - lo * lo) / (2 * up * d)) * (bend || 1);
    const el = [sh[0] + Math.cos(base + alpha) * up, sh[1] + Math.sin(base + alpha) * up];
    const ang = Math.atan2(target[1] - el[1], target[0] - el[0]);
    return [el, [el[0] + Math.cos(ang) * lo, el[1] + Math.sin(ang) * lo]];
  }

  function joints(p) {
    const front = p.v === 'front', mir = front && !p.raw ? -1 : 1;
    const t = p.t * RAD, u = [Math.sin(t), -Math.cos(t)], pp = [Math.cos(t), Math.sin(t)];
    const hw = front ? 7 : 0, sw = front ? 12 : 0;
    const J = { hip: [0, 0] };
    J.neck = [u[0] * L.torso * p.ts, u[1] * L.torso * p.ts];
    J.head = [J.neck[0] + u[0] * L.neck, J.neck[1] + u[1] * L.neck];
    J.lhip = [pp[0] * hw, pp[1] * hw];
    J.rhip = [-pp[0] * hw, -pp[1] * hw];
    const dn = front ? [-u[0] * 3, -u[1] * 3] : [0, 0];
    J.lsh = add(add(J.neck, [pp[0] * sw, pp[1] * sw]), dn);
    J.rsh = add(add(J.neck, [-pp[0] * sw, -pp[1] * sw]), dn);
    J.lknee = seg(J.lhip, p.l[0], L.thigh * p.th);
    J.lank = seg(J.lknee, p.l[1], L.shin);
    J.rknee = seg(J.rhip, p.r[0] * mir, L.thigh * p.th);
    J.rank = seg(J.rknee, p.r[1] * mir, L.shin);
    if (front) {
      J.ltoe = [J.lank[0] + 5, J.lank[1] + 1];
      J.rtoe = [J.rank[0] - 5, J.rank[1] + 1];
    } else {
      J.ltoe = seg(J.lank, p.l[1] + 90 + p.lf, L.foot);
      J.rtoe = seg(J.rank, p.r[1] + 90 + p.rf, L.foot);
    }
    if (p.lhT) { [J.lel, J.lhand] = ik(J.lsh, p.lhT, L.ua, L.fa, p.lb || 1); }
    else { J.lel = seg(J.lsh, p.la[0], L.ua * p.us); J.lhand = seg(J.lel, p.la[1], L.fa); }
    if (p.rhT) { [J.rel, J.rhand] = ik(J.rsh, p.rhT, L.ua, L.fa, p.rb || -1); }
    else { J.rel = seg(J.rsh, p.ra[0] * mir, L.ua * p.us); J.rhand = seg(J.rel, p.ra[1] * mir, L.fa); }
    J.chand = [(J.lhand[0] + J.rhand[0]) / 2, (J.lhand[1] + J.rhand[1]) / 2];
    return J;
  }

  const mapJ = (J, f) => { const o = {}; for (const k in J) o[k] = f(J[k]); return o; };

  function lerpPose(a, b, k) {
    const o = {};
    for (const key in b) {
      const va = a[key], vb = b[key];
      if (typeof vb === 'number' && typeof va === 'number') o[key] = va + (vb - va) * k;
      else if (Array.isArray(vb) && Array.isArray(va)) o[key] = vb.map((x, i) => va[i] + (x - va[i]) * k);
      else o[key] = k < 0.5 ? va : vb;
    }
    return o;
  }

  /* Prepara una figura: anclaje, posiciones de mundo y viewBox estable. */
  function prepare(spec) {
    if (spec._prep) return spec._prep;
    const frames = spec.frames.map(norm);
    const anchor = spec.anchor || 'lank';
    const rel0 = joints(frames[0]);
    let maxY = -1e9;
    for (const k in rel0) maxY = Math.max(maxY, rel0[k][1] + (k === 'head' ? L.head : 0));
    const dy = spec.fix != null ? -spec.fix : -maxY - (spec.lift || 0);
    const aW = [rel0[anchor][0], rel0[anchor][1] + dy];
    const world = (p) => {
      const J = joints(p);
      const a = J[anchor];
      return mapJ(J, (pt) => [pt[0] - a[0] + aW[0] + p.ox, pt[1] - a[1] + aW[1] + p.oy]);
    };
    const W = frames.map(world);
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = 0;
    const grow = (pt, r = 0) => { x0 = Math.min(x0, pt[0] - r); x1 = Math.max(x1, pt[0] + r); y0 = Math.min(y0, pt[1] - r); y1 = Math.max(y1, pt[1] + r); };
    W.forEach((J) => { for (const k in J) grow(J[k], k === 'head' ? L.head + 2 : 4); });
    (spec.props || []).forEach((pr) => propBox(pr, W, grow));
    const pad = 12;
    x0 -= pad; x1 += pad; y0 -= pad; y1 = Math.max(y1, 0) + 8;
    let w = x1 - x0, h = y1 - y0;
    const AR = 1.45;
    if (w / h < AR) { const nw = h * AR; x0 -= (nw - w) / 2; w = nw; }
    else { const nh = w / AR; y0 -= nh - h; h = nh; }
    spec._prep = { frames, world, W, vb: [x0, y0, w, h] };
    return spec._prep;
  }

  function resolveAt(pr, W) {
    const J = W[pr.f || 0];
    const p = J[pr.at] || [0, 0];
    return [p[0] + (pr.dx || 0), p[1] + (pr.dy || 0)];
  }

  function propBox(pr, W, grow) {
    if (pr.k === 'cable' || pr.k === 'band' && pr.from) { const a = resolveAt(pr.from, W); grow(a, 6); grow([a[0], 0]); }
    if (pr.k === 'post') { const a = resolveAt(pr, W); grow([a[0], -95]); grow([a[0], 0]); }
    if (pr.k === 'wall') { const a = resolveAt(pr, W); grow([a[0] - 4, -100]); }
    if (pr.k === 'bench' || pr.k === 'box') { const a = resolveAt(pr, W); const w = pr.w || 40; grow([a[0] - w / 2, a[1]]); grow([a[0] + w / 2, 0]); }
    if (pr.k === 'seat') { const J = W[0]; grow([J.hip[0] - 22, J.hip[1]]); grow([J.hip[0] + 16, 0]); }
    if (pr.k === 'bike') { const J = W[0]; grow([J.hip[0] - 20, 0]); grow([J.hip[0] + 70, J.hip[1] - 30]); }
  }

  const f1 = (n) => Math.round(n * 10) / 10;
  const line = (a, b, cls, w) => `<line x1="${f1(a[0])}" y1="${f1(a[1])}" x2="${f1(b[0])}" y2="${f1(b[1])}" class="${cls}"${w ? ` stroke-width="${w}"` : ''}/>`;
  const poly = (pts, cls, w) => `<polyline points="${pts.map((p) => f1(p[0]) + ',' + f1(p[1])).join(' ')}" class="${cls}"${w ? ` stroke-width="${w}"` : ''}/>`;

  function kbShape(p) {
    const c = [p[0], p[1] + 9];
    return `<path d="M${f1(c[0] - 4)} ${f1(c[1] - 6)} q4 -7 8 0" class="fg-prop-line" fill="none"/>` +
      `<circle cx="${f1(c[0])}" cy="${f1(c[1])}" r="6.5" class="fg-kb"/>`;
  }
  function dbShape(p) {
    return `<rect x="${f1(p[0] - 9)}" y="${f1(p[1] - 1.6)}" width="18" height="3.2" rx="1" class="fg-iron"/>` +
      `<rect x="${f1(p[0] - 10)}" y="${f1(p[1] - 5)}" width="4" height="10" rx="1" class="fg-iron"/>` +
      `<rect x="${f1(p[0] + 6)}" y="${f1(p[1] - 5)}" width="4" height="10" rx="1" class="fg-iron"/>`;
  }

  function drawProps(spec, prep, J, layer) {
    let s = '';
    const W = prep.W;
    for (const pr of spec.props || []) {
      const back = !['kb', 'db', 'plate', 'band', 'roll', 'slider', 'platform'].includes(pr.k);
      if ((layer === 'back') !== back) continue;
      if (pr.k === 'bench' || pr.k === 'box') {
        const a = resolveAt(pr, W), w = pr.w || 40;
        if (pr.k === 'box') s += `<rect x="${f1(a[0] - w / 2)}" y="${f1(a[1])}" width="${w}" height="${f1(-a[1])}" rx="2" class="fg-box"/>`;
        else s += `<rect x="${f1(a[0] - w / 2)}" y="${f1(a[1])}" width="${w}" height="5" rx="2" class="fg-pad"/>` +
          line([a[0] - w / 2 + 5, a[1] + 5], [a[0] - w / 2 + 5, 0], 'fg-prop-line') + line([a[0] + w / 2 - 5, a[1] + 5], [a[0] + w / 2 - 5, 0], 'fg-prop-line');
      } else if (pr.k === 'seat') {
        const J0 = W[0], h = J0.hip, n = J0.neck;
        const vx = n[0] - h[0], vy = n[1] - h[1], len = Math.hypot(vx, vy);
        const bx = -vy / len * -7, by = vx / len * -7;
        s += `<rect x="${f1(h[0] - 18)}" y="${f1(h[1] + 3)}" width="30" height="5" rx="2" class="fg-pad"/>` + line([h[0] - 4, h[1] + 8], [h[0] - 4, 0], 'fg-prop-line');
        if (pr.back !== false) s += line([h[0] + bx - vx * 0.05, h[1] + by - vy * 0.05], [h[0] + bx + vx * 0.95, h[1] + by + vy * 0.95], 'fg-pad-line');
      } else if (pr.k === 'wall') {
        const a = resolveAt(pr, W);
        s += `<rect x="${f1(a[0] - 6)}" y="${f1(prep.vb[1])}" width="6" height="${f1(-prep.vb[1])}" class="fg-wall"/>`;
      } else if (pr.k === 'post') {
        const a = resolveAt(pr, W);
        s += line([a[0], -95], [a[0], 0], 'fg-prop-line', 3);
      } else if (pr.k === 'cable') {
        const a = resolveAt(pr.from, W), to = J[pr.to];
        s += line([a[0], prep.vb[1] + 4], [a[0], 0], 'fg-prop-line', 3) + `<circle cx="${f1(a[0])}" cy="${f1(a[1])}" r="3" class="fg-iron"/>` + line(a, to, 'fg-cable');
      } else if (pr.k === 'bike') {
        const h = W[0].hip;
        s += line([h[0], h[1] + 4], [h[0] + 22, -18], 'fg-prop-line', 3) + line([h[0] + 22, -18], [h[0] + 50, -18], 'fg-prop-line', 3) +
          line([h[0] + 50, -18], [h[0] + 46, h[1] - 6], 'fg-prop-line', 3) + line([h[0] - 8, h[1] + 3], [h[0] + 6, h[1] + 3], 'fg-pad-line') +
          `<circle cx="${f1(h[0] + 22)}" cy="-18" r="8" class="fg-wheel"/>` + line([h[0] + 30, 0], [h[0] + 58, 0], 'fg-prop-line', 3) + line([h[0] + 50, -18], [h[0] + 50, 0], 'fg-prop-line', 3);
      } else if (pr.k === 'kb') {
        const hs = pr.h === 'frame' ? [J._kbh || 'c'] : pr.h === 'both' ? ['l', 'r'] : [pr.h || 'c'];
        hs.forEach((h) => { s += kbShape(J[h + 'hand']); });
      } else if (pr.k === 'db') {
        (pr.h === 'both' ? ['l', 'r'] : [pr.h || 'l']).forEach((h) => { s += dbShape(J[h + 'hand']); });
      } else if (pr.k === 'plate') {
        const a = J[pr.at || 'lhand'];
        s += `<circle cx="${f1(a[0] + (pr.dx || 0))}" cy="${f1(a[1] + (pr.dy || 0))}" r="${pr.r || 11}" class="fg-plate"/>`;
      } else if (pr.k === 'band') {
        if (pr.from) {
          const a = resolveAt(pr.from, W), b = J[pr.to];
          s += line([a[0], -95], [a[0], 0], 'fg-prop-line', 3) + line(a, b, 'fg-band') + `<circle cx="${f1(b[0])}" cy="${f1(b[1])}" r="4" class="fg-band-ring"/>`;
        } else s += line(J[pr.a], J[pr.b], 'fg-band');
      } else if (pr.k === 'roll') {
        const a = J[pr.at || 'lank'];
        s += `<circle cx="${f1(a[0] + (pr.dx || 0))}" cy="${f1(a[1] + (pr.dy ?? -6))}" r="5" class="fg-pad"/>`;
      } else if (pr.k === 'slider') {
        const a = J[pr.at || 'lank'];
        s += `<rect x="${f1(a[0] - 6)}" y="-3" width="12" height="3" rx="1.5" class="fg-iron"/>`;
      } else if (pr.k === 'platform') {
        const a = J[pr.at || 'lank'], n = pr.ang * RAD;
        const nx = Math.sin(n), ny = Math.cos(n), px = -ny, py = nx;
        const c = [a[0] + nx * 4, a[1] + ny * 4];
        s += line([c[0] - px * 18, c[1] - py * 18], [c[0] + px * 18, c[1] + py * 18], 'fg-pad-line');
      }
    }
    return s;
  }

  function drawGuides(spec, prep, J) {
    let s = '';
    for (const g of spec.guides || []) {
      if (g.k === 'v') {
        const a = (g.live ? J : prep.W[g.f || 0])[g.j];
        s += line([a[0], (g.top ?? a[1] - 60)], [a[0], 0], 'fg-guide');
      } else if (g.k === 'arrow') {
        const a = prep.W[0][g.j], b = prep.W[prep.W.length - 1][g.j];
        const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
        const bow = g.bow ?? 0.25, cx = mx - dy * bow, cy = my + dx * bow;
        const sx = (g.side || 1) * 0;
        const ox = g.ox || 0, oy = g.oy || 0;
        const tx = b[0] - cx, ty = b[1] - cy, tl = Math.hypot(tx, ty) || 1;
        const ux = tx / tl, uy = ty / tl;
        const e = [b[0] + ox, b[1] + oy];
        s += `<path d="M${f1(a[0] + ox)} ${f1(a[1] + oy)} Q${f1(cx + ox + sx)} ${f1(cy + oy)} ${f1(e[0])} ${f1(e[1])}" class="fg-arrow"/>` +
          `<path d="M${f1(e[0])} ${f1(e[1])} L${f1(e[0] - ux * 6 - uy * 3.5)} ${f1(e[1] - uy * 6 + ux * 3.5)} L${f1(e[0] - ux * 6 + uy * 3.5)} ${f1(e[1] - uy * 6 - ux * 3.5)} Z" class="fg-arrowhead"/>`;
        if (len < 3) s = '';
      }
    }
    return s;
  }

  function drawBody(J, front) {
    const far = 'fg-far', body = 'fg-body', left = 'fg-left';
    let s = '';
    s += poly([J.rsh, J.rel, J.rhand], front ? body : far, 4.2);
    s += poly([J.rhip, J.rknee, J.rank, J.rtoe], front ? body : far, 4.8);
    if (front) { s += line(J.lhip, J.rhip, body, 5); s += line(J.lsh, J.rsh, body, 5); }
    s += line(J.hip, J.neck, body, 6);
    s += poly([J.lhip, J.lknee, J.lank, J.ltoe], left, 5);
    s += `<circle cx="${f1(J.lknee[0])}" cy="${f1(J.lknee[1])}" r="2.4" class="fg-knee"/>`;
    s += `<circle cx="${f1(J.head[0])}" cy="${f1(J.head[1])}" r="${L.head}" class="fg-head"/>`;
    s += poly([J.lsh, J.lel, J.lhand], body, 4.2);
    return s;
  }

  function render(spec, pose) {
    const prep = prepare(spec);
    const J = prep.world(pose);
    if (pose.kbh) J._kbh = pose.kbh;
    const [x, y, w, h] = prep.vb;
    return `<rect x="${f1(x)}" y="0" width="${f1(w)}" height="${f1(y + h)}" class="fg-ground"/>` +
      line([x, 0], [x + w, 0], 'fg-groundline') +
      drawProps(spec, prep, J, 'back') + drawGuides(spec, prep, J) + drawBody(J, pose.v === 'front') + drawProps(spec, prep, J, 'front');
  }

  /* ---------- diagramas especiales (vista superior) ---------- */
  const CUSTOM = {
    ybal(k, o) {
      const dirs = [[0, -1, 'Anterior'], [-0.72, 0.7, 'Posteromedial'], [0.72, 0.7, 'Posterolateral']];
      return star(k, dirs, o, 'Pie de apoyo');
    },
    star(k, o) {
      const names = ['Ant.', 'Ant-lat', 'Lat.', 'Post-lat', 'Post.', 'Post-med', 'Med.', 'Ant-med'];
      const dirs = names.map((n, i) => { const a = (i * 45) * RAD; return [Math.sin(a), -Math.cos(a), n]; });
      return star(k, dirs, o, 'Apoyo');
    },
    pallof(k, o) {
      const ext = o.static ? 1 : (1 - Math.cos(k * Math.PI * 2)) / 2;
      const cx = 120, cy = 82;
      const hand = [cx, cy - 14 - ext * 30];
      let s = `<rect x="6" y="40" width="22" height="84" rx="3" class="fg-box"/><text x="17" y="134" class="fg-label" text-anchor="middle">Polea</text>`;
      s += line([28, 78], hand, 'fg-cable');
      s += `<ellipse cx="${cx}" cy="${cy}" rx="30" ry="11" class="fg-torso-top"/><circle cx="${cx}" cy="${cy}" r="9" class="fg-head"/>`;
      s += line([cx - 22, cy - 2], hand, 'fg-body', 4.2) + line([cx + 22, cy - 2], hand, 'fg-body', 4.2);
      s += `<circle cx="${f1(hand[0])}" cy="${f1(hand[1])}" r="3.5" class="fg-iron"/>`;
      s += `<path d="M${cx + 40} ${cy + 18} A 44 44 0 0 0 ${cx + 40} ${cy - 22}" class="fg-arrow fg-arrow-bad"/>`;
      s += `<text x="${cx + 52}" y="${cy + 2}" class="fg-label fg-bad">✕ no girar</text>`;
      s += `<text x="${cx}" y="${cy + 32}" class="fg-label" text-anchor="middle">${o.kneel ? 'Medio arrodillado · ' : ''}vista desde arriba</text>`;
      s += `<text x="${cx}" y="18" class="fg-label" text-anchor="middle">Empuja al frente · regresa lento</text>`;
      return { svg: s, vb: [0, 0, 220, 150] };
    },
    ankle(k, o) {
      const turn = (o.static ? 1 : (1 - Math.cos(k * Math.PI * 2)) / 2) * 24 * (o.dir === 'in' ? -1 : 1);
      const hx = 110, hy = 118;
      const foot = `<g transform="rotate(${f1(turn)} ${hx} ${hy})"><path d="M${hx - 13} ${hy} C ${hx - 18} ${hy - 40}, ${hx - 14} ${hy - 72}, ${hx} ${hy - 78} C ${hx + 14} ${hy - 72}, ${hx + 17} ${hy - 40}, ${hx + 12} ${hy} Z" class="fg-foot"/></g>`;
      const tip = [hx + Math.sin(turn * RAD) * 70, hy - Math.cos(turn * RAD) * 70];
      const anchorX = o.dir === 'in' ? 196 : 24;
      let s = line([anchorX, 30], [tip[0], tip[1] + 6], 'fg-band') + `<rect x="${anchorX - 4}" y="22" width="8" height="16" rx="2" class="fg-iron"/>` + foot;
      s += `<text x="110" y="142" class="fg-label" text-anchor="middle">Vista desde arriba · ${o.dir === 'in' ? 'inversión: hacia adentro' : 'eversión: hacia afuera'}</text>`;
      return { svg: s, vb: [0, 0, 220, 150] };
    }
  };

  function star(k, dirs, o, label) {
    const cx = 110, cy = 74, R = 52;
    const n = dirs.length;
    const pos = o.static ? n - 1 + 0.5 : k * n;
    const i = Math.floor(pos) % n, local = pos - Math.floor(pos);
    const reach = Math.sin(local * Math.PI);
    let s = '';
    dirs.forEach((d, j) => {
      const end = [cx + d[0] * R, cy + d[1] * R];
      s += line([cx, cy], end, j === i ? 'fg-tape fg-tape-on' : 'fg-tape');
      const lx = cx + d[0] * (R + 11), ly = cy + d[1] * (R + 11) + 3;
      s += `<text x="${f1(lx)}" y="${f1(ly)}" class="fg-label" text-anchor="middle">${d[2]}</text>`;
    });
    s += `<ellipse cx="${cx}" cy="${cy}" rx="6.5" ry="13" class="fg-foot fg-foot-stance"/>`;
    const d = dirs[i], p = [cx + d[0] * R * 0.92 * reach, cy + d[1] * R * 0.92 * reach];
    if (!o.static || true) s += `<circle cx="${f1(p[0])}" cy="${f1(p[1])}" r="5" class="fg-reach"/>`;
    s += `<text x="${cx}" y="154" class="fg-label" text-anchor="middle">${label}: izquierdo · toca con la punta y regresa</text>`;
    return { svg: s, vb: [0, 0, 220, 160] };
  }

  const ease = (x) => 0.5 - Math.cos(x * Math.PI) / 2;

  function svgWrap(inner, vb, cls) {
    return `<svg class="fig ${cls || ''}" viewBox="${vb.map(f1).join(' ')}" preserveAspectRatio="xMidYMid meet" role="img" aria-hidden="true">${inner}</svg>`;
  }

  /* Imagen estática de un keyframe. */
  function staticSVG(spec, i, cls) {
    if (spec.custom) { const c = CUSTOM[spec.custom](0, Object.assign({ static: true }, spec.opt)); return svgWrap(c.svg, c.vb, cls); }
    const prep = prepare(spec);
    const idx = i == null ? prep.frames.length - 1 : Math.min(i, prep.frames.length - 1);
    return svgWrap(render(spec, prep.frames[idx]), prep.vb, cls);
  }

  /* Anima la figura dentro de `el`. Devuelve una función para detenerla. */
  function animate(el, spec) {
    let raf = 0, t0 = performance.now(), stopped = false;
    if (spec.custom) {
      const period = spec.custom === 'ybal' ? 4800 : spec.custom === 'star' ? 9600 : 3000;
      const tick = (now) => {
        if (stopped) return;
        const k = ((((now - t0) % period) + period) % period) / period;
        const c = CUSTOM[spec.custom](k, spec.opt || {});
        el.innerHTML = svgWrap(c.svg, c.vb, 'fig-anim');
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return () => { stopped = true; cancelAnimationFrame(raf); };
    }
    const prep = prepare(spec);
    const fr = prep.frames;
    if (fr.length < 2) { el.innerHTML = staticSVG(spec, 0, 'fig-anim'); return () => {}; }
    const seq = fr.map((_, i) => i);
    for (let i = fr.length - 2; i > 0; i--) seq.push(i);
    const MOVE = spec.speed || (fr.length > 3 ? 1000 : 1300), HOLD = 550, STEP = MOVE + HOLD;
    const total = seq.length * STEP;
    el.innerHTML = svgWrap('', prep.vb, 'fig-anim');
    const svg = el.firstChild;
    const tick = (now) => {
      if (stopped) return;
      const t = (((now - t0) % total) + total) % total;
      const idx = Math.floor(t / STEP), within = t - idx * STEP;
      const a = fr[seq[idx]], b = fr[seq[(idx + 1) % seq.length]];
      const k = within < HOLD ? 0 : ease((within - HOLD) / MOVE);
      svg.innerHTML = render(spec, lerpPose(a, b, k));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { stopped = true; cancelAnimationFrame(raf); };
  }

  function frameCount(spec) { return spec.custom ? 1 : spec.frames.length; }

  window.FIG = { staticSVG, animate, frameCount };
})();
