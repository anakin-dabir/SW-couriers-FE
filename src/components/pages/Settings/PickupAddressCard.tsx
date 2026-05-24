import { SquarePen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/molecules/card';
import { Button } from '@/components/atoms/Button';
import { MetaLabelValue } from '@/components/atoms';
import type { PickupAddress } from '@/types/pickupAddress';
import { cn } from '@/lib/utils';

export interface PickupAddressCardProps {
  address: PickupAddress;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

/**
 * Card displaying a single pickup address (read-only) with Edit and Delete actions.
 * Used in Settings > Pickup Address list.
 */
export default function PickupAddressCard({
  address,
  onEdit,
  onDelete,
}: PickupAddressCardProps): React.JSX.Element {
  return (
    <Card className="rounded-xl border-none bg-white">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <CardTitle className="truncate text-base font-semibold text-gray-900">
            {address.label}
          </CardTitle>
          {address.isDefault && (
            <span
              className={cn(
                'shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium',
                'bg-gray-100 text-gray-700'
              )}
            >
              Default Address
            </span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            type="button"
            size="sm"
            className="gap-1.50 sm:w-[100px]"
            onClick={() => onEdit(address.id)}
          >
            Edit
            <SquarePen className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="bg-primary-50/50 border border-primary-50 text-primary-600 sm:w-[100px]"
            onClick={() => onDelete(address.id)}
            aria-label="Delete address"
          >
            Delete
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-4">
            <MetaLabelValue label="Contact First Name" value={address.contactFirstName} />
            <MetaLabelValue label="Phone Number" value={address.phoneNumber} />
            <MetaLabelValue label="Building / House Number" value={address.buildingHouseNumber} />
            <MetaLabelValue label="Second Line of Address" value={address.secondLineOfAddress} />
            <MetaLabelValue label="County" value={address.county} />
          </div>
          <div className="flex flex-col gap-4">
            <MetaLabelValue label="Contact Last Name" value={address.contactLastName} />
            <MetaLabelValue label="Country" value={address.country} />
            <MetaLabelValue label="First Line of Address" value={address.firstLineOfAddress} />
            <MetaLabelValue label="Town / City" value={address.townCity} />
            <MetaLabelValue label="Postal Code" value={address.postalCode} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
