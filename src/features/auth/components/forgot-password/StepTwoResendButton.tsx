import { useEffect, useState } from 'react';
import { IoReload } from 'react-icons/io5';

type Props = {
  methodSelected: string | null;
  handleVerify: () => void;
  requestReset: (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
};

const StepTwoResendButton = ({
  methodSelected,
  handleVerify,
  requestReset,
  isLoading,
}: Props) => {
  const [timeLeft, setTimeLeft] = useState(120); // Countdown from 120 seconds

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  };

  // Wrapper function to handle resetting timer on request
  const handleRequestReset = async (e: React.FormEvent) => {
    await requestReset(e);
    // Reset timer after request is completed
    setTimeLeft(120);
  };

  return (
    <>
      {methodSelected !== 'Email Address' ? (
        <div>
          <button
            onClick={handleVerify}
            className="w-full p-3 mx-auto bg-[#1D5C5C] text-white font-semibold rounded-md flex items-center justify-center gap-2 mt-4"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Proceed'}
          </button>

          <button
            onClick={handleRequestReset}
            disabled={isLoading || timeLeft > 0}
            className="text-center w-full text-[14px] text-[#999999] mt-2 flex items-center justify-center gap-3"
          >
            <IoReload />
            Resend OTP: {timeLeft > 0 ? formatTime(timeLeft) : 'Resend'}
          </button>
        </div>
      ) : (
        <div>
          <button
            onClick={handleRequestReset}
            disabled={isLoading || timeLeft > 0}
            className={`w-full p-3 mx-auto ${isLoading || timeLeft > 0 ? 'bg-[#1D5C5C91]' : 'bg-[#1D5C5C]'} text-white text-[14px] rounded-md flex items-center justify-center gap-2 mt-4`}
          >
            {isLoading ? (
              'Processing...'
            ) : (
              <>
                <IoReload />
                Resend Link {timeLeft > 0 ? formatTime(timeLeft) : ''}
              </>
            )}
          </button>
        </div>
      )}
    </>
  );
};

export default StepTwoResendButton;
