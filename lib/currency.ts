export function formatAmountFromMinorUnits(amountMinorUnits: number, currency = "NGN") {
  if (!Number.isFinite(amountMinorUnits)) {
    return undefined;
  }

  const unitAmount = amountMinorUnits / 100;
  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(unitAmount);
  } catch (error) {
    return `${currency} ${unitAmount.toFixed(2)}`;
  }
}


