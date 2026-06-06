import AppRouter from './app/router';
import BottomNav from './features/navigation/BottomNav';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">  {/* pb-20 — отступ под нижнюю панель */}
      <AppRouter />
      <BottomNav />
    </div>
  );
}

export default App;