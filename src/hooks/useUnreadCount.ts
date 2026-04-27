import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { subscribeToUserConversations } from '@/services/messages.service';

export function useUnreadCount() {
  const { user } = useAuth();
  const uid = user?.uid;
  const [unreadCount, setUnreadCount] = useState(0);

  // Depenem només de l'uid, no de l'objecte user sencer (que es refà a cada
  // tick de Stripe a AuthContext i provocaria re-subscripcions inútils).
  useEffect(() => {
    if (!uid) {
      setUnreadCount(0);
      return;
    }

    const unsubscribe = subscribeToUserConversations(uid, (conversations) => {
      const count = conversations.reduce((acc, conv) => acc + (conv.unreadCount?.[uid] || 0), 0);
      setUnreadCount(count);
    });

    return () => unsubscribe();
  }, [uid]);

  return unreadCount;
}
