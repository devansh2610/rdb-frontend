import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { faCircleNodes } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { Modal as ModalUI } from "flowbite-react";

export default function PlaygroundModal({ name, short_description, imageUrl, route, comingSoon }) {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    if (route) {
      navigate(route);
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <div
        onClick={handleClick}
        className="relative transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg bg-white dark:bg-slate-800 dark:shadow-black/50 p-5 border rounded-lg dark:border-gray-700 cursor-pointer"
      >
        {comingSoon && (
          <div className="absolute top-2 right-1 z-50 px-2 py-0.5 text-[10px] font-semibold bg-yellow-400 text-yellow-900 rounded-full shadow-sm">
            Coming Soon
          </div>
        )}
        <div className="flex items-center gap-4">
          {imageUrl ? (
            <img
              className="w-16 h-16 object-cover rounded-lg"
              src={imageUrl}
              alt={name}
            />
          ) : (
            <span className="p-3 bg-orange-100 dark:bg-orange-700 rounded-lg">
              <FontAwesomeIcon
                icon={faCircleNodes}
                className="text-orange-500 dark:text-white"
                size="2xl"
              />
            </span>
          )}
          <div>
            <h1 className="text-lg font-semibold text-gray-800 dark:text-white">
              {name}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">{short_description}</p>
          </div>
        </div>
      </div>

      {showModal && !route && (
        <ModalUI
          dismissible={true}
          show={showModal}
          className="backdrop-blur-md"
          onClose={() => setShowModal(false)}
          size="md"
        >
          <div className="relative bg-white dark:bg-gray-800 rounded-lg p-8">
            {/* Close button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="Close"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Clock icon */}
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 rounded-full bg-[#BDE958] flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-gray-800"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-4" style={{ fontFamily: "'Sometype Mono', monospace" }}>
              Coming Soon
            </h2>

            {/* Description */}
            <p className="text-center text-gray-600 dark:text-gray-300 mb-8 px-4">
              This API playground is currently under development and will be available soon. Stay tuned for updates!
            </p>

            {/* Got it button */}
            <div className="flex justify-center">
              <button
                onClick={() => setShowModal(false)}
                className="px-12 py-3 rounded-full font-semibold text-gray-800 transition-all duration-200 hover:opacity-90"
                style={{ backgroundColor: '#BDE958' }}
              >
                Got it
              </button>
            </div>
          </div>
        </ModalUI>
      )}
    </>
  );
}