import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCloudDownloadAlt, 
  faCode, 
  faBook, 
  faLightbulb, 
  faRocket, 
  faServer 
} from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';

const ApiHeader = ({ title, description }) => {
  const handleDownloadSpec = () => {
    const element = document.createElement('a');
    const file = new Blob([JSON.stringify(require('../apidocs.json'), null, 2)], { type: 'application/json' });
    element.href = URL.createObjectURL(file);
    element.download = 'openapi-spec.json';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDownloadPostman = () => {
    alert('In a production environment, this would download a Postman collection generated from the OpenAPI spec.');
    handleDownloadSpec();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-800 text-white relative overflow-hidden"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-10 w-64 h-64 bg-white rounded-full translate-x-1/3 translate-y-1/2"></div>
        <div className="absolute top-1/4 right-1/4 w-16 h-16 bg-white rounded-full"></div>
        <div className="absolute top-3/4 left-1/3 w-24 h-24 bg-white rounded-full"></div>
      </div>
      
      <div className="container mx-auto px-4 py-6 md:py-10 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-6 md:mb-0"
          >
            <div className="flex items-center">
              <div className="mr-4 p-3 bg-white bg-opacity-20 rounded-lg">
                <FontAwesomeIcon icon={faServer} className="text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
                <p className="mt-2 text-indigo-100 max-w-2xl">{description}</p>
              </div>
            </div>
            
            <div className="mt-4 flex items-center text-sm">
              <FontAwesomeIcon icon={faLightbulb} className="mr-2 text-yellow-300" />
              <span className="text-indigo-100">
                Explore our API endpoints using interactive documentation
              </span>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-wrap gap-3"
          >
            <HeaderButton 
              icon={faCode} 
              text="OpenAPI Spec"
              onClick={handleDownloadSpec}
            />
            
            <HeaderButton 
              icon={faCloudDownloadAlt} 
              text="Postman Collection"
              onClick={handleDownloadPostman}
            />
            
            <HeaderButton 
              icon={faBook} 
              text="Documentation"
              href="#"
            />
            
            <HeaderButton 
              icon={faRocket} 
              text="Get Started"
              href="#getting-started"
              highlight
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

const HeaderButton = ({ icon, text, onClick, href, highlight }) => {
  const commonClasses = `
    flex items-center justify-center px-4 py-2 rounded-md transition-all duration-200
    ${highlight 
      ? 'bg-white text-indigo-700 hover:bg-opacity-90 shadow-lg' 
      : 'bg-white bg-opacity-20 hover:bg-opacity-30 text-white'}
  `;
  
  if (href) {
    return (
      <a 
        href={href} 
        className={commonClasses}
      >
        <FontAwesomeIcon icon={icon} className="mr-2" />
        <span>{text}</span>
      </a>
    );
  }
  
  return (
    <button 
      onClick={onClick}
      className={commonClasses}
    >
      <FontAwesomeIcon icon={icon} className="mr-2" />
      <span>{text}</span>
    </button>
  );
};

export default ApiHeader; 