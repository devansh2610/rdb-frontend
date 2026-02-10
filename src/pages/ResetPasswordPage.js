import React, { useState, useRef } from "react";
import {
  Label,
  TextInput,
  Spinner,
  Button,
  Alert,
} from "flowbite-react";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";
import AuthorizationPage from "./AuthorizationPage";
import { useNavigate } from "react-router-dom";

const ResetPasswordPage = () => {
  const { resetPassword } = useAuth();
  const [showValidate, setShowValidate] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const pathname = window.location.pathname;
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
      delete modifiedData["confirm_password"];

      setLoading(true); // to avoid multiple submission
      setLoading(false);

      const response = await resetPassword(data, pathname);

      if (response.status == 200) {
        setShowValidate(true);
        reset();
        navigate(
          (() => {
            return "/";
          })()
        );
      }

    } catch (err) {
      if (!err?.response) {
        setSubmitError("No response from server");
      } else if (err.response?.status == 400) {
        setSubmitError("Missing password");
      } else if (err.response?.status == 401) {
        setSubmitError("User unauthorized, please recheck credentials");
      } else {
        setSubmitError("Unable to change password, please try again");
      }
      setLoading(false);
    }
  };

  const onError = async () => {
    console.log("Func: onError, FIle: SignupPage.js");
  };

  // console.log(errors);

  return (
    <AuthorizationPage>
      <div className="flex flex-col justify-center items-center bg-white w-96 py-8 rounded-lg shadow-lg">
        <img src={logo} className="w-24"></img>
        <h1 className="mb-8 mt-6 font-medium">
          Update your password
        </h1>
        <form
          className="flex flex-col gap-4 w-4/5"
          onSubmit={handleSubmit(onSubmit, onError)}
        >
          {/* Password */}
          <div>
            <div className="mb-2 block">
              <Label htmlFor="password1" value="Your New password" />
            </div>
            <TextInput
              id="password1"
              type="password"
              color={errors.password ? "failure" : null}
              helperText={
                errors.password && errors.password.type === "required"
                  ? "Password is required"
                  : errors.password && errors.password.type === "minLength"
                  ? "Password should be at-least 8 characters long"
                  : null
              }
              required={true}
              {...register("password", {
                required: true,
                minLength: 1,
              })}
            />
          </div>

          {/* Confirm Password */}
          <div>
            <div className="mb-2 block">
              <Label htmlFor="password2" value="Confirm password" />
            </div>
            <TextInput
              id="password2"
              type="password"
              color={errors.confirm_password ? "failure" : null}
              helperText={
                errors.confirm_password &&
                errors.confirm_password.type === "required"
                  ? "Please enter confirmation password"
                  : errors.confirm_password &&
                    errors.confirm_password.type === "validate"
                  ? errors.confirm_password.message
                  : null
              }
              required={true}
              {...register("confirm_password", {
                required: true,
                validate: (val) => {
                  if (watch("password") !== val) {
                    return "Passwords do not match"; // this return value is the message
                  }
                },
                minLength: 8,
              })}
            />
          </div>

          <Button type="submit" disabled={loading} className="mt-4">
            {loading ? (
              <>
                <Spinner aria-label="Left-aligned spinner example" size="xs" />
                <span className="pl-3">Setting New Password</span>
              </>
            ) : (
              "Change Password"
            )}
          </Button>

          {/* Error handling */}
          {submitError !== "" ? (
            <Alert color="failure">{submitError}</Alert>
          ) : null}
        </form>
      </div>
    </AuthorizationPage>
  );
};

export default ResetPasswordPage;
