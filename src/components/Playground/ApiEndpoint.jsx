import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCode,
  faLock,
  faChevronDown,
  faChevronUp,
  faInfoCircle,
  faCheckCircle,
  faExclamationTriangle,
  faLightbulb,
  faServer,
  faPlay,
  faKey,
  faExclamationCircle,
  faLink,
  faAngleDown,
  faTimes,
  faSearch,
  faEye,
  faEyeSlash
} from '@fortawesome/free-solid-svg-icons';
import { formatParameterType, getMethodColor } from '../../utils/apiUtils';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from "../../context/AuthContext";
import TokenExhaustedModal from "../../modals/TokenExhaustedModal";
import ParameterTooltip from './ParameterTooltip';

const ApiEndpointEnhanced = ({ path, method, spec, apiKey, onApiKeyChange, onTryItOut }) => {
  const [expandedSection, setExpandedSection] = useState({
    description: true,
    parameters: true,
    responses: true,
    schema: false,
    auth: true
  });
  const [paramValues, setParamValues] = useState({});
  const [paramErrors, setParamErrors] = useState({});
  const [activeSuggestionField, setActiveSuggestionField] = useState(null);
  const [selectedIngredients, setSelectedIngredients] = useState({});
  const [searchQueries, setSearchQueries] = useState({});
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const suggestionRef = useRef(null);
  const { getProfile, fetchProfile, TOKEN_UPDATE_EVENT, PROFILE_UPDATE_EVENT } = useAuth();
  const endpointSpec = spec.paths[path][method];
  const parameters = endpointSpec.parameters || [];
  const responses = endpointSpec.responses || {};
  const security = endpointSpec.security || spec.security || [];
  const alias = endpointSpec.alias || '';

  const hasBodyParam = parameters.some(p => p.in === 'body');
  const hasPathParams = parameters.some(p => p.in === 'path');
  const requiresAuth = security.length > 0;

  // Initialize profile on mount
  useEffect(() => {
    const profile = getProfile();
    setUserProfile(profile);
  }, [getProfile]);


  // Listen for token and profile updates from AuthContext
  useEffect(() => {
    const handleTokenUpdate = (event) => {
      console.log("Token update detected:", event.detail);
      // Fetch fresh profile data when tokens are updated
      const fetchUpdatedProfile = async () => {
        const freshProfile = await fetchProfile();
        if (freshProfile) {
          setUserProfile(freshProfile);
        }
      };
      fetchUpdatedProfile();
    };

    const handleProfileUpdate = (event) => {
      console.log("Profile update detected:", event.detail);
      setUserProfile(event.detail);
    };

    // Add event listeners for real-time updates
    window.addEventListener(TOKEN_UPDATE_EVENT, handleTokenUpdate);
    window.addEventListener(PROFILE_UPDATE_EVENT, handleProfileUpdate);

    return () => {
      window.removeEventListener(TOKEN_UPDATE_EVENT, handleTokenUpdate);
      window.removeEventListener(PROFILE_UPDATE_EVENT, handleProfileUpdate);
    };
  }, [fetchProfile, TOKEN_UPDATE_EVENT, PROFILE_UPDATE_EVENT]);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeSuggestionField &&
        suggestionRef.current &&
        !suggestionRef.current.contains(event.target) &&
        !event.target.id.includes(`param-${activeSuggestionField}`)) {
        setActiveSuggestionField(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeSuggestionField]);

  useEffect(() => {
    setParamValues({});
    setParamErrors({});
    setSelectedIngredients({}); // Clear selected ingredients when switching endpoints
    setSearchQueries({}); // Also clear search queries for clean state
  }, [path, method]);

  const toggleSection = (section) => {
    setExpandedSection(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const validateParams = () => {
    const errors = {};
    let isValid = true;

    parameters.forEach(param => {
      if (param.required && (!paramValues[param.name] || paramValues[param.name].trim() === '')) {
        errors[param.name] = `${param.name} is required`;
        isValid = false;
      }
    });

    setParamErrors(errors);
    return isValid;
  };

  const handleParamChange = (paramName, value) => {
    setParamValues(prev => ({
      ...prev,
      [paramName]: value
    }));

    if (value && paramErrors[paramName]) {
      setParamErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[paramName];
        return newErrors;
      });
    }
  };

  const handleMultiSelectChange = (paramName, ingredient, isSelected) => {
    setSelectedIngredients(prev => {
      const currentItems = prev[paramName] || [];
      let newItems;

      if (isSelected) {
        newItems = [...currentItems, ingredient];
      } else {
        newItems = currentItems.filter(item => item !== ingredient);
      }

      // Update the param value with comma-separated string with spaces after commas
      const valueString = newItems.join(', ');
      handleParamChange(paramName, valueString);

      return {
        ...prev,
        [paramName]: newItems
      };
    });
  };

  const removeIngredient = (paramName, ingredient) => {
    handleMultiSelectChange(paramName, ingredient, false);
  };

  const handleApiKeyChange = (e) => {
    if (onApiKeyChange) {
      onApiKeyChange(e.target.value);
    }
  };

  const handleSuggestionClick = (paramName, value) => {
    handleParamChange(paramName, value);
    setActiveSuggestionField(null);
  };


  const handleTryItOut = async () => {
    // Check token count before proceeding
    const currentProfile = userProfile || getProfile();
    const userTokens = currentProfile?.tokens || 0;

    console.log('Current user tokens:', userTokens);

    // If user has no tokens, show modal instead of making API call
    if (userTokens === 0) {
      console.log('No tokens available, showing modal');
      setShowTokenModal(true);
      return;
    }

    if (!validateParams()) {
      const firstErrorEl = document.querySelector('.text-red-600');
      if (firstErrorEl) {
        firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    if (onTryItOut) {
      try {
        // Make sure all min/max values use their statistical data if available
        const enhancedParamValues = { ...paramValues };

        parameters.forEach(param => {
          const paramName = param.name;
          if ((paramName.toLowerCase().includes('min') || paramName.toLowerCase().includes('max')) &&
            !enhancedParamValues[paramName]) {
            const stats = getParameterStatistics(param);
            if (paramName.toLowerCase().includes('min')) {
              enhancedParamValues[paramName] = String(stats.min || 0);
            } else if (paramName.toLowerCase().includes('max')) {
              enhancedParamValues[paramName] = String(stats.max || 100);
            }
          }
        });

        await onTryItOut(enhancedParamValues);

        // IMMEDIATELY update local token count (optimistic update)
        const updatedTokens = Math.max(0, userTokens - 1);
        setUserProfile(prev => ({
          ...prev,
          tokens: updatedTokens
        }));

        console.log('Optimistically updated tokens to:', updatedTokens);

        // Also fetch fresh profile from server (for accuracy)
        setTimeout(async () => {
          const freshProfile = await fetchProfile();
          if (freshProfile) {
            setUserProfile(freshProfile);
            console.log('Server profile updated:', freshProfile.tokens);
          }
        }, 1000);

      } catch (error) {
        console.error('API call failed:', error);
        // Revert optimistic update if API call failed
        setUserProfile(prev => ({
          ...prev,
          tokens: userTokens
        }));
      }
    }
  };

  // const handleTryItOut = () => {
  //   if (!validateParams()) {
  //     const firstErrorEl = document.querySelector('.text-red-600');
  //     if (firstErrorEl) {
  //       firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  //     }
  //     return;
  //   }

  //   if (onTryItOut) {
  //     // Make sure all min/max values use their statistical data if available
  //     const enhancedParamValues = {...paramValues};

  //     parameters.forEach(param => {
  //       const paramName = param.name;
  //       if ((paramName.toLowerCase().includes('min') || paramName.toLowerCase().includes('max')) && 
  //           !enhancedParamValues[paramName]) {
  //         // Set default values from statistics if not already set
  //         const stats = getParameterStatistics(param);
  //         if (paramName.toLowerCase().includes('min')) {
  //           enhancedParamValues[paramName] = String(stats.min || 0);
  //         } else if (paramName.toLowerCase().includes('max')) {
  //           enhancedParamValues[paramName] = String(stats.max || 100);
  //         }
  //       }
  //     });

  //     onTryItOut(enhancedParamValues);
  //   }
  // };

  const getParamSuggestions = (paramName) => {
    // Check for x-enum-values in the parameter definition
    const param = parameters.find(p => p.name === paramName);
    if (!param) return [];

    if (param['x-enum-values']) {
      return param['x-enum-values'];
    }

    if (param.enum) {
      return param.enum;
    }

    if (param.type === 'boolean') {
      return ['true', 'false'];
    }

    return [];
  };

  const isIntegerParam = (paramName) => {
    return ['min', 'max', 'limit', 'page', 'minCalories', 'maxCalories',
      'minCarbs', 'maxCarbs', 'minEnergy', 'maxEnergy'].includes(paramName) ||
      paramName.toLowerCase().includes('min') ||
      paramName.toLowerCase().includes('max') ||
      paramName.toLowerCase().includes('limit') ||
      paramName.toLowerCase().includes('page');
  };

  const isIngredientsParam = (paramName) => {
    return paramName.toLowerCase().includes('ingredients');
  };

  const isMultiSelectParam = (param) => {
    return param.collectionFormat === 'multi';
  };

  const isSingleSelectParam = (param) => {
    return param.collectionFormat === 'single';
  };

  const normalizeFieldName = (fieldName) => {
    // Normalize field names by removing spaces, dashes, underscores, and parentheses
    if (!fieldName) return '';
    return fieldName.toLowerCase()
      .replace(/\s+/g, '')
      .replace(/-/g, '')
      .replace(/_/g, '')
      .replace(/\(|\)/g, '');
  };

  const getParameterStatistics = (param) => {
    // First check if the parameter itself has statistics
    if (param['x-statistics']) {
      return param['x-statistics'];
    }

    // If not, check if there are endpoint-level statistics for this parameter
    if (endpointSpec['x-statistics']) {
      // Handle array of statistics objects
      if (Array.isArray(endpointSpec['x-statistics'])) {
        // Normalize the parameter name (remove min/max prefix)
        const normalizedParamName = normalizeFieldName(param.name.replace(/^(min|max)/i, ''));

        // Look for a matching field name
        const matchingStat = endpointSpec['x-statistics'].find(stat => {
          if (!stat.field) return false;
          const normalizedStatField = normalizeFieldName(stat.field);
          return normalizedStatField === normalizedParamName ||
            normalizedStatField.includes(normalizedParamName) ||
            normalizedParamName.includes(normalizedStatField);
        });

        if (matchingStat) {
          return matchingStat;
        }
      }
      // Handle single statistics object
      else if (typeof endpointSpec['x-statistics'] === 'object') {
        // Normalize the parameter name (remove min/max prefix)
        const normalizedParamName = normalizeFieldName(param.name.replace(/^(min|max)/i, ''));

        // Check if the field name matches
        if (endpointSpec['x-statistics'].field) {
          const normalizedStatField = normalizeFieldName(endpointSpec['x-statistics'].field);
          if (normalizedStatField === normalizedParamName ||
            normalizedStatField.includes(normalizedParamName) ||
            normalizedParamName.includes(normalizedStatField)) {
            return endpointSpec['x-statistics'];
          }
        }
      }
    }

    // Also check if there are statistics in x-enum-values
    if (endpointSpec['x-enum-values']) {
      // Handle array of statistics objects
      if (Array.isArray(endpointSpec['x-enum-values'])) {
        // Normalize the parameter name (remove min/max prefix)
        const normalizedParamName = normalizeFieldName(param.name.replace(/^(min|max)/i, ''));

        // Look for a matching field name
        const matchingStat = endpointSpec['x-enum-values'].find(stat => {
          if (!stat.field) return false;
          const normalizedStatField = normalizeFieldName(stat.field);
          return normalizedStatField === normalizedParamName ||
            normalizedStatField.includes(normalizedParamName) ||
            normalizedParamName.includes(normalizedStatField);
        });

        if (matchingStat) {
          return matchingStat;
        }
      }
    }

    // Look for other parameters with the same base name
    const normalizedParamName = normalizeFieldName(param.name.replace(/^(min|max)/i, ''));
    const relatedParams = parameters.filter(p => {
      if (p.name.toLowerCase() === param.name.toLowerCase()) return false;
      const normalizedOtherName = normalizeFieldName(p.name.replace(/^(min|max)/i, ''));
      return normalizedOtherName === normalizedParamName;
    });

    for (const relatedParam of relatedParams) {
      if (relatedParam['x-statistics']) {
        return relatedParam['x-statistics'];
      }
    }

    // If we couldn't find any statistics, use default values
    return {
      min: 0,
      max: 100,
      avg: 50,
      mean: 50,
      stdDev: 25
    };
  };

  // Determine the appropriate decimal precision based on min/max values
  const getDecimalPrecision = (min, max) => {
    // Convert to strings to check decimal places
    const minStr = min.toString();
    const maxStr = max.toString();
    
    // Check if either has a decimal point
    const minDecimals = minStr.includes('.') ? minStr.split('.')[1].length : 0;
    const maxDecimals = maxStr.includes('.') ? maxStr.split('.')[1].length : 0;
    
    // Use the maximum precision from either value, up to 4 decimal places
    return Math.min(Math.max(minDecimals, maxDecimals), 4);
  };

  // Format a number with the appropriate decimal precision
  const formatWithPrecision = (value, min, max) => {
    if (value === '' || value === null || value === undefined) return '';
    
    // Ensure value is a number
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return '';
    
    const precision = getDecimalPrecision(min, max);
    return precision > 0 ? numValue.toFixed(precision) : Math.round(numValue).toString();
  };

  // Handle field parameter which has different enum values based on the endpoint
  const getEnumValuesForField = (paramName) => {
    // First check if the parameter has x-enum-values
    const param = parameters.find(p => p.name === paramName);
    if (param && param['x-enum-values']) {
      return param['x-enum-values'];
    }

    // If it's a field parameter and there are x-enum-values at the endpoint level
    if (paramName === 'field' && endpointSpec['x-enum-values']) {
      return endpointSpec['x-enum-values'];
    }

    // For field parameter, check if there are field statistics that can be used
    if (paramName === 'field' && endpointSpec['x-statistics']) {
      if (Array.isArray(endpointSpec['x-statistics'])) {
        // Return an array of field names from the statistics
        return endpointSpec['x-statistics'].map(stat => stat.field).filter(Boolean);
      } else if (endpointSpec['x-statistics'].field) {
        return [endpointSpec['x-statistics'].field];
      }
    }

    return [];
  };

  const handleSearchInputChange = (paramName, value) => {
    setSearchQueries(prev => ({
      ...prev,
      [paramName]: value
    }));
  };

  const fuzzySearch = (searchTerm, items) => {
    if (!searchTerm || searchTerm.trim() === '') return items;

    searchTerm = searchTerm.toLowerCase();

    return items.filter(item =>
      item.toLowerCase().includes(searchTerm)
    );
  };

  // Find all min/max parameter pairs and group them
  const findMinMaxPairs = useCallback(() => {
    // Create a map to store pairs by base name
    const pairs = {};

    // First pass: identify all min/max parameters
    parameters.forEach(param => {
      if (param.name.toLowerCase().includes('min') || param.name.toLowerCase().includes('max')) {
        // Extract the base parameter name (remove min/max prefix)
        const baseParamName = normalizeFieldName(param.name.replace(/^(min|max)/i, ''));

        if (!pairs[baseParamName]) {
          pairs[baseParamName] = {
            min: null,
            max: null,
            displayName: baseParamName,
            field: null
          };
        }

        // Assign to min or max
        if (param.name.toLowerCase().includes('min')) {
          pairs[baseParamName].min = param;
        } else {
          pairs[baseParamName].max = param;
        }

        // If parameter has statistics, use them
        if (param['x-statistics']) {
          pairs[baseParamName].stats = param['x-statistics'];
          pairs[baseParamName].field = param['x-statistics'].field || baseParamName;
        }
      }
    });

    // Second pass: Enhance with more display information
    Object.keys(pairs).forEach(key => {
      const pair = pairs[key];

      // If field is still null, try to get from statistics
      if (!pair.field) {
        const stats = getParameterStatistics(pair.min || pair.max);
        pair.stats = stats;
        pair.field = stats.field || key;
      }

      // Format the display name nicely
      if (pair.field) {
        pair.displayName = pair.field;
      } else {
        // Make the base parameter name more readable
        pair.displayName = key
          .replace(/([A-Z])/g, ' $1') // Insert a space before all capital letters
          .replace(/^./, str => str.toUpperCase()); // Uppercase the first character
      }
    });

    return pairs;
  }, [parameters]);

  const minMaxPairs = useMemo(() => findMinMaxPairs(), [findMinMaxPairs]);

  const renderCombinedMinMaxParameters = (paramGroup) => {
    const combinedParameters = [];

    // First add special case for energy
    if (paramGroup === 'query' && parameters.find(p => p.name === 'minEnergy') && parameters.find(p => p.name === 'maxEnergy')) {
      combinedParameters.push(renderEnergyRangeBlock());
    }

    // Then add all other min/max pairs
    Object.values(minMaxPairs).forEach(pair => {
      // Skip the energy pair since we already handled it
      if ((pair.min && pair.min.name === 'minEnergy') || (pair.max && pair.max.name === 'maxEnergy')) {
        return;
      }

      // Only process pairs where both min and max exist
      if (pair.min && pair.max) {
        // Check if the parameters belong to the current parameter group
        if ((pair.min.in === paramGroup && pair.max.in === paramGroup)) {
          combinedParameters.push(renderMinMaxRangeBlock(pair));
        }
      }
    });

    return combinedParameters.length > 0 ? combinedParameters : null;
  };

  const renderEnergyRangeBlock = () => {
    // Keep existing energy range implementation
    const minEnergyParam = parameters.find(p => p.name === 'minEnergy');
    const maxEnergyParam = parameters.find(p => p.name === 'maxEnergy');

    if (!minEnergyParam || !maxEnergyParam) return null;

    // Get statistics from our helper function
    const stats = getParameterStatistics(minEnergyParam);
    const minPossible = stats.min !== undefined ? stats.min : 0;
    const maxPossible = stats.max !== undefined ? stats.max : 3440456.64;

    // Get current values
    const currentMinValue = paramValues['minEnergy'] ? parseFloat(paramValues['minEnergy']) : minPossible;
    const currentMaxValue = paramValues['maxEnergy'] ? parseFloat(paramValues['maxEnergy']) : maxPossible;

    // Calculate percentages for positioning
    const minPercent = ((currentMinValue - minPossible) / (maxPossible - minPossible)) * 100;
    const maxPercent = ((currentMaxValue - minPossible) / (maxPossible - minPossible)) * 100;

    const hasMinError = !!paramErrors['minEnergy'];
    const hasMaxError = !!paramErrors['maxEnergy'];

    // Handle direct click on slider track
    const handleSliderTrackClick = (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickPosition = e.clientX - rect.left;
      const percentPosition = (clickPosition / rect.width) * 100;
      const value = minPossible + (percentPosition / 100) * (maxPossible - minPossible);

      // Determine whether to move min or max slider based on which one is closer
      const distanceToMin = Math.abs(percentPosition - minPercent);
      const distanceToMax = Math.abs(percentPosition - maxPercent);

      if (distanceToMin <= distanceToMax) {
        handleParamChange('minEnergy', formatWithPrecision(value, minPossible, maxPossible));
      } else {
        handleParamChange('maxEnergy', formatWithPrecision(value, minPossible, maxPossible));
      }
    };

    // Handle min slider drag
    const handleMinSliderDrag = (e) => {
      e.preventDefault();
      e.stopPropagation();

      const slider = e.currentTarget.parentElement;
      const rect = slider.getBoundingClientRect();
      const startX = e.clientX;
      const startValue = currentMinValue;
      const range = maxPossible - minPossible;
      const sliderWidth = rect.width;

      const handleMouseMove = (moveEvent) => {
        // Use requestAnimationFrame for smoother updates
        requestAnimationFrame(() => {
          const dx = moveEvent.clientX - startX;
          const percentChange = dx / sliderWidth;
          const valueChange = percentChange * range;
          const newValue = Math.max(minPossible, Math.min(currentMaxValue, startValue + valueChange));

          // Only update if value has changed significantly to avoid unnecessary renders
          if (Math.abs(newValue - currentMinValue) > (range / 1000)) {
            handleParamChange('minEnergy', formatWithPrecision(newValue, minPossible, maxPossible));
          }
        });
      };

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };

    // Handle max slider drag
    const handleMaxSliderDrag = (e) => {
      e.preventDefault();
      e.stopPropagation();

      const slider = e.currentTarget.parentElement;
      const rect = slider.getBoundingClientRect();
      const startX = e.clientX;
      const startValue = currentMaxValue;
      const range = maxPossible - minPossible;
      const sliderWidth = rect.width;

      const handleMouseMove = (moveEvent) => {
        // Use requestAnimationFrame for smoother updates
        requestAnimationFrame(() => {
          const dx = moveEvent.clientX - startX;
          const percentChange = dx / sliderWidth;
          const valueChange = percentChange * range;
          const newValue = Math.min(maxPossible, Math.max(currentMinValue, startValue + valueChange));

          // Only update if value has changed significantly to avoid unnecessary renders
          if (Math.abs(newValue - currentMaxValue) > (range / 1000)) {
            handleParamChange('maxEnergy', formatWithPrecision(newValue, minPossible, maxPossible));
          }
        });
      };

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };

    return (
      <div key="energy-combined" className="border rounded-md p-2 bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
        <div className="flex flex-wrap items-start justify-between">
          <div className="mb-1">
            <div className="flex items-center">
              <span className="font-medium text-xs text-gray-900 dark:text-gray-200">Energy (kcal)</span>
              {(minEnergyParam.required || maxEnergyParam.required) && (
                <span className="ml-1 text-xs text-red-500 dark:text-red-400">*</span>
              )}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Energy range in kilocalories
            </div>
          </div>
        </div>

        <div className="mt-2 relative space-y-2">
          <div className="flex justify-between items-center">
            <div className="w-24">
              <label className="text-xs text-gray-500 dark:text-gray-400">Min</label>
              <input
                type="text"
                id="param-minEnergy"
                className={`w-full rounded-md shadow-sm text-sm
                  ${hasMinError
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500 dark:border-red-600 dark:bg-gray-900 dark:text-gray-200 dark:focus:ring-red-500 dark:focus:border-red-600'
                    : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 dark:focus:ring-indigo-400 dark:focus:border-indigo-400'}`}
                value={paramValues['minEnergy'] || ''}
                onChange={(e) => {
                  const newMin = parseFloat(e.target.value);
                  if (e.target.value === '') {
                    handleParamChange('minEnergy', '');
                  } else if (!isNaN(newMin) && (isNaN(currentMaxValue) || newMin <= currentMaxValue)) {
                    handleParamChange('minEnergy', formatWithPrecision(newMin, minPossible, maxPossible));
                  }
                }}
                placeholder="Min"
              />
            </div>

            <div className="flex-1 px-4 text-xs text-gray-500 dark:text-gray-400 text-center">
              Energy (kcal)
            </div>

            <div className="w-24">
              <label className="text-xs text-gray-500 dark:text-gray-400">Max</label>
              <input
                type="text"
                id="param-maxEnergy"
                className={`w-full rounded-md shadow-sm text-sm
                  ${hasMaxError
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500 dark:border-red-600 dark:bg-gray-900 dark:text-gray-200 dark:focus:ring-red-500 dark:focus:border-red-600'
                    : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 dark:focus:ring-indigo-400 dark:focus:border-indigo-400'}`}
                value={paramValues['maxEnergy'] || ''}
                onChange={(e) => {
                  const newMax = parseFloat(e.target.value);
                  if (e.target.value === '') {
                    handleParamChange('maxEnergy', '');
                  } else if (!isNaN(newMax) && (isNaN(currentMinValue) || newMax >= currentMinValue)) {
                    handleParamChange('maxEnergy', formatWithPrecision(newMax, minPossible, maxPossible));
                  }
                }}
                placeholder="Max"
              />
            </div>
          </div>

          {/* Improved two-way slider implementation */}
          <div className="relative pt-5 pb-2">
            {/* Slider track background - made clickable */}
            <div
              className="absolute top-1/2 left-0 right-0 -mt-1 h-2.5 bg-gray-200 dark:bg-gray-700 rounded-lg cursor-pointer z-10"
              onClick={handleSliderTrackClick}
            ></div>

            {/* Active range - brighter fill color */}
            <div
              className="absolute top-1/2 -mt-1 h-2.5 bg-blue-600 dark:bg-blue-500 rounded-lg pointer-events-none z-20"
              style={{
                left: `${minPercent}%`,
                width: `${Math.max(0, maxPercent - minPercent)}%`
              }}
            ></div>

            {/* Custom thumbs */}
            <div
              className="absolute w-5 h-5 bg-white dark:bg-gray-200 border-2 border-blue-600 dark:border-blue-400 rounded-full -ml-2.5 top-1/2 -mt-2.5 cursor-grab active:cursor-grabbing z-30"
              style={{ left: `${minPercent}%` }}
              onMouseDown={handleMinSliderDrag}
            ></div>

            <div
              className="absolute w-5 h-5 bg-white dark:bg-gray-200 border-2 border-blue-600 dark:border-blue-400 rounded-full -ml-2.5 top-1/2 -mt-2.5 cursor-grab active:cursor-grabbing z-30"
              style={{ left: `${maxPercent}%` }}
              onMouseDown={handleMaxSliderDrag}
            ></div>
          </div>

          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 px-1">
            <span>{formatWithPrecision(minPossible, minPossible, maxPossible)}</span>
            <span>{formatWithPrecision(maxPossible, minPossible, maxPossible)}</span>
          </div>

          {(hasMinError || hasMaxError) && (
            <div className="mt-1 text-sm text-red-600 dark:text-red-400">
              <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" />
              {paramErrors['minEnergy'] || paramErrors['maxEnergy']}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderMinMaxRangeBlock = (pair) => {
    const { min: minParam, max: maxParam, displayName, stats } = pair;

    if (!minParam || !maxParam) return null;

    // Get statistics from our helper function
    const pairStats = stats || getParameterStatistics(minParam);
    const minPossible = pairStats.min !== undefined ? pairStats.min : 0;
    const maxPossible = pairStats.max !== undefined ? pairStats.max : 100;

    // Get current values
    const currentMinValue = paramValues[minParam.name] ? parseFloat(paramValues[minParam.name]) : minPossible;
    const currentMaxValue = paramValues[maxParam.name] ? parseFloat(paramValues[maxParam.name]) : maxPossible;

    // Calculate percentages for positioning
    const minPercent = ((currentMinValue - minPossible) / (maxPossible - minPossible)) * 100;
    const maxPercent = ((currentMaxValue - minPossible) / (maxPossible - minPossible)) * 100;

    const hasMinError = !!paramErrors[minParam.name];
    const hasMaxError = !!paramErrors[maxParam.name];

    // Handle direct click on slider track
    const handleSliderTrackClick = (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickPosition = e.clientX - rect.left;
      const percentPosition = (clickPosition / rect.width) * 100;
      const value = minPossible + (percentPosition / 100) * (maxPossible - minPossible);

      // Determine whether to move min or max slider based on which one is closer
      const distanceToMin = Math.abs(percentPosition - minPercent);
      const distanceToMax = Math.abs(percentPosition - maxPercent);

      if (distanceToMin <= distanceToMax) {
        handleParamChange(minParam.name, formatWithPrecision(value, minPossible, maxPossible));
      } else {
        handleParamChange(maxParam.name, formatWithPrecision(value, minPossible, maxPossible));
      }
    };

    // Handle min slider drag
    const handleMinSliderDrag = (e) => {
      e.preventDefault();
      e.stopPropagation();

      const slider = e.currentTarget.parentElement;
      const rect = slider.getBoundingClientRect();
      const startX = e.clientX;
      const startValue = currentMinValue;
      const range = maxPossible - minPossible;
      const sliderWidth = rect.width;

      const handleMouseMove = (moveEvent) => {
        // Use requestAnimationFrame for smoother updates
        requestAnimationFrame(() => {
          const dx = moveEvent.clientX - startX;
          const percentChange = dx / sliderWidth;
          const valueChange = percentChange * range;
          const newValue = Math.max(minPossible, Math.min(currentMaxValue, startValue + valueChange));

          // Only update if value has changed significantly to avoid unnecessary renders
          if (Math.abs(newValue - currentMinValue) > (range / 1000)) {
            handleParamChange(minParam.name, formatWithPrecision(newValue, minPossible, maxPossible));
          }
        });
      };

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };

    // Handle max slider drag
    const handleMaxSliderDrag = (e) => {
      e.preventDefault();
      e.stopPropagation();

      const slider = e.currentTarget.parentElement;
      const rect = slider.getBoundingClientRect();
      const startX = e.clientX;
      const startValue = currentMaxValue;
      const range = maxPossible - minPossible;
      const sliderWidth = rect.width;

      const handleMouseMove = (moveEvent) => {
        // Use requestAnimationFrame for smoother updates
        requestAnimationFrame(() => {
          const dx = moveEvent.clientX - startX;
          const percentChange = dx / sliderWidth;
          const valueChange = percentChange * range;
          const newValue = Math.min(maxPossible, Math.max(currentMinValue, startValue + valueChange));

          // Only update if value has changed significantly to avoid unnecessary renders
          if (Math.abs(newValue - currentMaxValue) > (range / 1000)) {
            handleParamChange(maxParam.name, formatWithPrecision(newValue, minPossible, maxPossible));
          }
        });
      };

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };

    return (
      <div key={`${minParam.name}-${maxParam.name}-combined`} className="border rounded-md p-2 bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
        <div className="flex flex-wrap items-start justify-between">
          <div className="mb-1">
            <div className="flex items-center">
              <span className="font-medium text-xs text-gray-900 dark:text-gray-200">{displayName}</span>
              {(minParam.required || maxParam.required) && (
                <span className="ml-1 text-xs text-red-500 dark:text-red-400">*</span>
              )}
              <ParameterTooltip param={minParam} paramType={minParam.in || 'query'} />
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {minParam.description || maxParam.description || `Range for ${displayName}`}
            </div>
          </div>
        </div>

        <div className="mt-2 relative space-y-2">
          <div className="flex justify-between items-center">
            <div className="w-24">
              <label className="text-xs text-gray-500 dark:text-gray-400">Min</label>
              <input
                type="text"
                id={`param-${minParam.name}`}
                className={`w-full rounded-md shadow-sm text-sm
                  ${hasMinError
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500 dark:border-red-600 dark:bg-gray-900 dark:text-gray-200 dark:focus:ring-red-500 dark:focus:border-red-600'
                    : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 dark:focus:ring-indigo-400 dark:focus:border-indigo-400'}`}
                value={paramValues[minParam.name] || ''}
                onChange={(e) => {
                  const newMin = parseFloat(e.target.value);
                  if (e.target.value === '') {
                    handleParamChange(minParam.name, '');
                  } else if (!isNaN(newMin) && (isNaN(currentMaxValue) || newMin <= currentMaxValue)) {
                    handleParamChange(minParam.name, formatWithPrecision(newMin, minPossible, maxPossible));
                  }
                }}
                placeholder="Min"
              />
            </div>

            <div className="flex-1 px-4 text-xs text-gray-500 dark:text-gray-400 text-center">
              {displayName}
            </div>

            <div className="w-24">
              <label className="text-xs text-gray-500 dark:text-gray-400">Max</label>
              <input
                type="text"
                id={`param-${maxParam.name}`}
                className={`w-full rounded-md shadow-sm text-sm
                  ${hasMaxError
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500 dark:border-red-600 dark:bg-gray-900 dark:text-gray-200 dark:focus:ring-red-500 dark:focus:border-red-600'
                    : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 dark:focus:ring-indigo-400 dark:focus:border-indigo-400'}`}
                value={paramValues[maxParam.name] || ''}
                onChange={(e) => {
                  const newMax = parseFloat(e.target.value);
                  if (e.target.value === '') {
                    handleParamChange(maxParam.name, '');
                  } else if (!isNaN(newMax) && (isNaN(currentMinValue) || newMax >= currentMinValue)) {
                    handleParamChange(maxParam.name, formatWithPrecision(newMax, minPossible, maxPossible));
                  }
                }}
                placeholder="Max"
              />
            </div>
          </div>

          {/* Two-way slider implementation */}
          <div className="relative pt-5 pb-2">
            {/* Slider track background - made clickable */}
            <div
              className="absolute top-1/2 left-0 right-0 -mt-1 h-2.5 bg-gray-200 dark:bg-gray-700 rounded-lg cursor-pointer z-10"
              onClick={handleSliderTrackClick}
            ></div>

            {/* Active range - brighter fill color */}
            <div
              className="absolute top-1/2 -mt-1 h-2.5 bg-blue-600 dark:bg-blue-500 rounded-lg pointer-events-none z-20"
              style={{
                left: `${minPercent}%`,
                width: `${Math.max(0, maxPercent - minPercent)}%`
              }}
            ></div>

            {/* Custom thumbs */}
            <div
              className="absolute w-5 h-5 bg-white dark:bg-gray-200 border-2 border-blue-600 dark:border-blue-400 rounded-full -ml-2.5 top-1/2 -mt-2.5 cursor-grab active:cursor-grabbing z-30"
              style={{ left: `${minPercent}%` }}
              onMouseDown={handleMinSliderDrag}
            ></div>

            <div
              className="absolute w-5 h-5 bg-white dark:bg-gray-200 border-2 border-blue-600 dark:border-blue-400 rounded-full -ml-2.5 top-1/2 -mt-2.5 cursor-grab active:cursor-grabbing z-30"
              style={{ left: `${maxPercent}%` }}
              onMouseDown={handleMaxSliderDrag}
            ></div>
          </div>

          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 px-1">
            <span>{formatWithPrecision(minPossible, minPossible, maxPossible)}</span>
            <span>{formatWithPrecision(maxPossible, minPossible, maxPossible)}</span>
          </div>

          {(hasMinError || hasMaxError) && (
            <div className="mt-1 text-sm text-red-600 dark:text-red-400">
              <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" />
              {paramErrors[minParam.name] || paramErrors[maxParam.name]}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderParameterInput = (param) => {
    const paramName = param.name;
    const suggestions = param['x-enum-values'] || getParamSuggestions(paramName);
    const hasError = !!paramErrors[paramName];
    const hasSuggestions = suggestions && suggestions.length > 0;

    // Special case for body parameters
    if (param.in === 'body') {
      // Check if we have request body schema information in the API docs
      const bodySchema = endpointSpec.requestBody?.content?.['application/json']?.schema;
      let defaultBodyValue = '{}';
      let bodyDescription = 'Enter a valid JSON object for the request body';

      if (bodySchema) {
        // Create a template from the schema
        try {
          // Create a template with example values where available
          const template = {};

          if (bodySchema.properties) {
            Object.entries(bodySchema.properties).forEach(([propName, propSchema]) => {
              // Use example if available, otherwise use appropriate default value for type
              if (propSchema.example !== undefined) {
                template[propName] = propSchema.example;
              } else if (propSchema.type === 'string') {
                template[propName] = '';
              } else if (propSchema.type === 'number' || propSchema.type === 'integer') {
                template[propName] = 0;
              } else if (propSchema.type === 'boolean') {
                template[propName] = false;
              } else if (propSchema.type === 'array') {
                template[propName] = [];
              } else if (propSchema.type === 'object') {
                template[propName] = {};
              }

              // If there are x-enum-values, show them in the description
              if (propSchema['x-enum-values'] && propSchema['x-enum-values'].length > 0) {
                bodyDescription += `\nOptions for ${propName}: ${propSchema['x-enum-values'].join(', ')}`;
              }

              // If there are x-statistics, show them in the description
              if (propSchema['x-statistics']) {
                const stats = propSchema['x-statistics'];
                bodyDescription += `\nRange for ${propName}: ${stats.min || 0} - ${stats.max || 100}`;
              }
            });
          }

          defaultBodyValue = JSON.stringify(template, null, 2);
        } catch (error) {
          console.error('Error parsing body schema:', error);
        }
      }

      // If the param value is not set yet, use the default
      if (!paramValues[paramName]) {
        handleParamChange(paramName, defaultBodyValue);
      }

      return (
        <div className="relative">
          <textarea
            id={`param-${paramName}`}
            rows={5}
            className={`block w-full rounded-md shadow-sm sm:text-sm font-mono 
              ${hasError
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500 dark:border-red-600 dark:bg-gray-900 dark:text-gray-200 dark:focus:ring-red-500 dark:focus:border-red-600'
                : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 dark:focus:ring-indigo-400 dark:focus:border-indigo-400'}`}
            placeholder={defaultBodyValue}
            value={paramValues[paramName] || ''}
            onChange={(e) => handleParamChange(paramName, e.target.value)}
          />
          {hasError && (
            <div className="mt-1 text-sm text-red-600 dark:text-red-400">
              <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" />
              {paramErrors[paramName]}
            </div>
          )}
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex items-start">
            <FontAwesomeIcon icon={faLightbulb} className="mr-1 mt-0.5 text-amber-500" />
            <span className="whitespace-pre-line">{bodyDescription}</span>
          </div>
        </div>
      );
    }

    // Special case for enum parameters
    if (param.enum) {
      return (
        <div>
          <div className="relative">
            <select
              id={`param-${paramName}`}
              className={`block w-full rounded-md shadow-sm sm:text-sm appearance-none
                ${hasError
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500 dark:border-red-600 dark:bg-gray-900 dark:text-gray-200 dark:focus:ring-red-500 dark:focus:border-red-600'
                  : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 dark:focus:ring-indigo-400 dark:focus:border-indigo-400'}`}
              value={paramValues[paramName] || ''}
              onChange={(e) => handleParamChange(paramName, e.target.value)}
            >
              <option value="">Select a value</option>
              {param.enum.map(value => (
                <option key={value} value={value} className="dark:bg-gray-900">
                  {value}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <FontAwesomeIcon icon={faAngleDown} className="text-gray-400 dark:text-gray-500" />
            </div>
          </div>
          {hasError && (
            <div className="mt-1 text-sm text-red-600 dark:text-red-400">
              <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" />
              {paramErrors[paramName]}
            </div>
          )}
        </div>
      );
    }

    // Handle page parameter (always use input field, not slider)
    if (paramName === 'page') {
      return (
        <div className="relative space-y-2">
          <div className="flex items-center">
            <input
              type="text"
              id={`param-${paramName}`}
              className={`w-24 rounded-md shadow-sm text-sm
                ${hasError
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500 dark:border-red-600 dark:bg-gray-900 dark:text-gray-200 dark:focus:ring-red-500 dark:focus:border-red-600'
                  : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 dark:focus:ring-indigo-400 dark:focus:border-indigo-400'}`}
              value={paramValues[paramName] || ''}
              onChange={(e) => handleParamChange(paramName, e.target.value)}
              placeholder="Enter page number"
            />
          </div>

          {hasError && (
            <div className="mt-1 text-sm text-red-600 dark:text-red-400">
              <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" />
              {paramErrors[paramName]}
            </div>
          )}

          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex items-start">
            <FontAwesomeIcon icon={faLightbulb} className="mr-1 mt-0.5 text-amber-500" />
            <span>Please enter an integer value</span>
          </div>
        </div>
      );
    }

    // Handle limit parameter (slider with range 1-10)
    if (paramName === 'limit') {
      const minLimit = 1;
      const maxLimit = 10;
      const defaultLimit = 10;

      const currentValue = paramValues[paramName] ? parseInt(paramValues[paramName], 10) : defaultLimit;
      const fillPercentage = ((currentValue - minLimit) / (maxLimit - minLimit)) * 100;

      return (
        <div className="relative space-y-2">
          <div className="flex items-center justify-between">
            <input
              type="text"
              id={`param-${paramName}`}
              className={`w-24 rounded-md shadow-sm text-sm
                ${hasError
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500 dark:border-red-600 dark:bg-gray-900 dark:text-gray-200 dark:focus:ring-red-500 dark:focus:border-red-600'
                  : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 dark:focus:ring-indigo-400 dark:focus:border-indigo-400'}`}
              value={paramValues[paramName] || ''}
              onChange={(e) => {
                const value = e.target.value;
                const numValue = parseInt(value, 10);
                if (value === '') {
                  handleParamChange(paramName, '');
                } else if (numValue >= minLimit && numValue <= maxLimit) {
                  handleParamChange(paramName, formatWithPrecision(numValue, minLimit, maxLimit));
                }
              }}
              placeholder="Enter limit"
            />
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
              {minLimit} - {maxLimit}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-600 dark:text-gray-400">{formatWithPrecision(minLimit, minLimit, maxLimit)}</span>
            <div className="relative w-full">
              <div className="absolute top-1/2 left-0 right-0 -mt-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-lg"></div>
              <div
                className="absolute top-1/2 left-0 -mt-1 h-2 bg-indigo-500 dark:bg-indigo-400 rounded-lg"
                style={{ width: `${fillPercentage}%` }}
              ></div>
              <input
                type="range"
                min={minLimit}
                max={maxLimit}
                value={currentValue}
                onChange={(e) => handleParamChange(paramName, formatWithPrecision(e.target.value, minLimit, maxLimit))}
                className="relative w-full h-2 bg-transparent appearance-none cursor-pointer z-10"
                style={{
                  WebkitAppearance: 'none',
                  appearance: 'none'
                }}
              />
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400">{formatWithPrecision(maxLimit, minLimit, maxLimit)}</span>
          </div>

          {hasError && (
            <div className="mt-1 text-sm text-red-600 dark:text-red-400">
              <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" />
              {paramErrors[paramName]}
            </div>
          )}

          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex items-start">
            <FontAwesomeIcon icon={faLightbulb} className="mr-1 mt-0.5 text-amber-500" />
            <span>Please enter a value between {minLimit} and {maxLimit}</span>
          </div>
        </div>
      );
    }

    // Skip min/max parameters that are handled by the combined blocks
    if ((paramName.toLowerCase().includes('min') || paramName.toLowerCase().includes('max'))) {
      const baseParamName = normalizeFieldName(paramName.replace(/(min|max)/i, ''));
      const pair = minMaxPairs[baseParamName];
      if (pair && pair.min && pair.max) {
        return null;
      }
    }

    if (param['x-statistics'] && !isIntegerParam(paramName)) {
      const stats = param['x-statistics'];
      const min = stats.min !== undefined ? stats.min : 0;
      const max = stats.max !== undefined ? stats.max : 100;
      const defaultValue = stats.avg || stats.mean || min;
      
      const currentValue = paramValues[paramName] ? parseFloat(paramValues[paramName]) : defaultValue;
      const fillPercentage = ((currentValue - min) / (max - min)) * 100;

      return (
        <div className="relative space-y-2">
          <div className="flex items-center justify-between">
            <input
              type="text"
              id={`param-${paramName}`}
              className={`w-24 rounded-md shadow-sm text-sm
                ${hasError
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500 dark:border-red-600 dark:bg-gray-900 dark:text-gray-200 dark:focus:ring-red-500 dark:focus:border-red-600'
                  : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 dark:focus:ring-indigo-400 dark:focus:border-indigo-400'}`}
              value={paramValues[paramName] || ''}
              onChange={(e) => handleParamChange(paramName, formatWithPrecision(e.target.value, min, max))}
              placeholder={param.example || `Enter ${paramName}`}
            />
            {/* <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
              {min.toFixed(2)} - {max.toFixed(2)}
            </span> */}
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-600 dark:text-gray-400">{formatWithPrecision(min, min, max)}</span>
            <div className="relative w-full">
              <div className="absolute top-1/2 left-0 right-0 -mt-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-lg"></div>
              <div
                className="absolute top-1/2 left-0 -mt-1 h-2 bg-indigo-500 dark:bg-indigo-400 rounded-lg"
                style={{ width: `${fillPercentage}%` }}
              ></div>
              <input
                type="range"
                min={min}
                max={max}
                step={(max - min) / 100}
                value={currentValue}
                onChange={(e) => handleParamChange(paramName, formatWithPrecision(e.target.value, min, max))}
                className="relative w-full h-2 bg-transparent appearance-none cursor-pointer z-10"
                style={{
                  WebkitAppearance: 'none',
                  appearance: 'none'
                }}
              />
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400">{formatWithPrecision(max, min, max)}</span>
          </div>

          {hasError && (
            <div className="mt-1 text-sm text-red-600 dark:text-red-400">
              <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" />
              {paramErrors[paramName]}
            </div>
          )}
          
          {param.description && (
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex items-start">
              <FontAwesomeIcon icon={faLightbulb} className="mr-1 mt-0.5 text-amber-500" />
              <span>{param.description}</span>
            </div>
          )}
        </div>
      );
    }

    // Handle integer parameters with sliders (other than page and min/max)
    if (isIntegerParam(paramName) && paramName !== 'page' &&
      !paramName.toLowerCase().includes('min') && !paramName.toLowerCase().includes('max')) {
      // Use x-statistics if available, otherwise use defaults
      const stats = getParameterStatistics(param);

      const sliderDefaults = {
        min: stats.min || 0,
        max: stats.max || 100,
        default: stats.mean || stats.avg || 0
      };

      const currentValue = paramValues[paramName] ? parseFloat(paramValues[paramName]) : sliderDefaults.default;

      // Calculate the percentage for the slider fill
      const fillPercentage = ((currentValue - sliderDefaults.min) / (sliderDefaults.max - sliderDefaults.min)) * 100;

      return (
        <div className="relative space-y-2">
          <div className="flex items-center justify-between">
            <input
              type="text"
              id={`param-${paramName}`}
              className={`w-24 rounded-md shadow-sm text-sm
                ${hasError
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500 dark:border-red-600 dark:bg-gray-900 dark:text-gray-200 dark:focus:ring-red-500 dark:focus:border-red-600'
                  : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 dark:focus:ring-indigo-400 dark:focus:border-indigo-400'}`}
              value={paramValues[paramName] || ''}
              onChange={(e) => handleParamChange(paramName, formatWithPrecision(e.target.value, sliderDefaults.min, sliderDefaults.max))}
              placeholder={param.example || `Enter ${paramName}`}
            />
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
              {formatWithPrecision(sliderDefaults.min, sliderDefaults.min, sliderDefaults.max)} - {formatWithPrecision(sliderDefaults.max, sliderDefaults.min, sliderDefaults.max)}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-600 dark:text-gray-400">{formatWithPrecision(sliderDefaults.min, sliderDefaults.min, sliderDefaults.max)}</span>
            <div className="relative w-full">
              <div className="absolute top-1/2 left-0 right-0 -mt-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-lg"></div>
              <div
                className="absolute top-1/2 left-0 -mt-1 h-2 bg-indigo-500 dark:bg-indigo-400 rounded-lg"
                style={{ width: `${fillPercentage}%` }}
              ></div>
              <input
                type="range"
                min={sliderDefaults.min}
                max={sliderDefaults.max}
                value={currentValue}
                onChange={(e) => handleParamChange(paramName, formatWithPrecision(e.target.value, sliderDefaults.min, sliderDefaults.max))}
                className="relative w-full h-2 bg-transparent appearance-none cursor-pointer z-10"
                style={{
                  WebkitAppearance: 'none',
                  appearance: 'none'
                }}
              />
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400">{formatWithPrecision(sliderDefaults.max, sliderDefaults.min, sliderDefaults.max)}</span>
          </div>

          {hasError && (
            <div className="mt-1 text-sm text-red-600 dark:text-red-400">
              <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" />
              {paramErrors[paramName]}
            </div>
          )}
        </div>
      );
    }

    // Handle parameters with collectionFormat: "single" (fuzzy search with single selection)
    if (isSingleSelectParam(param) && (param['x-enum-values'] || paramName === 'field')) {
      const suggestions = param['x-enum-values'] || getEnumValuesForField(paramName);
      const searchTerm = searchQueries[paramName] || '';
      const filteredSuggestions = fuzzySearch(searchTerm, suggestions);

      return (
        <div className="relative">
          <div className="flex">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FontAwesomeIcon icon={faSearch} className="text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="text"
                id={`param-${paramName}`}
                className={`block w-full pl-10 pr-3 rounded-md shadow-sm sm:text-sm
                  ${hasError
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500 dark:border-red-600 dark:bg-gray-900 dark:text-gray-200 dark:focus:ring-red-500 dark:focus:border-red-600'
                    : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 dark:focus:ring-indigo-400 dark:focus:border-indigo-400'}
                  rounded-r-none`}
                placeholder={`Search for ${paramName}`}
                onFocus={() => setActiveSuggestionField(paramName)}
                value={paramValues[paramName] || searchTerm}
                onChange={(e) => {
                  handleSearchInputChange(paramName, e.target.value);
                  handleParamChange(paramName, e.target.value);
                }}
              />
            </div>

            <button
              id={`param-btn-${paramName}`}
              type="button"
              className="inline-flex items-center px-2 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
              onClick={() => setActiveSuggestionField(activeSuggestionField === paramName ? null : paramName)}
            >
              <FontAwesomeIcon icon={faChevronDown} />
            </button>
          </div>

          {hasError && (
            <div className="mt-1 text-sm text-red-600 dark:text-red-400">
              <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" />
              {paramErrors[paramName]}
            </div>
          )}

          <AnimatePresence>
            {activeSuggestionField === paramName && filteredSuggestions && filteredSuggestions.length > 0 && (
              <motion.div
                ref={suggestionRef}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.1 }}
                className="absolute z-[9999] mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto"
              >
                {filteredSuggestions.length > 0 ? (
                  filteredSuggestions.map((suggestion, idx) => (
                    <div
                      key={idx}
                      className="w-full text-left px-4 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-700 text-sm border-b border-gray-100 dark:border-gray-700 last:border-0 cursor-pointer bg-white dark:bg-gray-800 dark:text-gray-200"
                      onClick={() => handleSuggestionClick(paramName, suggestion)}
                    >
                      {suggestion}
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800">No matching options found</div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    // Handle parameters with collectionFormat: "multi" (multi-select with checkboxes)
    if (isMultiSelectParam(param)) {
      // Get the suggestions from x-enum-values
      const suggestions = param['x-enum-values'] || [];

      // No suggestions available, fall back to regular input
      if (suggestions.length === 0) {
        return (
          <div className="relative">
            <input
              type="text"
              id={`param-${paramName}`}
              className={`block w-full rounded-md shadow-sm text-sm
                ${hasError
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500 dark:border-red-600 dark:bg-gray-700 dark:text-gray-200 dark:focus:ring-red-500 dark:focus:border-red-600'
                  : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:focus:ring-indigo-400 dark:focus:border-indigo-400'}`}
              value={paramValues[paramName] || ''}
              onChange={(e) => handleParamChange(paramName, e.target.value)}
              placeholder={`Enter ${paramName}`}
            />
            {hasError && (
              <div className="mt-1 text-sm text-red-600 dark:text-red-400">
                <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" />
                {paramErrors[paramName]}
              </div>
            )}
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex items-start">
              <FontAwesomeIcon icon={faLightbulb} className="mr-1 mt-0.5 text-amber-500" />
              <span>Enter multiple values separated by commas</span>
            </div>
          </div>
        );
      }

      // Use the selected ingredients from state
      const selected = selectedIngredients[paramName] || [];
      const searchTerm = searchQueries[paramName] || '';
      const filteredSuggestions = fuzzySearch(searchTerm, suggestions);

      // Display the multi-select interface with tags
      return (
        <div className="space-y-3">
          {/* Selected items display as tags */}
          {selected.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {selected.map(item => (
                <div
                  key={item}
                  className="bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-2 py-1 rounded-md text-xs flex items-center"
                >
                  {item}
                  <button
                    type="button"
                    onClick={() => removeIngredient(paramName, item)}
                    className="ml-1.5 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200"
                  >
                    <FontAwesomeIcon icon={faTimes} className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Search and dropdown */}
          <div className="relative">
            <div className="flex">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faSearch} className="text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  type="text"
                  id={`param-${paramName}`}
                  className={`block w-full pl-10 rounded-md shadow-sm text-sm
                    ${hasError
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500 dark:border-red-600 dark:bg-gray-900 dark:text-gray-200 dark:focus:ring-red-500 dark:focus:border-red-600'
                      : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 dark:focus:ring-indigo-400 dark:focus:border-indigo-400'}`}
                  value={searchTerm}
                  onChange={(e) => handleSearchInputChange(paramName, e.target.value)}
                  onClick={() => setActiveSuggestionField(paramName)}
                  placeholder={`Search ${paramName}`}
                />
              </div>
            </div>

            {activeSuggestionField === paramName && filteredSuggestions.length > 0 && (
              <div
                ref={suggestionRef}
                className="absolute z-[9999] mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 py-1 max-h-48 overflow-y-auto"
              >
                {filteredSuggestions.map(suggestion => {
                  const isItemSelected = selected.includes(suggestion);

                  return (
                    <div
                      key={suggestion}
                      className={`px-3 py-2 text-sm cursor-pointer flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 ${isItemSelected ? 'bg-indigo-50 dark:bg-indigo-900 text-gray-900 dark:text-gray-200' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200'
                        }`}
                      onClick={() => handleMultiSelectChange(paramName, suggestion, !isItemSelected)}
                    >
                      <span>{suggestion}</span>
                      {isItemSelected && (
                        <FontAwesomeIcon icon={faCheckCircle} className="text-indigo-600 dark:text-indigo-400 ml-2" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {hasError && (
              <div className="mt-1 text-sm text-red-600 dark:text-red-400">
                <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" />
                {paramErrors[paramName]}
              </div>
            )}

            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex items-start">
              <FontAwesomeIcon icon={faLightbulb} className="mr-1 mt-0.5 text-amber-500" />
              <span>Select multiple items from the list</span>
            </div>
          </div>
        </div>
      );
    }

    // Default text input for other cases
    return (
      <div className="relative">
        <div className="flex">
          <input
            type="text"
            id={`param-${paramName}`}
            className={`block w-full rounded-md shadow-sm sm:text-sm
              ${hasError
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500 dark:border-red-600 dark:bg-gray-900 dark:text-gray-200 dark:focus:ring-red-500 dark:focus:border-red-600'
                : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 dark:focus:ring-indigo-400 dark:focus:border-indigo-400'}
              ${hasSuggestions ? 'rounded-r-none' : ''}`}
            placeholder={param.example || `Enter ${paramName}`}
            value={paramValues[paramName] || ''}
            onChange={(e) => handleParamChange(paramName, e.target.value)}
            onFocus={() => hasSuggestions && setActiveSuggestionField(paramName)}
          />

          {hasSuggestions && (
            <button
              id={`param-btn-${paramName}`}
              type="button"
              className="inline-flex items-center px-2 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
              onClick={() => setActiveSuggestionField(activeSuggestionField === paramName ? null : paramName)}
            >
              <FontAwesomeIcon icon={faChevronDown} />
            </button>
          )}
        </div>

        {hasError && (
          <div className="mt-1 text-sm text-red-600 dark:text-red-400">
            <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" />
            {paramErrors[paramName]}
          </div>
        )}

        <AnimatePresence>
          {activeSuggestionField === paramName && suggestions.length > 0 && (
            <motion.div
              ref={suggestionRef}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.1 }}
              className="absolute z-[9999] mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto"
            >
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  className="w-full text-left px-4 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-700 text-sm border-b border-gray-100 dark:border-gray-700 last:border-0 bg-white dark:bg-gray-800 dark:text-gray-200"
                  onClick={() => handleSuggestionClick(paramName, suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const groupParametersByType = () => {
    const groups = {
      path: [],
      query: [],
      header: [],
      body: []
    };

    parameters.forEach(param => {
      if (groups[param.in]) {
        groups[param.in].push(param);
      }
    });

    return Object.fromEntries(
      Object.entries(groups).filter(([_, params]) => params.length > 0)
    );
  };

  const paramGroups = groupParametersByType();

  return (
    <div className="w-full">
      <div className="flex flex-wrap justify-between items-center mb-3">
        <div className="flex items-start mb-2 sm:mb-0">
          <div
            className={`px-2 py-1 rounded text-white text-sm font-bold uppercase ${getMethodColor(method)}`}
          >
            {method}
          </div>
          <div className="ml-2">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 break-all">{path}</h3>
            {endpointSpec.summary && (
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{endpointSpec.summary}</p>
            )}
          </div>
        </div>

        <div className="flex items-center">
          {requiresAuth && (
            <div className="flex items-center text-amber-500 mr-3 text-xs">
              <FontAwesomeIcon icon={faLock} className="mr-1 text-amber-500" />
              <span>Auth required</span>
            </div>
          )}
        </div>
      </div>

      <div className="mb-2 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
        <div
          className="flex justify-between items-center px-3 py-2 bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600 cursor-pointer"
          onClick={() => toggleSection('description')}
        >
          <div className="flex items-center">
            <FontAwesomeIcon
              icon={faInfoCircle}
              className="text-gray-500 dark:text-gray-400 w-4 h-4 mr-2"
            />
            <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300">Description</h4>
          </div>
          <FontAwesomeIcon
            icon={expandedSection.description ? faChevronUp : faChevronDown}
            className="text-gray-500 dark:text-gray-400 w-3 h-3"
          />
        </div>
        <AnimatePresence>
          {expandedSection.description && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.1 }}
            >
              <div className="p-3 text-xs text-gray-600 dark:text-gray-300">
                {endpointSpec.description ? (
                  <p>{endpointSpec.description}</p>
                ) : (
                  <p>No description available for this endpoint.</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {requiresAuth && (
        <div className="mb-2 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
          <div
            className="flex justify-between items-center px-3 py-2 bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600 cursor-pointer"
            onClick={() => toggleSection('auth')}
          >
            <div className="flex items-center">
              <FontAwesomeIcon
                icon={faKey}
                className="text-amber-500 w-4 h-4 mr-2"
              />
              <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300">Authentication</h4>
            </div>
            <FontAwesomeIcon
              icon={expandedSection.auth ? faChevronUp : faChevronDown}
              className="text-gray-500 dark:text-gray-400 w-3 h-3"
            />
          </div>
          <AnimatePresence>
            {expandedSection.auth && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.1 }}
              >
                <div className="p-3">
                  <div className="relative">
                    <div className="relative flex w-full">
                      <input
                        type={showApiKey ? "text" : "password"}
                        className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-900 dark:text-gray-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-400 text-xs pr-10"
                        placeholder="Enter your API key"
                        value={apiKey}
                        onChange={handleApiKeyChange}
                      />
                      <button
                        type="button"
                        className="absolute right-0 h-full px-3 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none"
                        onClick={() => setShowApiKey(!showApiKey)}
                      >
                        <FontAwesomeIcon 
                          icon={showApiKey ? faEyeSlash : faEye} 
                          className="h-4 w-4" 
                        />
                      </button>
                    </div>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex items-start">
                      <FontAwesomeIcon icon={faInfoCircle} className="mr-1 mt-0.5 text-gray-400 dark:text-gray-500" />
                      <span>Enter your API key without the "Bearer" prefix. This will be automatically added to the request header.</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {parameters.length > 0 && (
        <div className="mb-2 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700">
          <div
            className="flex justify-between items-center px-3 py-2 bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600 cursor-pointer"
            onClick={() => toggleSection('parameters')}
          >
            <div className="flex items-center">
              <FontAwesomeIcon
                icon={faServer}
                className="text-blue-500 w-4 h-4 mr-2"
              />
              <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300">Parameters</h4>
            </div>
            <FontAwesomeIcon
              icon={expandedSection.parameters ? faChevronUp : faChevronDown}
              className="text-gray-500 dark:text-gray-400 w-3 h-3"
            />
          </div>

          <AnimatePresence>
            {expandedSection.parameters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.1 }}
              >
                <div className="p-3">
                  {Object.entries(paramGroups).map(([type, params]) =>
                    params.length > 0 ? (
                      <div key={type} className="mb-4 last:mb-0">
                        <div className={`inline-block px-2 py-1 mb-2 text-xs font-medium rounded ${type === 'query' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          type === 'path' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                            type === 'body' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                          }`}>
                          {type.charAt(0).toUpperCase() + type.slice(1)} Parameters
                        </div>
                        <div className="space-y-3">
                          {/* Render combined min/max blocks first */}
                          {renderCombinedMinMaxParameters(type)}

                          {/* Render remaining parameters */}
                          {params.filter(param => {
                            // Filter out parameters that are part of min/max pairs
                            if (param.name.toLowerCase().includes('min') || param.name.toLowerCase().includes('max')) {
                              const baseParamName = normalizeFieldName(param.name.replace(/(min|max)/i, ''));
                              const pair = minMaxPairs[baseParamName];
                              if (pair && pair.min && pair.max) {
                                return false;
                              }
                            }
                            return true;
                          }).map(param => (
                            <div key={param.name} className="border rounded-md p-2 bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                              <div className="flex flex-wrap items-start justify-between">
                                <div className="mb-1">
                                  <div className="flex items-center">
                                    <span className="font-medium text-xs text-gray-900 dark:text-gray-200">{param.name}</span>
                                    {param.required && (
                                      <span className="ml-1 text-xs text-red-500 dark:text-red-400">*</span>
                                    )}
                                    <ParameterTooltip param={param} paramType={type} />
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    {formatParameterType(param)}
                                  </div>
                                </div>

                                {param.description && (
                                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-2 w-full">
                                    {param.description}
                                  </div>
                                )}
                              </div>

                              <div className="mt-2">
                                {renderParameterInput(param)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null
                  )}

                  <div className="flex justify-end mt-4">
                    <button
                      className="px-4 py-2 bg-indigo-600 dark:bg-indigo-700 text-white rounded-md text-xs font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 flex items-center shadow-sm"
                      onClick={handleTryItOut}
                    >
                      <FontAwesomeIcon icon={faPlay} className="mr-2" />
                      Try It Out
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* <div className="mb-2 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
        <div
          className="flex justify-between items-center px-3 py-2 bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600 cursor-pointer"
          onClick={() => toggleSection('responses')}
        >
          <div className="flex items-center">
            <FontAwesomeIcon
              icon={faLink}
              className="text-green-500 w-4 h-4 mr-2"
            />
            <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300">Responses</h4>
          </div>
          <FontAwesomeIcon
            icon={expandedSection.responses ? faChevronUp : faChevronDown}
            className="text-gray-500 dark:text-gray-400 w-3 h-3"
          />
        </div>

        <AnimatePresence>
          {expandedSection.responses && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.1 }}
            >
              <div className="p-2 space-y-2">
                {Object.entries(responses).map(([code, response]) => (
                  <div key={code} className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                    <div className="flex items-center">
                      <StatusCode code={code} />
                      <span className="ml-2 text-xs text-gray-700 dark:text-gray-300">{response.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div> */}

      {parameters.length === 0 && (
        <div className="flex justify-end mt-2 mb-2">
          <button
            className="px-4 py-2 bg-indigo-600 dark:bg-indigo-700 text-white rounded-md text-xs font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 flex items-center shadow-sm"
            onClick={handleTryItOut}
          >
            <FontAwesomeIcon icon={faPlay} className="mr-2" />
            Try It Out
          </button>
        </div>
      )}
      <TokenExhaustedModal
        isOpen={showTokenModal}
        onClose={() => setShowTokenModal(false)}
      />
    </div>
  );
};

// const StatusCode = ({ code }) => {
//   let color;

//   if (code.startsWith('2')) {
//     color = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
//   } else if (code.startsWith('3')) {
//     color = 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
//   } else if (code.startsWith('4')) {
//     color = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
//   } else if (code.startsWith('5')) {
//     color = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
//   } else {
//     color = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
//   }

//   return (
//     <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
//       {code}
//     </span>
//   );
// };

export default ApiEndpointEnhanced;