# Instruções para Resolver o Problema de Mixed Content

## Problema
O servidor backend está sendo acessado por HTTP (`http://15.228.157.166:3031/api`), mas o frontend é carregado por HTTPS (`https://dashboardpedidos.vercel.app`), o que causa erros de "Mixed Content" no navegador.

## Soluções Implementadas

### 1. Configuração do Backend para HTTPS

- Adicionamos suporte para HTTPS no arquivo de configuração do backend (`backend/src/config.js`)
- Modificamos o servidor para usar HTTPS quando há certificados SSL disponíveis
- Implementamos a geração automática de certificados SSL autoassinados
- Adicionamos scripts para facilitar a inicialização segura

### 2. Atualização da Configuração do Frontend

- Atualizamos as variáveis de ambiente do frontend para apontar para a API via HTTPS
- Configuramos o frontend para se conectar ao backend de forma segura

## Passos para Implantação no Servidor de Produção

### 1. Transferir Arquivos Atualizados para o Servidor

```bash
# No seu ambiente local
# Faça commit das alterações
git add .
git commit -m "Implementado suporte a HTTPS"
git push

# No servidor
git pull origin master
```

### 2. Instalar Dependências e Iniciar o Servidor Seguro

```bash
# No servidor
cd /home/ubuntu/dashboardpedidos/backend
chmod +x deploy.sh
./deploy.sh
```

O script `deploy.sh` fará o seguinte:
- Instalar PM2 se não estiver instalado
- Instalar dependências do projeto
- Gerar certificados SSL autoassinados se necessário
- Parar a aplicação atual
- Iniciar a aplicação com HTTPS
- Salvar a configuração do PM2

### 3. Configurar Nginx para Proxy Reverso (se estiver usando)

Caso esteja usando Nginx como proxy reverso, é necessário atualizar sua configuração. Um exemplo está disponível no arquivo `nginx.conf.example`.

## Requisitos Adicionais

### Para Produção

Para um ambiente de produção real, é recomendado obter certificados SSL válidos em vez de usar certificados autoassinados:

```bash
# Instalar o Certbot (em sistemas baseados em Debian/Ubuntu)
sudo apt-get update
sudo apt-get install certbot

# Obter certificado Let's Encrypt para seu domínio
sudo certbot certonly --standalone -d seu-dominio.com
```

Depois, atualize as variáveis de ambiente no arquivo `.env` do backend:

```
SSL_KEY_PATH=/etc/letsencrypt/live/seu-dominio.com/privkey.pem
SSL_CERT_PATH=/etc/letsencrypt/live/seu-dominio.com/fullchain.pem
```

### Notas Importantes

- Os navegadores mostrarão avisos de segurança para certificados autoassinados
- Para uma solução completa, obtenha certificados SSL válidos de uma autoridade certificadora como Let's Encrypt
- Certifique-se de que todas as URLs no frontend e backend usam HTTPS de forma consistente 