import React, { useState, useRef, useEffect } from 'react';

type OTPInputProps = {
  otp: string[];
  setOtp: React.Dispatch<React.SetStateAction<string[]>>;
};
const OTPInput: React.FC<OTPInputProps> = ({ otp, setOtp }) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(30); // Countdown from 60 seconds

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Allow only numbers

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus(); // Move to next input
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus(); // Move to previous input on backspace
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 justify-center">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              if (el) inputRefs.current[index] = el;
            }}
            type="text"
            value={digit}
            placeholder='-'
            maxLength={1}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="w-[44px] h-[44px] bg-[#CCCCCC4D] border border-gray-400 text-center text-xl rounded-md focus:border-black outline-[#1D5C5C]"
          />
        ))}
      </div>
      {/* Countdown Timer */}
      {/* <p className="text-red-500">
        {timeLeft > 0
          ? `00:${timeLeft.toString().padStart(2, '0')}`
          : "Time's up!"}
      </p> */}
    </div>
  );
};

export default OTPInput;