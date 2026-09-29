import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Chess } from 'chess.js';

const canvas=document.querySelector('#world'),welcome=document.querySelector('#welcome'),coach=document.querySelector('#coach'),turnEl=document.querySelector('#turn'),playerBanner=document.querySelector('#playerBanner'),playerLabel=document.querySelector('#playerLabel'),missionCard=document.querySelector('#missionCard'),missionTitle=document.querySelector('#missionTitle'),missionText=document.querySelector('#missionText'),missionStars=document.querySelector('#missionStars'),progressBar=document.querySelector('#progressBar'),bricksEl=document.querySelector('#bricks');
let playerName=localStorage.getItem('chessKidName')||'',playerSide=localStorage.getItem('chessKidSide')||'w',vsCpu=true,gameMode='learn',cpuLevel='coach';
const progressState=JSON.parse(localStorage.getItem('chessKingdomProgress')||'{"lesson":0,"bricks":0,"wins":0,"mistakes":{}}');
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

progressState.battleCaptures=progressState.battleCaptures||0;progressState.wins=progressState.wins||0;
const castleLevels={w:Math.min(8,progressState.battleCaptures),b:0},castles={},castleLands={};
function buildCastle(side){
 const old=castles[side];if(old)world.remove(old);const oldLand=castleLands[side];if(oldLand)world.remove(oldLand);
 const g=new THREE.Group(),land=new THREE.Group();g.name='castle-'+side;land.name='castle-land-'+side;
 const z=side==='w'?11.4:-11.4,c=side==='w'?0xf0d58f:0x4b5b78,l=castleLevels[side],grow=Math.min(3.2,l*.34);
 const island=new THREE.Mesh(new THREE.CylinderGeometry(4.2+grow,4.55+grow,.42,32),mat(side==='w'?0x76c96a:0x6da66c));island.position.set(0,-.45,z);island.receiveShadow=true;land.add(island);
 if(l>=2){for(let i=0;i<Math.min(8,l+2);i++){const a=i/(l+2)*Math.PI*2,r=3.1+grow*.55;const tg=new THREE.Group();tg.position.set(Math.cos(a)*r,0,z+Math.sin(a)*r);box(tg,0,.25,0,.2,.5,.2,0x76513c);const crown=new THREE.Mesh(new THREE.ConeGeometry(.5,1.15,7),mat(0x3f9857));crown.position.y=1.05;tg.add(crown);land.add(tg)}}
 world.add(land);castleLands[side]=land;g.position.set(0,0,z);
 const brick=(x,y,z0,sx=.75,sy=.38,sz=.75,col=c)=>{const b=box(g,x,y,z0,sx,sy,sz,col);for(const dx of[-.22,.22])for(const dz of[-.22,.22])cyl(g,x+dx,y+sy/2+.06,z0+dz,.07,.12,col,10);return b};
 brick(0,.2,0,2.5,.4,.8,0x6f4b2f);
 const width=4+Math.min(3,l);for(let i=-width;i<=width;i++){if(Math.abs(i)>1)brick(i*.68,.22,0);if(l>=1)brick(i*.68,.60,0)}
 if(l>=2)for(const x of[-3.2-grow*.35,3.2+grow*.35])for(let y=0;y<Math.min(5,2+Math.floor(l/2));y++)brick(x,.25+y*.38,0,1,.38,1);
 if(l>=3){for(let y=0;y<Math.min(6,3+Math.floor(l/2));y++)for(let x=-1;x<=1;x++)brick(x*.72,.25+y*.38,.3);brick(0,1.55+Math.min(1,l*.12),.3,2.4,.35,1.2,accent.q)}
 if(l>=5){for(const x of[-3.2-grow*.35,3.2+grow*.35]){brick(x,1.55,0,1.25,.35,1.25,accent.k);for(const dx of[-.4,.4])for(const dz of[-.4,.4])brick(x+dx,1.92,dz,.25,.35,.25,accent.k)}}
 if(l>=7){brick(0,2.45,.3,1.4,.35,1.4,0xffd34d);brick(0,2.85,.3,.7,.45,.7,accent.q)}
 castles[side]=g;world.add(g)
}
function saveProgress(){localStorage.setItem('chessKingdomProgress',JSON.stringify(progressState));bricksEl.textContent=progressState.bricks}
function rewardBricks(n){progressState.bricks+=n;saveProgress();castleLevels[playerSide]=Math.min(4,Math.floor(progressState.bricks/8));buildCastle(playerSide);toast('🧱 +'+n+' khối xây thành!')}
function upgradeCastle(side){castleLevels[side]=Math.min(8,castleLevels[side]+1);buildCastle(side);if(gameMode==='battle'&&side===playerSide){progressState.battleCaptures++;progressState.bricks++;saveProgress();toast('🏰 Thành trì +1 cấp nhỏ • Vùng đất mở rộng!');say('Tuyệt vời '+playerName+'. Con bắt được một quân. Thành trì và vùng đất của con lớn thêm!')}else if(gameMode==='battle'){toast('⚔️ Thành đối thủ được nâng cấp')}}
buildCastle('w');buildCastle('b');

