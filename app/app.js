// GTA 6 Trophy Guide & Tracker — checklist, filters, spoiler mode, export/import.
// All trophy data lives in data/trophies.json (fetched once, same origin, offline).
// Progress lives in localStorage only; nothing leaves the browser.

const DATA_URL = 'data/trophies.json';
const STORE_KEY = 'gta6-trophy-guide-v1';
const TOTAL = 55;

const $ = (id) => document.getElementById(id);
const listEl = $('trophy-list');
const searchEl = $('search');
const kindEl = $('kind');
const statusEl = $('status');
const spoilerEl = $('spoiler');

let trophies = [];
let earned = new Set();
let spoilerOn = true;
let openId = null;

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (Array.isArray(saved.earned)) earned = new Set(saved.earned.filter((n) => Number.isInteger(n)));
    if (typeof saved.spoiler === 'boolean') spoilerOn = saved.spoiler;
  } catch (err) {
    // A corrupt saved state is not worth losing the checklist over; start fresh.
  }
}

function saveState() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({ earned: [...earned].sort((a, b) => a - b), spoiler: spoilerOn }));
  } catch (err) {
    // Private mode or a full store: the checklist still works for this visit.
  }
}

function gradeLabel(t) {
  return t.grade.charAt(0).toUpperCase() + t.grade.slice(1);
}

function isHiddenFromSpoilers(t) {
  return spoilerOn && t.kind === 'story' && !earned.has(t.id);
}

function trophyMatches(t) {
  const q = searchEl.value.trim().toLowerCase();
  if (q) {
    const hay = [t.name, t.description, t.guide, t.kind, t.grade, ...(t.steps || [])].join(' ').toLowerCase();
    if (!hay.includes(q)) return false;
  }
  const kind = kindEl.value;
  if (kind === 'missable' && !t.missable) return false;
  if (kind === 'online') return false; // No online trophies exist; the note below explains.
  if (kind !== 'all' && kind !== 'missable' && t.kind !== kind) return false;
  const status = statusEl.value;
  if (status === 'earned' && !earned.has(t.id)) return false;
  if (status === 'unearned' && earned.has(t.id)) return false;
  return true;
}

function renderProgress() {
  const n = earned.size;
  const pct = Math.round((n / TOTAL) * 100);
  $('progress-count').textContent = n + ' / ' + TOTAL;
  $('progress-pct').textContent = pct + '%';
  $('progress-fill').style.width = pct + '%';
  const counts = {};
  for (const t of trophies) if (earned.has(t.id)) counts[t.grade] = (counts[t.grade] || 0) + 1;
  const totals = {};
  for (const t of trophies) totals[t.grade] = (totals[t.grade] || 0) + 1;
  $('grade-counts').textContent = ['platinum', 'gold', 'silver', 'bronze']
    .map((g) => gradeLabel({ grade: g }) + ' ' + (counts[g] || 0) + '/' + totals[g])
    .join(' · ');
}

function renderStageLists() {
  for (const stage of [1, 2, 3]) {
    const el = document.querySelector('[data-stage-list="' + stage + '"]');
    if (!el) continue;
    const names = trophies.filter((t) => t.stage === stage).map((t) => t.name);
    el.textContent = names.length + ' trophies: ' + names.join(' · ');
  }
  const missEl = document.querySelector('[data-missable-list]');
  if (missEl) {
    const miss = trophies.filter((t) => t.missable);
    missEl.textContent = 'Flagged missable: ' + miss.map((t) => t.name + ' (' + gradeLabel(t) + ')').join(', ') + '.';
  }
}

function sourceLinks(t) {
  return (t.sources || [])
    .map((s) => '<a href="' + s.url + '" target="_blank" rel="noopener">' + s.name + '</a>')
    .join(' · ');
}

function detailHtml(t) {
  if (isHiddenFromSpoilers(t)) {
    return '<p class="spoiler-note">Story spoiler hidden. Tick the box once you earn this trophy to reveal its guide.</p>';
  }
  const steps = (t.steps || []).map((s) => '<li>' + s + '</li>').join('');
  return (
    '<p class="guide">' + t.guide + '</p>' +
    (steps ? '<ol class="steps">' + steps + '</ol>' : '') +
    '<p class="sources">Sources: ' + sourceLinks(t) + '</p>'
  );
}

