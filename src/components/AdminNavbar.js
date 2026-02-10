import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Avatar, DarkThemeToggle } from "flowbite-react";
import { useAuth } from "../context/AuthContext";
import { CSSTransition } from 'react-transition-group';
import logo from '../assets/logo_2.png';
import { 
  HiOutlineSearch, 
  HiOutlineBell, 
  HiOutlineUserCircle, 
  HiOutlineCog, 
  HiOutlineLogout, 
  HiOutlineMenuAlt2,
  HiOutlineArrowCircleRight,
  HiOutlineExclamationCircle,
  HiX,
  HiOutlineUsers,
  HiOutlineDocument
} from "react-icons/hi";

const AdminNavbar = ({ userInfo, users = [], handleGlobalSearch = () => {} }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const dropdownRef = useRef(null);
  const notificationDropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();
  const { logout, getProfile } = useAuth();
  const [adminProfile, setAdminProfile] = useState({});

  // Sample notifications
  const [notifications, setNotifications] = useState([
    { 
      id: 1, 
      title: 'System Maintenance',
      message: 'Scheduled maintenance in 30 minutes',
      timestamp: '10 minutes ago',
      read: false,
      type: 'warning'
    },
    { 
      id: 2, 
      title: 'New User Registration',
      message: 'John Doe just registered',
      timestamp: '25 minutes ago',
      read: false,
      type: 'info'
    },
    { 
      id: 3, 
      title: 'Database Backup Complete',
      message: 'Backup saved to cloud storage',
      timestamp: '1 hour ago',
      read: true,
      type: 'success'
    }
  ]);

  // Fetch admin profile data
  useEffect(() => {
    setAdminProfile(getProfile());
  }, [getProfile]);

  // Global search functionality
  useEffect(() => {
    if (searchQuery.length > 1) {
      // Search users
      const filteredUsers = users.filter(user => 
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 3); // Limit to top 3 results
      
      // Create search results
      const results = [
        ...filteredUsers.map(user => ({
          id: user._id,
          type: 'user',
          title: user.name || user.email?.split('@')[0],
          subtitle: user.email,
          action: () => {
            handleGlobalSearch(user);
            setSearchOpen(false);
            setSearchQuery('');
            navigate('/admin?tab=users');
          }
        }))
      ];
      
      // Add some predefined sections/pages
      if ('dashboard'.includes(searchQuery.toLowerCase())) {
        results.push({
          id: 'dashboard',
          type: 'page',
          title: 'Dashboard',
          subtitle: 'Overview and statistics',
          action: () => {
            setSearchOpen(false);
            setSearchQuery('');
            navigate('/admin?tab=dashboard');
          }
        });
      }
      
      if ('user'.includes(searchQuery.toLowerCase())) {
        results.push({
          id: 'users',
          type: 'page',
          title: 'User Management',
          subtitle: 'View and manage users',
          action: () => {
            setSearchOpen(false);
            setSearchQuery('');
            navigate('/admin?tab=users');
          }
        });
      }
      
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, users, navigate, handleGlobalSearch]);

  // Mark notification as read
  const markAsRead = (id) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };
  
  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
  };
  
  // Delete notification
  const deleteNotification = (id) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      setDropdownOpen(false);
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Handle click outside of dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target)) {
        setNotificationDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef, notificationDropdownRef]);

  // Focus search input when search is opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Count unread notifications
  const unreadCount = notifications.filter(notification => !notification.read).length;

  // Get admin name from profile
  const adminName = adminProfile?.firstName ? 
    `${adminProfile.firstName} ${adminProfile.lastName || ''}` : 
    (adminProfile?.name || "Admin User");

  return (
    // <nav className="bg-[#161616] shadow-sm py-3 px-6 relative z-40">
    <nav className="bg-[#28292B] shadow-sm py-3 px-6 relative z-40">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button 
            className="p-2 mr-3 rounded-lg hover:bg-gray-800 lg:hidden"
            aria-label="Toggle sidebar"
          >
            <HiOutlineMenuAlt2 className="w-6 h-6 text-gray-300" />
          </button>
          
          <div className="flex items-center mr-6">
            <img src={logo} className="h-8 mr-2" alt="Logo" />
            <span className="text-lg font-semibold hidden md:block" style={{ cursor: 'default' }}>
              <span style={{ color: "#04c389" }}>Foodo</span>
              <span className="text-[#d9d9d9]">scope</span>
              <span style={{ color: "#04c389" }}>.</span>
            </span>
          </div>
        </div>

        <div className="flex flex-1 justify-center mx-4">
          <div className="relative max-w-md w-full">
            <button
              className="w-full flex items-center p-2 rounded-lg bg-[#161616] hover:bg-gray-800 text-gray-300 transition-colors"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Search"
            >
              <HiOutlineSearch className="w-5 h-5 ml-1 mr-2" />
              <span className="text-sm font-medium text-gray-400">Search...</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative" ref={notificationDropdownRef}>
            <button
              className="relative p-2 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
              onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
              aria-label="Notifications"
            >
              <HiOutlineBell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <CSSTransition
              in={notificationDropdownOpen}
              timeout={150}
              classNames="dropdown"
              unmountOnExit
            >
              <div className="absolute right-0 mt-2 w-80 max-h-96 rounded-lg shadow-xl bg-[#28292B] ring-1 ring-black ring-opacity-5 overflow-hidden z-50">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-700">
                  <h3 className="text-sm font-semibold text-white">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map(notification => (
                      <div
                        key={notification.id}
                        className={`relative px-4 py-3 border-b border-gray-700 last:border-0 hover:bg-gray-700 transition-colors ${notification.read ? '' : 'bg-gray-800/40'}`}
                      >
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mt-0.5">
                            {notification.type === 'warning' && (
                              <div className="p-1 rounded-full bg-yellow-800/30 text-yellow-400">
                                <HiOutlineExclamationCircle className="h-4 w-4" />
                              </div>
                            )}
                            {notification.type === 'info' && (
                              <div className="p-1 rounded-full bg-blue-800/30 text-blue-400">
                                <HiOutlineUserCircle className="h-4 w-4" />
                              </div>
                            )}
                            {notification.type === 'success' && (
                              <div className="p-1 rounded-full bg-green-800/30 text-green-400">
                                <HiOutlineArrowCircleRight className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                          <div className="ml-3 flex-1" onClick={() => !notification.read && markAsRead(notification.id)}>
                            <p className="text-sm font-medium text-white flex items-center">
                              {notification.title}
                              {!notification.read && (
                                <span className="ml-2 w-2 h-2 rounded-full bg-blue-500" />
                              )}
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                              {notification.message}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              {notification.timestamp}
                            </p>
                          </div>
                          <button 
                            className="absolute top-2 right-2 text-gray-400 hover:text-gray-300 p-1"
                            onClick={() => deleteNotification(notification.id)}
                            aria-label="Delete notification"
                          >
                            <HiX className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 px-4 text-center">
                      <HiOutlineBell className="h-10 w-10 mx-auto text-gray-600 mb-2" />
                      <p className="text-sm text-gray-400">No notifications yet</p>
                    </div>
                  )}
                </div>

                {notifications.length > 0 && (
                  <div className="bg-[#28292B] px-4 py-2.5 text-center border-t border-gray-700">
                    <button
                      className="text-sm font-medium text-gray-300 hover:text-blue-400 transition-colors"
                    >
                      View all notifications
                    </button>
                  </div>
                )}
              </div>
            </CSSTransition>
          </div>

          <DarkThemeToggle />

          <div className="relative" ref={dropdownRef}>
            <button
              className="flex items-center text-gray-300"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <Avatar 
                rounded 
                size="sm"
                img={userInfo.imageUrl}
                alt={adminName} 
              />
              <div className="hidden md:flex flex-col ml-2 text-left">
                <span className="text-sm font-medium text-white truncate max-w-[120px]">
                  {adminName}
                </span>
                <span className="text-xs text-gray-400">
                  {(() => {
                    if (userInfo.accessLevel === 0) return "SuperAdmin";
                    if (userInfo.accessLevel === 1) return "CRMAdmin";
                    if (userInfo.accessLevel === 2) return "APIManager";
                    if (userInfo.accessLevel === 3) return "Support";
                    return "User";
                  })()}
                </span>
              </div>
              <svg 
                className="w-4 h-4 ml-2 hidden md:block" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
                  clipRule="evenodd" 
                />
              </svg>
            </button>

            <CSSTransition
              in={dropdownOpen}
              timeout={150}
              classNames="dropdown"
              unmountOnExit
            >
              <div className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg bg-[#28292B] ring-1 ring-black ring-opacity-5 z-50">
                <div className="py-2 px-4 border-b border-gray-700">
                  <p className="text-sm font-semibold text-white">
                    {adminName}
                  </p>
                  <p className="text-sm text-gray-400 truncate">
                    {adminProfile?.email || userInfo?.email || "admin@example.com"}
                  </p>
                </div>

                <div className="py-1">
                  <button 
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate('/profile');
                    }}
                  >
                    <HiOutlineUserCircle className="w-4 h-4 mr-2" />
                    Profile
                  </button>

                  <button 
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate('/settings');
                    }}
                  >
                    <HiOutlineCog className="w-4 h-4 mr-2" />
                    Settings
                  </button>
                  
                  <Link 
                    to="/"
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <HiOutlineArrowCircleRight className="w-4 h-4 mr-2" />
                    Exit to Website
                  </Link>
                </div>

                <div className="py-1 border-t border-gray-700">
                  <button 
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-red-600 hover:text-white"
                    onClick={handleLogout}
                  >
                    <HiOutlineLogout className="w-4 h-4 mr-2" />
                    Logout
                  </button>
                </div>
              </div>
            </CSSTransition>
          </div>
          
          <Link
            to="/"
            className="flex items-center p-2 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors group relative ml-2"
            aria-label="Exit to website"
          >
            <HiOutlineLogout className="h-5 w-5 mr-1" />
            <span className="text-sm font-medium">Exit</span>
            <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
              Exit to Website
            </span>
          </Link>
        </div>
      </div>

      {/* Search Overlay */}
      <CSSTransition
        in={searchOpen}
        timeout={200}
        classNames="search-overlay"
        unmountOnExit
      >
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-20">
          <div className="bg-[#28292B] w-full max-w-2xl rounded-lg shadow-xl overflow-hidden ring-1 ring-gray-700">
            <div className="relative">
              <HiOutlineSearch className="w-5 h-5 absolute top-4 left-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search for users, APIs, settings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-3 px-12 text-white bg-transparent border-none focus:outline-none focus:ring-0 text-lg"
              />
              <button 
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-300"
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery('');
                }}
              >
                <HiX className="w-5 h-5" />
              </button>
            </div>
            
            {searchQuery && (
              <div className="p-4 border-t border-gray-700">
                <p className="text-sm text-gray-400 mb-2">Search results</p>
                {searchQuery.length > 1 ? (
                  searchResults.length > 0 ? (
                    <div className="space-y-2">
                      {searchResults.map(result => (
                        <div 
                          key={result.id}
                          className="p-2 hover:bg-gray-700 rounded-lg cursor-pointer flex items-center"
                          onClick={result.action}
                        >
                          {result.type === 'user' && <HiOutlineUsers className="w-4 h-4 mr-2 text-gray-400" />}
                          {result.type === 'page' && <HiOutlineDocument className="w-4 h-4 mr-2 text-gray-400" />}
                          <div>
                            <span className="text-sm text-gray-300">{result.title}</span>
                            {result.subtitle && (
                              <p className="text-xs text-gray-500">{result.subtitle}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-4">
                      <HiOutlineExclamationCircle className="w-8 h-8 mx-auto text-gray-500 mb-2" />
                      <p className="text-sm text-gray-400">No results found</p>
                    </div>
                  )
                ) : (
                  <div className="text-center p-4">
                    <HiOutlineExclamationCircle className="w-8 h-8 mx-auto text-gray-500 mb-2" />
                    <p className="text-sm text-gray-400">Type at least 2 characters to search</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CSSTransition>
    </nav>
  );
};

export default AdminNavbar; 