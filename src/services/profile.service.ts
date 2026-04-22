import { doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import type { User } from '@/types';

/**
 * Fields that can be mutated from the Profile screen.
 * Explicitly excludes auth/billing fields to prevent accidental overwrites.    
 */
export type ProfileUpdate = Partial<
  Omit<
    User,
    | 'uid'
    | 'email'
    | 'role'
    | 'plan'
    | 'subscriptionStatus'
    | 'trialEndsAt'
    | 'createdAt'
    | 'onboardingCompleted'
  >
>;

/** Update the current user's profile document in Firestore. */
export async function updateUserProfile(uid: string, data: ProfileUpdate): Promise<void> {
  await updateDoc(doc(db, 'users', uid), {
    ...data,
    _updatedAt: serverTimestamp(),
  });
}

/** 
 * Uploads an avatar image to Firebase Storage and returns the download URL.
 */
export async function uploadAvatar(uid: string, file: File): Promise<string> {
  // Add a timestamp to the filename to avoid caching issues when replacing
  const fileExtension = file.name.split('.').pop() || 'jpg';
  const filePath = `users/${uid}/avatar_${Date.now()}.${fileExtension}`;
  const storageRef = ref(storage, filePath);
  
  await uploadBytes(storageRef, file);
  const downloadUrl = await getDownloadURL(storageRef);
  
  return downloadUrl;
}

/** 
 * Fetch a user profile by ID from Firestore.
 * Used for public profiles and checking other users' info.
 */
export async function getUserProfile(uid: string): Promise<User | null> {
  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { ...docSnap.data(), uid: docSnap.id } as User;
  }
  return null;
}

