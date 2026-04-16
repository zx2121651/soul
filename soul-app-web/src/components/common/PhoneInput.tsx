import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  errorText?: string;
  placeholder?: string;
  className?: string;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  errorText,
  placeholder = '请输入手机号',
  className = '',
}) => {
  const [isFocused, setIsFocused] = useState(false);

  // Format the raw value into 3-4-4 format
  const formatPhoneNumber = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 11);
    let formatted = '';
    if (digits.length > 0) {
      formatted += digits.substring(0, 3);
      if (digits.length > 3) {
        formatted += ' ' + digits.substring(3, 7);
      }
      if (digits.length > 7) {
        formatted += ' ' + digits.substring(7, 11);
      }
    }
    return formatted;
  };

  const displayValue = formatPhoneNumber(value);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    // Remove non-digits
    const rawValue = input.replace(/\D/g, '').slice(0, 11);

    // Update raw value via onChange
    onChange(rawValue);
  };

  return (
    <div className={`w-full ${className}`}>
      <div
        className={`
          flex items-center bg-[#12141d] border rounded-xl px-4 py-3 transition-all duration-200
          ${errorText ? 'border-red-500/50' : 'border-white/10'}
          ${isFocused ? 'ring-2 ring-cyan-500/50 border-cyan-500/50' : ''}
        `}
      >
        {/* Country Code Selector */}
        <div className="flex items-center gap-1 pr-3 border-r border-white/10 mr-3 text-gray-300">
          <span className="text-sm font-medium">+86</span>
          <ChevronDown size={14} className="text-gray-500" />
        </div>

        {/* Input Field */}
        <input
          type="tel"
          value={displayValue}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 text-base"
        />
      </div>

      {/* Error Message */}
      {errorText && (
        <p className="mt-1.5 ml-1 text-xs text-red-500">
          {errorText}
        </p>
      )}
    </div>
  );
};

export default PhoneInput;
