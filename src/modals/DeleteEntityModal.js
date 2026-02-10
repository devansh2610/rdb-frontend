import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Modal from "react-modal";
import { Modal as ModalUI, Button, Alert, Spinner } from "flowbite-react";
import axios from "../api/axios";

// entity is a string
export default function DeleteEntityModal({
  entity,
  userID = "",
  apiID = "",
  subApiID = "",
  handleUpdates,
}) {
  const [showModal, setShowModal] = useState(false);
  const { getToken, logout } = useAuth();
  const [showError, setShowError] = useState(false);
  const [loading, setLoading] = useState(false);

  const deleteUser = async (userID) => {
    try {
      const deleteUsr = async () => {
        const token = await getToken();
        const result = await axios
          .delete(`/users/${userID}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .catch(async (error) => {
            if (error.response.status === 401) {
              logout();
            } else {
              setShowError(true);
            }
          });

        if (result.status == 200) {
          setShowError(false);
          setShowModal(false);
        }
      };
      deleteUsr();
    } catch {
      console.log("ERROR: While deleting user");
    }
  };

  const deleteRequest = async (userID) => {
    // Deletes user request for tokens

    try {
      const delReq = async () => {
        const token = getToken();
        const result = await axios
          .put(
            `/users/${userID}`,
            {
              status: "false",
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
            } else {
              setShowError(true);
            }
          });

        if (result.status == 200) {
          setShowError(false);
          setShowModal(false);
        }
      };
      delReq();
    } catch {
      console.log(
        "ERROR: While deleting user's request for tokens from server"
      );
    }
  };

  const deleteAPIKey = async () => {
    // Deletes user request for tokens

    try {
      const delKey = async () => {
        const token = getToken();
        const result = await axios
          .delete(`/profile/key`, {
            headers: {
              // add the authorization
              Authorization: `Bearer ${token}`,
            },
          })
          .catch(async (error) => {
            if (error.response.status == 401) {
              // Unauthorized, token invalid
              logout();
            } else {
              console.log(error);
              setShowError(true);
            }
          });
      };
      delKey();
    } catch {
      console.log("ERROR: While deleting API key from the server");
    }
  };

  const deleteAPI = async (apiID) => {
    // Deletes user request for tokens

    try {
      const delAPI = async () => {
        const token = getToken();
        const result = await axios
          .delete(`/apis/${apiID}`, {
            headers: {
              // add the authorization
              Authorization: `Bearer ${token}`,
            },
          })
          .catch(async (error) => {
            if (error.response.status == 401) {
              // Unauthorized, token invalid
              logout();
            } else {
              console.log(error);
              setShowError(true);
            }
          });
      };
      delAPI();
    } catch {
      console.log("ERROR: While deleting API from the server");
    }
  };

  const deleteSubAPI = async (apiID, subApiID) => {
    // Deletes user request for tokens

    try {
      const delSubAPI = async () => {
        const token = getToken();
        const result = await axios
          .delete(`/apis/${apiID}/subapis/${subApiID}`, {
            headers: {
              // add the authorization
              Authorization: `Bearer ${token}`,
            },
          })
          .catch(async (error) => {
            if (error.response.status == 401) {
              // Unauthorized, token invalid
              logout();
            } else {
              console.log(error);
              setShowError(true);
            }
          });
      };
      delSubAPI();
    } catch {
      console.log("ERROR: While deleting API from the server");
    }
  };

  const handleDeletion = async (
    entity,
    userID,
    apiID,
    subApiID,
    handleUpdates
  ) => {
    try {
      switch (entity) {
        case "user":
          await deleteUser(userID);
          break;
        case "request":
          await deleteRequest(userID);
          break;
        case "key":
          await deleteAPIKey(userID);
          break;
        case "API":
          await deleteAPI(apiID);
          break;
        case "SubAPI":
          await deleteSubAPI(apiID, subApiID);
          break;
        default:
          throw "Invalid entity name";
      }

      // make updates
      await handleUpdates();

      // reset on success
      setLoading(false);
      setShowModal(false);
      setShowError(false);
    } catch (error) {
      console.log(error);
      setShowError(true);
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        size="sm"
        color="failure"
        onClick={() => {
          setShowModal(true);
        }}
        disabled={loading}
      >
        Delete
      </Button>

      {showModal && (
        <ModalUI
          show={showModal}
          size="md"
          popup={true}
          className="backdrop-blur-md"
          onClose={() => {
            setShowModal(false);
            setShowError(false);
          }}
        >
          <ModalUI.Header />
          <ModalUI.Body>
            <div className="text-center">
              <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                Are you sure you want to delete this {entity}
              </h3>
              <div className="flex justify-center gap-4">
                <Button
                  size="sm"
                  color="failure"
                  onClick={() => {
                    setLoading(true);
                    handleDeletion(
                      entity,
                      userID,
                      apiID,
                      subApiID,
                      handleUpdates
                    );
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner
                        aria-label="Left-aligned spinner example"
                        size="xs"
                      />
                      <span className="pl-3">Deleting</span>
                    </>
                  ) : (
                    <>Yes, delete this {entity}</>
                  )}
                </Button>
                <Button
                  color="gray"
                  onClick={() => {
                    setShowModal(false);
                    setShowError(false);
                  }}
                >
                  No, cancel
                </Button>
              </div>
            </div>

            {showError && (
              <Alert color="failure" className="mt-12">
                <span>
                  <span className="font-medium">Error!</span> While deleting{" "}
                  {entity}
                </span>
              </Alert>
            )}
          </ModalUI.Body>
        </ModalUI>
      )}
    </>
  );
}
