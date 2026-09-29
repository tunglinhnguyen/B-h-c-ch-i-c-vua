import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const canvas=document.querySelector('#world'),welcome=document.querySelector('#welcome'),lessonEl=document.querySelector('#lesson');
lessonEl.classList.add('hidden');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.shadowMap.enabled=true;renderer.outputColorSpace=THREE.SRGBColorSpace;
const scene=new THREE.Scene();scene.background=new THREE.Color(0x8ed0ff);scene.fog=new THREE.Fog(0x8ed0ff,34,75);
const camera=new THREE.PerspectiveCamera(48,1,.1,120);camera.position.set(15,15,18);
const controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.target.set(0,0,0);controls.minDistance=8;controls.maxDistance=29;controls.maxPolarAngle=Math.PI*.47;
scene.add(new THREE.HemisphereLight(0xf3fbff,0x668844,2.5));
const sun=new THREE.DirectionalLight(0xffffff,3.2);sun.position.set(-9,18,11);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);scene.add(sun);
const M=c=>new THREE.MeshStandardMaterial({color:c,roughness:.68});
function box(parent,x,y,z,sx,sy,sz,c){const o=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),M(c));o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;parent.add(o);return o}
function cyl(parent,x,y,z,r,h,c,n=12){const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,n),M(c));o.position.set(x,y,z);o.castShadow=true;parent.add(o);return o}
const ground=new THREE.Mesh(new THREE.CylinderGeometry(16.5,17.5,1,48),M(0x83c965));ground.position.y=-.7;ground.receiveShadow=true;scene.add(ground);

/* ===== BÀN CỜ KHỔNG LỒ LÀ TRUNG TÂM MAP ===== */
const board=new THREE.Group();scene.add(board);const CELL=1.35,half=3.5*CELL;
box(board,0,-.13,0,CELL*8+.75,.35,CELL*8+.75,0x65432e);
const squares=[],interactive=[];
for(let r=0;r<8;r++)for(let c=0;c<8;c++){const q=box(board,(c-3.5)*CELL,.08,(r-3.5)*CELL,CELL-.035,.20,CELL-.035,(r+c)%2?0x75aa68:0xf1d6a1);q.userData={r,c,type:'square'};squares.push(q)}
for(let i=-4;i<=4;i++){box(scene,i*1.35,-.42,-6.4,.16,.25,.8,0xe8bd68);box(scene,i*1.35,-.42,6.4,.16,.25,.8,0xe8bd68)}

