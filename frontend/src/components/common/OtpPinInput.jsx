import React, { useRef, useEffect } from 'react';

export default function OtpPinInput({ value = '', onChange, hasError, disabled = false }) {
  const inputRefs = useRef([]);

  // Ensure refs array has 6 entries
  if (inputRefs.current.length !== 6) {
    inputRefs.current = Array(6).fill(null);
  }

  // Parse string into array of 6 characters
  const digits = Array(6).fill('').map((_, i) => (value && value[i]) || '');

  // Auto-focus first input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputRefs.current[0] && !disabled) {
        inputRefs.current[0].focus();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [disabled]);

  const handleChange = (e, index) => {
    const val = e.target.value.replace(/\D/g, '');
    if (!val) {
      // Cleared input
      const newDigits = [...digits];
      newDigits[index] = '';
      onChange(newDigits.join(''));
      return;
    }

    // Handle single digit input or multi-digit (paste/autofill)
    if (val.length === 1) {
      const newDigits = [...digits];
      newDigits[index] = val;
      const fullCode = newDigits.join('');
      onChange(fullCode);

      // Move to next box if available
      if (index < 5 && inputRefs.current[index + 1]) {
        inputRefs.current[index + 1].focus();
      }
    } else if (val.length > 1) {
      // Pasted / Autofilled multiple digits
      const pastedDigits = val.slice(0, 6).split('');
      const newDigits = [...digits];
      pastedDigits.forEach((d, i) => {
        if (i < 6) newDigits[i] = d;
      });
      const fullCode = newDigits.join('');
      onChange(fullCode);

      const nextFocusIndex = Math.min(pastedDigits.length, 5);
      if (inputRefs.current[nextFocusIndex]) {
        inputRefs.current[nextFocusIndex].focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0 && inputRefs.current[index - 1]) {
        // Move back and clear previous digit
        e.preventDefault();
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        onChange(newDigits.join(''));
        inputRefs.current[index - 1].focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newDigits = Array(6).fill('');
    pastedData.split('').forEach((d, i) => {
      newDigits[i] = d;
    });
    onChange(newDigits.join(''));

    const nextIndex = Math.min(pastedData.length, 5);
    if (inputRefs.current[nextIndex]) {
      inputRefs.current[nextIndex].focus();
    }
  };

  return (
    <div className="flex items-center justify-between gap-1.5 sm:gap-2 my-2" onPaste={handlePaste}>
      {Array(6).fill(0).map((_, index) => {
        const digit = digits[index];
        const isFilled = !!digit;

        return (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            disabled={disabled}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`w-9 h-11 xs:w-10 xs:h-12 sm:w-12 sm:h-14 text-center font-mono font-semibold text-base sm:text-xl rounded-xl transition-all outline-none border ${
              disabled
                ? 'bg-zinc-100 border-zinc-200 text-zinc-400 cursor-not-allowed'
                : hasError
                ? 'bg-rose-50/50 border-rose-400 text-rose-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                : isFilled
                ? 'bg-white border-[#00c9d6] text-zinc-900 shadow-sm ring-2 ring-[#00c9d6]/15'
                : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:bg-white focus:border-[#00c9d6] focus:ring-2 focus:ring-[#00c9d6]/20'
            }`}
          />
        );
      })}
    </div>
  );
}
