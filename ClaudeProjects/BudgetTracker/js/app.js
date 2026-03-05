// ─── NAVIGATION ─────────────────────────────────────────────────────────────
function switchView(id, el){
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.getElementById(`view-${id}`).classList.add('active');
  document.querySelectorAll('.sidebar-nav li').forEach(li=>li.classList.remove('active'));
  if(el) el.classList.add('active');
  document.querySelectorAll('.tab-item').forEach(t=>t.classList.remove('active'));
  const tab=document.querySelector(`.tab-item[data-view="${id}"]`);
  if(tab) tab.classList.add('active');
  if(id==='dashboard') renderDashboard();
  if(id==='calculator'){ loadCalcUI(); recalc(); }
  if(id==='month') renderMonth();
}

function changeYear(dir){
  S.currentYear+=dir;
  document.getElementById('chart-year-label').textContent=S.currentYear;
  renderDashboard();
}

// ─── SYNC MODAL ──────────────────────────────────────────────────────────────
function openSyncModal(){
  const cfg=loadSyncConfig();
  document.getElementById('sync-modal-token').value = cfg.token||'';
  document.getElementById('sync-modal-gist-id').value = cfg.gistId||'';
  document.getElementById('sync-modal').classList.add('open');
}

function closeSyncModal(){
  document.getElementById('sync-modal').classList.remove('open');
}

function closeSyncModalOutside(e){
  if(e.target===document.getElementById('sync-modal')) closeSyncModal();
}

function saveSyncModal(){
  const token=document.getElementById('sync-modal-token').value.trim();
  const gistId=document.getElementById('sync-modal-gist-id').value.trim();
  if(!token){ alert('Enter a GitHub token.'); return; }
  const existing=loadSyncConfig();
  saveSyncConfig({ token, gistId: gistId||existing.gistId||'' });
  closeSyncModal();
  pushToGist();
}

function disconnectSync(){
  if(!confirm('Remove sync credentials from this device?')) return;
  saveSyncConfig({});
  closeSyncModal();
  updateSyncBadge('off','Sync off');
}

// ─── KEYBOARD SHORTCUTS ──────────────────────────────────────────────────────
document.addEventListener('keydown',e=>{
  if(e.key==='Enter'&&document.getElementById('modal-overlay').classList.contains('open')) saveTransaction();
  if(e.key==='Escape'){ closeModal(); closeSyncModal(); }
});

// ─── INIT ─────────────────────────────────────────────────────────────────────
hydrate();
document.getElementById('chart-year-label').textContent=S.currentYear;
document.getElementById('starting-savings').value=S.settings.startingSavings||0;
buildMonthNav();
renderDashboard();
initSyncBadge();
pullFromGist();
