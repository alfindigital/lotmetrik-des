/* =====================================================================
   Lotmetrik — DES Explorer (v2)
   Alat data Daftar Efek Syariah OJK 2016-2026. Zero dependencies.
   Semua metrik dihitung client-side dari bitstring 21 periode.
   Angka: JetBrains Mono, desimal koma, minus U+2212. teal=naik/masuk,
   merah=turun/keluar, amber=sorot.
   ===================================================================== */
(function(){
"use strict";
var DES = window.DES;
if(!DES){document.body.innerHTML='<p style="padding:40px">Gagal memuat data.</p>';return;}
var META=DES.meta, NAMES=DES.names, PRES=DES.present, N=META.length;
var TICKERS=Object.keys(PRES).sort();
var MINUS='−';

/* ---------- helpers ---------- */
var $=function(s,r){return (r||document).querySelector(s);};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));};
function el(t,c,h){var e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e;}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function fmtNum(n){return Math.round(Number(n)).toLocaleString('id-ID');}          // 6842 -> "6.842"
function fmtSigned(n){var v=Number(n);return (v>0?'+':v<0?MINUS:'')+fmtNum(Math.abs(v));}
function shortLabel(i){var p=META[i].date.split(' ');return p[1]+' '+p[2];}          // "Jun 2026"
function yearOf(i){return META[i].date.split(' ')[2];}
function phase(i){return META[i].key.indexOf('_P1')>-1?'P1':'P2';}
function bits(t){return PRES[t];}
var STAMP_DATE=META[N-1].date;                                                       // "1 Jun 2026"
function stampHTML(){return 'Sumber: <b>OJK</b> · Daftar Efek Syariah · Per: <b>'+esc(STAMP_DATE)+'</b> · Universe: saham berkode IDX · n=<b>'+fmtNum(TICKERS.length)+'</b>';}

/* ---------- derive periods ---------- */
var periods=[];
for(var i=0;i<N;i++){
  var masuk=[],keluar=[];
  if(i===0){ for(var k=0;k<TICKERS.length;k++){ if(bits(TICKERS[k])[0]==='1') masuk.push(TICKERS[k]); } }
  else{ for(var k=0;k<TICKERS.length;k++){ var t=TICKERS[k],b=bits(t);
    if(b[i]==='1'&&b[i-1]==='0') masuk.push(t); else if(b[i]==='0'&&b[i-1]==='1') keluar.push(t); } }
  masuk.sort();keluar.sort();
  periods.push({i:i,key:META[i].key,date:META[i].date,kep:META[i].kep,total:META[i].total,
    label:shortLabel(i),phase:phase(i),baseline:i===0,masuk:masuk,keluar:keluar,net:i===0?0:masuk.length-keluar.length});
}

/* ---------- per-ticker + lists ---------- */
function runsOf(b){var r=0,p='0';for(var j=0;j<b.length;j++){if(b[j]==='1'&&p==='0')r++;p=b[j];}return r;}
function flipsOf(b){var f=0;for(var j=1;j<b.length;j++){if(b[j]!==b[j-1])f++;}return f;}
var perT={},survivors=[],oneHit=[],comeback=[],revolving=[];
for(var x=0;x<TICKERS.length;x++){
  var t=TICKERS[x],b=bits(t),cnt=(b.match(/1/g)||[]).length,runs=runsOf(b),flips=flipsOf(b),exits=0;
  for(var j=1;j<N;j++){ if(b[j]==='0'&&b[j-1]==='1') exits++; }
  perT[t]={t:t,name:NAMES[t]||t,bits:b,count:cnt,runs:runs,flips:flips,enters:runs,exits:exits,statusNow:b[N-1]==='1',survivor:cnt===N};
  if(cnt===N)survivors.push(t); if(cnt===1)oneHit.push(t); if(runs>=2)comeback.push(t);
}
revolving=TICKERS.slice().sort(function(a,b){return perT[b].flips-perT[a].flips||perT[b].count-perT[a].count;});
survivors.sort();oneHit.sort();comeback.sort();
var totMasuk=0,totKeluar=0,maxOut={n:-1};
for(var i=1;i<N;i++){ totMasuk+=periods[i].masuk.length; totKeluar+=periods[i].keluar.length;
  if(periods[i].keluar.length>maxOut.n)maxOut={n:periods[i].keluar.length,i:i}; }
