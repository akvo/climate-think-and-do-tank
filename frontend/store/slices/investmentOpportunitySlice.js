import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { env } from '@/helpers/env-vars';

const BACKEND_URL = env('NEXT_PUBLIC_BACKEND_URL');

export const fetchInvestmentOpportunityProfiles = createAsyncThunk(
  'investmentOpportunityProfiles/fetchInvestmentOpportunityProfiles',
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

      const investmentOpportunityProfileQueryParams = new URLSearchParams(
        baseQueryParams
      );

      if (filters.valueChain && filters.valueChain.length > 0) {
        filters.valueChain.forEach((chain, index) => {
          investmentOpportunityProfileQueryParams.append(
            `filters[value_chain][name][$in][${index}]`,
            chain
          );
        });
      }

      if (filters.regions && filters.regions.length > 0) {
        filters.regions.forEach((chain, index) => {
          investmentOpportunityProfileQueryParams.append(
            `filters[region][name][$in][${index}]`,
            chain
          );
        });
      }

      investmentOpportunityProfileQueryParams.append(
        'sort[0]',
        `publication_date:${dateSort}`
      );

      investmentOpportunityProfileQueryParams.append(
        'populate[0]',
        'value_chain'
      );

      investmentOpportunityProfileQueryParams.append('populate[1]', 'region');
      investmentOpportunityProfileQueryParams.append(
        'populate[2]',
        'picture_one'
      );

      const response = await axios.get(
        `${BACKEND_URL}/api/investment-opportunity-profiles?${investmentOpportunityProfileQueryParams}`
      );

      const investmentOpportunityProfiles = response.data.data.map(
        (profile) => ({
          id: profile.id,
          documentId: profile.documentId,
          title: profile.title,
          description: profile.description,
          publicationDate: profile.publication_date,
          publicationYear: new Date(profile.publication_date).getFullYear(),
          valueChain: profile.value_chain?.name || '',
          region: profile.region?.name || '',
          imageUrl: profile.picture_one?.url || '',
        })
      );

      return {
        data: investmentOpportunityProfiles,
        meta: {
          page,
          hasMore:
            investmentOpportunityProfiles.length > 0 &&
            investmentOpportunityProfiles.length >= pageSize,
        },
      };
    } catch (error) {
      console.error(
        'Investment Opportunity Profile fetch error:',
        error.response?.data || error.message
      );
      return rejectWithValue(
        error.response?.data?.error ||
          'Failed to fetch investment opportunity profiles'
      );
    }
  }
);

export const fetchRelatedInvestmentOpportunityProfiles = createAsyncThunk(
  'investmentOpportunityProfiles/fetchRelatedInvestmentOpportunityProfiles',
  async (
    { valueChain, currentProfileId, pageSize = 12 },
    { rejectWithValue }
  ) => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('pagination[pageSize]', pageSize);

      if (currentProfileId) {
        queryParams.append('filters[id][$ne]', currentProfileId);
      }

      if (valueChain) {
        queryParams.append('filters[value_chain][name][$eq]', valueChain);
      }

      queryParams.append('sort[0]', 'publication_date:desc');

      queryParams.append('populate[0]', 'value_chain');

      const response = await axios.get(
        `${BACKEND_URL}/api/investment-opportunity-profiles?${queryParams}`
      );

      const relatedInvestmentOpportunityProfiles = response.data.data.map(
        (profile) => ({
          id: profile.id,
          title: profile.title,
          description: profile.description,
          publicationDate: profile.publication_date,
          valueChain: profile.value_chain?.name || '',
        })
      );

      return {
        data: relatedInvestmentOpportunityProfiles,
        meta: {
          hasMore: relatedInvestmentOpportunityProfiles.length > 0,
        },
      };
    } catch (error) {
      console.error(
        'Related Investment Opportunity Profiles fetch error:',
        error.response?.data || error.message
      );
      return rejectWithValue(
        error.response?.data?.error ||
          'Failed to fetch related investment opportunity profiles'
      );
    }
  }
);

const investmentOpportunityProfileSlice = createSlice({
  name: 'investmentOpportunityProfile',
  initialState: {
    investmentOpportunityProfiles: [],
    loading: false,
    error: null,
    currentPage: 1,
    hasMore: true,
    relatedInvestmentOpportunityProfiles: [],
    relatedLoading: false,
    relatedError: null,
  },
  reducers: {
    clearInvestmentOpportunityProfiles: (state) => {
      state.investmentOpportunityProfiles = [];
      state.currentPage = 1;
      state.hasMore = true;
    },
    clearRelatedInvestmentOpportunityProfiles: (state) => {
      state.relatedInvestmentOpportunityProfiles = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvestmentOpportunityProfiles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchInvestmentOpportunityProfiles.fulfilled,
        (state, action) => {
          const { data, meta } = action.payload;

          if (meta.page === 1) {
            state.investmentOpportunityProfiles = data;
          } else {
            state.investmentOpportunityProfiles = [
              ...state.investmentOpportunityProfiles,
              ...data,
            ];
          }

          state.loading = false;
          state.currentPage = meta.page;
          state.hasMore = meta.hasMore;
        }
      )
      .addCase(fetchInvestmentOpportunityProfiles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'An error occurred';
      })
      .addCase(fetchRelatedInvestmentOpportunityProfiles.pending, (state) => {
        state.relatedLoading = true;
        state.relatedError = null;
      })
      .addCase(
        fetchRelatedInvestmentOpportunityProfiles.fulfilled,
        (state, action) => {
          state.relatedInvestmentOpportunityProfiles = action.payload.data;
          state.relatedLoading = false;
        }
      )
      .addCase(
        fetchRelatedInvestmentOpportunityProfiles.rejected,
        (state, action) => {
          state.relatedLoading = false;
          state.relatedError = action.payload;
        }
      );
  },
});

export const {
  clearInvestmentOpportunityProfiles,
  clearRelatedInvestmentOpportunityProfiles,
} = investmentOpportunityProfileSlice.actions;

export default investmentOpportunityProfileSlice.reducer;
