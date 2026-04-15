export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'jugador' | 'entrenador' | 'club' | 'admin';
  createdAt: string;
}

export interface Profile {
  id: string;
  userId: string;
  type: 'jugador' | 'entrenador' | 'club';
  name: string;
  sport: string;
  country: string;
  description: string;
  isPremium: boolean;
}
