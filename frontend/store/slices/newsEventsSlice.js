import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { env } from '@/helpers/env-vars';

const BACKEND_URL = env('NEXT_PUBLIC_BACKEND_URL');

export const fetchNewsEvents = createAsyncThunk(
  'newsEvents/fetchNewsEvents',
  async (
    { page = 1, pageSize = 12, query = '', filters = {}, upcoming = true },
    { rejectWithValue }
  ) => {
    try {
      const today = new Date().toISOString().split('T')[0];

      const fetchNews = !filters.types || filters.types.includes('News');
      const fetchEvents = !filters.types || filters.types.includes('Event');

      const promises = [];

      if (fetchNews) {
        const newsQueryParams = new URLSearchParams();
        newsQueryParams.append('pagination[page]', page);
        newsQueryParams.append('pagination[pageSize]', pageSize);

        if (query) {
          newsQueryParams.append('filters[$or][0][title][$containsi]', query);
          newsQueryParams.append(
            'filters[$or][1][description][$containsi]',
            query
          );
        }

        if (filters.focusRegions && filters.focusRegions.length > 0) {
          filters.focusRegions.forEach((region, index) => {
            newsQueryParams.append(
              `filters[regions][name][$in][${index}]`,
              region
            );
          });
        }

        let thirtyDaysAgo = new Date();
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];

        if (upcoming) {
          newsQueryParams.append('filters[publication_date][$gte]', todayStr);
        } else {
          newsQueryParams.append('filters[publication_date][$lt]', todayStr);
        }

        newsQueryParams.append('populate[0]', 'regions');
        newsQueryParams.append('populate[1]', 'image');

        promises.push(
          axios
            .get(`${BACKEND_URL}/api/news?${newsQueryParams}`)
            .then((response) => {
              return response.data.data.map((item) => ({
                id: item.id,
                documentId: item.documentId,
                collectionType: 'news',
                title: item.title || '',
                description: item.description || '',
                type: 'News',
                publicationDate: item.publication_date || null,
                displayDate: item.publication_date,
                regions: item.regions ? item.regions.map((r) => r.name) : [],
                imageUrl: item.image ? item.image : '',
                isUpcoming: false,
                isRecent:
                  new Date(item.publication_date) >= new Date(thirtyDaysAgo),
              }));
            })
            .catch((error) => {
              console.error('News fetch error:', error);
              return [];
            })
        );
      }

      if (fetchEvents) {
        const eventsQueryParams = new URLSearchParams();
        eventsQueryParams.append('pagination[page]', page);
        eventsQueryParams.append('pagination[pageSize]', pageSize);

        if (query) {
          eventsQueryParams.append('filters[$or][0][title][$containsi]', query);
          eventsQueryParams.append(
            'filters[$or][1][description][$containsi]',
            query
          );
        }

        if (filters.focusRegions && filters.focusRegions.length > 0) {
          filters.focusRegions.forEach((region, index) => {
            eventsQueryParams.append(
              `filters[regions][name][$in][${index}]`,
              region
            );
          });
        }

        if (upcoming) {
          eventsQueryParams.append('filters[event_date][$gte]', today);
        } else {
          eventsQueryParams.append('filters[event_date][$lt]', today);
        }

        eventsQueryParams.append('populate[0]', 'regions');
        eventsQueryParams.append('populate[1]', 'image');

        promises.push(
          axios
            .get(`${BACKEND_URL}/api/events?${eventsQueryParams}`)
            .then((response) => {
              return response.data.data.map((item) => ({
                id: item.id,
                documentId: item.documentId,
                collectionType: 'events',
                title: item.title || '',
                description: item.description || '',
                type: 'Event',
                eventDate: item.event_date || null,
                displayDate: item.event_date,
                imageUrl: item.image ? item.image : '',
                isUpcoming: new Date(item.event_date) >= new Date(today),
                location: item.map_link || '',
                startTime: item.start_time || '',
                endTime: item.end_time || '',
                regions: item.regions ? item.regions.map((r) => r.name) : [],
              }));
            })
            .catch((error) => {
              console.error('Events fetch error:', error);
              return [];
            })
        );
      }

      const results = await Promise.all(promises);

      let combinedResults = [].concat(...results);

      const startIndex = 0;
      const endIndex = Math.min(pageSize, combinedResults.length);
      const paginatedResults = combinedResults.slice(startIndex, endIndex);

      return {
        data: paginatedResults,
        meta: {
          page,
          hasMore: combinedResults.length > endIndex,
        },
      };
    } catch (error) {
      console.error(
        'News & Events fetch error:',
        error.response?.data || error.message
      );
      return rejectWithValue(
        error.response?.data?.error || 'Failed to fetch news and events'
      );
    }
  }
);

export const clearNewsEvents = createAsyncThunk(
  'newsEvents/clearNewsEvents',
  async () => {
    return;
  }
);

const newsEventsSlice = createSlice({
  name: 'newsEvents',
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
      .addCase(fetchNewsEvents.pending, (state, action) => {
        state.loading = true;
        state.error = null;

        if (action.meta.arg.page === 1) {
          state.data = [];
          state.currentPage = 0;
        }
      })
      .addCase(fetchNewsEvents.fulfilled, (state, action) => {
        state.loading = false;

        if (action.meta.arg.page === 1) {
          state.data = action.payload.data;
        } else {
          state.data = [...state.data, ...action.payload.data];
        }

        state.currentPage = action.meta.arg.page;
        state.hasMore = action.payload.meta.hasMore;
      })
      .addCase(fetchNewsEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch data';
      })
      .addCase(clearNewsEvents.fulfilled, (state) => {
        state.data = [];
        state.currentPage = 0;
        state.hasMore = true;
      });
  },
});

export default newsEventsSlice.reducer;