var peak={total:-1}; for(var i=0;i<N;i++){ if(META[i].total>peak.total)peak={total:META[i].total,i:i}; }

/* =====================================================================
   HERO
   ===================================================================== */
function renderHero(){
  var first=periods[0],last=periods[N-1];
  var drop=last.total-peak.total;
  $('#heroMetrics').innerHTML=
    mcard(first.total,'','Awal · '+shortLabel(first.i),'titik mulai')+
    mcard(peak.total,'hl','Puncak · '+shortLabel(peak.i),'rekor tertinggi')+
    mcard(last.total,'down','Kini · '+shortLabel(last.i),fmtSigned(drop)+' dari puncak');
  $('#heroStamp').innerHTML=stampHTML();
  $('#chartStamp').innerHTML=stampHTML();
  $('#footStamp').innerHTML=stampHTML();
  $('#footCopy').textContent='© '+yearOf(N-1)+' Lotmetrik · diolah dari 21 rilis resmi OJK';
  function mcard(v,cls,l,sub){return '<div class="mcard"><span class="ml">'+esc(l)+'</span>'+
    '<span class="mv '+cls+'">'+fmtNum(v)+'</span><span class="ms">'+esc(sub)+'</span></div>';}
}

/* =====================================================================
   CHART (flat, terminal-friendly; teal line, amber peak, red drop)
   ===================================================================== */
