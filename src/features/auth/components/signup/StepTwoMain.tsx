import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import OTPInput from './OTPInput';
import StepTwoResendButton from './StepTwoResendButton';
import { setIsAuthenticated } from '@/features/auth/authSlice';
import { useVerifyOtpMutation } from '@/features/auth/authService';

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
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [otp, setOtp] = React.useState<string[]>(new Array(6).fill(''));
  const [error, setError] = React.useState<string>('');

  // API mutations
  const [verifyOtp] = useVerifyOtpMutation();

  const handleVerify = async () => {
    // Only handle verification for phone number method
    if (methodSelected !== 'Email Address') {
      try {
        const code = otp.join('');

        // Phone verification data
        const verificationData = { phoneNumber, code };

        // Call backend API to verify the OTP
        const response = await verifyOtp(verificationData).unwrap();

        if (response.success) {
          // Update auth state
          dispatch(setIsAuthenticated(true));

          // If we receive a token, store it
          if (response.token) {
            sessionStorage.setItem('token', response.token);
          }

          // Redirect to onboarding
          navigate('/onboarding');
        } else {
          setError(response.message || 'Verification failed');
        }
      } catch (err: unknown) {
        console.error('Verification error:', err);
        if (typeof err === 'object' && err !== null) {
          const errorObj = err as {
            data?: { message?: string };
            message?: string;
          };
          setError(
            errorObj.data?.message ||
              errorObj.message ||
              'An unknown error occurred'
          );
        } else {
          setError('An unknown error occurred');
        }
      }
    }
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
              . Check your inbox for your account verification link. If you
              haven't received the verification link, click the button to resend
              another link.
            </p>
            <img src="/gmail-icon.png" className="mx-auto" />
          </div>
        ) : (
          <div>
            <h2 className="text-[20px] font-bold mb-4">Verification</h2>
            <div className="space-y-2  mb-6">
              <p className="text-[#999999] text-[14px]">
                We have sent an OTP code to{' '}
                {phoneNumber.slice(0, 3) +
                  '****' +
                  phoneNumber.slice(phoneNumber.length - 3, phoneNumber.length)}
                , Please enter the OTP sent to this number below to confirm your
                account. . If you haven't received the OTP, click on the resend
                code to get another OTP
              </p>
              <p className="text-red-500">{error}</p>
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
