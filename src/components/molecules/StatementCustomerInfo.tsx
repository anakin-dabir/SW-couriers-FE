import { MetaInfoGrid, type MetaInfoItem } from '@/components/molecules';

interface StatementCustomerInfoProps {
  customerName: string;
  customerContact: string;
  issuedDate: string;
}

/**
 * StatementCustomerInfo Molecule
 *
 * Displays customer information and issued date using MetaInfoGrid
 * Layout: 2 items on left (Customer Name, Customer Contact), 1 item on right (Issued on)
 * Uses the same UI pattern as Payment Details section
 */
export default function StatementCustomerInfo({
  customerName,
  customerContact,
  issuedDate,
}: StatementCustomerInfoProps): React.JSX.Element {
  const CUSTOMER_INFO_ITEMS: MetaInfoItem[] = [
    {
      label: 'Customer Name',
      value: customerName,
    },
    {
      label: 'Customer Contact',
      value: customerContact,
    },
    {
      label: 'Issued on',
      value: issuedDate,
    },
  ];

  return (
    <div className="pt-6">
      <MetaInfoGrid items={CUSTOMER_INFO_ITEMS} layout="custom" rightColumnAlign="right" />
    </div>
  );
}
