import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import { HiOutlineMailOpen, HiOutlineClock, HiOutlineRefresh } from "react-icons/hi";
import { motion } from "framer-motion";

export default function Validate({ email }) {
  const [counter, setCounter] = useState(30); // countdown timer set to 30 seconds
  const [showResend, setShowResend] = useState(false);

  const handleResend = async (email) => {
    setCounter(30);
    setShowResend(false);
    try {
      const response = await axios
        .post(`/verify`, { email })
        .catch(async (error) => {
          console.log(error);
        });
    } catch {
      console.log("ERROR: While resending mail");
    }
  };

  useEffect(() => {
    counter > 0
      ? setTimeout(() => setCounter(counter - 1), 1000)
      : (() => {
          setShowResend(true);
        })();
  }, [counter]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full flex flex-col items-center justify-center"
    >
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 w-full max-w-md">
        <div className="flex flex-col items-center text-center">
          {/* Mail icon with animation */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="bg-blue-100 dark:bg-blue-900 p-4 rounded-full mb-6"
          >
            <HiOutlineMailOpen className="w-12 h-12 text-blue-600 dark:text-blue-400" />
          </motion.div>
          
          <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">Verification Email Sent!</h2>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            We've sent a verification link to: <br />
            <span className="font-medium text-blue-600 dark:text-blue-400">{email}</span>
          </p>
          
          <div className="w-full bg-blue-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              Please check your inbox and click the verification link to complete your registration. If you don't see it, check your spam folder too.
            </p>
          </div>
          
          {/* Timer or Resend section */}
          <div className="flex items-center justify-center w-full">
            {!showResend ? (
              <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                <HiOutlineClock className="w-5 h-5" />
                <span>Resend available in</span>
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 font-bold px-3 py-1 rounded-full">
                  {counter}s
                </span>
              </div>
            ) : (
              <button
                onClick={() => handleResend(email)}
                className="flex items-center space-x-2 text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors duration-200"
              >
                <HiOutlineRefresh className="w-5 h-5" />
                <span>Resend Email</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
