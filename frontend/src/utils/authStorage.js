// Armazena o token e o papel (role) no localStorage ou sessionStorage
export const storeAuth = (token, role, rememberMe = false) => {
  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem('token', token);
  storage.setItem('role', role);
};

// Recupera o token
export const getAuthToken = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

// Recupera a role
export const getRole = () => {
  return localStorage.getItem('role') || sessionStorage.getItem('role');
};

// Remove tudo (logout)
export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('role');
};
