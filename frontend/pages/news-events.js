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
  MapPin,
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
  });
  console.log('filters', filters);
  useEffect(() => {
    if (!router.isReady) return;

    const query = router.query;
    const search = query.search || '';
    const types = query.types ? query.types.split(',').filter(Boolean) : [];
    const regions = query.focusRegions
      ? query.focusRegions.split(',').filter(Boolean)
      : [];
    const sortOrder = query.sort || 'desc';

    setSearchQuery(search);
    setFilters({
      types: types,
      focusRegions: regions,
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
      types: [],
      focusRegions: [],
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
        searchText={'Search News & Events'}
      />

      <div className="container mx-auto mt-[-31px] relative z-10">
        <FilterSection
          filters={{
            region: filters.focusRegions,
            type: filters.types,
          }}
          onFilterChange={(filterKey, values) => {
            if (filterKey === 'region') {
              handleFilterChange('focusRegions', values);
            } else if (filterKey === 'type') {
              handleFilterChange('types', values);
            }
          }}
          isNewsEvents={true}
          onClearFilters={handleClearFilters}
          visibleFilters={['region', 'type']}
        />
      </div>

      <div className="min-h-screen py-8 px-4 md:px-0">
        <div className="container mx-auto">
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
            </div>
          </div>

          {loading && newsEventsData.length === 0 ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {newsEventsData.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer group  border border-primary-50"
                    onClick={() => handleCardClick(item)}
                  >
                    <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                      {item.imageUrl ? (
                        <Image
                          src={getImageUrl(item.imageUrl)}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          fill
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                          <span className="text-white text-4xl font-bold">
                            {item.title.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}

                      <div className="absolute top-4 left-4">
                        <span
                          className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium ${
                            item.type === 'Event'
                              ? 'bg-primary-50 text-primary-600'
                              : 'bg-primary-50 text-primary-600'
                          }`}
                        >
                          {item.type === 'Event' ? (
                            <>
                              <Calendar size={14} className="mr-1.5" />
                              Event
                            </>
                          ) : (
                            <>
                              <Newspaper size={14} className="mr-1.5" />
                              News
                            </>
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="flex items-center justify-between mb-3 text-sm">
                        {item.regions && item.regions.length > 0 && (
                          <div className="flex items-center text-primary-600">
                            <MapPin size={14} className="mr-1" />
                            <span className="font-medium">
                              {formatRegionsDisplay(item.regions, regions)}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center text-black font-bold">
                          <Calendar size={14} className="mr-1" />
                          <time>{item.displayDate || ''}</time>
                        </div>
                      </div>

                      <h3 className="text-lg font-semibold mb-3 line-clamp-2 text-black transition-colors flex items-center gap-2 justify-between">
                        {item.title}

                        <div className="flex justify-end">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                            <ChevronRight
                              size={16}
                              className="text-gray-600 group-hover:text-primary-600"
                            />
                          </div>
                        </div>
                      </h3>

                      <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
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
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-12">
                  <button
                    onClick={() => {
                      const newPage = currentPage - 1;
                      setCurrentPage(newPage);
                      handlePageChange(newPage);
                    }}
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
                            if (typeof page === 'number') {
                              setCurrentPage(page);
                              handlePageChange(page);
                            }
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
                    onClick={() => {
                      const newPage = currentPage + 1;
                      setCurrentPage(newPage);
                      handlePageChange(newPage);
                    }}
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
