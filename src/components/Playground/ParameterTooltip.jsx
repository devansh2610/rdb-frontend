import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ParameterTooltip Component
 * Displays an info button with tooltip showing parameter details
 * 
 * @param {Object} param - The parameter object from API spec
 * @param {string} paramType - The type category (path, query, header, body)
 */
const ParameterTooltip = ({ param, paramType }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Extract parameter information
  const paramName = param.name;
  const paramDataType = param.type || param.schema?.type || 'string';
  const paramDescription = param.description || 'No description available';
  const paramRequired = param.required || false;
  const paramExample = param['x-example'] || param.example;

  // Generate example if not provided
  const getDefaultExample = () => {
    if (paramExample) return paramExample;
    
    const lowerName = paramName.toLowerCase();
    
    // Specific examples based on parameter names
    if (lowerName.includes('id')) {
      if (lowerName.includes('pubchem')) return '1183';
      if (lowerName.includes('receptor')) return 'OR1A1';
      return '15683';
    }
    if (lowerName.includes('name')) return 'Vanillin';
    if (lowerName.includes('input') || lowerName.includes('query') || lowerName.includes('search')) {
      return 'vanil';
    }
    if (lowerName.includes('source') || lowerName.includes('naturalsource')) return 'Coffee';
    if (lowerName.includes('category')) return 'Aromatic';
    if (lowerName.includes('limit')) return '10';
    if (lowerName.includes('page')) return '1';
    
    // Default examples by type
    switch (paramDataType) {
      case 'integer':
      case 'number':
        return '100';
      case 'boolean':
        return 'true';
      case 'array':
        return '[item1, item2]';
      default:
        return 'example_value';
    }
  };

  const example = getDefaultExample();

  // Format parameter location for display
  const getLocationDisplay = (location) => {
    const locationMap = {
      path: 'URL Path',
      query: 'Query Parameter',
      header: 'HTTP Header',
      body: 'Request Body',
      formData: 'Form Data'
    };
    return locationMap[location] || location;
  };

  return (
    <div 
      className="inline-block relative ml-1.5"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button 
        type="button"
        className="text-gray-400 hover:text-indigo-600 dark:text-gray-500 dark:hover:text-indigo-400 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 rounded-full"
        aria-label={`Information about ${paramName} parameter`}
      >
        <FontAwesomeIcon icon={faInfoCircle} className="text-xs" />
      </button>
      
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 z-[9999] w-72 pointer-events-none"
          >
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-3">
              {/* Header */}
              <div className="flex items-center gap-2 pb-2 mb-2 border-b border-gray-200 dark:border-gray-700">
                <span className="font-semibold text-sm text-indigo-600 dark:text-indigo-400">
                  {paramName}
                </span>
                {paramRequired && (
                  <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-[10px] font-bold rounded uppercase tracking-wide">
                    Required
                  </span>
                )}
              </div>
              
              {/* Content */}
              <div className="space-y-2">
                {/* Purpose */}
                <div>
                  <div className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">
                    Purpose
                  </div>
                  <div className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                    {paramDescription}
                  </div>
                </div>
                
                {/* Type */}
                <div>
                  <div className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">
                    Data Type
                  </div>
                  <div className="text-xs">
                    <code className="px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded font-mono">
                      {paramDataType}
                    </code>
                  </div>
                </div>
                
                {/* Location */}
                <div>
                  <div className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">
                    Location
                  </div>
                  <div className="text-xs text-gray-700 dark:text-gray-300">
                    {getLocationDisplay(paramType)}
                  </div>
                </div>
                
                {/* Example */}
                {example && (
                  <div>
                    <div className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">
                      Example
                    </div>
                    <div>
                      <code className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded border border-gray-200 dark:border-gray-700 font-mono inline-block">
                        {example}
                      </code>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Arrow pointer */}
              <div className="absolute right-full top-1/2 transform -translate-y-1/2 mr-[-1px]">
                <div className="w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[6px] border-r-gray-200 dark:border-r-gray-700"></div>
                <div className="absolute top-0 left-[1px] w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[6px] border-r-white dark:border-r-gray-900"></div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ParameterTooltip;