function renderList() {
  const shown = trophies.filter(trophyMatches);
  $('result-count').textContent = 'Showing ' + shown.length + ' of ' + TOTAL + ' trophies · ' + earned.size + ' earned';
  $('empty').hidden = shown.length > 0;
  $('online-note').hidden = kindEl.value !== 'online';
  listEl.innerHTML = '';
  for (const t of shown) {
    const li = document.createElement('li');
    li.className = 'trophy' + (earned.has(t.id) ? ' is-earned' : '') + (t.missable ? ' is-missable' : '');
    li.dataset.id = t.id;
    const hidden = isHiddenFromSpoilers(t);
    const shownName = hidden ? 'Hidden story trophy' : t.name;
    const shownDesc = hidden ? 'Hidden until earned — spoiler setting is on.' : t.description;
    li.innerHTML =
      '<div class="row">' +
        '<label class="check"><input type="checkbox" data-earn="' + t.id + '"' + (earned.has(t.id) ? ' checked' : '') + ' aria-label="Mark ' + t.name + ' earned"><span class="box" aria-hidden="true"></span></label>' +
        '<button type="button" class="head" data-open="' + t.id + '" aria-expanded="' + (openId === t.id) + '">' +
          '<span class="name">' + shownName + '</span>' +
          '<span class="meta"><span class="grade grade-' + t.grade + '">' + gradeLabel(t) + '</span>' +
          (t.hidden ? '<span class="tag">Hidden</span>' : '') +
          (t.missable ? '<span class="tag tag-missable">Missable</span>' : '') +
          '<span class="tag">' + t.kind + '</span></span>' +
          '<span class="desc">' + shownDesc + '</span>' +
        '</button>' +
      '</div>' +
      (openId === t.id ? '<div class="detail">' + detailHtml(t) + '</div>' : '');
    listEl.appendChild(li);
  }
}

function renderAll() {
  renderProgress();
  renderList();
}

function toggleEarned(id, on) {
  if (on) earned.add(id); else earned.delete(id);
  saveState();
  renderAll();
}

function exportProgress() {
  const payload = { app: 'gta6-trophy-guide', version: 1, exportedAt: new Date().toISOString(), earned: [...earned].sort((a, b) => a - b) };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'gta6-trophy-progress.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function importProgress(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result));
      const ids = Array.isArray(data) ? data : data.earned;
      if (!Array.isArray(ids)) throw new Error('no earned list');
      const valid = new Set(trophies.map((t) => t.id));
      const next = new Set();
      for (const n of ids) if (Number.isInteger(n) && valid.has(n)) next.add(n);
      earned = next;
      saveState();
      renderAll();
      $('save-note').textContent = 'Imported ' + earned.size + ' earned trophies.';
    } catch (err) {
      $('save-note').textContent = 'Import failed: that file is not a progress export from this guide.';
    }
  };
  reader.readAsText(file);
}

listEl.addEventListener('change', (event) => {
  const input = event.target.closest('[data-earn]');
  if (input) toggleEarned(Number(input.dataset.earn), input.checked);
});

listEl.addEventListener('click', (event) => {
  const btn = event.target.closest('[data-open]');
  if (!btn) return;
  const id = Number(btn.dataset.open);
  openId = openId === id ? null : id;
  renderList();
});

searchEl.addEventListener('input', renderList);
kindEl.addEventListener('change', renderList);
statusEl.addEventListener('change', renderList);
spoilerEl.addEventListener('change', () => {
  spoilerOn = spoilerEl.checked;
  saveState();
  renderList();
});

$('export-btn').addEventListener('click', exportProgress);
$('import-btn').addEventListener('click', () => $('import-file').click());
$('import-file').addEventListener('change', (event) => {
  const file = event.target.files && event.target.files[0];
  if (file) importProgress(file);
  event.target.value = '';
});
$('reset-btn').addEventListener('click', () => {
  if (window.confirm('Reset the whole checklist? Export first if you want to keep your progress.')) {
    earned = new Set();
    openId = null;
    saveState();
    renderAll();
    $('save-note').textContent = 'Checklist reset.';
  }
});

loadState();
spoilerEl.checked = spoilerOn;
fetch(DATA_URL)
  .then((res) => {
    if (!res.ok) throw new Error('trophies.json failed to load');
    return res.json();
  })
  .then((data) => {
    trophies = data.trophies || data;
    renderStageLists();
    renderAll();
  })
  .catch(() => {
    listEl.innerHTML = '<li class="trophy"><div class="row"><p class="guide">Could not load data/trophies.json. Serve the app/ folder over HTTP (for example, node serve.ts) and reload.</p></div></li>';
  });
