import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Modal as ModalUI } from "flowbite-react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import axios from "../api/axios";
import {
  KeyIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

export default function GenerateAPIKeyModal({ handleUpdates }) {
  const [showModal, setShowModal] = useState(false);
  const [showError, setShowError] = useState(false);
  const [key, setKey] = useState("");
  const [copied, setCopied] = useState(false);
  const [hasGeneratedKey, setHasGeneratedKey] = useState(false);
  const { getToken, logout } = useAuth();
  const [confirmText, setConfirmText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkExistingKey = async () => {
      try {
        const token = getToken();
        const response = await axios.get(`/profile/haskey`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response?.data?.hasApiKey) {
          setHasGeneratedKey(true);
        }
      } catch (error) {
        console.error("Error checking API key status:", error);
      }
    };

    checkExistingKey();
  }, [getToken]);

  const generateAPIKey = async () => {
    setShowError(false);
    setCopied(false);
    setIsLoading(true);

    try {
      const token = getToken();
      const response = await axios.post(
        `/profile/key`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response?.data?.apiKey) {
        setKey(response.data.apiKey);
        setHasGeneratedKey(true);
      } else {
        throw new Error("Invalid API Key response");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        console.error("Unauthorized: Invalid Token", error);
        logout();
      } else {
        setShowError(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async () => {
    setIsLoading(true);
    try {
      const token = getToken();
      const response = await axios.post(
        `/profile/key/regenerate`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response?.data?.newApiKey) {
        setKey(response.data.newApiKey);
        setHasGeneratedKey(true);
        setShowError(false);
      } else {
        setShowError(true);
      }
    } catch (error) {
      console.error("Error regenerating API key:", error);
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    handleUpdates();
    setShowModal(false);
    setCopied(false);
    setConfirmText("");
  };

  return (
    <div>
      {!hasGeneratedKey ? (
        <button
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-md transition-all duration-200 whitespace-nowrap"
          style={{
            backgroundColor: "#BDE958",
            color: "#1D1D1D",
            fontFamily: "DM Sans, sans-serif",
            fontSize: "15px",
            fontWeight: "600",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#a8d144";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#BDE958";
          }}
          onClick={() => {
            setShowModal(true);
            generateAPIKey();
          }}
        >
          <KeyIcon className="h-5 w-5" />
          <span>Generate API Key</span>
        </button>
      ) : (
        <button
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-md transition-all duration-200 whitespace-nowrap"
          style={{
            backgroundColor: "#BDE958",
            color: "#1D1D1D",
            fontFamily: "DM Sans, sans-serif",
            fontSize: "15px",
            fontWeight: "600",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#a8d144";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#BDE958";
          }}
          onClick={() => {
            setShowModal(true);
            setKey("");
          }}
        >
          <ArrowPathIcon className="h-5 w-5" />
          <span>Regenerate API Key</span>
        </button>
      )}

      <ModalUI
        show={showModal}
        size="3xl"
        onClose={closeModal}
        className="rounded-xl overflow-hidden shadow-2xl"
      >
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{ backgroundColor: "#BDE958" }}
        >
          <div className="flex items-center gap-3">
            <KeyIcon className="h-6 w-6" style={{ color: "#1D1D1D" }} />
            <h3
              className="text-xl font-semibold"
              style={{ color: "#1D1D1D", fontFamily: "DM Sans, sans-serif" }}
            >
              {hasGeneratedKey && !key
                ? "Regenerate API Key"
                : "API Key Management"}
            </h3>
          </div>
          <button
            onClick={closeModal}
            className="ml-auto inline-flex items-center rounded-lg p-1.5 text-sm transition-colors"
            style={{ backgroundColor: "#5A5A5A", color: "#ffffff" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#4A4A4A")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#5A5A5A")
            }
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

        <div className="p-6" style={{ backgroundColor: "#5A5A5A" }}>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div
                className="animate-spin rounded-full h-12 w-12 border-b-2"
                style={{ borderColor: "#BDE958" }}
              ></div>
              <p
                className="mt-4"
                style={{ color: "#b8b8b8", fontFamily: "DM Sans, sans-serif" }}
              >
                Processing your request...
              </p>
            </div>
          ) : hasGeneratedKey && !key ? (
            <div className="mb-4 flex flex-col gap-4">
              <div
                className="flex p-4 rounded-lg shadow-sm"
                style={{
                  backgroundColor: "rgba(189, 233, 88, 0.2)",
                  borderLeft: "4px solid #BDE958",
                }}
              >
                <ExclamationTriangleIcon
                  className="h-6 w-6 mr-3 flex-shrink-0"
                  style={{ color: "#BDE958" }}
                />
                <div>
                  <div
                    className="font-medium text-lg mb-1"
                    style={{
                      color: "#BDE958",
                      fontFamily: "DM Sans, sans-serif",
                    }}
                  >
                    Warning!
                  </div>
                  <p
                    style={{
                      color: "#b8b8b8",
                      fontFamily: "DM Sans, sans-serif",
                    }}
                  >
                    Your previous API key will no longer be valid.
                  </p>
                </div>
              </div>

              <div
                className="flex flex-col gap-2 mt-4 p-4 rounded-lg"
                style={{ backgroundColor: "#3a3a3a" }}
              >
                <label
                  htmlFor="confirm-regenerate"
                  className="font-medium"
                  style={{
                    color: "#b8b8b8",
                    fontFamily: "DM Sans, sans-serif",
                  }}
                >
                  Type{" "}
                  <span className="font-bold" style={{ color: "#BDE958" }}>
                    Regenerate API Key
                  </span>{" "}
                  to confirm:
                </label>
                <input
                  id="confirm-regenerate"
                  type="text"
                  className="px-4 py-3 rounded-lg w-full focus:outline-none focus:ring-1 transition-all duration-300"
                  style={{
                    border: "1px solid #4a4a4a",
                    backgroundColor: "#2d2d2d",
                    color: "#ffffff",
                    fontFamily: "DM Sans, sans-serif",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#BDE958")}
                  onBlur={(e) => (e.target.style.borderColor = "#4a4a4a")}
                  placeholder="Type here to confirm..."
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  autoComplete="off"
                />
              </div>

              <button
                disabled={confirmText !== "Regenerate API Key"}
                className="mt-4 py-3 px-6 rounded-lg font-medium transition-all duration-300"
                style={{
                  backgroundColor:
                    confirmText === "Regenerate API Key"
                      ? "#BDE958"
                      : "#3a3a3a",
                  color:
                    confirmText === "Regenerate API Key" ? "#1D1D1D" : "#666",
                  cursor:
                    confirmText === "Regenerate API Key"
                      ? "pointer"
                      : "not-allowed",
                  fontFamily: "DM Sans, sans-serif",
                }}
                onMouseEnter={(e) => {
                  if (confirmText === "Regenerate API Key") {
                    e.target.style.backgroundColor = "#a8d144";
                  }
                }}
                onMouseLeave={(e) => {
                  if (confirmText === "Regenerate API Key") {
                    e.target.style.backgroundColor = "#BDE958";
                  }
                }}
                onClick={handleRegenerate}
              >
                <div className="flex items-center justify-center gap-2">
                  <KeyIcon className="h-5 w-5" />
                  <span>Regenerate API Key</span>
                </div>
              </button>
            </div>
          ) : key ? (
            <div className="w-full flex flex-col gap-6 items-center py-4">
              <div
                className="flex p-4 rounded-lg shadow-sm w-full"
                style={{
                  backgroundColor: "rgba(189, 233, 88, 0.2)",
                  borderLeft: "4px solid #BDE958",
                }}
              >
                <ExclamationTriangleIcon
                  className="h-6 w-6 mr-3 flex-shrink-0"
                  style={{ color: "#BDE958" }}
                />
                <div>
                  <div
                    className="font-medium text-lg mb-1"
                    style={{
                      color: "#BDE958",
                      fontFamily: "DM Sans, sans-serif",
                    }}
                  >
                    Important!
                  </div>
                  <p
                    style={{
                      color: "#b8b8b8",
                      fontFamily: "DM Sans, sans-serif",
                    }}
                  >
                    This key will not be shown again. Copy and store it
                    securely.
                  </p>
                </div>
              </div>

              <div
                className="p-6 rounded-xl w-full shadow-sm"
                style={{
                  backgroundColor: "#3a3a3a",
                  border: "1px solid #4a4a4a",
                }}
              >
                <div
                  className="text-sm mb-2"
                  style={{ color: "#888", fontFamily: "DM Sans, sans-serif" }}
                >
                  Your API Key:
                </div>
                <div className="flex gap-3 w-full items-center">
                  <div
                    className="rounded-lg w-full px-5 py-4 font-mono text-sm lg:text-base overflow-x-auto"
                    style={{
                      border: "1px solid #4a4a4a",
                      backgroundColor: "#2d2d2d",
                    }}
                  >
                    <p
                      className="break-all select-all"
                      style={{ color: "#ffffff" }}
                    >
                      {key}
                    </p>
                  </div>
                  <CopyToClipboard text={key} onCopy={() => setCopied(true)}>
                    <button
                      className="min-w-24 h-12 rounded-lg shadow-sm transition-all duration-300 px-4"
                      style={{
                        backgroundColor: copied ? "#10b981" : "#BDE958",
                        color: copied ? "#ffffff" : "#1D1D1D",
                      }}
                      onMouseEnter={(e) => {
                        if (!copied) e.target.style.backgroundColor = "#a8d144";
                      }}
                      onMouseLeave={(e) => {
                        if (!copied) e.target.style.backgroundColor = "#BDE958";
                      }}
                    >
                      <div className="flex items-center justify-center gap-2">
                        {copied ? (
                          <CheckCircleIcon className="h-5 w-5" />
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                        )}
                        <span style={{ fontFamily: "DM Sans, sans-serif" }}>
                          {copied ? "Copied!" : "Copy"}
                        </span>
                      </div>
                    </button>
                  </CopyToClipboard>
                </div>
              </div>

              <div
                className="text-center text-sm mt-2"
                style={{ color: "#888", fontFamily: "DM Sans, sans-serif" }}
              >
                Remember to keep this key secure and never share it publicly
              </div>
            </div>
          ) : (
            !hasGeneratedKey &&
            showError && (
              <div
                className="flex p-4 rounded-lg shadow-sm mt-12"
                style={{
                  backgroundColor: "rgba(239, 68, 68, 0.2)",
                  borderLeft: "4px solid #ef4444",
                }}
              >
                <ExclamationTriangleIcon
                  className="h-6 w-6 mr-3 flex-shrink-0"
                  style={{ color: "#ef4444" }}
                />
                <div>
                  <div
                    className="font-medium text-lg mb-1"
                    style={{
                      color: "#ef4444",
                      fontFamily: "DM Sans, sans-serif",
                    }}
                  >
                    Error!
                  </div>
                  <p
                    style={{
                      color: "#b8b8b8",
                      fontFamily: "DM Sans, sans-serif",
                    }}
                  >
                    Unable to generate API key. Please try again later.
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      </ModalUI>
    </div>
  );
}
