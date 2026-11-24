'use strict';
/* ================= DADOS ================= */
const LS_KEY = 'gymsync:data';
const LS_SESSION = 'gymsync:session';
const GIST_FILE = 'gymsync.json';
const $ = id => document.getElementById(id);
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

const ex = (name, sets, reps, alternatives) => ({ id: uid(), name, sets, reps, alternatives });
function defaultRoutine() {
  return {
    A: { label: 'A', title: 'Peito e Tríceps', exercises: [
      ex('Supino Reto Barra', 4, '8-12', ['Supino Reto Halteres', 'Supino Máquina']),
      ex('Supino Inclinado Halteres', 3, '8-12', ['Supino Inclinado Barra', 'Supino Inclinado Máquina']),
      ex('Crucifixo Máquina (Peck Deck)', 3, '10-15', ['Crucifixo Halteres', 'Crossover na Polia']),
      ex('Tríceps Pulley Corda', 3, '10-12', ['Tríceps Pulley Barra', 'Tríceps Francês Halter']),
      ex('Tríceps Testa', 3, '8-12', ['Tríceps Testa Polia', 'Mergulho no Banco'])] },
    B: { label: 'B', title: 'Costas e Bíceps', exercises: [
      ex('Puxada Frontal', 4, '8-12', ['Barra Fixa Assistida', 'Puxada Triângulo']),
      ex('Remada Curvada Barra', 3, '8-12', ['Remada Curvada Halteres', 'Remada Cavalinho']),
      ex('Remada Baixa Triângulo', 3, '10-12', ['Remada Máquina', 'Remada Unilateral Halter']),
      ex('Rosca Scott Máquina', 3, '8-12', ['Rosca Scott na Polia', 'Rosca Direta Halteres']),
      ex('Rosca Martelo', 3, '10-12', ['Rosca Martelo Corda Polia', 'Rosca Alternada'])] },
    C: { label: 'C', title: 'Pernas Completo', exercises: [
      ex('Agachamento Livre', 4, '8-12', ['Agachamento Smith', 'Hack Squat']),
      ex('Leg Press 45°', 4, '10-12', ['Leg Press Horizontal', 'Agachamento Sumô']),
      ex('Cadeira Extensora', 3, '12-15', ['Extensora Unilateral', 'Sissy Squat']),
      ex('Mesa Flexora', 3, '10-12', ['Cadeira Flexora', 'Stiff Halteres']),
      ex('Panturrilha em Pé', 4, '12-20', ['Panturrilha Sentado', 'Panturrilha no Leg Press'])] },
    D: { label: 'D', title: 'Ombros e Abdômen', exercises: [
      ex('Desenvolvimento Halteres', 4, '8-12', ['Desenvolvimento Máquina', 'Desenvolvimento Barra']),
      ex('Elevação Lateral', 4, '12-15', ['Elevação Lateral Polia', 'Elevação Lateral Máquina']),
      ex('Elevação Frontal', 3, '10-12', ['Elevação Frontal Polia', 'Elevação Frontal Anilha']),
      ex('Abdominal Supra', 3, '15-20', ['Abdominal Máquina', 'Abdominal Declinado']),
      ex('Prancha', 3, '30-60s', ['Prancha Lateral', 'Elevação de Pernas'])] }
  };
}

let state = load();
function load() {
  try { const d = JSON.parse(localStorage.getItem(LS_KEY)); if (d && d.routine) return d; } catch (e) {}
  return { routine: defaultRoutine(), history: [], settings: { token: '', gistId: '' }, updatedAt: 0 };
}
function save(touch = true) {
  if (touch) state.updatedAt = Date.now();
  localStorage.setItem(LS_KEY, JSON.stringify(state));
}

let session = (() => { try { return JSON.parse(localStorage.getItem(LS_SESSION)); } catch (e) { return null; } })();
function saveSession() {
  if (session) localStorage.setItem(LS_SESSION, JSON.stringify(session));
  else localStorage.removeItem(LS_SESSION);
}
let currentDay = session ? session.day : 'A';
let currentTab = 'treino';

