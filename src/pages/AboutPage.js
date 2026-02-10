import React from 'react';
import Navigation from '../components/Navigation';
import FooterSection from '../components/LandingPageComponents/FooterSection';

const AboutPage = () => {
  return (
    <main className="min-h-screen flex flex-col">
      <Navigation stay={true} />
      
      {/* Hero Section with Dark Background and Pattern */}
      <div className="w-full pt-28 pb-16 relative overflow-hidden" style={{ backgroundColor: '#2d2d2d' }}>
        {/* Background Pattern */}
        <div 
          className="absolute inset-0 w-full h-full"
          style={{
            // backgroundImage: `url("data:image/svg+xml,%3Csvg width='68' height='68' viewBox='0 0 68 68' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='32' y='24' width='4' height='20' fill='%2384cc16' opacity='0.8'/%3E%3Crect x='24' y='32' width='20' height='4' fill='%2384cc16' opacity='0.8'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '68px 68px'
          }}
        />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-[#BDE958] font-['Sometype_Mono']">
              About
            </h1>
            <h1 className="text-5xl md:text-6xl font-bold mb-8 text-[#BDE958] font-['Sometype_Mono']">
              Foodoscope
            </h1>
            <p className="text-lg text-white max-w-2xl mx-auto font-['Sometype_Mono']">
              Pioneering the intersection of food,<br />
              data and artificial intelligence
            </p>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="flex-grow px-4 py-12 bg-gray-100">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Our Mission Section */}
          <div className="bg-white rounded-3xl shadow-lg p-8 border-4 border-gray-800">
            <div className="text-center mb-6">
              <span className="inline-block bg-[#BDE958] text-black px-6 py-2 rounded-lg font-bold text-lg">
                Our Mission
              </span>
            </div>
            <div className="space-y-4">
              <div className="bg-[#BDE958] p-4 rounded-lg">
                <p className="text-black font-medium leading-relaxed">
                  Foodoscope Technologies Pvt. Ltd. is a pioneering deep-tech startup at the intersection of food, data, and AI. 
                  Founded by researchers and technologists, we are building the missing data infrastructure for the food-tech 
                  and health-tech ecosystem.
                </p>
              </div>
              <div className="bg-[#BDE958] p-4 rounded-lg">
                <p className="text-black font-medium leading-relaxed">
                  Our platform offers structured food datasets and APIs that power personalization, research, and innovation 
                  in the domains of nutrition, sustainability, and culinary intelligence. Whether you're developing an app, 
                  conducting public health studies, or creating intelligent kitchen systems — Foodoscope delivers the tools 
                  to make food computable.
                </p>
              </div>
            </div>
          </div>

          {/* Company Information Section */}
          
          <div className="bg-white rounded-3xl shadow-lg p-8 border-4 border-gray-800">
            <div className="text-center mb-6">
              <span className="inline-block bg-[#BDE958] text-black px-6 py-2 rounded-lg font-bold text-lg">
                Company Information
              </span>
            </div>
            <div className="bg-[#BDE958] p-6 rounded-lg">
              <div className="space-y-3 text-black">
                <div>
                  <span className="font-bold">Company:</span> Foodoscope Technologies Private Limited
                </div>
                <div>
                  <span className="font-bold">Registered Office:</span><br />
                  Foodoscope Technologies Pvt. Ltd.,<br />
                  1A,2,3,6,7A, 2nd Floor, Indure House,<br />
                  Savitri Cinema Complex, Greater Kailash 2, New Delhi 110048
                </div>
                <div>
                  <span className="font-bold">CIN:</span> U62099DL2025PTC448083
                </div>
                <div>
                  <span className="font-bold">E-Mail:</span> contact@foodoscope.com
                </div>
                <div>
                  <span className="font-bold">Phone:</span> +91-7793829447
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FooterSection />
    </main>
  );
};

export default AboutPage;