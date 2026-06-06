const FeedBlock = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Верхняя шапка */}
      <div className="bg-white border-b px-4 py-3 sticky top-0 z-40">
        <h1 className="text-xl font-semibold">Лента</h1>
      </div>

      {/* Основное содержание */}
      <div className="p-4 space-y-6">
        <div className="bg-white rounded-2xl p-6 text-center border border-gray-100">
          <div className="text-5xl mb-4">📋</div>
          <h2 className="text-xl font-medium text-gray-800">Лента событий и постов</h2>
          <p className="text-gray-500 mt-3">
            Здесь будут отображаться посты от жителей, организаций и анонсы мероприятий
          </p>
        </div>

        {/* Пример поста */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-xl">
              👤
            </div>
            <div>
              <p className="font-medium">Анна Смирнова</p>
              <p className="text-xs text-gray-500">2 часа назад</p>
            </div>
          </div>
          
          <p className="text-gray-700 leading-relaxed">
            Сегодня сдала 3 кг макулатуры и 12 батареек! Спасибо волонтёрам за работу ❤️
          </p>
          
          <div className="mt-4 text-xs text-emerald-600 font-medium">
            #переработка #экодень
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedBlock;