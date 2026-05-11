import React from 'react';
import { useNavigate } from 'react-router-dom';
import OTPInput from './OTPInput';
import StepTwoResendButton from './StepTwoResendButton';
import { supabase } from '@/lib/supabase';

type StepTwoMainProps = {
  methodSelected: string | null;
  email: string;
  phoneNumber: string;
};

const StepTwoMain: React.FC<StepTwoMainProps> = ({
  methodSelected,
  email,
  phoneNumber,
}) => {
  const navigate = useNavigate();
  const [otp, setOtp] = React.useState<string[]>(new Array(6).fill(''));
  const [error, setError] = React.useState<string>('');

  const handleVerify = async () => {
    if (methodSelected === 'Email Address') return;

    const token = otp.join('');
    const { error: sbError } = await supabase.auth.verifyOtp({
      phone: phoneNumber,
      token,
      type: 'sms',
    });

    if (sbError) {
      setError(sbError.message || 'Verification failed');
      return;
    }

    navigate('/onboarding');
  };

  return (
    <div className="relative w-full lg:w-1/2 flex flex-col items-center justify-center p-8">
      <p className="text-gray-500 text-sm mb-2 fixed top-4 right-4">
        STEP 03/04
      </p>
      <div className="w-full max-w-md space-y-6 text-center">
        {methodSelected === 'Email Address' ? (
          <div>
            <h2 className="text-[20px] font-bold mb-4">Verification</h2>
            <p className="text-[#313131] mb-6 text-[14px]">
              We've sent a verification link to your email{' '}
              {email.slice(0, 3) +
                '****' +
                email.slice(email.length - 10, email.length)}
              . Check your inbox for your account verification link.
            </p>
            <img src="/gmail-icon.png" className="mx-auto" />
          </div>
        ) : (
          <div>
            <h2 className="text-[20px] font-bold mb-4">Verification</h2>
            <div className="space-y-2 mb-6">
              <p className="text-[#999999] text-[14px]">
                We have sent an OTP code to{' '}
                {phoneNumber.slice(0, 3) +
                  '****' +
                  phoneNumber.slice(phoneNumber.length - 3, phoneNumber.length)}
                . Please enter the OTP below to confirm your account.
              </p>
              {error && <p className="text-red-500">{error}</p>}
            </div>
            <OTPInput otp={otp} setOtp={setOtp} />
          </div>
        )}

        <StepTwoResendButton
          methodSelected={methodSelected}
          handleVerify={handleVerify}
          email={email}
          phoneNumber={phoneNumber}
        />
      </div>
    </div>
  );
};
export default StepTwoMain;
