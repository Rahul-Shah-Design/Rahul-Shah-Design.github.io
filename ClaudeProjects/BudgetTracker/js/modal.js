// ─── MODAL ────────────────────────────────────────────────────────────────────
function openModal(type){
  S.modalType=type;
  document.getElementById('modal-title').textContent=type==='expense'?'Add Expense':'Add Income';
  document.getElementById('modal-cat-field').style.display=type==='expense'?'block':'none';
  document.getElementById('modal-hint').style.display=type==='expense'?'block':'none';
  ['modal-amount','modal-desc','modal-date'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('modal-overlay').classList.add('open');
  setTimeout(()=>document.getElementById('modal-amount').focus(),50);
}
function closeModal(){ document.getElementById('modal-overlay').classList.remove('open'); }
function closeModalOutside(e){ if(e.target===document.getElementById('modal-overlay'))closeModal(); }
function saveTransaction(){
  const amount=+document.getElementById('modal-amount').value;
  if(isNaN(amount)||document.getElementById('modal-amount').value===''){alert('Enter a valid amount.');return;}
  const desc=document.getElementById('modal-desc').value.trim()||'—';
  const date=document.getElementById('modal-date').value;
  const cat=document.getElementById('modal-cat').value;
  const{currentYear:y,currentMonth:m}=S, d=getMonth(y,m);
  const tx={id:Date.now(),date,amount,desc};
  if(S.modalType==='expense'){tx.cat=cat;d.expenses.push(tx);}
  else d.incomes.push(tx);
  persist(); closeModal(); renderMonth(); buildMonthNav();
}
