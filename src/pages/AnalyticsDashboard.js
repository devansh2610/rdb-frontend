import React, { useState, useEffect, useCallback } from 'react';
import { motion } from "framer-motion";
import { Spinner, Button } from "flowbite-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRocket,
  faChartLine,
  faClock,
  faDownload,
  faSync,
  faPalette,
  faLock,
  faCrown
} from "@fortawesome/free-solid-svg-icons";
import { format, parse, isValid, isSameDay, isWithinInterval } from 'date-fns';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Component imports
import Navigation from "../components/Navigation";
import UsageChart from "../components/AnalyticsDashboard/Charts/UsageChart";
import EndpointsChart from "../components/AnalyticsDashboard/Charts/EndpointsChart";
import ErrorsChart from "../components/AnalyticsDashboard/Charts/ErrorsChart";
import LatencyChart from "../components/AnalyticsDashboard/Charts/LatencyChart";
import PerformanceChart from "../components/AnalyticsDashboard/Charts/PerformanceChart";
import MetricCard from "../components/AnalyticsDashboard/Cards/MetricCard";
import CalendarIcon from "../components/AnalyticsDashboard/Utilities/CalendarIcon";
import AnalyticsInfoModal from "../modals/AnalyticsInfoModal";

// Utility imports
import { detectAnomalies } from "../components/AnalyticsDashboard/Utilities/helpers";
import THEMES from "../components/AnalyticsDashboard/Constants/themes";
import { useAuth } from "../context/AuthContext";

// API imports
import { getUserMetrics, getUserMetricsRange } from "../api/analyticsService";

// Styles
import '../styles/AnalyticsDashboard.css';

const MotionDiv = motion.div;

export default function AnalyticsDashboard() {
  // Get user profile from auth context
  const { getProfile, fetchProfile, PROFILE_UPDATE_EVENT } = useAuth();
  const [userProfile, setUserProfile] = useState(getProfile());

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('30d');
  const [data, setData] = useState(null);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date;
  });
  const [endDate, setEndDate] = useState(new Date());
  const [showComparison, setShowComparison] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('default');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEndpoints, setFilterEndpoints] = useState([]);
  const [visibleCharts, setVisibleCharts] = useState({
    usage: true,
    endpoints: true,
    errors: true,
    latency: true,
    performance: true
  });
  const [includeAnomalies, setIncludeAnomalies] = useState(true);
  const [showInfoModal, setShowInfoModal] = useState(true);

  const themeColors = THEMES[selectedTheme];

  // Listen for profile updates
  useEffect(() => {
    const handleProfileUpdate = (event) => {
      if (event.detail) {
        setUserProfile(event.detail);
      }
    };

    window.addEventListener(PROFILE_UPDATE_EVENT, handleProfileUpdate);

    // Initial fetch of profile
    fetchProfile().then(profile => {
      if (profile) {
        setUserProfile(profile);
      }
    });

    return () => {
      window.removeEventListener(PROFILE_UPDATE_EVENT, handleProfileUpdate);
    };
  }, [PROFILE_UPDATE_EVENT, fetchProfile]);

  // Enforce light theme
  useEffect(() => {
    // Store the current theme state
    const wasDark = document.documentElement.classList.contains('dark');

    // Force remove dark mode
    document.documentElement.classList.remove('dark');

    // Cleanup: Restore theme state when leaving the page
    return () => {
      if (wasDark) {
        document.documentElement.classList.add('dark');
      }
    };
  }, []);

  // Debug logging for profile
  useEffect(() => {
    console.log("AnalyticsDashboard current userProfile:", userProfile);
  }, [userProfile]);

  // Check if user is on a paid plan: 1 (dev) or 2 (enterprise) is considered paid
  // Handle potential string values from API
  const isPaidUser = useCallback(() => {
    if (!userProfile || userProfile.plan === undefined || userProfile.plan === null) return false;
    const plan = Number(userProfile.plan);
    return plan === 1 || plan === 2;
  }, [userProfile]);

  // Set date range based on subscription level
  useEffect(() => {
    const now = new Date();
    // Handle potential string "1"
    if (userProfile?.plan && Number(userProfile.plan) === 1) {
      // Developer: Show last 14 days including today
      setStartDate(new Date(now.getTime() - 13 * 86400000)); // 13 days ago + today = 14 days
    } else {
      // Enterprise or default: Show last 30 days including today
      setStartDate(new Date(now.getTime() - 29 * 86400000)); // 29 days ago + today = 30 days
    }
    setEndDate(now);
  }, [timeRange, userProfile]);

  const loadData = useCallback(async () => {
    // For trial users (who are NOT admins), load dummy data
    // Admins (accessLevel 0 or 1) should always see real data regardless of plan
    const isAdmin = userProfile?.accessLevel === 0 || userProfile?.accessLevel === 1;
    const isTrial = userProfile?.plan !== undefined && Number(userProfile.plan) === 0;

    if (isTrial && !isAdmin) {
      try {
        setLoading(true);
        // Create rich dummy data for trial users
        const dummyData = {
          usage: Array.from({ length: 30 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - 29 + i);
            const formattedDate = format(date, 'yyyy-MM-dd');
            const isToday = format(new Date(), 'yyyy-MM-dd') === formattedDate;

            // Generate some realistic-looking data
            const requests = Math.floor(Math.random() * 200) + 100;
            const errors = Math.floor(requests * (Math.random() * 0.05));
            const latency = Math.floor(Math.random() * 100) + 50;

            return {
              date: formattedDate,
              requests,
              errors,
              latency,
              isLive: isToday
            };
          }),
          endpoints: Array.from({ length: 6 }, (_, i) => ({
            endpoint: [`recipe2-api`, `api`, `flavorDB`, `flavordb2`, `user-api`, `search-api`][i],
            count: Math.floor(Math.random() * 500) + 100,
            avgLatency: Math.floor(Math.random() * 100) + 20,
            trend: Math.random() > 0.5 ? Math.random() * 10 : -Math.random() * 10
          })),
          errors: [
            { code: '200', count: Math.floor(Math.random() * 500) + 1000, description: 'OK' },
            { code: '304', count: Math.floor(Math.random() * 100) + 50, description: 'Not Modified' },
            { code: '404', count: Math.floor(Math.random() * 100) + 20, description: 'Not Found' },
            { code: '502', count: Math.floor(Math.random() * 50) + 10, description: 'Bad Gateway' },
            { code: '503', count: Math.floor(Math.random() * 20) + 5, description: 'Service Unavailable' }
          ],
          latency: Array.from({ length: 6 }, (_, i) => ({
            endpoint: [`recipe2-api`, `api`, `flavorDB`, `flavordb2`, `user-api`, `search-api`][i],
            minLatency: Math.floor(Math.random() * 20),
            maxLatency: Math.floor(Math.random() * 200) + 300,
            avgLatency: Math.floor(Math.random() * 100) + 100,
            count: Math.floor(Math.random() * 500) + 100,
            totalLatency: Math.floor(Math.random() * 10000) + 10000
          })),
          performanceMetrics: [
            { metric: 'Response Time', value: Math.floor(Math.random() * 200) + 100, maxValue: 1000 },
            { metric: 'Success Rate', value: Math.floor(Math.random() * 10) + 90, maxValue: 100 },
            { metric: 'Error Rate', value: Math.floor(Math.random() * 5) + 1, maxValue: 100 },
            { metric: 'Resource Usage', value: Math.floor(Math.random() * 20) + 40, maxValue: 100 },
            { metric: 'API Efficiency', value: Math.floor(Math.random() * 10) + 85, maxValue: 100 }
          ],
          metrics: {
            totalRequests: 5432,
            successfulRequests: 5215,
            failedRequests: 217,
            averageResponseTime: 78.25
          }
        };

        setData(dummyData);
        setLoading(false);
      } catch (error) {
        console.error('Error loading dummy data:', error);
        setLoading(false);
      }
      return;
    }

    // Normal data loading for paid users
    try {
      setLoading(true);

      let apiData;
      if (timeRange === 'custom') {
        const formattedStartDate = format(startDate, 'yyyy-MM-dd');
        const formattedEndDate = format(endDate, 'yyyy-MM-dd');
        const rangeData = await getUserMetricsRange(formattedStartDate, formattedEndDate);
        apiData = processRangeData(rangeData);
      } else {
        const metricsData = await getUserMetrics();
        apiData = processMetricsData(metricsData);
      }

      setData(apiData);
    } catch (error) {
      console.error('Error loading analytics:', error);
      // Fallback to generated data if API fails
      console.log('Using fallback mock data');
      // Import the generateAnalyticsData dynamically to avoid import errors
      import("../components/AnalyticsDashboard/Utilities/helpers").then(module => {
        const { generateAnalyticsData } = module;
        const mockData = generateAnalyticsData(startDate, endDate, includeAnomalies);
        setData(mockData);
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [startDate, endDate, includeAnomalies, timeRange, userProfile]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refreshData = async () => {
    await fetchProfile();
    setRefreshing(true);
    await loadData();
  };

  const handleSubscribe = () => {
    window.location.href = "/pricing";
  };

  const handleExportData = () => {
    if (!data) return;

    // Convert data to CSV
    const csvContent = [
      'date,requests,errors,latency',
      ...data.usage.map(day => `${day.date},${day.requests},${day.errors},${day.latency}`)
    ].join('\n');

    // Create a download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `api-analytics-${startDate.toISOString().split('T')[0]}-to-${endDate.toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCustomDate = (input) => {
    try {
      const parsed = parse(input, 'dd/MM/yy', new Date());
      return isValid(parsed) ? parsed : new Date();
    } catch {
      return new Date();
    }
  };

  // Calculate metrics
  const totalRequests = data?.metrics?.totalRequests || 0;
  const successfulRequests = data?.metrics?.successfulRequests || 0;
  const successRate = totalRequests > 0 ? ((successfulRequests / totalRequests) * 100).toFixed(2) : 0;
  const errorRate = totalRequests > 0 ? (100 - successRate).toFixed(2) : 0;
  const avgLatency = data?.metrics?.averageResponseTime ? parseFloat(data.metrics.averageResponseTime.toFixed(2)) : 0;

  // Calculate previous period metrics for comparison
  const prevTotalRequests = data?.prevPeriodUsage?.reduce((sum, day) => sum + day.requests, 0) || 0;
  const requestsChange = totalRequests && prevTotalRequests
    ? ((totalRequests - prevTotalRequests) / prevTotalRequests * 100).toFixed(2)
    : 0;

  // Filter endpoints based on search term
  const filteredEndpoints = data?.endpoints
    ? data.endpoints.filter(ep =>
      searchTerm ? ep.endpoint.toLowerCase().includes(searchTerm.toLowerCase()) : true)
    : [];

  // Filter Latencies based on search term
  const filteredLatencies = data?.latency
    ? data.latency.filter(c =>
      searchTerm ? c.endpoint.toLowerCase().includes(searchTerm.toLowerCase()) : true)
    : [];

  const toggleChart = (chartName) => {
    setVisibleCharts(prev => ({
      ...prev,
      [chartName]: !prev[chartName]
    }));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  // Process comprehensive metrics data into the format expected by charts
  const processMetricsData = (apiData) => {
    if (!apiData || !apiData.metrics) {
      return null;
    }

    const { metrics } = apiData;

    // Process daily usage data - ensure continuous date range based on subscription
    let usageData = [];

    // Generate array of all dates in the date range
    const endDate = new Date();
    const startDate = new Date();
    // Set range based on subscription level
    // Handle potential string "1"
    if (userProfile?.plan && Number(userProfile.plan) === 1) {
      startDate.setDate(startDate.getDate() - 13); // Last 14 days including today
    } else {
      startDate.setDate(startDate.getDate() - 29); // Last 30 days including today
    }

    // Create array of all dates in the range
    const allDates = [];
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      allDates.push(format(currentDate, 'yyyy-MM-dd'));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Create usage data with all days, using 0 for missing dates
    usageData = allDates.map(date => {
      const formattedDate = date;
      const isToday = format(new Date(), 'yyyy-MM-dd') === formattedDate;
      // Use the dailyUsage data directly from the API, which now includes requests and errors
      const dailyData = metrics.dailyUsage[formattedDate] || { requests: 0, errors: 0 };

      return {
        date: formattedDate,
        requests: dailyData.requests || 0,
        // Use errors directly from the API response instead of calculating
        errors: dailyData.errors || 0,
        latency: calculateLatencyForDay(formattedDate, metrics) || 0,
        isLive: isToday // Mark today's date for live radiating circle
      };
    });

    // Apply anomaly detection if enabled
    const processedUsage = includeAnomalies ? detectAnomalies(usageData) : usageData;

    // Ensure we have all proxy endpoints with their data
    const endpointsData = [];
    // Get all proxy endpoints from proxyLatency
    const allEndpoints = new Set([
      ...Object.keys(metrics.proxyLatency || {})
    ]);

    // Create endpoint data for each endpoint
    allEndpoints.forEach(endpoint => {
      // Get latency data for this endpoint
      const latencyData = metrics.proxyLatency?.[endpoint] || {};

      endpointsData.push({
        endpoint,
        count: latencyData.count || 0,
        avgLatency: latencyData.avg || 0,
        trend: 0 // API doesn't provide trend data
      });
    });

    // Define error code descriptions
    const errorDescriptions = {
      '200': 'OK',
      '304': 'Not Modified',
      '400': 'Bad Request',
      '401': 'Unauthorized',
      '403': 'Forbidden',
      '404': 'Not Found',
      '408': 'Request Timeout',
      '429': 'Too Many Requests',
      '500': 'Internal Server Error',
      '502': 'Bad Gateway',
      '503': 'Service Unavailable',
      '504': 'Gateway Timeout'
    };

    // Transform status codes for errors chart - include all status codes, not just errors
    const errorsData = [];
    Object.entries(metrics.statusCodes || {}).forEach(([code, count]) => {
      errorsData.push({
        code,
        count,
        description: errorDescriptions[code] || (
          code.startsWith('2') ? 'Success' :
            code.startsWith('3') ? 'Redirection' :
              code.startsWith('4') ? 'Client Error' :
                'Server Error'
        )
      });
    });

    // Transform proxy latency for latency chart - ensure all endpoints are included
    const latencyData = [];
    allEndpoints.forEach(endpoint => {
      const data = metrics.proxyLatency?.[endpoint];
      if (data) {
        latencyData.push({
          endpoint,
          minLatency: data.min || 0,
          maxLatency: data.max || 0,
          avgLatency: data.avg || 0,
          count: data.count || 0,
          totalLatency: data.total || 0
        });
      }
    });

    // Create performance metrics for spider chart
    const performanceMetrics = [
      { metric: 'Response Time', value: metrics.averageResponseTime || 0, maxValue: 1000 },
      { metric: 'Success Rate', value: calculateSuccessRate(metrics), maxValue: 100 },
      { metric: 'Error Rate', value: calculateErrorRate(metrics), maxValue: 100 },
      { metric: 'Resource Usage', value: calculateResourceUtilization(metrics), maxValue: 100 },
      { metric: 'API Efficiency', value: calculateApiEfficiency(metrics), maxValue: 100 }
    ];

    return {
      usage: processedUsage,
      endpoints: endpointsData,
      errors: errorsData,
      latency: latencyData,
      performanceMetrics,
      metrics: metrics
    };
  };

  // Process range data into the expected format
  const processRangeData = (rangeData) => {
    if (!rangeData || !rangeData.data) {
      return null;
    }

    // Transform the range data
    let usageData = [];

    if (rangeData.data.length > 0) {
      // Get the full date range
      const dates = rangeData.data.map(day => day.date).sort();
      const startDate = new Date(dates[0]);
      const endDate = new Date(dates[dates.length - 1]);

      // Generate array of all dates in range
      const allDates = [];
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        allDates.push(format(currentDate, 'yyyy-MM-dd'));
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Create a map for easy lookup
      const dataMap = {};
      rangeData.data.forEach(item => {
        dataMap[item.date] = {
          requests: item.requests || 0,
          errors: item.errors || 0
        };
      });

      // Create usage data with all dates, using 0 for missing dates
      usageData = allDates.map(date => {
        const dayData = dataMap[date] || { requests: 0, errors: 0 };
        return {
          date,
          requests: dayData.requests,
          errors: dayData.errors,
          latency: 0  // Range API doesn't provide latency
        };
      });
    } else {
      usageData = rangeData.data.map(day => ({
        date: day.date,
        requests: day.requests || 0,
        errors: day.errors || 0,
        latency: 0
      }));
    }

    // Apply anomaly detection if enabled
    const processedUsage = includeAnomalies ? detectAnomalies(usageData) : usageData;

    // Return limited data since range endpoint only provides usage data
    return {
      usage: processedUsage,
      endpoints: [],
      errors: [],
      latency: [],
      performanceMetrics: []
    };
  };

  // Helper to calculate errors for a specific day
  const calculateErrorsForDay = (date, metrics) => {
    // Directly use the errors count from the dailyUsage object if available
    if (metrics.dailyUsage && metrics.dailyUsage[date]) {
      return metrics.dailyUsage[date].errors || 0;
    }

    // Fallback to 0 if no data is available for this date
    return 0;
  };

  // Helper to calculate latency for a specific day
  const calculateLatencyForDay = (date, metrics) => {
    // Simplified - in a real app, you'd need date-specific latency data
    const value = metrics.averageResponseTime || 0;
    return parseFloat(value.toFixed(2));
  };

  // Helper to get slowest response time for an endpoint
  const getSlowestResponseTime = (endpoint, metrics) => {
    const slowest = metrics.slowestResponses || {};
    // Look for the endpoint in slowest responses
    for (const [key, value] of Object.entries(slowest)) {
      if (key.includes(endpoint)) {
        return parseFloat(value.toFixed(2));
      }
    }
    const value = metrics.averageResponseTime || 0;
    return parseFloat(value.toFixed(2));
  };

  // Helper to calculate success rate
  const calculateSuccessRate = (metrics) => {
    const total = metrics.totalRequests || 1;
    const successful = metrics.successfulRequests || 0;
    return parseFloat(((successful / total) * 100).toFixed(2));
  };

  // Helper to calculate error rate
  const calculateErrorRate = (metrics) => {
    const total = metrics.totalRequests || 1;
    const failed = metrics.failedRequests || 0;
    return parseFloat(((failed / total) * 100).toFixed(2));
  };

  // Helper function to calculate Resource Utilization metric
  const calculateResourceUtilization = (metrics) => {
    // Resource utilization is a performance metric that indicates how efficiently the system
    // uses available resources. In a real system, this would come from server metrics.
    // Since we don't have direct resource metrics, we'll estimate it based on:
    // - Response time (faster responses generally indicate lower resource utilization)
    // - Request volume (higher volume typically means higher resource utilization)
    // - Number of different API endpoints being used (more endpoints = more distributed load)

    const avgResponseTime = metrics.averageResponseTime || 0;
    const totalRequests = metrics.totalRequests || 1;
    const endpointCount = Object.keys(metrics.endpointCounts || {}).length || 1;
    const proxyCount = Object.keys(metrics.proxyRequests || {}).length || 1;

    // Normalize response time: 0ms -> 0%, 1000ms -> 100%
    const responseTimeImpact = Math.min(avgResponseTime / 10, 100);

    // Base utilization starts at 10% (system overhead)
    let utilization = 10;

    // Add impact from request volume (up to 50% additional utilization)
    // We use log scale to avoid excessive impact from high request volumes
    utilization += Math.min(Math.log(totalRequests) * 5, 50);

    // Add impact from response time (up to 30% additional utilization)
    utilization += responseTimeImpact * 0.3;

    // Adjust based on endpoint distribution - more endpoints = better distribution
    // This can reduce utilization by up to 15%
    const distributionFactor = Math.min((proxyCount / 2) * 0.15, 15);
    utilization -= distributionFactor;

    // Cap at 0-100 range
    return Math.min(Math.max(Math.round(utilization), 0), 100);
  };

  // Helper to calculate API efficiency
  const calculateApiEfficiency = (metrics) => {
    // Calculate efficiency based on response time and success rate
    // Lower response time and higher success rate = better efficiency
    const avgResponseTime = metrics.averageResponseTime || 0;
    const successRate = calculateSuccessRate(metrics);

    // Simple calculation: normalize response time to a 0-100 scale (lower is better)
    // 1000ms or more is considered 0% efficient, 0ms would be 100%
    const responseTimeScore = Math.max(0, 100 - (avgResponseTime / 10));

    // Weight: 40% response time, 60% success rate
    return parseFloat(((responseTimeScore * 0.4) + (successRate * 0.6)).toFixed(2));
  };

  return (
    <div className={`analytics-dashboard flex flex-col w-full h-full min-h-screen dark:bg-gray-900 bg-[conic-gradient(at_top,_var(--tw-gradient-stops))] ${themeColors.background} dark:${themeColors.darkBackground}`}>
      <Navigation stay={true} />
      <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm pl-0 xl:pl-8 xl:pr-8 mx-4 lg:mx-20 my-24 lg:my-32 rounded-xl shadow-lg">
        <div className="container px-4 lg:px-6 py-8 lg:py-12 mx-auto relative">
          {/* Upgrade Overlay for Trial Users - same design as unauthenticated */}
          {userProfile && userProfile.plan !== undefined && Number(userProfile.plan) === 0 && (
            <div className="absolute inset-0 z-50 flex items-center justify-center px-4">
              <MotionDiv
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.6,
                  ease: [0.22, 1, 0.36, 1],
                  delay: 0.3
                }}
                className="z-10 text-center w-full max-w-md"
              >
                {/* Glass morphism card - same as unauthenticated */}
                <div className="bg-gradient-to-br from-white/95 to-white/90 dark:from-gray-900/95 dark:to-gray-800/90 backdrop-blur-xl p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20 dark:border-gray-700/30 overflow-hidden relative">
                  {/* Decorative elements */}
                  <div className="absolute top-0 -left-24 w-64 h-64 bg-gradient-to-br from-blue-200 to-blue-300 dark:from-blue-900 dark:to-blue-800 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-2xl opacity-70 animate-blob"></div>
                  <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-gradient-to-br from-amber-200 to-yellow-300 dark:from-amber-900 dark:to-yellow-800 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-2xl opacity-70 animate-blob animation-delay-2000"></div>
                  <div className="absolute -top-6 right-6 w-56 h-56 bg-gradient-to-br from-purple-200 to-indigo-300 dark:from-purple-900 dark:to-indigo-800 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-2xl opacity-70 animate-blob animation-delay-4000"></div>

                  {/* Content */}
                  <div className="relative">
                    {/* Premium badge */}
                    <div className="absolute -top-2 -right-2">
                      <div className="bg-gradient-to-r from-amber-500 to-yellow-500 text-xs text-white font-semibold px-2.5 py-0.5 rounded-full shadow-lg flex items-center gap-1">
                        <FontAwesomeIcon icon={faCrown} className="text-yellow-100" />
                        <span>PREMIUM</span>
                      </div>
                    </div>

                    {/* Lock icon with shine effect */}
                    <div className="mx-auto relative mb-6 w-24 h-24">
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-300 to-yellow-500 dark:from-amber-400 dark:to-yellow-600 rounded-full shadow-[0_0_30px_rgba(251,191,36,0.4)] dark:shadow-[0_0_20px_rgba(251,191,36,0.3)]"></div>
                      <div className="absolute inset-2 bg-gradient-to-br from-yellow-200 to-amber-500 dark:from-yellow-300 dark:to-amber-600 rounded-full overflow-hidden">
                        <div className="absolute -inset-[60%] top-0 left-0 bg-white/40 dark:bg-white/30 blur-md transform -rotate-45"></div>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <FontAwesomeIcon icon={faLock} className="text-white text-3xl drop-shadow-md" />
                      </div>
                    </div>

                    <h2 className="text-3xl font-extrabold text-gray-800 dark:text-white mb-3 tracking-tight">
                      Analytics Dashboard
                    </h2>
                    <div className="w-16 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mx-auto mb-5"></div>
                    <p className="text-gray-600 dark:text-gray-300 mb-7 text-lg leading-relaxed">
                      Unlock powerful insights into your API performance and usage patterns with our advanced analytics dashboard.
                    </p>

                    {/* Features list */}
                    <div className="flex flex-col gap-3 mb-8 text-left">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span>Real-time metrics & performance insights</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span>Detailed endpoint & status code analysis</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span>Anomaly detection & usage trends</span>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <button
                      onClick={handleSubscribe}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium px-8 py-3.5 rounded-xl w-full transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg flex items-center justify-center group"
                    >
                      <span className="mr-2">Upgrade to Pro</span>
                      <svg className="w-5 h-5 transform transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button>
                  </div>
                </div>
              </MotionDiv>
            </div>
          )}

          <MotionDiv
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className={userProfile?.plan !== undefined && Number(userProfile.plan) === 0 ? "filter blur-[6px] pointer-events-none opacity-90" : ""}
          >
            {/* Header Section - Only show for authenticated users */}
            {userProfile && (
              <MotionDiv variants={itemVariants} className="mb-8">
                <div className="w-full">
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    API Analytics Dashboard
                  </h1>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Insights into your API usage and performance metrics
                  </p>
                </div>
              </MotionDiv>
            )}

            {/* Controls Section - Only show for authenticated users */}
            {userProfile && (
              <MotionDiv variants={itemVariants} className="mb-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Action Buttons */}
                  <div className="flex items-center gap-3">
                    <Button
                      color="light"
                      size="sm"
                      className="bg-white dark:bg-gray-800 shadow-sm"
                      onClick={refreshData}
                      disabled={refreshing}
                    >
                      <FontAwesomeIcon icon={faSync} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>

                    <Button
                      color="light"
                      size="sm"
                      className="bg-white dark:bg-gray-800 shadow-sm"
                      onClick={handleExportData}
                    >
                      <FontAwesomeIcon icon={faDownload} className="mr-2" />
                      Export
                    </Button>

                    <select
                      value={selectedTheme}
                      onChange={(e) => setSelectedTheme(e.target.value)}
                      className="h-10 px-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 shadow-sm"
                    >
                      <option value="default">Default Theme</option>
                      <option value="ocean">Ocean Theme</option>
                      <option value="sunset">Sunset Theme</option>
                      <option value="forest">Forest Theme</option>
                    </select>
                  </div>

                  {/* Time Controls - Both time range selector and date picker */}
                  <div className="flex flex-col lg:flex-row justify-end items-end gap-4">
                    {/* Date Range Picker - Only when custom is selected */}
                    {timeRange === 'custom' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full lg:w-auto">
                        <div className="flex items-center gap-2 w-full relative group">
                          <div className="absolute left-3 z-30">
                            <CalendarIcon />
                          </div>
                          <DatePicker
                            selected={startDate}
                            onChange={(date) => {
                              const validDate = isValid(date) ? date : new Date();
                              setStartDate(validDate);
                              if (validDate > endDate) setEndDate(validDate);
                            }}
                            onChangeRaw={(e) => {
                              const parsed = parseCustomDate(e.target.value);
                              setStartDate(parsed);
                              if (parsed > endDate) setEndDate(parsed);
                            }}
                            dateFormat="dd/MM/yyyy"
                            selectsStart
                            startDate={startDate}
                            endDate={endDate}
                            maxDate={endDate}
                            className="w-full h-10 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm rounded-lg pl-10 pr-3 focus:ring-2 focus:ring-blue-300/50 dark:focus:ring-blue-600/30 border border-gray-200/80 dark:border-gray-700 transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-600 shadow-sm hover:shadow-md"
                            popperPlacement="bottom-start"
                            popperClassName="react-datepicker-popper animate-pop-in"
                            calendarClassName="shadow-2xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white dark:bg-gray-800 backdrop-blur-lg"
                            dayClassName={(date) => {
                              // Exact match check (same day, month, and year)
                              const isExactlySelected = isSameDay(date, startDate);

                              // Check if date is in the currently displayed month on the calendar
                              const isDisplayedMonth = date.getMonth() === date.getMonth();

                              // Precise in-range check (must be exact same day, month, and year)
                              const isInRange = (
                                isWithinInterval(date, { start: startDate, end: endDate }) &&
                                (
                                  // Either exactly matches start date (same day, month, year)
                                  (date.getDate() === startDate.getDate() &&
                                    date.getMonth() === startDate.getMonth() &&
                                    date.getFullYear() === startDate.getFullYear()) ||
                                  // Or exactly matches end date (same day, month, year)
                                  (date.getDate() === endDate.getDate() &&
                                    date.getMonth() === endDate.getMonth() &&
                                    date.getFullYear() === endDate.getFullYear()) ||
                                  // Or is a day between start and end date in exact same month
                                  (date.getMonth() === startDate.getMonth() &&
                                    date.getFullYear() === startDate.getFullYear() &&
                                    date > startDate && date < endDate) ||
                                  (date.getMonth() === endDate.getMonth() &&
                                    date.getFullYear() === endDate.getFullYear() &&
                                    date > startDate && date < endDate)
                                )
                              );

                              if (isExactlySelected) {
                                return "bg-blue-500 text-white hover:bg-blue-600 rounded-md";
                              } else if (isInRange) {
                                return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-md";
                              } else if (!isDisplayedMonth) {
                                return "text-gray-400 dark:text-gray-600";
                              }
                              return "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md";
                            }}
                            placeholderText="Start Date"
                            // Custom styles for calendar elements
                            calendarContainer={({ className, children }) => (
                              <div className={`${className} dark:text-white`}>{children}</div>
                            )}
                            weekDayClassName={() => "text-gray-500 dark:text-gray-400 font-medium"}
                            monthClassName={() => "font-bold text-gray-800 dark:text-white"}
                            renderCustomHeader={({
                              date,
                              changeYear,
                              changeMonth,
                              decreaseMonth,
                              increaseMonth,
                              prevMonthButtonDisabled,
                              nextMonthButtonDisabled
                            }) => (
                              <div className="flex items-center justify-between px-2 py-2">
                                <button
                                  onClick={decreaseMonth}
                                  disabled={prevMonthButtonDisabled}
                                  className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
                                  type="button"
                                >
                                  <span className="sr-only">Previous Month</span>
                                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                  </svg>
                                </button>
                                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                  {format(date, "MMMM yyyy")}
                                </div>
                                <button
                                  onClick={increaseMonth}
                                  disabled={nextMonthButtonDisabled}
                                  className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
                                  type="button"
                                >
                                  <span className="sr-only">Next Month</span>
                                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </button>
                              </div>
                            )}
                          />
                        </div>

                        <div className="flex items-center gap-2 w-full relative group">
                          <div className="absolute left-3 z-30">
                            <CalendarIcon />
                          </div>
                          <DatePicker
                            selected={endDate}
                            onChange={(date) => {
                              const validDate = isValid(date) ? date : new Date();
                              setEndDate(validDate);
                              if (validDate < startDate) setStartDate(validDate);
                            }}
                            onChangeRaw={(e) => {
                              const parsed = parseCustomDate(e.target.value);
                              setEndDate(parsed);
                              if (parsed < startDate) setStartDate(parsed);
                            }}
                            dateFormat="dd/MM/yyyy"
                            selectsEnd
                            startDate={startDate}
                            endDate={endDate}
                            minDate={startDate}
                            maxDate={new Date()}
                            className="w-full h-10 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm rounded-lg pl-10 pr-3 focus:ring-2 focus:ring-blue-300/50 dark:focus:ring-blue-600/30 border border-gray-200/80 dark:border-gray-700 transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-600 shadow-sm hover:shadow-md"
                            popperPlacement="bottom-start"
                            popperClassName="react-datepicker-popper animate-pop-in"
                            calendarClassName="shadow-2xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white dark:bg-gray-800 backdrop-blur-lg"
                            dayClassName={(date) => {
                              // Exact match check (same day, month, and year)
                              const isExactlySelected = isSameDay(date, endDate);

                              // Check if date is in the currently displayed month on the calendar
                              const isDisplayedMonth = date.getMonth() === date.getMonth();

                              // Precise in-range check (must be exact same day, month, and year)
                              const isInRange = (
                                isWithinInterval(date, { start: startDate, end: endDate }) &&
                                (
                                  // Either exactly matches start date (same day, month, year)
                                  (date.getDate() === startDate.getDate() &&
                                    date.getMonth() === startDate.getMonth() &&
                                    date.getFullYear() === startDate.getFullYear()) ||
                                  // Or exactly matches end date (same day, month, year)
                                  (date.getDate() === endDate.getDate() &&
                                    date.getMonth() === endDate.getMonth() &&
                                    date.getFullYear() === endDate.getFullYear()) ||
                                  // Or is a day between start and end date in exact same month
                                  (date.getMonth() === startDate.getMonth() &&
                                    date.getFullYear() === startDate.getFullYear() &&
                                    date > startDate && date < endDate) ||
                                  (date.getMonth() === endDate.getMonth() &&
                                    date.getFullYear() === endDate.getFullYear() &&
                                    date > startDate && date < endDate)
                                )
                              );

                              // Future date check (disable future dates)
                              const isFuture = date > new Date();

                              if (isExactlySelected) {
                                return "bg-blue-500 text-white hover:bg-blue-600 rounded-md";
                              } else if (isInRange) {
                                return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-md";
                              } else if (isFuture) {
                                return "text-gray-300 dark:text-gray-600 cursor-not-allowed";
                              } else if (!isDisplayedMonth) {
                                return "text-gray-400 dark:text-gray-600";
                              }
                              return "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md";
                            }}
                            placeholderText="End Date"
                            // Custom styles for calendar elements
                            calendarContainer={({ className, children }) => (
                              <div className={`${className} dark:text-white`}>{children}</div>
                            )}
                            weekDayClassName={() => "text-gray-500 dark:text-gray-400 font-medium"}
                            monthClassName={() => "font-bold text-gray-800 dark:text-white"}
                            renderCustomHeader={({
                              date,
                              changeYear,
                              changeMonth,
                              decreaseMonth,
                              increaseMonth,
                              prevMonthButtonDisabled,
                              nextMonthButtonDisabled
                            }) => (
                              <div className="flex items-center justify-between px-2 py-2">
                                <button
                                  onClick={decreaseMonth}
                                  disabled={prevMonthButtonDisabled}
                                  className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
                                  type="button"
                                >
                                  <span className="sr-only">Previous Month</span>
                                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                  </svg>
                                </button>
                                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                  {format(date, "MMMM yyyy")}
                                </div>
                                <button
                                  onClick={increaseMonth}
                                  disabled={nextMonthButtonDisabled}
                                  className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
                                  type="button"
                                >
                                  <span className="sr-only">Next Month</span>
                                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </button>
                              </div>
                            )}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </MotionDiv>
            )}

            {/* Chart Toggle Options - Only show for paid users */}
            {(userProfile?.plan === 1 || userProfile?.plan === 2) && (
              <MotionDiv variants={itemVariants} className="mb-6">
                <div className="flex flex-wrap gap-3">
                  <div className="inline-flex rounded-lg shadow-sm" role="group">
                    {Object.entries(visibleCharts).map(([chart, isVisible]) => (
                      <Button
                        key={chart}
                        color={isVisible ? "light" : "gray"}
                        size="xs"
                        onClick={() => toggleChart(chart)}
                        className={`
                      ${isVisible
                            ? "bg-blue-50 text-blue-600 border border-blue-200 font-medium dark:bg-gray-700 dark:text-white dark:border-gray-600"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"}
                    `}
                      >
                        {chart.charAt(0).toUpperCase() + chart.slice(1)}
                      </Button>
                    ))}
                  </div>

                  <Button
                    color="light"
                    size="xs"
                    onClick={() => setShowComparison(!showComparison)}
                    className={showComparison ? "bg-white dark:bg-gray-700" : ""}
                  >
                    {showComparison ? "Hide Comparison" : "Show Comparison"}
                  </Button>

                  <Button
                    color="light"
                    size="xs"
                    onClick={() => setIncludeAnomalies(!includeAnomalies)}
                    className={includeAnomalies ? "bg-white dark:bg-gray-700" : ""}
                  >
                    {includeAnomalies ? "Normal View" : "Highlight Anomalies"}
                  </Button>
                </div>
              </MotionDiv>
            )}

            {/* Trial User Subscription Prompt - Show for unauthenticated users */}
            {!userProfile ? (
              <MotionDiv
                variants={itemVariants}
                className="relative rounded-xl overflow-hidden"
              >
                {/* Show actual analytics UI but with blur effect */}
                <div className="filter blur-[6px] pointer-events-none opacity-90">
                  {/* Using the ACTUAL analytics dashboard components but with dummy data */}
                  <MotionDiv variants={containerVariants} className="space-y-8">
                    <MotionDiv
                      variants={itemVariants}
                      className="grid grid-cols-1 md:grid-cols-3 gap-6"
                      key="metrics"
                    >
                      <MetricCard
                        icon={faRocket}
                        title="Total Requests"
                        value={data?.metrics?.totalRequests?.toLocaleString() || "0"}
                        trend={5.2}
                        color={themeColors.primary}
                      />
                      <MetricCard
                        icon={faChartLine}
                        title="Success Rate"
                        value={`${data?.metrics?.totalRequests ? ((data.metrics.successfulRequests / data.metrics.totalRequests) * 100).toFixed(2) : "0"}%`}
                        trend={2.1}
                        color={themeColors.secondary}
                      />
                      <MetricCard
                        icon={faClock}
                        title="Avg. Latency"
                        value={`${data?.metrics?.averageResponseTime?.toFixed(2) || "0"}ms`}
                        trend={-5.7}
                        color={themeColors.warning}
                      />
                    </MotionDiv>

                    {/* Use the real UsageChart component with dummy data */}
                    {visibleCharts.usage && (
                      <MotionDiv
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        key="usage-chart"
                      >
                        <UsageChart
                          data={data}
                          timeRange={timeRange}
                          themeColors={themeColors}
                          showComparison={false}
                          includeAnomalies={includeAnomalies}
                        />
                      </MotionDiv>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Real EndpointsChart component */}
                      {visibleCharts.endpoints && (
                        <MotionDiv
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          key="endpoints-chart"
                        >
                          <EndpointsChart
                            data={data?.endpoints || []}
                            themeColors={themeColors}
                          />
                        </MotionDiv>
                      )}

                      {/* Real ErrorsChart component */}
                      {visibleCharts.errors && (
                        <MotionDiv
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          key="errors-chart"
                        >
                          <ErrorsChart
                            data={data?.errors || []}
                            themeColors={themeColors}
                          />
                        </MotionDiv>
                      )}

                      {/* Real LatencyChart component */}
                      {visibleCharts.latency && (
                        <MotionDiv
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          key="latency-chart"
                        >
                          <LatencyChart
                            data={data?.latency || []}
                            themeColors={themeColors}
                          />
                        </MotionDiv>
                      )}

                      {/* Real PerformanceChart component */}
                      {visibleCharts.performance && (
                        <MotionDiv
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          key="performance-chart"
                        >
                          <PerformanceChart
                            data={data?.performanceMetrics || []}
                            themeColors={themeColors}
                          />
                        </MotionDiv>
                      )}
                    </div>
                  </MotionDiv>
                </div>

                {/* Premium content message - enhanced beautiful version */}
                <div className="absolute inset-0 flex items-center justify-center px-4">
                  <MotionDiv
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      duration: 0.6,
                      ease: [0.22, 1, 0.36, 1],
                      delay: 0.3
                    }}
                    className="z-10 text-center w-full max-w-md"
                  >
                    {/* Glass morphism card */}
                    <div className="bg-gradient-to-br from-white/95 to-white/90 dark:from-gray-900/95 dark:to-gray-800/90 backdrop-blur-xl p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20 dark:border-gray-700/30 overflow-hidden relative">
                      {/* Decorative elements */}
                      <div className="absolute top-0 -left-24 w-64 h-64 bg-gradient-to-br from-blue-200 to-blue-300 dark:from-blue-900 dark:to-blue-800 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-2xl opacity-70 animate-blob"></div>
                      <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-gradient-to-br from-amber-200 to-yellow-300 dark:from-amber-900 dark:to-yellow-800 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-2xl opacity-70 animate-blob animation-delay-2000"></div>
                      <div className="absolute -top-6 right-6 w-56 h-56 bg-gradient-to-br from-purple-200 to-indigo-300 dark:from-purple-900 dark:to-indigo-800 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-2xl opacity-70 animate-blob animation-delay-4000"></div>

                      {/* Content */}
                      <div className="relative">
                        {/* Premium badge */}
                        <div className="absolute -top-2 -right-2">
                          <div className="bg-gradient-to-r from-amber-500 to-yellow-500 text-xs text-white font-semibold px-2.5 py-0.5 rounded-full shadow-lg flex items-center gap-1">
                            <FontAwesomeIcon icon={faCrown} className="text-yellow-100" />
                            <span>PREMIUM</span>
                          </div>
                        </div>

                        {/* Lock icon with shine effect */}
                        <div className="mx-auto relative mb-6 w-24 h-24">
                          <div className="absolute inset-0 bg-gradient-to-br from-amber-300 to-yellow-500 dark:from-amber-400 dark:to-yellow-600 rounded-full shadow-[0_0_30px_rgba(251,191,36,0.4)] dark:shadow-[0_0_20px_rgba(251,191,36,0.3)]"></div>
                          <div className="absolute inset-2 bg-gradient-to-br from-yellow-200 to-amber-500 dark:from-yellow-300 dark:to-amber-600 rounded-full overflow-hidden">
                            <div className="absolute -inset-[60%] top-0 left-0 bg-white/40 dark:bg-white/30 blur-md transform -rotate-45"></div>
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <FontAwesomeIcon icon={faLock} className="text-white text-3xl drop-shadow-md" />
                          </div>
                        </div>

                        <h2 className="text-3xl font-extrabold text-gray-800 dark:text-white mb-3 tracking-tight">
                          Analytics Dashboard
                        </h2>
                        <div className="w-16 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mx-auto mb-5"></div>
                        <p className="text-gray-600 dark:text-gray-300 mb-7 text-lg leading-relaxed">
                          Unlock powerful insights into your API performance and usage patterns with our advanced analytics dashboard.
                        </p>

                        {/* Features list */}
                        <div className="flex flex-col gap-3 mb-8 text-left">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                            <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <span>Real-time metrics & performance insights</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                            <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <span>Detailed endpoint & status code analysis</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                            <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <span>Anomaly detection & usage trends</span>
                          </div>
                        </div>

                        {/* CTA Button */}
                        <button
                          onClick={handleSubscribe}
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium px-8 py-3.5 rounded-xl w-full transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg flex items-center justify-center group"
                        >
                          <span className="mr-2">Upgrade to Pro</span>
                          <svg className="w-5 h-5 transform transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </MotionDiv>
                </div>
              </MotionDiv>
            ) : loading ? (
              <div className="h-96 flex items-center justify-center">
                <div className="text-center">
                  <Spinner aria-label="Loading analytics..." size="xl" />
                  <p className="mt-4 text-gray-500 dark:text-gray-400">Loading your analytics data...</p>
                </div>
              </div>
            ) : (
              <MotionDiv variants={containerVariants} className="space-y-8">
                <MotionDiv
                  variants={itemVariants}
                  className="grid grid-cols-1 md:grid-cols-3 gap-6"
                  key="metrics"
                >
                  <MetricCard
                    icon={faRocket}
                    title="Total Requests"
                    value={totalRequests.toLocaleString()}
                    trend={parseFloat(requestsChange)}
                    color={themeColors.primary}
                    previousValue={showComparison ? prevTotalRequests.toLocaleString() : null}
                  />
                  <MetricCard
                    icon={faChartLine}
                    title="Success Rate"
                    value={`${successRate}%`}
                    trend={2.1}
                    color={themeColors.secondary}
                    previousValue={showComparison ? "96.8%" : null}
                  />
                  <MetricCard
                    icon={faClock}
                    title="Avg. Latency"
                    value={`${avgLatency}ms`}
                    trend={-5.7}
                    color={themeColors.warning}
                    previousValue={showComparison ? "198ms" : null}
                  />
                </MotionDiv>

                {visibleCharts.usage && (
                  <MotionDiv
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    key="usage-chart"
                  >
                    <UsageChart
                      data={data}
                      timeRange={timeRange}
                      themeColors={themeColors}
                      showComparison={showComparison}
                      includeAnomalies={includeAnomalies}
                    />
                  </MotionDiv>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {visibleCharts.endpoints && (
                    <MotionDiv
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      key="endpoints-chart"
                    >
                      <EndpointsChart
                        data={filteredEndpoints}
                        themeColors={themeColors}
                      />
                    </MotionDiv>
                  )}

                  {visibleCharts.errors && (
                    <MotionDiv
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      key="errors-chart"
                    >
                      <ErrorsChart
                        data={data?.errors}
                        themeColors={themeColors}
                      />
                    </MotionDiv>
                  )}

                  {visibleCharts.latency && (
                    <MotionDiv
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      key="latency-chart"
                    >
                      <LatencyChart
                        data={filteredLatencies}
                        themeColors={themeColors}
                      />
                    </MotionDiv>
                  )}

                  {visibleCharts.performance && (
                    <MotionDiv
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      key="performance-chart"
                    >
                      <PerformanceChart
                        data={data?.performanceMetrics}
                        themeColors={themeColors}
                      />
                    </MotionDiv>
                  )}
                </div>
              </MotionDiv>
            )
            }
          </MotionDiv >
        </div >
      </div >
      {/* Analytics Coming Soon Modal - Commented out as requested */}
      {/* <AnalyticsInfoModal show={showInfoModal} onClose={() => setShowInfoModal(false)} /> */}
    </div >
  );
}