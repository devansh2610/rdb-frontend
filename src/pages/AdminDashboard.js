import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Spinner } from "flowbite-react";
import axios from "../api/axios";
import AdminNavbar from "../components/AdminNavbar";
import AdminSidebar from "../components/AdminSidebar";
import UsersList from "../components/UsersList";
import EmailInbox from "../components/email/EmailInbox";
import EmailCompose from "../components/email/EmailCompose";
import APICatalog from "../components/APICatalog";
import AdminAnalytics from "../components/AdminAnalytics";
import AdminTransactions from "../components/AdminTransactions";
import { 
  HiUsers, 
  HiCurrencyDollar, 
  HiShoppingCart, 
  HiTag, 
  HiUserCircle, 
  HiStatusOnline, 
  HiUserGroup,
  HiOutlineExclamation
} from "react-icons/hi";
import * as adminService from "../api/adminService";

// Coming Soon Component for features under development
const ComingSoonMessage = ({ featureName }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full py-20">
      <div className="bg-gray-100 dark:bg-[#28292B] rounded-lg p-8 max-w-md w-full text-center">
        <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 mb-6">
          <HiOutlineExclamation className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">{featureName} Coming Soon</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          We're continuously working on improving this feature. Stay tuned for updates as our team is actively developing it.
        </p>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="bg-blue-600 h-full rounded-full w-3/4"></div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Development in progress...</p>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  // showType - what to show on the right panel
  // -1 -> loading
  // 1 -> list of users (UsersList)
  // 2 -> list of apis and their subapis (ApiCatalog)
  // 3 -> dashboard overview (statistics, charts, activity)
  // 4 -> subscription email inbox
  // 5 -> FAQ email inbox
  // 6 -> compose email
  // 7 -> analytics
  // 8 -> transactions
  // 9 -> invoices
  const [showType, setShowType] = useState(1);

  // STATE VARIABLES
  const [users, setUsers] = useState([]); // list of users
  const [apisList, setApisList] = useState([]); // list of apis
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20); // users per page
  const [totalUsers, setTotalUsers] = useState(0); // total users count from API
  const [totalPages, setTotalPages] = useState(0); // total pages from API
  
  // Email pagination states
  const [subscriptionCurrentPage, setSubscriptionCurrentPage] = useState(1);
  const [subscriptionPageSize, setSubscriptionPageSize] = useState(20);
  const [subscriptionTotalEmails, setSubscriptionTotalEmails] = useState(0);
  const [subscriptionTotalPages, setSubscriptionTotalPages] = useState(0);
  
  const [inquiryCurrentPage, setInquiryCurrentPage] = useState(1);
  const [inquiryPageSize, setInquiryPageSize] = useState(20);
  const [inquiryTotalEmails, setInquiryTotalEmails] = useState(0);
  const [inquiryTotalPages, setInquiryTotalPages] = useState(0);
  
  const [metricsStatus, setMetricsStatus] = useState(null); 
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    totalUsersChange: 12,
    paidUsers: 0,
    paidUsersChange: 8,
    activeUsers: 0,
    activeUsersChange: 15
  });
  const [dateRange, setDateRange] = useState("16 May 2025 - 23 May 2025");
  const [replyToEmail, setReplyToEmail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPageLoading, setIsPageLoading] = useState(false);
  

  // Sample email data (will be replaced with API data)
  const [subscriptionEmails, setSubscriptionEmails] = useState([]);
  
  const [inquiryEmails, setInquiryEmails] = useState([]);

  const [searchHighlightedUser, setSearchHighlightedUser] = useState(null);

  // MISC
  const { getToken, getProfile, logout } = useAuth();
  const navigate = useNavigate();
  const userInfo = getProfile() || {};

  // REDIRECTION
  // Redirect without Authorization
  useEffect(() => {
    // Allow both accessLevel 0 (SuperAdmin) and accessLevel 1 to access the admin panel
    if (userInfo && userInfo.accessLevel !== undefined && userInfo.accessLevel !== 0 && userInfo.accessLevel !== 1) {
      navigate("/");
    }
  }, [userInfo, navigate]);

  // FETCHING FUNCTIONS
  // these functions fetch the information for state variables above
  const fetchApiList = async () => {
    // fetches the list of apis
    try {
      const token = await getToken();
      const result = await axios.get("/apis", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setApisList(result.data.apis || []);
    } catch (error) {
      if (error.response?.status === 401) {
        logout();
      }
      setApisList([]);
    }
  };

  const fetchSubscriptionEmails = async (page = 1, pageSize = 20) => {
    try {
      // Use the new admin service endpoint for developers with pagination
      const response = await adminService.getAllDevelopers(page, pageSize);
      
      // Transform the data into the format our EmailInbox component expects
      const formattedEmails = Array.isArray(response.data) ? response.data.map((contact) => ({
        id: contact._id,
        from: contact.name || 'Unknown',
        email: contact.email || '',
        subject: `Query from ${contact.organisationName || 'Organization'}`,
        message: contact.query || '',
        timestamp: contact.createdAt ? new Date(contact.createdAt).toLocaleDateString() : "Recently",
        read: contact.read || false,
        important: contact.star || false,
        contactNumber: contact.contactNumber,
        organisationName: contact.organisationName,
        _id: contact._id // Keep the original ID
      })) : [];
      
      // Set pagination metadata
      const totalCount = response.totalCount || response.total || formattedEmails.length;
      const calculatedTotalPages = Math.ceil(totalCount / pageSize);
      
      setSubscriptionEmails(formattedEmails);
      setSubscriptionTotalEmails(totalCount);
      setSubscriptionTotalPages(calculatedTotalPages);
      
      return { emails: formattedEmails, totalCount, totalPages: calculatedTotalPages };
    } catch (error) {
      console.error("Error fetching developer contacts:", error);
      // Fall back to sample data if API fails
      const sampleEmails = [
        {
          id: "sample1",
          from: "John Smith",
          email: "john.smith@company.com",
          subject: "API Integration Query",
          message: "I would like to know more about integrating your API with our e-commerce platform.",
          timestamp: "2 hours ago",
          read: false,
          important: true,
          contactNumber: "+1234567890",
          organisationName: "Tech Solutions Inc."
        }
      ];
      setSubscriptionEmails(sampleEmails);
      setSubscriptionTotalEmails(1);
      setSubscriptionTotalPages(1);
      return { emails: sampleEmails, totalCount: 1, totalPages: 1 };
    }
  };

  const fetchInquiryEmails = async (page = 1, pageSize = 20) => {
    try {
      // Use the new admin service endpoint for contacts with pagination
      const response = await adminService.getAllContacts(page, pageSize);
      
      // Transform the data into the format our EmailInbox component expects
      const formattedEmails = Array.isArray(response.data) ? response.data.map((inquiry) => ({
        id: inquiry._id,
        from: inquiry.fullname || 'Anonymous',
        email: inquiry.email || '',
        subject: 'Website Inquiry',
        message: inquiry.message || '',
        timestamp: inquiry.createdAt ? new Date(inquiry.createdAt).toLocaleDateString() : "Recently",
        read: inquiry.read || false,
        important: inquiry.star || false,
        _id: inquiry._id // Keep the original ID
      })) : [];
      
      // Set pagination metadata
      const totalCount = response.totalCount || response.total || formattedEmails.length;
      const calculatedTotalPages = Math.ceil(totalCount / pageSize);
      
      setInquiryEmails(formattedEmails);
      setInquiryTotalEmails(totalCount);
      setInquiryTotalPages(calculatedTotalPages);
      
      return { emails: formattedEmails, totalCount, totalPages: calculatedTotalPages };
    } catch (error) {
      console.error("Error fetching contact inquiries:", error);
      // Fall back to sample data if API fails
      const sampleEmails = [
        {
          id: "sample1",
          from: "Test User",
          email: "testcase@example.com",
          subject: "General Inquiry",
          message: "I have a question about your services.",
          timestamp: "5 hours ago",
          read: false,
          important: false
        }
      ];
      setInquiryEmails(sampleEmails);
      setInquiryTotalEmails(1);
      setInquiryTotalPages(1);
      return { emails: sampleEmails, totalCount: 1, totalPages: 1 };
    }
  };

  const fetchUsers = async (page = 1, pageSize = 20, isPageChange = false) => {
    // fetches the list of users that have registered on the platform with server-side pagination
    try {
      if (isPageChange) {
        setIsPageLoading(true);
      } else {
        setIsLoading(true);
      }
      const token = await getToken();
      
      // Skip the API call if there's no valid token
      if (!token || token === 0) {
        console.log("No valid token available");
        if (isPageChange) {
          setIsPageLoading(false);
        } else {
          setIsLoading(false);
        }
        return { users: [], totalCount: 0, totalPages: 0 };
      }
      
      const result = await axios.get("/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          pageSize: pageSize,
          page: page,
        },
      });

      // Don't filter out admin users as we want to show all users
      const fetchedUsers = result.data.users || [];
      const totalCount = result.data.totalCount || result.data.total || fetchedUsers.length;
      const calculatedTotalPages = Math.ceil(totalCount / pageSize);
      
      setUsers(fetchedUsers);
      setTotalUsers(totalCount);
      setTotalPages(calculatedTotalPages);
      
      // For dashboard stats, we need to get overall statistics
      // We'll make a separate call for stats or use the provided totals
      if (result.data.stats) {
        setDashboardStats(prev => ({
          ...prev,
          totalUsers: result.data.stats.totalUsers || totalCount,
          activeUsers: result.data.stats.activeUsers || 0,
          paidUsers: result.data.stats.paidUsers || 0
        }));
      } else {
        // If no stats provided, calculate from current page data (partial data)
        const activeUsers = fetchedUsers.filter(user => user.verified).length;
        const paidUsers = fetchedUsers.filter(user => user.plan === 1 || user.plan === 2).length;
        
        setDashboardStats(prev => ({
          ...prev,
          totalUsers: totalCount,
          // Note: These will be inaccurate as they're based on current page only
          activeUsers: page === 1 ? activeUsers : prev.activeUsers,
          paidUsers: page === 1 ? paidUsers : prev.paidUsers
        }));
      }
      
      return { users: fetchedUsers, totalCount, totalPages: calculatedTotalPages };
    } catch (error) {
      console.error("Error fetching users:", error);
      if (error.response?.status === 401) {
        logout();
      }
      // Set empty users array to prevent undefined errors
      setUsers([]);
      return { users: [], totalCount: 0, totalPages: 0 };
    } finally {
      if (isPageChange) {
        setIsPageLoading(false);
      } else {
        setIsLoading(false);
      }
    }
  };

  const fetchMetricsStatus = async () => {
    try {
      const token = await getToken();
      const response = await axios.get("/metrics/status", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Process the metrics data before setting it
      const metricsData = response.data;
      
      // Make sure the allEndpoints array is properly formatted
      if (!metricsData.allEndpoints && metricsData.proxy?.allProxiedEndpoints) {
        metricsData.allEndpoints = metricsData.proxy.allProxiedEndpoints.map(endpoint => {
          return {
            endpoint: endpoint,
            count: 1, // Default count
            method: 'GET' // Default method
          };
        });
      }
      
      setMetricsStatus(metricsData);
    } catch (error) {
      setMetricsStatus(null);
    }
  };

  // Handle updates for all data
  const handleUpdates = async (resetToFirstPage = false) => {
    try {
      setIsLoading(true);
      // Only fetch data if user is authenticated
      const token = await getToken();
      if (!token || token === 0) {
        console.log("No valid token available for updates");
        return;
      }
      
      const pageToFetch = resetToFirstPage ? 1 : currentPage;
      if (resetToFirstPage) {
        setCurrentPage(1);
      }
      
      await fetchUsers(pageToFetch, pageSize);
      await fetchApiList();
      await fetchSubscriptionEmails(subscriptionCurrentPage, subscriptionPageSize);
      await fetchInquiryEmails(inquiryCurrentPage, inquiryPageSize);
      await fetchMetricsStatus();
    } catch (error) {
      console.error("Error updating data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle starting a reply to an email
  const handleReply = (email) => {
    setReplyToEmail(email);
    setShowType(6); // Show compose view
  };

  // Handle global search
  const handleGlobalSearch = (user) => {
    // Show the user list
    setShowType(1);
    // Highlight the specific user
    setSearchHighlightedUser(user);
    // Reset after a delay
    setTimeout(() => {
      setSearchHighlightedUser(null);
    }, 3000); // Highlight for 3 seconds
  };

  // Initial data loading
  useEffect(() => {
    // This effect will run only once when the component mounts
    const loadInitialData = async () => {
      try {
        // Check if user is authenticated before loading data
        const token = getToken();
        if (!token || token === 0) {
          return;
        }
        
        setIsLoading(true);
        await fetchUsers(1, pageSize); // Start with page 1
        await fetchApiList();
        await fetchSubscriptionEmails(1, subscriptionPageSize); // Start with page 1
        await fetchInquiryEmails(1, inquiryPageSize); // Start with page 1
        await fetchMetricsStatus();
      } catch (error) {
        // Handle errors silently
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInitialData();
  }, []); // Empty dependency array ensures this runs only once

  // fetch users on page change
  useEffect(() => {
    const loadUsers = async () => {
      try {
        // Only fetch if we have a valid page and the component is mounted
        if (currentPage > 0) {
          await fetchUsers(currentPage, pageSize, true); // isPageChange = true
        }
      } catch (error) {
        console.error("Error loading users for page:", error);
      }
    };
    
    loadUsers();
  }, [currentPage, pageSize]);

  // fetch subscription emails on page change
  useEffect(() => {
    const loadSubscriptionEmails = async () => {
      try {
        if (subscriptionCurrentPage > 0) {
          await fetchSubscriptionEmails(subscriptionCurrentPage, subscriptionPageSize);
        }
      } catch (error) {
        console.error("Error loading subscription emails for page:", error);
      }
    };
    
    loadSubscriptionEmails();
  }, [subscriptionCurrentPage, subscriptionPageSize]);

  // fetch inquiry emails on page change
  useEffect(() => {
    const loadInquiryEmails = async () => {
      try {
        if (inquiryCurrentPage > 0) {
          await fetchInquiryEmails(inquiryCurrentPage, inquiryPageSize);
        }
      } catch (error) {
        console.error("Error loading inquiry emails for page:", error);
      }
    };
    
    loadInquiryEmails();
  }, [inquiryCurrentPage, inquiryPageSize]);

  const handleShowType = (val) => {
    // sets the show type
    // show type has been defined at the start of the file
    if (val !== 6) setReplyToEmail(null); // Clear reply state unless going to compose
    
    // Handle invoice redirect
    if (val === 9) {
      window.open('https://dashboard.razorpay.com/app/dashboard', '_blank');
      return; // Don't update showType for invoices, keep the current view
    }
    
    setShowType(val);
  };

  // Render the Dashboard Overview
  const renderDashboardOverview = () => {
    return <ComingSoonMessage featureName="Dashboard" />;
  };

  // Render Email Subscription Inbox with updated handling for the new endpoints
  const renderSubscriptionInbox = () => {
    return (
      <EmailInbox
        title="Subscription Inbox"
        emails={subscriptionEmails}
        setEmails={setSubscriptionEmails}
        onReply={handleReply}
        onUpdateEmail={async (emailId, updates) => {
          try {
            await adminService.updateDeveloper(emailId, {
              read: updates.read,
              star: updates.important
            });
            // Refresh the list after update
            fetchSubscriptionEmails(subscriptionCurrentPage, subscriptionPageSize);
          } catch (error) {
            console.error("Error updating developer contact:", error);
          }
        }}
        // Pagination props
        currentPage={subscriptionCurrentPage}
        setCurrentPage={setSubscriptionCurrentPage}
        pageSize={subscriptionPageSize}
        setPageSize={setSubscriptionPageSize}
        totalEmails={subscriptionTotalEmails}
        totalPages={subscriptionTotalPages}
        isServerSidePagination={true}
      />
    );
  };

  // Render Email Inquiry Inbox with updated handling for the new endpoints
  const renderInquiryInbox = () => {
    return (
      <EmailInbox
        title="Inquiry Inbox"
        emails={inquiryEmails}
        setEmails={setInquiryEmails}
        onReply={handleReply}
        onUpdateEmail={async (emailId, updates) => {
          try {
            await adminService.updateContact(emailId, {
              read: updates.read,
              star: updates.important
            });
            // Refresh the list after update
            fetchInquiryEmails(inquiryCurrentPage, inquiryPageSize);
          } catch (error) {
            console.error("Error updating contact:", error);
          }
        }}
        // Pagination props
        currentPage={inquiryCurrentPage}
        setCurrentPage={setInquiryCurrentPage}
        pageSize={inquiryPageSize}
        setPageSize={setInquiryPageSize}
        totalEmails={inquiryTotalEmails}
        totalPages={inquiryTotalPages}
        isServerSidePagination={true}
      />
    );
  };

  // Render Email Compose
  const renderEmailCompose = () => {
    return <EmailCompose replyTo={replyToEmail} onCancel={() => setShowType(4)} />;
  };


  const renderApiCatalog = () => {
    return (
      <APICatalog 
        apis={apisList} 
        metricsStatus={metricsStatus}
        onApiClick={(api) => {
          // Pass the clicked API to the catalog component
          return api;
        }} 
      />
    );
  }

  const renderAdminAnalytics = () => {
    return (
      <AdminAnalytics/>
    );
  }

  const renderAdminTransactions = () => {
    return (
      <AdminTransactions/>
    );
  }

  
  return (
    <div className="flex flex-col h-screen bg-[#161616]">
      {/* Admin Navbar */}
      <AdminNavbar 
        userInfo={userInfo} 
        users={users} 
        handleGlobalSearch={handleGlobalSearch}
      />
      
      {/* Main content with sidebar */}
      <div className="flex flex-1 h-[calc(100vh-64px)] overflow-hidden">
        {/* Admin Sidebar */}
        <AdminSidebar handleShowType={handleShowType} activeMenu={showType} />
        
        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-5 bg-[#161616]">
          <div className="max-w-7xl mx-auto">
            {isLoading ? (
              <div className="flex items-center justify-center w-full h-full min-h-[calc(100vh-120px)]">
                <Spinner
                  aria-label="Loading spinner"
                  size="lg"
                />
              </div>
            ) : (
              (() => {
                switch (showType) {
                  case 1:
                    return (
                      <UsersList
                        usersList={users}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        pageSize={pageSize}
                        setPageSize={setPageSize}
                        totalUsers={totalUsers}
                        totalPages={totalPages}
                        handleUpdates={handleUpdates}
                        highlightedUser={searchHighlightedUser}
                        isServerSidePagination={true}
                        isPageLoading={isPageLoading}
                      />
                    );
                  case 2:
                    return renderApiCatalog();
                  case 3: 
                    return <ComingSoonMessage featureName="Dashboard" />;
                  case 4:
                    return renderSubscriptionInbox();
                  case 5:
                    return renderInquiryInbox();
                  case 6:
                    return renderEmailCompose();
                  case 7:
                    return renderAdminAnalytics();
                  case 8:
                    return renderAdminTransactions();
                  case 9:
                    return <ComingSoonMessage featureName="Invoices" />;
                  default:
                    return (
                      <UsersList
                        usersList={users}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        pageSize={pageSize}
                        setPageSize={setPageSize}
                        totalUsers={totalUsers}
                        totalPages={totalPages}
                        handleUpdates={handleUpdates}
                        highlightedUser={searchHighlightedUser}
                        isServerSidePagination={true}
                        isPageLoading={isPageLoading}
                      />
                    );
                }
              })()
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
