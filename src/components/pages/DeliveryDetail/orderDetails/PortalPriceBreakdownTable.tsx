import React from 'react';
import type { JSX } from 'react';
import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/atoms/collapsible';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/molecules/table';
import Typography from '@/components/atoms/Typography';
import { cn } from '@/lib/utils';
import type { PortalPriceBreakdown, PortalPriceBreakdownStop } from '@/lib/portalOrderDetailMock';
import {
  formatOrderCurrency,
  ORDER_DETAIL_SECTION_HEADER,
  ORDER_DETAIL_SECTION_SHELL,
} from '@/lib/orderDetailDisplay';
import OrderDetailServiceTierBadge from '@/components/pages/DeliveryDetail/orderDetails/OrderDetailServiceTierBadge';

export interface PortalPriceBreakdownTableProps {
  breakdown?: PortalPriceBreakdown;
  className?: string;
}

function toNumber(value: unknown, fallback = 0): number {
  if (value == null) return fallback;
  if (typeof value === 'number') return Number.isFinite(value) ? value : fallback;
  if (typeof value !== 'string') return fallback;
  const cleaned = value.replace(/[£,\s]/g, '');
  const num = parseFloat(cleaned);
  return Number.isFinite(num) ? num : fallback;
}

interface PackageLine {
  label: string;
  perPackageCalc: string;
  perPackageAmount: number;
  weightCalc: string;
  weightAmount: number;
  totalCalc: string;
  totalAmount: number;
}

interface AppliedDiscount {
  label: string;
  amount: number;
  calculation: string;
}

interface StopViewModel {
  base: number;
  packageTotalCalc: string;
  packageTotal: number;
  packageLines: PackageLine[];
  appliedDiscounts: AppliedDiscount[];
  subtotal: number;
  vat: number;
  vatRatePct: number;
  total: number;
}

function mapStopToViewModel(stop: PortalPriceBreakdownStop): StopViewModel {
  const perKg = toNumber(stop.pricing_plan?.price_per_kg, 0);
  const perPackage = toNumber(stop.pricing_plan?.price_per_package, 0);
  const tierLabel = stop.pricing_plan?.plain_name ?? stop.service_tier ?? 'Service';

  const packageLines: PackageLine[] = (stop.packages ?? []).map((pkg, idx) => {
    const perPackageAmount = toNumber(pkg.per_package_charge, perPackage);
    const weight = toNumber(pkg.declared_weight_kg, 0);
    const pkgPerKg = toNumber(pkg.weight_charge?.price_per_kg, perKg);
    const explicitWeightAmount = toNumber(pkg.weight_charge?.amount, 0);
    const weightAmount = explicitWeightAmount > 0 ? explicitWeightAmount : weight * pkgPerKg;
    const totalAmount = toNumber(pkg.total, perPackageAmount + weightAmount);
    return {
      label: `PACKAGE ${String(idx + 1).padStart(2, '0')}`,
      perPackageCalc: `${tierLabel} → £${perPackageAmount.toFixed(0)}`,
      perPackageAmount,
      weightCalc: `${weight}kg × £${pkgPerKg.toFixed(0)}`,
      weightAmount,
      totalCalc: `£${perPackageAmount.toFixed(0)} + £${weightAmount.toFixed(0)}`,
      totalAmount,
    };
  });

  const packageTotals = packageLines.map((p) => p.totalAmount);
  const packageTotal = packageTotals.reduce((acc, n) => acc + n, 0);
  let packageTotalCalc = '—';
  if (packageTotals.length > 0) {
    if (packageTotals.length <= 4) {
      packageTotalCalc = packageTotals.map((t) => `£${t.toFixed(0)}`).join(' + ');
    } else {
      const head = packageTotals.slice(0, 3).map((t) => `£${t.toFixed(0)}`);
      const tail = `£${packageTotals[packageTotals.length - 1].toFixed(0)}`;
      packageTotalCalc = `${head.join(' + ')} + … + ${tail}`;
    }
  }

  const appliedDiscounts: AppliedDiscount[] = (stop.discounts ?? []).flatMap((d) => {
    const value = toNumber(d.value, 0);
    const amount = toNumber(d.amount, 0);
    if (amount <= 0) return [];
    const valueLabel =
      d.type === 'FIXED_PER_BOOKING' ? `£${value.toFixed(0)}` : `${value.toFixed(0)}%`;
    const label =
      d.type === 'FIXED_PER_BOOKING'
        ? 'Fixed Discount'
        : d.type === 'PERCENTAGE'
          ? 'Percentage Discount'
          : 'Volume Discount';
    return [{ label, amount, calculation: `${tierLabel} → ${valueLabel}` }];
  });

  return {
    base: toNumber(stop.base_price, 0),
    packageTotalCalc,
    packageTotal: toNumber(stop.packages_subtotal, packageTotal),
    packageLines,
    appliedDiscounts,
    subtotal: toNumber(stop.subtotal, 0),
    vat: toNumber(stop.vat_amount, 0),
    vatRatePct: toNumber(stop.vat_rate_pct, 20),
    total: toNumber(stop.total, 0),
  };
}

