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
  const netSavings=income-c.needs-c.wants;
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
        legend:{display:false},
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

  const legendEl=document.getElementById('chart-legend');
  if(legendEl){
    legendEl.innerHTML=[
      ['Needs',       'rgba(74,144,226,0.75)', 'box'],
      ['Wants',       'rgba(224,92,92,0.75)',  'box'],
      ['Budgeted Needs', 'rgba(74,144,226,0.7)',  'dash'],
      ['Budgeted Wants', 'rgba(224,92,92,0.7)',   'dash'],
      ['Cumul. Savings', 'rgba(240,180,41,0.85)', 'dash'],
    ].map(([text,color,type],i,arr)=>{
      const icon=type==='box'
        ?`<span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${color};flex-shrink:0;"></span>`
        :`<span style="display:inline-block;width:20px;height:0;border-top:2px dashed ${color};flex-shrink:0;"></span>`;
      const gear=i===arr.length-1
        ?`<button onclick="openSavingsModal()" title="Set starting balance" style="background:none;border:none;color:#9ca3af;cursor:pointer;padding:0 0 0 4px;display:inline-flex;align-items:center;line-height:1;transition:color 0.15s;" onmouseover="this.style.color='#e8eaf0'" onmouseout="this.style.color='#9ca3af'"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="overflow:visible;"><path d="M12 15.5A3.5 3.5 0 0 1 8.5 12 3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.92c.04-.34.07-.69.07-1.08s-.03-.74-.07-1.08l2.32-1.81c.21-.17.27-.46.14-.7l-2.2-3.81c-.13-.24-.42-.32-.66-.24l-2.74 1.1c-.57-.44-1.18-.8-1.86-1.08L14.21 1.8A.554.554 0 0 0 13.67 1h-4.4a.554.554 0 0 0-.54.46L8.27 4.49c-.68.28-1.29.64-1.86 1.08L3.67 4.47c-.24-.08-.53 0-.66.24L.81 8.52c-.14.24-.08.53.14.7l2.32 1.81C3.23 11.37 3.2 11.72 3.2 12s.03.63.07.97l-2.32 1.81c-.22.17-.28.46-.14.7l2.2 3.81c.13.24.42.32.66.24l2.74-1.1c.57.44 1.18.8 1.86 1.08l.42 2.69c.07.27.29.46.54.46h4.4c.25 0 .47-.19.54-.46l.42-2.69c.68-.28 1.29-.64 1.86-1.08l2.74 1.1c.24.08.53 0 .66-.24l2.2-3.81c.13-.24.07-.53-.14-.7l-2.32-1.81z"/></svg></button>`
        :'';
      return`<span style="display:inline-flex;align-items:center;gap:5px;white-space:nowrap;flex-shrink:0;color:#9ca3af;font-size:12px;font-family:'DM Sans',sans-serif;">${icon}${text}${gear}</span>`;
    }).join('');
  }
}

function saveStartingSavings(val){
  S.settings.startingSavings=+val||0;
  persist();
  schedulePush();
  renderChart();
}

function renderDashboard(){
  renderStats();
  renderChart();
}
