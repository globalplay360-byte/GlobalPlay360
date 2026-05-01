import { doc, updateDoc, setDoc, serverTimestamp, getDoc, deleteField } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import { PRIVATE_PROFILE_KEYS, type User, type UserPrivate } from '@/types';

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

/**
 * Update the current user's profile document in Firestore.
 * Auto-split: camps sensibles (PII/Premium) van a `users/{uid}/private/profile`,
 * la resta al doc públic `users/{uid}`.
 */
export async function updateUserProfile(uid: string, data: ProfileUpdate): Promise<void> {
  const publicUpdate: Record<string, unknown> = {};
  const privateUpdate: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    if ((PRIVATE_PROFILE_KEYS as readonly string[]).includes(key)) {
      privateUpdate[key] = value;
    } else {
      publicUpdate[key] = value;
    }
  }

  const writes: Promise<unknown>[] = [];

  if (Object.keys(publicUpdate).length > 0) {
    writes.push(
      updateDoc(doc(db, 'users', uid), {
        ...publicUpdate,
        _updatedAt: serverTimestamp(),
      }),
    );
  }

  if (Object.keys(privateUpdate).length > 0) {
    // setDoc amb merge:true crea el doc si no existeix.
    writes.push(
      setDoc(
        doc(db, 'users', uid, 'private', 'profile'),
        { ...privateUpdate, _updatedAt: serverTimestamp() },
        { merge: true },
      ),
    );
  }

  await Promise.all(writes);
}

/** Llegeix la subcol·lecció privada del perfil. Retorna null si no existeix o DENY. */
export async function getUserPrivateProfile(uid: string): Promise<UserPrivate | null> {
  try {
    const snap = await getDoc(doc(db, 'users', uid, 'private', 'profile'));
    if (!snap.exists()) return null;
    return snap.data() as UserPrivate;
  } catch {
    // permission-denied (usuari Free llegint un altre perfil) → retornem null silent
    return null;
  }
}

/**
 * Migració lazy: si el propietari té camps sensibles al doc públic legacy,
 * els mou a la subcol·lecció privada i els esborra del doc públic.
 * S'executa silent en segon pla; errors no bloquegen el flux.
 */
export async function migrateLegacyPrivateFields(uid: string, publicDoc: Record<string, unknown>): Promise<void> {
  const legacyPrivate: Record<string, unknown> = {};
  const legacyDeletes: Record<string, unknown> = {};

  for (const key of PRIVATE_PROFILE_KEYS) {
    if (publicDoc[key] !== undefined && publicDoc[key] !== null && publicDoc[key] !== '') {
      legacyPrivate[key] = publicDoc[key];
      legacyDeletes[key] = deleteField();
    }
  }

  if (Object.keys(legacyPrivate).length === 0) return;

  try {
    await setDoc(
      doc(db, 'users', uid, 'private', 'profile'),
      { ...legacyPrivate, _migratedAt: serverTimestamp() },
      { merge: true },
    );
    await updateDoc(doc(db, 'users', uid), legacyDeletes);
  } catch (err) {
    // No bloqueja. La migració es tornarà a intentar a la propera sessió del propietari.
    console.warn('[profile.migrate] legacy private fields migration failed:', err);
  }
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

  // Cache-buster: forcem la recàrrega al client després de pujar una nova
  // imatge (sobreescriu l'anterior a Storage però el navegador serviria la
  // versió cau). URL.searchParams és robust si Firebase canvia el format.
  const url = new URL(downloadUrl);
  url.searchParams.set('t', String(Date.now()));
  return url.toString();
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

