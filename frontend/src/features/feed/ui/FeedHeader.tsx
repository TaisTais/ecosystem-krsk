import { Search, Plus } from 'lucide-react';
import PageHeader from '../../../shared/ui/PageHeader';

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  onCreate: () => void;
};

const FeedHeader = ({ search, onSearchChange, onCreate }: Props) => {
  return (
    <PageHeader
      leftSlot={
        <div className="flex gap-3 items-center">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Поиск по ленте..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-11 pr-4 py-3 text-base rounded-2xl border border-gray-200 focus:outline-none focus:border-emerald-500"
            />
            <Search className="absolute left-4 top-3.5 text-gray-400" size={22} />
          </div>
        </div>
      }
      rightSlot={
        <button
          onClick={onCreate}
          className="p-3 bg-emerald-600 text-white hover:bg-emerald-700 rounded-2xl transition-colors"
        >
          <Plus size={24} />
        </button>
      }
    />
  );
};

export default FeedHeader;