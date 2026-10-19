'use strict';
/* CINCO canon + pocket-watch content. Nothing here is for sale. */
const D = {
  recalls: [
    ['CINCO Pocket Watch, Lid Batch 7', 'Some lids open into last week. Owners should close the lid gently and avoid last week.'],
    ['CINCO Chrono-Fwip 5000', 'Some units supplied extra time that belonged to someone else. Please return any time that is not yours.'],
    ['CINCO Decaf Water (Batch 44)', 'Batch 44 has been found to contain water.'],
    ['CINCO Pocket Watch Minute Repeater', 'Repeater may repeat minutes you have already had. Those minutes are non-refundable.'],
    ['CINCO Nick-Verse Scan-O-Matic 9000', 'Units assembled on a Tuesday may detect Tuesdays. Detected Tuesdays cannot be undetected.'],
    ['CINCO Moon Phase Module', 'Displays a moon. CINCO cannot confirm it is ours.'],
    ['CINCO Left-Sock Radar', 'Some units have begun locating right socks. Owners are advised to remain calm.'],
    ['CINCO Mainspring (Hand-Wound)', 'Mainspring may unwind feelings as well as time. Wind with care, and possibly a hug.'],
    ['CINCO Apology Megaphone', 'Some units apologised to their own recall notice and would like the notice to go first.'],
    ['CINCO Pocket Sun', 'Several Pocket Suns shipped with a tiny planet already in orbit.']
  ],
  hold: [
    'Your call is important to us. Relatively speaking.',
    'Please hold. Gary is looking for the phone.',
    'CINCO support is closed on days.',
    'Estimated wait: yes.',
    'You are now queueing behind yourself. Try not to push.',
    'Most CINCO problems resolve themselves if you move house.',
    'Gerald is watching. Gerald is always watching. Please enjoy the rectangle.',
    'A representative will be hired shortly after a representative is imagined.',
    'For faster service, hang up and remain exactly where you are.',
    'Have you tried winding it, Sir? Gerald has not. Gerald has opinions.',
    'Your hold time is being measured by a CINCO watch, so it may be longer than it feels. Or shorter. Or Friday.'
  ],
  queue: ['7', '12', '404', '9,001', '1,000,000', 'a googol', '∞', 'behind yourself'],
  menu: {
    '1': ['TIME', 'It is currently now. Press 1 again for later.'],
    '2': ['MORE TIME', 'More time has been added to your account. It expires at once.'],
    '3': ['REPORT A TUESDAY', 'Thank you. Your Tuesday has been detected and cannot be undetected.'],
    '4': ['RECALLS', 'All products are recalled, or about to be. Please hold your product upright.'],
    '5': ['CINCO', 'You pressed five. CINCO appreciates the gesture. Nothing happens, beautifully.'],
    '6': ['DECAF WATER', 'Decaf Water remains under review, on account of the water.'],
    '7': ['WINDING HELP', 'Turn the crown. No, the other way. No, the first way. Thank you.'],
    '8': ['LOST TIME', 'Lost time is kept in the Lost Time office. The office is also lost.'],
    '9': ['BILLING', 'Gerald declines the card. You have not provided a card. Gerald declines it anyway.'],
    '0': ['OPERATOR', 'Connecting you to Gerald. Gerald has gone to lunch, which began some years ago and is going well.'],
    '*': ['STAR', 'You are a star, Sir. This has been noted and will not be acted upon.'],
    '#': ['HASH', 'The hash key has been pressed. CINCO is unsure what it is for, and so is the key.']
  },
  excuse: {
    a: ['Sorry I’m late —', 'Apologies, Sir —', 'In my defence,', 'Before you say anything,', 'Funny story:', 'Per CINCO advisory 5,'],
    b: ['my CINCO pocket watch', 'Gerald', 'the hotline queue', 'my Chrono-Fwip 5000', 'Daylight Saving (which is now daily)', 'a batch of Decaf Water', 'the moon phase module', 'my mainspring', 'a recall notice', 'Friday'],
    c: ['supplied me extra time that belonged to someone else', 'declined my calendar', 'put me behind myself', 'ran down at a dramatic moment', 'happened again', 'turned out to contain water', 'displayed a moon that was not ours', 'unwound my feelings', 'asked to go first', 'arrived on a Tuesday'],
    d: ['so technically I’m early.', 'and Gerald has already decided.', 'and I have filed the appropriate form with nobody.', 'which CINCO says is covered under warranty, for four seconds.', 'and the minute repeater repeated the wrong minute.', 'so I snoozed reality to compensate.', 'but I wound it, which counts.', 'and it is apparently Friday now.']
  },
  sarcasm: [
    'It is {t}. Splendid. Another hour, used up entirely.',
    '{t}, Sir. I would congratulate you on surviving it, but the bar was low.',
    'The time is {t}. Gerald noticed. Gerald is unimpressed.',
    '{t}. Time, now with more time. Unfortunately it is still this time.',
    'It is {t}. If you were planning to be productive, that was an hour ago.',
    'Hourly bulletin: {t}. Nothing has improved. The watch apologises on behalf of the hour.',
    '{t}. A perfectly ordinary hour, recalled pending review.',
    'It is {t}, Nick. I have announced it beautifully. You are welcome.'
  ],
  hypno: [
    'You are getting very sleepy…',
    'very… sleepy…',
    'You will wind the watch regularly…',
    'You will not phone the hotline…',
    'You feel calm. Calm as Decaf Water.',
    'When you wake, it will be Friday…',
    'Gerald is watching… that is fine…',
    'You are getting very sleepy, Nick…'
  ],
  ach: [
    ['lid', '🔓', 'Lid Lifter', 'Open the lid for the first time'],
    ['wind', '🌀', 'Wound Up', 'Wind the crown'],
    ['overwind', '💥', 'Over-Wound', 'Keep winding past full'],
    ['dead', '⚰️', 'Time of Death', 'Let the watch run completely down'],
    ['lazarus', '🧟', 'Lazarus Spring', 'Wind a dead watch back to life'],
    ['set', '🕰️', 'Time Lord (Licensed)', 'Pull the crown and set the time'],
    ['digital', '🔆', 'Nixie Nostalgia', 'Switch to digital mode'],
    ['lcd', '📟', 'Segment Fault', 'Switch the digital display to LCD'],
    ['skeleton', '⚙️', 'Peeping Horologist', 'Reveal the skeleton movement'],
    ['hypno', '🌀', 'Very Sleepy', 'Stay in hypnosis mode for 10 seconds'],
    ['repeater', '🔔', 'Minute Man', 'Play the minute repeater'],
    ['snooze', '😴', 'Reality Snoozer', 'Snooze reality'],
    ['friday', '🎉', 'TGIF (Technically)', 'Make it Friday'],
    ['excuse', '📝', 'Professional Latecomer', 'Generate five late excuses'],
    ['gst', '🥪', 'Gerald Standard', 'Switch to Gerald Standard Time'],
    ['dst', '☀️', 'Daylight Hoarder', 'Enable Daylight Saving Every Day'],
    ['hotline', '☎️', 'On Hold Forever', 'Reach queue position ∞'],
    ['recall', '⚠️', 'Recall Reader', 'Read the recall notices'],
    ['info', '📺', 'But Wait', 'Watch the infomercial to the end'],
    ['laps', '⏱️', 'Split Decision', 'Record three stopwatch laps'],
    ['alarm', '⏰', 'Rise and Whine', 'Have an alarm or timer ring'],
    ['collector', '🎨', 'Collector', 'Try all four standard finishes'],
    ['secret', '🌈', 'Fwip Prismatic', 'Find the secret finish'],
    ['tilt', '📐', 'Tilted', 'Swing the watch by tilting your phone or dragging the chain']
  ],
  finishes: {
    brass:   { name: 'Brass',     c: ['#fff1c4', '#e8c47a', '#b8893e', '#6e4d1c', '#3a280c'], dial: ['#fbf3df', '#e9dcc0'], ink: '#2a1d10', hand: '#1d3d8f', accent: '#a32416', plate: ['#cdb27a', '#8d7140'] },
    silver:  { name: 'Silver',    c: ['#ffffff', '#dfe3e8', '#a9b0ba', '#5f6670', '#2b3036'], dial: ['#fdfdfb', '#e7e8ea'], ink: '#1b1f26', hand: '#1d3d8f', accent: '#a32416', plate: ['#d2d6db', '#8e959e'] },
    gunmetal:{ name: 'Gunmetal',  c: ['#c9ced6', '#7c838d', '#4a5059', '#262a30', '#111317'], dial: ['#2a2f37', '#171a1f'], ink: '#e9dcc0', hand: '#e8c47a', accent: '#ff7a4a', plate: ['#6d737c', '#3a3f46'] },
    rose:    { name: 'Rose gold', c: ['#ffe6da', '#eab49c', '#c07f66', '#7a4636', '#3d2018'], dial: ['#fbe9df', '#efd2c3'], ink: '#3a1d14', hand: '#3a1d14', accent: '#a32416', plate: ['#e0b29c', '#9c6a56'] },
    prism:   { name: 'Fwip Prismatic', secret: true, c: ['#ffffff', '#9ff3ff', '#c38bff', '#ff7ac8', '#3a1a5a'], dial: ['#12101c', '#05040a'], ink: '#d9f7ff', hand: '#9ff3ff', accent: '#ff7ac8', plate: ['#4a3a6a', '#1c1430'] }
  },
  world: [
    ['Local (Nick)', null],
    ['London', 'Europe/London'],
    ['New York', 'America/New_York'],
    ['Los Angeles', 'America/Los_Angeles'],
    ['Tokyo', 'Asia/Tokyo'],
    ['Sydney', 'Australia/Sydney'],
    ['Geneva (watch HQ, allegedly)', 'Europe/Zurich'],
    ['Gerald Standard Time', 'GST'],
    ['Gerald’s Lunch', 'LUNCH']
  ],
  info: [
    ['big', 'Tired of time that only goes one way?'],
    ['emoji', '🕰️', 'Introducing the CINCO™ Pocket Watch'],
    ['big', 'From the makers of the Chrono-Fwip 5000'],
    ['big', 'It tells the time. Then it tells MORE time.'],
    ['burst', 'WAS $1 PER SECOND LIVED', 'NOW $49.95 plus the rest of Thursday'],
    ['big', 'But wait, there’s more!'],
    ['emoji', '💧', 'Order now and receive a complimentary bottle of Decaf Water*'],
    ['small', '*Decaf Water remains under review, on account of the water.'],
    ['big', 'Hand-wound by Gerald. Gerald has already decided.'],
    ['buy', 'Operators are standing by. Operators are standing.']
  ],
  hourWords: ['twelve', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven']
};

/* ===== Nick Pocket Watch (flagship) additions ===== */
D.recalls.unshift(
  ['CINCO Nick Pocket Watch, Hologram Module', 'Some holograms have been seen to look slightly too pleased with themselves. Owners are advised to nod back.'],
  ['CINCO J.A.R.V.I.S. Voice Pack (British)', 'Voice may be too polite to deliver bad news. It will deliver it anyway, but apologise first.'],
  ['CINCO Biometric Pulse™', 'Reads vibes, not pulses. Vibes have been found to contain water.'],
  ['CINCO Sapphire Crystal', 'Reflections have begun following the owner around the room. They mean well.']
);
D.finishes.titanium = { name: 'Titanium', c: ['#f2f5f7', '#b9c2cc', '#7f8a96', '#3c444d', '#171b20'], dial: ['#eaeff3', '#cdd5dc'], ink: '#14202c', hand: '#0b4fbf', accent: '#c0392b', plate: ['#9aa6b2', '#59626c'] };
D.finishes.carbon = { name: 'Carbon Fibre', weave: true, c: ['#e8edf2', '#8a929c', '#3a3f46', '#1b1e22', '#0a0b0d'], dial: ['#1c2230', '#0b0f18'], ink: '#cfe6ff', hand: '#6fd3ff', accent: '#ff6b3d', plate: ['#4a515c', '#20252c'] };
D.finishes.aurora = { name: 'Chrono Aurora', secret: true, c: ['#ffffff', '#7dffd0', '#6aa8ff', '#a06bff', '#101a3a'], dial: ['#0b1226', '#04060f'], ink: '#c8fff0', hand: '#7dffd0', accent: '#ffb86b', plate: ['#2a4a7a', '#0d1a33'] };
D.ach.push(
  ['jarvis', '🤖', 'Very Good, Sir', 'Ask JARVIS something'],
  ['weather', '🌦️', 'Weather or Not', 'Fetch the weather'],
  ['holo', '🔮', 'Projection Perfection', 'Raise the hologram from the lid'],
  ['idcard', '🪪', 'Identity Verified', 'Open your CINCO ID card'],
  ['photo', '📷', 'Say Fwip', 'Change the portrait photo'],
  ['filter', '🎞️', 'Darkroom Dabbler', 'Try every portrait style'],
  ['konami', '🕹️', 'Thirty Lives', 'Enter the secret code'],
  ['pulse', '💓', 'Vibes Measured', 'Take a Biometric Pulse reading'],
  ['mission', '🎯', 'Mission Planner', 'Plan a mission'],
  ['brief', '🗞️', 'Fully Briefed', 'Read the daily briefing'],
  ['party', '🎊', 'Party Protocol', 'Activate Party'],
  ['red', '🚨', 'Red Alert (Reason: Unclear)', 'Activate Red Alert'],
  ['protocols', '🛡️', 'Protocol Droid', 'Try all five protocols'],
  ['gerald', '▭', 'Gerald Appears', 'Be visited by Gerald'],
  ['compass', '🧭', 'Magnetically North-ish', 'Open the compass'],
  ['tourb', '🌪️', 'Mesmerised by the Cage', 'Watch the tourbillon for 20 seconds'],
  ['tabsall', '🧳', 'Thorough, Sir', 'Visit every section']
);
D.services2 = [
  ['spa', 'Time Dilation Spa™', 'Relax. Your five minutes will feel like four, and be billed as six.', ['Book a treatment', ['Your five minutes will feel like four. Billed as six. Gerald gets the other one.', 'Treatment complete. You feel 11% more Tuesday.', 'The spa has dilated your afternoon. It will contract again at about 4:55.']]],
  ['permit', 'Procrastination Permit', 'Official CINCO authorisation to do it later. Valid until tomorrow. Renewable tomorrow.', ['Issue permit', ['Permit No. 5-5-5 issued. It expires tomorrow, when it can be renewed.', 'Permit granted. You may now do it later. Gerald will remind you later.', 'Permit issued, but only for tasks you were not going to do anyway.']]],
  ['weekend', 'Weekend Extender', 'Adds a bonus day between Sunday and Monday. Monday has been informed.', ['Extend weekend', ['Sunday 2.0 added. Monday is delayed pending Gerald’s approval.', 'Bonus Sunday granted. It looks exactly like Sunday, but quieter.', 'Weekend extended by one nap.']]],
  ['nap', 'Nap Calculator', 'Recommends the ideal nap length, then accepts whatever actually happens.', ['Calculate nap', ['Recommended nap: 20 minutes. Probable nap: 3 hours. CINCO accepts this.', 'Ideal nap: 26 minutes. You will wake up in 1996. CINCO apologises.', 'Recommended: 15 minutes. Forecast: it was Friday when you woke. (It was not.)']]],
  ['pause', 'Pause Everyone Else’s Watch', 'Pauses the watches of all other people, for fairness.', ['Pause 4,000 watches', ['4,012 watches paused. 3,987 were unpaused by confused owners.', 'Done. Everyone else is on hold. They are now behind themselves.', 'Paused. You are now the only one on time. This is lonely and mildly efficient.']]]
];
D.quips = [
  'Time flies. Gerald does not. Gerald stands there.',
  'A watch is only late if you look at it. CINCO recommends not looking at it.',
  'Today’s forecast: a high chance of time, with scattered minutes.',
  'You have exactly as many hours as yesterday. CINCO has asked for more. Declined.',
  'The early bird gets the worm. The late bird gets the Decaf Water.',
  'Whatever you were meant to do at nine, it is now later. Hurrah.',
  'Wind your watch. Metaphorically too, if possible.',
  'Today is a gift, Sir. CINCO regrets that it cannot be returned.',
  'Be like the tourbillon: spin constantly, achieve little, look magnificent.',
  'You’re doing splendidly, Nick. Gerald has not said otherwise, which is high praise.',
  'A minute saved is a minute CINCO will quietly reallocate.',
  'The best time to start was yesterday. The second best time is a nap, then start.',
  'Remember: every second is a gift. Some are quite poorly wrapped.',
  'Pocket watches: because your phone didn’t have enough dignity.'
];
D.jokes = [
  'Why did the watch go to therapy? It had too many unresolved minutes.',
  'I told Gerald a time-travel joke. He said he’d heard it. Tomorrow.',
  'A watch walks into a bar. The barman says, “We’re closed.” The watch says, “It’s only 4 o’clock.” Nobody wins.',
  'Why was the clock thrown out of the library? It tocked too much.',
  'What do you call a pocket watch that tells the truth? Broken. Twice a day it is correct, you understand.',
  'The hotline said I’d be seen shortly. That was Tuesday. It is now Thursday, and I’ve been seen by nobody.',
  'I asked the tourbillon how it was. It said it was going round in circles. It sounded fine about it.',
  'Decaf Water: because even water needed to calm down.'
];
D.facts = [
  'CINCO’s flagship, the Chrono-Fwip 5000, tells the time and then supplies extra time. Origin of the extra time is under review.',
  'Gerald is a rectangle. Gerald has already decided.',
  'CINCO Decaf Water (Batch 44) was recalled for containing water. The water has not commented.',
  'The CINCO Hotline’s queue position has reached a googol, ∞, and “behind yourself”. It goes no further, Sir, as there is no further.',
  'Gary has been looking for the phone since the hotline was founded. Updates are not expected.',
  'Your Nick Pocket Watch contains five jewels. One of them is decaf.',
  'CINCO’s motto is “Time, Now With More Time.™”. Legal has asked us to say the more time is not included.',
  'Every CINCO watch is hand-wound by Gerald. Gerald has no hands. This is why they take so long.'
];
D.protocols = [
  ['focus', 'Focus', 'Dims everything, quiets the watch and starts a 25-minute focus timer.'],
  ['winddown', 'Wind-Down', 'Warm light, low volume and gentle encouragement to stop.'],
  ['party', 'Party', 'Confetti, a rainbow bezel and a fanfare. Gerald is invited, and declines.'],
  ['stealth', 'Stealth', 'Silences sound, speech and haptics, and dims the display to near black.'],
  ['red', 'Red Alert', 'Klaxon, flashing red, and JARVIS announcing a reason: unclear.']
];
D.geraldSays = ['Gerald.', 'Gerald has already decided.', 'Gerald declines.', 'Gerald is at lunch. This is his lunch face.', 'Gerald saw that.', 'Gerald approves. Briefly.', 'Gerald is watching. Please enjoy the rectangle.', 'Gerald has noted your winding. Gerald is unmoved.'];
D.wmo = { 0: 'clear', 1: 'mostly clear', 2: 'partly cloudy', 3: 'overcast', 45: 'foggy', 48: 'foggy', 51: 'drizzling', 53: 'drizzling', 55: 'drizzling', 61: 'raining', 63: 'raining', 65: 'raining hard', 71: 'snowing', 73: 'snowing', 75: 'snowing heavily', 80: 'showery', 81: 'showery', 82: 'stormy showers', 95: 'thundering', 96: 'thundering', 99: 'thundering' };
