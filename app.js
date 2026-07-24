/* =====================================================================
   Lotmetrik - DES Dashboard (v2.4.3+)
   Alat data Daftar Efek Syariah OJK. Zero dependencies.
   Angka + rentang sumbu dihitung dari data.js. Panduan = halaman penuh.
   ===================================================================== */
(function(){
"use strict";
var DES = window.DES;
if(!DES){document.body.innerHTML='<p style="padding:40px">Gagal memuat data.</p>';return;}
var META=DES.meta, NAMES=DES.names, PRES=DES.present, N=META.length;
var TICKERS=Object.keys(PRES).sort();
var MINUS='−', SITE='https://des.lotmetrik.my.id';
var BLN=['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

var $=function(s,r){return (r||document).querySelector(s);};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));};
function el(t,c,h){var e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e;}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function fmtNum(n){return Math.round(Number(n)).toLocaleString('id-ID');}
function fmtSigned(n){var v=Number(n);return (v>0?'+':v<0?MINUS:'')+fmtNum(Math.abs(v));}
function shortLabel(i){var p=META[i].date.split(' ');return p[1]+' '+p[2];}
function yearOf(i){return META[i].date.split(' ')[2];}
function monthAbbr(i){return META[i].date.split(' ')[1].toUpperCase();}
function phase(i){return META[i].key.indexOf('_P1')>-1?'P1':'P2';}
function bits(t){return PRES[t];}
function reduceMotion(){try{return window.matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){return false;}}

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
var perT={},survivors=[],oneHit=[],newcomers=[],comeback=[],revolving=[];
for(var x=0;x<TICKERS.length;x++){
  var t=TICKERS[x],b=bits(t),cnt=(b.match(/1/g)||[]).length,runs=runsOf(b),flips=flipsOf(b),exits=0;
  for(var j=1;j<N;j++){ if(b[j]==='0'&&b[j-1]==='1') exits++; }
  var here=b[N-1]==='1', enters=runs-(b[0]==='1'?1:0);
  perT[t]={t:t,name:NAMES[t]||t,bits:b,count:cnt,runs:runs,flips:flips,enters:enters,exits:exits,statusNow:here,
    survivor:cnt===N, oneHit:cnt===1&&!here, newcomer:cnt===1&&here};
  if(cnt===N)survivors.push(t);
  if(cnt===1&&!here)oneHit.push(t);
  if(cnt===1&&here)newcomers.push(t);
  if(runs>=2)comeback.push(t);
}
revolving=TICKERS.slice().sort(function(a,b){return perT[b].flips-perT[a].flips||perT[b].count-perT[a].count;});
survivors.sort();oneHit.sort();comeback.sort();
var maxOut={n:-1,i:1}; for(var i=1;i<N;i++){ if(periods[i].keluar.length>maxOut.n)maxOut={n:periods[i].keluar.length,i:i}; }
var peak={total:-1,i:0}; for(var i=0;i<N;i++){ if(META[i].total>peak.total)peak={total:META[i].total,i:i}; }
var revTop=revolving.slice(0,3);

/* ---------- nice axis ---------- */
function axisFor(vals,padFrac){
  var mn=Math.min.apply(null,vals),mx=Math.max.apply(null,vals),pad=Math.max(1,(mx-mn)*padFrac);
  mn-=pad;mx+=pad;var span=mx-mn,steps=[5,10,20,25,50,100,200,500,1000],step=steps[steps.length-1];
  for(var s=0;s<steps.length;s++){if(span/steps[s]<=6){step=steps[s];break;}}
  var lo=Math.floor(mn/step)*step,hi=Math.ceil(mx/step)*step,ticks=[];
  for(var v=lo;v<=hi+1e-9;v+=step)ticks.push(Math.round(v));
  return {min:lo,max:hi,ticks:ticks};
}
var AX_TOTAL=axisFor(META.map(function(m){return m.total;}),0.06);
var AX_NET=axisFor(periods.slice(1).map(function(p){return p.net;}).concat([0]),0.12);

