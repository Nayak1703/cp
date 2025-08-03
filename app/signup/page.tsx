"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { signIn, signOut, getSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowLeft,
  CheckCircle,
  Loader2,
  Shield,
  Building2,
} from "lucide-react";

// Form validation schema
const signupSchema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

type SignupFormData = z.infer<typeof signupSchema>;
type OTPFormData = z.infer<typeof otpSchema>;

function SignupPageContent() {
  const [step, setStep] = useState<"signup" | "otp" | "success">("signup");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  // Signup form
  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // OTP form
  const otpForm = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  // Handle Google OAuth signup callback
  useEffect(() => {
    const handleGoogleSignupCallback = async () => {
      const session = await getSession();

      if (session?.user?.email) {
        console.log(
          "Google OAuth signup callback - User authenticated:",
          session.user
        );

        try {
          // Call the signup API to create candidate account
          const response = await fetch("/api/auth/google-signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });

          const result = await response.json();

          if (result.success) {
            console.log("Google OAuth signup successful");
            // Sign out to clear session and redirect to login
            await signOut({ redirect: false });
            router.push("/login");
          } else {
            setError(result.error || "Signup failed");
          }
        } catch (error) {
          setError("Failed to complete signup");
        }
      }
    };

    handleGoogleSignupCallback();
  }, [router]);

  // Handle Google OAuth signup
  const handleGoogleSignup = async () => {
    try {
      setLoading(true);
      setError("");

      // Use NextAuth for Google OAuth but redirect to signup page
      await signIn("google", { callbackUrl: "/signup" });
    } catch (error) {
      setError("Google signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle email/password signup
  const onSignupSubmit = async (data: SignupFormData) => {
    try {
      setLoading(true);
      setError("");

      // Check if email exists
      const emailCheckResponse = await fetch("/api/signup/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });

      const emailCheckResult = await emailCheckResponse.json();

      if (emailCheckResult.exists) {
        setError(emailCheckResult.message);
        return;
      }

      // Send OTP
      const otpResponse = await fetch("/api/signup/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });

      const otpResult = await otpResponse.json();

      if (!otpResult.success) {
        setError(otpResult.error || "Failed to send OTP");
        return;
      }

      // Store email and move to OTP step
      setEmail(data.email);
      setStep("otp");
    } catch (error) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP verification
  const onOTPSubmit = async (data: OTPFormData) => {
    try {
      setLoading(true);
      setError("");

      // Verify OTP
      const verifyResponse = await fetch("/api/signup/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: data.otp }),
      });

      const verifyResult = await verifyResponse.json();

      if (!verifyResult.success) {
        setError(verifyResult.message);
        return;
      }

      // Complete signup
      const signupData = signupForm.getValues();
      const completeResponse = await fetch("/api/signup/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupData),
      });

      const completeResult = await completeResponse.json();

      if (!completeResult.success) {
        setError(completeResult.error || "Signup failed");
        return;
      }

      setStep("success");
    } catch (error) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    try {
      setResendLoading(true);
      setError("");

      const response = await fetch("/api/signup/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || "Failed to resend OTP");
      }
    } catch (error) {
      setError("Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-8 sm:p-10">
          {/* Back Button */}
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Home</span>
          </button>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl backdrop-blur-sm">
              <p className="text-red-400 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Step 1: Signup Form */}
          {step === "signup" && (
            <>
              <div className="space-y-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="p-3 bg-blue-500/20 rounded-2xl">
                      <Building2 className="h-8 w-8 text-blue-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-white">
                      Create Account
                    </h2>
                  </div>
                  <p className="text-slate-400 text-lg">
                    Join thousands of professionals finding their dream jobs
                  </p>
                </div>

                {/* Google Signup Button */}
                <button
                  onClick={handleGoogleSignup}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-slate-700/50 hover:bg-slate-700/70 border border-slate-600/50 rounded-xl transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg
                    className="w-5 h-5 group-hover:scale-110 transition-transform"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="text-white font-medium">
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="animate-spin" size={16} />
                        Signing up...
                      </div>
                    ) : (
                      "Continue with Google"
                    )}
                  </span>
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-600/50" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-slate-800/50 text-slate-400">
                      Or continue with email
                    </span>
                  </div>
                </div>

                {/* Signup Form */}
                <form
                  onSubmit={signupForm.handleSubmit(onSignupSubmit)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-slate-300">
                        First Name
                      </label>
                      <div className="relative">
                        <User
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"
                          size={18}
                        />
                        <input
                          {...signupForm.register("firstName")}
                          type="text"
                          className="w-full pl-12 pr-4 py-4 bg-slate-700/30 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                          placeholder="John"
                        />
                      </div>
                      {signupForm.formState.errors.firstName && (
                        <p className="text-red-400 text-xs mt-1">
                          {signupForm.formState.errors.firstName.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-slate-300">
                        Last Name
                      </label>
                      <div className="relative">
                        <User
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"
                          size={18}
                        />
                        <input
                          {...signupForm.register("lastName")}
                          type="text"
                          className="w-full pl-12 pr-4 py-4 bg-slate-700/30 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                          placeholder="Doe"
                        />
                      </div>
                      {signupForm.formState.errors.lastName && (
                        <p className="text-red-400 text-xs mt-1">
                          {signupForm.formState.errors.lastName.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-slate-300">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"
                        size={18}
                      />
                      <input
                        {...signupForm.register("email")}
                        type="email"
                        className="w-full pl-12 pr-4 py-4 bg-slate-700/30 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                        placeholder="john@example.com"
                      />
                    </div>
                    {signupForm.formState.errors.email && (
                      <p className="text-red-400 text-xs mt-1">
                        {signupForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-slate-300">
                      Password
                    </label>
                    <div className="relative">
                      <Lock
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"
                        size={18}
                      />
                      <input
                        {...signupForm.register("password")}
                        type={showPassword ? "text" : "password"}
                        className="w-full pl-12 pr-12 py-4 bg-slate-700/30 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                    {signupForm.formState.errors.password && (
                      <p className="text-red-400 text-xs mt-1">
                        {signupForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-slate-300">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"
                        size={18}
                      />
                      <input
                        {...signupForm.register("confirmPassword")}
                        type={showConfirmPassword ? "text" : "password"}
                        className="w-full pl-12 pr-12 py-4 bg-slate-700/30 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                    {signupForm.formState.errors.confirmPassword && (
                      <p className="text-red-400 text-xs mt-1">
                        {signupForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-4 px-6 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin" size={20} />
                        Sending Verification Code...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <Shield size={20} />
                        Send Verification Code
                      </div>
                    )}
                  </button>
                </form>

                <p className="text-center text-sm text-slate-400">
                  Already have an account?{" "}
                  <a
                    href="/login"
                    className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                  >
                    Sign in
                  </a>
                </p>
              </div>
            </>
          )}

          {/* Step 2: OTP Verification */}
          {step === "otp" && (
            <>
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Mail className="text-blue-400" size={24} />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Verify Your Email
                  </h2>
                  <p className="text-slate-400 text-sm mb-2">
                    We&#39;ve sent a 6-digit verification code to
                  </p>
                  <p className="text-blue-400 font-medium">{email}</p>
                </div>

                <form
                  onSubmit={otpForm.handleSubmit(onOTPSubmit)}
                  className="space-y-6"
                >
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-slate-300 text-center">
                      Verification Code
                    </label>
                    <input
                      {...otpForm.register("otp")}
                      type="text"
                      maxLength={6}
                      className="w-full px-4 py-4 text-center text-2xl font-mono bg-slate-700/30 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 tracking-widest"
                      placeholder="000000"
                    />
                    {otpForm.formState.errors.otp && (
                      <p className="text-red-400 text-xs text-center mt-2">
                        {otpForm.formState.errors.otp.message}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-4 px-6 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin" size={20} />
                        Verifying...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle size={20} />
                        Verify & Create Account
                      </div>
                    )}
                  </button>
                </form>

                <div className="text-center space-y-4">
                  <button
                    onClick={handleResendOTP}
                    disabled={resendLoading}
                    className="text-blue-400 hover:text-blue-300 text-sm font-medium disabled:opacity-50 transition-colors"
                  >
                    {resendLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin" size={16} />
                        Sending...
                      </div>
                    ) : (
                      "Didn't receive the code? Resend"
                    )}
                  </button>

                  <button
                    onClick={() => setStep("signup")}
                    className="flex items-center justify-center gap-2 w-full text-slate-400 hover:text-slate-300 text-sm transition-colors"
                  >
                    <ArrowLeft size={16} />
                    Back to signup
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Step 3: Success */}
          {step === "success" && (
            <>
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto">
                  <CheckCircle className="text-green-400" size={32} />
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-white">
                    Welcome Aboard!
                  </h2>
                  <p className="text-slate-400">
                    Your account has been created successfully. You&#39;re now
                    ready to explore amazing career opportunities.
                  </p>
                </div>

                <button
                  onClick={() => router.push("/login")}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white py-4 px-6 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  Continue to Login
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-slate-500 text-xs">
            By creating an account, you agree to our{" "}
            <a
              href="#"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignupPageContent />
    </Suspense>
  );
}
