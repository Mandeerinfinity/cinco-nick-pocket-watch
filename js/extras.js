'use strict';
/* Flagship extras: portrait, hologram, ID card, JARVIS, vitals, missions, briefing, protocols, Gerald, secret codes. */
(() => {
  const C = window.CINCO, S = C.S, W = C.W, $ = id => document.getElementById(id), pad = n => String(n).padStart(2, '0'), pick = C.pick, TAU = Math.PI * 2;
  const vis = id => !$('p-' + id).hidden;
  const qs = new URLSearchParams(location.search);
  S.protocol = ''; S.holo = false;

  /* ---------- portrait ---------- */
  function drawPortrait() {
    const pv = $('pt-prev'), x = pv.getContext('2d'); x.clearRect(0, 0, 240, 300); x.drawImage(Photo.get(S.photoStyle, 240, 300), 0, 0);
    $('pt-styles').querySelectorAll('button').forEach(b => { b.setAttribute('aria-pressed', b.dataset.st === S.photoStyle); });
    const h = $('holo-cv'); if (h) { const hx = h.getContext('2d'); hx.clearRect(0, 0, 300, 375); hx.drawImage(Photo.get('holo', 300, 375), 0, 0); }
  }
  function buildStyles() {
    $('pt-styles').innerHTML = Photo.STYLES.map(([k, n]) => '<button data-st="' + k + '" aria-pressed="false"><canvas width="44" height="55" style="display:block;margin:0 auto 4px;border-radius:8px;width:44px;height:55px"></canvas>' + n + '</button>').join('');
    $('pt-styles').querySelectorAll('button').forEach(b => { b.onclick = () => setStyle(b.dataset.st); });
    paintThumbs();
  }
  function paintThumbs() { $('pt-styles').querySelectorAll('button').forEach(b => { const x = b.firstChild.getContext('2d'); x.drawImage(Photo.get(b.dataset.st, 44, 55), 0, 0); }); }
  function setStyle(st) {
    S.photoStyle = st; Render.setPhotoStyle(st); C.drawNow(); if (!S.stylesTried.includes(st)) S.stylesTried.push(st); if (S.stylesTried.length >= 5) C.unlock('filter'); C.save(); drawPortrait(); C.haptic();
  }
  Photo.onChange(() => { paintThumbs(); drawPortrait(); });
  buildStyles(); drawPortrait();
  $('pt-change').onclick = () => $('pt-file').click();
  $('pt-file').onchange = e => { const f = e.target.files[0]; if (!f) return; Photo.setFromFile(f).then(saved => { C.unlock('photo'); C.toast(saved ? 'New portrait set, Sir. It stays on this device, and only on this device.' : 'New portrait set for this session. Storage is full, so it will not survive a restart.'); }).catch(() => C.toast('That image would not open, Sir. Gerald suspects a conspiracy.')); e.target.value = ''; };
  $('pt-reset').onclick = () => Photo.reset().then(() => C.toast('Original CINCO portrait restored.'));

  /* ---------- ID card ---------- */
  function idCard() {
    C.modal('CINCO Identity Card', '<div class="idcard"><div class="id-top"><b>CINCO CORPORATION</b><span>IDENTITY · LEVEL FIVE</span></div><div class="id-body"><div class="id-ph"><canvas id="id-ph" width="240" height="300"></canvas><i class="id-scanline"></i></div><dl class="id-info"><dt>Name</dt><dd>NICHOLAS “NICK”</dd><dt>Title</dt><dd>Sir (honorary)</dd><dt>ID No.</dt><dd>5-5-5-5-5</dd><dt>Clearance</dt><dd>Level Five (Lunch)</dd><dt>Issued by</dt><dd>Gerald (reluctantly)</dd><dt>Valid until</dt><dd>Eventually</dd></dl></div><div class="id-bar"></div><div class="id-holo"></div><div class="id-stamp">IDENTITY VERIFIED</div></div><div class="row-btns" style="margin-top:10px"><button id="id-scan" class="pri">Re-verify identity</button></div><div class="fine" id="id-log" aria-live="polite" style="min-height:5em"></div>');
    $('id-ph').getContext('2d').drawImage(Photo.get('original', 240, 300), 0, 0); C.unlock('idcard');
    $('id-scan').onclick = () => {
      const L = ['Scanning…', 'Hair: magnificent. All of it accounted for.', 'Eyes: blue-green. Quite arresting, Sir.', 'Moustache: acknowledged. Beard: approved by committee.', 'Smile: pending, but the potential is noted.', 'Identity: NICK. Confirmed.', 'Gerald: declines. Then approves. Then declines. Final ruling: VERIFIED.'];
      $('id-log').textContent = ''; $('id-scan').disabled = true; Snd.whoosh(); let i = 0;
      const iv = setInterval(() => { if (!$('id-log')) { clearInterval(iv); return; } $('id-log').innerHTML += L[i] + '<br>'; Snd.chirp(); C.haptic(); i++; if (i >= L.length) { clearInterval(iv); $('id-scan').disabled = false; C.say('Identity verified, Nick. Gerald declined, then approved.'); } }, 650);
    };
  }
  $('b-id').onclick = idCard;

  /* ---------- hologram ---------- */
  const HT = () => ['SUBJECT: NICK · IDENTITY VERIFIED', 'CHRONO-FWIP 5000 · SYNC OK', 'GERALD: PRESENT (RECTANGULAR)', 'HAIR: MAGNIFICENT · 100%', 'RES ' + Math.round(W.reserve * 100) + '% · ' + (W.dead ? 'STOPPED' : 'RUNNING'), 'TIME, NOW WITH MORE TIME.™'];
  let htI = 0, htT = 0;
  function holo(on) {
    if (on === undefined) on = !S.holo; S.holo = on; const h = $('holo');
    if (on) { if (S.mode !== 'analog') C.setMode('analog'); if (!S.lid) C.setLid(true); h.hidden = false; h.classList.remove('off'); void h.offsetWidth; h.classList.add('on'); Snd.whoosh(); C.haptic('med'); C.unlock('holo'); drawPortrait(); C.say('Projecting, Sir.'); }
    else { h.classList.remove('on'); h.classList.add('off'); setTimeout(() => { if (!S.holo) h.hidden = true; }, 520); }
    $('q-holo').setAttribute('aria-pressed', on); $('q-holo').textContent = on ? 'Hologram off' : 'Hologram';
  }
  C.holo = holo; $('q-holo').onclick = () => holo();
  $('holo').addEventListener('click', () => holo(false));

  /* ---------- JARVIS ---------- */
  const jlog = $('jv-log');
  function addMsg(who, text) { const d = document.createElement('div'); d.className = 'msg ' + who; d.textContent = text; jlog.appendChild(d); while (jlog.children.length > 40) jlog.firstChild.remove(); jlog.scrollTop = jlog.scrollHeight; }
  function send(text) { if (!text.trim()) return; addMsg('me', text); const t = document.createElement('div'); t.className = 'msg jv typing'; t.textContent = '…'; jlog.appendChild(t); jlog.scrollTop = jlog.scrollHeight; Snd.chirp();
    JV.ask(text).then(r => { t.remove(); addMsg('jv', r); if (S.speak) Voice.say(r, { rate: 0.95, pitch: 0.85 }); }); }
  const h0 = new Date().getHours();
  addMsg('jv', (h0 < 12 ? 'Good morning' : h0 < 18 ? 'Good afternoon' : 'Good evening') + ', Nick. J.A.R.V.I.S. at your service. Ask me the time, the weather, for a joke, a reminder, or a CINCO fact, Sir.');
  const CH = ['What time is it?', 'Weather', 'Tell me a joke', 'CINCO fact', 'Daily briefing', 'Project the hologram', 'Remind me to stretch in 1 minute', 'Set a timer for 5 minutes', 'Sunrise and sunset', 'Who is Gerald?', 'Recall notice'];
  $('jv-chips').innerHTML = CH.map(c => '<button type="button">' + c + '</button>').join('');
  $('jv-chips').querySelectorAll('button').forEach(b => b.onclick = () => send(b.textContent));
  $('jv-form').onsubmit = e => { e.preventDefault(); const v = $('jv-in').value; $('jv-in').value = ''; send(v); };
  $('jv-speak').checked = !!S.speak; $('jv-speak').onchange = e => { S.speak = e.target.checked; C.save(); if (S.speak) Voice.say('Very good, Sir. I shall speak.', { pitch: 0.85 }); };
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  $('jv-mic').onclick = () => {
    if (!SR) { addMsg('jv', 'Your browser does not offer speech recognition, Sir. Typing is a perfectly civilised alternative.'); return; }
    try { const r = new SR(); r.lang = 'en-GB'; r.interimResults = false; $('jv-mic').textContent = '…'; r.onresult = e => send(e.results[0][0].transcript); r.onend = () => { $('jv-mic').textContent = '🎙'; }; r.onerror = () => { $('jv-mic').textContent = '🎙'; addMsg('jv', 'I could not hear you, Sir. Microphone permission, perhaps.'); }; r.start(); } catch (e) { addMsg('jv', 'The microphone declined, Sir.'); }
  };

  /* ---------- vitals: pulse, compass, sun ---------- */
  const ecg = $('ecg'), ex = ecg.getContext('2d'); let bpm = 0, measuring = 0, ecgT = 0, bpmShown = 70, bpmFlick = 0;
  const g = (t, mu, sg, a) => a * Math.exp(-Math.pow((t - mu) / sg, 2));
  function ecgY(ph) { return g(ph, .14, .03, .12) + g(ph, .265, .008, -.12) + g(ph, .29, .011, 1) + g(ph, .315, .01, -.28) + g(ph, .52, .045, .25); }
  function drawEcg(dt) {
    ecgT += dt; const b = (measuring ? 70 + 20 * Math.sin(ecgT * 3) : bpm || 70) / 60;
    ex.clearRect(0, 0, 600, 150); ex.fillStyle = '#04100c'; ex.fillRect(0, 0, 600, 150);
    ex.strokeStyle = 'rgba(125,255,208,.12)'; ex.lineWidth = 1; for (let i = 0; i < 600; i += 30) { ex.beginPath(); ex.moveTo(i, 0); ex.lineTo(i, 150); ex.stroke(); } for (let j = 0; j < 150; j += 30) { ex.beginPath(); ex.moveTo(0, j); ex.lineTo(600, j); ex.stroke(); }
    ex.strokeStyle = '#7dffd0'; ex.lineWidth = 2.5; ex.beginPath();
    for (let i = 0; i < 600; i += 3) { const t = ecgT - (600 - i) / 120; let ph = (t * b) % 1; if (ph < 0) ph += 1; const y = 110 - ecgY(ph) * 85 + (measuring ? (Math.random() - .5) * 6 : 0); i ? ex.lineTo(i, y) : ex.moveTo(i, y); }
    ex.stroke();
  }
  $('b-pulse').onclick = () => {
    if (measuring) return; measuring = 1; Snd.ensure(); $('bpm').textContent = '…'; $('bpm-note').textContent = 'Reading vibes… hold still, Sir.'; C.haptic('med');
    const iv = setInterval(() => { Snd.tick(false, 1.4); C.haptic(); }, 700);
    setTimeout(() => { clearInterval(iv); measuring = 0; bpm = 58 + Math.floor(Math.random() * 40); $('bpm').textContent = bpm; bpmShown = bpm; $('bpm-note').textContent = pick(['Resting. Suspiciously resting.', 'Elevated. You glanced at the hotline queue.', 'Calm as Decaf Water.', 'Slightly elevated. Gerald is in the room.', 'Thrilled. Probably about time.', 'Strong, steady, and entirely fictional. Splendid.']) + ' (Entertainment only.)'; C.unlock('pulse'); Snd.fanfare(); }, 4200);
  };
  const rose = $('rose'); let heading = null, simH = 0, lastH = -99, compassOn = false;
  function onCompass(e) { const h = e.webkitCompassHeading != null ? e.webkitCompassHeading : (e.absolute && e.alpha != null ? (360 - e.alpha) % 360 : null); if (h != null) heading = h; }
  function enableCompass() {
    const D = window.DeviceOrientationEvent; compassOn = true;
    const go = () => { addEventListener('deviceorientationabsolute', onCompass); addEventListener('deviceorientation', onCompass); };
    if (D && typeof D.requestPermission === 'function') D.requestPermission().then(r => { if (r === 'granted') go(); else $('hdg-note').textContent = 'Permission declined. Gerald respects this, and will guess north.'; }).catch(() => { }); else go();
  }
  $('b-compass').onclick = () => { enableCompass(); C.unlock('compass'); };
  const DIRS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  function updCompass(now) {
    let h = heading; if (h == null) { h = (20 + 30 * Math.sin(now / 3000) + 8 * Math.sin(now / 770) + 360) % 360; $('hdg-note').textContent = 'No compass sensor in use. Heading is Gerald’s sense of direction (simulated).'; } else $('hdg-note').textContent = 'Live heading from your device. Tilt flat for best results.';
    if (Math.abs(h - lastH) > .6) { lastH = h; rose.style.transform = 'rotate(' + (-h).toFixed(1) + 'deg)'; $('hdg').textContent = Math.round(h) + '° ' + DIRS[Math.round(h / 22.5) % 16]; }
  }
  const sunC = $('sun'), sx = sunC.getContext('2d');
  const fm = d => JV.fmt(d);
  function drawSun() {
    const L = S.loc, T = JV.sunTimes(new Date(), L.lat, L.lon), now = Date.now();
    sx.clearRect(0, 0, 600, 260); const sky = sx.createLinearGradient(0, 0, 0, 220); const up = T.rise && now > +T.rise && now < +T.set;
    sky.addColorStop(0, up ? '#1b4a8f' : '#070b24'); sky.addColorStop(1, up ? '#f0b46a' : '#1a1f45'); sx.fillStyle = sky; sx.fillRect(0, 0, 600, 220);
    sx.fillStyle = '#0a0e14'; sx.fillRect(0, 220, 600, 40); sx.strokeStyle = 'rgba(255,255,255,.35)'; sx.setLineDash([4, 8]); sx.beginPath(); sx.ellipse(300, 220, 250, 170, 0, Math.PI, 0); sx.stroke(); sx.setLineDash([]);
    if (T.rise) { const f = Math.max(-.25, Math.min(1.25, (now - T.rise) / (T.set - T.rise))), a = Math.PI * (1 - f), px = 300 + 250 * Math.cos(a), py = 220 - 170 * Math.sin(a);
      if (f >= 0 && f <= 1) { const gl = sx.createRadialGradient(px, py, 4, px, py, 40); gl.addColorStop(0, 'rgba(255,230,140,.9)'); gl.addColorStop(1, 'rgba(255,200,80,0)'); sx.fillStyle = gl; sx.beginPath(); sx.arc(px, py, 40, 0, TAU); sx.fill(); sx.fillStyle = '#ffe9a0'; } else sx.fillStyle = '#c8d4ff'; sx.beginPath(); sx.arc(px, Math.min(py, 236), 14, 0, TAU); sx.fill();
      sx.fillStyle = '#f3e7cf'; sx.font = '700 22px Rajdhani, sans-serif'; sx.textAlign = 'left'; sx.fillText('↑ ' + fm(T.rise), 12, 250); sx.textAlign = 'right'; sx.fillText('↓ ' + fm(T.set), 588, 250); sx.textAlign = 'center'; sx.fillText(up ? 'Sun is up' : 'Sun is down', 300, 250); }
    if (T.rise) { const len = (T.set - T.rise) / 36e5; $('sun-info').innerHTML = '<dt>Sunrise</dt><dd>' + fm(T.rise) + '</dd><dt>Solar noon</dt><dd>' + fm(T.noon) + '</dd><dt>Sunset</dt><dd>' + fm(T.set) + '</dd><dt>Daylight</dt><dd>' + Math.floor(len) + ' h ' + Math.round((len % 1) * 60) + ' min</dd><dt>Location</dt><dd>' + L.name + '</dd>'; }
  }
  $('b-loc').onclick = () => { if (!navigator.geolocation) { $('wx-line').textContent = 'No geolocation here, Sir. Chicago it remains.'; return; } navigator.geolocation.getCurrentPosition(p => { S.loc = { lat: +p.coords.latitude.toFixed(3), lon: +p.coords.longitude.toFixed(3), name: 'Your location' }; C.save(); drawSun(); $('wx-line').textContent = 'Location set (kept on this device). Weather is fetched on request.'; }, () => { $('wx-line').textContent = 'Location permission declined. Gerald respects this. Chicago it remains.'; }, { timeout: 8000 }); };
  $('b-wx').onclick = () => { $('wx-line').textContent = 'Consulting the clouds…'; JV.weather(true).then(w => { $('wx-line').textContent = JV.wxText(w); }).catch(() => { $('wx-line').textContent = 'Could not reach the weather, Sir. Offline, or the clouds are being private.'; }); };

  /* ---------- missions ---------- */
  const until = at => { const s = Math.round((at - Date.now()) / 1000); if (s <= 0) return 'now'; const d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60); return 'in ' + (d ? d + ' d ' : '') + (h ? h + ' h ' : '') + (m || (!d && !h) ? m + ' min' : '').trim(); };
  const nextMission = () => S.missions.filter(m => !m.done && m.at > Date.now() - 60000).sort((a, b) => a.at - b.at)[0];
  function addMission(title, at, rem) { S.missions.push({ id: Date.now() + Math.random(), title: title.slice(0, 60), at, done: false, fired: false, rem: !!rem }); C.save(); renderMissions(); C.unlock('mission'); }
  function renderMissions() {
    const L = S.missions.slice().sort((a, b) => a.at - b.at);
    $('ms-list').innerHTML = L.length ? L.map(m => '<li><span>' + (m.done ? '✔ ' : m.rem ? '🔔 ' : '🎯 ') + m.title.replace(/[<>&]/g, '') + '<br><small class="fine">' + new Date(m.at).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) + '</small></span><span><button data-d="' + m.id + '">' + (m.done ? 'Undo' : 'Done') + '</button> <button data-r="' + m.id + '" aria-label="Delete">✕</button></span></li>').join('') : '<li><span>No missions. A rare and suspicious calm.</span></li>';
    $('ms-list').querySelectorAll('[data-d]').forEach(b => b.onclick = () => { const m = S.missions.find(x => x.id == b.dataset.d); m.done = !m.done; C.save(); renderMissions(); if (m.done) { Snd.fanfare(); C.toast('Mission accomplished, Sir. Gerald is neither impressed nor surprised.'); } });
    $('ms-list').querySelectorAll('[data-r]').forEach(b => b.onclick = () => { S.missions = S.missions.filter(x => x.id != b.dataset.r); C.save(); renderMissions(); });
  }
  function updMain() { const n = nextMission(); if (!n) { $('ms-main').innerHTML = '<small>NEXT MISSION</small><div class="big-mono">--:--:--</div><div class="fine">Nothing planned.</div>'; return; } const s = Math.max(0, Math.floor((n.at - Date.now()) / 1000)); $('ms-main').innerHTML = '<small>NEXT MISSION · ' + n.title.replace(/[<>&]/g, '') + '</small><div class="big-mono">T–' + pad(Math.floor(s / 86400) * 24 + Math.floor(s % 86400 / 3600)) + ':' + pad(Math.floor(s % 3600 / 60)) + ':' + pad(s % 60) + '</div>'; }
  const dt0 = new Date(Date.now() + 3600e3); dt0.setMinutes(dt0.getMinutes() - dt0.getTimezoneOffset()); $('ms-when').value = dt0.toISOString().slice(0, 16);
  $('ms-add').onclick = () => { const t = $('ms-title').value.trim() || 'Unnamed mission (Gerald approves)', w = $('ms-when').value; if (!w) return; const at = new Date(w).getTime(); if (!(at > Date.now())) { C.toast('That time has already happened, Sir. CINCO cannot plan the past, only regret it.'); return; } addMission(t, at); $('ms-title').value = ''; C.toast('Mission planned: <b>' + t.replace(/[<>&]/g, '') + '</b> ' + until(at) + '. Good luck, Sir.'); };
  C.addMission = addMission; C.nextMission = nextMission; C.until = until; renderMissions();

  /* ---------- briefing + quip ---------- */
  const doy = () => Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 864e5);
  $('quip').textContent = D.quips[doy() % D.quips.length];
  function moonName(ms) { const p = ((((ms - Date.UTC(2000, 0, 6, 18, 14)) / 864e5) / 29.530588853) % 1 + 1) % 1; return ['New moon', 'Waxing crescent', 'First quarter', 'Waxing gibbous', 'Full moon', 'Waning gibbous', 'Last quarter', 'Waning crescent'][Math.round(p * 8) % 8]; }
  function briefing() {
    const d = C.dispDate(), h = d.getHours(), L = S.loc, T = JV.sunTimes(new Date(), L.lat, L.lon), nm = nextMission(), r = D.recalls[doy() % D.recalls.length];
    const rows = ['<p><b>' + (h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening') + ', Nick.</b> It is ' + C.fmtTime(d) + ' on ' + d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }) + (S.friday ? ' (Friday, by decree)' : '') + '.</p>',
      '<p id="br-wx">🌦️ Weather: fetching…</p>',
      '<p>🌅 ' + (T.rise ? 'Sunrise ' + fm(T.rise) + ', sunset ' + fm(T.set) + '.' : 'The sun has declined to commit.') + ' 🌙 ' + moonName(Date.now()) + ' (probably ours).</p>',
      '<p>🎯 ' + (nm ? 'Next mission: <b>' + nm.title.replace(/[<>&]/g, '') + '</b> ' + until(nm.at) + '.' : 'No missions planned. A rare and suspicious calm.') + '</p>',
      '<p>⚙️ Power reserve ' + Math.round(W.reserve * 100) + '%. ' + (W.reserve < .2 ? 'Do wind me, Sir.' : 'Adequate.') + '</p>',
      '<p>⚠️ Recall of the day: <i>' + r[0] + '</i>. ' + r[1] + '</p>',
      '<p>💬 <i>' + D.quips[doy() % D.quips.length] + '</i></p>', '<p class="fine">Gerald’s mood today: rectangular.</p>'];
    C.modal('Daily Briefing', rows.join('') + '<div class="row-btns"><button id="br-read" class="pri">Read aloud</button></div>');
    JV.weather().then(w => { const e = $('br-wx'); if (e) e.textContent = '🌦️ ' + JV.wxText(w); }).catch(() => { const e = $('br-wx'); if (e) e.textContent = '🌦️ Weather unavailable (offline, or the clouds are private).'; });
    $('br-read').onclick = () => Voice.say(document.getElementById('modal-body').innerText.replace(/Read aloud/, ''), { rate: 0.95, pitch: 0.85 });
    C.unlock('brief');
  }
  C.briefing = briefing; $('b-brief').onclick = briefing;

  /* ---------- protocols ---------- */
  const ov = $('ov'), cf = $('confetti'), cx = cf.getContext('2d'); let parts = [], cfUntil = 0, cfEmit = 0, redIv = 0, savedP = null;
  function sizeCf() { cf.width = innerWidth; cf.height = innerHeight; } sizeCf(); addEventListener('resize', sizeCf);
  function burst(n) { const cols = ['#ff5a8a', '#ffd35a', '#5fd8ff', '#7dffd0', '#b58aff', '#ff9a4a']; for (let i = 0; i < n; i++) parts.push({ x: innerWidth / 2 + (Math.random() - .5) * 120, y: innerHeight * 0.35, vx: (Math.random() - .5) * 700, vy: -300 - Math.random() * 500, r: Math.random() * TAU, vr: (Math.random() - .5) * 14, c: cols[i % cols.length], w: 6 + Math.random() * 6, h: 3 + Math.random() * 5 }); if (parts.length > 260) parts.splice(0, parts.length - 260); }
  C.confetti = burst;
  const PN = { focus: 'FOCUS', winddown: 'WIND-DOWN', party: 'PARTY', stealth: 'STEALTH', red: 'RED ALERT' };
  function protOff(id) {
    if (!id) return; document.body.classList.remove('p-' + id); ov.className = 'ov'; clearInterval(redIv);
    if (id === 'stealth' && savedP) { S.haptics = savedP.h; S.voice = savedP.v; S.speak = savedP.s; Snd.setVolume(S.volume); }
    if (id === 'winddown' || id === 'focus') { Snd.setVolume(S.volume); Snd.setBus('tick', S.volTick); }
    if (id === 'party') cfUntil = 0;
    savedP = null;
  }
  function protocol(id) {
    const prev = S.protocol; protOff(prev); S.protocol = id || '';
    if (id) {
      document.body.classList.add('p-' + id); ov.className = 'ov ' + id; Snd.ensure();
      if (id === 'focus') { Snd.setBus('tick', S.volTick * 0.25); C.timerStart(1500); C.toast('<b>Focus protocol.</b> Quiet watch, 25-minute timer started. Gerald will pretend not to watch.'); C.say('Focus engaged, Sir. Twenty-five minutes. Do try.'); }
      if (id === 'winddown') { Snd.setVolume(S.volume * 0.4); C.toast('<b>Wind-Down.</b> Warm light, low volume. You have done enough, Sir. Gerald agrees, which is rare.'); C.say('Winding down, Sir. You have done quite enough.'); }
      if (id === 'party') { burst(160); cfUntil = performance.now() + 12000; Snd.fanfare(); C.haptic('heavy'); C.unlock('party'); C.toast('<b>Party protocol!</b> Gerald was invited and has declined, loudly.'); C.say('Party protocol, Sir. Do try to look surprised.'); }
      if (id === 'stealth') { savedP = { h: S.haptics, v: S.voice, s: S.speak }; S.haptics = false; S.voice = false; S.speak = false; Snd.setVolume(0); C.toast('<b>Stealth.</b> Silent, dark and slightly smug.'); }
      if (id === 'red') { C.unlock('red'); const go = () => { Snd.klaxon(); C.haptic('heavy'); }; go(); redIv = setInterval(go, 2400); C.toast('<b>RED ALERT.</b> Reason: unclear.'); C.say('Red alert, Sir. Reason: unclear. Nevertheless, I am alarmed.'); }
      if (!S.protsTried.includes(id)) S.protsTried.push(id); if (S.protsTried.length >= 5) C.unlock('protocols');
    }
    $('prot-pill').hidden = !id; $('prot-name').textContent = id ? PN[id] + ' PROTOCOL' : '';
    $('prot-status').textContent = id ? PN[id] + ' protocol active.' : 'No protocol active. Business as usual, Sir.';
    renderProtocols(); C.save();
  }
  C.protocol = protocol; $('prot-off').onclick = () => protocol('');
  function renderProtocols() {
    $('protocols').innerHTML = D.protocols.map(([id, n, d]) => '<div class="svc"><h3>' + n + '</h3><p>' + d + '</p><button data-p="' + id + '" role="switch" aria-checked="' + (S.protocol === id) + '" class="' + (S.protocol === id ? 'on' : '') + '">' + (S.protocol === id ? 'Active · Stand down' : 'Engage') + '</button></div>').join('');
    $('protocols').querySelectorAll('button').forEach(b => b.onclick = () => protocol(S.protocol === b.dataset.p ? '' : b.dataset.p));
  }
  renderProtocols();
  function drawConfetti(dt, now) {
    if (now < cfUntil) { cfEmit += dt * 22; while (cfEmit >= 1) { cfEmit--; burst(1); parts[parts.length - 1].y = -10; parts[parts.length - 1].vy = 60; parts[parts.length - 1].vx = (Math.random() - .5) * 120; parts[parts.length - 1].x = Math.random() * innerWidth; } }
    if (!parts.length) { if (cfDirty) { cx.clearRect(0, 0, cf.width, cf.height); cfDirty = false; } return; }
    cfDirty = true; cx.clearRect(0, 0, cf.width, cf.height);
    for (let i = parts.length - 1; i >= 0; i--) { const p = parts[i]; p.vy += 900 * dt; p.vx *= 0.995; p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt; if (p.y > innerHeight + 20) { parts.splice(i, 1); continue; } cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r); cx.fillStyle = p.c; cx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); cx.restore(); }
  }
  let cfDirty = false;

  /* ---------- Gerald ---------- */
  const ger = $('gerald'); let gNext = performance.now() + (qs.has('gerald') ? 3000 : 70000 + Math.random() * 90000), gHide = 0;
  function gerald(force) {
    if (!ger.hidden) return; if (!force && (document.hidden || !$('modal').hidden || document.body.classList.contains('hypnotised'))) return;
    $('g-say').textContent = pick(D.geraldSays); ger.hidden = false; void ger.offsetWidth; ger.classList.add('in'); Snd.tone(110, 0, 0.5, 'sine', 0.12); C.haptic('med'); gHide = performance.now() + 5200;
    if (S.speak || S.voice) Voice.say($('g-say').textContent, { pitch: 0.6, rate: 0.85 });
  }
  function geraldAway() { ger.classList.remove('in'); gHide = 0; setTimeout(() => { if (!ger.classList.contains('in')) ger.hidden = true; }, 500); }
  ger.onclick = () => { C.unlock('gerald'); C.toast('You have been visited by Gerald. He declined to elaborate.'); geraldAway(); };
  C.gerald = gerald;
  const sb = document.createElement('button'); sb.textContent = 'Summon Gerald'; sb.onclick = () => { if (Math.random() < .5) gerald(true); else C.toast('Gerald has been summoned and has declined to appear. This is the same as appearing, legally.'); };
  $('b-recalls').after(sb);

  /* ---------- secret codes ---------- */
  const KON = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a']; let kb = [];
  function konami() { if (!S.aurora) { S.aurora = true; C.toast('<b>Secret finish unlocked: Chrono Aurora.</b> Thirty extra lives, none of them redeemable.'); } C.unlock('konami'); C.setFinish('aurora'); burst(120); Snd.fanfare(); C.save(); }
  addEventListener('keydown', e => { if (e.target.matches('input,textarea')) return; kb.push(e.key.toLowerCase()); kb = kb.slice(-10); if (kb.join() === KON.join()) konami(); });
  const cc = document.createElement('div'); cc.className = 'row-btns'; cc.innerHTML = '<input type="text" id="code-in" placeholder="Secret code?" aria-label="Secret code" maxlength="40"><button id="code-go">Enter code</button>';
  $('install-note').before(cc);
  $('code-go').onclick = () => { const v = $('code-in').value.toLowerCase().replace(/[^a-z]/g, ''); if (v === 'konami' || v === 'uuddlrlrba' || v === 'upupdowndownleftrightleftrightba') { konami(); } else C.toast('Code not recognised. Gerald is amused.'); $('code-in').value = ''; };

  /* ---------- tabs ---------- */
  const ALLT = ['watch', 'jarvis', 'vitals', 'missions', 'timers', 'world', 'protocols', 'cinco', 'hotline', 'awards', 'settings'];
  document.querySelectorAll('.tabs button').forEach(b => b.addEventListener('click', () => { if (!S.tabsSeen.includes(b.dataset.tab)) S.tabsSeen.push(b.dataset.tab); if (ALLT.every(t => S.tabsSeen.includes(t))) C.unlock('tabsall'); if (b.dataset.tab === 'vitals') { drawSun(); C.unlock('compass'); } if (b.dataset.tab === 'missions') updMain(); }));

  /* ---------- per-frame hook ---------- */
  let sec = 0, tourSec = 0, lastRes = -1;
  C.hooks.push((now, dt) => {
    if (vis('vitals')) { drawEcg(dt); updCompass(now); }
    drawConfetti(dt, now);
    if (gHide && now > gHide) geraldAway();
    if (now > gNext) { gNext = now + 70000 + Math.random() * 110000; gerald(false); }
    if (S.mode === 'analog' && (S.lid || S.skeleton) && !document.hidden) { tourSec += dt; if (tourSec > 20) C.unlock('tourb'); }
    if (S.holo) { htT += dt; if (htT > 2.6) { htT = 0; htI = (htI + 1) % 6; $('holo-txt').textContent = HT()[htI]; } }
    sec += dt; if (sec < 0.5) return; sec = 0;
    const res = Math.round(W.reserve * 200) / 2;
    if (S.hud && res !== lastRes) { lastRes = res; const e = $('hud-res'); e.setAttribute('stroke-dasharray', (W.reserve * 100).toFixed(1) + ' 100'); e.setAttribute('stroke', W.reserve < .15 ? '#ff5a3d' : '#7dffd0'); }
    const nm = nextMission(); let t = 'RES ' + Math.round(W.reserve * 100) + '%' + (bpm ? ' · ' + bpm + ' BPM' : '') + (S.protocol ? ' · ' + PN[S.protocol] : '');
    if (nm) { const s = Math.max(0, Math.floor((nm.at - Date.now()) / 1000)); t += ' · T–' + (s >= 3600 ? Math.floor(s / 3600) + 'h' + pad(Math.floor(s % 3600 / 60)) : pad(Math.floor(s / 60)) + ':' + pad(s % 60)); }
    if ($('hud-r').textContent !== t) $('hud-r').textContent = t;
    if (vis('vitals')) drawSun();
    if (vis('missions')) updMain();
    S.missions.forEach(m => { if (!m.done && !m.fired && m.at <= Date.now()) { m.fired = true; C.save(); C.ring((m.rem ? '🔔 REMINDER: ' : '🎯 MISSION: ') + m.title); } });
  });
  if (qs.has('holo')) setTimeout(() => holo(true), 800);
  if (qs.has('party')) protocol('party');
  Object.assign(C, { idCard, drawPortrait });
})();
