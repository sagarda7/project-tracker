function escapeCsvValue(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function toCsv(columns: string[], rows: Record<string, string>[]): string {
  const header = columns.map(escapeCsvValue).join(",");
  const lines = rows.map((row) => columns.map((col) => escapeCsvValue(row[col] ?? "")).join(","));
  return [header, ...lines].join("\n");
}
