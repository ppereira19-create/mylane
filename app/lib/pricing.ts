// app/lib/pricing.ts

export type TransferType = "ida" | "ida_volta";

export type ServiceType = "standard" | "business";

export type PricingInput = {
  distanceKm: number;
  durationMin: number;
  type: ServiceType;
  idaVolta: boolean;
  transferType: TransferType | string;
};

// IVA e Stripe
const IVA = 0.23;      // 23%
const STRIPE_PCT = 0.014; // 1.4%
const STRIPE_FIXO = 0.25; // €0,25

// ---------- helper genérico: aplica IVA + taxas Stripe em cima de um subtotal ----------
export function applyIvaAndStripe(precoSemTaxas: number): number {
  const comIva = precoSemTaxas * (1 + IVA);
  const stripeFee = comIva * STRIPE_PCT + STRIPE_FIXO;
  return comIva + stripeFee;
}

/**
 * Abaixo fica a versão antiga (opcional) que calcula um preço base "genérico"
 * e depois aplica IVA + Stripe. Se não estiveres a usar noutro lado,
 * até podes apagar isto mais tarde.
 */

function calcularPrecoBase({
  distanceKm,
  durationMin,
  type,
  idaVolta,
}: PricingInput): number {
  const baseKm =
    distanceKm < 10 ? 0.6 : distanceKm <= 25 ? 0.55 : 0.5;
  const baseMin = distanceKm < 10 ? 0.22 : 0.25;

  let preco = distanceKm * baseKm + durationMin * baseMin;

  if (type === "business") {
    preco *= 1.25;
  }

  if (idaVolta) {
    preco *= 1.8;
  }

  return preco;
}

// usado apenas pelo default export
function aplicarIvaEStripe(precoSemTaxas: number): number {
  return applyIvaAndStripe(precoSemTaxas);
}

// export default antigo (se estiveres a usar noutro sítio continua a funcionar)
export default function calculateTotalPrice(input: PricingInput): number {
  const base = calcularPrecoBase(input);
  const finalPrice = aplicarIvaEStripe(base);
  return Math.round(finalPrice * 100) / 100;
}