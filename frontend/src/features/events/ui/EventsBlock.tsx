const EventsBlock = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Верхняя шапка */}
      <div className="bg-white border-b px-4 py-3 sticky top-0 z-40">
        <h1 className="text-xl font-semibold">События</h1>
      </div>

      {/* Основное содержание */}
      <div className="p-4 space-y-6">
        <div className="bg-white rounded-2xl p-6 text-center border border-gray-100">
          <div className="text-5xl mb-4">📅</div>
          <h2 className="text-xl font-medium text-gray-800">Календарь событий</h2>
          <p className="text-gray-500 mt-3">
            Здесь будут анонсы субботников, лекций, эко-маркетов и других мероприятий
          </p>
        </div>

        {/* Пример карточки события */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-emerald-600 text-sm font-medium">28 июня • 11:00</p>
              <h3 className="font-semibold text-lg mt-1">Субботник на берегу Енисея</h3>
              <p className="text-gray-600 text-sm mt-2">Сбор у Покровского собора</p>
            </div>
            <div className="text-right">
              <span className="inline-block bg-emerald-100 text-emerald-700 text-xs px-3 py-1 rounded-full">
                Эко
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
            <span>👥 12 участников</span>
            <span>•</span>
            <span>🏞️ Центральный район</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventsBlock;