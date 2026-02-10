import React from "react";
import { HiOutlineKey } from "react-icons/hi";
import GenerateAPIKeyModal from "../../../modals/GenerateAPIKeyModal";

const APIKeyTab = ({ userInfo, hasGeneratedKey, handleUpdates }) => {
  return (
    <div className="animate-fadeIn" style={{ minHeight: "70vh" }}>
      <h2
        className="text-lg font-medium mb-6"
        style={{
          fontFamily: "DM Sans, sans-serif",
          color: "#BDE958",
          borderBottom: "2px solid #BDE958",
          paddingBottom: "8px",
          display: "inline-block",
        }}
      >
        API Key Management
      </h2>

      {/* Main Content */}
      <div className="mt-6">
        {hasGeneratedKey ? (
          <>
            {/* API Key Status Section */}
            <div className="mb-6">
              <div className="flex items-baseline mb-4">
                <span
                  className="text-sm font-medium mr-2"
                  style={{
                    color: "#b8b8b8",
                    fontFamily: "DM Sans, sans-serif",
                  }}
                >
                  API Key Status:
                </span>
                <span
                  className="px-3 py-1 text-xs font-medium rounded-md"
                  style={{
                    backgroundColor: "#BDE958",
                    color: "#1D1D1D",
                    fontFamily: "DM Sans, sans-serif",
                  }}
                >
                  Active
                </span>
              </div>

              <p
                className="text-sm mb-4"
                style={{
                  color: "#9ca3af",
                  fontFamily: "DM Sans, sans-serif",
                }}
              >
                <span className="font-medium" style={{ color: "#ffffff" }}>
                  Note:
                </span>{" "}
                API keys are only displayed once at generation time for security
              </p>

              <div>
                <GenerateAPIKeyModal handleUpdates={handleUpdates} />
              </div>
            </div>

            {/* Security Information Section */}
            <div className="mt-6">
              <h4
                className="font-medium text-white mb-3 flex items-center text-base"
                style={{ fontFamily: "DM Sans, sans-serif" }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="#BDE958"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                Important Security Information
              </h4>
              <ul
                className="space-y-2 text-sm"
                style={{
                  color: "#9ca3af",
                  fontFamily: "DM Sans, sans-serif",
                }}
              >
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    Your API key grants access to your account and resources.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    Do not share your API key with others or expose it in
                    client-side code.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    Regenerate your key immediately if you suspect it has been
                    compromised.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    All API requests must include your API key for
                    authentication.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    Rate limits and usage quotas apply based on your
                    subscription plan.
                  </span>
                </li>
              </ul>
            </div>
          </>
        ) : (
          <>
            {/* Main Card for First Time Users */}
            <div
              className="border rounded-lg shadow-sm p-6 mb-6"
              style={{
                backgroundColor: "#3a3a3a",
                borderColor: "#4a4a4a",
              }}
            >
              <div className="flex items-start mb-6">
                <div
                  className="p-4 rounded-lg mr-4"
                  style={{ backgroundColor: "#BDE958" }}
                >
                  <HiOutlineKey
                    className="h-7 w-7"
                    style={{ color: "#1D1D1D" }}
                  />
                </div>
                <div>
                  <h3
                    className="text-lg font-semibold text-white mb-1"
                    style={{ fontFamily: "DM Sans, sans-serif" }}
                  >
                    Create Your First API Key
                  </h3>
                  <p
                    className="text-sm"
                    style={{
                      color: "#9ca3af",
                      fontFamily: "DM Sans, sans-serif",
                    }}
                  >
                    Generate an API key to get started with our services
                  </p>
                </div>
              </div>

              <div
                className="border rounded-md p-5"
                style={{
                  backgroundColor: "#2d2d2d",
                  borderColor: "#3a3a3a",
                }}
              >
                <div className="flex items-center justify-between">
                  <p
                    className="text-sm flex-1"
                    style={{
                      color: "#9ca3af",
                      fontFamily: "DM Sans, sans-serif",
                    }}
                  >
                    You don't have any API key yet. Generate one to access our
                    API endpoints.
                  </p>
                  <div className="ml-4 flex-shrink-0">
                    <GenerateAPIKeyModal handleUpdates={handleUpdates} />
                  </div>
                </div>
              </div>
            </div>

            {/* Security Information Card */}
            <div className="mt-6">
              <h4
                className="font-medium text-white mb-4 flex items-center text-base"
                style={{ fontFamily: "DM Sans, sans-serif" }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="#BDE958"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                Important Security Information
              </h4>
              <ul
                className="space-y-2.5 text-sm"
                style={{
                  color: "#9ca3af",
                  fontFamily: "DM Sans, sans-serif",
                }}
              >
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    Your API key grants access to your account and resources.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    Do not share your API key with others or expose it in
                    client-side code.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    Regenerate your key immediately if you suspect it has been
                    compromised.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    All API requests must include your API key for
                    authentication.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    Rate limits and usage quotas apply based on your
                    subscription plan.
                  </span>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default APIKeyTab;