/* ================= HELPERS ================= */
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmtDur = ms => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60].map(n => String(n).padStart(2, '0')).join(':');
};
const fmtNum = n => (Math.round(n * 100) / 100).toLocaleString('pt-BR');

/** Última sessão que contém o exercício -> melhor série (maior carga). */
function lastRecord(name) {
  for (let i = state.history.length - 1; i >= 0; i--) {
    const h = state.history[i];
    const e = h.exercises.find(x => x.name === name);
    if (e) {
      const done = e.sets.filter(s => s.w > 0 || s.r > 0);
      if (!done.length) continue;
      const best = done.reduce((a, b) => (b.w > a.w || (b.w === a.w && b.r > a.r)) ? b : a);
      return { w: best.w, r: best.r, sets: done };
    }
  }
  return null;
}
const sortedHistory = () => [...state.history].sort((a, b) => a.start - b.start);
function histAsc() { state.history.sort((a, b) => a.start - b.start); }

function makeSets(name, count) {
  const last = lastRecord(name);
  return Array.from({ length: count }, (_, i) => {
    const ls = last && (last.sets[i] || last.sets[last.sets.length - 1]);
    return { w: ls ? ls.w : 0, r: ls ? ls.r : 0, done: false };
  });
}

/* ================= TABS ================= */
function showTab(t) {
  currentTab = t;
  ['treino', 'progresso', 'ajustes'].forEach(x => $('tab-' + x).classList.toggle('hidden', x !== t));
  document.querySelectorAll('.navbtn').forEach(b => {
    const on = b.dataset.tab === t;
    b.classList.toggle('text-lime-400', on);
    b.classList.toggle('text-zinc-400', !on);
  });
  if (t === 'progresso') renderProgress();
  if (t === 'ajustes') { $('token').value = state.settings.token; $('gistId').value = state.settings.gistId; }
}
document.querySelectorAll('.navbtn').forEach(b => b.onclick = () => showTab(b.dataset.tab));

/* ================= TREINO ================= */
function renderDayTabs() {
  $('dayTabs').innerHTML = Object.keys(state.routine).map(k => {
    const on = k === currentDay;
    const locked = session && session.day !== k;
    return `<button data-day="${k}" ${locked ? 'disabled' : ''} class="btn py-3 rounded-xl font-extrabold text-lg border ${on ? 'bg-lime-400 text-black border-lime-400' : 'bg-zinc-900 text-white border-zinc-700'} ${locked ? 'opacity-30' : ''}">${k}</button>`;
  }).join('');
  $('dayTabs').querySelectorAll('button').forEach(b => b.onclick = () => { currentDay = b.dataset.day; renderTreino(); });
}

function renderTreino() {
  renderDayTabs();
  const day = state.routine[currentDay];
  $('dayTitle').textContent = `Treino ${currentDay} — ${day.title}`;
  const active = session && session.day === currentDay;
  const list = active ? session.exercises : day.exercises.map(e => ({ baseId: e.id, name: e.name, sets: null, target: e.sets, reps: e.reps }));

  $('exercises').innerHTML = list.map((e, ei) => {
    const base = day.exercises.find(x => x.id === e.baseId);
    const last = lastRecord(e.name);
    const badge = last ? `Último: ${fmtNum(last.w)}kg x ${last.r} reps` : 'Sem registro';
    const swapped = active && base && base.name !== e.name;
    const sets = active ? e.sets : makeSets(e.name, e.target);
    return `<div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
      <div class="flex justify-between items-start gap-2">
        <div class="min-w-0">
          <h3 class="font-bold text-base leading-tight">${esc(e.name)}</h3>
          <p class="text-sm text-zinc-300 mt-0.5">${e.target}x ${esc(e.reps)}${swapped ? ` <span class="text-amber-400">• substituiu ${esc(base.name)}</span>` : ''}</p>
          <span class="inline-block mt-1 text-xs font-bold px-2 py-1 rounded-full bg-zinc-800 ${last ? 'text-lime-300' : 'text-zinc-400'}">${badge}</span>
        </div>
        ${active ? `<button data-swap="${ei}" class="btn shrink-0 text-sm font-bold px-3 py-2 rounded-lg border border-amber-400 text-amber-400">Substituir</button>` : ''}
      </div>
      <div class="mt-3 space-y-2">
        ${sets.map((s, si) => setRow(ei, si, s, active)).join('')}
      </div>
    </div>`;
  }).join('');

  $('sessionBtn').textContent = active ? '■ Finalizar Sessão' : (session ? `Sessão em andamento (Treino ${session.day})` : '▶ Iniciar Sessão');
  $('sessionBtn').className = 'btn w-full py-4 rounded-xl text-lg font-extrabold ' + (active ? 'bg-red-500 text-white' : 'bg-lime-400 text-black');
  $('sessionBtn').disabled = !!session && !active;
  $('cancelBtn').classList.toggle('hidden', !session);
}

