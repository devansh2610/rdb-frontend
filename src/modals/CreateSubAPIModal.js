import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Modal as ModalUI,
  Button,
  Alert,
  Label,
  TextInput,
  Spinner,
} from "flowbite-react";
import axios from "../api/axios";

// entity is a string
export default function CreateSubAPIModal({ apiID, handleUpdates }) {
  // STATE VARIABLES
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState(null);
  const [url, setUrl] = useState(null);

  // MISC STATE VARIABLES
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const { getToken, logout } = useAuth();
  const headerObj = {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  };

  // MAPPING
  // create a mapping of name of state and corresponding set functions
  // notice that keys string values of state
  const stateMap = {
    name: {
      state: name,
      setState: setName,
      label: "SubAPI name",
    },
    url: {
      state: url,
      setState: setUrl,
      label: "SubAPI URL",
    },
  };

  // FUNCTIONS
  const resetValues = () => {
    // reset all values on submission
    Object.keys(stateMap).forEach((state) => stateMap[state]["setState"](null));
  };

  const catchFunction = async (error) => {
    if (error.response.status === 401) {
      logout();
    } else {
      setShowError(true);
      console.log(error);
    }
  };

  // HANDLER FUNCTIONS

  const handleSelection = (event, setFunction) => {
    // remove error, if any
    // update event target value
    setShowError(false);
    setFunction(event.target.value);
  };

  const handleSubmission = async (apiID, catchFunction) => {
    // handles submission on clicking button

    try {
      // create data from state variables
      // remove state variables who's values are empty
      const createData = Object.fromEntries(
        Object.entries(stateMap)
          .filter(([state, obj]) => obj["state"])
          .map(([state, obj]) => [state, obj["state"]])
      );
      const response = await axios
        .put(`/apis/${apiID}/subapis`, createData, headerObj)
        .catch(catchFunction);

      // on sucessful submission, close modal, carry out updates
      if (response.status == 200) {
        resetValues();
        setShowModal(false);
        setShowError(false);
        handleUpdates();
      }
    } catch {
      console.log("ERROR: While creating Sub API");
    }

    setLoading(false);
  };

  return (
    <>
      <Button
        onClick={() => {
          setShowModal(true);
        }}
        color="dark"
      >
        Create SubAPI
      </Button>

      {showModal && (
        <ModalUI
          dismissible={true}
          show={showModal}
          className="backdrop-blur-md"
          onClose={() => {
            resetValues();
            setShowModal(false);
            setShowError(false);
          }}
        >
          <ModalUI.Header>Create Sub API</ModalUI.Header>

          <ModalUI.Body>
            <div className="flex flex-col gap-4">
              {Object.keys(stateMap).map((state) => (
                <div key={state}>
                  <Label
                    htmlFor={name}
                    value={stateMap[state]["label"]}
                    className="mb-2"
                  />
                  <TextInput
                    id={name}
                    value={stateMap[state]["state"]}
                    required={true}
                    onChange={(event) =>
                      handleSelection(event, stateMap[state]["setState"])
                    }
                  />
                </div>
              ))}

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
                handleSubmission(apiID, catchFunction);
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
                  <span className="pl-3">Creating</span>
                </>
              ) : (
                <>Create</>
              )}
            </Button>
          </ModalUI.Footer>
        </ModalUI>
      )}
    </>
  );
}
