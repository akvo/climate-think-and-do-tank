import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowDownWideNarrow, ArrowUpWideNarrow, Search } from 'lucide-react';
import { useRouter } from 'next/router';
import { useSearchParams } from 'next/navigation';
import OrganizationModal from '@/components/OrganizationModal';
import { useDispatch, useSelector } from 'react-redux';
import {
  clearInvestmentOpportunityProfiles,
  fetchInvestmentOpportunityProfiles,
} from '@/store/slices/investmentOpportunitySlice';
import LocationsFilter from '@/components/LocationFilter';
import TopicsFilter from '@/components/TopicFilter';
import debounce from 'lodash/debounce';

export default function InvestmentOpportunityProfile() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const isInitialLoad = useRef(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    valueChain: [],
    date: [],
    regions: [],
  });
  const [openFilter, setOpenFilter] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    field: 'publication_date',
    order: 'desc',
  });

  const {
    investmentOpportunityProfiles,
    loading,
    error,
    currentPage,
    hasMore,
  } = useSelector((state) => state.investmentOpportunity);

  const { regions = [], valueChains = [] } = useSelector((state) => state.auth);

  const filterOptions = {
    valueChain: [
      'All',
      ...valueChains
        .map((topic) => topic.name || topic.attributes?.name)
        .filter(Boolean),
    ],
    regions: [
      'All Locations',
      ...regions.map((region) => region.name || region.attributes?.name),
    ],
    date: ['All Time', 'Last Year', 'This Year', 'Last 5 Years'],
  };

  useEffect(() => {
    const handleInitialLoad = () => {
      const search = searchParams.get('search') || '';
      const valueChain =
        searchParams.get('valueChain')?.split(',').filter(Boolean) || [];
      const date = searchParams.get('date')?.split(',').filter(Boolean) || [];
      const regions =
        searchParams.get('regions')?.split(',').filter(Boolean) || [];
      const sortBy = searchParams.get('sortBy') || 'publication_date';
      const sortOrder = searchParams.get('sortOrder') || 'desc';

      setSearchQuery(search);
      setActiveFilters({
        valueChain: valueChain.filter((vc) =>
          filterOptions.valueChain.includes(vc)
        ),
        date: date.filter((d) => filterOptions.date.includes(d)),
        regions: regions.filter((r) => filterOptions.regions.includes(r)),
      });
      setSortConfig({
        field: sortBy,
        order: sortOrder,
      });
      dispatch(clearInvestmentOpportunityProfiles());
    };

    handleInitialLoad();
  }, []);

  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }

    if (!loading) {
      updateQueryParams(activeFilters, sortConfig, searchQuery);
      loadData();
    }
  }, [activeFilters, sortConfig, searchQuery]);

  const updateQueryParams = useCallback(
    (filters, sort, search) => {
      const params = new URLSearchParams();

      if (search) params.set('search', search);
      if (sort.field !== 'publication_date') params.set('sortBy', sort.field);
      if (sort.order !== 'desc') params.set('sortOrder', sort.order);

      Object.entries(filters).forEach(([key, values]) => {
        if (values.length > 0) {
          params.set(key, values.join(','));
        }
      });

      const newUrl = `?${params.toString()}`;
      if (newUrl !== window.location.search) {
        router.push(newUrl, undefined, { shallow: true });
      }
    },
    [router]
  );

  const loadData = useCallback(
    debounce((isLoadMore = false) => {
      dispatch(
        fetchInvestmentOpportunityProfiles({
          page: isLoadMore ? currentPage + 1 : 1,
          query: searchQuery,
          filters: {
            valueChain: activeFilters.valueChain,
            regions: activeFilters.regions,
          },
          dateSort: sortConfig.order,
          dateFilter:
            activeFilters.date.length > 0
              ? activeFilters.date[0].toLowerCase().replace(' ', '_')
              : null,
        })
      );
    }, 300),
    [
      dispatch,
      currentPage,
      searchQuery,
      activeFilters.valueChain,
      activeFilters.regions,
      activeFilters.date,
      sortConfig.order,
    ]
  );

  const toggleFilter = (type, value) => {
    setActiveFilters((prev) => ({
      ...prev,
      [type]:
        type === 'date'
          ? prev[type][0] === value
            ? []
            : [value]
          : prev[type].includes(value)
          ? prev[type].filter((item) => item !== value)
          : [...prev[type], value],
    }));
  };

  const handleCardClick = (card) => {
    setSelectedCard(card);
    setIsModalOpen(true);
  };

  const handleSearch = useCallback(
    debounce((query) => {
      // Update URL
      const queryParams = { ...router.query };
      if (query) {
        queryParams.search = query;
      } else {
        delete queryParams.search;
      }

      router.push(
        {
          pathname: router.pathname,
          query: queryParams,
        },
        undefined,
        { shallow: true }
      );

      // Dispatch search action
      dispatch(
        fetchInvestmentOpportunityProfiles({
          page: 1,
          query,
          filters: {
            valueChain: activeFilters.valueChain,
            regions: activeFilters.regions,
          },
          dateSort: sortConfig.order,
          dateFilter:
            activeFilters.date.length > 0
              ? activeFilters.date[0].toLowerCase().replace(' ', '_')
              : null,
        })
      );
    }, 500),
    [
      router,
      dispatch,
      activeFilters.valueChain,
      activeFilters.regions,
      activeFilters.date,
      sortConfig.order,
    ]
  );

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  const handleSort = () => {
    setSortConfig((prev) => ({
      field: 'publication_date',
      order: prev.order === 'desc' ? 'asc' : 'desc',
    }));
  };

  const hasActiveFilters =
    Object.values(activeFilters).some((filter) => filter.length > 0) ||
    searchQuery !== '';
  const updateFilters = (newFilters) => {
    const query = {};
    if (searchQuery) query.query = searchQuery;
    if (newFilters.valueChain.length > 0)
      query.valueChain = newFilters.valueChain.join(',');
    if (newFilters.regions.length > 0)
      query.regions = newFilters.regions.join(',');
    if (newFilters.date.length > 0) query.date = newFilters.date[0];

    router.push(
      {
        pathname: router.pathname,
        query: { ...query },
      },
      undefined,
      { shallow: true }
    );
  };

  const clearFilters = () => {
    const emptyFilters = {
      valueChain: [],
      regions: [],
      date: [],
    };

    setActiveFilters(emptyFilters);
    setSearchQuery('');

    const query = { ...router.query };
    delete query.valueChain;
    delete query.regions;
    delete query.date;
    delete query.search;
    delete query.query;

    router.push(
      {
        pathname: router.pathname,
        query,
      },
      undefined,
      { shallow: true }
    );

    dispatch(clearInvestmentOpportunityProfiles());
    loadData();
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="py-4 px-4 bg-[#f1f3f5] text-black">
        <div className="container mx-auto">
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <input
                type="text"
                placeholder="Try keywords like: 'tilapia' or 'horticulture'"
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

      {/* Filters */}
      <div className="border-b relative">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-6 justify-between">
            <div className="flex gap-6 flex-wrap">
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
                    {filterType === 'valueChain'
                      ? 'Value Chain'
                      : filterType === 'regions'
                      ? 'Focus Regions'
                      : filterType === 'date'
                      ? 'Publication Date'
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
                    <div className="absolute top-full left-0 mt-2 z-10 min-w-[600px]">
                      {filterType === 'valueChain' ? (
                        <TopicsFilter
                          label="Value Chain"
                          topics={filterOptions[filterType]}
                          onApply={(selectedValueChains) => {
                            const valueChainToApply =
                              selectedValueChains.includes('All')
                                ? []
                                : selectedValueChains;

                            const newFilters = {
                              ...activeFilters,
                              [filterType]: valueChainToApply,
                            };
                            setActiveFilters(newFilters);
                            updateFilters(newFilters);
                            setOpenFilter(null);
                          }}
                          onClear={() => {
                            const newFilters = {
                              ...activeFilters,
                              [filterType]: [],
                            };
                            setActiveFilters(newFilters);
                            updateFilters(newFilters);
                            setOpenFilter(null);
                          }}
                        />
                      ) : filterType === 'regions' ? (
                        <LocationsFilter
                          name="Regions"
                          locations={[
                            'All Locations',
                            'No Specific Region',
                            ...filterOptions[filterType],
                          ]}
                          onApply={(selectedLocations) => {
                            const locationsToApply = selectedLocations.includes(
                              'All Locations'
                            )
                              ? []
                              : selectedLocations.filter(
                                  (loc) => loc !== 'All Locations'
                                );

                            const newFilters = {
                              ...activeFilters,
                              [filterType]: locationsToApply,
                            };
                            setActiveFilters(newFilters);
                            updateFilters(newFilters);
                            setOpenFilter(null);
                          }}
                          onClear={() => {
                            const newFilters = {
                              ...activeFilters,
                              [filterType]: [],
                            };
                            setActiveFilters(newFilters);
                            updateFilters(newFilters);
                            setOpenFilter(null);
                          }}
                        />
                      ) : filterType === 'date' ? (
                        <div className="bg-white rounded-md shadow-lg border w-48 max-h-60 overflow-y-auto">
                          {filterOptions[filterType].map((option) => (
                            <label
                              key={option}
                              className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer text-black"
                            >
                              <input
                                type="radio"
                                name="date-filter"
                                checked={
                                  activeFilters[filterType].length > 0
                                    ? activeFilters[filterType][0] === option
                                    : option === 'All Time'
                                }
                                onChange={() => {
                                  const newFilters = {
                                    ...activeFilters,
                                    [filterType]:
                                      option === 'All Time' ? [] : [option],
                                  };
                                  setActiveFilters(newFilters);
                                  updateFilters(newFilters);
                                  setOpenFilter(null);
                                }}
                                className="mr-2"
                              />
                              {option}
                            </label>
                          ))}
                        </div>
                      ) : (
                        <div className="w-48 bg-white rounded-md shadow-lg border max-h-60 overflow-y-auto">
                          {filterOptions[filterType].length > 0 ? (
                            filterOptions[filterType].map((option) => (
                              <label
                                key={option}
                                className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer text-black"
                              >
                                <input
                                  type="checkbox"
                                  checked={activeFilters[filterType].includes(
                                    option
                                  )}
                                  onChange={() =>
                                    toggleFilter(filterType, option)
                                  }
                                  className="mr-2"
                                />
                                {option}
                              </label>
                            ))
                          ) : (
                            <div className="px-4 py-2 text-gray-500">
                              No options available
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              <button
                onClick={handleSort}
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
              >
                <span>Date</span>
                {sortConfig.order === 'desc' ? (
                  <ArrowDownWideNarrow className="w-4 h-4" />
                ) : (
                  <ArrowUpWideNarrow className="w-4 h-4" />
                )}
              </button>
            </div>

            {hasActiveFilters && (
              <button
                className="text-green-600 hover:text-green-700"
                onClick={clearFilters}
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {loading && investmentOpportunityProfiles.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {investmentOpportunityProfiles.map((card) => (
                <div
                  key={card.id}
                  className="bg-white rounded-lg overflow-hidden shadow-sm border cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleCardClick(card)}
                >
                  <div className="p-6">
                    <div className="text-green-600 text-xs font-semibold tracking-wider mb-2">
                      {card.publicationYear}
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-black line-clamp-2">
                      {card.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {card.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="px-2 py-1 bg-gray-100 text-xs rounded-full text-black">
                        {card.valueChain}
                      </span>
                    </div>
                    <button
                      className="px-6 py-2 border border-gray-300 rounded-full text-sm hover:bg-gray-50 transition-colors text-black"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCardClick(card);
                      }}
                    >
                      Learn More
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {investmentOpportunityProfiles.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold text-gray-900">
                  No results found
                </h3>
                <p className="text-gray-600 mt-2">
                  Try adjusting your filters or search terms
                </p>
              </div>
            )}

            {hasMore && investmentOpportunityProfiles.length > 0 && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={() => loadData(true)}
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
