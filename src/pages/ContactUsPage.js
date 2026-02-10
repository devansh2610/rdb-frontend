import React from "react";
import Navigation from "../components/Navigation";
import FooterSection from "../components/LandingPageComponents/FooterSection";

const ContactUsPage = () => {
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
            Contact Us
          </h1>
          <div className="w-32 h-1 mx-auto mb-8" style={{ backgroundColor: '#BDE958' }}></div>
          <p 
            className="text-lg text-gray-300"
            style={{ fontFamily: 'DM Sans, sans-serif' }}
          >
            We're here to help — reach out anytime!
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
            Contact Information
          </h2>
          <p 
            className="text-gray-300 mb-6"
            style={{ fontFamily: 'DM Sans, sans-serif' }}
          >
            If you have any questions regarding our services, billing, or
            technical support, feel free to get in touch with us.
          </p>

          <div 
            className="bg-neutral-700 p-6 rounded-lg space-y-4 text-gray-300"
            style={{ fontFamily: 'DM Sans, sans-serif' }}
          >
            <div>
              <strong>Company:</strong>
              <br />
              Foodoscope Technologies Private Limited
            </div>
            <div>
              <strong>Address:</strong>
              <br />
              1A,2,3,6,7A, 2nd Floor, Indure House,
              <br />
              Savitri Cinema Complex, Greater Kailash 2,
              <br />
              New Delhi 110048
            </div>
            <div>
              <strong>📧 Email:</strong>{" "}
              <a
                href="mailto:contact@foodoscope.com"
                className="hover:underline"
                style={{ color: '#BDE958' }}
              >
                contact@foodoscope.com
              </a>
            </div>
            <div>
              <strong>📞 Phone:</strong>{" "}
              <a
                href="tel:+917793820447"
                className="hover:underline"
                style={{ color: '#BDE958' }}
              >
                +91-7793820447
              </a>
            </div>
            <div>
              <strong>🌐 Website:</strong>{" "}
              <a
                href="https://www.foodoscope.com"
                className="hover:underline"
                style={{ color: '#BDE958' }}
                target="_blank"
                rel="noopener noreferrer"
              >
                www.foodoscope.com
              </a>
            </div>
          </div>
        </div>
      </div>

      <FooterSection />
    </main>
  );
};

export default ContactUsPage;
