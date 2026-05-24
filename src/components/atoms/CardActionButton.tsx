import * as React from 'react';
import { Button } from '@/components/atoms/Button';
import { cn } from '@/lib/utils';

interface CardActionButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  rightIcon?: React.ReactNode;
}

export default function CardActionButton({
  children,
  onClick,
  disabled,
  className,
  rightIcon,
}: CardActionButtonProps): React.JSX.Element {
  return (
    <Button
      variant="secondary"
      className={cn('w-full', className)}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
      {rightIcon && <span className="ml-2">{rightIcon}</span>}
    </Button>
  );
}
