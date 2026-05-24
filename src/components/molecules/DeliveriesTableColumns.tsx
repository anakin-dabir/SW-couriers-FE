import { DeliveryStatusBadge, Typography, Link } from '@/components/atoms';
import { ArrowUpRight } from 'lucide-react';
import TableActionMenu from './TableActionMenu';
import type { Delivery } from '@/types/delivery';
import type { Column } from '@/types/datatable';
import { getDeliveryActionsForStatus } from '@/lib/deliveries';
import { DELIVERY_LIST_STATUS_CHIP_OPTIONS } from '@/lib/data';
import { cn, formatCurrency } from '@/lib/utils';

const CELL_RESPONSIVE_ALIGNMENT_CLASS = 'sm:text-left! text-right!';

interface GetDeliveriesTableColumnsOptions {
  onDeliveryClick?: (trackingId: string) => void;
  /** Status column display: 'default' (icon + text) or 'chip' (colored chip, off-white text, no icon) */
  statusVariant?: 'default' | 'chip';
  /** Table layout variant for specific screens */
  variant?: 'default' | 'list';
}

interface GetDraftDeliveriesTableColumnsOptions {
  onDeliveryClick?: (trackingId: string) => void;
  onContinueClick?: (trackingId: string) => void;
  continueLabel?: string;
}

/**
 * Get deliveries table column definitions
 */
