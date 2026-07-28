/**
 * Provides helpers to export table data as CSV or trigger print.
 * Usage:
 *   const { exportCSV, exportPrint } = useExport();
 *   exportCSV(rows, columns, 'revenue-report');
 */
export function useExport() {
  /**
   * @param {object[]} rows     - Array of data objects
   * @param {string[]} columns  - Keys to include (in order)
   * @param {string}   filename - Output filename (without .csv)
   */
  const exportCSV = (rows, columns, filename = 'export') => {
    const header = columns.join(',');
    const body = rows.map(row =>
      columns.map(col => {
        const val = row[col] ?? '';
        // Wrap in quotes if value contains comma or quote
        return typeof val === 'string' && (val.includes(',') || val.includes('"'))
          ? `"${val.replace(/"/g, '""')}"`
          : val;
      }).join(',')
    ).join('\n');

    const blob = new Blob([`${header}\n${body}`], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href     = url;
    link.download = `${filename}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportPrint = () => window.print();

  return { exportCSV, exportPrint };
}

export default useExport;
