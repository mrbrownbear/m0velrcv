/* M0VE Coventry: continuous scroll-scrubbed 3D architecture.
   Interaction language adapted from the owner's cinematic scroll reference library.
   Uses the supplied optimised house, one renderer, one scene, bounded DPR and demand rendering.
   No model reversal, wireframe/material swapping or repeated model instances. */
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

const container=document.getElementById('webgl-container');
const poster=document.getElementById('house-fallback');
const frame=document.getElementById('model-frame');
const world=document.getElementById('world');
const sticky=document.getElementById('world-sticky');
const grid=world.querySelector('.world-grid');
const glow=world.querySelector('.world-glow');
const copy=world.querySelector('.chapter-copy');
const heroCopy=world.querySelector('.hero-inner');
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');
const mobile=matchMedia('(max-width:600px)');
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
const mix=(a,b,t)=>a+(b-a)*t;
const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};

// One camera follows an uninterrupted path with five choreographed scroll poses.
// Each beat changes framing, pitch, depth or azimuth without a step-jump.
const cameraKeys=[
 {t:0, p:[3.45,1.86,4.8], at:[0,-.06,0], f:36},
 {t:.23,p:[3.00,1.55,4.45],at:[0,.02,0],f:34.5},
 {t:.45,p:[-.25,2.12,5.18],at:[0,.05,0],f:35},
 {t:.72,p:[-4.35,2.42,2.9],at:[0,.04,0],f:36},
 {t:1,p:[.75,5.6,4.65],at:[0,.0,0],f:35}
];

let renderer,scene,camera,model,root,baseRing,sceneReady=false,hasFocus=false,active=true;
let progress=0,renderedProgress=-1,yaw=0,targetYaw=0,drag=false,pointerX=0,requested=0,last=0,needsVisuals=true;
const goalPos=new THREE.Vector3(),goalTarget=new THREE.Vector3(),lookAt=new THREE.Vector3();
const startPos=new THREE.Vector3(...cameraKeys[0].p);
let resizeObserver,worldObserver;

function scrollProgress(){
 const r=world.getBoundingClientRect();
 return clamp(-r.top/Math.max(1,world.offsetHeight-innerHeight),0,1);
}
function sampleTimeline(t){
 let i=0;
 while(i<cameraKeys.length-2&&t>cameraKeys[i+1].t)i++;
 const a=cameraKeys[i],b=cameraKeys[i+1];
 const eased=smooth((t-a.t)/(b.t-a.t));
 goalPos.set(mix(a.p[0],b.p[0],eased),mix(a.p[1],b.p[1],eased),mix(a.p[2],b.p[2],eased));
 goalTarget.set(mix(a.at[0],b.at[0],eased),mix(a.at[1],b.at[1],eased),mix(a.at[2],b.at[2],eased));
 return mix(a.f,b.f,eased);
}
function schedule(){if(sceneReady&&active&&!requested)requested=requestAnimationFrame(render);}
function updateDOM(){
 if(!sceneReady||!active||reduceMotion.matches)return;
 // CSS transform-only visual layers, synchronized to the exact camera progression.
 world.style.setProperty('--journey',progress.toFixed(4));
 if(grid)grid.style.transform=`translate3d(0,${(progress*-58).toFixed(1)}px,0) perspective(900px) rotateX(${(progress*4).toFixed(2)}deg)`;
 if(glow)glow.style.transform=`translate3d(${(progress*-18).toFixed(1)}px,${(progress*65).toFixed(1)}px,0)`;
 if(heroCopy&&progress<.65){const k=smooth(progress/.54);heroCopy.style.opacity=String(1-k*.87);heroCopy.style.translate=`0 ${(-38*k).toFixed(1)}px`;}
 if(copy){const k=smooth((progress-.36)/.34);copy.style.opacity=String(k);copy.style.translate=`0 ${(42*(1-k)).toFixed(1)}px`;}
 sticky?.style.setProperty('--atmosphere',String(smooth((progress-.35)/.52)));
}
function render(now){
 requested=0;
 if(!sceneReady||!active||document.hidden)return;
 const dt=Math.min(.05,Math.max(.001,(now-last)/1000||.016));last=now;
 const targetFov=sampleTimeline(reduceMotion.matches?0:progress);
 const damping=reduceMotion.matches?1:1-Math.exp(-7.5*dt);
 camera.position.lerp(goalPos,damping);
 lookAt.lerp(goalTarget,damping);
 const vfov=mobile.matches?targetFov+4:targetFov;
 camera.fov=mix(camera.fov,vfov,damping);
 camera.updateProjectionMatrix();
 camera.lookAt(lookAt);
 yaw=mix(yaw,targetYaw,damping);
 root.rotation.y=yaw;
 // A static translucent architectural ring appears only while examining the structure.
 // No expensive edge extraction and no flashing material wireframes.
 if(baseRing){const enter=smooth((progress-.28)/.13),exit=1-smooth((progress-.75)/.12);baseRing.material.opacity=reduceMotion.matches?0:.24*enter*exit;baseRing.rotation.z=progress*.20;}
 renderer.render(scene,camera);
 renderedProgress=progress;
 const moving=camera.position.distanceToSquared(goalPos)>.00008||lookAt.distanceToSquared(goalTarget)>.00008||Math.abs(yaw-targetYaw)>.00015||Math.abs(camera.fov-vfov)>.002;
 if(moving||drag)schedule();
}
function onScroll(){const next=scrollProgress();if(Math.abs(next-progress)<.0001)return;progress=next;updateDOM();schedule();}
let scrollRAF=0;
addEventListener('scroll',()=>{if(scrollRAF)return;scrollRAF=requestAnimationFrame(()=>{scrollRAF=0;onScroll();});},{passive:true});
addEventListener('resize',()=>{progress=scrollProgress();updateDOM();schedule();},{passive:true});

