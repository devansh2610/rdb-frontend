import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  HiChartPie, 
  HiUsers, 
  HiDatabase,
  HiOutlineDatabase, 
  HiMail, 
  HiCog, 
  HiSupport, 
  HiDocumentReport, 
  HiCash,
  HiChevronDown,
  HiChevronRight,
  HiOutlineExternalLink,
  HiTicket,
  HiInbox,
  HiPencil,
  HiHome,
  HiCollection,
  HiMailOpen,
  HiChevronLeft,
  HiQuestionMarkCircle,
  HiBadgeCheck,
  HiStatusOnline,
  HiOutlineChartBar,
  HiOutlineCog,
  HiPaperAirplane,
  HiOutlineMailOpen,
  HiOutlineMail,
  HiOutlineQuestionMarkCircle,
  HiOutlineDocumentText,
  HiOutlineCash,
  HiOutlineReceiptTax
} from "react-icons/hi";
import { useAuth } from "../context/AuthContext";

// Reordered menu items - Dashboard commented out, Users first, Analytics second
const MENU_ITEMS = [
  // { id: 3, name: "Dashboard", icon: <HiOutlineChartBar className="w-5 h-5" /> },
  { id: 1, name: "Users", icon: <HiUsers className="w-5 h-5" /> },
  { id: 7, name: "Analytics", icon: <HiChartPie className="w-5 h-5" /> },
  { id: 2, name: "APIs", icon: <HiOutlineDatabase className="w-5 h-5" /> },
  { id: 4, name: "Subscription Inbox", icon: <HiInbox className="w-5 h-5" /> },
  { id: 5, name: "FAQ Inbox", icon: <HiInbox className="w-5 h-5" /> },
  { id: 0, name: "Pending Requests", icon: <HiTicket className="w-5 h-5" /> },
];

