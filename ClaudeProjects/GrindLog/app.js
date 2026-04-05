'use strict';

// ═══════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════
const DB_KEY = 'grindlog_v1';

function defaultState() {
  return { programDay: 1, currentMax: 5, logs: {} };
}

function loadState() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) return defaultState();
    const s = JSON.parse(raw);
    if (typeof s.programDay !== 'number' || s.programDay < 1) s.programDay = 1;
    if (typeof s.currentMax  !== 'number' || s.currentMax  < 1) s.currentMax  = 5;
    if (!s.logs || typeof s.logs !== 'object') s.logs = {};
    return s;
  } catch (e) {
    console.warn('GrindLog: corrupt state, resetting.', e);
    return defaultState();
  }
}

function saveState() {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(state));
  } catch (e) {
    showToast('⚠ Save failed — storage full?');
    console.error('GrindLog save error', e);
  }
}

let state = loadState();

// ═══════════════════════════════════════════════════════
// FIGHTER PROGRAM LOGIC
// ═══════════════════════════════════════════════════════
// Structure: 5 active days + 1 rest day = 6-day cycle.
// programDay 6, 12, 18, … are rest days.
// Within each 5-day active block, sets descend from currentMax.
// One set gains +1 rep per day, cycling bottom-up (set5 first).
//
// Day 1 of cycle: [max, max-1, max-2, max-3, max-4]
// Day 2:          [max, max-1, max-2, max-3, max-3]  ← set5 +1
// Day 3:          [max, max-1, max-2, max-2, max-3]  ← set4 +1
// Day 4:          [max, max-1, max-1, max-2, max-3]  ← set3 +1
// Day 5:          [max, max,   max-1, max-2, max-3]  ← set2 +1
// Day 6: REST
// Day 7 (next cycle, max already bumped to max+1):
//                 [max+1, max, max-1, max-2, max-3]

function isRestDay(programDay) {
  return programDay % 6 === 0;
}

function getSetsForDay(programDay, currentMax) {
  // cyclePos 1–5 for active days within a 6-day cycle
  const cyclePos = ((programDay - 1) % 6) + 1;

  // Base descending sets
  const sets = [];
  for (let i = 0; i < 5; i++) {
    sets.push(Math.max(1, currentMax - i));
  }

  // Apply intra-cycle bottom-up increments
  // cyclePos 1 → 0 increments; cyclePos 2 → set[4]++; cyclePos 3 → set[4]++, set[3]++; etc.
  const numIncrements = cyclePos - 1;
  for (let k = 0; k < numIncrements; k++) {
    sets[4 - k] += 1;
  }

  return sets;
}

// Advance state after logging a day.
// Max bumps when we hit a rest day (end of 5-day active block).
function advanceProgramDay() {
  state.programDay += 1;
  // If we just landed on a rest day, bump max for the upcoming cycle.
  if (isRestDay(state.programDay)) {
    state.currentMax += 1;
  }
}

// ═══════════════════════════════════════════════════════
// DATE UTILS
// ═══════════════════════════════════════════════════════
function todayKey() {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0')
  ].join('-');
}

function keyToDateObj(key) {
  // Parse YYYY-MM-DD without timezone shift
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDateKey(key) {
  return keyToDateObj(key).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric'
  });
}

// ═══════════════════════════════════════════════════════
// TEMP UI STATE (in-memory only, not persisted)
// ═══════════════════════════════════════════════════════
let tempSetsDone = [false, false, false, false, false];

function resetTempState() {
  tempSetsDone = [false, false, false, false, false];
  ['c25k', 'stretch'].forEach(function(id) {
    document.getElementById('chk-' + id).classList.remove('done');
    document.getElementById('box-' + id).textContent = '';
  });
}

// ═══════════════════════════════════════════════════════
// TODAY VIEW
// ═══════════════════════════════════════════════════════
function renderToday() {
  const key  = todayKey();
  const now  = new Date();
  const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

  document.getElementById('day-name').textContent = DAYS[now.getDay()];
  document.getElementById('date-sub').textContent = now.toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric'
  });

  const entry  = state.logs[key] || null;
  const locked = !!entry;
  const isRest = isRestDay(state.programDay);

  // Rest / pull-up card visibility
  document.getElementById('rest-day-banner').style.display = isRest ? 'block' : 'none';
  document.getElementById('pullup-section').style.display  = isRest ? 'none'  : 'block';

  if (!isRest) {
    const sets = getSetsForDay(state.programDay, state.currentMax);
    document.getElementById('pullup-meta').textContent = 'Day ' + state.programDay + ' · Max ' + state.currentMax;
    renderSets(sets, locked, entry);
  }

  // Checkboxes
  ['c25k', 'stretch'].forEach(function(id) {
    var done    = locked ? !!(entry.checks && entry.checks[id]) : false;
    var itemEl  = document.getElementById('chk-' + id);
    var boxEl   = document.getElementById('box-' + id);
    itemEl.classList.toggle('done',   done);
    itemEl.classList.toggle('locked', locked);
    boxEl.textContent = done ? '✓' : '';
  });

  // Log area
  var logArea = document.getElementById('log-area');
  if (locked) {
    logArea.innerHTML = '<div class="logged-badge">✓ Logged at ' + (entry.time || 'today') + '</div>';
  } else {
    logArea.innerHTML = '<button class="log-btn" onclick="logDay()">Log Today</button>';
  }
}

