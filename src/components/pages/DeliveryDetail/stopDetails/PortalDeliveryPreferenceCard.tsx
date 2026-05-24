import React from 'react';
import { Edit2 } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { notifyApiError, notifyApiSuccess } from '@/lib/notify';
import { Button } from '@/components/atoms/Button';
import Typography from '@/components/atoms/Typography';
import PortalEditDeliveryPreferencesModal, {
  type PortalDeliveryPreference,
} from './PortalEditDeliveryPreferencesModal';
import { useUpdateStopPreferencesMutation } from '@/store/api';
import {
  SignatureIllustration as signatureIcon,
  LeaveSafePlaceIllustration as leaveSafePlaceIcon,
} from '@/assets/svg';

interface PortalDeliveryPreferenceCardProps {
  initialPreference?: PortalDeliveryPreference;
}

export default function PortalDeliveryPreferenceCard({
  initialPreference = 'Signature Required',
}: PortalDeliveryPreferenceCardProps): React.JSX.Element {
  const { id: orderId, stopId } = useParams<{ id: string; stopId: string }>();
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [preference, setPreference] = React.useState<PortalDeliveryPreference>(initialPreference);
  const [updatePreferences] = useUpdateStopPreferencesMutation();

  React.useEffect(() => {
    setPreference(initialPreference);
  }, [initialPreference]);

  const handleSave = async (next: PortalDeliveryPreference): Promise<void> => {
    if (!orderId || !stopId) {
      setPreference(next);
      return;
    }
    const previous = preference;
    setPreference(next);
    try {
      const result = await updatePreferences({
        orderId,
        stopId,
        signature_required: next === 'Signature Required',
        safe_place_allowed: next === 'Leave at Safe Place',
      }).unwrap();
      notifyApiSuccess(result, { message: 'Delivery preferences updated' });
    } catch (err) {
      setPreference(previous);
      notifyApiError(err);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 bg-[#FBFBFC] px-4 py-2">
        <Typography
          variant="label"
          className="text-[13px] font-medium uppercase tracking-tight text-gray-700"
        >
          Delivery Preference
        </Typography>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsEditModalOpen(true)}
          className="h-8 gap-1.5 rounded-md border-gray-200 bg-white px-3 text-[13px] font-medium text-gray-700 hover:bg-gray-50"
        >
          <Edit2 className="h-3.5 w-3.5" />
          Edit
        </Button>
      </div>
      <div className="flex items-center gap-4 px-5 py-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#F4F4F5]">
          <img
            src={preference === 'Signature Required' ? signatureIcon : leaveSafePlaceIcon}
            alt={preference}
            className="h-8 w-8 object-contain"
          />
        </div>
        <div className="space-y-1">
          <Typography className="text-[13px] font-bold leading-none text-gray-800">
            {preference}
          </Typography>
          <Typography className="pt-px text-[12px] font-medium leading-normal text-gray-500">
            {preference === 'Signature Required'
              ? 'The recipient must sign to confirm delivery.'
              : 'The package can be left at a secure location if the recipient is unavailable.'}
          </Typography>
        </div>
      </div>

      <PortalEditDeliveryPreferencesModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={(p) => {
          void handleSave(p);
        }}
        currentPreference={preference}
      />
    </div>
  );
}
