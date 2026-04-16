import React, { useRef, useState, useEffect } from 'react';

interface OtpInputProps {
  onComplete: (code: string) => void;
  className?: string;
}

const OtpInput: React.FC<OtpInputProps> = ({ onComplete, className = '' }) => {
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus the first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (element: HTMLInputElement, index: number) => {
    const value = element.value;
    // Only allow digits
    if (value !== '' && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    // Take the last character entered
    const digit = value.substring(value.length - 1);
    newOtp[index] = digit;
    setOtp(newOtp);

    // If a digit was entered, move to next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if OTP is complete
    const completeCode = newOtp.join('');
    if (completeCode.length === 6) {
      onComplete(completeCode);
    } else {
      // Clear complete state if it was complete before
      onComplete('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // If current box is empty, move to previous box
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pasteData)) return;

    const newOtp = [...otp];
    pasteData.split('').forEach((char, index) => {
      if (index < 6) {
        newOtp[index] = char;
      }
    });
    setOtp(newOtp);

    // Focus the next empty box or the last box
    const nextIndex = pasteData.length < 6 ? pasteData.length : 5;
    inputRefs.current[nextIndex]?.focus();

    if (newOtp.join('').length === 6) {
      onComplete(newOtp.join(''));
    }
  };

  return (
    <div className={`flex justify-between gap-2 ${className}`} onPaste={handlePaste}>
      {otp.map((data, index) => (
        <input
          key={index}
          type="text"
          inputMode="numeric"
          maxLength={1}
          ref={(el) => { inputRefs.current[index] = el; }}
          value={data}
          onChange={(e) => handleChange(e.target, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          className={`
            w-12 h-14 text-center text-xl font-bold rounded-xl bg-[#12141d] border transition-all duration-200
            border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50
          `}
        />
      ))}
    </div>
  );
};

export default OtpInput;
