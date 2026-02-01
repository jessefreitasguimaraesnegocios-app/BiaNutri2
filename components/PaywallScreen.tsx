import React, { useState } from 'react';
import { Sparkles, Check, Loader2, Shield, Zap } from 'lucide-react';
import { PLANS, PLANS_ORDER, type PlanId } from '../constants/plans';
import { createCheckout } from '../services/subscriptionService';

interface PaywallScreenProps {
  userId: string;
  theme: 'light' | 'dark';
  lang: 'pt' | 'en';
  onSuccess?: () => void;
}

const paywallTexts = {
  pt: {
    title: 'Desbloqueie tudo',
    subtitle: 'Seu período de teste acabou. Escolha um plano e continue cuidando da sua nutrição.',
    perMonth: '/mês',
    total: 'total',
    bestValue: 'Melhor custo-benefício',
    popular: 'Mais popular',
    cta: 'Assinar',
    benefits: [
      'Análise de refeições com IA',
      'Histórico ilimitado',
      'Meta de calorias personalizada',
      'Acompanhamento de peso e água',
    ],
    secure: 'Pagamento seguro',
    error: 'Erro ao abrir checkout. Tente novamente.',
  },
  en: {
    title: 'Unlock everything',
    subtitle: 'Your trial has ended. Choose a plan and keep managing your nutrition.',
    perMonth: '/mo',
    total: 'total',
    bestValue: 'Best value',
    popular: 'Most popular',
    cta: 'Subscribe',
    benefits: [
      'AI meal analysis',
      'Unlimited history',
      'Personalized calorie goal',
      'Weight and water tracking',
    ],
    secure: 'Secure payment',
    error: 'Error opening checkout. Please try again.',
  },
};

const PaywallScreen: React.FC<PaywallScreenProps> = ({
  userId,
  theme,
  lang,
  onSuccess,
}) => {
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const t = paywallTexts[lang];

  const handleSelectPlan = async (planId: PlanId) => {
    setError(null);
    setLoadingPlan(planId);
    const origin = window.location.origin + window.location.pathname;
    const successUrl = `${origin}?payment=success`;
    const failureUrl = `${origin}?payment=failure`;
    try {
      const { init_point, error: err } = await createCheckout(
        userId,
        planId,
        successUrl,
        failureUrl
      );
      if (err) {
        setError(t.error);
        setLoadingPlan(null);
        return;
      }
      if (init_point) {
        window.location.href = init_point;
        return;
      }
      setError(t.error);
    } catch {
      setError(t.error);
    } finally {
      setLoadingPlan(null);
    }
  };

  const isDark = theme === 'dark';

  return (
    <div
      className={`min-h-screen ${
        isDark ? 'bg-slate-950' : 'bg-gradient-to-b from-slate-50 to-white'
      } flex flex-col items-center p-4 pb-12`}
    >
      <div className="w-full max-w-md flex flex-col gap-6">
        <div className="text-center pt-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-500/20 mb-4">
            <Sparkles className="text-brand-500" size={28} />
          </div>
          <h1
            className={`text-2xl sm:text-3xl font-bold ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            {t.title}
          </h1>
          <p
            className={`mt-2 text-sm ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            {t.subtitle}
          </p>
        </div>

        <ul className={`space-y-3 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          {t.benefits.map((item, i) => (
            <li key={i} className="flex items-center gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="text-green-500" size={14} />
              </span>
              <span className="text-sm font-medium">{item}</span>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-4">
          {PLANS_ORDER.map((planId) => {
            const plan = PLANS[planId];
            const featured = plan.featured === true;
            const isLoading = loadingPlan === planId;

            return (
              <div
                key={planId}
                className={`relative rounded-2xl border-2 overflow-hidden transition-all ${
                  featured
                    ? 'border-brand-500 bg-brand-500/10 shadow-lg shadow-brand-500/20'
                    : isDark
                    ? 'border-slate-700 bg-slate-800/50'
                    : 'border-slate-200 bg-white'
                }`}
              >
                {featured && (
                  <div className="absolute top-0 right-0 px-3 py-1 rounded-bl-xl bg-brand-500 text-white text-xs font-bold">
                    {t.bestValue}
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <span
                      className={`font-bold ${
                        featured ? 'text-brand-700 dark:text-brand-300' : isDark ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {plan.labelShort}
                    </span>
                    <div className="text-right">
                      {plan.durationMonths > 1 && (
                        <span
                          className={`text-xs ${
                            isDark ? 'text-slate-400' : 'text-slate-500'
                          }`}
                        >
                          R$ {plan.pricePerMonth.toFixed(2).replace('.', ',')}
                          {t.perMonth}
                        </span>
                      )}
                      <span
                        className={`block font-bold text-lg ${
                          featured ? 'text-brand-600 dark:text-brand-400' : isDark ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        R$ {plan.totalPrice.toFixed(2).replace('.', ',')}
                        {plan.durationMonths > 1 && (
                          <span className="text-xs font-normal opacity-80"> {t.total}</span>
                        )}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSelectPlan(planId)}
                    disabled={!!loadingPlan}
                    className={`w-full mt-4 py-3.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                      featured
                        ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-lg shadow-brand-500/30'
                        : isDark
                        ? 'bg-slate-700 hover:bg-slate-600 text-white'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    } disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        {lang === 'pt' ? 'Abrindo...' : 'Opening...'}
                      </>
                    ) : (
                      <>
                        <Zap size={18} />
                        {t.cta} – R$ {plan.totalPrice.toFixed(2).replace('.', ',')}
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {error && (
          <div
            className={`p-3 rounded-xl text-sm ${
              isDark ? 'bg-red-900/20 text-red-300' : 'bg-red-50 text-red-700'
            }`}
          >
            {error}
          </div>
        )}

        <div className="flex items-center justify-center gap-2 text-slate-500 text-xs">
          <Shield size={14} />
          <span>{t.secure}</span>
          <span className="font-semibold">Mercado Pago</span>
        </div>
      </div>
    </div>
  );
};

export default PaywallScreen;
