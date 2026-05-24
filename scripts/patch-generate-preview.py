#!/usr/bin/env python3
from pathlib import Path

p = Path(__file__).resolve().parents[1] / "src" / "pages" / "BillingPage.tsx"
t = p.read_text(encoding="utf-8")

if "AccountStatementGeneratePreview" not in t:
    t = t.replace(
        "import { AccountStatementDetailOverlay }",
        "import { AccountStatementGeneratePreview } from '@/components/pages/Billing/AccountStatementGeneratePreview';\nimport { AccountStatementDetailOverlay }",
    )

old = """              <div className="rounded-md border border-[#E4E4E7] bg-[#FAFAFC] p-3">
                <motion className="flex justify-between">
                  <Typography className="text-[34px] font-bold leading-none text-[#BE1E2D]">
                    SW
                  </Typography>
                  <div className="text-right text-xs text-[#71717A]">
                    <div>SW Couriers</div>
                    <div>55 Bridge End</div>
                    <div>Cardiff, CF10 2BN</div>
                  </div>
                </div>
                <div className="mt-6 text-right">
                  <Typography className="text-sm font-semibold text-[#18181B]">
                    Statement of Accounts
                  </Typography>
                  <Typography className="text-xs text-[#71717A]">
                    {statementFromDate && statementToDate
                      ? `${format(statementFromDate, 'dd/MM/yyyy')} To ${format(statementToDate, 'dd/MM/yyyy')}`
                      : 'No dates selected'}
                  </Typography>
                </div>
                <div className="mt-4 rounded-md border border-[#E4E4E7] bg-white p-8 text-center text-[#A1A1AA]">
                  <Typography className="text-sm font-medium text-[#52525B]">
                    No dates selected
                  </Typography>
                  <Typography className="text-xs">
                    Select a date range to view invoice details.
                  </Typography>
                </div>
                <div className="mt-3 text-right text-xs text-[#71717A]">
                  <div>Total Invoice Amount -</div>
                  <div>Total Paid -</div>
                  <div>Total Unpaid -</motion>
                  <div>Total Overdue -</motion>
                </motion>
              </motion>"""

old = old.replace("motion", "div")

new = """              <AccountStatementGeneratePreview
                fromDate={statementFromDate}
                toDate={statementToDate}
                hasPeriod={Boolean(statementGeneratePeriodArgs)}
                isLoading={statementPreviewFetching || statementSummaryFetching}
                preview={activeStatementPreview}
                summary={statementSummary ?? null}
              />"""

if old in t:
    t = t.replace(old, new)
    print("replaced generate preview")
else:
    print("generate preview block not found")

p.write_text(t, encoding="utf-8")
