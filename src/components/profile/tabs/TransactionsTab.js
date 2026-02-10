import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";

const TransactionsTab = () => {
  const { getToken } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = await getToken();
        const response = await axios.get(
          "https://api.foodoscope.com/payments/payment-history",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // If API returns data, use it
        const apiData = response.data.data || [];
        setTransactions(apiData);
      } catch (error) {
        console.error("Error fetching transactions:", error);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [getToken]);

  return (
    <div className="animate-fadeIn" style={{ minHeight: "70vh" }}>
      <div
        className="rounded-lg shadow-sm overflow-hidden border"
        style={{
          backgroundColor: "#2d2d2d",
          borderColor: "#3a3a3a",
          minHeight: "65vh",
        }}
      >
        <div className="overflow-x-auto">
          <table
            className="min-w-full divide-y"
            style={{ borderColor: "#3a3a3a" }}
          >
            <thead style={{ backgroundColor: "#2d2d2d" }}>
              <tr>
                <th
                  scope="col"
                  className="px-6 py-5 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: "#888", fontFamily: "DM Sans, sans-serif" }}
                >
                  TRANSACTION ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-5 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: "#888", fontFamily: "DM Sans, sans-serif" }}
                >
                  DATE
                </th>
                <th
                  scope="col"
                  className="px-6 py-5 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: "#888", fontFamily: "DM Sans, sans-serif" }}
                >
                  DESCRIPTION
                </th>
                <th
                  scope="col"
                  className="px-6 py-5 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: "#888", fontFamily: "DM Sans, sans-serif" }}
                >
                  AMOUNT
                </th>
                <th
                  scope="col"
                  className="px-6 py-5 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: "#888", fontFamily: "DM Sans, sans-serif" }}
                >
                  STATUS
                </th>
              </tr>
            </thead>
            <tbody
              className="divide-y"
              style={{ backgroundColor: "#2d2d2d", borderColor: "#3a3a3a" }}
            >
              {loading ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 text-center text-sm"
                    style={{
                      color: "#888",
                      fontFamily: "DM Sans, sans-serif",
                      height: "55vh",
                      verticalAlign: "middle",
                    }}
                  >
                    Loading...
                  </td>
                </tr>
              ) : transactions.length > 0 ? (
                transactions.map((transaction, index) => (
                  <tr
                    key={index}
                    className="transition-colors"
                    style={{ backgroundColor: "#2d2d2d" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#353535")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "#2d2d2d")
                    }
                  >
                    <td
                      className="px-6 py-5 whitespace-nowrap text-sm"
                      style={{
                        color: "#ffffff",
                        fontFamily: "DM Sans, sans-serif",
                      }}
                    >
                      {transaction.transactionId}
                    </td>
                    <td
                      className="px-6 py-5 text-sm"
                      style={{
                        color: "#b8b8b8",
                        fontFamily: "DM Sans, sans-serif",
                      }}
                    >
                      <div>{transaction.date}</div>
                      {transaction.time && (
                        <div className="text-xs" style={{ color: "#888" }}>
                          {transaction.time}
                        </div>
                      )}
                    </td>
                    <td
                      className="px-6 py-5 whitespace-nowrap text-sm"
                      style={{
                        color: "#b8b8b8",
                        fontFamily: "DM Sans, sans-serif",
                      }}
                    >
                      {transaction.description}
                    </td>
                    <td
                      className="px-6 py-5 whitespace-nowrap text-sm font-semibold"
                      style={{
                        color: "#ffffff",
                        fontFamily: "DM Sans, sans-serif",
                      }}
                    >
                      {transaction.amount}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span
                        className="text-xs font-medium"
                        style={{
                          color:
                            transaction.status === "Paid"
                              ? "#10b981"
                              : transaction.status === "Pending"
                              ? "#f59e0b"
                              : "#ef4444",
                          fontFamily: "DM Sans, sans-serif",
                        }}
                      >
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 text-center text-sm"
                    style={{
                      color: "#888",
                      fontFamily: "DM Sans, sans-serif",
                      height: "55vh",
                      verticalAlign: "middle",
                    }}
                  >
                    No payment transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TransactionsTab;