/* ---------- next release ---------- */
function nextReleaseInfo(){
  var p=META[N-1].date.split(' '),m=BLN.indexOf(p[1]),yr=+p[2],nm=m+6,ny=yr;if(nm>11){nm-=12;ny++;}
  var target=new Date(ny,nm,1),now=new Date();
  return {when:BLN[nm]+' '+ny, months:(target.getFullYear()-now.getFullYear())*12+(target.getMonth()-now.getMonth())};
}
/* ---------- PANDUAN (full page) ---------- */
function buildPanduan(){
  var host=$('#panduanPage');if(!host)return;
  host.innerHTML='<div class="wrap">'+
    '<div class="pg-top">'+
      '<button class="pg-back" id="pgBack" type="button" aria-label="Kembali ke dashboard" title="Kembali ke dashboard"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg></button>'+
      '<div class="pg-head"><h2 class="pg-title">Panduan &amp; sumber</h2>'+
      '<p class="pg-lede">Ringkas: cara baca dashboard ini, arti istilahnya, dan hal yang perlu diingat sebelum menyimpulkan.</p></div>'+
    '</div>'+
    '<div class="pg-doc"><div class="pg-cols">'+
      '<section class="pg-sec"><h4>Apa itu Daftar Efek Syariah (DES)?</h4>'+
        '<p>DES adalah daftar saham yang OJK nyatakan sesuai prinsip syariah. Keluar ~2× setahun (pertengahan &amp; akhir tahun). Data di sini sejak '+shortLabel(0)+'.</p>'+
        '<p>Saham masuk jika usaha &amp; rasio keuangannya memenuhi aturan OJK. Sejak <b>POJK 8/2025</b>, ambangnya lebih ketat:</p>'+
        '<ul>'+
          '<li>Utang berbasis bunga: 45% → <b>33% dari total aset</b> (bertahap 10 tahun sejak 2025).</li>'+
          '<li>Pendapatan bunga &amp; non-halal: 10% → <b>&lt;5% dari total pendapatan</b> (sekitar Apr 2026).</li>'+
        '</ul></section>'+
      '<section class="pg-sec"><h4>Cara pakai</h4>'+
        '<ul>'+
          '<li><b>Statistik atas</b>: angka ringkas: jumlah sekarang, puncak, Setia, dan Comeback. Klik kartu Setia atau Comeback untuk lihat daftarnya.</li>'+
          '<li><b>Cari saham</b>: ketik kode (mis. ASII) untuk cek statusnya sekarang dan riwayat masuk-keluarnya di tiap rilis.</li>'+
          '<li><b>Grafik tren</b>: jumlah saham per rilis. Mode Net menampilkan selisih masuk-keluar tiap periode.</li>'+
          '<li><b>Masuk &amp; keluar per periode</b>: pilih rilis di timeline untuk lihat siapa yang baru masuk dan siapa yang keluar.</li>'+
        '</ul></section>'+
      '<section class="pg-sec"><h4>Istilah</h4>'+
        '<ul class="glossary">'+
          '<li><b>Masuk</b>: belum ada di rilis sebelumnya, muncul di rilis ini.</li>'+
          '<li><b>Keluar</b>: ada di rilis sebelumnya, hilang di rilis ini.</li>'+
          '<li><b>Net</b>: jumlah masuk dikurangi jumlah keluar.</li>'+
          '<li><b>Setia</b>: ada di semua rilis, tanpa pernah absen.</li>'+
          '<li><b>Comeback</b>: pernah keluar, lalu masuk lagi (dua babak atau lebih).</li>'+
          '<li><b>1 Time</b>: muncul sekali lalu keluar (bukan pendatang baru).</li>'+
        '</ul></section>'+
      '<section class="pg-sec"><h4>Jangan salah arti</h4>'+
        '<ul>'+
          '<li><b>Keluar DES bukan delisting.</b> Artinya saham tidak lolos saringan syariah di rilis itu. Sebabnya bisa beda-beda (rasio utang, pendapatan non-halal, data tidak lengkap, dll.) dan dashboard ini tidak membedakannya. Keluar juga bukan berarti sahamnya jelek atau berhenti diperdagangkan.</li>'+
          '<li><b>&ldquo;Setia&rdquo; punya bias umur listing.</b> Hanya saham yang sudah tercatat sejak '+shortLabel(0)+' yang bisa masuk kategori ini. Setia bukan jaminan kinerja.</li>'+
          '<li><b>Comeback bukan berarti sahamnya lebih bagus.</b> Cuma artinya pernah keluar lalu masuk lagi, bukan skor kualitas.</li>'+
          '<li><b>Riwayat bukan ramalan.</b> Isi daftar berubah tiap rilis; lonjakan net bisa juga karena aturan POJK yang berubah.</li>'+
        '</ul></section>'+
    '</div>'+
    '<div class="pg-cols">'+
      '<section class="pg-sec"><h4>Sumber &amp; pembaruan</h4>'+
        '<div class="pg-src">Sumber: OJK, Daftar Efek Syariah. Kalau ragu, cek lagi ke situs OJK atau IDX.</div></section>'+
      '<section class="pg-sec"><h4>Disclaimer</h4>'+
        '<p class="disc">Isi Lotmetrik untuk edukasi, bukan saran beli/jual. Sejalan dengan POJK 6/2026.</p></section>'+
    '</div></div>';
  var b=$('#pgBack');if(b)b.addEventListener('click',closePanduan);
}
function openPanduan(){document.body.classList.add('panduan-open');try{history.replaceState(null,'','#panduan');}catch(e){}
  window.scrollTo(0,0);var b=$('#pgBack');if(b)b.focus();}
