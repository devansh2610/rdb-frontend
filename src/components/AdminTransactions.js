import React, { useEffect, useState } from "react";
import { Spinner, Pagination, Button, TextInput } from "flowbite-react";
import { HiSearch, HiCheckCircle, HiXCircle, HiClock } from "react-icons/hi";
import axios from "../api/axios";
import { useAuth } from "../../src/context/AuthContext";

const PAGE_SIZE = 5;

const statusColors = {
  Paid: "text-green-400 bg-green-900",
  Failed: "text-red-400 bg-red-900",
  Created: "text-yellow-400 bg-yellow-900",
};

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState({ paid: 0, failed: 0, created: 0 });

  const { getToken } = useAuth();

  const fetchTransactions = async (pageNum = 1) => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await axios.get(
        `https://api.foodoscope.com/admin/transactions?page=${pageNum}&pageSize=${PAGE_SIZE}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTransactions(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      setError("Failed to fetch transactions.");
    }
    setLoading(false);
  };

  const fetchTransactionStats = async () => {
    try {
      const token = await getToken();
      // Fetch all transactions to calculate accurate stats
      const res = await axios.get(
        `https://api.foodoscope.com/admin/transactions?page=1&pageSize=1000`, // Adjust size as needed
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      const allTransactions = res.data.data || [];
      const statsData = {
        paid: allTransactions.filter(t => t.status === "Paid").length,
        failed: allTransactions.filter(t => t.status === "Failed").length,
        created: allTransactions.filter(t => t.status === "Created").length,
      };
      setStats(statsData);
    } catch (err) {
      console.error("Failed to fetch transaction stats:", err);
    }
  };

  useEffect(() => {
    fetchTransactions(page);
  }, [page]);

  useEffect(() => {
    // Fetch stats only once when component mounts
    fetchTransactionStats();
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(transactions);
    } else {
      setFiltered(
        transactions.filter(
          (t) =>
            t.email.toLowerCase().includes(search.toLowerCase()) ||
            t.transactionId.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [transactions, search]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const statusIcon = (status) => {
    if (status === "Paid")
      return <HiCheckCircle className="w-5 h-5 text-green-400 inline mr-1" />;
    if (status === "Failed")
      return <HiXCircle className="w-5 h-5 text-red-400 inline mr-1" />;
    return <HiClock className="w-5 h-5 text-yellow-400 inline mr-1" />;
  };

  return (
    <div className="bg-gradient-to-br from-[#18191A] to-[#1a1b1c] rounded-xl shadow-2xl p-6 min-h-[500px] border border-gray-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Transactions</h2>
          <p className="text-gray-400 text-sm">Monitor all user payment transactions</p>
        </div>
        <div className="relative">
          <TextInput
            id="search"
            type="text"
            icon={HiSearch}
            placeholder="Search by email or transaction ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-80"
            sizing="md"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#23272F] rounded-lg p-4 border border-gray-700">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white text-sm font-bold">T</span>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wide">Total Transactions</p>
              <p className="text-white text-xl font-bold">{total}</p>
            </div>
          </div>
        </div>
        <div className="bg-[#23272F] rounded-lg p-4 border border-gray-700">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white text-sm font-bold">P</span>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wide">Paid</p>
              <p className="text-white text-xl font-bold">
                {stats.paid}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-[#23272F] rounded-lg p-4 border border-gray-700">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white text-sm font-bold">F</span>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wide">Failed</p>
              <p className="text-white text-xl font-bold">
                {stats.failed}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-[#23272F] rounded-lg p-4 border border-gray-700">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white text-sm font-bold">C</span>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wide">Created</p>
              <p className="text-white text-xl font-bold">
                {stats.created}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#1e1f20] rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-[#23272F] border-b border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Email
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <Spinner size="xl" color="info" />
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-red-400">
                    {error}
                    <Button color="gray" size="sm" className="ml-4" onClick={() => fetchTransactions(page)}>
                      Retry
                    </Button>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                        <HiSearch className="w-6 h-6 text-gray-500" />
                      </div>
                      <p className="text-gray-400">
                        {search
                          ? `No transactions found matching "${search}"`
                          : "No transactions available"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.transactionId} className="hover:bg-[#23272F] transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-white">
                      <div>
                        <div>{new Date(t.date).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-400">{new Date(t.date).toLocaleTimeString()}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-blue-300 bg-blue-900 px-2 py-1 rounded text-xs">
                        {t.transactionId}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">{t.description}</td>
                    <td className="px-6 py-4 text-center whitespace-nowrap text-white font-semibold">
                      {t.amount}
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${statusColors[t.status] || "bg-gray-800 text-gray-400"
                          }`}
                      >
                        {statusIcon(t.status)}
                        {t.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-white">{t.email}</span>
                    </td>
                  </tr>
                ))
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
    </div>
  );
};

export default AdminTransactions;