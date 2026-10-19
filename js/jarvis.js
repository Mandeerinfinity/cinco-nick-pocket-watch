'use strict';
/* J.A.R.V.I.S.: a rule-based butler. Runs on-device. The only network call is optional weather from Open-Meteo, on request. */
const JV = (() => {
  const rad = Math.PI / 180, dayMs = 864e5, J1970 = 2440588, J2000 = 2451545;
  const toJ = d => d.valueOf() / dayMs - 0.5 + J1970, fromJ = j => new Date((j + 0.5 - J1970) * dayMs), toDays = d => toJ(d) - J2000;
  function sunTimes(date, lat, lng) {
    const e = rad * 23.4397, lw = rad * -lng, phi = rad * lat, d = toDays(date);
    const n = Math.round(d - 0.0009 - lw / (2 * Math.PI)), ds0 = 0.0009 + lw / (2 * Math.PI) + n;
    const M = rad * (357.5291 + 0.98560028 * ds0), C = rad * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M));
    const L = M + C + rad * 102.9372 + Math.PI, dec = Math.asin(Math.sin(e) * Math.sin(L));
    const Jnoon = J2000 + ds0 + 0.0053 * Math.sin(M) - 0.0069 * Math.sin(2 * L);
    const cosw = (Math.sin(-0.833 * rad) - Math.sin(phi) * Math.sin(dec)) / (Math.cos(phi) * Math.cos(dec));
    if (cosw > 1 || cosw < -1) return { noon: fromJ(Jnoon), rise: null, set: null };
    const w = Math.acos(cosw), a = 0.0009 + (w + lw) / (2 * Math.PI) + n, Jset = J2000 + a + 0.0053 * Math.sin(M) - 0.0069 * Math.sin(2 * L);
    return { noon: fromJ(Jnoon), rise: fromJ(Jnoon - (Jset - Jnoon)), set: fromJ(Jset) };
  }
  const NUM = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, fifteen: 15, twenty: 20, thirty: 30, forty: 40, sixty: 60, a: 1, an: 1, half: 0.5 };
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const fmt = d => d.toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true }).replace(/ ?([ap])m/i, (m, x) => ' ' + x.toUpperCase() + 'M');
  let wx = null, wxAt = 0;
  function weather(force) {
    const C = window.CINCO, L = C.S.loc, F = C.S.units === 'F';
    if (!force && wx && Date.now() - wxAt < 600000 && wx.u === C.S.units) return Promise.resolve(wx);
    if (!navigator.onLine) return Promise.reject(new Error('offline'));
    const url = 'https://api.open-meteo.com/v1/forecast?latitude=' + L.lat + '&longitude=' + L.lon + '&current=temperature_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1' + (F ? '&temperature_unit=fahrenheit&wind_speed_unit=mph' : '');
    return fetch(url).then(r => { if (!r.ok) throw new Error('http'); return r.json(); }).then(j => { wx = { u: C.S.units, t: Math.round(j.current.temperature_2m), code: j.current.weather_code, wind: Math.round(j.current.wind_speed_10m), hi: Math.round(j.daily.temperature_2m_max[0]), lo: Math.round(j.daily.temperature_2m_min[0]) }; wxAt = Date.now(); C.unlock('weather'); return wx; });
  }
  function wxText(w) { const C = window.CINCO, u = C.S.units === 'F' ? '°F' : '°C', sp = C.S.units === 'F' ? 'mph' : 'km/h', desc = D.wmo[w.code] || 'doing something meteorological'; return 'It is ' + w.t + u + ' and ' + desc + ' in ' + C.S.loc.name.replace(/ \(default\)/, '') + ', Sir. High ' + w.hi + ', low ' + w.lo + ', wind ' + w.wind + ' ' + sp + '.'; }
  function parseDur(txt) { const m = txt.match(/(\d+(?:\.\d+)?|[a-z]+)\s*(second|sec|minute|min|hour|hr)s?/); if (!m) return 0; const n = isNaN(m[1]) ? NUM[m[1]] : +m[1]; if (!n) return 0; return n * (/^(second|sec)/.test(m[2]) ? 1 : /^(minute|min)/.test(m[2]) ? 60 : 3600); }
  function ask(q0) {
    const C = window.CINCO, q = q0.toLowerCase().trim(), now = C.now();
    const has = re => re.test(q);
    C.unlock('jarvis');
    if (!q) return Promise.resolve('I am here, Sir. Silence is also a perfectly good question.');
    let m;
    if ((m = q.match(/remind me (?:to )?(.+?) (in .+|at .+)$/))) {
      let at = 0, what = m[1];
      if (m[2].startsWith('in')) at = Date.now() + parseDur(m[2]) * 1000;
      else { const t = m[2].match(/at (\d{1,2})(?::(\d{2}))?\s*(am|pm)?/); if (t) { let h = +t[1], mi = +(t[2] || 0); if (t[3] === 'pm' && h < 12) h += 12; if (t[3] === 'am' && h === 12) h = 0; const d = new Date(); d.setHours(h, mi, 0, 0); if (d <= Date.now()) d.setDate(d.getDate() + 1); at = d.getTime(); } }
      if (at > Date.now()) { C.addMission(what, at, true); return Promise.resolve('Very good, Sir. I shall remind you to ' + what + ' at ' + fmt(new Date(at)) + '. Whether you will listen is a separate matter.'); }
      return Promise.resolve('I could not make out when, Sir. Try “remind me to stretch in 10 minutes”.');
    }
    if (has(/(set|start).*(timer)|timer for/)) { const s = parseDur(q); if (s) { C.timerStart(s); return Promise.resolve('Timer set for ' + (s >= 3600 ? s / 3600 + ' hour(s)' : s >= 60 ? Math.round(s / 6) / 10 + ' minute(s)' : s + ' seconds') + ', Sir. I shall make a noise at the end.'); } return Promise.resolve('For how long, Sir? “Set a timer for five minutes”.'); }
    if (has(/\b(weather|temperature|forecast|raining|rain|outside|cold|warm)\b/)) return weather().then(wxText).catch(() => 'I could not reach the weather, Sir. Either you are offline or the clouds are being private.');
    if (has(/sunrise|sunset|dusk|dawn|daylight/)) { const L = C.S.loc, t = sunTimes(new Date(), L.lat, L.lon); return Promise.resolve(t.rise ? 'Sunrise is at ' + fmt(t.rise) + ' and sunset at ' + fmt(t.set) + ' in ' + L.name.replace(/ \(default\)/, '') + ', Sir. Daylight Saving Every Day would, of course, make this worse.' : 'The sun is declining to commit today, Sir.'); }
    if (has(/\b(brief|briefing|news|agenda|today.s plan)\b/)) { C.briefing(); return Promise.resolve('Your briefing, Sir. Do try to look surprised.'); }
    if (has(/\b(joke|funny|laugh|amuse)\b/)) return Promise.resolve(pick(D.jokes));
    if (has(/\b(fact|about cinco|tell me about)\b/) || has(/^cinco/)) return Promise.resolve(pick(D.facts));
    if (has(/gerald/)) return Promise.resolve(pick(['Gerald is a rectangle, Sir. A dignified one.', 'Gerald has already decided. I am not at liberty to say what.', 'Gerald is at lunch. It began some years ago and is going well.', 'I have asked Gerald for comment. Gerald declined to be asked.']));
    if (has(/decaf/)) return Promise.resolve('Decaf Water remains under review, Sir, on account of the water. Batch 44 was found to contain water.');
    if (has(/hotline|support|customer service|call/)) return Promise.resolve('The CINCO hotline is open to everyone and answered by no one, Sir. You are currently behind yourself in the queue. No number is dialled, naturally.');
    if (has(/\b(recall|recalled)\b/)) { const r = pick(D.recalls); return Promise.resolve('Recall notice: ' + r[0] + '. ' + r[1]); }
    if (has(/who am i|my name|about me|am i\b/)) return Promise.resolve('You are Nick, Sir. Identity verified, curls and all, and Gerald declined to dispute it.');
    if (has(/\b(reserve|wind|battery|power|spring)\b/)) { const r = Math.round(C.W.reserve * 100); return Promise.resolve('The power reserve stands at ' + r + '%, Sir. ' + (r < 15 ? 'I would suggest winding, before I stop talking mid-sen' : r > 80 ? 'Quite sufficient. Gerald is impressed, in his way.' : 'Adequate. A little winding would be gracious.')); }
    if (has(/\b(date|day|today|month|year)\b/) && !has(/mission/)) { const d = C.dispDate(); return Promise.resolve('Today is ' + d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) + ', Sir.' + (C.S.friday ? ' By decree, it is Friday.' : '')); }
    if (has(/\b(time|clock|hour|late)\b/)) { const d = C.dispDate(); return Promise.resolve('It is ' + fmt(d) + ', Sir. ' + pick(['Precisely, give or take Gerald.', 'Time, now with more time.', 'Reality concurs, for the moment.', 'You have, I regret to say, less of it than a minute ago.'])); }
    if (has(/\b(mission|missions|next)\b/)) { const n = C.nextMission(); return Promise.resolve(n ? 'Your next mission is “' + n.title + '”, ' + C.until(n.at) + ', Sir.' : 'No missions planned, Sir. A rare and suspicious calm.'); }
    if (has(/red alert/)) { C.protocol('red'); return Promise.resolve('Red Alert engaged, Sir. Reason: unclear. Nevertheless, I am alarmed.'); }
    if (has(/stand down|stop|cancel/) && C.S.protocol) { C.protocol(''); return Promise.resolve('Standing down, Sir. Everyone may relax.'); }
    for (const [id, re] of [['party', /party/], ['focus', /focus/], ['stealth', /stealth|quiet|silent/], ['winddown', /wind.?down|relax|sleep/]]) if (has(re)) { C.protocol(id); return Promise.resolve('Protocol: ' + id + ' engaged, Sir.'); }
    if (has(/hologram|projection|project/)) { C.holo(true); return Promise.resolve('Projecting, Sir. Do try to look dashing. It is a hologram, but it still has standards.'); }
    if (has(/open.*lid|lid/)) { C.setLid(true); return Promise.resolve('Lid opened, Sir. The miniature inside is looking splendid.'); }
    if (has(/thank/)) return Promise.resolve(pick(['Not at all, Sir.', 'A pleasure, Nick. Truly. I have no other hobbies.', 'Quite all right, Sir.']));
    if (has(/\b(hello|hi|hey|morning|evening|afternoon)\b/)) return Promise.resolve(pick(['Good day, Nick. How may I be of service?', 'At your service, Sir. Time, now with more time.', 'Hello, Sir. I have been waiting patiently. I have also been waiting impatiently, in parallel.']));
    if (has(/love|favou?rite|best/)) return Promise.resolve('That is very kind, Sir. I shall pretend I have feelings and quietly enjoy it.');
    if (has(/what can you do|help|\?$/)) return Promise.resolve('I can tell you the time, date, weather, sunrise, set timers and reminders, tell jokes and CINCO facts, brief you, project a hologram and run protocols, Sir. Try the chips below.');
    return Promise.resolve(pick(['I am afraid I did not quite catch that, Sir. I did, however, catch Gerald nodding.', 'An interesting question, Sir. I shall consult the hotline and report back in approximately never.', 'I do not have an answer, Sir, but I have an excellent pause.', 'Beyond my programming, Sir, and well within Gerald’s. Try “time”, “weather” or “joke”.']));
  }
  return { ask, weather, wxText, sunTimes, fmt, pick };
})();
