"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { TestDetails } from "@/types/test";
import { getAllTests } from "@/utils/test";

type TestDataMap = {
  [slug: string]: TestDetails;
};

type TestContextType = {
  testsData: TestDataMap;
  tests: TestDetails[]; 
  isLoading: boolean;
  getTestBySlug: (slug: string) => TestDetails | undefined;
  refreshTests: () => Promise<void>; // Method to refresh test data
};

const TestContext = createContext<TestContextType | undefined>(undefined);

export function TestProvider({ children }: { children: ReactNode }) {
  const [testsData, setTestsData] = useState<TestDataMap>({});
  const [tests, setTests] = useState<TestDetails[]>([]); // Store tests array
  const [isLoading, setLoading] = useState(true);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const allTests = await getAllTests();
      
      // Store the array of tests
      setTests(allTests);
      
      // Convert array to a map with slug as key
      const testsMap: TestDataMap = {};
      allTests.forEach(test => {
        testsMap[test.slug] = test;
      });
      
      setTestsData(testsMap);
    } catch (error) {
      console.error("Error fetching tests data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const refreshTests = async () => {
    await fetchTests();
  };

  const getTestBySlug = (slug: string): TestDetails | undefined => {
    return testsData[slug];
  };

  return (
    <TestContext.Provider
      value={{
        testsData,
        tests,
        isLoading,
        getTestBySlug,
        refreshTests
      }}
    >
      {children}
    </TestContext.Provider>
  );
}

export function useTests() {
  const context = useContext(TestContext);
  if (context === undefined) {
    throw new Error("useTests must be used within a TestProvider");
  }
  return context;
} 