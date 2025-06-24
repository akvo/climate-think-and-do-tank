import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { setCookie, deleteCookie, getCookie } from 'cookies-next';
import { gql } from 'graphql-request';
import { GraphQLClient } from 'graphql-request';
import { env } from '@/helpers/env-vars';

const BACKEND_URL = env('NEXT_PUBLIC_BACKEND_URL');
const graphqlClient = new GraphQLClient(`${BACKEND_URL}/graphql`);

export const getAuthToken = () => {
  const token = getCookie('token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  return token;
};

export const fetchUserDetails = async (userId) => {
  try {
    const token = getAuthToken();

    const response = await axios.get(`${BACKEND_URL}/api/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      params: {
        populate: ['connection_requests_received', 'connection_requests_sent'],
      },
    });

    return {
      id: response.data.id,
      connection_requests_received: response.data.connection_requests_received,
      connection_requests_sent: response.data.connection_requests_sent,
      documentId: response.data.documentId,
    };
  } catch (error) {
    if (error.response) {
      if (error.response.status === 401) {
        throw new Error('Authentication expired. Please log in again.');
      }
      throw new Error(
        error.response.data.error?.message || 'Failed to fetch user details'
      );
    } else if (error.request) {
      throw new Error(
        'No response from server. Check your internet connection.'
      );
    } else {
      throw new Error('Error setting up the request');
    }
  }
};

export const sendConnectionRequest = createAsyncThunk(
  'auth/sendConnectionRequest',
  async ({ requester, receiver }, { rejectWithValue, getState }) => {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/stakeholder-connections`,
        {
          data: {
            requester,
            receiver,
            connection_status: 'Pending',
          },
        },
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const currentState = getState();
      const currentUser = currentState.auth.user;

      const updatedUser = {
        ...currentUser,
        connection_requests_sent: [
          ...(currentUser.connection_requests_sent || []),
          {
            id: response.data.data.id,
            documentId: response.data.data.documentId,
            connection_status: 'Pending',
          },
        ],
      };

      return {
        connectionRequest: response.data.data,
        updatedUser,
      };
    } catch (error) {
      console.error('Connection request error:', error);
      return rejectWithValue(
        error.response?.data?.error?.message ||
          'Failed to send connection request'
      );
    }
  }
);

export const acceptConnectionRequest = createAsyncThunk(
  'auth/acceptConnectionRequest',
  async (
    { connectionId, requester, receiver },
    { rejectWithValue, getState }
  ) => {
    try {
      const response = await axios.put(
        `${BACKEND_URL}/api/stakeholder-connections/${connectionId}`,
        {
          data: {
            connection_status: 'Accepted',
          },
        },
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const currentState = getState();
      const currentUser = currentState.auth.user;

      const updatedReceivedRequests =
        currentUser.connection_requests_received.map((request) =>
          request.documentId === requester &&
          request.connection_status === 'Pending'
            ? { ...request, connection_status: 'Accepted' }
            : request
        );

      const updatedUser = {
        ...currentUser,
        connection_requests_received: updatedReceivedRequests,
      };

      return {
        connectionRequest: response.data.data,
        updatedUser,
      };
    } catch (error) {
      console.error('Accept connection request error:', error);
      return rejectWithValue(
        error.response?.data?.error?.message ||
          'Failed to accept connection request'
      );
    }
  }
);

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

export const checkAuthStatus = createAsyncThunk(
  'auth/checkStatus',
  async (_, { rejectWithValue }) => {
    try {
      const token = getCookie('token');
      const userCookie = getCookie('user');

      if (!token || !userCookie) {
        return rejectWithValue('No active session');
      }

      const user = JSON.parse(userCookie);
      return { user, token };
    } catch (error) {
      return rejectWithValue('Invalid session');
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
      country,
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
          country,
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

      const { user, jwt } = response.data;

      setCookie('token', jwt, {
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
        secure: true,
        sameSite: 'strict',
      });

      setCookie(
        'user',
        JSON.stringify({
          email: user.email,
          full_name: user.full_name,
          id: user.id,
          stakeholder_role: user.stakeholder_role,
          linkedin: user.linkedin,
          documentId: user.documentId,
          connection_requests_received: user.connection_requests_received,
          connection_requests_sent: user.connection_requests_sent,
          organisation: { name: user.organisation?.name },
          profile_image: { url: user.profile_image?.url },
        }),
        {
          maxAge: 30 * 24 * 60 * 60,
          path: '/',
          secure: true,
          sameSite: 'strict',
        }
      );

      return { user, jwt };
    } catch (error) {
      const errorMessage =
        error.response?.data?.error?.message ===
        'Invalid identifier or password'
          ? 'Invalid email or password'
          : error.response?.data?.error?.message ||
            error.response?.data?.message ||
            'Login failed';

      return rejectWithValue(errorMessage);
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

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (updateData, { rejectWithValue }) => {
    try {
      let profileImageId = null;

      if (updateData.profile_image instanceof File) {
        const imageFormData = new FormData();
        imageFormData.append('files', updateData.profile_image);

        const uploadResponse = await axios.post(
          `${BACKEND_URL}/api/upload`,
          imageFormData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${getAuthToken()}`,
            },
          }
        );

        profileImageId = uploadResponse.data[0];
      }

      const updatePayload = {
        full_name: updateData.full_name,
        stakeholder_role: updateData.stakeholder_role,
        linkedin: updateData.linkedin,
        country: updateData.country,
        regions: updateData.focus_regions.map((r) => ({ id: r })),
        topics: updateData.topics.map((r) => ({ id: r })),
        profile_image: profileImageId ? { id: profileImageId.id } : null,
      };

      const response = await axios.put(
        `${BACKEND_URL}/api/users/${updateData.id}?populate=profile_image`,
        updatePayload,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );

      if (!response.data.profile_image && profileImageId) {
        console.log(
          'Profile image not in response, fetching complete user data'
        );

        const userResponse = await axios.get(
          `${BACKEND_URL}/api/users/${updateData.id}?populate=profile_image`,
          {
            headers: {
              Authorization: `Bearer ${getAuthToken()}`,
            },
          }
        );

        console.log('Complete user data:', userResponse.data);

        setCookie('user', JSON.stringify(userResponse.data), {
          path: '/',
          req: undefined,
          res: undefined,
        });

        return userResponse.data;
      }

      setCookie('user', JSON.stringify(response.data), {
        path: '/',
        req: undefined,
        res: undefined,
      });

      return response.data;
    } catch (error) {
      console.error('Profile update error:', error.response?.data || error);
      return rejectWithValue(
        error.response?.data?.error?.message || 'Failed to update profile'
      );
    }
  }
);

export const fetchStakeholders = createAsyncThunk(
  'stakeholders/fetchStakeholders',
  async (
    { page = 1, pageSize = 12, query = '', filters = {}, sortOrder = 'asc' },
    { rejectWithValue }
  ) => {
    try {
      const baseQueryParams = new URLSearchParams();
      baseQueryParams.append('pagination[page]', page);
      baseQueryParams.append('pagination[pageSize]', pageSize);

      const sortDirection = sortOrder === 'asc' ? 'asc' : 'desc';

      const userQueryParams = new URLSearchParams(baseQueryParams);
      userQueryParams.append('populate[1]', 'focus_regions');
      userQueryParams.append('populate[2]', 'organisation');
      userQueryParams.append('sort[0]', `full_name:${sortDirection}`);
      userQueryParams.append('populate[3]', 'profile_image');
      userQueryParams.append('populate[0]', 'topics');
      userQueryParams.append('filters[confirmed][$eq]', 'true');
      userQueryParams.append('filters[approved][$eq]', 'true');

      const orgQueryParams = new URLSearchParams(baseQueryParams);
      orgQueryParams.append('populate[1]', 'country');
      orgQueryParams.append('sort[0]', `name:${sortDirection}`);
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
        filters.topics.forEach((topic, index) => {
          userQueryParams.append(`filters[topics][name][$in][${index}]`, topic);
        });
      }

      if (query) {
        orgQueryParams.append('filters[$or][1][name][$containsi]', query);
        userQueryParams.append('filters[$or][0][full_name][$containsi]', query);
        userQueryParams.append('filters[$or][2][username][$containsi]', query);
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
        ? usersResponse.data.data
            .map((user) => ({
              id: user.id,
              type: 'Individual',
              name: user.full_name || user.username,
              image: user.profile_image,
              focusRegions: user.focus_regions?.map((r) => r.name) || [],
              organization: user.organisation ? user.organisation.name : '',
              data: user,
            }))
            .sort((a, b) =>
              a.name.localeCompare(b.name, undefined, {
                numeric: true,
                sensitivity: 'base',
              })
            )
        : [];

      const organizations = fetchOrgs
        ? organizationsResponse.data.data
            .map((org) => ({
              id: org.id,
              type: 'Organization',
              name: org.name,
              image: org.org_image?.formats?.medium
                ? org.org_image?.formats?.medium
                : org.org_image?.formats?.small,
              country: org.country?.country_name,
              data: org,
            }))
            .sort((a, b) =>
              a.name.localeCompare(b.name, undefined, {
                numeric: true,
                sensitivity: 'base',
              })
            )
        : [];

      const userPagination = usersResponse.data.meta?.pagination;
      const orgPagination = organizationsResponse.data.meta?.pagination;

      return {
        users,
        organizations,
        meta: {
          page,
          hasMore:
            (userPagination && page < userPagination.pageCount) ||
            (orgPagination && page < orgPagination.pageCount),
          totalUsers: userPagination?.total || 0,
          totalOrgs: orgPagination?.total || 0,
          userPagination,
          orgPagination,
        },
      };
    } catch (error) {
      console.error('Error fetching stakeholders:', error);
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
      let errorMessage = 'Failed to create organization';
      if (error.response) {
        if (error.response.data?.error?.message) {
          errorMessage =
            error.response.data.error.message ===
            'This attribute must be unique'
              ? 'Organization name must be unique'
              : error.response.data.error.message;
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
      } else if (error.request) {
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        errorMessage = error.message || 'An unknown error occurred';
      }

      return rejectWithValue(errorMessage);
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
        valueChainResponse,
      ] = await Promise.all([
        axios.get(
          `${BACKEND_URL}/api/organisations?status=published&pagination[pageSize]=250`
        ),
        axios.get(
          `${BACKEND_URL}/api/regions?status=published&pagination[pageSize]=250`
        ),
        axios.get(
          `${BACKEND_URL}/api/looking-fors?status=published&pagination[pageSize]=250`
        ),
        axios.get(`${BACKEND_URL}/api/users-permissions/roles`),
        axios.get(
          `${BACKEND_URL}/api/countries?status=published&pagination[pageSize]=250`
        ),
        axios.get(
          `${BACKEND_URL}/api/topics?status=published&pagination[pageSize]=250`
        ),
        axios.get(
          `${BACKEND_URL}/api/value-chains?status=published&pagination[pageSize]=250`
        ),
      ]);

      return {
        organizations: organizationsResponse.data.data,
        regions: regionsResponse.data.data,
        lookingFors: lookingForResponse.data.data,
        roles: rolesResponse.data.roles,
        country: countryResponse.data.data,
        topics: topicsResponse.data.data,
        valueChains: valueChainResponse.data.data,
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

export async function searchContentAcrossTypes({ query }) {
  try {
    const SEARCH_QUERY = gql`
      query SearchContent($query: String!) {
        organisations(filters: { name: { contains: $query } }) {
          name
        }

        investmentOpportunityProfiles(
          filters: { value_chain: { name: { containsi: $query } } }
        ) {
          value_chain {
            name
          }
          region {
            name
          }
          publication_date
        }

        knowledgeHubs(filters: { title: { containsi: $query } }) {
          title
          description
          publishedAt
          image {
            url
          }
        }
      }
    `;

    const data = await graphqlClient.request(SEARCH_QUERY, { query });

    return {
      organizations: {
        items:
          data.organisations?.map((org) => ({
            id: `org-${Math.random().toString(36).substr(2, 9)}`,
            attributes: {
              name: org.name,
            },
          })) || [],
      },
      investments: {
        items:
          data.investmentOpportunityProfiles?.map((inv) => ({
            id: inv.id,
            attributes: {
              title: `${inv.value_chain.name} In ${inv.region.name}`,
              category: inv.region.name || 'Investment',
              publication_date: inv.publication_date,
            },
          })) || [],
      },
      knowledgeHub: {
        items:
          data.knowledgeHubs?.map((item) => ({
            id: item.id,
            attributes: {
              title: item.title,
              description: item.description,
              published_at: item.publishedAt,
              image: item.image ? { url: item.image } : null,
            },
          })) || [],
      },
    };
  } catch (error) {
    console.error('Search error:', error.response || error);

    return {
      organizations: { items: [] },
      investments: { items: [] },
      knowledgeHub: { items: [] },
    };
  }
}

const fetchWithAuth = async (endpoint, options = {}) => {
  const token = getCookie('token');

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${BACKEND_URL}${endpoint}`, config);

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
};

const getUserProfile = async () => {
  return fetchWithAuth(
    '/api/users/me?populate[0]=organisation&populate[1]=profile_image&populate[2]=role&populate[3]=looking_fors&populate[4]=focus_regions&populate[5]=country&populate[6]=topics'
  );
};

export const fetchUserProfile = createAsyncThunk(
  'auth/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getUserProfile();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    loading: true,
    error: null,
    regions: [],
    organizations: [],
    lookingFors: [],
    roles: [],
    country: [],
    topics: [],
    valueChains: [],
    stakeholders: [],
    currentPage: 0,
  },
  reducers: {
    signOut: (state) => {
      state.user = null;
      state.error = null;
      localStorage.removeItem('token');
      deleteCookie('token');
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;

      deleteCookie('token', { req: undefined, res: undefined });
      deleteCookie('user', { req: undefined, res: undefined });

      if (typeof window !== 'undefined') {
        localStorage.setItem('auth-logout', 'true');
        setTimeout(() => localStorage.removeItem('auth-logout'), 100);
      }
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
        state.valueChains = action.payload.valueChains;
      })
      .addCase(fetchOrganizationsAndRegions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        const { user, jwt } = action.payload;

        state.user = user;
        state.token = jwt;
        state.isAuthenticated = true;
        state.loading = false;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload || 'Login failed';
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

        const sortDirection = action.meta.arg.sortOrder || 'asc';

        if (action.payload.meta.page === 1) {
          state.stakeholders = [
            ...action.payload.users,
            ...action.payload.organizations,
          ].sort((a, b) => {
            return sortDirection === 'asc'
              ? a.name.localeCompare(b.name, undefined, {
                  numeric: true,
                  sensitivity: 'base',
                })
              : b.name.localeCompare(a.name, undefined, {
                  numeric: true,
                  sensitivity: 'base',
                });
          });
        } else {
          const existingIds = new Set(
            state.stakeholders.map((item) => `${item.type}-${item.id}`)
          );

          const newUsers = action.payload.users.filter(
            (user) => !existingIds.has(`${user.type}-${user.id}`)
          );

          const newOrgs = action.payload.organizations.filter(
            (org) => !existingIds.has(`${org.type}-${org.id}`)
          );

          state.stakeholders = [
            ...state.stakeholders,
            ...newUsers,
            ...newOrgs,
          ].sort((a, b) => {
            return sortDirection === 'asc'
              ? a.name.localeCompare(b.name, undefined, {
                  numeric: true,
                  sensitivity: 'base',
                })
              : b.name.localeCompare(a.name, undefined, {
                  numeric: true,
                  sensitivity: 'base',
                });
          });
        }

        state.currentPage = action.payload.meta.page;
        state.hasMore = action.payload.meta.hasMore;
      })
      .addCase(fetchStakeholders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch stakeholders';
      })
      .addCase(checkAuthStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        const user = action.payload.user;

        state.user = user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.loading = false;
      })
      .addCase(checkAuthStatus.rejected, (state, action) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(sendConnectionRequest.fulfilled, (state, action) => {
        state.user = action.payload.updatedUser;
      })
      .addCase(sendConnectionRequest.rejected, (state, action) => {
        console.error('Connection request failed', action.payload);
      })
      .addCase(acceptConnectionRequest.fulfilled, (state, action) => {
        state.user = action.payload.updatedUser;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = {
          ...state.user,
          ...action.payload,
        };
      });
  },
});

export const { signOut, clearError, clearStakeholders, logout } =
  authSlice.actions;
export default authSlice.reducer;
