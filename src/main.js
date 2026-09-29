import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const canvas=document.querySelector('#world');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.shadowMap.enabled=true;renderer.outputColorSpace=THREE.SRGBColorSpace;
const scene=new THREE.Scene();scene.background=new THREE.Color(0x87c7ff);scene.fog=new THREE.Fog(0x87c7ff,30,72);
const camera=new THREE.PerspectiveCamera(48,1,.1,120);camera.position.set(15,15,19);
const controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.target.set(0,0,0);controls.minDistance=10;controls.maxDistance=31;controls.maxPolarAngle=Math.PI*.48;
scene.add(new THREE.HemisphereLight(0xeaf8ff,0x6c914b,2.4));
const sun=new THREE.DirectionalLight(0xffffff,3);sun.position.set(-10,18,12);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);scene.add(sun);
const mat=c=>new THREE.MeshStandardMaterial({color:c,roughness:.72});
function block(x,y,z,sx,sy,sz,c,parent=scene){const m=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),mat(c));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
function stud(x,y,z,c,parent){const s=new THREE.Mesh(new THREE.CylinderGeometry(.22,.22,.14,12),mat(c));s.position.set(x,y,z);s.castShadow=true;parent.add(s);return s}
const ground=new THREE.Mesh(new THREE.CylinderGeometry(16,17,1,48),mat(0x8bcf68));ground.position.y=-.65;ground.receiveShadow=true;scene.add(ground);

/* Bàn cờ khổng lồ ở trung tâm vương quốc */
const giantBoard=new THREE.Group();scene.add(giantBoard);
const S=1.18, boardY=.05;
block(0,-.05,0,S*8+.65,.35,S*8+.65,0x704b32,giantBoard);
for(let r=0;r<8;r++)for(let c=0;c<8;c++){const x=(c-3.5)*S,z=(r-3.5)*S;block(x,boardY,z,S-.035,.18,S-.035,(r+c)%2?0x7fb36a:0xf2d8a5,giantBoard)}
function brickPiece(kind,color=0xffdf55){
 const g=new THREE.Group(), dark=kind==='king'?0x4e7bd8:color;
 const cube=(x,y,z,sx,sy,sz,c=dark)=>block(x,y,z,sx,sy,sz,c,g);
 const dot=(x,y,z,c=dark)=>stud(x,y,z,c,g);
 cube(0,.22,0,.82,.38,.82);dot(-.2,.48,-.2);dot(.2,.48,-.2);dot(-.2,.48,.2);dot(.2,.48,.2);
 if(kind==='pawn'){cube(0,.72,0,.5,.55,.5);const h=new THREE.Mesh(new THREE.SphereGeometry(.34,12,10),mat(dark));h.position.y=1.22;h.castShadow=true;g.add(h)}
 if(kind==='rook'){cube(0,.82,0,.62,.85,.62);for(const x of[-.23,.23])for(const z of[-.23,.23])cube(x,1.34,z,.2,.25,.2)}
 if(kind==='knight'){cube(0,.75,0,.5,.65,.5);cube(.12,1.18,-.08,.5,.55,.42);cube(.22,1.5,-.18,.42,.25,.55);dot(.32,1.66,-.38)}
 if(kind==='bishop'){cube(0,.78,0,.48,.72,.48);const cone=new THREE.Mesh(new THREE.ConeGeometry(.38,.72,8),mat(dark));cone.position.y=1.48;cone.castShadow=true;g.add(cone);dot(0,1.9,0)}
 if(kind==='queen'){cube(0,.8,0,.5,.75,.5);cube(0,1.28,0,.7,.25,.7);for(const a of[-.25,0,.25])dot(a,1.57,0);dot(0,1.57,.25)}
 if(kind==='king'){cube(0,.82,0,.54,.8,.54);cube(0,1.32,0,.68,.22,.68);cube(0,1.68,0,.18,.62,.18);cube(0,1.82,0,.55,.16,.16)}
 return g;
}
const pieceColors={pawn:0x56b7e9,rook:0xe86d5c,knight:0xf0a64b,bishop:0x9b77d3,queen:0xef78ad,king:0x4e87d8};
const showcase=[];
[['rook',0],['knight',1],['bishop',2],['queen',3],['king',4],['bishop',5],['knight',6],['rook',7]].forEach(([k,c])=>{const p=brickPiece(k,pieceColors[k]);p.position.set((c-3.5)*S,.22,3.5*S);p.scale.set(.72,.72,.72);giantBoard.add(p);showcase.push(p)});
for(let c=0;c<8;c++){const p=brickPiece('pawn',pieceColors.pawn);p.position.set((c-3.5)*S,.22,2.5*S);p.scale.set(.62,.62,.62);giantBoard.add(p);showcase.push(p)}

