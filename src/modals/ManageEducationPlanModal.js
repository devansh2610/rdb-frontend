import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Modal as ModalUI,
  Button,
  Alert,
  Label,
  Spinner,
} from "flowbite-react";
import axios from "../api/axios";

function epochToDateString(epoch) {
  // to convert date into YYYY-MM-DD format based on epoch
  const dateObj = new Date(epoch);
  const year = dateObj.getFullYear();
  const month = (dateObj.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-based, so we add 1
  const day = dateObj.getDate().toString().padStart(2, "0");
  return year + "-" + month + "-" + day;
}

function dateStringToEpoch(dateString) {
  const dateParts = dateString.split("-");
  const year = parseInt(dateParts[0]);
  const month = parseInt(dateParts[1]) - 1;
  const day = parseInt(dateParts[2]);
  const dateObj = new Date(year, month, day);
  return dateObj.getTime();
}

// entity is a string
export default function ManageEducationPlanModal({
  type,
  userInfo,
  endDate,
  handleUpdates,
}) {
  // VARIABLES
  const { getToken, logout } = useAuth();

  // STATE VARIABLES
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [date, setDate] = useState(epochToDateString(endDate)); // string containing date in YYYY-MM-DD format

  // MAPPING
  const typeContentMap = {
    create: {
      button: "Make Educational",
      submitButtonStatic: "Create",
      submitButtonLoading: "Creating",
      label: "Select Date (MM-DD-YYYY)",
      heading: "Create Educational Plan for User",
      message: "Please select the date which you want to set for the user",
    },
    update: {
      button: "Update Educational",
      submitButtonStatic: "Update",
      submitButtonLoading: "Updating",
      label: "Update Date (MM-DD-YYYY)",
      heading: "Update and Delete the Educational Plan",
      message:
        "You can either update the end date for the educational plan, or delete the user's access to educational plan",
    },
  };

  // FUNCTIONS
  const handleSubmission = async (deletePlan = false) => {
    // handles submission on clicking button
    setLoading(true);

    let data;
    if (deletePlan) {
      data = {
        educationalAccount: false,
      };
    } else {
      data = {
        educationalAccount: true,
        endDate: dateStringToEpoch(date),
      };
    }

    const header = {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    };

    const catchFunc = async (error) => {
      if (error.response.status === 401) {
        logout();
      } else {
        setShowError(true);
        console.log(error);
      }
    };

    try {
      // create data from state variables
      const response = await axios
        .patch(`/users/${userInfo._id}`, data, header)
        .catch(catchFunc);

      // on sucessful submission, close modal, carry out updates
      if (response.status == 200) {
        setShowModal(false);
        setShowError(false);
        handleUpdates();
      }
    } catch {
      console.log("ERROR: While managing educational plan");
    }
    setLoading(false);
  };

  return (
    <>
      {userInfo.accessLevel === 3 ? (
        <Button disabled={true} color="gray" className="w-44">
          Already Educational
        </Button>
      ) : (
        <Button
          size="sm"
          onClick={() => {
            setShowModal(true);
          }}
          // gradientDuoTone="cyanToBlue"
          // outline={(type == 'update')}
          // className="w-44"
          // color={"blue"}
          className={`w-44 
            ${
              type == "update"
                ? "!bg-opacity-20 !border-2 !border-blue-600 !text-blue-600"
                : ""
            }
          `}
        >
          {typeContentMap[type].button}
        </Button>
      )}

      {showModal && (
        <ModalUI
          dismissible={true}
          show={showModal}
          className="backdrop-blur-md"
          onClose={() => {
            setShowModal(false);
            setShowError(false);
          }}
        >
          <ModalUI.Header>{typeContentMap[type].heading}</ModalUI.Header>
          <ModalUI.Body>
            <div className="flex flex-col gap-4">
              <p>{typeContentMap[type].message}</p>
              <Label
                htmlFor="date"
                value={typeContentMap[type].label}
                className="-mb-2"
              />
              {endDate == null ? (
                <input
                  type="date"
                  id="date"
                  required={true}
                  onChange={(event) => setDate(event.target.value)}
                />
              ) : (
                <input
                  type="date"
                  id="date"
                  value={date}
                  required={true}
                  onChange={(event) => setDate(event.target.value)}
                />
              )}

              {showError && (
                <Alert color="failure">
                  <span>
                    <span className="font-medium">Error!</span> While submission
                  </span>
                </Alert>
              )}
            </div>
          </ModalUI.Body>
          <ModalUI.Footer>
            <Button
              onClick={() => {
                handleSubmission();
                setLoading(true);
              }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner
                    aria-label="Left-aligned spinner example"
                    size="xs"
                  />
                  <span className="pl-3">
                    {typeContentMap[type].submitButtonStatic}
                  </span>
                </>
              ) : (
                <>{typeContentMap[type].submitButtonStatic}</>
              )}
            </Button>
            {type == "update" && (
              <Button
                color="failure"
                onClick={() => {
                  handleSubmission(true);
                  setLoading(true);
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
                  <>Delete Plan</>
                )}
              </Button>
            )}
          </ModalUI.Footer>
        </ModalUI>
      )}
    </>
  );
}
