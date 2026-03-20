import React from 'react';
import CustomDropdown from './CustomDropdown';
import { GoogleSignUp } from './GoogleSignUp';
import { useInitiateEmailVerificationMutation } from '@/features/auth/authService';
import { Link } from 'react-router';
import { isValidEmail } from '@/utils/utils';

type StepOneProps = {
  methodSelected: string | null;
  nextStep: () => void;
  setMethodSelected: React.Dispatch<React.SetStateAction<string | null>>;
  email: string;
  phoneNumber: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  setPhoneNumber: React.Dispatch<React.SetStateAction<string>>;
};

const StepOne: React.FC<StepOneProps> = ({
  methodSelected,
  nextStep,
  setMethodSelected,
  email,
  phoneNumber,
  setEmail,
  setPhoneNumber,
}) => {
  const [error, setError] = React.useState<string>('');
  const [initiateEmailVerification, { isLoading }] =
    useInitiateEmailVerificationMutation();

  const handleSignUp = async (e: React.MouseEvent<HTMLButtonElement>) => {
    // Prevent default button click behavior
    e.preventDefault();
    e.stopPropagation();

    try {
      if (methodSelected === 'Email Address') {

        // Check email format
        if (!isValidEmail(email)) {
          throw new Error('Please enter a valid email address');
        }

        const result = await initiateEmailVerification({ email });

        // Check for errors in the result
        if ('error' in result) {
          // console.error('API error:', result.error);
          throw result.error;
        }

        // Access data safely
        const response = result.data;
        if (response?.user) {
          localStorage.setItem('pendingEmail', email);
        }
        // console.log('Verification email sent:', response?.message);

        // Only proceed if we get here without errors
        nextStep();
      } else {
        // Phone number validation
        if (!phoneNumber) {
          throw new Error('Phone number is required');
        } else if (phoneNumber.length < 11 || phoneNumber.length > 11) {
          throw new Error('Phone number must be 11 digits');
        }

        // Phone verification not implemented
        throw new Error('Phone verification is not implemented yet');
      }
    } catch (err: unknown) {
      // Error handling
      if (typeof err === 'object' && err !== null) {
        const errorObj = err as {
          data?: { message?: string };
          message?: string;
        };
        setError(
          errorObj.data?.message ||
            errorObj.message ||
            'An error occurred during sign-up'
        );
      } else {
        setError('An error occurred during sign-up');
      }
    }
  };

  return (
    <div className="relative w-full lg:w-1/2 flex flex-col items-center justify-center p-8">
      <p className="text-gray-500 text-sm mb-2 fixed top-4 right-4">
        STEP 01/04
      </p>
      <div className="w-full max-w-md text-center space-y-6">
        <div className="text-left w-full max-w-[342px] ">
          <h2 className="text-[20px] font-semibold mb-4">
            Create Your Account
          </h2>
          <p className="text-[#313131] mb-6">
            Choose your preferred method to get started
          </p>
        </div>

        <GoogleSignUp/>

        <div className="relative text-gray-500 my-4 flex items-center justify-center">
          <span className="bg-white px-2">Or</span>
        </div>

        <div className="space-y-2 text-[#999999]">
          <p className="text-red-500">{error}</p>
          <p className="text-left">Register with</p>
          <CustomDropdown
            methodSelected={methodSelected}
            setMethodSelected={setMethodSelected}
          />

          {methodSelected === 'Email Address' ? (
            <div>
              <label className="cursor-pointer flex flex-col items-start gap-2">
                Email
                <input
                  type="email"
                  name="email"
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full p-3 border  border-[#1D5C5C] rounded-md flex justify-between items-center"
                  required
                />
              </label>
            </div>
          ) : (
            <div>
              <label className="cursor-pointer flex flex-col items-start gap-2">
                Enter mobile Number
                <input
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  // type="number"
                  name="phoneNumber"
                  minLength={11}
                  placeholder="0702*****00"
                  className="w-full p-3 border  border-[#1D5C5C] rounded-md flex justify-between items-center"
                  required
                />
              </label>
            </div>
          )}

          <p className=" text-[14px] text-left">
            By clicking "Proceed" you agree to our{' '}
            <span className="text-[#1D5C5C]">Terms of Service</span>.
          </p>
        </div>

        <button
          onClick={handleSignUp}
          disabled={isLoading}
          type="button"
          className="w-full p-3 mx-auto bg-[#1D5C5C] text-white font-semibold rounded-md flex items-center justify-center gap-2 mt-4"
        >
          {isLoading ? 'Sending verification...' : 'Continue'}
        </button>

        <p className="text-gray-500 text-[14px]">
          Already have an account?
          <Link to="/login">
            <span className="text-[#1D5C5C]">Log in</span>
          </Link>
          .
        </p>
      </div>
    </div>
  );
};
export default StepOne;
