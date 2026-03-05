// State/local taxes are now entered as flat dollar amounts per paycheck from paystub

// 2026 federal brackets (single filer)
const FED_BRACKETS = [
  {rate:0.10,limit:12400},{rate:0.12,limit:50400},{rate:0.22,limit:105700},
  {rate:0.24,limit:201775},{rate:0.32,limit:256225},{rate:0.35,limit:640600},
  {rate:0.37,limit:Infinity}
];
const STD_DEDUCTION = 16100;
const IRS_401K_LIMIT_2026 = 24500;

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// ─── APP STATE ──────────────────────────────────────────────────────────────
let S = {
  currentYear: new Date().getFullYear(),
  currentMonth: new Date().getMonth(),
  modalType: 'expense',
  settings: { needsBudget:2015, wantsBudget:605, savingsBudget:1411, paycheckAmount:1818, paycheckCount:2, startingSavings:13000 },
  months: {},
  calc: {
    salary:77536, payfreq:24,
    k401pct:11, hsa:110, health:26.07, dental:5.52, vision:0.59, gtl:3.06,
    fedOverride:false, fedManual:715,
    stateDollar:0, localDollar:0,
    roth:0, otherPost:0,
    spNeeds:50, spWants:15, spSave:35,
    _monthlyNet:0
  }
};

function mkey(y,m){ return `${y}-${m}`; }
function getMonth(y,m){
  const k=mkey(y,m);
  if(!S.months[k]){
    const pcs=[];
    for(let i=0;i<S.settings.paycheckCount;i++) pcs.push({id:Date.now()+i,date:'',amount:S.settings.paycheckAmount,desc:'Paycheck'});
    S.months[k]={expenses:[],incomes:pcs};
  }
  return S.months[k];
}

function persist(){ try{ localStorage.setItem('bgt3',JSON.stringify(S)); }catch(e){} }
function hydrate(){
  try{
    const r=localStorage.getItem('bgt3');
    if(r){ const d=JSON.parse(r); S={...S,...d}; }
  }catch(e){}
}
