// ─── NAVIGATION ─────────────────────────────────────────────────────────────
function switchView(id, el){
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.getElementById(`view-${id}`).classList.add('active');
  document.querySelectorAll('.sidebar-nav li').forEach(li=>li.classList.remove('active'));
  if(el) el.classList.add('active');
  if(id==='dashboard') renderDashboard();
  if(id==='calculator'){ loadCalcUI(); recalc(); }
  if(id==='month') renderMonth();
  if(id==='settings') loadSettingsUI();
}

function changeYear(dir){
  S.currentYear+=dir;
  document.getElementById('chart-year-label').textContent=S.currentYear;
  renderDashboard();
}

// ─── KEYBOARD SHORTCUTS ──────────────────────────────────────────────────────
document.addEventListener('keydown',e=>{
  if(e.key==='Enter'&&document.getElementById('modal-overlay').classList.contains('open'))saveTransaction();
  if(e.key==='Escape')closeModal();
});

// ─── INIT ─────────────────────────────────────────────────────────────────────
hydrate();
document.getElementById('chart-year-label').textContent=S.currentYear;
buildMonthNav();
renderDashboard();
loadSyncUI();
