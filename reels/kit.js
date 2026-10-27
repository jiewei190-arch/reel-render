import * as THREE from 'three';
import {RoomEnvironment} from './node_modules/three/examples/jsm/environments/RoomEnvironment.js';

export const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
export const ramp=(t,a,b)=>clamp((t-a)/(b-a));
export const E=x=>{x=clamp(x);return x*x*(3-2*x)};
export const eo=x=>1-Math.pow(1-clamp(x),3);
export const ei=x=>{x=clamp(x);return x*x*x};
export const bk=x=>{x=clamp(x);const c=1.7;return 1+(c+1)*Math.pow(x-1,3)+c*Math.pow(x-1,2)};
export const lerp=(a,b,k)=>a+(b-a)*k;
export const rnd=(seed=1)=>{let t=seed;return()=>{t=(t*1664525+1013904223)%4294967296;return t/4294967296}};
export {THREE};

export function createKit(cfg){
 const TL=window.TL, TLp=TL.p; const W=540,H=960;
 const accent=cfg.accent, col=new THREE.Color(accent);
 const R=Math.round(col.r*255),G=Math.round(col.g*255),B=Math.round(col.b*255);
 const root=document.documentElement.style;
 root.setProperty('--accent',accent);root.setProperty('--ar',`${R},${G},${B}`);
 const s=i=>TLp[i].start, e=i=>TLp[i].end;

 const canvas=document.getElementById('gl');
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,preserveDrawingBuffer:true});
 renderer.setPixelRatio(2);renderer.setSize(W,H,false);
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=cfg.exposure??1.05;
 const bgc=new THREE.Color(cfg.bg??0x07090b);
 const scene=new THREE.Scene();scene.background=bgc;
 scene.fog=new THREE.Fog(bgc,cfg.fogNear??10,cfg.fogFar??30);
 const pm=new THREE.PMREMGenerator(renderer);
 scene.environment=pm.fromScene(new RoomEnvironment(),0.04).texture;scene.environmentIntensity=cfg.envInt??0.28;
 const camera=new THREE.PerspectiveCamera(cfg.fov??32,W/H,0.1,200);
 const key=new THREE.DirectionalLight(0xffffff,2.0);key.position.set(-3,5,5);scene.add(key);
 const rim=new THREE.PointLight(col,cfg.rimInt??28,0,2);rim.position.set(0,1.5,-3.2);scene.add(rim);
 const fill=new THREE.PointLight(cfg.fillColor??0x88aaff,6,0,2);fill.position.set(4,2,4);scene.add(fill);
 scene.add(new THREE.AmbientLight(0xffffff,0.25));

 let grid=null;
 if(cfg.gridY!==null){grid=new THREE.GridHelper(80,100,col.clone().multiplyScalar(.28),col.clone().multiplyScalar(.09));grid.position.y=cfg.gridY??-1.56;grid.material.transparent=true;grid.material.opacity=.55;scene.add(grid)}
 // dust
 const dn=cfg.dust??160;const dg=new THREE.BufferGeometry();const dp=new Float32Array(dn*3);const dr=rnd(4);
 const dsp=cfg.dustSpread??14;
 for(let i=0;i<dn;i++){dp[i*3]=(dr()-.5)*dsp;dp[i*3+1]=(dr()-.5)*dsp*.8;dp[i*3+2]=(dr()-.5)*dsp-1}
 dg.setAttribute('position',new THREE.BufferAttribute(dp,3));
 const dust=new THREE.Points(dg,new THREE.PointsMaterial({color:col,size:cfg.dustSize??.035,transparent:true,opacity:.5,depthWrite:false,blending:THREE.AdditiveBlending}));scene.add(dust);
 const dust0=dp.slice();

 // textures / sprites
 function glowTex(){const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');
  const g=x.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.25,'rgba(255,255,255,.35)');g.addColorStop(1,'rgba(255,255,255,0)');
  x.fillStyle=g;x.fillRect(0,0,128,128);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t}
 const GT=glowTex();
 function glowSprite(color,scale,op){const m=new THREE.SpriteMaterial({map:GT,color,transparent:true,opacity:op,blending:THREE.AdditiveBlending,depthWrite:false});const sp=new THREE.Sprite(m);sp.scale.set(scale,scale,1);return sp}
 function glyphTex(ch,color=accent,size=64){const c=document.createElement('canvas');c.width=c.height=96;const x=c.getContext('2d');
  x.fillStyle=color;x.font=`700 ${size}px Poppins, sans-serif`;x.textAlign='center';x.textBaseline='middle';x.shadowColor=color;x.shadowBlur=14;x.fillText(ch,48,52);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t}
 // 3D text sprite
 function textSprite(text,o={}){
  const cv=document.createElement('canvas');const h=o.px??96;cv.height=h;cv.width=o.w??512;const cx=cv.getContext('2d');
  const tex=new THREE.CanvasTexture(cv);tex.colorSpace=THREE.SRGBColorSpace;
  const mat=new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false,depthTest:o.depthTest??false,toneMapped:false});
  const sp=new THREE.Sprite(mat);const ar=cv.width/cv.height;sp.scale.set((o.height??.3)*ar,o.height??.3,1);
  let last=null;
  sp.userData.set=(t,color=o.color??'#fff')=>{const k=t+color;if(k===last)return;last=k;cx.clearRect(0,0,cv.width,cv.height);
   cx.font=`${o.weight??800} ${h*.62}px Poppins, sans-serif`;cx.textAlign='center';cx.textBaseline='middle';
   if(o.glow){cx.shadowColor=color;cx.shadowBlur=18}cx.fillStyle=color;cx.fillText(t,cv.width/2,h/2+4);tex.needsUpdate=true};
  sp.userData.set(text);return sp}

 // overlay
 const ov=document.getElementById('ov'),linesSvg=document.getElementById('lines'),cap=document.getElementById('cap');
 const items=[];const SVGNS='http://www.w3.org/2000/svg';
 function mkLine(){const l=document.createElementNS(SVGNS,'line');l.setAttribute('stroke','rgba(255,255,255,.75)');l.setAttribute('stroke-width','1.5');linesSvg.appendChild(l);
  const d=document.createElementNS(SVGNS,'circle');d.setAttribute('r','4');d.setAttribute('fill','#fff');linesSvg.appendChild(d);return{l,d}}
 function el(html,cls,style=''){const d=document.createElement('div');d.className=cls;d.innerHTML=html;d.style.cssText=style;ov.appendChild(d);return d}
 function addTag(text,sub,x,y,align,anchorFn,a,b,lineB=null){
  const d=el(text+(sub?`<small>${sub}</small>`:''),'tag');
  if(align==='r'){d.style.right=(W-x)+'px'}else d.style.left=x+'px';d.style.top=y+'px';d.style.textAlign=align==='r'?'right':'left';
  items.push({el:d,ln:anchorFn?mkLine():null,anchorFn,a,b,align,lineB});return d}
 function addChip(html,x,y,align,a,b,cls='',anchorFn=null,lineB=null){
  const d=el(html,'chip '+cls);if(align==='r'){d.style.right=(W-x)+'px'}else d.style.left=x+'px';d.style.top=y+'px';
  items.push({el:d,ln:anchorFn?mkLine():null,anchorFn,a,b,align,lineB});return d}
 const proj=v=>{const p=v.clone().project(camera);return{x:(p.x*.5+.5)*W,y:(-p.y*.5+.5)*H}};

 const capHtml=TLp.map(p=>p.cap.replace(/\*\*(.+?)\*\*/g,'<i>$1</i>').replace(/\*(.+?)\*/g,'<b>$1</b>'));
 let KF=[[0,[0,0,8],[0,0,0]]];
 const kit={THREE,TL,TLp,s,e,scene,camera,renderer,key,rim,fill,grid,dust,accent,col,glowSprite,glyphTex,textSprite,addTag,addChip,el,proj,W,H,
  clamp,ramp,E,eo,ei,bk,lerp,rnd,
  setCamera(k){KF=k},
  capTop:null,
  frame(t,update){
   // camera
   let i=0;while(i<KF.length-1&&t>=KF[i+1][0])i++;
   let pos,look;
   if(i>=KF.length-1){pos=KF[KF.length-1][1];look=KF[KF.length-1][2]}else{const a=KF[i],b=KF[i+1];const u=E((t-a[0])/(b[0]-a[0]));pos=a[1].map((v,j)=>lerp(v,b[1][j],u));look=a[2].map((v,j)=>lerp(v,b[2][j],u))}
   const dr1=cfg.drift??.12;
   camera.position.set(pos[0]+Math.sin(t*.35)*dr1,pos[1]+Math.sin(t*.27)*.05,pos[2]);camera.lookAt(look[0],look[1],look[2]);camera.updateMatrixWorld();
   // dust drift
   const ar=dust.geometry.attributes.position.array;const span=dsp*.8;
   for(let k=0;k<dn;k++){ar[k*3+1]=((dust0[k*3+1]+t*.12+span/2)%span)-span/2+(cfg.dustY??0);ar[k*3]=dust0[k*3]+Math.sin(t*.3+k)*.15}
   dust.geometry.attributes.position.needsUpdate=true;
   update(t);
   renderer.render(scene,camera);
   // captions
   let ci=-1;for(let k=0;k<TLp.length;k++){if(t>=TLp[k].start-.02)ci=k;else break}
   if(ci>=0&&t<TLp[ci].end+.45){const k2=t-TLp[ci].start;cap.innerHTML=capHtml[ci];cap.style.opacity=clamp((k2+.02)/.1)*clamp((TLp[ci].end+.45-t)/.2);cap.style.transform=`translateY(${(1-eo(k2/.22))*10}px)`}else cap.style.opacity=0;
   if(kit.capTop)cap.style.top=kit.capTop(t)+'px';
   // labels
   items.forEach(it=>{const op=clamp((t-it.a)/.25)*clamp((it.b-t)/.25);it.el.style.opacity=op;it.el.style.transform=`translateY(${(1-eo((t-it.a)/.3))*8}px)`;
    if(it.ln){if(op<.01){it.ln.l.setAttribute('opacity',0);it.ln.d.setAttribute('opacity',0)}else{
     const pt=proj(it.anchorFn());const r=it.el.getBoundingClientRect();
     const sx=it.align==='r'?r.left-4:r.right+4,sy=r.top+r.height/2;const lo=it.lineB?(1-ramp(t,it.lineB-.3,it.lineB)):1;
     const g=eo((t-it.a)/.4);
     it.ln.l.setAttribute('x1',sx);it.ln.l.setAttribute('y1',sy);it.ln.l.setAttribute('x2',lerp(sx,pt.x,g));it.ln.l.setAttribute('y2',lerp(sy,pt.y,g));
     it.ln.l.setAttribute('opacity',op*.85*lo);it.ln.d.setAttribute('cx',pt.x);it.ln.d.setAttribute('cy',pt.y);it.ln.d.setAttribute('opacity',op*lo*eo((t-it.a-.25)/.2))}}});
  }};
 window.DUR=TL.total;
 return kit;
}

// stylized person (used in several videos)
export function personFactory(THREE){
 const headG=new THREE.SphereGeometry(.085,16,12), bodyG=new THREE.CapsuleGeometry(.07,.15,4,10);
 return function makePerson(scale=1){const g=new THREE.Group();
  const m=new THREE.MeshStandardMaterial({color:0x3b4249,metalness:.3,roughness:.5,emissive:0x000000});
  const h=new THREE.Mesh(headG,m);h.position.y=.33;const b=new THREE.Mesh(bodyG,m);b.position.y=.14;g.add(h,b);g.scale.setScalar(scale);g.userData.m=m;return g}}

// rounded-rect outline points
export function rrPath(w,h,r,seg=10){const pts=[];const hw=w/2,hh=h/2;
 [[hw-r,hh-r,0],[-hw+r,hh-r,Math.PI/2],[-hw+r,-hh+r,Math.PI],[hw-r,-hh+r,1.5*Math.PI]].forEach(([cx,cy,a0])=>{for(let i=0;i<=seg;i++){const a=a0+(Math.PI/2)*i/seg;pts.push(new THREE.Vector3(cx+Math.cos(a)*r,cy+Math.sin(a)*r,0))}});return pts}
