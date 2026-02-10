import { createContext, useState, useContext, useEffect, useCallback } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import { changePassword, verifyPassword as verifyPasswordApi, deleteAccount as deleteAccountApi } from "../api/profileService";

// Custom event for token updates
const TOKEN_UPDATE_EVENT = "token_update";
const PROFILE_UPDATE_EVENT = "profile_update";

const AuthContext = createContext({});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(Date.now());

  // Create a token update event emitter
  const emitTokenUpdate = useCallback((data) => {
    // Emit the event to the window for any components listening
    const event = new CustomEvent(TOKEN_UPDATE_EVENT, { detail: data });
    window.dispatchEvent(event);
    
    // Use a more targeted approach instead of triggering storage events
    // This prevents page refreshes while still allowing updates
    try {
      // Store current tokens in a separate item just for communication
      localStorage.setItem("current_tokens", data.tokens.toString());
    } catch (error) {
      console.error("Error updating token value:", error);
    }
  }, []);

  async function login(data, captchaToken) {
    data = { ...data, captchaToken };
    const response = await axios.post("/login", JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });

    storeToken(response.data.token);
    const userProfile = await fetchProfile();
    
    // If user is accessLevel 0 or 1, set a flag to redirect to admin panel
    if (userProfile && (userProfile.accessLevel === 0 || userProfile.accessLevel === 1)) {
      localStorage.setItem("redirectToAdmin", "true");
    }
    
    return response;
  }

  function googleLogin() {
    // Redirect to the backend's Google OAuth login endpoint
    window.location.href = "https://api.foodoscope.com/login/google";
  }

  function googleSignup() {
    // Redirect to the backend's Google OAuth signup endpoint
    window.location.href = "https://api.foodoscope.com/register/google";
  }

  async function handleOAuthCallback(token) {
    if (token) {
      storeToken(token);
      const userProfile = await fetchProfile();
      
      // If user is accessLevel 0 or 1, set a flag to redirect to admin panel
      if (userProfile && (userProfile.accessLevel === 0 || userProfile.accessLevel === 1)) {
        localStorage.setItem("redirectToAdmin", "true");
      }
      return true;
    }
    return false;
  }

  async function signup(data, captchaToken) {
    data = { 
      ...data, 
      captchaToken,
      // Only include first name and last name
      firstname: data.firstName,
      lastname: data.lastName
    };
    const response = await axios.post("/register", JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
    return response;
  }

  async function signupPassword(data, pathname) {
    console.log('the path for singup is ', pathname);
    const response = await axios.post(`verify/${pathname}`, JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
    return response;
  }

  async function verifyEmail(token) {
    try {
      console.log(`Calling verify endpoint with token: ${token}`);
      
      // Note: The backend decodes the token from base64, so we don't need to do anything special here
      // The token in the URL should already be in the correct format
      
      // Make request to the verification endpoint
      const response = await axios.post(`verify/${token}`, {}, {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        }
      });
      
      console.log("Verification API response:", response);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error verifying email:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      
      const status = error.response?.status;
      let errorMessage = error.response?.data?.error || "Failed to verify your email. Please try again.";
      
      if (status === 404) {
        errorMessage = "Verification link not found. It may have expired.";
      } else if (status === 400) {
        errorMessage = "Invalid verification token. Please request a new verification email.";
      } else if (status === 401 || status === 403) {
        // According to the backend code, 401 is returned when verifyUser(token) fails
        errorMessage = "Unauthorized access. The verification link may have expired or is invalid.";
      }
      
      return { success: false, message: errorMessage };
    }
  }

  async function forgot(data, captchaToken) {
    data = { ...data, captchaToken };
    const response = await axios.post("/profile/reset", JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
    return response;
  }

  function storeToken(token) {
    localStorage.setItem("jwtToken", token);
  }

  function getToken() {
    const returnVal = localStorage.getItem("jwtToken");
    return returnVal ? returnVal : 0;
  }

  async function fetchProfile() {
    // Skip API call if no token exists (user is not logged in)
    const token = getToken();
    if (!token || token === 0) {
      return null;
    }
    
    try {
      const response = await axios.get("/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response?.data?.user) {
        const newProfile = response.data.user;
        const oldProfile = JSON.parse(localStorage.getItem("userInfo")) || {};
        
        // Store the updated profile
        localStorage.setItem("userInfo", JSON.stringify(newProfile));
        
        // Check if tokens have changed
        if (newProfile.tokens !== oldProfile.tokens) {
          // Emit token update event
          emitTokenUpdate({ 
            tokens: newProfile.tokens,
            previousTokens: oldProfile.tokens || 0
          });
        }
        
        setProfile(prevProfile => {
          const hasChanged = !prevProfile || 
            prevProfile.tokens !== newProfile.tokens ||
            JSON.stringify(prevProfile) !== JSON.stringify(newProfile);
          
          if (hasChanged) {
            setLastUpdated(Date.now());
            // Emit profile update event
            const profileEvent = new CustomEvent(PROFILE_UPDATE_EVENT, { detail: newProfile });
            window.dispatchEvent(profileEvent);
            return newProfile;
          }
          return prevProfile;
        });
        
        return newProfile;
      }
      return null;
    } catch (error) {
      if (error.response?.status === 401) {
        console.log("Unauthorized");
        logout();
      }
      return null;
    }
  }

  async function authenticateUser() {
    try {
      const response = await axios.get("/profile", {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      return "user" in response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        logout();
      }
      return false;
    }
  }

  function getProfile() {
    // Only return what we already have in state or from localStorage
    // but don't update state during render
    if (profile) return profile;
    const storedProfile = JSON.parse(localStorage.getItem("userInfo"));
    return storedProfile || null;
  }

  function logout() {
    // Clear the profile state first
    setProfile(null);
    
    // Then clear localStorage items
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("current_tokens");
    
    // Update lastUpdated timestamp to trigger re-renders
    setLastUpdated(Date.now());
    
    // Force a state update to any listening components
    const event = new CustomEvent(TOKEN_UPDATE_EVENT, { 
      detail: { tokens: 0, previousTokens: profile?.tokens || 0, loggedOut: true } 
    });
    window.dispatchEvent(event);
    
    // Finally navigate to home page
    navigate("/");
  }

  async function resetPassword(data, pathname) {
    const response = await axios.post(`/profile/${pathname}`, JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
    return response;
  }

  async function updatePassword(currentPassword, newPassword) {
    try {
      const response = await changePassword(currentPassword, newPassword);
      return { success: true, data: response };
    } catch (error) {
      console.error("Error updating password:", error);
      return { 
        success: false, 
        message: error.response?.data?.message || "Failed to update password. Please try again." 
      };
    }
  }

  async function verifyPassword({ password }) {
    try {
      const response = await verifyPasswordApi(password);
      return { success: true, data: response };
    } catch (error) {
      console.error("Error verifying password:", error);
      return { 
        success: false, 
        message: error.response?.data?.message || "Failed to verify password. Please try again." 
      };
    }
  }

  async function deleteAccount(password) {
    try {
      const response = await deleteAccountApi(password);
      // If deletion is successful, log the user out
      logout();
      return { success: true, data: response };
    } catch (error) {
      console.error("Error deleting account:", error);
      return { 
        success: false, 
        message: error.response?.data?.message || "Failed to delete account. Please try again." 
      };
    }
  }

  // Load profile from localStorage on mount
  useEffect(() => {
    if (!profile) {
      const storedProfile = JSON.parse(localStorage.getItem("userInfo"));
      if (storedProfile) {
        setProfile(storedProfile);
      }
    }
  }, []);

  useEffect(() => {
    // Only attempt to fetch profile if there's a token (user is logged in)
    const token = getToken();
    if (token && token !== 0) {
      fetchProfile();
      // No polling interval - just fetch once
    }
  }, []);

  let value = {
    getToken,
    getProfile,
    fetchProfile,
    authenticateUser,
    login,
    logout,
    signup,
    signupPassword,
    resetPassword,
    updatePassword,
    verifyPassword,
    deleteAccount,
    forgot,
    verifyEmail,
    lastUpdated,
    TOKEN_UPDATE_EVENT,
    PROFILE_UPDATE_EVENT,
    googleLogin,
    googleSignup,
    handleOAuthCallback
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
