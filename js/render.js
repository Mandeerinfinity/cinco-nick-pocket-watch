'use strict';
/* Canvas renderer. Everything is drawn in a 1000×1000 virtual space centred on 0,0.
   Static parts (case, dial, plate, bridges, crystal, lid) are pre-rendered to offscreen canvases. */
const Render = (() => {
  const TAU = Math.PI * 2, rad = d => d * Math.PI / 180;
  let cv, ctx, lidF, lidB, px = 600, k = 0.6, F = null, finishKey = 'brass', PS = 'enamel', Q = 0;
  const L = {}; // layers
  const G = {}; // gear sprites
  const POS = { barrel: [-185, -150, 118], center: [0, 0, 80], third: [165, -140, 66], fourth: [205, 55, 60], esc: [150, 228, 42], bal: [0, 150, 76], fork: [84, 200], ap: [0, 150, 92], moon: [0, 295, 44], pr: [0, -215, 72], s9: [-215, 0, 82], s3: [215, 0, 82], day: [0, -145] };
  let dialInfo = { day: 'MON 12', moon: 0.5 };

  function mk(sz) { const c = document.createElement('canvas'); c.width = c.height = sz || px; const x = c.getContext('2d'); x.setTransform(c.width / 1000, 0, 0, c.width / 1000, c.width / 2, c.width / 2); return [c, x]; }
  function circle(x, cx, cy, r) { x.beginPath(); x.arc(cx, cy, r, 0, TAU); }
  function conic(x, a, cx, cy, stops) {
    if (x.createConicGradient) { const g = x.createConicGradient(a, cx || 0, cy || 0); stops.forEach((s, i) => g.addColorStop(i / (stops.length - 1), s)); return g; }
    const g = x.createLinearGradient(-500, -500, 500, 500); stops.forEach((s, i) => g.addColorStop(i / (stops.length - 1), s)); return g;
  }
  function metal(x, r, rot, c) {
    circle(x, 0, 0, r); x.fillStyle = conic(x, rot, 0, 0, [c[1], c[0], c[2], c[3], c[1], c[0], c[1], c[3], c[2], c[0], c[1]]); x.fill();
    const g = x.createRadialGradient(-r * .3, -r * .35, r * .1, 0, 0, r);
    g.addColorStop(0, 'rgba(255,255,255,.25)'); g.addColorStop(.6, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,0,0,.35)');
    circle(x, 0, 0, r); x.fillStyle = g; x.fill();
  }
  function textOnArc(x, str, r, startDeg, font, color, inside) {
    x.save(); x.font = font; x.fillStyle = color; x.textAlign = 'center'; x.textBaseline = 'middle';
    const total = x.measureText(str).width, dir = inside ? -1 : 1; let a = rad(startDeg) - dir * (total / r) / 2;
    for (const ch of str) { const w = x.measureText(ch).width; a += dir * (w / 2) / r; x.save(); x.rotate(a); x.translate(0, -r); if (inside) x.rotate(Math.PI); x.fillText(ch, 0, 0); x.restore(); a += dir * (w / 2) / r; }
    x.restore();
  }
  function engrave(x, fn) { // dark cut + light edge = engraved look
    x.save(); x.translate(-1.5, -1.5); fn('rgba(0,0,0,.55)'); x.restore();
    x.save(); x.translate(1.5, 1.5); fn('rgba(255,255,255,.45)'); x.restore();
    fn(null);
  }

  function weavePat(x) {
    const c = document.createElement('canvas'); c.width = c.height = 16; const g = c.getContext('2d');
    g.fillStyle = '#0d0f11'; g.fillRect(0, 0, 16, 16);
    [[0, 0], [8, 8]].forEach(([a, b]) => { const q = g.createLinearGradient(a, b, a + 8, b + 8); q.addColorStop(0, '#444b55'); q.addColorStop(.5, '#1d2127'); q.addColorStop(1, '#30363e'); g.fillStyle = q; g.fillRect(a, b, 8, 8); });
    [[8, 0], [0, 8]].forEach(([a, b]) => { const q = g.createLinearGradient(a, b + 8, a + 8, b); q.addColorStop(0, '#15181c'); q.addColorStop(.5, '#2b3037'); q.addColorStop(1, '#101215'); g.fillStyle = q; g.fillRect(a, b, 8, 8); });
    return x.createPattern(c, 'repeat');
  }
  function weaveRing(x, r0, r1, a) { x.save(); x.beginPath(); x.arc(0, 0, r1, 0, TAU); x.arc(0, 0, r0, 0, TAU, true); x.clip(); x.globalAlpha = a || .92; x.fillStyle = weavePat(x); x.fillRect(-500, -500, 1000, 1000); x.globalAlpha = 1; const g = x.createLinearGradient(-400, -400, 300, 300); g.addColorStop(0, 'rgba(255,255,255,.28)'); g.addColorStop(.4, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,0,0,.3)'); x.fillStyle = g; x.fillRect(-500, -500, 1000, 1000); x.restore(); }
  const CODES = ['MID', 'HNL', 'ANC', 'LAX', 'DEN', 'CHI', 'NYC', 'HAL', 'SAO', 'FEN', 'AZO', 'LON', 'PAR', 'CAI', 'MOW', 'DXB', 'KHI', 'DAC', 'BKK', 'SIN', 'TYO', 'SYD', 'NOU', 'AKL'];
  function bezel(x) {
    const local = Math.round(-new Date().getTimezoneOffset() / 60);
    x.save(); x.beginPath(); x.arc(0, 0, 467, 0, TAU); x.arc(0, 0, 445, 0, TAU, true); x.fillStyle = 'rgba(6,10,22,.9)'; x.fill();
    x.lineWidth = 1.5; x.strokeStyle = 'rgba(125,255,208,.55)';
    for (let i = 0; i < 48; i++) { const a = rad(i * 7.5 + 0.0); x.beginPath(); x.moveTo(Math.sin(a) * 446, -Math.cos(a) * 446); x.lineTo(Math.sin(a) * (i % 2 ? 451 : 455), -Math.cos(a) * (i % 2 ? 451 : 455)); x.stroke(); }
    x.textAlign = 'center'; x.textBaseline = 'middle';
    CODES.forEach((t, i) => { const off = i - 11; x.save(); x.rotate(rad((off - local) * 15)); x.translate(0, -457); x.fillStyle = off === local ? '#7dffd0' : '#e9dcc0'; x.font = '700 14px Orbitron, Cinzel, sans-serif'; x.fillText(t, 0, 0); x.restore(); });
    x.fillStyle = '#ff5a3d'; x.beginPath(); x.moveTo(-9, -470); x.lineTo(9, -470); x.lineTo(0, -450); x.closePath(); x.fill();
    x.restore();
  }
  function cameo(x, cx, cy, rx, ry) {
    x.save(); x.translate(cx, cy);
    x.beginPath(); x.ellipse(4, 6, rx + 12, ry + 12, 0, 0, TAU); x.fillStyle = 'rgba(0,0,0,.28)'; x.fill();
    x.beginPath(); x.ellipse(0, 0, rx + 12, ry + 12, 0, 0, TAU); const g = x.createLinearGradient(-rx, -ry, rx, ry); g.addColorStop(0, F.c[0]); g.addColorStop(.5, F.c[2]); g.addColorStop(1, F.c[3]); x.fillStyle = g; x.fill();
    for (let i = 0; i < 30; i++) { const a = i / 30 * TAU; circle(x, Math.cos(a) * (rx + 6), Math.sin(a) * (ry + 6), 2.6); x.fillStyle = F.c[0]; x.fill(); }
    x.beginPath(); x.ellipse(0, 0, rx + 1, ry + 1, 0, 0, TAU); x.lineWidth = 3; x.strokeStyle = F.c[4]; x.stroke();
    x.save(); x.beginPath(); x.ellipse(0, 0, rx, ry, 0, 0, TAU); x.clip();
    x.drawImage(Photo.get(PS, 300, 375), -rx, -ry, rx * 2, ry * 2);
    const gl = x.createLinearGradient(-rx, -ry, rx * .4, ry * .5); gl.addColorStop(0, 'rgba(255,255,255,.38)'); gl.addColorStop(.5, 'rgba(255,255,255,0)'); x.fillStyle = gl; x.fillRect(-rx, -ry, rx * 2, ry * 2);
    x.restore();
    x.fillStyle = F.ink; x.font = '700 11px Cinzel, Georgia, serif'; x.textAlign = 'center'; x.fillText('IDENTITY VERIFIED', 0, ry + 28);
    x.restore();
  }
  function cageSprite(col) {
    const r = 86, s = r * 2 + 16, sz = Math.round(s * k), c = document.createElement('canvas'); c.width = c.height = sz;
    const x = c.getContext('2d'); x.setTransform(sz / s, 0, 0, sz / s, sz / 2, sz / 2);
    circle(x, 0, 0, r); x.lineWidth = 8; x.strokeStyle = col[1]; x.stroke(); circle(x, 0, 0, r + 3); x.lineWidth = 2; x.strokeStyle = col[0]; x.stroke();
    x.lineWidth = 9; x.lineCap = 'round'; for (let i = 0; i < 3; i++) { const a = rad(i * 120 + 30); x.strokeStyle = col[1]; x.beginPath(); x.moveTo(0, 0); x.lineTo(Math.cos(a) * r, Math.sin(a) * r); x.stroke(); x.strokeStyle = col[0]; x.lineWidth = 2.5; x.beginPath(); x.moveTo(0, 0); x.lineTo(Math.cos(a) * r, Math.sin(a) * r); x.stroke(); x.lineWidth = 9; }
    const [ec, es] = gearSprite(20, 14, 0, ['#f4f6f8', '#c4cad2', '#6e757e'], true); x.drawImage(ec, 54 - es / 2, -es / 2, es, es);
    for (let i = 0; i < 3; i++) { const a = rad(i * 120 + 30); circle(x, Math.cos(a) * (r - 4), Math.sin(a) * (r - 4), 5); x.fillStyle = '#23409a'; x.fill(); }
    circle(x, 0, 0, 7); x.fillStyle = '#b3122e'; x.fill();
    return [c, s];
  }
  function spaced(x, str, y, sp) { let w = 0; for (const ch of str) w += x.measureText(ch).width + sp; let px = -w / 2 + sp / 2; for (const ch of str) { const cw = x.measureText(ch).width; x.fillText(ch, px + cw / 2, y); px += cw + sp; } }

  /* ---------- case ---------- */
  function drawCase() {
    const [c, x] = mk(); const p = F.c;
    const sh = x.createRadialGradient(10, 18, 440, 10, 18, 500); sh.addColorStop(0, 'rgba(0,0,0,.55)'); sh.addColorStop(1, 'rgba(0,0,0,0)');
    circle(x, 10, 18, 500); x.fillStyle = sh; x.fill();
    metal(x, 490, 0.3, p);
    x.save(); x.lineWidth = 2.2;
    for (let i = 0; i < 240; i++) { const a = i / 240 * TAU; x.strokeStyle = i % 2 ? 'rgba(0,0,0,.35)' : 'rgba(255,255,255,.35)'; x.beginPath(); x.moveTo(Math.cos(a) * 474, Math.sin(a) * 474); x.lineTo(Math.cos(a) * 489, Math.sin(a) * 489); x.stroke(); }
    x.restore();
    metal(x, 468, 2.1, [p[1], p[0], p[2], p[3], p[4]]);
    if (F.weave) weaveRing(x, 468, 490, .95);
    x.lineWidth = 3; circle(x, 0, 0, 467); x.strokeStyle = 'rgba(255,255,255,.4)'; x.stroke();
    circle(x, 0, 0, 444); x.lineWidth = 6; x.strokeStyle = p[4]; x.stroke();
    circle(x, 0, 0, 441); x.lineWidth = 2; x.strokeStyle = 'rgba(255,255,255,.35)'; x.stroke();
    bezel(x);
    L.case = c;
  }

  /* ---------- dial ---------- */
  function subdial(x, cx, cy, r, n, labels, title) {
    x.save(); x.translate(cx, cy);
    circle(x, 0, 0, r); x.fillStyle = 'rgba(0,0,0,.06)'; x.fill();
    x.lineWidth = 1; x.strokeStyle = F.ink; x.globalAlpha = .12;
    for (let i = 8; i < r; i += 5) { circle(x, 0, 0, i); x.stroke(); }
    x.globalAlpha = 1;
    circle(x, 0, 0, r); x.lineWidth = 3; x.strokeStyle = F.ink; x.stroke();
    for (let i = 0; i < n; i++) { const a = i / n * TAU, l = i % (n / 4 | 0) === 0 ? 14 : 7; x.lineWidth = l > 8 ? 3 : 1.5; x.beginPath(); x.moveTo(Math.sin(a) * (r - 4), -Math.cos(a) * (r - 4)); x.lineTo(Math.sin(a) * (r - 4 - l), -Math.cos(a) * (r - 4 - l)); x.stroke(); }
    x.fillStyle = F.ink; x.font = '600 17px Cinzel, Georgia, serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
    labels.forEach((t, i) => { const a = i / labels.length * TAU; x.fillText(t, Math.sin(a) * (r - 34), -Math.cos(a) * (r - 34)); });
    x.font = '700 12px Cinzel, Georgia, serif'; x.fillText(title, 0, r * 0.42);
    x.restore();
  }
  function moonPhaseWindow(x) {
    const [mx, my, mr] = POS.moon;
    x.save(); circle(x, mx, my, mr); x.clip();
    const sky = x.createRadialGradient(mx, my - 10, 4, mx, my, mr); sky.addColorStop(0, '#2a3f8f'); sky.addColorStop(1, '#0b1238');
    x.fillStyle = sky; x.fillRect(mx - mr, my - mr, mr * 2, mr * 2);
    x.fillStyle = '#fff6c8';
    [[-30, -14, 2], [26, -24, 1.6], [30, 18, 1.4], [-24, 22, 1.8], [8, -34, 1.2], [-8, 30, 1.1]].forEach(([a, b, r]) => { circle(x, mx + a, my + b, r); x.fill(); });
    // moon: phase 0 new, .5 full
    const ph = dialInfo.moon, R = 22, cx = mx, cy = my;
    circle(x, cx, cy, R); x.fillStyle = '#20264a'; x.fill();
    x.beginPath(); const waxing = ph < .5, f = Math.cos(ph * TAU); // f: 1 new → -1 full
    x.arc(cx, cy, R, -Math.PI / 2, Math.PI / 2, !waxing);
    x.ellipse(cx, cy, Math.abs(f) * R, R, 0, Math.PI / 2, -Math.PI / 2, (f > 0) === waxing ? true : false);
    const mg = x.createRadialGradient(cx - 6, cy - 6, 2, cx, cy, R); mg.addColorStop(0, '#fffbe2'); mg.addColorStop(1, '#e8cf7a');
    x.fillStyle = mg; x.fill();
    x.restore();
    circle(x, mx, my, mr); x.lineWidth = 5; x.strokeStyle = F.c[2]; x.stroke();
    circle(x, mx, my, mr - 3); x.lineWidth = 1.5; x.strokeStyle = 'rgba(255,255,255,.5)'; x.stroke();
  }
  function drawDial() {
    const [c, x] = mk(); const ink = F.ink;
    const g = x.createRadialGradient(-60, -80, 20, 0, 0, 440); g.addColorStop(0, F.dial[0]); g.addColorStop(1, F.dial[1]);
    circle(x, 0, 0, 438); x.fillStyle = g; x.fill();
    // rose-engine guilloché
    x.save(); circle(x, 0, 0, 300); x.clip(); x.lineWidth = 1; x.strokeStyle = ink; x.globalAlpha = .07;
    for (let i = 0; i < 90; i++) { const a = i / 90 * TAU; circle(x, Math.cos(a) * 120, Math.sin(a) * 120, 170); x.stroke(); }
    x.restore();
    // minute track (railroad)
    x.strokeStyle = ink; x.fillStyle = ink;
    circle(x, 0, 0, 420); x.lineWidth = 2; x.stroke(); circle(x, 0, 0, 398); x.lineWidth = 1.5; x.stroke();
    for (let i = 0; i < 60; i++) { const a = i / 60 * TAU, big = i % 5 === 0; x.lineWidth = big ? 5 : 1.6; x.beginPath(); x.moveTo(Math.sin(a) * 420, -Math.cos(a) * 420); x.lineTo(Math.sin(a) * (big ? 390 : 398), -Math.cos(a) * (big ? 390 : 398)); x.stroke(); }
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; circle(x, Math.sin(a) * 409, -Math.cos(a) * 409, 4.5); x.fillStyle = F.accent; x.fill(); }
    // Roman numerals (VI replaced by the moon)
    const R = ['XII', 'I', 'II', 'III', 'IIII', 'V', '', 'VII', 'VIII', 'IX', 'X', 'XI'];
    x.fillStyle = ink; x.textAlign = 'center'; x.textBaseline = 'middle';
    R.forEach((t, i) => { if (!t) return; const a = i / 12 * TAU; x.save(); x.translate(Math.sin(a) * 350, -Math.cos(a) * 350); x.font = '700 ' + (t.length > 3 ? 44 : 52) + 'px Cinzel, Georgia, serif'; x.scale(t.length > 3 ? .85 : 1, 1); x.fillText(t, 0, 2); x.restore(); });
    // power reserve
    const [prx, pry, prr] = POS.pr;
    x.save(); x.translate(prx, pry);
    x.lineWidth = 12; x.strokeStyle = 'rgba(0,0,0,.08)'; x.beginPath(); x.arc(0, 0, prr, rad(-150), rad(-30)); x.stroke();
    x.lineWidth = 12; x.strokeStyle = F.accent; x.beginPath(); x.arc(0, 0, prr, rad(-150), rad(-132)); x.stroke();
    x.strokeStyle = ink;
    for (let i = 0; i <= 10; i++) { const a = rad(-150 + i * 12); x.lineWidth = i % 5 ? 1.5 : 3.5; x.beginPath(); x.moveTo(Math.cos(a) * (prr + 8), Math.sin(a) * (prr + 8)); x.lineTo(Math.cos(a) * (prr + (i % 5 ? 16 : 22)), Math.sin(a) * (prr + (i % 5 ? 16 : 22))); x.stroke(); }
    x.font = '700 13px Cinzel, Georgia, serif'; x.fillStyle = ink;
    x.fillText('EMPTY', Math.cos(rad(-150)) * (prr + 10) - 6, Math.sin(rad(-150)) * (prr + 10) + 20);
    x.fillText('FULL', Math.cos(rad(-30)) * (prr + 10) + 4, Math.sin(rad(-30)) * (prr + 10) + 20);
    x.font = '700 11px Cinzel, Georgia, serif'; x.fillText('RÉSERVE DE MARCHE (ISH)', 0, 10);
    x.restore();
    // day window
    const [dx, dy] = POS.day;
    x.fillStyle = '#fffdf6'; x.fillRect(dx - 64, dy - 21, 128, 42);
    x.lineWidth = 4; x.strokeStyle = F.c[2]; x.strokeRect(dx - 64, dy - 21, 128, 42);
    x.fillStyle = 'rgba(0,0,0,.18)'; x.fillRect(dx - 62, dy - 19, 124, 5);
    x.fillStyle = dialInfo.friday ? '#a32416' : '#1a1209'; x.font = '700 26px Cinzel, Georgia, serif'; x.fillText(dialInfo.day, dx, dy + 3);
    // brand
    x.fillStyle = ink; x.font = '900 40px Cinzel, Georgia, serif'; x.fillText('CINCO', 0, -88);
    x.font = '700 12px Cinzel, Georgia, serif'; x.fillText('CHRONO-FWIP 5000 · NICK EDITION', 0, -60);
    x.font = '30px Vibes, cursive'; x.fillStyle = F.accent; x.fillText('Time, Now With More Time', 0, -33);
    cameo(x, -215, -2, 64, 80);
    subdial(x, POS.s3[0], POS.s3[1], POS.s3[2], 30, ['30', '', '', ''].map((t, i) => ['30', '7½', '15', '22½'][i]), 'CHRONO MIN');
    moonPhaseWindow(x);
    x.fillStyle = ink; x.font = '700 11px Cinzel, Georgia, serif'; x.fillText('MOON (PROBABLY OURS)', 0, 354);
    x.font = '700 10px Cinzel, Georgia, serif'; x.fillText('SWISS-ISH MADE · 5 JEWELS · ONE IS DECAF', 0, 376);
    // open-heart aperture
    const [ax, ay, ar] = POS.ap;
    x.save(); x.globalCompositeOperation = 'destination-out'; circle(x, ax, ay, ar); x.fill(); x.restore();
    circle(x, ax, ay, ar + 3); x.lineWidth = 8; x.strokeStyle = F.c[2]; x.stroke();
    circle(x, ax, ay, ar + 6); x.lineWidth = 2; x.strokeStyle = F.c[0]; x.stroke();
    // edge shade
    const e = x.createRadialGradient(0, 0, 400, 0, 0, 440); e.addColorStop(0, 'rgba(0,0,0,0)'); e.addColorStop(1, 'rgba(0,0,0,.28)');
    circle(x, 0, 0, 438); x.fillStyle = e; x.fill();
    L.dial = c;
    // skeleton chapter ring: just the outer ring of the dial
    const [c2, x2] = mk(); x2.drawImage(c, -500, -500, 1000, 1000);
    x2.globalCompositeOperation = 'destination-out'; circle(x2, 0, 0, 386); x2.fill();
    L.chapter = c2;
  }

  /* ---------- movement ---------- */
  function gearSprite(r, teeth, spokes, col, club) {
    const s = Math.ceil(r * 2 + 8), sz = Math.max(8, Math.round(s * k)), c = document.createElement('canvas'); c.width = c.height = sz;
    const x = c.getContext('2d'); x.setTransform(sz / s, 0, 0, sz / s, sz / 2, sz / 2);
    const th = r * 0.08 + 3; x.beginPath();
    for (let i = 0; i < teeth; i++) {
      const a0 = i / teeth * TAU, a1 = (i + .5) / teeth * TAU, w = TAU / teeth;
      x.lineTo(Math.cos(a0) * (r - th), Math.sin(a0) * (r - th));
      if (club) { x.lineTo(Math.cos(a0 + w * .15) * r, Math.sin(a0 + w * .15) * r); x.lineTo(Math.cos(a0 + w * .4) * (r - th * .4), Math.sin(a0 + w * .4) * (r - th * .4)); }
      else { x.lineTo(Math.cos(a0 + w * .12) * r, Math.sin(a0 + w * .12) * r); x.lineTo(Math.cos(a1 - w * .12) * r, Math.sin(a1 - w * .12) * r); x.lineTo(Math.cos(a1) * (r - th), Math.sin(a1) * (r - th)); }
    }
    x.closePath();
    const g = x.createLinearGradient(-r, -r, r, r); g.addColorStop(0, col[0]); g.addColorStop(.5, col[1]); g.addColorStop(1, col[2]);
    x.fillStyle = g; x.fill(); x.lineWidth = 1; x.strokeStyle = 'rgba(0,0,0,.4)'; x.stroke();
    if (spokes) { // cut windows between curved spokes
      x.save(); x.globalCompositeOperation = 'destination-out';
      const ri = r * .28, ro = r - th - r * .1;
      for (let i = 0; i < spokes; i++) { const a = i / spokes * TAU, w = TAU / spokes; x.beginPath(); x.arc(0, 0, ro, a + w * .16, a + w * .84); x.arc(0, 0, ri, a + w * .74, a + w * .26, true); x.closePath(); x.fill(); }
      x.restore();
      x.lineWidth = 2; x.strokeStyle = 'rgba(255,255,255,.35)'; circle(x, 0, 0, r - th - r * .1); x.stroke();
    }
    circle(x, 0, 0, Math.max(6, r * .16)); x.fillStyle = col[2]; x.fill();
    circle(x, 0, 0, Math.max(3, r * .07)); x.fillStyle = '#b3122e'; x.fill();
    return [c, s];
  }
  function balanceSprite(r, col) {
    const s = r * 2 + 30, sz = Math.round(s * k), c = document.createElement('canvas'); c.width = c.height = sz;
    const x = c.getContext('2d'); x.setTransform(sz / s, 0, 0, sz / s, sz / 2, sz / 2);
    circle(x, 0, 0, r); x.lineWidth = 10; x.strokeStyle = col[1]; x.stroke();
    circle(x, 0, 0, r + 4); x.lineWidth = 2; x.strokeStyle = col[0]; x.stroke();
    x.lineWidth = 6; x.strokeStyle = col[1];
    for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; x.beginPath(); x.moveTo(0, 0); x.lineTo(Math.cos(a) * r, Math.sin(a) * r); x.stroke(); }
    for (let i = 0; i < 14; i++) { const a = (i + .5) / 14 * TAU; circle(x, Math.cos(a) * (r + 7), Math.sin(a) * (r + 7), 4.5); x.fillStyle = i % 2 ? col[0] : '#2c4fb8'; x.fill(); }
    circle(x, 0, 0, 9); x.fillStyle = col[2]; x.fill(); circle(x, 0, 0, 4); x.fillStyle = '#b3122e'; x.fill();
    return [c, s];
  }
  function screw(x, cx, cy, r, a) { circle(x, cx, cy, r); x.fillStyle = '#23409a'; x.fill(); circle(x, cx - r * .3, cy - r * .3, r * .45); x.fillStyle = 'rgba(160,190,255,.6)'; x.fill(); x.save(); x.translate(cx, cy); x.rotate(a); x.fillStyle = '#0b1440'; x.fillRect(-r, -1.5, r * 2, 3); x.restore(); }
  function jewel(x, cx, cy, r) { circle(x, cx, cy, r + 3); x.fillStyle = F.c[0]; x.fill(); circle(x, cx, cy, r); x.fillStyle = '#9c0f2a'; x.fill(); circle(x, cx - r * .35, cy - r * .35, r * .35); x.fillStyle = '#ff9fb2'; x.fill(); }
  function bridge(x, pts, w) {
    const P = F.plate, stroke = (lw, col) => { x.lineWidth = lw; x.strokeStyle = col; x.lineCap = 'round'; x.lineJoin = 'round'; x.beginPath(); pts.forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); x.stroke(); };
    x.save(); x.translate(6, 8); stroke(w, 'rgba(0,0,0,.45)'); x.restore();
    stroke(w, P[1]); stroke(w - 6, P[0]); stroke(Math.max(2, w * .25), 'rgba(255,255,255,.35)');
    x.save(); x.globalAlpha = .18; x.lineWidth = 1; x.strokeStyle = '#fff';
    // côtes de Genève stripes, clipped to the bridge
    x.restore();
    stroke(2, 'rgba(255,255,255,.0)');
  }
  function drawMovement() {
    const P = F.plate;
    // backdrop + mainplate ring with perlage
    let [c, x] = mk();
    const b = x.createRadialGradient(0, 0, 50, 0, 0, 440); b.addColorStop(0, '#2b2218'); b.addColorStop(1, '#0c0905');
    circle(x, 0, 0, 438); x.fillStyle = b; x.fill();
    x.save(); circle(x, 0, 0, 438); x.clip();
    for (let rr = 40; rr < 440; rr += 26) for (let i = 0; i < rr / 4; i++) { const a = i / (rr / 4) * TAU + rr; const px_ = Math.cos(a) * rr, py = Math.sin(a) * rr; const pg = x.createRadialGradient(px_ - 4, py - 4, 1, px_, py, 16); pg.addColorStop(0, 'rgba(255,255,255,.10)'); pg.addColorStop(1, 'rgba(255,255,255,0)'); circle(x, px_, py, 16); x.fillStyle = pg; x.fill(); }
    x.restore();
    L.back = c;
    // bridges
    [c, x] = mk();
    x.save(); circle(x, 0, 0, 438); x.clip();
    x.lineWidth = 46; x.strokeStyle = P[1]; circle(x, 0, 0, 420); x.stroke(); x.lineWidth = 36; x.strokeStyle = P[0]; circle(x, 0, 0, 420); x.stroke();
    bridge(x, [[-410, -110], [-185, -150], [-60, -330]], 36);
    bridge(x, [[0, 0], [165, -140], [330, -250]], 26);
    bridge(x, [[205, 55], [400, 110]], 26);
    bridge(x, [[150, 228], [300, 300]], 24);
    bridge(x, [[0, 150], [-160, 330]], 30); // balance cock
    x.restore();
    textOnArc(x, 'CINCO CAL. FWIP-5 · FIVE JEWELS (ONE IS DECAF) · ADJUSTED TO GERALD · ', 420, 0, '700 14px Cinzel, Georgia, serif', 'rgba(0,0,0,.45)');
    jewel(x, -185, -150, 10); jewel(x, 165, -140, 7); jewel(x, 205, 55, 7); jewel(x, 150, 228, 6); jewel(x, 0, 150, 7); jewel(x, 0, 0, 9);
    [[-330, -125], [-110, -250], [270, -205], [330, 90], [250, 270], [-100, 255], [-400, 60], [60, -410]].forEach((p, i) => screw(x, p[0], p[1], 11, i * 1.3));
    L.bridges = c;
    const gc = [F.plate[0], F.c[1], F.c[3]], gold = ['#fff1c4', '#e2b65f', '#8a6224'];
    const gearCol = finishKey === 'silver' || finishKey === 'gunmetal' ? ['#f4f6f8', '#c4cad2', '#6e757e'] : finishKey === 'prism' ? ['#e9fbff', '#b597ff', '#5a3a8a'] : gold;
    G.barrel = gearSprite(118, 90, 0, gearCol);
    G.ratchet = gearSprite(84, 36, 0, ['#ffffff', '#cdd3da', '#7a828c']);
    G.center = gearSprite(80, 64, 5, gearCol);
    G.third = gearSprite(66, 52, 5, gearCol);
    G.fourth = gearSprite(60, 48, 5, gearCol);
    G.esc = gearSprite(42, 15, 5, ['#f4f6f8', '#c4cad2', '#6e757e'], true);
    G.balS = balanceSprite(33, gearCol); G.cage = cageSprite(gearCol);
    void gc;
  }
  function drawCrystal() {
    const [c, x] = mk();
    x.save(); circle(x, 0, 0, 440); x.clip();
    const g = x.createLinearGradient(-300, -400, 200, 300); g.addColorStop(0, 'rgba(255,255,255,.22)'); g.addColorStop(.35, 'rgba(255,255,255,.03)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.fillRect(-500, -500, 1000, 1000);
    const sg = x.createRadialGradient(0, 0, 330, 0, 0, 440); sg.addColorStop(0, 'rgba(110,160,255,0)'); sg.addColorStop(1, 'rgba(120,170,255,.2)'); x.fillStyle = sg; x.fillRect(-500, -500, 1000, 1000);
    x.lineWidth = 18; x.strokeStyle = 'rgba(255,255,255,.18)'; x.beginPath(); x.arc(0, 0, 400, rad(200), rad(250)); x.stroke();
    x.lineWidth = 6; x.strokeStyle = 'rgba(255,255,255,.25)'; x.beginPath(); x.arc(0, 0, 380, rad(20), rad(45)); x.stroke();
    x.restore();
    L.crystal = c;
  }

  /* ---------- lid ---------- */
  function drawLid() {
    const p = F.c;
    let x = lidF.getContext('2d'); lidF.width = lidF.height = px; x.setTransform(k, 0, 0, k, px / 2, px / 2);
    metal(x, 490, 0.9, p);
    x.save(); x.lineWidth = 2.2; for (let i = 0; i < 240; i++) { const a = i / 240 * TAU; x.strokeStyle = i % 2 ? 'rgba(0,0,0,.35)' : 'rgba(255,255,255,.35)'; x.beginPath(); x.moveTo(Math.cos(a) * 474, Math.sin(a) * 474); x.lineTo(Math.cos(a) * 489, Math.sin(a) * 489); x.stroke(); } x.restore();
    metal(x, 466, 2.4, [p[1], p[0], p[2], p[3], p[4]]);
    // engine-turned sunburst
    x.save(); circle(x, 0, 0, 430); x.clip(); x.lineWidth = 1.4;
    for (let i = 0; i < 360; i++) { const a = i / 360 * TAU; x.strokeStyle = i % 2 ? 'rgba(0,0,0,.18)' : 'rgba(255,255,255,.22)'; x.beginPath(); x.moveTo(Math.cos(a) * 170, Math.sin(a) * 170); x.lineTo(Math.cos(a) * 430, Math.sin(a) * 430); x.stroke(); }
    x.restore();
    circle(x, 0, 0, 432); x.lineWidth = 5; x.strokeStyle = p[3]; x.stroke();
    // scroll border
    x.save(); x.lineWidth = 3; for (let i = 0; i < 24; i++) { x.rotate(TAU / 24); engrave(x, col => { x.strokeStyle = col || p[3]; x.beginPath(); x.arc(0, -405, 16, rad(200), rad(520)); x.stroke(); }); } x.restore();
    // cartouche
    const cg = x.createRadialGradient(-30, -40, 10, 0, 0, 175); cg.addColorStop(0, p[0]); cg.addColorStop(1, p[2]);
    circle(x, 0, 0, 172); x.fillStyle = cg; x.fill();
    circle(x, 0, 0, 172); x.lineWidth = 6; x.strokeStyle = p[3]; x.stroke(); circle(x, 0, 0, 160); x.lineWidth = 2; x.stroke();
    x.textAlign = 'center'; x.textBaseline = 'middle';
    engrave(x, col => { x.fillStyle = col || p[3]; x.font = '230px Vibes, cursive'; x.fillText('N', -6, 18); });
    textOnArc(x, 'CINCO CORPORATION · EST. EVENTUALLY', 382, 0, '700 26px Cinzel, Georgia, serif', p[4]);
    textOnArc(x, 'TIME, NOW WITH MORE TIME.™', 382, 180, '700 26px Cinzel, Georgia, serif', p[4], true);
    if (F.weave) weaveRing(x, 0, 430, .5);
    x.font = '900 70px Orbitron, Cinzel, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillStyle = 'rgba(95,216,255,.28)'; spaced(x, 'NICK', 268, 26); x.fillStyle = p[4]; spaced(x, 'NICK', 266, 26);
    x.fillStyle = 'rgba(95,216,255,.85)'; x.fillRect(-120, 312, 240, 2.5); x.font = '700 14px Orbitron, sans-serif'; x.fillText('LASER-ENGRAVED · NICK EDITION · N°5', 0, 334);
    x.lineWidth = 1.5; x.strokeStyle = 'rgba(95,216,255,.5)'; x.setLineDash([3, 9]); circle(x, 0, 0, 196); x.stroke(); x.setLineDash([]);
    // inside of the lid
    x = lidB.getContext('2d'); lidB.width = lidB.height = px; x.setTransform(k, 0, 0, k, px / 2, px / 2);
    metal(x, 490, 4.0, p);
    const ig = x.createRadialGradient(40, 60, 30, 0, 0, 440); ig.addColorStop(0, p[0]); ig.addColorStop(.7, p[1]); ig.addColorStop(1, p[3]);
    circle(x, 0, 0, 440); x.fillStyle = ig; x.fill();
    x.textAlign = 'center'; x.textBaseline = 'middle';
    const orx = 150, ory = 188, ocy = -30;
    x.save(); x.translate(0, ocy);
    x.beginPath(); x.ellipse(5, 8, orx + 26, ory + 26, 0, 0, TAU); x.fillStyle = 'rgba(0,0,0,.3)'; x.fill();
    x.beginPath(); x.ellipse(0, 0, orx + 26, ory + 26, 0, 0, TAU); const og = x.createLinearGradient(-orx, -ory, orx, ory); og.addColorStop(0, p[0]); og.addColorStop(.5, p[2]); og.addColorStop(1, p[3]); x.fillStyle = og; x.fill();
    for (let i = 0; i < 44; i++) { const a = i / 44 * TAU; circle(x, Math.cos(a) * (orx + 13), Math.sin(a) * (ory + 13), 4.5); x.fillStyle = p[0]; x.fill(); }
    x.beginPath(); x.ellipse(0, 0, orx + 3, ory + 3, 0, 0, TAU); x.lineWidth = 5; x.strokeStyle = p[4]; x.stroke();
    x.save(); x.beginPath(); x.ellipse(0, 0, orx, ory, 0, 0, TAU); x.clip();
    x.drawImage(Photo.get(PS, 300, 375), -orx, -ory, orx * 2, ory * 2);
    const gl = x.createLinearGradient(-orx, -ory, orx * .5, ory * .4); gl.addColorStop(0, 'rgba(255,255,255,.4)'); gl.addColorStop(.5, 'rgba(255,255,255,0)'); x.fillStyle = gl; x.fillRect(-orx, -ory, orx * 2, ory * 2);
    x.restore(); x.restore();
    const lines = [['58px Vibes, cursive', 'For Nick,', -330], ['40px Vibes, cursive', 'Time, Now With More Time.™', 218], ['32px Vibes, cursive', 'If found, it is still Nick’s.', 270], ['700 20px Cinzel, Georgia, serif', 'CINCO CORPORATION · NICK POCKET WATCH', 335], ['700 13px Cinzel, Georgia, serif', 'WARRANTY VOID IF OPENED (YOU HAVE OPENED IT)', 375]];
    lines.forEach(([f, t, y]) => engrave(x, col => { x.font = f; x.fillStyle = col || p[4]; x.fillText(t, 0, y); }));
  }

  function build() { if (!F) return; drawCase(); drawDial(); drawMovement(); drawCrystal(); drawLid(); }

  /* ---------- hands ---------- */
  function breguet(x, len, ring, rr, w, col) {
    x.fillStyle = col; x.strokeStyle = col;
    x.beginPath(); x.moveTo(-w, 40); x.lineTo(-w * .45, -(ring - rr)); x.lineTo(w * .45, -(ring - rr)); x.lineTo(w, 40); x.closePath(); x.fill();
    x.lineWidth = rr * .45; circle(x, 0, -ring, rr * .78); x.stroke();
    x.beginPath(); x.moveTo(-w * .7, -(ring + rr * .9)); x.quadraticCurveTo(-w * 1.2, -(ring + (len - ring) * .55), 0, -len); x.quadraticCurveTo(w * 1.2, -(ring + (len - ring) * .55), w * .7, -(ring + rr * .9)); x.closePath(); x.fill();
    circle(x, 0, 0, w * 2.3); x.fill();
  }
  function secHand(x, col) {
    x.fillStyle = col; x.strokeStyle = col; x.lineWidth = 4; x.lineCap = 'round';
    x.beginPath(); x.moveTo(0, 90); x.lineTo(0, -395); x.stroke();
    circle(x, 0, 62, 15); x.fill(); circle(x, 0, 0, 10); x.fill();
  }
  function small(x, len, col, w) { x.strokeStyle = col; x.fillStyle = col; x.lineWidth = w || 4; x.lineCap = 'round'; x.beginPath(); x.moveTo(0, 12); x.lineTo(0, -len); x.stroke(); circle(x, 0, 0, 7); x.fill(); }
  function hand(fn, cx, cy, ang, sh) {
    ctx.save(); ctx.translate(cx + sh, cy + sh * 1.4); ctx.rotate(ang); fn(ctx, 'rgba(0,0,0,.28)'); ctx.restore();
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(ang); fn(ctx, null); ctx.restore();
  }
  function spr(s, cx, cy, ang) { const [c, size] = s; ctx.save(); ctx.translate(cx, cy); ctx.rotate(ang); ctx.drawImage(c, -size / 2, -size / 2, size, size); ctx.restore(); }

  function hairspring(cx, cy, ang, sc) {
    const br = 1 + Math.sin(ang) * 0.05; ctx.save(); ctx.translate(cx, cy); ctx.rotate(ang * 0.2);
    ctx.beginPath(); const turns = Q ? 4 : 7, n = Q ? 70 : 150; sc = sc || 1;
    for (let i = 0; i <= n; i++) { const t = i / n, a = t * turns * TAU, r = (10 + t * 44) * sc * (1 + (br - 1) * t); i ? ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r) : ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
    ctx.lineWidth = 1.6; ctx.strokeStyle = '#7f9ad8'; ctx.stroke(); ctx.restore();
  }
  function movementParts(s, full) {
    const [bx, by] = POS.bal, [ex, ey] = POS.esc, [fx, fy] = POS.fork;
    if (full) {
      spr(G.barrel, POS.barrel[0], POS.barrel[1], s.barrel);
      spr(G.ratchet, POS.barrel[0], POS.barrel[1], s.barrel * 3);
      spr(G.center, 0, 0, s.mAng);
      spr(G.third, POS.third[0], POS.third[1], -s.mAng * 7.5);
      spr(G.fourth, POS.fourth[0], POS.fourth[1], s.sAng);
    }
    spr(G.esc, ex, ey, s.esc);
    // pallet fork
    ctx.save(); ctx.translate(fx, fy); ctx.rotate(s.fork);
    ctx.strokeStyle = '#d7dce2'; ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-48, -30); ctx.lineTo(0, 0); ctx.lineTo(44, 4); ctx.moveTo(0, 0); ctx.lineTo(30, 38); ctx.stroke();
    ctx.fillStyle = '#c0123a'; ctx.fillRect(40, -2, 10, 12); ctx.fillRect(26, 36, 10, 12);
    circle(ctx, 0, 0, 6); ctx.fillStyle = '#9c0f2a'; ctx.fill(); ctx.restore();
    spr(G.cage, bx, by, s.tour || 0);
    hairspring(bx, by, s.bal, 0.55);
    spr(G.balS, bx, by, s.bal + (s.tour || 0));
  }

  /* ---------- frame ---------- */
  function frame(s) {
    ctx.setTransform(k, 0, 0, k, px / 2, px / 2);
    ctx.clearRect(-500, -500, 1000, 1000);
    ctx.drawImage(L.case, -500, -500, 1000, 1000);
    if (s.skeleton) {
      ctx.drawImage(L.back, -500, -500, 1000, 1000);
      movementParts(s, true);
      ctx.drawImage(L.bridges, -500, -500, 1000, 1000);
      ctx.drawImage(L.chapter, -500, -500, 1000, 1000);
    } else {
      const [ax, ay, ar] = POS.ap;
      ctx.save(); circle(ctx, ax, ay, ar + 2); ctx.clip();
      ctx.drawImage(L.back, -500, -500, 1000, 1000);
      movementParts(s, false);
      ctx.restore();
      ctx.drawImage(L.dial, -500, -500, 1000, 1000);
      // subdials + reserve
      const ac = F.accent, hc = F.hand;
      hand((x, c) => small(x, 62, c || ac, 4), POS.s3[0], POS.s3[1], s.chMin / 30 * TAU, 3);
      hand((x, c) => small(x, 62, c || ac, 5), POS.pr[0], POS.pr[1], rad(-60 + s.reserve * 120), 3);
    }
    const hc = F.hand;
    hand((x, c) => breguet(x, 232, 178, 24, 8, c || hc), 0, 0, s.hAng, 6);
    hand((x, c) => breguet(x, 350, 288, 17, 6, c || hc), 0, 0, s.mAng, 8);
    if (s.chOn) hand((x, c) => { x.strokeStyle = c || '#e2b65f'; x.lineWidth = 3; x.beginPath(); x.moveTo(0, 40); x.lineTo(0, -410); x.stroke(); x.fillStyle = c || '#e2b65f'; x.beginPath(); x.moveTo(-8, -380); x.lineTo(0, -412); x.lineTo(8, -380); x.fill(); }, 0, 0, s.chAng, 9);
    hand((x, c) => secHand(x, c || F.accent), 0, 0, s.secAng, 10);
    circle(ctx, 0, 0, 5); ctx.fillStyle = F.c[0]; ctx.fill();
    ctx.drawImage(L.crystal, -500, -500, 1000, 1000);
  }

  function init(c, lf, lb) { cv = c; ctx = c.getContext('2d'); lidF = lf; lidB = lb; }
  function resize(css) {
    const dpr = Math.min(2, window.devicePixelRatio || 1) * (Q >= 2 ? 0.65 : 1);
    px = Math.round(css * dpr); k = px / 1000; cv.width = cv.height = px; build();
  }
  function setFinish(key) { finishKey = key; F = D.finishes[key]; build(); }
  function setDialInfo(info) { dialInfo = info; if (F) drawDial(); }
  return { setPhotoStyle: v => { PS = v; build(); }, setQuality: v => { Q = v; }, init, resize, setFinish, setDialInfo, frame, rebuild: build };
})();
