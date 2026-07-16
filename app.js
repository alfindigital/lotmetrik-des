/* =====================================================================
   Lotmetrik — DES Explorer (v2.2, compact layout)
   Alat data Daftar Efek Syariah OJK. Zero dependencies.
   Angka + rentang sumbu dihitung dari data.js. Panduan/sumber ada di modal.
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
function setPeriodeNote(){var e=$('#periodeNote');if(!e)return;e.textContent=N+' rilis · berikutnya ≈ '+nextReleaseInfo().when;}

/* ---------- PANDUAN (full page) ---------- */
function buildPanduan(){
  var r=nextReleaseInfo(),host=$('#panduanPage');if(!host)return;
  host.innerHTML='<div class="wrap">'+
    '<div class="pg-top"><button class="btn btn-ghost btn-sm pg-back" id="pgBack" type="button">&#8249; Dashboard</button><span class="tag">Panduan</span></div>'+
    '<h2 class="pg-title">Panduan &amp; sumber</h2>'+
    '<p class="pg-lede">Cara membaca data Daftar Efek Syariah OJK di dashboard ini, arti tiap istilah, dan catatan penting sebelum menyimpulkan.</p>'+
    '<div class="guide pg-guide">'+
      '<h4>Apa itu Daftar Efek Syariah (DES)?</h4>'+
      '<p>DES adalah daftar resmi saham yang dinyatakan sesuai prinsip syariah oleh OJK. Diterbitkan berkala, sekitar 2x setahun (periode I pertengahan tahun, periode II akhir tahun). Sejak '+shortLabel(0)+' sudah '+N+' rilis.</p>'+
      '<p>Sebuah saham lolos bila memenuhi rasio keuangan syariah, di antaranya: total utang berbasis bunga di bawah 45% total aset, dan pendapatan bunga serta pendapatan tidak halal lainnya di bawah 10% total pendapatan. Kriteria lengkap mengikuti aturan OJK.</p>'+
      '<h4>Cara pakai</h4>'+
      '<ul>'+
        '<li><b>Statistik atas</b> — ringkasan angka: jumlah kini, puncak, awal, saham unik, setia, dan comeback. Kartu yang bisa diklik membuka daftar isinya.</li>'+
        '<li><b>Cari saham</b> — ketik kode (mis. ASII) untuk melihat jejak satu saham di seluruh '+N+' rilis: kapan masuk, kapan keluar.</li>'+
        '<li><b>Grafik tren</b> — jumlah saham tiap rilis. Mode &ldquo;Net masuk-keluar&rdquo; menampilkan selisih tiap periode. Tap titik atau batang untuk membuka periode itu.</li>'+
        '<li><b>Fakta dekade</b> — sorotan pola menarik sepanjang '+N+' rilis. Tap untuk daftar lengkapnya.</li>'+
        '<li><b>Masuk &amp; keluar per periode</b> — pilih rilis di timeline untuk melihat siapa yang baru lolos dan siapa yang dicoret. Bisa dicari dan diunduh sebagai CSV.</li>'+
      '</ul>'+
      '<h4>Istilah</h4>'+
      '<ul class="glossary">'+
        '<li><b>Masuk</b> — saham yang tidak ada di rilis sebelumnya, muncul di rilis ini.</li>'+
        '<li><b>Keluar</b> — saham yang ada di rilis sebelumnya, hilang di rilis ini.</li>'+
        '<li><b>Bersih (net)</b> — jumlah masuk dikurangi jumlah keluar.</li>'+
        '<li><b>Setia '+N+'/'+N+'</b> — hadir di semua '+N+' rilis tanpa pernah absen.</li>'+
        '<li><b>Comeback</b> — pernah keluar lalu masuk lagi (dua babak atau lebih).</li>'+
        '<li><b>Sekali lewat</b> — muncul cuma satu periode lalu keluar. Pendatang baru yang masih di dalam tidak dihitung.</li>'+
        '<li><b>Pintu putar</b> — paling sering berganti status masuk-keluar.</li>'+
      '</ul>'+
      '<h4>Baca hati-hati</h4>'+
      '<ul>'+
        '<li><b>Keluar DES bukan delisting.</b> Keluar berarti saham tidak lolos saringan syariah pada rilis itu — sebabnya bisa macam-macam (rasio utang, pendapatan non-halal, ketersediaan data, dan lain-lain) dan data ini tidak membedakannya. Keluar bukan berarti sahamnya jelek atau berhenti diperdagangkan.</li>'+
        '<li><b>&ldquo;Setia&rdquo; punya bias umur listing.</b> Hanya saham yang sudah tercatat sejak '+shortLabel(0)+' yang bisa masuk kategori setia '+N+'/'+N+'. Setia bukan jaminan kinerja.</li>'+
        '<li><b>Data historis tidak menjamin masa depan.</b> Komposisi daftar berubah tiap rilis.</li>'+
      '</ul>'+
      '<h4>Sumber &amp; pembaruan</h4>'+
      '<div class="pg-src">Sumber: OJK — Daftar Efek Syariah.<br>Data per '+esc(META[N-1].date)+' ('+esc(META[N-1].kep)+').<br>'+N+' rilis · '+fmtNum(TICKERS.length)+' emiten unik (basis: saham berkode IDX).<br>Rilis berikutnya diperkirakan sekitar '+r.when+'. Selalu verifikasi ke sumber resmi OJK &amp; IDX.</div>'+
      '<h4>Disclaimer</h4>'+
      '<p class="disc">Konten Lotmetrik adalah edukasi berbasis data — bukan rekomendasi, ajakan, atau nasihat investasi. Lotmetrik bukan penasihat investasi berizin. Data historis tidak menjamin kinerja masa depan. Sejalan dengan POJK 6/2026.</p>'+
      '<h4>Alat gratis lain dari Lotmetrik</h4>'+
      '<div class="guide-links">'+
        '<a href="https://5.lotmetrik.my.id" target="_blank" rel="noopener">KSEI 5% Harian</a>'+
        '<a href="https://beta.lotmetrik.my.id" target="_blank" rel="noopener">Radar Beta</a>'+
        '<a href="https://lotmetrik.my.id" target="_blank" rel="noopener">lotmetrik.my.id</a>'+
        '<a href="https://instagram.com/lotmetrik" target="_blank" rel="noopener">@lotmetrik</a>'+
      '</div>'+
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
    st(fmtNum(last.total),'','Kini · '+shortLabel(last.i)),
    st(fmtNum(peak.total),'hl','Puncak · '+shortLabel(peak.i)),
    st(fmtNum(first.total),'','Awal · '+shortLabel(first.i)),
    st(fmtNum(TICKERS.length),'','Saham unik',1),
    st(String(survivors.length),'up','Setia '+N+'/'+N,0),
    st(String(comeback.length),'up','Comeback',2)
  ].join('');
  var cr=$('#chartRange');if(cr)cr.textContent=yearOf(0)+'–'+yearOf(N-1)+' · '+N+' rilis';
  var fy=$('#footYear');if(fy)fy.textContent=yearOf(N-1);
  function st(v,cls,l,f){var clk=f!=null;
    return (clk?'<button class="scard clk" data-f="'+f+'">':'<div class="scard">')+
      '<span class="sv '+cls+' mono">'+v+'</span><span class="sl">'+esc(l)+'</span>'+
      (clk?'<span class="sl-more">Lihat ›</span></button>':'</div>');}
}

