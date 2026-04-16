export type UserRole = 'player' | 'coach' | 'club' | 'admin';
export type PlanType = 'trial' | 'premium' | 'pro';
export type SubscriptionStatus = 'trialing' | 'active' | 'canceled' | 'expired';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  plan: PlanType;
  subscriptionStatus: SubscriptionStatus;
  trialEndsAt: string;          // ISO date — createdAt + 30 days
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
  clubId: string;
  status: 'submitted' | 'in_review' | 'accepted' | 'rejected';
  createdAt: string;
  message?: string;
}

export interface Conversation {
  id: string;
  participants: string[];
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
  status: SubscriptionStatus;
  currentPeriodEnd: string;
}
