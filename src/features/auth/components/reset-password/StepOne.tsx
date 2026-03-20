import { EyeOff, Eye, CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';

type StepOneProps = {
  formData: {
    password: string;
    email: string;
    token: string;
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      password: string;
      email: string;
      token: string;
    }>
  >;
  nextStep: () => void;
  handleResetPassword: (password: string) => Promise<boolean>;
  isLoading: boolean;
  error: string;
};

export default function StepOne({
  formData,
  setFormData,
  handleResetPassword,
  isLoading,
  error,
}: StepOneProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setConfirmPassword(e.target.value);
    if (e.target.value !== formData.password) {
      setPasswordError('Passwords do not match');
    } else {
      setPasswordError('');
    }
  };

  // Password validation
  const passwordCriteria = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    number: /\d/.test(formData.password),
    symbol: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
  };

  const toStepTwo = async () => {
    // Check if passwords match and all criteria are met
    if (passwordError || !Object.values(passwordCriteria).every(Boolean)) {
      setPasswordError('Please ensure all password criteria are met');
      return;
    }

    await handleResetPassword(formData.password);
  };

  return (
    <div className="w-full max-w-md text-center space-y-6">
      <div className="text-left w-full max-w-[342px] mb-2">
        <h2 className="text-[20px] font-semibold ">Reset Password</h2>
        <p className="text-[#999] mb-6">
          Enter a new password to reset your account
        </p>
      </div>

      <div className="space-y-6">
        {/* Display API error if any */}
        {error && <p className="text-red-500 text-sm">{error}</p>}

        {/* New Password */}
        <div className="relative">
          <label className="block text-left text-gray-700 font-medium mb-1">
            New Password
          </label>
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="*********"
            className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-[#1D5C5C]"
          />
          {showPassword ? (
            <EyeOff
              className="absolute right-3 top-10 text-gray-500 w-5 h-5 cursor-pointer"
              onClick={togglePasswordVisibility}
            />
          ) : (
            <Eye
              className="absolute right-3 top-10 text-gray-500 w-5 h-5 cursor-pointer"
              onClick={togglePasswordVisibility}
            />
          )}
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <label className="block text-left text-gray-700 font-medium mb-1">
            Confirm Password
          </label>
          <input
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            placeholder="*********"
            className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-[#1D5C5C]"
          />
          {showPassword ? (
            <EyeOff
              className="absolute right-3 top-10 text-gray-500 w-5 h-5 cursor-pointer"
              onClick={togglePasswordVisibility}
            />
          ) : (
            <Eye
              className="absolute right-3 top-10 text-gray-500 w-5 h-5 cursor-pointer"
              onClick={togglePasswordVisibility}
            />
          )}
        </div>

        {/* Password Error */}
        {passwordError && (
          <p className="text-red-500 text-sm mt-1">{passwordError}</p>
        )}

        {/* Password Requirements */}
        <ul className="text-sm grid grid-cols-2 mt-2">
          {Object.entries(passwordCriteria).map(([key, met]) => (
            <li
              key={key}
              className={`flex items-center gap-2 ${
                met ? 'text-green-500' : 'text-gray-500'
              }`}
            >
              {met ? <CheckCircle size={16} /> : <XCircle size={16} />}{' '}
              {key === 'length' && 'Use 8+ characters'}
              {key === 'uppercase' && 'Use upper & lower case letters'}
              {key === 'number' && 'Use a number (e.g., 1234)'}
              {key === 'symbol' && 'Use a symbol (e.g., !@#$)'}
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={toStepTwo}
        disabled={isLoading}
        className="w-full p-3 mx-auto bg-[#1D5C5C] text-white font-semibold rounded-md flex items-center justify-center gap-2"
      >
        {isLoading ? 'Processing...' : 'Reset Password'}
      </button>
    </div>
  );
}