function setRow(ei, si, s, active) {
  const d = active ? '' : 'disabled';
  const stepBtn = (kind, dir, label) => `<button ${d} data-step="${kind}" data-dir="${dir}" data-e="${ei}" data-s="${si}" class="btn w-11 h-12 rounded-lg bg-zinc-800 text-2xl font-bold">${label}</button>`;
  const inp = (kind, val, step) => `<input ${d} data-in="${kind}" data-e="${ei}" data-s="${si}" type="number" inputmode="decimal" min="0" step="${step}" value="${val || ''}" placeholder="0" class="w-full min-w-0 h-12 text-center text-lg font-bold bg-black border border-zinc-700 rounded-lg">`;
  return `<div class="flex items-center gap-1.5 p-1.5 rounded-xl border border-zinc-800 ${s.done ? 'set-done' : ''}">
    <span class="w-6 text-center text-sm font-extrabold text-zinc-400">${si + 1}</span>
    <div class="flex items-center flex-1 gap-1 min-w-0">${stepBtn('w', -1, '−')}${inp('w', s.w, 0.5)}${stepBtn('w', 1, '+')}<span class="text-xs text-zinc-500">kg</span></div>
    <div class="flex items-center flex-1 gap-1 min-w-0">${stepBtn('r', -1, '−')}${inp('r', s.r, 1)}${stepBtn('r', 1, '+')}</div>
    <input ${d} data-done="1" data-e="${ei}" data-s="${si}" type="checkbox" ${s.done ? 'checked' : ''} class="w-8 h-8 accent-lime-400 shrink-0">
  </div>`;
}

// delegação de eventos
$('exercises').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b || !session) return;
  if (b.dataset.swap !== undefined) return openSwap(+b.dataset.swap);
  if (b.dataset.step) {
    const s = session.exercises[+b.dataset.e].sets[+b.dataset.s];
    const k = b.dataset.step, dir = +b.dataset.dir;
    s[k] = Math.max(0, +(( s[k] || 0) + dir * (k === 'w' ? 2.5 : 1)).toFixed(2));
    saveSession(); renderTreino();
  }
});
$('exercises').addEventListener('change', e => {
  const t = e.target; if (!session) return;
  const s = session.exercises[+t.dataset.e]?.sets[+t.dataset.s]; if (!s) return;
  if (t.dataset.in) s[t.dataset.in] = Math.max(0, parseFloat(String(t.value).replace(',', '.')) || 0);
  if (t.dataset.done) s.done = t.checked;
  saveSession(); renderTreino();
});

$('sessionBtn').onclick = () => session ? confirmFinish() : startSession();
$('cancelBtn').onclick = () => {
  openModal(`<h3 class="text-xl font-bold mb-2">Cancelar sessão?</h3><p class="text-zinc-400 mb-4">Os dados desta sessão serão descartados.</p>
  <div class="grid grid-cols-2 gap-2"><button class="btn py-3 rounded-xl bg-zinc-800 font-bold" onclick="closeModal()">Voltar</button>
  <button class="btn py-3 rounded-xl bg-red-500 font-bold" id="yesCancel">Descartar</button></div>`);
  $('yesCancel').onclick = () => { session = null; saveSession(); closeModal(); renderTreino(); tick(); };
};

