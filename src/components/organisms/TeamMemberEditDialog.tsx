'use client';

import * as React from 'react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { toast } from 'sonner';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/input';
import { Typography } from '@/components/atoms';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/molecules/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/select';
import { PermissionAccessMatrix } from '@/components/organisms/PermissionAccessMatrix';
import {
  API_RESOURCE_TO_PERMISSION_UI_KEY,
  buildOrgContactPermissionsPayload,
  permissionLevelFromApi,
  type UiPermissionLevel,
} from '@/lib/orgContactPermissions';
import { TEAM_PLATFORM_ACCESS_ITEMS } from '@/lib/teamPlatformAccess';
import {
  useGetOrgContactByIdQuery,
  useUpdateOrgContactMutation,
  type OrgContactDto,
} from '@/store/api/contactsApi';

const CONTACT_ROLE_EDIT_OPTIONS = [
  { value: 'ACCOUNT_OWNER', label: 'Account Owner' },
  { value: 'BILLING', label: 'Billing' },
  { value: 'OPERATIONS', label: 'Operations' },
  { value: 'TECHNICAL', label: 'Technical' },
  { value: 'OTHER', label: 'Other' },
] as const;

function normalizeRole(role: string | undefined): string {
  const u = (role ?? 'OTHER').toUpperCase();
  return CONTACT_ROLE_EDIT_OPTIONS.some((o) => o.value === u) ? u : 'OTHER';
}

function permissionsFromContact(contact: OrgContactDto): Record<string, UiPermissionLevel> {
  const next: Record<string, UiPermissionLevel> = {};
  for (const item of TEAM_PLATFORM_ACCESS_ITEMS) {
    next[item.key] = 'none';
  }
  for (const p of contact.permissions ?? []) {
    const uiKey = API_RESOURCE_TO_PERMISSION_UI_KEY[p.resource];
    if (uiKey && uiKey in next) {
      next[uiKey] = permissionLevelFromApi(p.level);
    }
  }
  return next;
}

export interface TeamMemberEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string | null;
  contactId: string | null;
}

