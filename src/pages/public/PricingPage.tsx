import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';
import {
  listActiveProductsWithPrices,
  createCheckoutSession,
  type StripePrice,
} from '@/services/stripe.service';

type Interval = 'month' | 'year';

export default function PricingPage() {
  const { user, activePlan, subscriptionLoading } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isAlreadyPremium = activePlan === 'premium';

  const [interval, setBillingInterval] = useState<Interval>('month');
  const [prices, setPrices] = useState<Record<Interval, StripePrice | null>>({
    month: null,
    year: null,
  });
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canceled = searchParams.get('checkout') === 'cancel';

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const products = await listActiveProductsWithPrices();
        const premium = products.find((p) => p.role === 'premium') ?? products[0];
        if (!premium) throw new Error(t('pricingPage.noPremiumActive'));
        const month = premium.prices.find((p) => p.interval === 'month') ?? null;
        const year = premium.prices.find((p) => p.interval === 'year') ?? null;
        if (!cancelled) setPrices({ month, year });
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : t('pricingPage.errorPrice'));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [t]);

  const handleSubscribe = async () => {
    if (!user) {
      navigate('/login?redirect=/pricing');
      return;
    }
    const price = prices[interval];
    if (!price) return;

    setCheckoutLoading(true);
    setError(null);
    try {
      const url = await createCheckoutSession(user.uid, price.id);
      window.location.assign(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('pricingPage.errorCheckout'));
      setCheckoutLoading(false);
    }
  };

  const priceLabel = (price: StripePrice | null): string =>
    price ? `${(price.unit_amount / 100).toFixed(0)}€` : '—';

  const monthlyTotalIfAnnual =
    prices.month && prices.year
      ? (prices.month.unit_amount * 12 - prices.year.unit_amount) / 100
      : null;

  return (
    <div className="bg-[#0B1120] text-white min-h-screen">
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('pricingPage.title')}</h1>
            <p className="text-[#8892B0] text-lg max-w-2xl mx-auto">
              {t('pricingPage.subtitle1')}
              <strong className="text-white">{t('pricingPage.subtitleBold')}</strong>
              {t('pricingPage.subtitle2')}
            </p>
          </div>

          {/* Cancel banner */}
          {canceled && (
            <div className="max-w-2xl mx-auto mb-8 p-4 rounded-lg bg-[#FFC107]/10 border border-[#FFC107]/30 text-[#FFC107] text-sm text-center">
              {t('pricingPage.cancelBanner')}
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div className="max-w-2xl mx-auto mb-8 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm text-center">
              {error}
            </div>
          )}

          {/* Interval toggle */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex bg-[#0A192F] border border-white/10 rounded-full p-1">
              <button
                type="button"
                onClick={() => setBillingInterval('month')}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${
                  interval === 'month'
                    ? 'bg-[#0070F3] text-white'
                    : 'text-[#8892B0] hover:text-white'
                }`}
              >
                {t('pricingPage.monthly')}
              </button>
              <button
                type="button"
                onClick={() => setBillingInterval('year')}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors flex items-center gap-2 ${
                  interval === 'year'
                    ? 'bg-[#0070F3] text-white'
                    : 'text-[#8892B0] hover:text-white'
                }`}
              >
                {t('pricingPage.annual')}
                {monthlyTotalIfAnnual !== null && monthlyTotalIfAnnual > 0 && (
                  <span className="text-xs bg-[#FFC107] text-[#020C1B] px-2 py-0.5 rounded-full">
                    {t('pricingPage.save', { amount: monthlyTotalIfAnnual.toFixed(0) })}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Free */}
            <div className="bg-[#0A192F] rounded-2xl p-8 border border-white/10 flex flex-col">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">{t('pricingPage.free.title')}</h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-5xl font-extrabold text-white">0€</span>
                  <span className="text-[#8892B0]">{t('pricingPage.free.month')}</span>
                </div>
                <p className="text-[#8892B0] text-sm">{t('pricingPage.free.desc')}</p>
              </div>

              <ul className="space-y-3 mb-8 text-sm text-[#E2E8F0] flex-1">
                <FeatureRow included>{t('pricingPage.free.features.f1')}</FeatureRow>
                <FeatureRow included>{t('pricingPage.free.features.f2')}</FeatureRow>
                <FeatureRow included>{t('pricingPage.free.features.f3')}</FeatureRow>
                <FeatureRow>{t('pricingPage.free.features.f4')}</FeatureRow>
                <FeatureRow>{t('pricingPage.free.features.f5')}</FeatureRow>
                <FeatureRow>{t('pricingPage.free.features.f6')}</FeatureRow>
              </ul>

              <Link
                to="/register"
                className="block w-full py-3 px-4 text-center rounded-lg border border-white/20 text-white hover:bg-white/5 font-semibold transition-colors"
              >
                {t('pricingPage.free.cta')}
              </Link>
            </div>

            {/* Premium */}
            <div className="bg-gradient-to-b from-[#112240] to-[#0A192F] rounded-2xl p-8 border-2 border-[#0070F3] shadow-[0_0_30px_rgba(0,112,243,0.15)] relative flex flex-col">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0070F3] text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                {t('pricingPage.premium.badge')}
              </div>

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">{t('pricingPage.premium.title')}</h3>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-5xl font-extrabold text-[#0070F3]">
                    {loading ? '...' : priceLabel(prices[interval])}
                  </span>
                  <span className="text-[#8892B0]">
                    {interval === 'month' ? t('pricingPage.premium.month') : t('pricingPage.premium.year')}
                  </span>
                </div>
                <p className="text-sm text-[#FFC107] font-medium mb-2">
                  {t('pricingPage.premium.trial')}
                </p>
                <p className="text-[#8892B0] text-sm">
                  {t('pricingPage.premium.desc')}
                </p>
              </div>

              <ul className="space-y-3 mb-8 text-sm text-[#E2E8F0] flex-1">
                <FeatureRow included>{t('pricingPage.premium.features.f1')}</FeatureRow>
                <FeatureRow included>{t('pricingPage.premium.features.f2')}</FeatureRow>
                <FeatureRow included>{t('pricingPage.premium.features.f3')}</FeatureRow>
                <FeatureRow included>{t('pricingPage.premium.features.f4')}</FeatureRow>
                <FeatureRow included>{t('pricingPage.premium.features.f5')}</FeatureRow>
                <FeatureRow included>{t('pricingPage.premium.features.f6')}</FeatureRow>
              </ul>

              {isAlreadyPremium ? (
                <Link
                  to="/dashboard"
                  className="w-full py-3 px-4 text-center rounded-lg bg-[#10B981] hover:bg-[#0E9F6E] text-white font-semibold transition-colors shadow-lg block"
                >
                  {t('pricingPage.premium.active')}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={handleSubscribe}
                  disabled={loading || checkoutLoading || subscriptionLoading || !prices[interval]}
                  className="w-full py-3 px-4 rounded-lg bg-[#0070F3] hover:bg-[#0051B3] text-white font-semibold transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {checkoutLoading
                    ? t('pricingPage.premium.redirecting')
                    : subscriptionLoading
                      ? t('pricingPage.premium.loading')
                      : user
                        ? t('pricingPage.premium.ctaLoggedIn')
                        : t('pricingPage.premium.ctaLoggedOut')}
                </button>
              )}
              <p className="text-xs text-[#8892B0] text-center mt-3">
                {isAlreadyPremium
                  ? t('pricingPage.premium.manage')
                  : t('pricingPage.premium.cancelAnytime')}
              </p>
            </div>
          </div>

          {/* Trust row */}
          <div className="mt-12 text-center text-xs text-[#8892B0]">
            {t('pricingPage.trustText')}
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureRow({ children, included = false }: { children: React.ReactNode; included?: boolean }) {
  return (
    <li className={`flex items-center gap-3 ${included ? '' : 'opacity-40'}`}>
      {included ? (
        <svg className="w-5 h-5 text-[#0070F3] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      <span className={included ? '' : 'line-through'}>{children}</span>
    </li>
  );
}
