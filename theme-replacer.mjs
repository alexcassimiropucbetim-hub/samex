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
  // Text colors
  { from: /(?<!-)text-white/g, to: 'text-slate-900' },
  { from: /text-slate-200/g, to: 'text-slate-600' },
  { from: /text-slate-300/g, to: 'text-slate-600' },
  { from: /text-slate-400/g, to: 'text-slate-500' },
  // Backgrounds
  { from: /bg-slate-900/g, to: 'bg-white' },
  { from: /bg-slate-950/g, to: 'bg-slate-50' },
  { from: /bg-slate-800/g, to: 'bg-white' },
  { from: /bg-white\/5(?!0)/g, to: 'bg-slate-100' },
  { from: /bg-white\/10/g, to: 'bg-slate-200' },
  { from: /bg-white\/\[0\.02\]/g, to: 'bg-white' },
  { from: /bg-white\/\[0\.03\]/g, to: 'bg-slate-50' },
  { from: /bg-black\/20/g, to: 'bg-slate-100' },
  { from: /bg-\[rgba\(15,23,42,0\.9\)\]/g, to: 'bg-white' },
  // Borders
  { from: /border-white\/5/g, to: 'border-slate-200' },
  { from: /border-white\/10/g, to: 'border-slate-200' },
  { from: /border-white\/20/g, to: 'border-slate-300' },
  { from: /border-slate-800/g, to: 'border-slate-200' },
  { from: /border-slate-700/g, to: 'border-slate-200' },
  { from: /border-\[rgba\(255,255,255,0\.05\)\]/g, to: 'border-slate-200' },
  // Hovers
  { from: /hover:bg-white\/5(?!0)/g, to: 'hover:bg-slate-100' },
  { from: /hover:text-white/g, to: 'hover:text-slate-900' },
];

walk('./src', (filePath) => {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
  // skip printing pages, they are already light
  if (filePath.replace(/\\/g, '/').includes('/imprimir-')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  for (let r of replacements) {
    content = content.replace(r.from, r.to);
  }
  
  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log('Updated', filePath);
  }
});
