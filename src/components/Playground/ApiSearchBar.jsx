import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes, faCode, faLink } from '@fortawesome/free-solid-svg-icons';
import { getMethodColor } from '../../utils/apiUtils';
import { motion, AnimatePresence } from 'framer-motion';

const ApiSearchBar = ({ onSearch, onSelectEndpoint, spec, endpoints, overlay = false, query, onClose }) => {
  const [localQuery, setLocalQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const inputRef = useRef(null);
  const suggestionRef = useRef(null);
  
  useEffect(() => {
    if (query !== undefined) {
      setLocalQuery(query);
    }
  }, [query]);
  
  useEffect(() => {
    const currentQuery = query !== undefined ? query : localQuery;
    
    if (currentQuery.trim() === '') {
      setSuggestions([]);
      return;
    }
    
    const results = [];
    const lowerQuery = currentQuery.toLowerCase();
    
    const allEndpoints = [];
    
    if (endpoints) {
      Object.entries(endpoints).forEach(([category, { endpoints: categoryEndpoints }]) => {
        categoryEndpoints.forEach(endpoint => {
          allEndpoints.push({ ...endpoint, category });
        });
      });
    } else if (spec && spec.paths) {
      Object.entries(spec.paths).forEach(([path, methods]) => {
        Object.entries(methods).forEach(([method, details]) => {
          const category = details.tags?.[0] || 'default';
          allEndpoints.push({
            path,
            method,
            description: details.summary || details.description,
            category
          });
        });
      });
    }
    
    allEndpoints.forEach(endpoint => {
      if (
        endpoint.path.toLowerCase().includes(lowerQuery) ||
        endpoint.method.toLowerCase().includes(lowerQuery) ||
        endpoint.description?.toLowerCase().includes(lowerQuery)
      ) {
        results.push(endpoint);
      }
    });
    
    setSuggestions(results.slice(0, 10));
  }, [query, localQuery, spec, endpoints]);
  
  const handleInputChange = (e) => {
    setLocalQuery(e.target.value);
    if (onSearch) {
      onSearch(e.target.value);
    }
  };
  
  const handleClear = () => {
    setLocalQuery('');
    if (onSearch) {
      onSearch('');
    }
    setSuggestions([]);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  const handleSuggestionClick = (path, method) => {
    if (onSelectEndpoint) {
      onSelectEndpoint(path, method);
    }
    if (window.onEndpointSelect) {
      window.onEndpointSelect(path, method);
    }
    
    setLocalQuery('');
    if (onSearch) {
      onSearch('');
    }
    
    if (onClose) {
      onClose();
    }
    
    setIsFocused(false);
  };
  
  if (overlay) {
    const currentQuery = query !== undefined ? query : localQuery;
    
    if (!suggestions.length && currentQuery.trim() !== '') {
      return (
        <div className="p-6 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800">
          <p className="text-lg font-medium mt-2">No results found</p>
          <p className="text-sm mt-1">Try a different search term</p>
        </div>
      );
    }
    
    if (!suggestions.length) {
      return (
        <div className="p-6 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800">
          <p className="text-lg font-medium mt-2">Type to search endpoints</p>
          <p className="text-sm mt-1">Search by path, method, or description</p>
        </div>
      );
    }
    
    return (
      <div className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800 w-full">
        {suggestions.map((endpoint, index) => (
          <button
            key={`${endpoint.path}-${endpoint.method}-${index}`}
            className="w-full text-left px-4 py-3 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 flex items-start transition-colors duration-150 bg-white dark:bg-gray-800"
            onClick={() => handleSuggestionClick(endpoint.path, endpoint.method)}
          >
            <div className="flex-shrink-0 mt-1 mr-3">
              <span className={`inline-block text-xs font-bold uppercase px-2 py-1 rounded text-white ${getMethodColor(endpoint.method)}`}>
                {endpoint.method}
              </span>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-800 dark:text-gray-200 flex items-center">
                <FontAwesomeIcon icon={faLink} className="mr-1 text-gray-400 dark:text-gray-500 text-xs" />
                <span>{endpoint.path}</span>
              </div>
              
              {endpoint.description && (
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {endpoint.description}
                </div>
              )}
              
              <div className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                <span className="bg-indigo-50 dark:bg-indigo-900/40 px-1.5 py-0.5 rounded-full">
                  {endpoint.category}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    );
  }
  
  return (
    <div className="relative w-full">
      <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden bg-white dark:bg-gray-700 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all duration-200 shadow-sm hover:shadow">
        <div className="flex items-center justify-center pl-3">
          <FontAwesomeIcon icon={faSearch} className="text-gray-400 dark:text-gray-300" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={localQuery}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          placeholder="Search endpoints (e.g. recipe, get, calories)..."
          className="py-2 px-3 block w-full outline-none border-0 text-gray-700 dark:text-white dark:bg-gray-700"
          aria-label="Search API endpoints"
        />
        
        {localQuery && (
          <button 
            onClick={handleClear} 
            className="pr-3 text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100"
            aria-label="Clear search"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        )}
      </div>
      
      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
        <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-300 rounded">
          /
        </kbd>
      </div>
      
      <AnimatePresence>
        {isFocused && suggestions.length > 0 && (
          <motion.div 
            ref={suggestionRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.1 }}
            className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="max-h-80 overflow-y-auto bg-white dark:bg-gray-800">
              <div className="p-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
                {suggestions.length} result{suggestions.length !== 1 ? 's' : ''} found
              </div>
              
              {suggestions.map((endpoint, index) => (
                <button
                  key={`${endpoint.path}-${endpoint.method}-${index}`}
                  className="w-full text-left px-3 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 flex items-start border-b border-gray-100 dark:border-gray-700 last:border-0 transition-colors duration-150 bg-white dark:bg-gray-800"
                  onClick={() => handleSuggestionClick(endpoint.path, endpoint.method)}
                >
                  <div className="flex-shrink-0 mt-1 mr-3">
                    <span className={`inline-block text-xs font-bold uppercase px-2 py-1 rounded text-white ${getMethodColor(endpoint.method)}`}>
                      {endpoint.method}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-800 dark:text-gray-200 truncate flex items-center">
                      <FontAwesomeIcon icon={faLink} className="mr-1 text-gray-400 dark:text-gray-500 text-xs" />
                      <span className="truncate">{endpoint.path}</span>
                    </div>
                    
                    {endpoint.description && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                        {endpoint.description}
                      </div>
                    )}
                    
                    <div className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                      <span className="bg-indigo-50 dark:bg-indigo-900/40 px-1.5 py-0.5 rounded-full">
                        {endpoint.category}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ApiSearchBar; 