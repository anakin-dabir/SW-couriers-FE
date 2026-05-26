import { useState } from 'react';
import { KeyRound, Laptop, Lock, LogOut, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/atoms/Button';
import { Typography } from '@/components/atoms';
import { FormField } from '@/components/molecules';
import PasswordRequirementsList from '@/components/molecules/PasswordRequirementsList';
import { cn } from '@/lib/utils';
import {
  SETTINGS_FORM_CARD_CLASS,
  SETTINGS_SAVE_BTN_CLASS,
  SETTINGS_SECTION_DESC_CLASS,
} from '@/lib/settingsUi';
import { portalColors, portalOutlineButtonClass } from '@/lib/portalTheme';
import { useFormValidation } from '@/hooks/useFormValidation';
import { changePasswordSchema, type ChangePasswordFormData } from '@/schemas/companyDetails.schema';
import { clearCredentials } from '@/store/slices/authSlice';
import { useAppDispatch } from '@/store/hooks';
import {
  useGetActiveSessionsQuery,
  useLogoutAllSessionsMutation,
  useLogoutCurrentSessionMutation,
  authApi,
  type AuthSessionItemDto,
} from '@/store/api/authApi';
import { getErrorMessage } from '@/store/api/utils';

function formatSessionLastActive(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return 'Unknown';

  const now = new Date();
  const timeLabel = date.toLocaleString('en-GB', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  if (date.toDateString() === now.toDateString()) {
    return `Today at ${timeLabel}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday at ${timeLabel}`;
  }

  return date.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function SessionDeviceIcon({ session }: { session: AuthSessionItemDto }): React.JSX.Element {
  const Icon = session.is_mobile || session.is_tablet ? Smartphone : Laptop;
  return (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-[#E5E7EB] bg-[#FAFAFA]">
      <Icon className="size-4 text-[#71717A]" aria-hidden />
    </span>
  );
}

export default function SecurityPage(): React.JSX.Element {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [isPasswordFormOpen, setIsPasswordFormOpen] = useState(false);
  const {
    data: sessionsResponse,
    isLoading: isSessionsLoading,
    isError: isSessionsError,
    error: sessionsError,
    refetch: refetchSessions,
  } = useGetActiveSessionsQuery();
  const sessions = sessionsResponse?.data.items ?? [];
  const [logoutCurrentSession] = useLogoutCurrentSessionMutation();
  const [logoutAllSessions] = useLogoutAllSessionsMutation();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSigningOutSingle, setIsSigningOutSingle] = useState(false);
  const [isSigningOutAll, setIsSigningOutAll] = useState(false);
  const [isSigningOutOthers, setIsSigningOutOthers] = useState(false);

  const defaultValues = {
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  };

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useFormValidation({
    schema: changePasswordSchema,
    defaultValues,
    mode: 'onChange',
  });

  const newPasswordValue = watch('newPassword') ?? '';
  const newPasswordFieldError =
    errors.newPassword?.message === 'New password is required' ? errors.newPassword : undefined;

  const handlePasswordSubmit = async (data: ChangePasswordFormData): Promise<void> => {
    try {
      setIsChangingPassword(true);
      await dispatch(
        authApi.endpoints.changePassword.initiate({
          current_password: data.currentPassword,
          new_password: data.newPassword,
        })
      ).unwrap();
      toast.success('Password changed successfully. Please log in again.');
      dispatch(clearCredentials());
      void navigate('/login', { replace: true });
      setIsPasswordFormOpen(false);
      reset(defaultValues);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleCancel = (): void => {
    setIsPasswordFormOpen(false);
    reset(defaultValues);
  };

  const handleSignOutSession = async (session: AuthSessionItemDto): Promise<void> => {
    try {
      if (session.current) {
        setIsSigningOutSingle(true);
        await logoutCurrentSession().unwrap();
        toast.success('Successfully logged out.');
        dispatch(clearCredentials());
        void navigate('/login', { replace: true });
        return;
      }

      setIsSigningOutOthers(true);
      await dispatch(authApi.endpoints.logoutOtherSessions.initiate()).unwrap();
      toast.success('Logged out from other sessions.');
      void refetchSessions();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSigningOutSingle(false);
      setIsSigningOutOthers(false);
    }
  };

  const handleSignOutAllSessions = async (): Promise<void> => {
    try {
      setIsSigningOutAll(true);
      await logoutAllSessions().unwrap();
      toast.success('Logged out from all devices.');
      dispatch(clearCredentials());
      void navigate('/login', { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSigningOutAll(false);
    }
  };

  const sessionActionsDisabled =
    isSigningOutSingle || isSigningOutAll || isSigningOutOthers || isChangingPassword;

  return (
    <div className="flex flex-col gap-5">
      <div className={SETTINGS_FORM_CARD_CLASS}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F4F4F5] pb-5">
          <Typography variant="h4" className="text-base font-semibold text-[#18181B]">
            Session Management
          </Typography>
          <div className="flex flex-wrap items-center gap-2">
            {isPasswordFormOpen ? (
              <Button
                type="button"
                variant="outline"
                className={portalOutlineButtonClass}
                onClick={handleCancel}
                disabled={isChangingPassword}
              >
                Cancel
              </Button>
            ) : null}
            <Button
              type={isPasswordFormOpen ? 'submit' : 'button'}
              form={isPasswordFormOpen ? 'change-password-form' : undefined}
              className={SETTINGS_SAVE_BTN_CLASS}
              onClick={isPasswordFormOpen ? undefined : () => setIsPasswordFormOpen(true)}
              disabled={sessionActionsDisabled}
            >
              <Lock className="size-4" />
              {isPasswordFormOpen
                ? isChangingPassword
                  ? 'Updating Password...'
                  : 'Update Password'
                : 'Change Password'}
            </Button>
          </div>
        </div>

        {isPasswordFormOpen ? (
          <div className="mt-5 rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] p-5">
            <Typography variant="h4" className="text-base font-semibold text-[#18181B]">
              Update Your Password
            </Typography>
            <Typography variant="body" className={cn('mt-1', SETTINGS_SECTION_DESC_CLASS)}>
              Enter and confirm your new password, with a combination of at least 1 uppercase, 1
              lowercase and a number (0-9) required.
            </Typography>

            <form
              id="change-password-form"
              onSubmit={(e) => void handleSubmit(handlePasswordSubmit)(e)}
              className="mt-4 flex flex-col gap-4"
            >
              <FormField
                label="Current Password"
                type="password"
                required
                placeholder="Enter Current Password"
                leftIcon={KeyRound}
                error={errors.currentPassword}
                {...register('currentPassword')}
              />

              <FormField
                label="New Password"
                type="password"
                required
                placeholder="Enter New Password"
                leftIcon={KeyRound}
                error={newPasswordFieldError}
                {...register('newPassword')}
              />

              <PasswordRequirementsList password={newPasswordValue} />

              <FormField
                label="Confirm New Password"
                type="password"
                required
                placeholder="Confirm Password"
                leftIcon={KeyRound}
                error={errors.confirmNewPassword}
                {...register('confirmNewPassword')}
              />
            </form>
          </div>
        ) : null}

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-[#E5E7EB] text-left">
                <th className="pb-3 pr-4 text-xs font-medium text-[#71717A]">Active Session</th>
                <th className="pb-3 pr-4 text-xs font-medium text-[#71717A]">Location</th>
                <th className="pb-3 pr-4 text-xs font-medium text-[#71717A]">Last Active</th>
                <th className="pb-3 text-right text-xs font-medium text-[#71717A]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isSessionsLoading ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-[#71717A]">
                    Loading active sessions...
                  </td>
                </tr>
              ) : null}
              {isSessionsError ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-[#DC2626]">
                    {getErrorMessage(sessionsError)}
                  </td>
                </tr>
              ) : null}
              {!isSessionsLoading && !isSessionsError && sessions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-[#71717A]">
                    No active sessions found.
                  </td>
                </tr>
              ) : null}
              {!isSessionsLoading &&
                !isSessionsError &&
                sessions.map((session) => (
                  <tr
                    key={session.session_id}
                    className="border-b border-[#F4F4F5] last:border-b-0"
                  >
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <SessionDeviceIcon session={session} />
                        <div className="min-w-0">
                          <Typography variant="body" className="text-sm font-medium text-[#18181B]">
                            {session.device_label}
                          </Typography>
                          {session.current ? (
                            <span
                              className="mt-0.5 flex items-center gap-1.5 text-xs font-medium"
                              style={{ color: portalColors.success }}
                            >
                              <span
                                className="size-1.5 shrink-0 rounded-full"
                                style={{ backgroundColor: portalColors.success }}
                                aria-hidden
                              />
                              This device • Active
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 pr-4 text-sm text-[#3F3F46]">
                      {session.location_label ?? 'Unknown location'}
                    </td>
                    <td className="py-4 pr-4 text-sm text-[#3F3F46]">
                      {formatSessionLastActive(session.last_seen_at)}
                    </td>
                    <td className="py-4 text-right">
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(portalOutlineButtonClass, 'h-9 px-3 text-sm')}
                        onClick={() => void handleSignOutSession(session)}
                        disabled={sessionActionsDisabled}
                      >
                        <LogOut className="size-4" />
                        Sign Out
                      </Button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <Button
          type="button"
          variant="outline"
          className={cn(portalOutlineButtonClass, 'mt-5')}
          onClick={() => void handleSignOutAllSessions()}
          disabled={sessionActionsDisabled}
        >
          <LogOut className="size-4" />
          {isSigningOutAll ? 'Signing out...' : 'Sign out of All Sessions'}
        </Button>
      </div>
    </div>
  );
}
