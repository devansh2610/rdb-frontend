import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Sidebar, Spinner } from "flowbite-react";
import { Modal as ModalUI, Button, Alert } from "flowbite-react";
import axios from "../api/axios";
import example_csv_format from "../assets/example_csv_format.png";

function dateStringToEpoch(dateString) {
  const dateParts = dateString.split("/");
  const year = parseInt(dateParts[0]);
  const month = parseInt(dateParts[1]) - 1;
  const day = parseInt(dateParts[2]);
  const dateObj = new Date(year, month, day);
  return dateObj.getTime();
}

export default function CSVUploadModal({ type, callToAction, handleUpdates }) {
  // This modal handles CSV upload to perform following functions
  // Addition
  // 1 =  Add users to education plan
  // Deletion
  // -1 = Delete users who are already in the educational plan from the educational plan

  // VARIABLES
  const { getToken, logout } = useAuth();
  const inputRef = React.useRef(null);

  // STATE VARIABLES
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [readSuccess, setReadSuccess] = useState(false);
  const [data, setData] = useState({});
  const [dragActive, setDragActive] = React.useState(false);

  // state of the 'feedback message' (eg. error message, success message, shown to the user)
  // 0 -> don't show any message
  // 1, 2, 3 .. -> show success message with given code
  // -1, -2, -3 .. -> show error message with give code
  const [feedbackCode, setFeedbackCode] = useState(0);
  const feedbackCodeMap = {
    "-1": "Unable to process the files",
    "-2": "Unable to upload",
  };

  // FUNCTIONS
  const parseRawInput = function (fields, type) {
    let obj = {};
    if (type == 1) {
      // Assuming that the input date is in YYYY/DD/MM format
      console.log(fields[1]);
      obj = {
        userInfo: fields[0].trim(),
        educationalAccount: true,
        endDate: dateStringToEpoch(fields[1].trim()),
      };
    } else if (type == -1) {
      obj = {
        userInfo: fields[0].trim(),
        educationalAccount: false,
      };
    } 

    return obj;
  };


  const handleFiles = function (file) {
    setLoading(true);

    // Create a new FileReader object to read the file and read it as text
    const reader = new FileReader();
    reader.readAsText(file);

    // Set up an event listener to detect when the FileReader has finished reading the file
    reader.addEventListener("load", function (e) {
      const text = e.target.result;
      const rows = text.split("\n"); // split file into array of rows
      const listOfUsers = [];

      rows.forEach(function (row) {
        const fields = row.split(",");
        if (fields[0] == "") return; // skip empty rows
        listOfUsers.push(parseRawInput(fields, type));
      });

      const finalData = { users: listOfUsers };
      console.log(finalData);
      setData(finalData);
    });

    setReadSuccess(true);
    setFeedbackCode(0);
    setLoading(false);
  };


  // handle drag events
  const handleDrag = function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // triggers when file is dropped
  const handleDrop = function (e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files[0]);
    }
  };

  // triggers when file is selected with click
  const handleChange = function (e) {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files[0]);
    }
  };

  // triggers the input when the button is clicked
  const onButtonClick = () => {
    inputRef.current.click();
  };


  const handleSubmission = async (type) => {
    // handles submission on clicking button
    setLoading(true);

    const header = {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    };

    const catchFunc = async (error) => {
      if (error.response.status === 401) {
        logout();
      } else {
        setFeedbackCode(-1);
        console.log(error);
      }
    };

    try {
      // create data from state variables
      const response = await axios
        .put('/users/', data, header)
        .catch(catchFunc);

      // on sucessful submission, close modal, carry out updates
      if (response.status == 200) {
        setShowModal(false);
        setFeedbackCode(0);
        handleUpdates();
      }
    } catch {
      console.log("ERROR: While using CSV");
    }
    setLoading(false);
  };

  return (
    <>
      {/* TODO make solution for this for mobile version */}
      <Sidebar.Item
        className="hover:cursor-pointer"
        onClick={() => {
          // Reseting all the values
          setShowModal(true);
        }}
      >
        <span className="text-md">{callToAction}</span>
      </Sidebar.Item>

      {showModal && (
        <ModalUI
          show={showModal}
          size="3xl"
          onClose={() => {
            // handleUpdates();
            setShowModal(false);
            setFeedbackCode(0);
            setLoading(false);
            setReadSuccess(false);
          }}
          className="backdrop-blur-md"
        >
          <ModalUI.Header>{callToAction}</ModalUI.Header>
          <ModalUI.Body>
            <div className="flex flex-col md:flex-row pt-6 justify-between items-center ml-4">
              <p className="text-slate-700 dark:text-gray-200 w-full md:w-6/12">
                <ul class="list-disc">
                  <li>
                    If a date input is required, remember to enter it in a{" "}
                    <b>YYYY/MM/DD </b>
                    format
                  </li>
                  <li>
                    Make sure that your spread sheet layout is in this format in
                    the image.
                  </li>
                  <li>
                    Afterwards, export the file in .csv format image. Any other
                    format will most likely generate an error.
                  </li>
                  <li>
                    Refresh the page after success
                  </li>
                </ul>
              </p>
              <img
                className="outline outline-1 outline-slate-600 rounded-md"
                src={example_csv_format}
              />
            </div>

            {/* {showError && (
              <Alert color="failure" className="mt-12">
                <span>
                  <span className="font-medium">Error!</span> While creating API
                  Key
                </span>
              </Alert>
            )} */}
            <br />
            <form
              onDragEnter={handleDrag}
              onSubmit={(e) => e.preventDefault()}
              className="w-full h-32 flex flex-col justify-center items-center outline-2 outline-dashed rounded-md outline-slate-400"
            >
              <input
                ref={inputRef}
                type="file"
                accept="csv"
                id="input-file-upload"
                className="hidden"
                onChange={handleChange}
              />
              <label
                htmlFor="input-file-upload"
                className={`h-full w-full flex flex-col justify-center items-center ${
                  readSuccess && "bg-green-600/40"
                }`}
                // className={dragActive ? "drag-active" : ""}
              >
                {readSuccess ? (
                  <p className="text-slate-800 dark:text-white text-center">
                    Your file has been successfully read.
                  </p>
                ) : (
                  <div className="flex flex-col items-center">
                    <p className="text-slate-800 dark:text-white">
                      Drag and drop your file here or
                    </p>
                    <button
                      className="font-medium text-blue-500 hover:underline"
                      onClick={onButtonClick}
                    >
                      Upload a file
                    </button>
                  </div>
                )}
              </label>
              {dragActive && (
                <div
                  className="absolute w-full h-full top-0 right-0 bottom-0 left-0"
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                ></div>
              )}
            </form>
          </ModalUI.Body>
          <ModalUI.Footer>
            <Button
              size="sm"
              onClick={() => {
                setLoading(true);
                handleSubmission(type);
              }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner
                    aria-label="Left-aligned spinner example"
                    size="xs"
                  />
                  <span className="pl-3">Uploading</span>
                </>
              ) : (
                <>Upload</>
              )}
            </Button>
          </ModalUI.Footer>
        </ModalUI>
      )}
    </>
  );
}
