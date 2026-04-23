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
 * Compresses an image file in the browser before uploading.
 * Resizes max dimension to 800px and saves as JPEG with 80% quality.
 */
async function compressImage(file: File, maxWidth = 800, maxHeight = 800, quality = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas ctx not found'));
        
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Canvas to Blob failed'));
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
}

/** 
 * Uploads an avatar image to Firebase Storage and returns the download URL.
 */
export async function uploadAvatar(uid: string, file: File): Promise<string> {
  // Comprimir la imatge abans de pujar-la (800x800, 80% JPEG)
  const compressedBlob = await compressImage(file);
  
  // Sense el timestamp al nom per sobreescriure la imatge anterior a Storage i estalviar espai.
  // Quan retorna la URL, afegim un paràmetre `?t=` al Firestore (a nivell d'app, quan es llegeix avall)
  // per evitar problemes de memòria cau (la cau del navegador pensant que és la mateixa foto).
  const filePath = `users/${uid}/avatar.jpg`;
  const storageRef = ref(storage, filePath);
  
  await uploadBytes(storageRef, compressedBlob);
  const downloadUrl = await getDownloadURL(storageRef);
  
  // Hi afegim un query string inventat perquè el navegador de l'usuari la recarregui
  return `${downloadUrl}&t=${Date.now()}`;
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

