import React from 'react';
import usecase1 from '../../assets/usecase1.png';
import usecase2 from '../../assets/usecase2.png';
import usecase3 from '../../assets/usecase3.png';
import usecase4 from '../../assets/usecase4.png';
import usecase5 from '../../assets/usecase5.png';

export default function UseCasesSection() {
  const useCases = [
    {
      id: 1,
      title: 'Fitness & Wellness Apps',
      subtitle: 'Go beyond workouts & step counters',
      description:
        'Deliver smart meal plans and food suggestions aligned with fitness goals, diets, and preferences',
      image: usecase1,
    },
    {
      id: 2,
      title: 'Restaurants & Food Service',
      subtitle: 'Go beyond static menus and manual labeling',
      description:
        'Auto-generate nutrition facts, allergens, and create health-focused dishes using data-driven insights',
      image: usecase2,
    },
    {
      id: 3,
      title: 'Healthcare & Medical Apps',
      subtitle: 'Go beyond appointments and symptom tracking',
      description:
        'Offer diet-specific recommendations and nutrition insights tailored to medical conditions and health goals',
      image: usecase3,
    },
    {
      id: 4,
      title: 'Grocery & E-commerce',
      subtitle: 'Go beyond basic product listings',
      description:
        'Power recipe-based shopping, personalized bundles, and flavor-driven product recommendations',
      image: usecase4,
    },
    {
      id: 5,
      title: 'Smart Kitchen Devices (IoT)',
      subtitle: 'Go beyond timers and pre-set modes',
      description:
        'Enable intelligent recipe suggestions and hands-free cooking based on available ingredients and dietary needs',
      image: usecase5,
    },
  ];

  return (
    <section className="py-20 px-4 bg-neutral-900 text-gray-100">
      <div className="max-w-7xl mx-auto">
        <h4
          className="text-center text-3xl md:text-4xl font-semibold tracking-wider mb-10"
          style={{ fontFamily: 'Sometype Mono, monospace', color: '#BDE958' }}
        >
          Use Cases
        </h4>

        <div className="space-y-20">
          {useCases.map((uc) => (
            <div key={uc.id} className="flex flex-col lg:flex-row items-center gap-8">
              {/* text column */}
              <div className="w-full lg:w-1/2 px-4 order-1 lg:order-1">
                <h3
                  className="text-3xl md:text-4xl font-semibold mb-4"
                  style={{ fontFamily: 'DM Sans, sans-serif', color: '#ffffff' }}
                >
                  {uc.title}
                </h3>
                <p
                  className="text-gray-300 mb-3 font-medium text-lg md:text-xl"
                  style={{ fontFamily: 'DM Sans, sans-serif' }}
                >
                  {uc.subtitle}
                </p>
                <p
                  className="text-gray-400 leading-relaxed text-base md:text-lg"
                  style={{ fontFamily: 'DM Sans, sans-serif' }}
                >
                  {uc.description}
                </p>
              </div>

              {/* image column - always on right */}
              <div className="w-full lg:w-1/2 flex justify-center px-4 order-2 lg:order-2">
                <div className="w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 flex items-center justify-center">
                  <img src={uc.image} alt={uc.title} className="object-contain w-full h-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
