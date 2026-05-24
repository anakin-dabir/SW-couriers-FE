import { Link } from 'react-router-dom';
import type React from 'react';
import Typography from './Typography';

interface LogoProps {
  to?: string;
  className?: string;
}

function Logo({ to = '/', className = '' }: LogoProps): React.JSX.Element {
  const LOGO_CONTENT = (
    <div className={className}>
      <Typography variant="h2" weight="bold" className="text-primary-500 no-underline">
        SW Couriers
      </Typography>
    </div>
  );

  if (to) {
    return <Link to={to}>{LOGO_CONTENT}</Link>;
  }

  return LOGO_CONTENT;
}

export default Logo;
