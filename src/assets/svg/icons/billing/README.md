# Billing KPI icons

Extracted from Figma zip exports in `src/assets/svg/icons/`.

| Zip file                                         | SVG file                     | Billing page usage               |
| ------------------------------------------------ | ---------------------------- | -------------------------------- |
| `invoice_page_total_invoices.zip`                | `invoice-total-invoices.svg` | Invoices → Total Invoices        |
| `invoice page --total paid icon.zip`             | `invoice-total-paid.svg`     | Invoices → Total Paid            |
| `invoice page --total unpaid icon.zip`           | `invoice-total-unpaid.svg`   | Invoices → Total Unpaid          |
| `invoice page--overdue icon.zip`                 | `invoice-overdue.svg`        | Invoices → Overdue               |
| `payment history page ---total payment icon.zip` | `payment-total-payments.svg` | Payment Details → Total Payments |
| `payment history page -allocated icon.zip`       | `payment-allocated.svg`      | Payment Details → Allocated      |
| `payment history --unallocated icon.zip`         | `payment-unallocated.svg`    | Payment Details → Unallocated    |
| `payment history --pending icon.zip`             | `payment-pending.svg`        | Payment Details → Pending        |
| `refund page---refund amount icon.zip`           | `refund-total-amount.svg`    | Refunds → Total Refund Amount    |

SVG files live in this folder; they are imported only from `src/assets/svg/index.ts` (ESLint rule) and re-exported as `Billing*Icon` via `@/assets/svg`. Other refund KPI cards still use Lucide until matching assets are added.
