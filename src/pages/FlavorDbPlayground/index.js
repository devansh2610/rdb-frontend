import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import apiDoc from "./apidocs.json";
import './swagger_style.css';
import Navigation from "../../components/Navigation";
import { FiSearch } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import ParameterTooltipPlugin from "./ParameterTooltipPlugin";

export default function FlavorDbPlayground() {
  const [searchTerm, setSearchTerm] = useState("");
  const { fetchProfile } = useAuth();
  const apiCallTimeoutRef = useRef(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark') || localStorage.getItem('theme') === 'dark';
  });
  
  // Ref to track consecutive toggle clicks
  const toggleClickCountRef = useRef(0);
  const themeToggleTimeoutRef = useRef(null);
  
  // State to track if theme toggle was just clicked to prevent the useEffect from overriding it
  const themeToggleClickedRef = useRef(false);

  // Handle theme changes from both the toggle and system preferences
  const handleThemeChange = useCallback(() => {
    if (!themeToggleClickedRef.current) {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    }
    themeToggleClickedRef.current = false;
  }, []);

  useEffect(() => {
    // Listen for theme changes on the document element
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          handleThemeChange();
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    handleThemeChange();
    
    return () => observer.disconnect();
  }, [handleThemeChange]);

  // Apply theme class to Swagger UI
  useEffect(() => {
    document.documentElement.dataset.swaggerTheme = isDarkMode ? 'dark' : 'light';
    
    const swaggerContainer = document.querySelector('.swagger-container');
    if (swaggerContainer) {
      if (isDarkMode) {
        swaggerContainer.classList.add('dark-mode');
      } else {
        swaggerContainer.classList.remove('dark-mode');
      }
    }
  }, [isDarkMode]);

  // Create filtered API docs based on search term
  const filteredApiDoc = useMemo(() => {
    if (!searchTerm) return apiDoc;

    const filteredPaths = Object.keys(apiDoc.paths).reduce((acc, path) => {
      if (path.toLowerCase().includes(searchTerm.toLowerCase())) {
        acc[path] = apiDoc.paths[path];
      }
      return acc;
    }, {});
  
    return { ...apiDoc, paths: filteredPaths };
  }, [searchTerm]);

  // Handle successful API responses by updating user profile
  const handleApiResponse = (res) => {
    if (apiCallTimeoutRef.current) {
      clearTimeout(apiCallTimeoutRef.current);
    }

    if (res.status >= 200 && res.status < 300) {
      // Use a short delay to ensure the backend has processed the request
      apiCallTimeoutRef.current = setTimeout(() => {
        fetchProfile();
      }, 500);
    }
    return res;
  };

  return (
    <div className="relative">
      <Navigation stay={true} />
      
      <div className={`swagger-container ${isDarkMode ? 'dark-mode' : ''}`}>
          <div className="search-container">
            <div className="search-wrapper">
              <FiSearch className="search-icon" size={20} />
              <input
                type="text"
                placeholder="Search endpoints"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="api-search-input"
              />
            </div>
          </div>

          <div className={`swagger-wrapper ${isDarkMode ? 'dark-mode' : ''}`}>
            <SwaggerUI
              spec={filteredApiDoc}
              plugins={[ParameterTooltipPlugin]}
              requestInterceptor={(req) => {
                if (req.headers.Authorization && !req.headers.Authorization.startsWith("Bearer ")) {
                  req.headers.Authorization = `Bearer ${req.headers.Authorization}`;
                }
                return req;
              }}
              responseInterceptor={handleApiResponse}
            />
          </div>
        </div>
      </div>
  );
}