import { FaHeartbeat, FaUserMd, FaClipboardList } from "react-icons/fa";
import Link from "next/link";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-indigo-700">Welcome to Psycortex</h1>
        <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8">
          Expert mental health services and assessments to help you on your journey to wellness.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link 
            href="/experts" 
            className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Meet Our Experts
          </Link>
          <Link 
            href="/tests" 
            className="px-6 py-3 border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50 transition-colors"
          >
            Take a Test
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-10 text-gray-800">Our Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<FaHeartbeat className="text-indigo-600 text-4xl" />}
            title="Mental Wellness"
            description="Comprehensive support for your mental health journey with personalized care plans."
          />
          <FeatureCard 
            icon={<FaUserMd className="text-indigo-600 text-4xl" />}
            title="Expert Consultations"
            description="Connect with certified mental health professionals for guidance and treatment."
          />
          <FeatureCard 
            icon={<FaClipboardList className="text-indigo-600 text-4xl" />}
            title="Assessment Tests"
            description="Scientifically validated tests to help understand your mental health needs."
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-indigo-50 rounded-xl p-8 md:p-12 text-center">
        <h2 className="text-3xl font-bold mb-4 text-indigo-800">Ready to Start Your Journey?</h2>
        <p className="text-lg mb-6 text-gray-700 max-w-2xl mx-auto">
          Take the first step towards better mental health today.
        </p>
        <Link 
          href="/login" 
          className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors inline-block"
        >
          Get Started
        </Link>
      </section>
    </div>
  );
}

// Feature Card Component
function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow text-center">
      <div className="mb-4 flex justify-center">{icon}</div>
      <h3 className="text-xl font-semibold mb-3 text-gray-800">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
