const API_BASE_URL = 'http://localhost:8080/api';

export const authService = {
  login: async (usernameOrEmail, password) => {
    console.log('🔐 Attempting login for:', usernameOrEmail);

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: usernameOrEmail,
        password,
      }),
    });

    if (!response.ok) {
      let errorMessage = `Login failed (${response.status})`;
      try {
        const error = await response.json();
        errorMessage = error.error || errorMessage;
      } catch {
        if (response.status === 401) {
          errorMessage = 'Invalid credentials';
        }
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    // ✅ Debug: Log response dari backend
    console.log('📦 Login response from backend:', data);
    console.log('Available fields:', Object.keys(data));
    
    // ✅ Check apakah accountId ada
    if (!data.accountId) {
      console.error('⚠️ WARNING: accountId not found in login response!');
      console.log('Full response:', JSON.stringify(data, null, 2));
      
      // Coba cari field alternatif
      if (data.id) {
        console.log('Found "id" field, using it as accountId');
        data.accountId = data.id;
      } else if (data.userId) {
        console.log('Found "userId" field, using it as accountId');
        data.accountId = data.userId;
      } else if (data.account_id) {
        console.log('Found "account_id" field, using it as accountId');
        data.accountId = data.account_id;
      } else {
        console.error('❌ Cannot find any ID field in response!');
      }
    } else {
      console.log('✅ accountId found:', data.accountId);
    }

    return data;
  },

  register: async (username, email, password, role, bio = '') => {
    console.log('📝 Attempting registration:', { username, email, role });

    const endpoint =
      role === 'artist'
        ? `${API_BASE_URL}/auth/register/artist`
        : `${API_BASE_URL}/auth/register/user`;

    const body =
      role === 'artist'
        ? { username, email, password, bio }
        : { username, email, password };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      let errorMessage = `Registration failed (${response.status})`;
      try {
        const error = await response.json();
        errorMessage = error.error || errorMessage;
      } catch {
        errorMessage = 'Registration failed';
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('✅ Registration successful:', data);
    return data;
  },

  checkExists: async (usernameOrEmail) => {
    const response = await fetch(`${API_BASE_URL}/auth/check/${usernameOrEmail}`);
    const data = await response.json();
    return data.exists;
  },

  updateProfile: async (profile, accountType) => {
    const payload =
      accountType === 'ARTIST'
        ? {
            username: profile.username,
            email: profile.email,
            bio: profile.bio ?? '',
          }
        : {
            username: profile.username,
            email: profile.email,
          };

    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let msg = `Update profile failed (${response.status})`;
      try {
        const err = await response.json();
        msg = err.error || msg;
      } catch {
        // ignore
      }
      throw new Error(msg);
    }

    return response.json();
  },

  changePassword: async (currentPassword, newPassword, username) => {
    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, currentPassword, newPassword }),
    });

    if (!response.ok) {
      let msg = `Change password failed (${response.status})`;
      try {
        const err = await response.json();
        msg = err.error || msg;
      } catch {
        // ignore
      }
      throw new Error(msg);
    }

    return response.json();
  },

  deleteAccount: async (username) => {
    const response = await fetch(`${API_BASE_URL}/auth/account/${username}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      let msg = `Delete account failed (${response.status})`;
      try {
        const err = await response.json();
        msg = err.error || msg;
      } catch {
        // ignore
      }
      throw new Error(msg);
    }

    return true;
  },

  // ✅ Helper untuk logout
  logout: () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    console.log('✅ User logged out, localStorage cleared');
  }
};
