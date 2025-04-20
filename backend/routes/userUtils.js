// A simple utility to get and set the userId

// Get the current userId (with fallback to single_user_id)
export const getUserId = () => {
    return localStorage.getItem('userId') || 'single_user_id';
  };
  
  // Set the userId
  export const setUserId = (userId) => {
    localStorage.setItem('userId', userId);
  };
  
  // Check if a user is logged in
  export const isLoggedIn = () => {
    return !!localStorage.getItem('userId');
  };
  
  // Log out a user
  export const logout = () => {
    localStorage.removeItem('userId');
  };