#!/usr/bin/env python3
from pathlib import Path

path = Path(__file__).resolve().parents[1] / "src" / "pages" / "BillingPage.tsx"
t = path.read_text(encoding="utf-8")

old_has = "    const hasStatements = filteredStatementRows.length > 0;"
new_has = """    const isTrulyEmptyStatementsState =
      !statementsFetching &&
      !statementsError &&
      (statementsRes?.total ?? 0) === 0 &&
      debouncedStatementSearch.length === 0 &&
      statementListDatePreset === 'all' &&
      !statementPeriodDateRange?.from;
    const showStatementsTable =
      !isTrulyEmptyStatementsState ||
      debouncedStatementSearch.length > 0 ||
      statementListDatePreset !== 'all' ||
      Boolean(statementPeriodDateRange?.from);
    const hasStatements = showStatementsTable;"""
if old_has in t:
    t = t.replace(old_has, new_has)

t = t.replace("statementDateRange", "statementPeriodDateRange")
t = t.replace("setStatementDateRange", "setStatementPeriodDateRange")
t = t.replace("pagedStatementRows", "statementTableRows")
t = t.replace(
    "entries out of {filteredStatementRows.length}",
    "entries out of {statementsRes?.total ?? 0}",
)

old_btn = """          <Button variant="outline" className="h-10 min-w-[130px] justify-between border-[#E4E4E7]">
            Last 30 Days
            <ChevronDown className="size-4 text-[#A1A1AA]" />
          </Button>"""
new_btn = """          <Popover open={statementListDatePresetOpen} onOpenChange={setStatementListDatePresetOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(BILLING_TOOLBAR_TRIGGER_CLASS, 'min-w-[130px]')}
              >
                {statementListDatePresetLabel}
                <ChevronDown className="size-4 text-[#A1A1AA]" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-2" align="end">
              {STATEMENT_LIST_DATE_QUICK_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={cn(
                    'flex w-full rounded-md px-2 py-2 text-left text-sm text-[#52525B] hover:bg-[#FAFAFA]',
                    statementListDatePreset === opt.id && 'bg-[#FAFAFA] font-medium'
                  )}
                  onClick={() => handleStatementListDatePreset(opt.id)}
                >
                  {opt.label}
                </button>
              ))}
            </PopoverContent>
          </Popover>"""
if old_btn in t:
    t = t.replace(old_btn, new_btn)

old_toolbar_btn = """              <Button
                variant="outline"
                className={cn(BILLING_TOOLBAR_TRIGGER_CLASS, 'min-w-[120px]')}
              >
                Last 7 days
                <ChevronDown className="size-4 text-[#A1A1AA]" />
              </Button>"""
new_toolbar_btn = """              <Popover open={statementListDatePresetOpen} onOpenChange={setStatementListDatePresetOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(BILLING_TOOLBAR_TRIGGER_CLASS, 'min-w-[120px]')}
                  >
                    {statementListDatePresetLabel}
                    <ChevronDown className="size-4 text-[#A1A1AA]" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-2" align="start">
                  {STATEMENT_LIST_DATE_QUICK_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      className={cn(
                        'flex w-full rounded-md px-2 py-2 text-left text-sm text-[#52525B] hover:bg-[#FAFAFA]',
                        statementListDatePreset === opt.id && 'bg-[#FAFAFA] font-medium'
                      )}
                      onClick={() => handleStatementListDatePreset(opt.id)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </PopoverContent>
              </Popover>"""
if old_toolbar_btn in t:
    t = t.replace(old_toolbar_btn, new_toolbar_btn)

old_row = """                    {statementTableRows.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-medium text-[#52525B] underline">
                          {row.statementId}
                        </TableCell>
                        <TableCell>{row.period}</TableCell>
                        <TableCell>{formatApiDate(row.generatedOn)}</TableCell>
                        <TableCell>{formatCurrencyAmount(row.openingBalance)}</TableCell>
                        <TableCell>{formatCurrencyAmount(row.closingBalance)}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                            <Download className="size-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}"""

new_row = """                    {statementsFetching && statementTableRows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="py-10 text-center text-sm text-[#71717A]">
                          Loading account statements…
                        </TableCell>
                      </TableRow>
                    ) : statementsError ? (
                      <TableRow>
                        <TableCell colSpan={6} className="py-10 text-center">
                          <div className="space-y-3">
                            <Typography className="text-sm text-[#71717A]">
                              Could not load account statements.
                            </Typography>
                            <Button variant="outline" size="sm" onClick={() => void refetchStatements()}>
                              Retry
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : statementTableRows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="py-10 text-center text-sm text-[#71717A]">
                          No statements found for the current filters.
                        </TableCell>
                      </TableRow>
                    ) : (
                      statementTableRows.map((row) => {
                        const listItem = statementsRes?.items.find((item) => item.id === row.id);
                        return (
                          <TableRow key={row.id} className="h-14">
                            <TableCell>
                              <button
                                type="button"
                                className="font-medium text-[#52525B] underline"
                                onClick={() => handleOpenStatementDetail(row.id)}
                              >
                                {row.statementId}
                              </button>
                            </TableCell>
                            <TableCell>{row.period}</TableCell>
                            <TableCell>{formatApiDate(row.generatedOn)}</TableCell>
                            <TableCell>{formatCurrencyAmount(row.openingBalance)}</TableCell>
                            <TableCell>{formatCurrencyAmount(row.closingBalance)}</TableCell>
                            <TableCell>
                              <button
                                type="button"
                                className="inline-flex items-center text-[#71717A]"
                                onClick={() =>
                                  handleDownloadStatementPdf(row.id, listItem?.pdf_status ?? null)
                                }
                                disabled={statementPdfUrlLoading && pdfPollingStatementId === row.id}
                              >
                                {pdfPollingStatementId === row.id ? (
                                  <Loader2 className="size-4 animate-spin" aria-hidden />
                                ) : (
                                  <ArrowUpRight className="size-4" />
                                )}
                              </button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}"""

if old_row in t:
    t = t.replace(old_row, new_row)

old_empty = """                <Typography className="text-[34px] font-semibold leading-tight text-[#18181B]">
                  No Payment History
                </Typography>"""
new_empty = """                <Typography className="text-[34px] font-semibold leading-tight text-[#18181B]">
                  No Account Statements
                </Typography>
                <Typography className="mt-2 text-sm text-[#71717A]">
                  Generate your first account statement to view period balances and activity.
                </Typography>"""
if old_empty in t:
    t = t.replace(old_empty, new_empty, 1)

path.write_text(t, encoding="utf-8")
print("patched")
