import fs from 'fs';
import path from 'path';

const files = [
  'src/app/(admin)/setores/page.tsx',
  'src/app/(admin)/igrejas/page.tsx',
  'src/app/(admin)/categorias/page.tsx',
  'src/app/(admin)/instrumentos/page.tsx',
  'src/app/(admin)/ministerios/page.tsx'
];

for (const relPath of files) {
  const fullPath = path.join('c:/Users/CASSIMIRO TECH/Documents/agendamento', relPath);
  let content = fs.readFileSync(fullPath, 'utf8');

  content = content.replace(/export default async function [A-Za-z]+\(\(\{/g, (match) => {
    return match.replace('(({', '({');
  });
  
  content = content.replace(/}\)\) \{/g, '}) {');

  fs.writeFileSync(fullPath, content);
  console.log(`Fixed syntax in ${relPath}`);
}