export function getDeliveriesTableColumns(
  options?: GetDeliveriesTableColumnsOptions
): Column<Delivery>[] {
  const { onDeliveryClick, statusVariant = 'default', variant = 'default' } = options || {};

  const extractPostalCode = (address: string): string => {
    const ukPostcodeMatch = address.match(/\b[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}\b/i);
    return ukPostcodeMatch?.[0] ?? '---';
  };

  const formatPackages = (items: string): string => {
    const itemsNumber = parseInt(items, 10);
    return Number.isNaN(itemsNumber) ? items : itemsNumber.toString().padStart(2, '0');
  };

  const getRequestId = (row: Delivery): string => {
    const numericTrackingId = row.trackingId.replace(/\D/g, '').slice(-5).padStart(5, '0');
    return `#AT${numericTrackingId}NS${row.id}`;
  };

  const getTrackingIdDisplay = (trackingId: string): string => {
    const numericTrackingId = trackingId.replace(/\D/g, '');
    return numericTrackingId || trackingId;
  };

  const getListStatusChip = (row: Delivery): { label: string; className: string } => {
    const pendingChip = DELIVERY_LIST_STATUS_CHIP_OPTIONS.find(
      (option) => option.value === 'pending'
    );
    const deliveredChip = DELIVERY_LIST_STATUS_CHIP_OPTIONS.find(
      (option) => option.value === 'delivered'
    );
    const failedChips = DELIVERY_LIST_STATUS_CHIP_OPTIONS.filter(
      (option) => option.value === 'failed'
    );
    const inTransitChips = DELIVERY_LIST_STATUS_CHIP_OPTIONS.filter(
      (option) => option.value === 'in-transit'
    );

    if (row.status === 'pending') {
      return {
        label: pendingChip?.label ?? 'Pending Pickup',
        className: pendingChip?.chipClassName ?? 'bg-[#F97316] text-white',
      };
    }

    if (row.status === 'delivered') {
      return {
        label: deliveredChip?.label ?? 'Delivered',
        className: deliveredChip?.chipClassName ?? 'bg-[#10B981] text-white',
      };
    }

    if (row.status === 'failed') {
      const index = Number(row.id) % failedChips.length;
      const selectedChip = failedChips[index];
      return {
        label: selectedChip?.label ?? 'Refused',
        className: selectedChip?.chipClassName ?? 'bg-[#DC2626] text-white',
      };
    }

    const index = Number(row.id) % inTransitChips.length;
    const selectedChip = inTransitChips[index];
    return {
      label: selectedChip?.label ?? 'Out for Delivery',
      className: selectedChip?.chipClassName ?? 'bg-[#3B82F6] text-white',
    };
  };

  if (variant === 'list') {
    return [
      {
        key: 'requestId',
        header: 'Request ID',
        mobileOrder: 1,
        cell: (row: Delivery) => (
          <button
            type="button"
            onClick={() => onDeliveryClick?.(row.trackingId)}
            className="cursor-pointer hover:opacity-80 transition-opacity w-full text-left"
          >
            <Typography variant="caption" color="muted">
              {getRequestId(row)}
            </Typography>
          </button>
        ),
      },
      {
        key: 'trackingId',
        header: 'Tracking ID #',
        mobileOrder: 2,
        cell: (row: Delivery) => (
          <Typography variant="caption" weight="medium" className="text-form-title">
            {getTrackingIdDisplay(row.trackingId)}
          </Typography>
        ),
      },
      {
        key: 'recipientName',
        header: 'Customer Name',
        mobileOrder: 3,
        cell: (row: Delivery) => (
          <Typography variant="caption" weight="medium" className="text-form-title">
            {row.recipientName}
          </Typography>
        ),
      },
      {
        key: 'postalCode',
        header: 'Postal Code',
        mobileOrder: 4,
        cell: (row: Delivery) => (
          <Typography variant="caption" weight="medium" className="text-form-title">
            {extractPostalCode(row.recipientAddress)}
          </Typography>
        ),
      },
      {
        key: 'items',
        header: 'Packages',
        mobileOrder: 5,
        cell: (row: Delivery) => (
          <Typography variant="caption" weight="medium" className="text-form-title">
            {formatPackages(row.items)}
          </Typography>
        ),
      },
      {
        key: 'value',
        header: 'Value',
        mobileOrder: 6,
        cell: (row: Delivery) => (
          <Typography variant="caption" weight="semibold" className="text-form-title">
            {formatCurrency(row.value)}
          </Typography>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        mobileOrder: 7,
        headerAlign: 'left',
        cellAlign: 'left',
        cell: (row: Delivery) => {
          const statusChip = getListStatusChip(row);
          return (
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold',
                statusChip.className
              )}
            >
              {statusChip.label}
            </span>
          );
        },
      },
      {
        key: 'pickupSchedule',
        header: 'Pickup Schedule',
        mobileOrder: 8,
        cell: () => (
          <Typography variant="caption" className="text-gray-500 leading-tight">
            Awaiting confirmation
          </Typography>
        ),
      },
      {
        key: 'deliverySchedule',
        header: 'Delivery Schedule',
        mobileOrder: 9,

        cell: () => (
          <Typography variant="caption" className="text-gray-500 leading-tight">
            Awaiting confirmation
          </Typography>
        ),
      },
      {
        key: 'open',
        header: '',
        mobileOrder: 10,
        cellAlign: 'right',
        cell: (row: Delivery) => (
          <button
            type="button"
            onClick={() => onDeliveryClick?.(row.trackingId)}
            className="cursor-pointer text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Open delivery"
          >
            <ArrowUpRight className="h-4 w-4" />
          </button>
        ),
      },
    ];
  }

  return [
    {
      key: 'deliveryId',
      header: 'Delivery ID',
      mobileOrder: 1,
      cell: (row: Delivery) => (
        <button
          type="button"
          onClick={() => onDeliveryClick?.(row.trackingId)}
          className="cursor-pointer hover:opacity-80 transition-opacity w-full"
        >
          <Typography variant="caption" color="muted">
            {row.deliveryId}
          </Typography>
        </button>
      ),
    },
    {
      key: 'trackingId',
      header: 'Tracking ID #',
      mobileOrder: 2,
      cell: (row: Delivery) => (
        <div className="flex flex-col">
          <Typography
            variant="caption"
            weight="semibold"
            className={cn('text-form-title', CELL_RESPONSIVE_ALIGNMENT_CLASS)}
          >
            {row.trackingId}
          </Typography>
        </div>
      ),
    },
    {
      key: 'recipientName',
      header: 'Customer',
      mobileOrder: 3,
      cell: (row: Delivery) => (
        <div className="flex flex-col">
          <Typography
            variant="caption"
            weight="semibold"
            className={cn('text-form-title', CELL_RESPONSIVE_ALIGNMENT_CLASS)}
          >
            {row.recipientName}
          </Typography>
          <Typography
            variant="caption"
            className={cn('text-gray-400', CELL_RESPONSIVE_ALIGNMENT_CLASS)}
          >
            {row.contactNumber}
          </Typography>
        </div>
      ),
    },
    {
      key: 'weight',
      header: 'Weight',
      mobileOrder: 4,
      cell: (row: Delivery) => {
        // Extract numeric value from "2.5 kg" format and convert to "2.5 (kg)"
        const weightValue = row.weight.replace(' kg', '').trim();
        return (
          <Typography variant="caption" weight="medium" className="text-form-title">
            {weightValue} (kg)
          </Typography>
        );
      },
    },
    {
      key: 'recipientAddress',
      header: 'Delivery address',
      mobileOrder: 5,
      cell: (row: Delivery) => {
        // Parse address: "123 Main St, London, UK" -> street: "123 Main St", city: "London"
        const addressParts = row.recipientAddress.split(',').map((part) => part.trim());
        const streetAddress = addressParts.slice(0, -2).join(', ') || addressParts[0];
        const city = addressParts[addressParts.length - 2] || addressParts[addressParts.length - 1];

        return (
          <div className="flex flex-col">
            <Typography
              variant="caption"
              weight="medium"
              className={cn('text-form-title', CELL_RESPONSIVE_ALIGNMENT_CLASS)}
            >
              {streetAddress}
            </Typography>
            <Typography
              variant="caption"
              color="muted"
              className={cn(CELL_RESPONSIVE_ALIGNMENT_CLASS)}
            >
              {city}
            </Typography>
          </div>
        );
      },
    },
    {
      key: 'items',
      header: 'No of Packages',
      mobileOrder: 6,
      cell: (row: Delivery) => {
        // Format items with leading zero: "1" -> "01", "2" -> "02", etc.
        const itemsNumber = parseInt(row.items, 10);
        const formattedItems = isNaN(itemsNumber)
          ? row.items
          : itemsNumber.toString().padStart(2, '0');
        return (
          <Typography variant="caption" weight="medium" className="text-form-title">
            {formattedItems}
          </Typography>
        );
      },
    },
    {
      key: 'value',
      header: 'values',
      mobileOrder: 7,
      cell: (row: Delivery) => (
        <Typography variant="caption" weight="semibold" className="text-form-title">
          {formatCurrency(row.value)}
        </Typography>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      mobileOrder: 8,
      headerAlign: 'left',
      cellAlign: 'left',
      cell: (row: Delivery) => <DeliveryStatusBadge status={row.status} variant={statusVariant} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      mobileOrder: 99,
      cell: (row: Delivery) => (
        <TableActionMenu actions={getDeliveryActionsForStatus(row.status, row)} />
      ),
    },
  ];
}

