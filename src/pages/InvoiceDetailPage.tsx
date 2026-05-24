import { useParams } from 'react-router-dom';
import Typography from '@/components/atoms/Typography';
import InvoiceDetailView from '@/components/pages/Billing/InvoiceDetailView';

export default function InvoiceDetailPage(): React.JSX.Element {
  const { invoiceId } = useParams<{ invoiceId: string }>();

  if (!invoiceId?.trim()) {
    return (
      <Typography className="py-8 text-center text-sm text-[#71717A]">
        Invoice not found.
      </Typography>
    );
  }

  return <InvoiceDetailView invoiceId={invoiceId.trim()} />;
}