/* =====================================================================
   CHART
   ===================================================================== */
var W=1000,H=380,padL=46,padR=16,padT=18,padB=32,plotW=W-62,plotH=H-50,chartMode='total';
var ttEl=$('#chartTt'),hostEl=$('#chartHost'),wrapEl=hostEl.parentNode;
function xAt(i){return padL+plotW*(i/(N-1));}
function svgOpen(){return '<svg class="chart-svg" viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="xMidYMid meet" role="group" aria-label="Grafik daftar efek syariah '+yearOf(0)+' sampai '+yearOf(N-1)+'. Detail angka ada di tabel di bawah.">';}
function gridYears(){var s='';for(var i=0;i<N;i+=4){s+='<text x="'+xAt(i).toFixed(1)+'" y="'+(H-8)+'" font-size="25" text-anchor="middle">'+yearOf(i)+'</text>';}return s;}
function watermark(){return '<text class="wmk" x="'+(W-padR-6)+'" y="'+(H-padB-4)+'" font-size="26" text-anchor="end">@lotmetrik</text>';}
function hitRect(i){var w=plotW/N;return '<rect class="hit" tabindex="0" role="button" aria-label="'+esc(periods[i].label+' '+periods[i].phase+', total '+periods[i].total+' saham')+'" data-i="'+i+'" x="'+(xAt(i)-w/2).toFixed(1)+'" y="'+padT+'" width="'+w.toFixed(1)+'" height="'+plotH+'" fill="transparent" style="cursor:pointer"/>';}
function renderChart(){chartMode==='total'?renderTotal():renderNet();renderLegend();}
function renderTotal(){
  var ax=AX_TOTAL;function y(v){v=Math.max(ax.min,Math.min(ax.max,v));return padT+plotH*(1-(v-ax.min)/(ax.max-ax.min));}
  var grid='';ax.ticks.forEach(function(g){var yy=y(g).toFixed(1);
    grid+='<line x1="'+padL+'" y1="'+yy+'" x2="'+(W-padR)+'" y2="'+yy+'" stroke="var(--grid-line)" stroke-width="1"/>';
    grid+='<text x="'+(padL-8)+'" y="'+(+yy+8)+'" font-size="23" text-anchor="end">'+g+'</text>';});
  var pts=[];for(var i=0;i<N;i++)pts.push([xAt(i),y(META[i].total)]);
  var line=pts.map(function(p,i){return (i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1);}).join(' ');
  var area=line+' L'+pts[N-1][0].toFixed(1)+' '+(H-padB)+' L'+pts[0][0].toFixed(1)+' '+(H-padB)+' Z';
  var drop='M'+pts[peak.i][0].toFixed(1)+' '+pts[peak.i][1].toFixed(1);
  for(var i=peak.i+1;i<N;i++)drop+=' L'+pts[i][0].toFixed(1)+' '+pts[i][1].toFixed(1);
  var dots='',hits='';
  for(var i=0;i<N;i++){var isP=i===peak.i,isL=i===N-1,c=isP?'var(--highlight)':(isL?'var(--down)':'var(--up)'),r=isP||isL?6:3;
    dots+='<circle cx="'+pts[i][0].toFixed(1)+'" cy="'+pts[i][1].toFixed(1)+'" r="'+r+'" fill="'+c+'"/>';hits+=hitRect(i);}
  hostEl.innerHTML=svgOpen()+grid+gridYears()+watermark()+
    '<path d="'+area+'" fill="var(--up-soft)"/>'+
    '<path d="'+line+'" fill="none" stroke="var(--up)" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>'+
    '<path d="'+drop+'" fill="none" stroke="var(--down)" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>'+dots+hits+'</svg>';
  bindHits();
}
function renderNet(){
  var ax=AX_NET;function y(v){v=Math.max(ax.min,Math.min(ax.max,v));return padT+plotH*(1-(v-ax.min)/(ax.max-ax.min));}
  var grid='';ax.ticks.forEach(function(g){var yy=y(g).toFixed(1);
    grid+='<line x1="'+padL+'" y1="'+yy+'" x2="'+(W-padR)+'" y2="'+yy+'" stroke="var(--grid-line)" stroke-width="'+(g===0?1.4:1)+'"/>';
    grid+='<text x="'+(padL-8)+'" y="'+(+yy+8)+'" font-size="23" text-anchor="end">'+(g>0?'+':g<0?MINUS:'')+Math.abs(g)+'</text>';});
  var bw=plotW/N*0.56,bars='',hits='';
  for(var i=1;i<N;i++){var v=periods[i].net,cx=xAt(i),top=y(Math.max(0,v)),bot=y(Math.min(0,v)),h=Math.abs(bot-top),c=v>=0?'var(--up)':'var(--down)';
    bars+='<rect x="'+(cx-bw/2).toFixed(1)+'" y="'+top.toFixed(1)+'" width="'+bw.toFixed(1)+'" height="'+Math.max(1,h).toFixed(1)+'" fill="'+c+'" rx="1"/>';hits+=hitRect(i);}
  hostEl.innerHTML=svgOpen()+grid+gridYears()+watermark()+
    '<line x1="'+padL+'" y1="'+y(0).toFixed(1)+'" x2="'+(W-padR)+'" y2="'+y(0).toFixed(1)+'" stroke="var(--border-strong)" stroke-width="1.2"/>'+bars+hits+'</svg>';
  bindHits();
}
function renderLegend(){
  $('#chartLegend').innerHTML=chartMode==='total'
    ?'<span><i style="background:var(--up)"></i>Jumlah saham</span><span><i style="background:var(--highlight)"></i>Puncak '+peak.total+'</span><span><i style="background:var(--down)"></i>Penurunan '+yearOf(N-1)+'</span><span class="axnote">sumbu Y tidak mulai dari 0</span>'
    :'<span><i style="background:var(--up)"></i>Net masuk</span><span><i style="background:var(--down)"></i>Net keluar</span><span class="axnote">tiap batang = masuk − keluar</span>';
}
function bindHits(){$$('.hit',hostEl).forEach(function(h){var i=+h.dataset.i;
  h.addEventListener('pointerenter',function(){showTT(i,h);});
  h.addEventListener('pointermove',function(){showTT(i,h);});
  h.addEventListener('pointerleave',hideTT);
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
  var tw=ttEl.offsetWidth,th=ttEl.offsetHeight,left=Math.max(4,Math.min(cx-tw/2,wrapEl.clientWidth-tw-4)),top=cy-th-14;if(top<0)top=cy+16;
  ttEl.style.left=left+'px';ttEl.style.top=top+'px';}
function hideTT(){ttEl.classList.remove('on');}
function renderChartSR(){var sr=$('#chartSR');if(!sr)return;
  sr.innerHTML='<table><caption>Data daftar efek syariah per rilis</caption><thead><tr><th>Periode</th><th>Total</th><th>Masuk</th><th>Keluar</th></tr></thead><tbody>'+
    periods.map(function(p){return '<tr><td>'+esc(p.label)+' '+p.phase+'</td><td>'+p.total+'</td><td>'+(p.baseline?'-':'+'+p.masuk.length)+'</td><td>'+(p.baseline?'-':p.keluar.length)+'</td></tr>';}).join('')+'</tbody></table>';}
$$('#chartSeg .seg-btn').forEach(function(b){b.addEventListener('click',function(){
  $$('#chartSeg .seg-btn').forEach(function(x){x.classList.remove('is-active');x.setAttribute('aria-pressed','false');});
  b.classList.add('is-active');b.setAttribute('aria-pressed','true');chartMode=b.dataset.mode;hideTT();renderChart();});});

/* =====================================================================
   PERIOD EXPLORER — timeline + 2-kolom masuk/keluar
   ===================================================================== */
var curPeriod=N-1,ioQuery='';
function buildTimeline(){
  $('#timeline').innerHTML=periods.map(function(p){
    var nb=p.baseline?'nb':(p.net>=0?'nb pos':'nb neg');
    return '<button type="button" class="tl-box" data-i="'+p.i+'" role="tab" aria-selected="false" tabindex="-1" aria-label="'+esc(p.label+' '+p.phase+', '+p.total+' saham')+'"><span class="yr mono">'+yearOf(p.i)+'</span><span class="ph mono">'+p.phase+'</span><span class="tt2 mono">'+fmtNum(p.total)+'</span><span class="'+nb+'"></span></button>';
  }).join('');
  $('#timeline').addEventListener('click',function(e){var b=e.target.closest('[data-i]');if(b)setPeriod(+b.dataset.i,{user:true});});
  $('#timeline').addEventListener('keydown',function(e){
    if(e.key!=='ArrowLeft'&&e.key!=='ArrowRight'&&e.key!=='Home'&&e.key!=='End')return;e.preventDefault();var ni=curPeriod;
    if(e.key==='ArrowLeft')ni=Math.max(0,curPeriod-1);else if(e.key==='ArrowRight')ni=Math.min(N-1,curPeriod+1);
    else if(e.key==='Home')ni=0;else if(e.key==='End')ni=N-1;
    setPeriod(ni,{user:true});var b=$('#timeline .tl-box[data-i="'+ni+'"]');if(b)b.focus();});
}
function setPeriod(i,opts){opts=opts||{};var p=periods[i];curPeriod=i;ioQuery='';$('#ioSearch').value='';
  var tl=$('#timeline'),active=null;
  $$('#timeline .tl-box').forEach(function(b){var on=+b.dataset.i===i;b.classList.toggle('active',on);b.setAttribute('aria-selected',on?'true':'false');b.tabIndex=on?0:-1;if(on)active=b;});
  if(active&&tl)tl.scrollTo({left:active.offsetLeft-(tl.clientWidth-active.offsetWidth)/2,behavior:reduceMotion()?'auto':'smooth'});
  $('#pPrev').disabled=i<=0;$('#pNext').disabled=i>=N-1;
  renderPSum();renderTiles();renderIO();
  if(opts.user)setHash('p='+p.key);}
function renderPSum(){var p=periods[curPeriod];
  $('#pSumHead').innerHTML='<span class="pt mono">'+fmtNum(p.total)+'</span><span class="pm">saham syariah · efektif <b>'+esc(p.date)+'</b> · '+esc(p.kep)+'</span>';}
function renderTiles(){var p=periods[curPeriod];
  if(p.baseline){$('#pTiles').innerHTML='<div class="tile net" style="grid-column:1/-1"><div class="tl2">Periode awal (baseline)</div><div class="tv mono">'+fmtNum(p.total)+'</div><div class="ts">titik mulai daftar, belum ada data masuk/keluar</div></div>';return;}
  $('#pTiles').innerHTML=
    tile('in','Masuk','+'+fmtNum(p.masuk.length),'saham baru lolos')+
    tile('out','Keluar',MINUS+fmtNum(p.keluar.length),'saham dicoret')+
    tile('net','Bersih',fmtSigned(p.net),'selisih masuk-keluar');
  function tile(c,l,v,s){return '<div class="tile '+c+'"><div class="tl2">'+l+'</div><div class="tv mono">'+v+'</div><div class="ts">'+s+'</div></div>';}
}
function renderIO(){var p=periods[curPeriod],q=ioQuery.trim().toUpperCase();
  function filt(a){return q?a.filter(function(t){return t.indexOf(q)>-1||(NAMES[t]||'').toUpperCase().indexOf(q)>-1;}):a;}
  var out=filt(p.keluar.slice()),inn=filt(p.masuk.slice());
  col($('#ioListOut'),out,'out',p.baseline?'Periode awal, tidak ada data keluar.':null);
  col($('#ioListIn'),inn,'in',null);
  $('#cntOut').textContent=p.baseline?'0':fmtNum(out.length)+(q?'*':'');
  $('#cntIn').textContent=fmtNum(inn.length)+(q?'*':'');
  function col(ul,arr,cls,baseEmpty){
    if(!arr.length){ul.innerHTML='<li class="io-empty">'+(baseEmpty||(q?'Tidak ada hasil.':'Tidak ada.'))+'</li>';return;}
    ul.innerHTML=arr.map(function(t){return '<li class="io-row '+cls+'" role="button" tabindex="0" data-trk="'+t+'" aria-label="'+esc(t+' '+(NAMES[t]||t))+'"><span class="tk mono">'+t+'</span><span class="nm">'+esc(NAMES[t]||t)+'</span><span class="ar mono">›</span></li>';}).join('');}
}
function ioActivate(e){var r=e.target.closest('[data-trk]');if(r){showTracker(r.dataset.trk,true);scrollTo('#lacak');}}
['#ioListOut','#ioListIn'].forEach(function(sel){var e=$(sel);if(!e)return;
  e.addEventListener('click',ioActivate);
  e.addEventListener('keydown',function(ev){if((ev.key==='Enter'||ev.key===' ')&&ev.target.closest('[data-trk]')){ev.preventDefault();ioActivate(ev);}});});
$('#pPrev').addEventListener('click',function(){if(curPeriod>0)setPeriod(curPeriod-1,{user:true});});
$('#pNext').addEventListener('click',function(){if(curPeriod<N-1)setPeriod(curPeriod+1,{user:true});});
$('#ioSearch').addEventListener('input',function(){ioQuery=this.value;renderIO();});
$('#ioCsv').addEventListener('click',function(){exportPeriodCSV(curPeriod);});
function exportPeriodCSV(i){var p=periods[i],rows=[['status','kode','nama']];
  if(p.baseline){p.masuk.forEach(function(t){rows.push(['AWAL',t,NAMES[t]||t]);});}
  else{p.masuk.forEach(function(t){rows.push(['MASUK',t,NAMES[t]||t]);});p.keluar.forEach(function(t){rows.push(['KELUAR',t,NAMES[t]||t]);});}
  downloadCSV('DES_'+p.key+'_masuk_keluar.csv',rows);toast('CSV '+shortLabel(i)+' diunduh · @lotmetrik');}
function csvSource(){return '# Sumber: OJK Daftar Efek Syariah · Per: '+META[N-1].date+' · '+SITE+' · @lotmetrik · edukasi, bukan rekomendasi';}
function downloadCSV(name,rows){
  var body=rows.map(function(r){return r.map(function(c){c=String(c);return /[",\n]/.test(c)?'"'+c.replace(/"/g,'""')+'"':c;}).join(',');}).join('\n');
  var blob=new Blob(['﻿'+csvSource()+'\n'+body],{type:'text/csv;charset=utf-8'}),a=el('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();
  setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},200);}

/* =====================================================================
   STOCK TRACKER
   ===================================================================== */
function buildDatalist(){$('#trkList').innerHTML=TICKERS.map(function(t){return '<option value="'+t+'">'+esc(NAMES[t]||'')+'</option>';}).join('');}
function trackerText(rec){var status=rec.survivor?'setia '+N+'/'+N+' periode':(rec.newcomer?'pendatang baru':(rec.oneHit?'cuma 1 periode':(rec.statusNow?'di dalam':'di luar')));
  return rec.t+' ('+esc(rec.name)+') di Daftar Efek Syariah OJK: '+status+', muncul '+rec.count+'/'+N+' rilis.';}
function showTracker(code,user){code=String(code||'').trim().toUpperCase();var rec=perT[code],host=$('#trkRes');
  if(!rec){var sug=TICKERS.filter(function(t){return t.indexOf(code)===0;}).slice(0,6);
    host.innerHTML='<p class="tr-hint">Kode <b>'+esc(code)+'</b> tidak ditemukan dalam data DES '+yearOf(0)+'–'+yearOf(N-1)+'.'+
      (sug.length?' Mungkin maksudmu: '+sug.map(function(t){return '<a href="#" data-trk="'+t+'">'+t+'</a>';}).join(', ')+'.':' Cek lagi ejaannya, atau coba <a href="#" data-trk="ASII">ASII</a>, <a href="#" data-trk="TLKM">TLKM</a>, <a href="#" data-trk="BUKA">BUKA</a>.')+'</p>';return;}
  $('#trkInput').value=code; if(user)setHash('t='+code);
  var chips='<span class="chip '+(rec.statusNow?'in':'out')+'">'+(rec.statusNow?'Di dalam ('+shortLabel(N-1)+')':'Di luar ('+shortLabel(N-1)+')')+'</span>';
  if(rec.survivor)chips+=' <span class="chip star">Setia '+N+'/'+N+'</span>';
  else if(rec.newcomer)chips+=' <span class="chip">Pendatang baru</span>';
  else if(rec.oneHit)chips+=' <span class="chip out">Sekali lewat</span>';
  else if(rec.runs>=2)chips+=' <span class="chip">Comeback '+rec.runs+' babak</span>';
  var dots='',srlist=[];for(var i=0;i<N;i++){var on=rec.bits[i]==='1';dots+='<span class="dot '+(on?'on':'')+'" data-tip="'+shortLabel(i)+' '+periods[i].phase+': '+(on?'ada':'tidak')+'"></span>';if(on)srlist.push(shortLabel(i)+' '+periods[i].phase);}
  host.innerHTML='<div class="tr-head"><span class="tk mono">'+rec.t+'</span><span class="nm">'+esc(rec.name)+'</span>'+
      '<span class="tr-actions"><button class="btn btn-ghost btn-sm" id="trkShare">Bagikan</button></span></div>'+
    '<div class="tr-chips">'+chips+'</div>'+
    '<div class="dots" role="img" aria-label="'+esc(rec.t+' ada di daftar pada: '+(srlist.length?srlist.join(', '):'tidak pernah'))+'">'+dots+'</div>'+
    '<div class="tr-stats">'+
      '<div class="tr-stat"><div class="v mono">'+rec.count+'<span class="v-sub">/'+N+'</span></div><div class="k">Muncul</div></div>'+
      '<div class="tr-stat"><div class="v mono" style="color:var(--up-text)">'+rec.enters+'</div><div class="k">Kali masuk</div></div>'+
      '<div class="tr-stat"><div class="v mono" style="color:var(--down-text)">'+rec.exits+'</div><div class="k">Kali keluar</div></div>'+
    '</div>'+
    '<p class="tr-cta">Alat gratis dari <a href="https://instagram.com/lotmetrik" target="_blank" rel="noopener">@lotmetrik</a>. Edukasi, bukan rekomendasi.</p>';
  $('#trkShare').onclick=function(){var url=SITE+'/#t='+code,txt=trackerText(rec);
    if(navigator.share)navigator.share({title:'DES · '+code,text:txt,url:url}).catch(function(){});
    else{copyText(txt+' '+url);toast('Teks + link disalin');}};
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
  {v:String(survivors.length),l:'Saham setia',d:'Lolos di semua '+N+' periode tanpa absen',cls:'hl',kind:'list',list:survivors,title:survivors.length+' Saham Paling Setia',sub:'Hadir di seluruh '+N+' rilis. Catatan: hanya saham yang tercatat sejak '+shortLabel(0)+' yang bisa masuk kategori ini (bias umur listing), bukan rekomendasi.'},
  {v:fmtNum(TICKERS.length),l:'Saham unik',d:'Pernah masuk DES minimal sekali',cls:'',kind:'list',list:TICKERS.slice(),title:fmtNum(TICKERS.length)+' Saham Unik',sub:'Semua emiten yang pernah mampir di DES sepanjang '+N+' rilis.'},
  {v:String(comeback.length),l:'Comeback',d:'Keluar lalu masuk daftar lagi',cls:'up',kind:'list',list:comeback,title:comeback.length+' Saham Comeback',sub:'Pernah keluar, lalu balik lagi ke daftar.'},
  {v:String(oneHit.length),l:'Sekali lewat',d:'Cuma 1 periode lalu keluar lagi',cls:'',kind:'list',list:oneHit,title:oneHit.length+' Saham Sekali Lewat',sub:'Muncul cuma 1 periode lalu keluar. (Pendatang baru yang masih di dalam tidak dihitung.)'},
  {v:perT[revTop[0]].flips+'x',l:'Pintu putar',d:revTop.join(', ')+' — bolak-balik masuk-keluar',cls:'',kind:'revolve',title:'Si Paling Pintu Putar',sub:'Diurut dari yang paling sering ganti status masuk-keluar.'},
  {v:MINUS+maxOut.n,l:'Keluar terbanyak',d:shortLabel(maxOut.i)+' — '+fmtNum(maxOut.n)+' saham dicoret sekaligus',cls:'down',kind:'period',i:maxOut.i,title:''}
];
function renderFacts(){$('#facts').innerHTML=[3,4,5].map(function(idx){var f=FACTS[idx];
  return '<button class="fact '+f.cls+'" data-f="'+idx+'"><span class="fv mono">'+f.v+'</span><span class="fl">'+esc(f.l)+'</span><span class="fd">'+esc(f.d)+'</span><span class="more">Lihat ›</span></button>';}).join('');}
function factClick(e){var b=e.target.closest('[data-f]');if(b)openFact(+b.dataset.f);}
$('#facts').addEventListener('click',factClick);
$('#heroMetrics').addEventListener('click',factClick);
function captionFor(f){var head=f.v+' · '+f.l+' — Daftar Efek Syariah OJK '+yearOf(0)+'-'+yearOf(N-1)+'.';
  var sample=(f.list?f.list.slice(0,6).join(', '):revTop.join(', '));
  return head+'\nContoh: '+sample+'.\nCek sendiri: '+SITE+'/#f='+FACTS.indexOf(f)+'\nvia @lotmetrik · edukasi, bukan rekomendasi.';}
function openFact(idx){var f=FACTS[idx];
  if(f.kind==='period'){setPeriod(f.i,{user:true});scrollTo('#periode');toast('Dibuka: '+shortLabel(f.i)+' (keluar '+periods[f.i].keluar.length+')');return;}
  setHash('f='+idx);
  if(f.kind==='revolve'){var top=revolving.slice(0,18);
    var body=captionTools(f)+'<ul class="mlist">'+top.map(function(t){var r=perT[t];
      return '<li class="mrow" role="button" tabindex="0" data-trk="'+t+'" aria-label="'+esc(t+' '+r.name)+'"><span class="tk mono">'+t+'</span><span class="nm">'+esc(r.name)+'</span><span class="ct mono">'+r.flips+'x ganti · '+r.count+'/'+N+'</span></li>';}).join('')+'</ul>';
    showModal(f.title,f.sub,body);wireCsv(function(){var rows=[['kode','nama','ganti_status','muncul']];top.forEach(function(t){var r=perT[t];rows.push([t,r.name,r.flips,r.count]);});downloadCSV('DES_pintu_putar.csv',rows);},f);return;}
  var list=f.list;
  var body=captionTools(f)+'<div class="taglist">'+list.map(function(t){return '<button class="tag2" data-trk="'+t+'" title="'+esc(NAMES[t]||'')+'">'+t+'</button>';}).join('')+'</div>';
  showModal(f.title,f.sub+' Tap kode untuk lacak jejaknya.',body);
  $('#mCopy').onclick=function(){copyText(list.join(', ')+'\n\n— '+list.length+' kode · '+SITE+' · @lotmetrik');toast('Daftar disalin ('+list.length+' kode)');};
  wireCsv(function(){var rows=[['kode','nama']];list.forEach(function(t){rows.push([t,NAMES[t]||t]);});downloadCSV('DES_'+f.title.replace(/[^a-z0-9]+/gi,'_').toLowerCase()+'.csv',rows);},f);}
function captionTools(f){var rev=f.kind==='revolve';return '<div class="modal-tools">'+
  (rev?'':'<button class="btn btn-go btn-sm" id="mCopy">Salin daftar</button>')+
  '<button class="btn '+(rev?'btn-go':'btn-ghost')+' btn-sm" id="mCsv">Unduh CSV</button>'+
  '<button class="btn btn-ghost btn-sm" id="mCap">Salin caption</button></div>';}
function wireCsv(fn,f){var c=$('#mCsv');if(c)c.onclick=function(){fn();toast('CSV diunduh · @lotmetrik');};
  var cap=$('#mCap');if(cap)cap.onclick=function(){copyText(captionFor(f));toast('Caption disalin, siap posting');};}
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
function applyTheme(m){var t=$('#themeBtn');
  if(m==='terminal'){document.documentElement.setAttribute('data-theme','terminal');document.querySelector('meta[name=theme-color]').content='#0B1F3A';if(t)t.setAttribute('aria-pressed','true');}
  else{document.documentElement.removeAttribute('data-theme');document.querySelector('meta[name=theme-color]').content='#F5F7FA';if(t)t.setAttribute('aria-pressed','false');}}
(function(){try{var s=localStorage.getItem(TKEY);if(s)applyTheme(s);}catch(e){}})();
$('#themeBtn').addEventListener('click',function(){var term=document.documentElement.getAttribute('data-theme')==='terminal';var next=term?'light':'terminal';applyTheme(next);try{localStorage.setItem(TKEY,next);}catch(e){}});
$('#guideBtn').addEventListener('click',openPanduan);
var gb2=$('#guideBtn2');if(gb2)gb2.addEventListener('click',openPanduan);
['#lacakInfo','#keluarInfo'].forEach(function(sel){var e=$(sel);if(e)e.addEventListener('click',openPanduan);});
var bh=$('#brandHome');if(bh)bh.addEventListener('click',function(e){if(document.body.classList.contains('panduan-open')){e.preventDefault();closePanduan();}});

function setHash(s){try{history.replaceState(null,'','#'+s);}catch(e){}}
function applyHash(){var h=(location.hash||'').replace(/^#/,''),m={};
  if(h==='panduan'){setPeriod(N-1);openPanduan();return;}
  h.split('&').forEach(function(p){var kv=p.split('=');if(kv[0])m[kv[0]]=decodeURIComponent(kv[1]||'');});
  if(m.t){setPeriod(N-1);showTracker(m.t,false);scrollTo('#lacak');return;}
  if(m.p){var pi=-1;for(var i=0;i<N;i++)if(META[i].key===m.p)pi=i;if(pi>=0){setPeriod(pi);scrollTo('#periode');return;}}
  if(m.f){var fi=+m.f;setPeriod(N-1);if(FACTS[fi]){openFact(fi);scrollTo('#fakta');}return;}
  setPeriod(N-1);}

function copyText(t){if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).catch(function(){fb(t);});else fb(t);
  function fb(x){var a=el('textarea');a.value=x;a.style.position='fixed';a.style.opacity='0';document.body.appendChild(a);a.select();try{document.execCommand('copy');}catch(e){}a.remove();}}
var toastT;function toast(m){var e=$('#toast');e.textContent=m;e.classList.add('on');clearTimeout(toastT);toastT=setTimeout(function(){e.classList.remove('on');},2400);}
function scrollTo(s){var t=$(s);if(t)t.scrollIntoView({behavior:reduceMotion()?'auto':'smooth',block:'start'});}

/* ---------- INIT ---------- */
renderHero();setPeriodeNote();buildPanduan();renderChart();renderChartSR();buildTimeline();buildDatalist();renderFacts();applyHash();
})();
