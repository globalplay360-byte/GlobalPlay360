import { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';
import EmptyState from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import PageHeader from '@/components/ui/PageHeader';
import ProfileEditForm from '@/components/profile/ProfileEditForm';
import ProfileView from '@/components/profile/ProfileView';
import { uploadAvatar, updateUserProfile } from '@/services/profile.service';

export default function ProfilePage() {
  const { user, activePlan, refreshUser } = useAuth();
  const { t } = useTranslation();
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  
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
    <>
      <ProfileView 
        user={user}
        activePlan={activePlan}
        isPublic={false}
        isOwnProfile={true}
        isUploadingAvatar={isUploading}
        onAvatarClick={() => fileInputRef.current?.click()}
        headerAction={
          <Button variant="primary" onClick={() => setMode('edit')} className="shadow-md hover:shadow-[#3B82F6]/20 transition-all duration-base active:scale-[0.98]">
            {t('profile.editProfile', 'Editar Perfil')}
          </Button>
        }
      />
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleAvatarChange}
      />
    </>
  );
}