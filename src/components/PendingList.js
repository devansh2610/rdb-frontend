import React, { useState, useEffect } from "react";
import { Table, Button, Alert, Spinner } from "flowbite-react";
import { useAuth } from "../context/AuthContext";
import axios from "../api/axios";
import DeleteEntityModal from "../modals/DeleteEntityModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowsRotate } from "@fortawesome/free-solid-svg-icons";

export default function PendingList() {
  const { getToken, getProfile, logout } = useAuth();
  const [showError, setShowError] = useState(false);
  const [pendingTokenRequests, setPendingTokenRequests] = useState([]); // list of users with pending token requests
  const [loading, setLoading] = useState(false);
  const userInfo = getProfile();

  const fetchPendingTokenRequests = async () => {
    // fetches the list of users that have requested for tokens
    const token = await getToken();
    const result = await axios
      .get("/users?requests=true", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .catch(async (error) => {
        if (error.response.status === 401) {
          logout();
        } else {
          console.log("there is an error");
        }
      });

    // filter that removes the all users who don't have request tokens
    // from the list of users to be displayed
    let returnedUserData = result.data.users;
    returnedUserData = returnedUserData.filter((obj) => "requestTokens" in obj);
    setPendingTokenRequests(returnedUserData);

    setShowError(false); // remove error, if any
    setLoading(false); // set loading false, if it is true
  };

  const fetchUserInfo = async (userID) => {
    // fetches up to date user info from database
    // and returns it

    const token = await getToken();
    const result = await axios
      .get(`/users/${userID}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .catch(async (error) => {
        if (error.response.status === 401) {
          logout();
        } else {
          console.log("there is an error");
        }
      });

    return result.data.user;
  };

  const handleUpdates = async () => {
    // does a one time update of useState variables
    fetchPendingTokenRequests();
  };

  const acceptRequest = async (userID, requestTokens) => {
    // Deletes user request for tokens

    try {
      const accReq = async (requestTokens) => {
        const token = getToken();
        const result = await axios
          .put(
            `/users/${userID}`,
            {
              status: "true",
              requestTokens: requestTokens,
            },
            {
              headers: {
                // add the authorization
                Authorization: `Bearer ${token}`,
              },
            }
          )
          .catch(async (error) => {
            if (error.response.status === 401) {
              // Unauthorized, token invalid
              logout();
            }
          });
      };

      const mismatch = await mismatchedPendingList(userID);
      if (mismatch) setShowError(true);
      else {
        await accReq(requestTokens);
        await handleUpdates();
      }
    } catch {
      console.log(
        "ERROR: While deleting user's request for tokens from server"
      );
    }
  };

  const mismatchedPendingList = async (userID) => {
    // returns true if there is mismatch in token request

    const databaseUserInfo = await fetchUserInfo(userID);
    if ("requestTokens" in databaseUserInfo) {
      return !pendingTokenRequests.some(
        (user) =>
          user._id == userID &&
          user.requestTokens == databaseUserInfo.requestTokens
      );
    }
    return true; // if user doesn't have requestToken property, there is mismatch
  };

  useEffect(() => {
    // calls fetchPendingTokenRequests
    try {
      fetchPendingTokenRequests();
    } catch {
      console.log("ERROR: While fetching users with pending requests on mount");
    }
  }, []);

  return (
    <div className="w-full h-full">
      <div className="flex flex-row w-full items-center justify-between mb-6">
        <p className="text-2xl font-semibold dark:text-white">
          Pending Requests
        </p>
        <div className="flex flex-row items-center gap-4">
          {showError && (
            <Alert color="failure">
              <span>Refresh the list and try again</span>
            </Alert>
          )}
          <Button
            onClick={() => {
              setLoading(true);
              fetchPendingTokenRequests();
            }}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner aria-label="Left-aligned spinner example" size="xs" />
                <span className="pl-3">Fetching</span>
              </>
            ) : (
              <>
                <FontAwesomeIcon
                  icon={faArrowsRotate}
                  className="mr-2 text-white h-5 w-5"
                />
                Refresh
              </>
            )}
          </Button>
        </div>
      </div>

      {pendingTokenRequests.length == 0 ? (
        <div className="flex items-center justify-center h-96 w-full text-gray-500">
          <p className="text-2xl">No Request Found</p>
        </div>
      ) : (
        <Table hoverable={true} className="w-full">
          {/* Table Head */}
          <Table.Head>
            <Table.HeadCell>User Email</Table.HeadCell>
            <Table.HeadCell>Requested Tokens</Table.HeadCell>
            <Table.HeadCell>
              <span className="sr-only">Options</span>
            </Table.HeadCell>
          </Table.Head>

          {/* Table Body */}
          <Table.Body className="divide-y">
            {pendingTokenRequests.map((user) => (
              <Table.Row
                key={user._id}
                className="bg-white dark:border-gray-700 dark:bg-gray-800"
              >
                <Table.Cell className="whitespace-nowrap text-gray-900 dark:text-white">
                  {user.email}
                </Table.Cell>
                <Table.Cell className="whitespace-nowrap text-gray-900 dark:text-white">
                  {user.requestTokens}
                </Table.Cell>
                <Table.Cell>
                  <div className="flex flex-row-reverse gap-2">
                    <DeleteEntityModal
                      entity="request"
                      userID={user._id}
                      handleUpdates={handleUpdates}
                    />
                    <Button
                      size="sm"
                      color="success"
                      onClick={() =>
                        acceptRequest(user._id, user.requestTokens)
                      }
                    >
                      Accept request
                    </Button>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}
    </div>
  );
}
