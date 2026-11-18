/* Being Found 8.2 — replacement Canvas room renderer.
 * Uses the original narrative, collision path, actions and character animations.
 * The previous isometric room drawing is bypassed in drawScene, not covered by CSS.
 */
(() => {
 'use strict';
 if(window.BFRoom)return;
 const app=document.getElementById('app'),scene=document.getElementById('scene'),stage=document.getElementById('stage');
 if(!app||!scene||!stage)return;
 const SW=1600,SH=720,FLOOR=574;
 const pins={mirror:[191,307],sofa:[464,420],window:[518,279],phone:[690,399],bed:[849,409],easel:[973,345],stove:[1140,392],door:[1442,419]};
 const sections={living:{x:410,name:'Living'},sleeping:{x:814,name:'Bedroom'},kitchen:{x:1255,name:'Kitchen'}};
 const roomByObject={mirror:'living',sofa:'living',window:'living',phone:'sleeping',bed:'sleeping',easel:'sleeping',stove:'kitchen',door:'kitchen'};
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 let selected='living', manualUntil=0, drawn=0, active=true, lastFlat=-1, lastMode='';
 let nav,buildTag;
 const isHome=s=>s?.place!=='street';
 function projection(x,y,z=0){return [800+(x-y)*80, FLOOR-z*38+(x+y-8)*1.45];}
 // This is the only source for the camera's room AND the selected navigation button.
 // Explicit room browsing persists until an object/action redirects the camera.
 const sectionAtX=x=>x<635?'living':x<1020?'sleeping':'kitchen';
 function currentSection(S){
   if(S?.menu&&roomByObject[S.menu])return roomByObject[S.menu];
   // Outside Noor's guided flat, the camera follows the actual resident rather
   // than inheriting a stale room label from the preceding scene.
   if((S?.flat?.id!=='rooted'||S?.mode==='visit') && S?.sim && performance.now()>=manualUntil){
     const p=window.BFNavigation?.position?.(S);
     const actorX=p?.[0]??projection(S.sim.x,S.sim.y)[0];
     if(Number.isFinite(actorX))return sectionAtX(clamp(actorX,185,1460));
   }
   if(performance.now()<manualUntil)return selected;
   if(S?.sim?.path?.length){
     const x=window.BFNavigation?.position?.(S)?.[0]??projection(S.sim.x,S.sim.y)[0];
     return sectionAtX(x);
   }
   if(S?.sim?.at&&roomByObject[S.sim.at])return roomByObject[S.sim.at];
   return selected;
 }
 function cameraTarget(V,S){
   if(!active)return null;
   const sc=currentSection(S), walking=S?.sim?.path?.length>0;
   const walkingX=walking?(window.BFNavigation?.position?.(S)?.[0]??projection(S.sim.x,S.sim.y)[0]):null;
   const actorX=window.BFNavigation?.position?.(S)?.[0]??(S?.sim?projection(S.sim.x,S.sim.y)[0]:sections[sc]?.x);
   const followOther=(S?.flat?.id!=='rooted'||S?.mode==='visit') && !S?.menu && performance.now()>=manualUntil && Number.isFinite(actorX);
   const focal=followOther?clamp(actorX,340,1350):(walking && performance.now()>manualUntil && !S.menu ? clamp(walkingX,340,1350) : sections[sc]?.x||sections.living.x);
   const s=V.s, w=V.w,h=V.h;
   const rw=SW*s;
   let ox=(w-rw)/2;
   if(rw>w){ox=clamp(w/2-focal*s,w-rw+3,-3);}
   const rh=SH*s;
   // Low view height deliberately crops the upper wall, not the actor or floor.
   let oy=rh<h?(h-rh)/2:clamp(h*.86-FLOOR*s,h-rh,0);
   if(S?.place==='street')oy=Math.min(0,oy);
   return [ox,oy];
 }
 function scale(w,h,A){
   if(!w||!h)return .7;
   // A side-scrolling room should fill the vertical frame; fitting the entire
   // 1600px panorama horizontally makes the character unreasonably small.
   const landscape=innerWidth>innerHeight;
   const yFactor=landscape && innerHeight<=520 ? .99 : .98;
   const byHeight=h/SH*yFactor;
   const byWidth=w/SW*(landscape?1.27:1.20);
   return clamp(Math.max(byHeight,byWidth),.59,1.23);
 }
 const box=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
 const rr=(c,x,y,w,h,r,fill,stroke,width=1)=>{
  c.beginPath();c.roundRect(x,y,w,h,Math.min(r,w/2,h/2));
  if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}
 };
 const line=(c,x1,y1,x2,y2,color,width=1)=>{c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.lineWidth=width;c.strokeStyle=color;c.stroke();};
 const el=(c,x,y,rx,ry,fill)=>{c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=fill;c.fill();};
 const light=(c,x,y,r,color,alpha=.3)=>{c.save();c.globalAlpha=alpha;const g=c.createRadialGradient(x,y,5,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'transparent');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);c.restore();};
 function frame(c,x,y,w,h){rr(c,x,y,w,h,7,'#e8e4d6','#b3b5a5',7);rr(c,x+10,y+11,w-20,h-23,2,'#b6d1ce');}
 function roomBack(c,S,t){
   const L=S.flat?.look||{},attune=S.vars?.attune||'rooted';
   const wall=L.wall||'#d4dfd0';
   // Separate material zones: painted plaster in the living room, warm textile
   // tones near the bed, and washable sage tiles in the kitchenette.
   const base=c.createLinearGradient(0,10,0,FLOOR);base.addColorStop(0,'#f3f0e6');base.addColorStop(.27,wall);base.addColorStop(1,'#acbba8');
   box(c,0,0,SW,SH,base);
   box(c,0,0,570,FLOOR,'rgba(255,250,233,.19)');
   box(c,570,0,445,FLOOR,'rgba(237,213,184,.19)');
   box(c,1015,0,585,FLOOR,'rgba(182,224,206,.15)');
   // Crown trim, architectural bays and skirting; consistent line weight.
   box(c,0,0,SW,25,'#faf5e8');box(c,0,25,SW,7,'#d9d4c5');
   for(const x of [570,1015]){
     box(c,x-15,0,30,FLOOR,'#778c83');box(c,x-10,0,20,FLOOR,'#acbaa9');
     line(c,x-5,0,x-5,FLOOR,'rgba(255,255,249,.38)',2);
   }
   box(c,0,FLOOR-18,SW,18,'#f1e8d4');box(c,0,FLOOR-2,SW,8,'#728278');
   // Panelled oak planks with a warm contact line and soft near-field depth.
   const wood=c.createLinearGradient(0,FLOOR,0,SH);wood.addColorStop(0,'#e5c598');wood.addColorStop(.48,'#bd9975');wood.addColorStop(1,'#866e60');box(c,0,FLOOR+6,SW,SH-FLOOR,wood);
   for(let i=0;i<=SW;i+=96){line(c,i,FLOOR+8,i+48,SH,'rgba(88,59,40,.25)',2);line(c,i+10,FLOOR+17,i+52,SH,'rgba(255,240,203,.17)',1);}
   for(let y=FLOOR+45;y<SH;y+=68)line(c,0,y,SW,y,'rgba(74,54,39,.14)',1.5);
   box(c,0,SH-13,SW,13,'rgba(45,40,34,.12)');
   // Living area: a deep framed window, outside trees, city buildings and daylight.
   rr(c,405,134,182,248,8,'#d6d7c8','#8b9a90',8);rr(c,417,145,158,224,3,'#b8d3ce');
   for(const [dx,w,h] of [[8,30,98],[37,28,131],[72,35,115],[110,40,162]])
     box(c,417+dx,366-h,w,h,'rgba(82,121,122,.14)');
   for(const [cx,cy,rad] of [[558,244,35],[578,282,39],[532,313,33]])el(c,cx,cy,rad,rad*1.08,'rgba(83,138,102,.25)');
   line(c,496,146,496,368,'#f2f0e5',10);line(c,419,258,573,258,'#f2f0e5',10);
   // Light shaft is deliberately subtle, independent of the clinical label.
   c.save();const ray=c.createLinearGradient(505,230,690,570);ray.addColorStop(0,'rgba(255,248,207,.19)');ray.addColorStop(1,'rgba(255,248,207,0)');
   c.fillStyle=ray;c.beginPath();c.moveTo(466,375);c.lineTo(563,375);c.lineTo(694,FLOOR);c.lineTo(566,FLOOR);c.closePath();c.fill();c.restore();
   // Bedroom: wall panelling plus two small, asymmetric picture frames.
   rr(c,621,216,353,256,8,'rgba(239,237,213,.24)');
   for(let y=244;y<464;y+=47)line(c,637,y,960,y,'rgba(255,250,235,.26)',2);
   rr(c,751,99,84,102,4,'#d3ad82','#856f60',7);
   rr(c,762,110,62,80,2,'#eee4cf');
   el(c,788,146,20,23,'#7d9c93');el(c,802,152,13,14,'#cbab80');
   // Kitchen: ceramic backsplash and believable pendant lighting.
   rr(c,1037,352,381,191,4,'#d8e4dc');
   for(let y=355;y<540;y+=40)line(c,1040,y,1416,y,'rgba(254,254,245,.56)',1.5);
   for(let x=1041;x<1421;x+=52)line(c,x,353,x,540,'rgba(252,252,242,.47)',1.5);
   line(c,1206,30,1206,188,'#6e7770',3.5);
   c.beginPath();c.moveTo(1154,190);c.lineTo(1257,190);c.lineTo(1234,226);c.lineTo(1178,226);c.closePath();c.fillStyle='#f4e7bf';c.fill();
   light(c,1204,286,245,'#fff1bd',.17);
   if(attune==='depleted')box(c,0,0,SW,SH,'rgba(70,75,80,.055)');
 }
 function drawMirror(c){rr(c,75,137,177,329,18,'#ad8e70');rr(c,90,151,147,299,13,'#d5dbd5','#ede6d7',7);el(c,165,287,34,75,'rgba(176,195,181,.20)');rr(c,69,458,188,12,5,'#926f58');}
 function drawShelf(c){rr(c,250,124,143,14,2,'#896e58');rr(c,250,242,143,13,2,'#896e58');for(let i=0;i<10;i++){const x=256+i*13;box(c,x,178-(i%4)*9,9,64+(i%4)*9,['#b47f65','#5c8c8b','#c7a56f','#87958e'][i%4]);}rr(c,278,230,18,11,3,'#d2c8ad');}
 function drawSofa(c,S){
   const L=S.flat?.look||{},col=L.sofa||'#b9ab8c';
   // Sofa belongs to Living: feet and contact shadow follow the shared floor.
   el(c,447,575,193,16,'rgba(28,39,33,.19)');
   rr(c,289,388,310,151,28,col,'rgba(88,73,58,.28)',4);
   rr(c,310,417,265,84,21,'#d4bea0');
   rr(c,312,440,122,54,15,'#e0cdb4');rr(c,441,440,118,54,15,'#e1c9a8');
   rr(c,287,472,43,75,15,'#b19c81');rr(c,567,472,42,75,15,'#ac977e');
   rr(c,317,479,260,60,17,col);
   rr(c,328,536,16,30,3,'#705b4a');rr(c,552,536,16,30,3,'#705b4a');
   rr(c,359,434,69,37,13,'#b37566');rr(c,489,433,60,39,12,'#789b93');
   line(c,447,480,447,530,'rgba(93,80,62,.17)',2);
   window.BFStageSync?.paintSofa?.(c,S);
   // Keep the furniture apron behind a passing walker, rather than over their shins.
   // For seated residents the apron is re-painted in the foreground below.
   drawSofaFront(c);
 }
 function drawSofaFront(c){rr(c,281,518,294,23,10,'#bca37c');line(c,308,539,546,539,'rgba(74,65,54,.22)',3);}
 function drawPhone(c,S,t){
   rr(c,610,501,103,17,3,'#957961');rr(c,625,516,10,59,3,'#7c6254');rr(c,690,516,10,59,3,'#7c6254');
   const calling=S.ringing,held=window.BFStageSync?.phoneHeld?.(S)||window.BFArt?.holdingPhone?.(S);
   if(!held){c.save();c.translate(calling?Math.sin(t*35)*2:0,0);rr(c,651,485,28,13,3,'#343c47');rr(c,656,486,17,9,2,calling?'#97e3e0':'#a8bac0');c.restore();}
 }
 function drawBed(c,S){const col=S.flat?.look?.duvet||'#8396a0';
   el(c,841,586,200,26,'rgba(25,27,32,.16)');rr(c,692,393,286,124,25,'#a89485');rr(c,703,438,279,101,21,'#e9e3d4');
   rr(c,704,470,274,73,16,col);rr(c,724,436,99,38,15,'#faf8ea');rr(c,825,436,101,38,15,'#faf8ea');
   rr(c,705,528,18,51,3,'#665d54');rr(c,953,528,18,51,3,'#665d54');
   for(let i=0;i<4;i++)line(c,706,506+i*6,968,506+i*6,'rgba(255,255,255,.09)',1.4);
 }
 function drawEasel(c,S){
   line(c,981,357,946,572,'#755e4c',10);line(c,981,357,1024,572,'#755e4c',10);line(c,969,488,991,488,'#6c5346',7);
   rr(c,943,328,83,128,3,'#8d6f57');rr(c,952,339,65,106,2,'#faf6e8');
   c.beginPath();c.moveTo(952,420);c.bezierCurveTo(981,402,995,364,1017,350);c.lineTo(1017,445);c.lineTo(952,445);c.closePath();c.fillStyle='#b37e6a';c.fill();
   box(c,960,397,45,6,'rgba(240,214,172,.7)');
   window.BFStageSync?.paintEasel?.(c,S,S.t);
   rr(c,961,470,84,8,3,'#9b7455');el(c,1005,461,10,5,'#7caaa0');
 }
 function drawKitchen(c,S,t){
   const look=S.flat?.look||{};
   // Upper cabinetry, consistent shading, and small handles.
   rr(c,1046,250,175,117,8,'#aabfae','#879e8e',3);
   rr(c,1229,250,175,117,8,'#c2c5ab','#a1ab96',3);
   for(const x of [1060,1241])line(c,x,255,x,361,'rgba(255,255,249,.33)',2);
   for(const x of [1193,1378])rr(c,x,294,6,35,2,'#617b70');
   el(c,1230,550,204,21,'rgba(26,41,34,.19)');
   // The actual hob is closer to the existing navigation destination.
   rr(c,1037,460,390,112,5,'#b6c8b7');
   for(const x of [1044,1162,1281,1397]){line(c,x,462,x,566,'rgba(55,86,73,.19)',3);rr(c,x+37,501,6,38,3,'#798f83');}
   rr(c,1032,437,406,22,6,'#ece2d1','#cbbda9',1.5);
   line(c,1035,456,1434,456,'rgba(99,88,73,.19)',2);
   // The hob is on the left, close to the character's existing standing
   // point. The sink occupies the right end of the same worktop.
   rr(c,1270,433,122,13,5,'#9bb4ae');
   c.beginPath();c.moveTo(1328,438);c.lineTo(1328,409);c.quadraticCurveTo(1338,391,1351,397);c.quadraticCurveTo(1365,403,1365,424);
   c.strokeStyle='#728c88';c.lineWidth=7;c.lineCap='round';c.stroke();
   el(c,1363,436,6,4,'#d1e5df');
   rr(c,1080,432,167,10,3,'#94a39f'); // 8.3.8: a pale hob, so it no longer reads as arms behind the resident
   for(const x of [1109,1216])el(c,x,437,26,7,'#6f807c');
   if(!window.BFStageSync?.isHome?.(S)){rr(c,1077,411,98,23,11,'#50585b');el(c,1127,410,49,15,'#766c61');}
   rr(c,1122,392,90,40,12,look.pot||'#c17c67');el(c,1167,392,45,10,'#c59a84');rr(c,1209,402,27,8,4,'#bf9a7e');
   const cooking=S.sim?.act && S.sim?.at==='stove' && !matchMedia('(prefers-reduced-motion:reduce)').matches;
   window.BFStageSync?.paintKitchen?.(c,S,t);
   if(cooking){c.save();c.globalAlpha=.43;for(let i=0;i<3;i++){c.beginPath();c.moveTo(1143+i*20,375);c.bezierCurveTo(1131+i*23,353,1154+i*20,344,1139+i*20,319);c.strokeStyle='#fff8e8';c.lineWidth=3;c.stroke();}c.restore();}
   // Clear sight line from the character to the window and the door.
   rr(c,1436,134,139,251,8,'#d8e5dd','#839b91',7);
   rr(c,1448,148,116,226,2,'#b9d8d0');
   for(const [x,h] of [[1458,95],[1485,130],[1510,110],[1540,159]])box(c,x,374-h,24,h,'rgba(79,126,113,.15)');
   for(const [x,y,r] of [[1552,214,38],[1561,252,34]])el(c,x,y,r,r*1.1,'rgba(87,143,106,.24)');
   line(c,1505,150,1505,374,'#f0f0df',8);line(c,1448,266,1564,266,'#f0f0df',8);
   // Props: cup, folded cloth, small herb plant; decorative and noninteractive.
   rr(c,1379,404,21,33,4,'#c7d0c6');rr(c,1383,407,13,27,3,'#f2f3e8');
   rr(c,1039,410,43,27,6,'#d9a97f');
   el(c,1054,401,14,12,'#648978');el(c,1069,396,12,15,'#759c80');
 }
 function drawDoor(c){rr(c,1446,366,143,214,9,'#a2aa93','#7a8f82',8);rr(c,1457,377,120,191,6,'#d2cfb9');rr(c,1470,390,92,139,5,'#c3c5ad');rr(c,1480,404,71,110,4,'rgba(255,255,255,.10)');el(c,1553,484,7,7,'#836e58');line(c,1460,565,1576,565,'#899c8e',3);}
 function drawStreet(c,t){
   const grad=c.createLinearGradient(0,0,0,SH);grad.addColorStop(0,'#6a7d85');grad.addColorStop(.7,'#b0b4aa');grad.addColorStop(1,'#d6c6ae');box(c,0,0,SW,SH,grad);
   for(let i=0;i<12;i++){const x=i*146-70;rr(c,x,130+(i%4)*22,126,410,3,'#778a8d');for(let j=0;j<5;j++)for(let k=0;k<2;k++)rr(c,x+18+k*55,162+(i%4)*22+j*55,28,36,2,'#c5c1a5');}
   box(c,0,562,SW,11,'#e9d8bd');box(c,0,573,SW,147,'#a4a59c');for(let x=0;x<SW;x+=86)line(c,x,586,x+30,720,'rgba(45,51,53,.15)',2);
   for(const x of [260,1030]){line(c,x,80,x,574,'#65746f',11);light(c,x,100,110,'#f2edd1',.18);}
 }
 function roomFront(c,S){
  // A seated resident's lap goes behind the front cushion; a walker does not.
  const mainSeated=S.sim?.pose==='sit'&&S.sim?.at==='sofa';
  const npcSeated=S.npc?.pose==='sit'&&S.npc?.at==='sofa';
  if(mainSeated||npcSeated)drawSofaFront(c);
  // Bottom floor reflection ties character's contact shadow to the ground.
  const g=c.createLinearGradient(0,557,0,640);g.addColorStop(0,'rgba(247,232,197,.06)');g.addColorStop(1,'rgba(47,53,45,.08)');box(c,0,558,SW,72,g);
 }
 function drawActor(c,x,y,o,drawFigure){
   c.save();
   el(c,x,y+1,28,7,'rgba(35,47,41,.15)');
   c.translate(x,y);c.scale(2.90,2.90);drawFigure(0,0,o);
   c.restore();
 }
 function render({ctx,VIEW,S,drawFigure,simOpts,npcOpts,simFoot}){
  if(!active||!S?.flat)return false;
  drawn++;
  if(S.mode!==lastMode){lastMode=S.mode;if(S.mode==='visit')manualUntil=0;}
  if(S.flatIx!==lastFlat){lastFlat=S.flatIx;selected=S.place==='street'?'living':(S.flat?.id==='rooted'?(roomByObject[S.sim?.at]||'living'):sectionAtX(projection(S.sim?.x??1.9,S.sim?.y??4.1)[0]));manualUntil=0;}
  const visibleSection=currentSection(S);
  syncNav(S); // rendered camera and ARIA pressed state are always derived together
  const following=nav?.querySelector('.bf-follow-actor');
  if(following){const q=S.sim,px=window.BFNavigation?.position?.(S)?.[0]??projection(q.x,q.y)[0],where=roomByObject[q.at]||sectionAtX(px);following.hidden=visibleSection===where||!!q.path?.length;}
  ctx.setTransform(VIEW.dpr,0,0,VIEW.dpr,0,0);ctx.clearRect(0,0,VIEW.w,VIEW.h);
  ctx.save();ctx.translate(VIEW.ox,VIEW.oy);ctx.scale(VIEW.s,VIEW.s);
  const t=S.t||0;
  if(isHome(S)){
    roomBack(ctx,S,t);drawMirror(ctx);drawShelf(ctx);drawSofa(ctx,S);drawPhone(ctx,S,t);drawBed(ctx,S);drawEasel(ctx,S);drawKitchen(ctx,S,t);drawDoor(ctx);
  } else drawStreet(ctx,t);
  // The isometric fallback used to put other residents inside the sofa arm.
  // Two sitters take separate cushions, without changing the authored story.
  const mainSeated=S.sim?.pose==='sit'&&S.sim?.at==='sofa';
  const npcSeated=S.npc?.pose==='sit'&&S.npc?.at==='sofa';
  if(S.npc?.pose==='stand'||npcSeated){
   const npcAt=npcSeated?(mainSeated?[390,561]:[455,561]):projection(S.npc.pos[0],S.npc.pos[1],0);
   drawActor(ctx,npcAt[0],npcAt[1],npcOpts(),drawFigure);
  }
  const sim=window.BFNavigation?.position?.(S)||(mainSeated?(npcSeated?[516,561]:[455,561]):simFoot());
  window.BFRig?.onStep?.(S.sim,sim);
  drawActor(ctx,sim[0],sim[1],simOpts(),drawFigure);
  window.BFStageSync?.paintActorProp?.(ctx,sim,S);
  window.BFNavigation?.debugDraw?.(ctx);
  if(isHome(S))roomFront(ctx,S);
  if(S.vars?.attune==='depleted')box(ctx,0,0,SW,SH,'rgba(37,43,52,.055)');
  ctx.restore();
  const thought=document.getElementById('thought');if(thought){thought.style.left=(VIEW.ox+(sim[0]+92)*VIEW.s)+'px';thought.style.top=(VIEW.oy+(sim[1]-202)*VIEW.s)+'px';}
  return true;
 }
 function placePins(V,S,objects){
   if(!active)return false;
   const actorWorld=window.BFNavigation?.position?.(S)|| (S?.sim?.pose==='sit'?[...projection(1,4.3,.5)]:projection(S?.sim?.x||1.9,S?.sim?.y||4.1,0));
   const hx=V.ox+actorWorld[0]*V.s,hy=V.oy+(actorWorld[1]-145)*V.s;
   for(const [id,xy] of Object.entries(pins)){
     const b=stage.querySelector(`.pin[data-obj="${id}"]`);if(!b)continue;
     let x=V.ox+xy[0]*V.s,y=V.oy+xy[1]*V.s;
     // The marker may be close to the hands, never sit over the face.
     if(Math.abs(x-hx)<33 && Math.abs(y-hy)<34){x+=x<hx?-42:42;y-=18;}
     // A marker that the frame would cut in half moves fully inside it.
     if(x>-24&&x<28)x=28;else if(x>V.w-28&&x<V.w+24)x=V.w-28;
     b.style.left=x+'px';b.style.top=y+'px';
   }
   const npc=stage.querySelector('.pin.npc');if(npc&&S?.npc?.pin){const xy=projection(...S.npc.pin);npc.style.left=(V.ox+xy[0]*V.s)+'px';npc.style.top=(V.oy+(xy[1]-117)*V.s)+'px';}
   return true;
 }
 function navigate(key){if(!sections[key])return;selected=key;manualUntil=Infinity;syncNav();}
 function syncNav(S=window.LW?.S){
   const visible=currentSection(S);
   for(const b of nav?.querySelectorAll('button[data-room]')||[]){
     const active=b.dataset.room===visible;
     b.setAttribute('aria-pressed',String(active));
     if(active)b.setAttribute('aria-current','location');else b.removeAttribute('aria-current');
   }
   nav?.setAttribute('data-visible-room',visible);
   // Keep visual emphasis tied to the same room selection as the ARIA tabs.
   // Inactive pins remain interactive and become fully visible on hover/focus.
   for(const pin of stage.querySelectorAll('.pin[data-obj]')){
     const other=roomByObject[pin.dataset.obj]!==visible?'true':'false';
     if(pin.dataset.bfOtherRoom!==other)pin.dataset.bfOtherRoom=other;
   }
 }
 function approach(m){if(roomByObject[m?.obj]){selected=roomByObject[m.obj];manualUntil=0;syncNav();}}
 function mountNav(){
   if(!nav)return;
   const portrait=innerHeight>innerWidth;
   const target=portrait?(innerWidth<900?document.getElementById('dock'):document.getElementById('sdock')):null;
   if(target){
     if(nav.parentElement!==target)target.insertBefore(nav,target.firstChild);
     nav.classList.add('bf-nav-docked');
   }else{
     if(nav.parentElement!==scene)scene.appendChild(nav);
     nav.classList.remove('bf-nav-docked');
   }
 }
 function removeLegacyRoomBars(){
   for(const el of app.querySelectorAll('.room-nav,.room-tabs,.room-switcher,[role="tablist"]')){
     if(el===nav||nav?.contains(el))continue;
     const labels=[...el.querySelectorAll('button')].map(b=>b.textContent.trim().toLowerCase());
     if(['living','bedroom','kitchen'].every(x=>labels.includes(x)))el.remove();
   }
 }
 function setup(){
   app.classList.add('bf-new-room');
   const header=app.querySelector('.topbar');
   // Debug overlays are not part of the player experience.
   if(new URLSearchParams(location.search).get('bfdebug')==='1'&&header&&!header.querySelector('#bf-build-label')){
     buildTag=document.createElement('span');buildTag.id='bf-build-label';
     buildTag.textContent='DEV · ROOM 8.2';buildTag.title='Developer build diagnostics';
     header.insertBefore(buildTag,header.querySelector('.clockbox'));
   }
   nav=app.querySelector('#bf-room-nav')||document.createElement('nav');
   nav.id='bf-room-nav';nav.setAttribute('aria-label','Move between areas of the apartment');
   for(const [id,v] of Object.entries(sections)){
    const b=document.createElement('button');b.type='button';b.dataset.room=id;b.textContent=v.name;b.setAttribute('aria-pressed',String(id===selected));b.addEventListener('click',()=>navigate(id));nav.append(b);
   }
   const follow=document.createElement('button');
   follow.type='button';follow.className='bf-follow-actor';follow.textContent='◎';
   follow.title='Return camera to the character';follow.setAttribute('aria-label','Show the character');
   follow.hidden=true;
   follow.addEventListener('click',()=>{
      const q=window.LW?.S?.sim;
      if(!q)return;
      const xx=window.BFNavigation?.position?.(window.LW?.S)?.[0]??projection(q.x,q.y)[0];
      const area=roomByObject[q.at]|| (xx<635?'living':xx<1020?'sleeping':'kitchen');
      navigate(area);
   });
   nav.appendChild(follow);
   mountNav();removeLegacyRoomBars();syncNav();
   // The old route sometimes reinserted a second set of tabs after re-render.
   // Remove only bars with the exact same three section names, never story/choice tabs.
   const legacyObserver=new MutationObserver(removeLegacyRoomBars);
   legacyObserver.observe(app,{childList:true,subtree:true});
   // Make follow-up decisions immediately readable on phones. The story
   // remains available via an explicit "Show thoughts" control; this visual
   // priority is temporary and does not change the saved Story setting.
   const result=document.getElementById('result');
   let manuallyExpandedEntry=null;
   const compactChoices=()=>{
     if(!result)return;
     const moment=result.querySelector('.bf-moment[data-stage="choosing"]');
     const smallPortrait=innerWidth<900&&innerHeight>innerWidth;
     const should=!!moment&&smallPortrait&&manuallyExpandedEntry!==moment.dataset.entry;
     result.classList.toggle('bf-choice-priority',should);
     let reveal=result.querySelector('.bf-choice-reveal');
     const head=result.querySelector('.story-thread-head');
     if(should&&head&&!reveal){
       reveal=document.createElement('button');reveal.type='button';reveal.className='bf-choice-reveal';
       reveal.textContent='Show thoughts ▾';reveal.setAttribute('aria-label','Expand fictional inner voice');
       reveal.addEventListener('click',()=>{
         manuallyExpandedEntry=moment.dataset.entry;
         result.classList.remove('bf-choice-priority');reveal.remove();
       });
       head.appendChild(reveal);
     } else if(!should&&reveal)reveal.remove();
   };
   if(result){new MutationObserver(compactChoices).observe(result,{childList:true});
     window.addEventListener('resize',compactChoices,{passive:true});compactChoices();}
   // On portrait tablets, the reading card must occupy its own area, not cover
   // the bottom portion of the room or its navigation.
   const layout=app.querySelector('.layout');
   const relocateStory=()=>{
     const sd=document.getElementById('sdock');
     if(!layout||!sd)return;
     const separate=innerWidth>=900&&innerHeight>innerWidth;
     if(separate&&sd.parentElement!==layout)layout.appendChild(sd);
     else if(!separate&&sd.parentElement===layout)scene.appendChild(sd);
   };
   new MutationObserver(relocateStory).observe(scene,{childList:true});
   window.addEventListener('resize',()=>{relocateStory();mountNav();syncNav();},{passive:true});
   relocateStory();mountNav();syncNav();
   function rebindBody(){
     const pinsRoot=document.getElementById('pins');
     const fresh=pinsRoot?.querySelector('#simBtn');
     const existing=scene.querySelector('#simBtn');
     if(!fresh&&existing)return;
     // 8.3.8: every earlier copy goes, so the id stays unique and no stale label lingers.
     if(fresh)for(const old of scene.querySelectorAll('#simBtn,[data-bf-legacy-body]'))if(old!==fresh)old.remove();
     const sb=fresh||existing;if(!sb)return;
     sb.innerHTML='<span aria-hidden="true">◉</span><span>Body check-in</span>';
     sb.setAttribute('aria-label','Body check-in: explore how the character feels physically');
     sb.title='Body check-in: explore bodily sensations and needs';
     if(sb.parentElement!==scene)scene.appendChild(sb);
   }
   rebindBody();
   const pinRoot=document.getElementById('pins');
   if(pinRoot)new MutationObserver(rebindBody).observe(pinRoot,{childList:true});
   // Horizontal swipes pan the apartment; taps and the object's native click
   // handler remain untouched. Do not intercept menus or the original controls.
   let swipe=null;
   const canvas=scene.querySelector('#cv');
   canvas?.addEventListener('pointerdown',e=>{
     if(e.pointerType==='touch' && !document.body.classList.contains('bf-action-dialog-open'))
       swipe={x:e.clientX,y:e.clientY,time:performance.now()};
   },{passive:true});
   canvas?.addEventListener('pointerup',e=>{
     if(!swipe)return;const dx=e.clientX-swipe.x,dy=e.clientY-swipe.y;
     const elapsed=performance.now()-swipe.time;swipe=null;
     if(Math.abs(dx)>65 && Math.abs(dx)>Math.abs(dy)*1.5 && elapsed<800){
       const keys=Object.keys(sections),i=keys.indexOf(selected);
       navigate(keys[clamp(i+(dx<0?1:-1),0,keys.length-1)]);
     }
   },{passive:true});
   canvas?.addEventListener('pointercancel',()=>{swipe=null},{passive:true});
   const last=app.querySelector('#wStrip');if(last)last.title='World and context information';
   // Keep the quiet, narrative-first mobile layout across tablets and desktop.
   try{window.BFPresentation?.setFocus?.(true);}catch(_){}
   window.dispatchEvent(new Event('resize'));relocateStory();mountNav();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup();
 window.BFRoom={version:'8.2',active,SW,SH,projection,render,placePins,cameraTarget,scale,navigate,approach,currentSection,get drawn(){return drawn},get selected(){return currentSection(window.LW?.S)}};
})();