var W=1000,H=400,padL=44,padR=16,padT=20,padB=34,plotW=W-60,plotH=H-54,chartMode='total';
var ttEl=$('#chartTt'),hostEl=$('#chartHost'),wrapEl=hostEl.parentNode;
function xAt(i){return padL+plotW*(i/(N-1));}
function svgOpen(){return '<svg class="chart-svg" viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Grafik daftar efek syariah 2016-2026">';}
function gridYears(){var s='';for(var i=0;i<N;i+=4){s+='<text x="'+xAt(i).toFixed(1)+'" y="'+(H-10)+'" font-size="13" text-anchor="middle">'+yearOf(i)+'</text>';}return s;}
function watermark(){return '<text class="wmk" x="'+(W-padR-6)+'" y="'+(padT+18)+'" font-size="15" text-anchor="end">@lotmetrik</text>';}
function renderChart(){chartMode==='total'?renderTotal():renderNet();renderLegend();}
function renderTotal(){
  var yMin=280,yMax=700; function y(v){return padT+plotH*(1-(v-yMin)/(yMax-yMin));}
  var grid='';[300,400,500,600,700].forEach(function(g){var yy=y(g).toFixed(1);
    grid+='<line x1="'+padL+'" y1="'+yy+'" x2="'+(W-padR)+'" y2="'+yy+'" stroke="var(--grid-line)" stroke-width="1"/>';
    grid+='<text x="'+(padL-8)+'" y="'+(+yy+4)+'" font-size="12" text-anchor="end">'+g+'</text>';});
  var pts=[];for(var i=0;i<N;i++)pts.push([xAt(i),y(META[i].total)]);
  var line=pts.map(function(p,i){return (i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1);}).join(' ');
  var area=line+' L'+pts[N-1][0].toFixed(1)+' '+(H-padB)+' L'+pts[0][0].toFixed(1)+' '+(H-padB)+' Z';
  var drop='M'+pts[peak.i][0].toFixed(1)+' '+pts[peak.i][1].toFixed(1);
  for(var i=peak.i+1;i<N;i++)drop+=' L'+pts[i][0].toFixed(1)+' '+pts[i][1].toFixed(1);
  var dots='',hits='';
  for(var i=0;i<N;i++){var isP=i===peak.i,isL=i===N-1;
    var c=isP?'var(--highlight)':(isL?'var(--down)':'var(--up)'),r=isP||isL?5:2.6;
    dots+='<circle cx="'+pts[i][0].toFixed(1)+'" cy="'+pts[i][1].toFixed(1)+'" r="'+r+'" fill="'+c+'"/>';
    hits+='<circle class="hit" data-i="'+i+'" cx="'+pts[i][0].toFixed(1)+'" cy="'+pts[i][1].toFixed(1)+'" r="19" fill="transparent" style="cursor:pointer"/>';}
  hostEl.innerHTML=svgOpen()+grid+gridYears()+watermark()+
    '<path d="'+area+'" fill="var(--up-soft)"/>'+
    '<path d="'+line+'" fill="none" stroke="var(--up)" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>'+
    '<path d="'+drop+'" fill="none" stroke="var(--down)" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>'+
    dots+hits+'</svg>';
  bindHits();
}
function renderNet(){
  var yMin=-90,yMax=70; function y(v){return padT+plotH*(1-(v-yMin)/(yMax-yMin));}
  var grid='';[-80,-40,0,40].forEach(function(g){var yy=y(g).toFixed(1);
    grid+='<line x1="'+padL+'" y1="'+yy+'" x2="'+(W-padR)+'" y2="'+yy+'" stroke="var(--grid-line)" stroke-width="'+(g===0?1.4:1)+'"/>';
    grid+='<text x="'+(padL-8)+'" y="'+(+yy+4)+'" font-size="12" text-anchor="end">'+(g>0?'+':'')+g+'</text>';});
  var bw=plotW/N*0.56,bars='',hits='';
  for(var i=1;i<N;i++){var v=periods[i].net,cx=xAt(i),top=y(Math.max(0,v)),bot=y(Math.min(0,v)),h=Math.abs(bot-top);
    var c=v>=0?'var(--up)':'var(--down)';
    bars+='<rect x="'+(cx-bw/2).toFixed(1)+'" y="'+top.toFixed(1)+'" width="'+bw.toFixed(1)+'" height="'+Math.max(1,h).toFixed(1)+'" fill="'+c+'" rx="1"/>';
    hits+='<rect class="hit" data-i="'+i+'" x="'+(cx-plotW/N/2).toFixed(1)+'" y="'+padT+'" width="'+(plotW/N).toFixed(1)+'" height="'+plotH+'" fill="transparent" style="cursor:pointer"/>';}
  hostEl.innerHTML=svgOpen()+grid+gridYears()+watermark()+
    '<line x1="'+padL+'" y1="'+y(0).toFixed(1)+'" x2="'+(W-padR)+'" y2="'+y(0).toFixed(1)+'" stroke="var(--border-strong)" stroke-width="1.2"/>'+
    bars+hits+'</svg>';
  bindHits();
}
function renderLegend(){
  $('#chartLegend').innerHTML=chartMode==='total'
    ?'<span><i style="background:var(--up)"></i>Jumlah saham</span><span><i style="background:var(--highlight)"></i>Puncak '+peak.total+'</span><span><i style="background:var(--down)"></i>Penurunan 2026</span>'
    :'<span><i style="background:var(--up)"></i>Net masuk</span><span><i style="background:var(--down)"></i>Net keluar</span>';
}
function bindHits(){$$('.hit',hostEl).forEach(function(h){
  h.addEventListener('pointerenter',function(){showTT(+h.dataset.i,h);});
  h.addEventListener('pointermove',function(){showTT(+h.dataset.i,h);});
  h.addEventListener('pointerleave',hideTT);
  h.addEventListener('click',function(){setPeriod(+h.dataset.i);scrollTo('#periode');});});}
function showTT(i,hit){var p=periods[i],html;
  if(chartMode==='total'){html='<div class="d">'+esc(p.label)+' · '+p.phase+'</div><div class="r"><span>Total</span><b>'+fmtNum(p.total)+'</b></div>';
    if(!p.baseline)html+='<div class="r"><span>Masuk</span><b class="up">+'+p.masuk.length+'</b></div><div class="r"><span>Keluar</span><b class="down">'+MINUS+p.keluar.length+'</b></div>';
    else html+='<div class="r"><span>periode awal</span><b>baseline</b></div>';}
  else{html='<div class="d">'+esc(p.label)+' · '+p.phase+'</div><div class="r"><span>Masuk</span><b class="up">+'+p.masuk.length+'</b></div><div class="r"><span>Keluar</span><b class="down">'+MINUS+p.keluar.length+'</b></div><div class="r"><span>Net</span><b class="'+(p.net>=0?'up':'down')+'">'+fmtSigned(p.net)+'</b></div>';}
  ttEl.innerHTML=html;ttEl.classList.add('on');
  var hr=hit.getBoundingClientRect(),wr=wrapEl.getBoundingClientRect(),cx=hr.left+hr.width/2-wr.left,cy=hr.top+hr.height/2-wr.top;
  var tw=ttEl.offsetWidth,th=ttEl.offsetHeight,left=Math.max(4,Math.min(cx-tw/2,wrapEl.clientWidth-tw-4)),top=cy-th-14;if(top<0)top=cy+16;
  ttEl.style.left=left+'px';ttEl.style.top=top+'px';}
