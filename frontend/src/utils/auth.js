import { getAuthToken, getUserRole as getStoredRole, clearAuth } from './authStorage';

export const isAuthenticated = () => {
  return !!getAuthToken();
};

export const getUserRole = () => {
  return getStoredRole();
};

export const logout = () => {
  clearAuth();
};
