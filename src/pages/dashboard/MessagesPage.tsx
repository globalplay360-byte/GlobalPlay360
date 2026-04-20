import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';
import { subscribeToUserConversations } from '@/services/messages.service';
import { getUserDoc } from '@/services/auth.service';
import type { Conversation, User } from '@/types';
import EmptyState from '@/components/ui/EmptyState';
import PremiumLockCard from '@/components/ui/PremiumLockCard';

interface ConversationExtended extends Conversation {
  otherParticipant?: User;
}

// ConversationListItem extret al mateix fitxer per comoditat, però pot anar fora
function ConversationListItem({ conv, currentUserId }: { conv: ConversationExtended; currentUserId: string }) {
  const { t, i18n } = useTranslation();
  const isLocked = false;
  const unread = conv.unreadCount?.[currentUserId] ?? 0;
  const hasUnread = unread > 0;

  const displayDate = new Date(conv.updatedAt).toLocaleDateString(i18n.language === 'ca' ? 'ca-ES' : i18n.language === 'es' ? 'es-ES' : 'en-US', { month: 'short', day: 'numeric' });
  const time = new Date(conv.updatedAt).toLocaleTimeString(i18n.language === 'ca' ? 'ca-ES' : i18n.language === 'es' ? 'es-ES' : 'en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <Link
      to={`/dashboard/messages/${conv.id}`}
      className={`group flex items-center gap-4 p-4 bg-[#111827] border border-[#1F2937] rounded-xl hover:border-[#3B82F6]/50 transition-colors relative overflow-hidden ${
        isLocked ? 'hover:border-[#1F2937] cursor-pointer' : ''
      }`}
    >
      {/* Icona o Avatar de l'altre participant */}
      <div className="w-12 h-12 rounded-full bg-[#1F2937] text-[#9CA3AF] flex items-center justify-center font-bold text-lg shrink-0 relative">
        {conv.otherParticipant?.displayName?.charAt(0) || '?'}
        {/* Indicador d'estat fals (online placeholder) */}
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#111827] rounded-full"></span>
      </div>

      {/* Contingut */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className={`truncate flex items-center gap-2 text-base ${hasUnread ? 'text-white font-bold' : 'text-white font-bold'}`}>
            {conv.otherParticipant?.displayName || t('messages.unknownUser', 'Usuari desconegut')}   
            {isLocked && (
              <svg className="w-4 h-4 text-[#F59E0B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7z" />
              </svg>
            )}
          </h3>
          <span className={`text-xs whitespace-nowrap ml-2 ${hasUnread ? 'text-[#3B82F6] font-semibold' : 'text-[#9CA3AF]'}`}>
            {displayDate}, {time}
          </span>
        </div>

        <p className={`text-sm truncate ${isLocked ? 'text-[#4B5563] blur-[2px] select-none' : hasUnread ? 'text-white font-medium' : 'text-[#9CA3AF] group-hover:text-white transition-colors'}`}>
          {isLocked ? t('messages.protectedMessage', 'Missatge protegit') : conv.lastMessage || t('messages.newConversation', 'Nova conversa')}
        </p>
      </div>

      {/* Unread badge */}
      {hasUnread && (
        <span
          className="ml-2 inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 text-[11px] font-bold text-white bg-[#3B82F6] rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)] shrink-0"
          aria-label={`${unread} missatge${unread > 1 ? 's' : ''} sense llegir`}
        >
          {unread > 9 ? '9+' : unread}
        </span>
      )}

      {/* Angle right arrow for unlockeds */}
      {!isLocked && (
        <div className="text-[#4B5563] group-hover:text-[#3B82F6] transition-colors ml-2 hidden sm:block">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      )}
    </Link>
  );
}

export default function MessagesPage() {
  const { t } = useTranslation();
  const { user, activePlan, subscriptionLoading } = useAuth();
  const [conversations, setConversations] = useState<ConversationExtended[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || activePlan === 'free') return;

    const unsubscribe = subscribeToUserConversations(user.uid, async (convs) => {
      const extendedConvs = await Promise.all(
        convs.map(async (c) => {
          const otherUserId = c.participants.find(id => id !== user.uid);
          let otherParticipant;
          if (otherUserId) {
            otherParticipant = await getUserDoc(otherUserId) || undefined;
          }
          return { ...c, otherParticipant };
        })
      );

      setConversations(extendedConvs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, activePlan]);

  if (subscriptionLoading || (activePlan === 'premium' && loading)) {
    return (
      <div className="p-6 max-w-4xl mx-auto flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3B82F6]"></div>
      </div>
    );
  }

  if (activePlan === 'free') {
    return (
      <div className="p-6 max-w-2xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white tracking-tight">{t('messages.pageTitle', 'Missatges Directes')}</h1>
          <p className="text-[#9CA3AF] mt-1 text-sm">
            {t('messages.pageSubtitle', 'Comunica\'t amb els clubs i entrenadors per gestionar les teves oportunitats.')}
          </p>
        </div>

        <PremiumLockCard
          title={t("messages.unlockTitle", "Mantingues converses en temps real amb els clubs")}
          description={t("messages.unlockDesc", "Aconsegueix accés directe a organitzacions i clubs d'elit i respon de manera immediata. L'eina definitiva per a tancar fitxatges.")}
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">{t('messages.pageTitle', 'Missatges Directes')}</h1>
        <p className="text-[#9CA3AF] mt-1 text-sm">
          {t('messages.pageSubtitle', 'Comunica\'t amb els clubs i entrenadors per gestionar les teves oportunitats.')}
        </p>
      </div>

      {conversations.length > 0 ? (
        <div className="flex flex-col gap-3">
          {conversations.map(conv => (
            <ConversationListItem
              key={conv.id}
              conv={conv}
              currentUserId={user!.uid}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title={t("messages.emptyTitle", "No tens missatges encara")}
          description={t("messages.emptyDesc", "Cerca oportunitats o inicia converses per començar a parlar amb clubs de tot el món.")}
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          }
        />
      )}
    </div>
  );
}