function hideTT(){ttEl.classList.remove('on');}
$$('#chartSeg .seg-btn').forEach(function(b){b.addEventListener('click',function(){
  $$('#chartSeg .seg-btn').forEach(function(x){x.classList.remove('is-active');});b.classList.add('is-active');chartMode=b.dataset.mode;hideTT();renderChart();});});

/* =====================================================================
   PERIOD EXPLORER — timeline boxes + 3 net tiles
   ===================================================================== */
var curPeriod=N-1,curIO='out',ioQuery='';
function buildTimeline(){
  $('#timeline').innerHTML=periods.map(function(p){
    var nb=p.baseline?'':(p.net>=0?'nb pos':'nb neg');
    return '<div class="tl-box" data-i="'+p.i+'" role="tab"><div class="yr">'+yearOf(p.i)+'</div><div class="ph">'+p.phase+'</div><div class="tt2">'+fmtNum(p.total)+'</div><span class="'+(p.baseline?'nb':nb)+'"></span></div>';
  }).join('');
  $('#timeline').addEventListener('click',function(e){var b=e.target.closest('[data-i]');if(b)setPeriod(+b.dataset.i);});
}
function setPeriod(i){var p=periods[i];curPeriod=i;curIO=p.baseline?'in':'out';ioQuery='';$('#ioSearch').value='';
  $$('#timeline .tl-box').forEach(function(b){var on=+b.dataset.i===i;b.classList.toggle('active',on);if(on)b.scrollIntoView({block:'nearest',inline:'center',behavior:'smooth'});});
  $('#pPrev').disabled=i<=0;$('#pNext').disabled=i>=N-1;
  renderPSum();renderTiles();syncIOseg();renderIOList();}
function renderPSum(){var p=periods[curPeriod];
  $('#pSumHead').innerHTML='<span class="pt">'+fmtNum(p.total)+'</span><span class="pm">saham syariah · efektif <b>'+esc(p.date)+'</b> · '+esc(p.kep)+'</span>';}
function renderTiles(){var p=periods[curPeriod];
  if(p.baseline){$('#pTiles').innerHTML='<div class="tile net" style="grid-column:1/-1"><div class="tl2">Periode awal (baseline)</div><div class="tv">'+fmtNum(p.total)+'</div><div class="ts">titik mulai daftar, belum ada data masuk/keluar</div></div>';return;}
  $('#pTiles').innerHTML=
    tile('in','Masuk','+'+fmtNum(p.masuk.length),'saham baru lolos')+
    tile('out','Keluar',MINUS+fmtNum(p.keluar.length),'saham dicoret')+
    tile('net','Bersih',fmtSigned(p.net),'selisih masuk-keluar');
  function tile(c,l,v,s){return '<div class="tile '+c+'"><div class="tl2">'+l+'</div><div class="tv">'+v+'</div><div class="ts">'+s+'</div></div>';}
}
function syncIOseg(){var p=periods[curPeriod];
  $$('#ioSeg .seg-btn').forEach(function(b){var io=b.dataset.io;b.classList.toggle('is-active',io===curIO);
    var n=p.baseline?(io==='in'?p.masuk.length:0):(io==='in'?p.masuk.length:p.keluar.length);
    var lbl=p.baseline&&io==='in'?'Isi awal':(io==='in'?'Masuk':'Keluar');
    b.innerHTML='<span class="dotc" style="background:var('+(io==='in'?'--up':'--down')+')"></span>'+lbl+' '+n;});}
