import React from 'react';
import Navigation from '../components/Navigation';
import FooterSection from '../components/LandingPageComponents/FooterSection';

const TermsAndConditionsPage = () => {
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
            Terms & Conditions
          </h1>
          <div className="w-72 h-1 mx-auto mb-8" style={{ backgroundColor: '#BDE958' }}></div>
          <p 
            className="text-lg text-gray-300"
            style={{ fontFamily: 'DM Sans, sans-serif' }}
          >
            Guidelines for using Foodoscope services
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
              Welcome to Foodoscope! By accessing or using our APIs, data, or services, you agree to the following terms:
            </p>
          </div>
          
          <div className="space-y-8">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <div 
                  className="flex items-center justify-center w-8 h-8 rounded-full font-bold text-lg"
                  style={{ backgroundColor: '#BDE958', color: '#1D1D1D' }}
                >
                  1
                </div>
              </div>
              <div className="ml-4">
                <h3 
                  className="text-xl font-bold text-white mb-2"
                  style={{ fontFamily: 'DM Sans, sans-serif' }}
                >
                  Use of Service
                </h3>
                <p 
                  className="text-gray-300"
                  style={{ fontFamily: 'DM Sans, sans-serif' }}
                >
                  You must be legally capable of entering into binding contracts. You agree not to misuse or reverse engineer our APIs or services.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <div 
                  className="flex items-center justify-center w-8 h-8 rounded-full font-bold text-lg"
                  style={{ backgroundColor: '#BDE958', color: '#1D1D1D' }}
                >
                  2
                </div>
              </div>
              <div className="ml-4">
                <h3 
                  className="text-xl font-bold text-white mb-2"
                  style={{ fontFamily: 'DM Sans, sans-serif' }}
                >
                  Intellectual Property
                </h3>
                <p 
                  className="text-gray-300"
                  style={{ fontFamily: 'DM Sans, sans-serif' }}
                >
                  All content, data models, and algorithms remain the property of Foodoscope. Unauthorized use or redistribution is prohibited.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <div 
                  className="flex items-center justify-center w-8 h-8 rounded-full font-bold text-lg"
                  style={{ backgroundColor: '#BDE958', color: '#1D1D1D' }}
                >
                  3
                </div>
              </div>
              <div className="ml-4">
                <h3 
                  className="text-xl font-bold text-white mb-2"
                  style={{ fontFamily: 'DM Sans, sans-serif' }}
                >
                  Payments & Refunds
                </h3>
                <p 
                  className="text-gray-300"
                  style={{ fontFamily: 'DM Sans, sans-serif' }}
                >
                  Our services are offered via subscription tiers. Payment must be completed before access. We do not offer refunds except in case of accidental double-billing or system failures.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <div 
                  className="flex items-center justify-center w-8 h-8 rounded-full font-bold text-lg"
                  style={{ backgroundColor: '#BDE958', color: '#1D1D1D' }}
                >
                  4
                </div>
              </div>
              <div className="ml-4">
                <h3 
                  className="text-xl font-bold text-white mb-2"
                  style={{ fontFamily: 'DM Sans, sans-serif' }}
                >
                  Termination
                </h3>
                <p 
                  className="text-gray-300"
                  style={{ fontFamily: 'DM Sans, sans-serif' }}
                >
                  We may suspend access for breach of terms or unlawful use.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <div 
                  className="flex items-center justify-center w-8 h-8 rounded-full font-bold text-lg"
                  style={{ backgroundColor: '#BDE958', color: '#1D1D1D' }}
                >
                  5
                </div>
              </div>
              <div className="ml-4">
                <h3 
                  className="text-xl font-bold text-white mb-2"
                  style={{ fontFamily: 'DM Sans, sans-serif' }}
                >
                  Limitation of Liability
                </h3>
                <p 
                  className="text-gray-300"
                  style={{ fontFamily: 'DM Sans, sans-serif' }}
                >
                  Foodoscope is not liable for any indirect losses or misuse of information.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-10 p-6 bg-neutral-700 rounded-lg border-l-4" style={{ borderColor: '#BDE958' }}>
            <div className="flex items-center mb-4">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ color: '#BDE958' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span 
                className="text-lg font-bold text-white"
                style={{ fontFamily: 'DM Sans, sans-serif' }}
              >
                Important Notice
              </span>
            </div>
            <p 
              className="text-gray-300"
              style={{ fontFamily: 'DM Sans, sans-serif' }}
            >
              Please read our full policies before subscribing. We reserve the right to modify these terms at any time.
            </p>
          </div>
        </div>
      </div>
      <FooterSection />
    </main>
  );
};

export default TermsAndConditionsPage;
