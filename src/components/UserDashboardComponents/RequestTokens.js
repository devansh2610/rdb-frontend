// RequestTokens

import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Alert, Spinner, Button, TextInput } from "flowbite-react";
import axios from "../../api/axios";

export default function RequestTokens({
  userInfo,
  paymentInfo,
  handleUpdates,
}) {
  // VARIABLES
  const { getToken, logout } = useAuth();
  // STATE VARIABLES
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(0);
  const [requestedTokens, setRequestedTokens] = useState(
    userInfo && "requestTokens" in userInfo ? userInfo.requestTokens : ""
  );

  // FUNCTIONS
  const handleTokenRequest = async () => {
    if (!requestedTokens || parseInt(requestedTokens) == 0) setShowError(2);
    else {
      setLoading(true);
      const token = await getToken();
      try {
        const response = await axios
          .put(
            `/profile/requests`,
            {
              tokens: requestedTokens,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )
          .catch(async (error) => {
            if (error.response.status === 401) {
              logout();
            } else {
              // show error in case there is
              setShowError(1);
              setLoading(false);
            }
          });

        // on sucessful submission, close modal, update userList
        if (response.status == 200) {
          handleUpdates(setRequestedTokens, setShowError);
        }

        setLoading(false);
      } catch {
        console.log("ERROR: While creating subscription");
      }
    }
  };

  const handleDeleteRequest = async () => {
    setLoading(true);
    const token = await getToken();
    try {
      const response = await axios
        .put(
          `/profile/requests`,
          {
            tokens: 0,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .catch(async (error) => {
          if (error.response.status === 401) {
            logout();
          } else {
            // show error in case there is
            setShowError(true);
          }
        });

      // on sucessful submission, close modal, update userList
      if (response.status == 200) {
        handleUpdates();
      }

      setLoading(false);
    } catch {
      console.log("ERROR: While creating subscription");
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 px-4 py-8 md:px-6 rounded-md bg-white border dark:border-slate-500 dark:bg-slate-700 bg-opacity-75 dark:bg-opacity-75 backdrop-blur-sm dark:backdrop-blur-sm">
      <div className="flex flex-col gap-2 w-full">
        {!("requestTokens" in userInfo) ? (
          <>
            <p className="text-lg font-medium text-blue-700 dark:text-white">
              Want to get more tokens?
            </p>
            <p className="text-gray-600 dark:text-gray-200">
              Your request will be approved within two working days by
              moderators. For more support, contact us on mail
            </p>
          </>
        ) : (
          <>
            <p className="text-lg font-medium text-blue-700 dark:text-white">
              You have a pending token request
            </p>
            <p className="text-gray-600 dark:text-gray-200">
              If you want to edit your request for tokens, kindly edit the value
              in input
            </p>
          </>
        )}

        {showError > 0 && (
          <Alert color="failure" className="mt-4">
            <span>
              <span className="font-medium">Error!</span>
              {(() => {
                switch (showError) {
                  case 1:
                    return " Unable to process your request in the server";
                  case 2:
                    return " Please enter valid value";
                  default:
                    return " Unable to work with your request";
                }
              })()}
            </span>
          </Alert>
        )}
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 md:gap-4 w-full">
        <div className="flex flex-col w-fit">
          <p className="text-slate-700 dark:text-slate-100">
            {/* At ₹{paymentInfo.pricePerToken} per token */}
            At ${"___"} per token
          </p>
          <p className="font-medium text-lg dark:text-white">Total cost</p>
          <p className="text-2xl dark:text-white truncate overflow-hidden">
            <span>$</span> {"___"}
            {/* {(() => {
              if (requestedTokens) {
                if (!isNaN(requestedTokens) && parseInt(requestedTokens) >= 0) {
                  return (
                    parseInt(requestedTokens) *
                    parseInt(paymentInfo.pricePerToken)
                  );
                } else {
                  if (requestedTokens != '') setShowError(2);
                }
              }
              return 0;
            })()} */}
          </p>
        </div>
        <div className="flex flex-col items-center gap-4 md:items-end">
          <TextInput
            id="tokens"
            type="text"
            placeholder="Enter the token number"
            className="w-full"
            value={requestedTokens}
            required={true}
            onChange={(event) => {
              const changedInputValue = event.target.value;
              // prettier-ignore
              if ( (changedInputValue == "" || (!isNaN(changedInputValue) && parseInt(changedInputValue) >= 0))) {
                setRequestedTokens(changedInputValue);
                setShowError(0);
              } else {
                if (showError != 2) setShowError(2);
              }
            }}
          />

          <div className="flex flex-row gap-4">
            <Button
              onClick={handleTokenRequest}
              disabled={loading || showError}
            >
              {loading ? (
                <>
                  <Spinner
                    aria-label="Left-aligned spinner example"
                    size="xs"
                  />
                  <span className="pl-3">Sending</span>
                </>
              ) : "requestTokens" in userInfo ? (
                "Update"
              ) : (
                "Request"
              )}
            </Button>
            {"requestTokens" in userInfo && (
              <Button
                onClick={handleDeleteRequest}
                disabled={loading}
                color="failure"
              >
                {loading ? (
                  <>
                    <Spinner
                      aria-label="Left-aligned spinner example"
                      size="xs"
                    />
                    <span className="pl-3">Sending</span>
                  </>
                ) : (
                  "Delete Request"
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
