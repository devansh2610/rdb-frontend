import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faChartLine,
    faArrowLeft,
    faFilter,
    faSearch,
    faNetworkWired,
    faCode,
    faServer,
    faShieldAlt
} from "@fortawesome/free-solid-svg-icons";
import { HiOutlineRefresh, HiOutlineFilter, HiX, HiOutlineExclamation } from "react-icons/hi";
import recipeDB_logo from "../assets/recipeDB_logo-removebg-preview.png";
import flavorDB_logo from "../assets/flavorDB_logo-removebg-preview.png";
import sustainableDB_logo from "../assets/sustainableDB_logo.png";
import dietRx_logo from "../assets/dietRx_logo.png";

const MotionDiv = motion.div;

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08
        }
    }
};

const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            type: "spring",
            stiffness: 80,
            damping: 12
        }
    }
};

const ApiCatalog = ({ apis, metricsStatus }) => {
    const [selectedApi, setSelectedApi] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortField, setSortField] = useState("usage");
    const [sortOrder, setSortOrder] = useState("desc");
    const [usageFilter, setUsageFilter] = useState("all");
    const [enrichedApis, setEnrichedApis] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [maxApiUsage, setMaxApiUsage] = useState(10000);

    useEffect(() => {
        if (!apis || !Array.isArray(apis) || apis.length === 0) {
            // Create default API entries if the API list is empty or invalid
            const baseApis = [
                { _id: "recipedb", name: "RecipeDB", description: "Recipe database API", subapis: [] },
                { _id: "flavordb", name: "FlavorDB", description: "Flavor database API", subapis: [] }
            ];

            // Create a default enriched API structure even if we don't have metrics data
            const enriched = baseApis.map((api) => {
                return {
                    ...api,
                    usage: 0,
                    subapis: api.subapis || []
                };
            });

            // If we have metrics data, enhance the enriched APIs
            if (metricsStatus) {
                // Try to extract target usage data if available
                const targetUsageMap = {};
                if (metricsStatus?.proxy?.allTargets && Array.isArray(metricsStatus.proxy.allTargets)) {
                    metricsStatus.proxy.allTargets.forEach(({ target, count }) => {
                        if (target && count !== undefined) {
                            targetUsageMap[target] = count;
                        }
                    });
                }

                // Try to extract endpoint data if available
                let endpointList = [];
                if (metricsStatus.allEndpoints && Array.isArray(metricsStatus.allEndpoints)) {
                    endpointList = metricsStatus.allEndpoints;
                } else if (metricsStatus.proxy?.allProxiedEndpoints && Array.isArray(metricsStatus.proxy.allProxiedEndpoints)) {
                    endpointList = metricsStatus.proxy.allProxiedEndpoints;
                }

                if (Array.isArray(endpointList) && endpointList.length > 0) {
                    // Map the endpoints to their corresponding API
                    const groupedSubApis = {};

                    endpointList.forEach((endpoint) => {
                        if (!endpoint) return;

                        const endpointStr = typeof endpoint === 'string' ? endpoint : endpoint.endpoint || endpoint.url || endpoint.path || "";
                        const count = typeof endpoint === 'object' ? (endpoint.count || endpoint.requests || 0) : 0;
                        const avgResponseTime = typeof endpoint === 'object' ? (endpoint.avgResponseTime || 0) : 0;
                        const errorCount = typeof endpoint === 'object' ? (endpoint.errorCount || 0) : 0;

                        if (!endpointStr) return;

                        // Determine which API this endpoint belongs to
                        let apiType = null;
                        if (endpointStr.includes("/recipe") || endpointStr.includes("recipe2-api")) apiType = "RecipeDB";
                        else if (endpointStr.includes("/api/") || endpointStr.includes("flavor")) apiType = "FlavorDB";

                        if (!apiType) return;

                        if (!groupedSubApis[apiType]) groupedSubApis[apiType] = [];

                        groupedSubApis[apiType].push({
                            _id: endpointStr,
                            name: endpointStr.split("/").pop() || endpointStr,
                            url: endpointStr,
                            usage: count,
                            avgResponseTime,
                            errorCount
                        });
                    });

                    // Update the enriched APIs with this data
                    enriched.forEach((api, index) => {
                        const name = api.name;
                        const target =
                            name === "RecipeDB" ? "recipe2-api" :
                                name === "FlavorDB" ? "api" :
                                    null;

                        // Update usage data if available
                        if (target && targetUsageMap[target] !== undefined) {
                            enriched[index].usage = targetUsageMap[target];
                        }

                        // Update subapis if available
                        if (groupedSubApis[name]) {
                            enriched[index].subapis = groupedSubApis[name];
                        }
                    });
                }
            }

            setEnrichedApis(enriched);

            // Calculate max usage across all APIs for the main catalog view
            if (enriched.length > 0) {
                const allUsages = enriched.map(api => api.usage || 0);
                const maxUsage = Math.max(...allUsages);
                setMaxApiUsage(maxUsage > 0 ? maxUsage : 10000);
            }
        } else {
            // Process actual API data
            const enriched = apis.map((api) => {
                return {
                    ...api,
                    usage: 0,
                    subapis: api.subapis || []
                };
            });

            // If we have metrics data, enhance the enriched APIs
            if (metricsStatus) {
                // Try to extract target usage data if available
                const targetUsageMap = {};
                if (metricsStatus?.proxy?.allTargets && Array.isArray(metricsStatus.proxy.allTargets)) {
                    metricsStatus.proxy.allTargets.forEach(({ target, count }) => {
                        if (target && count !== undefined) {
                            targetUsageMap[target] = count;
                        }
                    });
                }

                // Try to extract endpoint data if available
                let endpointList = [];
                if (metricsStatus.allEndpoints && Array.isArray(metricsStatus.allEndpoints)) {
                    endpointList = metricsStatus.allEndpoints;
                } else if (metricsStatus.proxy?.allProxiedEndpoints && Array.isArray(metricsStatus.proxy.allProxiedEndpoints)) {
                    endpointList = metricsStatus.proxy.allProxiedEndpoints;
                }

                if (Array.isArray(endpointList) && endpointList.length > 0) {
                    // Map the endpoints to their corresponding API
                    const groupedSubApis = {};

                    endpointList.forEach((endpoint) => {
                        if (!endpoint) return;

                        const endpointStr = typeof endpoint === 'string' ? endpoint : endpoint.endpoint || endpoint.url || endpoint.path || "";
                        const count = typeof endpoint === 'object' ? (endpoint.count || endpoint.requests || 0) : 0;
                        const avgResponseTime = typeof endpoint === 'object' ? (endpoint.avgResponseTime || 0) : 0;
                        const errorCount = typeof endpoint === 'object' ? (endpoint.errorCount || 0) : 0;

                        if (!endpointStr) return;

                        // Determine which API this endpoint belongs to
                        let apiType = null;
                        if (endpointStr.includes("/recipe") || endpointStr.includes("recipe2-api")) apiType = "RecipeDB";
                        else if (endpointStr.includes("/api/") || endpointStr.includes("flavor")) apiType = "FlavorDB";

                        if (!apiType) return;

                        if (!groupedSubApis[apiType]) groupedSubApis[apiType] = [];

                        groupedSubApis[apiType].push({
                            _id: endpointStr,
                            name: endpointStr.split("/").pop() || endpointStr,
                            url: endpointStr,
                            usage: count,
                            avgResponseTime,
                            errorCount
                        });
                    });

                    // Update the enriched APIs with this data
                    enriched.forEach((api, index) => {
                        const name = api.name;
                        const target =
                            name === "RecipeDB" ? "recipe2-api" :
                                name === "FlavorDB" ? "api" :
                                    null;

                        // Update usage data if available
                        if (target && targetUsageMap[target] !== undefined) {
                            enriched[index].usage = targetUsageMap[target];
                        }

                        // Update subapis if available
                        if (groupedSubApis[name]) {
                            enriched[index].subapis = groupedSubApis[name];
                        }
                    });
                }
            }

            setEnrichedApis(enriched);

            // Calculate max usage across all APIs for the main catalog view
            if (enriched.length > 0) {
                const allUsages = enriched.map(api => api.usage || 0);
                const maxUsage = Math.max(...allUsages);
                setMaxApiUsage(maxUsage > 0 ? maxUsage : 10000);
            }
        }
    }, [apis, metricsStatus]); // Only run when apis or metricsStatus change

    const apiLogos = {
        RecipeDB: recipeDB_logo,
        FlavorDB: flavorDB_logo,
        SustainableFoodDB: sustainableDB_logo,
        dietRx: dietRx_logo
    };

    const apiColors = {
        RecipeDB: {
            accent: "#3B82F6",
            gradient: "from-[#1E3A8A] to-[#2563EB]",
            icon: "#60A5FA"
        },
        FlavorDB: {
            accent: "#F59E0B",
            gradient: "from-[#92400E] to-[#D97706]",
            icon: "#FBBF24"
        },
        SustainableFoodDB: {
            accent: "#10B981",
            gradient: "from-[#065F46] to-[#059669]",
            icon: "#34D399"
        },
        dietRx: {
            accent: "#8B5CF6",
            gradient: "from-[#5B21B6] to-[#7C3AED]",
            icon: "#A78BFA"
        }
    };

    const handleApiClick = (api) => setSelectedApi(api);
    const handleBack = () => {
        setSelectedApi(null);
        setSearchTerm("");
        setSortField("usage");
        setSortOrder("desc");
        setUsageFilter("all");
    };

    const getSortValue = (item, field) => {
        if (field === "name") return item.name?.toLowerCase() || "";
        if (field === "usage") return Number(item.usage || 0);
        if (field === "avgResponseTime") {
            // Handle both string and numeric response time formats
            const responseTime = item.avgResponseTime;
            if (!responseTime) return 0;

            if (typeof responseTime === 'string') {
                // Extract numeric part from strings like "97.85ms"
                const numericValue = parseFloat(responseTime);
                return isNaN(numericValue) ? 0 : numericValue;
            }
            return Number(responseTime);
        }
        return item[field];
    };

    const filterAndSort = (items) => {
        return items
            .filter((item) => {
                const matchesSearch =
                    !searchTerm ||
                    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.description?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
                    item.url?.toLowerCase()?.includes(searchTerm.toLowerCase());
                const usage = item.usage || 0;
                const matchesUsage =
                    usageFilter === "all" ||
                    (usageFilter === "high" && usage >= 1000) ||
                    (usageFilter === "medium" && usage < 1000 && usage >= 100) ||
                    (usageFilter === "low" && usage < 100);
                return matchesSearch && matchesUsage;
            })
            .sort((a, b) => {
                let valA = getSortValue(a, sortField);
                let valB = getSortValue(b, sortField);

                if (valA === undefined || valA === null) valA = "";
                if (valB === undefined || valB === null) valB = "";

                if (sortField === "usage" || sortField === "avgResponseTime") {
                    return sortOrder === "asc" ? valA - valB : valB - valA;
                }
                if (typeof valA === "string" && typeof valB === "string") {
                    return sortOrder === "asc"
                        ? valA.localeCompare(valB)
                        : valB.localeCompare(valA);
                }
                return 0;
            });
    };

    const formatNumber = (num) => {
        if (num === undefined || num === null) return '0';
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

    // Calculate the actual max usage across all endpoints
    const calculateMaxUsage = (subapis) => {
        if (!subapis || subapis.length === 0) return 1000;
        const allUsages = subapis.map(api => api.usage || 0);
        const maxUsage = Math.max(...allUsages);
        return maxUsage > 0 ? maxUsage : 1000; // Fallback to 1000 if all are zero
    };

    const getUsagePercentage = (usage, maxUsage) => {
        return Math.max(Math.min(usage / maxUsage * 100, 100), 5); // Between 5% and 100%
    };

    const renderUsageBar = (usage, color, maxUsage) => {
        const percentage = getUsagePercentage(usage, maxUsage);
        return (
            <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full"
                    style={{
                        width: `${percentage}%`,
                        backgroundColor: color
                    }}
                />
            </div>
        );
    };

    const renderSubApisTable = () => {
        if (!selectedApi || !selectedApi.subapis) return null;

        const filteredSubApis = filterAndSort(selectedApi.subapis);
        const colors = apiColors[selectedApi.name] || apiColors.RecipeDB;
        const maxUsage = calculateMaxUsage(selectedApi.subapis);

        return (
            <MotionDiv
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="mt-6"
            >
                {/* Header section */}
                <MotionDiv variants={itemVariants} className="flex flex-wrap items-center justify-between gap-4 mb-5">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#161616] hover:bg-gray-700 text-gray-300 text-sm font-medium transition-colors"
                        >
                            <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
                            <span>Back</span>
                        </button>
                        <h1 className="text-xl font-bold text-white">{selectedApi.name} APIs</h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => {
                                setSearchTerm("");
                                setSortField("usage");
                                setSortOrder("desc");
                                setUsageFilter("all");
                            }}
                            className="p-2 rounded-lg bg-[#161616] hover:bg-gray-700 text-gray-300 transition-all cursor-pointer"
                            title="Refresh endpoint list"
                        >
                            <HiOutlineRefresh className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`p-2 rounded-lg transition-all ${showFilters ? 'bg-blue-900/30 text-blue-400' : 'bg-[#161616] hover:bg-gray-700 text-gray-300'}`}
                            title="Show filters"
                        >
                            <HiOutlineFilter className="w-5 h-5" />
                        </button>
                    </div>
                </MotionDiv>

                {/* Search */}
                <MotionDiv variants={itemVariants} className="mb-5">
                    <div className="relative">
                        <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search endpoints..."
                            className="w-full pl-11 pr-10 py-2.5 rounded-lg border border-gray-700 bg-[#161616] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="absolute inset-y-0 right-0 flex items-center pr-3"
                                title="Clear search"
                            >
                                <HiX className="h-4 w-4 text-gray-400 hover:text-gray-300" />
                            </button>
                        )}
                    </div>
                </MotionDiv>

                {/* Filters */}
                {showFilters && (
                    <MotionDiv
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white dark:bg-[#28292B] rounded-lg shadow-sm p-4 grid grid-cols-1 md:grid-cols-2 gap-4 mb-5"
                    >
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sort By</label>
                            <select
                                value={sortField}
                                onChange={(e) => setSortField(e.target.value)}
                                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#161616] text-gray-800 dark:text-white py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                            >
                                <option value="usage">Usage</option>
                                <option value="name">Name</option>
                                <option value="avgResponseTime">Avg Response Time</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Order</label>
                            <select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#161616] text-gray-800 dark:text-white py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                            >
                                <option value="asc">Ascending</option>
                                <option value="desc">Descending</option>
                            </select>
                        </div>
                    </MotionDiv>
                )}

                {/* Endpoints Table */}
                <MotionDiv variants={itemVariants} className="bg-white dark:bg-[#28292B] rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-[#1E1F21] border-b border-gray-200 dark:border-gray-700 text-left">
                                    <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Endpoint</th>
                                    <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">URL</th>
                                    <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Usage</th>
                                    <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Avg Response Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredSubApis.length > 0 ? (
                                    filteredSubApis.map((subapi) => (
                                        <tr
                                            key={subapi._id}
                                            className="hover:bg-gray-50 dark:hover:bg-[#212224] transition-colors"
                                        >
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-7 h-7 rounded-md flex items-center justify-center"
                                                        style={{ backgroundColor: `${colors.accent}20`, color: colors.icon }}>
                                                        <FontAwesomeIcon icon={faCode} className="text-xs" />
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {subapi.name}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                                <code className="font-mono bg-[#161616] px-2 py-1 rounded text-gray-300 text-xs">
                                                    {subapi.url}
                                                </code>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="w-40">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            {formatNumber(subapi.usage)} calls
                                                        </span>
                                                    </div>
                                                    {renderUsageBar(subapi.usage, colors.accent, maxUsage)}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                                {subapi.avgResponseTime ?
                                                    (typeof subapi.avgResponseTime === 'string' ?
                                                        subapi.avgResponseTime :
                                                        `${subapi.avgResponseTime.toFixed(2)} ms`) :
                                                    'N/A'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-4 py-8 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <HiOutlineExclamation className="w-10 h-10 text-gray-400 mb-2" />
                                                <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">No endpoints found</p>
                                                <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">Try adjusting your search or filter criteria</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </MotionDiv>
            </MotionDiv>
        );
    };

    const filteredApis = filterAndSort(
        (enrichedApis || [])
            .filter(api => api && api.name)
            .sort((a, b) => {
                const order = ["RecipeDB", "FlavorDB"];
                const indexA = order.indexOf(a.name);
                const indexB = order.indexOf(b.name);
                return (indexA !== -1 ? indexA : 999) - (indexB !== -1 ? indexB : 999);
            })
    );

    return (
        <MotionDiv
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="w-full"
        >
            <MotionDiv variants={itemVariants} className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        API Catalog
                    </h2>
                </div>
            </MotionDiv>

            {!selectedApi ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    {filteredApis.map((api) => {
                        const colors = apiColors[api.name] || apiColors.RecipeDB;
                        return (
                            <MotionDiv
                                key={api._id}
                                variants={itemVariants}
                                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                                whileTap={{ scale: 0.98 }}
                                className="group relative overflow-hidden rounded-xl bg-[#28292B] border border-[#3a3b3d] shadow-lg hover:shadow-xl transition-all duration-300"
                                onClick={() => handleApiClick(api)}
                                style={{ cursor: "pointer" }}
                            >
                                <div className="px-6 pt-6 pb-4">
                                    <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: colors.accent }}></div>

                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-16 h-16 flex items-center justify-center bg-[#161616] rounded-lg overflow-hidden p-2 border border-[#3a3b3d]">
                                            <img
                                                src={apiLogos[api.name]}
                                                alt={api.name}
                                                className="max-h-12 max-w-12 object-contain"
                                            />
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: colors.accent }}></div>
                                            <span className="text-xs text-gray-400">Active</span>
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-bold text-white mb-1">{api.name}</h3>
                                    <p className="text-sm text-gray-400 mb-4">
                                        Enterprise data service
                                    </p>

                                    <div className="mb-4">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs text-gray-400">API Usage</span>
                                            <span className="text-xs font-medium" style={{ color: colors.icon }}>{formatNumber(api.usage)}</span>
                                        </div>
                                        {renderUsageBar(api.usage, colors.accent, maxApiUsage)}
                                    </div>
                                </div>

                                <div className="px-6 py-3 bg-[#161616] border-t border-[#3a3b3d] flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <FontAwesomeIcon icon={faShieldAlt} className="text-xs text-gray-400" />
                                        <span className="text-xs text-gray-400">Authentication required</span>
                                    </div>
                                    <div className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                        <span className="text-xs font-medium" style={{ color: colors.accent }}>Explore</span>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke={colors.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                </div>
                            </MotionDiv>
                        );
                    })}
                </div>
            ) : (
                renderSubApisTable()
            )}
        </MotionDiv>
    );
};

export default ApiCatalog;
