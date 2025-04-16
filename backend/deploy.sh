#!/bin/bash

# Script de implantação para o servidor backend
# Este script atualiza e reinicia o servidor com HTTPS

echo "Iniciando implantação do servidor backend..."

# Verificar se PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    echo "PM2 não está instalado. Instalando..."
    npm install -g pm2
fi

# Instalar dependências
echo "Instalando dependências..."
npm install

# Gerar certificados SSL se necessário
echo "Verificando certificados SSL..."
node generate-ssl-certs.js

# Parar a aplicação atual se estiver rodando
echo "Parando aplicação atual..."
pm2 stop lojavirtual-api 2>/dev/null || true

# Reiniciar a aplicação com as novas configurações
echo "Iniciando aplicação com HTTPS..."
pm2 start src/server.js --name lojavirtual-api

# Salvar configuração do PM2
echo "Salvando configuração do PM2..."
pm2 save

echo "Implantação concluída! O servidor está rodando com HTTPS."
echo "Para verificar o status, execute: pm2 status"
echo "Para ver os logs, execute: pm2 logs lojavirtual-api" 