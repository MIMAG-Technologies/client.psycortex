"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { search, SearchResult } from "@/utils/search";
import OneExpertCard from "@/components/experts/OneExpertCard";
import TestCard from "@/components/test/TestCard";
import { useAuth } from "@/context/AuthContext";
import { FaSearch, FaSpinner } from "react-icons/fa";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const { me, userAge } = useAuth();
  const query = searchParams.get("q") || "";
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) return;
      
      setLoading(true);
      try {
        const results = await search(query);
        setSearchResults(results);
      } catch (error) {
        console.error("Error fetching search results:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  const handleTakeTest = (testSlug: string) => {
    window.location.href = `/test-preparation?slug=${testSlug}`;
  };

  return (
    <div className="container mx-auto px-4 py-24 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Search Results</h1>
        <div className="flex items-center text-gray-600">
          <FaSearch className="mr-2" />
          <p>
            {query ? (
              <span>Results for "<span className="font-medium text-[#642494]">{query}</span>"</span>
            ) : (
              "Enter a search term to find tests and experts"
            )}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-60">
          <FaSpinner className="animate-spin text-[#642494] text-3xl" />
        </div>
      ) : (
        <div>
          {/* Display when no results or no query */}
          {(!searchResults || 
            (searchResults.tests.length === 0 && searchResults.counsellors.length === 0)) && 
            query && !loading && (
            <div className="text-center py-16">
              <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <FaSearch className="text-gray-400 text-2xl" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">No results found</h2>
              <p className="text-gray-500">
                We couldn't find any matches for "{query}". Please try a different search term.
              </p>
            </div>
          )}

          {/* Tests Section */}
          {searchResults && searchResults.tests.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Tests</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.tests.map((test) => (
                  <TestCard 
                    key={test.slug} 
                    test={test} 
                    userAge={userAge} 
                    onTakeTest={handleTakeTest} 
                  />
                ))}
              </div>
            </div>
          )}

          {/* Experts Section */}
          {searchResults && searchResults.counsellors.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Experts</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.counsellors.map((counsellor) => (
                  <OneExpertCard 
                    key={counsellor.id} 
                    {...counsellor}
                    variant="simple" 
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 