function renderIOList(){var p=periods[curPeriod];var arr=(curIO==='in'?p.masuk:p.keluar).slice();
  var q=ioQuery.trim().toUpperCase();if(q)arr=arr.filter(function(t){return t.indexOf(q)>-1||(NAMES[t]||'').toUpperCase().indexOf(q)>-1;});
  var ul=$('#ioList');
  if(!arr.length){ul.innerHTML='<li class="io-empty">'+(p.baseline&&curIO==='out'?'Periode awal tidak punya data keluar (ini titik mulai).':(q?'Tidak ada hasil untuk "'+esc(ioQuery)+'".':'Tidak ada saham '+(curIO==='in'?'masuk':'keluar')+' di periode ini.'))+'</li>';}
  else{ul.innerHTML=arr.map(function(t){return '<li class="io-row '+(curIO==='in'?'in':'out')+'" data-trk="'+t+'"><span class="tk">'+t+'</span><span class="nm">'+esc(NAMES[t]||t)+'</span><span class="ar">&#8250;</span></li>';}).join('');}
  $('#ioCount').textContent=fmtNum(arr.length)+' saham'+(q?' (difilter)':'')+' · '+shortLabel(curPeriod)+' '+periods[curPeriod].phase;}
$('#pPrev').addEventListener('click',function(){if(curPeriod>0)setPeriod(curPeriod-1);});
$('#pNext').addEventListener('click',function(){if(curPeriod<N-1)setPeriod(curPeriod+1);});
$$('#ioSeg .seg-btn').forEach(function(b){b.addEventListener('click',function(){curIO=b.dataset.io;syncIOseg();renderIOList();});});
$('#ioSearch').addEventListener('input',function(){ioQuery=this.value;renderIOList();});
$('#ioList').addEventListener('click',function(e){var r=e.target.closest('[data-trk]');if(r){showTracker(r.dataset.trk);scrollTo('#lacak');}});
$('#ioCsv').addEventListener('click',function(){exportPeriodCSV(curPeriod);});
function exportPeriodCSV(i){var p=periods[i],rows=[['status','kode','nama']];
  if(p.baseline){p.masuk.forEach(function(t){rows.push(['ISI_AWAL',t,NAMES[t]||t]);});}
  else{p.masuk.forEach(function(t){rows.push(['MASUK',t,NAMES[t]||t]);});p.keluar.forEach(function(t){rows.push(['KELUAR',t,NAMES[t]||t]);});}
  downloadCSV('DES_'+p.key+'_masuk_keluar.csv',rows);toast('CSV '+shortLabel(i)+' diunduh');}
