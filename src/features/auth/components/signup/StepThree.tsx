import React, { useState } from 'react';
import { EyeOff, Eye, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router';

const StepThree: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Password validation
  const passwordCriteria = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    number: /\d/.test(formData.password),
    symbol: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
  };

  return (
    <div className="relative w-1/2 flex flex-col items-center justify-center p-8">
      <p className="text-gray-500 text-sm mb-2 fixed top-4 right-4">
        STEP 03/03
      </p>

      <div className="w-full max-w-[512px] text-center">
        <h2 className="text-[36px] font-bold mb-4">Additional Details</h2>
        <p className="text-[#313131] mb-6">
          Just a little more information, and you’ll be ready to explore
        </p>

        {/* Form */}
        <div className="w-full space-y-4 px-2 overflow-y-scroll max-h-[60vh] custom-scrollbar">
          {/* First Name */}
          <div>
            <label className="block text-left text-gray-700 font-medium mb-1">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Enter your first name"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1D5C5C]"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-left text-gray-700 font-medium mb-1">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Enter your last name"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1D5C5C]"
            />
          </div>

          {/* Date of Birth */}
          <div className="relative">
            <label className="block text-left text-gray-700 font-medium mb-1">
              Date of Birth
            </label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-[#1D5C5C]"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-left text-gray-700 font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1D5C5C]"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <label className="block text-left text-gray-700 font-medium mb-1">
              Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
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

          {/* Password Requirements */}
          <ul className="text-sm grid grid-cols-2 mt-2">
            {Object.entries(passwordCriteria).map(([key, met]) => (
              <li
                key={key}
                className={`flex items-center gap-2 ${met ? 'text-green-500' : 'text-gray-500'}`}
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

        {/* Submit Button */}
        <Link to="/">
          <button className="w-full mx-auto max-w-[422px] p-3 bg-[#1D5C5C] text-white font-semibold rounded-md flex items-center justify-center gap-2 mt-4">
            Complete My Profile
          </button>
        </Link>
      </div>
    </div>
  );
};

export default StepThree;
