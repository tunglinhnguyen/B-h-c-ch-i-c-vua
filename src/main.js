import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Chess } from 'chess.js';

const canvas=document.querySelector('#world'),welcome=document.querySelector('#welcome'),coach=document.querySelector('#coach'),turnEl=document.querySelector('#turn'),playerBanner=document.querySelector('#playerBanner'),playerLabel=document.querySelector('#playerLabel');let playerName=localStorage.getItem('chessKidName')||'',playerSide=localStorage.getItem('chessKidSide')||'w',vsCpu=true;
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
/* fantasy kingdom background */
const world=new THREE.Group();scene.add(world);
function tree(x,z,scale=1){const g=new THREE.Group();g.position.set(x,0,z);g.scale.setScalar(scale);box(g,0,.45,0,.28,.9,.28,0x76513c);const crown=new THREE.Mesh(new THREE.ConeGeometry(.72,1.75,7),mat(0x3f9857));crown.position.y=1.65;crown.castShadow=true;g.add(crown);world.add(g)}
for(let i=0;i<34;i++){const a=i/34*Math.PI*2,r=13.1+(i%4)*.62;tree(Math.cos(a)*r,Math.sin(a)*r,.8+(i%3)*.12)}
function tower(x,z,c){const g=new THREE.Group();g.position.set(x,0,z);box(g,0,.8,0,2.2,1.6,2.2,c);box(g,0,1.9,0,1.35,1.0,1.35,0xffe4a3);const roof=new THREE.Mesh(new THREE.ConeGeometry(1.2,1.55,4),mat(c));roof.position.y=3.05;roof.rotation.y=Math.PI/4;roof.castShadow=true;g.add(roof);for(const xx of[-.65,.65])for(const zz of[-.65,.65])cyl(g,xx,1.65,zz,.18,.35,0xffd35b);world.add(g)}
tower(-11,-8,0xe96d5c);tower(11,-8,0x58b88a);tower(-11,8,0x9b77d3);tower(11,8,0x56b8ea);
const cloudMat=new THREE.MeshStandardMaterial({color:0xffffff,transparent:true,opacity:.78,roughness:1});
for(let i=0;i<7;i++){const g=new THREE.Group();for(const [x,y,z,r] of[[0,0,0,.8],[.7,.05,0,.6],[-.65,.02,0,.55],[.2,.35,0,.62]]){const m=new THREE.Mesh(new THREE.SphereGeometry(r,10,8),cloudMat);m.position.set(x,y,z);g.add(m)}g.position.set(-15+i*5,8+(i%2),-14-(i%3)*2);g.userData.cloud=true;world.add(g)}
const flags=[];for(const [x,z,c] of[[-7,-11,0xffd34d],[7,-11,0xef78ad],[-13,0,0x56b8ea],[13,0,0xf0a64b]]){const g=new THREE.Group();g.position.set(x,0,z);cyl(g,0,1.5,0,.06,3,0x6f4b2f);const flag=box(g,.45,2.55,0,.85,.48,.08,c);flag.geometry.translate(.42,0,0);flags.push(flag);world.add(g)}

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
function captureSkill(attacker,victim,done){const a=attacker.userData.type,color=accent[a],at=victim.position.clone(),skill={p:['Tốt đột kích! 💥',18,.12],r:['Xe công thành! 🧱',32,.2],n:['Mã thiên mã! ⚡',28,.24],b:['Tượng quang tuyến! ✨',30,.18],q:['Hậu bão phép! 🌟',46,.27],k:['Vua phán quyết! 👑',38,.2]}[a];toast(skill[0]);say(skill[0]);ring(at,color);particles(at,color,skill[1],skill[2]);if(a==='r'){for(let i=0;i<3;i++)setTimeout(()=>ring(at,color),i*110)}if(a==='n'){attacker.rotation.z=.25;attacker.position.y+=.5}if(a==='b'){particles(attacker.position.clone(),0xffffff,18,.16)}if(a==='q'){ring(attacker.position.clone(),0xffd34d);particles(at,0xffd34d,28,.22)}if(a==='k'){ring(at,0xffffff);ring(attacker.position.clone(),color)}victim.userData.defeated=1;attacker.userData.attack=1;setTimeout(done,a==='q'?760:600)}
function defeatTick(p,dt){if(!p.userData.defeated)return;p.rotation.z+=dt*8;p.scale.multiplyScalar(.94);p.position.y-=.012}
function skillTick(p,t){if(p.userData.pulse){p.userData.pulse*=.91;const s=.78*(1+Math.sin(t*18)*.08*p.userData.pulse);p.scale.setScalar(s)}if(p.userData.attack){p.userData.attack*=.9;p.rotation.y+=.22*p.userData.attack}}

