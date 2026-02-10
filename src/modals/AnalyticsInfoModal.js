import { Modal } from "flowbite-react";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartLine, faWrench, faRocket } from "@fortawesome/free-solid-svg-icons";

export default function AnalyticsInfoModal({ show, onClose }) {
  return (
    <Modal
      dismissible={true}
      show={show}
      onClose={onClose}
      size="lg"
      className="backdrop-blur-lg"
      popup
    >
      <Modal.Header className="border-b-0 px-6 pt-5"/>
      <Modal.Body className="px-6">
        <div className="flex flex-col items-center text-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-5 shadow-lg">
            <FontAwesomeIcon
              icon={faChartLine}
              className="text-white text-2xl"
            />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
            Analytics Dashboard Coming Soon
          </h3>
          <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full my-3"></div>
          <p className="text-gray-500 dark:text-gray-300 mb-5">
            We're currently enhancing our Analytics Dashboard with real-time data processing capabilities.
          </p>
          
          <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-xl w-full mb-5">
            <div className="flex items-start gap-4 mb-3">
              <div className="mt-1">
                <FontAwesomeIcon 
                  icon={faWrench} 
                  className="text-blue-500 dark:text-blue-400" 
                />
              </div>
              <div className="text-left">
                <h4 className="font-medium text-gray-800 dark:text-white">Under Development</h4>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Our team is working diligently to connect your real data to these visualizations.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="mt-1">
                <FontAwesomeIcon 
                  icon={faRocket} 
                  className="text-blue-500 dark:text-blue-400" 
                />
              </div>
              <div className="text-left">
                <h4 className="font-medium text-gray-800 dark:text-white">Preview Mode</h4>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  What you see now is a preview of how your analytics dashboard will look with your actual data.
                </p>
              </div>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200"
          >
            Continue to Preview
          </button>
        </div>
      </Modal.Body>
    </Modal>
  );
} 