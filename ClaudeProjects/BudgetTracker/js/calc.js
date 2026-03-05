// ─── FEDERAL TAX CALC ───────────────────────────────────────────────────────
function calcFed(taxableAnnual){
  const inc=Math.max(0,taxableAnnual-STD_DEDUCTION);
  let tax=0,prev=0;
  for(const b of FED_BRACKETS){
    if(inc<=prev)break;
    tax+=(Math.min(inc,b.limit)-prev)*b.rate;
    prev=b.limit;
  }
  return tax;
}

// ─── PAYCHECK CALCULATOR ────────────────────────────────────────────────────
function resetTaxes(){
  const c=S.calc;
  c.fedOverride=false; c.fedManual=715;
  c.stateDollar=123.79; c.localDollar=83.40;
  document.getElementById('c-fed-override').checked=false;
  document.getElementById('c-fed-manual').style.display='none';
  document.getElementById('c-state-dollar').value=123.79;
  document.getElementById('c-local-dollar').value=83.40;
  persist(); recalc();
}
function recalc(){
  const c=S.calc;
  c.salary     = +document.getElementById('c-salary').value||0;
  c.payfreq    = +document.getElementById('c-payfreq').value||24;
  c.k401pct    = +document.getElementById('c-401k-pct').value||0;
  c.hsa        = +document.getElementById('c-hsa').value||0;
  c.health     = +document.getElementById('c-health').value||0;
  c.dental     = +document.getElementById('c-dental').value||0;
  c.vision     = +document.getElementById('c-vision').value||0;
  c.gtl        = +document.getElementById('c-gtl').value||0;
  c.fedOverride= document.getElementById('c-fed-override').checked;
  c.fedManual  = +document.getElementById('c-fed-manual').value||0;
  c.stateDollar= +document.getElementById('c-state-dollar').value||0;
  c.localDollar= +document.getElementById('c-local-dollar').value||0;
  c.roth       = +document.getElementById('c-roth').value||0;
  c.otherPost  = +document.getElementById('c-other').value||0;

  const freq=c.payfreq;
  const grossPay=c.salary/freq;

  // Pre-tax per paycheck
  const k401Annual=c.salary*(c.k401pct/100);
  const k401Pay=k401Annual/freq;
  const preTaxPay=k401Pay+c.hsa+c.health+c.dental+c.vision+c.gtl;
  const taxablePay=grossPay-preTaxPay;
  const taxableAnnual=taxablePay*freq;

  // 401k badge
  const remaining=IRS_401K_LIMIT_2026-k401Annual;
  document.getElementById('cv-401k').textContent=`-$${k401Pay.toFixed(2)}`;

  // Federal
  const fedAnnual=c.fedOverride ? c.fedManual*freq : calcFed(taxableAnnual);
  const fedPay=fedAnnual/freq;
  const fedEl=document.getElementById('cv-fed-auto');
  const fedManEl=document.getElementById('c-fed-manual');
  fedEl.style.display=c.fedOverride?'none':'inline';
  fedManEl.style.display=c.fedOverride?'inline-block':'none';
  if(!c.fedOverride) fedEl.textContent=`-$${fedPay.toFixed(2)}`;

  // FICA
  const SS_WAGE_BASE_2026=184500;
  const ssPay=Math.min(grossPay,SS_WAGE_BASE_2026/freq)*0.062;
  const medPay=grossPay*0.0145;
  document.getElementById('cv-ss').textContent=`-$${ssPay.toFixed(2)}`;
  document.getElementById('cv-med').textContent=`-$${medPay.toFixed(2)}`;

  // State & local — flat dollar per paycheck from paystub
  const statePay = c.stateDollar;
  const localPay = c.localDollar;

  // Post-tax
  const postPay=c.roth+c.otherPost;

  // Take-home
  const takeHome=grossPay-preTaxPay-fedPay-ssPay-medPay-statePay-localPay-postPay;
  const monthlyNet=takeHome*freq/12;
  c._monthlyNet=monthlyNet;

  const effRate=grossPay>0?((fedPay+ssPay+medPay+statePay+localPay)/grossPay*100):0;

  // Result panel
  const $ = (v,d=2)=>`$${v.toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d})}`;
  document.getElementById('r-gross').textContent=$(grossPay);
  document.getElementById('r-pretax').textContent=`-${$(preTaxPay)}`;
  document.getElementById('r-taxable').textContent=$(taxablePay);
  document.getElementById('r-fed').textContent=`-${$(fedPay)}`;
  document.getElementById('r-state').textContent = statePay > 0 ? `-${$(statePay)}` : '—';
  document.getElementById('r-fica').textContent=`-${$((ssPay+medPay))}`;
  document.getElementById('r-local').textContent = localPay > 0 ? `-${$(localPay)}` : '—';
  document.getElementById('r-posttax').textContent=postPay>0?`-${$(postPay)}`:'—';
  document.getElementById('r-effrate').textContent=`${effRate.toFixed(1)}%`;
  document.getElementById('r-takehome').textContent=$(takeHome);
  document.getElementById('r-monthly').textContent=`${$(monthlyNet,0)} / month`;
  document.getElementById('cv-takehome').textContent=$(takeHome);

  recalcSplit();
  persist();
}

