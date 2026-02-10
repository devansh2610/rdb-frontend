import React, { useEffect, useState, useRef } from 'react';
import { Tooltip } from 'flowbite-react';
import { useAuth } from '../context/AuthContext';

const AnimatedTokenDisplay = ({ value, className = "" }) => {
  const { TOKEN_UPDATE_EVENT } = useAuth();
  const numericValue = typeof value === 'number' ? value : parseInt(value) || 0;
  
  const [displayValue, setDisplayValue] = useState(numericValue);
  const [animationState, setAnimationState] = useState([]);
  const animationFrameRef = useRef(null);
  const prevValueRef = useRef(numericValue);

  // Listen for token update events
  useEffect(() => {
    const handleTokenUpdate = (event) => {
      const { tokens } = event.detail;
      if (tokens !== undefined && tokens !== prevValueRef.current) {
        animateToNewValue(tokens);
      }
    };

    window.addEventListener(TOKEN_UPDATE_EVENT, handleTokenUpdate);
    return () => {
      window.removeEventListener(TOKEN_UPDATE_EVENT, handleTokenUpdate);
    };
  }, [TOKEN_UPDATE_EVENT]);

  // Update when props value changes
  useEffect(() => {
    if (numericValue !== prevValueRef.current) {
      animateToNewValue(numericValue);
    }
  }, [numericValue]);

  // Listen to current_tokens changes in localStorage
  useEffect(() => {
    const checkTokenChanges = () => {
      const currentTokensStr = localStorage.getItem("current_tokens");
      if (currentTokensStr) {
        const currentTokens = parseInt(currentTokensStr);
        if (!isNaN(currentTokens) && currentTokens !== prevValueRef.current) {
          animateToNewValue(currentTokens);
        }
      }
    };
    
    // Check right away
    checkTokenChanges();
    
    // Set up interval for checking (especially for the Swagger UI case)
    const intervalId = setInterval(checkTokenChanges, 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  const animateToNewValue = (newValue) => {
    prevValueRef.current = newValue;
    
    const currentValueStr = displayValue.toString();
    const newValueStr = newValue.toString();

    const maxLength = Math.max(currentValueStr.length, newValueStr.length);
    const paddedCurrentValue = currentValueStr.padStart(maxLength, '0');
    const paddedNewValue = newValueStr.padStart(maxLength, '0');

    const newAnimationState = paddedCurrentValue.split('').map((digit, index) => ({
      current: parseInt(digit),
      target: parseInt(paddedNewValue[index]),
      animating: parseInt(digit) !== parseInt(paddedNewValue[index]),
      animationSteps: Math.floor(Math.random() * 10) + 15,
      currentStep: 0
    }));

    setAnimationState(newAnimationState);

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (newAnimationState.some(digit => digit.animating)) {
      animationFrameRef.current = requestAnimationFrame(animateDigits);
    } else {
      setDisplayValue(newValue);
    }
  };

  const animateDigits = () => {
    setAnimationState(prevState => {
      const updatedAnimationState = prevState.map(digitState => {
        if (!digitState.animating) return digitState;

        const newStep = digitState.currentStep + 1;
        
        const shouldStop = newStep >= digitState.animationSteps;

        let newCurrent;
        if (shouldStop) {
          newCurrent = digitState.target;
        } else {
          const progress = newStep / digitState.animationSteps;
          const speed = progress < 0.7 ? 1 : Math.max(0.2, 1 - progress);
          
          if (Math.random() < speed) {
            newCurrent = (digitState.current + 1) % 10;
          } else {
            newCurrent = digitState.current;
          }
        }

        return {
          ...digitState,
          current: newCurrent,
          currentStep: newStep,
          animating: !shouldStop
        };
      });

      if (!updatedAnimationState.some(digit => digit.animating)) {
        setTimeout(() => setDisplayValue(prevValueRef.current), 0);
      } else {
        animationFrameRef.current = requestAnimationFrame(animateDigits);
      }

      return updatedAnimationState;
    });
  };

  const renderDigit = (digitState, index) => {
    return (
      <div 
        key={index} 
        className="w-[1ch] inline-block overflow-hidden relative h-[1.5em]"
        style={{ lineHeight: '1.5em', verticalAlign: 'middle' }}
      >
        <div 
          className={`absolute transition-all ${
            digitState.animating 
              ? 'duration-100' 
              : 'duration-300 ease-out'
          }`}
          style={{
            transform: `translateY(-${digitState.current * 1.5}em)`,
          }}
        >
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(digit => (
            <div 
              key={digit} 
              className="h-[1.5em] w-[1ch] flex items-center justify-center"
            >
              {digit}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Tooltip content="Available Tokens" placement="bottom">
      <div className={`group relative flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500/30 via-yellow-500/20 to-yellow-500/10 dark:from-green-500/10 dark:via-green-500/5 dark:to-green-500/2 rounded-full border border-yellow-500/40 dark:border-green-500/20 shadow-lg shadow-yellow-500/10 dark:shadow-none hover:shadow-yellow-500/20 dark:hover:shadow-none transition-all duration-300 hover:scale-105 cursor-pointer ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 via-yellow-500/10 to-yellow-500/0 dark:from-transparent dark:via-transparent dark:to-transparent rounded-full animate-shimmer"></div>
        <svg 
          className="w-5 h-5" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12" cy="12" r="10" fill="url(#coin-gradient)" stroke="#EAB308" strokeWidth="1.5"/>
          <circle cx="12" cy="12" r="8" fill="url(#coin-inner-gradient)" stroke="#EAB308" strokeWidth="1"/>
          <text x="12" y="16" textAnchor="middle" fill="#EAB308" fontSize="12" fontWeight="bold">T</text>
          <defs>
            <linearGradient id="coin-gradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FDE047"/>
              <stop offset="1" stopColor="#EAB308"/>
            </linearGradient>
            <linearGradient id="coin-inner-gradient" x1="4" y1="4" x2="20" y2="20" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FEF08A"/>
              <stop offset="1" stopColor="#FDE047"/>
            </linearGradient>
          </defs>
        </svg>
        <div className="font-bold text-yellow-700 dark:text-green-400 text-sm tracking-wide flex items-center" style={{ height: '1.5em', lineHeight: '1.5em' }}>
          {animationState.length > 0 ? 
            animationState.map(renderDigit) : 
            displayValue.toLocaleString()
          }
        </div>
        <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500/0 via-yellow-500/15 to-yellow-500/0 dark:from-transparent dark:via-transparent dark:to-transparent rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
    </Tooltip>
  );
};

export default AnimatedTokenDisplay;