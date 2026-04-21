import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';
import EmptyState from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import PageHeader from '@/components/ui/PageHeader';
import ProfileEditForm from '@/components/profile/ProfileEditForm';
import { uploadAvatar, updateUserProfile } from '@/services/profile.service';   

export default function ProfilePage() {
  const { user, activePlan, refreshUser } = useAuth();
  const { t } = useTranslation();
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setIsUploading(true);
      const photoURL = await uploadAvatar(user.uid, file);
      await updateUserProfile(user.uid, { photoURL });
      await refreshUser();
    } catch (err) {
      console.error(err);
      alert(t('profile.uploadError', 'Error pujant l\'avatar.'));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (!user) {
    return (
      <div className="p-6 max-w-5xl mx-auto w-full">
        <EmptyState
          title={t('profile.notAuthenticated', 'No estàs autenticat')}
          description={t('profile.loginToView', 'Fes login per veure el perfil')}
        />
      </div>
    );
  }

  const isPremium = activePlan === 'premium';

  // ── Edit mode ──────────────────────────────────────────
  if (mode === 'edit') {
    return (
      <div className="p-6 max-w-4xl mx-auto w-full flex flex-col gap-4 sm:p-6">
        <PageHeader
          title={t('profile.editProfile', 'Editar Perfil')}
          description={t('profile.updateInfo', 'Actualitza la teva informació personal i perfil públic.')}
          action={
            <Button variant="outline" onClick={() => setMode('view')} className="transition-all duration-fast active:scale-[0.98] group">
              <span className="inline-block transition-transform duration-fast group-hover:-translate-x-1 mr-1">←</span>
              {t('profile.backToProfile', 'Tornar')}
            </Button>
          }
        />

        <ProfileEditForm
          user={user}
          onCancel={() => setMode('view')}
          onSaved={async () => {
            await refreshUser();
            setMode('view');
          }}
        />
      </div>
    );
  }

  // ── View mode ──────────────────────────────────────────
  return (
    <div className="p-6 max-w-5xl mx-auto w-full flex flex-col gap-4 sm:p-6">
      {/* Capçalera */}
      <div className="bg-[#111827] border border-[#1F2937] rounded-2xl overflow-hidden relative">
        <div className="h-32 md:h-48 w-full bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] relative">
          <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiNmZmZmZmYiLz48L3N2Zz4=')]"></div>
        </div>

        <div className="px-6 pb-6 pt-0 relative flex flex-col md:flex-row items-center md:items-end md:justify-between gap-4">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16 md:-mt-20 w-full md:w-auto text-center md:text-left">
            <div className="relative shrink-0 w-32 h-32">
              <div 
                className="w-full h-full rounded-full border-4 border-[#111827] bg-[#1F2937] flex items-center justify-center text-4xl font-bold text-white shadow-lg overflow-hidden group cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploading ? (
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                ) : user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                ) : (
                  user.displayName.charAt(0).toUpperCase()
                )}

                {/* Hover overlay per canviar l'avatar */}
                {!isUploading && (
                  <div className="absolute inset-0 bg-black/50 hidden group-hover:flex flex-col items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-6 h-6 text-white mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {t('profile.changeAvatar', 'Canviar imatge')}
                  </div>
                )}
              </div>

              {isPremium && (
                <div className="absolute bottom-1 right-1 w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full border-2 border-[#111827] flex items-center justify-center shadow-md pointer-events-none">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
              )}

              {/* Input de fitxer ocult */}
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleAvatarChange}
              />
            </div>

            <div className="flex flex-col gap-1 md:pb-2">
              <h1 className="text-2xl sm:text-3xl font-medium text-white/90 tracking-normal">{user.displayName}</h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2 mt-1text-[#9CA3AF] text-sm">
                <span className="uppercase tracking-wider font-semibold text-[#3B82F6]">{user.role}</span>
                {user.sport && (
                  <>
                    <span className="hidden md:block w-1.5 h-1.5 rounded-full bg-[#374151]"></span>
                    <span>{t(`profile.sports.${user.sport}`, user.sport || '')}</span>
                  </>
                )}
                {user.country && (
                  <>
                    <span className="hidden md:block w-1.5 h-1.5 rounded-full bg-[#374151]"></span>
                    <span>{user.country}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto pt-4 md:pt-0">
            <Button variant="primary" onClick={() => setMode('edit')} className="flex-1 md:flex-none shadow-md hover:shadow-[#3B82F6]/20 transition-all duration-base active:scale-[0.98]">
              {t('profile.editProfile', 'Editar Perfil')}
            </Button>
          </div>
        </div>
      </div>

      {/* Contingut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 pt-4">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-5 sm:p-7 shadow-sm">
            <h2 className="text-xl font-medium text-white/90 tracking-normal mb-4">
              {user.role === 'club' ? t('profile.aboutEntity', 'Sobre l\'entitat') : t('profile.aboutMe', 'Sobre mi')}
            </h2>
            <p className="text-sm text-[#9CA3AF] leading-relaxed whitespace-pre-wrap">
              {user.bio || t('profile.emptyBio', 'No hi ha biografia.')}
            </p>
          </div>

          {user.role === 'player' && (user.height || user.weight || user.position || user.dateOfBirth) && (
            <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-5 sm:p-7 shadow-sm">
              <h2 className="text-xl font-medium text-white/90 tracking-normal mb-4">{t('profile.sportsData', 'Dades Esportives')}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {user.position && <StatCell label={t('profile.position', 'Posició')} value={user.position} />}
                {user.height && <StatCell label={t('profile.height', 'Alçada')} value={`${user.height} cm`} />}
                {user.weight && <StatCell label={t('profile.weight', 'Pes')} value={`${user.weight} kg`} />}
                {user.dateOfBirth && (
                  <StatCell
                    label={t('profile.birthDate', 'Naixement')}
                    value={new Date(user.dateOfBirth).toLocaleDateString('ca-ES')}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div className={`rounded-xl p-5 sm:p-7 shadow-sm border ${isPremium ? 'bg-gradient-to-b from-[#111827] to-[#1E293B] border-yellow-500/20' : 'bg-[#111827] border-[#1F2937]'}`}>
            <h3 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-4">{t('profile.membershipStatus', 'Subscripció')}</h3>
            <div className="flex items-center gap-4 mb-5">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-inner ${isPremium ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 'bg-[#0F172A] text-gray-400 border border-[#1F2937]'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-lg text-white/90 font-medium tracking-normal capitalize leading-tight">{t('profile.planName', 'Pla {{plan}}', { plan: activePlan })}</p>
                <p className="text-xs text-[#9CA3AF] mt-1">
                  {isPremium ? t('profile.premiumAccess', 'Accés Premium') : t('profile.upgradeToContact', 'Millora per contactar')}
                </p>
              </div>
            </div>
            {isPremium ? (
              <Button
                className="w-full bg-[#0F172A] hover:bg-gray-800 text-white border border-[#1F2937] hover:border-gray-600 transition-all duration-fast active:scale-[0.98] shadow-sm"
                onClick={() => navigate('/dashboard/billing')}
              >
                {t('profile.manageSubscription', 'Gestionar subscripció')}
              </Button>
            ) : (
              <Button
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-white font-bold border border-yellow-500/50 hover:border-yellow-400/50 shadow-md hover:shadow-yellow-500/20 transition-all duration-base active:scale-[0.98]"
                onClick={() => navigate('/pricing')}
              >
                {t('profile.upgradePlan', 'Millorar Pla')}
              </Button>
            )}
          </div>

          {(user.phone || user.instagram || user.youtubeVideoUrl) && (
            <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-5 sm:p-7 flex flex-col gap-4 shadow-sm">
              <h3 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">{t('profile.contactAndSocial', 'Contacte i Xarxes')}</h3>
              {user.phone && <InfoRow label={t('profile.phone', 'Telèfon')} value={user.phone} />}
              {user.instagram && <InfoRow label={t('profile.instagram', 'Instagram')} value={user.instagram} />}
              {user.youtubeVideoUrl && (
                <div className="pt-2">
                  <a
                    href={user.youtubeVideoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center text-sm font-medium text-[#3B82F6] hover:text-blue-400 transition-colors group"
                  >
                    <span>{t('profile.viewHighlights', 'Veure Highlights')}</span>
                    <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </a>
                </div>
              )}
            </div>
          )}

          <div className="text-center">
            <span className="text-xs text-[#4B5563]">
              {t('profile.memberSince', 'Membre des de {{date}}', { date: new Date(user.createdAt).toLocaleDateString('ca-ES') })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#0F172A] p-4 rounded-xl border border-[#1F2937] flex flex-col items-center justify-center text-center shadow-inner">
      <span className="text-xl font-medium text-white/90 mb-1.5 tracking-normal">{value}</span>
      <span className="text-[11px] text-[#9CA3AF] uppercase tracking-widest font-semibold">{label}</span>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm py-1 border-b border-[#1F2937]/50 last:border-0">
      <span className="text-[#9CA3AF] font-medium">{label}</span>
      <span className="text-white truncate ml-3 font-medium tracking-wide">{value}</span>
    </div>
  );
}


