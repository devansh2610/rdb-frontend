import React, { useState } from "react";
import { Avatar } from "flowbite-react";
import {
  HiOutlineUser,
  HiOutlineKey,
  HiOutlineCash,
  HiOutlineCreditCard,
  HiOutlineLogout,
  HiOutlineBell,
  HiOutlineCog,
} from "react-icons/hi";
import { FaPencilAlt } from "react-icons/fa";
import AvatarSelectorModal from "../../modals/AvatarSelectorModal";
import { setProfileImage, removeProfileImage } from "../../api/profileService";
import { toast } from "react-toastify";

const ProfileSidebar = ({
  userInfo,
  activeTab,
  handleTabChange,
  handleLogout,
  notifications,
}) => {
  const [selectedAvatar, setSelectedAvatar] = useState(
    userInfo?.imageUrl ||
      "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png"
  );
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAvatarChange = async (avatarUrl) => {
    try {
      setIsLoading(true);
      // Call the API to update the profile image
      await setProfileImage(avatarUrl);

      // Update UI with the new avatar
      setSelectedAvatar(avatarUrl);

      // Close the modal and show success message
      setShowModal(false);
      toast.success("Avatar updated successfully");

      // Dispatch event to update profile in other components
      const event = new CustomEvent("profile_update");
      window.dispatchEvent(event);
    } catch (error) {
      toast.error("Failed to update avatar. Please try again.");
      console.error("Avatar update error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      setIsLoading(true);
      // Call the API to remove the profile image
      await removeProfileImage();

      // Reset to default avatar
      setSelectedAvatar(
        "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png"
      );

      // Close the modal and show success message
      setShowModal(false);
      toast.success("Avatar removed successfully");

      // Dispatch event to update profile in other components
      const event = new CustomEvent("profile_update");
      window.dispatchEvent(event);
    } catch (error) {
      toast.error("Failed to remove avatar. Please try again.");
      console.error("Avatar removal error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="w-full lg:w-64 border-r"
      style={{ borderColor: "#3a3a3a", backgroundColor: "#2d2d2d" }}
    >
      <div
        className="flex flex-col items-center p-6 border-b"
        style={{ borderColor: "#3a3a3a" }}
      >
        <h5
          className="text-xl font-medium text-white"
          style={{ fontFamily: "DM Sans, sans-serif" }}
        >
          {userInfo?.name || "User"}
        </h5>
        <span
          className="text-sm text-gray-400"
          style={{ fontFamily: "DM Sans, sans-serif" }}
        >
          {userInfo?.email || ""}
        </span>
      </div>

      {showModal && (
        <AvatarSelectorModal
          onClose={() => setShowModal(false)}
          onSelect={handleAvatarChange}
          onRemove={handleRemoveAvatar}
          currentAvatar={selectedAvatar}
          isLoading={isLoading}
        />
      )}

      <nav className="space-y-1 p-3">
        {[
          {
            key: "personal-info",
            label: "Personal Info",
            icon: <HiOutlineUser className="mr-3 h-5 w-5" />,
          },
          {
            key: "api-key",
            label: "API Key",
            icon: <HiOutlineKey className="mr-3 h-5 w-5" />,
          },
          {
            key: "tokens",
            label: "Tokens",
            icon: <HiOutlineCash className="mr-3 h-5 w-5" />,
          },
          {
            key: "transactions",
            label: "Payment History",
            icon: <HiOutlineCreditCard className="mr-3 h-5 w-5" />,
          },
          {
            key: "notifications",
            label: "Notifications",
            icon: <HiOutlineBell className="mr-3 h-5 w-5" />,
            notificationCount: notifications.filter((n) => !n.read).length,
          },
          {
            key: "settings",
            label: "Settings",
            icon: <HiOutlineCog className="mr-3 h-5 w-5" />,
          },
        ].map(({ key, label, icon, notificationCount }) => (
          <button
            key={key}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors duration-200`}
            style={{
              backgroundColor: activeTab === key ? "#3a3a3a" : "transparent",
              color: activeTab === key ? "#BDE958" : "#ffffff",
              fontFamily: "DM Sans, sans-serif",
            }}
            onMouseEnter={(e) => {
              if (activeTab !== key) {
                e.currentTarget.style.backgroundColor = "#3a3a3a";
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== key) {
                e.currentTarget.style.backgroundColor = "transparent";
              }
            }}
            onClick={() => handleTabChange(key)}
          >
            {icon}
            <span className="flex-1 text-left">{label}</span>
            {notificationCount > 0 && (
              <span
                className="inline-flex items-center justify-center w-5 h-5 text-xs font-semibold rounded-full"
                style={{
                  backgroundColor: "#BDE958",
                  color: "#1D1D1D",
                  fontFamily: "DM Sans, sans-serif",
                }}
              >
                {notificationCount}
              </span>
            )}
          </button>
        ))}

        <button
          className="w-full flex items-center px-4 py-3 rounded-lg transition-colors duration-200"
          style={{
            color: "#ff4444",
            fontFamily: "DM Sans, sans-serif",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#3a3a3a")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "transparent")
          }
          onClick={handleLogout}
        >
          <HiOutlineLogout className="mr-3 h-5 w-5" />
          <span>Logout</span>
        </button>
      </nav>
    </div>
  );
};

export default ProfileSidebar;