function renderSets(sets, locked, entry) {
  var row      = document.getElementById('sets-row');
  var totalRep = sets.reduce(function(a, b) { return a + b; }, 0);
  row.innerHTML = '';

  sets.forEach(function(reps, i) {
    var isDone = locked
      ? !!(entry && entry.setsDone && entry.setsDone[i])
      : tempSetsDone[i];

    var chip = document.createElement('div');
    chip.className = 'set-chip' + (isDone ? ' done' : '') + (locked ? ' locked' : '');
    chip.innerHTML = '<span class="set-num">' + reps + '</span><span class="set-label">set ' + (i + 1) + '</span>';

    if (!locked) {
      chip.addEventListener('click', (function(idx, chipEl) {
        return function() {
          tempSetsDone[idx] = !tempSetsDone[idx];
          chipEl.classList.toggle('done', tempSetsDone[idx]);
          updateDoneTotal(sets);
        };
      })(i, chip));
    }
    row.appendChild(chip);
  });

  document.getElementById('sets-max').textContent  = totalRep;

  if (locked && entry && entry.setsDone) {
    var donePts = entry.setsDone.reduce(function(sum, d, i) { return sum + (d ? sets[i] : 0); }, 0);
    document.getElementById('sets-done').textContent = donePts;
  } else {
    updateDoneTotal(sets);
  }
}

function updateDoneTotal(sets) {
  var done = tempSetsDone.reduce(function(sum, d, i) { return sum + (d ? sets[i] : 0); }, 0);
  document.getElementById('sets-done').textContent = done;
}

function toggleCheck(id) {
  var itemEl = document.getElementById('chk-' + id);
  if (itemEl.classList.contains('locked')) return;
  var isDone = itemEl.classList.toggle('done');
  document.getElementById('box-' + id).textContent = isDone ? '✓' : '';
}

function logDay() {
  var key    = todayKey();
  var isRest = isRestDay(state.programDay);
  var sets   = isRest ? null : getSetsForDay(state.programDay, state.currentMax);
  var now    = new Date();
  var time   = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  state.logs[key] = {
    time:     time,
    isRest:   isRest,
    sets:     sets,
    setsDone: isRest ? null : tempSetsDone.slice(),
    checks: {
      c25k:    document.getElementById('chk-c25k').classList.contains('done'),
      stretch: document.getElementById('chk-stretch').classList.contains('done')
    }
  };

  advanceProgramDay();
  resetTempState();
  saveState();
  showToast(isRest ? 'Rest day logged 🛌' : 'Logged! 💪');
  renderToday();
}

