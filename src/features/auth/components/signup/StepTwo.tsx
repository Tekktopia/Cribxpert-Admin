import React, { useEffect, useState } from 'react';
import OTPInput from './OTPInput';
import { IoReload } from 'react-icons/io5';

type StepTwoProps = {
  nextStep: () => void;
  methodSelected: string | null;
  email: string;
  phoneNumber: string;
};

const StepTwo: React.FC<StepTwoProps> = ({
  nextStep,
  methodSelected,
  email,
  phoneNumber,
}) => {
  const [otp, setOtp] = React.useState<string[]>(new Array(4).fill(''));

  const [timeLeft, setTimeLeft] = useState(120); // Countdown from 120 seconds (2 minutes)

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  return (
    <div className="relative w-1/2 flex flex-col items-center justify-center p-8">
      <p className="text-gray-500 text-sm mb-2 fixed top-4 right-4">
        STEP 02/03
      </p>
      <div className="w-full max-w-md space-y-6 text-center">
        {methodSelected === 'Email Address' ? (
          <div>
            <h2 className="text-[20px] font-bold mb-4">Verification</h2>
            <p className="text-[#999999] mb-6 text-[14px]">
              We've sent a verification link to your email (
              {email.slice(0, 3) +
                '****' +
                email.slice(email.length - 10, email.length)}
              ) . Check your inbox for your account verification link. If you
              haven't received the verification link, click the button to resend
              another link.
            </p>
            <img src="/gmail-icon.png" className="mx-auto" />
          </div>
        ) : (
          <div>
            <h2 className="text-[20px] font-bold mb-4">Verification</h2>
            <p className="text-[#999999] mb-6 text-[14px]">
              We have sent an OTP code to (
              {phoneNumber.slice(0, 3) +
                '****' +
                phoneNumber.slice(phoneNumber.length - 3, phoneNumber.length)}
              ), Please enter the OTP sent to this number below to confirm your
              account. . If you haven't received the OTP, click on the resend
              code to get another OTP
            </p>

            <OTPInput otp={otp} setOtp={setOtp} />
          </div>
        )}

        {methodSelected === 'Email Address' ? (
          <button className="w-full max-w-[422px] p-3 mx-auto bg-[#1D5C5C79] text-white font-semibold rounded-md flex items-center justify-center gap-2 mt-4">
            <IoReload />
            Resend Link:{/* Countdown Timer */}
            <span>
              {timeLeft > 0
                ? `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`
                : "Time's up!"}
            </span>
          </button>
        ) : (
          <div className='space-y-6'>
            <button
              onClick={nextStep}
              className="w-full max-w-[422px] p-3 mx-auto bg-[#1D5C5C] text-white font-semibold rounded-md flex items-center justify-center gap-2 mt-4"
            >Proceed</button>
            <p className='flex justify-center items-center gap-2 text-[#999999]'>
              <IoReload />
              Resend Link:{/* Countdown Timer */}
              <span>
                {timeLeft > 0
                  ? `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`
                  : "Time's up!"}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
export default StepTwo;
