
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const canvas=document.querySelector('#world');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;

const scene=new THREE.Scene();
scene.background=new THREE.Color(0x87c7ff);
scene.fog=new THREE.Fog(0x87c7ff,25,65);
const camera=new THREE.PerspectiveCamera(48,1,.1,100);
camera.position.set(14,13,17);

const controls=new OrbitControls(camera,canvas);
controls.enableDamping=true; controls.target.set(0,1,0);
controls.minDistance=9;controls.maxDistance=28;controls.maxPolarAngle=Math.PI*.47;

scene.add(new THREE.HemisphereLight(0xdff4ff,0x6d8a45,2.2));
const sun=new THREE.DirectionalLight(0xffffff,3.2);sun.position.set(-8,15,10);sun.castShadow=true;
sun.shadow.mapSize.set(1024,1024); scene.add(sun);

const ground=new THREE.Mesh(new THREE.CylinderGeometry(15,16,1,48),new THREE.MeshStandardMaterial({color:0x8ccf69,roughness:.95}));
ground.position.y=-.55;ground.receiveShadow=true;scene.add(ground);

function mat(c){return new THREE.MeshStandardMaterial({color:c,roughness:.72})}
function block(x,y,z,sx,sy,sz,c,parent=scene){
 const m=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),mat(c));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
}
function studs(parent,w,d,y,c){
 for(let x=-w/2+.35;x<w/2;x+=.7)for(let z=-d/2+.35;z<d/2;z+=.7){
  const s=new THREE.Mesh(new THREE.CylinderGeometry(.19,.19,.12,12),mat(c));s.position.set(x,y,z);s.castShadow=true;parent.add(s);
 }
}
const castle=new THREE.Group();scene.add(castle);
block(0,1.3,0,5.5,2.6,4.5,0xf1c66b,castle);studs(castle,5.5,4.5,2.66,0xf1c66b);
for(const [x,z] of [[-2.6,-2],[-2.6,2],[2.6,-2],[2.6,2]]){block(x,2,z,1.5,4,1.5,0xdba84e,castle);studs(castle,1.5,1.5,4.06,0xdba84e)}
block(0,.9,2.28,1.3,1.8,.18,0x76513c,castle);

const lessons=[
 {id:'pawn',name:'Tốt',symbol:'♙',zone:'Cánh đồng Tốt',pos:[-8,0,-4],color:0x65b9e8,text:'Tốt tiến thẳng 1 ô. Ở nước đầu tiên, Tốt có thể tiến 2 ô. Tốt ăn quân theo đường chéo.',from:[6,3],valid:[[5,3],[4,3]]},
 {id:'rook',name:'Xe',symbol:'♖',zone:'Tháp Xe',pos:[8,0,-4],color:0xe96c5b,text:'Xe đi thẳng theo hàng hoặc cột, xa bao nhiêu ô cũng được nếu không có quân chắn.',from:[4,3],valid:[[0,3],[1,3],[2,3],[3,3],[5,3],[6,3],[7,3],[4,0],[4,1],[4,2],[4,4],[4,5],[4,6],[4,7]]},
 {id:'knight',name:'Mã',symbol:'♘',zone:'Chuồng Mã',pos:[-9,0,3],color:0xf0a64b,text:'Mã đi hình chữ L: 2 ô theo một hướng rồi 1 ô sang bên. Mã có thể nhảy qua quân khác.',from:[4,3],valid:[[2,2],[2,4],[3,1],[3,5],[5,1],[5,5],[6,2],[6,4]]},
 {id:'bishop',name:'Tượng',symbol:'♗',zone:'Đền Tượng',pos:[9,0,3],color:0x9b77d3,text:'Tượng đi chéo, xa bao nhiêu ô cũng được nếu đường đi không bị chắn.',from:[4,3],valid:[[3,2],[2,1],[1,0],[3,4],[2,5],[1,6],[0,7],[5,2],[6,1],[7,0],[5,4],[6,5],[7,6]]},
 {id:'queen',name:'Hậu',symbol:'♕',zone:'Cung điện Hậu',pos:[-6,0,8],color:0xef78ad,text:'Hậu rất mạnh: đi thẳng như Xe và đi chéo như Tượng.',from:[4,3],valid:[[4,0],[4,1],[4,2],[4,4],[4,5],[4,6],[4,7],[0,3],[1,3],[2,3],[3,3],[5,3],[6,3],[7,3],[3,2],[2,1],[1,0],[3,4],[2,5],[1,6],[0,7],[5,2],[6,1],[7,0],[5,4],[6,5],[7,6]]},
 {id:'king',name:'Vua',symbol:'♔',zone:'Lâu đài Vua',pos:[6,0,8],color:0x58b88a,text:'Vua đi 1 ô theo bất kỳ hướng nào. Hãy luôn bảo vệ Vua!',from:[4,3],valid:[[3,2],[3,3],[3,4],[4,2],[4,4],[5,2],[5,3],[5,4]]}
];