function startSession() {
  const day = state.routine[currentDay];
  session = {
    day: currentDay, start: Date.now(),
    exercises: day.exercises.map(e => ({ baseId: e.id, name: e.name, target: e.sets, reps: e.reps, sets: makeSets(e.name, e.sets) }))
  };
  saveSession(); renderTreino(); tick();
}

/* ---------- Substituição ---------- */
function openSwap(ei) {
  const e = session.exercises[ei];
  const base = state.routine[session.day].exercises.find(x => x.id === e.baseId);
  const opts = [base.name, ...base.alternatives].filter(n => n !== e.name);
  openModal(`<h3 class="text-xl font-bold mb-1">Substituir exercício</h3>
    <p class="text-sm text-zinc-400 mb-3">Atual: ${esc(e.name)} (vale só para esta sessão)</p>
    <div class="space-y-2 mb-3">${opts.map((o, i) => {
      const l = lastRecord(o);
      return `<label class="flex items-center gap-3 p-3 rounded-xl border border-zinc-700 bg-zinc-900">
        <input type="radio" name="alt" value="${esc(o)}" ${i === 0 ? 'checked' : ''} class="accent-lime-400 w-5 h-5">
        <span class="flex-1 font-semibold">${esc(o)}</span>
        <span class="text-xs text-zinc-400">${l ? fmtNum(l.w) + 'kg x ' + l.r : ''}</span></label>`;
    }).join('')}
      <label class="flex items-center gap-3 p-3 rounded-xl border border-zinc-700 bg-zinc-900">
        <input type="radio" name="alt" value="__custom" class="accent-lime-400 w-5 h-5">
        <input id="customEx" placeholder="Digitar outro exercício" class="flex-1 min-w-0 bg-black border border-zinc-700 rounded-lg p-2" oninput="document.querySelector('input[value=__custom]').checked=true"></label>
    </div>
    <div class="grid grid-cols-2 gap-2"><button class="btn py-3 rounded-xl bg-zinc-800 font-bold" onclick="closeModal()">Cancelar</button>
    <button id="confirmSwap" class="btn py-3 rounded-xl bg-lime-400 text-black font-extrabold">Confirmar</button></div>`);
  $('confirmSwap').onclick = () => {
    let v = document.querySelector('input[name=alt]:checked')?.value;
    if (v === '__custom') v = $('customEx').value.trim();
    if (!v) return;
    e.name = v;
    e.sets = makeSets(v, e.target); // puxa histórico do substituto
    saveSession(); closeModal(); renderTreino();
  };
}

/* ---------- Finalizar ---------- */
function confirmFinish() {
  const pending = session.exercises.reduce((n, e) => n + e.sets.filter(s => !s.done).length, 0);
  if (!pending) return finishSession();
  openModal(`<h3 class="text-xl font-bold mb-2">Finalizar sessão?</h3>
    <p class="text-zinc-400 mb-4">${pending} série(s) não concluída(s) — elas não contarão no volume nem serão salvas.</p>
    <div class="grid grid-cols-2 gap-2"><button class="btn py-3 rounded-xl bg-zinc-800 font-bold" onclick="closeModal()">Voltar</button>
    <button id="yesFinish" class="btn py-3 rounded-xl bg-red-500 font-bold">Finalizar</button></div>`);
  $('yesFinish').onclick = finishSession;
}

