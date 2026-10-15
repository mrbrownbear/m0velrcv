/* M0VE Coventry data explorer. 2025 values on the source page are projections.
   The calculator is an explicit illustrative model, not the M0VE valuation engine. */
(() => {
'use strict';
const TYPES = [
  {id:'detached',label:'Detached',price:413700,size:1313,sqft:323,transactions:1658,icon:'detached'},
  {id:'semi',label:'Semi detached',price:258600,size:967,sqft:272,transactions:4139,icon:'semi'},
  {id:'terraced',label:'Terraced',price:195700,size:859,sqft:233,transactions:8508,icon:'terraced'},
  {id:'flat',label:'Flat / Apartment',price:139900,size:617,sqft:226,transactions:1113,icon:'flat'}
];
const YEAR = [
  {year:2018,price:209300,transactions:5825},{year:2019,price:209800,transactions:5561},
  {year:2020,price:217500,transactions:4667},{year:2021,price:236900,transactions:6678},
  {year:2022,price:249300,transactions:6012},{year:2023,price:246900,transactions:4658},
  {year:2024,price:244000,transactions:4037},{year:2025,price:250500,transactions:5348}
];
const DISTRICTS=[
  {id:'CV1',price:183100,transactions:2259},{id:'CV2',price:189700,transactions:6195},
  {id:'CV3',price:240200,transactions:6926},{id:'CV4',price:260700,transactions:3433},
  {id:'CV5',price:251600,transactions:5975},{id:'CV6',price:190600,transactions:8671},
  {id:'CV7',price:325100,transactions:3601},{id:'CV8',price:323900,transactions:688}
];
const TOWNS=[
  {name:'Bedworth',price:200100,transactions:2669},{name:'Kenilworth',price:404000,transactions:2523},
  {name:'Nuneaton',price:230000,transactions:11662},{name:'Leamington Spa',price:347300,transactions:6758},
  {name:'Hinckley',price:240700,transactions:5189},{name:'Rugby',price:276000,transactions:10740},
  {name:'Warwick',price:357800,transactions:5870},{name:'Solihull',price:358500,transactions:11424},
  {name:'Atherstone',price:248900,transactions:1558},{name:'Southam',price:325000,transactions:2577}
];
const STATE={type:null,newBuild:false,premium:5,customSize:false,size:967,unit:'sqft',district:'',year:2025,selectedYear:2025,metric:'price',selectedDistrict:'CV5',selectedTown:'Kenilworth',townSort:'default'};
const $=(s,root=document)=>root.querySelector(s), $$=(s,root=document)=>Array.from(root.querySelectorAll(s));
const svgIcon=(name,cls='')=>`<svg class="ui-icon ${cls}" aria-hidden="true" focusable="false"><use href="#icon-${name}"></use></svg>`;
const fmtGBP=n=>new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP',maximumFractionDigits:0}).format(Math.round(n));
const fmtNum=n=>new Intl.NumberFormat('en-GB',{maximumFractionDigits:0}).format(Math.round(n));
const pct=(n)=>`${n>=0?'+':''}${n.toFixed(1)}%`;
const clamp=(a,min,max)=>Math.min(max,Math.max(min,a));
const getType=()=>TYPES.find(t=>t.id===STATE.type);
function setPressed(elements,active){elements.forEach(e=>{const yes=e===active;e.classList.toggle('selected',yes);e.classList.toggle('active',yes);e.setAttribute('aria-pressed',String(yes));});}
function calcPrice(){
  const t=getType(); let value=t?t.price:345800;
  if(STATE.customSize){const avgSize=t?t.size:967;const perFoot=t?t.sqft:272;const sqft=STATE.unit==='sqm'?STATE.size*10.7639104:STATE.size;value+=((sqft-avgSize)*perFoot);}
  if(STATE.district){const district=DISTRICTS.find(x=>x.id===STATE.district);value*=district.price/250500;}
  value*=YEAR.find(x=>x.year===STATE.year).price/250500;
  if(STATE.newBuild)value*=1+STATE.premium/100;
  return Math.max(15000,Math.round(value/100)*100);
}
function paintEstimate(){
  const t=getType(), value=calcPrice();
  const out=$('#estimate-output');out.textContent=fmtGBP(value);
  out.classList.remove('number-refresh');void out.offsetWidth;out.classList.add('number-refresh');
  $('#estimate-low').textContent=fmtGBP(value*.9);$('#estimate-high').textContent=fmtGBP(value*1.1);
  $('#fact-type').textContent=t?t.label:'All property types';
  $('#fact-location').textContent=STATE.district||'Coventry';
  $('#fact-year').textContent=STATE.year===2025?'2025 (projected)':String(STATE.year);
  $('#estimate-description').textContent=[t?.label||'Coventry base estimate',STATE.district||'',STATE.customSize?`${fmtNum(STATE.size)} ${STATE.unit==='sqm'?'sq m':'sq ft'}`:'',STATE.newBuild?`+${STATE.premium}% new build scenario`:''].filter(Boolean).join(' / ');
  $('#scale-marker').style.left=clamp(50+(value-345800)/345800*18,9,91)+'%';
  window.dispatchEvent(new CustomEvent('m0ve:estimate',{detail:{value,type:STATE.type,district:STATE.district}}));
}
function paintTypeButtons(){setPressed($$('[data-type]'),$(`[data-type="${STATE.type}"]`));}
function paintMiniBars(){
 const max=TYPES[0].price, isNew=$('#breakdown-newbuild').checked;
 $('#mini-bars').innerHTML=TYPES.map(t=>{const value=t.price*(isNew?1+STATE.premium/100:1);return `<button type="button" class="mini-bar-row ${STATE.type===t.id?'current':''}" data-minitype="${t.id}" aria-label="Select ${t.label}"><span>${t.label}</span><span class="bar-track"><i style="width:${clamp(value/(max*1.2)*100,5,100)}%"></i></span><strong>${fmtGBP(value)}</strong></button>`;}).join('');
 $$('[data-minitype]').forEach(b=>b.addEventListener('click',()=>{STATE.type=b.dataset.minitype;paintTypeButtons();paintEstimate();paintMiniBars();}));
}
function setupCalculator(){
 $$('[data-type]').forEach(el=>el.addEventListener('click',()=>{STATE.type=STATE.type===el.dataset.type?null:el.dataset.type;paintTypeButtons();if(!STATE.customSize){$('#size-value').value=String(getType()?.size||967);STATE.size=getType()?.size||967;}paintEstimate();paintMiniBars();}));
 $$('[data-newbuild]').forEach(btn=>btn.addEventListener('click',()=>{STATE.newBuild=btn.dataset.newbuild==='true';setPressed($$('[data-newbuild]'),btn);$('#new-build-extra').hidden=!STATE.newBuild;paintEstimate();}));
 $('#premium-range').addEventListener('input',e=>{STATE.premium=Number(e.target.value);$('#premium-label').textContent=STATE.premium+'%';paintEstimate();paintMiniBars();});
 $$('[data-areasize]').forEach(btn=>btn.addEventListener('click',()=>{STATE.customSize=btn.dataset.areasize==='custom';setPressed($$('[data-areasize]'),btn);$('#custom-size-row').hidden=!STATE.customSize;const t=getType();if(STATE.customSize){STATE.size=t?t.size:967;$('#size-value').value=STATE.size;}paintEstimate();}));
 $('#size-value').addEventListener('input',e=>{const n=Number(e.target.value);if(!Number.isFinite(n)||n<=0)return;STATE.size=clamp(n,1,10000);paintEstimate();});
 $('#size-unit').addEventListener('change',e=>{if(e.target.value===STATE.unit)return;STATE.size=STATE.unit==='sqft'?Math.round(STATE.size/10.7639104):Math.round(STATE.size*10.7639104);STATE.unit=e.target.value;$('#size-value').value=STATE.size;paintEstimate();});
 $('#district-choice').addEventListener('change',e=>{STATE.district=e.target.value;paintEstimate();if(STATE.district)selectDistrict(STATE.district,false);});
 $('#year-choice').addEventListener('change',e=>{STATE.year=Number(e.target.value);paintEstimate();selectYear(STATE.year);});
 $('#breakdown-newbuild').addEventListener('change',paintMiniBars);
 $('#reset-estimate').addEventListener('click',()=>{Object.assign(STATE,{type:null,newBuild:false,premium:5,customSize:false,size:967,unit:'sqft',district:'',year:2025});$('#premium-range').value=5;$('#premium-label').textContent='5%';$('#new-build-extra').hidden=true;$('#custom-size-row').hidden=true;$('#size-value').value=967;$('#size-unit').value='sqft';$('#district-choice').value='';$('#year-choice').value='2025';$('#breakdown-newbuild').checked=false;setPressed($$('[data-newbuild]'),$('[data-newbuild="false"]'));setPressed($$('[data-areasize]'),$('[data-areasize="average"]'));paintTypeButtons();paintEstimate();paintMiniBars();});
 paintEstimate();paintMiniBars();
}
function makeChart(){
 const metric=STATE.metric, key=metric==='price'?'price':'transactions', vals=YEAR.map(y=>y[key]);
 const bottom=326,top=38,left=60,right=940, ymin=metric==='price'?180000:3000,ymax=metric==='price'?265000:7500;
 const x=i=>left+(right-left)*(i/7),y=v=>bottom-(v-ymin)/(ymax-ymin)*(bottom-top);
 const grid=$('#chart-grid');grid.innerHTML=[0,1,2,3,4].map(i=>{const v=ymin+(ymax-ymin)*i/4,py=y(v);return `<line x1="${left}" y1="${py}" x2="${right}" y2="${py}" stroke="rgba(255,255,255,.12)" stroke-dasharray="3 7"/><text x="9" y="${py+4}" fill="#82968c" font-size="13">${metric==='price'?`£${Math.round(v/1000)}k`:`${(v/1000).toFixed(1)}k`}</text>`;}).join('');
 const coords=YEAR.map((d,i)=>[x(i),y(d[key])]);
 const line=coords.map((p,i)=>`${i?'L':'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
 $('#chart-line').setAttribute('d',line);
 $('#chart-area').setAttribute('d',`${line} L${right},${bottom} L${left},${bottom} Z`);
 $('#chart-dots').innerHTML=YEAR.map((d,i)=>`<circle class="year-dot ${d.year===STATE.selectedYear?'chosen':''}" tabindex="0" role="button" aria-label="${d.year}: ${metric==='price'?fmtGBP(d.price):fmtNum(d.transactions)+' transactions'}" data-year="${d.year}" cx="${x(i)}" cy="${y(d[key])}" r="${d.year===STATE.selectedYear?8:5}"/>`).join('');
 $('#chart-xlabels').innerHTML=YEAR.map((d,i)=>`<text x="${x(i)}" y="355" text-anchor="middle" fill="${d.year===STATE.selectedYear?'#dcf7ad':'#82968c'}" font-size="15">${d.year}</text>`).join('');
 const active=YEAR.findIndex(d=>d.year===STATE.selectedYear);$('#chart-guide').setAttribute('x1',x(active));$('#chart-guide').setAttribute('x2',x(active));$('#chart-guide').setAttribute('y1',y(vals[active]));$('#chart-guide').setAttribute('y2',bottom);$('#chart-guide').setAttribute('stroke','rgba(213,255,153,.55)');$('#chart-guide').setAttribute('stroke-dasharray','4 7');
 $$('[data-year]',$('#chart-dots')).forEach(node=>{node.addEventListener('click',()=>selectYear(Number(node.dataset.year)));node.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();selectYear(Number(node.dataset.year));}});});
}
function selectYear(year){STATE.selectedYear=year;const d=YEAR.find(y=>y.year===year);$('#market-key-number').textContent=STATE.metric==='price'?fmtGBP(d.price):fmtNum(d.transactions);$('#market-key-label').textContent=STATE.metric==='price'?'AVERAGE PROPERTY PRICE':'RECORDED TRANSACTIONS';$('#market-key-year').textContent=year===2025?'2025 PROJECTION':String(year);$$('.year-button').forEach(el=>{const active=Number(el.dataset.year)===year;el.classList.toggle('active',active);el.setAttribute('aria-pressed',String(active));});makeChart();}
function setupMarket(){
 $('#year-controls').innerHTML=YEAR.map(d=>`<button class="year-button ${d.year===STATE.selectedYear?'active':''}" type="button" data-year="${d.year}" aria-pressed="${d.year===STATE.selectedYear}">${d.year}</button>`).join('');
 $$('.year-button').forEach(btn=>btn.addEventListener('click',()=>selectYear(Number(btn.dataset.year))));
 $$('[data-metric]').forEach(btn=>btn.addEventListener('click',()=>{STATE.metric=btn.dataset.metric;setPressed($$('[data-metric]'),btn);selectYear(STATE.selectedYear);}));
 selectYear(2025);
}
function setupTypes(){
 $('#type-cards').innerHTML=TYPES.map((t,i)=>`<article class="type-card reveal" style="--order:${i}" data-cardtype="${t.id}"><div class="type-card-top"><span class="type-card-icon">${svgIcon(t.icon)}</span></div><h3>${t.label}</h3><div class="type-card-price">${fmtGBP(t.price)}</div><span class="type-card-caption">AVERAGE PROPERTY PRICE</span><div class="type-card-line"></div><div class="type-card-metadata"><span>Average size</span><strong>${fmtNum(t.size)} sq ft</strong></div><div class="type-card-metadata"><span>Cost per sq ft</span><strong>${fmtGBP(t.sqft)}</strong></div><div class="type-card-metadata"><span>Transactions since 2021</span><strong>${fmtNum(t.transactions)}</strong></div><button class="type-card-action" data-usetype="${t.id}" aria-label="Use ${t.label} in valuation calculator">Use in calculator ${svgIcon('arrow-up-right')}</button></article>`).join('');
 $$('[data-usetype]').forEach(btn=>btn.addEventListener('click',()=>{STATE.type=btn.dataset.usetype;paintTypeButtons();paintEstimate();paintMiniBars();$('#calculator').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});}));
}
function selectDistrict(id,sync=true){const d=DISTRICTS.find(x=>x.id===id);if(!d)return;STATE.selectedDistrict=id;$$('[data-district]').forEach(btn=>{let selected=btn.dataset.district===id;btn.classList.toggle('chosen',selected);btn.setAttribute('aria-pressed',String(selected));});$('#selected-district').textContent=id;$('#district-price').textContent=fmtGBP(d.price);$('#district-transactions').textContent=fmtNum(d.transactions);$('#district-delta').textContent=pct((d.price/250500-1)*100)+' vs Coventry 2025';$$('[data-districtbar]').forEach(b=>b.classList.toggle('active',b.dataset.districtbar===id));if(sync){STATE.district=id;$('#district-choice').value=id;paintEstimate();}}
function setupDistricts(){
 $('#district-cluster').innerHTML=DISTRICTS.map((d,i)=>`<button type="button" class="district-tile ${d.id===STATE.selectedDistrict?'chosen':''}" data-district="${d.id}" aria-pressed="${d.id===STATE.selectedDistrict}"><span class="tile-top">${svgIcon('pin')}<span>${d.id}</span></span><strong>${fmtGBP(d.price)}</strong><span class="tile-track"><i style="width:${Math.round(d.price/405000*100)}%"></i></span></button>`).join('');
 $('#district-bars').innerHTML=DISTRICTS.map(d=>`<button type="button" class="district-bar ${d.id===STATE.selectedDistrict?'active':''}" data-districtbar="${d.id}" aria-label="View ${d.id} prices"><span>${d.id}</span><span class="district-bar-track"><i style="width:${(d.price/355000*100).toFixed(1)}%"></i></span><strong>${fmtGBP(d.price)}</strong></button>`).join('');
 $$('[data-district], [data-districtbar]').forEach(btn=>btn.addEventListener('click',()=>selectDistrict(btn.dataset.district||btn.dataset.districtbar)));
 $('#district-use').addEventListener('click',()=>{STATE.district=STATE.selectedDistrict;$('#district-choice').value=STATE.district;paintEstimate();});
 selectDistrict('CV5',false);
}
function selectTown(name){const t=TOWNS.find(t=>t.name===name);if(!t)return;STATE.selectedTown=name;$$('[data-town]').forEach(btn=>{const active=btn.dataset.town===name;btn.classList.toggle('active',active);btn.setAttribute('aria-pressed',String(active));});$('#town-name').textContent=t.name.toUpperCase();$('#town-price').textContent=fmtGBP(t.price);$('#town-transactions').textContent=fmtNum(t.transactions);const d=t.price-250500;$('#town-difference').textContent=`${fmtGBP(Math.abs(d))} ${d>=0?'higher':'lower'} than Coventry`;
 const width=Math.min(100,t.price/420000*100);$('#compare-fill').style.width=width+'%';
}
function paintTowns(){let sorted=[...TOWNS];if(STATE.townSort==='price-asc')sorted.sort((a,b)=>a.price-b.price);if(STATE.townSort==='price-desc')sorted.sort((a,b)=>b.price-a.price);if(STATE.townSort==='transactions')sorted.sort((a,b)=>b.transactions-a.transactions);
 $('#town-list').innerHTML=sorted.map((t,i)=>`<button type="button" class="town-row ${t.name===STATE.selectedTown?'active':''}" data-town="${t.name}" aria-pressed="${t.name===STATE.selectedTown}"><span class="town-index">${svgIcon('pin')}</span><span class="town-label">${t.name}</span><strong>${fmtGBP(t.price)}</strong><span class="town-arrow">${svgIcon('arrow-up-right')}</span></button>`).join('');
 $$('[data-town]').forEach(btn=>btn.addEventListener('click',()=>selectTown(btn.dataset.town)));
}
function setupTowns(){paintTowns();selectTown(STATE.selectedTown);$('#town-sort').addEventListener('change',e=>{STATE.townSort=e.target.value;paintTowns();});}
function setupNavigation(){
 const menu=$('#menu-toggle'),panel=$('#mobile-menu');function close(){menu.setAttribute('aria-expanded','false');panel.hidden=true;document.body.classList.remove('menu-open');}
 menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')==='true';menu.setAttribute('aria-expanded',String(!open));panel.hidden=open;document.body.classList.toggle('menu-open',!open);});
 $$('a',panel).forEach(a=>a.addEventListener('click',close));window.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
 const progress=$('#scroll-progress');let pending=false;function onScroll(){if(pending)return;pending=true;requestAnimationFrame(()=>{const span=Math.max(1,document.documentElement.scrollHeight-innerHeight);progress.style.transform=`scaleX(${clamp(scrollY/span,0,1)})`;$('#header').classList.toggle('scrolled',scrollY>40);pending=false;});}addEventListener('scroll',onScroll,{passive:true});onScroll();
}
function setupActiveNavigation(){
 const items=$$('.desktop-nav a[href^="#"]');
 if(!('IntersectionObserver' in window))return;
 const watcher=new IntersectionObserver(entries=>{entries.forEach(entry=>{
  if(!entry.isIntersecting)return;
  items.forEach(a=>a.classList.toggle('nav-active',a.hash==='#'+entry.target.id));
 });},{rootMargin:'-20% 0px -65% 0px',threshold:0});
 ['calculator','market','districts','nearby'].forEach(id=>{const sec=document.getElementById(id);if(sec)watcher.observe(sec);});
}
function setupMotion(){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(!('IntersectionObserver'in window)||reduced){$$('.reveal').forEach(el=>el.classList.add('visible'));return;}
 const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target);}}),{threshold:.10,rootMargin:'0px 0px -25px 0px'});$$('.reveal').forEach(el=>observer.observe(el));
 // Lightweight pointer-responsive focus glow, no frame loop.
 $$('.type-card,.result-surface,.district-data,.nearby-detail').forEach(card=>{card.addEventListener('pointermove',e=>{const r=card.getBoundingClientRect();card.style.setProperty('--mx',`${e.clientX-r.left}px`);card.style.setProperty('--my',`${e.clientY-r.top}px`);},{passive:true});});
}
setupCalculator();setupMarket();setupTypes();setupDistricts();setupTowns();setupNavigation();setupActiveNavigation();setupMotion();
window.MOVE_COVENTRY={datasets:{propertyTypes:TYPES,years:YEAR,districts:DISTRICTS,towns:TOWNS},getEstimate:calcPrice};
})();