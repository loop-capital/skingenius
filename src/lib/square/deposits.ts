export const DEFAULT_DEPOSIT_RATE = 0.2;
export const DEFAULT_MIN_DEPOSIT_USD = 20;
export const DEFAULT_PLATFORM_FEE_RATE = 0.15;

export function calculateDepositAmount(servicePrice: number): number {
  const rate = parseRateEnv(process.env.DEPOSIT_RATE, DEFAULT_DEPOSIT_RATE);
  const minDeposit = parseCurrencyEnv(process.env.MIN_DEPOSIT_USD, DEFAULT_MIN_DEPOSIT_USD);
  const deposit = servicePrice * rate;
  return Math.max(roundCurrency(deposit), minDeposit);
}

export function calculatePlatformFee(servicePrice: number): number {
  const rate = parseRateEnv(process.env.PLATFORM_FEE_RATE, DEFAULT_PLATFORM_FEE_RATE);
  return roundCurrency(servicePrice * rate);
}

export function calculatePayoutAmount(
  depositAmount: number,
  platformFee: number
): number {
  return roundCurrency(depositAmount - platformFee);
}

export function dollarsToCents(dollars: number): bigint {
  return BigInt(Math.round(dollars * 100));
}

export function centsToDollars(cents: bigint | number): number {
  return typeof cents === "bigint" ? Number(cents) / 100 : cents / 100;
}

function parseRateEnv(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed < 0 || parsed > 1) return fallback;
  return parsed;
}

function parseCurrencyEnv(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed < 0) return fallback;
  return parsed;
}

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}