function finishSession() {
  const end = Date.now();
  const exercises = session.exercises
    .map(e => ({ name: e.name, sets: e.sets.filter(s => s.done).map(s => ({ w: s.w, r: s.r })) }))
    .filter(e => e.sets.length);
  // recordes: compara com histórico anterior (somente se já existia registro)
  const prs = [];
  exercises.forEach(e => {
    const prev = state.history.flatMap(h => h.exercises.filter(x => x.name === e.name));
    if (!prev.length) return;
    const prevMax = Math.max(0, ...prev.flatMap(x => x.sets.map(s => s.w)));
    const curMax = Math.max(...e.sets.map(s => s.w));
    if (curMax > prevMax) prs.push({ name: e.name, w: curMax });
  });
  const volume = exercises.reduce((v, e) => v + e.sets.reduce((a, s) => a + s.w * s.r, 0), 0);
  const entry = { id: uid(), day: session.day, title: state.routine[session.day].title, start: session.start, end, duration: end - session.start, volume, exercises };
  if (exercises.length) { state.history.push(entry); histAsc(); save(); }
  session = null; saveSession();
  renderTreino(); tick();

  openModal(`<h3 class="text-2xl font-extrabold text-lime-400 mb-3">Treino finalizado! 💪</h3>
    <div class="grid grid-cols-2 gap-3 mb-3">
      <div class="bg-zinc-900 rounded-xl p-3"><p class="text-xs text-zinc-400 font-bold uppercase">Tempo total</p><p class="text-2xl font-extrabold font-mono">${fmtDur(entry.duration)}</p></div>
      <div class="bg-zinc-900 rounded-xl p-3"><p class="text-xs text-zinc-400 font-bold uppercase">Volume total</p><p class="text-2xl font-extrabold">${fmtNum(volume)} kg</p></div>
    </div>
    <p class="font-bold mb-1">🏆 Recordes batidos: ${prs.length}</p>
    <ul class="text-sm text-amber-300 mb-3 space-y-1">${prs.map(p => `<li>${esc(p.name)} — ${fmtNum(p.w)} kg</li>`).join('') || '<li class="text-zinc-500">Nenhum desta vez.</li>'}</ul>
    <p id="finishSync" class="text-sm text-zinc-400 mb-3">${exercises.length ? '' : 'Nenhuma série concluída; nada foi salvo.'}</p>
    <button class="btn w-full py-3 rounded-xl bg-lime-400 text-black font-extrabold" onclick="closeModal()">Fechar</button>`);
  if (exercises.length && state.settings.token) {
    $('finishSync').textContent = '☁️ Sincronizando...';
    sync().then(m => { const el = $('finishSync'); if (el) el.textContent = m; });
  } else if (exercises.length) $('finishSync').textContent = 'Sync desativado (configure o token em Ajustes).';
}

/* ================= TIMER ================= */
function tick() { $('timer').textContent = session ? fmtDur(Date.now() - session.start) : '00:00:00'; $('timer').classList.toggle('text-lime-400', !!session); }
setInterval(tick, 1000);

/* ================= MODAL ================= */
function openModal(html) { $('modalBox').innerHTML = html; $('modal').classList.remove('hidden'); $('modal').classList.add('flex'); }
function closeModal() { $('modal').classList.add('hidden'); $('modal').classList.remove('flex'); }
$('modal').addEventListener('click', e => { if (e.target === $('modal')) closeModal(); });

/* ================= PROGRESSO ================= */
let chart;
function renderProgress() {
  const names = [...new Set(state.history.flatMap(h => h.exercises.map(e => e.name)))].sort((a, b) => a.localeCompare(b));
  const prevSel = $('exSelect').value;
  $('exSelect').innerHTML = names.map(n => `<option>${esc(n)}</option>`).join('');
  if (names.includes(prevSel)) $('exSelect').value = prevSel;
  $('progEmpty').classList.toggle('hidden', names.length > 0);
  $('progBody').classList.toggle('hidden', !names.length);
  $('exSelect').classList.toggle('hidden', !names.length);
  if (!names.length) return;

  const name = $('exSelect').value;
  const pts = sortedHistory().map(h => {
    const e = h.exercises.find(x => x.name === name); if (!e) return null;
    return { date: new Date(h.start).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      max: Math.max(...e.sets.map(s => s.w)), vol: e.sets.reduce((a, s) => a + s.w * s.r, 0) };
  }).filter(Boolean);
  $('prLoad').textContent = fmtNum(Math.max(...pts.map(p => p.max))) + ' kg';
  $('prVol').textContent = fmtNum(Math.max(...pts.map(p => p.vol))) + ' kg';

  if (typeof Chart === 'undefined') return;
  if (chart) chart.destroy();
  const grid = { color: '#27272a' }, tick = { color: '#d4d4d8' };
  chart = new Chart($('chart'), {
    type: 'line',
    data: { labels: pts.map(p => p.date), datasets: [
      { label: 'Carga máx (kg)', data: pts.map(p => p.max), borderColor: '#a3e635', backgroundColor: '#a3e635', yAxisID: 'y', tension: .25, pointRadius: 4 },
      { label: 'Volume (kg)', data: pts.map(p => p.vol), borderColor: '#fbbf24', backgroundColor: '#fbbf24', yAxisID: 'y1', tension: .25, pointRadius: 4 }] },
    options: { responsive: true, interaction: { mode: 'index', intersect: false },
      plugins: { legend: { labels: { color: '#fff' } } },
      scales: { x: { ticks: tick, grid },
        y: { position: 'left', ticks: tick, grid, title: { display: true, text: 'Carga', color: '#a3e635' } },
        y1: { position: 'right', ticks: tick, grid: { drawOnChartArea: false }, title: { display: true, text: 'Volume', color: '#fbbf24' } } } }
  });
}
$('exSelect').onchange = renderProgress;

