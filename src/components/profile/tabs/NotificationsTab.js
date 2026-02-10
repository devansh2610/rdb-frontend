import React from "react";
import { Button } from "flowbite-react";
import {
  HiExclamation,
  HiCreditCard,
  HiCheck,
  HiOutlineCheckCircle,
  HiOutlineTrash,
} from "react-icons/hi";

const NotificationsTab = ({
  notifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  deleteNotification,
}) => {
  return (
    <div className="animate-fadeIn" style={{ minHeight: "70vh" }}>
      <div className="flex items-center justify-between mb-6">
        <h2
          className="text-xl font-semibold text-white"
          style={{ fontFamily: "DM Sans, sans-serif" }}
        >
          Notifications
        </h2>
        {notifications.some((n) => !n.read) && (
          <button
            onClick={markAllNotificationsAsRead}
            className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{
              backgroundColor: "#BDE958",
              color: "#1D1D1D",
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div
          className="text-center py-12 rounded-lg"
          style={{
            backgroundColor: "transparent",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="#888"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <p
            style={{
              color: "#888",
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            You have no notifications
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="p-4 border rounded-lg transition-colors duration-200"
              style={{
                backgroundColor: notification.read
                  ? "#3a3a3a"
                  : "rgba(189, 233, 88, 0.1)",
                borderColor: notification.read
                  ? "#4a4a4a"
                  : "rgba(189, 233, 88, 0.3)",
              }}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-0.5 mr-3">
                  {notification.type === "warning" && (
                    <div className="p-1 rounded-full bg-yellow-100 text-yellow-600 dark:bg-yellow-800/30 dark:text-yellow-400">
                      <HiExclamation className="h-4 w-4" />
                    </div>
                  )}
                  {notification.type === "payment" && (
                    <div className="p-1 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-800/30 dark:text-blue-400">
                      <HiCreditCard className="h-4 w-4" />
                    </div>
                  )}
                  {notification.type === "security" && (
                    <div className="p-1 rounded-full bg-green-100 text-green-600 dark:bg-green-800/30 dark:text-green-400">
                      <HiCheck className="h-4 w-4" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h3
                      className="font-medium"
                      style={{
                        color: notification.read ? "#ffffff" : "#BDE958",
                        fontFamily: "DM Sans, sans-serif",
                      }}
                    >
                      {notification.title}
                    </h3>
                    <div className="flex items-center space-x-2">
                      {!notification.read && (
                        <button
                          onClick={() =>
                            markNotificationAsRead(notification.id)
                          }
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        >
                          <HiOutlineCheckCircle className="h-5 w-5" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
                      >
                        <HiOutlineTrash className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <p
                    className="mt-1"
                    style={{
                      color: "#b8b8b8",
                      fontFamily: "DM Sans, sans-serif",
                    }}
                  >
                    {notification.message}
                  </p>
                  <div
                    className="mt-2 text-xs"
                    style={{
                      color: "#888",
                      fontFamily: "DM Sans, sans-serif",
                    }}
                  >
                    {notification.timestamp}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsTab;