/* ===== QUÂN CỜ KHỐI LẮP GHÉP ===== */
const colors={pawn:0x56b8ea,rook:0xe96d5c,knight:0xf0a64b,bishop:0x9b77d3,queen:0xef78ad,king:0x4e83d8};
function piece(kind,color=colors[kind]){
 const g=new THREE.Group(),b=(x,y,z,sx,sy,sz,c=color)=>box(g,x,y,z,sx,sy,sz,c),s=(x,y,z,r=.19,c=color)=>cyl(g,x,y,z,r,.14,c);
 b(0,.18,0,.78,.34,.78);for(const x of[-.2,.2])for(const z of[-.2,.2])s(x,.42,z);
 if(kind==='pawn'){b(0,.67,0,.48,.55,.48);b(0,1.05,0,.62,.22,.62);s(0,1.3,0,.3)}
 if(kind==='rook'){b(0,.72,0,.58,.72,.58);b(0,1.13,0,.78,.2,.78);for(const x of[-.27,.27])for(const z of[-.27,.27])b(x,1.37,z,.2,.28,.2)}
 if(kind==='knight'){b(0,.67,0,.5,.62,.5);b(.08,1.05,-.03,.5,.45,.48);b(.17,1.36,-.16,.45,.28,.64);b(.2,1.55,-.37,.36,.22,.32);s(.2,1.58,-.53,.08,0x25334b)}
 if(kind==='bishop'){b(0,.69,0,.48,.62,.48);b(0,1.08,0,.62,.2,.62);const co=new THREE.Mesh(new THREE.ConeGeometry(.37,.7,8),M(color));co.position.y=1.48;co.castShadow=true;g.add(co);s(0,1.86,0,.16)}
 if(kind==='queen'){b(0,.7,0,.5,.65,.5);b(0,1.12,0,.68,.22,.68);for(const [x,z] of[[-.25,-.25],[.25,-.25],[-.25,.25],[.25,.25],[0,0]])s(x,1.48,z,.15)}
 if(kind==='king'){b(0,.72,0,.52,.7,.52);b(0,1.16,0,.7,.22,.7);b(0,1.55,0,.18,.65,.18);b(0,1.68,0,.56,.15,.16)}
 g.userData.kind=kind;return g;
}
const lessonData={
 pawn:{name:'Tốt',text:'Tốt tiến thẳng một ô. Ở nước đầu tiên, Tốt có thể tiến hai ô.',from:[6,3],valid:[[5,3],[4,3]]},
 rook:{name:'Xe',text:'Xe đi thẳng theo hàng hoặc cột và có thể đi nhiều ô nếu không bị cản.',from:[7,0],valid:[[6,0],[5,0],[4,0],[3,0],[2,0],[1,0],[0,0],[7,1],[7,2],[7,3]]},
 knight:{name:'Mã',text:'Mã đi hình chữ L, hai ô theo một hướng rồi một ô sang bên. Mã có thể nhảy qua quân.',from:[7,1],valid:[[5,0],[5,2],[6,3]]},
 bishop:{name:'Tượng',text:'Tượng đi theo đường chéo và có thể đi nhiều ô nếu không bị cản.',from:[7,2],valid:[[6,1],[5,0],[6,3],[5,4],[4,5],[3,6],[2,7]]},
 queen:{name:'Hậu',text:'Hậu đi ngang, dọc như Xe và đi chéo như Tượng.',from:[7,3],valid:[[6,3],[5,3],[4,3],[3,3],[7,4],[7,2],[6,2],[5,1],[4,0],[6,4],[5,5],[4,6],[3,7]]},
 king:{name:'Vua',text:'Vua đi một ô theo bất kỳ hướng nào.',from:[7,4],valid:[[6,3],[6,4],[6,5],[7,3],[7,5]]}
};
const pieces=[];
function place(kind,r,c,scale=.76){const p=piece(kind);p.position.set((c-3.5)*CELL,.2,(r-3.5)*CELL);p.scale.setScalar(scale);p.userData={...p.userData,kind,r,c};p.traverse(o=>{if(o.isMesh){o.userData.piece=p;interactive.push(o)}});board.add(p);pieces.push(p);return p}
const hero={rook:place('rook',7,0),knight:place('knight',7,1),bishop:place('bishop',7,2),queen:place('queen',7,3),king:place('king',7,4),pawn:place('pawn',6,3,.7)};
place('bishop',7,5);place('knight',7,6);place('rook',7,7);
for(let c=0;c<8;c++)if(c!==3)place('pawn',6,c,.7);

/* trang trí vương quốc quanh bàn */
for(let i=0;i<30;i++){const a=i/30*Math.PI*2,r=13.2+(i%3)*.55,g=new THREE.Group();g.position.set(Math.cos(a)*r,0,Math.sin(a)*r);scene.add(g);box(g,0,.45,0,.25,.9,.25,0x76513c);const t=new THREE.Mesh(new THREE.ConeGeometry(.62,1.5,6),M(i%2?0x4b9b55:0x61b568));t.position.y=1.45;g.add(t)}
for(const [x,z,c] of[[-10,-8,0xf2c66d],[10,-8,0xe98972],[-11,6,0x9d83d8],[11,6,0x65b990]]){const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);box(g,0,.7,0,2.8,1.4,2.8,c);box(g,0,1.8,0,1.5,1.0,1.5,0xffe7aa);const roof=new THREE.Mesh(new THREE.ConeGeometry(1.35,1.5,4),M(c));roof.position.y=3;roof.rotation.y=Math.PI/4;g.add(roof)}

/* ===== ÂM THANH ===== */
let ctx,timer;
function music(){if(timer)return;ctx=ctx||new (window.AudioContext||window.webkitAudioContext)();ctx.resume();const n=[261.6,329.6,392,523.3,440,392,329.6,293.7];let i=0;timer=setInterval(()=>{const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.value=n[i++%n.length];g.gain.setValueAtTime(.0001,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.025,ctx.currentTime+.04);g.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+.42);o.connect(g).connect(ctx.destination);o.start();o.stop(ctx.currentTime+.45)},520)}
function say(t){if(!speechSynthesis)return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang='vi-VN';u.rate=.88;u.pitch=1.12;const v=speechSynthesis.getVoices().find(v=>v.lang?.toLowerCase().startsWith('vi'));if(v)u.voice=v;speechSynthesis.speak(u)}

