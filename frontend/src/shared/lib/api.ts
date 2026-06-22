import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

// ✅ Интерцептор: автоматически добавляем токен
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    console.log('📤 Request to:', config.url, 'Token present:', !!token); // ← для отладки

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Опционально: обработка 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Токен истёк или недействителен');
      localStorage.removeItem('access_token');
      // Можно добавить редирект на логин
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;