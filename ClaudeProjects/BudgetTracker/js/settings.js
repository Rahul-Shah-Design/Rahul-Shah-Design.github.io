function loadSettingsUI(){
  const s=S.settings;
  document.getElementById('set-needs').value=s.needsBudget;
  document.getElementById('set-wants').value=s.wantsBudget;
  document.getElementById('set-savings-target').value=s.savingsBudget;
  document.getElementById('set-starting-savings').value=s.startingSavings||0;
  document.getElementById('set-paycheck').value=s.paycheckAmount;
  document.getElementById('set-paycheck-count').value=s.paycheckCount;
}

function saveSettings(){
  S.settings.needsBudget    = +document.getElementById('set-needs').value||2015;
  S.settings.wantsBudget    = +document.getElementById('set-wants').value||605;
  S.settings.savingsBudget  = +document.getElementById('set-savings-target').value||1411;
  S.settings.startingSavings= +document.getElementById('set-starting-savings').value||0;
  S.settings.paycheckAmount = +document.getElementById('set-paycheck').value||1818;
  S.settings.paycheckCount  = +document.getElementById('set-paycheck-count').value||2;
  persist();
  const btn = event.target;
  btn.textContent='✓ Saved!'; btn.style.background='var(--green)';
  setTimeout(()=>{ btn.textContent='Save Settings'; btn.style.background='var(--accent)'; },2000);
}