const CELL=1.34,boardG=new THREE.Group();scene.add(boardG);box(boardG,0,-.14,0,CELL*8+.75,.35,CELL*8+.75,0x60402d);
const squares=[],squareMeshes=[];
function sqName(r,c){return 'abcdefgh'[c]+(8-r)}
for(let r=0;r<8;r++)for(let c=0;c<8;c++){const q=box(boardG,(c-3.5)*CELL,.07,(r-3.5)*CELL,CELL-.035,.18,CELL-.035,(r+c)%2?0x739f60:0xf0d5a1);q.userData={square:sqName(r,c)};squares.push(q);squareMeshes.push(q)}

const C={w:0xf5e6b8,b:0x33425e},accent={p:0x4bb8e9,r:0xe75e55,n:0xf0a23d,b:0x9b70d0,q:0xea70aa,k:0x4b80dc};
function makePiece(type,color){
 const g=new THREE.Group(),base=C[color],a=accent[type],B=(x,y,z,sx,sy,sz,c=base)=>box(g,x,y,z,sx,sy,sz,c),S=(x,y,z,r=.17,c=base,h=.14,n=16)=>cyl(g,x,y,z,r,h,c,n);
 // stepped chess base made from toy bricks
 S(0,.10,0,.43,base,.20);S(0,.26,0,.35,a,.12);S(0,.38,0,.29,base,.14);
 if(type==='p'){S(0,.66,0,.19,base,.48);const h=new THREE.Mesh(new THREE.SphereGeometry(.27,14,10),mat(base));h.position.y=1.03;g.add(h)}
 if(type==='r'){S(0,.69,0,.25,base,.58);B(0,1.02,0,.62,.18,.62,a);for(const x of[-.22,.22])for(const z of[-.22,.22])B(x,1.22,z,.18,.28,.18,base)}
 if(type==='n'){S(0,.62,0,.23,base,.38);B(.04,.88,0,.36,.42,.34,base);B(.13,1.16,-.10,.36,.48,.32,base);B(.18,1.38,-.28,.34,.25,.48,a);B(.18,1.50,-.48,.30,.20,.24,base);S(.18,1.53,-.58,.045,0x111827,.08,8);B(-.08,1.52,-.13,.10,.25,.12,a)}
 if(type==='b'){S(0,.70,0,.20,base,.58);S(0,1.02,0,.29,a,.12);const h=new THREE.Mesh(new THREE.ConeGeometry(.29,.66,14),mat(base));h.position.y=1.37;g.add(h);const cut=B(.09,1.43,-.01,.08,.38,.5,a);cut.rotation.z=-.55}
 if(type==='q'){S(0,.72,0,.20,base,.62);S(0,1.06,0,.30,a,.12);const crown=new THREE.Group();g.add(crown);for(let i=0;i<6;i++){const an=i/6*Math.PI*2;const tip=S(Math.cos(an)*.22,1.40,Math.sin(an)*.22,.075,a,.28,10)}S(0,1.51,0,.10,base,.22)}
 if(type==='k'){S(0,.74,0,.21,base,.66);S(0,1.10,0,.31,a,.12);S(0,1.35,0,.16,base,.36);B(0,1.64,0,.10,.43,.10,a);B(0,1.70,0,.42,.10,.10,a)}
 g.scale.setScalar(.86);g.traverse(o=>{if(o.isMesh)o.castShadow=true});return g
}
const game=new Chess(),pieceMap=new Map(),pieceHits=[];
function pos(square){const c='abcdefgh'.indexOf(square[0]),r=8-Number(square[1]);return new THREE.Vector3((c-3.5)*CELL,.2,(r-3.5)*CELL)}
function rebuildPieces(){
 pieceMap.forEach(p=>boardG.remove(p));pieceMap.clear();pieceHits.length=0;
 for(let r=0;r<8;r++)for(let c=0;c<8;c++){const d=game.board()[r][c];if(!d)continue;const s=sqName(r,c),p=makePiece(d.type,d.color);p.position.copy(pos(s));p.userData={square:s,type:d.type,color:d.color};p.traverse(o=>{if(o.isMesh){o.userData.root=p;pieceHits.push(o)}});boardG.add(p);pieceMap.set(s,p)}
}
rebuildPieces();

