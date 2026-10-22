/* =====================================================================
   script.js: построение страницы из данных site-data.js и интерактивность.
   Тексты, цены и работы здесь менять НЕ нужно: всё лежит в site-data.js.
   ===================================================================== */
(function(){
'use strict';

/* ---------- мелкие помощники ---------- */
function $(s,r){return (r||document).querySelector(s)}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function has(v){return String(v==null?'':v).trim().length>0}
function digits(v){return String(v||'').replace(/\D/g,'')}

var S=window.SITE_DATA;
var app=$('#app'),toastEl=$('#toast');
if(!S||!app){
  if(app)app.innerHTML='<p style="padding:40px;color:#ccc;font-family:sans-serif">Не удалось загрузить данные сайта (файл site-data.js). Проверьте, что он лежит рядом с index.html.</p>';
  return;
}
S.works=S.works||[];S.prices=S.prices||{items:[]};S.about=S.about||{facts:[]};S.contacts=S.contacts||{};S.hero=S.hero||{};S.brand=S.brand||{};
var UI={cat:'Все'};

/* Путь к фото: файл лежит в папке img рядом с index.html */
function imgSrc(w,which){
  return w[which]?'img/'+encodeURIComponent(w[which])+'.jpg':'';
}

/* ---------- видимость: пустые разделы не показываются ---------- */
function showWorks(){return S.works.length>0}
function showPrice(){return (S.prices.items||[]).some(function(i){return has(i.name)})}
function showAbout(){return has(S.about.p0)||has(S.about.p1)||(S.about.facts||[]).some(function(f){return has(f.v)})}

/* ---------- блоки страницы ---------- */
var KNOB='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 7l-5 5 5 5M16 7l5 5-5 5"/></svg>';
var ZOOM_SVG='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l5 5M11 8v6M8 11h6"/></svg>';

/* Слайдер «до / после» */
function slider(w,cls,idx,eager){
  var r=w.ratio||0.8,t=esc(w.title||'работа'),ld=eager?'':' loading="lazy"';
  return '<div class="ba '+(cls||'')+'" style="--r:'+r+'" role="slider" tabindex="0" aria-label="Сравнение до и после: '+t+'" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50" aria-valuetext="граница на 50%">'+
    '<img class="ba-after"'+ld+' decoding="async" alt="После ретуши: '+t+'" src="'+imgSrc(w,'after')+'" draggable="false">'+
    '<img class="ba-before"'+ld+' decoding="async" alt="До ретуши: '+t+'" src="'+imgSrc(w,'before')+'" draggable="false">'+
    '<span class="chip chip-l">До</span><span class="chip chip-r">После</span>'+
    (idx!=null?'<button type="button" class="ba-zoom" data-act="lb" data-i="'+idx+'" aria-label="Открыть крупно: '+t+'">'+ZOOM_SVG+'</button>':'')+
    '<span class="ba-line"><span class="ba-knob">'+KNOB+'</span></span></div>';
}

function header(){
  var ini=((S.brand.name||'').trim().charAt(0)||'•').toUpperCase();
  var l=[];
  if(showWorks())l.push(['works','Работы']);
  if(showPrice())l.push(['price','Прайс']);
  if(showAbout())l.push(['about','Обо мне']);
  l.push(['contacts','Контакты']);
  return '<header class="top"><div class="wrap top-in"><a class="brand" href="#top" data-go="top"><span class="mono" aria-hidden="true">'+esc(ini)+'</span><span class="brand-t"><b>'+esc(S.brand.name)+'</b>'+(has(S.brand.role)?'<small>'+esc(S.brand.role)+'</small>':'')+'</span></a>'+
  '<nav class="nav" aria-label="Разделы">'+l.map(function(x){return '<a href="#'+x[0]+'" data-go="'+x[0]+'">'+x[1]+'</a>'}).join('')+'</nav></div></header>';
}
function leadHtml(){
  var h=S.hero,intro=h.intro||[],list=h.list||[],out='';
  if(!intro.length&&!list.length)return '';
  out+=intro.map(function(s){return '<p>'+esc(s)+'</p>'}).join('');
  if(list.length)out+='<ul class="ticks">'+list.map(function(s){return '<li>'+esc(s)+'</li>'}).join('')+'</ul>';
  return '<div class="lead rich">'+out+'</div>';
}
function hero(){
  var w=S.works[0];
  var facts=(S.hero.facts||[]).filter(function(f){return has(f.v)||has(f.t)}).map(function(f){return '<div class="fact"><b class="gilt">'+esc(f.v)+'</b><span>'+esc(f.t)+'</span></div>'}).join('');
  var cta=(showWorks()?'<a class="btn btn-solid" href="#works" data-go="works">Смотреть работы</a>':'<a class="btn btn-solid" href="#contacts" data-go="contacts">Связаться</a>')+
    (showPrice()?'<a class="btn" href="#price" data-go="price">Прайс</a>':'');
  return '<section class="hero wrap" id="top"><div class="hero-t">'+(has(S.hero.eyebrow)?'<p class="eyebrow">'+esc(S.hero.eyebrow)+'</p>':'')+'<h1 class="gilt">'+esc(S.hero.title)+'</h1>'+leadHtml()+
  '<div class="cta">'+cta+'</div>'+(facts?'<div class="facts">'+facts+'</div>':'')+'</div>'+
  (w?'<figure class="hero-fig"><div class="oval">'+slider(w,'ba--oval',null,true)+'</div><figcaption class="oval-cap"><span>До</span><span>Потяните, чтобы сравнить</span><span>После</span></figcaption><button type="button" class="btn btn-sm hero-zoom" data-act="lb" data-i="0">'+ZOOM_SVG+'Увеличить</button></figure>':'')+'</section>';
}
function card(o){
  var w=o.w,i=o.i;
  var meta=(has(w.title)||has(w.note)||has(w.cat))?'<div class="work-m"><div class="work-tx">'+(has(w.title)?'<h3>'+esc(w.title)+'</h3>':'')+(has(w.note)?'<p class="work-note">'+esc(w.note)+'</p>':'')+'</div>'+(has(w.cat)?'<span class="tag">'+esc(w.cat)+'</span>':'')+'</div>':'';
  return '<article class="work">'+slider(w,'',i)+meta+'</article>';
}
function worksBody(){
  var cats=['Все'];
  S.works.forEach(function(w){if(w.cat&&cats.indexOf(w.cat)<0)cats.push(w.cat)});
  if(cats.indexOf(UI.cat)<0)UI.cat='Все';
  var chips=cats.length>2?'<div class="chips" role="group" aria-label="Категории работ">'+cats.map(function(c){return '<button type="button" class="chipb" data-act="cat" data-v="'+esc(c)+'" aria-pressed="'+(c===UI.cat)+'">'+esc(c)+'</button>'}).join('')+'</div>':'';
  var cards=S.works.map(function(w,i){return {w:w,i:i}}).filter(function(o){return UI.cat==='Все'||o.w.cat===UI.cat}).map(card).join('');
  return chips+'<div class="grid">'+cards+'</div>';
}
function works(){
  if(!showWorks())return '';
  return '<section class="sec wrap" id="works"><div class="sec-h"><h2 class="gilt">Мои работы</h2><p class="sec-sub">Тяните ползунок, чтобы сравнить снимок до и после ретуши.</p></div><div id="works-body">'+worksBody()+'</div></section>';
}
function noteHtml(){
  var n=S.prices.note;
  if(!n||(!has(n.title)&&!(n.lines||[]).length))return '';
  return '<div class="note"><b>'+esc(n.title)+'</b>'+(n.lines||[]).map(function(s){return '<span>'+esc(s)+'</span>'}).join('')+'</div>';
}
function price(){
  if(!showPrice())return '';
  var rows=S.prices.items.filter(function(it){return has(it.name)}).map(function(it){
    return '<div class="pr"><div class="pr-head"><h3>'+esc(it.name)+'</h3><span class="dots" aria-hidden="true"></span><div class="pr-val gilt">'+esc(it.price)+'</div></div>'+(has(it.desc)?'<p class="pr-d">'+esc(it.desc)+'</p>':'')+'</div>';
  }).join('');
  return '<section class="sec wrap" id="price"><div class="price-grid"><div class="price-intro"><h2 class="gilt">Прайс</h2>'+(has(S.prices.lead)?'<p class="sec-sub">'+esc(S.prices.lead)+'</p>':'')+noteHtml()+'</div>'+
  '<div class="price-list">'+rows+'</div></div></section>';
}
function about(){
  if(!showAbout())return '';
  var ini=((S.brand.name||'').trim().charAt(0)||'•').toUpperCase();
  var pic=has(S.about.photo)?'<img src="img/'+encodeURIComponent(S.about.photo)+'.jpg" alt="Фото: '+esc(S.brand.name)+'">':'<div class="gilt" aria-hidden="true">'+esc(ini)+'</div>';
  var kv=(S.about.facts||[]).filter(function(f){return has(f.v)}).map(function(f){
    return '<div class="kv"><dt>'+esc(f.k)+'</dt><dd>'+esc(f.v)+'</dd></div>';
  }).join('');
  var hasFig=has(S.about.photo);
  return '<section class="sec wrap" id="about"><div class="about-grid'+(hasFig?'':' solo')+'">'+
  (hasFig?'<div class="about-fig"><div class="portrait">'+pic+'</div></div>':'')+
  '<div class="about-t"><h2 class="gilt">Обо мне</h2>'+(has(S.about.p0)?'<p>'+esc(S.about.p0)+'</p>':'')+(has(S.about.p1)?'<p>'+esc(S.about.p1)+'</p>':'')+
  (kv?'<dl class="kvs">'+kv+'</dl>':'')+'</div></div></section>';
}
function contacts(){
  var C=S.contacts;
  var defs=[
    {k:'phone',lab:'Телефон',href:function(v){return 'tel:+'+digits(v)},open:'Позвонить',blank:false,need:true},
    {k:'telegram',lab:'Telegram',href:function(v){v=String(v).trim();if(/^https?:\/\//i.test(v))return v;return 'https://t.me/'+encodeURIComponent(v.replace(/^@/,'').replace(/^t\.me\//i,''))},open:'Открыть чат',blank:true},
    {k:'whatsapp',lab:'WhatsApp',href:function(v){return 'https://wa.me/'+digits(v)},open:'Открыть чат',blank:true,need:true},
    {k:'email',lab:'Почта',href:null}
  ];
  var cards=defs.filter(function(d){return has(C[d.k])}).map(function(d){
    var ok=d.href&&(!d.need||digits(C[d.k]));
    var acts='<button type="button" class="btn btn-sm" data-act="copy" data-c="'+d.k+'">Скопировать</button>'+(ok?'<a class="btn btn-sm" href="'+esc(d.href(C[d.k]))+'"'+(d.blank?' target="_blank" rel="noopener"':'')+'>'+d.open+'</a>':'');
    return '<div class="card"><span class="lab">'+d.lab+'</span><span class="val">'+esc(C[d.k])+'</span><div class="acts">'+acts+'</div></div>';
  }).join('');
  return '<section class="sec wrap" id="contacts"><div class="sec-h"><h2 class="gilt">Контакты</h2>'+(has(C.hours)?'<p class="sec-sub">'+esc(C.hours)+'</p>':'')+'</div>'+
  '<div class="cards">'+cards+'</div></section>';
}
function footer(){
  return '<footer class="foot wrap"><span>© '+new Date().getFullYear()+' '+esc(S.brand.name)+'</span><a href="#top" data-go="top">Наверх</a></footer>';
}
function render(){
  app.innerHTML=header()+hero()+works()+price()+about()+contacts()+footer();
}

/* ---------- слайдер: поведение ---------- */
var drag=null;
function setPos(el,p){
  p=Math.max(0,Math.min(100,p));
  el.style.setProperty('--p',p+'%');el.dataset.p=p;
  el.setAttribute('aria-valuenow',Math.round(p));
  el.setAttribute('aria-valuetext','граница на '+Math.round(p)+'%');
}
function moveTo(e){var r=drag.getBoundingClientRect();setPos(drag,(e.clientX-r.left)/r.width*100)}
document.addEventListener('pointerdown',function(e){
  var ba=e.target.closest&&e.target.closest('.ba');
  if(!ba||ba.closest('.lb')||e.target.closest('.ba-zoom')||(e.pointerType==='mouse'&&e.button!==0))return;
  drag=ba;try{ba.setPointerCapture(e.pointerId)}catch(_){}
  ba.classList.add('is-drag');moveTo(e);
});
document.addEventListener('pointermove',function(e){if(drag)moveTo(e)});
function endDrag(){if(drag){drag.classList.remove('is-drag');drag=null}}
document.addEventListener('pointerup',endDrag);
document.addEventListener('pointercancel',endDrag);
document.addEventListener('keydown',function(e){
  var ba=e.target.closest&&e.target.closest('.ba');
  if(ba){
    var p=parseFloat(ba.dataset.p||'50'),k=e.key;
    if(k==='ArrowLeft'||k==='ArrowDown'){setPos(ba,p-5);e.preventDefault()}
    else if(k==='ArrowRight'||k==='ArrowUp'){setPos(ba,p+5);e.preventDefault()}
    else if(k==='Home'){setPos(ba,0);e.preventDefault()}
    else if(k==='End'){setPos(ba,100);e.preventDefault()}
  }
  if(LB.el){
    if(e.key==='Escape'){closeLb();return}
    if(e.key==='+'||e.key==='='){lbZoomAt(LB.z*1.4);e.preventDefault()}
    else if(e.key==='-'||e.key==='_'){lbZoomAt(LB.z/1.4);e.preventDefault()}
    else if(e.key==='0'){lbZoomAt(1);e.preventDefault()}
    else if(!ba&&e.key==='ArrowLeft')lbStep(-1);
    else if(!ba&&e.key==='ArrowRight')lbStep(1);
    else if(e.key==='Tab')lbTrap(e);
  }
});

/* ---------- лайтбокс: просмотр работы крупно, масштаб и сдвиг ---------- */
var LB={el:null,i:0,z:1,x:0,y:0,opener:null,pts:{},mode:null,bg:false};
var ZMAX=6;
function openLb(i,opener){
  if(!S.works[i])return;
  closeLb(true);
  LB.i=i;LB.z=1;LB.x=0;LB.y=0;LB.opener=opener||null;LB.pts={};LB.mode=null;
  var el=document.createElement('div');
  el.className='lb';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-label','Просмотр работы');
  document.body.appendChild(el);LB.el=el;
  document.documentElement.style.overflow='hidden';
  lbRender();
}
function lbRender(){
  var w=S.works[LB.i],n=S.works.length,el=LB.el;
  if(!el||!w)return;
  el.innerHTML='<div class="lb-top"><span class="lb-t">'+esc(has(w.title)?w.title:'Работа')+(n>1?'<small>'+(LB.i+1)+' / '+n+'</small>':'')+'</span>'+
    '<div class="lb-ctl"><button type="button" class="lb-b" data-act="lb-out" aria-label="Уменьшить">−</button><span class="lb-z" id="lb-z">100%</span><button type="button" class="lb-b" data-act="lb-in" aria-label="Увеличить">+</button>'+
    '<button type="button" class="lb-b lb-b-txt" data-act="lb-reset">Сбросить</button><button type="button" class="lb-b" data-act="lb-close" aria-label="Закрыть">×</button></div></div>'+
    '<div class="lb-stage" id="lb-stage"><div class="lb-pan" id="lb-pan">'+slider(w,'lb-ba')+'</div></div>'+
    (n>1?'<button type="button" class="lb-nav lb-prev" data-act="lb-prev" aria-label="Предыдущая работа">‹</button><button type="button" class="lb-nav lb-next" data-act="lb-next" aria-label="Следующая работа">›</button>':'')+
    '<p class="lb-hint">Колесо мыши или два пальца: масштаб. Тяните фото, чтобы сдвинуть. Золотая линия сравнивает до и после. Двойной щелчок: приблизить.</p>';
  lbApply();
  var c=$('[data-act="lb-close"]',el);if(c)c.focus();
}
function closeLb(silent){
  if(!LB.el)return;
  LB.el.remove();LB.el=null;LB.pts={};LB.mode=null;
  document.documentElement.style.overflow='';
  if(!silent&&LB.opener&&LB.opener.isConnected){try{LB.opener.focus()}catch(_){}}
}
function lbStep(d){
  var n=S.works.length;if(n<2)return;
  LB.i=(LB.i+d+n)%n;LB.z=1;LB.x=0;LB.y=0;lbRender();
}
function lbApply(){
  var pan=$('#lb-pan'),ba=$('#lb-pan .ba');
  if(!pan||!ba)return;
  if(LB.z<=1.001){LB.z=1;LB.x=0;LB.y=0}
  var mx=ba.offsetWidth*(LB.z-1)/2,my=ba.offsetHeight*(LB.z-1)/2;
  LB.x=Math.max(-mx,Math.min(mx,LB.x));LB.y=Math.max(-my,Math.min(my,LB.y));
  pan.style.transform='translate('+LB.x+'px,'+LB.y+'px) scale('+LB.z+')';
  var z=$('#lb-z');if(z)z.textContent=Math.round(LB.z*100)+'%';
  var st=$('#lb-stage');if(st)st.classList.toggle('is-zoom',LB.z>1);
}
function lbZoomAt(nz,cx,cy){
  var st=$('#lb-stage');if(!st)return;
  nz=Math.max(1,Math.min(ZMAX,nz));
  var r=st.getBoundingClientRect(),mx=r.left+r.width/2,my=r.top+r.height/2;
  var px=(cx==null?mx:cx)-mx,py=(cy==null?my:cy)-my,k=nz/LB.z;
  LB.x=px-(px-LB.x)*k;LB.y=py-(py-LB.y)*k;LB.z=nz;lbApply();
}
function lbTrap(e){
  var f=[].slice.call(LB.el.querySelectorAll('button,[tabindex="0"]')).filter(function(x){return !x.disabled});
  if(!f.length)return;
  var a=f[0],z=f[f.length-1];
  if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}
  else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}
}
document.addEventListener('pointerdown',function(e){
  var st=e.target.closest&&e.target.closest('#lb-stage');
  if(!st||!LB.el||e.target.closest('.lb-nav'))return;
  if(e.pointerType==='mouse'&&e.button!==0)return;
  try{st.setPointerCapture(e.pointerId)}catch(_){}
  LB.pts[e.pointerId]={x:e.clientX,y:e.clientY};
  var ids=Object.keys(LB.pts);
  if(ids.length===2){
    endDrag();
    var a=LB.pts[ids[0]],b=LB.pts[ids[1]];
    LB.mode='pinch';LB.d0=Math.hypot(a.x-b.x,a.y-b.y)||1;LB.z0=LB.z;LB.bg=false;return;
  }
  var ba=$('#lb-pan .ba');if(!ba)return;
  LB.sx=e.clientX;LB.sy=e.clientY;LB.ox=LB.x;LB.oy=LB.y;
  LB.bg=!e.target.closest('.ba')&&LB.z<=1;
  if(LB.bg){LB.mode='bg';return}
  var r=ba.getBoundingClientRect(),lx=r.left+r.width*parseFloat(ba.dataset.p||'50')/100;
  if(LB.z<=1||Math.abs(e.clientX-lx)<30){drag=ba;ba.classList.add('is-drag');moveTo(e);LB.mode='slide'}
  else{LB.mode='pan';st.classList.add('is-pan')}
});
document.addEventListener('pointermove',function(e){
  if(!LB.el||!LB.pts[e.pointerId])return;
  LB.pts[e.pointerId]={x:e.clientX,y:e.clientY};
  if(LB.mode==='pan'){LB.x=LB.ox+(e.clientX-LB.sx);LB.y=LB.oy+(e.clientY-LB.sy);lbApply()}
  else if(LB.mode==='pinch'){
    var ids=Object.keys(LB.pts);if(ids.length<2)return;
    var a=LB.pts[ids[0]],b=LB.pts[ids[1]];
    lbZoomAt(LB.z0*(Math.hypot(a.x-b.x,a.y-b.y)/LB.d0),(a.x+b.x)/2,(a.y+b.y)/2);
  }
});
function lbUp(e){
  if(!LB.el||!LB.pts[e.pointerId])return;
  delete LB.pts[e.pointerId];
  var n=Object.keys(LB.pts).length;
  if(n<2&&LB.mode==='pinch')LB.mode=null;
  if(n===0){
    var tap=LB.mode==='bg'&&e.type==='pointerup'&&Math.hypot(e.clientX-LB.sx,e.clientY-LB.sy)<6;
    LB.mode=null;
    var st=$('#lb-stage');if(st)st.classList.remove('is-pan');
    if(tap)closeLb();
  }
}
document.addEventListener('pointerup',lbUp);
document.addEventListener('pointercancel',lbUp);
document.addEventListener('wheel',function(e){
  if(!LB.el||!e.target.closest('#lb-stage'))return;
  e.preventDefault();
  lbZoomAt(LB.z*Math.exp(-e.deltaY*(e.ctrlKey?0.01:0.0018)),e.clientX,e.clientY);
},{passive:false});
document.addEventListener('dblclick',function(e){
  if(!LB.el||!e.target.closest('#lb-stage')||e.target.closest('.lb-nav'))return;
  lbZoomAt(LB.z>1.05?1:2.5,e.clientX,e.clientY);
});

/* ---------- прочее ---------- */
var toastT;
function toast(msg){
  toastEl.textContent=msg;toastEl.hidden=false;clearTimeout(toastT);
  toastT=setTimeout(function(){toastEl.hidden=true},3600);
}
function goTo(id){
  var rm=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  var b=rm?'auto':'smooth';
  if(id==='top'){window.scrollTo({top:0,behavior:b});return}
  var el=document.getElementById(id);if(el)el.scrollIntoView({behavior:b,block:'start'});
}
function copyText(key,btn){
  var v=S.contacts[key]||'';
  var fb=function(){
    var el=btn.closest('.card')&&btn.closest('.card').querySelector('.val');
    if(el){var r=document.createRange();r.selectNodeContents(el);var s=getSelection();s.removeAllRanges();s.addRange(r)}
    toast('Значение выделено. Скопируйте его через Ctrl+C.');
  };
  if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(v).then(function(){toast('Скопировано')},fb);
  }else fb();
}

/* ---------- клики ---------- */
document.addEventListener('click',function(e){
  var g=e.target.closest('[data-go]');
  if(g&&g.tagName==='A'){e.preventDefault();goTo(g.dataset.go);return}
  var b=e.target.closest('[data-act]');
  if(!b)return;
  var a=b.dataset.act,i=parseInt(b.dataset.i,10);
  if(a==='cat'){UI.cat=b.dataset.v;$('#works-body').innerHTML=worksBody()}
  else if(a==='copy')copyText(b.dataset.c,b);
  else if(a==='lb')openLb(i,b);
  else if(a==='lb-close')closeLb();
  else if(a==='lb-in')lbZoomAt(LB.z*1.5);
  else if(a==='lb-out')lbZoomAt(LB.z/1.5);
  else if(a==='lb-reset')lbZoomAt(1);
  else if(a==='lb-prev')lbStep(-1);
  else if(a==='lb-next')lbStep(1);
});

render();
})();
