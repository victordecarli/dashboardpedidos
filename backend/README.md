# Backend do Dashboard de Pedidos

Este é o backend da aplicação Dashboard de Pedidos, responsável por gerenciar pedidos, produtos, usuários e autenticação.

## Tecnologias Utilizadas

- Node.js
- Express
- MongoDB (com Mongoose)
- JWT para autenticação
- Multer para upload de arquivos
- Nodemailer para envio de e-mails

## Estrutura do Projeto

- `src/` - Código fonte da aplicação
  - `controllers/` - Controladores da API
  - `models/` - Modelos de dados (Mongoose)
  - `routes/` - Rotas da API
  - `middleware/` - Middlewares da aplicação
  - `services/` - Serviços como email, etc.
  - `utils/` - Utilitários e helpers
- `uploads/` - Pasta para armazenamento de uploads de imagens
- `.env` - Variáveis de ambiente (não versionado)
- `.env.example` - Exemplo de variáveis de ambiente

## Requisitos

- Node.js 18+ (recomendado)
- MongoDB

## Instalação

1. Clone o repositório
2. Instale as dependências com `npm install`
3. Copie o arquivo `.env.example` para `.env` e configure as variáveis
4. Execute com `npm run dev` para desenvolvimento ou `npm start` para produção

## Preparação para Produção (AWS)

### 1. Configuração do .env

```
PORT=3030 (ou a porta que você desejar)
MONGO_URI=sua_uri_de_conexao_mongodb
JWT_SECRET=seu_jwt_secret_seguro
NODE_ENV=production
FRONTEND_URL=https://seu-frontend.com (URL do seu frontend)
EMAIL_USER=seu-email@servico.com
EMAIL_PASSWORD=sua_senha_de_app
```

### 2. Construção para Produção

```
npm install
npm start
```

### 3. Configuração da AWS

#### Usando o Elastic Beanstalk

1. Instale a CLI do EB: `npm install -g aws-eb-cli`
2. Configure: `eb init`
3. Crie o ambiente: `eb create nome-do-ambiente`
4. Deploy: `eb deploy`

#### Usando o EC2

1. Configure a instância EC2
2. Configure o Nginx como proxy reverso
3. Use o PM2 para gerenciar o processo Node.js:
   ```
   npm install -g pm2
   pm2 start src/server.js --name "dashboard-api"
   pm2 save
   pm2 startup
   ```

### 4. Atualizações de Produção

Para atualizar o aplicativo:

```
git pull
npm install
pm2 restart dashboard-api
```

## Endpoints da API

A documentação completa da API está disponível na rota `/api/docs` quando em modo de desenvolvimento.

Principais endpoints:

- `POST /api/auth/login` - Login
- `GET /api/products` - Listar produtos
- `POST /api/orders` - Criar pedido
- `GET /api/orders/user` - Obter pedidos do usuário atual

## Monitoramento e Logs

Em produção, use o CloudWatch da AWS para monitorar logs.
A rota `/health` pode ser usada para verificação de saúde da aplicação.

## Contato

Para dúvidas ou suporte, entre em contato com a equipe de desenvolvimento. 