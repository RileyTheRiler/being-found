/* Being Found 8.1 — prop and character choreography for the side-scrolling flat.
 * This module is intentionally PRESENTATIONAL. It reads the original action
 * timeline and authored decisions; it never awards skill bonuses, changes
 * clinical state, or invents the outcome of an incomplete action.
 */
(() => {
 'use strict';
 if(window.BFStageSync)return;
 const S=window.LW?.S;
 if(!S)return;
 const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 const home=s=>!!s&&s.mode==='play'&&s.flat?.id==='rooted'&&s.place!=='street';
 let intent=null,arrival=null,last=null,sceneKey=null;
 let draws=0,propDraws=0;
 const sceneId=s=>s?`${s.flat?.id}:${s.phaseIx}`:'';
 function syncScene(s){const id=sceneId(s);if(sceneKey!==id){intent=null;arrival=null;last=null;sceneKey=id;}}
 function begin(m,s=S){
   if(!home(s)||!m||m.st==='sealed')return;
   syncScene(s);
   // A queued second action is not underway until choose() runs again.
   if(s.sim?.act)return;
   intent={obj:m.obj,act:m.a?.id||'',kind:m.a?.kind||'',started:performance.now()};
   arrival=null;
 }
 function arrive(id,s=S){if(!home(s))return;syncScene(s);arrival=id;}
 function finish(m,sealed,s=S){
   if(!home(s)||!m)return;
   syncScene(s);
   if(!sealed)last={obj:m.obj,act:m.a?.id||'',time:performance.now()};
   intent=null;
 }
 function reset(s=S){intent=null;arrival=null;last=null;sceneKey=sceneId(s);}
 function current(s=S){
   if(!home(s))return null;
   syncScene(s);
   const sim=s.sim;
   if(!sim?.act||!sim?.at||sim.at!==intent?.obj)return null;
   return {obj:intent.obj,act:intent.act,kind:intent.kind,
     u:clamp((sim.prog||0)/Math.max(.1,sim.dur||1)),
     arrived:arrival===intent.obj};
 }
 function breakfast(s=S){
   if(!home(s))return 'untouched';
   // The original authored journal is the single source of truth. Reading the
   // latest entry prevents a prior pan choice from applying to a newer meal.
   const entries=window.BFStory?.moments?.history||[];
   const e=entries.find(x=>x.flat===s.flat?.name&&x.name==='Breakfast');
   if(e){
     if(e.choiceText){
       if(e.choiceText.includes('back on the rack'))return 'washed';
       if(e.choiceText.includes('beside the sink'))return 'later';
     }
     return 'used';
   }
   return last?.obj==='stove'&&last.act==='fry'?'used':'untouched';
 }
 function painted(s=S){
   if(!home(s))return 0;
   return clamp(((s.fx?.painted??.55)-.55)/.45);
 }
 function phoneHeld(s=S){const a=current(s);return !!(a&&a.obj==='phone'&&['call','msg'].includes(a.act)&&a.u>=.28);}
 function frame(s=S,o){
   if(!home(s)||!o?.bfMainActor)return null;
   const a=current(s);if(!a)return null;
   // Pose and physical seat anchor change together. Never select the
   // standing/reach sprite while the actor is already at the seated pivot.
   if(a.obj==='sofa'&&s.sim.pose==='sit')return ['sit',11];
   if(a.obj==='phone'&&['call','msg'].includes(a.act))return a.u>=.28?['phone',12]:['reach',7+Math.floor(a.u*7)];
   if(a.obj==='stove'||a.obj==='easel'||a.obj==='window')return ['reach',7+Math.min(3,Math.floor(a.u*4))];
   return null;
 }
 function box(c,x,y,w,h,color,r=0){c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=color;c.fill();}
 function ellipse(c,x,y,rx,ry,color){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=color;c.fill();}
 function stroke(c,x1,y1,x2,y2,color,width=2){c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.lineWidth=width;c.strokeStyle=color;c.stroke();}
 function pan(c,x,y,angle=0,egg=false,clean=false){
   c.save();c.translate(x,y);c.rotate(angle);
   ellipse(c,0,0,54,13,'#343d3f');ellipse(c,0,-2,46,9,clean?'#9eaead':'#60696b');
   ellipse(c,0,-3,37,5,clean?'#c6d4d0':'#434c50');
   box(c,46,-4,47,8,'#4b5252',4);ellipse(c,88,0,6,5,'#888e88');
   if(egg){ellipse(c,-9,-4,21,7,'#f6f2e3');ellipse(c,-12,-4,8,5,'#efb44f');ellipse(c,-13,-6,2,1,'#fff6c1');}
   if(clean){stroke(c,-20,-7,-17,-15,'rgba(240,251,248,.85)',2);stroke(c,-13,-8,-10,-15,'rgba(240,251,248,.8)',1);}
   c.restore();
 }
 function paintKitchen(c,s,t){
   if(!home(s))return;
   const a=current(s),doing=a?.obj==='stove',stage=doing?a.u:0;
   const condition=breakfast(s);
   // The stage coordinates match the drawn hob and sink in room.js.
   if(doing||condition==='used'||condition==='untouched'){
     const tilt=doing&&!reduced()&&stage>.24&&stage<.8?Math.sin(stage*Math.PI*5)*.045:0;
     // An egg is present only if the scene has proceeded far enough to cook;
     // the complication branch can instead leave the clean pan unused.
     const lastBreakfast=window.BFStory?.moments?.history?.find(x=>x.name==='Breakfast'&&x.flat===s.flat?.name);
     const skipped=lastBreakfast?.categoryCode==='complication';
     pan(c,1104,429,tilt,(doing&&stage>.4)||(condition==='used'&&!skipped),false);
     if(doing&&stage>.34){
       c.save();c.globalAlpha=clamp((stage-.34)*3)*.55;
       for(let i=0;i<3;i++){
         const drift=reduced()?0:Math.sin(t*1.6+i)*4;
         c.beginPath();c.moveTo(1081+i*19,412);c.bezierCurveTo(1078+i*18+drift,396,1097+i*16+drift,378,1085+i*17,354);
         c.strokeStyle='#fffbed';c.lineWidth=2.2;c.stroke();
       }
       c.restore();
     }
   }
   if(!doing&&condition==='later'){
     // The pan stays beside the sink after the player's explicit decision.
     pan(c,1285,426,-.07,false,false);
     ellipse(c,1347,428,10,4,'rgba(162,145,120,.65)');
   }
   if(!doing&&condition==='washed'){
     // Clean, dry pan on the hanging rack. No detached dish appears in the sink.
     stroke(c,1406,376,1406,400,'#87938b',3);
     c.save();c.translate(1410,405);c.scale(.28,1);ellipse(c,0,0,40,29,'#5a6968');ellipse(c,0,-1,32,22,'#aebbb4');c.restore();
     stroke(c,1410,428,1410,444,'#697875',4);
   }
   if(doing&&stage>.06&&stage<.65){
     // Hand-sized utensil moves toward the cooker on the same action clock.
     const handX=1160+clamp(stage*5)*15;
     stroke(c,handX,454-stage*18,handX+29,439-stage*18,'#8d6b4f',4);
     ellipse(c,handX+31,436-stage*18,11,4,'#5d6262');
   }
 }
 function paintEasel(c,s,t){
   if(!home(s))return;
   const p=painted(s),a=current(s),doing=a?.obj==='easel'&&a.act==='paint';
   if(p>.04){
     c.save();c.beginPath();c.rect(953,340,63,105);c.clip();
     for(let i=0;i<7;i++){
       if(p<(i+1)/8)break;
       c.beginPath();c.moveTo(956+i*7,424-i*6);c.quadraticCurveTo(976+i*3,406-i*11,1004+i*2,381+i*2);
       c.lineWidth=3.2;c.strokeStyle=['#779aa2','#d7a37d','#78948f','#7fa6b1'][i%4];c.stroke();
     }
     c.restore();
   }
   if(doing){
     const y=405-(a.u*16),x=982+Math.sin(a.u*Math.PI*3)*7;
     stroke(c,x-9,y+12,x+6,y-6,'#967650',3);
     ellipse(c,x+7,y-8,4,6,'#427b82');
     if(!reduced())ellipse(c,x+10,y-8,2,2,'#b7d0cc');
   }
 }
 function paintSofa(c,s){
   if(!home(s))return;
   const sitting=s.sim?.at==='sofa'&&s.sim?.pose==='sit',a=current(s),u=a?.obj==='sofa'?a.u:1;
   if(!sitting)return;
   const comp=clamp((u-.2)/.58);
   // The cushion compresses as Noor settles, then remains gently indented.
   const dent=3.5*comp;
   box(c,415,483+dent,97,13,'rgba(108,85,60,.14)',7);
   stroke(c,438,500+dent,494,499+dent,'rgba(116,82,65,.23)',1.7);
 }
 function paintActorProp(c,xy,s){
   if(!home(s)||!Array.isArray(xy))return;
   const a=current(s);if(!a)return;
   const [x,y]=xy;
   if(a.obj==='phone'&&a.u>.28&&['call','msg'].includes(a.act)&&!window.BFRig?.loaded&&!window.BFArt?.enabled){
     // Held device lines up with the right wrist of the model sprite.
     c.save();c.translate(x+24,y-103);c.rotate(.13);
     box(c,-7,-17,13,27,'#253c44',3);box(c,-5,-14,9,20,'#accdd0',2);
     ellipse(c,-1,7,1.3,1.3,'#e2e7db');c.restore();propDraws++;
   }
   if(a.obj==='stove'&&a.u>.22){
     // Reach/action prop is behind the counter and physically near the hand.
     stroke(c,x+8,y-95,x+27,y-125,'#937651',2.7);propDraws++;
   }
 }
 function snapshot(s=S){
   const a=current(s);
   return {version:'8.1',flat:s?.flat?.id,scene:sceneId(s),arrival,last,
     current:a,breakfast:breakfast(s),painted:painted(s),phoneHeld:phoneHeld(s),
     draws,propDraws};
 }
 window.BFStageSync={version:'8.1',isHome:home,begin,arrive,finish,reset,current,breakfast,painted,phoneHeld,frame,
   paintKitchen(c,s,t){draws++;paintKitchen(c,s,t);},paintEasel,paintSofa,paintActorProp,snapshot};
})();