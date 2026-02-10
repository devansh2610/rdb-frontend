import React from "react";
import Navigation from "../components/Navigation";
import FooterSection from "../components/LandingPageComponents/FooterSection";

const CancellationRefundPage = () => {
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
            Cancellation & Refund Policy
          </h1>
          <div className="w-64 h-1 mx-auto mb-8" style={{ backgroundColor: '#BDE958' }}></div>
          <p 
            className="text-lg text-gray-300"
            style={{ fontFamily: 'DM Sans, sans-serif' }}
          >
            Our commitment to transparency in digital services
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
            Cancellation & Refund Policy
          </h2>
          <p 
            className="text-gray-300 mb-6"
            style={{ fontFamily: 'DM Sans, sans-serif' }}
          >
            At Foodoscope Technologies Private Limited, we strive to provide
            reliable and high-quality API services and data products. As we
            operate a digital, subscription-based model for API access and data
            tools, our cancellation and refund terms are as follows:
          </p>
          <ul 
            className="list-disc pl-6 space-y-4 text-gray-300"
            style={{ fontFamily: 'DM Sans, sans-serif' }}
          >
            <li>
              Subscriptions can be cancelled at any time prior to the next
              billing cycle.
            </li>
            <li>
              No refunds will be issued for any billing period that has already
              commenced or concluded.
            </li>
            <li>
              In case of erroneous charges or technical issues, please contact
              us at
              <a
                href="mailto:contact@foodoscope.com"
                className="hover:underline ml-1"
                style={{ color: '#BDE958' }}
              >
                contact@foodoscope.com
              </a>
              within 7 days of the transaction. We will review the request on a
              case-by-case basis.
            </li>
            <li>
              Refunds, if approved, will be processed within 7–10 working days
              to the original mode of payment.
            </li>
          </ul>
          <p 
            className="mt-6 text-gray-300"
            style={{ fontFamily: 'DM Sans, sans-serif' }}
          >
            For any queries or concerns, please write to us at
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

export default CancellationRefundPage;