function closePanduan(){if(!document.body.classList.contains('panduan-open'))return;
  document.body.classList.remove('panduan-open');try{history.replaceState(null,'','#top');}catch(e){}
  var g=$('#guideBtn');if(g)g.focus();}

/* ---------- stats (hero) ---------- */
function renderHero(){
  var first=periods[0],last=periods[N-1];
  $('#heroMetrics').innerHTML=[
    st(fmtNum(last.total),'m-now','Terbaru'),
    st(fmtNum(peak.total),'m-peak','Puncak'),
    st(String(survivors.length),'m-setia','Setia',0),
    st(String(comeback.length),'m-back','Comeback',2)
  ].join('');
  var fy=$('#footYear');if(fy)fy.textContent=yearOf(N-1);
  function st(v,cls,l,f){var clk=f!=null;
    return (clk?'<button class="scard clk" data-f="'+f+'">':'<div class="scard">')+
      '<span class="sv '+cls+' mono">'+v+'</span>'+
      '<span class="sl-row"><span class="sl">'+esc(l)+'</span>'+(clk?'<span class="sl-more" aria-hidden="true">›</span>':'')+'</span>'+
      (clk?'</button>':'</div>');}
}

/* =====================================================================
   CHART
   ===================================================================== */
var W=1000,H=380,padL=46,padR=16,padT=18,padB=46,plotW=W-62,plotH=H-64,chartMode='total';
var ttEl=$('#chartTt'),hostEl=$('#chartHost'),wrapEl=hostEl.parentNode;
function xAt(i){return padL+plotW*(i/(N-1));}
function svgOpen(){return '<svg class="chart-svg" viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="xMidYMid meet" role="group" aria-label="Grafik daftar efek syariah '+yearOf(0)+' sampai '+yearOf(N-1)+'. Detail angka ada di tabel di bawah.">';}
function gridYears(){var s='';for(var i=0;i<N;i+=4){var anc=i===0?'start':(i>=N-2?'end':'middle'),x=i===0?padL:(i>=N-2?(W-padR):xAt(i));s+='<text x="'+x.toFixed(1)+'" y="'+(H-12)+'" font-size="14" text-anchor="'+anc+'">'+yearOf(i)+'</text>';}return s;}
function watermark(){return '';}
function hitRect(i){var w=plotW/N;return '<rect class="hit" tabindex="0" role="button" aria-label="'+esc(periods[i].label+' '+periods[i].phase+', total '+periods[i].total+' saham')+'" data-i="'+i+'" x="'+(xAt(i)-w/2).toFixed(1)+'" y="'+padT+'" width="'+w.toFixed(1)+'" height="'+plotH+'" fill="transparent" style="cursor:pointer"/>';}
function renderChart(){chartMode==='total'?renderTotal():renderNet();}
function renderTotal(){
  var ax=AX_TOTAL;function y(v){v=Math.max(ax.min,Math.min(ax.max,v));return padT+plotH*(1-(v-ax.min)/(ax.max-ax.min));}
  var grid='';ax.ticks.forEach(function(g){var yy=y(g).toFixed(1);
    grid+='<line x1="'+padL+'" y1="'+yy+'" x2="'+(W-padR)+'" y2="'+yy+'" stroke="var(--grid-line)" stroke-width="1"/>';
    grid+='<text x="'+(padL-8)+'" y="'+(+yy+8)+'" font-size="13" text-anchor="end">'+g+'</text>';});
  var pts=[];for(var i=0;i<N;i++)pts.push([xAt(i),y(META[i].total)]);
  var area=pts.map(function(p,i){return (i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1);}).join(' ');
  area+=' L'+pts[N-1][0].toFixed(1)+' '+(H-padB)+' L'+pts[0][0].toFixed(1)+' '+(H-padB)+' Z';
  var segs='';
  for(var i=1;i<N;i++){
    var a=pts[i-1],b=pts[i],down=META[i].total<META[i-1].total;
    segs+='<path d="M'+a[0].toFixed(1)+' '+a[1].toFixed(1)+' L'+b[0].toFixed(1)+' '+b[1].toFixed(1)+'" fill="none" stroke="'+(down?'var(--down)':'var(--up)')+'" stroke-width="'+(down?'2.6':'2.4')+'" stroke-linejoin="round" stroke-linecap="round"/>';
  }
  var dots='',labs='',hits='';
  for(var i=0;i<N;i++){
    var isP=i===peak.i,isL=i===N-1;
    var downPt=i>0&&META[i].total<META[i-1].total;
    var c=downPt?'var(--down)':'var(--up)',r=isP||isL?6:3;
    dots+='<circle cx="'+pts[i][0].toFixed(1)+'" cy="'+pts[i][1].toFixed(1)+'" r="'+r+'" fill="'+c+'"/>';
    labs+='<text x="'+pts[i][0].toFixed(1)+'" y="'+Math.max(12,pts[i][1]-10).toFixed(1)+'" font-size="11" font-weight="700" text-anchor="middle" fill="var(--text)">'+fmtNum(META[i].total)+'</text>';
    hits+=hitRect(i);
  }
  hostEl.innerHTML=svgOpen()+grid+gridYears()+watermark()+
    '<path d="'+area+'" fill="var(--up-soft)"/>'+segs+dots+labs+hits+'</svg>';
  bindHits();
}
function renderNet(){
  var ax=AX_NET;function y(v){v=Math.max(ax.min,Math.min(ax.max,v));return padT+plotH*(1-(v-ax.min)/(ax.max-ax.min));}
  var grid='';ax.ticks.forEach(function(g){var yy=y(g).toFixed(1);
    grid+='<line x1="'+padL+'" y1="'+yy+'" x2="'+(W-padR)+'" y2="'+yy+'" stroke="var(--grid-line)" stroke-width="'+(g===0?1.4:1)+'"/>';
    grid+='<text x="'+(padL-8)+'" y="'+(+yy+8)+'" font-size="13" text-anchor="end">'+(g>0?'+':g<0?MINUS:'')+Math.abs(g)+'</text>';});
  var bw=plotW/N*0.56,bars='',labs='',hits='';
  for(var i=1;i<N;i++){var v=periods[i].net,cx=xAt(i),top=y(Math.max(0,v)),bot=y(Math.min(0,v)),h=Math.abs(bot-top),c=v>=0?'var(--up)':'var(--down)';
    bars+='<rect x="'+(cx-bw/2).toFixed(1)+'" y="'+top.toFixed(1)+'" width="'+bw.toFixed(1)+'" height="'+Math.max(1,h).toFixed(1)+'" fill="'+c+'" rx="1"/>';
    var ly=v>=0?Math.max(12,top-6):Math.min(H-padB+2,bot+14);
    labs+='<text x="'+cx.toFixed(1)+'" y="'+ly.toFixed(1)+'" font-size="11" font-weight="700" text-anchor="middle" fill="var(--text)">'+fmtSigned(v)+'</text>';
    hits+=hitRect(i);}
  hostEl.innerHTML=svgOpen()+grid+gridYears()+watermark()+
    '<line x1="'+padL+'" y1="'+y(0).toFixed(1)+'" x2="'+(W-padR)+'" y2="'+y(0).toFixed(1)+'" stroke="var(--border-strong)" stroke-width="1.2"/>'+bars+labs+hits+'</svg>';
  bindHits();
}
function bindHits(){$$('.hit',hostEl).forEach(function(h){var i=+h.dataset.i;
  h.addEventListener('pointerenter',function(){showTT(i,h);});
  h.addEventListener('pointermove',function(){showTT(i,h);});
  h.addEventListener('pointerleave',hideTT);
  h.addEventListener('pointerdown',function(){showTT(i,h);});
  h.addEventListener('focus',function(){showTT(i,h);});
  h.addEventListener('blur',hideTT);
  h.addEventListener('click',function(){hideTT();setPeriod(i,{user:true});scrollTo('#periode');});
  h.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();hideTT();setPeriod(i,{user:true});scrollTo('#periode');}});});}