/* Các khu học quanh bàn cờ */
const lessons=[
{id:'pawn',name:'Tốt',symbol:'♙',zone:'Cánh đồng Tốt',pos:[-10,0,-6],color:0x56b7e9,text:'Quân Tốt tiến thẳng một ô. Ở nước đầu tiên, Tốt có thể tiến hai ô. Khi ăn quân, Tốt ăn chéo.',from:[6,3],valid:[[5,3],[4,3]]},
{id:'rook',name:'Xe',symbol:'♖',zone:'Tháp Xe',pos:[10,0,-6],color:0xe86d5c,text:'Quân Xe đi theo đường thẳng, ngang hoặc dọc. Xe có thể đi nhiều ô nếu phía trước không có quân cản.',from:[4,3],valid:[[0,3],[1,3],[2,3],[3,3],[5,3],[6,3],[7,3],[4,0],[4,1],[4,2],[4,4],[4,5],[4,6],[4,7]]},
{id:'knight',name:'Mã',symbol:'♘',zone:'Chuồng Mã',pos:[-11,0,2],color:0xf0a64b,text:'Quân Mã đi hình chữ L. Mã đi hai ô theo một hướng rồi rẽ một ô sang bên. Mã có thể nhảy qua quân khác.',from:[4,3],valid:[[2,2],[2,4],[3,1],[3,5],[5,1],[5,5],[6,2],[6,4]]},
{id:'bishop',name:'Tượng',symbol:'♗',zone:'Đền Tượng',pos:[11,0,2],color:0x9b77d3,text:'Quân Tượng đi theo đường chéo. Tượng có thể đi nhiều ô nếu không có quân cản.',from:[4,3],valid:[[3,2],[2,1],[1,0],[3,4],[2,5],[1,6],[0,7],[5,2],[6,1],[7,0],[5,4],[6,5],[7,6]]},
{id:'queen',name:'Hậu',symbol:'♕',zone:'Cung điện Hậu',pos:[-9,0,9],color:0xef78ad,text:'Quân Hậu rất mạnh. Hậu đi ngang, đi dọc như Xe và đi chéo như Tượng.',from:[4,3],valid:[[4,0],[4,1],[4,2],[4,4],[4,5],[4,6],[4,7],[0,3],[1,3],[2,3],[3,3],[5,3],[6,3],[7,3],[3,2],[2,1],[1,0],[3,4],[2,5],[1,6],[0,7],[5,2],[6,1],[7,0],[5,4],[6,5],[7,6]]},
{id:'king',name:'Vua',symbol:'♔',zone:'Lâu đài Vua',pos:[9,0,9],color:0x58b88a,text:'Quân Vua đi một ô theo bất kỳ hướng nào. Con hãy luôn bảo vệ Vua nhé.',from:[4,3],valid:[[3,2],[3,3],[3,4],[4,2],[4,4],[5,2],[5,3],[5,4]]}
];
const clickable=[];
lessons.forEach(l=>{const g=new THREE.Group();g.position.set(...l.pos);scene.add(g);const base=block(0,.4,0,3,.8,3,l.color,g);base.userData.lesson=l;clickable.push(base);block(0,1.45,0,1.65,1.35,1.65,0xffe8ad,g);const roof=new THREE.Mesh(new THREE.ConeGeometry(1.4,1.6,4),mat(l.color));roof.position.y=2.95;roof.rotation.y=Math.PI/4;roof.castShadow=true;roof.userData.lesson=l;g.add(roof);clickable.push(roof);const p=brickPiece(l.id,l.color);p.position.set(0,.82,1.55);p.scale.set(.85,.85,.85);p.traverse(o=>{if(o.isMesh){o.userData.lesson=l;clickable.push(o)}});g.add(p)});

/* Âm thanh: nhạc nền tạo tại chỗ + lời thoại tiếng Việt, không cần file/server */
let audioCtx=null,musicTimer=null,musicOn=true;
function startMusic(){if(!musicOn||musicTimer)return;audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)();audioCtx.resume();const notes=[261.63,329.63,392,523.25,392,329.63,293.66,392];let i=0;musicTimer=setInterval(()=>{const o=audioCtx.createOscillator(),gain=audioCtx.createGain();o.type='triangle';o.frequency.value=notes[i++%notes.length];gain.gain.setValueAtTime(.0001,audioCtx.currentTime);gain.gain.exponentialRampToValueAtTime(.035,audioCtx.currentTime+.03);gain.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+.38);o.connect(gain).connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+.42)},480)}
function speak(t){if(!('speechSynthesis'in window))return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang='vi-VN';u.rate=.9;u.pitch=1.08;const vs=speechSynthesis.getVoices();u.voice=vs.find(v=>v.lang&&v.lang.toLowerCase().startsWith('vi'))||null;speechSynthesis.speak(u)}

