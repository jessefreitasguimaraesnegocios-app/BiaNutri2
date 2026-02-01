// Planos e preços para assinatura (Mercado Pago)

export type PlanId = 'monthly' | 'quarterly' | 'yearly';

export interface PlanOption {
  id: PlanId;
  /** R$ por mês (exibição) */
  pricePerMonth: number;
  /** Valor total cobrado (R$) - uma única cobrança */
  totalPrice: number;
  /** Duração em meses */
  durationMonths: number;
  /** Label curto: "1 mês", "3 meses", "1 ano" */
  labelShort: string;
  /** Destaque (melhor oferta) */
  featured?: boolean;
}

export const PLANS: Record<PlanId, PlanOption> = {
  monthly: {
    id: 'monthly',
    pricePerMonth: 39.9,
    totalPrice: 39.9,
    durationMonths: 1,
    labelShort: '1 mês',
  },
  quarterly: {
    id: 'quarterly',
    pricePerMonth: 29.9,
    totalPrice: 89.7,
    durationMonths: 3,
    labelShort: '3 meses',
  },
  yearly: {
    id: 'yearly',
    pricePerMonth: 17.9,
    totalPrice: 214.8,
    durationMonths: 12,
    labelShort: '1 ano',
    featured: true,
  },
};

/** Ordem de exibição na paywall: trimestral, anual (destaque), mensal */
export const PLANS_ORDER: PlanId[] = ['monthly', 'quarterly', 'yearly'];

/** Segundos de trial (30 min) */
export const TRIAL_SECONDS_LIMIT = 30 * 60;
