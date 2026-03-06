// ─── ESCAPE UTILITY ──────────────────────────────────────────────────────────
function esc(s){ const d=document.createElement('div'); d.textContent=String(s); return d.innerHTML; }

// ─── MONTH VIEW ──────────────────────────────────────────────────────────────
function renderMonth(){
  const{currentYear:y,currentMonth:m}=S;
  document.getElementById('month-title').textContent=`${MONTHS[m]} ${y}`;
  const c=calcMonthTotals(y,m), s=S.settings;
  const d=getMonth(y,m);
  const income=d.incomes.reduce((sum,tx)=>sum+(+tx.amount||0),0);
  const netSavings=income-c.needs-c.wants;
  const db=(v,b)=>{const diff=v-b; if(diff>0)return`<div class="month-stat-diff over">+$${diff.toFixed(0)} over</div>`; if(diff<0)return`<div class="month-stat-diff under">$${Math.abs(diff).toFixed(0)} under</div>`; return`<div class="month-stat-diff" style="color:var(--muted)">On budget</div>`;};
  const dbs=(v,b)=>{const diff=v-b; if(diff>0)return`<div class="month-stat-diff under">+$${diff.toFixed(0)} over</div>`; if(diff<0)return`<div class="month-stat-diff over">$${Math.abs(diff).toFixed(0)} under</div>`; return`<div class="month-stat-diff" style="color:var(--muted)">On budget</div>`;};
  const f=v=>v.toLocaleString('en-US',{maximumFractionDigits:0});
  const fs=v=>`${v<0?'-':''}$${f(Math.abs(v))}`;
  document.getElementById('month-summary').innerHTML=`
    <div class="month-stat"><div class="month-stat-lbl">Needs</div><div class="month-stat-val" style="color:var(--needs)">$${f(c.needs)}</div>${db(c.needs,s.needsBudget)}</div>
    <div class="month-stat"><div class="month-stat-lbl">Wants</div><div class="month-stat-val" style="color:var(--wants)">$${f(c.wants)}</div>${db(c.wants,s.wantsBudget)}</div>
    <div class="month-stat"><div class="month-stat-lbl">Savings</div><div class="month-stat-val" style="color:var(--savings)">${fs(netSavings)}</div>${dbs(netSavings,s.savingsBudget)}</div>`;
  renderExpenses(); renderIncomes();
}

function renderExpenses(){
  const{currentYear:y,currentMonth:m}=S;
  const data=getMonth(y,m), tbody=document.getElementById('expense-tbody');
  if(!data.expenses.length){tbody.innerHTML=`<tr class="empty-row"><td colspan="5">No expenses yet</td></tr>`;return;}
  tbody.innerHTML=data.expenses.map(tx=>{
    const amt=+tx.amount;
    const rawCat=tx.cat||'Needs';
    const cl=['needs','wants','savings'].includes(rawCat.toLowerCase())?rawCat.toLowerCase():'needs';
    return`<tr><td style="color:var(--muted);font-size:12px;">${esc(tx.date||'—')}</td><td class="amount-${cl}">${amt<0?'-':''}$${Math.abs(amt).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}</td><td>${esc(tx.desc||'—')}</td><td><span class="cat-badge ${cl}">${esc(rawCat)}</span></td><td><button class="del-btn" data-type="expense" data-id="${Number(tx.id)}">×</button></td></tr>`;
  }).join('');
}

function renderIncomes(){
  const{currentYear:y,currentMonth:m}=S;
  const data=getMonth(y,m), tbody=document.getElementById('income-tbody');
  if(!data.incomes.length){tbody.innerHTML=`<tr class="empty-row"><td colspan="4">No income yet</td></tr>`;return;}
  tbody.innerHTML=data.incomes.map(tx=>`<tr><td style="color:var(--muted);font-size:12px;">${esc(tx.date||'—')}</td><td style="color:var(--green)">$${(+tx.amount).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}</td><td>${esc(tx.desc||'—')}</td><td><button class="del-btn" data-type="income" data-id="${Number(tx.id)}">×</button></td></tr>`).join('');
}

function deleteTx(type,id){
  const{currentYear:y,currentMonth:m}=S, d=getMonth(y,m);
  if(type==='expense')d.expenses=d.expenses.filter(t=>t.id!==id);
  else d.incomes=d.incomes.filter(t=>t.id!==id);
  persist(); renderMonth(); buildMonthNav();
}

function openMonth(m,y){
  S.currentMonth=m; S.currentYear=y;
  switchView('month',null);
  document.querySelectorAll('.sidebar-nav li').forEach(li=>li.classList.remove('active'));
  const t=document.querySelector(`[data-month="${m}"]`);
  if(t)t.classList.add('active');
}

function navigateMonth(dir){
  S.currentMonth+=dir;
  if(S.currentMonth<0){S.currentMonth=11;S.currentYear--;}
  if(S.currentMonth>11){S.currentMonth=0;S.currentYear++;}
  renderMonth();
  document.querySelectorAll('.sidebar-nav li[data-month]').forEach(li=>li.classList.remove('active'));
  const t=document.querySelector(`[data-month="${S.currentMonth}"]`);
  if(t)t.classList.add('active');
}

// ─── DELETE BUTTON EVENT DELEGATION ─────────────────────────────────────────
document.getElementById('expense-tbody').addEventListener('click',function(e){
  const btn=e.target.closest('.del-btn');
  if(btn) deleteTx(btn.dataset.type, Number(btn.dataset.id));
});
document.getElementById('income-tbody').addEventListener('click',function(e){
  const btn=e.target.closest('.del-btn');
  if(btn) deleteTx(btn.dataset.type, Number(btn.dataset.id));
});

function buildMonthNav(){
  const nav=document.getElementById('month-nav'); nav.innerHTML='';
  MONTHS.forEach((name,i)=>{
    const li=document.createElement('li'); li.dataset.month=i;
    const d=S.months[mkey(S.currentYear,i)];
    if(d&&d.expenses.length>0)li.classList.add('has-data');
    li.innerHTML=`<div class="dot"></div>${name}`;
    li.onclick=()=>openMonth(i,S.currentYear);
    nav.appendChild(li);
  });
}
