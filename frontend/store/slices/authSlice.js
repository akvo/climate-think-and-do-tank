import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { setCookie, deleteCookie } from 'cookies-next';
import { gql } from 'graphql-request';
import { GraphQLClient } from 'graphql-request';

const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

const graphqlClient = new GraphQLClient(
  `${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}/graphql`,
  {
    headers: {
      'Content-Type': 'application/json',
    },
  }
);

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
  async (
    { username, email, password, organization, sector, country, role },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(`${STRAPI_URL}/api/auth/register`, {
        username,
        email,
        password,
        organization,
        sector,
        country,
        role,
      });

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
      const response = await axios.post(`${STRAPI_URL}/api/auth/local`, {
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
        `${STRAPI_URL}/api/auth/forgot-password`,
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
        `${STRAPI_URL}/api/auth/send-email-confirmation`,
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
        `${STRAPI_URL}/api/auth/reset-password`,
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
      const response = await axios.get(`${STRAPI_URL}/api/auth/verify`, {
        params: { token },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Verification failed'
      );
    }
  }
);

export const fetchOrganizationsAndSectors = createAsyncThunk(
  'orgSector/fetchOrganizationsAndSectors',
  async (_, { rejectWithValue }) => {
    try {
      const [
        organizationsResponse,
        sectorsResponse,
        countryResponse,
        rolesResponse,
      ] = await Promise.all([
        axios.get(`${STRAPI_URL}/api/organisations?status=published`),
        axios.get(`${STRAPI_URL}/api/sectors?status=published`),
        axios.get(`${STRAPI_URL}/api/countries?status=published`),
        axios.get(`${STRAPI_URL}/api/users-permissions/roles`),
      ]);
      console.log(rolesResponse.data);
      return {
        organizations: organizationsResponse.data.data,
        sectors: sectorsResponse.data.data,
        country: countryResponse.data.data,
        roles: rolesResponse.data.roles,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error ||
          'Failed to fetch organizations and sectors'
      );
    }
  }
);

const SEARCH_QUERY = gql`
  query Search($query: String!, $page: Int!, $pageSize: Int!) {
    organisations(
      filters: {
        or: [{ name: { containsi: $query } }]
        status: { eq: "published" }
      }
      pagination: { page: $page, pageSize: $pageSize }
      sort: ["name:asc"]
    ) {
      data {
        id
        attributes {
          name
        }
      }
      meta {
        pagination {
          total
          pageCount
          page
          pageSize
        }
      }
    }
    sectors(
      filters: {
        or: [{ name: { containsi: $query } }]
        status: { eq: "published" }
      }
      pagination: { page: $page, pageSize: $pageSize }
      sort: ["name:asc"]
    ) {
      data {
        id
        attributes {
          name
        }
      }
      meta {
        pagination {
          total
          pageCount
          page
          pageSize
        }
      }
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
      page,
      pageSize,
    });
    return {
      organizations: {
        items: data.organisations.data,
        pagination: data.organisations.meta.pagination,
      },
      sectors: {
        items: data.sectors.data,
        pagination: data.sectors.meta.pagination,
      },
    };
  } catch (error) {
    console.error('Search error:', error);
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
    sectors: [],
    organizations: [],
    country: [],
    roles: [],
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
      .addCase(fetchOrganizationsAndSectors.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchOrganizationsAndSectors.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.organizations = action.payload.organizations;
        state.sectors = action.payload.sectors;
        state.country = action.payload.country;
        state.roles = action.payload.roles;
      })
      .addCase(fetchOrganizationsAndSectors.rejected, (state, action) => {
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
      });
  },
});

export const { signOut, clearError } = authSlice.actions;
export default authSlice.reducer;