frame.tabIndex=0;
frame.addEventListener('pointerdown',e=>{if(e.button!==0)return;drag=true;pointerX=e.clientX;try{frame.setPointerCapture(e.pointerId);}catch{} });
frame.addEventListener('pointermove',e=>{if(!drag)return;const delta=e.clientX-pointerX;pointerX=e.clientX;if(Math.abs(delta)>.2){targetYaw=clamp(targetYaw+delta*.0035,-.52,.52);schedule();}});
function stopDrag(e){drag=false;try{frame.releasePointerCapture(e.pointerId);}catch{}}
frame.addEventListener('pointerup',stopDrag);frame.addEventListener('pointercancel',stopDrag);
frame.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();targetYaw=clamp(targetYaw+(e.key==='ArrowLeft'?.12:-.12),-.52,.52);schedule();}else if(e.key==='Home'){targetYaw=0;schedule();}});

function prepareModel(gltf){
 model=gltf.scene;
 const bbox=new THREE.Box3().setFromObject(model);
 const center=bbox.getCenter(new THREE.Vector3());
 model.position.sub(center);
 model.scale.setScalar(mobile.matches?2.3:2.05);
 model.traverse(o=>{
  if(!o.isMesh)return;
  o.frustumCulled=true;
  for(const mat of (Array.isArray(o.material)?o.material:[o.material])){
   if(mat?.isMeshStandardMaterial){mat.roughness=Math.max(.6,mat.roughness);mat.envMapIntensity=1.05;mat.needsUpdate=true;}
  }
 });
 root.add(model);
 sceneReady=true;
 document.documentElement.classList.add('motion-3d');
 window.m0veWebGLReady=true;
 poster.style.opacity='0';poster.style.pointerEvents='none';
 poster.addEventListener('transitionend',()=>poster.remove(),{once:true});
 progress=scrollProgress();updateDOM();schedule();
}
function init(){
 try{
  const w=Math.max(2,container.clientWidth),h=Math.max(2,container.clientHeight);
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance',preserveDrawingBuffer:false});
  // Laptop and mobile can render expensive detailed geometry without 2x DPR overhead.
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,mobile.matches?1.15:1.45));
  renderer.setSize(w,h,false);
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=2.25;
  renderer.shadowMap.enabled=false;
  renderer.domElement.setAttribute('aria-hidden','true');
  container.appendChild(renderer.domElement);
  scene=new THREE.Scene();
  camera=new THREE.PerspectiveCamera(mobile.matches?40:36,w/h,.1,120);
  camera.position.copy(startPos);lookAt.set(0,-.06,0);camera.lookAt(lookAt);
  root=new THREE.Group();scene.add(root);
  scene.add(new THREE.HemisphereLight(0xe5fff2,0x56624d,3.5));
  const key=new THREE.DirectionalLight(0xfff9db,3.3);key.position.set(4,8,7);scene.add(key);
  const fill=new THREE.DirectionalLight(0xe9ffeb,2.5);fill.position.set(-5,2,-4);scene.add(fill);
  const rim=new THREE.DirectionalLight(0xc8ea8f,2.1);rim.position.set(2,0,-5);scene.add(rim);
  // Lightweight visual dimension cue, not an additional 3D building or model instance.
  const ringGeometry=new THREE.RingGeometry(1.63,1.647,96);
  const ringMaterial=new THREE.MeshBasicMaterial({color:0xb5f48c,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide});
  baseRing=new THREE.Mesh(ringGeometry,ringMaterial);baseRing.rotation.x=-Math.PI/2;baseRing.position.y=-.82;root.add(baseRing);
  const loader=new GLTFLoader();
  loader.load('./assets/coventry-house.glb',prepareModel,undefined,e=>{
   console.warn('3D model could not load. Static house artwork remains visible.',e);
   if(renderer){renderer.domElement.remove();renderer.dispose();renderer=null;}
  });
  resizeObserver=new ResizeObserver(()=>{
   if(!renderer)return;
   const width=Math.max(container.clientWidth,2),height=Math.max(container.clientHeight,2);
   renderer.setPixelRatio(Math.min(devicePixelRatio||1,mobile.matches?1.15:1.45));
   renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();
   if(model)model.scale.setScalar(mobile.matches?2.3:2.05);
   schedule();
  });resizeObserver.observe(container);
  worldObserver=new IntersectionObserver(entries=>{
   active=entries[0].isIntersecting&&!document.hidden;
   if(active){progress=scrollProgress();updateDOM();schedule();}
   else if(requested){cancelAnimationFrame(requested);requested=0;}
  },{threshold:0,rootMargin:'120px 0px 120px 0px'});worldObserver.observe(world);
  document.addEventListener('visibilitychange',()=>{active=!document.hidden&&world.getBoundingClientRect().bottom>0&&world.getBoundingClientRect().top<innerHeight;if(active)schedule();});
  reduceMotion.addEventListener('change',()=>{progress=scrollProgress();updateDOM();schedule();});
 }catch(error){console.warn('WebGL is not available. Static house artwork remains visible.',error);}
}
progress=scrollProgress();updateDOM();init();
