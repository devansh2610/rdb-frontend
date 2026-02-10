import axios from './axios';

// Helper function to get auth header with JWT token
const getAuthHeader = () => {
  const token = localStorage.getItem("jwtToken");
  if (!token) {
    console.warn("No JWT token found in localStorage");
    return {};
  }
  return { Authorization: `Bearer ${token}` };
};

/**
 * User Management
 */

// Block a user by email
export const blockUser = async (email) => {
  try {
    const response = await axios.patch('/admin/block', { email }, {
      headers: {
        ...getAuthHeader(),
        "Content-Type": "application/json"
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error blocking user:", error);
    throw error;
  }
};

// Unblock a user by email
export const unblockUser = async (email) => {
  try {
    const response = await axios.patch('/admin/unblock', { email }, {
      headers: {
        ...getAuthHeader(),
        "Content-Type": "application/json"
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error unblocking user:", error);
    throw error;
  }
};

// Change user access level
// Access levels: 0 (SuperAdmin), 1 (CRMAdmin), 2 (APIManager), 3 (SupportCoordinator)
export const changeUserAccessLevel = async (email, newAccessLevel) => {
  try {
    const response = await axios.patch('/admin/change-access-level', {
      email,
      newAccessLevel
    }, {
      headers: {
        ...getAuthHeader(),
        "Content-Type": "application/json"
      }
    });
    
    return response.data;
  } catch (error) {
    console.error("Error changing user access level:", error);
    throw error;
  }
};

// Change user plan
// Plans: 0 (Trial), 1 (Developer), 2 (Enterprise), 3 (Educational)
export const changeUserPlan = async (email, newPlan) => {
  try {
    const response = await axios.patch('/admin/change-plan', {
      email,
      newPlan
    }, {
      headers: {
        ...getAuthHeader(),
        "Content-Type": "application/json"
      }
    });
    
    return response.data;
  } catch (error) {
    console.error("Error changing user plan:", error);
    throw error;
  }
};

/**
 * Token Management
 */

// Update user tokens (set to specific value)
export const updateUserTokens = async (email, tokens) => {
  try {
    const response = await axios.patch('/admin/update-tokens', {
      email,
      tokens
    }, {
      headers: {
        ...getAuthHeader(),
        "Content-Type": "application/json"
      }
    });
    
    return { success: true, data: response.data, updatedTokens: tokens };
  } catch (error) {
    console.error("Error updating user tokens:", error);
    throw error;
  }
};

// Add tokens to user balance
export const addUserTokens = async (email, tokens) => {
  try {
    const response = await axios.patch('/admin/add-tokens', {
      email,
      tokens
    }, {
      headers: {
        ...getAuthHeader(),
        "Content-Type": "application/json"
      }
    });
    
    return { success: true, data: response.data, updatedTokens: response.data.updatedTokens };
  } catch (error) {
    console.error("Error adding user tokens:", error);
    throw error;
  }
};

// Subtract tokens from user balance
export const subtractUserTokens = async (email, tokens) => {
  try {
    const response = await axios.patch('/admin/subtract-tokens', {
      email,
      tokens
    }, {
      headers: {
        ...getAuthHeader(),
        "Content-Type": "application/json"
      }
    });
    
    return { success: true, data: response.data, updatedTokens: response.data.updatedTokens };
  } catch (error) {
    console.error("Error removing user tokens:", error);
    throw error;
  }
};

/**
 * Email Management
 */

// Delete developer contact message
export const deleteDeveloperContact = async (id) => {
  try {
    const response = await axios.delete('/admin/delete-developer-contact', {
      headers: {
        ...getAuthHeader(),
        "Content-Type": "application/json"
      },
      data: { id }
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error deleting developer contact:", error);
    throw error;
  }
};

// Bulk delete developer contact messages
export const bulkDeleteDeveloperContacts = async (ids) => {
  try {
    const response = await axios.delete('/admin/delete-developer-contact', {
      headers: {
        ...getAuthHeader(),
        "Content-Type": "application/json"
      },
      data: { ids }
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error bulk deleting developer contacts:", error);
    throw error;
  }
};

// Delete inquiry contact message
export const deleteContact = async (id) => {
  try {
    const response = await axios.delete('/admin/delete-contact', {
      headers: {
        ...getAuthHeader(),
        "Content-Type": "application/json"
      },
      data: { id }
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error deleting contact:", error);
    throw error;
  }
};

// Bulk delete inquiry contact messages
export const bulkDeleteContacts = async (ids) => {
  try {
    const response = await axios.delete('/admin/delete-contact', {
      headers: {
        ...getAuthHeader(),
        "Content-Type": "application/json"
      },
      data: { ids }
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error bulk deleting contacts:", error);
    throw error;
  }
};

/**
 * Contact Management
 */

// Get all contacts with pagination
export const getAllContacts = async (page = 1, limit = 10) => {
  try {
    const response = await axios.get(`/admin/contacts?page=${page}&limit=${limit}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching contacts:", error);
    throw error;
  }
};

// Get a single contact by ID
export const getContactById = async (contactId) => {
  try {
    const response = await axios.get(`/admin/contacts/${contactId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching contact with ID ${contactId}:`, error);
    throw error;
  }
};

// Update a contact (mark as read/starred)
export const updateContact = async (contactId, updates) => {
  try {
    const response = await axios.patch(`/admin/contacts/${contactId}`, updates, {
      headers: {
        ...getAuthHeader(),
        "Content-Type": "application/json"
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating contact with ID ${contactId}:`, error);
    throw error;
  }
};

// Get starred contacts with pagination
export const getStarredContacts = async (page = 1, limit = 10) => {
  try {
    const response = await axios.get(`/admin/contacts/starred?page=${page}&limit=${limit}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching starred contacts:", error);
    throw error;
  }
};

// Search contacts by email with pagination
export const searchContactsByEmail = async (email, page = 1, limit = 10) => {
  try {
    const response = await axios.get(`/admin/contacts/search?email=${email}&page=${page}&limit=${limit}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error(`Error searching contacts with email ${email}:`, error);
    throw error;
  }
};

/**
 * Developer Contact Management
 */

// Get all developers with pagination
export const getAllDevelopers = async (page = 1, limit = 10) => {
  try {
    const response = await axios.get(`/admin/developers?page=${page}&limit=${limit}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching developers:", error);
    throw error;
  }
};

// Get a single developer by ID
export const getDeveloperById = async (developerId) => {
  try {
    const response = await axios.get(`/admin/developers/${developerId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching developer with ID ${developerId}:`, error);
    throw error;
  }
};

// Update a developer (mark as read/starred)
export const updateDeveloper = async (developerId, updates) => {
  try {
    const response = await axios.patch(`/admin/developers/${developerId}`, updates, {
      headers: {
        ...getAuthHeader(),
        "Content-Type": "application/json"
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating developer with ID ${developerId}:`, error);
    throw error;
  }
};

// Get starred developers with pagination
export const getStarredDevelopers = async (page = 1, limit = 10) => {
  try {
    const response = await axios.get(`/admin/developers/starred?page=${page}&limit=${limit}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching starred developers:", error);
    throw error;
  }
};

// Search developers by email with pagination
export const searchDevelopersByEmail = async (email, page = 1, limit = 10) => {
  try {
    const response = await axios.get(`/admin/developers/search?email=${email}&page=${page}&limit=${limit}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error(`Error searching developers with email ${email}:`, error);
    throw error;
  }
}; 