const AdminSidebar = ({ handleShowType, activeMenu }) => {
  const { getProfile } = useAuth();
  const [userInfo, setUserInfo] = useState({});
  const [isExpanded, setIsExpanded] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    email: false,
    finances: false
  });
  const navigate = useNavigate();

  useEffect(() => {
    setUserInfo(getProfile());
  }, [getProfile]);

  // Remove the initial auto-collapse to avoid animation on first load
  useEffect(() => {
    // Removed the initial collapse timer
  }, []);

  // Set expanded state based on hover
  useEffect(() => {
    if (isHovering) {
      setIsExpanded(true);
    } else {
      const collapseTimer = setTimeout(() => {
        setIsExpanded(false);
      }, 1000);
      
      return () => clearTimeout(collapseTimer);
    }
  }, [isHovering]);

  // Handle mouse enter/leave events
  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => setIsHovering(false);

  const sidebarWidth = isExpanded ? "w-64" : "w-16";
  const adminCardHeight = "h-24";
  
  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section]
    });
  };
  
  return (
    <aside 
      className={`${sidebarWidth} bg-[#28292B] shadow-sm transition-all duration-300 ease-in-out z-10 overflow-hidden`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="h-full flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        {/* Admin Card */}
        <div className={`${adminCardHeight} transition-all duration-300 flex-shrink-0 flex items-center justify-center ${isExpanded ? 'p-4' : 'p-0'}`}>
          {isExpanded ? (
            <div className="flex flex-col justify-center h-full w-full">
              <div className="bg-gradient-to-br from-[#2c2c2c] to-[#1a1a1a] rounded-xl p-4 shadow-lg transition-all duration-200 h-full flex items-center justify-between transform hover:scale-[1.02] border border-gray-800">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <img
                      className="h-12 w-12 rounded-full object-cover border-2 border-gray-700"
                      src={userInfo.imageUrl}
                      alt={userInfo.name}
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white font-bold text-sm truncate max-w-[120px]">
                      {userInfo.name || "Admin User"}
                    </span>
                    <span className="text-gray-400 text-xs">
                      {(() => {
                        if (userInfo.accessLevel === 0) return "SuperAdmin";
                        if (userInfo.accessLevel === 1) return "CRMAdmin";
                        if (userInfo.accessLevel === 2) return "APIManager";
                        if (userInfo.accessLevel === 3) return "Support";
                        return "User";
                      })()}
                    </span>
                  </div>
                </div>
                <button 
                  className="p-1 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
                  onClick={() => navigate('/profile')}
                  title="Profile Settings"
                >
                  <HiOutlineCog className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-gray-700 shadow-lg">
              <img
                className="h-full w-full object-cover"
                src={userInfo.imageUrl}
                alt={userInfo.name}
              />
            </div>
          )}
        </div>

        {/* Menu Items */}
        <nav className="mt-4 flex flex-col space-y-1 px-2 flex-grow overflow-y-auto">
          {/* Users - Now first item */}
          <button
            onClick={() => handleShowType(1)}
            className={`flex items-center px-3 py-3 rounded-lg transition-colors ${
              activeMenu === 1
                ? "bg-blue-900/20 text-blue-400"
                : "text-gray-300 hover:bg-[#161616]"
            }`}
          >
            <div className="mr-3"><HiUsers className="w-5 h-5" /></div>
            {isExpanded && <span className="text-sm font-medium">Users</span>}
          </button>

          {/* Analytics - Now second item */}
          <button
            onClick={() => handleShowType(7)}
            className={`flex items-center px-3 py-3 rounded-lg transition-colors ${
              activeMenu === 7
                ? "bg-blue-900/20 text-blue-400"
                : "text-gray-300 hover:bg-[#161616]"
            }`}
          >
            <div className="mr-3"><HiChartPie className="w-5 h-5" /></div>
            {isExpanded && <span className="text-sm font-medium">Analytics</span>}
          </button>
          
          {/* APIs */}
          <button
            onClick={() => handleShowType(2)}
            className={`flex items-center px-3 py-3 rounded-lg transition-colors ${
              activeMenu === 2
                ? "bg-blue-900/20 text-blue-400"
                : "text-gray-300 hover:bg-[#161616]"
            }`}
          >
            <div className="mr-3"><HiOutlineDatabase className="w-5 h-5" /></div>
            {isExpanded && <span className="text-sm font-medium">APIs</span>}
          </button>
          
          {/* Dashboard - commented out as per requirements */}
          {/* <button
            onClick={() => handleShowType(3)}
            className={`flex items-center px-3 py-3 rounded-lg transition-colors ${
              activeMenu === 3
                ? "bg-blue-900/20 text-blue-400"
                : "text-gray-300 hover:bg-[#161616]"
            }`}
          >
            <div className="mr-3"><HiOutlineChartBar className="w-5 h-5" /></div>
            {isExpanded && <span className="text-sm font-medium">Dashboard</span>}
          </button> */}
          
          {/* Email Section */}
          <div>
            <button
              onClick={() => toggleSection('email')}
              className={`w-full flex items-center justify-between px-3 py-3 rounded-lg transition-colors text-gray-300 hover:bg-[#161616]`}
            >
              <div className="flex items-center">
                <div className="mr-3"><HiOutlineMail className="w-5 h-5" /></div>
                {isExpanded && <span className="text-sm font-medium">Email</span>}
              </div>
              {isExpanded && (
                <div className="text-gray-400">
                  {expandedSections.email ? (
                    <HiChevronDown className="w-4 h-4" />
                  ) : (
                    <HiChevronRight className="w-4 h-4" />
                  )}
                </div>
              )}
            </button>
            
            {isExpanded && expandedSections.email && (
              <div className="ml-8 mt-1 space-y-1">
                <button
                  onClick={() => handleShowType(4)}
                  className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                    activeMenu === 4
                      ? "bg-blue-900/20 text-blue-400"
                      : "text-gray-300 hover:bg-[#161616]"
                  }`}
                >
                  <div className="mr-3"><HiInbox className="w-4 h-4" /></div>
                  <span className="text-sm">Subscription Inbox</span>
                </button>
                <button
                  onClick={() => handleShowType(5)}
                  className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                    activeMenu === 5
                      ? "bg-blue-900/20 text-blue-400"
                      : "text-gray-300 hover:bg-[#161616]"
                  }`}
                >
                  <div className="mr-3"><HiOutlineQuestionMarkCircle className="w-4 h-4" /></div>
                  <span className="text-sm">Inquiry Inbox</span>
                </button>
                <button
                  onClick={() => handleShowType(6)}
                  className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                    activeMenu === 6
                      ? "bg-blue-900/20 text-blue-400"
                      : "text-gray-300 hover:bg-[#161616]"
                  }`}
                >
                  <div className="mr-3"><HiPaperAirplane className="w-4 h-4" /></div>
                  <span className="text-sm">Compose</span>
                </button>
              </div>
            )}
          </div>
          
          {/* Finances Section */}
          <div>
            <button
              onClick={() => toggleSection('finances')}
              className={`w-full flex items-center justify-between px-3 py-3 rounded-lg transition-colors text-gray-300 hover:bg-[#161616]`}
            >
              <div className="flex items-center">
                <div className="mr-3"><HiOutlineCash className="w-5 h-5" /></div>
                {isExpanded && <span className="text-sm font-medium">Finances</span>}
              </div>
              {isExpanded && (
                <div className="text-gray-400">
                  {expandedSections.finances ? (
                    <HiChevronDown className="w-4 h-4" />
                  ) : (
                    <HiChevronRight className="w-4 h-4" />
                  )}
                </div>
              )}
            </button>
            
            {isExpanded && expandedSections.finances && (
              <div className="ml-8 mt-1 space-y-1">
                <button
                  onClick={() => handleShowType(8)}
                  className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                    activeMenu === 8
                      ? "bg-blue-900/20 text-blue-400"
                      : "text-gray-300 hover:bg-[#161616]"
                  }`}
                >
                  <div className="mr-3"><HiOutlineCash className="w-4 h-4" /></div>
                  <span className="text-sm">Transactions</span>
                </button>
                <button
                  onClick={() => handleShowType(9)}
                  className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors group ${
                    activeMenu === 9
                      ? "bg-blue-900/20 text-blue-400"
                      : "text-gray-300 hover:bg-[#161616]"
                  }`}
                >
                  <div className="mr-3"><HiOutlineReceiptTax className="w-4 h-4" /></div>
                  <span className="text-sm">Invoices</span>
                  <HiOutlineExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AdminSidebar;
