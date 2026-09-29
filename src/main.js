import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Chess } from 'chess.js';

const canvas=document.querySelector('#world'),welcome=document.querySelector('#welcome'),coach=document.querySelector('#coach'),turnEl=document.querySelector('#turn');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.shadowMap.enabled=true;renderer.outputColorSpace=THREE.SRGBColorSpace;
const scene=new THREE.Scene();scene.background=new THREE.Color(0x8fd1ff);scene.fog=new THREE.Fog(0x8fd1ff,34,78);
const camera=new THREE.PerspectiveCamera(46,1,.1,120);camera.position.set(14,15,17);
const controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.target.set(0,0,0);controls.minDistance=8;controls.maxDistance=29;controls.maxPolarAngle=Math.PI*.48;
scene.add(new THREE.HemisphereLight(0xf4fbff,0x607f42,2.5));const sun=new THREE.DirectionalLight(0xffffff,3.2);sun.position.set(-10,18,10);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);scene.add(sun);
const mat=c=>new THREE.MeshStandardMaterial({color:c,roughness:.67,metalness:.02});
function box(p,x,y,z,sx,sy,sz,c){const o=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),mat(c));o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;p.add(o);return o}
function cyl(p,x,y,z,r,h,c,n=12){const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,n),mat(c));o.position.set(x,y,z);o.castShadow=true;p.add(o);return o}
const ground=new THREE.Mesh(new THREE.CylinderGeometry(16.5,17.5,1,48),mat(0x82c965));ground.position.y=-.72;ground.receiveShadow=true;scene.add(ground);

const CELL=1.34,boardG=new THREE.Group();scene.add(boardG);box(boardG,0,-.14,0,CELL*8+.75,.35,CELL*8+.75,0x60402d);
const squares=[],squareMeshes=[];
function sqName(r,c){return 'abcdefgh'[c]+(8-r)}
for(let r=0;r<8;r++)for(let c=0;c<8;c++){const q=box(boardG,(c-3.5)*CELL,.07,(r-3.5)*CELL,CELL-.035,.18,CELL-.035,(r+c)%2?0x739f60:0xf0d5a1);q.userData={square:sqName(r,c)};squares.push(q);squareMeshes.push(q)}

const C={w:0xf5e6b8,b:0x33425e},accent={p:0x4bb8e9,r:0xe75e55,n:0xf0a23d,b:0x9b70d0,q:0xea70aa,k:0x4b80dc};
function makePiece(type,color){
 const g=new THREE.Group(),base=C[color],a=accent[type],B=(x,y,z,sx,sy,sz,c=base)=>box(g,x,y,z,sx,sy,sz,c),S=(x,y,z,r=.17,c=a)=>cyl(g,x,y,z,r,.14,c);
 B(0,.16,0,.78,.32,.78);for(const x of[-.2,.2])for(const z of[-.2,.2])S(x,.39,z,.17,base);
 if(type==='p'){B(0,.61,0,.46,.55,.46);B(0,.96,0,.58,.18,.58,a);cyl(g,0,1.22,0,.29,.42,base,16)}
 if(type==='r'){B(0,.65,0,.57,.7,.57);B(0,1.05,0,.76,.18,.76,a);for(const x of[-.26,.26])for(const z of[-.26,.26])B(x,1.3,z,.2,.3,.2)}
 if(type==='n'){B(0,.62,0,.5,.58,.5);B(.08,1,-.04,.5,.45,.46);B(.18,1.3,-.16,.44,.28,.62,a);B(.22,1.48,-.38,.35,.2,.3);S(.24,1.5,-.52,.065,0x111827)}
 if(type==='b'){B(0,.63,0,.47,.58,.47);B(0,1.02,0,.62,.18,.62,a);const co=new THREE.Mesh(new THREE.ConeGeometry(.36,.72,8),mat(base));co.position.y=1.42;co.castShadow=true;g.add(co);S(0,1.81,0,.15,a)}
 if(type==='q'){B(0,.64,0,.5,.62,.5);B(0,1.05,0,.68,.2,.68,a);for(const [x,z] of[[-.25,-.25],[.25,-.25],[-.25,.25],[.25,.25],[0,0]])S(x,1.4,z,.14,base)}
 if(type==='k'){B(0,.66,0,.52,.68,.52);B(0,1.08,0,.7,.2,.7,a);B(0,1.47,0,.17,.62,.17);B(0,1.6,0,.54,.14,.15,a)}
 g.scale.setScalar(.78);return g
}
const game=new Chess(),pieceMap=new Map(),pieceHits=[];
function pos(square){const c='abcdefgh'.indexOf(square[0]),r=8-Number(square[1]);return new THREE.Vector3((c-3.5)*CELL,.2,(r-3.5)*CELL)}
function rebuildPieces(){
 pieceMap.forEach(p=>boardG.remove(p));pieceMap.clear();pieceHits.length=0;
 for(let r=0;r<8;r++)for(let c=0;c<8;c++){const d=game.board()[r][c];if(!d)continue;const s=sqName(r,c),p=makePiece(d.type,d.color);p.position.copy(pos(s));p.userData={square:s,type:d.type,color:d.color};p.traverse(o=>{if(o.isMesh){o.userData.root=p;pieceHits.push(o)}});boardG.add(p);pieceMap.set(s,p)}
}
rebuildPieces();

