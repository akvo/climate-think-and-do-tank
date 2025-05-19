import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { env } from '@/helpers/env-vars';

const BACKEND_URL = env('NEXT_PUBLIC_BACKEND_URL');

export const fetchKnowledgeHubs = createAsyncThunk(
  'knowledgeHubs/fetchKnowledgeHubs',
  async (
    { page = 1, pageSize = 12, query = '', filters = {}, dateSort = 'desc' },
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
      if (filters.date && filters.date.length > 0) {
        if (Array.isArray(filters.date) && filters.date.length > 0) {
          const yearNumbers = filters.date.map((year) => parseInt(year));
          const minYear = Math.min(...yearNumbers);
          const maxYear = Math.max(...yearNumbers);

          knowledgeHubQueryParams.append(
            'filters[publication_date][$gte]',
            `${minYear}-01-01`
          );

          knowledgeHubQueryParams.append(
            'filters[publication_date][$lte]',
            `${maxYear}-12-31`
          );
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
        const hasFile = filters.type.includes('File');
        const hasLink = filters.type.includes('Link');

        if (hasFile && hasLink) {
          knowledgeHubQueryParams.append('filters[file][id][$notNull]', true);
          knowledgeHubQueryParams.append('filters[web_link][$notNull]', true);
        } else {
          if (hasFile) {
            knowledgeHubQueryParams.append('filters[file][id][$notNull]', true);
          }

          if (hasLink) {
            knowledgeHubQueryParams.append('filters[web_link][$notNull]', true);
          }
        }
      }

      knowledgeHubQueryParams.append('sort[0]', `publication_date:${dateSort}`);

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
        file: hub.file?.url,
        image: hub.image?.url,
        topic: hub.topic?.name || '',
        focusRegions: hub.regions?.map((r) => r.name) || [],
        webLink: hub.web_link,
        publishedAt: hub.publication_date,
        publishedYear: new Date(hub.publication_date).getFullYear(),
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
