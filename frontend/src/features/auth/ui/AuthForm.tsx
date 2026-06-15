import { useState } from 'react';
import { useAuth } from '../../../app/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../../shared/lib/api';

type Mode = 'login' | 'register';

export const AuthForm = () => {
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await api.post('/auth/login', { email, password });
        const token = res.data.access_token;

        localStorage.setItem('access_token', token);

        const userRes = await api.get('/me/');
        login(token, userRes.data);
      } else {
        await api.post('/auth/register', { name, email, password });

        const loginRes = await api.post('/auth/login', { email, password });
        const token = loginRes.data.access_token;

        localStorage.setItem('access_token', token);

        const userRes = await api.get('/me/');
        login(token, userRes.data);
      }

      navigate('/profile');
    } catch (err: unknown) {
      let message =
        mode === 'login'
          ? 'Неверный email или пароль'
          : 'Не удалось зарегистрироваться';

      if (err && typeof err === 'object' && err !== null) {
        const errorAny = err as Record<string, unknown>;
        const response = errorAny.response as Record<string, unknown> | undefined;
        const data = response?.data as Record<string, unknown> | undefined;

        if (typeof data?.detail === 'string') {
          message = data.detail;
        }
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50/70 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Экосистема Красноярска</h1>
          <p className="text-gray-500 mt-1">
            {mode === 'login' ? 'Вход в аккаунт' : 'Создание аккаунта'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Имя</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Иван Иванов"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="ivan@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-3.5 rounded-2xl font-medium hover:bg-emerald-700 transition disabled:opacity-70"
          >
            {loading
              ? mode === 'login'
                ? 'Входим...'
                : 'Регистрируем...'
              : mode === 'login'
                ? 'Войти'
                : 'Зарегистрироваться'}
          </button>
        </form>

        <div className="text-center mt-6">
          {mode === 'login' ? (
            <p className="text-sm text-gray-600">
              Нет аккаунта?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-emerald-600 font-medium hover:underline"
              >
                Зарегистрироваться
              </button>
            </p>
          ) : (
            <p className="text-sm text-gray-600">
              Уже есть аккаунт?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-emerald-600 font-medium hover:underline"
              >
                Войти
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};