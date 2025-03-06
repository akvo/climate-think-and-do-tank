import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { setCookie, deleteCookie } from 'cookies-next';
import { gql } from 'graphql-request';
import { GraphQLClient } from 'graphql-request';
import { env } from '@/helpers/env-vars';

const BACKEND_URL = env('NEXT_PUBLIC_BACKEND_URL');
const graphqlClient = new GraphQLClient(`${BACKEND_URL}/graphql`);

// Async thunks
export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await axios.get(`${BACKEND_URL}/api/users/me`, {
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
      const response = await axios.post(`${BACKEND_URL}/api/auth/local`, {
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
  async (
    {
      username,
      email,
      password,
      organisation,
      regions,
      looking_fors,
      stakeholder_role,
      linkedin,
      full_name,
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/auth/local/register`,
        {
          username,
          email,
          password,
          organisation,
          focus_regions: regions,
          looking_fors,
          stakeholder_role,
          linkedin,
          full_name,
        }
      );

      const { user, message } = response.data;

      return {
        ...user,
        needsVerification: true,
        message,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || 'Registration failed'
      );
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/local`, {
        identifier: email,
        password,
      });

      return {
        user: response.data.user,
        jwt: response.data.jwt,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message || 'Login failed'
      );
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/auth/forgot-password`,
        {
          email,
        }
      );

      return response.data;
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        return rejectWithValue(error.response.data.error);
      } else {
        return rejectWithValue({
          message: 'An error occurred during password reset',
        });
      }
    }
  }
);

export const resendVerification = createAsyncThunk(
  'auth/resendVerification',
  async (email, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/auth/send-email-confirmation`,
        {
          email,
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to resend verification email'
      );
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ resetCode, newPassword }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/auth/reset-password`,
        {
          code: resetCode,
          password: newPassword,
          passwordConfirmation: newPassword,
        }
      );

      return response.data;
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        return rejectWithValue(error.response.data.error);
      } else {
        return rejectWithValue({
          message: 'An error occurred during password reset',
        });
      }
    }
  }
);

export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async (token, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/auth/email-confirmation`,
        {
          params: { confirmation: token },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Verification failed'
      );
    }
  }
);

export const createOrganization = createAsyncThunk(
  'auth/createOrganization',
  async (organizationData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/organisations`, {
        data: {
          name: organizationData.org_name,
          website: organizationData.website,
          type: organizationData.type,
          country: organizationData.country,
          topics: organizationData.topics,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to create organization'
      );
    }
  }
);

export const fetchOrganizationsAndRegions = createAsyncThunk(
  'orgSector/fetchOrganizationsAndRectors',
  async (_, { rejectWithValue }) => {
    try {
      const [
        organizationsResponse,
        regionsResponse,
        lookingForResponse,
        rolesResponse,
        countryResponse,
        topicsResponse,
      ] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/organisations?status=published`),
        axios.get(`${BACKEND_URL}/api/regions?status=published`),
        axios.get(`${BACKEND_URL}/api/looking-fors?status=published`),
        axios.get(`${BACKEND_URL}/api/users-permissions/roles`),
        axios.get(`${BACKEND_URL}/api/countries?status=published`),
        axios.get(`${BACKEND_URL}/api/topics?status=published`),
      ]);

      return {
        organizations: organizationsResponse.data.data,
        regions: regionsResponse.data.data,
        lookingFors: lookingForResponse.data.data,
        roles: rolesResponse.data.roles,
        country: countryResponse.data.data,
        topics: topicsResponse.data.data,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error ||
          'Failed to fetch organizations and regions'
      );
    }
  }
);

const SEARCH_QUERY = gql`
  query Search($query: String!) {
    organisations(filters: { name: { containsi: $query } }) {
      name
    }
    regions(filters: { name: { containsi: $query } }) {
      name
    }
  }
`;

export async function searchContentAcrossTypes({
  query,
  page = 1,
  pageSize = 10,
}) {
  try {
    const data = await graphqlClient.request(SEARCH_QUERY, {
      query,
    });

    return {
      organizations: {
        items: data.organisations.map((org) => ({
          id: org.id,
          attributes: { name: org.name },
        })),
        pagination: {
          page,
          pageSize,
          total: data.organisations.length,
          pageCount: 1,
        },
      },
      regions: {
        items: data.regions.map((sector) => ({
          id: sector.id,
          attributes: { name: sector.name },
        })),
        pagination: {
          page,
          pageSize,
          total: data.regions.length,
          pageCount: 1,
        },
      },
    };
  } catch (error) {
    console.error('Search error:', error.response);
    throw error;
  }
}

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    jwt: null,
    loading: false,
    error: null,
    regions: [],
    organizations: [],
    lookingFors: [],
    roles: [],
    country: [],
    topics: [],
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
      })
      .addCase(fetchOrganizationsAndRegions.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchOrganizationsAndRegions.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.organizations = action.payload.organizations;
        state.regions = action.payload.regions;
        state.lookingFors = action.payload.lookingFors;
        state.roles = action.payload.roles;
        state.country = action.payload.country;
        state.topics = action.payload.topics;
      })
      .addCase(fetchOrganizationsAndRegions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.jwt = action.payload.jwt;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(forgotPassword.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(createOrganization.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrganization.fulfilled, (state, action) => {
        state.loading = false;
        state.organizations = [...state.organizations, action.payload.data];
      })
      .addCase(createOrganization.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { signOut, clearError } = authSlice.actions;
export default authSlice.reducer;
