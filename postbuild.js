const fs=require('node:fs'),p=require('node:path');
const dir=p.join(__dirname,'dist'),file=p.join(dir,'index.html');let html=fs.readFileSync(file,'utf8');
if(!html.includes('id="scene"')||!html.includes('id="result"'))throw Error('Generated game HTML invalid');
const labels=[
 ['Dele',/\bRELEASE\s+5\.4\s*[·•—–-]\s*THE\s+ENCOUNTER\s+COMES\s+FIRST\b/gi],
 ['Walt',/\bRELEASE\s+5\.3\s*[·•—–-]\s*A\s+CLINICAL\s+ENCOUNTER\b/gi]
];
const removed={};
for(const [name,regex] of labels){
 const found=html.match(regex)||[];
 removed[name]=found.length;html=html.replace(regex,'');
}
for(const [src,dst] of [
 ['shell.js','bf83.js'],['shell.css','bf83.css'],['phase2.css','bf835.css'],
 ['phase3.js','bf837.js'],['phase3.css','bf837.css'],['title_access.js','title_access.js'],['a11y_853.css','a11y_853.css'],['leena.js','leena.js'],['leena.css','leena.css']])fs.copyFileSync(p.join(__dirname,src),p.join(dir,dst));
const version=require('./package.json').version;
const extra=['bf83','bf835','bf837','a11y_853','leena'].map(n=>`<link rel="stylesheet" href="${n}.css?v=${version}">`).join('')+['bf83','bf837','title_access','leena'].map(n=>`<script defer src="${n}.js?v=${version}"></script>`).join('');
const at=html.toLowerCase().indexOf('</head>');html=at>=0?html.slice(0,at)+extra+html.slice(at):extra+html;
html=html.replace(/<title>[^<]*<\/title>/i,`<title>Being Found ${version}</title>`);
fs.writeFileSync(file,html,'utf8');fs.mkdirSync(p.join(dir,'qa'),{recursive:true});
const audit={version,releaseLabelsRemoved:removed,remainingExact:{
 dele:/\bRELEASE\s+5\.4\s*[·•—–-]\s*THE\s+ENCOUNTER\s+COMES\s+FIRST\b/i.test(html),
 walt:/\bRELEASE\s+5\.3\s*[·•—–-]\s*A\s+CLINICAL\s+ENCOUNTER\b/i.test(html)
},modules:['bf83.js','bf837.js','title_access.js','leena.js'],sourceStoryEngine:'unchanged'};
fs.writeFileSync(p.join(dir,'qa','audit.js'),'window.__BF837_AUDIT='+JSON.stringify(audit)+';');
console.log('Being Found '+version,JSON.stringify(audit));
/* Installable iPad offline edition: precache every built static asset. */
const offlineDir=p.join(__dirname,'offline');
const iconPath=p.join(dir,'icon.svg');
fs.copyFileSync(p.join(offlineDir,'icon.svg'),iconPath);
fs.copyFileSync(p.join(offlineDir,'register.js'),p.join(dir,'offline-register.js'));
const manifest={name:'Being Found',short_name:'Being Found',description:'A fictional narrative game about possibility',start_url:'/',scope:'/',display:'standalone',background_color:'#1b2333',theme_color:'#1b2333',icons:[{src:'/icon.svg',sizes:'any',type:'image/svg+xml',purpose:'any maskable'}]};
fs.writeFileSync(p.join(dir,'manifest.webmanifest'),JSON.stringify(manifest));
html=fs.readFileSync(file,'utf8').replace('</head>','<link rel="manifest" href="/manifest.webmanifest"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="Being Found"><meta name="theme-color" content="#1b2333"><link rel="apple-touch-icon" href="/icon.svg"></head>').replace('</body>','<script defer src="/offline-register.js"></script></body>');
fs.writeFileSync(file,html);
function allFiles(base,prefix=''){
 return fs.readdirSync(base,{withFileTypes:true}).flatMap(entry=>{
   const rel=prefix+entry.name;
   if(entry.isDirectory())return allFiles(p.join(base,entry.name),rel+'/');
   return [rel];
 });
}
const precache=allFiles(dir).filter(name=>!name.startsWith('qa/')&&!name.endsWith('.map')&&!name.endsWith('.glb')&&name!=='sw.js').map(name=>'/'+name);
const buildStamp=String(process.env.VERCEL_GIT_COMMIT_SHA||process.env.GITHUB_SHA||'local').slice(0,12);
const worker=fs.readFileSync(p.join(offlineDir,'sw.template.js'),'utf8').replace('__VERSION__',version).replace('__BUILD__',buildStamp).replace('__ASSETS__',JSON.stringify(precache));
fs.writeFileSync(p.join(dir,'sw.js'),worker);
console.log('Offline PWA precache assets:',precache.length);
