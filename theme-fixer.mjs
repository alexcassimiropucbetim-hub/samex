import fs from 'fs';
import path from 'path';

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(dirPath);
  });
}

const replacements = [
  { from: /bg-(blue|red|orange|green|emerald)-([567]00)\s+(.*?)text-slate-900/g, to: 'bg-$1-$2 $3text-white' },
  { from: /text-slate-900\s+(.*?)bg-(blue|red|orange|green|emerald)-([567]00)/g, to: 'text-white $1bg-$2-$3' },
];

walk('./src', (filePath) => {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  for (let r of replacements) {
    content = content.replace(r.from, r.to);
  }
  
  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log('Fixed contrast', filePath);
  }
});
