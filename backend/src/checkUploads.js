const fs = require('fs');
const path = require('path');

const uploadsDir = path.join(__dirname, '../uploads');

console.log('Verificando pasta de uploads:', uploadsDir);

if (!fs.existsSync(uploadsDir)) {
  console.log('❌ A pasta uploads não existe!');
  process.exit(1);
}

const files = fs.readdirSync(uploadsDir);
console.log('\nArquivos encontrados:');
if (files.length === 0) {
  console.log('❌ Nenhum arquivo encontrado na pasta uploads');
} else {
  files.forEach((file) => {
    const stats = fs.statSync(path.join(uploadsDir, file));
    console.log(`✓ ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
  });
}