function downloadCSV(name,rows){var csv=rows.map(function(r){return r.map(function(c){c=String(c);return /[",\n]/.test(c)?'"'+c.replace(/"/g,'""')+'"':c;}).join(',');}).join('\n');
  var blob=new Blob(['﻿'+csv],{type:'text/csv;charset=utf-8'}),a=el('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();
  setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},200);}

/* =====================================================================
   STOCK TRACKER
   ===================================================================== */
function buildDatalist(){$('#trkList').innerHTML=TICKERS.map(function(t){return '<option value="'+t+'">'+esc(NAMES[t]||'')+'</option>';}).join('');}
function showTracker(code){code=String(code||'').trim().toUpperCase();var rec=perT[code],host=$('#trkRes');
  if(!rec){host.innerHTML='<p class="tr-hint">Kode <b>'+esc(code)+'</b> tidak pernah masuk Daftar Efek Syariah 2016-2026. Cek lagi ejaannya.</p>';return;}
  $('#trkInput').value=code;
  var chips='<span class="chip '+(rec.statusNow?'in':'out')+'">'+(rec.statusNow?'Di dalam ('+shortLabel(N-1)+')':'Di luar ('+shortLabel(N-1)+')')+'</span>';
  if(rec.survivor)chips+=' <span class="chip star">Setia 21/21</span>';
  else if(rec.count===1)chips+=' <span class="chip out">Sekali lewat</span>';
  else if(rec.runs>=2)chips+=' <span class="chip">Comeback '+rec.runs+' babak</span>';
  var dots='';for(var i=0;i<N;i++){var on=rec.bits[i]==='1';dots+='<span class="dot '+(on?'on':'')+'" data-tip="'+shortLabel(i)+' '+periods[i].phase+': '+(on?'ada':'tidak')+'"></span>';}
  host.innerHTML='<div class="tr-head"><span class="tk">'+rec.t+'</span><span class="nm">'+esc(rec.name)+'</span></div>'+
    '<div style="display:flex;gap:7px;flex-wrap:wrap;margin-bottom:4px">'+chips+'</div>'+
    '<div class="dots" aria-label="riwayat 21 periode">'+dots+'</div>'+
    '<div class="tr-stats">'+
      '<div class="tr-stat"><div class="v">'+rec.count+'<span style="font-size:.9rem;color:var(--text-muted)">/'+N+'</span></div><div class="k">Muncul</div></div>'+
      '<div class="tr-stat"><div class="v" style="color:var(--up)">'+rec.enters+'</div><div class="k">Kali masuk</div></div>'+
      '<div class="tr-stat"><div class="v" style="color:var(--down)">'+rec.exits+'</div><div class="k">Kali keluar</div></div>'+
    '</div>';}
function doTrack(){var v=$('#trkInput').value;if(v)showTracker(v);}
$('#trkBtn').addEventListener('click',doTrack);
$('#trkInput').addEventListener('change',doTrack);
$('#trkInput').addEventListener('keydown',function(e){if(e.key==='Enter')doTrack();});
$('#trkRes').addEventListener('click',function(e){var a=e.target.closest('[data-trk]');if(a){e.preventDefault();showTracker(a.dataset.trk);}});

/* =====================================================================
   FACTS + MODAL
   ===================================================================== */
var FACTS=[
  {v:'153',l:'Saham setia',d:'Lolos di semua 21 periode tanpa absen',cls:'hl',kind:'list',list:survivors,title:'153 Saham Paling Setia',sub:'Hadir di seluruh 21 rilis, 2016-2026.'},
  {v:'850',l:'Saham unik',d:'Pernah masuk DES minimal sekali',cls:'',kind:'list',list:TICKERS.slice(),title:'850 Saham Unik',sub:'Semua emiten yang pernah mampir di DES.'},
  {v:'232',l:'Comeback',d:'Keluar lalu masuk daftar lagi',cls:'up',kind:'list',list:comeback,title:'232 Saham Comeback',sub:'Pernah keluar, lalu balik lagi.'},
  {v:'20',l:'Sekali lewat',d:'Cuma 1 periode lalu hilang',cls:'',kind:'list',list:oneHit,title:'20 Saham Sekali Lewat',sub:'Cuma muncul 1 periode sepanjang dekade.'},
  {v:'10x',l:'Pintu putar',d:'TIRA, AKKU, OASA paling sering ganti status',cls:'',kind:'revolve',title:'Si Paling Pintu Putar',sub:'Diurut dari yang paling sering ganti status.'},
  {v:MINUS+'85',l:'Rilis terganas',d:'Jun 2026, keluar terbanyak sejarah',cls:'down',kind:'period',i:maxOut.i,title:''}
];
function renderFacts(){$('#facts').innerHTML=FACTS.map(function(f,idx){
  return '<button class="fact '+f.cls+'" data-f="'+idx+'"><span class="fv">'+f.v+'</span><span class="fl">'+f.l+'</span><span class="fd">'+f.d+'</span><span class="more">Lihat &#8250;</span></button>';}).join('');}
$('#facts').addEventListener('click',function(e){var b=e.target.closest('[data-f]');if(b)openFact(+b.dataset.f);});
function openFact(idx){var f=FACTS[idx];
  if(f.kind==='period'){setPeriod(f.i);scrollTo('#periode');toast('Dibuka: '+shortLabel(f.i)+' (keluar '+periods[f.i].keluar.length+')');return;}
  if(f.kind==='revolve'){var top=revolving.slice(0,18);
    var body='<div class="modal-tools"><button class="btn btn-ghost" id="mCsv">Unduh CSV</button></div><ul class="mlist">'+top.map(function(t){var r=perT[t];
      return '<li class="mrow" data-trk="'+t+'"><span class="tk">'+t+'</span><span class="nm">'+esc(r.name)+'</span><span class="ct">'+r.flips+'x ganti · '+r.count+'/'+N+'</span></li>';}).join('')+'</ul>';
    showModal(f.title,f.sub,body);
    $('#mCsv').onclick=function(){var rows=[['kode','nama','ganti_status','muncul']];top.forEach(function(t){var r=perT[t];rows.push([t,r.name,r.flips,r.count]);});downloadCSV('DES_pintu_putar.csv',rows);toast('CSV diunduh');};return;}
  var list=f.list;
  var body='<div class="modal-tools"><button class="btn btn-ghost" id="mCopy">Salin daftar</button><button class="btn btn-ghost" id="mCsv">Unduh CSV</button></div>'+
    '<div class="taglist">'+list.map(function(t){return '<button class="tag" data-trk="'+t+'" title="'+esc(NAMES[t]||'')+'">'+t+'</button>';}).join('')+'</div>';
  showModal(f.title,f.sub+' Tap kode untuk lacak jejaknya.',body);
  $('#mCopy').onclick=function(){copyText(list.join(', '));toast('Daftar disalin ('+list.length+' kode)');};
  $('#mCsv').onclick=function(){var rows=[['kode','nama']];list.forEach(function(t){rows.push([t,NAMES[t]||t]);});downloadCSV('DES_'+f.title.replace(/[^a-z0-9]+/gi,'_').toLowerCase()+'.csv',rows);toast('CSV diunduh');};}
var modalBack=$('#modalBack');
function showModal(title,sub,body){$('#modalTitle').textContent=title;$('#modalSub').textContent=sub||'';$('#modalBody').innerHTML=body;modalBack.classList.add('on');document.body.style.overflow='hidden';}
function closeModal(){modalBack.classList.remove('on');document.body.style.overflow='';}
$('#modalX').addEventListener('click',closeModal);
modalBack.addEventListener('click',function(e){if(e.target===modalBack)closeModal();});
$('#modalBody').addEventListener('click',function(e){var a=e.target.closest('[data-trk]');if(a){closeModal();showTracker(a.dataset.trk);scrollTo('#lacak');}});
document.addEventListener('keydown',function(e){if(e.key==='Escape'){closeModal();hideTT();}});

/* =====================================================================
   THEME / SHARE / TOAST / utils
   ===================================================================== */
var TKEY='lotmetrik-des-theme';
function applyTheme(m){if(m==='terminal'){document.documentElement.setAttribute('data-theme','terminal');document.querySelector('meta[name=theme-color]').content='#0B1F3A';}
  else{document.documentElement.removeAttribute('data-theme');document.querySelector('meta[name=theme-color]').content='#F5F7FA';}}
(function(){try{var s=localStorage.getItem(TKEY);if(s)applyTheme(s);}catch(e){}})();
$('#themeBtn').addEventListener('click',function(){var term=document.documentElement.getAttribute('data-theme')==='terminal';var next=term?'light':'terminal';applyTheme(next);try{localStorage.setItem(TKEY,next);}catch(e){}});
$('#shareBtn').addEventListener('click',function(){var d={title:'Daftar Efek Syariah IDX 2016-2026 · Lotmetrik',text:'Telusuri saham syariah yang masuk & keluar daftar OJK, 2016-2026.',url:location.href};
  if(navigator.share)navigator.share(d).catch(function(){});else{copyText(location.href);toast('Link disalin');}});
function copyText(t){if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).catch(function(){fb(t);});else fb(t);
  function fb(x){var a=el('textarea');a.value=x;a.style.position='fixed';a.style.opacity='0';document.body.appendChild(a);a.select();try{document.execCommand('copy');}catch(e){}a.remove();}}
var toastT;function toast(m){var e=$('#toast');e.textContent=m;e.classList.add('on');clearTimeout(toastT);toastT=setTimeout(function(){e.classList.remove('on');},2100);}
function scrollTo(s){var t=$(s);if(t)t.scrollIntoView({behavior:'smooth',block:'start'});}

/* ---------- INIT ---------- */
renderHero();renderChart();buildTimeline();buildDatalist();setPeriod(N-1);renderFacts();
})();
