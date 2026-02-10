import React, { useState, useEffect } from "react";
import { Modal, Button, TextInput } from "flowbite-react";
import {
  HiMail,
  HiPhone,
  HiCalendar,
  HiIdentification,
  HiLocationMarker,
  HiAcademicCap,
  HiUserCircle,
  HiCog,
  HiExclamationCircle,
  HiPencilAlt,
  HiShieldCheck,
  HiLockClosed,
  HiExclamation,
  HiCheck,
  HiX,
  HiCurrencyDollar,
} from "react-icons/hi";
import {
  changeUserPlan,
  updateUserTokens,
  addUserTokens,
  subtractUserTokens,
} from "../api/adminService";

const UserProfileDetailModal = ({
  isOpen,
  onClose,
  selectedUser,
  updateUserRole,
  toggleUserStatus,
  setIsDeleteModalOpen,
  setIsUserModalOpen,
  getUserDisplayName,
  getUserInitial,
  getUserPlan,
  getUserTokens,
  setToastMessage,
  setShowToast,
  handleUpdates,
  setSelectedUser,
}) => {
  const [activeSection, setActiveSection] = useState("userInfo");
  const [isEditingTokens, setIsEditingTokens] = useState(false);
  const [tokenValue, setTokenValue] = useState("");
  const [selectedRole, setSelectedRole] = useState(null);
  const [isRoleChanged, setIsRoleChanged] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isPlanChanged, setIsPlanChanged] = useState(false);
  const [tokenActionType, setTokenActionType] = useState(null);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);

  // Reset modal state when it closes or when selectedUser changes
  useEffect(() => {
    if (!isOpen) {
      // Reset to default state when modal closes
      setActiveSection("userInfo");
      setIsEditingTokens(false);
      setTokenValue("");
      setSelectedRole(null);
      setIsRoleChanged(false);
      setSelectedPlan(null);
      setIsPlanChanged(false);
      setTokenActionType(null);
      setShowResetConfirmation(false);
    }
  }, [isOpen, selectedUser]);

  if (!selectedUser) return null;

  // Format date to dd/mm/yyyy
  const formatDate = (dateString) => {
    if (!dateString) return "Not available";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Get role badge color with enhanced visual hierarchy
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "SuperAdmin":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"; // Golden for highest authority
      case "CRMAdmin":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"; // Elegant purple for high status
      case "APIManager":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"; // Clean professional blue
      case "SupportCoordinator":
        return "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300"; // Distinct professional teal
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700/30 dark:text-gray-300";
    }
  };

  // Get user role from accessLevel
  const getUserRole = (user) => {
    if (user.accessLevel === 0) return "SuperAdmin";
    if (user.accessLevel === 1) return "CRMAdmin";
    if (user.accessLevel === 2) return "APIManager";
    if (user.accessLevel === 3) return "SupportCoordinator";
    return "User";
  };

  // Handle token edit save
  const handleTokenEditSave = async () => {
    if (!selectedUser || isNaN(parseInt(tokenValue, 10))) {
      return;
    }

    try {
      const email = selectedUser.email;
      const tokens = parseInt(tokenValue, 10);
      let response;

      switch (tokenActionType) {
        case "edit":
          response = await updateUserTokens(email, tokens);
          break;
        case "add":
          response = await addUserTokens(email, tokens);
          break;
        case "remove":
          response = await subtractUserTokens(email, tokens);
          break;
        case "reset":
          response = await updateUserTokens(email, 0);
          break;
        default:
          console.error("Unknown token action type:", tokenActionType);
          return;
      }

      // Update the local state for immediate UI feedback
      if (response && response.success) {
        // For edit and reset, we directly set the token value
        if (tokenActionType === "edit" || tokenActionType === "reset") {
          selectedUser.tokens = tokenActionType === "reset" ? 0 : tokens;
        }
        // For add and remove, we update based on the response from the server
        else if (response.updatedTokens !== undefined) {
          selectedUser.tokens = response.updatedTokens;
        } else if (tokenActionType === "add") {
          selectedUser.tokens = (selectedUser.tokens || 0) + tokens;
        } else if (tokenActionType === "remove") {
          selectedUser.tokens = Math.max(
            0,
            (selectedUser.tokens || 0) - tokens
          );
        }

        // Show success notification
        if (setToastMessage && setShowToast) {
          const actionText =
            tokenActionType === "edit"
              ? "updated"
              : tokenActionType === "add"
              ? "added to"
              : tokenActionType === "remove"
              ? "removed from"
              : "reset to 0 for";

          setToastMessage(
            `Tokens ${actionText} ${getUserDisplayName(
              selectedUser
            )}'s account successfully`
          );
          setShowToast(true);
          setTimeout(() => setShowToast(false), 3000); // Auto-dismiss after 3 seconds
        }

        // Update the UI if needed
        if (handleUpdates) {
          handleUpdates();
        }
      }

      // Force a re-render by creating a new selectedUser object
      const updatedUser = { ...selectedUser };
      // This is a hack to force the component to re-render with the updated token value
      setTimeout(() => {
        if (setSelectedUser) {
          setSelectedUser(updatedUser);
        }
      }, 0);
    } catch (error) {
      // Show error notification
      if (setToastMessage && setShowToast) {
        setToastMessage(`Failed to update tokens: ${error.message}`);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000); // Auto-dismiss after 3 seconds
      }
      console.error("Token update error:", error);
    }

    // Reset state
    setIsEditingTokens(false);
    setTokenActionType(null);
    setShowResetConfirmation(false);
  };

  const handleTokenAction = (actionType) => {
    if (actionType === "reset") {
      setTokenActionType("reset");
      setShowResetConfirmation(true);
      return;
    }

    let initialValue = "";

    switch (actionType) {
      case "edit":
        initialValue = getUserTokens(selectedUser).toString();
        break;
      case "add":
      case "remove":
        initialValue = "";
        break;
      default:
        initialValue = "";
    }

    setTokenValue(initialValue);
    setTokenActionType(actionType);
    setIsEditingTokens(true);
  };

  const handleConfirmReset = () => {
    setShowResetConfirmation(false);
    handleTokenEditSave(); // This will call updateUserTokens with tokens=0
  };

  // Handle plan selection
  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    setIsPlanChanged(true);
  };

  // Handle save plan changes
  const handleSavePlanChanges = () => {
    if (selectedPlan) {
      // Convert plan name to plan ID
      let planId;
      switch (selectedPlan) {
        case "Trial":
          planId = 0;
          break;
        case "Developer":
          planId = 1;
          break;
        case "Enterprise":
          planId = 2;
          break;
        case "Educational":
          planId = 3;
          break;
        default:
          planId = 0; // Default to Trial
      }

      // Call the API to update the plan
      changeUserPlan(selectedUser.email, planId)
        .then((response) => {
          // Update the local user state
          selectedUser.planId = planId;
          selectedUser.plan = planId; // Update both properties for consistency

          // Show toast notification
          if (setToastMessage && setShowToast) {
            setToastMessage(
              `User plan updated to ${selectedPlan} successfully`
            );
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000); // Auto-dismiss after 3 seconds
          }

          // Update the UI
          if (handleUpdates) {
            handleUpdates();
          }

          // Reset state
          setSelectedPlan(null);
          setIsPlanChanged(false);
        })
        .catch((error) => {
          // Show error notification
          if (setToastMessage && setShowToast) {
            setToastMessage(`Failed to update plan: ${error.message}`);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000); // Auto-dismiss after 3 seconds
          }
        });
    }
  };

  // Handle cancel plan changes
  const handleCancelPlanChanges = () => {
    setIsPlanChanged(false);
    setSelectedPlan(null);
  };

  // Handle role selection
  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setIsRoleChanged(true);
  };

  // Handle save role changes
  const handleSaveRoleChanges = () => {
    if (selectedRole) {
      // Call the updateUserRole with the correct role string
      if (typeof updateUserRole === "function") {
        updateUserRole(selectedUser._id, selectedRole, true);

        // Update the local state for immediate UI feedback
        let accessLevel;
        switch (selectedRole) {
          case "crm":
            accessLevel = 1;
            break;
          case "api":
            accessLevel = 2;
            break;
          case "moderator":
            accessLevel = 3;
            break;
          case "user":
            accessLevel = 4;
            break;
          default:
            accessLevel = 4;
        }
        selectedUser.accessLevel = accessLevel;
      }
      setIsRoleChanged(false);
      setSelectedRole(null);
    }
  };

  // Handle cancel role changes
  const handleCancelRoleChanges = () => {
    setIsRoleChanged(false);
    setSelectedRole(null);
  };

  return (
    <Modal
      show={isOpen}
      onClose={onClose}
      size="5xl"
      position="center"
      popup
      theme={{
        root: {
          base: "fixed top-0 right-0 left-0 z-50 h-modal h-screen overflow-y-auto overflow-x-hidden md:inset-0 md:h-full",
          show: {
            on: "flex bg-gray-900 bg-opacity-80 dark:bg-opacity-90 backdrop-blur-sm",
            off: "hidden",
          },
        },
        content: {
          base: "relative h-full w-full p-4 md:h-auto",
          inner:
            "relative rounded-xl bg-white shadow-2xl dark:bg-[#28292B] flex flex-col h-[600px] w-[1000px] max-w-7xl mx-auto",
        },
      }}
    >
      <Modal.Header
        className="px-6 pt-4 pb-3 border-b dark:border-gray-700 flex justify-between items-center"
        theme={{
          close: {
            base: "ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white",
          },
        }}
      >
        <div className="flex items-center">
          <span className="text-xl font-semibold text-gray-900 dark:text-white">
            User Profile Details
          </span>
        </div>
      </Modal.Header>
      <Modal.Body className="p-0 overflow-hidden">
        <div className="flex h-full w-full px-6 pb-6">
          {/* Left sidebar */}
          <div className="w-72 bg-gray-100 dark:bg-[#1E1F21] overflow-y-auto border-r dark:border-gray-700">
            {/* Profile section */}
            <div className="flex flex-col items-center py-6 px-4 border-b dark:border-gray-700 relative">
              <div className="mb-3 relative">
                <div className="h-20 w-20 rounded-full overflow-hidden flex items-center justify-center bg-blue-500 text-white text-3xl font-bold">
                  {selectedUser.imageUrl ? (
                    <img
                      src={selectedUser.imageUrl}
                      alt={getUserDisplayName(selectedUser)}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    getUserInitial(selectedUser).toUpperCase()
                  )}
                </div>

                {/* Badge for users with accessLevel < 4 with updated colors */}
                {selectedUser.accessLevel < 4 && (
                  <div
                    className={`absolute bottom-0 right-0 h-6 w-6 rounded-full border-2 border-gray-100 dark:border-[#1E1F21] flex items-center justify-center ${
                      selectedUser.accessLevel === 0
                        ? "bg-amber-500" // Golden for Super Admin
                        : selectedUser.accessLevel === 1
                        ? "bg-purple-500" // Purple for CRM Admin
                        : selectedUser.accessLevel === 2
                        ? "bg-blue-500" // Blue for API Manager
                        : selectedUser.accessLevel === 3
                        ? "bg-teal-500"
                        : "" // Teal for Support Coordinator
                    }`}
                  >
                    <HiShieldCheck className="h-3.5 w-3.5 text-white" />
                  </div>
                )}
              </div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white text-center">
                {getUserDisplayName(selectedUser)}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm text-center truncate max-w-full">
                {selectedUser.email}
              </p>

              {/* Role badge with updated color scheme */}
              <div className="mt-2">
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                    getUserRole(selectedUser)
                  )}`}
                >
                  {getUserRole(selectedUser)}
                </span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="py-4">
              <ul>
                <li>
                  <button
                    onClick={() => setActiveSection("userInfo")}
                    className={`flex items-center w-full px-4 py-3 text-left ${
                      activeSection === "userInfo"
                        ? "bg-blue-50 dark:bg-gray-800 text-blue-600 dark:text-blue-400"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800"
                    }`}
                  >
                    <HiUserCircle className="w-5 h-5 mr-3" />
                    <span className="font-medium">User Information</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveSection("roleManagement")}
                    className={`flex items-center w-full px-4 py-3 text-left ${
                      activeSection === "roleManagement"
                        ? "bg-blue-50 dark:bg-gray-800 text-blue-600 dark:text-blue-400"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800"
                    }`}
                  >
                    <HiShieldCheck className="w-5 h-5 mr-3" />
                    <span className="font-medium">Role Management</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveSection("tokenManagement")}
                    className={`flex items-center w-full px-4 py-3 text-left ${
                      activeSection === "tokenManagement"
                        ? "bg-blue-50 dark:bg-gray-800 text-blue-600 dark:text-blue-400"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800"
                    }`}
                  >
                    <HiCurrencyDollar className="w-5 h-5 mr-3" />
                    <span className="font-medium">Token Management</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveSection("subscriptionPlan")}
                    className={`flex items-center w-full px-4 py-3 text-left ${
                      activeSection === "subscriptionPlan"
                        ? "bg-blue-50 dark:bg-gray-800 text-blue-600 dark:text-blue-400"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800"
                    }`}
                  >
                    <HiAcademicCap className="w-5 h-5 mr-3" />
                    <span className="font-medium">Subscription Plan</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveSection("accountAction")}
                    className={`flex items-center w-full px-4 py-3 text-left ${
                      activeSection === "accountAction"
                        ? "bg-blue-50 dark:bg-gray-800 text-blue-600 dark:text-blue-400"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800"
                    }`}
                  >
                    <HiExclamation className="w-5 h-5 mr-3" />
                    <span className="font-medium">Account Actions</span>
                  </button>
                </li>
              </ul>
            </nav>
          </div>

          {/* Right content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* User Information Section */}
            {activeSection === "userInfo" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                  User Information
                </h2>

                {/* Account Information */}
                <div className="bg-white dark:bg-[#1E1F21] rounded-lg p-5 shadow-sm">
                  <h4 className="uppercase text-gray-600 dark:text-gray-400 text-sm font-medium mb-3">
                    ACCOUNT INFORMATION
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 text-blue-600 dark:text-blue-400 mt-0.5">
                        <HiIdentification className="h-5 w-5" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          User ID
                        </p>
                        <p className="text-sm text-gray-800 dark:text-white break-words max-w-full pr-4">
                          {selectedUser._id ? selectedUser._id : "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="flex-shrink-0 text-purple-600 dark:text-purple-400 mt-0.5">
                        <HiAcademicCap className="h-5 w-5" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Subscription Plan
                        </p>
                        <p className="text-sm text-gray-800 dark:text-white">
                          {getUserPlan(selectedUser)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="flex-shrink-0 text-amber-600 dark:text-amber-400 mt-0.5">
                        <HiCalendar className="h-5 w-5" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Joined Date
                        </p>
                        <p className="text-sm text-gray-800 dark:text-white">
                          {formatDate(selectedUser.joiningDate)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="flex-shrink-0 text-green-600 dark:text-green-400 mt-0.5">
                        <HiExclamationCircle className="h-5 w-5" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Status
                        </p>
                        <p className="text-sm text-gray-800 dark:text-white">
                          {selectedUser.verified ? "Verified" : "Not Verified"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-white dark:bg-[#1E1F21] rounded-lg p-5 shadow-sm">
                  <h4 className="uppercase text-gray-600 dark:text-gray-400 text-sm font-medium mb-3">
                    CONTACT
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 text-blue-600 dark:text-blue-400 mt-0.5">
                        <HiMail className="h-5 w-5" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Email Address
                        </p>
                        <p className="text-sm text-gray-800 dark:text-white">
                          {selectedUser.email || "Not provided"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="flex-shrink-0 text-indigo-600 dark:text-indigo-400 mt-0.5">
                        <HiPhone className="h-5 w-5" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Phone
                        </p>
                        <p className="text-sm text-gray-800 dark:text-white">
                          {selectedUser.phone || "Not provided"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="flex-shrink-0 text-red-600 dark:text-red-400 mt-0.5">
                        <HiLocationMarker className="h-5 w-5" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Location
                        </p>
                        <p className="text-sm text-gray-800 dark:text-white">
                          {selectedUser.location || "Not provided"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Role Management Section */}
            {activeSection === "roleManagement" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                  Role Management
                </h2>

                {/* User Role Management with updated colors and save/cancel buttons */}
                <div className="bg-white dark:bg-[#1E1F21] rounded-lg p-5 shadow-sm">
                  <h4 className="uppercase text-gray-600 dark:text-gray-400 text-sm font-medium mb-4">
                    USER ROLE
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {/* CRM Admin */}
                    <div
                      onClick={() => handleRoleSelect("crm")}
                      className={`rounded-lg border p-3 cursor-pointer transition-all ${
                        selectedRole === "crm" ||
                        (!selectedRole && selectedUser.accessLevel === 1)
                          ? "bg-purple-100 dark:bg-purple-900/40 border-purple-300 dark:border-purple-700 ring-2 ring-purple-400 dark:ring-purple-600"
                          : "bg-white dark:bg-[#161616] border-gray-200 dark:border-gray-700 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                      }`}
                    >
                      <div className="flex flex-col items-center text-center">
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center mb-2 ${
                            selectedRole === "crm" ||
                            (!selectedRole && selectedUser.accessLevel === 1)
                              ? "bg-purple-200 dark:bg-purple-900/60 text-purple-600 dark:text-purple-400"
                              : "bg-purple-50 dark:bg-purple-900/20 text-purple-500 dark:text-purple-400"
                          }`}
                        >
                          <HiShieldCheck className="h-5 w-5" />
                        </div>
                        <span
                          className={`text-sm font-medium ${
                            selectedRole === "crm" ||
                            (!selectedRole && selectedUser.accessLevel === 1)
                              ? "text-purple-800 dark:text-purple-300"
                              : "text-gray-800 dark:text-gray-200"
                          }`}
                        >
                          CRM Admin
                        </span>
                      </div>
                    </div>

                    {/* API Manager */}
                    <div
                      onClick={() => handleRoleSelect("api")}
                      className={`rounded-lg border p-3 cursor-pointer transition-all ${
                        selectedRole === "api" ||
                        (!selectedRole && selectedUser.accessLevel === 2)
                          ? "bg-blue-100 dark:bg-blue-900/40 border-blue-300 dark:border-blue-700 ring-2 ring-blue-400 dark:ring-blue-600"
                          : "bg-white dark:bg-[#161616] border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      }`}
                    >
                      <div className="flex flex-col items-center text-center">
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center mb-2 ${
                            selectedRole === "api" ||
                            (!selectedRole && selectedUser.accessLevel === 2)
                              ? "bg-blue-200 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400"
                              : "bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400"
                          }`}
                        >
                          <HiShieldCheck className="h-5 w-5" />
                        </div>
                        <span
                          className={`text-sm font-medium ${
                            selectedRole === "api" ||
                            (!selectedRole && selectedUser.accessLevel === 2)
                              ? "text-blue-800 dark:text-blue-300"
                              : "text-gray-800 dark:text-gray-200"
                          }`}
                        >
                          API Manager
                        </span>
                      </div>
                    </div>

                    {/* Support Coordinator */}
                    <div
                      onClick={() => handleRoleSelect("moderator")}
                      className={`rounded-lg border p-3 cursor-pointer transition-all ${
                        selectedRole === "moderator" ||
                        (!selectedRole && selectedUser.accessLevel === 3)
                          ? "bg-teal-100 dark:bg-teal-900/40 border-teal-300 dark:border-teal-700 ring-2 ring-teal-400 dark:ring-teal-600"
                          : "bg-white dark:bg-[#161616] border-gray-200 dark:border-gray-700 hover:bg-teal-50 dark:hover:bg-teal-900/20"
                      }`}
                    >
                      <div className="flex flex-col items-center text-center">
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center mb-2 ${
                            selectedRole === "moderator" ||
                            (!selectedRole && selectedUser.accessLevel === 3)
                              ? "bg-teal-200 dark:bg-teal-900/60 text-teal-600 dark:text-teal-400"
                              : "bg-teal-50 dark:bg-teal-900/20 text-teal-500 dark:text-teal-400"
                          }`}
                        >
                          <HiShieldCheck className="h-5 w-5" />
                        </div>
                        <span
                          className={`text-sm font-medium ${
                            selectedRole === "moderator" ||
                            (!selectedRole && selectedUser.accessLevel === 3)
                              ? "text-teal-800 dark:text-teal-300"
                              : "text-gray-800 dark:text-gray-200"
                          }`}
                        >
                          Support Coordinator
                        </span>
                      </div>
                    </div>

                    {/* Regular User */}
                    <div
                      onClick={() => handleRoleSelect("user")}
                      className={`rounded-lg border p-3 cursor-pointer transition-all ${
                        selectedRole === "user" ||
                        (!selectedRole &&
                          (selectedUser.accessLevel === 4 ||
                            selectedUser.accessLevel === undefined))
                          ? "bg-gray-100 dark:bg-gray-800/60 border-gray-300 dark:border-gray-600 ring-2 ring-gray-400 dark:ring-gray-500"
                          : "bg-white dark:bg-[#161616] border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                    >
                      <div className="flex flex-col items-center text-center">
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center mb-2 ${
                            selectedRole === "user" ||
                            (!selectedRole &&
                              (selectedUser.accessLevel === 4 ||
                                selectedUser.accessLevel === undefined))
                              ? "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          <HiUserCircle className="h-5 w-5" />
                        </div>
                        <span
                          className={`text-sm font-medium ${
                            selectedRole === "user" ||
                            (!selectedRole &&
                              (selectedUser.accessLevel === 4 ||
                                selectedUser.accessLevel === undefined))
                              ? "text-gray-800 dark:text-gray-200"
                              : "text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          Regular User
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Save/Cancel buttons for role changes - Note: Order switched as requested */}
                  {isRoleChanged && (
                    <div className="flex justify-end mt-4 space-x-3">
                      <Button
                        color="success"
                        size="sm"
                        onClick={handleSaveRoleChanges}
                        className="bg-green-600 hover:bg-green-700 text-white border-none"
                      >
                        <HiCheck className="mr-2 h-4 w-4" />
                        Save Changes
                      </Button>
                      <Button
                        color="light"
                        size="sm"
                        onClick={handleCancelRoleChanges}
                        className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border-none"
                      >
                        <HiX className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Token Management Section */}
            {activeSection === "tokenManagement" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                  Token Management
                </h2>

                {/* Token Management */}
                <div className="bg-white dark:bg-[#1E1F21] rounded-lg shadow-sm overflow-hidden">
                  {/* Header Section */}
                  <div className="px-6 py-4 border-b dark:border-gray-700">
                    <h4 className="text-gray-600 dark:text-gray-400 text-sm font-medium uppercase">
                      User Tokens
                    </h4>
                  </div>

                  {/* Content Section */}
                  <div className="p-6">
                    {/* Current Token Balance Display */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-xl p-6 mb-6 border border-blue-100 dark:border-blue-900/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <HiCurrencyDollar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                              Current Token Balance
                            </p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">
                              {getUserTokens(selectedUser).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="hidden sm:block text-right">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Available for
                          </p>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            API calls & services
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Token Actions Section */}
                    <div className="mb-6">
                      <h5 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                        Token Actions
                      </h5>

                      {isEditingTokens ? (
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              {tokenActionType === "edit"
                                ? "New Token Balance"
                                : tokenActionType === "add"
                                ? "Amount to Add"
                                : tokenActionType === "remove"
                                ? "Amount to Remove"
                                : "Reset to Value"}
                            </label>
                            <TextInput
                              type="number"
                              value={tokenValue}
                              onChange={(e) => setTokenValue(e.target.value)}
                              placeholder={
                                tokenActionType === "edit"
                                  ? "Enter new balance"
                                  : "Enter amount"
                              }
                              className="w-full"
                            />
                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                              {tokenActionType === "edit"
                                ? "This will replace the current token balance"
                                : tokenActionType === "add"
                                ? "This amount will be added to the current balance"
                                : tokenActionType === "remove"
                                ? "This amount will be deducted from the current balance"
                                : ""}
                            </p>
                          </div>
                          <div className="flex justify-end space-x-3">
                            <Button
                              color="success"
                              size="sm"
                              onClick={handleTokenEditSave}
                              className="bg-green-600 hover:bg-green-700 text-white border-none"
                            >
                              <HiCheck className="mr-2 h-4 w-4" />
                              Save Changes
                            </Button>
                            <Button
                              color="light"
                              size="sm"
                              onClick={() => {
                                setIsEditingTokens(false);
                                setTokenActionType(null);
                              }}
                              className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border-none"
                            >
                              <HiX className="mr-2 h-4 w-4" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : showResetConfirmation ? (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-5 border border-yellow-200 dark:border-yellow-800">
                          <div className="flex items-start mb-3">
                            <div className="flex-shrink-0">
                              <HiExclamationCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <div className="ml-3">
                              <h6 className="text-sm font-semibold text-yellow-800 dark:text-yellow-300 mb-1">
                                Confirm Token Reset
                              </h6>
                              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                                Are you sure you want to reset the token count
                                to 0 for this user? This action cannot be
                                undone.
                              </p>
                            </div>
                          </div>
                          <div className="flex justify-end space-x-3 mt-4">
                            <Button
                              color="warning"
                              size="sm"
                              onClick={handleConfirmReset}
                              className="bg-yellow-600 hover:bg-yellow-700 text-white border-none"
                            >
                              <HiCheck className="mr-2 h-4 w-4" />
                              Confirm Reset
                            </Button>
                            <Button
                              color="light"
                              size="sm"
                              onClick={() => {
                                setShowResetConfirmation(false);
                                setTokenActionType(null);
                              }}
                              className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border-none"
                            >
                              <HiX className="mr-2 h-4 w-4" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <button
                            onClick={() => handleTokenAction("edit")}
                            className="group bg-white dark:bg-[#161616] border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4 cursor-pointer hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md transition-all duration-200"
                          >
                            <div className="flex flex-col items-center text-center space-y-3">
                              <div className="h-12 w-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
                                <HiPencilAlt className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                <span className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
                                  Edit
                                </span>
                                <span className="block text-xs text-gray-500 dark:text-gray-400">
                                  Set new balance
                                </span>
                              </div>
                            </div>
                          </button>

                          <button
                            onClick={() => handleTokenAction("add")}
                            className="group bg-white dark:bg-[#161616] border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4 cursor-pointer hover:border-green-400 dark:hover:border-green-600 hover:shadow-md transition-all duration-200"
                          >
                            <div className="flex flex-col items-center text-center space-y-3">
                              <div className="h-12 w-12 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center group-hover:bg-green-100 dark:group-hover:bg-green-900/40 transition-colors">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={2}
                                  stroke="currentColor"
                                  className="w-6 h-6 text-green-600 dark:text-green-400"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 4.5v15m7.5-7.5h-15"
                                  />
                                </svg>
                              </div>
                              <div>
                                <span className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
                                  Add
                                </span>
                                <span className="block text-xs text-gray-500 dark:text-gray-400">
                                  Increase tokens
                                </span>
                              </div>
                            </div>
                          </button>

                          <button
                            onClick={() => handleTokenAction("remove")}
                            className="group bg-white dark:bg-[#161616] border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4 cursor-pointer hover:border-red-400 dark:hover:border-red-600 hover:shadow-md transition-all duration-200"
                          >
                            <div className="flex flex-col items-center text-center space-y-3">
                              <div className="h-12 w-12 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center group-hover:bg-red-100 dark:group-hover:bg-red-900/40 transition-colors">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={2}
                                  stroke="currentColor"
                                  className="w-6 h-6 text-red-600 dark:text-red-400"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M19.5 12h-15"
                                  />
                                </svg>
                              </div>
                              <div>
                                <span className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
                                  Remove
                                </span>
                                <span className="block text-xs text-gray-500 dark:text-gray-400">
                                  Decrease tokens
                                </span>
                              </div>
                            </div>
                          </button>

                          <button
                            onClick={() => handleTokenAction("reset")}
                            className="group bg-white dark:bg-[#161616] border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4 cursor-pointer hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-md transition-all duration-200"
                          >
                            <div className="flex flex-col items-center text-center space-y-3">
                              <div className="h-12 w-12 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center group-hover:bg-amber-100 dark:group-hover:bg-amber-900/40 transition-colors">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={2}
                                  stroke="currentColor"
                                  className="w-6 h-6 text-amber-600 dark:text-amber-400"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                                  />
                                </svg>
                              </div>
                              <div>
                                <span className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
                                  Reset
                                </span>
                                <span className="block text-xs text-gray-500 dark:text-gray-400">
                                  Clear all tokens
                                </span>
                              </div>
                            </div>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Token Usage Information */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <h6 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Token Information
                      </h6>
                      <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        <li>• Tokens are consumed with each API request</li>
                        <li>
                          • Different endpoints may consume different token
                          amounts
                        </li>
                        <li>
                          • Users can purchase additional tokens or upgrade
                          their plan
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Subscription Plan Section */}
            {activeSection === "subscriptionPlan" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                  Subscription Plan
                </h2>

                {/* Subscription Plans */}
                <div className="bg-white dark:bg-[#1E1F21] rounded-lg p-5 shadow-sm">
                  <h4 className="uppercase text-gray-600 dark:text-gray-400 text-sm font-medium mb-4">
                    AVAILABLE PLANS
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    {/* Enterprise Plan */}
                    <div
                      onClick={() => handlePlanSelect("Enterprise")}
                      className={`rounded-lg border p-3 cursor-pointer transition-all ${
                        selectedPlan === "Enterprise" ||
                        (!selectedPlan &&
                          getUserPlan(selectedUser) === "Enterprise")
                          ? "bg-indigo-100 dark:bg-indigo-900/40 border-indigo-300 dark:border-indigo-700 ring-2 ring-indigo-400 dark:ring-indigo-600"
                          : "bg-white dark:bg-[#161616] border-gray-200 dark:border-gray-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                      }`}
                    >
                      <div className="flex flex-col items-center text-center">
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center mb-2 ${
                            selectedPlan === "Enterprise" ||
                            (!selectedPlan &&
                              getUserPlan(selectedUser) === "Enterprise")
                              ? "bg-indigo-200 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400"
                              : "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 dark:text-indigo-400"
                          }`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-5 h-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z"
                            />
                          </svg>
                        </div>
                        <span
                          className={`text-sm font-medium ${
                            selectedPlan === "Enterprise" ||
                            (!selectedPlan &&
                              getUserPlan(selectedUser) === "Enterprise")
                              ? "text-indigo-800 dark:text-indigo-300"
                              : "text-gray-800 dark:text-gray-200"
                          }`}
                        >
                          Enterprise
                        </span>
                      </div>
                    </div>

                    {/* Developer Plan */}
                    <div
                      onClick={() => handlePlanSelect("Developer")}
                      className={`rounded-lg border p-3 cursor-pointer transition-all ${
                        selectedPlan === "Developer" ||
                        (!selectedPlan &&
                          getUserPlan(selectedUser) === "Developer")
                          ? "bg-blue-100 dark:bg-blue-900/40 border-blue-300 dark:border-blue-700 ring-2 ring-blue-400 dark:ring-blue-600"
                          : "bg-white dark:bg-[#161616] border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      }`}
                    >
                      <div className="flex flex-col items-center text-center">
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center mb-2 ${
                            selectedPlan === "Developer" ||
                            (!selectedPlan &&
                              getUserPlan(selectedUser) === "Developer")
                              ? "bg-blue-200 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400"
                              : "bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400"
                          }`}
                        >
                          <HiCog className="h-5 w-5" />
                        </div>
                        <span
                          className={`text-sm font-medium ${
                            selectedPlan === "Developer" ||
                            (!selectedPlan &&
                              getUserPlan(selectedUser) === "Developer")
                              ? "text-blue-800 dark:text-blue-300"
                              : "text-gray-800 dark:text-gray-200"
                          }`}
                        >
                          Developer
                        </span>
                      </div>
                    </div>

                    {/* Educational Plan */}
                    <div
                      onClick={() => handlePlanSelect("Educational")}
                      className={`rounded-lg border p-3 cursor-pointer transition-all ${
                        selectedPlan === "Educational" ||
                        (!selectedPlan &&
                          getUserPlan(selectedUser) === "Educational")
                          ? "bg-purple-100 dark:bg-purple-900/40 border-purple-300 dark:border-purple-700 ring-2 ring-purple-400 dark:ring-purple-600"
                          : "bg-white dark:bg-[#161616] border-gray-200 dark:border-gray-700 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                      }`}
                    >
                      <div className="flex flex-col items-center text-center">
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center mb-2 ${
                            selectedPlan === "Educational" ||
                            (!selectedPlan &&
                              getUserPlan(selectedUser) === "Educational")
                              ? "bg-purple-200 dark:bg-purple-900/60 text-purple-600 dark:text-purple-400"
                              : "bg-purple-50 dark:bg-purple-900/20 text-purple-500 dark:text-purple-400"
                          }`}
                        >
                          <HiAcademicCap className="h-5 w-5" />
                        </div>
                        <span
                          className={`text-sm font-medium ${
                            selectedPlan === "Educational" ||
                            (!selectedPlan &&
                              getUserPlan(selectedUser) === "Educational")
                              ? "text-purple-800 dark:text-purple-300"
                              : "text-gray-800 dark:text-gray-200"
                          }`}
                        >
                          Educational
                        </span>
                      </div>
                    </div>

                    {/* Trial Plan */}
                    <div
                      onClick={() => handlePlanSelect("Trial")}
                      className={`rounded-lg border p-3 cursor-pointer transition-all ${
                        selectedPlan === "Trial" ||
                        (!selectedPlan && getUserPlan(selectedUser) === "Trial")
                          ? "bg-teal-100 dark:bg-teal-900/40 border-teal-300 dark:border-teal-700 ring-2 ring-teal-400 dark:ring-teal-600"
                          : "bg-white dark:bg-[#161616] border-gray-200 dark:border-gray-700 hover:bg-teal-50 dark:hover:bg-teal-900/20"
                      }`}
                    >
                      <div className="flex flex-col items-center text-center">
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center mb-2 ${
                            selectedPlan === "Trial" ||
                            (!selectedPlan &&
                              getUserPlan(selectedUser) === "Trial")
                              ? "bg-teal-200 dark:bg-teal-900/60 text-teal-600 dark:text-teal-400"
                              : "bg-teal-50 dark:bg-teal-900/20 text-teal-500 dark:text-teal-400"
                          }`}
                        >
                          <HiCalendar className="h-5 w-5" />
                        </div>
                        <span
                          className={`text-sm font-medium ${
                            selectedPlan === "Trial" ||
                            (!selectedPlan &&
                              getUserPlan(selectedUser) === "Trial")
                              ? "text-teal-800 dark:text-teal-300"
                              : "text-gray-800 dark:text-gray-200"
                          }`}
                        >
                          Trial
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Save/Cancel buttons for plan changes */}
                  {isPlanChanged && (
                    <div className="flex justify-end mt-4 space-x-3">
                      <Button
                        color="success"
                        size="sm"
                        onClick={handleSavePlanChanges}
                        className="bg-green-600 hover:bg-green-700 text-white border-none"
                      >
                        <HiCheck className="mr-2 h-4 w-4" />
                        Save Changes
                      </Button>
                      <Button
                        color="light"
                        size="sm"
                        onClick={handleCancelPlanChanges}
                        className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border-none"
                      >
                        <HiX className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                    </div>
                  )}

                  {/* Plan Details */}
                  <div className="mt-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                    <h5 className="text-base font-medium text-gray-900 dark:text-white mb-3">
                      Current Plan Details
                    </h5>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          Plan
                        </span>
                        <span className="text-sm font-medium text-gray-800 dark:text-white">
                          {selectedPlan || getUserPlan(selectedUser)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          Token Limit
                        </span>
                        <span className="text-sm font-medium text-gray-800 dark:text-white">
                          {(selectedPlan || getUserPlan(selectedUser)) ===
                          "Trial"
                            ? "200"
                            : "Custom"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          API Rate Limit
                        </span>
                        <span className="text-sm font-medium text-gray-800 dark:text-white">
                          {(selectedPlan || getUserPlan(selectedUser)) ===
                          "Enterprise"
                            ? "-- req/min"
                            : (selectedPlan || getUserPlan(selectedUser)) ===
                              "Developer"
                            ? "-- req/min"
                            : (selectedPlan || getUserPlan(selectedUser)) ===
                              "Educational"
                            ? "-- req/min"
                            : "-- req/min"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Account Action Section - Improved UI */}
            {activeSection === "accountAction" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                  Account Actions
                </h2>

                {/* Account Actions */}
                <div className="bg-white dark:bg-[#1E1F21] rounded-lg shadow-sm">
                  <div className="px-6 py-4 border-b dark:border-gray-700">
                    <h4 className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                      Account Status
                    </h4>
                  </div>

                  <div className="p-6">
                    {/* Status Section - Improved with better visual status indicator */}
                    <div className="mb-6 flex items-center justify-between">
                      <div className="flex items-center">
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center mr-3 ${
                            selectedUser.verified
                              ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          {selectedUser.verified ? (
                            <HiCheck className="h-5 w-5" />
                          ) : (
                            <HiX className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            Current Status
                          </div>
                          <div
                            className={`text-sm ${
                              selectedUser.verified
                                ? "text-green-600 dark:text-green-400"
                                : "text-gray-500 dark:text-gray-400"
                            }`}
                          >
                            {selectedUser.verified
                              ? "Active Account"
                              : "Inactive Account"}
                          </div>
                        </div>
                      </div>

                      <Button
                        color={selectedUser.verified ? "light" : "success"}
                        size="sm"
                        className={`${
                          selectedUser.verified
                            ? "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
                            : "bg-green-600 hover:bg-green-700 text-white"
                        } border-none`}
                        onClick={() =>
                          toggleUserStatus(
                            selectedUser._id,
                            selectedUser.verified,
                            { stopPropagation: () => {} }
                          )
                        }
                      >
                        {selectedUser.verified
                          ? "Disable Account"
                          : "Enable Account"}
                      </Button>
                    </div>

                    <hr className="my-6 border-gray-200 dark:border-gray-700" />

                    {/* Danger Zone - Enhanced UI */}
                    <div>
                      <div className="flex items-center mb-4">
                        <div className="h-10 w-10 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600 dark:text-red-400 mr-3">
                          <HiExclamationCircle className="h-5 w-5" />
                        </div>
                        <div className="text-sm font-medium text-red-600 dark:text-red-400">
                          Danger Zone
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          color="light"
                          size="sm"
                          className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border-none flex justify-center items-center"
                        >
                          <HiLockClosed className="mr-2 h-4 w-4" />
                          Block Account
                        </Button>

                        <Button
                          color="failure"
                          size="sm"
                          className="bg-red-600 hover:bg-red-700 text-white border-none flex justify-center items-center"
                          onClick={() => {
                            setIsUserModalOpen(false);
                            setIsDeleteModalOpen(true);
                          }}
                        >
                          <HiExclamation className="mr-2 h-4 w-4" />
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default UserProfileDetailModal;
