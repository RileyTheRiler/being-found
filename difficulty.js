/* Being Found 7.5 — situated action difficulty and temporary support.
 * Difficulty describes the fictional situation, not a diagnostic severity scale.
 * An unavailable possibility remains unavailable: dice never turn 'sealed'
 * actions into ordinary available actions. No activity is guaranteed to lift mood.
 */
(() => {
  'use strict';
  if (window.BFDifficulty) return;
  const STORE='being-found.situated-support.v1';
  const getScene=s=>`${s?.flat?.id||'unknown'}:${s?.phaseIx??0}`;
  const limit=(n,lo,hi)=>Math.max(lo,Math.min(hi,n));
  const clean=()=>({scene:'',items:[],used:[],history:[]});
  let state=clean();
  try{const o=JSON.parse(sessionStorage.getItem(STORE)||'null');if(o&&typeof o==='object')state={...state,...o};}catch(_){}
  if(!Array.isArray(state.items))state.items=[];
  if(!Array.isArray(state.used))state.used=[];
  if(!Array.isArray(state.history))state.history=[];
  const save=()=>{try{sessionStorage.setItem(STORE,JSON.stringify(state));}catch(_){}};
  function sync(s){const scene=getScene(s);if(state.scene!==scene){
    const before=state.scene,expired=state.items.slice();state.scene=scene;state.items=[];state.used=[];save();
    if(s?.mode==='play')window.BFPatterns?.sceneChanged?.(s,before,expired);
  }return scene;}
  function supportTotal(){return limit(state.items.reduce((n,x)=>n+x.value,0),0,2);}
  function classify(action,s){
    const v=s?.vars||{},att=v.attune||'rooted',m=action.state||'open';
    const parts=[{name:'Starting point',value:4}];
    if(att==='depleted'&& (v.amt??1)>.35)parts.push({name:'Fewer things feel possible',value:2});
    else if(att==='upheaval'&&(v.amt??1)>.5)parts.push({name:'Unsettled surroundings',value:1});
    else if(att==='uncanny'&& (v.amt??1)>.5)parts.push({name:'The room feels uncertain',value:1});
    const states={heavy:[3,'Each step takes effort'],dim:[2,'Less invitation to begin'],strange:[2,'The action feels unfamiliar'],haunted:[1,'Memories pull at the moment'],fractured:[2,'The future is hard to picture'],suspect:[2,'Trust is difficult'],hollow:[2,'Little felt connection'],looming:[2,'Threat presses in']};
    if(states[m])parts.push({name:states[m][1],value:states[m][0]});
    const special=(action.obj==='stove'&&action.act==='cook')||(action.obj==='easel'&&action.act==='paint');
    if(special && m==='open')parts.push({name:'A longer undertaking',value:1});
    if(action.type==='shared' && (v.people??70)<25 && m!=='sealed')parts.push({name:'Connection feels distant',value:1});
    return parts;
  }
  function plan(action,s,opts={}){
    sync(s);
    const m=action.state||'open';
    if(m==='sealed'||m==='closed'||m==='quiet')return {available:false,why:'This possibility does not feel available in this authored moment.'};
    const parts=classify(action,s),support=supportTotal();
    if(opts.load>=3)parts.push({name:'Accumulated effort',value:1});
    if((opts.practice||0)>0)parts.push({name:'Familiar approach',value:-limit(opts.practice,0,2)});
    if(support)parts.push({name:state.items.map(x=>x.name).join(', '),value:-support});
    const total=parts.reduce((n,x)=>n+x.value,0),target=limit(total,3,11);
    return {available:true,sides:12,target,parts,support,source:state.items.map(x=>x.name),
      state:m,raw:total,chance:Math.round((13-target)/12*100),theme:s?.flat?.id||'',
      description: s?.flat?.id==='depression' ? 'Here, even a routine can take sustained effort. A roll changes this attempt, not the condition.' :
      'The room and the action affect how this particular attempt unfolds.'};
  }
  function recordAction(m,sealed,s){
    if(s?.mode==='play' && m?.a){sync(s);window.BFPatterns?.recordAction?.(m,sealed,s);}
    if(!s||s.mode!=='play'||sealed||!m?.a||m.st==='sealed'||m.st==='hollow')return null;
    sync(s);
    const key=`${m.obj}.${m.a.id}`;
    if(state.used.includes(key))return null;
    const table={
      'easel.paint':{name:'Time painting',value:2},
      'door.out':{name:'A change of scene',value:1},
      'window.watch':{name:'A pause at the window',value:1},
      'phone.call':{name:'A conversation',value:1},
      'stove.cook':{name:'Making a meal',value:1},
      'sofa.book':{name:'Time with a book',value:1},
      'easel.tidy':{name:'One manageable task',value:1},
      'sofa.sit':{name:'A moment of rest',value:1}
    };
    const obj=table[key];if(!obj)return null;
    // A sealed/foreclosed action cannot silently supply a bonus. Likewise,
    // a task done without felt connection need not be experienced as restorative.
    if(m.st==='dim'||m.st==='strange'||m.st==='heavy'){
      if(!['easel.tidy','sofa.sit'].includes(key))return null;
    }
    state.used.push(key);
    // This is situational support for ONE subsequent check, not a mood score.
    state.items=[{...obj,key}];
    state.history.unshift({scene:state.scene,key,name:obj.name,value:obj.value});
    state.history=state.history.slice(0,25);save();window.BFPatterns?.recordSupport?.(obj,s);
    const sc=document.getElementById('scene');
    if(sc){let toast=sc.querySelector('.bf-support-toast');if(!toast){toast=document.createElement('div');toast.className='bf-support-toast';toast.setAttribute('role','status');sc.append(toast);}
      toast.textContent=`A foothold: ${obj.name} (−${obj.value} on the next check)`;
      clearTimeout(recordAction._tid);recordAction._tid=setTimeout(()=>{toast.remove();},3300);
    }
    return obj;
  }
  function consume(s){sync(s);const old=state.items.slice();state.items=[];save();window.BFPatterns?.spend?.(old,s);return old;}
  function reset(){state=clean();save();}
  window.BFDifficulty={version:'7.6',plan,recordAction,consume,reset,getScene,
    get state(){return JSON.parse(JSON.stringify(state));},get support(){return supportTotal()}};
})();