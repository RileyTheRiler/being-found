// Being Found: Story Edition. Inline every source file into one self-contained page.
// CLI: node editions/story/build.js [outDir]   (default: editions/story/dist)
// Also called from the root postbuild.js, which writes dist/story/index.html for deployment.
const fs = require('fs'), path = require('path');
function build(outDir) {
  const src = path.join(__dirname, 'src');
  const order = fs.readdirSync(src).filter(f => f.endsWith('.js')).sort();
  const js = order.map(f => `/* ==== ${f} ==== */\n` + fs.readFileSync(path.join(src, f), 'utf8')).join('\n');
  const css = fs.readFileSync(path.join(src, 'style.css'), 'utf8');
  let html = fs.readFileSync(path.join(src, 'index.html'), 'utf8');
  html = html.replace('/*CSS*/', () => css).replace('/*JS*/', () => js.replace(/<\/script/gi, '<\\/script'));
  if (!html.includes('BF.story') || !html.includes('id="stage"')) throw Error('Story Edition build is incomplete');
  const out = outDir || path.join(__dirname, 'dist');
  fs.mkdirSync(out, {recursive: true});
  fs.writeFileSync(path.join(out, 'index.html'), html);
  console.log('Being Found Story Edition: ' + path.join(out, 'index.html') + ' (' + (html.length / 1024).toFixed(0) + ' KB)');
  return html;
}
module.exports = build;
if (require.main === module) build(process.argv[2]);
