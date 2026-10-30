export type Currency = "RUB" | "USD";
export function validRate(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const rate = Number(value);
  return Number.isFinite(rate) && rate > 0 && rate <= 100000 ? rate : null;
}
export function formatPrice(priceUsd:number | null, currency:Currency, usdRub:number | null) {
  if (priceUsd === null || !Number.isFinite(priceUsd) || priceUsd < 0) return "Цена по запросу";
  if(currency === "RUB" && validRate(usdRub) === null) return "Цена по запросу";
  return new Intl.NumberFormat("ru-RU", {style:"currency",currency,maximumFractionDigits:2}).format(currency === "RUB" ? priceUsd * usdRub! : priceUsd);
}
