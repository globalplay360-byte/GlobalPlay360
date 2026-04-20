import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  getDoc,
  getDocs,
  increment
} from 'firebase/firestore';
import { db } from './firebase';
import type { Conversation, Message } from '@/types';

// Subscribe to user's conversations
export function subscribeToUserConversations(
  userId: string, 
  callback: (conversations: Conversation[]) => void
) {
  const q = query(
    collection(db, 'conversations'),
    where('participants', 'array-contains', userId),
    orderBy('updatedAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const convs: Conversation[] = snapshot.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        participants: data.participants || [],
        lastMessage: data.lastMessage || '',
        // Use standard date if timestamp is missing or resolving
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        isPremiumLocked: data.isPremiumLocked || false,
        unreadCount: data.unreadCount || {}
      };
    });
    callback(convs);
  });
}

// Subscribe to messages in a conversation
export function subscribeToMessages(
  conversationId: string,
  callback: (messages: Message[]) => void
) {
  const q = query(
    collection(db, `conversations/${conversationId}/messages`),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const msgs: Message[] = snapshot.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        conversationId,
        senderId: data.senderId,
        text: data.text,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        read: data.read || false
      };
    });
    callback(msgs);
  });
}

// Send a message (creates message document in subcollection and updates parent conversation)
export async function sendMessage(conversationId: string, senderId: string, text: string) {
  const messageRef = collection(db, `conversations/${conversationId}/messages`);
  const conversationRef = doc(db, 'conversations', conversationId);

  const convSnap = await getDoc(conversationRef);
  const participants: string[] = convSnap.exists() ? (convSnap.data().participants || []) : [];
  const recipients = participants.filter((pId) => pId !== senderId);

  const now = serverTimestamp();

  await addDoc(messageRef, {
    senderId,
    text,
    createdAt: now,
    read: false
  });

  const unreadUpdates: Record<string, ReturnType<typeof increment>> = {};
  recipients.forEach((rId) => {
    unreadUpdates[`unreadCount.${rId}`] = increment(1);
  });

  await updateDoc(conversationRef, {
    lastMessage: text,
    updatedAt: now,
    ...unreadUpdates
  });
}

// Reset the unread counter for a user on a conversation (called when they open it)
export async function markConversationAsRead(conversationId: string, userId: string) {
  const conversationRef = doc(db, 'conversations', conversationId);
  await updateDoc(conversationRef, {
    [`unreadCount.${userId}`]: 0
  });
}

// Helper to get or create a conversation between two users
export async function getOrCreateConversation(userId1: string, userId2: string): Promise<string> {
  const q = query(
    collection(db, 'conversations'),
    where('participants', 'array-contains', userId1)
  );
  
  const snap = await getDocs(q);
  const existing = snap.docs.find(d => {
    const p = d.data().participants || [];
    return p.includes(userId2);
  });
  
  if (existing) {
    return existing.id;
  }
  
  const newRef = doc(collection(db, 'conversations'));
  await setDoc(newRef, {
    participants: [userId1, userId2],
    lastMessage: '',
    updatedAt: serverTimestamp(),
    isPremiumLocked: false,
    unreadCount: { [userId1]: 0, [userId2]: 0 }
  });

  return newRef.id;
}
