import React from 'react';
import { useTranslation } from 'react-i18next';
import type { User, UserRole } from '../../types';
import { MapPinIcon, CalendarIcon, EnvelopeIcon, PhoneIcon, LinkIcon, HeartIcon, ShieldCheckIcon, TrophyIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { Badge } from '../ui/Badge';
import PremiumLockCard from '../ui/PremiumLockCard';
import type { ReactNode } from 'react';

interface ProfileViewProps {
  user: User;
  isPublic?: boolean;
  activePlan?: string;
  isOwnProfile?: boolean;
  isUploadingAvatar?: boolean;
  onAvatarClick?: () => void;
  headerAction?: ReactNode;
}

export default function ProfileView({ 
  user, 
  isPublic = false, 
  activePlan = 'free',
  isOwnProfile = false,
  isUploadingAvatar = false,
  onAvatarClick,
  headerAction
}: ProfileViewProps) {
  const { t } = useTranslation();

  const getRoleName = (role: UserRole) => {
    return t(`sidebar.${role}Role`, role);
  };

  const isFreePlan = activePlan === 'free';
  const showPrivateDetails = !isPublic || !isFreePlan || isOwnProfile;

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto w-full flex flex-col gap-4">
      <div className="relative rounded-2xl overflow-hidden border border-[#2A3447]/70 bg-gradient-to-b from-[#1A2235] to-[#141C2E] shadow-[0_1px_0_0_rgba(243,244,246,0.04)_inset,0_10px_30px_-16px_rgba(0,0,0,0.7)]">
        <div className="pointer-events-none absolute top-0 left-5 right-5 h-px bg-gradient-to-r from-transparent via-gray-100/10 to-transparent z-10" />

        {/* Banner Header */}
        <div className="h-32 sm:h-48 bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] w-full relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiNmZmZmZmYiLz48L3N2Zz4=')] opacity-10 mix-blend-overlay"></div>
        </div>

        {/* Profile Content */}
        <div className="px-5 sm:px-10 pb-10 relative">
          <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 items-center sm:items-end -mt-12 sm:-mt-20 mb-8">
            <div className="relative w-28 h-28 sm:w-40 sm:h-40 shrink-0">
              <div
                className={`w-full h-full rounded-full border-4 border-[#141C2E] bg-gradient-to-br from-[#2A3447] to-[#1F2937] flex items-center justify-center text-4xl font-bold text-gray-100/90 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.8)] overflow-hidden group ${isOwnProfile ? 'cursor-pointer' : ''}`}
                onClick={isOwnProfile ? onAvatarClick : undefined}
              >
                {isUploadingAvatar ? (
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                ) : user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user.displayName.charAt(0).toUpperCase()
                )}

                {isOwnProfile && !isUploadingAvatar && (
                  <div className="absolute inset-0 bg-black/60 hidden group-hover:flex flex-col items-center justify-center text-xs text-gray-100/90 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-6 h-6 text-gray-100/90 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {t('profile.changeAvatar', 'Canviar imatge')}
                  </div>
                )}
              </div>
              <div className="absolute bottom-2 right-2 bg-emerald-500 border-2 border-[#141C2E] w-5 h-5 rounded-full shadow-[0_0_0_2px_rgba(16,185,129,0.2)]" title="Online"></div>
            </div>

            <div className="flex-1 pb-2 md:pt-4 min-w-0">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-2">
                <div className="flex flex-col gap-1 text-center sm:text-left min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-medium text-gray-100/90 tracking-normal truncate">{user.displayName}</h1>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-2 mt-1 text-[#9CA3AF] text-sm">
                    <span className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#60A5FA]">
                      {getRoleName(user.role)}
                    </span>
                    {(user.role === 'player' || user.role === 'coach') && user.sport && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-[#2A3447]"></span>
                        <span>{t(`overview.sports.${user.sport}`, user.sport || '')}</span>
                      </>
                    )}
                  </div>
                </div>
                {headerAction && (
                  <div className="mt-2 sm:mt-0 flex justify-center shrink-0">
                    {headerAction}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2 text-sm text-[#9CA3AF] mt-3">
                {user.country && (
                  <div className="flex items-center gap-1.5">
                    <MapPinIcon className="w-4 h-4 text-[#6B7280]" />
                    <span>{user.city ? `${user.city}, ` : ''}{user.country}</span>
                  </div>
                )}
                {user.createdAt && (
                  <div className="flex items-center gap-1.5">
                     <CalendarIcon className="w-4 h-4 text-[#6B7280]" />
                     <span>{t('profile.joined', 'Membre des de')} {new Date(user.createdAt).getFullYear()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Left Column: Bio & Stats */}
            <div className="lg:col-span-2 space-y-6 lg:space-y-8">

              {user.bio && (
                <section>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-100/90 mb-4 flex items-center gap-2 tracking-tight">
                    <HeartIcon className="w-5 h-5 text-[#60A5FA]" />
                    {user.role === 'club' ? t('profile.aboutEntity', 'Sobre l\'entitat') : t('profile.aboutMe', 'Sobre mi')}
                  </h2>
                  <div className="relative rounded-2xl border border-[#2A3447]/70 bg-gradient-to-b from-[#1A2235] to-[#141C2E] p-5 shadow-[0_1px_0_0_rgba(243,244,246,0.04)_inset,0_10px_30px_-16px_rgba(0,0,0,0.7)]">
                    <div className="pointer-events-none absolute top-0 left-5 right-5 h-px bg-gradient-to-r from-transparent via-gray-100/10 to-transparent" />
                    <p className="text-[#D1D5DB] leading-relaxed whitespace-pre-wrap">{user.bio}</p>
                  </div>
                </section>
              )}

              {user.role === 'player' && showPrivateDetails && (
                 <section>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-100/90 mb-4 flex items-center gap-2 tracking-tight">
                      <TrophyIcon className="w-5 h-5 text-[#60A5FA]" />
                      {t('profile.playerStats', 'Estadístiques')}
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                      {user.height && <StatCell label={t('profile.height', 'Alçada')} value={`${user.height} cm`} />}
                      {user.weight && <StatCell label={t('profile.weight', 'Pes')} value={`${user.weight} kg`} />}
                      {user.position && (
                        <div className="relative rounded-2xl border border-[#2A3447]/70 bg-gradient-to-b from-[#1A2235] to-[#141C2E] p-4 col-span-2 sm:col-span-4 shadow-[0_1px_0_0_rgba(243,244,246,0.04)_inset,0_10px_30px_-16px_rgba(0,0,0,0.7)]">
                          <div className="pointer-events-none absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-gray-100/10 to-transparent" />
                          <p className="text-[10.5px] font-semibold text-[#6B7280] uppercase tracking-[0.14em] mb-2">{t('profile.positions', 'Posicions')}</p>
                          <div className="flex flex-wrap gap-2">
                              <Badge key={user.position} variant="default">{user.position}</Badge>
                          </div>
                        </div>
                      )}
                    </div>
                 </section>
              )}

              {!showPrivateDetails && (
                 <PremiumLockCard
                  title={t('publicProfile.lockedTitle', 'Estadístiques i Contacte Protegits')}
                  description={t('publicProfile.lockedDesc', "Els usuaris del Pla Free no tenen accés complet als perfils d'altres usuaris. Passa't a Premium per desbloquejar les seves estadístiques i obrir el xat directe.")}
               />
              )}

            </div>

            {/* Right Column: Contact & Socials */}
            <div className="space-y-6">

              {showPrivateDetails ? (
                <div className="relative rounded-2xl border border-[#3B82F6]/25 bg-gradient-to-b from-[#3B82F6]/10 to-[#3B82F6]/5 p-5 sm:p-6 shadow-[0_1px_0_0_rgba(243,244,246,0.04)_inset,0_10px_30px_-16px_rgba(0,0,0,0.7)]">
                  <div className="pointer-events-none absolute top-0 left-5 right-5 h-px bg-gradient-to-r from-transparent via-[#60A5FA]/25 to-transparent" />
                  <h3 className="font-semibold text-gray-100/90 mb-5 flex items-center gap-2.5 text-[15px] tracking-tight">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#3B82F6]/20 to-[#3B82F6]/10 border border-[#3B82F6]/25 flex items-center justify-center shrink-0 shadow-[inset_0_1px_0_0_rgba(243,244,246,0.05)]">
                      <ShieldCheckIcon className="w-4 h-4 text-[#60A5FA]" />
                    </div>
                    {t('profile.contactInfo', 'Contacte')}
                  </h3>

                  <div className="space-y-4">
                    <ContactRow icon={<EnvelopeIcon />} value={user.email} />
                    {user.phone && <ContactRow icon={<PhoneIcon />} value={user.phone} />}
                    {user.youtubeVideoUrl && (
                        <a href={user.youtubeVideoUrl.startsWith('http') ? user.youtubeVideoUrl : `https://${user.youtubeVideoUrl}`} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 w-full text-[#60A5FA] hover:text-[#93C5FD] transition-colors group">
                           <div className="w-9 h-9 rounded-lg bg-[#0F172A]/60 border border-[#2A3447]/70 flex items-center justify-center shrink-0 group-hover:border-[#3B82F6]/40 transition-colors shadow-[inset_0_1px_0_0_rgba(243,244,246,0.04)]">
                              <LinkIcon className="w-4 h-4" />
                            </div>
                            <span className="truncate pt-2 text-sm font-medium border-b border-transparent group-hover:border-[#60A5FA]/50 pb-0.5">{user.youtubeVideoUrl.replace(/^https?:\/\//, '')}</span>
                        </a>
                    )}
                  </div>

                  {user.instagram && (
                     <div className="mt-7 pt-5 border-t border-[#2A3447]/60">
                        <p className="text-[10.5px] font-semibold text-[#6B7280] uppercase tracking-[0.14em] mb-4">{t('profile.socialNetworks', 'Xarxes Socials')}</p>
                        <div className="flex gap-3">
                           {user.instagram && (
                             <SocialButton icon={<LinkIcon />} href={`https://instagram.com/${user.instagram.replace('@', '')}`} />
                           )}
                        </div>
                     </div>
                  )}
                </div>
              ) : (
                 <div className="relative rounded-2xl border border-[#2A3447]/70 bg-gradient-to-b from-[#1A2235] to-[#141C2E] p-5 py-10 flex flex-col items-center justify-center text-center shadow-[0_1px_0_0_rgba(243,244,246,0.04)_inset,0_10px_30px_-16px_rgba(0,0,0,0.7)]">
                    <div className="pointer-events-none absolute top-0 left-5 right-5 h-px bg-gradient-to-r from-transparent via-gray-100/10 to-transparent" />
                    <div className="w-12 h-12 rounded-xl bg-[#0F172A]/60 border border-[#2A3447]/70 flex items-center justify-center mb-4 shadow-[inset_0_1px_0_0_rgba(243,244,246,0.04)]">
                      <LockClosedIcon className="w-5 h-5 text-[#6B7280]" />
                    </div>
                    <p className="text-sm text-[#9CA3AF] max-w-[220px] leading-relaxed">{t('publicProfile.hideDetails', 'Dades de contacte ocultes per al Pla Free')}</p>
                 </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function StatCell({ label, value }: { label: string, value: string }) {
  return (
    <div className="relative rounded-2xl border border-[#2A3447]/70 bg-gradient-to-b from-[#1A2235] to-[#141C2E] p-4 flex flex-col justify-center items-center text-center shadow-[0_1px_0_0_rgba(243,244,246,0.04)_inset,0_10px_30px_-16px_rgba(0,0,0,0.7)]">
      <div className="pointer-events-none absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-gray-100/10 to-transparent" />
      <p className="text-[10.5px] font-semibold text-[#6B7280] uppercase tracking-[0.14em] mb-1">{label}</p>
      <p className="text-lg font-semibold text-gray-100/90 tracking-tight">{value}</p>
    </div>
  );
}

function ContactRow({ icon, value }: { icon: React.ReactNode, value: string }) {
  return (
    <div className="flex items-start gap-3 w-full">
      <div className="w-9 h-9 rounded-lg bg-[#0F172A]/60 border border-[#2A3447]/70 flex items-center justify-center text-[#9CA3AF] shrink-0 shadow-[inset_0_1px_0_0_rgba(243,244,246,0.04)]">
        {React.cloneElement(icon as React.ReactElement, { className: 'w-4 h-4' } as React.HTMLAttributes<HTMLElement>)}
      </div>
      <span className="text-[#D1D5DB] break-words pt-2 text-sm font-medium">{value}</span>
    </div>
  );
}

function SocialButton({ icon, href }: { icon: React.ReactNode, href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="w-10 h-10 rounded-xl bg-[#0F172A]/60 border border-[#2A3447]/70 flex items-center justify-center text-[#9CA3AF] hover:text-gray-100/90 hover:border-[#3B82F6]/40 hover:-translate-y-0.5 transition-all shadow-[inset_0_1px_0_0_rgba(243,244,246,0.04)]"
    >
      {React.cloneElement(icon as React.ReactElement, { className: 'w-4 h-4' } as React.HTMLAttributes<HTMLElement>)}
    </a>
  );
}