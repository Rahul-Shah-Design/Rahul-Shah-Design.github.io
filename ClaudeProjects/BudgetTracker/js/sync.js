// ─── SYNC CONFIG ─────────────────────────────────────────────────────────────
function loadSyncConfig(){ try{ return JSON.parse(localStorage.getItem('bgt3-sync')||'{}'); }catch(e){ return {}; } }
function saveSyncConfig(cfg){ localStorage.setItem('bgt3-sync', JSON.stringify(cfg)); }

// ─── BADGE ───────────────────────────────────────────────────────────────────
const _SVG_SYNC = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>`;
const _SVG_OFF  = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22.61 16.95A5 5 0 0 0 18 10h-1.26a8 8 0 0 0-7.05-6M5 5a8 8 0 0 0 4 15h9a5 5 0 0 0 1.7-.3"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;

function updateSyncBadge(state, label){
  const el=document.getElementById('sync-badge');
  if(!el) return;
  const icon = state==='off' ? _SVG_OFF : _SVG_SYNC.replace('<svg ', `<svg class="${state==='syncing'?'spin':''}" `);
  const color = state==='synced' ? 'var(--green)' : state==='error' ? 'var(--wants)' : 'var(--muted)';
  const border = state==='synced' ? 'rgba(92,184,92,0.25)' : state==='error' ? 'rgba(224,92,92,0.25)' : 'var(--border)';
  el.innerHTML = icon+'<span>'+label+'</span>';
  el.style.color = color;
  el.style.borderColor = border;
}

function initSyncBadge(){
  const cfg=loadSyncConfig();
  if(!cfg.token){ updateSyncBadge('off','Sync off'); return; }
  if(cfg.lastPush){
    try{
      const t=new Date(cfg.lastPush);
      updateSyncBadge('synced','Synced '+t.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}));
    }catch(e){ updateSyncBadge('synced','Synced'); }
  } else {
    updateSyncBadge('off','Sync off');
  }
}

// ─── AUTO-PUSH (debounced) ────────────────────────────────────────────────────
let _pushTimer=null;
let initialPullComplete=false;
function schedulePush(){
  if(!initialPullComplete) return;
  const cfg=loadSyncConfig();
  if(!cfg.token) return;
  clearTimeout(_pushTimer);
  _pushTimer=setTimeout(pushToGist, 2000);
}

// ─── PUSH ────────────────────────────────────────────────────────────────────
let _pushing=false;
async function pushToGist(){
  if(_pushing){ schedulePush(); return; }
  _pushing=true;
  try{
    const cfg=loadSyncConfig();
    if(!cfg.token) return;
    clearTimeout(_pushTimer);
    updateSyncBadge('syncing','Syncing…');
    const body={ description:'Budget Tracker Data', public:false,
      files:{ 'budget-tracker-data.json':{ content: JSON.stringify(S, null, 2) } } };
    const url = cfg.gistId ? 'https://api.github.com/gists/'+cfg.gistId : 'https://api.github.com/gists';
    const method = cfg.gistId ? 'PATCH' : 'POST';
    const res=await fetch(url,{ method, headers:{ Authorization:'token '+cfg.token, 'Content-Type':'application/json' }, body: JSON.stringify(body) });
    if(!res.ok) throw new Error('HTTP '+res.status);
    const data=await res.json();
    const now=new Date();
    saveSyncConfig({ token:cfg.token, gistId:data.id, lastPush:now.toISOString() });
    const gistField=document.getElementById('sync-modal-gist-id');
    if(gistField) gistField.value=data.id;
    updateSyncBadge('synced','Synced '+now.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}));
  } catch(e){ updateSyncBadge('error','Sync failed'); }
  finally{ _pushing=false; }
}

// ─── PULL ────────────────────────────────────────────────────────────────────
async function pullFromGist(){
  const cfg=loadSyncConfig();
  if(!cfg.token||!cfg.gistId) return;
  updateSyncBadge('syncing','Syncing…');
  const backup=JSON.stringify(S);
  try{
    const res=await fetch('https://api.github.com/gists/'+cfg.gistId,{ headers:{ Authorization:'token '+cfg.token } });
    if(!res.ok) throw new Error('HTTP '+res.status);
    const data=await res.json();
    const raw=data.files['budget-tracker-data.json']?.content;
    if(!raw) throw new Error('File not found in Gist');
    const newS=JSON.parse(raw);
    // validate expected top-level keys before touching anything
    if(!newS||typeof newS!=='object'||!newS.months||!newS.settings||!newS.calc)
      throw new Error('bad-data');
    // write to localStorage BEFORE mutating S — if setItem throws, S is unchanged
    localStorage.setItem('bgt3',JSON.stringify(newS));
    S=newS;
    loadCalcUI(); recalc();
    buildMonthNav(); renderDashboard(); renderMonth();
    const now=new Date();
    saveSyncConfig({ token:cfg.token, gistId:cfg.gistId, lastPush:now.toISOString() });
    updateSyncBadge('synced','Synced '+now.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}));
  } catch(e){
    try{ S=JSON.parse(backup); }catch(_){}
    updateSyncBadge('error', e.message==='bad-data'?'Sync failed — bad data':'Sync failed');
  }
}