/**
 * Draft table row: Delivery plus optional requestId (Figma 4538-26965).
 * Headers: Request ID, Postal Code, Customer, Packages, Total Weight, Value, Actions.
 */
export interface DraftDeliveryRow extends Delivery {
  requestId?: string;
}

/**
 * Get draft deliveries table column definitions (Figma 4538-26965).
 * Simple table: Request ID, Postal Code, Customer, Packages, Total Weight, Value, Actions.
 */
export function getDraftDeliveriesTableColumns(
  options?: GetDraftDeliveriesTableColumnsOptions
): Column<DraftDeliveryRow>[] {
  const { onDeliveryClick, onContinueClick, continueLabel = 'Continue' } = options || {};
  const EMPTY_PLACEHOLDER = '---';
  const getDisplayValue = (value?: string): string =>
    value && value.trim().length > 0 ? value.trim() : EMPTY_PLACEHOLDER;

  const extractPostalCode = (address?: string): string => {
    if (!address) return EMPTY_PLACEHOLDER;
    const ukPostcodeMatch = address.match(/\b[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}\b/i);
    return ukPostcodeMatch?.[0] ?? EMPTY_PLACEHOLDER;
  };

  return [
    {
      key: 'requestId',
      header: 'Request ID',
      mobileOrder: 1,
      cell: (row: DraftDeliveryRow) => {
        const displayId = getDisplayValue(row.requestId);
        return onDeliveryClick ? (
          <button
            type="button"
            onClick={() => onDeliveryClick(row.trackingId)}
            className="cursor-pointer hover:opacity-80 transition-opacity w-full text-left"
          >
            <Typography variant="caption" className="text-form-title">
              {displayId}
            </Typography>
          </button>
        ) : (
          <Typography variant="caption" className="text-form-title">
            {displayId}
          </Typography>
        );
      },
    },
    {
      key: 'postalCode',
      header: 'Postal Code',
      mobileOrder: 2,
      cell: (row: DraftDeliveryRow) => (
        <Typography variant="caption" className="text-form-title">
          {extractPostalCode(row.recipientAddress)}
        </Typography>
      ),
    },
    {
      key: 'recipientName',
      header: 'Customer',
      mobileOrder: 3,
      cell: (row: DraftDeliveryRow) => (
        <Typography variant="caption" className="text-form-title">
          {getDisplayValue(row.recipientName)}
        </Typography>
      ),
    },
    {
      key: 'items',
      header: 'Packages',
      mobileOrder: 4,
      cell: (row: DraftDeliveryRow) => {
        const itemsNumber = parseInt(row.items, 10);
        const displayPackages = Number.isNaN(itemsNumber)
          ? getDisplayValue(row.items)
          : itemsNumber.toString().padStart(2, '0');
        return (
          <Typography variant="caption" className="text-form-title">
            {displayPackages}
          </Typography>
        );
      },
    },
    {
      key: 'weight',
      header: 'Total Weight',
      mobileOrder: 5,
      cell: (row: DraftDeliveryRow) => {
        return (
          <Typography variant="caption" className="text-form-title">
            {getDisplayValue(row.weight)}
          </Typography>
        );
      },
    },
    {
      key: 'value',
      header: 'Value',
      mobileOrder: 6,
      cell: (row: DraftDeliveryRow) => (
        <Typography variant="caption" className="text-form-title">
          {getDisplayValue(row.value) === EMPTY_PLACEHOLDER
            ? EMPTY_PLACEHOLDER
            : formatCurrency(row.value)}
        </Typography>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      mobileOrder: 7,
      cellAlign: 'left',
      cell: (row: DraftDeliveryRow) =>
        onContinueClick ? (
          <button
            type="button"
            onClick={() => onContinueClick(row.trackingId)}
            className="cursor-pointer hover:opacity-80 transition-opacity"
          >
            <Typography variant="caption" className="underline text-gray-600">
              {continueLabel}
            </Typography>
          </button>
        ) : (
          <Link to={`/deliveries/${row.trackingId}`} underline variant="primary">
            <Typography variant="caption" className="underline">
              {continueLabel}
            </Typography>
          </Link>
        ),
    },
  ];
}
