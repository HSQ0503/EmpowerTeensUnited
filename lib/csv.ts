export function toCsv<T extends Record<string, unknown>>(
  rows: T[],
  headers: Array<keyof T & string>,
): string {
  const escape = (v: unknown) => {
    if (v == null) return "";
    const s = String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const headerLine = headers.join(",");
  const body = rows.map((r) => headers.map((h) => escape(r[h])).join(",")).join("\n");
  return rows.length === 0 ? headerLine + "\n" : headerLine + "\n" + body + "\n";
}
