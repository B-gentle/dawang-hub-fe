export function formatBytes(bytes?: number | null): string {
  const value = Number(bytes || 0);
  if (value <= 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  const exponent = Math.min(
    Math.floor(Math.log(value) / Math.log(1024)),
    units.length - 1,
  );
  const scaled = value / Math.pow(1024, exponent);

  return `${scaled >= 10 || exponent === 0 ? scaled.toFixed(1) : scaled.toFixed(2)} ${units[exponent]}`;
}
