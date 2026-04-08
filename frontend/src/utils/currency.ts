/**
 * Format a monetary amount using the account's currency.
 * Falls back to plain number formatting if currencyCode is unavailable.
 */
export function formatCurrency(
  amount: number | undefined | null,
  currencyCode?: string,
  currencySymbol?: string
): string {
  const safe = typeof amount === "number" && !isNaN(amount) ? amount : 0;
  if (currencyCode) {
    try {
      return safe.toLocaleString("en-US", {
        style: "currency",
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    } catch {
      // fallback if currency code is invalid
    }
  }
  if (currencySymbol) {
    return `${currencySymbol}${safe.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return safe.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Compact format for chart axes: "$1.2k", "€500"
 */
export function formatCompact(
  value: number,
  currencySymbol: string = "$"
): string {
  if (Math.abs(value) >= 1000) {
    return `${currencySymbol}${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`;
  }
  return `${currencySymbol}${value}`;
}

/**
 * Format without decimals (for display in cards, summaries)
 */
export function formatCurrencyShort(
  amount: number | undefined | null,
  currencyCode?: string,
  currencySymbol?: string
): string {
  const safe = typeof amount === "number" && !isNaN(amount) ? amount : 0;
  if (currencyCode) {
    try {
      return safe.toLocaleString("en-US", {
        style: "currency",
        currency: currencyCode,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
    } catch {
      // fallback
    }
  }
  if (currencySymbol) {
    return `${currencySymbol}${safe.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }
  return safe.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}
