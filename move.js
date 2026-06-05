const fs = require('fs');
const path = require('path');

const srcApp = path.join(__dirname, 'src', 'app');

const dirsToMake = ['(admin)', '(auth)', '(portal)'];
for (const d of dirsToMake) {
  const p = path.join(srcApp, d);
  if (!fs.existsSync(p)) fs.mkdirSync(p);
}

const moves = [
  { from: 'login', to: '(auth)/login' },
  { from: 'admin-login', to: '(auth)/admin-login' },
  
  { from: 'setores', to: '(admin)/setores' },
  { from: 'igrejas', to: '(admin)/igrejas' },
  { from: 'categorias', to: '(admin)/categorias' },
  { from: 'instrumentos', to: '(admin)/instrumentos' },
  { from: 'cargos', to: '(admin)/cargos' },
  { from: 'tipos-teste', to: '(admin)/tipos-teste' },
  { from: 'encarregados', to: '(admin)/encarregados' },
  { from: 'avaliadores', to: '(admin)/avaliadores' },

  { from: 'cadastro-teste', to: '(portal)/cadastro-teste' },
  { from: 'pre-avaliacao', to: '(portal)/pre-avaliacao' },
];

for (const m of moves) {
  const src = path.join(srcApp, m.from);
  const dest = path.join(srcApp, m.to);
  if (fs.existsSync(src)) {
    fs.renameSync(src, dest);
  }
}
console.log('Moved folders successfully');
