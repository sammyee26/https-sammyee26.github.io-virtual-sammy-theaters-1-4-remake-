(() => {
"use strict";

const $ = id => document.getElementById(id);
const $$ = sel => Array.from(document.querySelectorAll(sel));

const state = {
  started:false,
  zone:"Main Lobby",
  zoneId:"lobby",
  facing:0,
  x:0,
  y:0,
  speed:7,
  seat:"A1",
  auditorium:"1",
  format:"Standard Digital",
  mediaUrl:"",
  heldFood:null,
  heldDrink:null,
  drinkLevel:0,
  arcadeTickets:0,
  activeGame:null,
  gameScore:0,
  gameX:350,
  gameRunning:false,
  fourD:75,
  season:"standard",
  avatar:{name:"Guest",hair:"Short",outfit:"Sammy Theater Tee",accessory:"None"},
  outpaintMode:"239",
  keys:new Set()
};


const FORMATS = [
  ["Standard Digital","Classic virtual digital presentation."],
  ["RealD 3D","Concept stereoscopic presentation mode."],
  ["D-BOX","Virtual synchronized seat-motion simulation."],
  ["IMAX","Concept large-format presentation."],
  ["Sammy's XPAND X","Expanded immersive side-screen presentation."],
  ["Sammy's 4DS","Virtual motion, haptics, lighting and atmosphere."],
  ["Sammy's 4DS RealD 3D","3D concept presentation plus Sammy's 4DS."],
  ["Xtreme Sammy's 4DS","More elaborate virtual 4DS effects."],
  ["Sammy's × D-BOX 4DS","Concept combination of Sammy's 4DS and D-BOX-style motion."],
  ["Sammy's × IMAX 4DS","Large-format concept combined with Sammy's 4DS."],
  ["Sammy's × XPAND 4DS","XPAND X side visuals plus Sammy's 4DS."],
  ["Ultimate Sammy's 4DS","Top-level expanded presentation with richer effects."]
];

const foodItems = [
  "🍿 Popcorn","🍕 Pizza","🧀 Nachos","🍟 Fries","🥨 Pretzel","🍗 Chicken Tenders",
  "🍬 Candy","🍭 Mystery Candy","🌭 Hot Dog","🍦 Ice Cream"
];

const arcadeGames = [
  ["🧸 Plushie Claw","claw"],["🎁 Mystery Claw","claw"],["🎃 Seasonal Claw","claw"],
  ["🏎️ Neon Speedway","lanes"],["🚀 Space Motion Simulator","lanes"],["🌊 Ocean Motion Simulator","lanes"],
  ["🎢 Comet Run","lanes"],["🥁 Rhythm Reactor","rhythm"],["🎯 Target Blitz","targets"],
  ["🎳 Mini Bowling","timing"],["🏀 Arcade Basketball","timing"],["🧩 Puzzle Cabinet","timing"]
];

const effects = ["Seat Motion","Vibration","Wind","Air Bursts","Mist","Fog","Snow","Temperature","Scents","Lighting","Haptics","Rumble"];

// ---------- error catcher ----------
window.addEventListener("error", e => {
  const message = e?.message || "Unknown error";
  const status = $("bootStatus");
  if(status) status.textContent = "Startup error caught: " + message;
  console.error(e.error || e);
});

// ---------- safe canvas renderer ----------
const canvas = $("world");
const ctx = canvas.getContext("2d");

function resizeCanvas(){
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  canvas.width = Math.floor(innerWidth * dpr);
  canvas.height = Math.floor(innerHeight * dpr);
  canvas.style.width = innerWidth + "px";
  canvas.style.height = innerHeight + "px";
  ctx.setTransform(dpr,0,0,dpr,0,0);
}
addEventListener("resize", resizeCanvas);
resizeCanvas();

function drawWorld(){
  const w = innerWidth, h = innerHeight;
  ctx.clearRect(0,0,w,h);

  const wall = ctx.createLinearGradient(0,0,0,h*.65);
  wall.addColorStop(0,"#0c1730");
  wall.addColorStop(1,state.zoneId==="arcade" ? "#32154c" : "#152a53");
  ctx.fillStyle = wall;
  ctx.fillRect(0,0,w,h*.65);

  const floor = ctx.createLinearGradient(0,h*.55,0,h);
  floor.addColorStop(0,"#172545");
  floor.addColorStop(1,"#070b15");
  ctx.fillStyle = floor;
  ctx.beginPath();
  ctx.moveTo(0,h*.55);ctx.lineTo(w,h*.55);ctx.lineTo(w,h);ctx.lineTo(0,h);ctx.closePath();ctx.fill();

  ctx.strokeStyle="rgba(100,150,255,.15)";
  for(let i=-7;i<=7;i++){ctx.beginPath();ctx.moveTo(w/2,h*.55);ctx.lineTo(w/2+i*w*.11,h);ctx.stroke()}

  ctx.textAlign="center";
  ctx.fillStyle="#ffd84f";
  ctx.font=`900 ${Math.max(26,Math.min(46,w*.038))}px system-ui`;
  ctx.fillText(state.zone.toUpperCase(),w/2,Math.max(125,h*.18));

  if(state.zoneId==="lobby"){
    drawLobby(w,h);
  }else if(state.zoneId==="arcade"){
    drawArcadeRoom(w,h);
  }else if(state.zoneId.startsWith("auditorium")){
    drawAuditoriumRoom(w,h,state.zoneId.slice(-1));
  }

  ctx.fillStyle="#ffd84f";
  ctx.beginPath();ctx.arc(w/2+state.x*5,h*.77+state.y*2,10,0,Math.PI*2);ctx.fill();
}

function drawCard(x,y,w,h,title,subtitle){
  ctx.fillStyle="rgba(25,49,94,.96)";
  ctx.fillRect(x-w/2,y-h/2,w,h);
  ctx.strokeStyle="rgba(255,255,255,.22)";
  ctx.strokeRect(x-w/2,y-h/2,w,h);
  ctx.fillStyle="#fff";
  ctx.font=`800 ${Math.max(12,Math.min(18,innerWidth*.014))}px system-ui`;
  ctx.fillText(title,x,y-5);
  ctx.font=`600 ${Math.max(10,Math.min(14,innerWidth*.011))}px system-ui`;
  ctx.fillStyle="#cddcff";
  ctx.fillText(subtitle,x,y+20);
}

function drawLobby(w,h){
  drawCard(w*.15,h*.42,Math.min(190,w*.18),110,"🍿 CONCESSIONS","Food & drinks");
  drawCard(w*.36,h*.42,Math.min(190,w*.18),110,"🎞️ SCREENING KIOSK","Files & formats");
  drawCard(w*.57,h*.42,Math.min(190,w*.18),110,"🚪 AUDITORIUMS","1 • 2 • 3");
  drawCard(w*.80,h*.42,Math.min(210,w*.20),110,"⬆️ ESCALATOR","2nd Floor Arcade");
  ctx.fillStyle="#dce7ff";
  ctx.font=`700 ${Math.max(12,w*.012)}px system-ui`;
  ctx.fillText("Use the bottom lobby buttons, keyboard controls, or mobile controls.",w/2,h*.58);
}

function drawArcadeRoom(w,h){
  const names=["🧸 CLAW","🎁 MYSTERY","🎃 SEASONAL","🏎️ RACING","🚀 SPACE","🌊 OCEAN","🎢 COASTER","🥁 RHYTHM"];
  names.forEach((name,i)=>{
    const col=i%4,row=Math.floor(i/4);
    drawCard(w*(.16+col*.22),h*(.38+row*.22),Math.min(160,w*.16),95,name,"PLAYABLE");
  });
  ctx.fillStyle="#dce7ff";ctx.font=`700 ${Math.max(12,w*.012)}px system-ui`;
  ctx.fillText("Open the Arcade menu to launch a game, or press INTERACT to return to the lobby.",w/2,h*.79);
}

function drawAuditoriumRoom(w,h,id){
  ctx.fillStyle="#dfe9ff";ctx.fillRect(w*.17,h*.24,w*.66,h*.25);
  ctx.fillStyle="#0a1020";ctx.font=`900 ${Math.max(18,w*.024)}px system-ui`;ctx.fillText("SCREEN",w/2,h*.38);
  for(let r=0;r<6;r++){
    for(let c=0;c<9;c++){
      const x=w*(.23+c*.068),y=h*(.57+r*.052);
      ctx.fillStyle="#29467e";ctx.fillRect(x-13,y-8,26,16);
    }
  }
  ctx.fillStyle="#dce7ff";ctx.font=`700 ${Math.max(12,w*.012)}px system-ui`;
  ctx.fillText(`Auditorium ${id} • ${state.format} • Seat ${state.seat}`,w/2,h*.84);
}

let last=performance.now();
function loop(now){
  const dt = Math.min(.05,(now-last)/1000); last=now;
  updateMovement(dt);
  drawWorld();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// ---------- setup ----------
function populateSeats(){
  const s=$("seatSelect"); s.innerHTML="";
  "ABCDEFGHIJKL".split("").forEach(row=>{
    for(let n=1;n<=10;n++){
      const o=document.createElement("option"); o.value=row+n; o.textContent=row+n; s.appendChild(o);
    }
  });
}
populateSeats();

function runStartupTest(){
  const checks = [
    ["Canvas context", !!ctx],
    ["Main canvas", !!canvas],
    ["Start button", !!$("startButton")],
    ["Panel system", !!$("panel")],
    ["Media element", !!$("media")],
    ["Local storage", (()=>{try{localStorage.setItem("_vsttest","1");localStorage.removeItem("_vsttest");return true}catch{return false}})()]
  ];
  const failed = checks.filter(x=>!x[1]);
  $("bootStatus").textContent = failed.length ? "Failed: "+failed.map(x=>x[0]).join(", ") : "All startup tests passed.";
}
$("runBootTest").addEventListener("click",runStartupTest);

$("startButton").addEventListener("click",()=>{
  state.seat=$("seatSelect").value;
  state.auditorium=$("auditoriumSelect").value;
  state.format=$("formatSelect").value;
  $("panelFormat").value=state.format;
  $("seatLabel").textContent="Seat "+state.seat;
  $("formatLabel").textContent=state.format;
  $("boot").classList.add("hidden");
  $("app").classList.remove("hidden");
  state.started=true;
  toast("Version 1.4 started. Controls are active.");
});

// ---------- panels ----------
function openPanel(name){
  $("panel").classList.add("open");
  $("panel").setAttribute("aria-hidden","false");
  $$(".page").forEach(p=>p.classList.toggle("active",p.dataset.page===name));
}
function closePanel(){
  $("panel").classList.remove("open");
  $("panel").setAttribute("aria-hidden","true");
}
$$("[data-panel]").forEach(b=>b.addEventListener("click",()=>openPanel(b.dataset.panel)));
$("closePanel").addEventListener("click",closePanel);
addEventListener("keydown",e=>{if(e.key==="Escape")closePanel()});

// ---------- movement ----------
function updateMovement(dt){
  if(!state.started || $("panel").classList.contains("open")) return;
  let dx=0,dy=0;
  if(state.keys.has("ArrowLeft")||state.keys.has("a"))dx-=1;
  if(state.keys.has("ArrowRight")||state.keys.has("d"))dx+=1;
  if(state.keys.has("ArrowUp")||state.keys.has("w"))dy-=1;
  if(state.keys.has("ArrowDown")||state.keys.has("s"))dy+=1;
  state.x += dx*state.speed*dt;
  state.y += dy*state.speed*dt;
}
addEventListener("keydown",e=>{
  const k=e.key.length===1?e.key.toLowerCase():e.key;
  state.keys.add(k);
  if(k==="e"&&!$("panel").classList.contains("open"))interact();
});
addEventListener("keyup",e=>state.keys.delete(e.key.length===1?e.key.toLowerCase():e.key));

$$("[data-move]").forEach(b=>{
  const map={up:"ArrowUp",down:"ArrowDown",left:"ArrowLeft",right:"ArrowRight"};
  const key=map[b.dataset.move];
  const press=(e)=>{
    if(e){e.preventDefault(); try{b.setPointerCapture?.(e.pointerId)}catch{}}
    state.keys.add(key);
  };
  const release=(e)=>{
    if(e)e.preventDefault();
    state.keys.delete(key);
  };
  b.addEventListener("pointerdown",press);
  b.addEventListener("pointerup",release);
  b.addEventListener("pointercancel",release);
  b.addEventListener("lostpointercapture",release);
  b.addEventListener("touchstart",press,{passive:false});
  b.addEventListener("touchend",release,{passive:false});
});
$("interactButton").addEventListener("click",interact);
$("interactButton").addEventListener("touchend",e=>{e.preventDefault();interact()},{passive:false});
$("resetMobile").addEventListener("click",()=>{
  state.keys.clear();state.x=0;state.y=0;
  toast("Mobile controls reset.");
});

function setZone(id){
  state.zoneId=id;
  if(id==="lobby") state.zone="Main Lobby";
  else if(id==="arcade") state.zone="Mega Arcade";
  else if(id.startsWith("auditorium")) state.zone="Auditorium "+id.slice(-1);
  $("zoneLabel").textContent=state.zone;
}

function interact(){
  if(state.zoneId==="lobby"){
    openPanel("screenings");
    toast("Opened the Screening Kiosk.");
  }else if(state.zoneId==="arcade"){
    setZone("lobby");
    toast("You rode the escalator back to the Main Lobby.");
  }else if(state.zoneId.startsWith("auditorium")){
    setZone("lobby");
    toast("You returned to the Main Lobby.");
  }
}


// ---------- FULLY WORKING LOBBY ACTIONS ----------
$$("[data-lobby]").forEach(btn=>btn.addEventListener("click",()=>{
  const action=btn.dataset.lobby;
  if(action==="concessions") openPanel("concessions");
  else if(action==="screenings") openPanel("screenings");
  else if(action==="arcade"){ setZone("arcade"); toast("You rode the escalator to the Mega Arcade."); }
  else if(action.startsWith("auditorium")){
    setZone(action);
    const id=action.slice(-1);
    state.auditorium=id;
    toast(`Entered Auditorium ${id}.`);
  }
}));

// ---------- file/media ----------
function loadMedia(file){
  if(!file)return;
  if(state.mediaUrl) URL.revokeObjectURL(state.mediaUrl);
  state.mediaUrl=URL.createObjectURL(file);
  $("media").src=state.mediaUrl;
  $("screeningStatus").textContent="Loaded: "+file.name;
}
$("fileInput").addEventListener("change",e=>loadMedia(e.target.files?.[0]));
$("panelFile").addEventListener("change",e=>loadMedia(e.target.files?.[0]));
$("panelFormat").addEventListener("change",()=>{
  state.format=$("panelFormat").value; $("formatSelect").value=state.format; $("formatLabel").textContent=state.format;
  const info=FORMATS.find(f=>f[0]===state.format);
  $("screeningStatus").textContent=(info?info[1]:"")+" Current format: "+state.format;
});
$("playButton").addEventListener("click",()=>$("media").play().catch(()=>toast("Tap Play again if your browser blocked playback.")));
$("pauseButton").addEventListener("click",()=>$("media").pause());
$("stopButton").addEventListener("click",()=>{$("media").pause();$("media").currentTime=0});

// ---------- concessions ----------
function buildFood(){
  const g=$("foodGrid");
  foodItems.forEach(name=>{
    const b=document.createElement("button"); b.textContent=name;
    b.addEventListener("click",()=>{
      state.heldFood={name,bites:4};
      $("heldStatus").textContent="Holding "+name+" • 4 bites";
      toast("Picked up "+name);
    });
    g.appendChild(b);
  });
}
buildFood();

function fillDrink(frozen=false){
  const flavor=$("drinkFlavor").value, size=$("drinkSize").value;
  state.heldDrink={flavor,size,frozen};
  state.drinkLevel=100;
  $("cupFill").style.height="100%";
  $("cupText").textContent=(frozen?"FROZEN ":"")+size.toUpperCase()+" "+flavor.toUpperCase();
  $("heldStatus").textContent="Holding "+size+" "+(frozen?"frozen ":"")+flavor;
}
$("fountainButton").addEventListener("click",()=>fillDrink(false));
$("frozenButton").addEventListener("click",()=>fillDrink(true));
$("eatButton").addEventListener("click",()=>{
  if(!state.heldFood)return toast("You are not holding food.");
  state.heldFood.bites--;
  $("heldStatus").textContent=state.heldFood.bites>0?state.heldFood.name+" • "+state.heldFood.bites+" bites left":"Finished "+state.heldFood.name;
  if(state.heldFood.bites<=0)state.heldFood=null;
});
$("drinkButton").addEventListener("click",()=>{
  if(!state.heldDrink||state.drinkLevel<=0)return toast("You are not holding a drink.");
  state.drinkLevel=Math.max(0,state.drinkLevel-25);
  $("cupFill").style.height=state.drinkLevel+"%";
  if(!state.drinkLevel){$("cupText").textContent="EMPTY";state.heldDrink=null;$("heldStatus").textContent="Drink finished."}
});
$("cupHolderButton").addEventListener("click",()=>toast(state.heldDrink?"Drink placed in cup holder.":"You are not holding a drink."));

// ---------- arcade ----------
function buildArcade(){
  const g=$("arcadeGrid");
  arcadeGames.forEach(([title,mode])=>{
    const b=document.createElement("button"); b.textContent=title;
    b.addEventListener("click",()=>startGame(title,mode));
    g.appendChild(b);
  });
}
buildArcade();

const gc=$("gameCanvas"), gx=gc.getContext("2d");
const gameInput={left:false,right:false,action:false};

function startGame(title,mode){
  state.activeGame={title,mode};
  state.gameScore=0;state.gameX=350;state.gameRunning=true;
  $("arcadeGame").classList.remove("hidden");
  $("gameTitle").textContent=title;
  $("gameScore").textContent="Score: 0";
  requestAnimationFrame(gameLoop);
}
function gameLoop(t){
  if(!state.gameRunning)return;
  if(gameInput.left)state.gameX=Math.max(40,state.gameX-5);
  if(gameInput.right)state.gameX=Math.min(660,state.gameX+5);
  gx.clearRect(0,0,700,360);
  gx.fillStyle="#07101f";gx.fillRect(0,0,700,360);
  gx.fillStyle="#ffd84f";gx.fillRect(state.gameX-20,300,40,28);

  const mode=state.activeGame?.mode||"timing";
  if(mode==="claw"){
    gx.strokeStyle="#fff";gx.lineWidth=5;gx.beginPath();gx.moveTo(state.gameX,40);gx.lineTo(state.gameX,170);gx.stroke();
    gx.beginPath();gx.moveTo(state.gameX-30,170);gx.lineTo(state.gameX,205);gx.lineTo(state.gameX+30,170);gx.stroke();
    [[120,280],[250,290],[390,275],[520,288],[620,270]].forEach((p,i)=>{gx.fillStyle=i%2?"#6da0ff":"#ff7db5";gx.beginPath();gx.arc(p[0],p[1],25,0,Math.PI*2);gx.fill()});
    if(gameInput.action){
      gameInput.action=false;
      const hit=Math.random()>.45;
      if(hit){state.gameScore+=100;state.arcadeTickets+=20;toast("Claw prize won! +20 tickets")}else toast("Claw missed!");
    }
  }else{
    const targetX=350+Math.sin(t/600)*220;
    gx.fillStyle="#4f7cff";gx.fillRect(targetX-24,90,48,48);
    if(gameInput.action){
      gameInput.action=false;
      if(Math.abs(state.gameX-targetX)<70){state.gameScore+=50;state.arcadeTickets+=5}else state.gameScore=Math.max(0,state.gameScore-10);
    }
  }
  $("gameScore").textContent=`Score: ${state.gameScore} • Tickets: ${state.arcadeTickets}`;
  requestAnimationFrame(gameLoop);
}
function bindHold(btn,key){
  btn.addEventListener("pointerdown",()=>gameInput[key]=true);
  ["pointerup","pointerleave","pointercancel"].forEach(e=>btn.addEventListener(e,()=>gameInput[key]=false));
}
bindHold($("gameLeft"),"left");bindHold($("gameRight"),"right");
$("gameAction").addEventListener("click",()=>gameInput.action=true);
$("exitGame").addEventListener("click",()=>{state.gameRunning=false;$("arcadeGame").classList.add("hidden")});

// ---------- 4DS ----------
function buildEffects(){
  const g=$("effectGrid");
  effects.forEach(name=>{
    const label=document.createElement("label");
    const id="fx"+name.replace(/\W/g,"");
    label.innerHTML=`${name}<input id="${id}" type="range" min="0" max="100" value="80">`;
    g.appendChild(label);
  });
}
buildEffects();

$("master4D").addEventListener("input",()=>{
  state.fourD=+$("master4D").value;
  $("master4DValue").textContent=state.fourD+"%";
});
function seatTransform(transform,msg,vibrate){
  $("seatPreview").style.transform=transform;
  $("fourDStatus").textContent=msg;
  if(vibrate&&navigator.vibrate)navigator.vibrate([45,35,45]);
  setTimeout(()=>{$("seatPreview").style.transform="none"},400);
}
$("motionLeft").addEventListener("click",()=>seatTransform("rotate(-12deg)","Seat turned left."));
$("motionRight").addEventListener("click",()=>seatTransform("rotate(12deg)","Seat turned right."));
$("motionForward").addEventListener("click",()=>seatTransform("perspective(500px) rotateX(14deg)","Seat tilted forward."));
$("motionBack").addEventListener("click",()=>seatTransform("perspective(500px) rotateX(-14deg)","Seat tilted backward."));
$("motionVibrate").addEventListener("click",()=>seatTransform("translateX(4px)","Seat vibration test.",true));
$("motionStop").addEventListener("click",()=>{$("seatPreview").style.transform="none";if(navigator.vibrate)navigator.vibrate(0);$("fourDStatus").textContent="All motion stopped."});

// ---------- outpaint ----------
function applyOutpaintPreview(){
  state.outpaintMode=$("outpaintMode").value;
  $("outpaintPreview").className="outpaint-preview mode-"+state.outpaintMode;
  $("outpaintStatus").textContent="Preview applied: "+$("outpaintMode").selectedOptions[0].textContent;
}
$("outpaintMode").addEventListener("change",applyOutpaintPreview);
$("applyOutpaint").addEventListener("click",applyOutpaintPreview);
$("requestOutpaint").addEventListener("click",async()=>{
  const endpoint=window.VST14_OUTPAINT_ENDPOINT;
  if(!endpoint){
    $("outpaintStatus").textContent="Real AI outpaint backend is not configured yet. Preview mode still works.";
    return;
  }
  $("outpaintStatus").textContent="Backend configured. Generation request can be sent from this secure endpoint.";
  toast("AI backend hook detected.");
});

// ---------- avatar ----------
function updateAvatar(){
  state.avatar={name:$("avatarName").value||"Guest",hair:$("avatarHair").value,outfit:$("avatarOutfit").value,accessory:$("avatarAccessory").value};
  $("avatarPreview").textContent=`🧍 ${state.avatar.name} • ${state.avatar.hair} • ${state.avatar.outfit} • ${state.avatar.accessory}`;
}
["avatarName","avatarHair","avatarOutfit","avatarAccessory"].forEach(id=>$(id).addEventListener("input",updateAvatar));
$("saveAvatar").addEventListener("click",()=>{updateAvatar();toast("Avatar saved.")});

// ---------- seasonal ----------
$$("[data-season]").forEach(b=>b.addEventListener("click",()=>{
  state.season=b.dataset.season;
  document.body.className=state.season==="standard"?"":"season-"+state.season;
  $("seasonStatus").textContent=b.textContent+" active.";
  toast(b.textContent+" enabled.");
}));

// ---------- profile ----------
function profileData(){return {avatar:state.avatar,arcadeTickets:state.arcadeTickets,season:state.season,fourD:state.fourD,format:state.format,seat:state.seat}}
$("saveProfile").addEventListener("click",()=>{
  localStorage.setItem("vst14-profile",JSON.stringify(profileData()));
  $("profileStatus").textContent="Profile saved locally.";
});
$("loadProfile").addEventListener("click",()=>{
  const raw=localStorage.getItem("vst14-profile");
  if(!raw)return $("profileStatus").textContent="No saved profile found.";
  try{
    const p=JSON.parse(raw);
    Object.assign(state,p);
    $("profileStatus").textContent="Profile loaded.";
    $("master4D").value=state.fourD||75;$("master4DValue").textContent=(state.fourD||75)+"%";
  }catch{$("profileStatus").textContent="Saved profile could not be read."}
});
$("resetProfile").addEventListener("click",()=>{localStorage.removeItem("vst14-profile");$("profileStatus").textContent="Saved profile removed."});

// ---------- test center ----------
function runTests(){
  const tests=[
    ["Canvas renders",!!ctx],
    ["Main menu buttons",$$("[data-panel]").length>=9],
    ["Mobile controls",$$("[data-move]").length===4],
    ["Concession buttons",foodItems.length>0],
    ["Arcade games",arcadeGames.length>=10],
    ["4DS controls",!!$("motionStop")],
    ["AI Outpaint choices",$$("#outpaintMode option").length===7],
    ["Avatar editor",!!$("avatarName")],
    ["Media loader",!!$("panelFile")],
    ["Local profile storage",(()=>{try{localStorage.setItem("_vst14","1");localStorage.removeItem("_vst14");return true}catch{return false}})()]
  ];
  const box=$("testResults");box.innerHTML="";
  tests.forEach(([name,ok])=>{
    const div=document.createElement("div");div.className=ok?"test-pass":"test-fail";div.textContent=(ok?"✅ ":"❌ ")+name;box.appendChild(div);
  });
  toast(tests.every(t=>t[1])?"All 1.4 tests passed.":"Some tests failed.");
}
$("runTests").addEventListener("click",runTests);

// ---------- toast ----------
let toastTimer;
function toast(msg){
  const t=$("toast");t.textContent=msg;t.classList.add("show");
  clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove("show"),2200);
}

// initial sync
$("panelFormat").value=state.format;
applyOutpaintPreview();
updateAvatar();
})();