/* particles / skill VFX */
const effects=[];
function particles(at,color,count=18,speed=.12){const arr=[];for(let i=0;i<count;i++){const m=new THREE.Mesh(new THREE.BoxGeometry(.12,.12,.12),mat(color));m.position.copy(at);m.position.y+=.8;scene.add(m);arr.push({m,v:new THREE.Vector3((Math.random()-.5)*speed,(.3+Math.random())*speed,(Math.random()-.5)*speed),life:1})}effects.push(...arr)}
function ring(at,color){const m=new THREE.Mesh(new THREE.TorusGeometry(.65,.08,8,32),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.9}));m.rotation.x=Math.PI/2;m.position.copy(at);m.position.y=.3;scene.add(m);effects.push({m,ring:true,life:1})}
function selectSkill(p){const names={p:'Tốt xung phong!',r:'Xe mở đường!',n:'Mã nhảy!',b:'Tượng khai tuyến!',q:'Hậu quyền năng!',k:'Vua chỉ huy!'};ring(p.position.clone(),accent[p.userData.type]);particles(p.position.clone(),accent[p.userData.type],10,.06);toast(names[p.userData.type]);p.userData.pulse=1}
function captureSkill(attacker,victim,done){const a=attacker.userData.type;const color=accent[a];ring(victim.position.clone(),color);particles(victim.position.clone(),color,a==='q'?34:24,a==='n'?.17:.13);victim.userData.defeated=1;attacker.userData.attack=1;setTimeout(done,520)}
function defeatTick(p,dt){if(!p.userData.defeated)return;p.rotation.z+=dt*8;p.scale.multiplyScalar(.94);p.position.y-=.012}
function skillTick(p,t){if(p.userData.pulse){p.userData.pulse*=.91;const s=.78*(1+Math.sin(t*18)*.08*p.userData.pulse);p.scale.setScalar(s)}if(p.userData.attack){p.userData.attack*=.9;p.rotation.y+=.22*p.userData.attack}}

