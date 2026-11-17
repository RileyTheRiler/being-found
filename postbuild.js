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
 ['phase3.js','bf837.js'],['phase3.css','bf837.css']])fs.copyFileSync(p.join(__dirname,src),p.join(dir,dst));
const version=require('./package.json').version;
const extra=['bf83','bf835','bf837'].map(n=>`<link rel="stylesheet" href="${n}.css?v=${version}">`).join('')+['bf83','bf837'].map(n=>`<script defer src="${n}.js?v=${version}"></script>`).join('');
const at=html.toLowerCase().indexOf('</head>');html=at>=0?html.slice(0,at)+extra+html.slice(at):extra+html;
html=html.replace(/<title>[^<]*<\/title>/i,`<title>Being Found ${version}</title>`);
fs.writeFileSync(file,html,'utf8');fs.mkdirSync(p.join(dir,'qa'),{recursive:true});
const audit={version,releaseLabelsRemoved:removed,remainingExact:{
 dele:/\bRELEASE\s+5\.4\s*[·•—–-]\s*THE\s+ENCOUNTER\s+COMES\s+FIRST\b/i.test(html),
 walt:/\bRELEASE\s+5\.3\s*[·•—–-]\s*A\s+CLINICAL\s+ENCOUNTER\b/i.test(html)
},modules:['bf83.js','bf837.js'],sourceStoryEngine:'unchanged'};
fs.writeFileSync(p.join(dir,'qa','audit.js'),'window.__BF837_AUDIT='+JSON.stringify(audit)+';');
console.log('Being Found '+version,JSON.stringify(audit));