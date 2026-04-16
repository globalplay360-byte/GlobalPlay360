export type UserRole = 'player' | 'coach' | 'club' | 'admin' | 'guest'; // 'guest' before onboarding
export type PlanType = 'free' | 'premium' | 'pro';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  plan: PlanType;
  onboardingCompleted: boolean;
  createdAt: string;
}

export interface Profile {
  id: string;
  userId: string;
  type: UserRole;
  name: string;
  sport: string;
  country: string;
  description: string;
  stats?: Record<string, string | number>;
  mediaUrls?: string[];
}

export interface Opportunity {
  id: string;
  clubId: string;
  title: string;
  sport: string;
  gender: 'male' | 'female' | 'mixed';
  location: string;
  contractType: 'pro' | 'semi-pro' | 'amateur' | 'academy' | 'trial';
  description: string;
  requirements: string[];
  status: 'open' | 'closed';
  createdAt: string;
}

export interface Application {
  id: string;
  opportunityId: string;
  userId: string;
  status: 'submitted' | 'in_review' | 'accepted' | 'rejected';
  createdAt: string;
  message?: string;
}

export interface Conversation {
  id: string;
  participants: string[]; // User IDs
  lastMessage: string;
  updatedAt: string;
  isPremiumLocked?: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
  read: boolean;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: PlanType;
  status: 'active' | 'canceled' | 'past_due';
  currentPeriodEnd: string;
}