function showTT(i,hit){var p=periods[i],html;
  if(chartMode==='total'){html='<div class="d">'+esc(p.label)+' · '+p.phase+'</div><div class="r"><span>Total</span><b>'+fmtNum(p.total)+'</b></div>';
    if(!p.baseline)html+='<div class="r"><span>Masuk</span><b class="up">+'+p.masuk.length+'</b></div><div class="r"><span>Keluar</span><b class="down">'+MINUS+p.keluar.length+'</b></div>';
    else html+='<div class="r"><span>periode awal</span><b>baseline</b></div>';}
  else{html='<div class="d">'+esc(p.label)+' · '+p.phase+'</div><div class="r"><span>Masuk</span><b class="up">+'+p.masuk.length+'</b></div><div class="r"><span>Keluar</span><b class="down">'+MINUS+p.keluar.length+'</b></div><div class="r"><span>Net</span><b class="'+(p.net>=0?'up':'down')+'">'+fmtSigned(p.net)+'</b></div>';}
  ttEl.innerHTML=html;ttEl.classList.add('on');
  var hr=hit.getBoundingClientRect(),wr=wrapEl.getBoundingClientRect(),cx=hr.left+hr.width/2-wr.left,cy=hr.top+Math.min(hr.height,120)/2-wr.top;
  var pad=8,tw=ttEl.offsetWidth||160,th=ttEl.offsetHeight||70;
  var left=Math.max(pad,Math.min(cx-tw/2,wrapEl.clientWidth-tw-pad));
  var top=cy-th-16;if(top<pad)top=Math.min(cy+18,wrapEl.clientHeight-th-pad);
  if(top<pad)top=pad;
  ttEl.style.left=left+'px';ttEl.style.top=top+'px';}
