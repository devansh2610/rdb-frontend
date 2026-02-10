import React from "react";
import { motion } from "framer-motion";
import whyourdata1 from "../../assets/whyourdata1.png";
import whyourdata2 from "../../assets/whyourdata2.png";
import whyourdata3 from "../../assets/whyourdata3.png";
import whyourdata4 from "../../assets/whyourdata4.png";

export default function DataStandsApartSection({ content }) {
  const features = [
    {
      id: 1,
      title: "Scientifically Validated",
      description: "Built with published research and state-of-the-art models",
      imageSrc: whyourdata1,
      iconAlt: "Scientific validation icon"
    },
    {
      id: 2,
      title: "Curated & Normalized",
      description: "Each data point has been cleaned, tagged and structured",
      imageSrc: whyourdata2,
      iconAlt: "DNA/Curation icon"
    },
    {
      id: 3,
      title: "Multi Layered & Insight Rich",
      description: "Our data allows both high-level patterns and granular insights",
      imageSrc: whyourdata3,
      iconAlt: "Apple/Food icon"
    },
    {
      id: 4,
      title: "Actively Maintained by Researchers",
      description: "Updates are grounded in the science of Computational Gastronomy",
      imageSrc: whyourdata4,
      iconAlt: "Research/Microscope icon"
    }
  ];

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Sometype Mono, monospace' }}>
            Why Our Data Stands Apart?
          </h2>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center bg-white rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              {/* Icon/Image */}
              <div className="mb-6 flex justify-center">
                <div className="w-32 h-32 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center">
                  <img 
                    src={feature.imageSrc} 
                    alt={feature.iconAlt}
                    className="w-24 h-24 object-contain"
                  />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-xl font-semibold text-gray-900 mb-4" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 leading-relaxed" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}