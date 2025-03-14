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
      topics,
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
          topics,
        }
      );

      const { user, message } = response.data;

      return {
        ...user,
        needsVerification: true,
        message,
      };
    } catch (error) {
      if (error.response) {
        const errorData = error.response.data;

        if (errorData.error?.details?.errors) {
          const fieldErrors = {};
          errorData.error.details.errors.forEach((err) => {
            fieldErrors[err.path[0]] = err.message;
          });
          return rejectWithValue({
            message: errorData.error.message || 'Validation failed',
            fieldErrors,
          });
        } else if (errorData.error?.message) {
          return rejectWithValue({
            message: errorData.error.message,
            fieldErrors: {},
          });
        }
      }

      return rejectWithValue({
        message:
          'Unable to connect to server. Please check your internet connection.',
        fieldErrors: {},
      });
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

export const fetchStakeholders = createAsyncThunk(
  'stakeholders/fetchStakeholders',
  async (
    { page = 1, pageSize = 12, query = '', filters = {} },
    { rejectWithValue }
  ) => {
    try {
      const baseQueryParams = new URLSearchParams();
      baseQueryParams.append('pagination[page]', page);
      baseQueryParams.append('pagination[pageSize]', pageSize);

      // baseQueryParams.append('sort[0]', filters.type === '' ? 'full_name:asc' : 'name:asc');

      if (query) {
        baseQueryParams.append('filters[$or][0][full_name][$containsi]', query);
        baseQueryParams.append('filters[$or][1][name][$containsi]', query);
        baseQueryParams.append('filters[$or][2][username][$containsi]', query);
      }

      const userQueryParams = new URLSearchParams(baseQueryParams);
      userQueryParams.append('populate[1]', 'focus_regions');
      userQueryParams.append('populate[2]', 'organisation');
      userQueryParams.append('sort[0]', 'full_name:asc');
      // userQueryParams.append('populate[3]', 'profile_image');
      userQueryParams.append('populate[0]', 'topics');

      const orgQueryParams = new URLSearchParams(baseQueryParams);
      // orgQueryParams.append('populate[0]', 'topics');
      orgQueryParams.append('populate[1]', 'country');
      orgQueryParams.append('sort[0]', 'name:asc');
      orgQueryParams.append('populate[3]', 'org_image');

      if (filters.focusRegions && filters.focusRegions.length > 0) {
        filters.focusRegions.forEach((region, index) => {
          userQueryParams.append(
            `filters[focus_regions][name][$in][${index}]`,
            region
          );
          orgQueryParams.append(
            `filters[country][country_name][$in][${index}]`,
            region
          );
        });
      }

      if (filters.topics && filters.topics.length > 0) {
        filters.topics.forEach((region, index) => {
          userQueryParams.append(
            `filters[topics][name][$in][${index}]`,
            region
          );
        });
      }

      let usersResponse = { data: { data: [] } };
      let organizationsResponse = { data: { data: [] } };

      const fetchUsers =
        !filters.type ||
        filters.type.length === 0 ||
        filters.type.includes('Individual');

      const fetchOrgs =
        (!filters.type ||
          filters.type.length === 0 ||
          filters.type.includes('Organization')) &&
        (!filters.focusRegions || filters.focusRegions.length === 0) &&
        (!filters.topics || filters.topics.length === 0);

      const requests = [];
      if (fetchUsers) {
        requests.push(axios.get(`${BACKEND_URL}/api/users?${userQueryParams}`));
      } else {
        requests.push(Promise.resolve({ data: { data: [] } }));
      }

      if (fetchOrgs) {
        requests.push(
          axios.get(`${BACKEND_URL}/api/organisations?${orgQueryParams}`)
        );
      } else {
        requests.push(Promise.resolve({ data: { data: [] } }));
      }

      [usersResponse, organizationsResponse] = await Promise.all(requests);

      const users = fetchUsers
        ? usersResponse.data
            .map((user) => ({
              id: user.id,
              type: 'Individual',
              name: user.full_name || user.username,
              image:
                user.profile_image?.url ||
                '/uploads/placeholder_image_1625231395.jpg',
              // topics: user.topics?.map((t) => t.name) || [],
              focusRegions: user.focus_regions?.map((r) => r.name) || [],
              organization: user.organisation ? user.organisation.name : '',
              data: user,
            }))
            .sort((a, b) => a.name.localeCompare(b.name))
        : [];

      const organizations = fetchOrgs
        ? organizationsResponse.data.data
            .map((org) => ({
              id: org.id,
              type: 'Organization',
              name: org.name,
              image:
                org.org_image?.formats?.medium?.url ||
                '/uploads/placeholder_image_1625231395.jpg',
              country: org.country?.country_name,
              data: org,
            }))
            .sort((a, b) => a.name.localeCompare(b.name))
        : [];

      return {
        users,
        organizations,
        meta: {
          page,
          hasMore:
            users.length + organizations.length > 0 &&
            (users.length >= pageSize / 2 ||
              organizations.length >= pageSize / 2),
        },
      };
    } catch (error) {
      console.error(
        'Stakeholder fetch error:',
        error.response?.data || error.message
      );
      return rejectWithValue(
        error.response?.data?.error || 'Failed to fetch stakeholders'
      );
    }
  }
);

export const createOrganization = createAsyncThunk(
  'auth/createOrganization',
  async (organizationData, { rejectWithValue }) => {
    try {
      console.log(organizationData);
      let imageResponse = null;
      if (organizationData.org_image instanceof File) {
        const fileFormData = new FormData();
        fileFormData.append('files', organizationData.org_image);

        const uploadResponse = await axios.post(
          `${BACKEND_URL}/api/upload`,
          fileFormData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        console.log(uploadResponse);
        imageResponse = uploadResponse.data[0];
      }

      const orgData = {
        data: {
          name: organizationData.org_name,
          website: organizationData.website,
          type: organizationData.type,
          country: organizationData.country,
          org_image: imageResponse ? { id: imageResponse.id } : null,
        },
      };

      const response = await axios.post(
        `${BACKEND_URL}/api/organisations`,
        orgData
      );

      return response.data;
    } catch (error) {
      console.error(
        'Organization creation error:',
        error.response?.data || error
      );
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
        thematicsResponse,
      ] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/organisations?status=published`),
        axios.get(`${BACKEND_URL}/api/regions?status=published`),
        axios.get(`${BACKEND_URL}/api/looking-fors?status=published`),
        axios.get(`${BACKEND_URL}/api/users-permissions/roles`),
        axios.get(`${BACKEND_URL}/api/countries?status=published`),
        axios.get(`${BACKEND_URL}/api/topics?status=published`),
        axios.get(`${BACKEND_URL}/api/thematics?status=published`),
      ]);

      return {
        organizations: organizationsResponse.data.data,
        regions: regionsResponse.data.data,
        lookingFors: lookingForResponse.data.data,
        roles: rolesResponse.data.roles,
        country: countryResponse.data.data,
        topics: topicsResponse.data.data,
        thematics: thematicsResponse.data.data,
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
    thematics: [],
    stakeholders: [],
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
    clearStakeholders: (state) => {
      state.stakeholders = [];
      state.currentPage = 1;
      state.hasMore = true;
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
        state.thematics = action.payload.thematics;
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
      })
      .addCase(fetchStakeholders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStakeholders.fulfilled, (state, action) => {
        state.loading = false;

        if (action.payload.meta.page === 1) {
          state.stakeholders = [
            ...action.payload.users,
            ...action.payload.organizations,
          ];
        } else {
          state.stakeholders = [
            ...state.stakeholders,
            ...action.payload.users,
            ...action.payload.organizations,
          ];
        }

        state.currentPage = action.payload.meta.page;
        state.hasMore = action.payload.meta.hasMore;
      })
      .addCase(fetchStakeholders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch stakeholders';
      });
  },
});

export const { signOut, clearError, clearStakeholders } = authSlice.actions;
export default authSlice.reducer;
