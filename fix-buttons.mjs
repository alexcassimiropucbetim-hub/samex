import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('c:/Users/CASSIMIRO TECH/Documents/agendamento/src');

let changedFiles = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;

  content = content.replace(/className="bg-(yellow|purple|emerald|indigo|green|red|orange|teal|cyan|pink|rose)-600 hover:bg-\1-700 text-(slate-900|white|slate-800) font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-lg shadow-\1-500\/30 active:scale-95/g, 'className="btn-primary');
  
  // Update other variants without font-medium or without text color in exactly that order
  content = content.replace(/className="bg-(yellow|purple|emerald|indigo|green|red|orange|teal|cyan|pink|rose)-600 hover:bg-\1-700 text-(slate-900|white|slate-800) px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"/g, 'className="btn-primary flex items-center gap-2 text-sm"');
  
  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
    changedFiles++;
  }
}

console.log(`Done. Changed ${changedFiles} files.`);
