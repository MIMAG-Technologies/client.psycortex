// Base session interface with common properties
export interface BaseSession {
  id: string;
  scheduledAt: string;
  duration: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  counsellor: {
    id: string;
    name: string;
    image: string;
    title: string;
    experience: number;
    rating: string;
  };
}

// Call sessions
export interface CallSession extends BaseSession {
  is_couple_session: boolean | null;
  userNotes?: string;
  userPhone: string;
  review?: {
    rating: string;
    feedback: string;
  };
  counsellorNotes?: string;
  actions: {
    canJoin: boolean;
    canCancel: boolean;
    canRate: boolean;
  };
}

// Chat sessions
export interface ChatSession extends BaseSession {
  is_couple_session: boolean | null;
  startedAt: string | null;
  endedAt: string | null;
  actualDuration: number | null;
  attendance: {
    userJoined: boolean;
    counsellorJoined: boolean;
  };
  cancellation: any;
  review: {
    rating: string;
    feedback: string;
  } | null;
  actions: {
    canJoin: boolean;
    canCancel: boolean;
    canRate: boolean;
  };
}

// Video sessions
export interface VideoSession extends BaseSession {
   is_couple_session: boolean | null;
  notes: string;
  meetLink: string;
  calendarLink: string;
  startedAt: string | null;
  endedAt: string | null;
  actualDuration: number | null;
  attendance: {
    userJoined: boolean;
    counsellorJoined: boolean;
  };
  cancellation: null | {
    reason?: string;
    cancelledAt?: string;
  };
  review: null | {
    rating: number;
    comment?: string;
  };
  actions: {
    canJoin: boolean;
    canCancel: boolean;
    canRate: boolean;
  };
}

// In-person (offline) sessions
export interface OfflineSession {
  id: string;
  user_id: string;
  counsellor_id: string;
  scheduled_at: string;
  duration_minutes: number;
  branch_id: number;
  status: string;
  cancelled_by: string | null;
  cancelled_at: string | null;
  cancelled_reason: string | null;
  created_at: string;
  updated_at: string;
  is_group_counselling: 0 | 1;
  group_id: string | null;
  counsellor?: {
    id: string;
    name: string;
    image: string;
    title: string;
    experience: number;
    rating: string;
  };
}

// Combined session type
export type Session = CallSession | ChatSession | VideoSession | OfflineSession;

// History item structure
export interface HistoryItem {
  date: string;
  mode: 'in_person' | 'video' | 'chat' | 'call';
  counsellorName: string;
}

// Test related types
export interface TestPayment {
  id: string;
  amount: number;
  currency: string;
  isPaid: boolean;
  status: 'paid' | 'pending' | 'failed';
  paymentMethod?: string;
  transactionId?: string;
  paymentDate?: string;
}

export interface Referrer {
  id: string;
  name: string;
  specialization?: string;
  avatar?: string;
}

export interface TestDetails {
  id: string;
  title: string;
  slug: string;
  description: string;
  duration: number;
  price: number;
  currency: string;
  category: string;
  tags: string[];
  thumbnail?: string;
}

export interface BaseTest {
  bookingId: string;
  testSlug: string;
  status: 'active' | 'completed' | 'expired' | 'pending';
  expiryDate: string;
  daysRemaining?: number;
  purchaseDate: string;
  payment: TestPayment;
}

export interface ActiveTest extends BaseTest {
  status: 'active';
}

export interface ReferredTest extends BaseTest {
  referredBy: Referrer;
  test: TestDetails;
}

export interface HistoryTest extends BaseTest {
  status: 'completed' | 'expired';
  isCompleted?: boolean;
  completedAt?: string;
  responseId?: string;
} 