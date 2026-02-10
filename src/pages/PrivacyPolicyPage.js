import React from 'react';
import Navigation from '../components/Navigation';
import FooterSection from '../components/LandingPageComponents/FooterSection';

const PrivacyPolicyPage = () => {
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
            Privacy Policy
          </h1>
          <div className="w-48 h-1 mx-auto mb-8" style={{ backgroundColor: '#BDE958' }}></div>
          <p 
            className="text-lg text-gray-300"
            style={{ fontFamily: 'DM Sans, sans-serif' }}
          >
            We value and protect your privacy
          </p>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="flex-grow px-4 py-12 max-w-4xl mx-auto">
        <div className="bg-neutral-800 rounded-lg shadow-lg p-8 mb-8">
          <div className="mb-8 pb-6 border-b border-gray-700">
            <p 
              className="text-lg font-medium text-gray-300"
              style={{ fontFamily: 'DM Sans, sans-serif' }}
            >
              At Foodoscope, we respect your privacy and are committed to protecting your personal information.
            </p>
          </div>
          
          <div className="mb-8">
            <h2 
              className="text-2xl font-bold mb-4 text-white flex items-center"
              style={{ fontFamily: 'DM Sans, sans-serif' }}
            >
              <div className="mr-3 p-2 rounded-full" style={{ backgroundColor: '#BDE958' }}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ color: '#1D1D1D' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              What We Collect
            </h2>
            <ul className="list-none space-y-3 pl-4 mb-4">
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center rounded-full p-1 mr-3 mt-1" style={{ backgroundColor: '#BDE958' }}>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" style={{ color: '#1D1D1D' }}>
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                </span>
                <span className="text-gray-300" style={{ fontFamily: 'DM Sans, sans-serif' }}>Name, email, and contact details (for account registration)</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center rounded-full p-1 mr-3 mt-1" style={{ backgroundColor: '#BDE958' }}>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" style={{ color: '#1D1D1D' }}>
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                </span>
                <span className="text-gray-300" style={{ fontFamily: 'DM Sans, sans-serif' }}>Usage data (API calls, access logs)</span>
              </li>
            </ul>
          </div>
          
          <div className="mb-8">
            <h2 
              className="text-2xl font-bold mb-4 text-white flex items-center"
              style={{ fontFamily: 'DM Sans, sans-serif' }}
            >
              <div className="mr-3 p-2 rounded-full" style={{ backgroundColor: '#BDE958' }}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ color: '#1D1D1D' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              How We Use It
            </h2>
            <ul className="list-none space-y-3 pl-4 mb-4">
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center rounded-full p-1 mr-3 mt-1" style={{ backgroundColor: '#BDE958' }}>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" style={{ color: '#1D1D1D' }}>
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                </span>
                <span className="text-gray-300" style={{ fontFamily: 'DM Sans, sans-serif' }}>To improve our services and user experience</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center rounded-full p-1 mr-3 mt-1" style={{ backgroundColor: '#BDE958' }}>
                  <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                </span>
                <span className="text-gray-700 dark:text-gray-300">To improve our services and user experience</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center rounded-full p-1 mr-3 mt-1" style={{ backgroundColor: '#BDE958' }}>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" style={{ color: '#1D1D1D' }}>
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                </span>
                <span className="text-gray-300" style={{ fontFamily: 'DM Sans, sans-serif' }}>To communicate updates and respond to inquiries</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center rounded-full p-1 mr-3 mt-1" style={{ backgroundColor: '#BDE958' }}>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" style={{ color: '#1D1D1D' }}>
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                </span>
                <span className="text-gray-300" style={{ fontFamily: 'DM Sans, sans-serif' }}>To comply with legal obligations</span>
              </li>
            </ul>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-neutral-700 p-6 rounded-lg">
              <h2 
                className="text-xl font-bold mb-3 text-white"
                style={{ fontFamily: 'DM Sans, sans-serif' }}
              >
                Data Sharing
              </h2>
              <p 
                className="text-gray-300"
                style={{ fontFamily: 'DM Sans, sans-serif' }}
              >
                We do not sell your data. We may share data with trusted third-party processors under strict confidentiality.
              </p>
            </div>
            
            <div className="bg-neutral-700 p-6 rounded-lg">
              <h2 
                className="text-xl font-bold mb-3 text-white"
                style={{ fontFamily: 'DM Sans, sans-serif' }}
              >
                Data Security
              </h2>
              <p 
                className="text-gray-300"
                style={{ fontFamily: 'DM Sans, sans-serif' }}
              >
                All data is encrypted in transit and stored securely.
              </p>
            </div>
            
            <div className="bg-neutral-700 p-6 rounded-lg">
              <h2 
                className="text-xl font-bold mb-3 text-white"
                style={{ fontFamily: 'DM Sans, sans-serif' }}
              >
                Your Rights
              </h2>
              <p 
                className="text-gray-300"
                style={{ fontFamily: 'DM Sans, sans-serif' }}
              >
                You may request access, correction, or deletion of your personal data by emailing contact@foodoscope.com
              </p>
            </div>
            
            <div className="bg-neutral-700 p-6 rounded-lg">
              <h2 
                className="text-xl font-bold mb-3 text-white"
                style={{ fontFamily: 'DM Sans, sans-serif' }}
              >
                Policy Updates
              </h2>
              <p 
                className="text-gray-300"
                style={{ fontFamily: 'DM Sans, sans-serif' }}
              >
                This policy may be updated periodically. Continued use constitutes agreement. For questions or concerns, contact: contact@foodoscope.com
              </p>
            </div>
          </div>
        </div>
      </div>
      <FooterSection />
    </main>
  );
};

export default PrivacyPolicyPage;
