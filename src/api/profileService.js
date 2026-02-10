import axios from "./axios";

// Helper function to get token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem("jwtToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Change password API service
export const changePassword = async (currentPassword, newPassword) => {
  try {
    console.log("Sending password change with:", {
      currentPassword,
      newPassword,
    });
    const response = await axios.post(
      "/profile/changePassword",
      {
        currentPassword,
        newPassword,
      },
      {
        headers: {
          ...getAuthHeader(),
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Password change error:", error);
    throw error;
  }
};

// Verify password for security-sensitive operations
export const verifyPassword = async (password) => {
  try {
    console.log("Verifying password for security check");
    const response = await axios.post(
      "/profile/verifyPassword",
      {
        password,
      },
      {
        headers: {
          ...getAuthHeader(),
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Password verification error:", error);
    throw error;
  }
};

// Delete account API service
export const deleteAccount = async (password) => {
  try {
    console.log("Sending account deletion request");
    // Get the user's profile to retrieve the email
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const email = userInfo?.email;

    if (!email) {
      throw new Error("User email not found");
    }

    const response = await axios.post(
      "/profile/deleteUser",
      {
        email,
        password,
      },
      {
        headers: {
          ...getAuthHeader(),
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Account deletion error:", error);
    throw error;
  }
};

// Update user name API service
export const updateUserName = async (firstName, lastName) => {
  try {
    console.log("Sending name update with:", { firstName, lastName });
    const response = await axios.post(
      "/profile/setUserName",
      {
        firstName,
        lastName,
      },
      {
        headers: {
          ...getAuthHeader(),
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update phone number API service
export const updatePhoneNumber = async (phoneNumber) => {
  try {
    console.log("Sending phone number update with:", { phoneNumber });
    const response = await axios.post(
      "/profile/setPhoneNumber",
      {
        phoneNumber,
      },
      {
        headers: {
          ...getAuthHeader(),
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Phone number update error:", error);
    throw error;
  }
};

// Send contact form API service
export const submitContactForm = async (fullname, email, message) => {
  try {
    const response = await axios.post(
      "/contact",
      {
        fullname,
        email,
        message,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Submit developer contact form API service
export const submitDeveloperContact = async (
  name,
  email,
  organisationName,
  contactNumber,
  query
) => {
  try {
    const response = await axios.post(
      "/developerContact",
      {
        name,
        email,
        organisationName,
        contactNumber,
        query,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Set profile image API service
export const setProfileImage = async (imageUrl) => {
  try {
    console.log("Setting profile image with URL:", imageUrl);
    const response = await axios.post(
      "/profile/setImage",
      {
        imageUrl,
      },
      {
        headers: {
          ...getAuthHeader(),
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Profile image update error:", error);
    throw error;
  }
};

// Remove profile image API service
export const removeProfileImage = async () => {
  try {
    console.log("Removing profile image");
    const response = await axios.post(
      "/profile/removeImage",
      {},
      {
        headers: {
          ...getAuthHeader(),
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Profile image removal error:", error);
    throw error;
  }
};

export const createOrder = async (amount) => {
  const token = localStorage.getItem("jwtToken");
  const response = await axios.post(
    "/payments/create-order",
    { amount },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data.data;
};
