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

  // Fix <option value="" disabled selected> or similar
  content = content.replace(/<option([^>]*?)selected([^>]*?)>/g, '<option$1$2>');

  // Then add defaultValue="" to the <select> that contains this option.
  // Actually, we can just ensure <select> has defaultValue="" if it doesn't have it.
  content = content.replace(/<select([\s\S]*?)>/g, (match, p1) => {
    if (!match.includes('defaultValue=') && !match.includes('value=')) {
      return `<select defaultValue=""${p1}>`;
    }
    return match;
  });

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Fixed React select/option error in ${file}`);
    changedFiles++;
  }
}

console.log(`Done. Changed ${changedFiles} files.`);
