import { useCallback, useMemo, useRef, useState } from 'react';
import { Check, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import Typography from '@/components/atoms/Typography';
import { Button } from '@/components/atoms/Button';
import AccountCard from '@/components/pages/Settings/AccountCard';
import { CardFormDialog } from '@/components/pages/Settings/CardFormDialog';
import DeletePaymentCardDialog from '@/components/pages/Settings/accountsDetails/DeletePaymentCardDialog';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/molecules';
import { mapPaymentMethodToAccount } from '@/lib/paymentCards';
import {
  ACCOUNTS_DETAILS_SECTION_CLASS,
  formatBillingScheduleLabel,
  indexPaymentMethodsByModel,
} from '@/lib/paymentSettings';
import {
  useDeletePaymentMethodMutation,
  useGetOrganizationPaymentCardsQuery,
  useMarkDefaultPaymentMethodMutation,
  useUnmarkDefaultPaymentMethodMutation,
} from '@/store/api/paymentsApi';
import type { OrganizationPaymentMethodDto } from '@/store/api/homeDashboardApi';
import { getErrorMessage } from '@/store/api/utils';
import { cn } from '@/lib/utils';
import type { Account } from '@/types/account';
import BillingScheduleRow from './BillingScheduleRow';

interface CardPaymentSectionProps {
  organizationId: string | null;
  orgPaymentMethods: OrganizationPaymentMethodDto[] | undefined;
}

export default function CardPaymentSection({
  organizationId,
  orgPaymentMethods,
}: CardPaymentSectionProps): React.JSX.Element {
  const {
    data: paymentMethods,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetOrganizationPaymentCardsQuery(organizationId ?? '', {
    skip: !organizationId,
  });

  const accounts = useMemo((): Account[] => {
    const list = paymentMethods ?? [];
    const sorted = [...list].sort((a, b) => Number(b.is_default) - Number(a.is_default));
    return sorted.map((pm, index) => mapPaymentMethodToAccount(pm, index));
  }, [paymentMethods]);

  const cardOrgMethod = indexPaymentMethodsByModel(orgPaymentMethods).card;
  const billingSchedule = formatBillingScheduleLabel(
    cardOrgMethod?.billing_schedule,
    cardOrgMethod?.billing_day_of_month,
    cardOrgMethod?.billing_days_after_order
  );

  const [selectedScrollSnap, setSelectedScrollSnap] = useState(0);
  const [cardDialogOpen, setCardDialogOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<Account | null>(null);
  const [busyCardId, setBusyCardId] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<'default' | 'delete' | null>(null);
  const rafRef = useRef<number | null>(null);

  const [deletePaymentMethod] = useDeletePaymentMethodMutation();
  const [markDefaultPaymentMethod] = useMarkDefaultPaymentMethodMutation();
  const [unmarkDefaultPaymentMethod] = useUnmarkDefaultPaymentMethodMutation();

  const setCarouselApi = useCallback((api: CarouselApi | undefined) => {
    if (!api) return;
    setSelectedScrollSnap(api.selectedScrollSnap());
    api.on('select', () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        setSelectedScrollSnap(api.selectedScrollSnap());
      });
    });
  }, []);

  const leadIndex = accounts.length > 0 ? selectedScrollSnap % accounts.length : 0;

  const handleToggleDefault = useCallback(
    async (account: Account): Promise<void> => {
      if (!organizationId || busyCardId) return;
      setBusyCardId(account.id);
      setBusyAction('default');
      try {
        if (account.isDefault) {
          await unmarkDefaultPaymentMethod({ organizationId, cardId: account.id }).unwrap();
        } else {
          await markDefaultPaymentMethod({ organizationId, cardId: account.id }).unwrap();
        }
      } catch (e) {
        window.alert(getErrorMessage(e));
      } finally {
        setBusyCardId(null);
        setBusyAction(null);
      }
    },
    [organizationId, busyCardId, unmarkDefaultPaymentMethod, markDefaultPaymentMethod]
  );

  const handleRequestDeleteCard = useCallback(
    (account: Account): void => {
      if (busyCardId) return;
      setCardToDelete(account);
    },
    [busyCardId]
  );

  const handleCloseDeleteDialog = useCallback(
    (open: boolean): void => {
      if (open || busyAction === 'delete') return;
      setCardToDelete(null);
    },
    [busyAction]
  );

  const handleConfirmDeleteCard = useCallback(async (): Promise<void> => {
    if (!organizationId || !cardToDelete || busyCardId) return;
    setBusyCardId(cardToDelete.id);
    setBusyAction('delete');
    try {
      await deletePaymentMethod({ organizationId, cardId: cardToDelete.id }).unwrap();
      setCardToDelete(null);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setBusyCardId(null);
      setBusyAction(null);
    }
  }, [organizationId, cardToDelete, busyCardId, deletePaymentMethod]);

  const deleteCardLabel = cardToDelete
    ? `${cardToDelete.cardholderName} (${cardToDelete.cardNumber})`
    : null;

  return (
    <section className={ACCOUNTS_DETAILS_SECTION_CLASS}>
      <div className="flex items-start justify-between gap-4 border-b border-[#E6E8EE] pb-4">
        <div>
          <Typography
            variant="h4"
            weight="semibold"
            className="text-[2rem] leading-none text-[#1E2533]"
          >
            Card Payment
          </Typography>
          <Typography variant="body" color="muted" className="mt-2 text-[#6B7280]">
            Pay securely using saved credit or debit cards.
          </Typography>
        </div>
        <Button
          variant="default"
          size="sm"
          className="gap-1.5 rounded-md px-4"
          onClick={() => setCardDialogOpen(true)}
          disabled={!organizationId}
        >
          <Plus className="h-4 w-4" />
          Add Card
        </Button>
      </div>

      <div className="rounded-xl border border-[#E2E6EE] bg-[#F7F8FB] p-4">
        {!organizationId ? (
          <Typography variant="body" color="muted" className="py-8 text-center">
            No organization is available. Sign in again or contact support.
          </Typography>
        ) : isLoading ? (
          <Typography variant="body" color="muted" className="py-8 text-center">
            Loading saved cards…
          </Typography>
        ) : isError ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <Typography variant="body" color="error" className="text-center">
              {getErrorMessage(error)}
            </Typography>
            <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
              Retry
            </Button>
          </div>
        ) : accounts.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <Typography variant="body" color="muted" className="text-center">
              No saved cards yet. Add a card to get started.
            </Typography>
            <Button variant="default" size="sm" onClick={() => setCardDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              Add Card
            </Button>
          </div>
        ) : (
          <div className="rounded-xl border border-[#DFE3EB] bg-white p-4">
            <Carousel opts={{ align: 'start', loop: accounts.length > 1 }} setApi={setCarouselApi}>
              <div className="mb-4 flex items-center justify-between">
                <Typography variant="h4" weight="semibold" className="text-2xl text-[#1F2937]">
                  Saved Cards ({accounts.length})
                </Typography>
                <div className="flex items-center gap-2">
                  <CarouselPrevious
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="relative! left-0! right-0! top-0! h-10! w-10! translate-y-0! rounded-lg border border-[#E2E5ED] bg-white text-gray-700 hover:bg-gray-100"
                    aria-label="Previous card"
                  />
                  <CarouselNext
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="relative! left-0! right-0! top-0! h-10! w-10! translate-y-0! rounded-lg border border-[#E2E5ED] bg-white text-gray-700 hover:bg-gray-100"
                    aria-label="Next card"
                  />
                </div>
              </div>

              <CarouselContent className="-ml-3 items-stretch">
                {accounts.map((account, index) => {
                  const isLead = index === leadIndex;
                  return (
                    <CarouselItem
                      key={account.id}
                      className={cn(
                        'pl-3 transition-[flex-basis,min-width] duration-300 ease-out',
                        isLead ? 'basis-[56%] min-w-[390px]' : 'basis-[52%] min-w-[360px]'
                      )}
                    >
                      <div className="space-y-3">
                        <AccountCard account={account} size={isLead ? 'large' : 'default'} />
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            className="h-10 justify-center gap-1.5 border-[#D7DCE7] text-[#2B3340] hover:bg-gray-50"
                            onClick={() => void handleToggleDefault(account)}
                            disabled={busyCardId !== null}
                          >
                            {busyCardId === account.id && busyAction === 'default' ? (
                              'Processing…'
                            ) : account.isDefault ? (
                              <>
                                <X className="h-4 w-4" />
                                Unmark as Default
                              </>
                            ) : (
                              <>
                                <Check className="h-4 w-4" />
                                Mark as Default
                              </>
                            )}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className="h-10 justify-center gap-1.5 border-[#F2C4C6] text-[#DC2626] hover:bg-red-50"
                            onClick={() => handleRequestDeleteCard(account)}
                            disabled={busyCardId !== null}
                          >
                            {busyCardId === account.id && busyAction === 'delete' ? (
                              'Deleting…'
                            ) : (
                              <>
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
            </Carousel>
          </div>
        )}
      </div>

      <BillingScheduleRow value={billingSchedule} />

      <CardFormDialog
        open={cardDialogOpen}
        onOpenChange={setCardDialogOpen}
        onCardSaved={() => void refetch()}
      />

      <DeletePaymentCardDialog
        open={cardToDelete !== null}
        cardLabel={deleteCardLabel}
        isDeleting={busyAction === 'delete'}
        onOpenChange={handleCloseDeleteDialog}
        onConfirm={() => void handleConfirmDeleteCard()}
      />
    </section>
  );
}
