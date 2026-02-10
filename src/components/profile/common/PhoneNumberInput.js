import React, { useState, useEffect } from "react";
import PhoneInput from 'react-phone-number-input';
import { isPossiblePhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { getCountryFromPhone } from './constants';

// Custom CSS for PhoneInput to support dark mode
const phoneInputStyles = `
  .phone-input-container .PhoneInput {
    display: flex;
    align-items: center;
  }

  .phone-input-container .PhoneInputCountry {
    display: flex;
    align-items: center;
    padding: 0 0.5rem;
    margin-right: 0.5rem;
  }

  .phone-input-container .PhoneInputCountryIcon {
    width: 2rem;
    height: 1.5rem;
    margin-right: 0.5rem;
    border: none !important; /* Remove flag borders */
  }

  .phone-input-container .PhoneInputCountrySelect {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    z-index: 1;
    border: 0;
    opacity: 0;
    cursor: pointer;
    color-scheme: light dark; /* Support both light and dark themes */
    background-color: inherit;
  }

  .phone-input-container .PhoneInputInput {
    flex: 1;
    padding: 0.75rem 1rem;
    border: none;
    outline: none;
    background: transparent;
    color: inherit;
    width: 100%;
  }

  /* Dark theme adjustments */
  .dark .phone-input-container {
    color-scheme: dark;
  }

  .dark .phone-input-container .PhoneInputInput {
    color: white;
  }

  .dark .phone-input-container .PhoneInputCountryIconImg {
    filter: brightness(0.8);
  }
  
  /* Remove default select styles from browsers */
  .phone-input-container .PhoneInputCountrySelect option {
    background-color: inherit;
    color: inherit;
  }
  
  .dark .phone-input-container .PhoneInputCountrySelect option {
    background-color: #1f2937;
    color: white;
  }
`;

const PhoneNumberInput = ({ 
  value, 
  onChange, 
  defaultCountry = "IN", 
  className = "", 
  placeholder = "Enter phone number" 
}) => {
  const [phoneNumber, setPhoneNumber] = useState(value || "");
  const [isValid, setIsValid] = useState(true);
  const [initialCountry, setInitialCountry] = useState(defaultCountry);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    // If there's an initial phone number, determine its country
    if (value) {
      const detectedCountry = getCountryFromPhone(value);
      if (detectedCountry) {
        setInitialCountry(detectedCountry);
      }
    }
    
    // Update local state when prop value changes
    if (value !== phoneNumber) {
      setPhoneNumber(value);
    }
  }, [value, phoneNumber]);

  const handleChange = (newValue) => {
    setPhoneNumber(newValue);
    
    // Call parent onChange without validating
    if (onChange) {
      onChange(newValue);
    }
  };
  
  const handleBlur = () => {
    setFocused(false);
    
    // Only validate on blur
    if (phoneNumber) {
      const valid = isPossiblePhoneNumber(phoneNumber);
      setIsValid(valid);
    } else {
      setIsValid(true); // Empty is considered valid until submission
    }
  };
  
  const handleFocus = () => {
    setFocused(true);
    // Reset validation when focused
    setIsValid(true);
  };

  return (
    <>
      <style>{phoneInputStyles}</style>
      <div className="phone-input-container">
        <PhoneInput
          international
          countryCallingCodeEditable={false}
          defaultCountry={initialCountry}
          value={phoneNumber}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          className={`w-full rounded-lg border ${!isValid && !focused ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
        />
        {!isValid && !focused && (
          <p className="text-red-500 text-xs mt-1">Please enter a valid phone number</p>
        )}
      </div>
    </>
  );
};

export default PhoneNumberInput; 