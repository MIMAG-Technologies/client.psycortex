export type TestDetails = {
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  imageUrl: string | null;
  benefits: string[];
  details: {
    durationMinutes: number;
    totalQuestions: number;
    minimumAge: number | null;
    maximumAge: number | null;
  };
  pricing: {
    originalPrice: number;
    discount: number | null;
    amount: number;
    currency: string;
    taxPercent: number;
  };
};

export type UserTest =  {
  bookingId: string;
  testSlug: string;
  status: "active" | "completed" | "expired";
  expiryDate: string;
  daysRemaining: number | null;
  isCompleted: boolean;
  completedAt: string | null;
  responseId: number | null;
  purchaseDate: string;
  referredBy?: {
    id: string;
    name: string;
    image: string;
    title: string;
  } | null;
  payment: {
    status: "paid" | "pending";
    isPaid: boolean;
    mode: string | null;
    transactionId: string | null;
    amount: number;
    currency: string;
  };
  notes?: string | null;
  test?: {
    slug: string;
    name: string;
    description: string;
    shortDescription: string;
    imageUrl: string;
    benefits: string[];
    details: {
      durationMinutes: number;
      totalQuestions: number;
      minimumAge: number;
      maximumAge: number;
    };
    pricing: {
      originalPrice: number;
      discount: number | null;
      amount: number;
      currency: string;
      taxPercent: number;
    };
    status: "active" | "inactive";
  };
}

export type ActiveTest =  {
  bookingId: string;
  testSlug: string;
  status: "active";
  expiryDate: string;
  daysRemaining: number | null;
  purchaseDate: string;
  payment: {
    status: "paid" | "pending";
    isPaid: boolean;
    mode: string | null;
    transactionId: string | null;
    amount: number;
    currency: string;
  };
}

export type ReferredTest =  {
  bookingId: string;
  testSlug: string;
  status: "active" | "completed" | "expired";
  expiryDate: string;
  daysRemaining: number | null;
  purchaseDate: string;
  referredBy: {
    id: string;
    name: string;
    image: string;
    title: string;
  };
  payment: {
    status: "paid" | "pending";
    isPaid: boolean;
    mode: string | null;
    transactionId: string | null;
    amount: number;
    currency: string;
  };
  test: {
    slug: string;
    name: string;
    description: string;
    shortDescription: string;
    imageUrl: string;
    benefits: string[];
    details: {
      durationMinutes: number;
      totalQuestions: number;
      minimumAge: number;
      maximumAge: number;
    };
    pricing: {
      originalPrice: number;
      discount: number | null;
      amount: number;
      currency: string;
      taxPercent: number;
    };
    status: "active" | "inactive";
  };
}

export type HistoryTest =  {
  bookingId: string;
  testSlug: string;
  status: "completed" | "expired";
  expiryDate: string;
  isCompleted: boolean;
  completedAt: string | null;
  responseId: number | null;
  purchaseDate: string;
  payment: {
    status: "paid" | "pending";
    isPaid: boolean;
    mode: string | null;
    transactionId: string | null;
    amount: number;
    currency: string;
  };
}