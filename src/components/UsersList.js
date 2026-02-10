import React, { useState, useEffect } from "react";
import { Spinner, Modal, Button, Tooltip } from "flowbite-react";
import { useAuth } from "../context/AuthContext";
import axios from "../api/axios";
import UserProfileDetailModal from "../modals/userProfileDetailModal";
import * as adminService from "../api/adminService";
import { 
  HiSearch, 
  HiOutlineFilter, 
  HiOutlineRefresh, 
  HiOutlinePencil, 
  HiOutlineTrash, 
  HiOutlineBan,
  HiX, 
  HiCheck,
  HiOutlineDotsVertical,
  HiMail,
  HiPhone,
  HiCalendar,
  HiIdentification,
  HiLocationMarker,
  HiOutlineExclamation,
  HiAcademicCap,
  HiShieldCheck
} from "react-icons/hi";

const UsersList = ({ 
  usersList, 
  currentPage, 
  setCurrentPage, 
  pageSize = 20, 
  setPageSize, 
  totalUsers = 0, 
  totalPages = 0, 
  handleUpdates, 
  highlightedUser, 
  isServerSidePagination = false,
  isPageLoading = false 
}) => {
  const { getToken } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("joiningDate");
  const [sortDirection, setSortDirection] = useState("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Filter and sort users (client-side for non-server-side pagination, or just filter for display)
  const filteredUsers = isServerSidePagination ? usersList : usersList.filter((user) => {
    // Search filter
    const matchesSearch = 
      !searchTerm ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Role filter
    const matchesRole = 
      roleFilter === "all" || 
      (roleFilter === "admin" && user.accessLevel === 0) ||
      (roleFilter === "crm" && user.accessLevel === 1) ||
      (roleFilter === "api" && user.accessLevel === 2) ||
      (roleFilter === "moderator" && user.accessLevel === 3) ||
      (roleFilter === "user" && (user.accessLevel === 4 || user.accessLevel === undefined));
    
    // Plan filter
    const matchesPlan = 
      statusFilter === "all" || 
      (statusFilter === "trial" && user.plan === 0) ||
      (statusFilter === "developer" && user.plan === 1) ||
      (statusFilter === "enterprise" && user.plan === 2) ||
      (statusFilter === "educational" && (user.educationalAccount || user.plan === 3));
    
    return matchesSearch && matchesRole && matchesPlan;
  });

  const sortedUsers = isServerSidePagination ? filteredUsers : [...filteredUsers].sort((a, b) => {
    let valA, valB;

    // Handle name sorting specifically
    if (sortField === "name") {
      // For name sorting, prioritize the name field but fallback to email
      valA = a.name ? a.name.toLowerCase() : (a.email ? a.email.split('@')[0].toLowerCase() : '');
      valB = b.name ? b.name.toLowerCase() : (b.email ? b.email.split('@')[0].toLowerCase() : '');
    }
    // Handle email sorting with case insensitivity
    else if (sortField === "email") {
      valA = (a.email || "").toLowerCase();
      valB = (b.email || "").toLowerCase();
    }
    // Handle tokens sorting as numbers
    else if (sortField === "tokens") {
      valA = Number(a.tokens || 0);
      valB = Number(b.tokens || 0);
    }
    // Handle role sorting with case insensitivity
    else if (sortField === "role") {
      const getRoleValue = (user) => {
        // Return a value that can be sorted based on accessLevel
        if (user.accessLevel === 0) return "0-SuperAdmin";
        if (user.accessLevel === 1) return "1-CRMAdmin";
        if (user.accessLevel === 2) return "2-APIManager";
        if (user.accessLevel === 3) return "3-SupportCoordinator";
        return "4-User";
      };
      valA = getRoleValue(a);
      valB = getRoleValue(b);
    }
    // Default case: use the field directly
    else {
      valA = a[sortField];
      valB = b[sortField];
      // Convert string values to lowercase for case-insensitive comparison
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
    }

    // Handle null/undefined values
    if (valA === undefined || valA === null) valA = '';
    if (valB === undefined || valB === null) valB = '';

    if (valA < valB) return sortDirection === "asc" ? -1 : 1;
    if (valA > valB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Handle sort change
  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Pagination
  const itemsPerPage = isServerSidePagination ? pageSize : 10; // Use server pageSize or default to 10
  const calculatedTotalPages = isServerSidePagination ? totalPages : Math.ceil(filteredUsers.length / itemsPerPage);
  const userCount = isServerSidePagination ? totalUsers : filteredUsers.length;
  
  // If current page is greater than total pages, reset to page 1 or last page
  useEffect(() => {
    if (!isServerSidePagination && filteredUsers.length > 0 && currentPage > Math.max(1, calculatedTotalPages)) {
      setCurrentPage(Math.max(1, calculatedTotalPages));
    }
  }, [filteredUsers.length, calculatedTotalPages, currentPage, setCurrentPage, isServerSidePagination]);
  
  const paginatedUsers = isServerSidePagination ? sortedUsers : sortedUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Effect to scroll to highlighted user
  useEffect(() => {
    if (highlightedUser) {
      // Find if the highlighted user is in the current page
      const userIndex = paginatedUsers.findIndex(user => user._id === highlightedUser._id);
      
      if (userIndex === -1) {
        // User not found on this page, find what page they should be on
        const allUserIndex = sortedUsers.findIndex(user => user._id === highlightedUser._id);
        if (allUserIndex !== -1) {
          const targetPage = Math.floor(allUserIndex / itemsPerPage) + 1;
          setCurrentPage(targetPage);
          
          // Also set search term if available
          if (highlightedUser.name || highlightedUser.email) {
            setSearchTerm(highlightedUser.name || highlightedUser.email);
          }
        }
      }
    }
  }, [highlightedUser, paginatedUsers, sortedUsers, itemsPerPage, setCurrentPage]);



  // Open user detail modal
  const openUserModal = (user) => {
    setSelectedUser(user);
    setIsUserModalOpen(true);
  };

  // Open delete confirmation modal
  const openDeleteModal = (user, e) => {
    e.stopPropagation(); // Prevent opening the user modal
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  // Handle user deletion
  const handleDeleteUser = async () => {
    try {
      setIsLoading(true);
      const token = await getToken();
      await axios.delete(`/users/${selectedUser._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setToastMessage(`User ${selectedUser.name || selectedUser.email} deleted successfully`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000); // Auto-dismiss after 3 seconds
      setIsDeleteModalOpen(false);
      handleUpdates();
    } catch (error) {
      console.error("Failed to delete user:", error);
      setToastMessage("Failed to delete user");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000); // Auto-dismiss after 3 seconds
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle user active status
  const toggleUserStatus = async (userId, isVerified, e) => {
    e.stopPropagation(); // Prevent opening the user modal
    
    try {
      // Find the user to get their email
      const user = usersList.find(u => u._id === userId);
      if (!user || !user.email) {
        throw new Error("User email not found");
      }

      // Use the new admin service endpoint for blocking/unblocking
      if (isVerified) {
        // If verified, block the user
        await adminService.blockUser(user.email);
        setToastMessage(`User ${user.name || user.email} blocked successfully`);
      } else {
        // If not verified, unblock the user
        await adminService.unblockUser(user.email);
        setToastMessage(`User ${user.name || user.email} unblocked successfully`);
      }
      
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000); // Auto-dismiss after 3 seconds
      handleUpdates();
    } catch (error) {
      console.error("Failed to update user status:", error);
      setToastMessage("Failed to update user status");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000); // Auto-dismiss after 3 seconds
    }
  };

  // Utility function to update user role
  const updateUserRole = async (userId, role, closeModal = true) => {
    try {
      // Find the user to get their email
      const user = usersList.find(u => u._id === userId);
      if (!user || !user.email) {
        throw new Error("User email not found");
      }

      const token = await getToken();
      let accessLevel = 4; // Default regular user
      
      if (role === "admin") {
        accessLevel = 0; // SuperAdmin
      } else if (role === "crm") {
        accessLevel = 1; // CRMAdmin
      } else if (role === "api") {
        accessLevel = 2; // APIManager
      } else if (role === "moderator") {
        accessLevel = 3; // SupportCoordinator
      } else if (role === "user") {
        accessLevel = 4; // Regular User - explicitly set
      } else if (role === "educational") {
        // For educational, we keep the user level but set the educational flag
        await axios.put(
          `/users/${userId}`,
          { educationalAccount: true },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setToastMessage(`User set to Educational successfully`);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000); // Auto-dismiss after 3 seconds
        if (closeModal) setIsUserModalOpen(false);
        handleUpdates();
        return;
      }
      
      // Use the new admin service endpoint for changing access level
      await adminService.changeUserAccessLevel(user.email, accessLevel);
      
      setToastMessage(`User role updated to ${role} successfully`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000); // Auto-dismiss after 3 seconds
      
      // Don't close the modal automatically
      // if (closeModal) setIsUserModalOpen(false);
      
      // Make sure to update the UI regardless of success or failure
      handleUpdates();
    } catch (error) {
      console.error("Failed to update user role:", error);
      setToastMessage("Failed to update user role");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000); // Auto-dismiss after 3 seconds
      
      // Still call handleUpdates to refresh the UI
      handleUpdates();
    }
  };

  // Get user role badge color
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "SuperAdmin": return "bg-yellow-100 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-200"; // Brighter golden for highest authority
      case "CRMAdmin": return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"; // Elegant purple for high status
      case "APIManager": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"; // Clean professional blue
      case "SupportCoordinator": return "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300"; // Distinct professional teal
      case "User": return "bg-gray-100 text-gray-800 dark:bg-gray-700/30 dark:text-gray-300";
      // Keeping old cases for backward compatibility
      case "admin": return "bg-yellow-100 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-200"; // Match SuperAdmin
      case "moderator": return "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300"; // Match SupportCoordinator
      case "educational": return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"; // Match CRMAdmin
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-700/30 dark:text-gray-300";
    }
  };

  // Get user plan badge color
  const getPlanBadgeColor = (plan) => {
    switch (plan) {
      case "Enterprise": return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300";
      case "Pro": return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      case "Educational": return "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-700/30 dark:text-gray-300";
    }
  };

  // Get verification badge
  const getVerificationBadge = (user) => {
    if (user.verified) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
          <HiShieldCheck className="w-3 h-3 mr-1" /> Verified
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-50 text-pink-600 dark:bg-pink-900/10 dark:text-pink-200">
        Pending
      </span>
    );
  };

  // Get user role from accessLevel
  const getUserRole = (user) => {
    if (user.accessLevel === 0) return "SuperAdmin";
    if (user.accessLevel === 1) return "CRMAdmin";
    if (user.accessLevel === 2) return "APIManager";
    if (user.accessLevel === 3) return "SupportCoordinator";
    return "User";
  };

  // Get user plan
  const getUserPlan = (user) => {

    if (typeof user.plan === "number") {
      switch (user.plan) {
        case 0: return "Trial";
        case 1: return "Developer";
        case 2: return "Enterprise";
        case 3: return "Educational";
        default: return "NA";
      }
    }
    
    return "NA";
  };

  // Get user tokens (using the API's tokens field)
  const getUserTokens = (user) => {
    return user.tokens || 0;
  };
  
  // Get user display name and initial
  const getUserInitial = (user) => {
    if (user.name) {
      return user.name.charAt(0);
    }
    return user.email?.charAt(0) || '?';
  };
  
  const getUserDisplayName = (user) => {
    return user.name || user.email?.split('@')[0] || 'Unknown';
  };

  return (
    <div className="flex flex-col h-full space-y-5">
      {/* Header section */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">Users Management</h1>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              setSearchTerm("");
              setRoleFilter("all");
              setStatusFilter("all");
              setSortField("joiningDate");
              setSortDirection("desc");
              setCurrentPage(1);
              if (isServerSidePagination) {
                handleUpdates(true); // Reset to first page
              } else {
              handleUpdates();
              }
            }}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-[#161616] dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-all cursor-pointer"
            title="Refresh user list"
          >
            <HiOutlineRefresh className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg transition-all ${showFilters ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-100 hover:bg-gray-200 dark:bg-[#161616] dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
            title="Show filters"
          >
            <HiOutlineFilter className="w-5 h-5" />
          </button>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <HiSearch className="h-5 w-5 text-gray-400" style={{ zIndex: 5 }} />
            </div>
            <input
              type="text"
              placeholder="Search users..."
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#161616] text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                title="Clear search"
              >
                <HiX className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white dark:bg-[#28292B] rounded-lg shadow-sm p-4">
          {isServerSidePagination && (
            <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Note:</strong> Filters and sorting work on the current page data only. For full filtering across all users, API-level support would be needed.
              </p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#161616] text-gray-800 dark:text-white py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="user">User</option>
              <option value="moderator">Support Coordinator</option>
              <option value="admin">Super Admin</option>
              <option value="crm">CRM Admin</option>
              <option value="api">API Manager</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Plan</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#161616] text-gray-800 dark:text-white py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">All Plans</option>
              <option value="trial">Trial</option>
              <option value="developer">Developer</option>
              <option value="enterprise">Enterprise</option>
              <option value="educational">Educational</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sort By</label>
            <select
              value={sortField}
              onChange={(e) => handleSort(e.target.value)}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#161616] text-gray-800 dark:text-white py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="joiningDate">Date Created</option>
              <option value="name">Name</option>
              <option value="email">Email</option>
              <option value="tokens">Tokens</option>
              <option value="role">Role</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Order</label>
            <select
              value={sortDirection}
              onChange={(e) => setSortDirection(e.target.value)}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#161616] text-gray-800 dark:text-white py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="flex-1 flex flex-col bg-white dark:bg-[#28292B] rounded-lg shadow-sm overflow-hidden relative">
        {/* Loading Overlay */}
        {isPageLoading && (
          <div className="absolute inset-0 bg-white/80 dark:bg-[#28292B]/80 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="flex flex-col items-center space-y-3">
              <Spinner size="lg" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Loading users...</p>
            </div>
          </div>
        )}
        <div className="flex-1 overflow-x-auto">
          <table className="w-full h-full">
            <thead className="sticky top-0">
              <tr className="bg-gray-50 dark:bg-[#1E1F21] border-b border-gray-200 dark:border-gray-700 text-left">
                <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Verification</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Plan</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tokens</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.length > 0 ? (
                paginatedUsers.length > 0 ? (
                  paginatedUsers.map((user) => (
                    <tr 
                      key={user._id} 
                      className={`hover:bg-gray-50 dark:hover:bg-[#212224] cursor-pointer transition-colors ${
                        highlightedUser && highlightedUser._id === user._id ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 dark:border-blue-500' : ''
                      }`}
                      onClick={() => openUserModal(user)}
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                            {user.imageUrl ? (
                              <img
                                src={user.imageUrl}
                                alt={getUserDisplayName(user)}
                                className="h-8 w-8 rounded-full object-cover"
                              />
                            ) : (
                              getUserInitial(user).toUpperCase()
                            )}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {getUserDisplayName(user)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(getUserRole(user))}`}>
                          {getUserRole(user)}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {getVerificationBadge(user)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPlanBadgeColor(getUserPlan(user))}`}>
                          {getUserPlan(user)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {user.email}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 font-medium">
                        {getUserTokens(user)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => openUserModal(user)}
                            className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-[#1E1F21] dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                            title="Edit user"
                          >
                            <HiOutlinePencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => openDeleteModal(user, e)}
                            className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors"
                            title="Delete user"
                          >
                            <HiOutlineTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <HiOutlineExclamation className="w-10 h-10 text-gray-400 mb-2" />
                        <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">No users on this page</p>
                        <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">Try going to a previous page</p>
                      </div>
                    </td>
                  </tr>
                )
              ) : (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <HiOutlineExclamation className="w-10 h-10 text-gray-400 mb-2" />
                      <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">No users found</p>
                      <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">Try adjusting your search or filter criteria</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination - Fixed at bottom */}
        {userCount > 0 && (
          <div className="mt-auto flex justify-between items-center bg-white dark:bg-[#28292B] border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, userCount)} of {userCount} users
            </span>
              {isServerSidePagination && setPageSize && (
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-500 dark:text-gray-400">Show:</label>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1); // Reset to first page when changing page size
                    }}
                    className="px-2 py-1 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#161616] text-gray-700 dark:text-gray-300 text-sm"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span className="text-sm text-gray-500 dark:text-gray-400">per page</span>
                </div>
              )}
            </div>
            <div className="flex space-x-1">
              <button
                onClick={() => {
                  setCurrentPage(Math.max(1, currentPage - 1));
                }}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#161616] border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#212224] disabled:opacity-50 transition-colors"
              >
                Previous
              </button>
              
{(() => {
                const getPageNumbers = () => {
                  const pages = [];
                  const totalPageCount = calculatedTotalPages;
                  
                  if (totalPageCount <= 7) {
                    // Show all pages if total is 7 or less
                    for (let i = 1; i <= totalPageCount; i++) {
                      pages.push(i);
                    }
                  } else {
                    // Always show first page
                    pages.push(1);
                    
                    if (currentPage <= 4) {
                      // Show pages 2, 3, 4, 5, ..., last
                      for (let i = 2; i <= 5; i++) {
                        pages.push(i);
                      }
                      if (totalPageCount > 6) {
                        pages.push('...');
                      }
                    } else if (currentPage >= totalPageCount - 3) {
                      // Show 1, ..., last-4, last-3, last-2, last-1, last
                      if (totalPageCount > 6) {
                        pages.push('...');
                      }
                      for (let i = totalPageCount - 4; i <= totalPageCount - 1; i++) {
                        if (i > 1) pages.push(i);
                      }
                } else {
                      // Show 1, ..., current-1, current, current+1, ..., last
                      if (currentPage > 3) {
                        pages.push('...');
                      }
                      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                        if (i > 1 && i < totalPageCount) pages.push(i);
                      }
                      if (currentPage < totalPageCount - 2) {
                        pages.push('...');
                      }
                    }
                    
                    // Always show last page
                    if (totalPageCount > 1) {
                      pages.push(totalPageCount);
                    }
                  }
                  
                  return pages;
                };

                return getPageNumbers().map((pageNum, idx) => {
                  if (pageNum === '...') {
                    return (
                      <span
                        key={`ellipsis-${idx}`}
                        className="px-3 py-1.5 text-gray-500 dark:text-gray-400"
                      >
                        ...
                      </span>
                    );
                }
                
                return (
                  <button
                    key={pageNum}
                      onClick={() => {
                        setCurrentPage(pageNum);
                      }}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      pageNum === currentPage
                        ? "bg-blue-600 text-white"
                        : "bg-white dark:bg-[#161616] border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#212224]"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
                });
              })()}
              
              <button
                onClick={() => {
                  setCurrentPage(Math.min(calculatedTotalPages, currentPage + 1));
                }}
                disabled={currentPage === calculatedTotalPages}
                className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#161616] border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#212224] disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <UserProfileDetailModal
          isOpen={isUserModalOpen}
          onClose={() => setIsUserModalOpen(false)}
          selectedUser={selectedUser}
          updateUserRole={updateUserRole}
          toggleUserStatus={toggleUserStatus}
          setIsDeleteModalOpen={setIsDeleteModalOpen}
          setIsUserModalOpen={setIsUserModalOpen}
          getUserDisplayName={getUserDisplayName}
          getUserInitial={getUserInitial}
          getUserPlan={getUserPlan}
          getUserTokens={getUserTokens}
          setToastMessage={setToastMessage}
          setShowToast={setShowToast}
          handleUpdates={handleUpdates}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        show={isDeleteModalOpen}
        size="md"
        popup
        onClose={() => setIsDeleteModalOpen(false)}
        theme={{
          root: {
            base: "fixed top-0 right-0 left-0 z-50 h-modal h-screen overflow-y-auto overflow-x-hidden md:inset-0 md:h-full",
            show: {
              on: "flex bg-gray-900 bg-opacity-80 dark:bg-opacity-90 backdrop-blur-sm",
              off: "hidden"
            }
          },
          content: {
            base: "relative h-full w-full p-4 md:h-auto",
            inner: "relative rounded-xl bg-white shadow-2xl dark:bg-[#2a2d36] flex flex-col max-h-[90vh] w-full max-w-md mx-auto"
          }
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-red-600"></div>
        <Modal.Header className="px-6 pt-5 pb-0 border-none" theme={{ close: { base: "ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white" } }}>
        </Modal.Header>
        <Modal.Body className="px-6 py-5">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-600/20 mb-4">
              <HiOutlineExclamation className="h-10 w-10 text-red-500" />
            </div>
            <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
              Confirm User Deletion
            </h3>
            <p className="mb-5 text-gray-600 dark:text-gray-400 text-sm max-w-md mx-auto">
              Are you sure you want to delete{" "}
              {selectedUser && (
                <span className="font-semibold text-gray-900 dark:text-white">
                  {getUserDisplayName(selectedUser)}
                </span>
              )}
              's account? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-3">
              <Button
                color="failure"
                size="sm"
                pill
                className="bg-red-600 hover:bg-red-700 border-none"
                onClick={handleDeleteUser}
                disabled={isLoading}
              >
                {isLoading ? <Spinner size="sm" className="mr-2" /> : null}
                <span>Yes, delete account</span>
              </Button>
              <Button
                color="gray"
                size="sm"
                pill
                className="bg-gray-600 hover:bg-gray-700 border-none"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* Toast notification */}
      {showToast && (
        <div className="fixed bottom-5 right-5 z-[9999]">
          <div className="bg-white dark:bg-[#28292B] rounded-lg shadow-lg p-4 flex items-center space-x-3 animate-fadeIn">
            <div className="flex-shrink-0">
              {toastMessage.startsWith("Failed") || toastMessage.toLowerCase().includes("error") ? (
                <HiOutlineExclamation className="h-5 w-5 text-red-500" />
              ) : (
                <HiCheck className="h-5 w-5 text-green-500" />
              )}
            </div>
            <div className="flex-1 mr-5">
              <p className="text-sm text-gray-900 dark:text-white font-medium">{toastMessage}</p>
            </div>
            <button 
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              onClick={() => setShowToast(false)}
            >
              <HiX className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersList;
