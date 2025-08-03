"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  AlertCircle,
  LogIn,
  Users,
  UserCheck,
  Building2,
  ArrowLeft,
} from "lucide-react";

// Form validation schema
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  userType: z.enum(["candidate", "hr"]),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginPageContent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"candidate" | "hr">(
    "candidate"
  );
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get error from URL (e.g., from failed OAuth)
  const urlError = searchParams.get("error");

  useEffect(() => {
    if (urlError) {
      switch (urlError) {
        case "Callback":
          setError("Authentication failed. Please try again.");
          break;
        case "OAuthSignin":
          setError("OAuth signin error. Please try again.");
          break;
        case "OAuthCallback":
          setError("OAuth callback error. Please try again.");
          break;
        case "OAuthCreateAccount":
          setError("Could not create OAuth account. Please try again.");
          break;
        case "EmailCreateAccount":
          setError("Could not create account with this email.");
          break;
        case "OAuthAccountNotLinked":
          setError(
            "Email already exists with different provider. Please sign in with your original method."
          );
          break;
        case "CredentialsSignin":
          setError(
            "Invalid email or password. Please check your credentials and selected role."
          );
          break;
        case "SessionRequired":
          setError("Please sign in to access this page.");
          break;
        case "NoCandidateAccount":
          setError(
            "No candidate account found with this email. Please sign up as a candidate first."
          );
          break;
        case "NoHRAccount":
          setError(
            "No HR account found with this email. Please contact your administrator."
          );
          break;
        case "AccountCreationFailed":
          setError(
            "Failed to create account. Please try again or contact support."
          );
          break;
        case "RoleSelectionRequired":
          setError("Please select your role (HR or Candidate) to continue.");
          break;
        default:
          setError("An authentication error occurred. Please try again.");
      }
    }
  }, [urlError]);

  // Handle Google OAuth callback
  useEffect(() => {
    const handleGoogleCallback = async () => {
      const session = await getSession();

      if (session?.user?.email && session?.user?.userType) {
        console.log(
          "Google OAuth callback - User authenticated:",
          session.user
        );

        // Redirect to appropriate dashboard based on user type
        if (session.user.userType === "hr") {
          router.push("/hr/dashboard");
        } else if (session.user.userType === "candidate") {
          router.push("/candidate/dashboard");
        }
      }
    };

    handleGoogleCallback();
  }, [router]);

  // Form setup
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      userType: "candidate",
    },
  });

  // Update form when role changes
  useEffect(() => {
    form.setValue("userType", selectedRole);
  }, [selectedRole, form]);

  // Handle redirect based on user type
  const handleRedirect = async () => {
    try {
      const session = await getSession();
      if (session?.user?.userType) {
        if (session.user.userType === "hr") {
          router.push("/hr/dashboard");
        } else if (session.user.userType === "candidate") {
          router.push("/candidate/dashboard");
        }
      } else {
        console.log("No user type found in session");
      }
    } catch (error) {
      console.error("Error getting session:", error);
    }
  };

  // Handle Google OAuth login
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await signIn("google", {
        redirect: false,
      });

      if (result?.url) {
        window.location.href = result.url;
      } else if (result?.error) {
        setError("Google sign in failed. Please try again.");
      }
    } catch (error) {
      setError("Google sign in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle email/password login
  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true);
      setError("");

      // Use custom login API that handles role selection
      const response = await fetch("/api/auth/role-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          userType: data.userType,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.error === "wrong_role") {
          setError(
            `This email is registered as a ${
              result.actualRole
            }. Please select "${
              result.actualRole === "hr" ? "HR" : "Candidate"
            }" and try again.`
          );
        } else if (result.error === "google_oauth") {
          setError(
            "This account was created with Google. Please sign in with Google."
          );
        } else if (result.error === "invalid_credentials") {
          setError("Invalid email or password. Please check your credentials.");
        } else if (result.error === "not_found") {
          setError(
            `No ${data.userType} account found with this email. Please check your email or contact support.`
          );
        } else {
          setError(result.message || "Login failed. Please try again.");
        }
        return;
      }

      // Success - now sign in with NextAuth
      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.ok) {
        setTimeout(handleRedirect, 1000);
      } else {
        setError("Authentication failed. Please try again.");
      }
    } catch (error) {
      setError("An error occurred during login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-8">
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-8 sm:p-10">
          {/* Back Button */}
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Home</span>
          </button>

          {/* Page Title */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-blue-500/20 rounded-2xl">
                <Building2 className="h-8 w-8 text-blue-400" />
              </div>
              <h2 className="text-3xl font-bold text-white">Login Page</h2>
            </div>
            <p className="text-slate-400 text-lg">
              Sign in to your account to continue
            </p>
          </div>

          {/* Role Selection */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-slate-300 mb-4">
              Select Your Role
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setSelectedRole("candidate")}
                className={`flex items-center justify-center gap-3 p-4 rounded-xl border transition-all duration-200 ${
                  selectedRole === "candidate"
                    ? "bg-blue-500/20 border-blue-500/50 text-blue-300"
                    : "bg-slate-700/30 border-slate-600/50 text-slate-400 hover:border-slate-500/70"
                }`}
              >
                <Users size={20} />
                <span className="font-medium">Candidate</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole("hr")}
                className={`flex items-center justify-center gap-3 p-4 rounded-xl border transition-all duration-200 ${
                  selectedRole === "hr"
                    ? "bg-purple-500/20 border-purple-500/50 text-purple-300"
                    : "bg-slate-700/30 border-slate-600/50 text-slate-400 hover:border-slate-500/70"
                }`}
              >
                <UserCheck size={20} />
                <span className="font-medium">HR</span>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <AlertCircle className="text-red-400 flex-shrink-0" size={20} />
                <p className="text-red-400 text-sm font-medium">{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Google Login Button */}
            <button
              onClick={handleGoogleLogin}
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
                    Signing in...
                  </div>
                ) : (
                  `Continue with Google as ${
                    selectedRole === "hr" ? "HR" : "Candidate"
                  }`
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

            {/* Login Form */}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                    {...form.register("email")}
                    type="email"
                    className="w-full pl-12 pr-4 py-4 bg-slate-700/30 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                    placeholder="Enter your email"
                    disabled={loading}
                  />
                </div>
                {form.formState.errors.email && (
                  <p className="text-red-400 text-xs mt-1">
                    {form.formState.errors.email.message}
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
                    {...form.register("password")}
                    type={showPassword ? "text" : "password"}
                    className="w-full pl-12 pr-12 py-4 bg-slate-700/30 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                    placeholder="Enter your password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {form.formState.errors.password && (
                  <p className="text-red-400 text-xs mt-1">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-600 rounded bg-slate-700"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-slate-400"
                  >
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a
                    href="#"
                    className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                  >
                    Forgot password?
                  </a>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 px-6 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] group ${
                  selectedRole === "candidate"
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    : "bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                } text-white`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={20} />
                    Signing In...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <LogIn size={20} />
                    Sign In as{" "}
                    {selectedRole === "candidate" ? "Candidate" : "HR"}
                    <ArrowRight
                      size={16}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </div>
                )}
              </button>
            </form>

            <div className="text-center space-y-4">
              {selectedRole === "candidate" && (
                <p className="text-sm text-slate-400">
                  Don&apos;t have an account?{" "}
                  <a
                    href="/signup"
                    className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                  >
                    Sign up as Candidate
                  </a>
                </p>
              )}

              {selectedRole === "hr" && (
                <div className="text-xs text-slate-500">
                  <p>HR accounts are created by administrators.</p>
                  <p>Contact IT support if you need account access.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-slate-500 text-xs">
            Protected by industry-standard security.{" "}
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

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
