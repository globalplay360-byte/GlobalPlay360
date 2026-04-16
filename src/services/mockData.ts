import type { User, Profile, Opportunity, Application, Conversation, Message, Subscription } from '../types';

export const mockUsers: User[] = [
  {
    uid: 'user-player-1',
    email: 'player@globalplay360.com',
    displayName: 'Leo Messi (Mock)',
    role: 'player',
    plan: 'trial',
    subscriptionStatus: 'trialing',
    trialEndsAt: '2026-02-01T10:00:00Z',
    onboardingCompleted: true,
    createdAt: '2026-01-01T10:00:00Z'
  },
  {
    uid: 'user-coach-1',
    email: 'coach@globalplay360.com',
    displayName: 'Pep Guardiola (Mock)',
    role: 'coach',
    plan: 'premium',
    subscriptionStatus: 'active',
    trialEndsAt: '2026-02-02T10:00:00Z',
    onboardingCompleted: true,
    createdAt: '2026-01-02T10:00:00Z'
  },
  {
    uid: 'user-club-1',
    email: 'club@globalplay360.com',
    displayName: 'FC Barcelona (Mock)',
    role: 'club',
    plan: 'pro',
    subscriptionStatus: 'active',
    trialEndsAt: '2026-02-03T10:00:00Z',
    onboardingCompleted: true,
    createdAt: '2026-01-03T10:00:00Z'
  }
];

export const mockProfiles: Profile[] = [
  {
    id: 'prof-player-1',
    userId: 'user-player-1',
    type: 'player',
    name: 'Leo Messi',
    sport: 'Football',
    country: 'Argentina',
    description: 'Looking for a new challenge in Europe.',
    stats: {
      matches: 104,
      goals: 89,
      assists: 45
    },
    mediaUrls: ['https://example.com/video1.mp4']
  },
  {
    id: 'prof-coach-1',
    userId: 'user-coach-1',
    type: 'coach',
    name: 'Pep Guardiola',
    sport: 'Football',
    country: 'Spain',
    description: 'UEFA Pro License coach looking for an ambitious project.',
    stats: {
      experienceYears: 15,
      titles: 30
    }
  },
  {
    id: 'prof-club-1',
    userId: 'user-club-1',
    type: 'club',
    name: 'FC Barcelona',
    sport: 'Football',
    country: 'Spain',
    description: 'Top European club looking for young talents.',
    stats: {
      founded: 1899,
      stadiumCapacity: 99354
    }
  }
];

export const mockOpportunities: Opportunity[] = [
  {
    id: 'opp-1',
    clubId: 'user-club-1', // Link to the club's userId 
    title: 'First Team Striker Needed',
    sport: 'Football',
    gender: 'male',
    location: 'Barcelona, Spain',
    contractType: 'pro',
    description: 'We are looking for a young, clinical striker for our first team. You will be training at our elite facilities, with full board and lodging covered. Must have a European passport and previous professional experience.',
    requirements: ['Under 23', 'European Passport', 'Minimum 20 goals last season', 'Available next month'],
    status: 'open',
    createdAt: '2026-04-10T09:00:00Z'
  },
  {
    id: 'opp-2',
    clubId: 'user-club-1',
    title: 'Goalkeeper Coach',
    sport: 'Football',
    gender: 'mixed',
    location: 'Madrid, Spain',
    contractType: 'pro',
    description: 'Urgently need an experienced goalkeeper coach for the senior teams (both men and women). High intensity, tactical understanding, and ability to handle elite professionals required.',
    requirements: ['UEFA A License', '5+ years experience', 'Fluent in Spanish and English'],
    status: 'open',
    createdAt: '2026-04-12T14:30:00Z'
  }
];

export const mockApplications: Application[] = [
  {
    id: 'app-1',
    opportunityId: 'opp-1',
    userId: 'user-player-1',
    clubId: 'user-club-1',
    status: 'submitted',
    createdAt: '2026-04-14T10:15:00Z',
    message: 'I would love to join your academy. Here is my highlight reel!'
  },
  {
    id: 'app-2',
    opportunityId: 'opp-2',
    userId: 'user-player-1',
    clubId: 'user-club-1',
    status: 'in_review',
    createdAt: '2026-04-10T11:00:00Z',
    message: 'I have experience internationally and can contribute immediately.'
  },
  {
    id: 'app-3',
    opportunityId: 'opp-1',
    userId: 'user-player-1',
    clubId: 'user-club-1',
    status: 'accepted',
    createdAt: '2026-03-20T09:30:00Z',
    message: 'Looking forward to the trials.'
  },
  {
    id: 'app-4',
    opportunityId: 'opp-2',
    userId: 'user-player-1',
    clubId: 'user-club-1',
    status: 'rejected',
    createdAt: '2026-02-15T14:45:00Z',
    message: 'Thanks for considering my profile.'
  }
];

export const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    participants: ['user-player-1', 'user-club-1'],
    lastMessage: 'We are reviewing your application.',
    updatedAt: '2026-04-15T16:00:00Z',
    isPremiumLocked: false // Player can see this if club initiated or both premium
  },
  {
    id: 'conv-2',
    participants: ['user-player-1', 'user-coach-1'],
    lastMessage: 'Are you available for a trial?',
    updatedAt: '2026-04-16T09:00:00Z',
    isPremiumLocked: true // Locked for free player
  }
];

export const mockMessages: Message[] = [
  {
    id: 'msg-1',
    conversationId: 'conv-1',
    senderId: 'user-player-1',
    text: 'Hello! Have you seen my application?',
    createdAt: '2026-04-15T15:30:00Z',
    read: true
  },
  {
    id: 'msg-2',
    conversationId: 'conv-1',
    senderId: 'user-club-1',
    text: 'We are reviewing your application.',
    createdAt: '2026-04-15T16:00:00Z',
    read: false
  },
  // the locked conversation messages
  {
    id: 'msg-3',
    conversationId: 'conv-2',
    senderId: 'user-coach-1',
    text: 'Are you available for a trial?',
    createdAt: '2026-04-16T09:00:00Z',
    read: false
  }
];

export const mockSubscriptions: Subscription[] = [
  {
    id: 'sub-coach-1',
    userId: 'user-coach-1',
    plan: 'premium',
    status: 'active',
    currentPeriodEnd: '2027-01-01T00:00:00Z'
  },
  {
    id: 'sub-club-1',
    userId: 'user-club-1',
    plan: 'pro',
    status: 'active',
    currentPeriodEnd: '2027-01-01T00:00:00Z'
  }
];