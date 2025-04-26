"use client";

import { useState, useEffect } from 'react';
import { bookTest } from '@/utils/test';
import { TestDetails } from '@/types/test';
import { FaSearch, FaInfoCircle, FaGlobeAmericas, FaFlag } from 'react-icons/fa';
import TestCard from '@/components/test/TestCard';
import TestDetailsModal from '@/components/test/TestDetailsModal';
import { useAuth } from '@/context/AuthContext';
import { useTests } from '@/context/TestContext';
import { toast } from 'react-toastify';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function Tests() {
  const { tests, isLoading } = useTests();
  const [searchTerm, setSearchTerm] = useState('');
  const [testType, setTestType] = useState<'indian' | 'global'>('indian');
  const [selectedTest, setSelectedTest] = useState<TestDetails | null>(null);
  const [showModal, setShowModal] = useState(false);
  const { userAge, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if opentest parameter exists
    const openTestSlug = searchParams.get('opentest');
    if (openTestSlug && tests.length > 0) {
      const testToOpen = tests.find(t => t.slug === openTestSlug);
      if (testToOpen) {
        setSelectedTest(testToOpen);
        setShowModal(true);
      }
    }
  }, [searchParams, tests]);

  const booktest = async (testSlug: string, amount: number) => {
    if (!user?.uid) {
      toast.error('Login to Purchase Test')
      return;
    }
    const res = await bookTest(user?.uid, testSlug, amount)
    if (res) {
      toast.success('Test Purchase Successfully');
      router.push('/profile/tests');
      
    }
    else {
      toast.error('Error while purchase in test , please try again later!')
    }
  }

  const handleTakeTest = (testSlug: string) => {
    const test = tests.find(t => t.slug === testSlug);
    if (test) {
      setSelectedTest(test);
      setShowModal(true);
    }
  };

  // Filter tests based on search term, test type, and age requirements
  const filteredTests = tests.filter((test) => {
    const matchesSearch = test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.shortDescription.toLowerCase().includes(searchTerm.toLowerCase());
    const isIndian = test.slug.includes('india') || test.slug.includes('indian');

    return matchesSearch && (
      (testType === 'indian' && !isIndian) ||
      (testType === 'global' && isIndian)
    );
  });

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-purple-800 mb-2">Psychological Tests</h1>
        <p className="text-gray-600">
          Discover professional psychological tests to help understand your mental health better
        </p>
      </div>
      

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search tests..."
            className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
        <div className="flex w-full md:w-auto">
          <button
            className={`flex-1 md:flex-auto px-6 py-2 rounded-l-md flex items-center justify-center gap-2 ${testType === 'indian' ? 'bg-purple-800 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            onClick={() => setTestType('indian')}
          >
            <FaFlag />
            <span>Indian Tests</span>
          </button>
          <button
            className={`flex-1 md:flex-auto px-6 py-2 rounded-r-md flex items-center justify-center gap-2 ${testType === 'global' ? 'bg-purple-800 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            onClick={() => setTestType('global')}
          >
            <FaGlobeAmericas />
            <span>Global Tests</span>
          </button>
        </div>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      ) : filteredTests.length === 0 ? (
        <div className="text-center py-16">
          <FaInfoCircle className="text-4xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-600">No tests found</h3>
          <p className="text-gray-500 mt-2">Try adjusting your filters or search term</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTests.map((test) => (
            <TestCard
              key={test.slug}
              test={test}
              userAge={userAge}
              onTakeTest={handleTakeTest}
            />
          ))}
        </div>
      )}

      {/* Test Details Modal */}
      {showModal && selectedTest && (
        <TestDetailsModal
          booktest={booktest}
          isLoggedIn={user !== null}
          test={selectedTest}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