const lessons=[
 {type:'p',title:'1. Tốt xung phong',text:'Đưa quân Tốt tiến lên. Tốt đi thẳng và chỉ ăn chéo.',fen:'4k3/8/8/8/8/8/4P3/4K3 w - - 0 1'},
 {type:'r',title:'2. Xe mở đường',text:'Dùng Xe đi theo hàng hoặc cột để bắt quân Tốt ở e6.',fen:'4k3/8/4p3/8/8/8/4R3/6K1 w - - 0 1',capture:true,target:'e6'},
 {type:'n',title:'3. Mã thiên mã',text:'Mã nhảy hình chữ L. Hãy bắt quân Tốt ở f4.',fen:'4k3/8/8/8/5p2/8/4N3/6K1 w - - 0 1',capture:true,target:'f4'},
 {type:'b',title:'4. Tượng quang tuyến',text:'Tượng đi chéo. Hãy bắt quân Tốt ở h7.',fen:'4k3/7p/8/8/8/3B4/8/6K1 w - - 0 1',capture:true,target:'h7'},
 {type:'q',title:'5. Hậu quyền năng',text:'Hậu đi ngang, dọc và chéo. Hãy đi chéo từ d3 đến h7 để bắt quân Tốt.',fen:'4k3/7p/8/8/8/3Q4/8/6K1 w - - 0 1',capture:true,target:'h7'},
 {type:'k',title:'6. Vua chỉ huy',text:'Vua chỉ đi một ô. Hãy đưa Vua đến một ô an toàn.',fen:'7k/8/8/8/8/8/4K3/8 w - - 0 1'},
 {type:'boss',title:'👑 BOSS: Cổng thành Bóng Tối',text:'Dùng Hậu chiếu hết Vua Bóng Tối trong 1 nước!',fen:'7k/5K2/8/8/8/8/6Q1/8 w - - 0 1',boss:true}
];
let lessonIndex=Math.min(progressState.lesson,lessons.length-1),missionActive=false,missionDone=false;
function lessonLoad(i){lessonIndex=i;const L=lessons[i];game.load(L.fen);selected=null;legal=[];busy=false;clearHighlights();rebuildPieces();missionActive=true;missionDone=false;missionCard.classList.remove('hidden');document.querySelector('#nextMission').classList.add('hidden');turnEl.textContent='Lượt học';missionTitle.textContent=L.title;missionText.textContent=L.text;missionStars.textContent=L.boss?'👑 BOSS':'☆☆☆';progressBar.style.width=(i/(lessons.length-1)*100)+'%';coach.textContent='Nhiệm vụ: '+L.text;say(L.title+'. '+L.text)}
function completeMission(move){if(!missionActive||missionDone)return false;const L=lessons[lessonIndex],typeOK=L.boss?move.piece==='q':move.piece===L.type,targetOK=!L.target||move.to===L.target,captureOK=!L.capture||!!move.captured,ok=L.boss?game.isCheckmate():(typeOK&&targetOK&&captureOK);if(!ok)return false;missionDone=true;missionActive=false;selected=null;legal=[];clearHighlights();turnEl.textContent='Hoàn thành ✓';missionStars.textContent='★★★';progressBar.style.width=((lessonIndex+1)/(lessons.length-1)*100)+'%';const reward=L.boss?8:3;rewardBricks(reward);progressState.lesson=Math.max(progressState.lesson,Math.min(lessons.length-1,lessonIndex+1));saveProgress();missionText.textContent=L.boss?'BOSS bị đánh bại! Vương quốc đã được bảo vệ.':'Hoàn thành! '+playerName+' đã đi đúng nước '+move.from+' → '+move.to+'.';coach.textContent='⭐ Chính xác! Bài học đã hoàn thành. Bấm “Nhiệm vụ tiếp theo” để học quân mới.';toast(L.boss?'🏆 THẮNG BOSS!':'⭐ Hoàn thành nhiệm vụ!');say('Xuất sắc '+playerName+'! Con đã hoàn thành nhiệm vụ.');if(lessonIndex<lessons.length-1)document.querySelector('#nextMission').classList.remove('hidden');return true}
document.querySelector('#nextMission').onclick=()=>lessonLoad(Math.min(lessons.length-1,lessonIndex+1));

