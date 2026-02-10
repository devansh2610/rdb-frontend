import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

export default function FAQSection({ content }) {
  const [openIndex, setOpenIndex] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const togglePanel = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Limit to 5 unless showAll is true
  const displayedFAQs = showAll ? content.faq : content.faq.slice(0, 5);

  return (
    <section id="faq" className="bg-gray-50 py-16 lg:py-20">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-6 mb-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800" style={{ fontFamily: 'monospace' }}>
              Frequently Asked Questions
            </h2>
            <div className="flex items-center gap-2 text-gray-600">
              <div className="hidden md:block w-16 h-0.5 bg-gray-400"></div>
						<div className="hidden md:block text-left">
							<p className="text-sm text-gray-600">Using APIs made easy:</p>
							<p className="text-sm text-gray-600">your questions answered</p>
						</div>
              
            </div>
          </div>
        </div>


        {/* FAQ Items */}
        <div className="space-y-3 max-w-3xl mx-auto">
          {displayedFAQs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={index}
                  className={`bg-white rounded-lg border border-gray-200 transition-all duration-200 shadow-sm ${
                    isOpen 
                      ? 'border-l-4 border-l-lime-400' 
                      : 'hover:border-gray-300'
                  }`}
                >
                  <button
                    onClick={() => togglePanel(index)}
                    className="w-full flex justify-between items-center px-6 py-4 text-left focus:outline-none"
                  >
                    <span className="text-gray-800 font-medium text-base pr-4">
                      {faq.question}
                    </span>
                    <span className="flex-shrink-0 text-gray-500">
                      {isOpen ? (
                        <ChevronUpIcon className="w-4 h-4" />
                      ) : (
                        <ChevronDownIcon className="w-4 h-4" />
                      )}
                    </span>
                  </button>
                  
                  {isOpen && (
                    <div
                      className={`overflow-hidden transition-all duration-700 ease-out ${
                        openIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                      }`}
                      style={{
                        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      <div className="px-6 pb-4 text-gray-600 leading-relaxed">
                        {faq.answer}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
        </div>

        {/* Show More / Show Less Button */}
        {content.faq.length > 5 && (
          <div className="flex justify-center mt-8">
            <button
              className="px-6 py-3 text-black font-medium rounded-3xl transition-colors duration-200 shadow-sm"
              style={{ backgroundColor: '#D9FF5B' }}
              onClick={() => setShowAll((prev) => !prev)}
            >
              {showAll ? "Show Less" : `Show More (${content.faq.length - 5} more)`}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