let selected=null,legal=[],busy=false;
function clearHighlights(){squares.forEach(q=>{q.material.emissive.setHex(0);q.material.emissiveIntensity=0;q.scale.y=1})}
function highlight(moves){clearHighlights();moves.forEach(m=>{const q=squares.find(x=>x.userData.square===m.to);q.material.emissive.setHex(m.captured?0xff1744:0xffdf32);q.material.emissiveIntensity=m.captured?1.15:1.0;q.scale.y=1.32;ring(q.position.clone(),m.captured?0xff3155:0xffe45b)})}
function choosePiece(p){
 if(busy)return;if(vsCpu&&p.userData.color!==playerSide){toast('🤖 Đây là quân của máy');say('Đây là quân của máy. Con hãy chọn quân của mình nhé.');return}if(p.userData.color!==game.turn()){const side=game.turn()==='w'?'Trắng':'Đen';toast('⏳ Chưa đến lượt quân này');coach.textContent='Bây giờ là lượt '+side+'. Con hãy chọn quân '+side+'.';say('Chưa đến lượt quân này. Con hãy chọn quân '+side+'.');return;}
 selected=p;legal=game.moves({square:p.userData.square,verbose:true});selectSkill(p);
 const n={p:'Tốt',r:'Xe',n:'Mã',b:'Tượng',q:'Hậu',k:'Vua'}[p.userData.type];
 if(!legal.length){clearHighlights();coach.textContent='Quân '+n+' hiện chưa có nước đi hợp lệ. Có thể đang bị quân khác chặn hoặc đi sẽ làm Vua bị chiếu.';toast('🚫 '+n+' chưa thể di chuyển!');say('Quân '+n+' hiện chưa có nước đi hợp lệ. Con hãy chọn một quân khác nhé.');selected=null;return}
 highlight(legal);const captures=legal.filter(m=>m.captured).length;
 coach.textContent='Đã chọn '+n+'. Có '+legal.length+' ô có thể đi'+(captures?' và '+captures+' nước có thể bắt quân.':'.')+' Ô vàng là nước đi, ô đỏ là bắt quân.';
 say('Đây là quân '+n+'. Con có '+legal.length+' nước đi hợp lệ. Hãy chọn một ô đang sáng.')
}
function moveTo(square){
 if(!selected||busy)return;const m=legal.find(x=>x.to===square);if(!m)return;
 busy=true;const attacker=selected,victim=pieceMap.get(square),from=attacker.position.clone(),to=pos(square);
 const execute=()=>{const move=game.move({from:m.from,to:m.to,promotion:'q'});animateMove(attacker,from,to,()=>{rebuildPieces();selected=null;legal=[];clearHighlights();busy=false;turnEl.textContent=game.turn()==='w'?'Lượt Trắng':'Lượt Đen';if(move.captured){toast('Bắt quân thành công! ✨');say('Tuyệt lắm! Con đã bắt được quân đối phương.')}else say('Nước đi hợp lệ. Giỏi lắm!');if(game.isCheckmate()){toast('Chiếu hết! 👑');say('Chiếu hết! Ván cờ kết thúc.')}else if(game.inCheck()){toast('Chiếu! ⚡');say('Chiếu! Vua đang bị tấn công.')}if(vsCpu&&game.turn()!==playerSide&&!game.isGameOver())setTimeout(cpuMove,650);})};
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
document.querySelectorAll('.side').forEach(b=>b.onclick=()=>{document.querySelectorAll('.side').forEach(x=>x.classList.remove('active'));b.classList.add('active');playerSide=b.dataset.side});
const saved=document.querySelector('#playerName');saved.value=playerName;document.querySelectorAll('.side').forEach(b=>b.classList.toggle('active',b.dataset.side===playerSide));
function addNameFlag(){const old=world.getObjectByName('kidFlag');if(old)world.remove(old);const g=new THREE.Group();g.name='kidFlag';const z=playerSide==='w'?7.2:-7.2;cyl(g,-6,1.5,z,.07,3.2,0x6f4b2f);const cv=document.createElement('canvas');cv.width=512;cv.height=160;const x=cv.getContext('2d');x.fillStyle=playerSide==='w'?'#ffe27a':'#465675';x.fillRect(0,0,512,160);x.fillStyle=playerSide==='w'?'#26354d':'#fff';x.font='bold 54px sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(playerName,256,80);const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cv)}));sp.position.set(-4.3,2.55,z);sp.scale.set(3.2,1,1);g.add(sp);world.add(g)}
function cpuMove(){if(!vsCpu||game.turn()===playerSide||game.isGameOver()||busy)return;busy=true;const moves=game.moves({verbose:true});if(!moves.length){busy=false;return}const captures=moves.filter(m=>m.captured),pool=captures.length?captures:moves,m=pool[Math.floor(Math.random()*pool.length)],attacker=pieceMap.get(m.from),victim=pieceMap.get(m.to),from=attacker.position.clone(),to=pos(m.to);const go=()=>{game.move({from:m.from,to:m.to,promotion:'q'});animateMove(attacker,from,to,()=>{rebuildPieces();clearHighlights();selected=null;legal=[];busy=false;turnEl.textContent=game.turn()==='w'?'Lượt Trắng':'Lượt Đen';coach.textContent=playerName+' ơi, đến lượt con rồi!';say(playerName+' ơi, đến lượt con rồi!')})};if(victim)captureSkill(attacker,victim,go);else go()}
document.querySelector('#startBtn').onclick=()=>{playerName=(saved.value||'Nhà thám hiểm').trim().slice(0,18);vsCpu=document.querySelector('#vsCpu').checked;localStorage.setItem('chessKidName',playerName);localStorage.setItem('chessKidSide',playerSide);music();welcome.classList.add('hidden');coach.classList.remove('hidden');playerBanner.classList.remove('hidden');playerLabel.textContent='Vương quốc của '+playerName+' • '+(playerSide==='w'?'Trắng':'Đen');addNameFlag();say('Chào '+playerName+' đến với Vương quốc Cờ vua. Đây là đội quân của con.');if(vsCpu&&game.turn()!==playerSide)setTimeout(cpuMove,800)};

function resize(){renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()}addEventListener('resize',resize);resize();
let last=performance.now(),time=0;function animate(now){requestAnimationFrame(animate);const dt=Math.min(.04,(now-last)/1000);last=now;time+=dt;if(mover){mover.t=Math.min(1,mover.t+dt*2.5);const e=1-Math.pow(1-mover.t,3);mover.obj.position.lerpVectors(mover.from,mover.to,e);mover.obj.position.y=.2+Math.sin(e*Math.PI)*.8;if(mover.t>=1){const d=mover.done;mover=null;d()}}pieceMap.forEach(p=>{defeatTick(p,dt);skillTick(p,time)});world.children.forEach((o,i)=>{if(o.userData.cloud)o.position.x+=dt*(.18+i*.003)});flags.forEach((f,i)=>f.rotation.y=Math.sin(time*2+i)*.16);for(let i=effects.length-1;i>=0;i--){const e=effects[i];e.life-=dt*(e.ring?1.8:1.4);if(e.ring){e.m.scale.addScalar(dt*2.2);e.m.material.opacity=e.life}else{e.v.y-=dt*.18;e.m.position.add(e.v);e.m.rotation.x+=.12;e.m.rotation.y+=.1}if(e.life<=0){scene.remove(e.m);effects.splice(i,1)}}controls.update();renderer.render(scene,camera)}requestAnimationFrame(animate);
if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js');
