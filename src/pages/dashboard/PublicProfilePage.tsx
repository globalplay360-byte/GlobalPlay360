import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import type { User } from '@/types';
import ProfileView from '@/components/profile/ProfileView';
import EmptyState from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';

export default function PublicProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user: currentUser, activePlan } = useAuth();
  
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      if (!id) return;
      
      try {
        setLoading(true);
        const docRef = doc(db, 'users', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setProfileUser(docSnap.data() as User);
        } else {
          setError(t('publicProfile.notFound', 'Perfil no trobat'));
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(t('publicProfile.error', 'Error carregant el perfil'));
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [id, t]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 w-full text-blue-500">
        <svg className="animate-spin h-10 w-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="p-6 max-w-5xl mx-auto w-full">
        <EmptyState
          title={error || 'Perfil no disponible'}
          description="L'usuari que busques no existeix o ha donat de baixa el seu compte."
        />
        <div className="mt-4 flex justify-center">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Tornar enrere
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-4 sm:p-6 max-w-5xl mx-auto w-full pb-0">
        <Button variant="outline" onClick={() => navigate(-1)} className="mb-4">
          ← Tornar
        </Button>
      </div>
      
      <ProfileView 
        user={profileUser}
        activePlan={activePlan}
        isPublic={true}
        isOwnProfile={currentUser?.uid === id}
        headerAction={
           currentUser?.uid !== id && activePlan !== 'free' ? (
            <Button variant="secondary" className="shadow-sm" onClick={() => navigate(`/dashboard/messages?user=${id}`)}>
              {t('publicProfile.sendMessage', 'Enviar Mensatge')}
            </Button>
          ) : undefined
        }
      />
    </>
  );
}