const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();let down={x:0,y:0};
canvas.addEventListener('pointerdown',e=>down={x:e.clientX,y:e.clientY});
canvas.addEventListener('pointerup',e=>{if(Math.hypot(e.clientX-down.x,e.clientY-down.y)>12)return;const rect=canvas.getBoundingClientRect();pointer.x=((e.clientX-rect.left)/rect.width)*2-1;pointer.y=-((e.clientY-rect.top)/rect.height)*2+1;ray.setFromCamera(pointer,camera);const hit=ray.intersectObjects(clickable,false)[0];if(hit?.object.userData.lesson)openLesson(hit.object.userData.lesson)});

const welcome=document.querySelector('#welcome'),lessonEl=document.querySelector('#lesson');let current=null,success=false;
document.querySelector('#startBtn').onclick=()=>{startMusic();speak('Chào con đến với Vương quốc Cờ vua. Ở giữa vương quốc là bàn cờ khổng lồ. Con hãy xoay vương quốc và chạm vào một quân cờ để bắt đầu học nhé!');welcome.classList.add('hidden');toast('Chạm vào một khu để học nhé! 🏰')};
document.querySelector('#closeLesson').onclick=()=>{speechSynthesis?.cancel();lessonEl.classList.add('hidden');controls.enabled=true};
function openLesson(l){startMusic();current=l;success=false;welcome.classList.add('hidden');lessonEl.classList.remove('hidden');document.querySelector('#pieceBadge').textContent=l.symbol;document.querySelector('#lessonZone').textContent=l.zone.toUpperCase();document.querySelector('#lessonTitle').textContent='Học quân '+l.name;document.querySelector('#lessonText').textContent=l.text;document.querySelector('#hint').textContent='Chạm vào quân '+l.name+', sau đó chọn một ô sáng.';document.querySelector('#completeBtn').disabled=true;buildBoard(l);speak('Đây là quân '+l.name+'. '+l.text+' Bây giờ con chạm vào quân '+l.name+' trên bàn cờ nhé.');camera.position.set(10,15,13);controls.target.set(0,0,0)}
function buildBoard(l){const b=document.querySelector('#board');b.innerHTML='';for(let r=0;r<8;r++)for(let c=0;c<8;c++){const s=document.createElement('div');s.className='square '+((r+c)%2?'dark':'light');s.dataset.r=r;s.dataset.c=c;if(r===l.from[0]&&c===l.from[1]){s.textContent=l.symbol;s.classList.add('origin');s.onclick=()=>showMoves(l)}else s.onclick=()=>choose(r,c,l,s);b.appendChild(s)}}
function showMoves(l){document.querySelectorAll('.square').forEach(s=>{if(l.valid.some(v=>v[0]==s.dataset.r&&v[1]==s.dataset.c))s.classList.add('valid')});const t='Những chấm sáng là các ô quân '+l.name+' có thể đi tới. Con chọn thử một ô nhé.';document.querySelector('#hint').textContent=t;speak(t)}
function choose(r,c,l,s){if(!document.querySelector('.square.valid'))return;if(l.valid.some(v=>v[0]===r&&v[1]===c)){success=true;document.querySelectorAll('.square').forEach(q=>{if(q.textContent===l.symbol)q.textContent=''});s.textContent=l.symbol;s.classList.add('target-ok');document.querySelector('#hint').textContent='Chính xác! Con đã đi đúng quân '+l.name+'.';document.querySelector('#completeBtn').disabled=false;speak('Chính xác! Giỏi lắm! Con đã đi đúng quân '+l.name+'.');toast('Tuyệt lắm! ⭐')}else{speak('Chưa đúng rồi. Con thử một ô có chấm sáng nhé.');document.querySelector('#hint').textContent='Ô này chưa đúng. Con thử một ô có chấm sáng nhé!'}}
document.querySelector('#completeBtn').onclick=()=>{if(!current||!success)return;const done=new Set(JSON.parse(localStorage.getItem('chessKingdomDone')||'[]'));done.add(current.id);localStorage.setItem('chessKingdomDone',JSON.stringify([...done]));updateStars();lessonEl.classList.add('hidden');speak('Con nhận được một ngôi sao. Hãy khám phá quân cờ tiếp theo nhé!');toast('Nhận được 1 ngôi sao! ⭐')};
function updateStars(){document.querySelector('#stars').textContent=JSON.parse(localStorage.getItem('chessKingdomDone')||'[]').length}updateStars();
function toast(t){const el=document.querySelector('#toast');el.textContent=t;el.classList.remove('hidden');clearTimeout(window._tt);window._tt=setTimeout(()=>el.classList.add('hidden'),1800)}
function resize(){renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()}addEventListener('resize',resize);resize();
let time=0;function animate(){requestAnimationFrame(animate);time+=.01;showcase.forEach((p,i)=>p.rotation.y=Math.sin(time+i)*.025);controls.update();renderer.render(scene,camera)}animate();
if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js');
