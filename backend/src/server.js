require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para lidar com JSON
app.use(express.json());

// Rota de teste
app.get('/', (req, res) => {
    res.send('Servidor funcionando!');
});
app.use('/api/auth', authRoutes);
// Conexão com o MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Conectado ao MongoDB'))
    .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
