function loadSyncConfig(){ try{ return JSON.parse(localStorage.getItem('bgt3-sync')||'{}'); }catch(e){ return {}; } }
function saveSyncConfig(cfg){ localStorage.setItem('bgt3-sync', JSON.stringify(cfg)); }
function setSyncStatus(msg, isError=false){
  const el=document.getElementById('sync-status');
  el.textContent=msg;
  el.style.color=isError?'var(--wants)':'var(--green)';
}
function loadSyncUI(){
  const cfg=loadSyncConfig();
  if(cfg.token) document.getElementById('sync-token').value=cfg.token;
  if(cfg.gistId) document.getElementById('sync-gist-id').value=cfg.gistId;
  if(cfg.lastPush) setSyncStatus('Last synced: '+cfg.lastPush);
}
async function pushToGist(){
  const cfg=loadSyncConfig();
  const token=document.getElementById('sync-token').value.trim();
  const gistId=document.getElementById('sync-gist-id').value.trim();
  if(!token){ setSyncStatus('Enter a GitHub token first.', true); return; }
  if(!gistId){ setSyncStatus('Enter a Gist ID first — push would create a duplicate.', true); return; }
  setSyncStatus('Pushing…');
  const body={ description:'Budget Tracker Data', public:false,
    files:{ 'budget-tracker-data.json':{ content: JSON.stringify(S, null, 2) } } };
  try{
    const url='https://api.github.com/gists/'+gistId;
    const method='PATCH';
    const res=await fetch(url,{ method, headers:{ Authorization:'token '+token, 'Content-Type':'application/json' }, body: JSON.stringify(body) });
    if(!res.ok) throw new Error('HTTP '+res.status);
    const data=await res.json();
    const now=new Date().toLocaleString();
    saveSyncConfig({ token, gistId: data.id, lastPush: now });
    document.getElementById('sync-gist-id').value=data.id;
    setSyncStatus('✓ Pushed at '+now);
  } catch(e){ setSyncStatus('Push failed: '+e.message, true); }
}
async function pullFromGist(){
  const token=document.getElementById('sync-token').value.trim();
  const gistId=document.getElementById('sync-gist-id').value.trim();
  if(!token||!gistId){ setSyncStatus('Enter token and Gist ID first.', true); return; }
  setSyncStatus('Pulling…');
  try{
    const res=await fetch('https://api.github.com/gists/'+gistId,{ headers:{ Authorization:'token '+token } });
    if(!res.ok) throw new Error('HTTP '+res.status);
    const data=await res.json();
    const raw=data.files['budget-tracker-data.json']?.content;
    if(!raw) throw new Error('File not found in Gist');
    S=JSON.parse(raw);
    persist();
    loadCalcUI(); recalc();
    loadSettingsUI();
    buildMonthNav(); renderDashboard(); renderMonth();
    const now=new Date().toLocaleString();
    saveSyncConfig({ token, gistId, lastPush: now });
    setSyncStatus('✓ Pulled at '+now);
  } catch(e){ setSyncStatus('Pull failed: '+e.message, true); }
}
