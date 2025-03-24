// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const routes = require('./routes'); // index.js da pasta routes será automaticamente resolvido

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', routes); // Isso vai montar /api/auth, /api/users, etc.

const PORT = process.env.PORT || 3000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Conectado ao MongoDB'))
  .catch((err) => console.error('❌ Erro ao conectar ao MongoDB:', err));

app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));

app.get('/', (req, res) => {
  res.send('Servidor rodando! 🚀');
});
