import { getAuthToken, clearAuth } from './authStorage';

// Verifica se está autenticado
export const isAuthenticated = () => {
  return !!getAuthToken();
};

// Recupera o papel do usuário a partir do token
export const getUserRole = () => {
  try {
    const token = getAuthToken();

    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role;
    }
  } catch (e) {
    console.error('Erro ao decodificar o token:', e);
    clearAuth();
  }

  return null;
};

// Logout
export const logout = () => {
  clearAuth();
};