const clickable=[];
lessons.forEach((l,i)=>{
 const g=new THREE.Group();g.position.set(...l.pos);g.userData.lesson=l;scene.add(g);
 const base=block(0,.45,0,3.1,.9,3.1,l.color,g);base.userData.lesson=l;clickable.push(base);studs(g,3.1,3.1,.96,l.color);
 block(0,1.55,0,1.7,1.4,1.7,0xffe7a8,g);
 const roof=new THREE.Mesh(new THREE.ConeGeometry(1.45,1.7,4),mat(l.color));roof.position.y=3;roof.rotation.y=Math.PI/4;roof.castShadow=true;roof.userData.lesson=l;g.add(roof);clickable.push(roof);
 const sign=block(0,.85,1.75,2.1,.75,.18,0xffffff,g);sign.userData.lesson=l;clickable.push(sign);
 const spriteCanvas=document.createElement('canvas');spriteCanvas.width=256;spriteCanvas.height=128;const ctx=spriteCanvas.getContext('2d');ctx.fillStyle='#fff';ctx.font='bold 72px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(l.symbol,128,64);
 const tex=new THREE.CanvasTexture(spriteCanvas);const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true}));sp.position.set(0,2,1.7);sp.scale.set(1.8,.9,1);g.add(sp);
});

for(let i=0;i<45;i++){const a=i*2.399,r=11.5+(i%4)*.65;const t=new THREE.Group();t.position.set(Math.cos(a)*r,0,Math.sin(a)*r);scene.add(t);block(0,.55,0,.28,1.1,.28,0x76513c,t);const crown=new THREE.Mesh(new THREE.ConeGeometry(.7,1.7,6),mat(i%2?0x4c9b55:0x63b86a));crown.position.y=1.65;crown.castShadow=true;t.add(crown)}

const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();
let down={x:0,y:0};
canvas.addEventListener('pointerdown',e=>down={x:e.clientX,y:e.clientY});
canvas.addEventListener('pointerup',e=>{
 if(Math.hypot(e.clientX-down.x,e.clientY-down.y)>12)return;
 const rect=canvas.getBoundingClientRect();pointer.x=((e.clientX-rect.left)/rect.width)*2-1;pointer.y=-((e.clientY-rect.top)/rect.height)*2+1;
 ray.setFromCamera(pointer,camera);const hit=ray.intersectObjects(clickable,false)[0];if(hit?.object.userData.lesson)openLesson(hit.object.userData.lesson);
});

const welcome=document.querySelector('#welcome'),lessonEl=document.querySelector('#lesson');
document.querySelector('#startBtn').onclick=()=>{welcome.classList.add('hidden');toast('Hãy chạm vào một công trình! 🏰')};
document.querySelector('#closeLesson').onclick=()=>lessonEl.classList.add('hidden');

let current=null,success=false;
function openLesson(l){
 current=l;success=false;welcome.classList.add('hidden');lessonEl.classList.remove('hidden');
 document.querySelector('#pieceBadge').textContent=l.symbol;document.querySelector('#lessonZone').textContent=l.zone.toUpperCase();
 document.querySelector('#lessonTitle').textContent='Học quân '+l.name;document.querySelector('#lessonText').textContent=l.text;
 document.querySelector('#hint').textContent='Chạm vào quân '+l.name+', sau đó chọn một ô sáng.';
 document.querySelector('#completeBtn').disabled=true;buildBoard(l);
}
function buildBoard(l){
 const b=document.querySelector('#board');b.innerHTML='';
 for(let r=0;r<8;r++)for(let c=0;c<8;c++){
  const s=document.createElement('div');s.className='square '+((r+c)%2?'dark':'light');s.dataset.r=r;s.dataset.c=c;
  if(r===l.from[0]&&c===l.from[1]){s.textContent=l.symbol;s.classList.add('origin');s.onclick=()=>showMoves(l)}
  else s.onclick=()=>choose(r,c,l,s);
  b.appendChild(s);
 }
}
function showMoves(l){document.querySelectorAll('.square').forEach(s=>{if(l.valid.some(v=>v[0]==s.dataset.r&&v[1]==s.dataset.c))s.classList.add('valid')});document.querySelector('#hint').textContent='Giỏi! Những ô sáng là nơi quân có thể đi. Chọn thử một ô nhé!';}
function choose(r,c,l,s){
 if(!document.querySelector('.square.valid'))return;
 if(l.valid.some(v=>v[0]===r&&v[1]===c)){success=true;s.textContent=l.symbol;s.classList.add('target-ok');document.querySelector('#hint').textContent='Chính xác! 🎉 Con đã đi đúng quân '+l.name+'.';document.querySelector('#completeBtn').disabled=false;toast('Tuyệt lắm! ⭐')}
 else{document.querySelector('#hint').textContent='Ô này chưa đúng. Con thử một ô đang sáng nhé!';}
}
document.querySelector('#completeBtn').onclick=()=>{
 if(!current||!success)return;const done=new Set(JSON.parse(localStorage.getItem('chessKingdomDone')||'[]'));done.add(current.id);localStorage.setItem('chessKingdomDone',JSON.stringify([...done]));updateStars();lessonEl.classList.add('hidden');toast('Nhận được 1 ngôi sao! ⭐');
};
function updateStars(){const n=JSON.parse(localStorage.getItem('chessKingdomDone')||'[]').length;document.querySelector('#stars').textContent=n}
updateStars();
function toast(t){const el=document.querySelector('#toast');el.textContent=t;el.classList.remove('hidden');clearTimeout(window._tt);window._tt=setTimeout(()=>el.classList.add('hidden'),1800)}
function resize(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
addEventListener('resize',resize);resize();
let time=0;function animate(){requestAnimationFrame(animate);time+=.01;controls.update();castle.position.y=Math.sin(time)*.025;renderer.render(scene,camera)}animate();

if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js');
