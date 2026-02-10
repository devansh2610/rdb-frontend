import React, { useState } from "react";
import { HiOutlineCurrencyDollar } from "react-icons/hi";
import TokenRing, { getTokenPercentageColor } from "../common/TokenRing";

const TokensTab = ({ availableTokens, totalTokens }) => {
  const [customTokenAmount, setCustomTokenAmount] = useState("");
  const [customTokenPrice, setCustomTokenPrice] = useState("");
  const [customTokenError, setCustomTokenError] = useState("");

  // Always set token percentage to 100%
  const tokenPercentage = 100;

  // Calculate custom token price (example pricing logic)
  const calculateCustomTokenPrice = (amount) => {
    if (!amount || isNaN(amount) || amount <= 0) {
      setCustomTokenPrice("");
      return;
    }

    // Calculate tiered pricing
    let price;
    if (amount < 100) {
      price = (amount * 0.07).toFixed(2); // $0.07 per token for small amounts
    } else if (amount < 500) {
      price = (amount * 0.06).toFixed(2); // $0.06 per token for medium amounts
    } else if (amount < 1000) {
      price = (amount * 0.05).toFixed(2); // $0.05 per token for larger amounts
    } else {
      price = (amount * 0.045).toFixed(2); // $0.045 per token for very large amounts
    }

    setCustomTokenPrice(price);
  };

  const handleCustomTokenChange = (e) => {
    const value = e.target.value;
    setCustomTokenAmount(value);

    // Validate input
    if (value && (isNaN(value) || parseInt(value) <= 0)) {
      setCustomTokenError("Please enter a valid positive number");
    } else if (value && parseInt(value) > 10000) {
      setCustomTokenError("Maximum 10,000 tokens allowed per purchase");
    } else {
      setCustomTokenError("");
      calculateCustomTokenPrice(value);
    }
  };

  return (
    <div className="animate-fadeIn" style={{ minHeight: "70vh" }}>
      <h2
        className="text-lg font-medium mb-8"
        style={{
          fontFamily: "DM Sans, sans-serif",
          color: "#BDE958",
          borderBottom: "2px solid #BDE958",
          paddingBottom: "8px",
          display: "inline-block",
        }}
      >
        Token Management
      </h2>

      <div className="mt-8">
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="relative" style={{ width: "200px", height: "200px" }}>
            <TokenRing percentage={tokenPercentage} size={200} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div
                className="flex flex-col items-center"
                style={{ color: "#BDE958" }}
              >
                <span
                  className="text-5xl font-bold"
                  style={{ fontFamily: "Sometype Mono, monospace" }}
                >
                  {availableTokens}
                </span>
              </div>
              <span
                className="mt-2 text-xs font-medium"
                style={{
                  color: "#9ca3af",
                  fontFamily: "DM Sans, sans-serif",
                }}
              >
                Tokens Available
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-start">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="#888"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p
            className="text-sm leading-relaxed"
            style={{
              color: "#888",
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            Need more tokens? Contact us at{" "}
            <span className="font-normal" style={{ color: "#888" }}>
              contact@foodoscope.com
            </span>{" "}
            for enterprise plans with custom token allocations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TokensTab;
