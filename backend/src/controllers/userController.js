const bcrypt = require('bcryptjs');
const User = require('../models/User');

function handleMongooseError(err, res) {
  // Erro de validação (ex.: campos obrigatórios, formato inválido)
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
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
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validações manuais
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Nome é obrigatório.' });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'E-mail é obrigatório.' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Senha é obrigatória.' });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: 'A senha deve ter no mínimo 6 caracteres.' });
    }

    // Checagem de duplicidade (e-mail)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'E-mail já cadastrado.' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role
    });
    await user.save();

    return res.status(201).json({ message: 'Usuário criado com sucesso' });
  } catch (err) {
    handleMongooseError(err, res);
  }
};


// 📌 Buscar todos os usuários (READ)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (err) {
    handleMongooseError(err, res);
  }
};

// 📌 Buscar usuário por ID (READ)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }
    res.json(user);
  } catch (err) {
    handleMongooseError(err, res);
  }
};

// 📌 Atualizar um usuário (UPDATE)
exports.updateUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Montamos um objeto para atualização parcial
    const updateData = {};

    // Se estiver atualizando nome, validamos
    if (name !== undefined) {
      if (!name.trim()) {
        return res
          .status(400)
          .json({ error: 'Nome não pode ser vazio.' });
      }
      updateData.name = name.trim();
    }

    // Se estiver atualizando e-mail, validamos e checamos duplicidade
    if (email !== undefined) {
      if (!email.trim()) {
        return res
          .status(400)
          .json({ error: 'E-mail não pode ser vazio.' });
      }
      const existingUser = await User.findOne({ email });
      // Se existe algum user com este e-mail e não for o mesmo ID
      if (existingUser && existingUser._id.toString() !== req.params.id) {
        return res.status(409).json({ error: 'E-mail já cadastrado.' });
      }
      updateData.email = email.trim();
    }

    // Se estiver atualizando a senha, validamos e fazemos hash
    if (password !== undefined) {
      if (password.length < 6) {
        return res
          .status(400)
          .json({ error: 'A senha deve ter no mínimo 6 caracteres.' });
      }
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Se for atualizar a role
    if (role !== undefined) {
      updateData.role = role;
    }

    // Atualizamos o usuário
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    res.json({ message: 'Usuário atualizado com sucesso', user: updatedUser });
  } catch (err) {
    handleMongooseError(err, res);
  }
};

// 📌 Excluir um usuário (DELETE)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }
    res.json({ message: 'Usuário deletado com sucesso' });
  } catch (err) {
    handleMongooseError(err, res);
  }
};