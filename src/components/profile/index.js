import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationsContext";
import { Spinner } from "flowbite-react";
import { useLocation, useNavigate } from "react-router-dom";
import Navigation from "../Navigation";
import axios from "../../api/axios";

// Import components
import ProfileSidebar from "./ProfileSidebar";
import PersonalInfoTab from "./tabs/PersonalInfoTab";
import APIKeyTab from "./tabs/APIKeyTab";
import TokensTab from "./tabs/TokensTab";
import TransactionsTab from "./tabs/TransactionsTab";
import NotificationsTab from "./tabs/NotificationsTab";
import SettingsTab from "./tabs/SettingsTab";

const ProfilePage = () => {
  const {
    getProfile,
    logout,
    getToken,
    PROFILE_UPDATE_EVENT,
    TOKEN_UPDATE_EVENT,
  } = useAuth();
  const {
    notifications,
    markAllAsRead: markAllNotificationsAsRead,
    markAsRead: markNotificationAsRead,
    deleteNotification,
  } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("personal-info");
  const [isLoading, setIsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [hasGeneratedKey, setHasGeneratedKey] = useState(false);
  const [availableTokens, setAvailableTokens] = useState(0);
  const [totalTokens, setTotalTokens] = useState(1000); // Default total allocation
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] =
    useState(false);

  // Add a useEffect to listen for profile updates
  useEffect(() => {
    const handleProfileUpdate = (event) => {
      const updatedProfile = event.detail || getProfile();
      setUserInfo(updatedProfile);
      if (updatedProfile?.tokens) {
        setAvailableTokens(updatedProfile.tokens);
      }
    };

    // Listen for both token and profile update events
    window.addEventListener(TOKEN_UPDATE_EVENT, handleProfileUpdate);
    window.addEventListener(PROFILE_UPDATE_EVENT, handleProfileUpdate);

    return () => {
      window.removeEventListener(TOKEN_UPDATE_EVENT, handleProfileUpdate);
      window.removeEventListener(PROFILE_UPDATE_EVENT, handleProfileUpdate);
    };
  }, [getProfile, TOKEN_UPDATE_EVENT, PROFILE_UPDATE_EVENT]);

  useEffect(() => {
    // Read tab from URL query parameter
    const params = new URLSearchParams(location.search);
    const tabParam = params.get("tab");
    if (
      tabParam &&
      [
        "personal-info",
        "api-key",
        "tokens",
        "transactions",
        "notifications",
        "settings",
      ].includes(tabParam)
    ) {
      setActiveTab(tabParam);
    }

    const fetchData = async () => {
      try {
        const profile = getProfile();
        setUserInfo(profile);
        if (profile?.tokens) {
          setAvailableTokens(profile.tokens);
        }

        // For this example, we're setting a fixed total
        // In a real app, this would come from your backend
        setTotalTokens(1000);

        // Check if user has API key
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
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [getProfile, getToken, location.search]);

  const handleUpdates = async () => {
    try {
      const updatedProfile = getProfile();
      setUserInfo(updatedProfile);
      // Check if user has API key
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
      console.error("Error updating profile data:", error);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Update URL with tab parameter without reload
    navigate(`/profile?tab=${tab}`, { replace: true });
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const toggleApiKeyVisibility = () => {
    setShowApiKey(!showApiKey);
  };

  const copyApiKey = () => {
    if (userInfo?.apiKey) {
      navigator.clipboard.writeText(userInfo.apiKey);
      // Could add a toast notification here
    }
  };

  const handlePasswordChange = () => {
    // Here you would update the UI or show a success message
    console.log("Password changed successfully");
    // You could add a toast notification here
  };

  const handleAccountDeletion = () => {
    // Here you would handle account deletion
    console.log("Account deleted successfully");
    // Redirect to login or home page after successful deletion
    // navigate('/');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="xl" color="blue" />
      </div>
    );
  }

  return (
    <>
      <Navigation stay={true} />
      <div
        className="min-h-screen pt-28 px-4 sm:px-6 md:px-8 lg:px-16 pb-8 transition-colors duration-300"
        style={{ backgroundColor: "#1D1D1D" }}
      >
        <div className="max-w-6xl mx-auto">
          <div
            className="overflow-hidden shadow-lg rounded-lg border"
            style={{ backgroundColor: "#2d2d2d", borderColor: "#3a3a3a" }}
          >
            <div className="flex flex-col lg:flex-row">
              {/* Sidebar */}
              <ProfileSidebar
                userInfo={userInfo}
                activeTab={activeTab}
                handleTabChange={handleTabChange}
                handleLogout={handleLogout}
                notifications={notifications}
              />

              {/* Content Area */}
              <div
                className="flex-1 p-6"
                style={{ backgroundColor: "#2d2d2d" }}
              >
                {activeTab === "personal-info" && (
                  <PersonalInfoTab userInfo={userInfo} />
                )}

                {activeTab === "api-key" && (
                  <APIKeyTab
                    userInfo={userInfo}
                    hasGeneratedKey={hasGeneratedKey}
                    handleUpdates={handleUpdates}
                  />
                )}

                {activeTab === "tokens" && (
                  <TokensTab
                    availableTokens={availableTokens}
                    totalTokens={totalTokens}
                  />
                )}

                {activeTab === "transactions" && <TransactionsTab />}

                {activeTab === "notifications" && (
                  <NotificationsTab
                    notifications={notifications}
                    markAllNotificationsAsRead={markAllNotificationsAsRead}
                    markNotificationAsRead={markNotificationAsRead}
                    deleteNotification={deleteNotification}
                  />
                )}

                {activeTab === "settings" && (
                  <SettingsTab
                    isPasswordModalOpen={isPasswordModalOpen}
                    setIsPasswordModalOpen={setIsPasswordModalOpen}
                    isDeleteAccountModalOpen={isDeleteAccountModalOpen}
                    setIsDeleteAccountModalOpen={setIsDeleteAccountModalOpen}
                    handlePasswordChange={handlePasswordChange}
                    handleAccountDeletion={handleAccountDeletion}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
