import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { subscribeToUserConversations } from '@/services/messages.service';

export function useUnreadCount() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    const unsubscribe = subscribeToUserConversations(user.uid, (conversations) => {
      const count = conversations.reduce((acc, conv) => {
        const userUnread = conv.unreadCount?.[user.uid] || 0;
        return acc + userUnread;
      }, 0);
      setUnreadCount(count);
    });

    return () => unsubscribe();
  }, [user]);

  return unreadCount;
}
