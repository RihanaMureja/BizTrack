/**
 * Export utility helpers — CSV download and print.
 */

/**
 * Download an array of objects as a CSV file.
 * @param {object[]} data      - Array of plain objects
 * @param {string[]} columns   - Keys to include (defines column order)
 * @param {string}   filename  - Output filename without extension
 */
export function downloadCSV(data, columns, filename = 'export') {
  if (!data.length) return;

  const header = columns.join(',');
  const rows = data.map(row =>
    columns.map(col => {
      const val = String(row[col] ?? '');
      return val.includes(',') || val.includes('"') || val.includes('\n')
        ? `"${val.replace(/"/g, '""')}"`
        : val;
    }).join(',')
  );

  const csv  = [header, ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }); // BOM for Excel
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Trigger browser print dialog.
 * For print-specific styling, use src/styles/print.css with @media print.
 */
export function printPage() {
  window.print();
}

/**
 * Format a data object as a simple printable HTML string (for receipt etc.).
 */
export function buildReceiptHTML(receipt) {
  return `
    <html><head><title>Receipt</title>
    <style>body{font-family:monospace;max-width:300px;margin:auto;padding:16px}
    h2{text-align:center}table{width:100%}td{padding:2px 0}
    .total{font-weight:bold;border-top:1px dashed #000;margin-top:8px;padding-top:8px}</style>
    </head><body>
    <h2>BizTrack Receipt</h2>
    <p>Receipt #: ${receipt.id}</p>
    <p>Date: ${receipt.date}</p>
    <p>Customer: ${receipt.customer}</p>
    <hr/>
    <table>
      ${(receipt.items || []).map(i => `<tr><td>${i.name}</td><td style="text-align:right">ETB ${i.total.toLocaleString()}</td></tr>`).join('')}
    </table>
    <div class="total">
      <table>
        <tr><td>Total</td><td style="text-align:right">ETB ${receipt.total?.toLocaleString()}</td></tr>
        <tr><td>Payment</td><td style="text-align:right">${receipt.paymentMethod}</td></tr>
      </table>
    </div>
    <p style="text-align:center;margin-top:16px">Thank you for your business!</p>
    </body></html>
  `;
}
