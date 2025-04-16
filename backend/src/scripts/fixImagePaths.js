const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

async function fixImagePaths() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Conectado ao MongoDB');

    const products = await Product.find();

    for (const product of products) {
      if (product.image && !product.image.startsWith('uploads/')) {
        // Remove qualquer / inicial
        const cleanPath = product.image.replace(/^\/+/, '');

        // Adiciona uploads/ se não existir
        if (!cleanPath.startsWith('uploads/')) {
          product.image = `uploads/${cleanPath}`;
          await product.save();
          console.log(
            `Corrigido caminho da imagem para o produto ${product.name}`,
          );
        }
      }
    }

    console.log('Correção finalizada');
    process.exit(0);
  } catch (error) {
    console.error('Erro:', error);
    process.exit(1);
  }
}

fixImagePaths();
