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
   intent={obj:m.obj,act:m.a?.id||'',kind:m.a?.kind||'',state:m.st,started:performance.now(),
     alreadySitting:m.obj==='sofa'&&s.sim?.pose==='sit'&&s.sim?.at==='sofa'};
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
   return {obj:intent.obj,act:intent.act,kind:intent.kind,state:intent.state,
     u:clamp((sim.prog||0)/Math.max(.1,sim.dur||1)),
     arrived:arrival===intent.obj,alreadySitting:!!intent.alreadySitting};
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
 // Presentational phone motion is tied to the existing authored action clock,
 // not to a timer that can outlive a scene change or complete the action twice.
 // A deliberate lift, sustained use, and reverse return all fit in the
 // phone-specific minimum duration set by build.js.
 const ease=t=>{const v=clamp(t);return v*v*(3-2*v);};
 function phoneMotion(s=S){
   const a=current(s);
   if(!a||a.obj!=='phone'||!['call','msg'].includes(a.act))return null;
   const u=a.u;
   let frame=0,next=null,mix=0,stage='rest';
   if(u<.04){stage='orient';}
   else if(u<.22){stage='reach';frame=7+Math.min(3,Math.floor((u-.04)/.18*4));}
   else if(u<.29){stage='lift';frame=10;next=12;mix=ease((u-.22)/.07);}
   else if(u<.75){stage='use';frame=12;}
   else if(u<.82){stage='lower';frame=12;next=10;mix=ease((u-.75)/.07);}
   else if(u<.96){stage='release';frame=10-Math.min(3,Math.floor((u-.82)/.14*4));}
   else{stage='rest';}
   // The handset cannot simultaneously be on the table and in the hand.
   const table=u<.22||u>=.96;
   return {u,stage,frame,next,mix,table,action:a.act};
 }
 function phoneHeld(s=S){const p=phoneMotion(s);return !!p&&!p.table;}
 // The sitting pose in the old engine begins at arrival. This presentation
 // stage moves the model from the floor to the cushion instead of teleporting
 // its feet. Leaving the seat is paced by BFNavigation before walking begins.
 function seatMotion(s=S){
   if(!home(s))return null;
   const leaving=window.BFNavigation?.seatExit;
   if(leaving)return {kind:'rise',u:leaving.u,progress:ease(leaving.u),stage:leaving.u<.4?'lean':'push'};
   if(s.sim?.at!=='sofa'||s.sim?.pose!=='sit')return null;
   const a=current(s),u=a?.obj==='sofa'&&!a.alreadySitting?a.u:1;
   const progress=ease(u/.64);
   return {kind:'sit',u,progress,stage:progress<.20?'turn':progress<.8?'lower':'settle'};
 }
 // The art is deliberately an abbreviated gesture, not the complete duration
 // of the authored meal or painting. Respect outcome-specific state elsewhere.
 function workMotion(s=S){
   const a=current(s);
   if(!a||!(a.obj==='stove'||a.obj==='easel'&&a.act==='paint'))return null;
   const u=a.u,stages=a.obj==='stove'?['prepare','reach','work','return']:['prepare','lift','stroke','return'];
   const stage=u<.16?stages[0]:u<.32?stages[1]:u<.79?stages[2]:stages[3];
   const reach=ease((u-.12)/.2)*(1-ease((u-.8)/.2));
   const work=clamp((u-.32)/.47);
   const stroke=stage===stages[2]?Math.sin(work*Math.PI*5):0;
   const frame=stage===stages[0]?0:stage===stages[3]?7+Math.round(3*reach):stage===stages[2]?9+(stroke>0?1:0):7+Math.round(3*reach);
   return {obj:a.obj,act:a.act,state:a.state,u,stage,reach,work,stroke,frame};
 }
 function frame(s=S,o){
   if(!home(s)||!o?.bfMainActor)return null;
   const seat=seatMotion(s);
   if(seat?.kind==='rise')return seat.progress<.44?['sit',11]:['reach',10-Math.min(3,Math.floor((seat.progress-.44)/.56*4))];
   const a=current(s);if(!a)return null;
   // The seat interpolation is drawn by BFNavigation and BFRig together.
   // The atlas remains opaque when the pose changes at the midpoint.
   if(seat?.kind==='sit')return seat.progress<.55?['reach',7+Math.min(3,Math.floor(seat.progress*6))]:['sit',11];
   if(a.obj==='phone'&&['call','msg'].includes(a.act)){
     const p=phoneMotion(s),col=p.next!=null&&p.mix>=.5?p.next:p.frame;
     return [p.stage==='use'?'phone':'reach',col];
   }
   const work=workMotion(s);
   if(work)return [work.stage==='prepare'?'idle':'reach',work.frame];
   if(a.obj==='window')return ['reach',7+Math.min(3,Math.floor(a.u*4))];
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
   const a=current(s),m=workMotion(s),doing=a?.obj==='stove',condition=breakfast(s);
   // The pan stays attached to the hob and turns only during the working beat.
   // Steam is delayed until heat has actually been applied.
   if(doing||condition==='used'||condition==='untouched'){
     const active=m?.stage==='work';
     const stir=active&&!reduced()?Math.sin(m.work*Math.PI*5):0;
     const lastBreakfast=window.BFStory?.moments?.history?.find(x=>x.name==='Breakfast'&&x.flat===s.flat?.name);
     const skipped=lastBreakfast?.categoryCode==='complication';
     const egg=(doing&&a.act==='fry'&&m?.u>.52)||(condition==='used'&&!skipped);
     pan(c,1104,429,stir*.055,egg,false);
     if(doing&&m?.u>.38){
       c.save();c.globalAlpha=ease((m.u-.38)/.20)*(1-ease((m.u-.90)/.10))*.48;
       for(let i=0;i<3;i++){
         const drift=reduced()?0:Math.sin(t*1.6+i)*3;
         c.beginPath();c.moveTo(1081+i*19,412);
         c.bezierCurveTo(1078+i*18+drift,396,1097+i*16+drift,378,1085+i*17,354);
         c.strokeStyle='#fffbed';c.lineWidth=2.2;c.stroke();
       }
       c.restore();
     }
   }
   if(!doing&&condition==='later'){
     pan(c,1285,426,-.07,false,false);
     ellipse(c,1347,428,10,4,'rgba(162,145,120,.65)');
   }
   if(!doing&&condition==='washed'){
     stroke(c,1406,376,1406,400,'#87938b',3);
     c.save();c.translate(1410,405);c.scale(.28,1);ellipse(c,0,0,40,29,'#5a6968');ellipse(c,0,-1,32,22,'#aebbb4');c.restore();
     stroke(c,1410,428,1410,444,'#697875',4);
   }
   if(doing&&m?.reach>.04){
     // A short utensil rests against the right side of the hob. The contact
     // point is stable; only the handle pivots during the working interval.
     const stir=m.stage==='work'&&!reduced()?Math.sin(m.work*Math.PI*5)*5:0;
     const tipX=1152+stir,tipY=424;
     const handX=1203+stir*.35,handY=462-8*m.reach;
     stroke(c,tipX,tipY,handX,handY,'#9d7653',4);
     ellipse(c,tipX-4,tipY-2,11,5,'#656c65');
   }
 }
 function paintEasel(c,s,t){
   if(!home(s))return;
   const p=painted(s),m=workMotion(s),doing=m?.obj==='easel';
   const makesMark=m?.state==='open'||m?.state==='hollow';
   if(p>.04){
     c.save();c.beginPath();c.rect(953,340,63,105);c.clip();
     for(let i=0;i<7;i++){
       if(p<(i+1)/8)break;
       c.beginPath();c.moveTo(956+i*7,424-i*6);
       c.quadraticCurveTo(976+i*3,406-i*11,1004+i*2,381+i*2);
       c.lineWidth=3.2;c.strokeStyle=['#779aa2','#d7a37d','#78948f','#7fa6b1'][i%4];c.stroke();
     }
     c.restore();
   }
   if(doing){
     // Brief trial marks follow the brush along the canvas but are not saved.
     // The authored painting only persists when its existing outcome allows it.
     const work=m.work,working=m.stage==='stroke';
     const passes=!makesMark?0:working?Math.min(4,Math.floor(work*5)):m.stage==='return'?4:0;
     c.save();c.beginPath();c.rect(954,340,61,104);c.clip();
     for(let i=0;i<passes;i++){
       const x=970+i*6,y=430-i*8;
       stroke(c,x,y,x+12,y-10,['#779aa2','#d7a37d','#78948f','#7fa6b1'][i],2.5);
     }
     c.restore();
     if(m.reach>.03){
       const wave=working&&!reduced()?Math.sin(work*Math.PI*4)*9:0;
       const x=977+wave,y=432-(working?work*19:0);
       stroke(c,x-7,y+13,x+5,y-7,'#9d7653',3.3);
       ellipse(c,x+6,y-8,4,5,'#427b82');
       if(!reduced())ellipse(c,x+8,y-9,2,2,'#b7d0cc');
     }
   }
 }
 function paintSofa(c,s){
   if(!home(s))return;
   const sitting=s.sim?.at==='sofa'&&s.sim?.pose==='sit',seat=seatMotion(s);
   if(!sitting)return;
   const comp=seat?.progress??1;
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
     current:a,breakfast:breakfast(s),painted:painted(s),phoneHeld:phoneHeld(s),phoneMotion:phoneMotion(s),
     seatMotion:seatMotion(s),workMotion:workMotion(s),
     draws,propDraws};
 }
 window.BFStageSync={version:'8.1.2',isHome:home,begin,arrive,finish,reset,current,breakfast,painted,phoneHeld,phoneMotion,seatMotion,workMotion,frame,
   paintKitchen(c,s,t){draws++;paintKitchen(c,s,t);},paintEasel,paintSofa,paintActorProp,snapshot};
})();