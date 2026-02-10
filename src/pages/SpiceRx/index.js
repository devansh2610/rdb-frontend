import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiSpec from './apidocs.json';
import ApiSidebar from '../../components/Playground/ApiSidebar';
import ApiEndpoint from '../../components/Playground/ApiEndpoint';
import ApiSearchBar from '../../components/Playground/ApiSearchBar';
import CodeExamples from '../../components/Playground/CodeExamples';
import Navigation from '../../components/Navigation';
import PlaygroundLayout from '../../components/Playground/PlaygroundLayout';
import { categorizeEndpoints, filterEndpoints } from '../../utils/apiUtils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBars,
  faTimes,
  faCode,
  faSearch
} from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';

const useOutsideClick = (ref, callback) => {
  const handleClick = useCallback((event) => {
    if (ref.current && !ref.current.contains(event.target)) {
      callback();
    }
  }, [ref, callback]);

  useEffect(() => {
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [handleClick]);
};

const SpiceRxPlayground = () => {
  const navigate = useNavigate();
  const { endpointPath } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeEndpoint, setActiveEndpoint] = useState(null);
  const [groupedEndpoints, setGroupedEndpoints] = useState({});
  const [filteredEndpoints, setFilteredEndpoints] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [mobileActiveTab, setMobileActiveTab] = useState('docs');
  const [apiKey, setApiKey] = useState('');
  const [apiResponse, setApiResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [paramValues, setParamValues] = useState({});
  const searchInputRef = useRef(null);

  const searchRef = useRef(null);

  useOutsideClick(searchRef, () => {
    if (isSearchOpen) setIsSearchOpen(false);
  });

  const getActiveEndpointDetails = useCallback(() => {
    if (!activeEndpoint || !apiSpec.paths[activeEndpoint.path]) return null;

    const { path, method } = activeEndpoint;
    const endpointSpec = apiSpec.paths[path][method];
    const parameters = endpointSpec.parameters || [];
    const responses = endpointSpec.responses || {};
    const security = endpointSpec.security || apiSpec.security || [];

    return {
      path,
      method,
      endpointSpec,
      parameters,
      responses,
      security,
      requiresAuth: security.length > 0
    };
  }, [activeEndpoint]);

  const handleEndpointSelect = useCallback((path, method) => {
    setActiveEndpoint({ path, method });
    setSidebarOpen(false);
    setMobileActiveTab('docs');

    const urlSafePath = path.replace(/\//g, '__');
    navigate(`/playground/spicerx/${urlSafePath}/${method}`);
  }, [navigate]);

  useEffect(() => {
    const categorized = categorizeEndpoints(apiSpec);
    setGroupedEndpoints(categorized);
    setFilteredEndpoints(categorized);

    window.onEndpointSelect = (path, method) => {
      handleEndpointSelect(path, method);
      setIsSearchOpen(false);
      setSearchQuery('');
    };

    const savedApiKey = localStorage.getItem('api_portal_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }

    const handleKeyDown = (e) => {
      if ((e.key === '/' || (e.ctrlKey && e.key === 'k')) && !isSearchOpen) {
        e.preventDefault();
        setIsSearchOpen(true);
      } else if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      delete window.onEndpointSelect;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSearchOpen, handleEndpointSelect]);

  useEffect(() => {
    if (endpointPath) {
      const path = endpointPath.replace(/__/g, '/');
      const method = 'get';
      if (apiSpec.paths[path]) {
        setActiveEndpoint({ path, method });
      }
    }
  }, [endpointPath]);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current.focus();
      }, 100);
    }
  }, [isSearchOpen]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredEndpoints(groupedEndpoints);
    } else {
      setFilteredEndpoints(filterEndpoints(groupedEndpoints, searchQuery));
    }
  }, [searchQuery, groupedEndpoints]);

  const handleApiKeyChange = (value) => {
    setApiKey(value);
    localStorage.setItem('api_portal_key', value);
  };

  const handleTryIt = async (endpoint, params) => {
    setIsLoading(true);
    setApiResponse(null);

    try {
      const baseUrl = apiSpec.host || 'api.foodoscope.com';
      const scheme = apiSpec.schemes?.[0] || 'http';
      const basePath = apiSpec.basePath || '';
      
      let url = `${scheme}://${baseUrl}${basePath}${endpoint.path}`;

      const queryParams = new URLSearchParams();
      endpoint.parameters?.forEach(param => {
        if (param.in === 'query' && params[param.name]) {
          queryParams.append(param.name, params[param.name]);
        } else if (param.in === 'path' && params[param.name]) {
          url = url.replace(`{${param.name}}`, params[param.name]);
        }
      });

      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
      }

      const headers = {
        'Content-Type': 'application/json',
      };

      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      const response = await fetch(url, {
        method: endpoint.method.toUpperCase(),
        headers,
      });

      const data = await response.json();

      setApiResponse({
        status: response.status,
        statusText: response.statusText,
        data: data,
      });
    } catch (error) {
      setApiResponse({
        error: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const activeEndpointDetails = getActiveEndpointDetails();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation stay={true} />

      <PlaygroundLayout
        sidebar={
          <ApiSidebar
            endpoints={filteredEndpoints}
            activeEndpoint={activeEndpoint}
            onSelectEndpoint={handleEndpointSelect}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        }
        mainContent={
          <div className="h-full overflow-auto">
            {activeEndpoint ? (
              <ApiEndpoint
                endpoint={activeEndpointDetails}
                apiSpec={apiSpec}
                onTryIt={(params) => handleTryIt(activeEndpointDetails, params)}
                apiKey={apiKey}
                onApiKeyChange={handleApiKeyChange}
                apiResponse={apiResponse}
                isLoading={isLoading}
                paramValues={paramValues}
                setParamValues={setParamValues}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <h2 className="text-2xl font-semibold mb-2">SpiceRx API Playground</h2>
                  <p>Select an endpoint from the sidebar to get started</p>
                </div>
              </div>
            )}
          </div>
        }
        rightPanel={
          rightPanelOpen && activeEndpoint ? (
            <CodeExamples
              endpoint={activeEndpointDetails}
              apiSpec={apiSpec}
              apiKey={apiKey}
              paramValues={paramValues}
            />
          ) : null
        }
        mobileActiveTab={mobileActiveTab}
        onMobileTabChange={setMobileActiveTab}
      />

      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-50 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
      >
        <FontAwesomeIcon icon={sidebarOpen ? faTimes : faBars} size="lg" />
      </button>

      {/* Search Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20"
            onClick={() => setIsSearchOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              ref={searchRef}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <ApiSearchBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                groupedEndpoints={filteredEndpoints}
                onEndpointSelect={(path, method) => {
                  handleEndpointSelect(path, method);
                  setIsSearchOpen(false);
                  setSearchQuery('');
                }}
                inputRef={searchInputRef}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Trigger Button */}
      <button
        onClick={() => setIsSearchOpen(true)}
        className="hidden lg:block fixed top-20 right-6 z-40 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700"
      >
        <FontAwesomeIcon icon={faSearch} className="mr-2" />
        Search... <kbd className="ml-2 text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">/</kbd>
      </button>

      {/* Right Panel Toggle */}
      {activeEndpoint && (
        <button
          onClick={() => setRightPanelOpen(!rightPanelOpen)}
          className="hidden lg:block fixed top-20 right-64 z-40 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 p-2 rounded-lg shadow-md hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700"
        >
          <FontAwesomeIcon icon={faCode} />
        </button>
      )}
    </div>
  );
};

export default SpiceRxPlayground;
