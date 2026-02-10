import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import AuthorizationPage from "./AuthorizationPage";
import { Alert, Spinner } from "flowbite-react";

export default function VerificationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyEmail } = useAuth();
  const [verificationStatus, setVerificationStatus] = useState("loading"); // loading, success, error
  const [errorMessage, setErrorMessage] = useState("");
  
  // Get token from URL path - format: /verify/token
  const pathname = location.pathname;
  
  // Extract token from path carefully
  // Handle various formats: /verify/token, /verify/something/token, etc.
  let token = "";
  if (pathname.startsWith("/verify/")) {
    token = pathname.substring("/verify/".length);
  }
  
  console.log("Verification path:", pathname);
  console.log("Extracted token:", token);

  useEffect(() => {
    if (!token) {
      setVerificationStatus("error");
      setErrorMessage("Invalid verification link. No token found.");
      return;
    }

    // Call verification endpoint with the token
    const verify = async () => {
      try {
        console.log("Attempting to verify with token:", token);
        const result = await verifyEmail(token);
        console.log("Verification result:", result);
        if (result.success) {
          setVerificationStatus("success");
          // Redirect to login after showing the animation
          setTimeout(() => {
            navigate("/login");
          }, 3000);
        } else {
          setVerificationStatus("error");
          setErrorMessage(result.message);
          console.error("Verification error:", result.message);
        }
      } catch (error) {
        setVerificationStatus("error");
        const errorMsg = error?.response?.data?.error || "Verification failed. Please try again.";
        setErrorMessage(errorMsg);
        console.error("Verification exception:", errorMsg);
      }
    };

    verify();
  }, [token, navigate, verifyEmail]);

  const renderSuccessAnimation = () => {
    return (
      <motion.div
        className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="relative flex flex-col items-center">
          {/* Container for the animation */}
          <div className="relative">
            {/* Outer circle with radial gradient */}
            <motion.div
              className="w-40 h-40 rounded-full bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Middle circle with shadow */}
              <motion.div 
                className="w-32 h-32 rounded-full bg-white dark:bg-gray-800 shadow-lg dark:shadow-black/30 flex items-center justify-center"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                {/* Inner circle with check mark */}
                <motion.div 
                  className="w-24 h-24 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.4, type: "spring" }}
                >
                  <motion.div
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.6, ease: "easeOut" }}
                  >
                    <svg className="w-16 h-16 text-white" viewBox="0 0 24 24">
                      <motion.path
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ delay: 0.6, duration: 0.6 }}
                      />
                    </svg>
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>
            
            {/* Particles flying outward */}
            {[...Array(12)].map((_, i) => {
              const angle = (i * (2 * Math.PI)) / 12;
              const distance = 80;
              
              return (
                <motion.div
                  key={`particle-${i}`}
                  className="absolute w-2 h-2 rounded-full bg-green-400"
                  style={{ 
                    top: "50%",
                    left: "50%",
                  }}
                  initial={{ x: 0, y: 0, opacity: 0 }}
                  animate={{ 
                    x: Math.cos(angle) * distance,
                    y: Math.sin(angle) * distance,
                    opacity: [0, 1, 0],
                  }}
                  transition={{ 
                    delay: 0.7, 
                    duration: 0.8,
                    ease: "easeOut"
                  }}
                />
              );
            })}
          </div>
          
          {/* Success text - separated from the animation container and positioned lower */}
          <motion.div
            className="mt-20 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Verification Completed!
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              You'll be redirected to login in a moment...
            </p>
          </motion.div>
        </div>
      </motion.div>
    );
  };

  const renderLoading = () => {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <Spinner size="xl" className="mb-4" />
        <p className="text-gray-700 dark:text-gray-300">Verifying your email...</p>
      </div>
    );
  };

  const renderError = () => {
    const isNotFound = errorMessage.includes("not found") || errorMessage.includes("expired");
    const isAlreadyVerified = errorMessage.toLowerCase().includes("already verified");
    const isUnauthorized = errorMessage.toLowerCase().includes("unauthorized");
    
    // If already verified, show different message and actions
    if (isAlreadyVerified) {
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    }
    
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className={`mb-4 ${isAlreadyVerified ? "text-green-500" : "text-red-500"}`}>
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            {isAlreadyVerified ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            )}
          </svg>
        </div>
        
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          {isAlreadyVerified ? "Already Verified" : 
           isUnauthorized ? "Verification Failed" :
           isNotFound ? "Page Not Found" : 
           "Verification Failed"}
        </h2>
        
        <Alert color={isAlreadyVerified ? "success" : "failure"} className="mb-4 w-full">
          {errorMessage}
        </Alert>
        
        <div className="text-gray-700 dark:text-gray-300 mt-2 mb-6 text-center">
          {isAlreadyVerified ? (
            <p>You'll be redirected to the login page in a moment.</p>
          ) : isUnauthorized ? (
            <>
              <p>Your verification link is no longer valid.</p>
              <p className="mt-2">This can happen if:</p>
              <ul className="list-disc list-inside mt-1 mb-2 text-left">
                <li>The link has expired</li>
                <li>The account has already been verified</li>
                <li>The link was used on another device</li>
              </ul>
              <p className="mt-3 font-medium">What to do next?</p>
              <p className="mt-1">Sign up again to receive a new verification email or try logging in if you believe your account is already active.</p>
            </>
          ) : isNotFound ? (
            <>
              <p>The verification link has expired or is no longer valid.</p>
              <p className="mt-2">Please request a new verification email by signing up again.</p>
            </>
          ) : (
            <p>Please try again or contact support if the issue persists.</p>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {!isNotFound && !isAlreadyVerified && !isUnauthorized && (
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry Verification
            </button>
          )}
          
          {!isAlreadyVerified && (
            <button 
              onClick={() => navigate('/signup')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign Up Again
            </button>
          )}
          
          <button 
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  };

  return (
    <AuthorizationPage>
      <AnimatePresence mode="wait">
        {verificationStatus === "loading" && renderLoading()}
        {verificationStatus === "success" && renderSuccessAnimation()}
        {verificationStatus === "error" && renderError()}
      </AnimatePresence>
    </AuthorizationPage>
  );
}