/* particles / skill VFX */
const effects=[];
function particles(at,color,count=18,speed=.12){const arr=[];for(let i=0;i<count;i++){const m=new THREE.Mesh(new THREE.BoxGeometry(.12,.12,.12),mat(color));m.position.copy(at);m.position.y+=.8;scene.add(m);arr.push({m,v:new THREE.Vector3((Math.random()-.5)*speed,(.3+Math.random())*speed,(Math.random()-.5)*speed),life:1})}effects.push(...arr)}
function ring(at,color){const m=new THREE.Mesh(new THREE.TorusGeometry(.65,.08,8,32),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.9}));m.rotation.x=Math.PI/2;m.position.copy(at);m.position.y=.3;scene.add(m);effects.push({m,ring:true,life:1})}
function beam(from,to,color){const d=to.clone().sub(from),m=new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,d.length(),8),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.85}));m.position.copy(from).add(to).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.clone().normalize());scene.add(m);effects.push({m,beam:true,life:1})}
function selectSkill(p){const t=p.userData.type,a=accent[t],at=p.position.clone(),names={p:'Tốt: Khiên dũng sĩ!',r:'Xe: Pháo đài thức tỉnh!',n:'Mã: Thiên mã bật nhảy!',b:'Tượng: Đường chéo ánh sáng!',q:'Hậu: Vương miện ma pháp!',k:'Vua: Khiên hoàng gia!'};toast(names[t]);if(t==='p'){ring(at,0x65d8ff);p.userData.bob=1}else if(t==='r'){for(let i=0;i<3;i++)setTimeout(()=>ring(at,a),i*90);p.userData.stomp=1}else if(t==='n'){particles(at,0xffd34d,22,.13);p.userData.hop=1}else if(t==='b'){beam(at.clone().add(new THREE.Vector3(-1.5,.25,-1.5)),at.clone().add(new THREE.Vector3(1.5,.25,1.5)),a);beam(at.clone().add(new THREE.Vector3(-1.5,.25,1.5)),at.clone().add(new THREE.Vector3(1.5,.25,-1.5)),a)}else if(t==='q'){ring(at,a);ring(at,0xffd34d);particles(at,a,32,.16);p.userData.spin=1}else{ring(at,0xffffff);ring(at,a);p.userData.shield=1}p.userData.pulse=1}
function captureSkill(attacker,victim,done){const t=attacker.userData.type,a=accent[t],A=attacker.position.clone(),V=victim.position.clone(),names={p:'Tốt - Cú húc dũng cảm!',r:'Xe - Công thành chấn động!',n:'Mã - Thiên mã giáng xuống!',b:'Tượng - Quang tuyến chéo!',q:'Hậu - Bão vương miện!',k:'Vua - Phán quyết hoàng gia!'};toast(names[t]);say(names[t]);
 if(t==='p'){beam(A.clone().add(new THREE.Vector3(0,.45,0)),V.clone().add(new THREE.Vector3(0,.45,0)),a);particles(V,a,18,.12)}
 if(t==='r'){beam(A.clone().add(new THREE.Vector3(0,.25,0)),V.clone().add(new THREE.Vector3(0,.25,0)),a);for(let i=0;i<4;i++)setTimeout(()=>ring(V,a),i*80);particles(V,0xf4b55e,36,.20)}
 if(t==='n'){attacker.userData.hop=2;ring(V,0xffd34d);particles(V,a,34,.25)}
 if(t==='b'){beam(A.clone().add(new THREE.Vector3(0,.8,0)),V.clone().add(new THREE.Vector3(0,.8,0)),0xffffff);particles(V,a,30,.18)}
 if(t==='q'){for(let i=0;i<3;i++)setTimeout(()=>ring(V,i%2?a:0xffd34d),i*100);particles(V,a,52,.29);attacker.userData.spin=2}
 if(t==='k'){ring(attacker.position.clone(),0xffffff);beam(A.clone().add(new THREE.Vector3(0,1,0)),V.clone().add(new THREE.Vector3(0,1,0)),a);ring(V,a);particles(V,0xffffff,32,.18)}
 victim.userData.defeated=1;attacker.userData.attack=1;setTimeout(done,t==='q'?820:650)}