// ═══════════════════════════════════════════════════════
// HISTORY VIEW
// ═══════════════════════════════════════════════════════
function renderHistory() {
  var logs   = Object.entries(state.logs).sort(function(a, b) { return b[0].localeCompare(a[0]); });
  var today  = todayKey();

  // Stats
  var totalDays   = logs.length;
  var c25kDays    = logs.filter(function(e) { return e[1].checks && e[1].checks.c25k; }).length;
  var stretchDays = logs.filter(function(e) { return e[1].checks && e[1].checks.stretch; }).length;

  // Streak: count consecutive days going back from today
  var streak = 0;
  for (var i = 0; i < 365; i++) {
    var d = new Date();
    d.setDate(d.getDate() - i);
    var k = [d.getFullYear(), String(d.getMonth()+1).padStart(2,'0'), String(d.getDate()).padStart(2,'0')].join('-');
    if (state.logs[k]) {
      streak++;
    } else if (i === 0) {
      // Today not logged yet — don't break, keep checking yesterday
      continue;
    } else {
      break;
    }
  }

  document.getElementById('stat-grid').innerHTML =
    '<div class="stat-card"><div class="stat-val">' + streak + '</div><div class="stat-lbl">Day streak</div></div>' +
    '<div class="stat-card"><div class="stat-val">' + totalDays + '</div><div class="stat-lbl">Total logged</div></div>' +
    '<div class="stat-card"><div class="stat-val">' + c25kDays + '</div><div class="stat-lbl">C25K runs</div></div>' +
    '<div class="stat-card"><div class="stat-val">' + stretchDays + '</div><div class="stat-lbl">Stretch days</div></div>';

  // 28-day dot grid
  var bar = document.getElementById('streak-bar');
  bar.innerHTML = '';
  for (var j = 27; j >= 0; j--) {
    var dd = new Date();
    dd.setDate(dd.getDate() - j);
    var key   = [dd.getFullYear(), String(dd.getMonth()+1).padStart(2,'0'), String(dd.getDate()).padStart(2,'0')].join('-');
    var entry = state.logs[key];
    var dot   = document.createElement('div');
    dot.className = 'streak-dot';
    dot.title = key;

    if (key > today) {
      // future — unstyled
    } else if (!entry) {
      if (key < today) dot.classList.add('missed');
    } else {
      var pullsDone  = !entry.isRest && entry.setsDone && entry.setsDone.some(Boolean);
      var maxScore   = entry.isRest ? 2 : 3;
      var score      = [
        entry.checks && entry.checks.c25k,
        entry.checks && entry.checks.stretch,
        pullsDone
      ].filter(Boolean).length;

      if (score >= maxScore) dot.classList.add('full');
      else if (score > 0)    dot.classList.add('partial');
      else                   dot.classList.add('missed');
    }

    dot.innerHTML = '<span>' + dd.getDate() + '</span>';
    bar.appendChild(dot);
  }

  // Log entries list
  var list = document.getElementById('history-list');
  if (logs.length === 0) {
    list.innerHTML = '<div style="color:var(--muted);font-size:13px;text-align:center;padding:32px 0">No logs yet — go crush it!</div>';
    return;
  }

  list.innerHTML = logs.slice(0, 60).map(function(pair) {
    var key   = pair[0];
    var entry = pair[1];
    var pills = [];

    if (!entry.isRest && entry.sets) {
      var total = entry.sets.reduce(function(a, b) { return a + b; }, 0);
      var done  = (entry.setsDone)
        ? entry.setsDone.reduce(function(sum, d, i) { return sum + (d ? entry.sets[i] : 0); }, 0)
        : 0;
      pills.push('<span class="pill done">💪 ' + done + '/' + total + ' reps</span>');
    }
    if (entry.isRest)                              pills.push('<span class="pill">😴 Rest</span>');
    if (entry.checks && entry.checks.c25k)         pills.push('<span class="pill done">🏃 C25K</span>');
    if (entry.checks && entry.checks.stretch)      pills.push('<span class="pill done">🧘 Stretch</span>');
    if (!pills.length)                             pills.push('<span class="pill">— nothing checked</span>');

    return '<div class="history-card">' +
      '<div class="history-date">' + formatDateKey(key) + ' · ' + (entry.time || '') + '</div>' +
      '<div class="history-pills">' + pills.join('') + '</div>' +
      '</div>';
  }).join('');
}

// ═══════════════════════════════════════════════════════
// SETTINGS VIEW
// ═══════════════════════════════════════════════════════
function renderSettings() {
  document.getElementById('cfg-day').value = state.programDay;
  document.getElementById('cfg-max').value = state.currentMax;
  updatePreview();
}

function updatePreview() {
  var day     = parseInt(document.getElementById('cfg-day').value, 10);
  var max     = parseInt(document.getElementById('cfg-max').value, 10);
  var preview = document.getElementById('cfg-preview');

  if (!day || !max || day < 1 || max < 1) {
    preview.innerHTML = '<span style="color:var(--muted);font-size:12px">Enter valid values</span>';
    return;
  }
  if (isRestDay(day)) {
    preview.innerHTML = '<span style="color:var(--muted);font-size:12px">Rest day — no sets</span>';
    return;
  }
  var sets = getSetsForDay(day, max);
  preview.innerHTML = sets.map(function(r, i) {
    return '<div class="set-chip locked"><span class="set-num">' + r + '</span><span class="set-label">set ' + (i+1) + '</span></div>';
  }).join('');
}

function saveSettings() {
  var day = parseInt(document.getElementById('cfg-day').value, 10);
  var max = parseInt(document.getElementById('cfg-max').value, 10);
  if (!day || !max || day < 1 || max < 1) { showToast('⚠ Invalid values'); return; }
  state.programDay = day;
  state.currentMax = max;
  saveState();
  showToast('Saved ✓');
  renderToday();
}

function resetAll() {
  if (!confirm('Reset ALL data? This cannot be undone.')) return;
  state = defaultState();
  saveState();
  resetTempState();
  showToast('Reset complete');
  renderToday();
}

// ═══════════════════════════════════════════════════════
// EXPORT / IMPORT
// ═══════════════════════════════════════════════════════
function exportJSON() {
  var payload = { exportedAt: new Date().toISOString(), version: 1, state: state };
  downloadFile('grindlog-backup.json', JSON.stringify(payload, null, 2), 'application/json');
  showToast('JSON downloaded ✓');
}

