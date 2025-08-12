import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Calendar,
  Newspaper,
  LayoutGrid,
  List,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchNewsEvents,
  clearNewsEvents,
} from '@/store/slices/newsEventsSlice';
import debounce from 'lodash/debounce';
import Image from 'next/image';
import {
  formatRegionsDisplay,
  getImageUrl,
  generatePageNumbers,
} from '@/helpers/utilities';
import HeroSection from '@/components/Hero';
import FilterSection from '@/components/FilterSection';

export default function NewsEventsDirectory() {
  const router = useRouter();
  const dispatch = useDispatch();

  const {
    data: newsEventsData,
    loading,
    currentPage: dataCurrentPage,
    hasMore,
    total,
  } = useSelector((state) => state.newsEvents);

  const { regions = [] } = useSelector((state) => state.auth);

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage] = useState(12);
  const [filters, setFilters] = useState({
    types: [],
    focusRegions: [],
    upcoming: 'Upcoming',
  });

  useEffect(() => {
    if (!router.isReady) return;

    const query = router.query;
    const search = query.search || '';
    const types = query.types ? query.types.split(',').filter(Boolean) : [];
    const regions = query.focusRegions
      ? query.focusRegions.split(',').filter(Boolean)
      : [];
    const sortOrder = query.sort || 'desc';
    const isUpcoming = query.upcoming !== 'false';

    setSearchQuery(search);
    setFilters({
      types: types,
      focusRegions: regions,
      upcoming: isUpcoming ? 'Upcoming' : 'Past',
    });
    setSortOrder(sortOrder);

    dispatch(clearNewsEvents());
    dispatch(
      fetchNewsEvents({
        page: 1,
        query: search,
        filters: {
          types: types,
          focusRegions: regions,
        },
        upcoming: isUpcoming,
        dateSort: sortOrder,
      })
    );
  }, [router.isReady, router.query, dispatch]);

  const updateUrlAndFetch = (newFilters, newQuery, newSort) => {
    const query = {};
    if (newQuery) query.search = newQuery;
    if (newSort !== 'desc') query.sort = newSort;
    if (newFilters.types.length > 0 && newFilters.types.length < 2)
      query.types = newFilters.types.join(',');
    if (newFilters.focusRegions && newFilters.focusRegions.length > 0)
      query.focusRegions = newFilters.focusRegions.join(',');
    if (newFilters.upcoming === 'Past') query.upcoming = 'false';

    router.push(
      {
        pathname: router.pathname,
        query,
      },
      undefined,
      { shallow: true }
    );

    dispatch(clearNewsEvents());
    dispatch(
      fetchNewsEvents({
        page: 1,
        query: newQuery,
        filters: {
          types: newFilters.types,
          focusRegions: newFilters.focusRegions,
        },
        upcoming: newFilters.upcoming === 'Upcoming',
        dateSort: newSort,
      })
    );
  };

  const handleFilterChange = (filterKey, values) => {
    const newFilters = {
      ...filters,
      [filterKey]: values,
    };
    setFilters(newFilters);
    updateUrlAndFetch(newFilters, searchQuery, sortOrder);
  };

  const handleClearFilters = () => {
    const emptyFilters = {
      types: ['News', 'Event'],
      focusRegions: [],
      upcoming: 'Upcoming',
    };
    setFilters(emptyFilters);
    setSearchQuery('');
    updateUrlAndFetch(emptyFilters, '', sortOrder);
  };

  const handleSearch = useCallback(
    debounce((query) => {
      setSearchQuery(query);
      updateUrlAndFetch(filters, query, sortOrder);
    }, 500),
    [filters, sortOrder]
  );

  const handleSortChange = () => {
    const newOrder = sortOrder === 'desc' ? 'asc' : 'desc';
    setSortOrder(newOrder);
    updateUrlAndFetch(filters, searchQuery, newOrder);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    dispatch(
      fetchNewsEvents({
        page: page,
        query: searchQuery,
        filters: {
          types: filters.types,
          focusRegions: filters.focusRegions,
        },
        upcoming: filters.upcoming === 'Upcoming',
        dateSort: sortOrder,
      })
    );
  };

  const handleCardClick = (item) => {
    if (item.type === 'News') {
      router.push(`/news/${item.documentId}`);
    } else if (item.type === 'Event') {
      router.push(`/event/${item.documentId}`);
    }
  };

  const totalResults = total || 0;
  const totalPages = Math.ceil(totalResults / resultsPerPage);
  const endResult = Math.min(currentPage * resultsPerPage, totalResults);

  return (
    <div className="min-h-screen bg-white">
      <HeroSection
        searchTerm={searchQuery}
        setSearchTerm={handleSearch}
        pageTitle="News & Events"
        pageDescription="Stay updated with the latest industry news, announcements, and upcoming events."
      />

      <div className="container mx-auto mt-[-31px] relative z-10">
        <FilterSection
          filters={{
            region: filters.focusRegions,
            type: filters.types,
            upcoming: [filters.upcoming],
          }}
          onFilterChange={(filterKey, values) => {
            if (filterKey === 'region') {
              handleFilterChange('focusRegions', values);
            } else if (filterKey === 'upcoming') {
              handleFilterChange('upcoming', values[0] || 'Upcoming');
            } else {
              handleFilterChange(filterKey, values);
            }
          }}
          onClearFilters={handleClearFilters}
          visibleFilters={['type', 'region']}
        />
      </div>

      {/* Main Content Section */}
      <div className="min-h-screen py-8 px-4 md:px-0">
        <div className="container mx-auto">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="text-gray-600">
              <span className="font-bold text-primary-600">{endResult}</span>
              <span className="text-gray-400"> / {totalResults} Results</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Sort by</span>
                <button
                  onClick={handleSortChange}
                  className="bg-white border border-primary-500 rounded-full px-6 py-2 text-sm font-bold text-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 flex items-center gap-2 hover:bg-primary-50 transition-colors"
                >
                  <span>Date</span>
                  {sortOrder === 'asc' ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>

              <div className="flex items-center bg-white rounded-lg border border-gray-200 p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list'
                      ? 'bg-gray-100 text-gray-600'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-gray-100 text-gray-600'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && newsEventsData.length === 0 ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <>
              {/* News/Events Grid or List */}
              <div
                className={`${
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'space-y-6'
                }`}
              >
                {newsEventsData.map((item) => (
                  <div
                    key={item.id}
                    className={`bg-white rounded-lg overflow-hidden shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300 cursor-pointer ${
                      viewMode === 'list' ? 'flex' : 'flex flex-col h-full'
                    }`}
                    onClick={() => handleCardClick(item)}
                  >
                    {viewMode === 'list' ? (
                      // List View Layout
                      <>
                        <div className="relative w-48 h-full overflow-hidden">
                          {item.imageUrl ? (
                            <Image
                              src={getImageUrl(item.imageUrl)}
                              alt={item.title}
                              className="w-full h-full object-cover"
                              unoptimized
                              fill
                              onError={(e) => {
                                e.target.style.display = 'none';
                                const parent = e.target.parentNode;
                                if (parent) {
                                  parent.innerHTML = `
                                    <div class="w-full h-full bg-blue-500 flex items-center justify-center text-white font-bold text-2xl">
                                      ${item.title.charAt(0).toUpperCase()}
                                    </div>
                                  `;
                                }
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white font-bold text-2xl">
                              {item.title.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 p-5">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg font-semibold line-clamp-1">
                              {item.title}
                            </h3>
                            {item.regions && item.regions.length > 0 && (
                              <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full ml-2">
                                {formatRegionsDisplay(item.regions, regions)}
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 mb-3 line-clamp-2">
                            {item.description}
                          </p>
                          <div className="flex items-center justify-between">
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
                              {item.displayDate || ''}
                            </time>
                          </div>
                        </div>
                      </>
                    ) : (
                      // Grid View Layout
                      <>
                        <div className="relative h-48 w-full overflow-hidden">
                          {item.imageUrl ? (
                            <Image
                              src={getImageUrl(item.imageUrl)}
                              alt={item.title}
                              className="w-full h-full object-cover"
                              unoptimized
                              fill
                              onError={(e) => {
                                e.target.style.display = 'none';
                                const parent = e.target.parentNode;
                                if (parent) {
                                  parent.innerHTML = `
                                    <div class="w-full h-full bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-2xl">
                                      ${item.title.charAt(0).toUpperCase()}
                                    </div>
                                  `;
                                }
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-2xl">
                              {item.title.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="p-5 flex flex-col flex-1">
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
                          <p className="text-gray-600 mb-4 line-clamp-3 flex-1">
                            {item.description}
                          </p>

                          <div className="flex justify-between items-center mt-auto pt-4">
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
                              {item.displayDate || ''}
                            </time>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* No Results */}
              {newsEventsData.length === 0 && !loading && (
                <div className="text-center py-12">
                  <h3 className="text-lg font-semibold text-gray-900">
                    No results found
                  </h3>
                  <p className="text-gray-600 mt-2">
                    Try adjusting your filters or search terms
                  </p>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-12">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="font-medium">Previous</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {generatePageNumbers(currentPage, totalPages).map(
                      (page, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            typeof page === 'number' && handlePageChange(page);
                          }}
                          className={`w-10 h-10 rounded-[50%] font-medium transition-colors ${
                            page === currentPage
                              ? 'bg-primary-100 text-primary-600'
                              : page === '...'
                              ? 'text-gray-400 cursor-default'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                          disabled={page === '...'}
                        >
                          {page}
                        </button>
                      )
                    )}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="font-medium">Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
