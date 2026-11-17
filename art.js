/* Being Found 7.3 — authored vector character rig and spatial object animation.
 * The game remains an isometric Canvas narrative. This is an original scalable
 * character-art layer, not a 3D mesh or a generative per-frame sprite sheet.
 * All gameplay, collision geometry, narrative goals and dialogue remain native. */
(() => {
  'use strict';
  if (window.BFArt) return;
  const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
  const lerp=(a,b,t)=>a+(b-a)*t;
  let lastIntent=null, lastKitchen=null;
  let enabled=true;
  try { enabled=localStorage.getItem('beingfound.character_art')!=='classic'; } catch(e) {}
  const rm=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches||false;
  const srcColors=(s,src)=>String(src||s||'#777777').replace('#','');
  function shift(hex,delta){
    let t=srcColors('#777777',hex);
    if(t.length===3)t=t.split('').map(x=>x+x).join('');
    if(!/^[0-9a-f]{6}$/i.test(t))return hex;
    const channels=[0,2,4].map(i=>clamp(parseInt(t.slice(i,i+2),16)+delta,0,255)|0);
    return '#'+channels.map(x=>x.toString(16).padStart(2,'0')).join('');
  }
  function rounded(ctx,x,y,w,h,r=3){
    const rr=Math.min(r,Math.abs(w)/2,Math.abs(h)/2);ctx.beginPath();
    ctx.moveTo(x+rr,y);ctx.lineTo(x+w-rr,y);ctx.quadraticCurveTo(x+w,y,x+w,y+rr);
    ctx.lineTo(x+w,y+h-rr);ctx.quadraticCurveTo(x+w,y+h,x+w-rr,y+h);
    ctx.lineTo(x+rr,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-rr);
    ctx.lineTo(x,y+rr);ctx.quadraticCurveTo(x,y,x+rr,y);ctx.closePath();
  }
  function gradient(ctx,ca,cb,x,y,h=20){const g=ctx.createLinearGradient(x,y,x+h*.6,y+h);g.addColorStop(0,ca);g.addColorStop(.44,cb);g.addColorStop(1,ca);return g;}
  function ellipse(ctx,x,y,rx,ry,fill,rotation=0){ctx.beginPath();ctx.ellipse(x,y,rx,ry,rotation,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();}
  function stroke(ctx,from,to,width,col){ctx.beginPath();ctx.moveTo(...from);ctx.lineTo(...to);ctx.lineCap='round';ctx.lineWidth=width;ctx.strokeStyle=col;ctx.stroke();}
  function trouser(ctx,hip,knee,ankle,w,col,light){
    const a=[hip,knee,ankle];stroke(ctx,hip,knee,w+.6,shift(col,-21));stroke(ctx,knee,ankle,w,shift(col,-17));
    stroke(ctx,[hip[0]-w*.18,hip[1]-1],[knee[0]-w*.18,knee[1]-1],w*.6,col);
    stroke(ctx,[knee[0]-w*.18,knee[1]-1],[ankle[0]-w*.18,ankle[1]-1],w*.57,col);
    stroke(ctx,[hip[0]-w*.33,hip[1]-1],[knee[0]-w*.33,knee[1]-1],.55,shift(col,light));
  }
  function shoe(ctx,x,y,mirror,col){
    ctx.save();ctx.translate(x,y);ctx.scale(mirror,1);
    ellipse(ctx,1,-.7,5.3,2.45,shift(col,-43),-.1);
    ctx.beginPath();ctx.moveTo(-4.7,-1.8);ctx.quadraticCurveTo(.3,-3.4,5.1,-2);
    ctx.strokeStyle=shift(col,31);ctx.lineWidth=.85;ctx.stroke();ctx.restore();
  }
  function sleeve(ctx,shoulder,elbow,hand,col,skin){
    stroke(ctx,shoulder,elbow,7,shift(col,-19));stroke(ctx,elbow,hand,6.1,col);
    stroke(ctx,[shoulder[0]-1.15,shoulder[1]],[elbow[0]-1.15,elbow[1]],1.2,shift(col,23));
    ellipse(ctx,hand[0],hand[1],3.3,3.8,gradient(ctx,shift(skin,15),shift(skin,-10),hand[0]-3,hand[1]-2,7),-.12);
  }
  function hairStyle(profile){
    const byId={rooted:0,grief:2,depression:1,unreal:1,uncanny:3,mika:2,walt:3,ruth:0,kai:2};
    return byId[profile]??1;
  }
  function head(ctx,cx,cy,ch,profile,face,flip,mood,paint,lying){
    const skin=ch.skin||'#c58e69',hair=ch.hair||'#3d3229',style=hairStyle(profile);
    ctx.save();ctx.translate(cx,cy);ctx.scale(flip===-1?-1:1,1);
    const back=face==='back', r=style===0?10.9:10.3;
    // Nape hair, ear and head are independently shaded to keep direction readable.
    if(style===0||style===2){ellipse(ctx,-6.2,5,6.5,12,paint(shift(hair,-9)));ellipse(ctx,6.4,5,6.1,11.3,paint(hair));}
    ellipse(ctx,0,-.6,r,11.3,gradient(ctx,paint(shift(hair,12)),paint(shift(hair,-14)),-8,-10,18));
    if(back){
      ellipse(ctx,0,0,9.5,10.8,gradient(ctx,paint(shift(hair,18)),paint(shift(hair,-21)),-7,-7,18));
      ctx.beginPath();ctx.moveTo(-8.5,-2.2);ctx.quadraticCurveTo(-3.5,-13.5,4,-11);ctx.quadraticCurveTo(10,-8,8.5,-1);
      ctx.lineWidth=1.1;ctx.strokeStyle=paint(shift(hair,28));ctx.stroke();
      if(style===2)ellipse(ctx,0,6.7,4.9,3.1,paint(hair));
      ctx.restore();return;
    }
    ellipse(ctx,0,1.2,8.9,10.4,gradient(ctx,paint(shift(skin,21)),paint(shift(skin,-11)),-7,-7,18));
    // Side pieces, side-part and hairline are drawn in front of skin.
    ctx.beginPath();ctx.moveTo(-9.4,-4.5);ctx.bezierCurveTo(-8,-14,4.3,-15.3,9,-7.3);
    ctx.bezierCurveTo(5.4,-6.1,1,-7.6,-2,-5.3);ctx.bezierCurveTo(-5.5,-3.6,-8.8,-2.6,-9.4,-4.5);
    ctx.closePath();ctx.fillStyle=paint(hair);ctx.fill();
    ctx.beginPath();ctx.moveTo(7,-9);ctx.quadraticCurveTo(12,-3,9.5,6.5);
    ctx.quadraticCurveTo(8,7,7.5,5.3);ctx.quadraticCurveTo(8,-3,4,-7);ctx.fillStyle=paint(shift(hair,-9));ctx.fill();
    if(style===0){
      ctx.beginPath();ctx.moveTo(-8,-7);ctx.quadraticCurveTo(-12,5,-9,12);
      ctx.quadraticCurveTo(-6.4,14,-5,8);ctx.quadraticCurveTo(-7.3,-2,-2.2,-8);
      ctx.fillStyle=paint(hair);ctx.fill();
    } else if(style===2){
      ellipse(ctx,-7.4,-6,4.5,4.2,paint(hair));ellipse(ctx,-2.4,-10,5,3.5,paint(shift(hair,8)));
    } else if(style===3){ellipse(ctx,7,-7,4.9,4.8,paint(shift(hair,-6)));}
    // Eyes, warm cheek shadows, nose, restrained expression. Independent of diagnoses.
    if(!lying){
      const eye=paint('#25272a');
      ellipse(ctx,-3.2,2.2,.99,1.17,eye);
      ellipse(ctx,3.3,2.2,.99,1.17,eye);
      ellipse(ctx,-4.9,4.3,2,.9,paint(shift(skin,10)));
      ellipse(ctx,5,4.3,2,.9,paint(shift(skin,11)));
      ctx.beginPath();ctx.moveTo(0,2.3);ctx.lineTo(-.5,4.7);ctx.lineWidth=.65;ctx.strokeStyle=paint(shift(skin,-31));ctx.stroke();
      ctx.beginPath();if(mood>0){ctx.moveTo(-2.3,7);ctx.quadraticCurveTo(0,8.7,2.5,7);}
      else if(mood<0){ctx.moveTo(-2.1,7.5);ctx.quadraticCurveTo(0,6.2,2.1,7.5);}
      else{ctx.moveTo(-1.8,7.3);ctx.lineTo(1.8,7.3);}
      ctx.lineWidth=.8;ctx.lineCap='round';ctx.strokeStyle=paint(shift(skin,-61));ctx.stroke();
    }else{stroke(ctx,[-4,2],[-2,2],.85,paint('#424047'));stroke(ctx,[2,2],[4,2],.85,paint('#424047'));}
    ctx.restore();
  }
  function drawActor(ctx,x,y,o,env){
    if(!enabled||o?.ghost||!o?.char)return false;
    const {S,C}=env;const ch=o.char;
    const paint=v=>typeof C==='function'?C(v):v;
    const noMotion=rm(), moving=!!(o.moving&&!o.still)&&!noMotion;
    const sit=o.pose==='sit'||o.pose==='floor', lie=o.pose==='lie';
    const ph=o.ph||0, stride=clamp(o.bfStride??1,.4,1), step=moving?Math.sin(ph)*3.4*stride:0;
    const kneeLift=moving?Math.max(0,Math.cos(ph))*.95:0;
    const sway=moving?Math.sin(ph*.5)*.55:0;
    const bob=moving?-Math.abs(Math.sin(ph))*1.25*stride:(noMotion||o.still?0:Math.sin(S.t*1.25)*.25);
    const tense=o.tense||0, slump=o.slump||0, action=o.bfMainActor&&S.sim?.act;
    const reach=action&&!noMotion?clamp(o.bfGesture??0):0;
    const target=action&&o.bfMainActor?S.sim.at:null;
    const extraReach=target==='stove'?1:target==='phone'?.75:.6;
    const face=o.face||'front',flip=o.flip||1;
    const profile=(S.flat&&S.flat.id)||'rooted';
    const dark=paint('#232b35');
    ctx.save();ctx.translate(x,y);const origScale=o.scale||1;ctx.scale(origScale*.955,origScale*.955);
    ctx.globalAlpha=o.alpha==null?1:o.alpha;
    // Floor anchoring and low-contrast contact shadow.
    if(!o.noShadow)ellipse(ctx,0,0,sit?14.5:12.6,5.1,'rgba(26,31,46,.18)');
    ctx.translate(sway,bob);
    const pantsColor=ch.pants||'#475266', shirt=ch.shirt||'#4a978b',skin=ch.skin||'#bd886a';
    // Legs: two-segment articulated rig with distinct knees, ankles and feet.
    if(!sit&&!lie){
      const xL=-4.3,xR=4.3;
      const L0=[xL,-23], L1=[xL-1.4+step*.47,-11.8-kneeLift],L2=[xL+step*1.03,-2.3];
      const R0=[xR,-23], R1=[xR+1.4-step*.47,-11.8-(moving?Math.max(0,-Math.cos(ph))*.95:0)],R2=[xR-step*1.03,-2.3];
      trouser(ctx,L0,L1,L2,7.2,paint(pantsColor),14);shoe(ctx,L2[0],L2[1]+1,flip,paint(pantsColor));
      trouser(ctx,R0,R1,R2,7.3,paint(pantsColor),16);shoe(ctx,R2[0],R2[1]+1,flip,paint(pantsColor));
    }else if(sit){
      trouser(ctx,[-4,-12],[-10,-5],[-10,2],6.8,paint(pantsColor),10);
      trouser(ctx,[4,-12],[10,-5],[10,2],6.8,paint(pantsColor),10);
      shoe(ctx,-11,3,1,paint(pantsColor));shoe(ctx,10,3,1,paint(pantsColor));
    }
    const shoulderY=sit?-32:-42,torsoY=shoulderY+1, waistY=shoulderY+22, headY=shoulderY-13+slump*2.2;
    // Back sleeve (occluded naturally by torso).
    const leftSh=[-10.3,shoulderY+3],leftEl=[-12.8,shoulderY+13],leftHand=[-11.7,shoulderY+21];
    sleeve(ctx,leftSh,leftEl,leftHand,paint(shift(shirt,-13)),paint(skin));
    // Neck and structured garment silhouette, two gradients supply a consistent light source.
    rounded(ctx,-3.7,shoulderY-5.5,7.4,7,2.5);ctx.fillStyle=paint(skin);ctx.fill();
    ctx.beginPath();ctx.moveTo(-9.2,torsoY-1);ctx.bezierCurveTo(-13,torsoY+1,-10.8,torsoY+11,-9,waistY);
    ctx.quadraticCurveTo(0,waistY+4,9,waistY);ctx.bezierCurveTo(11,torsoY+9,12,torsoY,8.5,torsoY-1);
    ctx.quadraticCurveTo(0,torsoY-5,-9.2,torsoY-1);ctx.closePath();
    ctx.fillStyle=gradient(ctx,paint(shift(shirt,18)),paint(shift(shirt,-20)),-10,torsoY,27);ctx.fill();
    ctx.beginPath();ctx.moveTo(-8,waistY-.7);ctx.quadraticCurveTo(0,waistY+2,8,waistY-.7);
    ctx.lineWidth=1.35;ctx.strokeStyle=paint(shift(shirt,-33));ctx.stroke();
    // Collar, front seam and hand-built detail: subdued enough at phone scale.
    if(face!=='back'){
      ctx.beginPath();ctx.moveTo(-5.8,torsoY);ctx.lineTo(-1,torsoY+5);ctx.lineTo(0,torsoY+3.2);ctx.lineTo(1.4,torsoY+5);ctx.lineTo(5.5,torsoY);
      ctx.strokeStyle=paint(shift(shirt,37));ctx.lineWidth=1.3;ctx.stroke();
      stroke(ctx,[0,torsoY+6],[0,waistY-2],.85,paint(shift(shirt,-35)));
      ellipse(ctx,0,torsoY+11,.65,.65,paint(shift(shirt,48)));
      ellipse(ctx,0,torsoY+16,.65,.65,paint(shift(shirt,48)));
    }else{
      stroke(ctx,[-4,torsoY+3],[-4,waistY-2],.75,paint(shift(shirt,10)));
    }
    // Right arm lifts as the action plays; wrist approaches the physical object.
    const rightSh=[10.2,shoulderY+3];
    const armReach=reach*extraReach;
    const rightEl=[13+armReach*4,shoulderY+12-armReach*11];
    const rightHand=[11.8+armReach*11,shoulderY+21-armReach*20];
    sleeve(ctx,rightSh,rightEl,rightHand,paint(shirt),paint(skin));
    // An answered call becomes a held phone rather than a detached floating symbol.
    if(target==='phone'&&reach>.2&&['call','msg'].includes(lastIntent?.id)){
      ctx.save();ctx.translate(rightHand[0]+1,rightHand[1]-5);ctx.rotate(-.18);
      rounded(ctx,-2.5,-5,5.4,8.3,1);ctx.fillStyle=paint('#25303c');ctx.fill();
      rounded(ctx,-1.7,-4,3.8,5.4,.8);ctx.fillStyle=paint('#93b4bd');ctx.fill();ctx.restore();
    }
    head(ctx,0,headY,ch,profile,face,flip,o.mood||0,paint,false);
    ctx.restore();return true;
  }
  function drawHead(ctx,x,y,o,env){
    if(!enabled||o?.ghost||!o?.char)return false;
    const C=env?.C;const paint=v=>C?C(v):v;
    head(ctx,x,y,o.char,env?.S?.flat?.id||'rooted',o.face,o.flip,o.mood||0,paint,!!o.lying);
    return true;
  }
  function intent(m){if(!m?.obj)return;lastIntent={obj:m.obj,id:m.a?.id||'',kind:m.a?.kind||'',t:performance.now()};}
  function holdingPhone(S){return !!(enabled&&S?.sim?.at==='phone'&&S.sim.act&&['call','msg'].includes(lastIntent?.id)&&S.sim.prog/Math.max(.1,S.sim.dur)>.25);}
  function resolve(m,sealed){
    if(m?.obj==='stove'&&!sealed)lastKitchen={id:m.a?.id||'',t:performance.now()};
    if(lastIntent?.obj===m?.obj)lastIntent=null;
  }
  function kitchen(ctx,ctxEnv){
    if(!enabled)return;
    const {S,P3,C}=ctxEnv,s=S.sim;
    if(!s||S.place==='street')return;
    const cooking=s.at==='stove'&&!!s.act&&lastIntent?.obj==='stove';
    const finished=lastKitchen&&(performance.now()-lastKitchen.t)<3300;
    if(!cooking&&!finished)return;
    const active=cooking?clamp(s.prog/Math.max(.1,s.dur)):1;
    const t=S.t;
    const fade=finished&&!cooking?clamp((3300-(performance.now()-lastKitchen.t))/900):1;
    ctx.save();ctx.globalAlpha*=fade;
    // Cupboard door uses a projected hinge rather than a decorative floating icon.
    if(cooking&&active<.5){
      const open=Math.sin(Math.PI*clamp(active/.5));
      const hinge=P3(4.04,.956,.23),edge=P3(4.61,.956,.23),top=P3(4.04,.956,.79);
      const swing=13*open;
      ctx.beginPath();ctx.moveTo(hinge[0],hinge[1]);ctx.lineTo(edge[0]-swing,edge[1]+swing*.25);
      ctx.lineTo(edge[0]-swing,top[1]+swing*.25);ctx.lineTo(top[0],top[1]);ctx.closePath();
      ctx.fillStyle=C('#e9ddc9');ctx.fill();ctx.lineWidth=1;ctx.strokeStyle=C('#ad9d85');ctx.stroke();
      ellipse(ctx,edge[0]-swing-8,hinge[1]-8+swing*.25,2.1,1.25,C('#a99067'));
    }
    // Real pan and food: the handle pivots slightly and steam rises from the burner.
    const q=P3(5.22,.5,1.13),wiggle=rm()?0:Math.sin(t*14)*1.4*(cooking?Math.sin(Math.PI*active):0);
    ctx.save();ctx.translate(q[0],q[1]);ctx.rotate(wiggle*.012);
    ellipse(ctx,0,0,10.4,5.55,C('#2d333d'));
    ellipse(ctx,-1,-.7,8.5,4.0,C('#454d53'));
    stroke(ctx,[6.8,1.5],[19,8+wiggle*.3],3.4,C('#353942'));
    ellipse(ctx,19,8+wiggle*.3,2.1,1.25,C('#ad9e83'));
    if(active>.25 || finished){
      ctx.save();ctx.rotate(wiggle*.009);
      ellipse(ctx,-1,-.8,5.45,3.2,C('#f4f1e0'));
      ellipse(ctx,-1.1,-1.3,2.6,2.08,C('#f1b34e'));
      ellipse(ctx,-1.7,-2,0.8,.5,'rgba(255,255,255,.74)');
      ctx.restore();
    }
    ctx.restore();
    if(active>.2||finished){
      const alpha=(cooking?.62:.32)*fade;
      for(let i=0;i<3;i++){
        const drift=rm()?0:Math.sin(t*1.7+i*.8)*3.7;
        const lift=rm()?0:(t*.58+i*.31)%1;
        ctx.beginPath();ctx.moveTo(q[0]-5+i*4,q[1]-7-lift*6);
        ctx.bezierCurveTo(q[0]-7+i*4+drift,q[1]-16-lift*8,q[0]+drift+i*3,q[1]-22-lift*13,q[0]-2+i*4,q[1]-32-lift*10);
        ctx.strokeStyle=`rgba(244,244,233,${alpha*(1-.35*lift)})`;ctx.lineWidth=1.65-i*.22;ctx.lineCap='round';ctx.stroke();
      }
    }
    ctx.restore();
  }
  function sofa(ctx,{S,P3,C}){
    if(!enabled||S.place==='street')return;
    const s=S.sim,using=s.pose==='sit'&&s.at==='sofa',npcSits=S.npc?.pose==='sit';
    if(!using&&!npcSits)return;
    const q=P3(1,using&&npcSits?5.36:4.3,.51);
    ellipse(ctx,q[0],q[1]+3.8,12.7,3.5,'rgba(35,39,54,.13)',-.11);
    ctx.beginPath();ctx.ellipse(q[0],q[1]+1,12,4,0,0,Math.PI);
    ctx.strokeStyle=C('#697c7c',.35);ctx.lineWidth=1.1;ctx.stroke();
  }
  function applyMenu(){
    const menu=document.getElementById('viewMenu');if(!menu||menu.querySelector('[data-bf-art]'))return;
    const button=document.createElement('button');
    button.className='vrow bf-art-toggle';button.type='button';button.dataset.bfArt='';
    button.title='Switch between the new character rig and the original simplified drawing';
    button.innerHTML='<span>Detailed characters</span><i class="sw"></i>';
    button.setAttribute('aria-pressed',String(enabled));
    button.addEventListener('click',()=>{
      enabled=!enabled;try{localStorage.setItem('beingfound.character_art',enabled?'rigged':'classic')}catch(e){}
      button.setAttribute('aria-pressed',String(enabled));
    });
    const h=[...menu.querySelectorAll('h4')].find(h=>/Atmosphere/.test(h.textContent));
    if(h)h.insertAdjacentElement('afterend',button);else menu.appendChild(button);
  }
  function initMenu(){const m=document.getElementById('viewMenu');if(!m)return;applyMenu();new MutationObserver(()=>applyMenu()).observe(m,{childList:true,subtree:false});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initMenu,{once:true});else initMenu();
  window.BFArt={version:'7.3',drawActor,drawHead,kitchen,sofa,intent,resolve,holdingPhone,
    get enabled(){return enabled},set enabled(value){enabled=!!value},
    get lastIntent(){return lastIntent},get lastKitchen(){return lastKitchen}};
})();