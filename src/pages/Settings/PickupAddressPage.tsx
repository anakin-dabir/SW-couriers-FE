import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Save, Trash2, UserPlus } from 'lucide-react';
import { useNavigate, useOutletContext, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/select';
import { Card, CardContent } from '@/components/molecules/card';
import { PermissionAccessMatrix } from '@/components/organisms/PermissionAccessMatrix';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog';
import { cn } from '@/lib/utils';
import {
  API_RESOURCE_TO_PERMISSION_UI_KEY,
  buildOrgContactPermissionsPayload,
  permissionLevelFromApi,
  type UiPermissionLevel,
} from '@/lib/orgContactPermissions';
import { TEAM_PLATFORM_ACCESS_ITEMS } from '@/lib/teamPlatformAccess';
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
  const { data: contactsResponse, isFetching } = useGetOrgContactsQuery(
    { organizationId: organizationId ?? '' },
    { skip: !organizationId || !accessToken }
  );
  const [removeOrgContact, { isLoading: isDeletingContact }] = useRemoveOrgContactMutation();
  const [updateOrgContact, { isLoading: isUpdatingContact }] = useUpdateOrgContactMutation();

  const ownerContact = contactsResponse?.data?.owner ?? null;

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
        mapContactToMember(member, false)
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
      <div
        className={cn(
          'flex min-w-0 flex-1 flex-col gap-6 rounded-xl border border-gray-200 bg-gray-50 p-5'
        )}
      >
        <Card
          id={ownerContact?.id ? `team-contact-${ownerContact.id}` : undefined}
          className="rounded-md border border-gray-200 bg-white shadow-none p-5"
        >
          <CardContent className="space-y-4 ">
            <div className="space-y-1 border-b border-gray-200 pb-3">
              <Typography variant="h4" weight="semibold" className="text-base text-gray-900">
                User Contact Details
              </Typography>
              <Typography variant="caption" color="muted" className="text-sm">
                Update your contact details to ensure you receive important system communications.
              </Typography>
            </div>

            <div className="space-y-1.5">
              <Typography variant="label" color="muted" className="text-sm">
                Contact Role
              </Typography>
              <Input
                value={
                  CONTACT_ROLE_LABEL[ownerContact?.contact_role ?? 'ACCOUNT_OWNER'] ??
                  'Owner Account'
                }
                readOnly
                className="bg-gray-100 text-gray-600"
              />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1.5">
                <Typography variant="label" color="muted" className="text-sm">
                  First Name<span className="text-[#BE1E2D]">*</span>
                </Typography>
                <Input
                  value={ownerDisplay?.firstName ?? ''}
                  className="bg-white"
                  onChange={(e) =>
                    setOwnerWorking((prev) => ({
                      ...(prev ?? ownerBaseline!),
                      firstName: e.target.value,
                    }))
                  }
                  disabled={!ownerBaseline}
                />
              </div>
              <div className="space-y-1.5">
                <Typography variant="label" color="muted" className="text-sm">
                  Last Name<span className="text-[#BE1E2D]">*</span>
                </Typography>
                <Input
                  value={ownerDisplay?.lastName ?? ''}
                  className="bg-white"
                  onChange={(e) =>
                    setOwnerWorking((prev) => ({
                      ...(prev ?? ownerBaseline!),
                      lastName: e.target.value,
                    }))
                  }
                  disabled={!ownerBaseline}
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Typography variant="label" color="muted" className="text-sm">
                  Contact number<span className="text-[#BE1E2D]">*</span>
                </Typography>
                <Input
                  value={ownerDisplay?.contactNumber ?? ''}
                  className="bg-white"
                  onChange={(e) =>
                    setOwnerWorking((prev) => ({
                      ...(prev ?? ownerBaseline!),
                      contactNumber: e.target.value,
                    }))
                  }
                  disabled={!ownerBaseline}
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Typography variant="label" color="muted" className="text-sm">
                  Email<span className="text-[#BE1E2D]">*</span>
                </Typography>
                <Input
                  value={ownerContact?.email ?? ''}
                  readOnly
                  className="bg-gray-100 text-gray-600"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-md border border-gray-200 bg-white shadow-none p-4">
          <CardContent className="space-y-4 ">
            <div className="space-y-1 border-b border-gray-200 pb-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Typography variant="h4" weight="semibold" className="text-base text-gray-900">
                  Team Members
                </Typography>
                <Button type="button" variant="outline" size="sm" onClick={addTeamMember}>
                  <UserPlus className="h-3.5 w-3.5" />
                  Add new Team member
                </Button>
              </div>
              <Typography variant="caption" color="muted" className="text-sm">
                Additional contacts created by the account owner to manage operations, logistics, or
                billing.
              </Typography>
            </div>

            {isFetching && (
              <div className="rounded-md border border-gray-200 bg-white px-4 py-6 text-sm text-gray-500">
                Loading team members...
              </div>
            )}

            {!isFetching && teamMembers.length === 0 && (
              <div className="rounded-md border border-gray-200 bg-white px-4 py-6 text-sm text-gray-500">
                No team members found.
              </div>
            )}

            {teamMembers.map((member, index) => {
              const isDirty = dirtyIds.has(member.id);
              return (
                <div
                  key={member.id}
                  id={`team-contact-${member.id}`}
                  className="rounded-md border border-gray-200 bg-white"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block size-2 shrink-0 rounded-full bg-[#F97316]"
                        aria-hidden
                      />
                      <span className="text-xs font-semibold text-gray-900">
                        Contact # {index + 1}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {isDirty && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => discardMember(member.id)}
                          disabled={savingMemberId === member.id}
                        >
                          Discard
                        </Button>
                      )}
                      <Button
                        type="button"
                        size="sm"
                        className="h-7 bg-[#BE1E2D] text-xs text-white hover:bg-[#A21926]"
                        onClick={() => void saveMember(member.id)}
                        disabled={!isDirty || savingMemberId === member.id}
                      >
                        <Save className="h-3 w-3" />
                        {savingMemberId === member.id ? 'Saving…' : 'Save changes'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 border-red-200 px-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => openDeleteModal(member)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4 p-3">
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <Typography variant="label" color="muted" className="text-sm">
                          Contact Role
                        </Typography>
                        <Select
                          value={member.role}
                          onValueChange={(value) =>
                            updateMember(member.id, { role: value as ContactRole })
                          }
                        >
                          <SelectTrigger className="h-10 bg-gray-100 text-sm">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            {ROLE_OPTIONS.map((role) => (
                              <SelectItem key={role.value} value={role.value}>
                                {role.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-1.5">
                          <Typography variant="label" color="muted" className="text-sm">
                            First Name
                          </Typography>
                          <Input
                            value={member.firstName}
                            className="bg-gray-100"
                            onChange={(event) =>
                              updateMember(member.id, { firstName: event.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Typography variant="label" color="muted" className="text-sm">
                            Last Name
                          </Typography>
                          <Input
                            value={member.lastName}
                            className="bg-gray-100"
                            onChange={(event) =>
                              updateMember(member.id, { lastName: event.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Typography variant="label" color="muted" className="text-sm">
                            Contact Number
                          </Typography>
                          <Input
                            value={member.contactNumber}
                            className="bg-gray-100"
                            onChange={(event) =>
                              updateMember(member.id, { contactNumber: event.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Typography variant="label" color="muted" className="text-sm">
                            Email
                          </Typography>
                          <Input
                            value={member.email}
                            readOnly
                            className="bg-gray-100 text-gray-600"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-3">
                      <div
                        role="button"
                        tabIndex={0}
                        className="flex cursor-pointer items-center justify-between"
                        onClick={() =>
                          updateMember(member.id, { accessExpanded: !member.accessExpanded })
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            updateMember(member.id, { accessExpanded: !member.accessExpanded });
                          }
                        }}
                      >
                        <div>
                          <Typography
                            variant="h4"
                            weight="semibold"
                            className="text-base text-gray-900"
                          >
                            Platform Access
                          </Typography>
                          <Typography variant="caption" color="muted" className="text-sm">
                            Set the level of access this client has for each platform module.
                          </Typography>
                        </div>
                        <Button type="button" variant="ghost" size="icon" className="h-7 w-7">
                          {member.accessExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>

                      {member.accessExpanded && (
                        <PermissionAccessMatrix
                          className="mt-3"
                          value={member.permissions}
                          onChange={(itemKey, level) =>
                            updateMember(member.id, {
                              permissions: {
                                ...member.permissions,
                                [itemKey]: level,
                              },
                            })
                          }
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
