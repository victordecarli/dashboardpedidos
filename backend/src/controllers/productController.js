// controllers/productController.js
const Product = require('../models/Product');

// Função auxiliar para tratar erros do Mongoose
function handleMongooseError(err, res) {
  // Erro de validação (ex.: campos obrigatórios, formato inválido)
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(422).json({ error: messages });
  }

  // Erro de cast (ex.: ID mal formatado)
  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'ID inválido' });
  }

  // Erro genérico
  console.error('Erro:', err);
  return res.status(500).json({ error: 'Erro interno do servidor' });
}

// 📌 Criar um novo produto (CREATE)
exports.createProduct = async (req, res) => {
  try {
    const { name, price, description, status, stock } = req.body;

    if (!name || price === undefined || stock === undefined) {
      return res
        .status(400)
        .json({ error: 'Nome, preço e estoque são obrigatórios.' });
    }
    if (!name || name.trim() === '') {
      return res
        .status(400)
        .json({ error: 'Nome é obrigatório e não pode ser vazio.' });
    }
    if (price < 0) {
      return res.status(400).json({ error: 'O preço não pode ser negativo.' });
    }
    if (stock < 0) {
      return res
        .status(400)
        .json({ error: 'O estoque não pode ser negativo.' });
    }
    if (price == null) {
      return res
        .status(400)
        .json({ error: 'Preço é obrigatório e não pode ser nulo.' });
    }
    if (stock == null) {
      return res
        .status(400)
        .json({ error: 'Estoque é obrigatório e não pode ser nulo.' });
    }

    const existingProduct = await Product.findOne({ name });
    if (existingProduct) {
      return res
        .status(409)
        .json({ error: 'Já existe um produto cadastrado com esse nome.' });
    }

    // Verificar se existe uma imagem
    let imagePath = '';
    if (req.file) {
      // O caminho da imagem será relativo à pasta uploads
      imagePath = `uploads/${req.file.filename}`;
    }

    const product = new Product({
      name,
      price,
      description,
      status,
      stock,
      image: imagePath, // Salvar sem a barra inicial
    });

    await product.save();
    res.status(201).json({ message: 'Produto criado com sucesso', product });
  } catch (err) {
    handleMongooseError(err, res);
  }
};

// 📌 Buscar todos os produtos ativos (READ)
exports.getProducts = async (req, res) => {
  try {
    const includeAll = req.query.all === 'true';
    const filter = includeAll ? {} : { status: 'ativo' };

    const products = await Product.find(filter);
    res.json(products);
  } catch (err) {
    handleMongooseError(err, res);
  }
};

// 📌 Buscar produto por ID (READ)
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado.' });
    }
    res.json(product);
  } catch (err) {
    handleMongooseError(err, res);
  }
};

// 📌 Atualizar um produto (UPDATE)
exports.updateProduct = async (req, res) => {
  try {
    const { name, price, description, status, stock } = req.body;

    if (price < 0) {
      return res.status(400).json({ error: 'O preço não pode ser negativo.' });
    }
    if (stock < 0) {
      return res
        .status(400)
        .json({ error: 'O estoque não pode ser negativo.' });
    }

    // Verificar se existe uma imagem
    const updateData = { name, price, description, status, stock };

    if (req.file) {
      // O caminho da imagem será relativo à pasta uploads
      updateData.image = `uploads/${req.file.filename}`;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!product)
      return res.status(404).json({ error: 'Produto não encontrado' });

    res.json({ message: 'Produto atualizado com sucesso', product });
  } catch (err) {
    handleMongooseError(err, res);
  }
};

// 📌 Alterar status do produto (ATIVAR/DESATIVAR)
exports.toggleProductStatus = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ error: 'Produto não encontrado' });

    product.status = product.status === 'ativo' ? 'inativo' : 'ativo';
    await product.save();

    res.json({
      message: `Produto ${
        product.status === 'ativo' ? 'ativado' : 'desativado'
      } com sucesso`,
      product,
    });
  } catch (err) {
    handleMongooseError(err, res);
  }
};

// 📌 Excluir um produto (DELETE)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado.' });
    }

    res.json({ message: 'Produto removido com sucesso' });
  } catch (err) {
    handleMongooseError(err, res);
  }
};
