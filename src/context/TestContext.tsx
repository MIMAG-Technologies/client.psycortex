"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { TestDetails } from "@/types/test";
import { getAllTests } from "@/utils/test";

type TestDataMap = {
  [slug: string]: TestDetails;
};

type TestContextType = {
  testsData: TestDataMap;
  isLoading: boolean;
  getTestBySlug: (slug: string) => TestDetails | undefined;
};

const TestContext = createContext<TestContextType | undefined>(undefined);

export function TestProvider({ children }: { children: ReactNode }) {
  const [testsData, setTestsData] = useState<TestDataMap>({});
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        setLoading(true);
        const allTests = await getAllTests();
        
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

    fetchTests();
  }, []);

  const getTestBySlug = (slug: string): TestDetails | undefined => {
    return testsData[slug];
  };

  return (
    <TestContext.Provider
      value={{
        testsData,
        isLoading,
        getTestBySlug
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