function hideTT(){ttEl.classList.remove('on');}
function renderChartSR(){var sr=$('#chartSR');if(!sr)return;
  sr.innerHTML='<table><caption>Data daftar efek syariah per rilis</caption><thead><tr><th>Periode</th><th>Total</th><th>Masuk</th><th>Keluar</th></tr></thead><tbody>'+
    periods.map(function(p){return '<tr><td>'+esc(p.label)+' '+p.phase+'</td><td>'+p.total+'</td><td>'+(p.baseline?'-':'+'+p.masuk.length)+'</td><td>'+(p.baseline?'-':p.keluar.length)+'</td></tr>';}).join('')+'</tbody></table>';}
$$('#chartSeg .seg-btn').forEach(function(b){b.addEventListener('click',function(){
  $$('#chartSeg .seg-btn').forEach(function(x){x.classList.remove('is-active');x.setAttribute('aria-pressed','false');});
  b.classList.add('is-active');b.setAttribute('aria-pressed','true');chartMode=b.dataset.mode;hideTT();renderChart();});});

/* =====================================================================
   PERIOD EXPLORER - timeline + 2-kolom masuk/keluar
   ===================================================================== */
var curPeriod=N-1;
function buildTimeline(){
  $('#timeline').innerHTML=periods.map(function(p){
    var nb=p.baseline?'nb':(p.net>=0?'nb pos':'nb neg'),mo=monthAbbr(p.i);
    return '<button type="button" class="tl-box" data-i="'+p.i+'" role="tab" aria-selected="false" tabindex="-1" aria-label="'+esc(yearOf(p.i)+' '+mo+', '+p.total+' saham')+'"><span class="yr mono">'+yearOf(p.i)+'</span><span class="ph mono">'+mo+'</span><span class="tt2 mono">'+fmtNum(p.total)+'</span><span class="'+nb+'"></span></button>';
  }).join('');
  var sel=$('#periodSelect');
  if(sel){sel.innerHTML=periods.map(function(p){return '<option value="'+p.i+'">'+esc(yearOf(p.i)+' '+monthAbbr(p.i))+' · '+fmtNum(p.total)+' saham</option>';}).join('');
    sel.onchange=function(){setPeriod(+this.value,{user:true});};}
  $('#timeline').addEventListener('click',function(e){var b=e.target.closest('[data-i]');if(b)setPeriod(+b.dataset.i,{user:true});});
  $('#timeline').addEventListener('keydown',function(e){
    if(e.key!=='ArrowLeft'&&e.key!=='ArrowRight'&&e.key!=='Home'&&e.key!=='End')return;e.preventDefault();var ni=curPeriod;
    if(e.key==='ArrowLeft')ni=Math.max(0,curPeriod-1);else if(e.key==='ArrowRight')ni=Math.min(N-1,curPeriod+1);
    else if(e.key==='Home')ni=0;else if(e.key==='End')ni=N-1;
    setPeriod(ni,{user:true});var b=$('#timeline .tl-box[data-i="'+ni+'"]');if(b)b.focus();});
}
function setPeriod(i,opts){opts=opts||{};var p=periods[i];curPeriod=i;
  var tl=$('#timeline'),active=null;
  $$('#timeline .tl-box').forEach(function(b){var on=+b.dataset.i===i;b.classList.toggle('active',on);b.setAttribute('aria-selected',on?'true':'false');b.tabIndex=on?0:-1;if(on)active=b;});
  if(active&&tl)tl.scrollTo({left:active.offsetLeft-(tl.clientWidth-active.offsetWidth)/2,behavior:reduceMotion()?'auto':'smooth'});
  var sel=$('#periodSelect');if(sel&&String(sel.value)!==String(i))sel.value=String(i);
  $('#pPrev').disabled=i<=0;$('#pNext').disabled=i>=N-1;
  renderPSum();renderTiles();renderIO();
  if(opts.user)setHash('p='+p.key);}
