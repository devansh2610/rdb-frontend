import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faExclamationTriangle, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';

const TryItPanel = ({ response, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-gray-700 rounded-md p-2 h-full flex flex-col">
        <div className="animate-pulse space-y-1 flex-grow">
          <div className="h-3 bg-gray-600 rounded w-3/4"></div>
          <div className="h-3 bg-gray-600 rounded w-1/2"></div>
          <div className="h-3 bg-gray-600 rounded w-5/6"></div>
          <div className="h-3 bg-gray-600 rounded w-2/3"></div>
        </div>
      </div>
    );
  }
  
  if (!response) {
    return (
      <div className="bg-gray-700 rounded-md p-2 text-gray-400 text-sm h-full flex items-center justify-center">
        <div className="flex items-center">
          <FontAwesomeIcon icon={faInfoCircle} className="mr-1 text-gray-500" />
          <p>Send a request to see the response here</p>
        </div>
      </div>
    );
  }
  
  const getStatusIcon = () => {
    switch (response.status) {
      case 'success':
        return <FontAwesomeIcon icon={faCheckCircle} className="mr-1 text-green-500" />;
      case 'error':
        return <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1 text-red-500" />;
      default:
        return <FontAwesomeIcon icon={faInfoCircle} className="mr-1 text-blue-500" />;
    }
  };
  
  const getStatusClass = () => {
    switch (response.status) {
      case 'success':
        return 'border-green-700 bg-opacity-20 bg-green-800';
      case 'error':
        return 'border-red-700 bg-opacity-20 bg-red-800';
      default:
        return 'border-blue-700 bg-opacity-20 bg-blue-800';
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.1 }}
      className={`border rounded-md overflow-hidden ${getStatusClass()} h-full flex flex-col`}
    >
      <div className="bg-black bg-opacity-30 px-3 py-1 border-b border-gray-700 text-xs flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {getStatusIcon()}
            {response.statusCode && (
              <span className={`text-gray-200 ${response.statusCode >= 400 ? 'text-red-300' : 'text-green-300'}`}>
                Status: {response.statusCode} {response.statusText}
              </span>
            )}
            {!response.statusCode && response.message && (
              <span className="text-gray-200">{response.message}</span>
            )}
          </div>
          {response.timestamp && (
            <span className="text-gray-400 text-xs">{new Date(response.timestamp).toLocaleTimeString()}</span>
          )}
        </div>
      </div>
      
      <pre className="p-3 overflow-x-auto overflow-y-auto text-sm font-mono whitespace-pre text-gray-300 flex-grow">
        {typeof response.data === 'string' 
          ? response.data 
          : JSON.stringify(response.data, null, 2)}
      </pre>
    </motion.div>
  );
};

export default TryItPanel; 