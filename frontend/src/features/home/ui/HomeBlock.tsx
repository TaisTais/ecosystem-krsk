import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLatestPost } from '../hooks/useLatestPost';
import PostCard from '../../feed/ui/PostCard';

const HomeBlock = () => {
  const { post: latestPost, loading: latestLoading, refetch: refetchLatest } = useLatestPost();


  return (
    <div className="min-h-screen bg-emerald-50 pb-24">
      {/* Зеленая шапка */}
      <div className="bg-linear-to-br from-emerald-600 via-[#4ca78a] to-[#81e4b1] text-white px-5 pt-10 pb-10 relative overflow-hidden flex flex-row justify-between items-center">
        <div className="relative z-10">
          <h1 className="text-3xl font-medium leading-tight text-lime-100">
            Вместе заботимся<br />о своем доме!
          </h1>
          <p className="text-emerald-100 mt-2 text-md">Экосистема Красноярска</p>
        </div>
        <div className="absolute bottom-2 right-4 pb-4">
          <img 
            src="/assets/images/forest.png" 
            alt="" 
            className="h-26 w-auto"
            width={40}
            height={40}
          />
        </div>
      </div>

      <div className="px-4 -mt-6 relative z-10 space-y-8">
        {/* Быстрые действия */}
        <div className="grid grid-cols-2 gap-4">
          <Link
            to="/map"
            className="bg-white rounded-3xl p-5 shadow-sm active:scale-[0.97] transition-all flex flex-col items-center text-center"
          >
            <div className="w-16 h-16 bg-[#ceede1] rounded-2xl flex items-center justify-center mb-4">
              <img src="/assets/images/earth.png" alt="Карта" className="w-12 h-12" />
            </div>
            <h3 className="font-semibold text-lg">Карта точек</h3>
            <p className="text-sm text-gray-500 mt-1">Сдать вторсырьё рядом</p>
          </Link>

          <Link
            to="/events"
            className="bg-white rounded-3xl p-5 shadow-sm active:scale-[0.97] transition-all flex flex-col items-center text-center"
          >
            <div className="w-16 h-16 bg-[#ceede1] rounded-2xl flex items-center justify-center mb-4">
              <img src="/assets/images/enviroment.png" alt="События" className="w-12 h-12" />
            </div>
            <h3 className="font-semibold text-lg">События</h3>
            <p className="text-sm text-gray-500 mt-1">Субботники<br />и акции</p>
          </Link>
        </div>

        {/* Последние обновления */}
        <div>
          <div className="flex justify-between items-center mb-4 px-1">
            <h2 className="text-sm text-emerald-600 font-semibold">Последние новости</h2>
            <Link to="/feed" className="text-emerald-600 text-sm font-medium flex items-center gap-1">
              Все <ArrowRight size={16} />
            </Link>
          </div>

          <div className="space-y-4">
            {latestLoading ? (
              <div className="bg-white rounded-2xl p-6 text-center text-gray-500">
                Загрузка...
              </div>
            ) : latestPost ? (
              <PostCard
                post={latestPost}
                currentUserId={latestPost.author_id ?? null}        // если profile доступен
                currentUserRole={latestPost.author_role ?? null}
                onOpenComments={(postId) => console.log('Открыть комментарии к посту', postId)}
                onOpenEdit={(postId) => console.log('Редактировать пост', postId)}
                onRefresh={() => refetchLatest()}
              />
            ) : (
              /* Заглушка */
              <div className="bg-white rounded-2xl p-5">
                <p className="text-sm text-gray-500">2 часа назад</p>
                <p className="mt-1">Открылся новый пункт приёма батареек у ТЦ "Планета"</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeBlock;