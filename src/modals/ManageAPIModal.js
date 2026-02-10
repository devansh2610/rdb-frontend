import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Modal from "react-modal";
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
export default function ManageAPIModal({ action, apiID = "", handleUpdates }) {
  // STATE VARIABLES
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [endpointUrl, setEndpointUrl] = useState("");

  // MISC STATE VARIABLES
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [previousInfo, setPreviousInfo] = useState("");
  const { getToken, getProfile, logout } = useAuth();
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
      label: "API name",
    },
    description: {
      state: description,
      setState: setDescription,
      label: "Description",
    },
    imageUrl: {
      state: imageUrl,
      setState: setImageUrl,
      label: "Image URL",
    },
    link: {
      state: endpointUrl,
      setState: setEndpointUrl,
      label: "Link URL",
    }
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

  const handleSubmission = async (action, catchFunction, apiID = "") => {
    // handles submission on clicking button

    try {
      let response;
      if (action == "Create") {
        // create data from state variables
        // remove state variables who's values are empty
        const createData = Object.fromEntries(
          Object.entries(stateMap)
            .filter(([state, obj]) => obj["state"])
            .map(([state, obj]) => [state, obj["state"]])
        );
        response = await axios
          .post("/apis/", createData, headerObj)
          .catch(catchFunction);
      } else if (action == "Edit") {
        // console.log(Object.entries(stateMap).filter(([state, obj]) => obj['state'] != apiData[state]));
        // create data from state variables
        // remove state variables who's values haven't changed
        const editData = Object.fromEntries(
          Object.entries(stateMap)
            .filter(([state, obj]) => obj["state"] != previousInfo[state])
            .map(([state, obj]) => [state, obj["state"]])
        );
        // console.log(editData);
        // console.log(previousInfo);
        response = await axios
          .patch(`/apis/${apiID}`, editData, headerObj)
          .catch(catchFunction);
      } else {
        throw "Invalid input in Manage API Modal";
      }

      // on sucessful submission, close modal, carry out updates
      if (response.status == 200) {
        resetValues();
        setShowModal(false);
        setShowError(false);
        handleUpdates();
      }
    } catch {
      console.log("ERROR: While creating API");
    }

    setLoading(false);
  };

  const handlePopulation = async () => {
    const response = await axios
      .get(`/apis/${apiID}`, headerObj)
      .catch(catchFunction);
    // console.log(response.data.api);
    Object.keys(stateMap).forEach((key) =>
      stateMap[key]["setState"](response.data.api[key])
    );
    setPreviousInfo(response.data.api);
  };

  // USE EFFECT
  useEffect(() => {
    handlePopulation();
  }, []);

  return (
    <>
      <Button
        onClick={() => {
          setShowModal(true);
          handlePopulation();
        }}
        color={action == "Edit" ? "light" : "dark"}
      >
        {action} API
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
          <ModalUI.Header>{action} API</ModalUI.Header>

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
                handleSubmission(action, catchFunction, apiID);
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
                  <span className="pl-3">Sending</span>
                </>
              ) : (
                <>{action}</>
              )}
            </Button>
          </ModalUI.Footer>
        </ModalUI>
      )}
    </>
  );
}
