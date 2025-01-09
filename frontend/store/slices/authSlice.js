import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { setCookie, deleteCookie } from 'cookies-next';

const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

// Async thunks
export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await axios.get(`${STRAPI_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      localStorage.removeItem('token');
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const signIn = createAsyncThunk(
  'auth/signIn',
  async ({ identifier, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${STRAPI_URL}/api/auth/local`, {
        identifier,
        password,
      });

      const { jwt, user } = response.data;
      localStorage.setItem('token', jwt);
      setCookie('token', jwt);

      return user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || 'Login failed'
      );
    }
  }
);

export const signUp = createAsyncThunk(
  'auth/signUp',
  async ({ username, email, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${STRAPI_URL}/api/auth/local/register`,
        {
          username,
          email,
          password,
        }
      );

      const { user } = response.data;

      return {
        ...user,
        needsVerification: true,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || 'Registration failed'
      );
    }
  }
);

export const resendVerification = createAsyncThunk(
  'auth/resendVerification',
  async (email, { rejectWithValue }) => {
    try {
      await axios.post(`${STRAPI_URL}/api/auth/send-email-confirmation`, {
        email,
      });
      return { success: true };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to resend verification email'
      );
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      await axios.post(`${STRAPI_URL}/api/auth/forgot-password`, { email });
      return true;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || 'Failed to process request'
      );
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ code, password, passwordConfirmation }, { rejectWithValue }) => {
    try {
      await axios.post(`${STRAPI_URL}/api/auth/reset-password`, {
        code,
        password,
        passwordConfirmation,
      });
      return true;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || 'Failed to reset password'
      );
    }
  }
);

export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async (token, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${STRAPI_URL}/api/auth/email-confirmation`,
        {
          params: { token },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Verification failed'
      );
    }
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    loading: false,
    error: null,
  },
  reducers: {
    signOut: (state) => {
      state.user = null;
      state.error = null;
      localStorage.removeItem('token');
      deleteCookie('token');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Check Auth
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.error = action.payload;
      })
      // Sign In
      .addCase(signIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Sign Up
      .addCase(signUp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(signUp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(verifyEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(resendVerification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resendVerification.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(resendVerification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { signOut, clearError } = authSlice.actions;
export default authSlice.reducer;
