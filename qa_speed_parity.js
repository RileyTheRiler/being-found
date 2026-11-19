/* Guided/pilot movement parity with real BFNavigation.step(). */
'use strict';
const fs=require('node:fs'), vm=require('node:vm'), assert=require('node:assert/strict');
const nav=fs.readFileSync('navigation.js','utf8');
const flags=fs.readFileSync('flags.js','utf8');
function walk(attune,search,guided){
 let now=1000;
 const body={classList:{contains:k=>guided&&k==='cl-route'}};
 const ctx={window:{},document:{body},location:{hostname:'example.com',search},URLSearchParams,performance:{now:()=>now},matchMedia:()=>({matches:true})};
 vm.runInNewContext(flags+'\n'+nav,ctx,{filename:'navigation-fixture.js'});
 const api=ctx.window.BFNavigation;
 const S={mode:'play',flat:{id:'rooted'},phaseKey:'rooted:0:',place:'home',vars:{attune},sim:{x:4.3,y:3.3,path:[],pose:'stand',at:null,face:'front',flip:1}};
 api.reset(S);assert(api.goTo(S,[4,5],()=>{}, {stove:{stand:[4,5]}}),'navigation fixture not engaged');
 for(let i=0;i<30;i++){now+=50;api.step(S,.05);}
 return api.x;
}
for(const mode of [{name:'guided',search:'',guided:true},{name:'pilot',search:'?pilot=1&bf_moodSpeed=1',guided:false}]){
 const a=walk('rooted',mode.search,mode.guided),b=walk('depleted',mode.search,mode.guided);
 const delta=Math.abs(a-b)/Math.max(1,a-548);
 assert(delta<.1,mode.name+' speed parity failed: '+a+' vs '+b);
 console.log(mode.name+' speed parity: '+a+' vs '+b);
}