function renderPSum(){var p=periods[curPeriod],host=$('#pSumRow');if(!host)return;
  function tile(c,l,v,extra){return '<div class="tile '+c+(extra||'')+'"><div class="tl2">'+l+'</div><div class="tv mono">'+v+'</div></div>';}
  if(p.baseline){host.innerHTML=tile('net','Total',fmtNum(p.total))+tile('net','Baseline',fmtNum(p.total),' wide');return;}
  host.innerHTML=
    tile('net','Total',fmtNum(p.total))+
    tile('in','Masuk','+'+fmtNum(p.masuk.length))+
    tile('out','Keluar',MINUS+fmtNum(p.keluar.length))+
    tile('net','Net',fmtSigned(p.net));}
function renderTiles(){/* digabung ke renderPSum */}
function renderIO(){var p=periods[curPeriod],out=p.keluar.slice(),inn=p.masuk.slice();
  col($('#ioListOut'),out,'out',p.baseline?'Periode awal, tidak ada data keluar.':null);
  col($('#ioListIn'),inn,'in',null);
  $('#cntOut').textContent=p.baseline?'0':fmtNum(out.length);
  $('#cntIn').textContent=fmtNum(inn.length);
  function col(ul,arr,cls,baseEmpty){
    if(!arr.length){ul.innerHTML='<li class="io-empty">'+(baseEmpty||'Tidak ada.')+'</li>';return;}
    ul.innerHTML=arr.map(function(t){return '<li class="io-row '+cls+'" role="button" tabindex="0" data-trk="'+t+'" aria-label="'+esc(t+' '+(NAMES[t]||t))+'"><span class="tk mono">'+t+'</span><span class="nm">'+esc(NAMES[t]||t)+'</span><span class="ar mono">›</span></li>';}).join('');}
}
function ioActivate(e){var r=e.target.closest('[data-trk]');if(r){showTracker(r.dataset.trk,true);scrollTo('#lacak');}}
['#ioListOut','#ioListIn'].forEach(function(sel){var e=$(sel);if(!e)return;
  e.addEventListener('click',ioActivate);
  e.addEventListener('keydown',function(ev){if((ev.key==='Enter'||ev.key===' ')&&ev.target.closest('[data-trk]')){ev.preventDefault();ioActivate(ev);}});});
$('#pPrev').addEventListener('click',function(){if(curPeriod>0)setPeriod(curPeriod-1,{user:true});});
$('#pNext').addEventListener('click',function(){if(curPeriod<N-1)setPeriod(curPeriod+1,{user:true});});

/* =====================================================================
   STOCK TRACKER
   ===================================================================== */
function trackerText(rec){
  var code=rec.t, name=rec.name, path='des.lotmetrik.my.id/saham/'+code.toLowerCase();
  if(rec.statusNow)return code+' ('+name+') saat ini berstatus SYARIAH. Terdaftar di Daftar Efek Syariah OJK. Cek: '+path;
  return code+' ('+name+') saat ini berstatus TIDAK SYARIAH. Tidak ada di Daftar Efek Syariah OJK saat ini. Cek: '+path;
}
function showTracker(code,user){code=String(code||'').trim().toUpperCase();var rec=perT[code],host=$('#trkRes');
  if(!rec){var sug=TICKERS.filter(function(t){return t.indexOf(code)===0;}).slice(0,6);
    var html='<p class="tr-hint">Kode <b>'+esc(code)+'</b> tidak ditemukan dalam data DES '+yearOf(0)+'-'+yearOf(N-1)+'.';
    if(sug.length){html+=' Mungkin maksudmu: '+sug.map(function(t){return '<a href="#" data-trk="'+t+'">'+t+'</a>';}).join(', ')+'.';
      html+=' Atau buka halaman publik: '+sug.map(function(t){return '<a href="/saham/'+t.toLowerCase()+'">'+t+'</a>';}).join(', ')+'.';}
    else{html+=' Cek ejaan, atau coba <a href="#" data-trk="ASII">ASII</a>, <a href="#" data-trk="TLKM">TLKM</a>, <a href="#" data-trk="BUKA">BUKA</a>.';
      if(/^[A-Z]{4}$/.test(code))html+=' Halaman SEO untuk kode ini tidak ada karena belum pernah masuk DES dalam rentang data.';}
    host.innerHTML=html+'</p>';return;}
  $('#trkInput').value=code; if(user)setHash('t='+code);
  var inNow=rec.statusNow;
  var vic=inNow?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  var seo='/saham/'+code.toLowerCase();
  host.innerHTML='<div class="tr-verdict '+(inNow?'in':'out')+'">'+
      '<span class="vic" aria-hidden="true">'+vic+'</span>'+
      '<div class="vbody"><div class="vmain">'+(inNow?'SYARIAH':'TIDAK SYARIAH')+'</div>'+
        '<div class="vsub">'+esc(rec.name)+'</div></div>'+
      '<div class="tr-acts">'+
        '<a class="btn btn-ghost btn-sm" href="'+seo+'">Lihat Detail</a>'+
        '<button class="btn btn-ghost btn-sm" id="trkShare" type="button">Bagikan</button>'+
      '</div></div>';
  $('#trkShare').onclick=function(){var url=SITE+seo,txt=trackerText(rec);
    if(navigator.share)navigator.share({title:'DES · '+code,text:txt,url:url}).catch(function(){});
    else{copyText(txt);toast('Teks disalin');}};
}
function doTrack(){var v=$('#trkInput').value;if(v)showTracker(v,true);}
$('#trkBtn').addEventListener('click',doTrack);
$('#trkInput').addEventListener('input',function(){var v=this.value.trim().toUpperCase();if(perT[v])showTracker(v,true);});
$('#trkInput').addEventListener('keydown',function(e){if(e.key==='Enter')doTrack();});
$('#trkRes').addEventListener('click',function(e){var a=e.target.closest('[data-trk]');if(a){e.preventDefault();showTracker(a.dataset.trk,true);}});