function defeatTick(p,dt){if(!p.userData.defeated)return;p.rotation.z+=dt*8;p.scale.multiplyScalar(.94);p.position.y-=.012}
function skillTick(p,t){if(p.userData.pulse){p.userData.pulse*=.91;const z=.86*(1+Math.sin(t*18)*.07*p.userData.pulse);p.scale.setScalar(z)}if(p.userData.attack){p.userData.attack*=.9;p.rotation.y+=.18*p.userData.attack}if(p.userData.hop){p.userData.hop*=.91;p.position.y=.2+Math.abs(Math.sin(t*10))*.65*p.userData.hop}if(p.userData.spin){p.userData.spin*=.93;p.rotation.y+=.28*p.userData.spin}if(p.userData.stomp){p.userData.stomp*=.9;p.scale.y=.86+Math.sin(t*22)*.12*p.userData.stomp}}

let selected=null,legal=[],busy=false;
function clearHighlights(){squares.forEach(q=>{q.material.emissive.setHex(0);q.material.emissiveIntensity=0;q.scale.y=1})}
function highlight(moves){clearHighlights();moves.forEach(m=>{const q=squares.find(x=>x.userData.square===m.to);q.material.emissive.setHex(m.captured?0xff1744:0xffdf32);q.material.emissiveIntensity=m.captured?1.15:1.0;q.scale.y=1.32;ring(q.position.clone(),m.captured?0xff3155:0xffe45b);if(selected){const a=selected.position.clone().add(new THREE.Vector3(0,.18,0)),b=q.position.clone().add(new THREE.Vector3(0,.25,0));if(selected.userData.type==='n'){const mid=a.clone().lerp(b,.5);mid.y+=1.15;beam(a,mid,accent.n);beam(mid,b,accent.n)}else beam(a,b,m.captured?0xff3155:accent[selected.userData.type])}})}
const gameOverEl=document.querySelector('#gameOver'),gameOverTitle=document.querySelector('#gameOverTitle'),gameOverText=document.querySelector('#gameOverText'),gameOverIcon=document.querySelector('#gameOverIcon');
function finishBattle(){
 if(gameMode!=='battle'||!game.isGameOver())return false;busy=true;selected=null;legal=[];clearHighlights();
 let title='Ván cờ kết thúc',icon='🤝',text='Hai bên hòa nhau.';
 if(game.isCheckmate()){const winner=game.turn()==='w'?'b':'w',won=winner===playerSide;title=won?'Chiến thắng!':'Máy chiến thắng';icon=won?'🏆':'🤖';text=won?playerName+' đã bảo vệ Vương quốc và nhận 5 khối xây thành!':'Một ván đấu rất hay. Thử lại để giành lại Vương quốc nhé!';if(won){progressState.wins++;progressState.bricks+=5;saveProgress();castleLevels[playerSide]=Math.min(8,castleLevels[playerSide]+1);buildCastle(playerSide)}}
 else if(game.isStalemate())text='Hòa do hết nước đi hợp lệ.';else if(game.isThreefoldRepetition())text='Hòa do lặp lại thế cờ.';else if(game.isInsufficientMaterial())text='Hòa do không đủ quân để chiếu hết.';else text='Ván cờ kết thúc với kết quả hòa.';
 turnEl.textContent='Kết thúc';coach.textContent=text;gameOverIcon.textContent=icon;gameOverTitle.textContent=title;gameOverText.textContent=text;gameOverEl.classList.remove('hidden');toast(title);say(title+'. '+text);return true
}
function choosePiece(p){
 if(gameMode==='battle'&&game.isGameOver()){finishBattle();return}if(gameMode==='learn'&&missionDone){toast('⭐ Bài này đã hoàn thành');coach.textContent='Bấm “Nhiệm vụ tiếp theo” để tiếp tục nhé.';return}if(busy)return;
 if(gameMode==='learn'){
   const L=lessons[lessonIndex];
   if(p.userData.color!==game.turn()){toast('🎓 Đây là quân minh họa');coach.textContent='Trong bài học này con chỉ điều khiển quân '+({p:'Tốt',r:'Xe',n:'Mã',b:'Tượng',q:'Hậu',k:'Vua',boss:'Hậu'}[L.type])+'.';return}
   if(L.type!=='boss'&&p.userData.type!==L.type){toast('🎯 Hãy chọn đúng quân đang học');coach.textContent='Nhiệm vụ này đang học quân '+({p:'Tốt',r:'Xe',n:'Mã',b:'Tượng',q:'Hậu',k:'Vua'}[L.type])+'. Con hãy chạm quân đó.';return}
   if(L.type==='boss'&&p.userData.type!=='q'){toast('👑 Hãy dùng quân Hậu');return}
 }else{
   if(vsCpu&&p.userData.color!==playerSide){toast('🤖 Đây là quân của máy');say('Đây là quân của máy. Con hãy chọn quân của mình nhé.');return}
   if(p.userData.color!==game.turn()){const side=game.turn()==='w'?'Trắng':'Đen';toast('⏳ Chưa đến lượt quân này');coach.textContent='Bây giờ là lượt '+side+'. Con hãy chọn quân '+side+'.';say('Chưa đến lượt quân này. Con hãy chọn quân '+side+'.');return}
 }
 selected=p;legal=game.moves({square:p.userData.square,verbose:true});selectSkill(p);
 const n={p:'Tốt',r:'Xe',n:'Mã',b:'Tượng',q:'Hậu',k:'Vua'}[p.userData.type];
 if(!legal.length){clearHighlights();coach.textContent='Quân '+n+' hiện chưa có nước đi hợp lệ. Có thể đang bị quân khác chặn hoặc đi sẽ làm Vua bị chiếu.';toast('🚫 '+n+' chưa thể di chuyển!');say('Quân '+n+' hiện chưa có nước đi hợp lệ. Con hãy chọn một quân khác nhé.');selected=null;return}
 highlight(legal);const captures=legal.filter(m=>m.captured).length;
 if(gameMode==='learn'&&lessons[lessonIndex].target){const target=lessons[lessonIndex].target;coach.textContent='Đã chọn '+n+'. Hãy tìm ô '+target+' màu đỏ để bắt mục tiêu.'}else coach.textContent='Đã chọn '+n+'. Có '+legal.length+' ô có thể đi'+(captures?' và '+captures+' nước có thể bắt quân.':'.')+' Ô vàng là nước đi, ô đỏ là bắt quân.';
 say('Đây là quân '+n+'. Con có '+legal.length+' nước đi hợp lệ. Hãy chọn một ô đang sáng.')
}
function moveTo(square){
 if(!selected||busy)return;const m=legal.find(x=>x.to===square);if(!m)return;
 busy=true;const attacker=selected,victim=pieceMap.get(square),from=attacker.position.clone(),to=pos(square);
 const execute=()=>{const move=game.move({from:m.from,to:m.to,promotion:'q'});animateMove(attacker,from,to,()=>{rebuildPieces();selected=null;legal=[];clearHighlights();busy=false;if(gameMode==='learn'){const completed=completeMission(move);if(completed)return;turnEl.textContent='Lượt học';setTimeout(()=>{toast('💡 Chưa đúng mục tiêu, thử lại nhé');lessonLoad(lessonIndex)},650);return}turnEl.textContent=game.turn()==='w'?'Lượt Trắng':'Lượt Đen';if(move.captured){upgradeCastle(move.color);toast('Bắt quân thành công! ✨');say('Tuyệt lắm! Con đã bắt được quân đối phương.')}else say('Nước đi hợp lệ. Giỏi lắm!');if(gameMode==='battle'&&finishBattle())return;if(game.inCheck()){toast('Chiếu! ⚡');say('Chiếu! Vua đang bị tấn công.')}if(gameMode==='battle'&&vsCpu&&game.turn()!==playerSide)setTimeout(cpuMove,650);})};
 if(victim&&victim.userData.color!==attacker.userData.color)captureSkill(attacker,victim,execute);else execute()
}
let mover=null;function animateMove(obj,from,to,done){mover={obj,from,to,t:0,done}}
const ray=new THREE.Raycaster(),mouse=new THREE.Vector2();let down={};
canvas.addEventListener('pointerdown',e=>down={x:e.clientX,y:e.clientY});
canvas.addEventListener('pointerup',e=>{if(Math.hypot(e.clientX-down.x,e.clientY-down.y)>10)return;const r=canvas.getBoundingClientRect();mouse.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(mouse,camera);const ph=ray.intersectObjects(pieceHits,false)[0];if(ph){const p=ph.object.userData.root;if(selected&&p.userData.color!==selected.userData.color&&legal.some(m=>m.to===p.userData.square))return moveTo(p.userData.square);return choosePiece(p)}const sh=ray.intersectObjects(squareMeshes,false)[0];if(sh){const target=sh.object.userData.square;if(selected&&!legal.some(m=>m.to===target)){const t=selected.userData.type,n={p:'Tốt chỉ tiến thẳng và ăn chéo.',r:'Xe chỉ đi ngang hoặc dọc.',n:'Mã phải nhảy hình chữ L.',b:'Tượng chỉ đi theo đường chéo.',q:'Hậu đi ngang, dọc hoặc chéo.',k:'Vua chỉ đi một ô và không được vào ô bị chiếu.'}[t];progressState.mistakes[t]=(progressState.mistakes[t]||0)+1;saveProgress();toast('💡 Thử lại nhé!');coach.textContent=n;say(n);return}moveTo(target)}});

