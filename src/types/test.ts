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
