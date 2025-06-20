import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { env } from '@/helpers/env-vars';

const BACKEND_URL = env('NEXT_PUBLIC_BACKEND_URL');

export const fetchSocialAccountabilityData = createAsyncThunk(
  'socialAccountability/fetchSocialAccountabilityData',
  async (
    { page = 1, pageSize = 9, query = '', filters = {}, dateSort = 'desc' },
    { rejectWithValue }
  ) => {
    try {
      const baseQueryParams = new URLSearchParams();
      baseQueryParams.append('pagination[page]', page);
      baseQueryParams.append('pagination[pageSize]', pageSize);

      if (query) {
        baseQueryParams.append('filters[$or][0][title][$containsi]', query);
        baseQueryParams.append(
          'filters[$or][1][description][$containsi]',
          query
        );
      }

      const socialAccountabilityQueryParams = new URLSearchParams(
        baseQueryParams
      );

      if (filters.date && filters.date.length > 0) {
        if (Array.isArray(filters.date) && filters.date.length > 0) {
          const yearNumbers = filters.date.map((year) => parseInt(year));
          const minYear = Math.min(...yearNumbers);
          const maxYear = Math.max(...yearNumbers);

          socialAccountabilityQueryParams.append(
            'filters[publication_date][$gte]',
            `${minYear}-01-01`
          );

          socialAccountabilityQueryParams.append(
            'filters[publication_date][$lte]',
            `${maxYear}-12-31`
          );
        }
      }

      if (filters.valueChain && filters.valueChain.length > 0) {
        filters.valueChain.forEach((chain, index) => {
          socialAccountabilityQueryParams.append(
            `filters[value_chain][name][$in][${index}]`,
            chain
          );
        });
      }

      if (filters.regions && filters.regions.length > 0) {
        filters.regions.forEach((region, index) => {
          socialAccountabilityQueryParams.append(
            `filters[region][name][$in][${index}]`,
            region
          );
        });
      }

      socialAccountabilityQueryParams.append(
        'sort[0]',
        `publication_date:${dateSort}`
      );

      socialAccountabilityQueryParams.append('populate[0]', 'value_chain');
      socialAccountabilityQueryParams.append('populate[1]', 'region');
      socialAccountabilityQueryParams.append('populate[3]', 'profile_picture');

      const response = await axios.get(
        `${BACKEND_URL}/api/social-accountabilities?${socialAccountabilityQueryParams}`
      );

      const socialAccountabilityData = response.data.data.map((item) => ({
        id: item.id,
        documentId: item.documentId,
        title: item.title,
        author: item.author,
        description: item.description,
        publicationDate: item.publication_date,
        publicationYear: new Date(item.publication_date).getFullYear(),
        valueChain: item.value_chain?.name || '',
        region: item.region?.name || '',
        priorities: item.priorities || [],
        investments: item.investments || [],
        impacts: item.impacts || [],
        imageUrl: item.profile_picture || '',
      }));

      return {
        data: socialAccountabilityData,
        meta: {
          page,
          hasMore:
            socialAccountabilityData.length > 0 &&
            socialAccountabilityData.length >= pageSize,
        },
      };
    } catch (error) {
      console.error(
        'Social Accountability data fetch error:',
        error.response?.data || error.message
      );
      return rejectWithValue(
        error.response?.data?.error ||
          'Failed to fetch social accountability data'
      );
    }
  }
);

export const clearSocialAccountabilityData = createAsyncThunk(
  'socialAccountability/clearSocialAccountabilityData',
  async () => {
    return;
  }
);

const socialAccountabilitySlice = createSlice({
  name: 'socialAccountability',
  initialState: {
    data: [],
    loading: false,
    error: null,
    currentPage: 0,
    hasMore: true,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSocialAccountabilityData.pending, (state, action) => {
        state.loading = true;
        state.error = null;

        // If this is a new search/filter (page 1), clear the existing data
        if (action.meta.arg.page === 1) {
          state.data = [];
          state.currentPage = 0;
        }
      })
      .addCase(fetchSocialAccountabilityData.fulfilled, (state, action) => {
        state.loading = false;

        // If this is page 1, replace data; otherwise, append
        if (action.meta.arg.page === 1) {
          state.data = action.payload.data;
        } else {
          state.data = [...state.data, ...action.payload.data];
        }

        state.currentPage = action.meta.arg.page;
        state.hasMore = action.payload.meta.hasMore;
      })
      .addCase(fetchSocialAccountabilityData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch data';
      })
      .addCase(clearSocialAccountabilityData.fulfilled, (state) => {
        state.data = [];
        state.currentPage = 0;
        state.hasMore = true;
      });
  },
});

export default socialAccountabilitySlice.reducer;
