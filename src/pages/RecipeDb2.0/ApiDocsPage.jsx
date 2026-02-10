import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiSpec from './apidocs.json';
import ApiSidebar from '../../components/Playground/ApiSidebar';
import ApiEndpoint from '../../components/Playground/ApiEndpoint';
import ApiIntro from '../../components/Playground/ApiIntro';
import ApiSearchBar from '../../components/Playground/ApiSearchBar';
import CodeExamples from '../../components/Playground/CodeExamples';
import TryItPanel from '../../components/Playground/TryItPanel';
import Navigation from '../../components/Navigation';
import PlaygroundLayout from '../../components/Playground/PlaygroundLayout';
import { categorizeEndpoints, filterEndpoints } from '../../utils/apiUtils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBars,
  faTimes,
  faCode,
  faTerminal,
  faSyncAlt,
  faSearch,
  faX,
  faEllipsisVertical
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

const ApiDocsPage = () => {
  const navigate = useNavigate();
  const { endpointPath } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeEndpoint, setActiveEndpoint] = useState(null);
  const [groupedEndpoints, setGroupedEndpoints] = useState({});
  const [filteredEndpoints, setFilteredEndpoints] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [mobileActiveTab, setMobileActiveTab] = useState('docs'); // 'sidebar', 'docs', 'code'
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
  }, [isSearchOpen]);

  // Enforce light theme
  useEffect(() => {
    // Store the current theme state
    const wasDark = document.documentElement.classList.contains('dark');

    // Force remove dark mode
    document.documentElement.classList.remove('dark');

    // Cleanup: Restore theme state when leaving the page
    return () => {
      if (wasDark) {
        document.documentElement.classList.add('dark');
      }
    };
  }, []);

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

  const handleEndpointSelect = (path, method) => {
    setActiveEndpoint({ path, method });
    setSidebarOpen(false);

    if (isSearchOpen) {
      setIsSearchOpen(false);
      setSearchQuery('');
    }

    setTimeout(() => {
      const selectedElement = document.getElementById(`endpoint-${path}-${method}`);
      if (selectedElement) {
        selectedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

        selectedElement.classList.add('bg-indigo-100');
        selectedElement.classList.add('border-indigo-500');
        selectedElement.classList.add('border');

        setTimeout(() => {
          selectedElement.classList.remove('bg-indigo-100');
          selectedElement.classList.remove('border-indigo-500');
          selectedElement.classList.remove('border');
        }, 3000);
      }
    }, 100);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleRightPanel = () => {
    setRightPanelOpen(!rightPanelOpen);
  };

  const handleApiKeyChange = (value) => {
    setApiKey(value);
    localStorage.setItem('api_portal_key', value);
  };

  const handleTryItOut = async (values) => {
    setParamValues(values);
    setIsLoading(true);

    try {
      if (!activeEndpoint) {
        throw new Error("No endpoint selected");
      }

      const { path, method } = activeEndpoint;
      const endpointDetails = getActiveEndpointDetails();
      if (!endpointDetails) {
        throw new Error("Invalid endpoint");
      }

      let url = `${apiSpec.schemes[0]}://${apiSpec.host}${apiSpec.basePath}${path}`;

      endpointDetails.parameters.filter(p => p.in === 'path').forEach(param => {
        url = url.replace(`{${param.name}}`, values[param.name] || '');
      });

      const queryParams = endpointDetails.parameters
        .filter(p => p.in === 'query' && values[p.name])
        .map(p => `${p.name}=${encodeURIComponent(values[p.name])}`)
        .join('&');

      if (queryParams) {
        url += `?${queryParams}`;
      }

      const options = {
        method: method.toUpperCase(),
        headers: {
          'Content-Type': 'application/json',
        }
      };

      if (endpointDetails.requiresAuth && apiKey) {
        options.headers['Authorization'] = `Bearer ${apiKey}`;
      }

      const bodyParam = endpointDetails.parameters.find(p => p.in === 'body');
      if (bodyParam && values[bodyParam.name]) {
        try {
          options.body = JSON.stringify(JSON.parse(values[bodyParam.name]));
        } catch (e) {
          setApiResponse({
            status: 'error',
            data: 'Invalid JSON in request body'
          });
          setIsLoading(false);
          return;
        }
      }

      try {
        const response = await fetch(url, options);
        const contentType = response.headers.get('content-type');

        let responseData;
        if (contentType && contentType.includes('application/json')) {
          responseData = await response.json();
        } else {
          responseData = await response.text();
        }

        setApiResponse({
          status: response.ok ? 'success' : 'error',
          data: responseData,
          statusCode: response.status,
          statusText: response.statusText
        });
      } catch (fetchError) {
        setApiResponse({
          status: 'error',
          data: fetchError.message,
          message: 'Could not complete API request'
        });
      }

      setIsLoading(false);
    } catch (error) {
      setApiResponse({
        status: 'error',
        data: error.toString()
      });
      setIsLoading(false);
    }
  };

  const activeEndpointDetails = getActiveEndpointDetails();

  const handleToggleSearch = () => {
    setIsSearchOpen(prev => !prev);
  };

  return (
    <>
      <Navigation stay={true} />
      <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 pt-16">
        <div className="bg-white dark:bg-gray-800 shadow-sm py-3 md:py-4 px-4 md:px-6 flex flex-col">
          <div className="flex justify-between items-center gap-3">
            {/* Mobile sidebar toggle */}
            <button
              onClick={toggleSidebar}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle sidebar"
            >
              <FontAwesomeIcon icon={sidebarOpen ? faTimes : faBars} className="text-gray-600 dark:text-gray-300 w-5 h-5" />
            </button>

            <h1 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white truncate">RecipeDB Playground</h1>

            <div className="relative w-32 md:w-64 flex-shrink-0">
              <div className="relative" onClick={handleToggleSearch}>
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-8 md:pl-10 pr-2 md:pr-4 py-2 w-full text-sm md:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  readOnly
                />
                <div className="absolute inset-y-0 left-0 pl-2.5 md:pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faSearch} className="text-gray-500 dark:text-gray-400 text-sm" />
                </div>
              </div>
            </div>
          </div>

          {/* Mobile tabs */}
          <div className="flex md:hidden mt-3 border-t border-gray-200 dark:border-gray-700 pt-3 gap-1">
            <button
              onClick={() => setMobileActiveTab('docs')}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-colors ${mobileActiveTab === 'docs'
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
            >
              Documentation
            </button>
            <button
              onClick={() => setMobileActiveTab('code')}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-colors ${mobileActiveTab === 'code'
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
            >
              <FontAwesomeIcon icon={faCode} className="mr-1" />
              Code
            </button>
          </div>
        </div>

        <div className="flex flex-col flex-1 overflow-hidden relative">
          {/* Mobile Sidebar Overlay */}
          <AnimatePresence>
            {sidebarOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="md:hidden fixed inset-0 bg-black/50 z-40"
                  onClick={() => setSidebarOpen(false)}
                />
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'tween', duration: 0.25 }}
                  className="md:hidden fixed inset-y-0 left-0 w-72 bg-white dark:bg-gray-800 z-50 shadow-xl overflow-y-auto"
                >
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <span className="font-semibold text-gray-900 dark:text-white">Endpoints</span>
                    <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                      <FontAwesomeIcon icon={faTimes} className="text-gray-500" />
                    </button>
                  </div>
                  <ApiSidebar
                    endpoints={filteredEndpoints}
                    activeEndpoint={activeEndpoint}
                    onSelectEndpoint={(path, method) => {
                      handleEndpointSelect(path, method);
                      setSidebarOpen(false);
                    }}
                  />
                </motion.div>
              </>
            )}
          </AnimatePresence>

          <PlaygroundLayout
            sidebar={
              <ApiSidebar
                endpoints={filteredEndpoints}
                activeEndpoint={activeEndpoint}
                onSelectEndpoint={handleEndpointSelect}
              />
            }
            mainContent={
              activeEndpointDetails ? (
                <ApiEndpoint
                  path={activeEndpoint.path}
                  method={activeEndpoint.method}
                  spec={apiSpec}
                  apiKey={apiKey}
                  onApiKeyChange={handleApiKeyChange}
                  onTryItOut={handleTryItOut}
                />
              ) : (
                <div className="py-10 flex flex-col items-center justify-center text-center">
                  <div className="w-32 md:w-48 h-32 md:h-48 mb-4 md:mb-6 opacity-70"></div>
                  <h3 className="text-base md:text-lg font-medium text-gray-900 dark:text-white mb-2">Select an endpoint</h3>
                  <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 max-w-md px-4">
                    Choose an API endpoint from the sidebar to view its documentation and try it out.
                  </p>
                </div>
              )
            }
            rightPanel={
              activeEndpointDetails ? (
                <CodeExamples
                  path={activeEndpoint.path}
                  method={activeEndpoint.method}
                  parameters={activeEndpointDetails.parameters.map(param => ({
                    ...param,
                    value: paramValues[param.name]
                  }))}
                  requiresAuth={activeEndpointDetails.requiresAuth}
                  apiKey={apiKey}
                  spec={apiSpec}
                  apiResponse={apiResponse}
                  isLoading={isLoading}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 p-4 text-center">
                  <p className="text-sm">Select an endpoint to view code examples</p>
                </div>
              )
            }
            mobileActiveTab={mobileActiveTab}
          />
        </div>

        {isSearchOpen && (
          <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm z-50 flex items-start justify-center pt-32">
            <div
              ref={searchRef}
              className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden"
              style={{ maxHeight: '70vh' }}
            >
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="relative">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search endpoints, parameters, descriptions..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    autoFocus
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FontAwesomeIcon icon={faSearch} className="text-gray-500 dark:text-gray-400" />
                  </div>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-y-auto" style={{ maxHeight: 'calc(70vh - 73px)' }}>
                <ApiSearchBar
                  spec={apiSpec}
                  onSelectEndpoint={handleEndpointSelect}
                  onClose={() => setIsSearchOpen(false)}
                  query={searchQuery}
                  onSearch={setSearchQuery}
                  endpoints={groupedEndpoints}
                  overlay={true}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ApiDocsPage; 