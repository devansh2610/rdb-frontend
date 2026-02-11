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
import ParameterTooltip from '../../components/Playground/ParameterTooltip';

const RecipeApiEndpoint = ({ path, method, spec, apiKey, onApiKeyChange, onTryItOut }) => {
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

  useEffect(() => {
    const profile = getProfile();
    setUserProfile(profile);
  }, [getProfile]);

  useEffect(() => {
    const handleTokenUpdate = (event) => {
      const fetchUpdatedProfile = async () => {
        const freshProfile = await fetchProfile();
        if (freshProfile) {
          setUserProfile(freshProfile);
        }
      };
      fetchUpdatedProfile();
    };

    const handleProfileUpdate = (event) => {
      setUserProfile(event.detail);
    };

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
    setSelectedIngredients({});
    setSearchQueries({});
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
      // Special handling for calories_per_day: managed by slider, so it's always valid (has defaults)
      if (param.name === 'calories_per_day') {
        return;
      }

      if (param.required && (!paramValues[param.name] || paramValues[param.name].trim() === '')) {
        errors[param.name] = `${param.name} is required`;
        isValid = false;
      }

      // Special validation for 'days' parameter
      if (param.name === 'days') {
        const daysValue = paramValues['days'];
        if (daysValue && parseInt(daysValue, 10) <= 0) {
          errors['days'] = 'Days must be greater than 0';
          isValid = false;
        }
      }
    });

    setParamErrors(prev => ({ ...prev, ...errors }));
    return isValid;
  };
  
  const validateRanges = () => {
    const errors = {};
    let isValid = true;

    // Check Energy Range
    if (paramValues['minEnergy'] && paramValues['maxEnergy']) {
      if (parseFloat(paramValues['minEnergy']) > parseFloat(paramValues['maxEnergy'])) {
        errors['minEnergy'] = 'Min > Max';
        errors['maxEnergy'] = 'Min > Max';
        isValid = false;
      }
    }
    
    // Check Meal Plan Calories Range
    if (paramValues['minCalories'] && paramValues['maxCalories']) {
      if (parseFloat(paramValues['minCalories']) > parseFloat(paramValues['maxCalories'])) {
         errors['minCalories'] = 'Min > Max';
         errors['maxCalories'] = 'Min > Max';
         isValid = false;
      }
    }

    // Check Dynamic Min/Max Pairs
    Object.values(minMaxPairs).forEach(pair => {
      const minVal = paramValues[pair.min.name];
      const maxVal = paramValues[pair.max.name];
      if (minVal && maxVal && parseFloat(minVal) > parseFloat(maxVal)) {
        errors[pair.min.name] = 'Min > Max';
        errors[pair.max.name] = 'Min > Max';
        isValid = false;
      }
    });

    if (!isValid) {
        setParamErrors(prev => ({ ...prev, ...errors }));
    }
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
    handleSearchInputChange(paramName, value); 
    setActiveSuggestionField(null);
  };

  const handleTryItOut = async () => {
    const currentProfile = userProfile || getProfile();
    const userTokens = currentProfile?.tokens || 0;

    if (userTokens === 0) {
      setShowTokenModal(true);
      return;
    }

    // Run both validations
    const isRequiredValid = validateParams();
    const isRangeValid = validateRanges();

    if (!isRequiredValid || !isRangeValid) {
      const firstErrorEl = document.querySelector('.text-red-600');
      if (firstErrorEl) {
        firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    if (onTryItOut) {
      try {
        const enhancedParamValues = { ...paramValues };

        // 1. Min/Max Logic
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
        
        // 2. Specific Logic for Meal Plan Calories
        if (parameters.some(p => p.name === 'calories_per_day')) {
             const minCal = enhancedParamValues['minCalories'] || '0'; 
             const maxCal = enhancedParamValues['maxCalories'] || '2000';
             
             enhancedParamValues['calories_per_day'] = {
                 min: parseFloat(minCal),
                 max: parseFloat(maxCal)
             };
             
             // Cleanup temporary keys
             delete enhancedParamValues['minCalories'];
             delete enhancedParamValues['maxCalories'];
        }

        // 3. Default Values Logic (Inject defaults for page, limit, page_size if missing)
        parameters.forEach(param => {
             // Skip calories_per_day as we handled it above
             if (param.name === 'calories_per_day') return;
             
             if (!enhancedParamValues[param.name] && param.default !== undefined) {
                  enhancedParamValues[param.name] = String(param.default);
             }
        });

        await onTryItOut(enhancedParamValues);

        const updatedTokens = Math.max(0, userTokens - 1);
        setUserProfile(prev => ({
          ...prev,
          tokens: updatedTokens
        }));

        setTimeout(async () => {
          const freshProfile = await fetchProfile();
          if (freshProfile) {
            setUserProfile(freshProfile);
          }
        }, 1000);

      } catch (error) {
        console.error('API call failed:', error);
        setUserProfile(prev => ({
          ...prev,
          tokens: userTokens
        }));
      }
    }
  };

  const getParamSuggestions = (paramName) => {
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
    return ['min', 'max', 'limit', 'page', 'page_size', 'minCalories', 'maxCalories',
      'minCarbs', 'maxCarbs', 'minEnergy', 'maxEnergy'].includes(paramName) ||
      paramName.toLowerCase().includes('min') ||
      paramName.toLowerCase().includes('max') ||
      paramName.toLowerCase().includes('limit') ||
      paramName.toLowerCase().includes('page');
  };

  const isMultiSelectParam = (param) => {
    return param.collectionFormat === 'multi';
  };

  const isSingleSelectParam = (param) => {
    return param.collectionFormat === 'single';
  };

  const normalizeFieldName = (fieldName) => {
    if (!fieldName) return '';
    return fieldName.toLowerCase()
      .replace(/\s+/g, '')
      .replace(/-/g, '')
      .replace(/_/g, '')
      .replace(/\(|\)/g, '');
  };

  const getParameterStatistics = (param) => {
    if (param['x-statistics']) {
      return param['x-statistics'];
    }

    if (endpointSpec['x-statistics']) {
      if (Array.isArray(endpointSpec['x-statistics'])) {
        const normalizedParamName = normalizeFieldName(param.name.replace(/^(min|max)/i, ''));
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
      } else if (typeof endpointSpec['x-statistics'] === 'object') {
        const normalizedParamName = normalizeFieldName(param.name.replace(/^(min|max)/i, ''));
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

    if (endpointSpec['x-enum-values']) {
      if (Array.isArray(endpointSpec['x-enum-values'])) {
        const normalizedParamName = normalizeFieldName(param.name.replace(/^(min|max)/i, ''));
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

    return {
      min: 0,
      max: 100,
      avg: 50,
      mean: 50,
      stdDev: 25
    };
  };

  const getDecimalPrecision = (min, max) => {
    const minStr = min.toString();
    const maxStr = max.toString();
    const minDecimals = minStr.includes('.') ? minStr.split('.')[1].length : 0;
    const maxDecimals = maxStr.includes('.') ? maxStr.split('.')[1].length : 0;
    return Math.min(Math.max(minDecimals, maxDecimals), 4);
  };

  const formatWithPrecision = (value, min, max) => {
    if (value === '' || value === null || value === undefined) return '';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return '';
    const precision = getDecimalPrecision(min, max);
    return precision > 0 ? numValue.toFixed(precision) : Math.round(numValue).toString();
  };

  const getEnumValuesForField = (paramName) => {
    const param = parameters.find(p => p.name === paramName);
    if (param && param['x-enum-values']) {
      return param['x-enum-values'];
    }
    if (paramName === 'field' && endpointSpec['x-enum-values']) {
      return endpointSpec['x-enum-values'];
    }
    if (paramName === 'field' && endpointSpec['x-statistics']) {
      if (Array.isArray(endpointSpec['x-statistics'])) {
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

  const findMinMaxPairs = useCallback(() => {
    const pairs = {};
    parameters.forEach(param => {
      if (param.name.toLowerCase().includes('min') || param.name.toLowerCase().includes('max')) {
        const baseParamName = normalizeFieldName(param.name.replace(/^(min|max)/i, ''));
        if (!pairs[baseParamName]) {
          pairs[baseParamName] = {
            min: null,
            max: null,
            displayName: baseParamName,
            field: null
          };
        }
        if (param.name.toLowerCase().includes('min')) {
          pairs[baseParamName].min = param;
        } else {
          pairs[baseParamName].max = param;
        }
        if (param['x-statistics']) {
          pairs[baseParamName].stats = param['x-statistics'];
          pairs[baseParamName].field = param['x-statistics'].field || baseParamName;
        }
      }
    });

    Object.keys(pairs).forEach(key => {
      const pair = pairs[key];
      if (!pair.field) {
        const stats = getParameterStatistics(pair.min || pair.max);
        pair.stats = stats;
        pair.field = stats.field || key;
      }
      if (pair.field) {
        pair.displayName = pair.field;
      } else {
        pair.displayName = key
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, str => str.toUpperCase());
      }
    });
    return pairs;
  }, [parameters]);

  const minMaxPairs = useMemo(() => findMinMaxPairs(), [findMinMaxPairs]);

  const renderCombinedMinMaxParameters = (paramGroup) => {
    const combinedParameters = [];
    if (paramGroup === 'query' && parameters.find(p => p.name === 'minEnergy') && parameters.find(p => p.name === 'maxEnergy')) {
      combinedParameters.push(renderEnergyRangeBlock());
    }
    Object.values(minMaxPairs).forEach(pair => {
      if ((pair.min && pair.min.name === 'minEnergy') || (pair.max && pair.max.name === 'maxEnergy')) {
        return;
      }
      if (pair.min && pair.max) {
        if ((pair.min.in === paramGroup && pair.max.in === paramGroup)) {
          combinedParameters.push(renderMinMaxRangeBlock(pair));
        }
      }
    });
    return combinedParameters.length > 0 ? combinedParameters : null;
  };

  const renderEnergyRangeBlock = () => {
    const minEnergyParam = parameters.find(p => p.name === 'minEnergy');
    const maxEnergyParam = parameters.find(p => p.name === 'maxEnergy');
    if (!minEnergyParam || !maxEnergyParam) return null;

    const stats = getParameterStatistics(minEnergyParam);
    const minPossible = stats.min !== undefined ? stats.min : 0;
    const maxPossible = stats.max !== undefined ? stats.max : 3440456.64;

    const currentMinValue = paramValues['minEnergy'] ? parseFloat(paramValues['minEnergy']) : minPossible;
    const currentMaxValue = paramValues['maxEnergy'] ? parseFloat(paramValues['maxEnergy']) : maxPossible;

    const minPercent = ((currentMinValue - minPossible) / (maxPossible - minPossible)) * 100;
    const maxPercent = ((currentMaxValue - minPossible) / (maxPossible - minPossible)) * 100;

    const hasMinError = !!paramErrors['minEnergy'];
    const hasMaxError = !!paramErrors['maxEnergy'];
    const isRangeInvalid = paramValues['minEnergy'] && paramValues['maxEnergy'] && parseFloat(paramValues['minEnergy']) > parseFloat(paramValues['maxEnergy']);

    const handleSliderTrackClick = (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickPosition = e.clientX - rect.left;
      const percentPosition = (clickPosition / rect.width) * 100;
      const value = minPossible + (percentPosition / 100) * (maxPossible - minPossible);
      const distanceToMin = Math.abs(percentPosition - minPercent);
      const distanceToMax = Math.abs(percentPosition - maxPercent);
      if (distanceToMin <= distanceToMax) {
        handleParamChange('minEnergy', formatWithPrecision(value, minPossible, maxPossible));
      } else {
        handleParamChange('maxEnergy', formatWithPrecision(value, minPossible, maxPossible));
      }
    };

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
        requestAnimationFrame(() => {
          const dx = moveEvent.clientX - startX;
          const percentChange = dx / sliderWidth;
          const valueChange = percentChange * range;
          const newValue = Math.max(minPossible, Math.min(currentMaxValue, startValue + valueChange));
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
        requestAnimationFrame(() => {
          const dx = moveEvent.clientX - startX;
          const percentChange = dx / sliderWidth;
          const valueChange = percentChange * range;
          const newValue = Math.min(maxPossible, Math.max(currentMinValue, startValue + valueChange));
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
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Energy range in kilocalories</div>
          </div>
        </div>
        <div className="mt-2 relative space-y-2">
          <div className="flex justify-between items-center">
            <div className="w-24">
              <label className="text-xs text-gray-500 dark:text-gray-400">Min</label>
              <input type="text" className={`w-full rounded-md shadow-sm text-sm ${hasMinError || isRangeInvalid ? 'border-red-300' : 'border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200'}`} value={paramValues['minEnergy'] || ''} onChange={(e) => { const val = e.target.value; if (val === '' || /^\d*\.?\d*$/.test(val)) handleParamChange('minEnergy', val); }} placeholder="Min" />
            </div>
            <div className="flex-1 px-4 text-xs text-gray-500 dark:text-gray-400 text-center">Energy (kcal)</div>
            <div className="w-24">
              <label className="text-xs text-gray-500 dark:text-gray-400">Max</label>
              <input type="text" className={`w-full rounded-md shadow-sm text-sm ${hasMaxError || isRangeInvalid ? 'border-red-300' : 'border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200'}`} value={paramValues['maxEnergy'] || ''} onChange={(e) => { const val = e.target.value; if (val === '' || /^\d*\.?\d*$/.test(val)) handleParamChange('maxEnergy', val); }} placeholder="Max" />
            </div>
          </div>
          <div className="relative pt-5 pb-2">
            <div className="absolute top-1/2 left-0 right-0 -mt-1 h-2.5 bg-gray-200 dark:bg-gray-700 rounded-lg cursor-pointer z-10" onClick={handleSliderTrackClick}></div>
            <div className="absolute top-1/2 -mt-1 h-2.5 bg-blue-600 dark:bg-blue-500 rounded-lg pointer-events-none z-20" style={{ left: `${minPercent}%`, width: `${Math.max(0, maxPercent - minPercent)}%` }}></div>
            <div className="absolute w-5 h-5 bg-white dark:bg-gray-200 border-2 border-blue-600 dark:border-blue-400 rounded-full -ml-2.5 top-1/2 -mt-2.5 cursor-grab active:cursor-grabbing z-30" style={{ left: `${minPercent}%` }} onMouseDown={handleMinSliderDrag}></div>
            <div className="absolute w-5 h-5 bg-white dark:bg-gray-200 border-2 border-blue-600 dark:border-blue-400 rounded-full -ml-2.5 top-1/2 -mt-2.5 cursor-grab active:cursor-grabbing z-30" style={{ left: `${maxPercent}%` }} onMouseDown={handleMaxSliderDrag}></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 px-1">
            <span>{formatWithPrecision(minPossible, minPossible, maxPossible)}</span>
            <span>{formatWithPrecision(maxPossible, minPossible, maxPossible)}</span>
          </div>
          {(hasMinError || hasMaxError || isRangeInvalid) && (
            <div className="mt-1 text-sm text-red-600 dark:text-red-400">
              <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" />
              {hasMinError ? paramErrors['minEnergy'] : (hasMaxError ? paramErrors['maxEnergy'] : (isRangeInvalid ? "Min cannot be greater than Max" : ""))}
            </div>
          )}
        </div>
      </div>
    );
  };
  
  const renderMealPlanCaloriesSlider = (param) => {
    // Defaults for calories_per_day
    const minPossible = 0;
    const maxPossible = 612854.6;

    const currentMinValue = paramValues['minCalories'] ? parseFloat(paramValues['minCalories']) : minPossible;
    const currentMaxValue = paramValues['maxCalories'] ? parseFloat(paramValues['maxCalories']) : 2000; // Default max from spec

    const minPercent = ((currentMinValue - minPossible) / (maxPossible - minPossible)) * 100;
    const maxPercent = ((currentMaxValue - minPossible) / (maxPossible - minPossible)) * 100;

    const hasMinError = !!paramErrors['minCalories'];
    const hasMaxError = !!paramErrors['maxCalories'];
    const isRangeInvalid = paramValues['minCalories'] && paramValues['maxCalories'] && parseFloat(paramValues['minCalories']) > parseFloat(paramValues['maxCalories']);

    const handleSliderTrackClick = (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickPosition = e.clientX - rect.left;
      const percentPosition = (clickPosition / rect.width) * 100;
      const value = minPossible + (percentPosition / 100) * (maxPossible - minPossible);
      const distanceToMin = Math.abs(percentPosition - minPercent);
      const distanceToMax = Math.abs(percentPosition - maxPercent);
      if (distanceToMin <= distanceToMax) {
        handleParamChange('minCalories', formatWithPrecision(value, minPossible, maxPossible));
      } else {
        handleParamChange('maxCalories', formatWithPrecision(value, minPossible, maxPossible));
      }
    };

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
        requestAnimationFrame(() => {
          const dx = moveEvent.clientX - startX;
          const percentChange = dx / sliderWidth;
          const valueChange = percentChange * range;
          const newValue = Math.max(minPossible, Math.min(currentMaxValue, startValue + valueChange));
          if (Math.abs(newValue - currentMinValue) > (range / 1000)) {
            handleParamChange('minCalories', formatWithPrecision(newValue, minPossible, maxPossible));
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
        requestAnimationFrame(() => {
          const dx = moveEvent.clientX - startX;
          const percentChange = dx / sliderWidth;
          const valueChange = percentChange * range;
          const newValue = Math.min(maxPossible, Math.max(currentMinValue, startValue + valueChange));
          if (Math.abs(newValue - currentMaxValue) > (range / 1000)) {
            handleParamChange('maxCalories', formatWithPrecision(newValue, minPossible, maxPossible));
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
      <div className="relative space-y-2">
          <div className="flex justify-between items-center">
            <div className="w-24">
              <label className="text-xs text-gray-500 dark:text-gray-400">Min</label>
              <input type="text" className={`w-full rounded-md shadow-sm text-sm ${hasMinError || isRangeInvalid ? 'border-red-300' : 'border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200'}`} value={paramValues['minCalories'] || ''} onChange={(e) => { const val = e.target.value; if (val === '' || /^\d*\.?\d*$/.test(val)) handleParamChange('minCalories', val); }} placeholder="Min" />
            </div>
            <div className="flex-1 px-4 text-xs text-gray-500 dark:text-gray-400 text-center">Calories</div>
            <div className="w-24">
              <label className="text-xs text-gray-500 dark:text-gray-400">Max</label>
              <input type="text" className={`w-full rounded-md shadow-sm text-sm ${hasMaxError || isRangeInvalid ? 'border-red-300' : 'border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200'}`} value={paramValues['maxCalories'] || ''} onChange={(e) => { const val = e.target.value; if (val === '' || /^\d*\.?\d*$/.test(val)) handleParamChange('maxCalories', val); }} placeholder="Max" />
            </div>
          </div>
          <div className="relative pt-5 pb-2">
            <div className="absolute top-1/2 left-0 right-0 -mt-1 h-2.5 bg-gray-200 dark:bg-gray-700 rounded-lg cursor-pointer z-10" onClick={handleSliderTrackClick}></div>
            <div className="absolute top-1/2 -mt-1 h-2.5 bg-blue-600 dark:bg-blue-500 rounded-lg pointer-events-none z-20" style={{ left: `${minPercent}%`, width: `${Math.max(0, maxPercent - minPercent)}%` }}></div>
            <div className="absolute w-5 h-5 bg-white dark:bg-gray-200 border-2 border-blue-600 dark:border-blue-400 rounded-full -ml-2.5 top-1/2 -mt-2.5 cursor-grab active:cursor-grabbing z-30" style={{ left: `${minPercent}%` }} onMouseDown={handleMinSliderDrag}></div>
            <div className="absolute w-5 h-5 bg-white dark:bg-gray-200 border-2 border-blue-600 dark:border-blue-400 rounded-full -ml-2.5 top-1/2 -mt-2.5 cursor-grab active:cursor-grabbing z-30" style={{ left: `${maxPercent}%` }} onMouseDown={handleMaxSliderDrag}></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 px-1">
            <span>{formatWithPrecision(minPossible, minPossible, maxPossible)}</span>
            <span>{formatWithPrecision(maxPossible, minPossible, maxPossible)}</span>
          </div>
          {(hasMinError || hasMaxError || isRangeInvalid) && (
            <div className="mt-1 text-sm text-red-600 dark:text-red-400">
              <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" />
              {hasMinError ? paramErrors['minCalories'] : (hasMaxError ? paramErrors['maxCalories'] : (isRangeInvalid ? "Min cannot be greater than Max" : ""))}
            </div>
          )}
      </div>
    );
  };

  const renderMinMaxRangeBlock = (pair) => {
    let { min: minParam, max: maxParam, displayName, stats } = pair;
    if (!minParam || !maxParam) return null;

    const fieldParam = parameters.find(p => p.name === 'field');
    if (fieldParam) {
      const selectedField = paramValues['field'];
      if (!selectedField) return null;
      displayName = selectedField;
      const possibleStatsArrays = [endpointSpec['x-enum-values'], endpointSpec['x-statistics']];
      for (const statArray of possibleStatsArrays) {
        if (Array.isArray(statArray)) {
          const match = statArray.find(s => s.field === selectedField);
          if (match) {
            stats = match;
            break;
          }
        }
      }
    }

    const pairStats = stats || getParameterStatistics(minParam);
    const minPossible = pairStats.min !== undefined ? pairStats.min : 0;
    const maxPossible = pairStats.max !== undefined ? pairStats.max : 100;

    const currentMinValue = paramValues[minParam.name] ? parseFloat(paramValues[minParam.name]) : minPossible;
    const currentMaxValue = paramValues[maxParam.name] ? parseFloat(paramValues[maxParam.name]) : maxPossible;

    const minPercent = ((currentMinValue - minPossible) / (maxPossible - minPossible)) * 100;
    const maxPercent = ((currentMaxValue - minPossible) / (maxPossible - minPossible)) * 100;

    const hasMinError = !!paramErrors[minParam.name];
    const hasMaxError = !!paramErrors[maxParam.name];
    const isRangeInvalid = paramValues[minParam.name] && paramValues[maxParam.name] && parseFloat(paramValues[minParam.name]) > parseFloat(paramValues[maxParam.name]);

    const handleSliderTrackClick = (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickPosition = e.clientX - rect.left;
      const percentPosition = (clickPosition / rect.width) * 100;
      const value = minPossible + (percentPosition / 100) * (maxPossible - minPossible);
      const distanceToMin = Math.abs(percentPosition - minPercent);
      const distanceToMax = Math.abs(percentPosition - maxPercent);
      if (distanceToMin <= distanceToMax) {
        handleParamChange(minParam.name, formatWithPrecision(value, minPossible, maxPossible));
      } else {
        handleParamChange(maxParam.name, formatWithPrecision(value, minPossible, maxPossible));
      }
    };

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
        requestAnimationFrame(() => {
          const dx = moveEvent.clientX - startX;
          const percentChange = dx / sliderWidth;
          const valueChange = percentChange * range;
          const newValue = Math.max(minPossible, Math.min(currentMaxValue, startValue + valueChange));
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
        requestAnimationFrame(() => {
          const dx = moveEvent.clientX - startX;
          const percentChange = dx / sliderWidth;
          const valueChange = percentChange * range;
          const newValue = Math.min(maxPossible, Math.max(currentMinValue, startValue + valueChange));
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
              {(minParam.required || maxParam.required) && <span className="ml-1 text-xs text-red-500 dark:text-red-400">*</span>}
              <ParameterTooltip param={minParam} paramType={minParam.in || 'query'} />
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{minParam.description || maxParam.description || `Range for ${displayName}`}</div>
          </div>
        </div>
        <div className="mt-2 relative space-y-2">
          <div className="flex justify-between items-center">
            <div className="w-24">
              <label className="text-xs text-gray-500 dark:text-gray-400">Min</label>
              <input type="text" className={`w-full rounded-md shadow-sm text-sm ${hasMinError || isRangeInvalid ? 'border-red-300' : 'border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200'}`} value={paramValues[minParam.name] || ''} onChange={(e) => { const val = e.target.value; if (val === '' || /^\d*\.?\d*$/.test(val)) handleParamChange(minParam.name, val); }} placeholder="Min" />
            </div>
            <div className="flex-1 px-4 text-xs text-gray-500 dark:text-gray-400 text-center">{displayName}</div>
            <div className="w-24">
              <label className="text-xs text-gray-500 dark:text-gray-400">Max</label>
              <input type="text" className={`w-full rounded-md shadow-sm text-sm ${hasMaxError || isRangeInvalid ? 'border-red-300' : 'border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200'}`} value={paramValues[maxParam.name] || ''} onChange={(e) => { const val = e.target.value; if (val === '' || /^\d*\.?\d*$/.test(val)) handleParamChange(maxParam.name, val); }} placeholder="Max" />
            </div>
          </div>
          <div className="relative pt-5 pb-2">
            <div className="absolute top-1/2 left-0 right-0 -mt-1 h-2.5 bg-gray-200 dark:bg-gray-700 rounded-lg cursor-pointer z-10" onClick={handleSliderTrackClick}></div>
            <div className="absolute top-1/2 -mt-1 h-2.5 bg-blue-600 dark:bg-blue-500 rounded-lg pointer-events-none z-20" style={{ left: `${minPercent}%`, width: `${Math.max(0, maxPercent - minPercent)}%` }}></div>
            <div className="absolute w-5 h-5 bg-white dark:bg-gray-200 border-2 border-blue-600 dark:border-blue-400 rounded-full -ml-2.5 top-1/2 -mt-2.5 cursor-grab active:cursor-grabbing z-30" style={{ left: `${minPercent}%` }} onMouseDown={handleMinSliderDrag}></div>
            <div className="absolute w-5 h-5 bg-white dark:bg-gray-200 border-2 border-blue-600 dark:border-blue-400 rounded-full -ml-2.5 top-1/2 -mt-2.5 cursor-grab active:cursor-grabbing z-30" style={{ left: `${maxPercent}%` }} onMouseDown={handleMaxSliderDrag}></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 px-1">
            <span>{formatWithPrecision(minPossible, minPossible, maxPossible)}</span>
            <span>{formatWithPrecision(maxPossible, minPossible, maxPossible)}</span>
          </div>
          {(hasMinError || hasMaxError || isRangeInvalid) && (
            <div className="mt-1 text-sm text-red-600 dark:text-red-400">
              <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" />
              {hasMinError ? paramErrors[minParam.name] : (hasMaxError ? paramErrors[maxParam.name] : (isRangeInvalid ? "Min cannot be greater than Max" : ""))}
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

    // Special handling for 'field' parameter (Issue #1)
    if (paramName === 'field') {
      const fieldSuggestions = getEnumValuesForField(paramName);
      return (
        <div>
          <div className="relative">
            <select
              id={`param-${paramName}`}
              className={`block w-full rounded-md shadow-sm sm:text-sm appearance-none ${hasError ? 'border-red-300' : 'border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200'}`}
              value={paramValues[paramName] || ''}
              onChange={(e) => handleParamChange(paramName, e.target.value)}
            >
              <option value="">Select a field</option>
              {fieldSuggestions.map(value => (
                <option key={value} value={value} className="dark:bg-gray-900">{value}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <FontAwesomeIcon icon={faAngleDown} className="text-gray-400 dark:text-gray-500" />
            </div>
          </div>
          {hasError && <div className="mt-1 text-sm text-red-600 dark:text-red-400">{paramErrors[paramName]}</div>}
        </div>
      );
    }
    
    // Special handling for Meal Plan calories_per_day
    if (paramName === 'calories_per_day') {
      return renderMealPlanCaloriesSlider(param);
    }

    if (param.in === 'body') {
        const bodySchema = endpointSpec.requestBody?.content?.['application/json']?.schema;
        let defaultBodyValue = '{}';
        let bodyDescription = 'Enter a valid JSON object for the request body';
  
        if (bodySchema) {
          try {
            const template = {};
            if (bodySchema.properties) {
              Object.entries(bodySchema.properties).forEach(([propName, propSchema]) => {
                if (propSchema.example !== undefined) template[propName] = propSchema.example;
                else if (propSchema.type === 'string') template[propName] = '';
                else if (propSchema.type === 'number' || propSchema.type === 'integer') template[propName] = 0;
                else if (propSchema.type === 'boolean') template[propName] = false;
                else if (propSchema.type === 'array') template[propName] = [];
                else if (propSchema.type === 'object') template[propName] = {};
  
                if (propSchema['x-enum-values']?.length > 0) bodyDescription += `\nOptions for ${propName}: ${propSchema['x-enum-values'].join(', ')}`;
                if (propSchema['x-statistics']) {
                  const stats = propSchema['x-statistics'];
                  bodyDescription += `\nRange for ${propName}: ${stats.min || 0} - ${stats.max || 100}`;
                }
              });
            }
            defaultBodyValue = JSON.stringify(template, null, 2);
          } catch (error) { console.error('Error parsing body schema:', error); }
        }
        if (!paramValues[paramName]) handleParamChange(paramName, defaultBodyValue);
        
        return (
          <div className="relative">
            <textarea id={`param-${paramName}`} rows={5} className={`block w-full rounded-md shadow-sm sm:text-sm font-mono ${hasError ? 'border-red-300' : 'border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200'}`} placeholder={defaultBodyValue} value={paramValues[paramName] || ''} onChange={(e) => handleParamChange(paramName, e.target.value)} />
            {hasError && <div className="mt-1 text-sm text-red-600 dark:text-red-400">{paramErrors[paramName]}</div>}
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex items-start"><FontAwesomeIcon icon={faLightbulb} className="mr-1 mt-0.5 text-amber-500" /><span className="whitespace-pre-line">{bodyDescription}</span></div>
          </div>
        );
    }

    if (param.enum) {
      return (
        <div>
          <div className="relative">
            <select id={`param-${paramName}`} className={`block w-full rounded-md shadow-sm sm:text-sm appearance-none ${hasError ? 'border-red-300' : 'border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200'}`} value={paramValues[paramName] || ''} onChange={(e) => handleParamChange(paramName, e.target.value)}>
              <option value="">Select a value</option>
              {param.enum.map(value => <option key={value} value={value} className="dark:bg-gray-900">{value}</option>)}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"><FontAwesomeIcon icon={faAngleDown} className="text-gray-400 dark:text-gray-500" /></div>
          </div>
          {hasError && <div className="mt-1 text-sm text-red-600 dark:text-red-400">{paramErrors[paramName]}</div>}
        </div>
      );
    }

    if (paramName === 'page') {
      return (
        <div className="relative space-y-2">
          <div className="flex items-center">
            <input 
              type="text" 
              id={`param-${paramName}`} 
              className={`w-24 rounded-md shadow-sm text-sm ${hasError ? 'border-red-300' : 'border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200'}`} 
              value={paramValues[paramName] || ''} 
              onChange={(e) => {
                const val = e.target.value;
                if (val === '' || /^[0-9]+$/.test(val)) {
                   handleParamChange(paramName, val);
                }
              }} 
              placeholder="Page #" 
            />
          </div>
          {hasError && <div className="mt-1 text-sm text-red-600 dark:text-red-400">{paramErrors[paramName]}</div>}
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex items-start"><FontAwesomeIcon icon={faLightbulb} className="mr-1 mt-0.5 text-amber-500" /><span>Enter a valid page number</span></div>
        </div>
      );
    }

    if (paramName === 'limit' || paramName === 'page_size') {
      const minLimit = 1, maxLimit = 10, defaultLimit = 10;
      const currentValue = paramValues[paramName] ? parseInt(paramValues[paramName], 10) : defaultLimit;
      const fillPercentage = ((currentValue - minLimit) / (maxLimit - minLimit)) * 100;
      return (
        <div className="relative space-y-2">
          <div className="flex items-center justify-between">
            <input type="text" id={`param-${paramName}`} className={`w-24 rounded-md shadow-sm text-sm ${hasError ? 'border-red-300' : 'border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200'}`} value={paramValues[paramName] || ''} onChange={(e) => { const value = e.target.value; const numValue = parseInt(value, 10); if (value === '') handleParamChange(paramName, ''); else if (numValue >= minLimit && numValue <= maxLimit) handleParamChange(paramName, formatWithPrecision(numValue, minLimit, maxLimit)); }} placeholder="Enter limit" />
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">{minLimit} - {maxLimit}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-600 dark:text-gray-400">{minLimit}</span>
            <div className="relative w-full">
              <div className="absolute top-1/2 left-0 right-0 -mt-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-lg"></div>
              <div className="absolute top-1/2 left-0 -mt-1 h-2 bg-indigo-500 dark:bg-indigo-400 rounded-lg" style={{ width: `${fillPercentage}%` }}></div>
              <input type="range" min={minLimit} max={maxLimit} value={currentValue} onChange={(e) => handleParamChange(paramName, formatWithPrecision(e.target.value, minLimit, maxLimit))} className="relative w-full h-2 bg-transparent appearance-none cursor-pointer z-10" />
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400">{maxLimit}</span>
          </div>
          {hasError && <div className="mt-1 text-sm text-red-600 dark:text-red-400">{paramErrors[paramName]}</div>}
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex items-start"><FontAwesomeIcon icon={faLightbulb} className="mr-1 mt-0.5 text-amber-500" /><span>Please enter a value between {minLimit} and {maxLimit}</span></div>
        </div>
      );
    }

    if ((paramName.toLowerCase().includes('min') || paramName.toLowerCase().includes('max'))) {
      const baseParamName = normalizeFieldName(paramName.replace(/(min|max)/i, ''));
      const pair = minMaxPairs[baseParamName];
      if (pair && pair.min && pair.max) return null; 
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
            <input type="text" id={`param-${paramName}`} className={`w-24 rounded-md shadow-sm text-sm ${hasError ? 'border-red-300' : 'border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200'}`} value={paramValues[paramName] || ''} onChange={(e) => handleParamChange(paramName, formatWithPrecision(e.target.value, min, max))} placeholder={param.example || `Enter ${paramName}`} />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-600 dark:text-gray-400">{formatWithPrecision(min, min, max)}</span>
            <div className="relative w-full">
              <div className="absolute top-1/2 left-0 right-0 -mt-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-lg"></div>
              <div className="absolute top-1/2 left-0 -mt-1 h-2 bg-indigo-500 dark:bg-indigo-400 rounded-lg" style={{ width: `${fillPercentage}%` }}></div>
              <input type="range" min={min} max={max} step={(max - min) / 100} value={currentValue} onChange={(e) => handleParamChange(paramName, formatWithPrecision(e.target.value, min, max))} className="relative w-full h-2 bg-transparent appearance-none cursor-pointer z-10" />
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400">{formatWithPrecision(max, min, max)}</span>
          </div>
          {hasError && <div className="mt-1 text-sm text-red-600 dark:text-red-400">{paramErrors[paramName]}</div>}
          {param.description && <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex items-start"><FontAwesomeIcon icon={faLightbulb} className="mr-1 mt-0.5 text-amber-500" /><span>{param.description}</span></div>}
        </div>
      );
    }

    if (isIntegerParam(paramName) && paramName !== 'page' && !paramName.toLowerCase().includes('min') && !paramName.toLowerCase().includes('max')) {
      const stats = getParameterStatistics(param);
      const sliderDefaults = { min: stats.min || 0, max: stats.max || 100, default: stats.mean || stats.avg || 0 };
      const currentValue = paramValues[paramName] ? parseFloat(paramValues[paramName]) : sliderDefaults.default;
      const fillPercentage = ((currentValue - sliderDefaults.min) / (sliderDefaults.max - sliderDefaults.min)) * 100;
      return (
        <div className="relative space-y-2">
          <div className="flex items-center justify-between">
            <input type="text" id={`param-${paramName}`} className={`w-24 rounded-md shadow-sm text-sm ${hasError ? 'border-red-300' : 'border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200'}`} value={paramValues[paramName] || ''} onChange={(e) => handleParamChange(paramName, formatWithPrecision(e.target.value, sliderDefaults.min, sliderDefaults.max))} placeholder={param.example || `Enter ${paramName}`} />
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">{formatWithPrecision(sliderDefaults.min, sliderDefaults.min, sliderDefaults.max)} - {formatWithPrecision(sliderDefaults.max, sliderDefaults.min, sliderDefaults.max)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-600 dark:text-gray-400">{formatWithPrecision(sliderDefaults.min, sliderDefaults.min, sliderDefaults.max)}</span>
            <div className="relative w-full">
              <div className="absolute top-1/2 left-0 right-0 -mt-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-lg"></div>
              <div className="absolute top-1/2 left-0 -mt-1 h-2 bg-indigo-500 dark:bg-indigo-400 rounded-lg" style={{ width: `${fillPercentage}%` }}></div>
              <input type="range" min={sliderDefaults.min} max={sliderDefaults.max} value={currentValue} onChange={(e) => handleParamChange(paramName, formatWithPrecision(e.target.value, sliderDefaults.min, sliderDefaults.max))} className="relative w-full h-2 bg-transparent appearance-none cursor-pointer z-10" />
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400">{formatWithPrecision(sliderDefaults.max, sliderDefaults.min, sliderDefaults.max)}</span>
          </div>
          {hasError && <div className="mt-1 text-sm text-red-600 dark:text-red-400">{paramErrors[paramName]}</div>}
        </div>
      );
    }

    if (isSingleSelectParam(param) && (param['x-enum-values'] || paramName === 'field')) {
      const suggestions = param['x-enum-values'] || getEnumValuesForField(paramName);
      const searchTerm = searchQueries[paramName] || '';
      const filteredSuggestions = fuzzySearch(searchTerm, suggestions);
      return (
        <div className="relative">
          <div className="flex">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FontAwesomeIcon icon={faSearch} className="text-gray-400 dark:text-gray-500" /></div>
              <input 
                type="text" 
                id={`param-${paramName}`} 
                className={`block w-full pl-10 pr-3 rounded-md shadow-sm sm:text-sm ${hasError ? 'border-red-300' : 'border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200'} rounded-r-none`} 
                placeholder={`Search for ${paramName}`} 
                onFocus={() => setActiveSuggestionField(paramName)} 
                value={paramValues[paramName] || searchTerm} 
                onChange={(e) => { handleSearchInputChange(paramName, e.target.value); handleParamChange(paramName, e.target.value); }}
                onBlur={() => {
                   setTimeout(() => {
                      const currentVal = paramValues[paramName];
                      if (currentVal && !suggestions.includes(currentVal)) {
                         handleParamChange(paramName, '');
                         handleSearchInputChange(paramName, '');
                      }
                   }, 200);
                }} 
              />
            </div>
            <button id={`param-btn-${paramName}`} type="button" className="inline-flex items-center px-2 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700" onClick={() => setActiveSuggestionField(activeSuggestionField === paramName ? null : paramName)}><FontAwesomeIcon icon={faChevronDown} /></button>
          </div>
          {hasError && <div className="mt-1 text-sm text-red-600 dark:text-red-400">{paramErrors[paramName]}</div>}
          <AnimatePresence>
            {activeSuggestionField === paramName && filteredSuggestions.length > 0 && (
              <motion.div ref={suggestionRef} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.1 }} className="absolute z-[9999] mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto">
                {filteredSuggestions.map((suggestion, idx) => (
                  <div key={idx} className="w-full text-left px-4 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-700 text-sm border-b border-gray-100 dark:border-gray-700 last:border-0 cursor-pointer bg-white dark:bg-gray-800 dark:text-gray-200" onMouseDown={(e) => { e.preventDefault(); handleSuggestionClick(paramName, suggestion); }}>{suggestion}</div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    if (isMultiSelectParam(param)) {
      const suggestions = param['x-enum-values'] || [];
      if (suggestions.length === 0) {
        return (
          <div className="relative">
            <input type="text" id={`param-${paramName}`} className={`block w-full rounded-md shadow-sm text-sm ${hasError ? 'border-red-300' : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200'}`} value={paramValues[paramName] || ''} onChange={(e) => handleParamChange(paramName, e.target.value)} placeholder={`Enter ${paramName}`} />
            {hasError && <div className="mt-1 text-sm text-red-600 dark:text-red-400">{paramErrors[paramName]}</div>}
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex items-start"><FontAwesomeIcon icon={faLightbulb} className="mr-1 mt-0.5 text-amber-500" /><span>Enter multiple values separated by commas</span></div>
          </div>
        );
      }
      const selected = selectedIngredients[paramName] || [];
      const searchTerm = searchQueries[paramName] || '';
      const filteredSuggestions = fuzzySearch(searchTerm, suggestions);
      return (
        <div className="space-y-3">
          {selected.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {selected.map(item => (
                <div key={item} className="bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-2 py-1 rounded-md text-xs flex items-center">
                  {item}
                  <button type="button" onClick={() => removeIngredient(paramName, item)} className="ml-1.5 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200"><FontAwesomeIcon icon={faTimes} className="w-3 h-3" /></button>
                </div>
              ))}
            </div>
          )}
          <div className="relative">
            <div className="flex">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FontAwesomeIcon icon={faSearch} className="text-gray-400 dark:text-gray-500" /></div>
                <input type="text" id={`param-${paramName}`} className={`block w-full pl-10 rounded-md shadow-sm text-sm ${hasError ? 'border-red-300' : 'border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200'}`} value={searchTerm} onChange={(e) => handleSearchInputChange(paramName, e.target.value)} onClick={() => setActiveSuggestionField(paramName)} placeholder={`Search ${paramName}`} />
              </div>
            </div>
            {activeSuggestionField === paramName && filteredSuggestions.length > 0 && (
              <div ref={suggestionRef} className="absolute z-[9999] mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 py-1 max-h-48 overflow-y-auto">
                {filteredSuggestions.map(suggestion => {
                  const isItemSelected = selected.includes(suggestion);
                  return (
                    <div key={suggestion} className={`px-3 py-2 text-sm cursor-pointer flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 ${isItemSelected ? 'bg-indigo-50 dark:bg-indigo-900 text-gray-900 dark:text-gray-200' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200'}`} onMouseDown={(e) => { e.preventDefault(); handleMultiSelectChange(paramName, suggestion, !isItemSelected); }}>
                      <span>{suggestion}</span>
                      {isItemSelected && <FontAwesomeIcon icon={faCheckCircle} className="text-indigo-600 dark:text-indigo-400 ml-2" />}
                    </div>
                  );
                })}
              </div>
            )}
            {hasError && <div className="mt-1 text-sm text-red-600 dark:text-red-400">{paramErrors[paramName]}</div>}
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex items-start"><FontAwesomeIcon icon={faLightbulb} className="mr-1 mt-0.5 text-amber-500" /><span>Select multiple items from the list</span></div>
          </div>
        </div>
      );
    }

    return (
      <div className="relative">
        <div className="flex">
          <input type="text" id={`param-${paramName}`} className={`block w-full rounded-md shadow-sm sm:text-sm ${hasError ? 'border-red-300' : 'border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200'} ${hasSuggestions ? 'rounded-r-none' : ''}`} placeholder={param.example || `Enter ${paramName}`} value={paramValues[paramName] || ''} onChange={(e) => handleParamChange(paramName, e.target.value)} onFocus={() => hasSuggestions && setActiveSuggestionField(paramName)} />
          {hasSuggestions && <button id={`param-btn-${paramName}`} type="button" className="inline-flex items-center px-2 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700" onClick={() => setActiveSuggestionField(activeSuggestionField === paramName ? null : paramName)}><FontAwesomeIcon icon={faChevronDown} /></button>}
        </div>
        {hasError && <div className="mt-1 text-sm text-red-600 dark:text-red-400">{paramErrors[paramName]}</div>}
        <AnimatePresence>
          {activeSuggestionField === paramName && suggestions.length > 0 && (
            <motion.div ref={suggestionRef} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.1 }} className="absolute z-[9999] mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto">
              {suggestions.map((suggestion, idx) => (
                <button key={idx} className="w-full text-left px-4 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-700 text-sm border-b border-gray-100 dark:border-gray-700 last:border-0 bg-white dark:bg-gray-800 dark:text-gray-200" onClick={() => handleSuggestionClick(paramName, suggestion)}>{suggestion}</button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const groupParametersByType = () => {
    const groups = { path: [], query: [], header: [], body: [] };
    parameters.forEach(param => { if (groups[param.in]) groups[param.in].push(param); });
    return Object.fromEntries(Object.entries(groups).filter(([_, params]) => params.length > 0));
  };

  const paramGroups = groupParametersByType();

  return (
    <div className="w-full">
      <div className="flex flex-wrap justify-between items-center mb-3">
        <div className="flex items-start mb-2 sm:mb-0">
          <div className={`px-2 py-1 rounded text-white text-sm font-bold uppercase ${getMethodColor(method)}`}>{method}</div>
          <div className="ml-2">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 break-all">{path}</h3>
            {endpointSpec.summary && <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{endpointSpec.summary}</p>}
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
        <div className="flex justify-between items-center px-3 py-2 bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600 cursor-pointer" onClick={() => toggleSection('description')}>
          <div className="flex items-center"><FontAwesomeIcon icon={faInfoCircle} className="text-gray-500 dark:text-gray-400 w-4 h-4 mr-2" /><h4 className="text-xs font-medium text-gray-700 dark:text-gray-300">Description</h4></div>
          <FontAwesomeIcon icon={expandedSection.description ? faChevronUp : faChevronDown} className="text-gray-500 dark:text-gray-400 w-3 h-3" />
        </div>
        <AnimatePresence>
          {expandedSection.description && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.1 }}>
              <div className="p-3 text-xs text-gray-600 dark:text-gray-300">{endpointSpec.description ? <p>{endpointSpec.description}</p> : <p>No description available for this endpoint.</p>}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {requiresAuth && (
        <div className="mb-2 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
          <div className="flex justify-between items-center px-3 py-2 bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600 cursor-pointer" onClick={() => toggleSection('auth')}>
            <div className="flex items-center"><FontAwesomeIcon icon={faKey} className="text-amber-500 w-4 h-4 mr-2" /><h4 className="text-xs font-medium text-gray-700 dark:text-gray-300">Authentication</h4></div>
            <FontAwesomeIcon icon={expandedSection.auth ? faChevronUp : faChevronDown} className="text-gray-500 dark:text-gray-400 w-3 h-3" />
          </div>
          <AnimatePresence>
            {expandedSection.auth && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.1 }}>
                <div className="p-3">
                  <div className="relative">
                    <div className="relative flex w-full">
                      <input type={showApiKey ? "text" : "password"} className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-900 dark:text-gray-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-400 text-xs pr-10" placeholder="Enter your API key" value={apiKey} onChange={handleApiKeyChange} />
                      <button type="button" className="absolute right-0 h-full px-3 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none" onClick={() => setShowApiKey(!showApiKey)}><FontAwesomeIcon icon={showApiKey ? faEyeSlash : faEye} className="h-4 w-4" /></button>
                    </div>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex items-start"><FontAwesomeIcon icon={faInfoCircle} className="mr-1 mt-0.5 text-gray-400 dark:text-gray-500" /><span>Enter your API key without the "Bearer" prefix. This will be automatically added to the request header.</span></div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {parameters.length > 0 && (
        <div className="mb-2 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700">
          <div className="flex justify-between items-center px-3 py-2 bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600 cursor-pointer" onClick={() => toggleSection('parameters')}>
            <div className="flex items-center"><FontAwesomeIcon icon={faServer} className="text-blue-500 w-4 h-4 mr-2" /><h4 className="text-xs font-medium text-gray-700 dark:text-gray-300">Parameters</h4></div>
            <FontAwesomeIcon icon={expandedSection.parameters ? faChevronUp : faChevronDown} className="text-gray-500 dark:text-gray-400 w-3 h-3" />
          </div>
          <AnimatePresence>
            {expandedSection.parameters && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.1 }}>
                <div className="p-3">
                  {Object.entries(paramGroups).map(([type, params]) =>
                    params.length > 0 ? (
                      <div key={type} className="mb-4 last:mb-0">
                        <div className={`inline-block px-2 py-1 mb-2 text-xs font-medium rounded ${type === 'query' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : type === 'path' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : type === 'body' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}>{type.charAt(0).toUpperCase() + type.slice(1)} Parameters</div>
                        <div className="space-y-3">
                          {params
                            .filter(param => {
                              // Filter logic: Exclude page, limit, page_size, field, and slider pairs
                              if (['page', 'limit', 'page_size', 'field'].includes(param.name)) return false;
                              if (param.name.toLowerCase().includes('min') || param.name.toLowerCase().includes('max')) {
                                const baseParamName = normalizeFieldName(param.name.replace(/(min|max)/i, ''));
                                const pair = minMaxPairs[baseParamName];
                                if (pair && pair.min && pair.max) return false;
                              }
                              return true;
                            })
                            // Sort mandatory params to top
                            .sort((a, b) => (b.required === a.required ? 0 : b.required ? 1 : -1))
                            .map(param => (
                            <div key={param.name} className="border rounded-md p-2 bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                              <div className="flex flex-wrap items-start justify-between">
                                <div className="mb-1">
                                  <div className="flex items-center">
                                    <span className="font-medium text-xs text-gray-900 dark:text-gray-200">{param.name}</span>
                                    {param.required && <span className="ml-1 text-xs text-red-500 dark:text-red-400">*</span>}
                                    <ParameterTooltip param={param} paramType={type} />
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{formatParameterType(param)}</div>
                                </div>
                                {param.description && <div className="text-xs text-gray-600 dark:text-gray-400 mb-2 w-full">{param.description}</div>}
                              </div>
                              <div className="mt-2">{renderParameterInput(param)}</div>
                            </div>
                          ))}

                          {/* Render 'field' Parameter */}
                          {params.filter(p => p.name === 'field').map(param => (
                            <div key={param.name} className="border rounded-md p-2 bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                               <div className="flex flex-wrap items-start justify-between">
                                <div className="mb-1">
                                  <div className="flex items-center">
                                    <span className="font-medium text-xs text-gray-900 dark:text-gray-200">{param.name}</span>
                                    {param.required && <span className="ml-1 text-xs text-red-500 dark:text-red-400">*</span>}
                                    <ParameterTooltip param={param} paramType={type} />
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{formatParameterType(param)}</div>
                                </div>
                                {param.description && <div className="text-xs text-gray-600 dark:text-gray-400 mb-2 w-full">{param.description}</div>}
                              </div>
                              <div className="mt-2">{renderParameterInput(param)}</div>
                            </div>
                          ))}
                          
                          {/* Render Combined Range Sliders (Immediately after field) */}
                          {renderCombinedMinMaxParameters(type)}

                          {/* Render 'page' Parameter */}
                          {params.filter(p => p.name === 'page').map(param => (
                            <div key={param.name} className="border rounded-md p-2 bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                               <div className="flex flex-wrap items-start justify-between">
                                <div className="mb-1">
                                  <div className="flex items-center">
                                    <span className="font-medium text-xs text-gray-900 dark:text-gray-200">{param.name}</span>
                                    {param.required && <span className="ml-1 text-xs text-red-500 dark:text-red-400">*</span>}
                                    <ParameterTooltip param={param} paramType={type} />
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{formatParameterType(param)}</div>
                                </div>
                                {param.description && <div className="text-xs text-gray-600 dark:text-gray-400 mb-2 w-full">{param.description}</div>}
                              </div>
                              <div className="mt-2">{renderParameterInput(param)}</div>
                            </div>
                          ))}

                          {/* Render 'limit' / 'page_size' Parameter */}
                          {params.filter(p => p.name === 'limit' || p.name === 'page_size').map(param => (
                            <div key={param.name} className="border rounded-md p-2 bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                               <div className="flex flex-wrap items-start justify-between">
                                <div className="mb-1">
                                  <div className="flex items-center">
                                    <span className="font-medium text-xs text-gray-900 dark:text-gray-200">{param.name}</span>
                                    {param.required && <span className="ml-1 text-xs text-red-500 dark:text-red-400">*</span>}
                                    <ParameterTooltip param={param} paramType={type} />
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{formatParameterType(param)}</div>
                                </div>
                                {param.description && <div className="text-xs text-gray-600 dark:text-gray-400 mb-2 w-full">{param.description}</div>}
                              </div>
                              <div className="mt-2">{renderParameterInput(param)}</div>
                            </div>
                          ))}

                        </div>
                      </div>
                    ) : null
                  )}
                  <div className="flex justify-end mt-4">
                    <button className="px-4 py-2 bg-indigo-600 dark:bg-indigo-700 text-white rounded-md text-xs font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 flex items-center shadow-sm" onClick={handleTryItOut}><FontAwesomeIcon icon={faPlay} className="mr-2" />Try It Out</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {parameters.length === 0 && (
        <div className="flex justify-end mt-2 mb-2">
          <button className="px-4 py-2 bg-indigo-600 dark:bg-indigo-700 text-white rounded-md text-xs font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 flex items-center shadow-sm" onClick={handleTryItOut}><FontAwesomeIcon icon={faPlay} className="mr-2" />Try It Out</button>
        </div>
      )}
      <TokenExhaustedModal isOpen={showTokenModal} onClose={() => setShowTokenModal(false)} />
    </div>
  );
};

export default RecipeApiEndpoint;