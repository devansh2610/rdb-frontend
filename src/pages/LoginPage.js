import React, { useState, useEffect, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const LoginPage = () => {
  const { login, googleLogin, handleOAuthCallback, getProfile } = useAuth();
  const [success, setSuccess] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const recaptchaRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  // Check for token in URL (from OAuth callback)
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get("token");

    if (token) {
      const processToken = async () => {
        try {
          setLoading(true);
          const success = await handleOAuthCallback(token);
          if (success) {
            navigateAccordingToRole();
          } else {
            setSubmitError("Failed to authenticate with Google");
          }
        } catch (error) {
          console.error("Error processing OAuth callback:", error);
          setSubmitError("Authentication error");
        } finally {
          setLoading(false);
        }
      };

      processToken();

      // Clean up URL
      window.history.replaceState({}, document.title, location.pathname);
    }
  }, [location]);

  const navigateAccordingToRole = () => {
    const userInfo = getProfile();

    // Check for the redirect flag
    const shouldRedirectToAdmin =
      localStorage.getItem("redirectToAdmin") === "true";
    if (shouldRedirectToAdmin) {
      localStorage.removeItem("redirectToAdmin"); // Clear the flag
      navigate("/admin");
      return;
    }

    // Fallback navigation based on role
    navigate(
      (() => {
        if (
          userInfo &&
          (userInfo.accessLevel === 0 || userInfo.accessLevel === 1)
        ) {
          return "/admin";
        }
        return "/";
      })()
    );
  };

  const onSubmit = async (data) => {
    try {
      // console.log(data);
      setLoading(true); // to avoid multiple submission
      const captchaToken = recaptchaRef.current.getValue();
      if (!captchaToken) {
  setSubmitError("Please verify that you are not a robot");
  setLoading(false);
  return;
}
      recaptchaRef.current.reset();
      const response = await login(data, captchaToken);
      setLoading(false);

      if (response.status == 200) {
        setSuccess(true);
        reset();
      }

      navigateAccordingToRole();
    } catch (err) {
      console.log(err);
      if (!err?.response) {
        setSubmitError("No response from server");
      } else if (err.response?.status == 400) {
        setSubmitError(
          "Missing username or password, or captcha needs to be completed"
        );
      } else if (err.response?.status == 401) {
        setSubmitError("Unauthorized access, please recheck credentials");
      } else if (err.response?.status == 406) {
        setSubmitError("Please verify your account through email");
      } else {
        setSubmitError("Unable to login, please try again");
      }
      setSuccess(false);
      setLoading(false);
    }
  };

  const handleGoogleLoginClick = (e) => {
    e.preventDefault();
    googleLogin();
  };

  const onError = async () => {
    console.log("Func: onError, FIle: LoginPage.js");
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left: Login Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center bg-white py-8 sm:py-12 px-4 sm:px-6 md:px-8">
        <div className="max-w-md w-full">
          <h1
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 md:mb-10 text-center tracking-wider"
            style={{ fontFamily: "monospace" }}
          >
            Login to Your Account
          </h1>

          <form
            className="space-y-4 sm:space-y-5 md:space-y-6"
            onSubmit={handleSubmit(onSubmit, onError)}
          >
            {/* Email Field */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 uppercase tracking-wide">
                EMAIL
              </label>
              <input
                type="email"
                placeholder="Your email"
                className={`w-full px-4 sm:px-6 md:px-7 py-3 sm:py-3.5 md:py-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-lime-300 text-sm sm:text-base bg-white placeholder-gray-400 ${errors.email ? "border-red-500" : ""
                  }`}
                {...register("email", {
                  required: true,
                  pattern: /^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/,
                })}
                autoComplete="email"
              />
              {errors.email && (
                <p className="text-red-500 text-xs sm:text-sm mt-1">
                  {errors.email.type === "required"
                    ? "Email is required"
                    : "Enter valid email ID"}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 uppercase tracking-wide">
                PASSWORD
              </label>
              <div className="relative">
                <input
                  type={passwordVisible ? "text" : "password"}
                  placeholder="Your password"
                  className={`w-full px-4 sm:px-6 md:px-7 py-3 sm:py-3.5 md:py-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-lime-300 text-sm sm:text-base bg-white placeholder-gray-400 pr-12 sm:pr-14 ${errors.password ? "border-red-500" : ""
                    }`}
                  {...register("password", {
                    required: true,
                    minLength: 8,
                  })}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  aria-label={
                    passwordVisible ? "Hide password" : "Show password"
                  }
                  className="absolute right-4 sm:right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 focus:outline-none"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  tabIndex={0}
                >
                  {passwordVisible ? (
                    <FaEyeSlash size={20} className="sm:w-[22px] sm:h-[22px]" />
                  ) : (
                    <FaEye size={20} className="sm:w-[22px] sm:h-[22px]" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs sm:text-sm mt-1">
                  {errors.password.type === "required"
                    ? "Password is required"
                    : "Password should be at least 8 characters long"}
                </p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="text-left">
              <Link
                to="/forgot"
                className="text-blue-600 hover:underline text-xs sm:text-sm"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Submit Error */}
            {submitError && (
              <div className="text-red-600 text-center text-xs sm:text-sm mt-2 px-2">
                {submitError}
              </div>
            )}

            {/* Submit Button and Google Auth */}
            <div className="flex flex-col gap-3 sm:gap-4 mt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full px-12 py-3 sm:py-3.5 rounded-full bg-lime-300 hover:bg-lime-400 text-black font-semibold text-sm sm:text-base transition-colors duration-200 shadow focus:outline-none focus:ring-2 focus:ring-lime-400 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? "Logging In..." : "Log In"}
              </button>
              {/* Google Auth Button - Commented out as requested */}
              { <button
                type="button"
                onClick={handleGoogleLoginClick}
                className="w-full flex items-center justify-center px-6 sm:px-8 py-3 sm:py-3.5 rounded-full border border-gray-200 bg-white hover:bg-gray-100 text-gray-700 font-medium text-sm sm:text-base transition-colors duration-200 shadow focus:outline-none"
              >
                <img
                  src="/assets/google.svg"
                  alt="Google"
                  className="w-5 h-5 sm:w-6 sm:h-6 mr-2"
                />
                <span className="whitespace-nowrap">Continue with Google</span>
              </button> }
            </div>

            {/* reCAPTCHA */}
            <div className="flex justify-center mt-4 sm:mt-6">
              <div className="transform scale-[0.85] sm:scale-100 origin-center">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey="6LesjUksAAAAAIY4RMiAYBbkVLCSJKxD9UTKXI9X"
                />
              </div>
            </div>

            {/* Sign up Link */}
            <div className="text-center text-xs sm:text-sm mt-4 sm:mt-6">
              Don't have an Account?{" "}
              <Link to="/signup" className="text-green-500 hover:underline font-medium">
                Sign up
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Right: Branding Section */}
      <div className="hidden md:flex w-1/2 bg-[#222] flex-col justify-center items-center relative overflow-hidden">
        <img
          src="/assets/auth-assest01.svg"
          alt="Foodoscope Branding"
          className="w-[320px] lg:w-[420px] max-w-[90%] h-auto"
        />
      </div>
    </div>
  );
};

export default LoginPage;
