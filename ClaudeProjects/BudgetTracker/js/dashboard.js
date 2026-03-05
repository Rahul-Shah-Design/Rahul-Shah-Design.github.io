// ─── DASHBOARD ───────────────────────────────────────────────────────────────
function calcMonthTotals(y,m){
  const d=getMonth(y,m); let n=0,w=0,s=0;
  for(const tx of d.expenses){ const a=+tx.amount||0; if(tx.cat==='Needs')n+=a; else if(tx.cat==='Wants')w+=a; else if(tx.cat==='Savings')s+=a; }
  return{needs:n,wants:w,savings:s};
}

function renderStats(){
  const now=new Date(), cy=now.getFullYear(), cm=now.getMonth();
  const c=calcMonthTotals(cy,cm);
  const d=getMonth(cy,cm);
  const income=d.incomes.reduce((sum,tx)=>sum+(+tx.amount||0),0);
  const netSavings=income-c.needs-c.wants-c.savings;
  const nb=S.settings.needsBudget, wb=S.settings.wantsBudget, sb=S.settings.savingsBudget;
  const pct=(v,b)=>Math.min(100,Math.round(Math.abs(v)/Math.max(b,1)*100));
  const diff=(v,b)=>{const d=v-b; return d>0?`<span class="over">+$${d.toFixed(0)} over</span>`:`<span class="under">$${Math.abs(d).toFixed(0)} under</span>`;};
  const diffs=(v,b)=>{const d=v-b; return d>0?`<span class="under">+$${d.toFixed(0)} over</span>`:`<span class="over">$${Math.abs(d).toFixed(0)} under</span>`;};
  const f=v=>v.toLocaleString('en-US',{maximumFractionDigits:0});
  const fs=v=>`${v<0?'-':''}$${f(Math.abs(v))}`;
  const mo=MONTHS[cm];
  document.getElementById('stat-row').innerHTML=`
    <div class="stat-card"><div class="stat-label"><div class="badge" style="background:var(--needs)"></div>${mo} Needs</div><div class="stat-value" style="color:var(--needs)">$${f(c.needs)}</div><div class="stat-sub">${diff(c.needs,nb)} vs budget</div><div class="stat-bar"><div class="stat-bar-fill" style="width:${pct(c.needs,nb)}%;background:var(--needs)"></div></div></div>
    <div class="stat-card"><div class="stat-label"><div class="badge" style="background:var(--wants)"></div>${mo} Wants</div><div class="stat-value" style="color:var(--wants)">$${f(c.wants)}</div><div class="stat-sub">${diff(c.wants,wb)} vs budget</div><div class="stat-bar"><div class="stat-bar-fill" style="width:${pct(c.wants,wb)}%;background:var(--wants)"></div></div></div>
    <div class="stat-card"><div class="stat-label"><div class="badge" style="background:var(--savings)"></div>${mo} Savings</div><div class="stat-value" style="color:var(--savings)">${fs(netSavings)}</div><div class="stat-sub">${diffs(netSavings,sb)} vs target</div><div class="stat-bar"><div class="stat-bar-fill" style="width:${pct(netSavings,sb)}%;background:var(--savings)"></div></div></div>`;
}

let chart=null;
function renderChart(){
  const nd=[],wd=[],cs=[]; let run=S.settings.startingSavings||0;
  for(let m=0;m<12;m++){const c=calcMonthTotals(S.currentYear,m);nd.push(c.needs);wd.push(c.wants);run+=c.savings;cs.push(run);}
  const nb=Array(12).fill(S.settings.needsBudget), wb=Array(12).fill(S.settings.wantsBudget);
  const ctx=document.getElementById('mainChart').getContext('2d');
  if(chart)chart.destroy();

  // Determine left axis max so right = 10x left
  const leftMax = Math.max(...nd, ...wb, S.settings.needsBudget) * 1.2;
  const leftStep = Math.ceil(leftMax / 4 / 500) * 500 || 500;
  const leftTicks = [0, leftStep, leftStep*2, leftStep*3, leftStep*4];
  const rightTicks = leftTicks.map(v => v * 10);

  chart=new Chart(ctx,{
    data:{labels:MONTH_SHORT,datasets:[
      {type:'bar',label:'Needs',data:nd,backgroundColor:'rgba(74,144,226,0.75)',borderRadius:4,yAxisID:'y',order:2},
      {type:'bar',label:'Wants',data:wd,backgroundColor:'rgba(224,92,92,0.75)',borderRadius:4,yAxisID:'y',order:2},
      {type:'line',label:'Budgeted Needs',data:nb,borderColor:'rgba(74,144,226,0.7)',borderWidth:2,borderDash:[8,5],pointRadius:0,fill:false,yAxisID:'y',order:1},
      {type:'line',label:'Budgeted Wants',data:wb,borderColor:'rgba(224,92,92,0.7)',borderWidth:2,borderDash:[8,5],pointRadius:0,fill:false,yAxisID:'y',order:1},
      {type:'line',label:'Cumul. Savings',data:cs,borderColor:'rgba(240,180,41,0.85)',borderWidth:2,borderDash:[8,5],pointRadius:3,pointBackgroundColor:'rgba(240,180,41,0.85)',fill:{target:'origin',above:'rgba(240,180,41,0.08)'},yAxisID:'y2',order:1}
    ]},
    options:{
      responsive:true,maintainAspectRatio:false,interaction:{mode:'index',intersect:false},
      plugins:{
        legend:{position:'top',labels:{color:'#9ca3af',font:{family:'DM Sans',size:12},boxWidth:12,padding:20,usePointStyle:true}},
        tooltip:{backgroundColor:'#1e2230',titleColor:'#e8eaf0',bodyColor:'#9ca3af',borderColor:'#2a2f40',borderWidth:1,
          callbacks:{label:c=>` ${c.dataset.label}: $${c.parsed.y.toLocaleString('en-US',{maximumFractionDigits:0})}`}}
      },
      scales:{
        x:{ticks:{color:'#6b7280',font:{family:'DM Sans',size:12}},grid:{color:'rgba(42,47,64,0.5)'}},
        y:{
          position:'left',
          min:0,
          max:leftTicks[leftTicks.length-1],
          ticks:{
            color:'#6b7280',
            font:{family:'DM Sans',size:12},
            callback:(v)=> leftTicks.includes(v) ? '$'+v.toLocaleString() : null,
            stepSize: leftStep
          },
          grid:{color:'rgba(42,47,64,0.5)'}
        },
        y2:{
          position:'right',
          min:0,
          max:rightTicks[rightTicks.length-1],
          ticks:{
            color:'rgba(240,180,41,0.6)',
            font:{family:'DM Sans',size:12},
            callback:(v,i,ticks)=> rightTicks.includes(Math.round(v)) ? '$'+Math.round(v).toLocaleString() : null,
            stepSize: leftStep * 10
          },
          grid:{drawOnChartArea:false}
        }
      }
    }
  });
}

function saveStartingSavings(val){
  S.settings.startingSavings=+val||0;
  persist();
  renderChart();
}

function renderDashboard(){
  const el=document.getElementById('starting-savings');
  if(el) el.value=S.settings.startingSavings||0;
  renderStats();
  renderChart();
}
