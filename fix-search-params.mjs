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

  // Regex to match the searchParams parameter declaration
  const regex = /({[\s\n]*searchParams,[\s\n]*}: {\s*searchParams: { edit\?: string };\s*})/;
  content = content.replace(regex, `({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
})`);

  // Replace searchParams.edit with await searchParams
  content = content.replace(/const editId = searchParams\.edit;/g, `const resolvedSearchParams = await searchParams;\n  const editId = resolvedSearchParams?.edit;`);

  fs.writeFileSync(fullPath, content);
  console.log(`Fixed ${relPath}`);
}
