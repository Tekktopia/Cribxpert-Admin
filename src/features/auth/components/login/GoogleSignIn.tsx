import { FcGoogle } from 'react-icons/fc';
import { useState } from 'react';


export default function GoogleSignIn() {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleLogin = () => {
    window.location.href = 
      "https://cribxpert-backend.onrender.com/auth/google";
    setIsGoogleLoading(true);
  };

  return (
    <button
      className="w-full p-3 border border-gray-300 text-[#1D5C5C] font-semibold rounded-md flex items-center justify-center gap-2 mb-3"
      onClick={handleGoogleLogin}
      disabled={isGoogleLoading}
    >
      <span>{isGoogleLoading ? 'Redirecting...' : 'Sign In with Google'}</span>
      <FcGoogle className="w-5 h-5" />
    </button>
  );
}
