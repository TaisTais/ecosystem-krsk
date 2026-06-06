// src/features/navigation/BottomNav.tsx
import { Home, Map, Calendar, User, Milestone } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'Главная', icon: Home, path: '/' },
  { label: 'Карта', icon: Map, path: '/map' },
  { label: 'Лента', icon: Milestone, path: '/feed' },
  { label: 'События', icon: Calendar, path: '/events' },
  { label: 'Профиль', icon: User, path: '/profile' },
];

const BottomNav = () => {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
      <div className="max-w-md mx-auto flex items-center justify-around py-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-2 px-3 transition-all active:scale-95 ${
                isActive 
                  ? 'text-emerald-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <item.icon 
                size={26} 
                className={`transition-colors ${isActive ? 'text-emerald-600' : 'text-gray-500'}`} 
              />
              <span className={`text-xs mt-1 font-medium transition-colors ${
                isActive ? 'text-emerald-600' : 'text-gray-500'
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;