/* =====================================================================
   FACTS + MODAL
   ===================================================================== */
var FACTS=[
  {v:String(survivors.length),l:'Saham setia',d:'Lolos di semua periode tanpa absen',cls:'hl',kind:'list',list:survivors,title:survivors.length+' Saham Paling Setia',sub:'Ada di semua rilis tanpa absen. Hanya yang listing sejak '+shortLabel(0)+' (bias umur), bukan rekomendasi.'},
  {v:fmtNum(TICKERS.length),l:'Saham unik',d:'Pernah masuk DES minimal sekali',cls:'',kind:'list',list:TICKERS.slice(),title:fmtNum(TICKERS.length)+' Saham Unik',sub:'Semua emiten yang pernah mampir di DES.'},
  {v:String(comeback.length),l:'Comeback',d:'Keluar lalu masuk daftar lagi',cls:'up',kind:'list',list:comeback,title:comeback.length+' Saham Comeback',sub:'Pernah keluar, lalu masuk lagi, bukan skor kualitas.'},
  {v:String(oneHit.length),l:'1 Time',d:'Cuma 1 periode lalu keluar lagi',cls:'',kind:'list',list:oneHit,title:oneHit.length+' Saham 1 Time',sub:'Muncul cuma 1 periode lalu keluar. (Pendatang baru yang masih di dalam tidak dihitung.)'},
  {v:perT[revTop[0]].flips+'x',l:'Pintu putar',d:revTop.join(', ')+', bolak-balik masuk-keluar',cls:'',kind:'revolve',title:'Si Paling Pintu Putar',sub:'Diurut dari yang paling sering ganti status masuk-keluar.'},
  {v:MINUS+maxOut.n,l:'Keluar terbanyak',d:shortLabel(maxOut.i)+': '+fmtNum(maxOut.n)+' saham dicoret sekaligus',cls:'down',kind:'period',i:maxOut.i,title:''}
];
function factClick(e){var b=e.target.closest('[data-f]');if(b)openFact(+b.dataset.f);}
$('#heroMetrics').addEventListener('click',factClick);
function openFact(idx){var f=FACTS[idx];
  if(f.kind==='period'){setPeriod(f.i,{user:true});scrollTo('#periode');toast('Dibuka: '+shortLabel(f.i)+' (keluar '+periods[f.i].keluar.length+')');return;}
  setHash('f='+idx);
  if(f.kind==='revolve'){var top=revolving.slice(0,18);
    var body='<ul class="mlist">'+top.map(function(t){var r=perT[t];
      return '<li class="mrow" role="button" tabindex="0" data-trk="'+t+'" aria-label="'+esc(t+' '+r.name)+'"><span class="tk mono">'+t+'</span><span class="nm">'+esc(r.name)+'</span><span class="ct mono">'+r.flips+'x ganti · '+r.count+'/'+N+'</span></li>';}).join('')+'</ul>';
    showModal(f.title,f.sub,body);return;}
  var list=f.list;
  var body='<div class="taglist">'+list.map(function(t){return '<button class="tag2" data-trk="'+t+'" title="'+esc(NAMES[t]||'')+'">'+t+'</button>';}).join('')+'</div>';
  showModal(f.title,f.sub+' Ketuk kode untuk lacak.',body);}
var modalBack=$('#modalBack'),lastFocus=null;
function focusables(){return $$('.modal button, .modal [href], .modal input, .modal [tabindex]:not([tabindex="-1"])',modalBack);}
function showModal(title,sub,body){lastFocus=document.activeElement;$('#modalTitle').textContent=title;$('#modalSub').textContent=sub||'';$('#modalBody').innerHTML=body;
  modalBack.classList.add('on');document.body.style.overflow='hidden';var m=modalBack.querySelector('.modal');if(m)m.focus();}
