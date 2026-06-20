import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import { useAuth } from './context/AuthContext';
import MapPage from '@/pages/MapPage';
import FeedPage from '@/pages/FeedPage';
import EventsPage from '@/pages/EventsPage';
import HomePage from '@/pages/HomePage';

// Пока заглушки для страниц
const ProfilePage = () => <h1 className="p-8 text-2xl">Личный кабинет</h1>;

const AppRouter = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Публичные страницы — доступны всем */}
      <Route path="/" element={<HomePage />} />
      <Route path="/map" element={<MapPage />} />
      <Route path="/feed" element={<FeedPage />} />
      <Route path="/login" element={<LoginPage/>} />
      <Route path="/events" element={<EventsPage />} />

      {/* Защищённые страницы — только для авторизованных */}
      <Route 
        path="/profile" 
        element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />} 
      />

      {/* Если пользователь ввёл неизвестный адрес */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRouter;