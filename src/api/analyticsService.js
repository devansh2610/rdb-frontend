import axios from './axios';

// Helper function to get token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem("jwtToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Get comprehensive user metrics
 * Returns all available metrics for the authenticated user
 */
export const getUserMetrics = async () => {
  try {
    const response = await axios.get('/user/metrics/', {
      headers: {
        ...getAuthHeader(),
        "Content-Type": "application/json"
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user metrics:", error);
    throw error;
  }
};

/**
 * Get user metrics for a specific date range
 * @param {string} startDate - Start date in YYYY-MM-DD format (optional)
 * @param {string} endDate - End date in YYYY-MM-DD format (optional)
 */
export const getUserMetricsRange = async (startDate = null, endDate = null) => {
  try {
    // Build query parameters
    let queryParams = '';
    if (startDate) {
      queryParams += `start=${startDate}`;
    }
    if (endDate) {
      queryParams += queryParams ? `&end=${endDate}` : `end=${endDate}`;
    }

    const url = queryParams ? `/user/metrics/range?${queryParams}` : '/user/metrics/range';
    
    const response = await axios.get(url, {
      headers: {
        ...getAuthHeader(),
        "Content-Type": "application/json"
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user metrics range:", error);
    throw error;
  }
}; 