export type UserRole = 'player' | 'coach' | 'club' | 'admin';
export type PlanType = 'free' | 'trial' | 'premium' | 'pro';
export type SubscriptionStatus = 'none' | 'trialing' | 'active' | 'canceled' | 'expired';

export type Sport =
  | 'football'
  | 'basketball'
  | 'futsal'
  | 'volleyball'
  | 'handball'
  | 'waterpolo'
  | 'tennis'
  | 'rugby'
  | 'american_football'
  | 'hockey'
  | 'other';

export type Handedness = 'left' | 'right' | 'both';
export type StickHand = 'left' | 'right';
export type BackhandType = 'one-hand' | 'two-hand';

export interface User {
  // ── Core / Auth ──────────────────────────────────────
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

  // ── Profile: Common (all roles) ──────────────────────
  country?: string;
  state?: string;
  city?: string;
  bio?: string;
  phone?: string;
  instagram?: string;
  youtubeVideoUrl?: string;

  // ── Profile: Player (core) ───────────────────────────
  sport?: Sport;
  currentClub?: string;         // Equip on juga actualment
  dateOfBirth?: string;         // ISO date
  height?: number;              // cm
  weight?: number;              // kg
  position?: string;            // label depending on sport

  // ── Profile: Player (sport-specific) ─────────────────
  preferredFoot?: Handedness;   // football, futsal
  preferredHand?: Handedness;   // handball, waterpolo
  playingHand?: Handedness;     // tennis
  stickHand?: StickHand;        // hockey
  backhandType?: BackhandType;  // tennis
  wingspan?: number;            // cm — basketball
  spikeReach?: number;          // cm — volleyball

  // ── Profile: Coach ───────────────────────────────────
  experienceYears?: number;
  certifications?: string[];
  specialization?: string;
  genderPreference?: 'male' | 'female' | 'both';
  categoryPreference?: 'youth' | 'senior' | 'both';

  // ── Profile: Club ────────────────────────────────────
  foundedYear?: number;
  website?: string;
  venueName?: string;
  venueCapacity?: number;
}

export interface Opportunity {
  id: string;
  clubId: string;
  title: string;
  sport: string;
  targetRole?: 'player' | 'coach' | 'both';
  gender: 'male' | 'female' | 'mixed';
  country: string;
  state?: string;
  city?: string;
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
  unreadCount?: Record<string, number>;
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
