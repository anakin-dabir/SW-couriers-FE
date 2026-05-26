import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Save, Trash2, UserPlus } from 'lucide-react';
import { useNavigate, useOutletContext, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/input';
import { PermissionAccessMatrix } from '@/components/organisms/PermissionAccessMatrix';
import {
  ContactFieldLabel,
  ContactPhoneField,
  ContactRoleSelect,
  ReadOnlyRoleDisplay,
  USER_CONTACTS_NESTED_CARD_CLASS,
} from '@/components/pages/Settings/UserContacts/contactFormUi';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog';
import {
  SETTINGS_DISCARD_BTN_CLASS,
  SETTINGS_FORM_CARD_CLASS,
  SETTINGS_FORM_DIVIDER_CLASS,
  SETTINGS_FORM_INPUT_CLASS,
  SETTINGS_SAVE_BTN_CLASS,
} from '@/lib/settingsUi';
import { cn } from '@/lib/utils';
import {
  API_RESOURCE_TO_PERMISSION_UI_KEY,
  buildOrgContactPermissionsPayload,
  permissionLevelFromApi,
  type UiPermissionLevel,
} from '@/lib/orgContactPermissions';
import { TEAM_PLATFORM_ACCESS_ITEMS } from '@/lib/teamPlatformAccess';
import {
  canManageUserContacts,
  canViewUserContacts,
  findCurrentUserOrgContact,
} from '@/lib/userContactsAccess';
import { useAppSelector } from '@/store/hooks';
import {
  useGetOrgContactsQuery,
  useRemoveOrgContactMutation,
  useUpdateOrgContactMutation,
  type OrgContactDto,
} from '@/store/api/contactsApi';
import type { RootState } from '@/store/store';
import { Typography } from '@/components/atoms';
import type { SettingsOutletContext } from '@/components/templates/settingsOutletTypes';
import { toast } from 'sonner';

type PermissionLevel = UiPermissionLevel;
type ContactRole = 'OPERATIONS' | 'BILLING' | 'TECHNICAL' | 'OTHER';

interface Contact {
  id: string;
  role: ContactRole;
  firstName: string;
  lastName: string;
  contactNumber: string;
  email: string;
  permissions: Record<string, PermissionLevel>;
  accessExpanded: boolean;
}

interface OwnerFields {
  firstName: string;
  lastName: string;
  contactNumber: string;
}

const ROLE_OPTIONS: Array<{ value: ContactRole; label: string }> = [
  { value: 'OPERATIONS', label: 'Operations Manager' },
  { value: 'BILLING', label: 'Billing Admin' },
  { value: 'TECHNICAL', label: 'Technical' },
  { value: 'OTHER', label: 'Other' },
];

const createDefaultPermissions = (): Record<string, PermissionLevel> =>
  TEAM_PLATFORM_ACCESS_ITEMS.reduce<Record<string, PermissionLevel>>((acc, module) => {
    acc[module.key] = 'none';
    return acc;
  }, {});

const CONTACT_ROLE_LABEL: Record<string, string> = {
  ACCOUNT_OWNER: 'Owner Account',
  OPERATIONS: 'Operations Manager',
  BILLING: 'Billing Admin',
  TECHNICAL: 'Technical',
  OTHER: 'Other',
};

const normalizeRole = (role: string | undefined): ContactRole => {
  const value = (role ?? '').toUpperCase();
  if (value === 'OPERATIONS') return 'OPERATIONS';
  if (value === 'BILLING') return 'BILLING';
  if (value === 'TECHNICAL') return 'TECHNICAL';
  return 'OTHER';
};

const mapContactToMember = (contact: OrgContactDto, accessExpanded = false): Contact => {
  const permissions = createDefaultPermissions();

  for (const permission of contact.permissions ?? []) {
    const uiKey = API_RESOURCE_TO_PERMISSION_UI_KEY[permission.resource];
    if (uiKey && uiKey in permissions) {
      permissions[uiKey] = permissionLevelFromApi(permission.level);
    }
  }

  return {
    id: contact.id,
    role: normalizeRole(contact.contact_role),
    firstName: contact.first_name ?? '',
    lastName: contact.last_name ?? '',
    contactNumber: contact.contact_number ?? contact.phone ?? '',
    email: contact.email ?? '',
    permissions,
    accessExpanded,
  };
};

export default function PickupAddressPage(): React.JSX.Element {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { setSubheaderActions } = useOutletContext<SettingsOutletContext>();
  const organizationId = useAppSelector(
    (state: RootState) =>
      state.auth.user?.organization_id ??
      state.auth.loginResponse?.data?.organization_id ??
      state.auth.loginResponse?.data?.organization?.id ??
      null
  );
  const accessToken = useAppSelector((state: RootState) => state.auth.accessToken);
  const currentUser = useAppSelector((state: RootState) => state.auth.user);
  const { data: contactsResponse, isFetching } = useGetOrgContactsQuery(
    { organizationId: organizationId ?? '' },
    { skip: !organizationId || !accessToken }
  );
  const [removeOrgContact, { isLoading: isDeletingContact }] = useRemoveOrgContactMutation();
  const [updateOrgContact, { isLoading: isUpdatingContact }] = useUpdateOrgContactMutation();

  const ownerContact = contactsResponse?.data?.owner ?? null;
  const teamMembersFromApi = useMemo(
    () => contactsResponse?.data?.team_members ?? [],
    [contactsResponse?.data?.team_members]
  );

  const currentUserContact = useMemo(
    () => findCurrentUserOrgContact(currentUser, ownerContact, teamMembersFromApi),
    [currentUser, ownerContact, teamMembersFromApi]
  );

  const canView = canViewUserContacts(currentUser, currentUserContact);
  const canManage = canManageUserContacts(currentUser, currentUserContact);

  const ownerBaseline = useMemo((): OwnerFields | null => {
    if (!ownerContact) return null;
    return {
      firstName: ownerContact.first_name ?? '',
      lastName: ownerContact.last_name ?? '',
      contactNumber: ownerContact.contact_number ?? ownerContact.phone ?? '',
    };
  }, [ownerContact]);

  const [ownerWorking, setOwnerWorking] = useState<OwnerFields | null>(null);
  const ownerDisplay = ownerWorking ?? ownerBaseline;

  useEffect(() => {
    setOwnerWorking(null);
  }, [ownerContact?.id, ownerContact?.updated_at]);

  const ownerDirty =
    ownerWorking !== null &&
    ownerBaseline !== null &&
    (ownerWorking.firstName !== ownerBaseline.firstName ||
      ownerWorking.lastName !== ownerBaseline.lastName ||
      ownerWorking.contactNumber !== ownerBaseline.contactNumber);

  const mappedMembers = useMemo(
    () =>
      (contactsResponse?.data?.team_members ?? []).map((member) =>
        mapContactToMember(member, true)
      ),
    [contactsResponse]
  );

  const [draftMembers, setDraftMembers] = useState<Record<string, Contact>>({});
  const [removedMemberIds, setRemovedMemberIds] = useState<string[]>([]);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteReason, setDeleteReason] = useState('');
  const [pendingDeleteMember, setPendingDeleteMember] = useState<Contact | null>(null);
  const [savingMemberId, setSavingMemberId] = useState<string | null>(null);

  const baseMembersById = useMemo(() => {
    const map = new Map<string, Contact>();
    for (const member of mappedMembers) {
      map.set(member.id, member);
    }
    return map;
  }, [mappedMembers]);

  const teamMembers = useMemo(
    () =>
      mappedMembers
        .filter((member) => !removedMemberIds.includes(member.id))
        .map((member) => draftMembers[member.id] ?? member),
    [mappedMembers, removedMemberIds, draftMembers]
  );

  const focusContactId = searchParams.get('focusContact');

  useEffect(() => {
    if (!focusContactId || isFetching) return undefined;

    const scrollToContact = (): boolean => {
      const el = document.getElementById(`team-contact-${focusContactId}`);
      if (!el) return false;
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete('focusContact');
          return next;
        },
        { replace: true }
      );
      return true;
    };

    if (scrollToContact()) return undefined;
    const timer = window.setTimeout(() => {
      scrollToContact();
    }, 200);
    return () => window.clearTimeout(timer);
  }, [
    focusContactId,
    isFetching,
    setSearchParams,
    ownerContact?.id,
    teamMembers.length,
    mappedMembers.length,
  ]);

  const dirtyIds = useMemo(
    () => new Set(Object.keys(draftMembers).filter((id) => baseMembersById.has(id))),
    [draftMembers, baseMembersById]
  );

  const isDeleteKeywordMatched = deleteConfirmText.trim() === 'DELETE';
  const hasDeleteReason = deleteReason.trim().length > 0;

  const updateMember = (id: string, updates: Partial<Contact>): void => {
    const current = draftMembers[id] ?? baseMembersById.get(id);
    if (!current) return;
    setDraftMembers((prev) => ({ ...prev, [id]: { ...current, ...updates } }));
  };

  const discardMember = (id: string): void => {
    setDraftMembers((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const saveMember = async (id: string): Promise<void> => {
    const current = draftMembers[id];
    if (!current || !organizationId) return;

    setSavingMemberId(id);
    try {
      await updateOrgContact({
        organizationId,
        contactId: id,
        contact_number: current.contactNumber.trim(),
        contact_role: current.role,
        first_name: current.firstName.trim(),
        last_name: current.lastName.trim(),
        permissions: buildOrgContactPermissionsPayload(current.permissions),
      }).unwrap();
      toast.success('Team member saved.');
      discardMember(id);
    } catch (error) {
      console.error('Failed to update contact', error);
      toast.error('Could not save changes. Please try again.');
    } finally {
      setSavingMemberId(null);
    }
  };

  const handleDiscardOwner = useCallback((): void => {
    setOwnerWorking(null);
  }, []);

  const handleSaveOwner = useCallback(async (): Promise<void> => {
    if (!organizationId || !ownerContact || !ownerWorking) return;
    setSavingMemberId('__owner__');
    try {
      await updateOrgContact({
        organizationId,
        contactId: ownerContact.id,
        contact_number: ownerWorking.contactNumber.trim(),
        contact_role: ownerContact.contact_role,
        first_name: ownerWorking.firstName.trim(),
        last_name: ownerWorking.lastName.trim(),
        permissions: (ownerContact.permissions ?? []).map((p) => ({
          resource: p.resource,
          level: p.level === 2 ? 2 : p.level === 1 ? 1 : 0,
        })),
      }).unwrap();
      toast.success('Your contact details were saved.');
      setOwnerWorking(null);
    } catch (error) {
      console.error('Failed to update owner contact', error);
      toast.error('Could not save contact details. Please try again.');
    } finally {
      setSavingMemberId(null);
    }
  }, [organizationId, ownerContact, ownerWorking, updateOrgContact]);

  const isSavingOwner = isUpdatingContact && savingMemberId === '__owner__';

  useEffect(() => {
    if (!canManage) {
      setSubheaderActions(null);
      return () => {
        setSubheaderActions(null);
      };
    }

    setSubheaderActions({
      onSave: handleSaveOwner,
      onDiscard: handleDiscardOwner,
      saveDisabled:
        !ownerDirty || !organizationId || !ownerContact || !ownerWorking || isSavingOwner,
      discardDisabled: !ownerDirty || isSavingOwner,
      isSaving: isSavingOwner,
    });
    return () => {
      setSubheaderActions(null);
    };
  }, [
    setSubheaderActions,
    handleSaveOwner,
    handleDiscardOwner,
    ownerDirty,
    organizationId,
    ownerContact,
    ownerWorking,
    isSavingOwner,
    canManage,
  ]);

  const addTeamMember = (): void => {
    void navigate('/invite-team/create');
  };

  const removeMember = (id: string): void => {
    setRemovedMemberIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setDraftMembers((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const openDeleteModal = (member: Contact): void => {
    setPendingDeleteMember(member);
    setDeleteConfirmText('');
    setDeleteReason('');
    setIsDeleteOpen(true);
  };

  const handleDeleteContact = async (): Promise<void> => {
    if (!organizationId || !pendingDeleteMember) {
      toast.error('Organization or contact id is missing.');
      return;
    }
    if (!isDeleteKeywordMatched || !hasDeleteReason) return;

    try {
      await removeOrgContact({
        organizationId,
        contactId: pendingDeleteMember.id,
        reason: deleteReason.trim(),
      }).unwrap();
      toast.success('Member deleted successfully.');
      removeMember(pendingDeleteMember.id);
      setIsDeleteOpen(false);
      setDeleteConfirmText('');
      setDeleteReason('');
      setPendingDeleteMember(null);
    } catch (error) {
      console.error('Failed to delete contact', error);
      toast.error('Failed to delete member. Please try again.');
    }
  };

  const deleteTargetLabel =
    pendingDeleteMember &&
    `${pendingDeleteMember.firstName} ${pendingDeleteMember.lastName}`.trim();

  if (!isFetching && !canView) {
    return (
      <div className={cn(SETTINGS_FORM_CARD_CLASS, 'text-sm text-[#71717A]')}>
        You do not have permission to view User &amp; Contacts. Ask your account owner to grant Team
        Management read or write access.
      </div>
    );
  }

  return (
    <>
      <Dialog
        open={isDeleteOpen}
        onOpenChange={(open) => {
          setIsDeleteOpen(open);
          if (!open) {
            setDeleteConfirmText('');
            setDeleteReason('');
            setPendingDeleteMember(null);
          }
        }}
      >
        <DialogContent className="h-auto max-w-[470px] overflow-hidden rounded-[14px] border border-[#E6E8EE] p-0 shadow-xl">
          <div className="px-7 pt-7">
            <DialogHeader className="items-center space-y-0 text-center">
              <DialogTitle className="text-[25px] font-semibold leading-none text-[#1F2430]">
                Delete{' '}
                {deleteTargetLabel
                  ? `“${deleteTargetLabel}”`
                  : pendingDeleteMember
                    ? 'this contact'
                    : ''}
                ?
              </DialogTitle>
              <DialogDescription className="mt-3 max-w-[360px] text-center text-[12px] font-normal leading-[1.45] text-[#5D6370]">
                Deleting this member will permanently remove associated profile and access data.
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 space-y-3.5">
              <div className="space-y-1.5">
                <Typography variant="caption" className="text-[12px] font-semibold text-[#1F2430]">
                  To confirm, type DELETE below <span className="text-[#D90429]">*</span>
                </Typography>
                <Input
                  value={deleteConfirmText}
                  onChange={(event) => setDeleteConfirmText(event.target.value)}
                  placeholder="Type DELETE to confirm"
                  className="h-10 rounded-md border-[#E3E5EC] bg-white text-[12px] text-[#1F2430] placeholder:text-[#A2A7B2] focus-visible:ring-0"
                />
              </div>
              <div className="space-y-1.5">
                <Typography variant="caption" className="text-[12px] font-semibold text-[#1F2430]">
                  Reason <span className="text-[#D90429]">*</span>
                </Typography>
                <textarea
                  value={deleteReason}
                  onChange={(event) => setDeleteReason(event.target.value)}
                  placeholder="Enter reason for deletion."
                  className="min-h-18 w-full resize-none rounded-md border border-[#E3E5EC] bg-white px-3 py-2 text-[12px] text-[#1F2430] placeholder:text-[#A2A7B2] outline-none focus:border-[#D1D6E2]"
                />
              </div>
            </div>
          </div>
          <div className="mt-6 border-t border-[#ECEEF3] p-3.5">
            <div className="flex items-center justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                className="border-[#E1E3EA] bg-white text-[12px] font-medium text-[#5A6070]"
                onClick={() => setIsDeleteOpen(false)}
                disabled={isDeletingContact}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-[#E17474] text-[12px] font-semibold text-white hover:bg-[#D96464]"
                onClick={() => void handleDeleteContact()}
                disabled={isDeletingContact || !isDeleteKeywordMatched || !hasDeleteReason}
              >
                {isDeletingContact ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <div className="flex flex-col gap-6">
        <div
          id={ownerContact?.id ? `team-contact-${ownerContact.id}` : undefined}
          className={SETTINGS_FORM_CARD_CLASS}
        >
          <div className="border-b border-[#F4F4F5] pb-4">
            <Typography className="text-base font-semibold text-[#18181B]">
              User Contact Details
            </Typography>
            <Typography className="mt-1 text-sm text-[#71717A]">
              Update your contact details to ensure you receive important system communications.
            </Typography>
          </div>

          <div className="mt-5 space-y-4">
            <div className="space-y-2">
              <ContactFieldLabel>Contact Role</ContactFieldLabel>
              <ReadOnlyRoleDisplay
                value={
                  CONTACT_ROLE_LABEL[ownerContact?.contact_role ?? 'ACCOUNT_OWNER'] ??
                  'Owner Account'
                }
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <ContactFieldLabel required>First Name</ContactFieldLabel>
                <Input
                  value={ownerDisplay?.firstName ?? ''}
                  className={cn(
                    SETTINGS_FORM_INPUT_CLASS,
                    !canManage && 'bg-[#FAFAFA] text-[#71717A]'
                  )}
                  readOnly={!canManage}
                  onChange={(e) =>
                    setOwnerWorking((prev) => ({
                      ...(prev ?? ownerBaseline!),
                      firstName: e.target.value,
                    }))
                  }
                  disabled={!canManage || !ownerBaseline}
                />
              </div>
              <div className="space-y-2">
                <ContactFieldLabel required>Last Name</ContactFieldLabel>
                <Input
                  value={ownerDisplay?.lastName ?? ''}
                  className={cn(
                    SETTINGS_FORM_INPUT_CLASS,
                    !canManage && 'bg-[#FAFAFA] text-[#71717A]'
                  )}
                  readOnly={!canManage}
                  onChange={(e) =>
                    setOwnerWorking((prev) => ({
                      ...(prev ?? ownerBaseline!),
                      lastName: e.target.value,
                    }))
                  }
                  disabled={!canManage || !ownerBaseline}
                />
              </div>
              <div className="space-y-2">
                <ContactFieldLabel required>Contact number</ContactFieldLabel>
                <ContactPhoneField
                  value={ownerDisplay?.contactNumber ?? ''}
                  readOnly={!canManage}
                  disabled={!canManage || !ownerBaseline}
                  onChange={(value) =>
                    setOwnerWorking((prev) => ({
                      ...(prev ?? ownerBaseline!),
                      contactNumber: value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <ContactFieldLabel required>Email</ContactFieldLabel>
                <Input
                  value={ownerContact?.email ?? ''}
                  readOnly
                  className={cn(SETTINGS_FORM_INPUT_CLASS, 'bg-[#FAFAFA] text-[#71717A]')}
                />
              </div>
            </div>
          </div>
        </div>

        <div className={SETTINGS_FORM_CARD_CLASS}>
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#F4F4F5] pb-4">
            <div className="min-w-0 space-y-1">
              <Typography className="text-base font-semibold text-[#18181B]">
                Team Members
              </Typography>
              <Typography className="text-sm text-[#71717A]">
                Additional contacts created by the account owner to manage operations, logistics, or
                billing.
              </Typography>
            </div>
            {canManage ? (
              <Button
                type="button"
                variant="outline"
                className="h-10 shrink-0 gap-1.5 border-[#E5E7EB] bg-white px-4 text-sm text-[#18181B] hover:bg-[#FAFAFA]"
                onClick={addTeamMember}
              >
                <UserPlus className="size-4" />
                Add new Team member
              </Button>
            ) : null}
          </div>

          <div className="mt-5 space-y-4">
            {isFetching ? (
              <div className="rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] px-4 py-8 text-center text-sm text-[#71717A]">
                Loading team members...
              </div>
            ) : null}

            {!isFetching && teamMembers.length === 0 ? (
              <div className="rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] px-4 py-8 text-center text-sm text-[#71717A]">
                No team members found.
              </div>
            ) : null}

            {teamMembers.map((member, index) => {
              const isDirty = dirtyIds.has(member.id);
              return (
                <div
                  key={member.id}
                  id={`team-contact-${member.id}`}
                  className={USER_CONTACTS_NESTED_CARD_CLASS}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F4F4F5] px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block size-2 shrink-0 rounded-full bg-[#F59E0B]"
                        aria-hidden
                      />
                      <span className="text-sm font-semibold text-[#18181B]">
                        Contact # {index + 1}
                      </span>
                    </div>
                    {canManage ? (
                      <div className="flex flex-wrap items-center gap-2">
                        {isDirty ? (
                          <Button
                            type="button"
                            variant="outline"
                            className={cn(SETTINGS_DISCARD_BTN_CLASS, 'h-9 px-3 text-sm')}
                            onClick={() => discardMember(member.id)}
                            disabled={savingMemberId === member.id}
                          >
                            Discard
                          </Button>
                        ) : null}
                        <Button
                          type="button"
                          className={cn(SETTINGS_SAVE_BTN_CLASS, 'h-9 px-3 text-sm')}
                          onClick={() => void saveMember(member.id)}
                          disabled={!isDirty || savingMemberId === member.id}
                        >
                          <Save className="size-4" />
                          {savingMemberId === member.id ? 'Saving…' : 'Save changes'}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="size-9 border-[#FECACA] text-[#DC2626] hover:bg-[#FEF2F2]"
                          onClick={() => openDeleteModal(member)}
                          aria-label="Delete team member"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    ) : null}
                  </div>

                  <div className="space-y-5 p-4 sm:p-5">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <ContactFieldLabel>Contact Role</ContactFieldLabel>
                        <ContactRoleSelect
                          value={member.role}
                          options={ROLE_OPTIONS}
                          readOnly={!canManage}
                          onChange={(value) =>
                            updateMember(member.id, { role: value as ContactRole })
                          }
                        />
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <ContactFieldLabel>First Name</ContactFieldLabel>
                          <Input
                            value={member.firstName}
                            className={cn(
                              SETTINGS_FORM_INPUT_CLASS,
                              !canManage && 'bg-[#FAFAFA] text-[#71717A]'
                            )}
                            readOnly={!canManage}
                            onChange={(event) =>
                              updateMember(member.id, { firstName: event.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <ContactFieldLabel>Last Name</ContactFieldLabel>
                          <Input
                            value={member.lastName}
                            className={cn(
                              SETTINGS_FORM_INPUT_CLASS,
                              !canManage && 'bg-[#FAFAFA] text-[#71717A]'
                            )}
                            readOnly={!canManage}
                            onChange={(event) =>
                              updateMember(member.id, { lastName: event.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <ContactFieldLabel>Contact number</ContactFieldLabel>
                          <ContactPhoneField
                            value={member.contactNumber}
                            readOnly={!canManage}
                            onChange={(value) => updateMember(member.id, { contactNumber: value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <ContactFieldLabel>Email</ContactFieldLabel>
                          <Input
                            value={member.email}
                            readOnly
                            className={cn(SETTINGS_FORM_INPUT_CLASS, 'bg-[#FAFAFA] text-[#71717A]')}
                          />
                        </div>
                      </div>
                    </div>

                    <div className={SETTINGS_FORM_DIVIDER_CLASS} />

                    <div>
                      {canManage ? (
                        <button
                          type="button"
                          className="flex w-full items-start justify-between gap-3 text-left"
                          onClick={() =>
                            updateMember(member.id, { accessExpanded: !member.accessExpanded })
                          }
                        >
                          <div className="min-w-0">
                            <Typography className="text-base font-semibold text-[#18181B]">
                              Platform Access
                            </Typography>
                            <Typography className="mt-1 text-sm text-[#71717A]">
                              Set the level of access this client has for each platform module.
                            </Typography>
                          </div>
                          <span className="flex size-8 shrink-0 items-center justify-center text-[#71717A]">
                            {member.accessExpanded ? (
                              <ChevronUp className="size-4" />
                            ) : (
                              <ChevronDown className="size-4" />
                            )}
                          </span>
                        </button>
                      ) : (
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <Typography className="text-base font-semibold text-[#18181B]">
                              Platform Access
                            </Typography>
                            <Typography className="mt-1 text-sm text-[#71717A]">
                              Set the level of access this client has for each platform module.
                            </Typography>
                          </div>
                        </div>
                      )}

                      {(member.accessExpanded || !canManage) && (
                        <PermissionAccessMatrix
                          className="mt-4"
                          value={member.permissions}
                          readOnly={!canManage}
                          onChange={
                            canManage
                              ? (itemKey, level) =>
                                  updateMember(member.id, {
                                    permissions: {
                                      ...member.permissions,
                                      [itemKey]: level,
                                    },
                                  })
                              : undefined
                          }
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
