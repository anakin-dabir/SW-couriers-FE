'use client';

import * as React from 'react';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Check, ChevronDown, ChevronUp, Info, Pencil, UserPlus2 } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/input';
import { Typography } from '@/components/atoms';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/select';
import { Card } from '@/components/molecules/card';
import { PermissionAccessMatrix } from '@/components/organisms/PermissionAccessMatrix';
import { cn } from '@/lib/utils';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { toast } from 'sonner';
import { useAppSelector } from '@/store/hooks';
import { contactsApi } from '@/store/api/contactsApi';
import type {
  AddOrgContactRequestDto,
  OrgContactDto,
  UpdateOrgContactRequestDto,
} from '@/store/api/contactsApi';
import type { RootState } from '@/store/store';

import {
  API_RESOURCE_TO_PERMISSION_UI_KEY,
  buildOrgContactPermissionsPayload,
  type UiPermissionLevel,
} from '@/lib/orgContactPermissions';

const FORM_STEPS = ['Basic Information', 'Permissions', 'Review & Create'] as const;

type PermissionLevel = UiPermissionLevel;

interface BasicInfoState {
  role: string;
  firstName: string;
  lastName: string;
  contactNumber: string;
  email: string;
}

const INITIAL_BASIC_INFO: BasicInfoState = {
  role: '',
  firstName: '',
  lastName: '',
  contactNumber: '',
  email: '',
};

const CONTACT_ROLE_OPTIONS = [
  { value: 'ACCOUNT_OWNER', label: 'Account Owner' },
  { value: 'BILLING', label: 'Billing' },
  { value: 'OPERATIONS', label: 'Operations' },
  { value: 'TECHNICAL', label: 'Technical' },
  { value: 'OTHER', label: 'Other' },
] as const;
type ContactRoleValue = (typeof CONTACT_ROLE_OPTIONS)[number]['value'];
const CONTACT_ROLE_VALUES: ReadonlySet<ContactRoleValue> = new Set(
  CONTACT_ROLE_OPTIONS.map((roleOption) => roleOption.value)
);

