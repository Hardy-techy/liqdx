export const formatInputAmount = (value: number) => {
  if (!Number.isFinite(value) || value <= 0) return "0";
  return value.toLocaleString("en-US", { useGrouping: false, maximumFractionDigits: 6 });
};

export const formatDisplayAmount = (value: number, maxFractionDigits = 6) => {
  if (!Number.isFinite(value) || value <= 0) return "0";
  return value.toLocaleString("en-US", { useGrouping: true, maximumFractionDigits: maxFractionDigits });
};

export const isSafeDecimalInput = (value: string) => {
  if (value === "") return true;
  if (/e/i.test(value)) return false;
  if (!/^\d*\.?\d*$/.test(value)) return false;
  const fractional = value.split(".")[1];
  return !fractional || fractional.length <= 18;
};
