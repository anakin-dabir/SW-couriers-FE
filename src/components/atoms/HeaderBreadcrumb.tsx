import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/molecules/Breadcrumb';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/lib/utils';

interface HeaderBreadcrumbProps {
  /** Array of breadcrumb items */
  items: BreadcrumbItemType[];
  /** Additional className */
  className?: string;
}

/**
 * Atomic component for header breadcrumb navigation
 * Uses shadCN breadcrumb component with proper font styles matching Figma design
 */
export default function HeaderBreadcrumb({
  items,
  className,
}: HeaderBreadcrumbProps): React.JSX.Element {
  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <React.Fragment key={index}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="text-sm font-normal leading-normal text-zinc-900">
                    {item.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    asChild
                    className="text-sm font-normal leading-normal text-zinc-500 hover:text-zinc-500"
                  >
                    <Link to={item.to || '#'}>{item.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
