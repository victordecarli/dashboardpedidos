const multer = require('multer');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

// Configuração do armazenamento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    
    // Garantir que o diretório existe
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      logger.info('Diretório de uploads criado');
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Gera um nome único para o arquivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'product-' + uniqueSuffix + ext);
  }
});

// Filtro de arquivos - aceitar apenas imagens
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não suportado. Apenas imagens JPEG, PNG, GIF e WebP são permitidas.'), false);
  }
};

// Configuração do upload
const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  }
});

// Middleware para upload de uma única imagem
const uploadSingleImage = upload.single('image');

// Handler de erros do multer
const handleUploadError = (req, res, next) => {
  return (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Arquivo muito grande. O tamanho máximo permitido é 5MB.' });
      }
      return res.status(400).json({ error: 'Erro no upload do arquivo: ' + err.message });
    } else if (err) {
      logger.error('Erro no upload:', err);
      return res.status(400).json({ error: err.message });
    }
    next();
  };
};

module.exports = {
  uploadSingleImage,
  handleUploadError
}; 