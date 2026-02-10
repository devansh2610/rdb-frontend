import React, { useState, useEffect } from "react";
import { updateUserName, updatePhoneNumber } from "../../../api/profileService";
import { useAuth } from "../../../context/AuthContext";

const PersonalInfoTab = ({ userInfo }) => {
  const { fetchProfile } = useAuth();
  const splitName = (fullName) => {
    if (!fullName) return { firstName: "", lastName: "" };
    const parts = fullName.trim().split(" ");
    const firstName = parts[0] || "";
    const lastName = parts.slice(1).join(" ") || "";
    return { firstName, lastName };
  };

  const { firstName, lastName } = splitName(userInfo?.name);
  const [phoneNumber, setPhoneNumber] = useState(userInfo?.phone || "");
  const [formData, setFormData] = useState({
    firstName: firstName,
    lastName: lastName,
    phone: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Update formData if userInfo changes
  useEffect(() => {
    const { firstName, lastName } = splitName(userInfo?.name);
    setFormData((prev) => ({
      ...prev,
      firstName: firstName,
      lastName: lastName,
    }));
  }, [userInfo]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Validation function for name fields - only allows single letters
  const validateNameInput = (value) => {
    // Only allow letters (removed dots)
    return /^[A-Za-z]+$/.test(value);
  };

  const handleNameInputChange = (e) => {
    const { name, value } = e.target;

    // Validate input
    if (value === "" || validateNameInput(value)) {
      setFormData({
        ...formData,
        [name]: value,
      });

      // Clear error if it exists
      if (formErrors[name]) {
        setFormErrors({
          ...formErrors,
          [name]: null,
        });
      }
    } else {
      // Set error message
      setFormErrors({
        ...formErrors,
        [name]:
          "Only letters are allowed (no dots, spaces or special characters)",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitSuccess(false);

    // Get actual values (either from form or from existing data)
    const firstNameValue = formData.firstName;
    const lastNameValue = formData.lastName;

    console.log("Submitting profile update:", {
      firstName: firstNameValue,
      lastName: lastNameValue,
    });

    // Validate form
    const errors = {};
    if (!firstNameValue.trim()) {
      errors.firstName = "First name is required";
    } else if (!validateNameInput(firstNameValue)) {
      errors.firstName =
        "Only letters are allowed (no dots, spaces or special characters)";
    }

    if (lastNameValue.trim() && !validateNameInput(lastNameValue)) {
      errors.lastName =
        "Only letters are allowed (no dots, spaces or special characters)";
    }

    /* Phone validation temporarily commented out as it's not used
    if (!phoneNumber) {
      errors.phone = "Phone number is required";
    } else if (!isPossiblePhoneNumber(phoneNumber)) {
      errors.phone = "Please enter a valid phone number";
    }
    */

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setIsSubmitting(false);
      return;
    }

    try {
      // Call the real API with the correct parameter names
      await updateUserName(firstNameValue, lastNameValue);

      // Update phone number if changed
      if (phoneNumber && phoneNumber !== userInfo?.phone) {
        try {
          await updatePhoneNumber(phoneNumber);
        } catch (phoneError) {
          console.error("Error updating phone number:", phoneError);
          // Don't fail the whole operation if phone update fails
          setFormErrors({
            submit:
              "Profile updated but phone number update failed. Please try again.",
          });
        }
      }

      // Immediately fetch the updated profile to update UI
      await fetchProfile();

      setSubmitSuccess(true);
      setFormErrors({});
    } catch (error) {
      console.error("Error updating profile:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setFormErrors({
          submit: error.response.data.message,
        });
      } else {
        setFormErrors({
          submit: "Failed to update profile. Please try again.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fadeIn" style={{ minHeight: "70vh" }}>
      <h2
        className="text-lg font-medium mb-6"
        style={{
          fontFamily: "DM Sans, sans-serif",
          color: "#BDE958",
          borderBottom: "2px solid #BDE958",
          paddingBottom: "8px",
          display: "inline-block",
        }}
      >
        Personal Information
      </h2>

      {submitSuccess && (
        <div
          className="border px-4 py-3 rounded relative mb-4"
          style={{
            backgroundColor: "rgba(189, 233, 88, 0.2)",
            borderColor: "#BDE958",
            color: "#BDE958",
          }}
        >
          <span className="block sm:inline">Profile updated successfully!</span>
        </div>
      )}

      {formErrors.submit && (
        <div
          className="border px-4 py-3 rounded relative mb-4"
          style={{
            backgroundColor: "rgba(255, 68, 68, 0.2)",
            borderColor: "#ff4444",
            color: "#ff4444",
          }}
        >
          <span className="block sm:inline">{formErrors.submit}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6">
        <div className="space-y-5 max-w-2xl">
          {/* First Name Field */}
          <div>
            <label
              className="block text-sm font-normal mb-2"
              style={{ fontFamily: "DM Sans, sans-serif", color: "#b8b8b8" }}
            >
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              className="w-full px-4 py-2.5 rounded-md border focus:outline-none focus:ring-1"
              style={{
                borderColor: formErrors.firstName ? "#ff4444" : "#3a3a3a",
                backgroundColor: "#2d2d2d",
                color: "#ffffff",
                fontFamily: "DM Sans, sans-serif",
                focusRingColor: "#BDE958",
              }}
              placeholder="Ganesh"
              value={formData.firstName}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "" || /^[A-Za-z]+$/.test(value)) {
                  setFormData({
                    ...formData,
                    firstName: value,
                  });
                  if (formErrors.firstName) {
                    setFormErrors({
                      ...formErrors,
                      firstName: null,
                    });
                  }
                } else {
                  setFormErrors({
                    ...formErrors,
                    firstName: "Only letters are allowed",
                  });
                }
              }}
            />
            {formErrors.firstName && (
              <p
                className="text-xs mt-1"
                style={{ color: "#ff4444", fontFamily: "DM Sans, sans-serif" }}
              >
                {formErrors.firstName}
              </p>
            )}
          </div>

          {/* Last Name Field */}
          <div>
            <label
              className="block text-sm font-normal mb-2"
              style={{ fontFamily: "DM Sans, sans-serif", color: "#b8b8b8" }}
            >
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              className="w-full px-4 py-2.5 rounded-md border focus:outline-none focus:ring-1"
              style={{
                borderColor: formErrors.lastName ? "#ff4444" : "#3a3a3a",
                backgroundColor: "#2d2d2d",
                color: "#ffffff",
                fontFamily: "DM Sans, sans-serif",
                focusRingColor: "#BDE958",
              }}
              placeholder="Bagler"
              value={formData.lastName}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "" || /^[A-Za-z]+$/.test(value)) {
                  setFormData({
                    ...formData,
                    lastName: value,
                  });
                  if (formErrors.lastName) {
                    setFormErrors({
                      ...formErrors,
                      lastName: null,
                    });
                  }
                } else {
                  setFormErrors({
                    ...formErrors,
                    lastName: "Only letters are allowed",
                  });
                }
              }}
            />
            {formErrors.lastName && (
              <p
                className="text-xs mt-1"
                style={{ color: "#ff4444", fontFamily: "DM Sans, sans-serif" }}
              >
                {formErrors.lastName}
              </p>
            )}
          </div>

          {/* Contact Number Field */}
          <div>
            <label
              className="block text-sm font-normal mb-2"
              style={{ fontFamily: "DM Sans, sans-serif", color: "#b8b8b8" }}
            >
              Contact Number
            </label>
            <input
              type="tel"
              name="phone"
              className="w-full px-4 py-2.5 rounded-md border focus:outline-none focus:ring-1"
              style={{
                borderColor: "#3a3a3a",
                backgroundColor: "#2d2d2d",
                color: "#ffffff",
                fontFamily: "DM Sans, sans-serif",
              }}
              placeholder="+91 7383XXXXXX"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>

          {/* Email Field */}
          <div>
            <label
              className="block text-sm font-normal mb-2"
              style={{ fontFamily: "DM Sans, sans-serif", color: "#b8b8b8" }}
            >
              E-Mail
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#888"
                  strokeWidth="2"
                >
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M3 7l9 6 9-6" />
                </svg>
              </div>
              <input
                type="email"
                className="w-full pl-12 pr-4 py-2.5 rounded-md border"
                style={{
                  borderColor: "#3a3a3a",
                  backgroundColor: "#2d2d2d",
                  color: "#888",
                  fontFamily: "DM Sans, sans-serif",
                  cursor: "not-allowed",
                }}
                value={userInfo?.email || ""}
                readOnly
                disabled
              />
            </div>
            <span
              className="text-xs mt-1 inline-block"
              style={{ color: "#666", fontFamily: "DM Sans, sans-serif" }}
            >
              E-Mail cannot be changed
            </span>
          </div>

          {/* Save Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-8 py-2.5 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isSubmitting ? "opacity-70 cursor-not-allowed" : ""
              }`}
              style={{
                backgroundColor: "#BDE958",
                color: "#000000",
                fontFamily: "DM Sans, sans-serif",
                fontWeight: "500",
                fontSize: "15px",
              }}
              onMouseEnter={(e) =>
                !isSubmitting && (e.target.style.opacity = "0.85")
              }
              onMouseLeave={(e) =>
                !isSubmitting && (e.target.style.opacity = "1")
              }
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PersonalInfoTab;
