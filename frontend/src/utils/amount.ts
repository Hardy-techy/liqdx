export const formatInputAmount = (value: number) => {
  if (!Number.isFinite(value) || value <= 0) return "0";
  return value.toLocaleString("en-US", { useGrouping: false, maximumFractionDigits: 6 });
};

export const formatDisplayAmount = (value: number, maxFractionDigits = 6) => {
  if (!Number.isFinite(value) || value <= 0) return "0";
  return value.toLocaleString("en-US", { useGrouping: true, maximumFractionDigits: maxFractionDigits });
};

export const formatInputAmountFromWei = (value: bigint, displayDecimals = 6) => {
  if (value <= 0n) return "0";

  const base = 10n ** 18n;
  const whole = value / base;
  const fraction = value % base;
  if (displayDecimals <= 0) return whole.toString();

  const fracStr = fraction.toString().padStart(18, "0").slice(0, displayDecimals).replace(/0+$/, "");
  return fracStr ? `${whole.toString()}.${fracStr}` : whole.toString();
};

export const isSafeDecimalInput = (value: string) => {
  if (value === "") return true;
  if (/e/i.test(value)) return false;
  if (!/^\d*\.?\d*$/.test(value)) return false;
  const fractional = value.split(".")[1];
  return !fractional || fractional.length <= 18;
};
