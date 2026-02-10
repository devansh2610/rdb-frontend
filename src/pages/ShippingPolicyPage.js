import React from "react";
import Navigation from "../components/Navigation";
import FooterSection from "../components/LandingPageComponents/FooterSection";

const ShippingPolicyPage = () => {
  return (
    <main className="min-h-screen flex flex-col bg-neutral-900 text-gray-100">
      <Navigation stay={true} />

      {/* Hero Section */}
      <div className="w-full bg-neutral-900 pt-28 pb-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ fontFamily: 'Sometype Mono, monospace', color: '#BDE958' }}
          >
            Shipping Policy
          </h1>
          <div className="w-48 h-1 mx-auto mb-8" style={{ backgroundColor: '#BDE958' }}></div>
          <p 
            className="text-lg text-gray-300"
            style={{ fontFamily: 'DM Sans, sans-serif' }}
          >
            Digital delivery. Zero shipping hassle.
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-grow px-4 py-12 max-w-4xl mx-auto">
        <div className="bg-neutral-800 rounded-lg shadow-lg p-8">
          <h2 
            className="text-2xl font-bold mb-6 text-white"
            style={{ fontFamily: 'DM Sans, sans-serif' }}
          >
            Shipping Policy
          </h2>
          <p 
            className="text-gray-300 mb-6"
            style={{ fontFamily: 'DM Sans, sans-serif' }}
          >
            Foodoscope does not deal in physical goods or logistics. All our
            offerings—including APIs, data products, and analytics tools—are
            delivered digitally via secure online portals or email.
          </p>
          <ul 
            className="list-disc pl-6 space-y-4 text-gray-300"
            style={{ fontFamily: 'DM Sans, sans-serif' }}
          >
            <li>
              Access to APIs and digital services is granted via credentials and
              API keys upon successful registration and payment.
            </li>
            <li>There are no shipping charges applicable.</li>
            <li>
              Delivery timelines for onboarding or access may range from 1 to 3
              business days.
            </li>
          </ul>
          <p 
            className="mt-6 text-gray-300"
            style={{ fontFamily: 'DM Sans, sans-serif' }}
          >
            For enterprise onboarding or technical support, reach out to
            <a
              href="mailto:contact@foodoscope.com"
              className="hover:underline ml-1"
              style={{ color: '#BDE958' }}
            >
              contact@foodoscope.com
            </a>
            .
          </p>
        </div>
      </div>

      <FooterSection />
    </main>
  );
};

export default ShippingPolicyPage;
