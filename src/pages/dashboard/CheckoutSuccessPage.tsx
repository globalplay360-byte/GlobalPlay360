import { Trans, useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';

export default function CheckoutSuccessPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get('returnUrl');

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-lg w-full bg-[#0A192F] border border-gray-100/10 rounded-2xl p-10 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#0070F3]/20 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-[#0070F3]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-100 mb-3">{t('checkoutSuccess.title')}</h1>

        <p className="text-[#8892B0] mb-6 leading-relaxed">
          <Trans
            i18nKey="checkoutSuccess.desc"
            components={[<span key="unused" />, <strong key="trial" className="text-gray-100" />]}
          />
        </p>

        <div className="flex flex-col gap-3">
          {returnUrl ? (
            <Link
              to={returnUrl}
              className="w-full py-3 px-4 rounded-lg bg-[#0070F3] hover:bg-[#0051B3] text-gray-100 font-semibold transition-colors"
            >
              {t('checkoutSuccess.continueManagement')}
            </Link>
          ) : (
            <Link
              to="/dashboard"
              className="w-full py-3 px-4 rounded-lg bg-[#0070F3] hover:bg-[#0051B3] text-gray-100 font-semibold transition-colors"
            >
              {t('checkoutSuccess.goToDashboard')}
            </Link>
          )}

          <Link
            to="/dashboard/profile"
            className="text-sm text-[#8892B0] hover:text-gray-100 transition-colors"
          >
            {t('checkoutSuccess.completeProfile')}
          </Link>
        </div>
      </div>
    </div>
  );
}
