'use strict';
/* Portrait engine. The photo never leaves the device. Filters are plain canvas pixel work. */
const Photo = (() => {
  const KEY = 'cinco-nick-photo-v1';
  const STYLES = [['enamel', 'Enamel'], ['sepia', 'Daguerreotype'], ['holo', 'Hologram'], ['engraved', 'Engraved'], ['original', 'Original']];
  let img = null, isDefault = true, ver = 0, cache = {}, listeners = [];
  function srcRect(aspect) { // aspect = w/h of the wanted crop
    const W = img.naturalWidth, H = img.naturalHeight;
    if (isDefault) return [W * 0.087, H * 0.035, W * 0.868, H * 0.814];
    let h = H * 0.9, w = h * aspect; if (w > W) { w = W; h = w / aspect; }
    return [(W - w) / 2, Math.max(0, H * 0.04), w, h];
  }
  function base(w, h) {
    const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d');
    if (img) { const r = srcRect(w / h); x.drawImage(img, r[0], r[1], r[2], r[3], 0, 0, w, h); } else { x.fillStyle = '#3a2d1a'; x.fillRect(0, 0, w, h); x.fillStyle = '#e6c27a'; x.font = '700 ' + h * 0.5 + 'px Cinzel, serif'; x.textAlign = 'center'; x.fillText('N', w / 2, h * 0.65); }
    return c;
  }
  function vignette(x, w, h, col, a0, a1) { const g = x.createRadialGradient(w / 2, h * 0.45, h * 0.25, w / 2, h / 2, h * 0.72); g.addColorStop(0, 'rgba(' + col + ',' + a0 + ')'); g.addColorStop(1, 'rgba(' + col + ',' + a1 + ')'); x.fillStyle = g; x.fillRect(0, 0, w, h); }
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const lumAt = (d, i) => (d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114);
  function sobel(d, w, h) { const L = new Float32Array(w * h), E = new Float32Array(w * h); for (let i = 0; i < w * h; i++) L[i] = lumAt(d, i * 4); for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) { const i = y * w + x, gx = -L[i - w - 1] - 2 * L[i - 1] - L[i + w - 1] + L[i - w + 1] + 2 * L[i + 1] + L[i + w + 1], gy = -L[i - w - 1] - 2 * L[i - w] - L[i - w + 1] + L[i + w - 1] + 2 * L[i + w] + L[i + w + 1]; E[i] = Math.min(255, Math.hypot(gx, gy)); } return [L, E]; }
  function make(style, w, h) {
    seed = 7; const c = base(w, h), x = c.getContext('2d');
    if (style === 'original') return c;
    const id = x.getImageData(0, 0, w, h), d = id.data;
    if (style === 'enamel') {
      for (let i = 0; i < d.length; i += 4) { const l = lumAt(d, i); let r = l + (d[i] - l) * 1.12, g = l + (d[i + 1] - l) * 1.1, b = l + (d[i + 2] - l) * 1.05; r = (r - 128) * 1.06 + 134; g = (g - 128) * 1.06 + 130; b = (b - 128) * 1.06 + 122; d[i] = r; d[i + 1] = g; d[i + 2] = b; }
      x.putImageData(id, 0, 0); vignette(x, w, h, '60,35,8', 0, 0.5);
      x.globalCompositeOperation = 'soft-light'; x.fillStyle = 'rgba(255,214,150,.28)'; x.fillRect(0, 0, w, h); x.globalCompositeOperation = 'source-over';
      x.strokeStyle = 'rgba(80,50,10,.10)'; x.lineWidth = 1; for (let i = 0; i < 26; i++) { x.beginPath(); let px = rnd() * w, py = rnd() * h; x.moveTo(px, py); for (let j = 0; j < 5; j++) { px += (rnd() - .5) * 40; py += (rnd() - .5) * 40; x.lineTo(px, py); } x.stroke(); } // craquelure
    } else if (style === 'sepia') {
      for (let i = 0; i < d.length; i += 4) { let l = lumAt(d, i) / 255; l = Math.pow(l, 0.9) * 1.08; l += (rnd() - .5) * 0.07; l = Math.max(0, Math.min(1, l)); d[i] = 28 + l * 214; d[i + 1] = 20 + l * 198; d[i + 2] = 12 + l * 160 + l * l * 18; }
      x.putImageData(id, 0, 0); vignette(x, w, h, '20,12,4', 0, 0.65);
      x.strokeStyle = 'rgba(255,245,220,.16)'; for (let i = 0; i < 7; i++) { x.lineWidth = 0.8; const px = rnd() * w; x.beginPath(); x.moveTo(px, 0); x.lineTo(px + (rnd() - .5) * 8, h); x.stroke(); }
      x.strokeStyle = 'rgba(220,235,255,.18)'; x.lineWidth = 6; x.strokeRect(3, 3, w - 6, h - 6);
    } else if (style === 'holo') {
      const [L, E] = sobel(d, w, h);
      for (let i = 0; i < w * h; i++) { const y = (i / w) | 0, l = Math.pow(L[i] / 255, 1.5), e = Math.min(1, E[i] / 140), v = Math.min(1, l * 0.8 + e * 0.9), sc = (y % 3 === 0) ? 0.4 : 1; d[i * 4] = (4 + v * 90 + e * 120) * sc; d[i * 4 + 1] = (24 + v * 215) * sc; d[i * 4 + 2] = (48 + v * 205) * sc; d[i * 4 + 3] = 255; }
      x.putImageData(id, 0, 0);
    } else if (style === 'engraved') {
      const [L, E] = sobel(d, w, h);
      for (let y = 0; y < h; y++) for (let xx = 0; xx < w; xx++) { const i = y * w + xx, l = L[i] / 255, dark = Math.pow(1 - l, 1.15), ph = ((y + 1.6 * Math.sin(xx * 0.045 + y * 0.01)) % 3 + 3) % 3, ink = ph < dark * 3.1 + (E[i] > 70 ? 1.2 : 0); d[i * 4] = ink ? 44 : 246; d[i * 4 + 1] = ink ? 32 : 238; d[i * 4 + 2] = ink ? 22 : 214; d[i * 4 + 3] = 255; }
      x.putImageData(id, 0, 0);
    }
    return c;
  }
  function get(style, w, h) { const k = style + w + 'x' + h + ver; return cache[k] || (cache[k] = make(style, w, h)); }
  function load(src) { return new Promise(res => { const i = new Image(); i.onload = () => { img = i; ver++; cache = {}; res(true); listeners.forEach(f => f()); }; i.onerror = () => res(false); i.src = src; }); }
  function init() {
    let stored = null; try { stored = localStorage.getItem(KEY); } catch (e) { }
    isDefault = !stored;
    return load(stored || 'img/nick.jpg').then(ok => { if (!ok && stored) { isDefault = true; return load('img/nick.jpg'); } });
  }
  function setFromFile(file) {
    return new Promise((res, rej) => {
      const fr = new FileReader(); fr.onerror = () => rej(new Error('read')); fr.onload = () => {
        const i = new Image(); i.onerror = () => rej(new Error('image')); i.onload = () => {
          const sc = Math.min(1, 768 / i.naturalHeight), c = document.createElement('canvas'); c.width = Math.round(i.naturalWidth * sc); c.height = Math.round(i.naturalHeight * sc);
          c.getContext('2d').drawImage(i, 0, 0, c.width, c.height); const url = c.toDataURL('image/jpeg', 0.8);
          let saved = true; try { localStorage.setItem(KEY, url); } catch (e) { saved = false; }
          isDefault = false; load(url).then(() => res(saved));
        }; i.src = fr.result;
      }; fr.readAsDataURL(file);
    });
  }
  function reset() { try { localStorage.removeItem(KEY); } catch (e) { } isDefault = true; return load('img/nick.jpg'); }
  return { STYLES, init, get, setFromFile, reset, onChange: f => listeners.push(f), get isDefault() { return isDefault; } };
})();
