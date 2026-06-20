import { Filter, Plus, Search } from 'lucide-react';
import PageHeader from '../../../shared/ui/PageHeader';

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  onFilterClick: () => void;
  onCreate: () => void;
};

const MapHeader = ({ search, onSearchChange, onFilterClick, onCreate }: Props) => {
  return (
    <PageHeader
      leftSlot={
        <div className="flex gap-3 items-center">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Поиск эко-точек..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-11 pr-4 py-3 text-base rounded-2xl border border-gray-200 focus:outline-none focus:border-emerald-500"
            />
            <Search className="absolute left-4 top-3.5 text-gray-400" size={22} />
          </div>

          <button onClick={onFilterClick} className="p-3 text-emerald-600 hover:bg-emerald-50 rounded-2xl">
            <Filter size={24} />
          </button>
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

export default MapHeader;