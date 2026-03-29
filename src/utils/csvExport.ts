export function exportToCSV<T extends object>(data: T[], filename: string) {
  if (!data || !data.length) return;
  
  const headers = Object.keys(data[0]);
  
  const csvRows = [
    headers.join(','), // header row
    ...data.map(row => headers.map(fieldName => {
        let val = (row as any)[fieldName];
        if (val === null || val === undefined) val = '';
        if (typeof val === 'object') val = JSON.stringify(val);
        // escape string quotes to prevent CSV breakages
        return `"${String(val).replace(/"/g, '""')}"`;
    }).join(','))
  ];
  
  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${filename}.csv`);
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