let audioCtx,musicTimer;
function music(){if(musicTimer)return;audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)();audioCtx.resume();const ns=[261.6,329.6,392,523.3,440,392,329.6,293.7];let i=0;musicTimer=setInterval(()=>{const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='triangle';o.frequency.value=ns[i++%ns.length];g.gain.setValueAtTime(.0001,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(.022,audioCtx.currentTime+.03);g.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+.38);o.connect(g).connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+.4)},500)}
function say(t){if(!('speechSynthesis'in window))return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang='vi-VN';u.rate=.9;u.pitch=1.08;const v=speechSynthesis.getVoices().find(v=>v.lang?.toLowerCase().startsWith('vi'));if(v)u.voice=v;speechSynthesis.speak(u)}
function toast(t){const e=document.querySelector('#toast');e.textContent=t;e.classList.remove('hidden');clearTimeout(window._tt);window._tt=setTimeout(()=>e.classList.add('hidden'),1800)}
document.querySelectorAll('.side').forEach(b=>b.onclick=()=>{document.querySelectorAll('.side').forEach(x=>x.classList.remove('active'));b.classList.add('active');playerSide=b.dataset.side});
const saved=document.querySelector('#playerName');saved.value=playerName;document.querySelectorAll('.side').forEach(b=>b.classList.toggle('active',b.dataset.side===playerSide));
function addNameFlag(){const old=world.getObjectByName('kidFlag');if(old)world.remove(old);const g=new THREE.Group();g.name='kidFlag';const z=playerSide==='w'?7.2:-7.2;cyl(g,-6,1.5,z,.07,3.2,0x6f4b2f);const cv=document.createElement('canvas');cv.width=512;cv.height=160;const x=cv.getContext('2d');x.fillStyle=playerSide==='w'?'#ffe27a':'#465675';x.fillRect(0,0,512,160);x.fillStyle=playerSide==='w'?'#26354d':'#fff';x.font='bold 54px sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(playerName,256,80);const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cv)}));sp.position.set(-4.3,2.55,z);sp.scale.set(3.2,1,1);g.add(sp);world.add(g)}
function cpuMove(){if(!vsCpu||gameMode!=='battle'||game.turn()===playerSide||game.isGameOver()||busy)return;busy=true;const moves=game.moves({verbose:true});if(!moves.length){busy=false;return}const value={p:1,n:3,b:3,r:5,q:9,k:50};let pool=moves;if(cpuLevel==='coach'){const quiet=moves.filter(m=>!m.captured&&!m.san.includes('+'));pool=quiet.length?quiet:moves}else if(cpuLevel==='easy'){const captures=moves.filter(m=>m.captured);pool=Math.random()<.45&&captures.length?captures:moves}else{let best=-99;pool=[];for(const m of moves){const score=(m.captured?value[m.captured]:0)+(m.san.includes('+')?2:0);if(score>best){best=score;pool=[m]}else if(score===best)pool.push(m)}}const m=pool[Math.floor(Math.random()*pool.length)],attacker=pieceMap.get(m.from),victim=pieceMap.get(m.to),from=attacker.position.clone(),to=pos(m.to);const go=()=>{const cpuResult=game.move({from:m.from,to:m.to,promotion:'q'});if(cpuResult.captured)upgradeCastle(cpuResult.color);animateMove(attacker,from,to,()=>{rebuildPieces();clearHighlights();selected=null;legal=[];busy=false;turnEl.textContent=game.turn()==='w'?'Lượt Trắng':'Lượt Đen';if(finishBattle())return;coach.textContent=playerName+' ơi, đến lượt con rồi!';say(playerName+' ơi, đến lượt con rồi!')})};if(victim)captureSkill(attacker,victim,go);else go()}
const gameMenu=document.querySelector('#gameMenu'),menuPanel=document.querySelector('#menuPanel');
document.querySelector('#menuBtn').onclick=()=>menuPanel.classList.toggle('hidden');
function startLearn(){gameMode='learn';vsCpu=false;menuPanel.classList.add('hidden');missionCard.classList.remove('hidden');lessonLoad(Math.min(progressState.lesson,lessons.length-1));coach.classList.remove('hidden')}
function startBattle(){gameMode='battle';vsCpu=true;gameOverEl.classList.add('hidden');menuPanel.classList.add('hidden');missionActive=false;missionDone=false;missionCard.classList.add('hidden');selected=null;legal=[];busy=false;clearHighlights();game.reset();rebuildPieces();turnEl.textContent='Lượt Trắng';coach.textContent=playerName+' ơi, trận đấu với máy bắt đầu!';say('Trận đấu với máy bắt đầu.');if(game.turn()!==playerSide)setTimeout(cpuMove,650)}
document.querySelectorAll('#menuPanel [data-action]').forEach(b=>b.onclick=()=>{const a=b.dataset.action;if(a==='learn')startLearn();if(a==='battle')startBattle();if(a==='home'){gameOverEl.classList.add('hidden');menuPanel.classList.add('hidden');missionCard.classList.add('hidden');coach.classList.add('hidden');playerBanner.classList.add('hidden');gameMenu.classList.add('hidden');welcome.classList.remove('hidden')}if(a==='restart'){gameMode==='learn'?lessonLoad(lessonIndex):startBattle()}});
document.querySelector('#rematchBtn').onclick=()=>startBattle();
document.querySelector('#kingdomBtn').onclick=()=>{gameOverEl.classList.add('hidden');coach.textContent='Đây là thành trì '+playerName+' đã xây dựng. Mỗi quân bắt được làm thành và vùng đất lớn thêm.';camera.position.set(12,11,playerSide==='w'?18:-18);controls.target.set(0,1,playerSide==='w'?10:-10)};
document.querySelectorAll('.mode').forEach(b=>b.onclick=()=>{document.querySelectorAll('.mode').forEach(x=>x.classList.remove('active'));b.classList.add('active');gameMode=b.dataset.mode});
document.querySelector('#startBtn').onclick=()=>{playerName=(saved.value||'Nhà thám hiểm').trim().slice(0,18);cpuLevel=document.querySelector('#cpuLevel').value;vsCpu=gameMode==='battle';localStorage.setItem('chessKidName',playerName);localStorage.setItem('chessKidSide',playerSide);music();welcome.classList.add('hidden');coach.classList.remove('hidden');playerBanner.classList.remove('hidden');gameMenu.classList.remove('hidden');playerLabel.textContent='Vương quốc của '+playerName+' • '+(playerSide==='w'?'Trắng':'Đen');bricksEl.textContent=progressState.bricks;addNameFlag();if(gameMode==='learn'){startLearn()}else{startBattle()}};

function resize(){renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()}addEventListener('resize',resize);resize();
let last=performance.now(),time=0;function animate(now){requestAnimationFrame(animate);const dt=Math.min(.04,(now-last)/1000);last=now;time+=dt;if(mover){mover.t=Math.min(1,mover.t+dt*2.5);const e=1-Math.pow(1-mover.t,3);mover.obj.position.lerpVectors(mover.from,mover.to,e);mover.obj.position.y=.2+Math.sin(e*Math.PI)*.8;if(mover.t>=1){const d=mover.done;mover=null;d()}}pieceMap.forEach(p=>{defeatTick(p,dt);skillTick(p,time)});world.children.forEach((o,i)=>{if(o.userData.cloud)o.position.x+=dt*(.18+i*.003)});flags.forEach((f,i)=>f.rotation.y=Math.sin(time*2+i)*.16);for(let i=effects.length-1;i>=0;i--){const e=effects[i];e.life-=dt*(e.ring?1.8:1.4);if(e.ring){e.m.scale.addScalar(dt*2.2);e.m.material.opacity=e.life}else if(e.beam){e.m.material.opacity=e.life}else{e.v.y-=dt*.18;e.m.position.add(e.v);e.m.rotation.x+=.12;e.m.rotation.y+=.1}if(e.life<=0){scene.remove(e.m);effects.splice(i,1)}}controls.update();renderer.render(scene,camera)}requestAnimationFrame(animate);
if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js');