/* ================= SYNC (GitHub Gist) ================= */
function setStatus(t) { $('syncStatus').textContent = t; }
function mergeData(remote) {
  const ids = new Set(state.history.map(h => h.id));
  (remote.history || []).forEach(h => { if (!ids.has(h.id)) state.history.push(h); });
  histAsc();
  if ((remote.updatedAt || 0) > (state.updatedAt || 0) && remote.routine) state.routine = remote.routine;
}
async function gh(path, opts = {}) {
  const r = await fetch('https://api.github.com' + path, { ...opts, headers: {
    Authorization: 'Bearer ' + state.settings.token, Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json', ...(opts.headers || {}) } });
  if (!r.ok) throw new Error(r.status === 401 ? 'Token inválido (401)' : r.status === 404 ? 'Gist não encontrado (404)' : 'Erro ' + r.status);
  return r.json();
}
let syncing = false;
async function sync() {
  const { token } = state.settings;
  if (!token) return 'Informe o token em Ajustes.';
  if (!navigator.onLine) { setStatus('Offline — sync pendente'); return 'Sem conexão. Dados salvos localmente.'; }
  if (syncing) return 'Sync em andamento...';
  syncing = true; setStatus('Sincronizando...');
  try {
    if (state.settings.gistId) {
      const g = await gh('/gists/' + state.settings.gistId);
      const f = g.files[GIST_FILE];
      if (f) {
        const content = f.truncated ? await (await fetch(f.raw_url)).text() : f.content;
        mergeData(JSON.parse(content));
      }
    }
    save(false);
    const body = { history: state.history, routine: state.routine, updatedAt: state.updatedAt };
    const files = { [GIST_FILE]: { content: JSON.stringify(body) } };
    if (state.settings.gistId) await gh('/gists/' + state.settings.gistId, { method: 'PATCH', body: JSON.stringify({ files }) });
    else {
      const g = await gh('/gists', { method: 'POST', body: JSON.stringify({ description: 'GymSync data', public: false, files }) });
      state.settings.gistId = g.id; save(false); $('gistId').value = g.id;
    }
    const t = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    setStatus('Sincronizado ' + t);
    renderTreino(); if (currentTab === 'progresso') renderProgress();
    return '✅ Sincronizado às ' + t;
  } catch (e) {
    setStatus('Erro de sync');
    return '❌ ' + e.message;
  } finally { syncing = false; }
}

$('saveSettings').onclick = () => {
  state.settings.token = $('token').value.trim();
  state.settings.gistId = $('gistId').value.trim();
  save(false); $('syncMsg').textContent = 'Ajustes salvos.';
};
$('syncNow').onclick = async () => {
  state.settings.token = $('token').value.trim();
  state.settings.gistId = $('gistId').value.trim();
  save(false);
  $('syncMsg').textContent = 'Sincronizando...';
  $('syncMsg').textContent = await sync();
};
$('exportBtn').onclick = () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' }));
  a.download = 'gymsync-backup.json'; a.click();
};
window.addEventListener('online', () => setStatus('Online'));
window.addEventListener('offline', () => setStatus('Offline'));

/* ================= INIT ================= */
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
setStatus(navigator.onLine ? 'Online' : 'Offline');
renderTreino(); tick(); showTab('treino');
if (state.settings.token && state.settings.gistId && !session) sync(); // puxa dados ao abrir
