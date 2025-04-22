import axios from "axios";
import { ActiveTest, HistoryTest, ReferredTest, TestDetails, UserTest } from "@/types/test";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;


export const getAllUserTestData = async (
  userId: string
): Promise<{
  allTests: UserTest[];
  activeTests: ActiveTest[];
  referredTests: ReferredTest[];
  historyTests: HistoryTest[];
  hasPendingPayments: boolean;
  totalSpending: { amount: number; currency: string };
}> => {
  try {
    const res = await axios.get(
      `${BASE_URL}/tests/get_user_tests.php?userId=${userId}`
    );
    const allTests: UserTest[] = res.data.tests || [];

    const activeTests: ActiveTest[] = allTests
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

    const referredTests: ReferredTest[] = allTests
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

    const historyTests: HistoryTest[] = allTests
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

    const hasPendingPayments = allTests.some(
      (test) => test.payment.status === "pending" || !test.payment.isPaid
    );

    const paidTests = allTests.filter((test) => test.payment.isPaid);
    const totalSpending = {
      amount: paidTests.reduce((sum, test) => sum + test.payment.amount, 0),
      currency: paidTests[0]?.payment.currency || "USD",
    };

    return {
      allTests,
      activeTests,
      referredTests,
      historyTests,
      hasPendingPayments,
      totalSpending,
    };
  } catch (error) {
    console.error("Error fetching user test data:", error);
    return {
      allTests: [],
      activeTests: [],
      referredTests: [],
      historyTests: [],
      hasPendingPayments: false,
      totalSpending: { amount: 0, currency: "USD" },
    };
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
