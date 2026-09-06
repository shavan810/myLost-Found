import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const api = axios.create({ baseURL: '/api' });
const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      api.get('/auth/profile')
        .then(({ data }) => { if (data.user?.isAdmin) setAdmin(data.user); else logout(); })
        .catch(logout)
        .finally(() => setLoading(false));
    } else setLoading(false);
  }, []);

  const login = async (credentials) => {
    const { data } = await api.post('/admin/login', credentials);
    localStorage.setItem('adminToken', data.token);
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    setAdmin(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    delete api.defaults.headers.common['Authorization'];
    setAdmin(null);
    setLoading(false);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, logout, api, isAuthenticated: !!admin }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
