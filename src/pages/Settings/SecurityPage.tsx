import { useState } from 'react';
import { CircleOff, KeyRound, Lock, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/atoms/Button';
import { Typography } from '@/components/atoms';
import { FormField } from '@/components/molecules';
import PasswordRequirementsList from '@/components/molecules/PasswordRequirementsList';
import { cn } from '@/lib/utils';
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

function formatLastSeen(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
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
  /** Requirement hints live in PasswordRequirementsList — avoid duplicating under the input */
  const newPasswordFieldError =
    errors.newPassword?.message === 'New password is required' ? errors.newPassword : undefined;

  const handlePasswordSubmit = async (data: ChangePasswordFormData): Promise<void> => {
    try {
      setIsChangingPassword(true);
      // authApi endpoint typings are resolved at runtime by RTK Query.

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
      // authApi endpoint typings are resolved at runtime by RTK Query.

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

  return (
    <section
      className={cn(
        'flex min-w-0 flex-1 flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5'
      )}
    >
      <header className="flex flex-col gap-1">
        <Typography variant="h4" weight="semibold" className="text-gray-900">
          Security
        </Typography>
        <Typography variant="body" color="muted" className="text-gray-600">
          Configure security controls, authentication policies, and system access protections to
          safeguard administrative operations.
        </Typography>
      </header>

      <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <Typography variant="h4" weight="semibold" className="text-gray-900">
              Session Management
            </Typography>
            <div className="flex items-center gap-2">
              {isPasswordFormOpen && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="px-4"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              )}
              <Button
                type={isPasswordFormOpen ? 'submit' : 'button'}
                form={isPasswordFormOpen ? 'change-password-form' : undefined}
                variant="default"
                size="sm"
                className="gap-1.5"
                onClick={isPasswordFormOpen ? undefined : () => setIsPasswordFormOpen(true)}
                disabled={
                  isChangingPassword || isSigningOutSingle || isSigningOutAll || isSigningOutOthers
                }
              >
                <Lock className="h-4 w-4" />
                {isPasswordFormOpen
                  ? isChangingPassword
                    ? 'Updating Password...'
                    : 'Update Password'
                  : 'Change Password'}
              </Button>
            </div>
          </div>

          {isPasswordFormOpen && (
            <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
              <Typography variant="h4" weight="semibold" className="text-gray-900">
                Update Your Password
              </Typography>
              <Typography variant="body" color="muted" className="mt-1 text-gray-600">
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
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-500">
                  <th className="pb-2 font-medium">Active Session</th>
                  <th className="pb-2 font-medium">Location</th>
                  <th className="pb-2 font-medium">Last Active</th>
                  <th className="pb-2 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isSessionsLoading && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-gray-500">
                      Loading active sessions...
                    </td>
                  </tr>
                )}
                {isSessionsError && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-red-600">
                      {getErrorMessage(sessionsError)}
                    </td>
                  </tr>
                )}
                {!isSessionsLoading && !isSessionsError && sessions.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-gray-500">
                      No active sessions found.
                    </td>
                  </tr>
                )}
                {!isSessionsLoading &&
                  !isSessionsError &&
                  sessions.map((session) => (
                    <tr
                      key={session.session_id}
                      className="border-b border-gray-100 last:border-b-0"
                    >
                      <td className="py-3">
                        <div className="flex items-start gap-2">
                          <CircleOff className="mt-0.5 h-4 w-4 text-gray-500" />
                          <div className="leading-tight">
                            <Typography variant="body" className="text-gray-900">
                              {session.device_label}
                            </Typography>
                            {session.current && (
                              <Typography
                                variant="caption"
                                className="text-xs font-medium text-teal-600"
                              >
                                This device • Active
                              </Typography>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-gray-800">
                        {session.location_label ?? 'Unknown location'}
                      </td>
                      <td className="py-3 text-gray-800">{formatLastSeen(session.last_seen_at)}</td>
                      <td className="py-3 text-right">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="gap-1.5 border-gray-300"
                          onClick={() => void handleSignOutSession(session)}
                          disabled={isSigningOutSingle || isSigningOutAll || isSigningOutOthers}
                        >
                          <LogOut className="h-4 w-4" />
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
            variant="secondary"
            size="sm"
            className="mt-4 gap-1.5 border-gray-300"
            onClick={() => void handleSignOutAllSessions()}
            disabled={isSigningOutAll || isSigningOutSingle || isSigningOutOthers}
          >
            <LogOut className="h-4 w-4" />
            {isSigningOutAll ? 'Signing out...' : 'Sign out of All Sessions'}
          </Button>
        </div>
      </div>
    </section>
  );
}
