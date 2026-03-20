import { CheckCircle } from 'lucide-react';

export default function StepTwo() {
  return (
    <div className="w-full max-w-md text-center space-y-2">
      {/* Check Icon */}
      <CheckCircle className="w-48 h-48 mx-auto text-[#1D5C5C] stroke-[1.5]" />
      <h2 className="text-[36px] font-bold mb-4">Successfully</h2>

      <div className="space-y-6">
        <p className="text-[#313131] mb-6">
          Your password has been reset successfully
        </p>
      </div>

      <a
        href="/login"
        className="w-full max-w-[422px] p-3 mx-auto bg-[#1D5C5C] text-white font-semibold rounded-md flex items-center justify-center gap-2 mt-12"
      >
        <button>Login</button>
      </a>
    </div>
  );
}
