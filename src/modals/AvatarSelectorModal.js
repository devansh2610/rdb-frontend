import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Spinner } from "flowbite-react";
import { HiOutlineTrash, HiX } from "react-icons/hi";

const avatars = [
  "assets/avatars/avatar_male_1.png",
  "assets/avatars/avatar_male_2.png",
  "assets/avatars/avatar_female_1.png",
  "assets/avatars/avatar_female_2.png",
];

const AvatarSelectorModal = ({
  onClose,
  onSelect,
  onRemove,
  currentAvatar,
  isLoading,
}) => {
  const [selectedAvatar, setSelectedAvatar] = useState(null);

  const handleSelect = () => {
    if (selectedAvatar) {
      // Create full URL for the avatar
      const avatarUrl = `${selectedAvatar}`;
      onSelect(avatarUrl);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-[9999] flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-[400px] max-w-[90%] shadow-2xl relative">
        {/* Close icon at top right */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          <HiX className="w-6 h-6" />
        </button>

        <h3 className="text-xl font-bold text-center text-gray-800 dark:text-white mb-6 mt-1">
          Choose an Avatar
        </h3>

        <div className="grid grid-cols-2 gap-6 mb-8 px-4">
          {avatars.map((avatar, idx) => (
            <div
              key={idx}
              className={`relative rounded-full overflow-hidden border-3 cursor-pointer transition-all duration-300
                ${
                  selectedAvatar === avatar
                    ? "border-blue-500 shadow-xl scale-105 transform"
                    : "border-transparent hover:border-blue-300 hover:shadow-md"
                }`}
              onClick={() => setSelectedAvatar(avatar)}
            >
              <img
                src={avatar}
                alt={`Avatar ${idx + 1}`}
                className="w-full aspect-square object-cover"
              />
              {selectedAvatar === avatar && (
                <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                  <div className="bg-blue-500 rounded-full p-1.5">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 px-4">
          <button
            onClick={handleSelect}
            disabled={!selectedAvatar || isLoading}
            className={`w-full py-2.5 px-4 text-white rounded-lg transition-colors duration-200 font-medium
              ${
                selectedAvatar && !isLoading
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <Spinner size="sm" light={true} className="mr-2" />
                <span>Updating...</span>
              </div>
            ) : (
              "Apply Avatar"
            )}
          </button>

          {onRemove && (
            <button
              onClick={onRemove}
              disabled={isLoading}
              className="w-full py-2.5 px-4 text-white bg-red-600 hover:bg-red-700 rounded-lg flex items-center justify-center gap-2 font-medium"
            >
              <HiOutlineTrash className="h-5 w-5" />
              <span>Remove Avatar</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // Use createPortal to render the modal at the root level of the DOM
  return createPortal(modalContent, document.body);
};

export default AvatarSelectorModal;
