import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Typography } from '@/components/atoms';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHead,
  TableRow,
} from '@/components/molecules/table';

const SUB_ROW_BG = 'bg-[#F8F8F8]';
const ROW_BORDER = 'border-b border-gray-200';

export interface DeliveryDetailsPackage {
  trackingId: string;
  weight: string;
  dimensions: string;
  value: string;
}

export interface DeliveryDetailsGroup {
  deliveryId: string;
  customerName: string;
  postcode: string;
  totalPackages: string;
  totalWeight: string;
  totalAmount: string;
  packages: DeliveryDetailsPackage[];
}

interface DeliveryDetailsTableProps {
  /** Section title (e.g. "Delivery Details") */
  title?: string;
  /** Delivery groups with packages */
  deliveryGroups: DeliveryDetailsGroup[];
  /** Format package amount for display */
  formatAmount: (value: number) => string;
  /** Initial expanded delivery ID (optional). If not provided, first group is expanded. */
  defaultExpandedId?: string | null;
  /** Controlled expanded ID (optional). When provided with onExpandToggle, table is controlled. */
  expandedDeliveryId?: string | null;
  /** Called when user toggles a row (optional, for controlled mode) */
  onExpandToggle?: (deliveryId: string) => void;
  /** Optional class for the outer wrapper */
  className?: string;
}

/**
 * DeliveryDetailsTable — common expandable table for delivery/package details.
 * Matches Figma: rounded container, white main rows, light grey sub-rows (#F8F8F8),
 * border-bottom on every row, correct column alignments (Customer/Postcode/Delivery ID left;
 * Total Packages/Weight center; Total Amount right; sub-rows: Tracking ID left, Weight/Dimensions center, Amount right).
 */
