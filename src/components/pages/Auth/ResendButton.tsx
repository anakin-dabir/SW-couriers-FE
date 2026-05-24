import Typography from '@/components/atoms/Typography';

interface ResendButtonProps {
  /** Click handler for resend */
  onResend: () => void;
  /** Remaining seconds until resend is available */
  timer: number;
  /** Text shown before timer/button */
  promptText?: string;
  /** Button text */
  buttonText?: string;
  /** Disable resend action */
  disabled?: boolean;
}

/**
 * Atomic component for resend code button with timer
 */
export default function ResendButton({
  onResend,
  timer,
  promptText = "Didn't receive the code?",
  buttonText = 'Resend code',
  disabled = false,
}: ResendButtonProps): React.JSX.Element {
  const formatTimer = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center justify-center gap-2">
      <Typography variant="caption" className="text-form-body">
        {promptText}
      </Typography>
      {timer > 0 ? (
        <Typography variant="caption" className="text-primary-500">
          Resend in {formatTimer(timer)}
        </Typography>
      ) : (
        <button
          type="button"
          onClick={onResend}
          disabled={disabled}
          className="text-sm font-medium text-primary-500 hover:text-primary-600 transition-colors underline disabled:cursor-not-allowed disabled:opacity-60"
        >
          {buttonText}
        </button>
      )}
    </div>
  );
}
