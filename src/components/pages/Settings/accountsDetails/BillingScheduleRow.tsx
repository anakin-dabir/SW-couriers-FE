import { Calendar } from 'lucide-react';
import Typography from '@/components/atoms/Typography';

interface BillingScheduleRowProps {
  label?: string;
  value: string;
}

export default function BillingScheduleRow({
  label = 'Billing Schedule',
  value,
}: BillingScheduleRowProps): React.JSX.Element {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-[#E2E6EE] bg-[#F7F8FB] px-4 py-3">
      <Typography variant="body" className="text-sm font-medium text-[#52525B]">
        {label}
      </Typography>
      <div className="flex items-center gap-2">
        <Typography variant="body" weight="medium" className="text-sm text-[#18181B]">
          {value}
        </Typography>
        <Calendar className="h-4 w-4 text-[#9CA3AF]" aria-hidden />
      </div>
    </div>
  );
}
