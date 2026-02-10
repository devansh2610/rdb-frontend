import React, { useState } from "react";
import { Modal } from "flowbite-react";
import {
  KeyIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";

const ChangePasswordModal = ({ isOpen, onClose, onPasswordChange }) => {
  const { updatePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords don't match");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    // Check password strength
    if (passwordStrength < 2) {
      setError("Please choose a stronger password");
      return;
    }

    console.log("Submitting password change request");
    setIsSubmitting(true);

    try {
      // Call the updatePassword function from AuthContext
      const response = await updatePassword(currentPassword, newPassword);
      console.log("Password change response:", response);

      if (response && response.success) {
        setShowSuccess(true);

        setTimeout(() => {
          onPasswordChange();
          onClose();

          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
          setPasswordStrength(0);
          setShowSuccess(false);
        }, 1500);
      } else {
        setError(
          response?.message || "Failed to change password. Please try again."
        );
      }
    } catch (err) {
      console.error("Error changing password:", err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to change password. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const checkPasswordStrength = (password) => {
    if (!password) return 0;
    let strength = 0;

    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;

    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    return Math.min(strength, 4);
  };

  const handlePasswordChange = (e) => {
    const newPass = e.target.value;
    setNewPassword(newPass);
    setPasswordStrength(checkPasswordStrength(newPass));
  };

  const getStrengthColor = () => {
    switch (passwordStrength) {
      case 0:
        return "bg-gray-700";
      case 1:
        return "bg-red-500";
      case 2:
        return "bg-orange-500";
      case 3:
        return "bg-yellow-500";
      case 4:
        return "bg-green-500";
      default:
        return "bg-gray-700";
    }
  };

  const getStrengthText = () => {
    switch (passwordStrength) {
      case 0:
        return "";
      case 1:
        return "Weak";
      case 2:
        return "Fair";
      case 3:
        return "Good";
      case 4:
        return "Strong";
      default:
        return "";
    }
  };

  return (
    <Modal
      show={isOpen}
      onClose={onClose}
      size="md"
      className="rounded-xl overflow-hidden shadow-2xl"
      theme={{
        root: {
          base: "fixed top-0 right-0 left-0 z-50 h-modal h-screen overflow-y-auto overflow-x-hidden md:inset-0 md:h-full",
          show: {
            on: "flex bg-gray-900 bg-opacity-50 dark:bg-opacity-80",
            off: "hidden",
          },
        },
        content: {
          base: "relative h-full w-full p-6 md:h-auto",
          inner:
            "relative rounded-[28px] shadow-xl flex flex-col max-h-[90vh] bg-[#5A5A5A] border-0",
        },
        header: {
          base: "flex items-center justify-between rounded-t-[28px] px-7 py-5 bg-[#C8FF5A] border-0",
          popup: "p-2 border-b-0",
          title: "text-xl font-bold text-black",
          close: {
            base: "ml-auto inline-flex items-center rounded-lg bg-[#5A5A5A] p-2 text-sm text-white hover:bg-[#4A4A4A]",
            icon: "h-5 w-5",
          },
        },
        body: {
          base: "px-7 pt-7 pb-8 flex-1 overflow-auto bg-[#5A5A5A]",
          popup: "pt-0",
        },
        footer: {
          base: "flex items-center justify-center gap-4 rounded-b-[28px] px-7 py-5 bg-[#C8FF5A] border-0",
          popup: "border-t-0",
        },
      }}
    >
      <div
        className="flex items-center justify-between rounded-t-[28px] px-7 py-5"
        style={{
          backgroundColor: "#C8FF5A",
          borderBottom: "none",
        }}
      >
        <div className="flex items-center gap-3">
          <ShieldCheckIcon className="h-6 w-6 text-black" />
          <h3 className="text-xl font-bold text-black">Change password</h3>
        </div>
        <button
          onClick={onClose}
          className="ml-auto inline-flex items-center rounded-lg bg-[#5A5A5A] p-2 text-sm text-white hover:bg-[#4A4A4A]"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
      <div
        className="px-7 pt-6 pb-8"
        style={{
          backgroundColor: "#5A5A5A",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        {showSuccess ? (
          <div className="flex flex-col items-center justify-center py-10 animate-fadeIn">
            <div className="bg-green-900/30 p-4 rounded-full mb-4 animate-pulse">
              <CheckCircleIcon className="h-14 w-14 text-green-500" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">
              Password Updated Successfully!
            </h3>
            <p className="text-gray-400 text-center">
              Your password has been updated securely.
            </p>
          </div>
        ) : (
          <>
            {error && (
              <div className="flex p-4 mb-6 text-red-400 bg-red-900/20 border-l-4 border-red-500 rounded-lg shadow-sm animate-fadeIn">
                <ExclamationTriangleIcon className="h-6 w-6 mr-3 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label htmlFor="current-password" className="sr-only">
                  Current password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    id="current-password"
                    className="w-full h-12 pl-10 pr-12 rounded-xl text-gray-700 bg-[#CDCDCD] border-0 transition-all duration-200 outline-none placeholder-gray-500"
                    style={{
                      backgroundColor: "#CDCDCD",
                      boxShadow: "none",
                    }}
                    placeholder="Enter your current password"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                    <LockClosedIcon className="h-5 w-5 text-gray-600" />
                  </div>
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 transition-colors duration-150 z-10"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="new-password" className="sr-only">
                  New password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={handlePasswordChange}
                    id="new-password"
                    data-strength-color={getStrengthColor()}
                    className="w-full h-12 pl-10 pr-12 rounded-xl text-gray-700 bg-[#CDCDCD] border-0 transition-all duration-200 outline-none placeholder-gray-500"
                    style={{
                      backgroundColor: "#CDCDCD",
                      boxShadow: "none",
                    }}
                    placeholder="Enter new password"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                    <KeyIcon className="h-5 w-5 text-gray-600" />
                  </div>
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 transition-colors duration-150 z-10"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                  <div
                    className="sr-only"
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    {getStrengthText()
                      ? `Password strength ${getStrengthText()}`
                      : ""}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirm-password" className="sr-only">
                  Confirm new password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    id="confirm-password"
                    className="w-full h-12 pl-10 pr-12 rounded-xl text-gray-700 bg-[#CDCDCD] border-0 transition-all duration-200 outline-none placeholder-gray-500"
                    style={{
                      backgroundColor: "#CDCDCD",
                      boxShadow: "none",
                    }}
                    placeholder="Confirm new password"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                    <ShieldCheckIcon className="h-5 w-5 text-gray-600" />
                  </div>
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 transition-colors duration-150 z-10"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                  {confirmPassword &&
                    newPassword === confirmPassword &&
                    confirmPassword.length > 0 && (
                      <div className="absolute right-10 top-1/2 transform -translate-y-1/2 z-10">
                        <CheckCircleIcon className="h-5 w-5 text-green-400" />
                      </div>
                    )}
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-red-400 mt-2 ml-1">
                    Passwords don't match
                  </p>
                )}
              </div>
            </form>
          </>
        )}
      </div>
      <div
        className="flex justify-center gap-4 rounded-b-[28px] px-7 py-5"
        style={{
          backgroundColor: "#C8FF5A",
          borderTop: "none",
        }}
      >
        {!showSuccess && (
          <>
            <button
              onClick={handleSubmit}
              disabled={
                isSubmitting ||
                !currentPassword ||
                !newPassword ||
                !confirmPassword ||
                newPassword !== confirmPassword ||
                passwordStrength < 2
              }
              style={{
                backgroundColor:
                  isSubmitting ||
                  !currentPassword ||
                  !newPassword ||
                  !confirmPassword ||
                  newPassword !== confirmPassword ||
                  passwordStrength < 2
                    ? "#8FB854"
                    : "#B4E676",
              }}
              className="text-black font-bold rounded-xl transition-all duration-200 px-8 py-3 text-base hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full"></div>
                  <span>Updating...</span>
                </div>
              ) : (
                <span>Update Password</span>
              )}
            </button>
            <button
              onClick={onClose}
              style={{
                backgroundColor: "#DEDEDE",
                color: "#1F1F1F",
              }}
              className="px-8 py-3 text-base font-semibold rounded-xl transition-all duration-200 hover:brightness-95"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </Modal>
  );
};

export default ChangePasswordModal;
