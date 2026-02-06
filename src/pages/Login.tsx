import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useLoginMutation } from "@/api/features/auth/authApiSlice";
import { useAppDispatch } from "@/store/hooks";
import { loginSuccess, loginFailure } from "@/store/slices/authSlice";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, AlertCircle, Loader2, TrendingUp, Users, DollarSign, BarChart3, PieChart } from "lucide-react";
import { cn } from "@/utils/cn";

export function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [login, { isLoading, error }] = useLoginMutation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalError(null);

    // Basic client-side validation
    if (!email.trim() || !password.trim()) {
      setLocalError("Please enter both email and password");
      return;
    }

    try {
      const result = await login({
        email: email.trim(),
        password,
      }).unwrap();

      // Update Redux state with user data
      dispatch(
        loginSuccess({
          user: {
            id: result.user._id || result.user.id || "",
            _id: result.user._id,
            email: result.user.email,
            name: result.user.name || result.user.fullName || "",
            role: result.user.role || "",
            fullName: result.user.fullName,
            phoneNo: result.user.phoneNo,
            roles: result.user.roles,
            isVerified: result.user.isVerified,
            lastLogin: result.user.lastLogin,
            createdAt: result.user.createdAt,
            updatedAt: result.user.updatedAt,
          },
          token: result.accessToken,
        })
      );

      // Navigate to dashboard on success
      navigate("/dashboard");
    } catch (err: unknown) {
      // Handle error
      let errorMessage = "Login failed. Please check your credentials and try again.";
      
      if (err && typeof err === "object") {
        const error = err as { status?: number | string; originalStatus?: number; data?: { message?: string }; message?: string };
        
        if (error.status === 404 || error.originalStatus === 404) {
          errorMessage = "Backend server not found. Please ensure the backend is running on http://localhost:5000";
        } else if (error.status === "PARSING_ERROR" || error.status === "FETCH_ERROR") {
          errorMessage = "Unable to connect to the server. Please check if the backend is running.";
        } else if (error.data?.message) {
          errorMessage = error.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
      }
      
      setLocalError(errorMessage);
      dispatch(loginFailure(errorMessage));
    }
  };

  // Only show error if there's an actual error message
  const getErrorMessage = () => {
    if (localError) return localError;
    
    // Check if error exists and has a message
    if (error) {
      if ("data" in error && error.data) {
        const errorData = error.data as { message?: string };
        if (errorData?.message) {
          return errorData.message;
        }
      }
      // Fallback for other error types
      if ("message" in error && typeof error.message === "string") {
        return error.message;
      }
    }
    
    return null;
  };

  const displayError = getErrorMessage();

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left Column - Login Form */}
      <div className="w-full lg:w-[55%] flex flex-col bg-white">
        {/* Logo and Branding */}
        <div className="px-8 pt-8 pb-4">
          <div className="flex items-center gap-3">
            <img 
              src="/CribXpert.svg" 
              alt="CribXpert Logo" 
              className="h-10 w-auto"
            />
          </div>
        </div>

        {/* Login Form Container */}
        <div className="flex-1 flex items-center justify-center px-8 py-12">
          <div className="w-full max-w-md">
            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Welcome Back
              </h1>
              <p className="text-gray-600 text-base">
                Enter your email and password to access your account.
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label 
                  htmlFor="email" 
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="admin@cribxpert.com"
                    disabled={isLoading}
                    className={cn(
                      "w-full px-4 py-3 border rounded-lg",
                      "focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600",
                      "text-sm placeholder-gray-400 bg-white",
                      "disabled:bg-gray-50 disabled:cursor-not-allowed",
                      "transition-all duration-200",
                      focusedField === "email" ? "border-primary-600" : "border-gray-300"
                    )}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label 
                  htmlFor="password" 
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Enter your password"
                    disabled={isLoading}
                    className={cn(
                      "w-full px-4 pr-12 py-3 border rounded-lg",
                      "focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600",
                      "text-sm placeholder-gray-400 bg-white",
                      "disabled:bg-gray-50 disabled:cursor-not-allowed",
                      "transition-all duration-200",
                      focusedField === "password" ? "border-primary-600" : "border-gray-300"
                    )}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isLoading}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-600 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700">Remember Me</span>
                </label>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    // Forgot password functionality can be added here
                  }}
                  className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors focus:outline-none"
                >
                  Forgot Your Password?
                </button>
              </div>

              {/* Error Message */}
              {displayError && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600 flex-1">{displayError}</p>
                </div>
              )}

              {/* Log In Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className={cn(
                  "w-full py-3.5 rounded-lg font-semibold text-base",
                  "bg-primary-600 hover:bg-primary-700",
                  "text-white border-0 shadow-lg shadow-primary-600/30 hover:shadow-xl hover:shadow-primary-600/40",
                  "transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]",
                  "disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                )}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  "Log In"
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
              <span>Copyright © {new Date().getFullYear()} CribXpert Enterprises LTD.</span>
              <button
                type="button"
                className="text-primary-600 hover:text-primary-700 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  // Privacy policy functionality can be added here
                }}
              >
                Privacy Policy
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Promotional Section */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 relative overflow-hidden">
        {/* Decorative Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="flex flex-col justify-center px-12 py-16 relative z-10">
          {/* Headline */}
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            Effortlessly manage your team and operations.
          </h2>
          <p className="text-xl text-white/90 mb-12">
            Log in to access your CRM dashboard and manage your team.
          </p>

          {/* Dashboard Cards Preview */}
          <div className="grid grid-cols-2 gap-4 max-w-2xl">
            {/* Total Sales Card */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/80 text-sm font-medium">Total Sales</span>
                <DollarSign className="w-5 h-5 text-white/60" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">$189,374</div>
              <div className="text-sm text-white/70">Forecast Profit</div>
            </div>

            {/* Chat Performance Card */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/80 text-sm font-medium">Chat Performance</span>
                <TrendingUp className="w-5 h-5 text-white/60" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">00:01:30</div>
              <div className="h-8 bg-white/20 rounded mt-2"></div>
            </div>

            {/* Sales Overview Card */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 col-span-2">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/80 text-sm font-medium">Sales Overview</span>
                <BarChart3 className="w-5 h-5 text-white/60" />
              </div>
              <div className="flex items-end gap-2 h-16">
                {[40, 60, 45, 80, 55, 70, 65].map((height, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-white/30 rounded-t"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
              <div className="flex gap-4 mt-3 text-xs text-white/70">
                <span>Weekly</span>
                <span className="text-white/90 font-medium">Monthly</span>
              </div>
            </div>

            {/* Sales Categories Card */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/80 text-sm font-medium">Sales Categories</span>
                <PieChart className="w-5 h-5 text-white/60" />
              </div>
              <div className="text-xl font-bold text-white mb-2">6,248 Units</div>
              <div className="space-y-2">
                {[
                  { label: "Smartphones", color: "bg-primary-300" },
                  { label: "Laptops & PC", color: "bg-primary-400" },
                  { label: "Accessories", color: "bg-primary-500" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="text-sm text-white/80">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Product Transaction Card */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/80 text-sm font-medium">Product Transaction</span>
                <Users className="w-5 h-5 text-white/60" />
              </div>
              <div className="space-y-2">
                {[
                  { name: "Apple Watch Gen 10", date: "Jan 15", price: "$1,234" },
                  { name: "Apple iPhone 15", date: "Jan 14", price: "$899" },
                  { name: "Apple Macbook Pro", date: "Jan 13", price: "$2,499" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div>
                      <div className="text-white font-medium">{item.name}</div>
                      <div className="text-white/60">{item.date}</div>
                    </div>
                    <div className="text-white font-semibold">{item.price}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
}
