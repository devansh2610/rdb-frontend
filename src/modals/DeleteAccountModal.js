import React, { useState } from "react";
import { Modal, Button } from "flowbite-react";
import {
  ExclamationTriangleIcon,
  XCircleIcon,
  UserMinusIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";

const DeleteAccountModal = ({ isOpen, onClose, onDeleteAccount }) => {
  const { deleteAccount } = useAuth();
  const [confirmText, setConfirmText] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const expectedConfirmation = "delete my account";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !showPasswordField &&
      confirmText.toLowerCase() !== expectedConfirmation
    ) {
      setError(`Please type "${expectedConfirmation}" to confirm deletion`);
      return;
    }

    if (showPasswordField && !password) {
      setError("Please enter your password to confirm deletion");
      return;
    }

    if (!showPasswordField) {
      setShowPasswordField(true);
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Attempting to delete account");
      const response = await deleteAccount(password);

      if (response && response.success) {
        console.log("Account deleted successfully");
        onDeleteAccount();
        resetForm();
        onClose();
      } else {
        console.error("Account deletion failed:", response);
        setError(
          response?.message ||
            "Failed to delete account. Please try again later."
        );
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error("Account deletion error:", err);

      if (!err?.response) {
        setError("No response from server. Please try again later.");
      } else if (err.response?.status === 403) {
        setError("You don't have permission to delete this account.");
      } else if (err.response?.status === 401) {
        setError(
          "Incorrect password. Please check your password and try again."
        );
      } else {
        setError("Failed to delete account. Please try again later.");
      }
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setConfirmText("");
    setPassword("");
    setError("");
    setShowPasswordField(false);
  };

  const closeModal = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      show={isOpen}
      onClose={closeModal}
      size="md"
      className="rounded-xl overflow-hidden"
    >
      {/* Lime Green Header */}
      <div
        className="px-6 py-4 flex items-center justify-between"
        style={{
          backgroundColor: "#BDE958",
        }}
      >
        <div className="flex items-center gap-3">
          <UserMinusIcon className="h-6 w-6" style={{ color: "#1D1D1D" }} />
          <h3
            className="text-xl font-semibold"
            style={{
              color: "#1D1D1D",
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            Delete account
          </h3>
        </div>
      </div>

      {/* White Content Box */}
      <div className="px-6 py-6" style={{ backgroundColor: "#3a3a3a" }}>
        <div
          className="rounded-lg p-6"
          style={{
            backgroundColor: "#e8e8e8",
          }}
        >
          <div className="flex flex-col items-center text-center mb-4">
            <div className="mb-4">
              <ExclamationTriangleIcon
                className="h-12 w-12"
                style={{ color: "#1D1D1D" }}
              />
            </div>
            <h3
              className="text-lg font-semibold mb-4"
              style={{
                color: "#1D1D1D",
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              Are you sure you want to delete your account?
            </h3>
            <p
              className="text-sm mb-2"
              style={{
                color: "#1D1D1D",
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              This action is{" "}
              <span style={{ color: "#ef4444", fontWeight: "600" }}>
                permanent
              </span>{" "}
              and cannot be undone. All your data including your profiles, token
              and transaction will be deleted permanently
            </p>
          </div>

          {error && (
            <div
              className="p-3 mb-4 rounded-lg text-sm"
              style={{
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                color: "#ef4444",
                border: "1px solid #ef4444",
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              {error}
            </div>
          )}

          <div className="mb-4">
            <p
              className="text-sm mb-3"
              style={{
                color: "#1D1D1D",
                fontFamily: "DM Sans, sans-serif",
                fontWeight: "500",
              }}
            >
              To confirm the deletion please type 'delete my account'
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full px-4 py-3 rounded-lg focus:outline-none"
              style={{
                backgroundColor: "#d8d8d8",
                border: "1px solid #c8c8c8",
                color: "#1D1D1D",
                fontFamily: "DM Sans, sans-serif",
              }}
              placeholder="Type here..."
              autoComplete="off"
            />
          </div>

          {/* Password Field - Only show after confirmation text is entered */}
          {showPasswordField && (
            <div className="mb-4">
              <p
                className="text-sm mb-3"
                style={{
                  color: "#1D1D1D",
                  fontFamily: "DM Sans, sans-serif",
                  fontWeight: "500",
                }}
              >
                Enter your password to confirm
              </p>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg focus:outline-none"
                style={{
                  backgroundColor: "#d8d8d8",
                  border: "1px solid #c8c8c8",
                  color: "#1D1D1D",
                  fontFamily: "DM Sans, sans-serif",
                }}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>
          )}
        </div>

        {isSubmitting && (
          <div
            className="flex justify-center items-center gap-2 text-sm mt-4"
            style={{ color: "#888" }}
          >
            <div className="animate-spin h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full"></div>
            <span>Processing your request...</span>
          </div>
        )}
      </div>

      {/* Lime Green Footer with Buttons */}
      <div
        className="px-6 py-4 flex gap-4"
        style={{
          backgroundColor: "#BDE958",
        }}
      >
        <button
          onClick={handleSubmit}
          disabled={
            isSubmitting ||
            confirmText.toLowerCase() !== expectedConfirmation ||
            (showPasswordField && !password)
          }
          className="flex-1 px-6 py-3 rounded-lg font-medium transition-all"
          style={{
            backgroundColor:
              isSubmitting ||
              confirmText.toLowerCase() !== expectedConfirmation ||
              (showPasswordField && !password)
                ? "#ff9999"
                : "#ef4444",
            color: "#ffffff",
            fontFamily: "DM Sans, sans-serif",
            cursor:
              isSubmitting ||
              confirmText.toLowerCase() !== expectedConfirmation ||
              (showPasswordField && !password)
                ? "not-allowed"
                : "pointer",
            opacity:
              isSubmitting ||
              confirmText.toLowerCase() !== expectedConfirmation ||
              (showPasswordField && !password)
                ? 0.6
                : 1,
          }}
          onMouseEnter={(e) => {
            if (
              !isSubmitting &&
              confirmText.toLowerCase() === expectedConfirmation &&
              !(showPasswordField && !password)
            ) {
              e.target.style.backgroundColor = "#dc2626";
            }
          }}
          onMouseLeave={(e) => {
            if (
              !isSubmitting &&
              confirmText.toLowerCase() === expectedConfirmation &&
              !(showPasswordField && !password)
            ) {
              e.target.style.backgroundColor = "#ef4444";
            }
          }}
        >
          {isSubmitting
            ? "Deleting..."
            : showPasswordField
            ? "Confirm Deletion"
            : "Continue"}
        </button>
        <button
          onClick={closeModal}
          className="flex-1 px-6 py-3 rounded-lg font-medium transition-all"
          style={{
            backgroundColor: "#e8e8e8",
            color: "#1D1D1D",
            fontFamily: "DM Sans, sans-serif",
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "#d8d8d8")}
          onMouseLeave={(e) => (e.target.style.backgroundColor = "#e8e8e8")}
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
};

export default DeleteAccountModal;
