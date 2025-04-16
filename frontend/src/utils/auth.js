import { getAuthToken, clearAuth, getRole } from './authStorage';

// Decodifica o token de forma segura
const decodeToken = (token) => {
  try {
    // Usa uma abordagem mais segura que atob para lidar com caracteres Unicode
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Erro ao decodificar o token:', e);
    return null;
  }
};

// Verifica se o token está expirado
const isTokenExpired = (token) => {
  const decoded = decodeToken(token);
  if (!decoded) return true;

  // Verifica a expiração (exp está em segundos desde epoch)
  const expirationDate = new Date(decoded.exp * 1000);
  return expirationDate < new Date();
};

// Verifica se está autenticado e o token não expirou
export const isAuthenticated = () => {
  const token = getAuthToken();
  if (!token) return false;

  if (isTokenExpired(token)) {
    clearAuth();
    return false;
  }

  return true;
};

// Recupera o papel do usuário a partir do token
export const getUserRole = () => {
  try {
    // Primeiro tenta obter do storage para performance
    const roleFromStorage = getRole();
    if (roleFromStorage) return roleFromStorage;

    // Se não encontrar no storage, tenta decodificar do token
    const token = getAuthToken();
    if (!token) return null;

    if (isTokenExpired(token)) {
      clearAuth();
      return null;
    }

    const decoded = decodeToken(token);
    return decoded?.role;
  } catch (e) {
    console.error('Erro ao obter papel do usuário:', e);
    clearAuth();
    return null;
  }
};

// Logout
export const logout = () => {
  clearAuth();
};
