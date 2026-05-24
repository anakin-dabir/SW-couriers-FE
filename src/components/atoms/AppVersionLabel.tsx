import * as React from 'react';
import Typography from '@/components/atoms/Typography';
import { appVersion } from '@/config/env';
import { cn } from '@/lib/utils';

interface AppVersionLabelProps {
  isCollapsed?: boolean;
  className?: string;
}

/** Hide bare git SHAs baked in when no release tag was available at build time. */
function isCommitOnlyVersion(value: string): boolean {
  return /^[0-9a-f]{7,40}$/i.test(value);
}

/**
 * Shows the release version baked in at build (Git tag or VITE_APP_VERSION).
 */
export default function AppVersionLabel({
  isCollapsed = false,
  className,
}: AppVersionLabelProps): React.JSX.Element | null {
  if (
    !appVersion ||
    appVersion === 'dev' ||
    appVersion === '0.0.0' ||
    isCommitOnlyVersion(appVersion)
  ) {
    return null;
  }

  if (isCollapsed) {
    return (
      <Typography
        component="span"
        className={cn('text-[10px] font-medium text-[#A1A1AA]', className)}
        title={`Version ${appVersion}`}
      >
        {appVersion.startsWith('v') ? appVersion.slice(0, 4) : appVersion.slice(0, 3)}
      </Typography>
    );
  }

  return (
    <Typography
      component="span"
      className={cn('text-[11px] font-medium text-[#A1A1AA]', className)}
    >
      Version {appVersion}
    </Typography>
  );
}
