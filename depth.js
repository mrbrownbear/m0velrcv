/* Section-based perspective depth, based on the owner's motion and scroll UI references.
   No layout shifts, animation libraries, external assets or continuous render loop. */
(()=>{'use strict';
 if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const sections=[
  {node:document.querySelector('.calc-section'), selectors:['.calculator-form','.result-surface']},
  {node:document.querySelector('.market-section'),selectors:['.market-panel']},
  {node:document.querySelector('.types-section'), selectors:['.type-cards']},
  {node:document.querySelector('.district-section'),selectors:['.district-map','.district-data']},
  {node:document.querySelector('.nearby-section'),selectors:['.nearby-detail']}
 ].filter(x=>x.node);
 const active=new Set();
 const ob=new IntersectionObserver(entries=>{for(const e of entries){if(e.isIntersecting)active.add(e.target);else active.delete(e.target);}request();},{rootMargin:'150px 0px 150px 0px',threshold:0});
 sections.forEach(s=>ob.observe(s.node));
 let queued=0;
 function request(){if(!queued)queued=requestAnimationFrame(update);}
 function update(){queued=0;for(const section of sections){if(!active.has(section.node))continue;
  const rect=section.node.getBoundingClientRect();
  const visible=Math.max(0,Math.min(1,(innerHeight-rect.top)/(rect.height+innerHeight)));
  const phase=(visible-.50)*2;
  const pitch=Math.max(-2.5,Math.min(2.5,phase*-2.5));
  const y=Math.max(-14,Math.min(14,phase*-14));
  section.selectors.forEach((selector,index)=>{
    section.node.querySelectorAll(selector).forEach(el=>{
      el.style.setProperty('--scroll-pitch',(pitch*(index%2?-1:1)).toFixed(3)+'deg');
      el.style.setProperty('--scroll-lift',(y*(index%2?-.7:1)).toFixed(2)+'px');
    });
  });
 }}
 addEventListener('scroll',request,{passive:true});addEventListener('resize',request,{passive:true});request();
})();
