import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { deleteMyAccount, downloadAsJsonFile, exportMyData } from '@/services/privacy.service';

function getCallableErrorKey(err: unknown): string | null {
  const message = err instanceof Error ? err.message : '';
  if (message.includes('SUBSCRIPTION_ACTIVE')) return 'SUBSCRIPTION_ACTIVE';
  if (message.includes('RECENT_LOGIN_REQUIRED')) return 'RECENT_LOGIN_REQUIRED';
  if (message.includes('EXPORT_RATE_LIMITED')) return 'EXPORT_RATE_LIMITED';
  return null;
}

/**
 * Secció "Privacitat i dades" del perfil propi: exportació de dades
 * (Art. 20 RGPD) i eliminació de compte (Art. 17 RGPD).
 */
export default function AccountPrivacySection() {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState('');

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteErrorKey, setDeleteErrorKey] = useState<string | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    setExportError('');
    try {
      const data = await exportMyData();
      const dateSuffix = new Date().toISOString().slice(0, 10);
      downloadAsJsonFile(data, `globalplay360-dades-${dateSuffix}.json`);
    } catch (err) {
      console.error(err);
      setExportError(
        getCallableErrorKey(err) === 'EXPORT_RATE_LIMITED'
          ? t('profilePrivacy.exportRateLimited', 'Ja has exportat les teves dades fa menys de 24 hores. Torna-ho a provar més tard.')
          : t('profilePrivacy.exportError', 'No s\'han pogut exportar les dades. Torna-ho a provar.'),
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError('');
    try {
      await deleteMyAccount();
      await logout().catch(() => undefined);
      navigate('/');
    } catch (err) {
      console.error(err);
      const key = getCallableErrorKey(err);
      setDeleteErrorKey(key);
      if (key === 'SUBSCRIPTION_ACTIVE') {
        setDeleteError(t('profilePrivacy.errorSubscriptionActive', 'Tens una subscripció activa. Cancel·la-la primer des de Facturació i torna-ho a provar quan hagi finalitzat.'));
      } else if (key === 'RECENT_LOGIN_REQUIRED') {
        setDeleteError(t('profilePrivacy.errorRecentLogin', 'Per seguretat, tanca la sessió, torna a iniciar-la i repeteix l\'operació en els 5 minuts següents.'));
      } else {
        setDeleteError(t('profilePrivacy.deleteError', 'No s\'ha pogut eliminar el compte. Torna-ho a provar.'));
      }
      setIsDeleting(false);
    }
  };

  return (
    <section className="rounded-2xl border border-[#2A3447]/70 bg-[#141C2E] p-5 sm:p-6 flex flex-col gap-6">
      <h2 className="text-lg font-semibold text-gray-100">
        {t('profilePrivacy.title', 'Privacitat i dades')}
      </h2>

      {/* Exportació (Art. 20) */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-100">
            {t('profilePrivacy.exportTitle', 'Descarrega les teves dades')}
          </h3>
          <p className="text-sm text-[#9CA3AF] mt-1 max-w-xl">
            {t('profilePrivacy.exportDesc', 'Obtén una còpia en format JSON de totes les teves dades personals (Art. 20 RGPD). Màxim una exportació cada 24 hores.')}
          </p>
          {exportError && <p className="text-sm text-[#F59E0B] mt-2">{exportError}</p>}
        </div>
        <Button variant="outline" onClick={handleExport} disabled={isExporting} className="shrink-0">
          {isExporting
            ? t('profilePrivacy.exporting', 'Preparant l\'exportació…')
            : t('profilePrivacy.exportButton', 'Descarregar les meves dades')}
        </Button>
      </div>

      <div className="border-t border-[#2A3447]/60" />

      {/* Eliminació (Art. 17) */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
          <div>
            <h3 className="text-sm font-medium text-[#EF4444]">
              {t('profilePrivacy.deleteTitle', 'Eliminar el compte')}
            </h3>
            <p className="text-sm text-[#9CA3AF] mt-1 max-w-xl">
              {t('profilePrivacy.deleteDesc', 'Elimina permanentment el teu compte i totes les teves dades (Art. 17 RGPD). Aquesta acció és irreversible.')}
            </p>
          </div>
          {!confirmOpen && (
            <Button
              variant="outline"
              onClick={() => { setConfirmOpen(true); setDeleteError(''); }}
              className="shrink-0 border-[#EF4444]/40 text-[#EF4444] hover:bg-[#EF4444]/10"
            >
              {t('profilePrivacy.deleteButton', 'Eliminar el meu compte')}
            </Button>
          )}
        </div>

        {confirmOpen && (
          <div className="rounded-xl border border-[#EF4444]/30 bg-[#EF4444]/5 p-4 flex flex-col gap-4">
            <label className="flex items-start gap-3 text-sm text-gray-100 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={confirmChecked}
                onChange={(e) => setConfirmChecked(e.target.checked)}
                disabled={isDeleting}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-[#1F2937] bg-[#0F172A] accent-[#EF4444]"
              />
              <span>{t('profilePrivacy.confirmLabel', 'Entenc que aquesta acció és irreversible i que totes les meves dades (perfil, candidatures, converses i fitxers) s\'eliminaran definitivament.')}</span>
            </label>

            {deleteError && (
              <p className="text-sm text-[#F59E0B]">
                {deleteError}{' '}
                {deleteErrorKey === 'SUBSCRIPTION_ACTIVE' && (
                  <Link to="/dashboard/billing" className="underline underline-offset-2 text-[#93C5FD]">
                    {t('profilePrivacy.goToBilling', 'Anar a Facturació')}
                  </Link>
                )}
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={handleDelete}
                disabled={!confirmChecked || isDeleting}
                className="border-[#EF4444]/60 text-[#EF4444] hover:bg-[#EF4444]/10 disabled:opacity-50"
              >
                {isDeleting
                  ? t('profilePrivacy.deleting', 'Eliminant el compte…')
                  : t('profilePrivacy.confirmButton', 'Eliminar definitivament')}
              </Button>
              <Button
                variant="outline"
                onClick={() => { setConfirmOpen(false); setConfirmChecked(false); setDeleteError(''); }}
                disabled={isDeleting}
              >
                {t('profilePrivacy.cancel', 'Cancel·lar')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
