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
      const returnUrl = searchParams.get('returnUrl');
      const successUrl = returnUrl 
        ? `${window.location.origin}/dashboard/checkout/success?session_id={CHECKOUT_SESSION_ID}&returnUrl=${encodeURIComponent(returnUrl)}`
        : `${window.location.origin}/dashboard/checkout/success?session_id={CHECKOUT_SESSION_ID}`;

      const url = await createCheckoutSession(user.uid, price.id, { successUrl });
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
    <div className="relative min-h-screen text-gray-100 overflow-hidden bg-[#0B1120]">
      {/* Video Background amb Overlay fosc per no perdre llegibilitat */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-40 object-center"
        >
          <source src="https://firebasestorage.googleapis.com/v0/b/globalplay360-3f9a1.firebasestorage.app/o/globalHome.mp4?alt=media&token=239272b5-8d5d-4e1b-a347-05fe2bb94710" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B1120]/40 via-[#0B1120]/70 to-[#0B1120]"></div>
      </div>

      <section className="relative z-10 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-14">
            <h1 className="text-3xl md:text-4xl font-medium text-gray-100/90 tracking-normal mb-4">{t('pricingPage.title')}</h1>
            <p className="text-base md:text-lg text-[#9CA3AF] max-w-xl mx-auto leading-relaxed">
              {t('pricingPage.subtitle1')}
              <strong className="text-gray-100 font-medium mx-1">{t('pricingPage.subtitleBold')}</strong>
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
          <div className="flex justify-center mb-16 relative mt-4">
            <div className="inline-flex bg-[#111827] border border-[#1F2937] rounded-full p-1.5 shadow-inner relative">
              <button
                type="button"
                onClick={() => setBillingInterval('month')}
                className={`relative z-10 px-8 py-2.5 rounded-full text-sm font-medium transition-all duration-300 w-32 sm:w-36 ${
                  interval === 'month'
                    ? 'bg-[#3B82F6] text-gray-100 shadow-md'
                    : 'text-[#9CA3AF] hover:text-gray-100'
                }`}
              >
                {t('pricingPage.monthly')}
              </button>
              <button
                type="button"
                onClick={() => setBillingInterval('year')}
                className={`relative z-10 px-8 py-2.5 rounded-full text-sm font-medium transition-all duration-300 w-32 sm:w-36 ${
                  interval === 'year'
                    ? 'bg-[#3B82F6] text-gray-100 shadow-md'
                    : 'text-[#9CA3AF] hover:text-gray-100'
                }`}
              >
                {t('pricingPage.annual')}
              </button>
            </div>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Free */}
            <div className="bg-[#111827] rounded-2xl p-8 border border-[#1F2937] flex flex-col hover:-translate-y-0.5 transition-transform duration-base ease-out shadow-sm">
              <div className="mb-6">
                <h3 className="text-2xl font-semibold text-gray-100/90 mb-2 tracking-normal">{t('pricingPage.free.title')}</h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-5xl font-medium text-gray-100 tracking-tight">0€</span>
                  <span className="text-[#9CA3AF] font-medium tracking-wide uppercase text-sm">{t('pricingPage.free.month')}</span>
                </div>
                <p className="text-[#9CA3AF] text-sm leading-relaxed">{t('pricingPage.free.desc')}</p>
              </div>

              <ul className="space-y-4 mb-8 text-sm text-[#E2E8F0] flex-1">
                <FeatureRow included>{t('pricingPage.free.features.f1')}</FeatureRow>
                <FeatureRow included>{t('pricingPage.free.features.f2')}</FeatureRow>
                <FeatureRow included>{t('pricingPage.free.features.f3')}</FeatureRow>
                <FeatureRow>{t('pricingPage.free.features.f4')}</FeatureRow>
                <FeatureRow>{t('pricingPage.free.features.f5')}</FeatureRow>
                <FeatureRow>{t('pricingPage.free.features.f6')}</FeatureRow>
              </ul>

              <Link
                to="/register"
                className="block w-full py-3.5 px-4 text-center rounded-xl border border-[#374151] text-gray-100 hover:bg-[#1F2937] font-semibold transition-all duration-fast ease-out active:scale-[0.98]"
              >
                {t('pricingPage.free.cta')}
              </Link>
            </div>

            {/* Premium */}
            <div className="bg-gradient-to-b from-[#111827] to-[#0B1120] rounded-2xl p-8 border border-[#3B82F6]/50 ring-1 ring-[#3B82F6]/20 relative flex flex-col shadow-lg shadow-[#3B82F6]/10">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-[#3B82F6] to-blue-600 text-gray-100 px-4 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest shadow-md">
                {t('pricingPage.premium.badge')}
              </div>

              <div className="mb-6">
                <h3 className="text-2xl font-semibold text-gray-100/90 mb-2 tracking-normal">{t('pricingPage.premium.title')}</h3>
                <div className="flex items-baseline gap-2 mb-3">
                  {interval === 'year' && prices.month && (
                    <span className="text-2xl sm:text-3xl font-medium text-[#6B7280] line-through decoration-2 decoration-[#6B7280] mr-1">
                      {((prices.month.unit_amount * 12) / 100).toFixed(0)}€
                    </span>
                  )}
                  <span className="text-5xl font-medium text-[#3B82F6] tracking-tight">
                    {loading ? '...' : priceLabel(prices[interval])}
                  </span>
                  <span className="text-[#9CA3AF] font-medium tracking-wide uppercase text-sm">
                    {interval === 'month' ? t('pricingPage.premium.month') : t('pricingPage.premium.year')}
                  </span>
                </div>
                
                {interval === 'year' && monthlyTotalIfAnnual !== null && monthlyTotalIfAnnual > 0 ? (
                  <div className="flex flex-col gap-1.5 mb-2">
                    <span className="inline-block w-fit bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20 text-xs font-semibold px-2.5 py-1 rounded-md mb-1">
                      {t('pricingPage.premium.saveToday', { amount: monthlyTotalIfAnnual.toFixed(0) })}
                    </span>
                    <p className="text-sm text-[#9CA3AF] font-medium tracking-wide">
                      {t('pricingPage.premium.trial')}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-[#9CA3AF] font-medium mb-3 tracking-wide">
                    {t('pricingPage.premium.trial')}
                  </p>
                )}
                
                <p className="text-[#9CA3AF] text-sm leading-relaxed mt-3">
                  {t('pricingPage.premium.desc')}
                </p>
              </div>

              <ul className="space-y-4 mb-8 text-sm text-[#E2E8F0] flex-1">
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
                  className="w-full py-3.5 px-4 text-center rounded-xl bg-[#3B82F6] hover:bg-blue-600 text-gray-100 font-semibold transition-all duration-fast ease-out active:scale-[0.98] shadow-lg shadow-[#3B82F6]/20 block"
                >
                  {t('pricingPage.premium.active')}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={handleSubscribe}
                  disabled={loading || checkoutLoading || subscriptionLoading || !prices[interval]}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#3B82F6] hover:bg-blue-600 text-gray-100 font-semibold transition-all duration-fast ease-out active:scale-[0.98] disabled:active:scale-100 shadow-lg shadow-[#3B82F6]/20 disabled:opacity-50 disabled:cursor-not-allowed"
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
              <p className="text-xs text-[#9CA3AF] text-center mt-4">
                {isAlreadyPremium
                  ? t('pricingPage.premium.manage')
                  : t('pricingPage.premium.cancelAnytime')}
              </p>
            </div>
          </div>

          {/* Trust row */}
          <div className="mt-12 text-center text-sm font-medium text-[#6B7280]">
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
