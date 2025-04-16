#!/usr/bin/env node

/**
 * Este script gera certificados SSL autoassinados para desenvolvimento
 * Não use estes certificados em produção! Para produção, use um certificado 
 * válido de uma autoridade certificadora como Let's Encrypt
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Diretório onde os certificados serão armazenados
const certDir = path.join(__dirname, 'certificates');

// Caminho para os arquivos de certificado
const keyPath = path.join(certDir, 'private-key.pem');
const certPath = path.join(certDir, 'certificate.pem');

// Verifica se os certificados já existem
if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
  console.log('Certificados SSL já existem em:', certDir);
  console.log('Se você deseja gerar novos certificados, exclua os arquivos existentes primeiro.');
  process.exit(0);
}

// Cria o diretório de certificados se não existir
if (!fs.existsSync(certDir)) {
  console.log('Criando diretório de certificados:', certDir);
  fs.mkdirSync(certDir, { recursive: true });
}

console.log('Gerando certificados SSL autoassinados...');

try {
  // Gera a chave privada
  execSync(`openssl genrsa -out "${keyPath}" 2048`);
  console.log('Chave privada gerada com sucesso.');

  // Gera a solicitação de certificado (CSR)
  execSync(`openssl req -new -key "${keyPath}" -out "${certDir}/csr.pem" -subj "/C=BR/ST=Estado/L=Cidade/O=Dashboard Pedidos/CN=localhost"`);
  console.log('Solicitação de certificado gerada.');

  // Gera o certificado autoassinado
  execSync(`openssl x509 -req -days 365 -in "${certDir}/csr.pem" -signkey "${keyPath}" -out "${certPath}"`);
  console.log('Certificado autoassinado gerado com sucesso.');

  // Remove a solicitação de certificado (não é mais necessária)
  fs.unlinkSync(`${certDir}/csr.pem`);

  console.log('\nCertificados SSL gerados com sucesso em:', certDir);
  console.log(`• Chave privada: ${keyPath}`);
  console.log(`• Certificado: ${certPath}`);
  console.log('\nATENÇÃO: Estes são certificados autoassinados para desenvolvimento.');
  console.log('Os navegadores mostrarão avisos de segurança ao acessar o site.');
  console.log('Para produção, use certificados válidos de uma autoridade certificadora como Let\'s Encrypt.');
} catch (error) {
  console.error('Erro ao gerar certificados SSL:', error.message);
  console.error('Verifique se o OpenSSL está instalado e disponível no PATH.');
  process.exit(1);
} 