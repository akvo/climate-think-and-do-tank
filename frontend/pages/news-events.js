import { useState, useEffect, useCallback } from 'react';
import { Search, Calendar, Newspaper } from 'lucide-react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchNewsEvents,
  clearNewsEvents,
} from '@/store/slices/newsEventsSlice';
import CheckboxFilter from '@/components/CheckboxFilter';
import debounce from 'lodash/debounce';
import Image from 'next/image';
import { formatRegionsDisplay, getImageUrl } from '@/helpers/utilities';

export default function NewsEventsDirectory() {
  const router = useRouter();
  const dispatch = useDispatch();

  const {
    data: newsEventsData,
    loading,
    currentPage,
    hasMore,
  } = useSelector((state) => state.newsEvents);

  const { regions = [] } = useSelector((state) => state.auth);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    types: ['News', 'Event'],
  });
  const [sortConfig, setSortConfig] = useState({
    field: 'event_date',
    order: 'desc',
  });
  const [openFilter, setOpenFilter] = useState(null);
  const [upcoming, setUpcoming] = useState(true);

  const filterOptions = {
    types: ['News', 'Event'],
  };

  useEffect(() => {
    if (!router.isReady) return;

    const query = router.query;
    const search = query.search || '';
    const types = query.types
      ? query.types.split(',').filter(Boolean)
      : ['News', 'Event'];
    const sortOrder = query.sortOrder || 'desc';
    const isUpcoming = query.upcoming !== 'false';

    setSearchQuery(search);
    setActiveFilters({
      types: types.filter((t) => filterOptions.types.includes(t)),
    });
    setSortConfig({
      field: 'event_date',
      order: sortOrder,
    });
    setUpcoming(isUpcoming);

    dispatch(clearNewsEvents());
    dispatch(
      fetchNewsEvents({
        page: 1,
        query: search,
        filters: {
          types: types.filter((t) => filterOptions.types.includes(t)),
        },
        upcoming: isUpcoming,
        dateSort: sortOrder,
      })
    );
  }, [router.isReady, router.query]);

  const updateQueryParams = useCallback(
    (filters, sort, search, isUpcoming) => {
      const params = {};
      if (search) params.search = search;
      if (sort.order !== 'desc') params.sortOrder = sort.order;
      if (filters.types.length > 0 && filters.types.length < 2)
        params.types = filters.types.join(',');
      if (!isUpcoming) params.upcoming = 'false';

      router.push(
        {
          pathname: router.pathname,
          query: params,
        },
        undefined,
        { shallow: true }
      );
    },
    [router]
  );

  const handleSearch = useCallback(
    debounce((value) => {
      updateQueryParams(activeFilters, sortConfig, value, upcoming);
    }, 500),
    [updateQueryParams, activeFilters, sortConfig, upcoming]
  );

  const handleSort = () => {
    const newOrder = sortConfig.order === 'desc' ? 'asc' : 'desc';
    updateQueryParams(
      activeFilters,
      { ...sortConfig, order: newOrder },
      searchQuery,
      upcoming
    );
  };

  const handleFilterApply = (filterType, selectedOptions) => {
    const newFilters = {
      ...activeFilters,
      [filterType]: selectedOptions,
    };
    updateQueryParams(newFilters, sortConfig, searchQuery, upcoming);
    setOpenFilter(null);
  };

  const toggleUpcoming = (isUpcoming) => {
    setUpcoming(isUpcoming);
    updateQueryParams(activeFilters, sortConfig, searchQuery, isUpcoming);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setActiveFilters({
      types: ['News', 'Event'],
    });

    router.push(
      {
        pathname: router.pathname,
        query: { upcoming: upcoming ? undefined : 'false' },
      },
      undefined,
      { shallow: true }
    );

    dispatch(clearNewsEvents());
    dispatch(
      fetchNewsEvents({
        page: 1,
        query: '',
        filters: {
          types: ['News', 'Event'],
        },
        upcoming,
        dateSort: sortConfig.order,
      })
    );
  };

  const loadMoreData = () => {
    dispatch(
      fetchNewsEvents({
        page: currentPage + 1,
        query: searchQuery,
        filters: activeFilters,
        upcoming,
        dateSort: sortConfig.order,
      })
    );
  };

  const hasActiveFilters =
    (router.query.types &&
      router.query.types.length > 0 &&
      router.query.types !== 'News,Event') ||
    (router.query.search && router.query.search.length > 0);

  const handleCardClick = (item) => {
    if (item.type === 'News') {
      router.push(`/news/${item.documentId}`);
    } else if (item.type === 'Event') {
      router.push(`/event/${item.documentId}`);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="py-4 px-4 bg-[#f1f3f5] text-black">
        <div className="container mx-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch(searchQuery);
            }}
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Search news & events..."
                className="w-full pl-4 pr-10 py-3 rounded-[26px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleSearch(e.target.value);
                }}
              />
              <button
                type="submit"
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Search size={20} />
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="border-b relative">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-6 justify-between">
            <div className="flex gap-6 flex-wrap items-center">
              <div className="flex rounded-md overflow-hidden border border-gray-200 mr-4">
                <button
                  onClick={() => toggleUpcoming(true)}
                  className={`px-4 py-1.5 text-sm ${
                    upcoming
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Upcoming
                </button>
                <button
                  onClick={() => toggleUpcoming(false)}
                  className={`px-4 py-1.5 text-sm ${
                    !upcoming
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Past
                </button>
              </div>

              {Object.keys(filterOptions).map((filterType) => (
                <div key={filterType} className="relative filter-dropdown">
                  <button
                    onClick={() =>
                      setOpenFilter(
                        openFilter === filterType ? null : filterType
                      )
                    }
                    className="text-gray-700 hover:text-gray-900 flex items-center gap-1"
                  >
                    {filterType === 'types'
                      ? 'Type'
                      : filterType.charAt(0).toUpperCase() +
                        filterType.slice(1)}
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  {openFilter === filterType && (
                    <div className="absolute top-full left-0 mt-2 z-10 min-w-[400px]">
                      {filterType === 'types' ? (
                        <CheckboxFilter
                          label="Type"
                          options={filterOptions.types}
                          initialSelected={
                            activeFilters.types.length === 0
                              ? ['News', 'Event']
                              : activeFilters.types
                          }
                          hasAllOption={false}
                          onApply={(selectedTypes) => {
                            handleFilterApply('types', selectedTypes);
                          }}
                          onClear={() =>
                            handleFilterApply('types', ['News', 'Event'])
                          }
                        />
                      ) : null}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4">
              {hasActiveFilters && (
                <button
                  className="text-green-600 hover:text-green-700"
                  onClick={handleClearFilters}
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        </div>

        {activeFilters.types?.length < 2 && activeFilters.types.length > 0 && (
          <div className="container mx-auto px-4 pb-3 text-black">
            <div className="flex items-center gap-2 flex-wrap">
              {Object.entries(activeFilters).map(([filterType, values]) => {
                if (filterType === 'types' && values.length === 2) {
                  return null;
                }

                return values.map((value) => (
                  <span
                    key={`${filterType}-${value}`}
                    className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                  >
                    {value}
                    <button
                      onClick={() => {
                        let newValues;
                        if (filterType === 'types') {
                          newValues = values.filter((v) => v !== value);
                          if (newValues.length === 0) {
                            newValues = ['News', 'Event'];
                          }
                        } else {
                          newValues = values.filter((v) => v !== value);
                        }

                        const newFilters = {
                          ...activeFilters,
                          [filterType]: newValues,
                        };
                        setActiveFilters(newFilters);
                        updateQueryParams(
                          newFilters,
                          sortConfig,
                          searchQuery,
                          upcoming
                        );
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </span>
                ));
              })}
            </div>
          </div>
        )}
      </div>

      <div className="container mx-auto px-4 py-8">
        {loading && newsEventsData.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {newsEventsData.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                  onClick={() => handleCardClick(item)}
                >
                  {item.imageUrl && (
                    <div className="relative h-48 w-full overflow-hidden">
                      <Image
                        src={getImageUrl(item.imageUrl)}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        unoptimized
                        fill
                      />
                    </div>
                  )}

                  <div className="p-5">
                    {item.regions && item.regions.length > 0 && (
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">
                          {formatRegionsDisplay(item.regions, regions)}
                        </span>
                      </div>
                    )}

                    <h3 className="text-lg font-semibold mb-3 line-clamp-2">
                      {item.title}
                    </h3>

                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {item.description}
                    </p>

                    <div className="flex justify-between items-center mt-4">
                      <div className="flex items-center text-sm text-gray-500">
                        {item.type === 'Event' ? (
                          <>
                            <Calendar size={16} className="mr-1" />
                            <span>Event</span>
                          </>
                        ) : (
                          <>
                            <Newspaper size={16} className="mr-1" />
                            <span>News</span>
                          </>
                        )}
                      </div>

                      <time className="text-sm text-gray-500">
                        {item.displayDate ? item.displayDate : ''}
                      </time>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {newsEventsData.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold text-gray-900">
                  No results found
                </h3>
                <p className="text-gray-600 mt-2">
                  Try adjusting your filters or search terms
                </p>
              </div>
            )}

            {hasMore && newsEventsData.length > 0 && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={loadMoreData}
                  disabled={loading}
                  className="px-8 py-3 bg-zinc-900 text-white rounded-md hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
