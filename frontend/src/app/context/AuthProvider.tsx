import { useEffect, useState, type ReactNode } from 'react';
import { AuthContext, type User } from './AuthContext';
import api from '../../shared/lib/api';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('access_token');

      console.log('🔄 AuthProvider init, token exists:', !!savedToken);

      if (!savedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.get('/me/');
        setUser(response.data);
        setToken(savedToken);
        console.log('✅ Пользователь загружен успешно');
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        console.error('❌ Токен недействителен, очищаем');
        localStorage.removeItem('access_token');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = (newToken: string, userData: User) => {
    localStorage.setItem('access_token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};