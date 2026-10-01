// Currency Utilities for Indian Rupees (₹)

/**
 * Format numeric amount into Indian Rupee string (e.g. ₹20,000 or ₹250.50)
 */
export function formatINR(
  amount: number | string | null | undefined,
  options?: {
    showSign?: boolean;
    decimals?: number;
    compact?: boolean;
  }
): string {
  const num = typeof amount === 'number' ? amount : Number(amount) || 0;
  const decimals = options?.decimals !== undefined ? options.decimals : num % 1 !== 0 ? 2 : 0;

  let formatted = Math.abs(num).toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  const sign = num < 0 ? '-' : options?.showSign && num > 0 ? '+' : '';

  return `${sign}₹${formatted}`;
}

/**
 * Parse a user input string into a clean float amount
 */
export function parseCurrencyInput(input: string): number {
  if (!input) return 0;
  // Remove currency symbol, commas, and whitespace
  const sanitized = input.replace(/[₹,\s]/g, '');
  const parsed = parseFloat(sanitized);
  return isNaN(parsed) ? 0 : Math.max(0, parsed);
}
