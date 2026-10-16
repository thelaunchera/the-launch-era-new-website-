/* Real scroll-linked Three.js scene for the PUBLIC homepage only.
   No customer records, booking submissions, checkout, or private app access. */
import * as THREE from 'https://esm.sh/three@0.180.0';
import { RoundedBoxGeometry } from 'https://esm.sh/three@0.180.0/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'https://esm.sh/three@0.180.0/addons/environments/RoomEnvironment.js';

const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const ease=x=>{x=clamp(x);return x*x*(3-2*x)};
const mix=(a,b,t)=>a+(b-a)*t;
const temp=new THREE.Color();
function blend(a,b,t){return temp.set(a).lerp(new THREE.Color(b),clamp(t)).getStyle()}
function nightKeyframe(p){
 // Held phase keyframes: day, day, dusk, night.
 const keys=[[0,0],[.30,0],[.68,.55],[1,1]];
 for(let i=1;i<keys.length;i++)if(p<=keys[i][0]){
  const a=keys[i-1],b=keys[i],t=ease((p-a[0])/(b[0]-a[0]));
  return mix(a[1],b[1],t);
 }
 return 1;
}
function glowTexture() {
 const c=document.createElement('canvas');c.width=c.height=128;
 const ctx=c.getContext('2d');
 if(!ctx)return null;
 const gr=ctx.createRadialGradient(64,64,3,64,64,64);
 gr.addColorStop(0,'rgba(255,236,169,.8)');
 gr.addColorStop(.25,'rgba(252,219,166,.45)');
 gr.addColorStop(.65,'rgba(165,207,245,.12)');
 gr.addColorStop(1,'rgba(165,207,245,0)');
 ctx.fillStyle=gr;ctx.fillRect(0,0,128,128);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;
 return t;
}
export function mountTimeOfDay(root){
 const holder=root.querySelector('[data-tle-canvas]');
 if(!holder||!root.isConnected)return ()=>{};
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 let renderer;
 try{
  renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
 }catch{return ()=>{}}
 renderer.setClearColor(0x000000,0);
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;
 renderer.toneMappingExposure=1.55;
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,window.innerWidth<700?1.25:1.6));
 renderer.domElement.setAttribute('aria-hidden','true');
 renderer.domElement.setAttribute('data-tle-webgl','true');
 holder.appendChild(renderer.domElement);
 const scene=new THREE.Scene();
 const camera=new THREE.PerspectiveCamera(37,1,.1,100);
 const geometries=new Set(),materials=new Set(),textures=new Set();
 const geo=x=>{geometries.add(x);return x};
 const mat=x=>{materials.add(x);return x};
 const round=(w,h,d,r=.08)=>geo(new RoundedBoxGeometry(w,h,d,3,Math.min(r,w/5,h/5,d/5)));
 const standard=(hex,extra={})=>mat(new THREE.MeshStandardMaterial({color:hex,roughness:.81,metalness:0,...extra}));
 const basic=(hex,extra={})=>mat(new THREE.MeshBasicMaterial({color:hex,...extra}));
 const add=(geometry,material,x,y,z,group=scene)=>{
  const obj=new THREE.Mesh(geometry,material);obj.position.set(x,y,z);group.add(obj);return obj;
 };
 const rootGroup=new THREE.Group();scene.add(rootGroup);
 const base=standard(0x8baec0),ground=standard(0xb9d6c9);
 add(geo(new THREE.CylinderGeometry(2.72,2.64,.46,56)),base,0,-.25,0,rootGroup);
 add(geo(new THREE.CylinderGeometry(2.74,2.74,.18,56)),ground,0,.03,0,rootGroup);
 const white=standard(0xf5faff),white2=standard(0xe7f1fa),roof=standard(0x9cc5e7);
 add(round(2.04,1.65,1.72),white,-.54,.91,0,rootGroup);
 add(round(1.46,1.36,1.47),white2,1.03,.77,-.06,rootGroup);
 add(round(2.28,.19,1.94,.06),roof,-.54,1.83,0,rootGroup);
 const roof2=standard(0x79abd3);
 add(round(1.68,.18,1.68,.05),roof2,1.03,1.55,-.06,rootGroup);
 const door=standard(0x6d96b5);
 add(round(.50,.93,.065,.025),door,-.53,.54,.89,rootGroup);
 add(geo(new THREE.SphereGeometry(.033,10,10)),standard(0xf3d85b),-.35,.55,.95,rootGroup);
 const glass=standard(0x9ed3ef,{emissive:0xffdba5,emissiveIntensity:.02,roughness:.25,metalness:.04});
 const frame=standard(0xffffff);
 function windowAt(x,y,z,w,h){
  add(round(w+.1,h+.1,.068,.035),frame,x,y,z,rootGroup);
  add(round(w,h,.075,.02),glass,x,y,z+.055,rootGroup);
  add(round(.04,h,.055,.016),frame,x,y,z+.111,rootGroup);
 }
 windowAt(-1.1,1.04,.91,.42,.48);
 windowAt(1.12,.93,.71,.45,.45);
 const trunk=standard(0xa48f79),leaves=standard(0x8eb8a5);
 [[-2.02,-.32],[-1.87,1.03],[2.04,.29],[1.98,-1.00]].forEach(([x,z],i)=>{
  add(geo(new THREE.CylinderGeometry(.065,.09,.43,7)),trunk,x,.34,z,rootGroup);
  const top=add(geo(new THREE.SphereGeometry(i%2?.30:.37,9,7)),leaves,x,.68,z,rootGroup);
  top.scale.set(1,1.08,.9);
 });
 const sun=add(geo(new THREE.SphereGeometry(.34,24,18)),basic(0xffe8a4,{toneMapped:false}),3.6,3,-3.9);
 const moon=add(geo(new THREE.SphereGeometry(.285,24,18)),basic(0xf3f8ff,{toneMapped:false}),-3.7,-2,-3.8);
 const haloMap=glowTexture();if(haloMap)textures.add(haloMap);
 const sunGlow=mat(new THREE.SpriteMaterial({map:haloMap||undefined,color:0xffe3af,transparent:true,opacity:.9,depthWrite:false}));
 const moonGlow=mat(new THREE.SpriteMaterial({map:haloMap||undefined,color:0xd1eaff,transparent:true,opacity:0,depthWrite:false}));
 const sunHalo=new THREE.Sprite(sunGlow);sunHalo.scale.set(3.4,3.4,1);sun.add(sunHalo);
 const moonHalo=new THREE.Sprite(moonGlow);moonHalo.scale.set(2.5,2.5,1);moon.add(moonHalo);
 const starPositions=new Float32Array(160*3);
 // Fixed pseudo-random points, never regenerated on scroll.
 let seed=1337;const random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296};
 for(let i=0;i<160;i++){starPositions[i*3]=mix(-11,11,random());starPositions[i*3+1]=mix(.7,9.5,random());starPositions[i*3+2]=mix(-8,-5,random())}
 const starsGeo=geo(new THREE.BufferGeometry());starsGeo.setAttribute('position',new THREE.BufferAttribute(starPositions,3));
 const starsMat=mat(new THREE.PointsMaterial({color:0xf4fbff,size:.072,transparent:true,opacity:0,depthWrite:false,sizeAttenuation:true}));
 scene.add(new THREE.Points(starsGeo,starsMat));
 const keyLight=new THREE.DirectionalLight(0xffe2b0,2.7);keyLight.position.set(3,7,5);scene.add(keyLight);
 const fill=new THREE.AmbientLight(0xe1f0ff,.65);scene.add(fill);
 let pmrem,room,environment;
 try {
  room=new RoomEnvironment();
  pmrem=new THREE.PMREMGenerator(renderer);
  environment=pmrem.fromScene(room,.04).texture;
  scene.environment=environment;
  scene.environmentIntensity=1.05;
 } catch {scene.environment=null}
 const topDay='#f7fbff',topDusk='#a8c9e4',topNight='#21395e';
 const bottomDay='#cbe5f6',bottomDusk='#6f98c5',bottomNight='#111e3e';
 const groundDay=new THREE.Color(0xb9d6c9),groundNight=new THREE.Color(0x526c83);
 const leafDay=new THREE.Color(0x8eb8a5),leafNight=new THREE.Color(0x4f738b);
 const lightDay=new THREE.Color(0xffe2b0),lightNight=new THREE.Color(0x94b3e5);
 const steps=Array.from(root.querySelectorAll('[data-tle-chapter]'));
 const index=root.querySelector('[data-tle-count]');
 let visible=false,raf=0,dead=false,progress=0,smoothed=0,lastFrame=0;
 function scrollProgress(){
  const rect=root.getBoundingClientRect();
  return clamp(-rect.top/Math.max(1,rect.height-window.innerHeight));
 }
 function resize(){
  if(dead)return;
  const w=Math.max(holder.clientWidth,1),h=Math.max(holder.clientHeight,1);
  renderer.setSize(w,h,false);
  camera.aspect=w/h;camera.fov=w<480?47:37;camera.updateProjectionMatrix();
 }
 function paint(n,p){
  let top,bottom;
  if(n<.55){top=blend(topDay,topDusk,n/.55);bottom=blend(bottomDay,bottomDusk,n/.55)}
  else{top=blend(topDusk,topNight,(n-.55)/.45);bottom=blend(bottomDusk,bottomNight,(n-.55)/.45)}
  root.style.background='linear-gradient(160deg,'+top+' 0%,'+bottom+' 100%)';
  root.dataset.evening=String(n>.3);
  ground.color.copy(groundDay).lerp(groundNight,n);
  leaves.color.copy(leafDay).lerp(leafNight,n);
  keyLight.color.copy(lightDay).lerp(lightNight,n);
  keyLight.intensity=mix(2.7,.48,n);
  fill.intensity=mix(.65,.23,n);
  scene.environmentIntensity=mix(1.05,.24,n);
  glass.emissiveIntensity=mix(.02,2.5,ease((n-.15)/.65));
  starsMat.opacity=ease((n-.17)/.65)*.85;
  sun.position.x=mix(3.8,-4.1,p);
  sun.position.y=.3+3.65*Math.sin((p*1.22+.1)*Math.PI);
  sun.visible=p<.9;
  sunGlow.opacity=clamp(1-n*1.3);
  moon.position.x=mix(-3.65,2.0,p);
  moon.position.y=mix(-2.7,3.6,ease((p-.42)/.58));
  moon.visible=n>.05;
  moonGlow.opacity=n*.68;
  moon.material.opacity=1;
  camera.position.set(6.8+Math.sin(p*Math.PI)*.36,5.3,9.1);
  camera.lookAt(0,.80,0);
  rootGroup.rotation.y=.10+Math.sin(p*Math.PI)*.1;
  const step=Math.min(3,Math.floor(p*4+.09));
  if(index)index.textContent='0'+(step+1);
  root.dataset.activeStep=String(step);
 }
 function tick(now){
  raf=0;if(dead||!visible)return;
  progress=scrollProgress();
  // Time-corrected smoothing works even with slow software-rendered WebGL frames.
  const dt=lastFrame?Math.min(1250,now-lastFrame):16.667;
  lastFrame=now;
  smoothed+=(progress-smoothed)*(1-Math.pow(.925,dt/16.667));
  const n=nightKeyframe(smoothed);
  paint(n,smoothed);
  renderer.render(scene,camera);
  raf=requestAnimationFrame(tick);
 }
 function start(){if(dead||reduced)return;visible=true;lastFrame=0;if(!raf)raf=requestAnimationFrame(tick)}
 function stop(){visible=false;if(raf)cancelAnimationFrame(raf);raf=0}
 const observer=new IntersectionObserver(entries=>{if(entries[0]?.isIntersecting&&document.visibilityState==='visible')start();else stop()},{rootMargin:'250px'});
 observer.observe(root);
 const resizeObserver=typeof ResizeObserver!=='undefined'?new ResizeObserver(resize):null;
 resizeObserver?.observe(holder);
 window.addEventListener('resize',resize,{passive:true});
 const visibility=()=>{if(document.visibilityState==='visible'&&root.getBoundingClientRect().bottom>0&&root.getBoundingClientRect().top<window.innerHeight)start();else stop()};
 document.addEventListener('visibilitychange',visibility);
 resize();
 smoothed=reduced?.88:scrollProgress();
 paint(nightKeyframe(smoothed),smoothed);
 renderer.render(scene,camera);
 root.dataset.render='webgl';
 if(reduced){root.dataset.evening='true';root.style.background='linear-gradient(160deg,#567aa3,#243f66)'}
 return ()=>{
  dead=true;stop();observer.disconnect();resizeObserver?.disconnect();
  window.removeEventListener('resize',resize);document.removeEventListener('visibilitychange',visibility);
  root.style.removeProperty('background');delete root.dataset.render;delete root.dataset.evening;
  scene.traverse(obj=>{if(obj.isMesh||obj.isPoints){geometries.add(obj.geometry);if(Array.isArray(obj.material))obj.material.forEach(m=>materials.add(m));else materials.add(obj.material)}});
  for(const g of geometries)g.dispose();
  for(const m of materials)m.dispose();
  for(const t of textures)t.dispose();
  environment?.dispose();room?.dispose?.();pmrem?.dispose();
  renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();
 };
}