export default function TeamMemberEditDialog({
  open,
  onOpenChange,
  organizationId,
  contactId,
}: TeamMemberEditDialogProps): React.JSX.Element {
  const skip = !open || !organizationId || !contactId;
  const contactQuery = useGetOrgContactByIdQuery(
    { organizationId: organizationId ?? '', contactId: contactId ?? '' },
    { skip }
  );

  const [updateOrgContact, { isLoading: isSaving }] = useUpdateOrgContactMutation();

  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [role, setRole] = React.useState<string>('OTHER');
  const [permissions, setPermissions] = React.useState<Record<string, UiPermissionLevel>>({});

  const contact = contactQuery.data?.data;
  const isPrimary = contact?.is_primary === true;

  React.useEffect(() => {
    if (!open || !contact) return;
    setFirstName(contact.first_name ?? '');
    setLastName(contact.last_name ?? '');
    setEmail(contact.email ?? '');
    setPhone((contact.contact_number ?? contact.phone ?? '').trim());
    setRole(normalizeRole(contact.contact_role));
    setPermissions(permissionsFromContact(contact));
  }, [open, contact]);

  const handleClose = (): void => {
    onOpenChange(false);
  };

  const handleSave = async (): Promise<void> => {
    if (!organizationId || !contactId || !contact) return;
    if (!firstName.trim() || !lastName.trim() || !phone.trim()) {
      toast.error('Please fill in first name, last name, and phone number.');
      return;
    }

    try {
      await updateOrgContact({
        organizationId,
        contactId,
        contact_number: phone.trim(),
        contact_role: role,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        permissions: buildOrgContactPermissionsPayload(permissions),
      }).unwrap();
      toast.success('Member updated.');
      handleClose();
    } catch (e) {
      console.error(e);
      toast.error('Could not save changes. Try again.');
    }
  };

  const isLoadingContact = contactQuery.isFetching || (open && !!contactId && !contact);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) handleClose();
      }}
    >
      <DialogContent className="flex max-h-[90vh] max-w-xl flex-col gap-4 overflow-hidden border-[#E5E7EB] p-6 sm:max-w-[560px]">
        <DialogHeader className="shrink-0 space-y-1 pr-10 text-left">
          <DialogTitle className="text-lg font-semibold text-black">Edit team member</DialogTitle>
          <DialogDescription className="text-sm text-[#6B7280]">
            Update contact details and access. Email cannot be changed here.
          </DialogDescription>
        </DialogHeader>

        {isLoadingContact ? (
          <div className="flex flex-1 items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#A52A2A] border-r-transparent" />
          </div>
        ) : contact ? (
          <>
            <div className="-mr-3 min-h-0 flex-1 space-y-4 overflow-y-auto py-1 pr-3">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Typography variant="caption" className="text-xs font-medium text-[#6B7280]">
                    First name <span className="text-[#FF4D4F]">*</span>
                  </Typography>
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="h-10 rounded-lg border-[#E5E7EB]"
                  />
                </div>
                <div className="space-y-2">
                  <Typography variant="caption" className="text-xs font-medium text-[#6B7280]">
                    Last name <span className="text-[#FF4D4F]">*</span>
                  </Typography>
                  <Input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="h-10 rounded-lg border-[#E5E7EB]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Typography variant="caption" className="text-xs font-medium text-[#6B7280]">
                  Email
                </Typography>
                <Input
                  value={email}
                  readOnly
                  disabled
                  className="h-10 rounded-lg border-[#E5E7EB]"
                />
              </div>

              <div className="space-y-2">
                <Typography variant="caption" className="text-xs font-medium text-[#6B7280]">
                  Phone <span className="text-[#FF4D4F]">*</span>
                </Typography>
                <div className="flex h-10 w-full items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 focus-within:border-[#A52A2A]/40 focus-within:ring-2 focus-within:ring-[#A52A2A]/15">
                  <PhoneInput
                    international
                    defaultCountry="GB"
                    value={phone || undefined}
                    onChange={(v) => setPhone(String(v ?? ''))}
                    placeholder="Phone number"
                    className="flex min-w-0 flex-1 items-center border-0 bg-transparent p-0"
                    numberInputProps={{
                      className:
                        'flex-1 min-w-0 border-0 bg-transparent p-0 text-sm text-black placeholder:text-[#9CA3AF] focus:outline-none focus:ring-0',
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Typography variant="caption" className="text-xs font-medium text-[#6B7280]">
                  Contact role <span className="text-[#FF4D4F]">*</span>
                </Typography>
                <Select value={role} onValueChange={setRole} disabled={isPrimary}>
                  <SelectTrigger className="h-10 rounded-lg border-[#E5E7EB]">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTACT_ROLE_EDIT_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isPrimary ? (
                  <Typography variant="caption" className="text-[11px] text-[#6B7280]">
                    The primary account owner role cannot be changed.
                  </Typography>
                ) : null}
              </div>

              <div className="space-y-2">
                <Typography variant="caption" className="text-sm font-semibold text-black">
                  Platform access
                </Typography>
                <PermissionAccessMatrix
                  value={permissions}
                  onChange={(itemKey, level) =>
                    setPermissions((prev) => ({ ...prev, [itemKey]: level }))
                  }
                />
              </div>
            </div>

            <DialogFooter className="shrink-0 gap-2 border-t border-[#E5E7EB] pt-4 sm:border-0 sm:pt-0">
              <Button
                type="button"
                variant="outline"
                className="rounded-lg border-[#E5E7EB]"
                onClick={() => handleClose()}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="rounded-lg bg-[#A52A2A] text-white hover:bg-[#8F2424]"
                disabled={isSaving}
                onClick={() => void handleSave()}
              >
                {isSaving ? 'Saving…' : 'Save changes'}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <Typography variant="body" className="py-8 text-[#6B7280]">
            Could not load this contact.
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  );
}
