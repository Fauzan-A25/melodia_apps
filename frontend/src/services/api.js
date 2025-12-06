const API_BASE_URL = 'http://localhost:8080/api';

// ==================== ADMIN SERVICE ====================
export const adminService = {
  // --- Dashboard Stats ---
  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/stats`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch admin stats');
    }
    
    return response.json();
  },

  // --- Genre Management ---
  getAllGenres: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/genres`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch genres');
    }
    
    return response.json();
  },

  createGenre: async (genreName, description) => {
    const response = await fetch(`${API_BASE_URL}/admin/genres`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: genreName, description })  // ✅ Changed: name instead of genreName
    });
    
    if (!response.ok) {
      let errorMessage = 'Failed to create genre';
      try {
        const error = await response.json();
        errorMessage = error.error || errorMessage;
      } catch {
        // Unable to parse error response, use default message
        console.log('Error parsing create genre response');
      }
      throw new Error(errorMessage);
    }
    
    return response.json();
  },

  updateGenre: async (genreId, genreName, description) => {
    const response = await fetch(`${API_BASE_URL}/admin/genres/${genreId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: genreName, description })  // ✅ Changed: name instead of genreName
    });
    
    if (!response.ok) {
      let errorMessage = 'Failed to update genre';
      try {
        const error = await response.json();
        errorMessage = error.error || errorMessage;
      } catch {
        // Unable to parse error response, use default message
        console.log('Error parsing update genre response');
      }
      throw new Error(errorMessage);
    }
    
    return response.json();
  },

  deleteGenre: async (genreId) => {
    const response = await fetch(`${API_BASE_URL}/admin/genres/${genreId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      let errorMessage = 'Failed to delete genre';
      try {
        const error = await response.json();
        errorMessage = error.error || errorMessage;
      } catch {
        // Unable to parse error response, use default message
        console.log('Error parsing delete genre response');
      }
      throw new Error(errorMessage);
    }
    
    return response.json();
  },

  // --- User Management ---
  getAllUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    
    return response.json();
  },

  getUsersByType: async (accountType) => {
    const response = await fetch(`${API_BASE_URL}/admin/users?type=${accountType}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ${accountType}s`);
    }
    
    return response.json();
  },

  getBannedUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/users/banned`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch banned users');
    }
    
    return response.json();
  },

  banUser: async (accountId, reason) => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${accountId}/ban`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });
    
    if (!response.ok) {
      let errorMessage = 'Failed to ban user';
      try {
        const error = await response.json();
        errorMessage = error.error || errorMessage;
      } catch {
        // Unable to parse error response, use default message
        console.log('Error parsing ban user response');
      }
      throw new Error(errorMessage);
    }
    
    return response.json();
  },

  unbanUser: async (accountId) => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${accountId}/unban`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      let errorMessage = 'Failed to unban user';
      try {
        const error = await response.json();
        errorMessage = error.error || errorMessage;
      } catch {
        // Unable to parse error response, use default message
        console.log('Error parsing unban user response');
      }
      throw new Error(errorMessage);
    }
    
    return response.json();
  },

  deleteUser: async (accountId) => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${accountId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      let errorMessage = 'Failed to delete user';
      try {
        const error = await response.json();
        errorMessage = error.error || errorMessage;
      } catch {
        // Unable to parse error response, use default message
        console.log('Error parsing delete user response');
      }
      throw new Error(errorMessage);
    }
    
    return response.json();
  },

  searchUsers: async (query) => {
    const response = await fetch(`${API_BASE_URL}/admin/users/search?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error('Failed to search users');
    }
    
    return response.json();
  }
};

// ==================== HELPER FUNCTION ====================
export const handleApiError = (error) => {
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};