export default function PortalPriceBreakdownTable({
  breakdown,
  className,
}: PortalPriceBreakdownTableProps): JSX.Element {
  const stops = useMemo(() => breakdown?.stops ?? [], [breakdown?.stops]);
  const [openStops, setOpenStops] = useState<string[]>(() => (stops[0]?.id ? [stops[0].id] : []));
  const [expandedPackages, setExpandedPackages] = useState<Record<string, boolean>>({});
  const isStopPackagesOpen = (stopId: string): boolean => expandedPackages[stopId] ?? true;
  const togglePackages = (stopId: string): void => {
    setExpandedPackages((prev) => ({ ...prev, [stopId]: !isStopPackagesOpen(stopId) }));
  };

  const toggleStop = (stopId: string): void => {
    setOpenStops((prev) =>
      prev.includes(stopId) ? prev.filter((i) => i !== stopId) : [...prev, stopId]
    );
  };

  return (
    <div className={cn(ORDER_DETAIL_SECTION_SHELL, 'h-full', className)}>
      <div className={ORDER_DETAIL_SECTION_HEADER}>
        <Typography
          variant="label"
          className="mb-0 text-[11px] font-medium uppercase tracking-[0.1em] text-[#0D0D12] md:text-[13px]"
        >
          Price breakdown
        </Typography>
      </div>

      <div className="space-y-4 p-4 md:p-5">
        {stops.length === 0 ? (
          <Typography variant="body" className="text-sm text-[#858594]">
            Per-stop pricing is not available for this order. Order totals are shown below.
          </Typography>
        ) : (
          <div className="space-y-3">
            {stops.map((stop) => {
              const vm = mapStopToViewModel(stop);
              return (
                <div
                  key={stop.id}
                  className="overflow-hidden rounded-xl border border-[#D1D5DB] bg-white shadow-none"
                >
                  <Collapsible
                    open={openStops.includes(stop.id)}
                    onOpenChange={() => {
                      toggleStop(stop.id);
                    }}
                  >
                    <CollapsibleTrigger asChild>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between border-b border-[#D1D5DB] bg-[#F3F4F6] px-4 py-2.5 transition-colors hover:bg-[#ECECF1]"
                      >
                        <div className="flex items-center gap-2">
                          <ChevronDown
                            className={cn(
                              'h-4 w-4 text-[#6B7280] transition-transform duration-200',
                              openStops.includes(stop.id) ? '' : '-rotate-90'
                            )}
                          />
                          <span className="text-[16px] font-medium text-[#111827]">
                            Stop - {stop.stop_index ?? 1}
                          </span>
                        </div>
                        <OrderDetailServiceTierBadge
                          tier={stop.pricing_plan?.plain_name ?? stop.service_tier}
                          color={stop.pricing_plan?.color}
                        />
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <Table>
                        <TableHeader>
                          <TableRow className="border-b border-[#E5E7EB] bg-[#F3F4F6] hover:bg-[#F3F4F6]">
                            <TableHead className="h-10 px-5 text-[12px] font-medium text-[#6B7280]">
                              Charge Type
                            </TableHead>
                            <TableHead className="h-10 px-5 text-[12px] font-medium text-[#6B7280]">
                              Calculation
                            </TableHead>
                            <TableHead className="h-10 px-5 text-right text-[12px] font-medium text-[#6B7280]">
                              Amount
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow className="border-b border-[#E5E7EB] hover:bg-transparent">
                            <TableCell className="h-9 px-5 py-2 text-[13px] font-medium text-gray-900">
                              Base Price
                            </TableCell>
                            <TableCell className="h-9 px-5 py-2 text-[12px] font-medium text-[#6B7280]">
                              {stop.pricing_plan?.plain_name ?? stop.service_tier ?? 'Service'}{' '}
                              Service
                            </TableCell>
                            <TableCell className="h-9 px-5 py-2 text-right text-[13px] font-medium text-gray-900">
                              {formatOrderCurrency(vm.base)}
                            </TableCell>
                          </TableRow>

                          <TableRow className="border-b border-[#E5E7EB] hover:bg-transparent">
                            <TableCell className="h-9 px-5 py-2 text-[13px] font-medium text-gray-900">
                              <button
                                type="button"
                                onClick={() => togglePackages(stop.id)}
                                className="inline-flex items-center gap-1.5 text-left"
                                aria-expanded={isStopPackagesOpen(stop.id)}
                                aria-label={
                                  isStopPackagesOpen(stop.id)
                                    ? 'Collapse package lines'
                                    : 'Expand package lines'
                                }
                              >
                                {isStopPackagesOpen(stop.id) ? (
                                  <ChevronUp className="h-3.5 w-3.5 text-gray-500" />
                                ) : (
                                  <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
                                )}
                                Packages Total Price
                              </button>
                            </TableCell>
                            <TableCell className="h-9 px-5 py-2 text-[12px] font-medium text-[#6B7280]">
                              {vm.packageTotalCalc}
                            </TableCell>
                            <TableCell className="h-9 px-5 py-2 text-right text-[13px] font-medium text-gray-900">
                              {formatOrderCurrency(vm.packageTotal)}
                            </TableCell>
                          </TableRow>

                          {isStopPackagesOpen(stop.id) &&
                            vm.packageLines.map((pkg) => (
                              <React.Fragment key={pkg.label}>
                                <TableRow className="border-b border-[#E5E7EB] bg-[#D8D8DF] hover:bg-[#D8D8DF]">
                                  <TableCell
                                    colSpan={3}
                                    className="h-7 px-5 py-1 text-[10px] font-semibold uppercase tracking-wide text-gray-500"
                                  >
                                    {pkg.label}
                                  </TableCell>
                                </TableRow>
                                <TableRow className="border-b border-[#E5E7EB] bg-[#F6F6F9] hover:bg-[#F6F6F9]">
                                  <TableCell className="h-9 px-5 py-2 text-[12px] text-gray-800">
                                    Price per Package
                                  </TableCell>
                                  <TableCell className="h-9 px-5 py-2 text-[12px] text-[#6B7280]">
                                    {pkg.perPackageCalc}
                                  </TableCell>
                                  <TableCell className="h-9 px-5 py-2 text-right text-[12px] font-medium text-gray-900">
                                    {formatOrderCurrency(pkg.perPackageAmount)}
                                  </TableCell>
                                </TableRow>
                                <TableRow className="border-b border-[#E5E7EB] bg-[#F6F6F9] hover:bg-[#F6F6F9]">
                                  <TableCell className="h-9 px-5 py-2 text-[12px] text-gray-800">
                                    Package Weight Price
                                  </TableCell>
                                  <TableCell className="h-9 px-5 py-2 text-[12px] text-[#6B7280]">
                                    {pkg.weightCalc}
                                  </TableCell>
                                  <TableCell className="h-9 px-5 py-2 text-right text-[12px] font-medium text-gray-900">
                                    {formatOrderCurrency(pkg.weightAmount)}
                                  </TableCell>
                                </TableRow>
                                <TableRow className="border-b border-[#E5E7EB] bg-[#F6F6F9] hover:bg-[#F6F6F9]">
                                  <TableCell className="h-9 px-5 py-2 text-[12px] text-gray-800">
                                    Total Package price
                                  </TableCell>
                                  <TableCell className="h-9 px-5 py-2 text-[12px] text-[#6B7280]">
                                    {pkg.totalCalc}
                                  </TableCell>
                                  <TableCell className="h-9 px-5 py-2 text-right text-[12px] font-medium text-gray-900">
                                    {formatOrderCurrency(pkg.totalAmount)}
                                  </TableCell>
                                </TableRow>
                              </React.Fragment>
                            ))}

                          {vm.appliedDiscounts.map((d) => (
                            <TableRow
                              key={`${stop.id}-${d.label}`}
                              className="border-b border-[#E5E7EB] hover:bg-transparent"
                            >
                              <TableCell className="h-9 px-5 py-2 text-[13px] font-medium text-gray-900">
                                {d.label}
                              </TableCell>
                              <TableCell className="h-9 px-5 py-2 text-[12px] font-medium text-[#6B7280]">
                                {d.calculation}
                              </TableCell>
                              <TableCell className="h-9 px-5 py-2 text-right text-[13px] font-semibold text-emerald-600">
                                -{formatOrderCurrency(d.amount)}
                              </TableCell>
                            </TableRow>
                          ))}

                          <TableRow className="border-b border-[#E5E7EB]">
                            <TableCell className="h-9 px-5 py-2 text-[13px] font-medium text-gray-900">
                              Subtotal (excl. VAT)
                            </TableCell>
                            <TableCell className="h-9 px-5 py-2 text-[12px] font-medium text-[#6B7280]">
                              —
                            </TableCell>
                            <TableCell className="h-9 px-5 py-2 text-right text-[13px] font-medium text-gray-900">
                              {formatOrderCurrency(vm.subtotal)}
                            </TableCell>
                          </TableRow>
                          <TableRow className="border-b border-[#E5E7EB]">
                            <TableCell className="h-9 px-5 py-2 text-[13px] font-medium text-gray-900">
                              VAT ({vm.vatRatePct.toFixed(0)}%)
                            </TableCell>
                            <TableCell className="h-9 px-5 py-2 text-[12px] font-medium text-[#6B7280]">
                              —
                            </TableCell>
                            <TableCell className="h-9 px-5 py-2 text-right text-[13px] font-medium text-gray-900">
                              {formatOrderCurrency(vm.vat)}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="h-9 px-5 py-2 text-[13px] font-medium text-gray-900">
                              Grand Total (incl. VAT)
                            </TableCell>
                            <TableCell className="h-9 px-5 py-2 text-[12px] font-medium text-[#6B7280]">
                              —
                            </TableCell>
                            <TableCell className="h-9 px-5 py-2 text-right text-[13px] font-medium text-gray-900">
                              {formatOrderCurrency(vm.total)}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              );
            })}
          </div>
        )}

        <div className="space-y-2.5 border-t border-[#F1F1F5] px-1 pt-4">
          <div className="flex items-center justify-between text-[14px] font-medium text-[#858594]">
            <span>Delivery Cost</span>
            <span className="font-medium text-[#030303]">
              {formatOrderCurrency(breakdown?.subtotal)}
            </span>
          </div>
          <div className="flex items-center justify-between text-[14px] font-medium text-[#858594]">
            <span>VAT</span>
            <span className="font-medium text-[#030303]">
              {formatOrderCurrency(breakdown?.vat_amount)}
            </span>
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[15px] font-semibold text-[#030303]">Total Cost</span>
            <span className="text-[18px] font-semibold text-[#030303]">
              {formatOrderCurrency(breakdown?.total)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