/* ===== GAMEPLAY 3D-FIRST ===== */
const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();let down={},active=null,phase='explore',anim=null;
function cellPos(r,c){return new THREE.Vector3((c-3.5)*CELL,.2,(r-3.5)*CELL)}
function clearMarks(){squares.forEach(q=>{q.material.emissive?.setHex(0);q.scale.y=1;q.userData.valid=false})}
function markMoves(d){clearMarks();d.valid.forEach(([r,c])=>{const q=squares[r*8+c];q.material.emissive.setHex(0x6a5b00);q.material.emissiveIntensity=.65;q.scale.y=1.18;q.userData.valid=true;interactive.push(q)})}
function focusPiece(p){const d=lessonData[p.userData.kind];if(!d)return;active={p,d};phase='demo';controls.enabled=false;const target=p.position.clone();const cp=new THREE.Vector3(target.x+4.6,7.2,target.z+6.5);anim={t:0,from:camera.position.clone(),to:cp,targetFrom:controls.target.clone(),targetTo:target.clone(),done:()=>demo(p,d)};say('Đây là quân '+d.name+'. '+d.text)}
function demo(p,d){markMoves(d);const dest=d.valid[0],a=p.position.clone(),b=cellPos(dest[0],dest[1]);setTimeout(()=>{anim={t:0,from:a,to:b,obj:p,demo:true,done:()=>{setTimeout(()=>{p.position.copy(a);phase='try';say('Bây giờ đến lượt con. Hãy chạm vào một ô đang sáng để đưa quân '+d.name+' tới đó nhé.')},500)}}},650)}
function moveChosen(q){if(phase!=='try'||!q.userData.valid)return;phase='moving';const from=active.p.position.clone(),to=cellPos(q.userData.r,q.userData.c);anim={t:0,from,to,obj:active.p,done:()=>{clearMarks();toast('Chính xác! ⭐');say('Chính xác! Giỏi lắm. Con nhận được một ngôi sao!');const done=new Set(JSON.parse(localStorage.getItem('chessKingdomDone')||'[]'));done.add(active.p.userData.kind);localStorage.setItem('chessKingdomDone',JSON.stringify([...done]));updateStars();setTimeout(resetExplore,1700)}}}
function resetExplore(){if(active)active.p.position.copy(cellPos(active.d.from[0],active.d.from[1]));active=null;phase='explore';controls.enabled=true;anim={t:0,from:camera.position.clone(),to:new THREE.Vector3(15,15,18),targetFrom:controls.target.clone(),targetTo:new THREE.Vector3(0,0,0)};toast('Chọn một quân cờ khác!')}
canvas.addEventListener('pointerdown',e=>down={x:e.clientX,y:e.clientY});
canvas.addEventListener('pointerup',e=>{if(Math.hypot(e.clientX-down.x,e.clientY-down.y)>10)return;const r=canvas.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);if(phase==='try'){const hit=ray.intersectObjects(squares,false).find(h=>h.object.userData.valid);if(hit)return moveChosen(hit.object)}if(phase==='explore'){const hit=ray.intersectObjects(interactive.filter(o=>o.userData.piece),false)[0];if(hit)focusPiece(hit.object.userData.piece)}});

document.querySelector('#startBtn').onclick=()=>{music();welcome.classList.add('hidden');say('Chào con đến với Vương quốc Cờ vua. Đây là bàn cờ khổng lồ. Con hãy xoay bàn cờ và chạm vào một quân cờ để học nhé!');toast('Chạm trực tiếp vào một quân cờ! ♟️')};
function updateStars(){document.querySelector('#stars').textContent=JSON.parse(localStorage.getItem('chessKingdomDone')||'[]').length}updateStars();
function toast(t){const e=document.querySelector('#toast');e.textContent=t;e.classList.remove('hidden');clearTimeout(window._tt);window._tt=setTimeout(()=>e.classList.add('hidden'),2100)}
function resize(){renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()}addEventListener('resize',resize);resize();
function ease(t){return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2}
function animate(){requestAnimationFrame(animate);if(anim){anim.t=Math.min(1,anim.t+.025);const e=ease(anim.t);if(anim.obj){anim.obj.position.lerpVectors(anim.from,anim.to,e);anim.obj.position.y+=Math.sin(e*Math.PI)*1.4}else{camera.position.lerpVectors(anim.from,anim.to,e);if(anim.targetTo)controls.target.lerpVectors(anim.targetFrom,anim.targetTo,e)}if(anim.t>=1){const d=anim.done;anim=null;d?.()}}controls.update();renderer.render(scene,camera)}animate();
if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js');
