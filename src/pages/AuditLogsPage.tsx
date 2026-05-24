'use client';

import * as React from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '@/components/atoms';
import { Tabs, TabsList, TabsTrigger } from '@/components/atoms/tabs';
import {
  AccountActionsAuditTab,
  DataAccessAuditTab,
  SecurityAuditTab,
  TransactionsAuditTab,
} from '@/components/pages/AuditLogs';
import { AUDIT_TAB_ITEMS, type AuditTabKey } from '@/components/pages/AuditLogs/shared';

export default function AuditLogsPage(): React.JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');

  const activeTab: AuditTabKey =
    tabFromUrl === 'overview' ||
    tabFromUrl === 'activity-log' ||
    tabFromUrl === 'data-access-log' ||
    tabFromUrl === 'change-history'
      ? tabFromUrl
      : 'overview';

  const handleTabChange = (nextTab: string): void => {
    if (
      nextTab !== 'overview' &&
      nextTab !== 'activity-log' &&
      nextTab !== 'data-access-log' &&
      nextTab !== 'change-history'
    ) {
      return;
    }
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('tab', nextTab);
    setSearchParams(nextParams, { replace: true });
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Audit Logs"
        subtitle="Track system actions, data access, and critical events in real time."
      />

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="h-12 w-full justify-start border bg-gray-100 p-0">
          {AUDIT_TAB_ITEMS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="h-8 rounded-md border border-transparent px-4 text-xs font-semibold text-muted-foreground data-[state=active]:border-border data-[state=active]:bg-background data-[state=active]:text-foreground"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {activeTab === 'overview' && <SecurityAuditTab />}
      {activeTab === 'activity-log' && <TransactionsAuditTab />}
      {activeTab === 'data-access-log' && <DataAccessAuditTab />}
      {activeTab === 'change-history' && <AccountActionsAuditTab />}
    </div>
  );
}
