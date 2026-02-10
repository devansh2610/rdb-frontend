import React from "react";
import { Modal } from "flowbite-react";
import { HiSearch } from "react-icons/hi";

const ApiUsageModal = ({ show, onClose, selectedUserApis }) => {
  return (
    <Modal show={show} onClose={onClose} size="2xl">
      {/* Custom Header */}
      <div className="bg-[#18191A] border-b border-gray-700 px-6 py-4 rounded-t-lg">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">
              {selectedUserApis?.email?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">API Usage Details</h3>
            <p className="text-sm text-gray-400">{selectedUserApis?.email}</p>
          </div>
        </div>
      </div>

      {/* Custom Body */}
      <div className="bg-[#18191A] p-0">
        <div className="max-h-96 overflow-y-auto">
          {selectedUserApis?.endpoints && Object.keys(selectedUserApis.endpoints).length > 0 ? (
            <div className="divide-y divide-gray-700">
              {Object.entries(selectedUserApis.endpoints)
                .sort(([, a], [, b]) => b - a)
                .map(([endpoint, count], index) => (
                  <div key={endpoint} className="p-4 hover:bg-[#23272F] transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                            {index + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-mono text-white bg-gray-800 px-3 py-2 rounded-lg break-all">
                              {endpoint}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex-shrink-0 ml-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {count} calls
                        </span>
                      </div>
                    </div>
                    {/* Usage bar */}
                    <div className="mt-3 ml-9">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${(count / Math.max(...Object.values(selectedUserApis.endpoints))) * 100}%`
                            }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-400 min-w-fit">
                          {((count / Object.values(selectedUserApis.endpoints).reduce((a, b) => a + b, 0)) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <HiSearch className="w-8 h-8 text-gray-500" />
              </div>
              <p className="text-gray-400">No API endpoints found for this user</p>
            </div>
          )}
        </div>
      </div>

      {/* Custom Footer */}
      <div className="bg-[#18191A] border-t border-gray-700 px-6 py-4 rounded-b-lg">
        <div className="flex justify-between items-center w-full">
          <div className="text-sm text-gray-400">
            Total APIs: {selectedUserApis?.endpoints ? Object.keys(selectedUserApis.endpoints).length : 0} |
            Total Calls: {selectedUserApis?.endpoints ? Object.values(selectedUserApis.endpoints).reduce((a, b) => a + b, 0) : 0}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ApiUsageModal;