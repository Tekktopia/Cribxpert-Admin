import React, { useState, useEffect } from 'react';
import OTPInput from '../signup/OTPInput';
import StepTwoResendButton from './StepTwoResendButton';

type StepTwoProps = {
  methodSelected: string | null;
  email: string;
  phoneNumber: string;
  verifyCode: (code: string) => Promise<boolean>;
  requestReset: (e: React.FormEvent) => Promise<void>;
  error: string;
  isLoading: boolean;
};

const StepTwo: React.FC<StepTwoProps> = ({
  methodSelected,
  email,
  phoneNumber,
  requestReset,
  verifyCode,
  error,
  isLoading,
}) => {
  const [otp, setOtp] = React.useState<string[]>(new Array(6).fill(''));
  const [timeLeft, setTimeLeft] = useState(120); // Countdown from 120 seconds (2 minutes)

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleVerify = () => {
    verifyCode(otp.join(''));
  };
  return (
    <div className="relative w-full lg:w-1/2 flex flex-col items-center justify-center p-8">
      <p className="text-gray-500 text-sm mb-2 fixed top-4 right-4">
        STEP 02/04
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
              ). Check your inbox for your password reset link. If you haven't
              received the verification link, click the button to resend another
              link.
            </p>
            {error && <p className="text-red-500">{error}</p>}
            <img src="/gmail-icon.png" className="mx-auto" alt="Email sent" />
          </div>
        ) : (
          <div>
            <h2 className="text-[20px] font-bold mb-4">Verification</h2>
            <div className="space-y-2 mb-6">
              <p className="text-[#999999] text-[14px]">
                We have sent an OTP code to (
                {phoneNumber.slice(0, 3) +
                  '****' +
                  phoneNumber.slice(phoneNumber.length - 3, phoneNumber.length)}
                ). Please enter the OTP received below to confirm your account.
                If you haven't received the OTP, click on the resend code to get
                another OTP.
              </p>
              {error && <p className="text-red-500">{error}</p>}
            </div>

            <OTPInput otp={otp} setOtp={setOtp} />
          </div>
        )}
        <StepTwoResendButton
          methodSelected={methodSelected}
          handleVerify={handleVerify}
          requestReset={requestReset}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default StepTwo;
