import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { env } from '@/helpers/env-vars';

const BACKEND_URL = env('NEXT_PUBLIC_BACKEND_URL');

export const fetchKnowledgeHubs = createAsyncThunk(
  'knowledgeHubs/fetchKnowledgeHubs',
  async (
    { page = 1, pageSize = 12, query = '', filters = {} },
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

      if (filters.thematicFocus && filters.thematicFocus.length > 0) {
        filters.thematicFocus.forEach((focus, index) => {
          knowledgeHubQueryParams.append(
            `filters[thematic][name][$in][${index}]`,
            focus
          );
        });
      }

      if (filters.focusRegions && filters.focusRegions.length > 0) {
        filters.focusRegions.forEach((region, index) => {
          knowledgeHubQueryParams.append(
            `filters[regions][name][$in][${index}]`,
            region
          );
        });
      }

      if (filters.type && filters.type.length > 0) {
        filters.type.forEach((type, index) => {
          knowledgeHubQueryParams.append(
            `filters[resource_type][$in][${index}]`,
            type
          );
        });
      }

      knowledgeHubQueryParams.append('sort[0]', 'title:asc');

      knowledgeHubQueryParams.append('populate[0]', 'thematic');
      knowledgeHubQueryParams.append('populate[1]', 'regions');
      knowledgeHubQueryParams.append('populate[2]', 'file');

      const response = await axios.get(
        `${BACKEND_URL}/api/knowledge-hubs?${knowledgeHubQueryParams}`
      );

      const knowledgeHubs = response.data.data.map((hub) => ({
        id: hub.id,
        title: hub.title,
        description: hub.description,
        type: hub.resource_type,
        image: 'https://placehold.co/400x300',
        thematicFocus: hub.thematic?.name || '',
        focusRegions: hub.regions?.map((r) => r.name) || [],
        webLink: hub.web_link,
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
  async (
    { thematicFocus, currentResourceId, pageSize = 12 },
    { rejectWithValue }
  ) => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('pagination[pageSize]', pageSize);

      if (currentResourceId) {
        queryParams.append('filters[id][$ne]', currentResourceId);
      }

      if (thematicFocus) {
        queryParams.append('filters[thematic][name][$eq]', thematicFocus);
      }

      queryParams.append('sort[0]', 'createdAt:desc');

      queryParams.append('populate[0]', 'thematic');

      const response = await axios.get(
        `${BACKEND_URL}/api/knowledge-hubs?${queryParams}`
      );

      const relatedKnowledgeHubs = response.data.data.map((hub) => ({
        id: hub.id,
        title: hub.title,
        description: hub.description,
        image:
          hub.attributes.file?.data?.attributes?.url ||
          'https://placehold.co/400x300',
        thematicFocus: hub.thematic?.name || '',
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
