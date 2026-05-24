/** Symbol set aligned with change-password and registration flows */
export const PASSWORD_SYMBOL_REGEX = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;

export interface PasswordRequirementRule {
  id: string;
  label: string;
  test: (password: string) => boolean;
}

export const PASSWORD_REQUIREMENT_RULES: readonly PasswordRequirementRule[] = [
  {
    id: 'minLength',
    label: 'At least 8 characters',
    test: (password) => password.length >= 8,
  },
  {
    id: 'uppercase',
    label: 'One uppercase letter',
    test: (password) => /[A-Z]/.test(password),
  },
  {
    id: 'lowercase',
    label: 'One lower case letter',
    test: (password) => /[a-z]/.test(password),
  },
  {
    id: 'number',
    label: 'One number',
    test: (password) => /\d/.test(password),
  },
  {
    id: 'symbol',
    label: 'One symbol (special character)',
    test: (password) => PASSWORD_SYMBOL_REGEX.test(password),
  },
] as const;

export interface PasswordRequirementStatus extends PasswordRequirementRule {
  isMet: boolean;
}

export function getPasswordRequirementStatuses(password: string): PasswordRequirementStatus[] {
  return PASSWORD_REQUIREMENT_RULES.map((rule) => ({
    ...rule,
    isMet: rule.test(password),
  }));
}

export function isPasswordRequirementsMet(password: string): boolean {
  return getPasswordRequirementStatuses(password).every((rule) => rule.isMet);
}