export default function InviteMemberPage(): React.JSX.Element {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');
  const contactsApiHooks = contactsApi as unknown as {
    useGetOrgContactByIdQuery: (
      arg: { organizationId: string; contactId: string },
      options: { skip: boolean }
    ) => { data?: { data?: OrgContactDto } };
    useAddOrgContactMutation: () => [
      (arg: AddOrgContactRequestDto) => Promise<{ data?: unknown; error?: unknown }>,
    ];
    useUpdateOrgContactMutation: () => [
      (arg: UpdateOrgContactRequestDto) => Promise<{ data?: unknown; error?: unknown }>,
    ];
  };
  const [addOrgContact] = contactsApiHooks.useAddOrgContactMutation();
  const [updateOrgContact] = contactsApiHooks.useUpdateOrgContactMutation();
  const organizationId = useAppSelector(
    (state: RootState) =>
      state.auth.user?.organization_id ?? state.auth.loginResponse?.data?.organization_id ?? null
  );
  const contactQuery = contactsApiHooks.useGetOrgContactByIdQuery(
    { organizationId: organizationId ?? '', contactId: userId ?? '' },
    { skip: !organizationId || !userId }
  );
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [basicInfo, setBasicInfo] = useState<BasicInfoState>(INITIAL_BASIC_INFO);
  const [permissions, setPermissions] = useState<Record<string, PermissionLevel>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openReviewSections, setOpenReviewSections] = useState({
    basicInfo: true,
    permissions: true,
  });

  React.useEffect(() => {
    const contact = contactQuery.data?.data;
    if (!contact) return;

    const normalizedRole = (contact.contact_role ?? '').toUpperCase();
    setBasicInfo({
      role: CONTACT_ROLE_VALUES.has(normalizedRole as ContactRoleValue)
        ? (normalizedRole as ContactRoleValue)
        : 'OTHER',
      firstName: contact.first_name ?? '',
      lastName: contact.last_name ?? '',
      contactNumber: contact.contact_number || contact.phone || '',
      email: contact.email ?? '',
    });

    const mappedPermissions = (contact.permissions ?? []).reduce<Record<string, PermissionLevel>>(
      (acc, permission) => {
        const uiKey = API_RESOURCE_TO_PERMISSION_UI_KEY[permission.resource];
        if (!uiKey) return acc;
        acc[uiKey] = permission.level === 2 ? 'write' : permission.level === 1 ? 'read' : 'none';
        return acc;
      },
      {}
    );
    setPermissions(mappedPermissions);
  }, [contactQuery.data]);

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === FORM_STEPS.length - 1;

  const setPermission = (itemKey: string, level: PermissionLevel): void => {
    setPermissions((prev) => ({ ...prev, [itemKey]: level }));
  };

  const handleNextStep = (): void => {
    if (!isLastStep) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePreviousStep = (): void => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async (sendInvite: boolean): Promise<void> => {
    if (!sendInvite) {
      toast.success('Draft saved locally.');
      return;
    }

    if (!organizationId) {
      toast.error('Organization is missing from session. Please login again.');
      return;
    }

    if (
      !basicInfo.firstName ||
      !basicInfo.lastName ||
      !basicInfo.email ||
      !basicInfo.contactNumber
    ) {
      toast.error('Please complete required member fields before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      const permissionsPayload = buildOrgContactPermissionsPayload(permissions);

      const basePayload = {
        organizationId,
        contact_number: basicInfo.contactNumber,
        contact_role: basicInfo.role,
        first_name: basicInfo.firstName.trim(),
        last_name: basicInfo.lastName.trim(),
        permissions: permissionsPayload,
      };

      if (userId) {
        const updateResponse = await updateOrgContact({
          ...basePayload,
          contactId: userId,
        });
        if ('error' in updateResponse) {
          throw new Error('update failed');
        }
        toast.success('Member updated successfully.');
      } else {
        const createResponse = await addOrgContact({
          ...basePayload,
          email: basicInfo.email.trim().toLowerCase(),
        });
        if ('error' in createResponse) {
          throw new Error('create failed');
        }
        toast.success('Member invited successfully.');
      }
      void navigate('/invite-team');
    } catch (error) {
      console.error(
        userId ? 'Failed to update organization contact' : 'Failed to add organization contact',
        error
      );
      toast.error(
        userId
          ? 'Failed to update member. Please try again.'
          : 'Failed to invite member. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isBasicInfoValid =
    basicInfo.role.trim().length > 0 &&
    basicInfo.firstName.trim().length > 0 &&
    basicInfo.lastName.trim().length > 0 &&
    basicInfo.contactNumber.trim().length > 0 &&
    basicInfo.email.trim().length > 0;

  const handlePrimaryAction = (): void => {
    if (!isLastStep) {
      if (!isBasicInfoValid && currentStep === 0) {
        toast.error('Please fill all required fields to continue.');
        return;
      }
      handleNextStep();
      return;
    }

    void handleSubmit(true);
  };
  const toggleReviewSection = (key: 'basicInfo' | 'permissions'): void => {
    setOpenReviewSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getStepStatus = (index: number): 'completed' | 'current' | 'upcoming' => {
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'current';
    return 'upcoming';
  };

  const renderStepIcon = (status: 'completed' | 'current' | 'upcoming'): React.JSX.Element => {
    if (status === 'completed') {
      return (
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#FECACA] bg-[#FEE2E2]">
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#DC2626]">
            <Check className="h-3 w-3 text-white" strokeWidth={3} />
          </span>
        </span>
      );
    }
    if (status === 'current') {
      return (
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#FECACA] bg-[#FEE2E2]">
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border-2 border-[#DC2626] bg-white">
            <span className="h-1.5 w-1.5 rounded-full bg-[#DC2626]" />
          </span>
        </span>
      );
    }
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center">
        <span className="inline-flex h-5 w-5 rounded-full border-2 border-[#9CA3AF] bg-white" />
      </span>
    );
  };

  const renderBasicInfoStep = (): React.JSX.Element => (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1.5 md:col-span-2">
          <Typography variant="label" className="text-sm text-form-title">
            Contact Role <span className="text-primary-600">*</span>
          </Typography>
          <Select
            value={basicInfo.role}
            onValueChange={(value) => setBasicInfo((prev) => ({ ...prev, role: value }))}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              {CONTACT_ROLE_OPTIONS.map((roleOption) => (
                <SelectItem key={roleOption.value} value={roleOption.value}>
                  {roleOption.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Typography variant="label" className="text-sm text-form-title">
            First Name <span className="text-primary-600">*</span>
          </Typography>
          <Input
            placeholder="e.g. Ahmed"
            value={basicInfo.firstName}
            onChange={(event) =>
              setBasicInfo((prev) => ({ ...prev, firstName: event.target.value }))
            }
          />
        </div>
        <div className="space-y-1.5">
          <Typography variant="label" className="text-sm text-form-title">
            Last Name <span className="text-primary-600">*</span>
          </Typography>
          <Input
            placeholder="e.g. Khan"
            value={basicInfo.lastName}
            onChange={(event) =>
              setBasicInfo((prev) => ({ ...prev, lastName: event.target.value }))
            }
          />
        </div>

        <div className="space-y-1.5">
          <Typography variant="label" className="text-sm text-form-title">
            Contact number <span className="text-primary-600">*</span>
          </Typography>
          <div className="flex h-10 w-full items-center gap-2 rounded-md border border-form-border-light bg-form-surface px-3 py-2 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20">
            <PhoneInput
              international
              defaultCountry="GB"
              value={basicInfo.contactNumber || undefined}
              onChange={(value) =>
                setBasicInfo((prev) => ({ ...prev, contactNumber: String(value ?? '') }))
              }
              placeholder="Enter phone number"
              className="flex min-w-0 flex-1 items-center border-0 bg-transparent p-0"
              numberInputProps={{
                id: 'invite-member-contact-number',
                className:
                  'flex-1 min-w-0 border-0 bg-transparent p-0 text-sm font-normal leading-5 text-form-title placeholder:text-form-placeholder focus:outline-none focus:ring-0',
              }}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Typography variant="label" className="text-sm text-form-title">
            Email <span className="text-primary-600">*</span>
          </Typography>
          <Input
            type="email"
            placeholder="e.g. ahmed@swiftretail.com"
            value={basicInfo.email}
            onChange={(event) => setBasicInfo((prev) => ({ ...prev, email: event.target.value }))}
          />
        </div>
      </div>
    </div>
  );

  const renderPermissionsStep = (): React.JSX.Element => (
    <PermissionAccessMatrix value={permissions} onChange={setPermission} />
  );

  const renderReviewSection = (
    key: 'basicInfo' | 'permissions',
    title: string,
    onEdit: () => void,
    content: React.JSX.Element
  ): React.JSX.Element => (
    <section className="rounded-lg border border-[#E4E4E7] bg-white">
      <div className="flex items-center justify-between px-4 py-3">
        <Typography variant="caption" className="text-sm font-semibold text-[#18181B]">
          {title}
        </Typography>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex h-7 items-center gap-1 rounded border border-[#E4E4E7] px-2 text-xs text-gray-700 hover:bg-gray-50"
          >
            <Pencil className="h-3 w-3" />
            Edit
          </button>
          <button
            type="button"
            onClick={() => toggleReviewSection(key)}
            className="inline-flex h-7 w-7 items-center justify-center rounded border border-[#E4E4E7]"
            aria-label={`Toggle ${title}`}
          >
            {openReviewSections[key] ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>
      {openReviewSections[key] && (
        <div className="border-t border-[#E4E4E7] px-4 py-3">{content}</div>
      )}
    </section>
  );

  const renderReviewStep = (): React.JSX.Element => {
    const memberInitials = `${basicInfo.firstName} ${basicInfo.lastName}`
      .trim()
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase())
      .slice(0, 2)
      .join('');

    return (
      <div className="space-y-3">
        {renderReviewSection(
          'basicInfo',
          'Basic Information',
          () => setCurrentStep(0),
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#E5E7EB] text-lg font-semibold text-gray-500">
                {memberInitials || '?'}
              </div>
              <div className="space-y-1">
                <Typography variant="caption" className="text-sm font-semibold text-[#18181B]">
                  {[basicInfo.firstName, basicInfo.lastName].filter(Boolean).join(' ') || '—'}
                </Typography>
                <span className="inline-flex rounded-full bg-[#18181B] px-2 py-0.5 text-[10px] font-semibold text-white">
                  {basicInfo.role || 'Member'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <div>
                <Typography variant="caption" className="text-[11px] text-[#71717A]">
                  Email Address
                </Typography>
                <Typography variant="caption" className="text-xs font-medium text-[#18181B]">
                  {basicInfo.email || '—'}
                </Typography>
              </div>
              <div>
                <Typography variant="caption" className="text-[11px] text-[#71717A]">
                  Contact Number
                </Typography>
                <Typography variant="caption" className="text-xs font-medium text-[#18181B]">
                  {basicInfo.contactNumber ? `+44 ${basicInfo.contactNumber}` : '—'}
                </Typography>
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-md border border-[#BFDBFE] bg-[#EFF6FF] px-3 py-2 text-xs text-[#1D4ED8]">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>The member will receive an email invitation to join your team workspace.</span>
            </div>
          </div>
        )}

        {renderReviewSection(
          'permissions',
          'Permissions Assignment',
          () => setCurrentStep(1),
          <div className="space-y-3">
            <div>
              <div className="mb-1.5 flex items-center gap-1.5">
                <Typography variant="caption" className="text-xs font-semibold text-gray-500">
                  Platform Access
                </Typography>
              </div>
              <PermissionAccessMatrix value={permissions} readOnly />
            </div>
          </div>
        )}
      </div>
    );
  };

  const getStepTitle = (): { title: string; description: string } => {
    if (currentStep === 0) {
      return {
        title: 'Basic Information',
        description: "Enter the team member's personal details to identify them within the system.",
      };
    }
    if (currentStep === 1) {
      return {
        title: 'Platform Access',
        description: 'Set the level of access in the client area for each platform module.',
      };
    }
    return {
      title: 'Review & Create',
      description: 'Review all details before creating the invite.',
    };
  };

  const { title, description } = getStepTitle();

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
            <UserPlus2 className="h-5 w-5 text-gray-500" />
          </span>
          <div>
            <Typography variant="h6" className="text-lg font-semibold text-gray-900">
              {userId ? 'Edit Team Member' : 'Invite Team Members'}
            </Typography>
            <Typography variant="caption" className="text-sm text-gray-500">
              {userId
                ? 'Update team member details and adjust access permissions.'
                : 'Invite team members to collaborate and assign them appropriate roles and access.'}
            </Typography>
          </div>
        </div>
      </div>

      <Card className="rounded-xl border border-gray-200 bg-[#F9FAFB] p-4">
        <div className="overflow-x-auto pb-1">
          <div className="flex items-start gap-0">
            {FORM_STEPS.map((step, index) => {
              const status = getStepStatus(index);
              const isActiveSegment = index < currentStep;
              return (
                <div
                  key={step}
                  className={cn(
                    'flex flex-col',
                    index === FORM_STEPS.length - 1 ? 'w-auto' : 'flex-1'
                  )}
                >
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(index)}
                      className="shrink-0"
                      aria-label={`Go to ${step}`}
                    >
                      {renderStepIcon(status)}
                    </button>
                    {index < FORM_STEPS.length - 1 && (
                      <span
                        className={cn(
                          'ml-1.25 h-0.5 flex-1 self-center',
                          isActiveSegment
                            ? 'bg-[#DC2626]'
                            : 'border-t-2 border-dashed border-[#9CA3AF]'
                        )}
                      />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(index)}
                    className={cn(
                      'mt-2 text-left text-xs font-semibold',
                      status === 'upcoming' ? 'text-[#9CA3AF]' : 'text-gray-900'
                    )}
                  >
                    {step}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      <Card className="max-w-[65%] rounded-xl border border-gray-200 bg-white p-6">
        <div className="mb-6 border-b border-gray-200 pb-5">
          <Typography variant="h6" className="text-xl font-semibold text-gray-900">
            {title}
          </Typography>
          <Typography variant="caption" className="mt-1 text-sm text-gray-500">
            {description}
          </Typography>
        </div>

        {currentStep === 0 && renderBasicInfoStep()}
        {currentStep === 1 && renderPermissionsStep()}
        {currentStep === 2 && renderReviewStep()}

        <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-5">
          {isFirstStep ? (
            <Button variant="outline" onClick={() => void navigate('/invite-team')}>
              Cancel
            </Button>
          ) : (
            <Button variant="outline" onClick={handlePreviousStep}>
              Previous
            </Button>
          )}

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              disabled={isSubmitting}
              onClick={() => {
                void handleSubmit(false);
              }}
            >
              Save as Draft
            </Button>
            <Button className="gap-2" disabled={isSubmitting} onClick={handlePrimaryAction}>
              {isLastStep ? (userId ? 'Save Changes' : 'Create Invite') : 'Save & Continue'}
              {!isLastStep && <ArrowRight className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