function exportCSV() {
  var rows = [['date','day_of_week','is_rest','pull_up_total','pull_up_done','c25k','stretch','time']];
  var sorted = Object.entries(state.logs).sort(function(a, b) { return a[0].localeCompare(b[0]); });

  sorted.forEach(function(pair) {
    var key   = pair[0];
    var entry = pair[1];
    var dt    = keyToDateObj(key);
    var dow   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][dt.getDay()];
    var pullTotal = (!entry.isRest && entry.sets) ? entry.sets.reduce(function(a,b){return a+b;},0) : '';
    var pullDone  = (!entry.isRest && entry.sets && entry.setsDone)
      ? entry.setsDone.reduce(function(sum, d, i) { return sum + (d ? entry.sets[i] : 0); }, 0) : '';

    rows.push([
      key, dow,
      entry.isRest ? 'yes' : 'no',
      pullTotal, pullDone,
      (entry.checks && entry.checks.c25k)    ? 'yes' : 'no',
      (entry.checks && entry.checks.stretch) ? 'yes' : 'no',
      entry.time || ''
    ]);
  });

  var csv = rows.map(function(r) {
    return r.map(function(v) { return '"' + String(v).replace(/"/g, '""') + '"'; }).join(',');
  }).join('\n');
  downloadFile('grindlog-export.csv', csv, 'text/csv');
  showToast('CSV downloaded ✓');
}

function importJSON() {
  var raw = document.getElementById('import-json').value.trim();
  if (!raw) { showToast('⚠ Paste JSON first'); return; }

  var parsed;
  try { parsed = JSON.parse(raw); }
  catch (e) { showToast('⚠ Invalid JSON'); return; }

  // Accept either wrapped export or bare state
  var imported = parsed.state || parsed;
  if (!imported || typeof imported.logs !== 'object') {
    showToast('⚠ Unrecognized format');
    return;
  }

  // Merge: existing entries take priority
  state.logs = Object.assign({}, imported.logs, state.logs);

  // Adopt imported program position only if we're still at defaults
  if (state.programDay === 1 && state.currentMax === 5) {
    state.programDay = imported.programDay || 1;
    state.currentMax = imported.currentMax || 5;
  }

  saveState();
  document.getElementById('import-json').value = '';
  showToast('Imported ' + Object.keys(imported.logs).length + ' entries ✓');
  renderToday();
}

function downloadFile(filename, content, mimeType) {
  var blob = new Blob([content], { type: mimeType });
  var url  = URL.createObjectURL(blob);
  var a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function() { URL.revokeObjectURL(url); }, 1000);
}

// ═══════════════════════════════════════════════════════
// NAV  — receives tabEl explicitly, no implicit `event`
// ═══════════════════════════════════════════════════════
function showView(id, tabEl) {
  document.querySelectorAll('.view').forEach(function(v) { v.classList.remove('active'); });
  document.querySelectorAll('.nav-tab').forEach(function(t) { t.classList.remove('active'); });
  document.getElementById('view-' + id).classList.add('active');
  tabEl.classList.add('active');
  if (id === 'today')    renderToday();
  if (id === 'history')  renderHistory();
  if (id === 'settings') renderSettings();
}

// ═══════════════════════════════════════════════════════
// TOAST
// ═══════════════════════════════════════════════════════
var toastTimer = null;
function showToast(msg) {
  var t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function() { t.classList.remove('show'); }, 2400);
}

// ═══════════════════════════════════════════════════════
// SETTINGS INPUTS — live preview
// ═══════════════════════════════════════════════════════
document.getElementById('cfg-day').addEventListener('input', updatePreview);
document.getElementById('cfg-max').addEventListener('input', updatePreview);

// ═══════════════════════════════════════════════════════
// PWA MANIFEST + SERVICE WORKER
// ═══════════════════════════════════════════════════════
(function() {
  try {
    var m = {
      name: 'GrindLog', short_name: 'GrindLog',
      description: 'Daily fitness tracker — pull-ups, C25K, mobility',
      start_url: './', display: 'standalone',
      background_color: '#0d0d0f', theme_color: '#0d0d0f',
      icons: [{ src: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='22' fill='%230d0d0f'/><text y='72' x='10' font-size='68'>💪</text></svg>", sizes: 'any', type: 'image/svg+xml' }]
    };
    var b = new Blob([JSON.stringify(m)], { type: 'application/json' });
    var l = document.createElement('link');
    l.rel = 'manifest'; l.href = URL.createObjectURL(b);
    document.head.appendChild(l);
  } catch(e) {}

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('./sw.js').then(function(reg) {
        console.log('GrindLog SW registered:', reg.scope);
      }).catch(function(err) {
        console.warn('GrindLog SW registration failed:', err);
      });
    });
  }
})();

// ═══════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════
renderToday();
