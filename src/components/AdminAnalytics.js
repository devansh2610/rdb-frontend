import React, { useEffect, useState, useCallback } from "react";
import { Spinner, Pagination, TextInput, Button, Modal } from "flowbite-react";
import { HiSearch, HiEye, HiX } from "react-icons/hi";
import axios from "../api/axios";
import { useAuth } from "../../src/context/AuthContext";
import ApiUsageModal from "../modals/ApiUsageModal";

const PAGE_SIZE = 10;

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showApiModal, setShowApiModal] = useState(false);
  const [selectedUserApis, setSelectedUserApis] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const { getToken } = useAuth();

  // Debounce function to avoid too many API calls while typing
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  const fetchAnalytics = async (pageNum = 1, search = "") => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      
      // Build query parameters
      const params = new URLSearchParams({
        page: pageNum.toString(),
        pageSize: PAGE_SIZE.toString()
      });
      
      // Add email search parameter if provided
      if (search.trim()) {
        params.append('email', search.trim());
      }
      
      const res = await axios.get(
        `https://api.foodoscope.com/admin/admin-metrics?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Handle the actual API response structure
      if (res.data && res.data.data) {
        setAnalytics(res.data.data);
        setTotalCount(res.data.totalCount || 0);
      } else {
        setAnalytics([]);
        setTotalCount(0);
      }
    } catch (err) {
      console.error('API Error:', err);
      setError("Failed to fetch analytics data.");
    }
    setLoading(false);
    setSearchLoading(false);
  };

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchTerm) => {
      setPage(1); // Reset to first page when searching
      fetchAnalytics(1, searchTerm);
    }, 500),
    []
  );

  // Handle search input changes
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setSearchLoading(true);
    
    if (value.trim() === "") {
      // If search is cleared, fetch all data
      setPage(1);
      fetchAnalytics(1, "");
    } else {
      // Trigger debounced search
      debouncedSearch(value);
    }
  };

  // Initial load and page changes
  useEffect(() => {
    fetchAnalytics(page, searchQuery);
  }, [page]);

  const openApiModal = (user) => {
    setSelectedUserApis({
      email: user.email,
      endpoints: user.endpointCounts || {}
    });
    setShowApiModal(true);
  };

  const closeApiModal = () => {
    setShowApiModal(false);
    setSelectedUserApis(null);
  };

  

  const getStatusColor = (successRate) => {
    if (successRate >= 95) return "text-green-400";
    if (successRate >= 80) return "text-yellow-400";
    return "text-red-400";
  };

  const getTotalRequestsFromDaily = (dailyUsage) => {
    if (!dailyUsage) return 0;
    return Object.values(dailyUsage).reduce((total, day) => total + (day.requests || 0), 0);
  };

  const getTotalErrorsFromDaily = (dailyUsage) => {
    if (!dailyUsage) return 0;
    return Object.values(dailyUsage).reduce((total, day) => total + (day.errors || 0), 0);
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="bg-gradient-to-br from-[#18191A] to-[#1a1b1c] rounded-xl shadow-2xl p-6 min-h-[500px] border border-gray-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">User Analytics</h2>
          <p className="text-gray-400 text-sm">Monitor user activity and API usage metrics</p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <TextInput
            id="search"
            type="text"
            icon={searchLoading ? Spinner : HiSearch}
            placeholder="Search by email..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full sm:w-80"
            sizing="md"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setPage(1);
                fetchAnalytics(1, "");
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <HiX className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#23272F] rounded-lg p-4 border border-gray-700">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white text-sm font-bold">T</span>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wide">
                {searchQuery ? "Matching Users" : "Total Users"}
              </p>
              <p className="text-white text-xl font-bold">{totalCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#23272F] rounded-lg p-4 border border-gray-700">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white text-sm font-bold">A</span>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wide">
                {searchQuery ? "Results on Page" : "Active Users"}
              </p>
              <p className="text-white text-xl font-bold">{analytics.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#23272F] rounded-lg p-4 border border-gray-700">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white text-sm font-bold">P</span>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wide">Current Page</p>
              <p className="text-white text-xl font-bold">{page} of {totalPages || 1}</p>
            </div>
          </div>
        </div>
      </div> */}

      {loading ? (
        <div className="flex flex-col justify-center items-center h-64 space-y-4">
          <Spinner size="xl" color="info" />
          <p className="text-gray-400">Loading analytics data...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
            <span className="text-red-400 text-2xl">!</span>
          </div>
          <div className="text-red-400 text-center">
            <p className="font-semibold">{error}</p>
            <p className="text-sm text-gray-500">Please try again later</p>
          </div>
          <Button color="gray" size="sm" onClick={() => fetchAnalytics(page, searchQuery)}>
            Retry
          </Button>
        </div>
      ) : (
        <>
          {/* Search Results Info */}
          {searchQuery && (
            <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-blue-400 text-sm">
                <span className="font-semibold">Search Results:</span> Found {totalCount} users matching "{searchQuery}"
                {totalCount > PAGE_SIZE && ` (showing ${analytics.length} of ${totalCount})`}
              </p>
            </div>
          )}

          {/* Table */}
          <div className="bg-[#1e1f20] rounded-lg border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-[#23272F] border-b border-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Requests
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Success Rate
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Avg Response
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Endpoints
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Last Activity
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {analytics.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center space-y-3">
                          <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                            <HiSearch className="w-6 h-6 text-gray-500" />
                          </div>
                          <p className="text-gray-400">
                            {searchQuery ? `No users found matching "${searchQuery}"` : "No analytics data available"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    analytics.map((user) => {
                      const totalReqs = user.totalRequests || getTotalRequestsFromDaily(user.dailyUsage);
                      const failedReqs = user.failedRequests || getTotalErrorsFromDaily(user.dailyUsage);
                      const successfulReqs = user.successfulRequests || (totalReqs - failedReqs);
                      const successRate = totalReqs > 0 ? (successfulReqs / totalReqs) * 100 : 0;

                      return (
                        <tr
                          key={user._id}
                          className="hover:bg-[#23272F] transition-colors duration-150"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
                                <span className="text-white text-xs font-bold">
                                  {user.email.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="text-white font-medium">{user.email}</p>
                                <p className="text-gray-400 text-xs">
                                  {user.totalRequests || getTotalRequestsFromDaily(user.dailyUsage)} total requests
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="space-y-1">
                              <p className="text-white font-semibold">
                                {user.totalRequests || getTotalRequestsFromDaily(user.dailyUsage)}
                              </p>
                              <div className="flex justify-center space-x-2 text-xs">
                                <span className="text-green-400">
                                  ✓ {user.successfulRequests ||
                                    ((user.totalRequests || getTotalRequestsFromDaily(user.dailyUsage)) -
                                      (user.failedRequests || getTotalErrorsFromDaily(user.dailyUsage)))}
                                </span>
                                <span className="text-red-400">
                                  ✗ {user.failedRequests || getTotalErrorsFromDaily(user.dailyUsage)}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex flex-col items-center space-y-1">
                              <span className={`font-semibold ${getStatusColor(successRate)}`}>
                                {successRate.toFixed(1)}%
                              </span>
                              <div className="w-16 bg-gray-700 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all duration-300 ${successRate >= 95 ? 'bg-green-500' :
                                    successRate >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}
                                  style={{ width: `${successRate}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-white font-mono">
                              {user.averageResponseTime?.toFixed(0) ||
                                user.proxyLatency?.api?.avg?.toFixed(0) || '-'}
                              <span className="text-gray-400 text-xs ml-1">ms</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <Button
                                size="xs"
                                color="blue"
                                onClick={() => openApiModal(user)}
                                disabled={!user.endpointCounts || Object.keys(user.endpointCounts).length === 0}
                                className="flex items-center px-3 py-1 rounded shadow hover:scale-105 transition-transform duration-150 bg-blue-600"
                                title={
                                  !user.endpointCounts || Object.keys(user.endpointCounts).length === 0
                                    ? "No APIs available"
                                    : "View all APIs"
                                }
                              >
                                <HiEye className="w-4 h-4 mr-1 text-white" />
                                <span className="font-semibold text-white">View</span>
                              </Button>
                              <span
                                className={`inline-block text-xs font-mono px-2 py-1 rounded ${user.endpointCounts && Object.keys(user.endpointCounts).length > 0
                                  ? "bg-blue-900 text-blue-300"
                                  : "bg-gray-800 text-gray-500"
                                  }`}
                                title="Total APIs"
                              >
                                {user.endpointCounts ? Object.keys(user.endpointCounts).length : 0} APIs
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="text-xs">
                              {user.lastUpdated ? (
                                <>
                                  <p className="text-white">
                                    {new Date(user.lastUpdated).toLocaleDateString()}
                                  </p>
                                  <p className="text-gray-400">
                                    {new Date(user.lastUpdated).toLocaleTimeString()}
                                  </p>
                                </>
                              ) : (
                                <span className="text-gray-500">Never</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
                showIcons
                className="flex"
                theme={{
                  pages: {
                    base: "xs:mt-0 mt-2 inline-flex items-center -space-x-px",
                    showIcon: "inline-flex",
                    previous: {
                      base: "ml-0 rounded-l-lg border border-gray-700 bg-[#23272F] py-2 px-3 leading-tight text-gray-300 hover:bg-gray-700 hover:text-white",
                    },
                    next: {
                      base: "rounded-r-lg border border-gray-700 bg-[#23272F] py-2 px-3 leading-tight text-gray-300 hover:bg-gray-700 hover:text-white",
                    },
                    selector: {
                      base: "border border-gray-700 bg-[#23272F] py-2 px-3 leading-tight text-gray-300 hover:bg-gray-700 hover:text-white",
                      active: "bg-blue-600 text-white border-blue-600",
                    },
                  },
                }}
              />
            </div>
          )}
        </>
      )}

      {/* API Details Modal */}
      <ApiUsageModal
        show={showApiModal}
        onClose={closeApiModal}
        selectedUserApis={selectedUserApis}
      />
    </div>
  );
};

export default AdminAnalytics;