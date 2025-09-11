import { memo } from "react";
import { cn } from "@/utils/cn";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  text?: string;
  variant?: "default" | "minimal" | "full";
}

const CribXpertLogo = ({
  size = "md",
  className,
}: {
  size?: string;
  className?: string;
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "w-8 h-8";
      case "lg":
        return "w-16 h-16";
      case "xl":
        return "w-24 h-24";
      default:
        return "w-12 h-12";
    }
  };

  return (
    <div className={cn("relative", getSizeClasses(), className)}>
      <svg
        viewBox='0 0 319 359'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        className='w-full h-full'
      >
        {/* Main house structure */}
        <path
          d='M190.696 325.263C203.3 332.824 195.948 341.015 190.696 344.165C131.245 344.795 11.2095 345.677 6.67197 344.165C2.13439 342.653 1 338.074 1 335.974V129.313C50.9973 88.3587 151.874 5.69419 155.404 2.66988C158.933 -0.354433 162.756 1.40975 164.227 2.66988L318 129.313V174.048C316.487 192.697 305.186 181.818 299.724 174.048V139.394L158.555 24.7221L19.9066 137.504V325.263H190.696Z'
          fill='#006073'
          stroke='#006073'
          className='animate-pulse'
        />

        {/* Decorative elements */}
        <path
          d='M75.1828 191.403C95.8584 189.885 108.997 210.588 112.982 221.13H169.065C183.18 163.952 228.297 155.561 249.092 158.512C315.255 177.488 313.365 206.583 313.995 242.003C314.625 277.423 252.872 350.793 248.462 356.486C244.933 361.04 239.85 358.383 237.749 356.486C201.958 325.619 177.047 267.303 169.065 242.003H147.01V260.345C139.449 269.959 133.357 264.351 131.257 260.345V242.003H111.723C102.649 268.821 80.6414 273.417 70.7719 272.363C34.9876 268.821 31.9107 236.732 34.8453 221.13C44.2973 200.89 49.3383 193.3 75.1828 191.403Z'
          fill='#C18B3F'
          className='animate-pulse'
          style={{ animationDelay: "0.2s" }}
        />

        {/* Windows */}
        <path
          d='M150.376 150H127.255C124.083 150.517 123.291 153.66 123.292 155.167C123.072 162.056 122.763 176.35 123.292 178.417C123.82 180.483 126.154 181 127.255 181H150.376C153.547 181 154.78 179.278 155 178.417V155.167C155 152.067 151.917 150.431 150.376 150Z'
          fill='#006073'
          stroke='#006073'
          className='animate-pulse'
          style={{ animationDelay: "0.4s" }}
        />
        <path
          d='M150.376 110H127.255C124.083 110.517 123.291 113.66 123.292 115.167C123.072 122.056 122.763 136.35 123.292 138.417C123.82 140.483 126.154 141 127.255 141H150.376C153.547 141 154.78 139.278 155 138.417V115.167C155 112.067 151.917 110.431 150.376 110Z'
          fill='#006073'
          stroke='#006073'
          className='animate-pulse'
          style={{ animationDelay: "0.6s" }}
        />
        <path
          d='M190.52 110H168.122C165.049 110.517 164.282 113.66 164.283 115.167C164.069 122.056 163.771 136.35 164.283 138.417C164.795 140.483 167.056 141 168.122 141H190.52C193.592 141 194.787 139.278 195 138.417V115.167C195 112.067 192.014 110.431 190.52 110Z'
          fill='#006073'
          stroke='#006073'
          className='animate-pulse'
          style={{ animationDelay: "0.8s" }}
        />
      </svg>
    </div>
  );
};

const LoadingDots = () => (
  <div className='flex space-x-1'>
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className='w-2 h-2 bg-primary-600 rounded-full animate-bounce'
        style={{ animationDelay: `${i * 0.1}s` }}
      />
    ))}
  </div>
);

const SpinnerRing = ({ size }: { size: string }) => {
  const getSizeClass = () => {
    switch (size) {
      case "sm":
        return "w-6 h-6";
      case "lg":
        return "w-20 h-20";
      case "xl":
        return "w-28 h-28";
      default:
        return "w-16 h-16";
    }
  };

  return (
    <div className='relative'>
      <div
        className={cn(
          "animate-spin rounded-full border-3 border-gray-200 border-t-primary-600 border-r-primary-400",
          getSizeClass()
        )}
      />
      <div
        className={cn(
          "absolute inset-2 animate-spin rounded-full border-2 border-transparent border-b-amber-500 border-l-amber-400",
          "animation-direction-reverse"
        )}
        style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
      />
    </div>
  );
};

export const LoadingSpinner = memo(function LoadingSpinner({
  size = "md",
  className,
  text = "Loading...",
  variant = "default",
}: LoadingSpinnerProps) {
  const getContainerClass = () => {
    switch (variant) {
      case "minimal":
        return "flex items-center justify-center p-4";
      case "full":
        return "flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-primary-50 to-primary-100";
      default:
        return "flex flex-col items-center justify-center min-h-[200px] space-y-6";
    }
  };

  const renderLoader = () => {
    switch (variant) {
      case "minimal":
        return (
          <div className='flex items-center space-x-3'>
            <div className='animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-primary-600' />
            {text && <span className='text-sm text-gray-600'>{text}</span>}
          </div>
        );
      case "full":
        return (
          <>
            <div className='relative'>
              <SpinnerRing size={size} />
              <div className='absolute inset-0 flex items-center justify-center'>
                <CribXpertLogo size={size} />
              </div>
            </div>
            <div className='text-center space-y-2'>
              {text && (
                <p className='text-lg font-medium text-primary-700'>{text}</p>
              )}
              <LoadingDots />
            </div>
          </>
        );
      default:
        return (
          <>
            <div className='relative'>
              <SpinnerRing size={size} />
              <div className='absolute inset-0 flex items-center justify-center'>
                <CribXpertLogo size={size} />
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className={cn(getContainerClass(), className)}>{renderLoader()}</div>
  );
});
