import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { createPortalSession } from '@/services/stripe.service';
import {
  CreditCardIcon,
  CalendarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import PageHeader from '@/components/ui/PageHeader';

export default function BillingPage() {
  const { t, i18n } = useTranslation();
  const { user, subscription, activePlan, subscriptionLoading } = useAuth();
  const navigate = useNavigate();
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!subscriptionLoading && activePlan !== 'premium') {
      navigate('/pricing', { replace: true });
    }
  }, [subscriptionLoading, activePlan, navigate]);

  const handleOpenPortal = async () => {
    if (!user) return;
    setPortalLoading(true);
    setError(null);
    try {
      const url = await createPortalSession();
      window.location.assign(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('billing.portal.error', 'No s\'ha pogut obrir el portal.'));
      setPortalLoading(false);
    }
  };

  if (subscriptionLoading || !subscription) {
    return (
      <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-5">
        <div className="h-9 w-56 bg-gradient-to-b from-[#1A2235] to-[#141C2E] border border-[#2A3447]/70 rounded-lg animate-pulse" />
        <div className="h-44 bg-gradient-to-b from-[#1A2235] to-[#141C2E] border border-[#2A3447]/70 rounded-2xl animate-pulse" />
        <div className="h-32 bg-gradient-to-b from-[#1A2235] to-[#141C2E] border border-[#2A3447]/70 rounded-2xl animate-pulse" />
      </div>
    );
  }

  const statusLabel: Record<typeof subscription.status, { text: string; className: string }> = {
    trialing: { text: t('billing.status.trialing', 'En període de prova'), className: 'bg-[#EAB308]/10 text-[#EAB308] border-[#EAB308]/30' },
    active: { text: t('billing.status.active', 'Activa'), className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
    canceled: { text: t('billing.status.canceled', 'Cancel·lada'), className: 'bg-[#2A3447]/40 text-[#9CA3AF] border-[#2A3447]/70' },
    incomplete: { text: t('billing.status.incomplete', 'Incompleta'), className: 'bg-[#EAB308]/10 text-[#EAB308] border-[#EAB308]/30' },
    incomplete_expired: { text: t('billing.status.incomplete_expired', 'Expirada'), className: 'bg-red-500/10 text-red-400 border-red-500/30' },
    past_due: { text: t('billing.status.past_due', 'Pagament pendent'), className: 'bg-red-500/10 text-red-400 border-red-500/30' },
    unpaid: { text: t('billing.status.unpaid', 'No pagada'), className: 'bg-red-500/10 text-red-400 border-red-500/30' },
  };

  const status = statusLabel[subscription.status];

  const formatDate = (seconds: number | null) => {
    if (!seconds) return '—';
    return new Intl.DateTimeFormat(i18n.language === 'en' ? 'en-US' : (i18n.language === 'es' ? 'es-ES' : 'ca-ES'), {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(seconds * 1000));
  };

  const nextEvent = subscription.status === 'trialing'
    ? { label: t('billing.nextEvent.trialEnd', 'Fi del període de prova'), date: subscription.trial_end_seconds }
    : { label: t('billing.nextEvent.nextBilling', 'Propera facturació'), date: subscription.current_period_end_seconds };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-5">
      <PageHeader
        title={t('billing.title', 'Facturació')}
        description={t('billing.subtitle', 'Gestiona la teva subscripció, mètodes de pagament i factures.')}
      />

      {/* Banner cancel·lació programada */}
      {subscription.cancel_at_period_end && (
        <div className="relative flex items-start gap-3 p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#EAB308]/10 to-[#EAB308]/5 border border-[#EAB308]/30 shadow-[0_1px_0_0_rgba(243,244,246,0.04)_inset,0_10px_30px_-16px_rgba(0,0,0,0.6)]">
          <div className="pointer-events-none absolute top-0 left-5 right-5 h-px bg-gradient-to-r from-transparent via-[#EAB308]/20 to-transparent" />
          <ExclamationTriangleIcon className="w-5 h-5 text-[#EAB308] flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-[#EAB308] mb-1 tracking-tight">{t('billing.cancelBanner.title', 'Subscripció cancel·lada')}</p>
            <p className="text-[#EAB308]/80 leading-relaxed">
              {t('billing.cancelBanner.message1', 'La teva subscripció està programada per finalitzar el')}{' '}
              <strong className="text-[#EAB308]">{formatDate(subscription.current_period_end_seconds)}</strong>. {t('billing.cancelBanner.message2', 'Fins aleshores pots continuar gaudint de totes les funcions Premium.')}
            </p>
          </div>
        </div>
      )}

      {/* Targeta resum de la subscripció */}
      <div className="relative rounded-2xl border border-[#2A3447]/70 bg-gradient-to-b from-[#1A2235] to-[#141C2E] p-5 sm:p-6 shadow-[0_1px_0_0_rgba(243,244,246,0.04)_inset,0_10px_30px_-16px_rgba(0,0,0,0.7)]">
        <div className="pointer-events-none absolute top-0 left-5 right-5 h-px bg-gradient-to-r from-transparent via-gray-100/10 to-transparent" />

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#3B82F6]/20 to-[#3B82F6]/10 border border-[#3B82F6]/25 flex items-center justify-center shrink-0 shadow-[inset_0_1px_0_0_rgba(243,244,246,0.05)]">
              <CheckCircleIcon className="w-5 h-5 text-[#60A5FA]" />
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold text-gray-100/90 text-[15px] tracking-tight truncate">{t('billing.card.premiumPlan', 'Pla Premium')}</h2>
              <p className="text-[10.5px] font-semibold text-[#6B7280] uppercase tracking-[0.14em] mt-0.5">{t('billing.card.globalPlaySub', 'Subscripció GlobalPlay360')}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-[11px] font-semibold border tracking-wide whitespace-nowrap shrink-0 ${status.className}`}>
            {status.text}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-5 mt-5 border-t border-[#2A3447]/60">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#0F172A]/60 border border-[#2A3447]/70 flex items-center justify-center shrink-0 shadow-[inset_0_1px_0_0_rgba(243,244,246,0.04)]">
              <CalendarIcon className="w-4 h-4 text-[#9CA3AF]" />
            </div>
            <div className="min-w-0">
              <p className="text-[10.5px] font-semibold text-[#6B7280] uppercase tracking-[0.14em] mb-1">{nextEvent.label}</p>
              <p className="text-sm font-semibold text-gray-100/90 leading-tight">{formatDate(nextEvent.date)}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#0F172A]/60 border border-[#2A3447]/70 flex items-center justify-center shrink-0 shadow-[inset_0_1px_0_0_rgba(243,244,246,0.04)]">
              <CreditCardIcon className="w-4 h-4 text-[#9CA3AF]" />
            </div>
            <div className="min-w-0">
              <p className="text-[10.5px] font-semibold text-[#6B7280] uppercase tracking-[0.14em] mb-1">{t('billing.card.billing', 'Facturació')}</p>
              <p className="text-sm font-semibold text-gray-100/90 leading-tight">{t('billing.card.managedByStripe', 'Gestionada per Stripe')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Portal */}
      <div className="relative rounded-2xl border border-[#2A3447]/70 bg-gradient-to-b from-[#1A2235] to-[#141C2E] p-5 sm:p-6 space-y-4 shadow-[0_1px_0_0_rgba(243,244,246,0.04)_inset,0_10px_30px_-16px_rgba(0,0,0,0.7)]">
        <div className="pointer-events-none absolute top-0 left-5 right-5 h-px bg-gradient-to-r from-transparent via-gray-100/10 to-transparent" />

        <div>
          <h2 className="font-semibold text-gray-100/90 text-[15px] tracking-tight mb-1">{t('billing.portal.title', 'Gestionar subscripció')}</h2>
          <p className="text-sm text-[#9CA3AF] leading-relaxed">{t('billing.portal.desc', 'Cancel·la, actualitza el mètode de pagament o descarrega factures al portal segur de Stripe.')}</p>
        </div>

        <button
          type="button"
          onClick={handleOpenPortal}
          disabled={portalLoading}
          className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-gradient-to-br from-[#3B82F6] to-[#2563EB] hover:from-[#2563EB] hover:to-[#1D4ED8] text-gray-100/95 text-[13px] font-semibold tracking-wide transition-all duration-base active:scale-[0.98] shadow-[0_6px_14px_-6px_rgba(59,130,246,0.5)] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 inline-flex items-center justify-center gap-2 group"
        >
          {portalLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-gray-100/30 border-t-gray-100/90 rounded-full animate-spin" />
              {t('billing.portal.opening', 'Obrint portal...')}
            </>
          ) : (
            <>
              {t('billing.portal.button', 'Obrir portal de Stripe')}
              <ArrowTopRightOnSquareIcon className="w-4 h-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </>
          )}
        </button>

        {error && (
          <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/25 p-3 rounded-lg">
            {error}
          </div>
        )}

        <p className="text-[11.5px] text-[#6B7280] leading-relaxed">{t('billing.portal.note', 'Seràs redirigit a una pàgina segura allotjada per Stripe. Un cop acabis, tornaràs aquí automàticament.')}</p>
      </div>
    </div>
  );
}