export default function DeliveryDetailsTable({
  title = 'Delivery Details',
  deliveryGroups,
  formatAmount,
  defaultExpandedId,
  expandedDeliveryId: controlledExpandedId,
  onExpandToggle,
  className = '',
}: DeliveryDetailsTableProps): React.JSX.Element {
  const [internalExpanded, setInternalExpanded] = useState<string | null>(
    () => defaultExpandedId ?? deliveryGroups[0]?.deliveryId ?? null
  );

  const isControlled = controlledExpandedId !== undefined;
  const expandedDeliveryId = isControlled ? controlledExpandedId : internalExpanded;

  const handleToggle = (deliveryId: string): void => {
    if (isControlled && onExpandToggle) {
      onExpandToggle(deliveryId);
    } else if (!isControlled) {
      setInternalExpanded((prev) => (prev === deliveryId ? null : deliveryId));
    }
  };

  if (deliveryGroups.length === 0) {
    return <div className={className} />;
  }

  return (
    <div className={className}>
      <Typography variant="h5" weight="semibold" className="text-xl text-gray-900 mb-4">
        {title}
      </Typography>
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <Table className="border-separate border-spacing-0 w-full table-fixed">
          <colgroup>
            <col style={{ width: '2.5rem' }} />
            <col style={{ width: '18%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '16%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '14%' }} />
          </colgroup>
          <TableHeader>
            <TableRow className="border-0 hover:bg-gray-200 bg-gray-200 [&>th]:border-b [&>th]:border-gray-200">
              <TableHead className="p-3 bg-gray-200 font-semibold text-form-title text-center w-10 border-b border-gray-200" />
              <TableHead className="p-3 bg-gray-200 font-semibold text-form-title text-center border-b border-gray-200">
                Customer name
              </TableHead>
              <TableHead className="p-3 bg-gray-200 font-semibold text-form-title text-center border-b border-gray-200">
                Postcode
              </TableHead>
              <TableHead className="p-3 bg-gray-200 font-semibold text-form-title text-center border-b border-gray-200">
                Delivery ID
              </TableHead>
              <TableHead className="p-3 bg-gray-200 font-semibold text-form-title text-center border-b border-gray-200">
                Total Packages
              </TableHead>
              <TableHead className="p-3 bg-gray-200 font-semibold text-form-title text-center border-b border-gray-200">
                Total Weight
              </TableHead>
              <TableHead className="p-3 bg-gray-200 font-semibold text-form-title text-center border-b border-gray-200">
                Total Amount
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deliveryGroups.map((group) => {
              const isExpanded = expandedDeliveryId === group.deliveryId;
              return (
                <React.Fragment key={group.deliveryId}>
                  <TableRow
                    className="bg-white border-0 cursor-pointer hover:bg-gray-50/80 transition-colors [&>td]:border-b [&>td]:border-gray-200"
                    onClick={() => handleToggle(group.deliveryId)}
                  >
                    <TableCell className="p-3 bg-white text-center border-b border-gray-200">
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-gray-600 inline-block" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-600 inline-block" />
                      )}
                    </TableCell>
                    <TableCell className="p-3 h-14 bg-white text-left border-b border-gray-200">
                      <Typography
                        variant="caption"
                        align="center"
                        weight="medium"
                        className="text-form-title"
                      >
                        {group.customerName}
                      </Typography>
                    </TableCell>
                    <TableCell className="p-3 h-14 bg-white text-left border-b border-gray-200">
                      <Typography
                        variant="caption"
                        align="center"
                        weight="medium"
                        className="text-form-title"
                      >
                        {group.postcode}
                      </Typography>
                    </TableCell>
                    <TableCell className="p-3 h-14 bg-white text-left border-b border-gray-200">
                      <Typography
                        variant="caption"
                        align="center"
                        weight="medium"
                        className="text-form-title"
                      >
                        {group.deliveryId}
                      </Typography>
                    </TableCell>
                    <TableCell className="p-3 h-14 bg-white text-center border-b border-gray-200">
                      <Typography
                        variant="caption"
                        align="center"
                        weight="medium"
                        className="text-form-title"
                      >
                        {group.totalPackages}
                      </Typography>
                    </TableCell>
                    <TableCell className="p-3 h-14 bg-white text-center border-b border-gray-200">
                      <Typography
                        variant="caption"
                        align="center"
                        weight="medium"
                        className="text-form-title"
                      >
                        {group.totalWeight}
                      </Typography>
                    </TableCell>
                    <TableCell className="p-3 h-14 bg-white text-right border-b border-gray-200">
                      <Typography
                        variant="caption"
                        align="center"
                        weight="semibold"
                        className="text-form-title"
                      >
                        {group.totalAmount}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  {isExpanded && (
                    <>
                      <TableRow className={`border-0 ${ROW_BORDER} ${SUB_ROW_BG}`}>
                        <TableCell className={`p-3 ${SUB_ROW_BG} text-center ${ROW_BORDER}`} />
                        <TableCell
                          className={`p-3 ${SUB_ROW_BG} text-center ${ROW_BORDER} font-semibold text-form-title text-sm`}
                        />
                        <TableCell
                          className={`p-3 ${SUB_ROW_BG} text-center ${ROW_BORDER} font-semibold text-form-title text-sm`}
                        >
                          Tracking ID
                        </TableCell>
                        <TableCell
                          className={`p-3 ${SUB_ROW_BG} text-center ${ROW_BORDER} font-semibold text-form-title text-sm`}
                        >
                          Weight
                        </TableCell>
                        <TableCell
                          colSpan={2}
                          className={`p-3 ${SUB_ROW_BG} text-center ${ROW_BORDER} font-semibold text-form-title text-sm`}
                        >
                          Dimensions (cm)
                        </TableCell>
                        <TableCell
                          className={`p-3 ${SUB_ROW_BG} text-center ${ROW_BORDER} font-semibold text-form-title text-sm`}
                        >
                          Amount
                        </TableCell>
                      </TableRow>
                      {group.packages.map((pkg, idx) => {
                        const isLastPkg = idx === group.packages.length - 1;
                        const packageLabel = `Package ${String(idx + 1).padStart(2, '0')}`;
                        const amount = formatAmount(
                          parseFloat(String(pkg.value).replace(/[£,\s]/g, '')) || 0
                        );
                        return (
                          <TableRow
                            key={`${group.deliveryId}-pkg-${idx}`}
                            className={`border-0 ${ROW_BORDER} ${SUB_ROW_BG}`}
                          >
                            <TableCell
                              className={`p-3 ${SUB_ROW_BG} text-center ${ROW_BORDER} ${isLastPkg ? 'rounded-bl-lg' : ''}`}
                            />
                            <TableCell className={`p-3 ${SUB_ROW_BG} text-center ${ROW_BORDER}`}>
                              <Typography
                                variant="caption"
                                align="center"
                                weight="semibold"
                                className="text-form-title"
                              >
                                {packageLabel}
                              </Typography>
                            </TableCell>
                            <TableCell className={`p-3 ${SUB_ROW_BG} text-center ${ROW_BORDER}`}>
                              <Typography
                                variant="caption"
                                align="center"
                                weight="medium"
                                className="text-form-title"
                              >
                                {pkg.trackingId}
                              </Typography>
                            </TableCell>
                            <TableCell className={`p-3 ${SUB_ROW_BG} text-center ${ROW_BORDER}`}>
                              <Typography
                                variant="caption"
                                align="center"
                                weight="medium"
                                className="text-form-title"
                              >
                                {pkg.weight}
                              </Typography>
                            </TableCell>
                            <TableCell
                              colSpan={2}
                              className={`p-3 ${SUB_ROW_BG} text-center ${ROW_BORDER}`}
                            >
                              <Typography
                                variant="caption"
                                align="center"
                                weight="medium"
                                className="text-form-title"
                              >
                                {pkg.dimensions}
                              </Typography>
                            </TableCell>
                            <TableCell
                              className={`p-3 ${SUB_ROW_BG} text-center ${ROW_BORDER} ${isLastPkg ? 'rounded-br-lg' : ''}`}
                            >
                              <Typography
                                variant="caption"
                                align="center"
                                weight="semibold"
                                className="text-form-title"
                              >
                                {amount}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </>
                  )}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
