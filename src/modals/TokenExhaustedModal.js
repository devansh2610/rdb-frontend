import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTimes, 
  faExclamationTriangle, 
  faCreditCard,
  faRocket 
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

const TokenExhaustedModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleUpgradeClick = () => {
    onClose();
    navigate('/pricing');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70"
          onClick={onClose}
        />
        
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-amber-100 dark:bg-amber-900/50 rounded-full p-2 mr-3">
                  <FontAwesomeIcon 
                    icon={faExclamationTriangle} 
                    className="text-amber-600 dark:text-amber-400 w-5 h-5" 
                  />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Tokens Exhausted
                </h3>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6 bg-white dark:bg-gray-800">
            <div className="text-center">
              <div className="mb-4">
                <div className="bg-blue-50 dark:bg-blue-900/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <FontAwesomeIcon 
                    icon={faRocket} 
                    className="text-blue-600 dark:text-blue-400 w-8 h-8" 
                  />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  You're out of tokens!
                </h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  You've used all your available tokens. Upgrade to a paid plan to continue using our API services and unlock more features.
                </p>
              </div>

              {/* Features List */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Upgrade benefits:
                </h5>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                  <li className="flex items-center">
                    <span className="text-green-500 dark:text-green-400 mr-2">✓</span>
                    More tokens for API calls
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 dark:text-green-400 mr-2">✓</span>
                    Dedicated support
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 dark:text-green-400 mr-2">✓</span>
                    Higher usage limits
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 dark:text-green-400 mr-2">✓</span>
                    Priority access to new features
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors"
                >
                  Maybe Later
                </button>
                <button
                  onClick={handleUpgradeClick}
                  className="flex-1 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors flex items-center justify-center"
                >
                  <FontAwesomeIcon icon={faCreditCard} className="mr-2 w-4 h-4" />
                  View Plans
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TokenExhaustedModal;
