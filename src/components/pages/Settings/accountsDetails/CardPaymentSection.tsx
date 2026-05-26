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
import { formatBillingScheduleLabel, indexPaymentMethodsByModel } from '@/lib/paymentSettings';
import {
  PAYMENT_CARD_ACTION_BUTTON_CLASS,
  PAYMENT_CARD_DELETE_BUTTON_CLASS,
  PAYMENT_CAROUSEL_NAV_BUTTON_CLASS,
  PAYMENT_SAVED_CARDS_PANEL_CLASS,
  PAYMENT_SECTION_DESC_CLASS,
  PAYMENT_SECTION_HEADER_CLASS,
  PAYMENT_SECTION_TITLE_CLASS,
} from '@/lib/paymentSettingsUi';
import { SETTINGS_FORM_CARD_CLASS, SETTINGS_SAVE_BTN_CLASS } from '@/lib/settingsUi';
import { portalSectionDescClass } from '@/lib/portalTheme';
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
    <>
      <section className={SETTINGS_FORM_CARD_CLASS}>
        <div
          className={cn(
            'flex flex-wrap items-start justify-between gap-3',
            PAYMENT_SECTION_HEADER_CLASS
          )}
        >
          <div className="min-w-0 space-y-1">
            <Typography className={PAYMENT_SECTION_TITLE_CLASS}>Card Payment</Typography>
            <Typography className={PAYMENT_SECTION_DESC_CLASS}>
              Pay securely using saved credit or debit cards.
            </Typography>
          </div>
          <Button
            type="button"
            className={cn(SETTINGS_SAVE_BTN_CLASS, 'shrink-0')}
            onClick={() => setCardDialogOpen(true)}
            disabled={!organizationId}
          >
            <Plus className="size-4" />
            Add Card
          </Button>
        </div>

        <div className="mt-5">
          {!organizationId ? (
            <Typography variant="body" className={cn('py-8 text-center', portalSectionDescClass)}>
              No organization is available. Sign in again or contact support.
            </Typography>
          ) : isLoading ? (
            <Typography variant="body" className={cn('py-8 text-center', portalSectionDescClass)}>
              Loading saved cards…
            </Typography>
          ) : isError ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <Typography variant="body" className="text-center text-sm text-[#DC2626]">
                {getErrorMessage(error)}
              </Typography>
              <Button
                type="button"
                variant="outline"
                className="border-[#E5E7EB] bg-white"
                onClick={() => void refetch()}
              >
                Retry
              </Button>
            </div>
          ) : accounts.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] py-10">
              <Typography variant="body" className={cn('text-center', portalSectionDescClass)}>
                No saved cards yet. Add a card to get started.
              </Typography>
              <Button
                type="button"
                className={SETTINGS_SAVE_BTN_CLASS}
                onClick={() => setCardDialogOpen(true)}
              >
                <Plus className="size-4" />
                Add Card
              </Button>
            </div>
          ) : (
            <div className={PAYMENT_SAVED_CARDS_PANEL_CLASS}>
              <Carousel
                opts={{ align: 'start', loop: accounts.length > 1 }}
                setApi={setCarouselApi}
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <Typography className={PAYMENT_SECTION_TITLE_CLASS}>
                    Saved Cards ({accounts.length})
                  </Typography>
                  <div className="flex items-center gap-2">
                    <CarouselPrevious
                      type="button"
                      variant="outline"
                      size="icon"
                      className={PAYMENT_CAROUSEL_NAV_BUTTON_CLASS}
                      aria-label="Previous card"
                    />
                    <CarouselNext
                      type="button"
                      variant="outline"
                      size="icon"
                      className={PAYMENT_CAROUSEL_NAV_BUTTON_CLASS}
                      aria-label="Next card"
                    />
                  </div>
                </div>

                <CarouselContent className="-ml-4 items-stretch">
                  {accounts.map((account, index) => {
                    const isLead = index === leadIndex;
                    return (
                      <CarouselItem
                        key={account.id}
                        className={cn(
                          'pl-4 transition-[flex-basis] duration-300 ease-out',
                          isLead ? 'basis-[min(100%,420px)]' : 'basis-[min(88%,380px)]'
                        )}
                      >
                        <div className="space-y-3">
                          <AccountCard account={account} size={isLead ? 'large' : 'default'} />
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              className={PAYMENT_CARD_ACTION_BUTTON_CLASS}
                              onClick={() => void handleToggleDefault(account)}
                              disabled={busyCardId !== null}
                            >
                              {busyCardId === account.id && busyAction === 'default' ? (
                                'Processing…'
                              ) : account.isDefault ? (
                                <>
                                  <X className="size-4" />
                                  Unmark as Default
                                </>
                              ) : (
                                <>
                                  <Check className="size-4" />
                                  Mark as Default
                                </>
                              )}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              className={PAYMENT_CARD_DELETE_BUTTON_CLASS}
                              onClick={() => handleRequestDeleteCard(account)}
                              disabled={busyCardId !== null}
                            >
                              {busyCardId === account.id && busyAction === 'delete' ? (
                                'Deleting…'
                              ) : (
                                <>
                                  <Trash2 className="size-4" />
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
      </section>

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
    </>
  );
}
