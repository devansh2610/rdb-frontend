import React, { useState, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const SignupPage = () => {
  const { signup, googleSignup } = useAuth();
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const recaptchaRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const captchaToken = recaptchaRef.current.getValue();
      if (!captchaToken) {
  setSubmitError("Please verify that you are not a robot");
  setLoading(false);
  return;
}
      recaptchaRef.current.reset();
      const response = await signup(data, captchaToken);
      setLoading(false);
      if (response.status === 200) {
        setSubmitError("");
        setEmail(data.email);
        reset();
        // Redirect to login page after successful signup
        setTimeout(() => {
          navigate("/login", {
            state: { message: "Account created successfully! Please log in." }
          });
        }, 1500);
      }
    } catch (error) {
      setSubmitError(error?.response?.data?.error || "Signup failed");
      setLoading(false);
    }
  };

  const handleGoogleSignupClick = (e) => {
    e.preventDefault();
    googleSignup();
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left: Signup Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center bg-white py-12 px-4 md:px-8">
        <div className="max-w-lg w-full">
          <h1 className="text-4xl md:text-3xl font-bold mb-10 text-center tracking-wider" style={{ fontFamily: 'monospace' }}>
            Create Your Account
          </h1>
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <input
              type="text"
              placeholder="Your name"
              className={`w-full px-7 py-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-lime-300 text-base bg-white placeholder-gray-400 ${errors.name ? 'border-red-500' : ''}`}
              {...register("name", { required: true, minLength: 2 })}
              autoComplete="name"
            />
            <input
              type="email"
              placeholder="Your email"
              className={`w-full px-7 py-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-lime-300 text-base bg-white placeholder-gray-400 ${errors.email ? 'border-red-500' : ''}`}
              {...register("email", { required: true, pattern: /^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/ })}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Your password"
                className={`w-full px-7 py-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-lime-300 text-base bg-white placeholder-gray-400 pr-14 ${errors.password ? 'border-red-500' : ''}`}
                {...register("password", {
                  required: true,
                  minLength: 8,
                  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/,
                })}
                autoComplete="new-password"
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 focus:outline-none"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={0}
              >
                {showPassword ? <FaEyeSlash size={22} /> : <FaEye size={22} />}
              </button>
            </div>
            <div className="flex flex-col gap-3 sm:gap-4 mt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full px-12 py-3 rounded-full bg-lime-300 hover:bg-lime-400 text-black font-semibold text-base transition-colors duration-200 shadow focus:outline-none focus:ring-2 focus:ring-lime-400"
              >
                {loading ? "Signing Up..." : "Sign Up"}
              </button>
              {/* Google Auth Button - Commented out as requested */}
              {<button
                type="button"
                onClick={handleGoogleSignupClick}
                className="w-full md:w-auto flex items-center justify-center px-8 py-3 rounded-full border border-gray-200 bg-white hover:bg-gray-100 text-gray-700 font-medium text-base transition-colors duration-200 shadow focus:outline-none"
              >
                <img src="/assets/google.svg" alt="Google" className="w-6 h-6 mr-2" />
                Continue with Google
              </button> }
            </div>
            <div className="flex justify-center mt-2">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey="6LesjUksAAAAAIY4RMiAYBbkVLCSJKxD9UTKXI9X"
              />
            </div>
            {submitError && (
              <div className="text-red-600 text-center text-sm mt-2">{submitError}</div>
            )}
            <div className="text-center text-xs text-gray-500 mt-2">
              By signing up you agree to Our{' '}
              <a href="/termsandcondition" className="text-blue-600 hover:underline">Terms</a> and{' '}
              <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>
            </div>
            <div className="text-center text-sm mt-2">
              Do you have an Account?{' '}
              <Link to="/login" className="text-green-500 hover:underline">Log In</Link>
            </div>
          </form>
        </div>
      </div>
      {/* Right: Branding Section (SVG only, no text) */}
      <div className="hidden md:flex w-1/2 bg-[#222] flex-col justify-center items-center relative">
        <img src="/assets/auth-assest01.svg" alt="Branding" className="w-[420px] max-w-[90%] h-auto" />
      </div>
    </div>
  );
};

export default SignupPage;
