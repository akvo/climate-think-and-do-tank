import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { env } from '@/helpers/env-vars';

const BACKEND_URL = env('NEXT_PUBLIC_BACKEND_URL');

export const fetchKnowledgeHubs = createAsyncThunk(
  'knowledgeHubs/fetchKnowledgeHubs',
  async (
    {
      page = 1,
      pageSize = 12,
      query = '',
      filters = {},
      dateSort = 'desc',
      dateFilter = null,
    },
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

      const knowledgeHubQueryParams = new URLSearchParams(baseQueryParams);

      if (dateFilter) {
        const currentYear = new Date().getFullYear();
        switch (dateFilter) {
          case 'last_year':
            knowledgeHubQueryParams.append(
              'filters[date][$gte]',
              `${currentYear - 1}-01-01`
            );
            knowledgeHubQueryParams.append(
              'filters[date][$lte]',
              `${currentYear - 1}-12-31`
            );
            break;
          case 'this_year':
            knowledgeHubQueryParams.append(
              'filters[date][$gte]',
              `${currentYear}-01-01`
            );
            knowledgeHubQueryParams.append(
              'filters[date][$lte]',
              `${currentYear}-12-31`
            );
            break;
          case 'last_5_years':
            knowledgeHubQueryParams.append(
              'filters[date][$gte]',
              `${currentYear - 5}-01-01`
            );
            break;
        }
      }

      if (filters.topic && filters.topic.length > 0) {
        filters.topic.forEach((focus, index) => {
          knowledgeHubQueryParams.append(
            `filters[topic][name][$in][${index}]`,
            focus
          );
        });
      }

      if (filters.focusRegions && filters.focusRegions.length > 0) {
        const hasNoSpecificRegion = filters.focusRegions.includes(
          'No Specific Focus Region'
        );

        const specificRegions = filters.focusRegions.filter(
          (region) => region !== 'No Specific Focus Region'
        );

        if (specificRegions.length > 0) {
          specificRegions.forEach((region, index) => {
            knowledgeHubQueryParams.append(
              `filters[regions][name][$in][${index}]`,
              region
            );
          });
        }
      }

      if (filters.type && filters.type.length > 0) {
        filters.type.forEach((type, index) => {
          knowledgeHubQueryParams.append(
            `filters[resource_type][$in][${index}]`,
            type
          );
        });
      }

      knowledgeHubQueryParams.append('sort[0]', `date:${dateSort}`);

      knowledgeHubQueryParams.append('populate[0]', 'topic');
      knowledgeHubQueryParams.append('populate[1]', 'regions');
      knowledgeHubQueryParams.append('populate[2]', 'file');
      knowledgeHubQueryParams.append('populate[3]', 'image');

      const response = await axios.get(
        `${BACKEND_URL}/api/knowledge-hubs?${knowledgeHubQueryParams}`
      );

      const knowledgeHubs = response.data.data.map((hub) => ({
        id: hub.id,
        title: hub.title,
        description: hub.description,
        type: hub.resource_type,
        image: hub.image?.url,
        topic: hub.topic?.name || '',
        focusRegions: hub.regions?.map((r) => r.name) || [],
        webLink: hub.web_link,
        publishedAt: hub.date,
        publishedYear: new Date(hub.date).getFullYear(),
      }));

      return {
        data: knowledgeHubs,
        meta: {
          page,
          hasMore: knowledgeHubs.length > 0 && knowledgeHubs.length >= pageSize,
        },
      };
    } catch (error) {
      console.error(
        'Knowledge Hub fetch error:',
        error.response?.data || error.message
      );
      return rejectWithValue(
        error.response?.data?.error || 'Failed to fetch knowledge hubs'
      );
    }
  }
);

export const fetchRelatedKnowledgeHubs = createAsyncThunk(
  'knowledgeHubs/fetchRelatedKnowledgeHubs',
  async ({ topic, currentResourceId, pageSize = 12 }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('pagination[pageSize]', pageSize);

      if (currentResourceId) {
        queryParams.append('filters[id][$ne]', currentResourceId);
      }

      if (topic) {
        queryParams.append('filters[topic][name][$eq]', topic);
      }

      queryParams.append('sort[0]', 'createdAt:desc');

      queryParams.append('populate[0]', 'topic');
      queryParams.append('populate[2]', 'image');

      const response = await axios.get(
        `${BACKEND_URL}/api/knowledge-hubs?${queryParams}`
      );

      const relatedKnowledgeHubs = response.data.data.map((hub) => ({
        id: hub.id,
        title: hub.title,
        description: hub.description,
        image: hub.image?.url,
        topic: hub.topic?.name || '',
      }));

      return {
        data: relatedKnowledgeHubs,
        meta: {
          hasMore: relatedKnowledgeHubs.length > 0,
        },
      };
    } catch (error) {
      console.error(
        'Related Knowledge Hubs fetch error:',
        error.response?.data || error.message
      );
      return rejectWithValue(
        error.response?.data?.error || 'Failed to fetch related knowledge hubs'
      );
    }
  }
);

const knowledgeHubSlice = createSlice({
  name: 'knowledgeHub',
  initialState: {
    knowledgeHubs: [],
    loading: false,
    error: null,
    currentPage: 1,
    hasMore: true,
    relatedKnowledgeHubs: [],
    relatedLoading: false,
    relatedError: null,
  },
  reducers: {
    clearKnowledgeHubs: (state) => {
      state.knowledgeHubs = [];
      state.currentPage = 1;
      state.hasMore = true;
    },
    clearRelatedKnowledgeHubs: (state) => {
      state.relatedKnowledgeHubs = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchKnowledgeHubs.pending, (state, action) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchKnowledgeHubs.fulfilled, (state, action) => {
        const { data, meta } = action.payload;

        if (meta.page === 1) {
          state.knowledgeHubs = data;
        } else {
          state.knowledgeHubs = [...state.knowledgeHubs, ...data];
        }

        state.loading = false;
        state.currentPage = meta.page;
        state.hasMore = meta.hasMore;
      })
      .addCase(fetchKnowledgeHubs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'An error occurred';
      })
      .addCase(fetchRelatedKnowledgeHubs.pending, (state) => {
        state.relatedLoading = true;
        state.relatedError = null;
      })
      .addCase(fetchRelatedKnowledgeHubs.fulfilled, (state, action) => {
        state.relatedKnowledgeHubs = action.payload.data;
        state.relatedLoading = false;
      })
      .addCase(fetchRelatedKnowledgeHubs.rejected, (state, action) => {
        state.relatedLoading = false;
        state.relatedError = action.payload;
      });
  },
});

export const { clearKnowledgeHubs, clearRelatedKnowledgeHubs } =
  knowledgeHubSlice.actions;

export default knowledgeHubSlice.reducer;