let selected=null,legal=[],busy=false;
function clearHighlights(){squares.forEach(q=>{q.material.emissive.setHex(0);q.material.emissiveIntensity=0;q.scale.y=1})}
function highlight(moves){clearHighlights();moves.forEach(m=>{const q=squares.find(x=>x.userData.square===m.to);q.material.emissive.setHex(m.captured?0x9d1028:0x7a6500);q.material.emissiveIntensity=m.captured?.9:.7;q.scale.y=1.18})}
function choosePiece(p){
 if(busy||p.userData.color!==game.turn())return;
 selected=p;legal=game.moves({square:p.userData.square,verbose:true});selectSkill(p);highlight(legal);
 const n={p:'Tốt',r:'Xe',n:'Mã',b:'Tượng',q:'Hậu',k:'Vua'}[p.userData.type];
 coach.textContent='Đã chọn '+n+'. Ô vàng: nước đi. Ô đỏ: có thể bắt quân đối phương.';say('Đây là quân '+n+'. Con hãy chọn một ô đang sáng.')
}
function moveTo(square){
 if(!selected||busy)return;const m=legal.find(x=>x.to===square);if(!m)return;
 busy=true;const attacker=selected,victim=pieceMap.get(square),from=attacker.position.clone(),to=pos(square);
 const execute=()=>{const move=game.move({from:m.from,to:m.to,promotion:'q'});animateMove(attacker,from,to,()=>{rebuildPieces();selected=null;legal=[];clearHighlights();busy=false;turnEl.textContent=game.turn()==='w'?'Lượt Trắng':'Lượt Đen';if(move.captured){toast('Bắt quân thành công! ✨');say('Tuyệt lắm! Con đã bắt được quân đối phương.')}else say('Nước đi hợp lệ. Giỏi lắm!');if(game.isCheckmate()){toast('Chiếu hết! 👑');say('Chiếu hết! Ván cờ kết thúc.')}else if(game.inCheck()){toast('Chiếu! ⚡');say('Chiếu! Vua đang bị tấn công.')}})};
 if(victim&&victim.userData.color!==attacker.userData.color)captureSkill(attacker,victim,execute);else execute()
}
let mover=null;function animateMove(obj,from,to,done){mover={obj,from,to,t:0,done}}
const ray=new THREE.Raycaster(),mouse=new THREE.Vector2();let down={};
canvas.addEventListener('pointerdown',e=>down={x:e.clientX,y:e.clientY});
canvas.addEventListener('pointerup',e=>{if(Math.hypot(e.clientX-down.x,e.clientY-down.y)>10)return;const r=canvas.getBoundingClientRect();mouse.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(mouse,camera);const ph=ray.intersectObjects(pieceHits,false)[0];if(ph){const p=ph.object.userData.root;if(selected&&p.userData.color!==selected.userData.color&&legal.some(m=>m.to===p.userData.square))return moveTo(p.userData.square);return choosePiece(p)}const sh=ray.intersectObjects(squareMeshes,false)[0];if(sh)moveTo(sh.object.userData.square)});

let audioCtx,musicTimer;
function music(){if(musicTimer)return;audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)();audioCtx.resume();const ns=[261.6,329.6,392,523.3,440,392,329.6,293.7];let i=0;musicTimer=setInterval(()=>{const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='triangle';o.frequency.value=ns[i++%ns.length];g.gain.setValueAtTime(.0001,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(.022,audioCtx.currentTime+.03);g.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+.38);o.connect(g).connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+.4)},500)}
function say(t){if(!('speechSynthesis'in window))return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang='vi-VN';u.rate=.9;u.pitch=1.08;const v=speechSynthesis.getVoices().find(v=>v.lang?.toLowerCase().startsWith('vi'));if(v)u.voice=v;speechSynthesis.speak(u)}
function toast(t){const e=document.querySelector('#toast');e.textContent=t;e.classList.remove('hidden');clearTimeout(window._tt);window._tt=setTimeout(()=>e.classList.add('hidden'),1800)}
document.querySelector('#startBtn').onclick=()=>{music();welcome.classList.add('hidden');coach.classList.remove('hidden');say('Chào con đến với đấu trường cờ vua. Trên bàn có đủ hai đội Trắng và Đen. Con hãy chạm một quân Trắng để xem những nước đi hợp lệ.')};

function resize(){renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()}addEventListener('resize',resize);resize();
let last=performance.now(),time=0;function animate(now){requestAnimationFrame(animate);const dt=Math.min(.04,(now-last)/1000);last=now;time+=dt;if(mover){mover.t=Math.min(1,mover.t+dt*2.5);const e=1-Math.pow(1-mover.t,3);mover.obj.position.lerpVectors(mover.from,mover.to,e);mover.obj.position.y=.2+Math.sin(e*Math.PI)*.8;if(mover.t>=1){const d=mover.done;mover=null;d()}}pieceMap.forEach(p=>{defeatTick(p,dt);skillTick(p,time)});for(let i=effects.length-1;i>=0;i--){const e=effects[i];e.life-=dt*(e.ring?1.8:1.4);if(e.ring){e.m.scale.addScalar(dt*2.2);e.m.material.opacity=e.life}else{e.v.y-=dt*.18;e.m.position.add(e.v);e.m.rotation.x+=.12;e.m.rotation.y+=.1}if(e.life<=0){scene.remove(e.m);effects.splice(i,1)}}controls.update();renderer.render(scene,camera)}requestAnimationFrame(animate);
if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js');
