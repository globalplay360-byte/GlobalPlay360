import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { subscribeToMessages, sendMessage, markConversationAsRead } from '@/services/messages.service';
import { getUserDoc } from '@/services/auth.service';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import PremiumLockCard from '@/components/ui/PremiumLockCard';
import EmptyState from '@/components/ui/EmptyState';
import type { Conversation, Message, User } from '@/types';

interface ChatHeaderProps {
  displayName: string;
  role: string;
}

function ChatHeader({ displayName, role }: ChatHeaderProps) {
  return (
    <div className="bg-[#111827] border-b border-[#1F2937] p-4 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
      <Link
        to="/dashboard/messages"
        className="p-2 -ml-2 text-[#9CA3AF] hover:text-gray-100 hover:bg-[#1F2937] rounded-lg transition-all duration-fast group"
        aria-label="Tornar"
      >
        <svg className="w-5 h-5 transform group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </Link>
      <div className="w-10 h-10 rounded-full bg-[#1F2937] text-gray-100 flex items-center justify-center font-extrabold shadow-inner">
        {displayName.charAt(0)}
      </div>
      <div className="min-w-0">
        <h2 className="text-gray-100 font-extrabold text-base leading-tight tracking-tight truncate">{displayName}</h2>
        <p className="text-[#3B82F6] text-xs font-bold uppercase tracking-widest">{role}</p>
      </div>
    </div>
  );
}

function ChatMessageBubble({ text, isSender, timestamp }: { text: string, isSender: boolean, timestamp: string }) {
  const time = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return (
    <div className={`flex w-full ${isSender ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] sm:max-w-[75%] px-4 py-3 rounded-2xl flex flex-col gap-1.5 shadow-sm transition-all duration-base hover:-translate-y-0.5 ${
        isSender 
          ? 'bg-gradient-to-br from-[#3B82F6] to-[#2563EB] text-gray-100 rounded-br-sm shadow-[#3B82F6]/10' 
          : 'bg-[#1F2937] text-gray-100 rounded-bl-sm border border-[#374151]'
      }`}>
        <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{text}</p>
        <span className={`text-[10px] font-medium self-end mt-0.5 ${isSender ? 'text-blue-200' : 'text-[#9CA3AF]'}`}>
          {time}
        </span>
      </div>
    </div>
  );
}

function MessageComposer({ onSend }: { onSend: (text: string) => Promise<void> }) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    
    setSending(true);
    try {
      await onSend(text.trim());
      setText('');
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#111827] border-t border-[#1F2937] p-4 sm:p-5 mt-auto shadow-[0_-4px_10px_rgba(0,0,0,0.1)] z-10">
      <div className="max-w-4xl mx-auto flex items-end gap-3 bg-[#0F172A] border border-[#374151] rounded-2xl pl-5 pr-2 py-1 shadow-inner focus-within:border-[#3B82F6] focus-within:ring-2 focus-within:ring-[#3B82F6]/50 focus-within:shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all duration-fast">
        <textarea
          className="flex-1 max-h-32 min-h-[44px] bg-transparent border-none text-gray-100 text-[15px] focus:ring-0 resize-none py-3 placeholder:text-[#6B7280] font-medium"
          placeholder="Escriu el teu missatge..."
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={sending}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        
        <button 
          type="submit" 
          disabled={sending || !text.trim()}
          className="p-3 text-gray-100 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] hover:from-[#2563EB] hover:to-[#1D4ED8] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all duration-fast active:scale-[0.95] flex-shrink-0 m-1 shadow-md shadow-[#3B82F6]/30 group"
        >
          {sending ? (
            <div className="w-5 h-5 border-2 border-gray-100/30 border-t-gray-100 rounded-full animate-spin"></div>
          ) : (
            <svg className="w-5 h-5 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </div>
    </form>
  );
}

export default function MessageDetailPage() {
  const { id } = useParams();
  const { user, activePlan, subscriptionLoading } = useAuth();

  const currentUserId = user?.uid || '';

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll a l'últim missatge
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!id || !user) return;

    let unsubscribeMessages: () => void;

    const initChat = async () => {
      try {
        // Obtenir la conversa
        const snap = await getDoc(doc(db, 'conversations', id));
        if (snap.exists()) {
          const convData = snap.data();
          const conv: Conversation = {
            id,
            participants: convData.participants || [],
            lastMessage: convData.lastMessage || '',
            updatedAt: convData.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            isPremiumLocked: convData.isPremiumLocked || false
          };
          setConversation(conv);

          // Obtenir altre participant
          const otherId = conv.participants.find((pId: string) => pId !== user.uid);
          if (otherId) {
            const ou = await getUserDoc(otherId);
            setOtherUser(ou);
          }
        }

        // Reset del comptador de no llegits per aquest usuari
        markConversationAsRead(id, user.uid).catch((err) => {
          console.warn("No s'ha pogut marcar la conversa com a llegida:", err);
        });

        // Subscripció als missatges
        unsubscribeMessages = subscribeToMessages(id, (newMessages) => {
          setMessages(newMessages);
          // Donem una mica de temps per renderitzar i fer scroll
          setTimeout(scrollToBottom, 100);
        });

      } catch (err) {
        console.error("Error loading chat:", err);
      } finally {
        setLoading(false);
      }
    };

    initChat();

    return () => {
      if (unsubscribeMessages) unsubscribeMessages();
    };
  }, [id, user]);

  const handleSend = async (text: string) => {
    if (!id || !user) return;
    await sendMessage(id, user.uid, text);
    scrollToBottom();
  };

  if (loading || subscriptionLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3B82F6]"></div>
      </div>
    );
  }

  if (activePlan === 'free') {
    return (
      <div className="p-6 h-full flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
        <PremiumLockCard
          className="max-w-md w-full"
          title="Missatgeria directa · Premium"
          description="Amb Premium pots llegir i respondre als missatges d'entrenadors i caçatalents sense límits. Comença la prova de 30 dies gratuïts."
        />
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="p-6 h-full flex flex-col items-center justify-center">
        <EmptyState
          title="Conversa no trobada"
          description="Aquest fil de missatges podria haver estat eliminat o no tens permisos."
          action={
            <Link to="/dashboard/messages" className="inline-flex items-center justify-center px-4 py-2 bg-[#3B82F6] text-gray-100 hover:bg-[#2563EB] text-sm font-medium rounded-lg transition-colors">
              Tornar a Missatges
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full h-[calc(100vh-theme(spacing.16))] md:h-[calc(100vh-theme(spacing.16)-4rem)] flex flex-col bg-[#0B1120] md:border-x md:border-[#1F2937] overflow-hidden">
      <ChatHeader 
        displayName={otherUser?.displayName || 'Usuari N/A'}
        role={otherUser?.role || 'user'}
      />
      
      {/* Timeline Zone */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 custom-scrollbar">
        {/* Fake inici de conversa info */}
        <div className="text-center mb-6 mt-4">
          <span className="bg-[#111827] text-[#6B7280] text-xs font-semibold px-3 py-1 rounded-full border border-[#1F2937] uppercase tracking-wider">
            Inici de la conversa a l'oportunitat
          </span>
        </div>

        {messages.length > 0 ? (
          messages.map(msg => (
             <ChatMessageBubble 
               key={msg.id}
               text={msg.text}
               isSender={msg.senderId === currentUserId}
               timestamp={msg.createdAt}
             />
          ))
        ) : (
          <div className="flex-1 flex items-center justify-center text-[#6B7280] italic text-sm">
            Escriu el primer missatge per començar.
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <MessageComposer onSend={handleSend} />
    </div>
  );
}