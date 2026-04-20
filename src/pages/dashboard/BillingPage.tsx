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

export default function BillingPage() {  const { t, i18n } = useTranslation();  const { user, subscription, activePlan, subscriptionLoading } = useAuth();
  const navigate = useNavigate();
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Guard: redirigeix a /pricing si no és Premium (un cop acabada la càrrega)
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

  // Loading mentre l'AuthContext encara no ha resolt la subscripció
  if (subscriptionLoading || !subscription) {
    return (
      <div className="max-w-3xl mx-auto p-6 space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-gray-800 rounded" />
        <div className="h-40 bg-gray-900 rounded-xl" />
        <div className="h-24 bg-gray-900 rounded-xl" />
      </div>
    );
  }

  const statusLabel: Record<typeof subscription.status, { text: string; className: string }> = {
    trialing: { text: t('billing.status.trialing', 'En període de prova'), className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' },
    active: { text: t('billing.status.active', 'Activa'), className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
    canceled: { text: t('billing.status.canceled', 'Cancel·lada'), className: 'bg-gray-800 text-gray-400 border-gray-700' },
    incomplete: { text: t('billing.status.incomplete', 'Incompleta'), className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' },
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
    <div className="max-w-3xl mx-auto p-6 space-y-6 text-white">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">{t('billing.title', 'Facturació')}</h1>
        <p className="text-gray-400 text-sm">{t('billing.subtitle', 'Gestiona la teva subscripció, mètodes de pagament i factures.')}</p>
      </div>

      {/* Banner cancel·lació programada */}
      {subscription.cancel_at_period_end && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
          <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-yellow-300 mb-1">{t('billing.cancelBanner.title', 'Subscripció cancel·lada')}</p>
            <p className="text-yellow-200/80">
              {t('billing.cancelBanner.message1', 'La teva subscripció està programada per finalitzar el')}{' '}        
              <strong>{formatDate(subscription.current_period_end_seconds)}</strong>. {t('billing.cancelBanner.message2', 'Fins aleshores pots continuar gaudint de totes les funcions Premium.')}
            </p>
          </div>
        </div>
      )}

      {/* Targeta resum de la subscripció */}
      <div className="bg-[#111827] border border-gray-800 rounded-xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <CheckCircleIcon className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="font-bold text-white">{t('billing.card.premiumPlan', 'Pla Premium')}</h2>
              <p className="text-xs text-gray-400">{t('billing.card.globalPlaySub', 'Subscripció GlobalPlay360')}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${status.className}`}>
            {status.text}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-800">
          <div className="flex items-start gap-3">
            <CalendarIcon className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{nextEvent.label}</p>
              <p className="text-sm font-semibold text-white">{formatDate(nextEvent.date)}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CreditCardIcon className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{t('billing.card.billing', 'Facturació')}</p>
              <p className="text-sm font-semibold text-white">{t('billing.card.managedByStripe', 'Gestionada per Stripe')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bot\u00f3 portal */}
      <div className="bg-[#111827] border border-gray-800 rounded-xl p-6 space-y-4">
        <div>
          <h2 className="font-semibold text-white mb-1">{t('billing.portal.title', 'Gestionar subscripció')}</h2>
          <p className="text-sm text-gray-400">{t('billing.portal.description', 'Cancel·la, actualitza el mètode de pagament o descarrega factures al portal segur de Stripe.')}</p>
        </div>

        <button
          type="button"
          onClick={handleOpenPortal}
          disabled={portalLoading}
          className="w-full sm:w-auto px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors shadow-[0_0_15px_rgba(59,130,246,0.2)] disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
        >
          {portalLoading ? t('billing.portal.opening', 'Obrint portal...') : (
            <>
              {t('billing.portal.button', 'Obrir portal de Stripe')}
              <ArrowTopRightOnSquareIcon className="w-4 h-4" />
            </>
          )}
        </button>

        {error && (
          <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
            {error}
          </div>
        )}

        <p className="text-xs text-gray-500">{t('billing.portal.redirectNotice', 'Seràs redirigit a una pàgina segura allotjada per Stripe. Un cop acabis, tornaràs aquí automàticament.')}</p>
      </div>
    </div>
  );
}
