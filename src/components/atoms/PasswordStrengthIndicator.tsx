import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import Typography from './Typography';

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
  /** Show requirements list when password is empty */
  showRequirementsWhenEmpty?: boolean;
}

type PasswordStrength = 'weak' | 'medium' | 'strong';

interface PasswordAnalysis {
  strength: PasswordStrength;
  score: number;
  missingRequirements: string[];
  requirements: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSymbol: boolean;
  };
}

/**
 * PasswordStrengthIndicator component displays password strength feedback
 * Based on Figma design:
 * - Empty state: Shows bullet point requirements in gray
 * - With password (weak): Shows "Strength: Weak" + "Password must include..."
 * - With password (medium/strong): Shows "Strength: Medium/Strong"
 */
export default function PasswordStrengthIndicator({
  password,
  className,
  showRequirementsWhenEmpty = true,
}: PasswordStrengthIndicatorProps): React.JSX.Element | null {
  const ANALYSIS = useMemo((): PasswordAnalysis => {
    if (!password) {
      return {
        strength: 'weak',
        score: 0,
        missingRequirements: [],
        requirements: {
          minLength: false,
          hasUppercase: false,
          hasLowercase: false,
          hasNumber: false,
          hasSymbol: false,
        },
      };
    }

    const REQUIREMENTS = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSymbol: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
    };

    const MISSING_REQUIREMENTS: string[] = [];

    if (!REQUIREMENTS.hasNumber) {
      MISSING_REQUIREMENTS.push('a number');
    }
    if (!REQUIREMENTS.hasSymbol) {
      MISSING_REQUIREMENTS.push('symbol');
    }

    // Calculate score based on requirements met
    const SCORE = Object.values(REQUIREMENTS).filter(Boolean).length;

    let strength: PasswordStrength;
    if (SCORE <= 2) {
      strength = 'weak';
    } else if (SCORE <= 4) {
      strength = 'medium';
    } else {
      strength = 'strong';
    }

    return {
      strength,
      score: SCORE,
      missingRequirements: MISSING_REQUIREMENTS,
      requirements: REQUIREMENTS,
    };
  }, [password]);

  const STRENGTH_CONFIG = {
    weak: {
      color: 'text-red-500',
      ringColor: 'ring-red-500',
      label: 'Weak',
    },
    medium: {
      color: 'text-yellow-500',
      ringColor: 'ring-yellow-500',
      label: 'Medium',
    },
    strong: {
      color: 'text-green-500',
      ringColor: 'ring-green-500',
      label: 'Strong',
    },
  };

  const CONFIG = STRENGTH_CONFIG[ANALYSIS.strength];

  // Empty state: show bullet requirements in gray
  if (!password) {
    if (!showRequirementsWhenEmpty) return null;

    return (
      <ul
        className={cn('flex flex-col list-disc list-inside text-form-subtitle text-sm', className)}
      >
        <li>At least 8 characters</li>
        <li>One number</li>
        <li>One symbol</li>
      </ul>
    );
  }

  // With password: show strength indicator
  return (
    <div className={cn('flex flex-col text-sm', className)}>
      <Typography variant="caption" className={CONFIG.color}>
        Strength: <span>{CONFIG.label}</span>
      </Typography>
      {ANALYSIS.strength === 'weak' && ANALYSIS.missingRequirements.length > 0 && (
        <Typography variant="caption" color="error" className="text-red-500">
          Password must include {ANALYSIS.missingRequirements.join(' and ')}
        </Typography>
      )}
    </div>
  );
}
