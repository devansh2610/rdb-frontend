import axios from "axios";

const instance = axios.create({
  baseURL: "https://api.foodoscope.com",
  headers: {
    "Content-type": "application/json",
    "Access-Control-Allow-Origin": "*",
  }
});

// Add a response interceptor
instance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    // If the error is 403 and we haven't retried yet
    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Check if we have a refresh token
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (refreshToken) {
          // Call refresh token endpoint
          const response = await axios.post('https://api.foodoscope.com/auth/refresh-token', {
            refreshToken
          });
          
          // If successful, update the token
          if (response.data && response.data.token) {
            localStorage.setItem('jwtToken', response.data.token);
            
            // Update the Authorization header
            originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
            
            // Retry the original request
            return instance(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('Error refreshing token:', refreshError);
        
        // If refresh fails, redirect to login
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default instance;