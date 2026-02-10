import React, { useState, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import {
  Label,
  TextInput,
  Spinner,
  Checkbox,
  Button,
  Alert,
} from "flowbite-react";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";
import { Link } from "react-router-dom";
import AuthorizationPage from "./AuthorizationPage";
import Validate from "../components/Validate";
import logo_2 from "../assets/logo_2.png";

const ForgotPage = () => {
  const { forgot } = useAuth();
  const [showValidate, setShowValidate] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const recaptchaRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const modifiedData = { ...data };

      setLoading(true); // to avoid multiple submission
      // handle captcha
      const captchaToken = recaptchaRef.current.getValue();
      recaptchaRef.current.reset();
      const response = await forgot(modifiedData, captchaToken);
      setLoading(false);

      if (response.status == 200) {
        setShowValidate(true);
        reset();
      }
    } catch (err) {
      if (!err?.response) {
        setSubmitError("No response from server");
      } else if (err.response?.status == 400) {
        setSubmitError(
          "Missing email or reCaptcha has not been completed"
        );
      } else {
        setSubmitError("Trouble processing request, please try again");
      }
      setLoading(false);
    }
  };

  const onError = async () => {
    // console.log("Func: onError, File: ForgotPage.js");
  };

  // console.log(errors);

  return (
    <AuthorizationPage>
      <div className="flex flex-col justify-center items-center bg-white dark:bg-gray-800 w-96 py-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center mb-10">
          <img src={logo_2} className="h-11 mr-3" alt="Logo" />
          <span className="self-center whitespace-nowrap text-2xl font-semibold">
            <span style={{ color: "#04c389" }}>Foodo</span>
            <span className="dark:text-[#d9d9d9]" style={{ color: "#313131" }}>scope</span>
            <span style={{ color: "#04c389" }}>.</span>
          </span>
        </div>
        <h1 className="mb-4 font-semibold text-xl text-center text-gray-800 dark:text-white">
          Forgot Password
        </h1>
        <div className="w-20 h-1 bg-blue-500 rounded mb-6"></div>
        <form
          className="flex flex-col gap-4 w-4/5"
          onSubmit={handleSubmit(onSubmit, onError)}
        >
          {/* Error handling */}
          {submitError !== "" ? (
            <Alert color="failure">{submitError}</Alert>
          ) : null}

          {showValidate && <Validate email={email} />}

          {/* Email */}
          <div>
            <div className="mb-2 block">
              <Label htmlFor="email1" value="Your email" />
            </div>
            <TextInput
              id="email1"
              type="email"
              color={errors.email ? "failure" : null}
              placeholder="Enter valid email address"
              helperText={
                errors.email && errors.email.type === "required"
                  ? "Email is required"
                  : errors.email && errors.email.type === "pattern"
                  ? "Enter valid email ID"
                  : null
              }
              required={true}
              {...register("email", {
                required: true,
                pattern: /^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/,
              })}
              onChange={ (event) => setEmail(event.target.value) }
            />
          </div>

          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey="6LeP0IkpAAAAAGXRJvBuiv86G5NP_FkstoWWY35C"
          />

          <Button 
            type="submit" 
            disabled={loading} 
            className="mt-4 bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            {loading ? (
              <>
                <Spinner aria-label="Left-aligned spinner example" size="xs" />
                <span className="pl-3">Submitting</span>
              </>
            ) : (
              "Submit"
            )}
          </Button>
        </form>
      </div>
    </AuthorizationPage>
  );
};

export default ForgotPage;
