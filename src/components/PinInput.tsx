/**
 * PIN Input Component
 * 
 * A secure, accessible PIN input component with validation,
 * error handling, and mobile-responsive design.
 */

import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { Eye, EyeOff, Lock, AlertCircle } from 'lucide-react';

export interface PinInputProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (pin: string) => void;
  length?: number;
  disabled?: boolean;
  error?: string;
  showStrength?: boolean;
  maskInput?: boolean;
  autoFocus?: boolean;
  placeholder?: string;
  className?: string;
  'data-testid'?: string;
}

const PinInput = forwardRef<HTMLDivElement, PinInputProps>(({
  value,
  onChange,
  onComplete,
  length = 5,
  disabled = false,
  error,
  showStrength = false,
  maskInput = true,
  autoFocus = false,
  placeholder = 'Enter PIN',
  className = '',
  'data-testid': testId = 'pin-input',
  ...props
}, ref) => {
  const [isVisible, setIsVisible] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize input refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  // Auto-focus first input
  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  // Handle input change
  const handleInputChange = (index: number, inputValue: string) => {
    // Only allow digits
    const sanitizedValue = inputValue.replace(/\D/g, '');
    
    if (sanitizedValue.length > 1) {
      // Handle paste or multiple character input
      const digits = sanitizedValue.slice(0, length);
      const newValue = digits.padEnd(length, '');
      onChange(newValue);
      
      // Focus the next empty input or the last input
      const nextIndex = Math.min(digits.length, length - 1);
      if (inputRefs.current[nextIndex]) {
        inputRefs.current[nextIndex].focus();
      }
      
      // Call onComplete if all digits are filled
      if (digits.length === length) {
        onComplete?.(digits);
      }
    } else {
      // Single character input
      const newValue = value.split('');
      newValue[index] = sanitizedValue;
      onChange(newValue.join('').slice(0, length));
      
      // Move to next input
      if (sanitizedValue && index < length - 1) {
        const nextInput = inputRefs.current[index + 1];
        if (nextInput) {
          nextInput.focus();
        }
      }
      
      // Call onComplete if all digits are filled
      if (newValue.join('').length === length && newValue.every(digit => digit !== '')) {
        onComplete?.(newValue.join(''));
      }
    }
  };

  // Handle key down events
  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    const { key } = event;
    
    if (key === 'Backspace') {
      if (value[index] === '') {
        // Move to previous input if current is empty
        const prevInput = inputRefs.current[index - 1];
        if (prevInput) {
          prevInput.focus();
        }
      } else {
        // Clear current input
        const newValue = value.split('');
        newValue[index] = '';
        onChange(newValue.join(''));
      }
    } else if (key === 'ArrowLeft') {
      const prevInput = inputRefs.current[index - 1];
      if (prevInput) {
        prevInput.focus();
      }
    } else if (key === 'ArrowRight') {
      const nextInput = inputRefs.current[index + 1];
      if (nextInput) {
        nextInput.focus();
      }
    } else if (key === 'Enter') {
      // Call onComplete if all digits are filled
      if (value.length === length && value.split('').every(digit => digit !== '')) {
        onComplete?.(value);
      }
    }
  };

  // Handle paste
  const handlePaste = (event: React.ClipboardEvent) => {
    event.preventDefault();
    const pastedData = event.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, '').slice(0, length);
    onChange(digits.padEnd(length, ''));
    
    // Focus the next empty input or the last input
    const nextIndex = Math.min(digits.length, length - 1);
    if (inputRefs.current[nextIndex]) {
      inputRefs.current[nextIndex].focus();
    }
    
    // Call onComplete if all digits are filled
    if (digits.length === length) {
      onComplete?.(digits);
    }
  };

  // Handle focus
  const handleFocus = (index: number) => {
    setFocusedIndex(index);
  };

  // Handle blur
  const handleBlur = () => {
    setFocusedIndex(null);
  };

  // Toggle visibility
  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  // Calculate PIN strength
  const calculateStrength = (pin: string): number => {
    if (pin.length === 0) return 0;
    
    let score = 20; // Base score
    
    // Check for sequential patterns
    const isSequential = /^(?:01234|12345|23456|34567|45678|56789|98765|87654|76543|65432|54321|43210)$/.test(pin);
    if (!isSequential) score += 20;
    
    // Check for repeated digits
    const isRepeated = /^(\d)\1{4}$/.test(pin);
    if (!isRepeated) score += 20;
    
    // Check for common patterns
    const isCommon = /^(?:12345|54321|11111|22222|33333|44444|55555|66666|77777|88888|99999|00000)$/.test(pin);
    if (!isCommon) score += 20;
    
    // Check for digit variety
    const uniqueDigits = new Set(pin).size;
    score += uniqueDigits * 5;
    
    return Math.min(score, 100);
  };

  const strength = showStrength ? calculateStrength(value) : 0;
  const strengthColor = strength >= 80 ? 'bg-green-500' : 
                       strength >= 60 ? 'bg-yellow-500' : 
                       strength >= 40 ? 'bg-orange-500' : 'bg-red-500';

  return (
    <div 
      ref={ref}
      className={`pin-input-container ${className}`}
      data-testid={testId}
      {...props}
    >
      <div className="relative">
        <div
          ref={containerRef}
          className={`
            flex items-center justify-center space-x-2 p-4 rounded-lg border-2 transition-all duration-200
            ${error ? 'border-red-500 bg-red-50' : 
              focusedIndex !== null ? 'border-blue-500 bg-blue-50' : 
              'border-gray-300 bg-white'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-text'}
          `}
          onClick={() => {
            if (!disabled) {
              const firstEmptyIndex = value.split('').findIndex(digit => digit === '');
              const targetIndex = firstEmptyIndex === -1 ? length - 1 : firstEmptyIndex;
              inputRefs.current[targetIndex]?.focus();
            }
          }}
        >
          {/* PIN Input Fields */}
          {Array.from({ length }, (_, index) => (
            <div key={index} className="relative">
              <input
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type={maskInput && !isVisible ? 'password' : 'text'}
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={value[index] || ''}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onFocus={() => handleFocus(index)}
                onBlur={handleBlur}
                onPaste={handlePaste}
                disabled={disabled}
                className={`
                  w-12 h-12 text-center text-xl font-bold border-2 rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  transition-all duration-200
                  ${error ? 'border-red-500' : 
                    focusedIndex === index ? 'border-blue-500' : 
                    'border-gray-300'}
                  ${disabled ? 'cursor-not-allowed' : 'cursor-text'}
                `}
                aria-label={`PIN digit ${index + 1}`}
                aria-describedby={error ? `${testId}-error` : undefined}
                data-testid={`${testId}-digit-${index}`}
              />
              {focusedIndex === index && (
                <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none" />
              )}
            </div>
          ))}
          
          {/* Visibility Toggle */}
          {maskInput && (
            <button
              type="button"
              onClick={toggleVisibility}
              disabled={disabled}
              className={`
                ml-2 p-2 rounded-lg transition-colors duration-200
                ${disabled ? 'text-gray-400 cursor-not-allowed' : 
                  'text-gray-600 hover:text-gray-800 hover:bg-gray-100'}
              `}
              aria-label={isVisible ? 'Hide PIN' : 'Show PIN'}
              data-testid={`${testId}-toggle-visibility`}
            >
              {isVisible ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          )}
        </div>
        
        {/* Placeholder Text */}
        {value.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-gray-400 text-sm">{placeholder}</span>
          </div>
        )}
      </div>
      
      {/* Error Message */}
      {error && (
        <div 
          id={`${testId}-error`}
          className="flex items-center mt-2 text-red-600 text-sm"
          role="alert"
          data-testid={`${testId}-error`}
        >
          <AlertCircle size={16} className="mr-1" />
          {error}
        </div>
      )}
      
      {/* PIN Strength Indicator */}
      {showStrength && value.length > 0 && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
            <span>PIN Strength</span>
            <span className="font-medium">
              {strength >= 80 ? 'Very Strong' : 
               strength >= 60 ? 'Strong' : 
               strength >= 40 ? 'Medium' : 
               strength >= 20 ? 'Weak' : 'Very Weak'}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${strengthColor}`}
              style={{ width: `${strength}%` }}
            />
          </div>
        </div>
      )}
      
      {/* Security Icon */}
      <div className="flex items-center justify-center mt-2">
        <Lock size={16} className="text-gray-400" />
        <span className="ml-1 text-xs text-gray-500">Secure PIN Input</span>
      </div>
    </div>
  );
});

PinInput.displayName = 'PinInput';

export default PinInput;
