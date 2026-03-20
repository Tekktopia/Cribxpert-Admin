import { useEffect, useState } from 'react';
import { IoReload } from 'react-icons/io5';
import { useResendVerificationMutation } from '@/features/auth/authService';

type Props = {
  methodSelected: string | null;
  handleVerify: () => void;
  email: string;
  phoneNumber: string;
};

const StepTwoResendButton = ({
  methodSelected,
  handleVerify,
  email,
  // phoneNumber,
}: Props) => {
  const [resendDisabled, setResendDisabled] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // Countdown from 120 seconds
  const [resendVerification, { isLoading }] = useResendVerificationMutation();

  const [resendError, setResendError] = useState<string>('');

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleResend = async () => {
    if (resendDisabled || isLoading) return;

    setResendDisabled(true);
    setResendError('');

    try {
      // Different data based on verification method
      // const verificationData =
      //   methodSelected === 'Email Address'
      //     ? { email, type: 'email' }
      //     : { phoneNumber, type: 'phone' };

      // Call the resend verification API
      const response = await resendVerification({ email }).unwrap();

      // Reset the countdown
      setTimeLeft(120);

      // Show success feedback if needed
      console.log('Verification resent successfully:', response);
    } catch (err: unknown) {
      console.error('Error resending verification:', err);
      if (typeof err === 'object' && err !== null) {
        const errorObj = err as {
          data?: { message?: string };
          message?: string;
        };
        setResendError(
          errorObj.data?.message ||
            errorObj.message ||
            'Failed to resend verification'
        );
      } else {
        setResendError('Failed to resend verification');
      }
    } finally {
      // Enable the button again after 2 minutes
      setTimeout(() => setResendDisabled(false), 120000);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  };

  return (
    <>
      {methodSelected !== 'Email Address' ? (
        <div>
          <button
            onClick={handleVerify}
            className="w-full max-w-[422px] p-3 mx-auto bg-[#1D5C5C] text-white font-semibold rounded-md flex items-center justify-center gap-2 mt-4"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Proceed'}
          </button>

          <button
            onClick={handleResend}
            disabled={resendDisabled || isLoading || timeLeft > 0}
            className="text-center w-full text-[14px] text-[#999999] mt-2 flex items-center justify-center gap-3"
          >
            <IoReload />
            Resend OTP: {timeLeft > 0 ? formatTime(timeLeft) : 'Resend'}
          </button>
          {resendError && (
            <p className="text-red-500 text-sm mt-1">{resendError}</p>
          )}
        </div>
      ) : (
        <div>
          <button
            onClick={handleResend}
            disabled={resendDisabled || isLoading || timeLeft > 0}
            className={`w-full max-w-[422px] p-3 mx-auto ${resendDisabled || isLoading || timeLeft > 0 ? 'bg-[#1D5C5C91]' : 'bg-[#1D5C5C]'} text-white text-[14px] rounded-md flex items-center justify-center gap-2 mt-4`}
          >
            <IoReload />
            Resend Link: {timeLeft > 0 ? formatTime(timeLeft) : ''}
          </button>
          {resendError && (
            <p className="text-red-500 text-sm mt-1">{resendError}</p>
          )}
        </div>
      )}
    </>
  );
};

export default StepTwoResendButton;
