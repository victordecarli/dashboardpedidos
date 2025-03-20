const bcrypt = require('bcryptjs');
const User = require('../models/User');

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Verifica se o e-mail já está cadastrado
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'E-mail já cadastrado' });

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ name, email, password: hashedPassword, role });
    await user.save();

    res.status(201).json({ message: 'Usuário criado com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
};
