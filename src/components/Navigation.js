import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Navbar, Dropdown, Avatar, Button } from "flowbite-react";
import logo_2 from "../assets/logo_2.png";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationsContext";
import { Link as SmoothLink, animateScroll as scroll } from "react-scroll";
import AnimatedTokenDisplay from "./AnimatedTokenDisplay";
import {
  HiOutlineUserCircle,
  HiOutlineLogout,
  HiOutlineBell,
  HiCheck,
  HiExclamation,
  HiCreditCard,
  HiOutlineTrash,
  HiOutlineCheckCircle,
} from "react-icons/hi";
import { CSSTransition } from "react-transition-group";

function NavigationLaptop({ stay, userInfo, logout, linkDashboardTo }) {
  const navigate = useNavigate();
  const { notifications, markAllAsRead, markAsRead, deleteNotification } =
    useNotifications();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] =
    useState(false);
  const [bellShake, setBellShake] = useState(false);
  const dropdownRef = useRef(null);
  const notificationDropdownRef = useRef(null);
  const location = useLocation();
  const isHome = location.pathname === "/";

  const handleLogout = async () => {
    try {
      setDropdownOpen(false);
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (
        notificationDropdownRef.current &&
        !notificationDropdownRef.current.contains(event.target)
      ) {
        setNotificationDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef, notificationDropdownRef]);

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  // Add bell shake effect when unread notifications exist
  useEffect(() => {
    if (unreadCount > 0) {
      setBellShake(true);
      const timer = setTimeout(() => {
        setBellShake(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [unreadCount, notifications]);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
      <div
        className="max-w-[1600px] mx-auto bg-[#1D1D1D] text-white rounded-[32px] shadow-lg shadow-black/20"
        style={{ height: "64px" }}
      >
        <div className="flex items-center justify-between h-16 px-8">
          {/* Left: Logo */}
          <div className="flex items-center min-w-[220px]">
            <Link to="/" className="flex items-center">
              <img
                src={logo_2}
                className="h-10 w-auto mr-2 bg-[#1c1c1c] rounded-lg p-1"
                alt="Foodoscope Logo"
              />
              <span className="text-xl font-semibold flex items-center">
                <span style={{ color: "#04c389" }}>Foodo</span>
                <span className="ml-0.5" style={{ color: "#fff" }}>
                  scope
                </span>
                <span style={{ color: "#04c389" }}>.</span>
              </span>
            </Link>
          </div>
          {/* Center: Menu */}
          <div className="flex-1 flex justify-center">
            <nav className="flex space-x-10">
              {userInfo ? (
                <>
                  <div>
                    <Link
                      to="/"
                      className="hover:text-emerald-400 transition-colors duration-200 text-base font-medium"
                    >
                      Home
                    </Link>
                  </div>
                  <div>
                    <Link
                      to="/playground"
                      className="hover:text-emerald-400 transition-colors duration-200 text-base font-medium"
                    >
                      Playground
                    </Link>
                  </div>
                  <div>
                    <Link
                      to="/analytics"
                      className="hover:text-emerald-400 transition-colors duration-200 text-base font-medium"
                    >
                      Analytics
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    {isHome ? (
                      <SmoothLink
                        to="explore"
                        offset={-87}
                        smooth={true}
                        className="hover:text-emerald-400 transition-colors duration-200 cursor-pointer text-base font-medium"
                      >
                        APIs
                      </SmoothLink>
                    ) : (
                      <Link
                        to="/"
                        state={{ scrollTo: "explore" }}
                        className="hover:text-emerald-400 transition-colors duration-200 text-base font-medium"
                      >
                        APIs
                      </Link>
                    )}
                  </div>
                  <div>
                    <Link
                      to="/analytics"
                      className="hover:text-emerald-400 transition-colors duration-200 text-base font-medium"
                    >
                      Analytics
                    </Link>
                  </div>
                  <div>
                    <Link
                      to="/about"
                      className="hover:text-emerald-400 transition-colors duration-200 text-base font-medium"
                    >
                      About
                    </Link>
                  </div>
                  <div>
                    {isHome ? (
                      <SmoothLink
                        to="faq"
                        offset={-87}
                        smooth={true}
                        className="hover:text-emerald-400 transition-colors duration-200 cursor-pointer text-base font-medium"
                      >
                        FAQs
                      </SmoothLink>
                    ) : (
                      <Link
                        to="/"
                        state={{ scrollTo: "faq" }}
                        className="hover:text-emerald-400 transition-colors duration-200 text-base font-medium"
                      >
                        FAQs
                      </Link>
                    )}
                  </div>
                  <div>
                    {isHome ? (
                      <SmoothLink
                        to="contact"
                        offset={-38}
                        smooth={true}
                        className="hover:text-emerald-400 transition-colors duration-200 cursor-pointer text-base font-medium"
                      >
                        Contact
                      </SmoothLink>
                    ) : (
                      <Link
                        to="/"
                        state={{ scrollTo: "contact" }}
                        className="hover:text-emerald-400 transition-colors duration-200 text-base font-medium"
                      >
                        Contact
                      </Link>
                    )}
                  </div>
                </>
              )}
            </nav>
          </div>
          {/* Right: Auth Buttons */}
          <div className="flex items-center gap-4 min-w-[220px] justify-end">
            {!userInfo && (
              <>
                <Link
                  to="/login"
                  className="text-emerald-400 hover:text-emerald-300 transition-colors text-base font-medium"
                >
                  Login
                </Link>
                <Link to="/signup">
                  <Button
                    pill={true}
                    className="bg-emerald-500 text-white border-0 px-3 text-base font-medium shadow-none focus:ring-0"
                  >
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
            {userInfo && (
              <>
                {userInfo.tokens !== undefined && (
                  <AnimatedTokenDisplay value={userInfo.tokens} />
                )}
                <div className="relative" ref={notificationDropdownRef}>
                  <button
                    className="relative p-2 text-emerald-400 rounded-lg hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-700"
                    onClick={() =>
                      setNotificationDropdownOpen(!notificationDropdownOpen)
                    }
                    aria-label="Notifications"
                  >
                    <HiOutlineBell
                      className={`h-6 w-6 ${bellShake ? "bell-shake" : ""}`}
                    />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1.5 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full notification-badge">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>
                  {/* Notification Dropdown (unchanged) */}
                  <CSSTransition
                    in={notificationDropdownOpen}
                    timeout={150}
                    classNames="dropdown"
                    unmountOnExit
                  >
                    <div
                      className="absolute right-0 mt-1 w-80 max-h-[80vh] rounded-lg shadow-xl ring-1 overflow-hidden z-[9999] dropdown-menu"
                      style={{
                        backgroundColor: "#1D1D1D",
                        borderColor: "#3a3a3a",
                      }}
                    >
                      {/* ... notification dropdown content ... */}
                      {/* Keep this block unchanged from your original code */}
                      <div
                        className="flex items-center justify-between px-4 py-2.5 border-b"
                        style={{
                          backgroundColor: "#1D1D1D",
                          borderColor: "#3a3a3a",
                        }}
                      >
                        <h3
                          className="text-sm font-semibold text-white"
                          style={{ fontFamily: "Sometype Mono, monospace" }}
                        >
                          Notifications
                        </h3>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs font-medium transition-colors"
                            style={{
                              color: "#BDE958",
                              fontFamily: "DM Sans, sans-serif",
                            }}
                            onMouseEnter={(e) =>
                              (e.target.style.opacity = "0.8")
                            }
                            onMouseLeave={(e) => (e.target.style.opacity = "1")}
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>
                      <div className="max-h-[calc(80vh-130px)] overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`relative px-4 py-3 border-b last:border-0 transition-colors ${notification.read ? "opacity-75" : ""
                                } notification-item cursor-pointer`}
                              style={{ borderColor: "#3a3a3a" }}
                              onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "#3a3a3a")
                              }
                              onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "transparent")
                              }
                            >
                              <div className="flex items-start">
                                <div className="flex-shrink-0 mt-0.5">
                                  {notification.type === "warning" && (
                                    <div
                                      className="p-1 rounded-full"
                                      style={{
                                        backgroundColor:
                                          "rgba(189, 233, 88, 0.2)",
                                        color: "#BDE958",
                                      }}
                                    >
                                      <HiExclamation className="h-4 w-4" />
                                    </div>
                                  )}
                                  {notification.type === "payment" && (
                                    <div
                                      className="p-1 rounded-full"
                                      style={{
                                        backgroundColor:
                                          "rgba(189, 233, 88, 0.2)",
                                        color: "#BDE958",
                                      }}
                                    >
                                      <HiCreditCard className="h-4 w-4" />
                                    </div>
                                  )}
                                  {notification.type === "security" && (
                                    <div
                                      className="p-1 rounded-full"
                                      style={{
                                        backgroundColor:
                                          "rgba(189, 233, 88, 0.2)",
                                        color: "#BDE958",
                                      }}
                                    >
                                      <HiCheck className="h-4 w-4" />
                                    </div>
                                  )}
                                </div>
                                <div
                                  className="ml-3 flex-1 cursor-pointer"
                                  onClick={() =>
                                    !notification.read &&
                                    markAsRead(notification.id)
                                  }
                                >
                                  <p
                                    className="text-sm font-medium text-white flex items-center"
                                    style={{
                                      fontFamily: "DM Sans, sans-serif",
                                    }}
                                  >
                                    {notification.title}
                                    {!notification.read && (
                                      <span className="ml-2 notification-dot"></span>
                                    )}
                                  </p>
                                  <p
                                    className="mt-1 text-xs text-gray-400"
                                    style={{
                                      fontFamily: "DM Sans, sans-serif",
                                    }}
                                  >
                                    {notification.message}
                                  </p>
                                  <p
                                    className="mt-1 text-xs text-gray-500"
                                    style={{
                                      fontFamily: "DM Sans, sans-serif",
                                    }}
                                  >
                                    {notification.timestamp}
                                  </p>
                                </div>
                                <div className="absolute top-3 right-2 flex space-x-1">
                                  {!notification.read && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        markAsRead(notification.id);
                                      }}
                                      className="text-gray-400 transition-colors p-1 rounded-full cursor-pointer"
                                      aria-label="Mark as read"
                                      title="Mark as read"
                                      style={{ color: "#BDE958" }}
                                      onMouseEnter={(e) =>
                                      (e.currentTarget.style.backgroundColor =
                                        "rgba(189, 233, 88, 0.2)")
                                      }
                                      onMouseLeave={(e) =>
                                      (e.currentTarget.style.backgroundColor =
                                        "transparent")
                                      }
                                    >
                                      <HiOutlineCheckCircle className="h-4 w-4" />
                                    </button>
                                  )}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteNotification(notification.id);
                                    }}
                                    className="text-gray-400 transition-colors p-1 rounded-full cursor-pointer"
                                    aria-label="Delete notification"
                                    title="Delete notification"
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.color = "#ffffff";
                                      e.currentTarget.style.backgroundColor =
                                        "#3a3a3a";
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.color = "#9ca3af";
                                      e.currentTarget.style.backgroundColor =
                                        "transparent";
                                    }}
                                  >
                                    <HiOutlineTrash className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="notification-empty-state">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-12 w-12 mb-3"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              style={{ color: "#BDE958" }}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                              />
                            </svg>
                            <p
                              className="text-sm text-gray-400"
                              style={{ fontFamily: "DM Sans, sans-serif" }}
                            >
                              No notifications yet
                            </p>
                            <p
                              className="text-xs text-gray-500 mt-1"
                              style={{ fontFamily: "DM Sans, sans-serif" }}
                            >
                              We'll notify you when something arrives
                            </p>
                          </div>
                        )}
                      </div>
                      <div
                        className="px-4 py-2.5 text-center border-t"
                        style={{
                          backgroundColor: "#1D1D1D",
                          borderColor: "#3a3a3a",
                        }}
                      >
                        <button
                          onClick={() => {
                            navigate("/profile?tab=notifications");
                            setNotificationDropdownOpen(false);
                          }}
                          className="text-sm font-medium transition-colors px-2 py-1 rounded-md cursor-pointer"
                          style={{
                            color: "#BDE958",
                            fontFamily: "DM Sans, sans-serif",
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = "#2d2d2d";
                            e.target.style.opacity = "0.8";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = "transparent";
                            e.target.style.opacity = "1";
                          }}
                        >
                          View all notifications
                        </button>
                      </div>
                    </div>
                  </CSSTransition>
                </div>
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full transition-all"
                    style={{
                      backgroundColor: "#000000",
                      fontFamily: "DM Sans, sans-serif",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#0a0a0a")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "#000000")
                    }
                  >
                    <Avatar
                      rounded
                      size="xs"
                      alt="User profile"
                      img={
                        userInfo?.imageUrl ||
                        "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png"
                      }
                      className="bg-white rounded-full"
                    />
                    <span
                      className="font-medium"
                      style={{
                        color: "#FFFFFF",
                        fontSize: "14px",
                      }}
                    >
                      Profile
                    </span>
                    <svg
                      className="w-4 h-4"
                      style={{ color: "#FFFFFF" }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  <CSSTransition
                    in={dropdownOpen}
                    timeout={150}
                    classNames="dropdown"
                    unmountOnExit
                  >
                    <div className="absolute right-0 mt-2 w-56 rounded-xl shadow-xl bg-[#1a1a1a] ring-1 ring-gray-700 border border-gray-700 overflow-hidden z-[9999] dropdown-menu">
                      {/* ... profile dropdown content ... */}
                      <div className="py-1 bg-[#1a1a1a]">
                        {(userInfo?.accessLevel === 0 ||
                          userInfo?.accessLevel === 1) && (
                            <button
                              onClick={() => {
                                navigate("/admin");
                                setDropdownOpen(false);
                              }}
                              className="flex w-full items-center px-4 py-2.5 text-sm text-white hover:bg-[#292929] transition-colors duration-200 profile-dropdown-item cursor-pointer"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-white mr-2.5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <span>Admin Panel</span>
                            </button>
                          )}
                        <button
                          onClick={() => {
                            navigate("/profile");
                            setDropdownOpen(false);
                          }}
                          className="flex w-full items-center px-4 py-2.5 text-sm text-white hover:bg-[#292929] transition-colors duration-200 profile-dropdown-item cursor-pointer"
                        >
                          <HiOutlineUserCircle className="h-5 w-5 text-white mr-2.5" />
                          <span>Profile</span>
                        </button>
                        <button
                          onClick={() => {
                            navigate("/profile?tab=api-key");
                            setDropdownOpen(false);
                          }}
                          className="flex w-full items-center px-4 py-2.5 text-sm text-white hover:bg-[#292929] transition-colors duration-200 profile-dropdown-item cursor-pointer"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-white mr-2.5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>API Key</span>
                        </button>
                        <button
                          onClick={() => {
                            navigate("/profile?tab=tokens");
                            setDropdownOpen(false);
                          }}
                          className="flex w-full items-center px-4 py-2.5 text-sm text-white hover:bg-[#292929] transition-colors duration-200 profile-dropdown-item cursor-pointer"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-white mr-2.5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>Tokens</span>
                        </button>
                        <button
                          onClick={() => {
                            navigate("/profile?tab=settings");
                            setDropdownOpen(false);
                          }}
                          className="flex w-full items-center px-4 py-2.5 text-sm text-white hover:bg-[#292929] transition-colors duration-200 profile-dropdown-item cursor-pointer"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-white mr-2.5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>Settings</span>
                        </button>
                      </div>
                      <div className="border-t border-gray-700 bg-[#1a1a1a]">
                        <button
                          onClick={() => {
                            handleLogout();
                            setDropdownOpen(false);
                          }}
                          className="flex w-full items-center px-4 py-2.5 text-sm text-red-400 hover:bg-[#292929] hover:text-red-300 transition-colors duration-200 group cursor-pointer"
                        >
                          <HiOutlineLogout className="h-5 w-5 mr-2.5" />
                          <span className="font-medium">
                            Log out
                          </span>
                        </button>
                      </div>
                    </div>
                  </CSSTransition>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function NavigationMobile({ stay, userInfo, logout, linkDashboardTo }) {
  const navigate = useNavigate();
  const { notifications, markAllAsRead, markAsRead, deleteNotification } =
    useNotifications();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] =
    useState(false);
  const [bellShake, setBellShake] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notificationDropdownRef = useRef(null);
  const location = useLocation();
  const isHome = location.pathname === "/";

  const handleLogout = async () => {
    try {
      setDropdownOpen(false);
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (
        notificationDropdownRef.current &&
        !notificationDropdownRef.current.contains(event.target)
      ) {
        setNotificationDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef, notificationDropdownRef]);

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  useEffect(() => {
    if (unreadCount > 0) {
      setBellShake(true);
      const timer = setTimeout(() => {
        setBellShake(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [unreadCount, notifications]);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
      <div className="bg-[#1D1D1D] text-white rounded-[32px] shadow-lg shadow-black/20">
        <div className="flex items-center justify-between h-16 px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img
              src={logo_2}
              className="h-9 w-auto mr-2 bg-[#1c1c1c] rounded-lg p-1"
              alt="Foodoscope Logo"
            />
            <span className="text-xl font-semibold flex items-center">
              <span style={{ color: "#04c389" }}>Foodo</span>
              <span className="ml-0.5" style={{ color: "#fff" }}>
                scope
              </span>
              <span style={{ color: "#04c389" }}>.</span>
            </span>
          </Link>
          {/* Hamburger */}
          <button
            className="md:hidden flex flex-col justify-center items-center w-10 h-10 rounded focus:outline-none focus:ring-2 focus:ring-emerald-400"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span
              className={`block w-6 h-0.5 bg-white mb-1 transition-all ${menuOpen ? "rotate-45 translate-y-1.5" : ""
                }`}
            ></span>
            <span
              className={`block w-6 h-0.5 bg-white mb-1 transition-all ${menuOpen ? "opacity-0" : ""
                }`}
            ></span>
            <span
              className={`block w-6 h-0.5 bg-white transition-all ${menuOpen ? "-rotate-45 -translate-y-1.5" : ""
                }`}
            ></span>
          </button>
        </div>
        {/* Slide-down menu */}
        <div
          className={`md:hidden bg-[#232323] text-white w-full shadow transition-all duration-300 overflow-hidden ${menuOpen ? "max-h-[500px] py-4" : "max-h-0 py-0"
            } flex flex-col gap-2`}
          style={{ transitionProperty: "max-height, padding" }}
        >
          <nav className="flex flex-col items-center gap-2">
            {userInfo ? (
              <>
                <Link
                  to="/"
                  className="py-2 w-full text-center hover:text-emerald-400"
                  onClick={() => setMenuOpen(false)}
                >
                  Home
                </Link>
                {(userInfo?.accessLevel === 0 || userInfo?.accessLevel === 1) && (
                  <Link
                    to="/admin"
                    className="py-2 w-full text-center hover:text-emerald-400"
                    onClick={() => setMenuOpen(false)}
                  >
                    Admin Panel
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="py-2 w-full text-center hover:text-emerald-400"
                  onClick={() => setMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  to="/playground"
                  className="py-2 w-full text-center hover:text-emerald-400"
                  onClick={() => setMenuOpen(false)}
                >
                  Playground
                </Link>
                <Link
                  to="/analytics"
                  className="py-2 w-full text-center hover:text-emerald-400"
                  onClick={() => setMenuOpen(false)}
                >
                  Analytics
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/"
                  className="py-2 w-full text-center hover:text-emerald-400"
                  onClick={() => setMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  to="/about"
                  className="py-2 w-full text-center hover:text-emerald-400"
                  onClick={() => setMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  to="/"
                  state={{ scrollTo: "faq" }}
                  className="py-2 w-full text-center hover:text-emerald-400"
                  onClick={() => setMenuOpen(false)}
                >
                  FAQs
                </Link>
                <Link
                  to="/"
                  state={{ scrollTo: "contact" }}
                  className="py-2 w-full text-center hover:text-emerald-400"
                  onClick={() => setMenuOpen(false)}
                >
                  Contact
                </Link>
              </>
            )}
          </nav>
          <div className="flex flex-col items-center gap-2 mt-2">
            {!userInfo ? (
              <>
                <Link
                  to="/login"
                  className="text-emerald-400 hover:text-emerald-300 transition-colors text-base font-medium w-full text-center"
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="w-full flex justify-center"
                  onClick={() => setMenuOpen(false)}
                >
                  <Button
                    pill={true}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 px-6 py-2 text-base font-medium shadow-none focus:ring-0 w-full"
                  >
                    Sign Up
                  </Button>
                </Link>
              </>
            ) : (
              <>
                {userInfo.tokens !== undefined && (
                  <div className="w-full flex justify-center">
                    <AnimatedTokenDisplay value={userInfo.tokens} />
                  </div>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full py-2 text-red-400 hover:text-red-600"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Navigation({ stay }) {
  const { getProfile, getToken, logout, TOKEN_UPDATE_EVENT } = useAuth();
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(() => getToken() !== 0);
  const [userInfo, setUserInfo] = useState(() => getProfile());
  const [tokens, setTokens] = useState(() => getToken());
  const [openModal, setOpenModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    // Listen for token updates, including logout
    const handleTokenUpdate = (event) => {
      const { loggedOut } = event.detail || {};

      if (loggedOut) {
        // Immediately update UI state on logout
        setIsUserLoggedIn(false);
        setUserInfo(null);
      } else {
        // For other token updates
        const newUserInfo = getProfile();
        setUserInfo(newUserInfo);
        setIsUserLoggedIn(getToken() !== 0);
      }
    };

    window.addEventListener(TOKEN_UPDATE_EVENT, handleTokenUpdate);
    return () =>
      window.removeEventListener(TOKEN_UPDATE_EVENT, handleTokenUpdate);
  }, [TOKEN_UPDATE_EVENT, getProfile, getToken]);

  useEffect(() => {
    function handleScreenSize() {
      setScreenWidth(window.innerWidth);
    }

    window.addEventListener("resize", handleScreenSize);
    return () => {
      window.removeEventListener("resize", handleScreenSize);
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      setUserInfo(getProfile());
      setIsUserLoggedIn(getToken() !== 0);
    } else {
      setIsUserLoggedIn(false);
    }
  }, [getProfile, getToken]);

  // Use a less frequent update interval
  useEffect(() => {
    if (userInfo) {
      const intervalId = setInterval(() => {
        setUserInfo(getProfile());
        setIsUserLoggedIn(getToken() !== 0);
      }, 30000); // Update every 30 seconds instead of 5 seconds

      return () => clearInterval(intervalId);
    }
  }, [userInfo, getProfile, getToken]);

  const linkDashboardTo = (userInfo) => {
    if (!userInfo) return "/";
    // Allow both accessLevel 0 (SuperAdmin) and accessLevel 1 (CRMAdmin) to access the admin panel
    if (
      userInfo.accessLevel !== undefined &&
      (userInfo.accessLevel === 0 || userInfo.accessLevel === 1)
    ) {
      return "/admin";
    }
    return "/";
  };

  return (
    <>
      {screenWidth > 768 ? (
        <NavigationLaptop
          stay={stay}
          userInfo={userInfo ? { ...userInfo, tokens } : null}
          logout={logout}
          linkDashboardTo={linkDashboardTo}
        />
      ) : (
        <NavigationMobile
          stay={stay}
          userInfo={userInfo ? { ...userInfo, tokens } : null}
          logout={logout}
          linkDashboardTo={linkDashboardTo}
        />
      )}
    </>
  );
}
