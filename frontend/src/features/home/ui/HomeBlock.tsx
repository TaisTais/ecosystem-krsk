import { Link } from 'react-router-dom';

const HomeBlock = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Верхняя шапка */}
      <div className="bg-emerald-600 text-white px-4 py-6">
        <h1 className="text-2xl font-bold">Экосистема Красноярска</h1>
        <p className="text-emerald-100 mt-1">Вместе делаем город чище</p>
      </div>

      <div className="p-4 space-y-6">
        {/* Быстрые действия */}
        <div className="grid grid-cols-2 gap-4">
          <Link to="/map" className="bg-white p-5 rounded-2xl shadow-sm active:scale-95 transition-all">
            <div className="text-3xl mb-3">🗺️</div>
            <h3 className="font-semibold">Карта точек</h3>
            <p className="text-sm text-gray-500">Сдать вторсырьё рядом</p>
          </Link>

          <Link to="/events" className="bg-white p-5 rounded-2xl shadow-sm active:scale-95 transition-all">
            <div className="text-3xl mb-3">📅</div>
            <h3 className="font-semibold">Ближайшие события</h3>
            <p className="text-sm text-gray-500">Субботники и акции</p>
          </Link>
        </div>

        {/* Лента анонсов (короткая версия) */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Последние обновления</h2>
            <Link to="/feed" className="text-emerald-600 text-sm font-medium">Все →</Link>
          </div>
          
          <div className="space-y-4">
            {/* Пока статичные карточки, позже заменим на реальные данные */}
            <div className="bg-white rounded-2xl p-4">
              <p className="text-sm text-gray-500">2 часа назад</p>
              <p className="mt-1">Открылся новый пункт приёма батареек у ТЦ "Планета"</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeBlock;