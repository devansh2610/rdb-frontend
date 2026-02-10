import React, { useState, useEffect } from "react";
import { Button } from "flowbite-react";
import ChangePasswordModal from "../../../modals/ChangePasswordModal";
import DeleteAccountModal from "../../../modals/DeleteAccountModal";

const SettingsTab = ({
  isPasswordModalOpen,
  setIsPasswordModalOpen,
  isDeleteAccountModalOpen,
  setIsDeleteAccountModalOpen,
  handlePasswordChange,
  handleAccountDeletion,
}) => {
  const [activeSettingsTab, setActiveSettingsTab] = useState("security");

  // Load preferences from localStorage or use defaults
  const getInitialPreferences = () => {
    const savedPreferences = localStorage.getItem("userPreferences");
    if (savedPreferences) {
      try {
        return JSON.parse(savedPreferences);
      } catch (e) {
        console.error("Error parsing saved preferences:", e);
      }
    }
    return {
      accountUpdates: true,
      tokenAlerts: false,
      marketingEmails: true,
    };
  };

  const [preferences, setPreferences] = useState(getInitialPreferences);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load preferences when component mounts
  useEffect(() => {
    const savedPreferences = localStorage.getItem("userPreferences");
    if (savedPreferences) {
      try {
        setPreferences(JSON.parse(savedPreferences));
      } catch (e) {
        console.error("Error loading preferences:", e);
      }
    }
  }, []);

  const handlePreferenceChange = (key) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSavePreferences = () => {
    setIsSaving(true);
    // Simulate API call - replace with actual API call when backend is ready
    setTimeout(() => {
      console.log("Saving preferences:", preferences);

      // Save to localStorage
      localStorage.setItem("userPreferences", JSON.stringify(preferences));

      // Here you would call your API endpoint when backend is ready
      // await updateUserPreferences(preferences);

      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 500);
  };

  return (
    <div className="animate-fadeIn" style={{ minHeight: "70vh" }}>
      {/* Tabs Navigation */}
      <div className="flex border-b mb-8" style={{ borderColor: "#3a3a3a" }}>
        <button
          onClick={() => setActiveSettingsTab("security")}
          className={`px-6 py-3 font-medium text-sm transition-all`}
          style={{
            color: activeSettingsTab === "security" ? "#BDE958" : "#888",
            borderBottom:
              activeSettingsTab === "security"
                ? "2px solid #BDE958"
                : "2px solid transparent",
            fontFamily: "DM Sans, sans-serif",
          }}
        >
          Security
        </button>
        <button
          onClick={() => setActiveSettingsTab("preferences")}
          className={`px-6 py-3 font-medium text-sm transition-all`}
          style={{
            color: activeSettingsTab === "preferences" ? "#BDE958" : "#888",
            borderBottom:
              activeSettingsTab === "preferences"
                ? "2px solid #BDE958"
                : "2px solid transparent",
            fontFamily: "DM Sans, sans-serif",
          }}
        >
          Preferences
        </button>
        <button
          onClick={() => setActiveSettingsTab("account-deletion")}
          className={`px-6 py-3 font-medium text-sm transition-all`}
          style={{
            color:
              activeSettingsTab === "account-deletion" ? "#BDE958" : "#888",
            borderBottom:
              activeSettingsTab === "account-deletion"
                ? "2px solid #BDE958"
                : "2px solid transparent",
            fontFamily: "DM Sans, sans-serif",
          }}
        >
          Account Deletion
        </button>
      </div>

      {/* Security Tab */}
      {activeSettingsTab === "security" && (
        <div className="space-y-8 max-w-2xl">
          <div className="space-y-4">
            <label
              className="block text-sm font-normal"
              style={{ color: "#b8b8b8", fontFamily: "DM Sans, sans-serif" }}
            >
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg
                  className="w-5 h-5"
                  style={{ color: "#666" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <input
                type="password"
                placeholder="••••••"
                readOnly
                onClick={() => setIsPasswordModalOpen(true)}
                className="w-full pl-12 pr-12 py-4 rounded-lg focus:outline-none focus:ring-1 cursor-pointer"
                style={{
                  backgroundColor: "#3a3a3a",
                  borderColor: "#4a4a4a",
                  border: "1px solid #4a4a4a",
                  color: "#ffffff",
                  fontFamily: "DM Sans, sans-serif",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#BDE958")}
                onBlur={(e) => (e.target.style.borderColor = "#4a4a4a")}
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                <button style={{ color: "#666" }} type="button">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label
              className="block text-sm font-normal"
              style={{ color: "#b8b8b8", fontFamily: "DM Sans, sans-serif" }}
            >
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg
                  className="w-5 h-5"
                  style={{ color: "#666" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <input
                type="password"
                placeholder="••••••"
                readOnly
                onClick={() => setIsPasswordModalOpen(true)}
                className="w-full pl-12 pr-12 py-4 rounded-lg focus:outline-none focus:ring-1 cursor-pointer"
                style={{
                  backgroundColor: "#3a3a3a",
                  borderColor: "#4a4a4a",
                  border: "1px solid #4a4a4a",
                  color: "#ffffff",
                  fontFamily: "DM Sans, sans-serif",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#BDE958")}
                onBlur={(e) => (e.target.style.borderColor = "#4a4a4a")}
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                <button style={{ color: "#666" }} type="button">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="pt-8">
            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="px-8 py-3 rounded-md font-medium transition-colors"
              style={{
                backgroundColor: "#BDE958",
                color: "#1D1D1D",
                fontFamily: "DM Sans, sans-serif",
                fontSize: "15px",
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#a8d144")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#BDE958")}
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Preferences Tab */}
      {activeSettingsTab === "preferences" && (
        <div className="space-y-0 max-w-3xl">
          {saveSuccess && (
            <div
              className="mb-6 border px-4 py-3 rounded-lg"
              style={{
                backgroundColor: "rgba(189, 233, 88, 0.2)",
                borderColor: "#BDE958",
                color: "#BDE958",
              }}
            >
              <span className="block sm:inline">
                Preferences saved successfully!
              </span>
            </div>
          )}

          <div
            className="flex items-center justify-between py-8 border-b"
            style={{ borderColor: "#2d2d2d" }}
          >
            <div className="flex-1">
              <p
                className="font-medium mb-2"
                style={{
                  color: "#ffffff",
                  fontFamily: "DM Sans, sans-serif",
                  fontSize: "16px",
                }}
              >
                Account Updates
              </p>
              <p
                className="text-sm"
                style={{
                  color: "#888",
                  fontFamily: "DM Sans, sans-serif",
                }}
              >
                Get notified when there are changes to your account
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-8">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={preferences.accountUpdates}
                onChange={() => handlePreferenceChange("accountUpdates")}
              />
              <div
                className="w-12 h-6 rounded-full peer peer-focus:outline-none peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#BDE958]"
                style={{
                  backgroundColor: "#3a3a3a",
                }}
              ></div>
            </label>
          </div>

          <div
            className="flex items-center justify-between py-8 border-b"
            style={{ borderColor: "#2d2d2d" }}
          >
            <div className="flex-1">
              <p
                className="font-medium mb-2"
                style={{
                  color: "#ffffff",
                  fontFamily: "DM Sans, sans-serif",
                  fontSize: "16px",
                }}
              >
                Token usage alerts
              </p>
              <p
                className="text-sm"
                style={{
                  color: "#888",
                  fontFamily: "DM Sans, sans-serif",
                }}
              >
                Receive alerts when your token usage is high
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-8">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={preferences.tokenAlerts}
                onChange={() => handlePreferenceChange("tokenAlerts")}
              />
              <div
                className="w-12 h-6 rounded-full peer peer-focus:outline-none peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#BDE958]"
                style={{
                  backgroundColor: "#3a3a3a",
                }}
              ></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-8">
            <div className="flex-1">
              <p
                className="font-medium mb-2"
                style={{
                  color: "#ffffff",
                  fontFamily: "DM Sans, sans-serif",
                  fontSize: "16px",
                }}
              >
                Marketing emails
              </p>
              <p
                className="text-sm"
                style={{
                  color: "#888",
                  fontFamily: "DM Sans, sans-serif",
                }}
              >
                Receive information about new features and offers
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-8">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={preferences.marketingEmails}
                onChange={() => handlePreferenceChange("marketingEmails")}
              />
              <div
                className="w-12 h-6 rounded-full peer peer-focus:outline-none peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#BDE958]"
                style={{
                  backgroundColor: "#3a3a3a",
                }}
              ></div>
            </label>
          </div>

          <div className="pt-8">
            <button
              onClick={handleSavePreferences}
              disabled={isSaving}
              className="px-10 py-3 rounded-md font-medium transition-colors"
              style={{
                backgroundColor: isSaving ? "#888" : "#BDE958",
                color: "#1D1D1D",
                fontFamily: "DM Sans, sans-serif",
                fontSize: "15px",
                cursor: isSaving ? "not-allowed" : "pointer",
              }}
              onMouseEnter={(e) => {
                if (!isSaving) e.target.style.backgroundColor = "#a8d144";
              }}
              onMouseLeave={(e) => {
                if (!isSaving) e.target.style.backgroundColor = "#BDE958";
              }}
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}

      {/* Account Deletion Tab */}
      {activeSettingsTab === "account-deletion" && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-200 mb-2">
              Account Deletion
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              Permanently delete your account and all it's data
            </p>

            <button
              onClick={() => setIsDeleteAccountModalOpen(true)}
              className="px-8 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Delete Account
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onPasswordChange={handlePasswordChange}
      />

      <DeleteAccountModal
        isOpen={isDeleteAccountModalOpen}
        onClose={() => setIsDeleteAccountModalOpen(false)}
        onDeleteAccount={handleAccountDeletion}
      />
    </div>
  );
};

export default SettingsTab;
