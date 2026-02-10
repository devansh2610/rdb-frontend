// ApiInfoModal

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState, useEffect } from "react";
import { faCircleNodes } from "@fortawesome/free-solid-svg-icons";
import { Modal as ModalUI, Badge } from "flowbite-react";

export default function ApiInfoModal({
  name,
  short_description,
  long_description,
  imageUrl = "",
  link,
  subapis,
  comingSoon = false,
  showModal = false,
  setShowModal = () => {},
  triggerElement = null
}) {
  // STATE VARIABLES
  const [internalShowModal, setInternalShowModal] = useState(false);
  
  // Use external control if provided, otherwise use internal state
  const isModalOpen = showModal !== undefined ? showModal : internalShowModal;
  const handleModalToggle = setShowModal !== undefined ? setShowModal : setInternalShowModal;
  
  const infoVarMap = {
    Description: long_description,
    // Documentation: link,
  };

  const containerStyle = {
    overflowX: 'scroll',
  };

  return (
  <>
    {triggerElement && (
      <div onClick={() => handleModalToggle(true)}>
        {triggerElement}
      </div>
    )}
    
    {!triggerElement && (
      <div
        onClick={() => handleModalToggle(true)}
        className="relative transition ease-in-out duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-lg bg-white dark:bg-slate-700 dark:shadow-black/50 p-6 border rounded-xl dark:border-gray-700 hover:cursor-pointer"
      >
        {/* Single "Coming Soon" badge in top-right corner */}
        {comingSoon && (
          <div className="absolute top-2 right-2 z-10 px-2 py-0.5 text-[10px] font-semibold bg-yellow-400 text-yellow-900 rounded-full shadow-sm">
            Coming Soon
          </div>
        )}

        {/* Card Content */}
        <div className="md:flex md:items-start md:-mx-4 relative z-0">
          {imageUrl ? (
            <img
              className="inline-block rounded-xl md:mx-4 w-14 h-14 object-cover"
              src={imageUrl}
              alt={`${name} logo`}
            />
          ) : (
            <span className="inline-block p-3 text-orange-500 bg-orange-100 rounded-xl md:mx-4 dark:text-white">
              <FontAwesomeIcon icon={faCircleNodes} className="text-orange-500" size="2xl" />
            </span>
          )}
          <div className="mt-4 md:mx-4 md:mt-0 md:w-4/5">
            <h1 className="text-xl truncate font-medium text-gray-700 dark:text-white">
              {name}
            </h1>
            <p className="mt-1 text-gray-500 dark:text-gray-300">
              {short_description}
            </p>
          </div>
        </div>
      </div>
    )}

    {/* Modal */}
    {isModalOpen && (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={() => handleModalToggle(false)}
        ></div>
        
        {/* Modal Content */}
        <div className="flex min-h-full items-center justify-center p-4">
          <div 
            className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button - Top Right Corner - More Prominent */}
            <button
              onClick={() => handleModalToggle(false)}
              className="absolute -top-2 -right-2 z-50 text-white bg-red-500 hover:bg-red-600 rounded-full p-3 transition-colors duration-200 shadow-xl border-2 border-white"
              aria-label="Close modal"
              style={{ 
                fontSize: '20px',
                lineHeight: '1',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ×
            </button>

            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {name}
              </h2>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4">
              <div className="flex flex-col gap-6 text-md">
                {Object.keys(infoVarMap).map((info) => (
                  <div key={info} className="flex flex-col gap-1">
                    <p className="font-medium dark:text-white">{info}</p>
                    <p className="text-slate-700 dark:text-slate-100">
                      {infoVarMap[info] || "Not Found"}
                    </p>
                  </div>
                ))}

                <div className="flex flex-col gap-1">
                  <p className="font-medium dark:text-white">API Endpoints</p>
                  <div className="flex flex-row flex-wrap gap-2">
                    {subapis.length > 0 ? (
                      subapis.map((subapi, i) => (
                        <Badge key={i} color="info" size="sm">
                          {subapi.name}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-slate-700 dark:text-slate-100">
                        Not Found
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
  </>
  );
}
