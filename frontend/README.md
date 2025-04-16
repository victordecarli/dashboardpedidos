# Frontend do Dashboard de Pedidos

Interface de usuário do Dashboard de Pedidos, desenvolvido em React com Vite e TailwindCSS.

## Tecnologias Utilizadas

- React 19
- Vite 6
- TailwindCSS 4
- React Router 7
- Axios
- React Hot Toast
- Lucide React (ícones)

## Estrutura do Projeto

- `src/` - Código fonte da aplicação
  - `components/` - Componentes reutilizáveis
  - `pages/` - Páginas da aplicação
  - `services/` - Serviços (API, etc.)
  - `utils/` - Utilitários e helpers
  - `assets/` - Arquivos estáticos
  - `hooks/` - Hooks personalizados
  - `context/` - Contextos do React (carrinho, autenticação, etc.)
- `public/` - Arquivos públicos
- `.env` - Variáveis de ambiente (não versionado)
- `.env.example` - Exemplo de variáveis de ambiente

## Funcionalidades

- Autenticação de usuários
- Visualização e gerenciamento de produtos
- Carrinho de compras
- Checkout
- Visualização e gerenciamento de pedidos
- Área administrativa para gerenciar pedidos, produtos e usuários

## Requisitos

- Node.js 18+ (recomendado)

## Instalação para Desenvolvimento

1. Clone o repositório
2. Instale as dependências com `npm install`
3. Copie o arquivo `.env.example` para `.env` e configure as variáveis
4. Execute com `npm run dev` para iniciar o servidor de desenvolvimento

## Preparação para Produção

### 1. Configuração do .env para Produção

```
VITE_API_URL=https://api.seu-dominio.com/api
VITE_SERVER_URL=https://api.seu-dominio.com
```

### 2. Compilação para Produção

```bash
npm install
npm run build
```

Isso criará uma pasta `dist` com os arquivos estáticos otimizados para produção.

### 3. Implantação

#### Usando Vercel (Recomendado)

1. Instale o CLI do Vercel: `npm i -g vercel`
2. Execute `vercel` no diretório do projeto e siga as instruções
3. Para produção: `vercel --prod`

O arquivo `vercel.json` já está configurado para lidar com rotas SPA.

#### Usando Netlify

1. Adicione um arquivo `netlify.toml` na raiz:
   ```toml
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```
2. Faça o deploy: `netlify deploy --prod`

#### Usando Hospedagem Tradicional

1. Faça upload dos arquivos da pasta `dist` para seu provedor
2. Configure o servidor para redirecionar todas as requisições para index.html

### 4. Variáveis de Ambiente em Runtime

Para plataformas que não suportam variáveis de ambiente em tempo de execução (como hospedagem estática simples):

1. Crie um arquivo `config.js` na pasta `public`:
   ```js
   window.ENV = {
     VITE_API_URL: 'https://api.seu-dominio.com/api',
     VITE_SERVER_URL: 'https://api.seu-dominio.com',
   };
   ```
2. Modifique `index.html` para incluir este arquivo antes do seu bundle principal

## Desenvolvimento Contínuo

Para atualizar a aplicação em produção:

1. Faça suas alterações
2. Execute `npm run build`
3. Faça o deploy usando o método escolhido, exemplo: `vercel --prod`

## Contato

Para dúvidas ou suporte, entre em contato com a equipe de desenvolvimento.