function closeModal(){if(!modalBack.classList.contains('on'))return;modalBack.classList.remove('on');document.body.style.overflow='';if(lastFocus&&lastFocus.focus)lastFocus.focus();}
$('#modalX').addEventListener('click',closeModal);
modalBack.addEventListener('click',function(e){if(e.target===modalBack)closeModal();});
function modalActivate(e){var a=e.target.closest('[data-trk]');if(a){closeModal();showTracker(a.dataset.trk,true);scrollTo('#lacak');}}
$('#modalBody').addEventListener('click',modalActivate);
$('#modalBody').addEventListener('keydown',function(e){if((e.key==='Enter'||e.key===' ')&&e.target.closest('[data-trk]')){e.preventDefault();modalActivate(e);}});
modalBack.addEventListener('keydown',function(e){if(e.key==='Tab'){var f=focusables();if(!f.length)return;var first=f[0],last=f[f.length-1];
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
document.addEventListener('keydown',function(e){if(e.key==='Escape'){closeModal();hideTT();closePanduan();}});

/* =====================================================================
   THEME / GUIDE / DEEP-LINK / utils
   ===================================================================== */
var TKEY='lotmetrik-des-theme';
var CKEY='lotmetrik-des-chart-open';
function applyTheme(m){var t=$('#themeBtn');
  if(m==='terminal'){document.documentElement.setAttribute('data-theme','terminal');document.querySelector('meta[name=theme-color]').content='#0B1F3A';if(t)t.setAttribute('aria-pressed','true');}
  else{document.documentElement.removeAttribute('data-theme');document.querySelector('meta[name=theme-color]').content='#F5F7FA';if(t)t.setAttribute('aria-pressed','false');}}
(function(){try{var s=localStorage.getItem(TKEY);if(s)applyTheme(s);}catch(e){}})();
$('#themeBtn').addEventListener('click',function(){var term=document.documentElement.getAttribute('data-theme')==='terminal';var next=term?'light':'terminal';applyTheme(next);try{localStorage.setItem(TKEY,next);}catch(e){}});
(function initChartTog(){
  var card=$('#grafik .card'),btn=$('#chartTog');if(!card||!btn)return;
  function setOpen(on){
    card.classList.toggle('is-collapsed',!on);
    btn.setAttribute('aria-expanded',on?'true':'false');
    var lab=on?'Tutup grafik':'Buka grafik';
    btn.setAttribute('aria-label',lab);
    btn.setAttribute('title',lab);
    try{localStorage.setItem(CKEY,on?'1':'0');}catch(e){}
  }
  var open=true;try{var s=localStorage.getItem(CKEY);if(s==='0')open=false;else if(s==='1')open=true;}catch(e){}
  setOpen(open);
  btn.addEventListener('click',function(){setOpen(btn.getAttribute('aria-expanded')!=='true');});
})();
$('#guideBtn').addEventListener('click',openPanduan);
var gb2=$('#guideBtn2');if(gb2)gb2.addEventListener('click',openPanduan);
var bh=$('#brandHome');if(bh)bh.addEventListener('click',function(e){if(document.body.classList.contains('panduan-open')){e.preventDefault();closePanduan();}});

function setHash(s){try{history.replaceState(null,'','#'+s);}catch(e){}}
function applyHash(){var h=(location.hash||'').replace(/^#/,''),m={};
  if(h==='panduan'){setPeriod(N-1);openPanduan();return;}
  h.split('&').forEach(function(p){var kv=p.split('=');if(kv[0])m[kv[0]]=decodeURIComponent(kv[1]||'');});
  if(m.t){setPeriod(N-1);showTracker(m.t,false);scrollTo('#lacak');return;}
  if(m.p){var pi=-1;for(var i=0;i<N;i++)if(META[i].key===m.p)pi=i;if(pi>=0){setPeriod(pi);scrollTo('#periode');return;}}
  if(m.f){var fi=+m.f;setPeriod(N-1);if(FACTS[fi]){openFact(fi);}return;}
  setPeriod(N-1);}

function copyText(t){if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).catch(function(){fb(t);});else fb(t);
  function fb(x){var a=el('textarea');a.value=x;a.style.position='fixed';a.style.opacity='0';document.body.appendChild(a);a.select();try{document.execCommand('copy');}catch(e){}a.remove();}}
var toastT;function toast(m){var e=$('#toast');e.textContent=m;e.classList.add('on');clearTimeout(toastT);toastT=setTimeout(function(){e.classList.remove('on');},2400);}
function scrollTo(s){var t=$(s);if(t)t.scrollIntoView({behavior:reduceMotion()?'auto':'smooth',block:'start'});}

/* ---------- INIT ---------- */
renderHero();buildPanduan();renderChart();renderChartSR();buildTimeline();applyHash();
})();