function recalcSplit(){
  const c=S.calc;
  c.spNeeds=+document.getElementById('sp-needs').value||0;
  c.spWants=+document.getElementById('sp-wants').value||0;
  c.spSave =+document.getElementById('sp-save').value||0;
  const total=c.spNeeds+c.spWants+c.spSave;
  document.getElementById('split-warn').style.display=Math.abs(total-100)>0.5?'block':'none';
  const m=c._monthlyNet||S.settings.paycheckAmount*S.settings.paycheckCount;
  document.getElementById('sa-needs').textContent=`$${(m*c.spNeeds/100).toFixed(0)}`;
  document.getElementById('sa-wants').textContent=`$${(m*c.spWants/100).toFixed(0)}`;
  document.getElementById('sa-save').textContent =`$${(m*c.spSave/100).toFixed(0)}`;
  document.getElementById('bar-needs').style.width=Math.min(c.spNeeds,100)+'%';
  document.getElementById('bar-wants').style.width=Math.min(c.spWants,100)+'%';
  document.getElementById('bar-save').style.width =Math.min(c.spSave,100)+'%';
}

function applyToTracker(){
  const c=S.calc;
  const m=c._monthlyNet||S.settings.paycheckAmount*S.settings.paycheckCount;
  S.settings.needsBudget  =parseFloat((m*c.spNeeds/100).toFixed(2));
  S.settings.wantsBudget  =parseFloat((m*c.spWants/100).toFixed(2));
  S.settings.savingsBudget=parseFloat((m*c.spSave/100).toFixed(2));
  // derive paycheck amount from calc
  const freq=c.payfreq;
  const grossPay=c.salary/freq;
  const k401Pay=(c.salary*(c.k401pct/100))/freq;
  const preTax=k401Pay+c.hsa+c.health+c.dental+c.vision+c.gtl;
  const taxable=grossPay-preTax;
  const fedAnnual=c.fedOverride?c.fedManual*freq:calcFed(taxable*freq);
  const fedPay=fedAnnual/freq;
  const ss=grossPay*0.062, med=grossPay*0.0145;
  const st=c.stateDollar;
  const loc=c.localDollar;
  const post=c.roth+c.otherPost;
  const takeHome=grossPay-preTax-fedPay-ss-med-st-loc-post;
  S.settings.paycheckAmount=parseFloat(takeHome.toFixed(2));
  S.settings.paycheckCount=freq===24?2:freq===26?2:freq===12?1:4;
  persist();
  const btn=document.getElementById('apply-btn');
  btn.textContent='✓ Applied!'; btn.style.background='var(--green)';
  setTimeout(()=>{ btn.textContent='Apply to Budget Tracker →'; btn.style.background='var(--accent)'; },2500);
}

function loadCalcUI(){
  const c=S.calc;
  document.getElementById('c-salary').value=c.salary;
  document.getElementById('c-payfreq').value=c.payfreq;
  document.getElementById('c-401k-pct').value=c.k401pct;
  document.getElementById('c-hsa').value=c.hsa;
  document.getElementById('c-health').value=c.health;
  document.getElementById('c-dental').value=c.dental;
  document.getElementById('c-vision').value=c.vision;
  document.getElementById('c-gtl').value=c.gtl;
  document.getElementById('c-fed-override').checked=c.fedOverride;
  document.getElementById('c-fed-manual').value=c.fedManual;
  document.getElementById('c-state-dollar').value=c.stateDollar;
  document.getElementById('c-local-dollar').value=c.localDollar;
  document.getElementById('c-roth').value=c.roth;
  document.getElementById('c-other').value=c.otherPost;
  document.getElementById('sp-needs').value=c.spNeeds;
  document.getElementById('sp-wants').value=c.spWants;
  document.getElementById('sp-save').value=c.spSave;
}
