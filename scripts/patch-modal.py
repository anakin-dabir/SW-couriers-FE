#!/usr/bin/env python3
from pathlib import Path

p = Path(__file__).resolve().parents[1] / "src" / "pages" / "BillingPage.tsx"
t = p.read_text(encoding="utf-8")

marker_start = "{currentSection === 'statements' && statementPreviewOpen ? ("
marker_end = ") : null}"

start = t.index(marker_start)
# find the matching end for statement modal - it's before payment-details drawer
end = t.index(marker_end, start) + len(marker_end)

replacement = """{currentSection === 'statements' ? (
        <AccountStatementDetailOverlay
          open={statementPreviewOpen}
          detail={activeStatementDetail}
          isLoading={selectedStatementDetailLoading}
          isDownloading={
            statementPdfUrlLoading || pdfPollingStatementId === selectedStatementId
          }
          onClose={() => {
            setStatementPreviewOpen(false);
            setSelectedStatementId(null);
          }}
          onDownload={() => {
            if (selectedStatementId) {
              handleDownloadStatementPdf(
                selectedStatementId,
                activeStatementDetail?.pdf_status ?? null
              );
            }
          }}
        />
      ) : null}"""

t = t[:start] + replacement + t[end:]

# Remove stray generate button on invoices tab
stray = """          <motion className="flex items-center justify-end gap-2">
            <Button>+ Generate Statement</Button>
          </motion>"""
stray2 = """          <div className="flex items-center justify-end gap-2">
            <Button>+ Generate Statement</Button>
          </div>"""
if stray2 in t:
    t = t.replace(stray2, "", 1)
elif stray.replace("motion", "motion") in t:
    pass

stray3 = """          <div className="flex items-center justify-end gap-2">
            <Button>+ Generate Statement</Button>
          </div>"""
if stray3 in t:
    t = t.replace(stray3, "", 1)

p.write_text(t, encoding="utf-8")
print("ok")
