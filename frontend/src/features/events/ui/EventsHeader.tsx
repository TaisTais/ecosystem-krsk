import { Plus } from 'lucide-react';
import PageHeader from '../../../shared/ui/PageHeader';

type Props = {
  monthLabel: string;
  onCreate: () => void;
};

const EventsHeader = ({ monthLabel, onCreate }: Props) => {
  return (
    <PageHeader
      leftSlot={<h1 className="text-base sm:text-xl font-semibold truncate">{monthLabel}</h1>}
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

export default EventsHeader;
