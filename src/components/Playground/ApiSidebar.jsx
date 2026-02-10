import React, { useState, useEffect } from 'react';
import { getMethodColor } from '../../utils/apiUtils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronDown,
  faChevronUp,
  faTag,
  faLayerGroup,
  faBookOpen,
  faCircle,
  faSignature
} from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';

const ApiSidebar = ({ endpoints, activeEndpoint, onSelectEndpoint }) => {
  const [expandedCategories, setExpandedCategories] = useState({});
  const [hoveredEndpoint, setHoveredEndpoint] = useState(null);

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  useEffect(() => {
    if (Object.keys(endpoints).length > 0 && Object.keys(expandedCategories).length === 0) {
      const initialState = {};
      Object.keys(endpoints).forEach(category => {
        initialState[category] = true;
      });
      setExpandedCategories(initialState);
    }
  }, [endpoints, expandedCategories]);

  const isEndpointActive = (path, method) => {
    return activeEndpoint &&
      activeEndpoint.path === path &&
      activeEndpoint.method === method;
  };

  // Filter out the "other" category
  const filteredEndpoints = Object.entries(endpoints).filter(([category]) =>
    category.toLowerCase() !== 'other'
  );

  if (Object.keys(endpoints).length === 0) {
    return (
      <div className="p-3 text-center">
        <div className="animate-pulse space-y-3">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mx-auto"></div>
        </div>
        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">Loading endpoints...</p>
      </div>
    );
  }

  return (
    <div className="py-1 overflow-y-auto max-h-screen">
      {filteredEndpoints.map(([category, { description, endpoints: categoryEndpoints }]) => (
        <motion.div
          key={category}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="mb-2"
        >
          <button
            className="w-full flex justify-between items-center px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-l-2 border-transparent hover:border-gray-200 dark:hover:border-gray-700 focus:outline-none"
            onClick={() => toggleCategory(category)}
            aria-expanded={!!expandedCategories[category]}
          >
            <div className="flex items-center">
              <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mr-2">
                <FontAwesomeIcon icon={faTag} className="text-indigo-600 dark:text-indigo-400 text-xs" />
              </div>
              <div className="min-w-0 flex-1 flex items-center">
                <span className="text-xs font-medium truncate">{category}</span>
                <span className="ml-2 bg-indigo-50 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 text-xs px-1.5 py-0.5 rounded-full flex-shrink-0">
                  {categoryEndpoints.length}
                </span>
              </div>
            </div>

            <FontAwesomeIcon
              icon={expandedCategories[category] ? faChevronUp : faChevronDown}
              className={`w-3 h-3 transition-transform text-gray-400 dark:text-gray-500 ${expandedCategories[category] ? 'transform rotate-180' : ''}`}
            />
          </button>

          <AnimatePresence>
            {expandedCategories[category] && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-0.5"
              >
                <div className="pl-4 pr-2 border-l border-gray-100 dark:border-gray-700 ml-3 space-y-0.5">
                  {categoryEndpoints.map((endpoint) => {
                    const isActive = isEndpointActive(endpoint.path, endpoint.method);
                    const isHovered = hoveredEndpoint &&
                      hoveredEndpoint.path === endpoint.path &&
                      hoveredEndpoint.method === endpoint.method;

                    const displayName = endpoint.alias || endpoint.path;
                    const hasAlias = !!endpoint.alias;

                    return (
                      <motion.button
                        key={`${endpoint.path}-${endpoint.method}`}
                        id={`endpoint-${endpoint.path}-${endpoint.method}`}
                        initial={{ x: -5, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        whileHover={{ x: 2 }}
                        transition={{ duration: 0.2 }}
                        className={`w-full text-left pl-3 pr-1 py-1 text-xs rounded-md flex items-center group transition-all ${isActive
                            ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}
                        onClick={() => onSelectEndpoint(endpoint.path, endpoint.method)}
                        onMouseEnter={() => setHoveredEndpoint(endpoint)}
                        onMouseLeave={() => setHoveredEndpoint(null)}
                      >
                        <span
                          className={`mr-1.5 text-xs font-bold uppercase px-1.5 py-0.5 rounded text-white transition-all ${getMethodColor(endpoint.method)} ${isActive || isHovered ? 'shadow-sm' : ''
                            }`}
                        >
                          {endpoint.method}
                        </span>

                        <div className="flex flex-col flex-1 min-w-0">
                          <div className="flex items-center">
                            <span className={`truncate transition-colors text-xs ${isActive ? 'font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
                              {displayName}
                            </span>
                          </div>

                          {/* {endpoint.description && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5 opacity-80">
                              {endpoint.description.length > 35 
                                ? `${endpoint.description.substring(0, 35)}...` 
                                : endpoint.description}
                            </span>
                          )} */}
                        </div>

                        {isActive && (
                          <span className="w-1 h-1 rounded-full bg-indigo-500 dark:bg-indigo-400 ml-1"></span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
};

export default ApiSidebar; 