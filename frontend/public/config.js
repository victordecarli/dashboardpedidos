/*
  Este arquivo define as configurações para ambiente de produção.
  Estes valores serão usados quando as variáveis de ambiente do Vite 
  não estiverem disponíveis em tempo de execução.
  
  Modifique para os valores corretos do seu ambiente de produção.
*/

window.ENV = {
  // URL da API backend
  VITE_API_URL: 'https://dashboardpedidos-production-cedf.up.railway.app/api',

  // URL raiz do servidor backend (para imagens, etc)
  VITE_SERVER_URL: 'https://dashboardpedidos-production-cedf.up.railway.app',
};
