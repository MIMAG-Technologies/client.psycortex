'use client';
import Link from 'next/link';
import { FaUserMd, FaClipboardList, FaChevronRight, FaStar, FaArrowRight } from 'react-icons/fa';
import { MdOutlineScreenSearchDesktop } from 'react-icons/md';
import { useCounsellorContext } from '@/context/CounsellorContext';
import { useTests } from '@/context/TestContext';
import TestCard from '@/components/test/TestCard';
import OneExpertCard from '@/components/experts/OneExpertCard';
import Footer from '@/components/Footer';

export default function Home() {
  const { counsellors, loading: counsellorsLoading } = useCounsellorContext();
  const { tests, isLoading: testsLoading } = useTests();

  // Get top 3 tests
  const topTests = tests.slice(0, 3);

  // Get top 3 experts sorted by rating
  const topExperts = [...counsellors]
    .sort((a, b) => b.rating.average - a.rating.average)
    .slice(0, 3);

  const isPageLoading = testsLoading || counsellorsLoading;

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="bg-gray-100 text-black py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Your Mental Health Journey Begins Here
              </h1>
              <p className="text-lg md:text-xl mb-8 opacity-90">
                Access expert mental health services, personalized assessments,
                and resources designed to support your well-being.
              </p>
              <div className="flex flex-col md:flex-row gap-4 w-full">
                <Link
                  href="/tests"
                  className="w-full md:w-auto px-6 py-3 bg-white text-[#642494] rounded-full font-medium hover:bg-gray-50 transition-colors flex items-center justify-center md:justify-start gap-2"
                >
                  Psychometric Tests <FaArrowRight size={14} />
                </Link>
                <Link
                  href="/experts"
                  className="w-full md:w-auto px-6 py-3 border border-[#642494] text-[#642494] rounded-full font-medium hover:bg-white/10 transition-colors text-center"
                >
                  Talk to our Experts
                </Link>
              </div>
            </div>
            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-md">
                <img
                  src="/hero.png"
                  alt="Mental Health Journey"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Our Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<FaUserMd className="text-[#642494] text-3xl" />}
              title="Expert Consultations"
              description="Connect with certified mental health professionals."
            />
            <FeatureCard
              icon={<FaClipboardList className="text-[#642494] text-3xl" />}
              title="Psychometric Tests"
              description="Scientifically validated tests for mental health needs."
            />
            <FeatureCard
              icon={
                <MdOutlineScreenSearchDesktop className="text-[#642494] text-3xl" />
              }
              title="Online Sessions"
              description="Convenient and private therapy from anywhere."
            />
          </div>
        </div>
      </section>

      {/* Top Tests Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800">Featured Tests</h2>
            <Link
              href="/tests"
              className="text-[#642494] font-medium flex items-center gap-1 hover:underline"
            >
              View All <FaChevronRight size={12} />
            </Link>
          </div>

          {testsLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#642494]"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topTests.map((test) => (
                <TestCard
                  key={test.slug}
                  test={test}
                  userAge={null}
                  onTakeTest={() =>
                    (window.location.href = `/tests?opentest=${test.slug}`)
                  }
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Top Experts Section */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800">Our Experts</h2>
            <Link
              href="/experts"
              className="text-[#642494] font-medium flex items-center gap-1 hover:underline"
            >
              View All <FaChevronRight size={12} />
            </Link>
          </div>

          {isPageLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#642494]"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topExperts.map((expert) => (
                <OneExpertCard key={expert.id} {...expert} variant="default" />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

// Feature Card Component
function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center">
      <div className="mb-4 flex justify-center">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-gray-800">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
