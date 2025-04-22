import axios from "axios";
import { TestDetails } from "@/types/test";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

/**
 * Comprehensive test type definition
 */
interface Test {
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

/**
 * Active test display model - excludes referral and test info
 */
interface ActiveTest {
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

/**
 * Referred test display model - includes referral and test info
 */
interface ReferredTest {
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

/**
 * History test display model - completed and expired tests
 */
interface HistoryTest {
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

/**
 * Fetch all user tests
 * @param userId User identifier
 * @returns Array of test objects
 */
export const getUserTests = async (userId: string): Promise<Test[]> => {
  try {
    const res = await axios.get(
      `${BASE_URL}/tests/get_user_tests.php?userId=${userId}`
    );
    return res.data.tests || [];
  } catch (error) {
    console.error("Error getting user test history:", error);
    return [];
  }
};

/**
 * Get active tests for a user
 * @param userId User identifier
 * @returns Array of active tests
 */
export const getActiveTests = async (userId: string): Promise<ActiveTest[]> => {
  try {
    const allTests = await getUserTests(userId);

    return allTests
      .filter((test) => test.status === "active")
      .map(
        ({
          bookingId,
          testSlug,
          status,
          expiryDate,
          daysRemaining,
          purchaseDate,
          payment,
        }) => ({
          bookingId,
          testSlug,
          status: "active" as const,
          expiryDate,
          daysRemaining,
          purchaseDate,
          payment,
        })
      );
  } catch (error) {
    console.error("Error getting active tests:", error);
    return [];
  }
};

/**
 * Get tests referred by professionals for a user
 * @param userId User identifier
 * @returns Array of referred tests with referrer info and test details
 */
export const getReferredTests = async (
  userId: string
): Promise<ReferredTest[]> => {
  try {
    const allTests = await getUserTests(userId);

    return allTests
      .filter(
        (test) =>
          test.referredBy !== null && test.referredBy !== undefined && test.test
      )
      .map(
        ({
          bookingId,
          testSlug,
          status,
          expiryDate,
          daysRemaining,
          purchaseDate,
          referredBy,
          payment,
          test,
        }) => ({
          bookingId,
          testSlug,
          status,
          expiryDate,
          daysRemaining,
          purchaseDate,
          referredBy: referredBy!,
          payment,
          test: test!,
        })
      );
  } catch (error) {
    console.error("Error getting referred tests:", error);
    return [];
  }
};

/**
 * Get test history (completed and expired tests) for a user
 * @param userId User identifier
 * @returns Array of completed and expired tests
 */
export const getTestHistory = async (
  userId: string
): Promise<HistoryTest[]> => {
  try {
    const allTests = await getUserTests(userId);

    return allTests
      .filter(
        (test) =>
          test.status === "completed" ||
          test.isCompleted ||
          test.status === "expired"
      )
      .map(
        ({
          bookingId,
          testSlug,
          status,
          expiryDate,
          isCompleted,
          completedAt,
          responseId,
          purchaseDate,
          payment,
        }) => ({
          bookingId,
          testSlug,
          status:
            status === "completed" || isCompleted
              ? "completed"
              : ("expired" as "completed" | "expired"),
          expiryDate,
          isCompleted,
          completedAt,
          responseId,
          purchaseDate,
          payment,
        })
      );
  } catch (error) {
    console.error("Error getting test history:", error);
    return [];
  }
};

/**
 * Check if a user has pending payments for any tests
 * @param userId User identifier
 * @returns Boolean indicating if there are pending payments
 */
export const hasPendingTestPayments = async (
  userId: string
): Promise<boolean> => {
  try {
    const allTests = await getUserTests(userId);
    return allTests.some(
      (test) => test.payment.status === "pending" || !test.payment.isPaid
    );
  } catch (error) {
    console.error("Error checking pending test payments:", error);
    return false;
  }
};

/**
 * Get total amount spent on tests by a user
 * @param userId User identifier
 * @returns Total amount and currency
 */
export const getTotalTestSpending = async (
  userId: string
): Promise<{ amount: number; currency: string }> => {
  try {
    const allTests = await getUserTests(userId);
    const paidTests = allTests.filter((test) => test.payment.isPaid);

    if (paidTests.length === 0) {
      return { amount: 0, currency: "USD" };
    }

    // Assuming all payments are in the same currency
    const currency = paidTests[0].payment.currency;
    const totalAmount = paidTests.reduce(
      (sum, test) => sum + test.payment.amount,
      0
    );

    return { amount: totalAmount, currency };
  } catch (error) {
    console.error("Error calculating total test spending:", error);
    return { amount: 0, currency: "USD" };
  }
};

export const getAllTests = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/tests/get_all_tests.php`);
    return res.data.tests as TestDetails[];
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const bookTest = async (
  userId: string,
  testSlug: string,
  amount: number
) => {
  try {
    await axios.post(`${BASE_URL}/tests/book_test.php`, {
      userId: userId,
      testSlug: testSlug,
      paymentMode: "Unified Payments",
      transactionId: `pay_${Math.floor(Math.random() * 100000000000000)
        .toString()
        .padStart(14, "0")}`,
      amount: amount,
      currency: "INR",
      notes: "Additional notes",
    });
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};
