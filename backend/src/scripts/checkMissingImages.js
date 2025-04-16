const mongoose = require('mongoose');
const Product = require('../models/Product');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function checkMissingImages() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Conectado ao MongoDB');

    const products = await Product.find();
    const uploadsDir = path.join(__dirname, '../../uploads');

    // Lista todos os arquivos na pasta uploads
    const files = fs.readdirSync(uploadsDir);
    console.log('\nArquivos na pasta uploads:');
    console.log(files);

    console.log('\nVerificando imagens dos produtos:');
    for (const product of products) {
      if (product.image) {
        const imageName = product.image.replace('uploads/', '');
        const imageExists = fs.existsSync(path.join(uploadsDir, imageName));

        console.log(`\nProduto: ${product.name}`);
        console.log(`Caminho da imagem no DB: ${product.image}`);
        console.log(`Arquivo existe? ${imageExists ? 'Sim' : 'Não'}`);
      } else {
        console.log(`\nProduto: ${product.name}`);
        console.log('Sem imagem cadastrada');
      }
    }

    console.log('\nVerificação finalizada');
    process.exit(0);
  } catch (error) {
    console.error('Erro:', error);
    process.exit(1);
  }
}

checkMissingImages();
