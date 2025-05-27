import { useState, useEffect, useCallback } from 'react';
import { ArrowDownWideNarrow, ArrowUpWideNarrow, Search } from 'lucide-react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchSocialAccountabilityData,
  clearSocialAccountabilityData,
} from '@/store/slices/socialAccountabilitySlice';
import LocationsFilter from '@/components/LocationFilter';
import CheckboxFilter from '@/components/CheckboxFilter';
import Card from '@/components/Card';
import debounce from 'lodash/debounce';
import { generateYearOptions } from '@/helpers/utilities';

export default function SocialAccountability() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    valueChain: [],
    regions: [],
    date: [],
  });
  const [sortConfig, setSortConfig] = useState({
    field: 'publication_date',
    order: 'desc',
  });
  const [openFilter, setOpenFilter] = useState(null);

  const {
    data: socialAccountabilityData,
    loading,
    error,
    currentPage,
    hasMore,
  } = useSelector((state) => state.socialAccountability);
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
    date: generateYearOptions(),
  };

  useEffect(() => {
    if (!router.isReady) return;

    const query = router.query;
    const search = query.search || '';
    const valueChain = query.valueChain
      ? query.valueChain.split(',').filter(Boolean)
      : [];
    const regions = query.regions
      ? query.regions.split(',').filter(Boolean)
      : [];
    const date = query.date ? query.date.split(',').filter(Boolean) : [];
    const sortOrder = query.sortOrder || 'desc';
    const sortBy = query.sortBy || 'publication_date';

    setSearchQuery(search);
    setActiveFilters({
      valueChain: valueChain.filter((vc) =>
        filterOptions.valueChain.includes(vc)
      ),
      regions: regions.filter((r) => filterOptions.regions.includes(r)),
      date: date.filter((d) => filterOptions.date.includes(d)),
    });
    setSortConfig({
      field: sortBy,
      order: sortOrder,
    });

    dispatch(
      fetchSocialAccountabilityData({
        page: 1,
        query: search,
        filters: {
          valueChain: valueChain.filter((vc) =>
            filterOptions.valueChain.includes(vc)
          ),
          regions: regions.filter((r) => filterOptions.regions.includes(r)),
          date: date.filter((d) => filterOptions.date.includes(d)),
        },
        dateSort: sortOrder,
      })
    );
    // eslint-disable-next-line
  }, [router.isReady, JSON.stringify(router.query)]);

  const updateQueryParams = useCallback(
    (filters, sort, search) => {
      const params = {};
      if (search) params.search = search;
      if (sort.order !== 'desc') params.sortOrder = sort.order;
      if (filters.valueChain.length > 0)
        params.valueChain = filters.valueChain.join(',');
      if (filters.regions.length > 0)
        params.regions = filters.regions.join(',');
      if (filters.date.length > 0) params.date = filters.date.join(',');
      router.push({ pathname: router.pathname, query: params }, undefined, {
        shallow: true,
      });
    },
    [router]
  );

  const handleSearch = useCallback(
    debounce((value) => {
      updateQueryParams(activeFilters, sortConfig, value);
    }, 500),
    [updateQueryParams, activeFilters, sortConfig]
  );

  const handleSort = () => {
    const newOrder = sortConfig.order === 'desc' ? 'asc' : 'desc';
    updateQueryParams(
      activeFilters,
      { ...sortConfig, order: newOrder },
      searchQuery
    );
  };

  const handleFilterApply = (filterType, selectedOptions) => {
    const newFilters = {
      ...activeFilters,
      [filterType]: selectedOptions,
    };
    updateQueryParams(newFilters, sortConfig, searchQuery);
    setOpenFilter(null);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setActiveFilters({ valueChain: [], regions: [], date: [] });
    router.push({ pathname: router.pathname }, undefined, { shallow: true });
    dispatch(clearSocialAccountabilityData());
  };

  const handleCardClick = (card) => {
    router.push(`/social-accountability/${card.documentId}`);
  };

  const loadMoreData = () => {
    dispatch(
      fetchSocialAccountabilityData({
        page: currentPage + 1,
        query: searchQuery,
        filters: activeFilters,
        dateSort: sortConfig.order,
      })
    );
  };

  const getFilterInitialSelected = (filterType) => {
    return activeFilters[filterType].length === 0
      ? []
      : activeFilters[filterType];
  };

  const hasActiveFilters =
    (router.query.valueChain && router.query.valueChain.length > 0) ||
    (router.query.regions && router.query.regions.length > 0) ||
    (router.query.date && router.query.date.length > 0) ||
    (router.query.search && router.query.search.length > 0);

  return (
    <div className="min-h-screen bg-white">
      <div className="py-4 px-4 bg-[#f1f3f5] text-black">
        <div className="flex container mx-auto items-center">
          <div className="container mx-auto px-4">
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
                        ? 'Year'
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
                        {filterType === 'valueChain' ? (
                          <CheckboxFilter
                            label="Value Chain"
                            options={filterOptions[filterType].filter(
                              (opt) => opt !== 'All'
                            )}
                            initialSelected={getFilterInitialSelected(
                              'valueChain'
                            )}
                            hasAllOption={true}
                            onApply={(selectedOptions) =>
                              handleFilterApply(
                                'valueChain',
                                selectedOptions.filter((opt) => opt !== 'All')
                              )
                            }
                            onClear={() => handleFilterApply('valueChain', [])}
                          />
                        ) : filterType === 'regions' ? (
                          <LocationsFilter
                            name="Focus Regions"
                            locations={[
                              'All Locations',
                              'No Specific Region',
                              ...filterOptions[filterType],
                            ]}
                            initialSelected={getFilterInitialSelected(
                              'regions'
                            )}
                            onApply={(selectedLocations) =>
                              handleFilterApply(
                                'regions',
                                selectedLocations.filter(
                                  (opt) => opt !== 'All Locations'
                                )
                              )
                            }
                            onClear={() => handleFilterApply('regions', [])}
                          />
                        ) : filterType === 'date' ? (
                          <CheckboxFilter
                            options={generateYearOptions()}
                            label={'Year'}
                            initialSelected={
                              activeFilters[filterType].length === 0
                                ? ['All', ...generateYearOptions()]
                                : activeFilters[filterType]
                            }
                            hasAllOption={true}
                            allOptionLabel="All Years"
                            onApply={(selectedYears) => {
                              let finalSelection = [...selectedYears];

                              const allYearsSelected =
                                generateYearOptions().every((year) =>
                                  selectedYears.includes(year)
                                );
                              if (
                                allYearsSelected &&
                                !selectedYears.includes('All Years')
                              ) {
                                finalSelection = [
                                  'All Years',
                                  ...selectedYears,
                                ];
                              }

                              const yearsToApply = finalSelection.includes(
                                'All Years'
                              )
                                ? []
                                : finalSelection.filter(
                                    (year) => year !== 'All Years'
                                  );

                              handleFilterApply('date', yearsToApply);
                            }}
                            onClear={() => handleFilterApply('date', [])}
                          />
                        ) : null}
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
            </div>
          </div>
          <div className="container mx-auto">
            <div className="flex justify-end">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSearch(searchQuery);
                }}
                className="w-96"
              >
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Try keywords like: 'tilapia' or 'horticulture'"
                    className="w-full pl-4 pr-10 py-2 rounded-[26px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      handleSearch(e.target.value);
                    }}
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Search size={20} />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        {(activeFilters.valueChain?.length > 0 ||
          activeFilters.regions?.length > 0 ||
          activeFilters.date?.length > 0) && (
          <div className="container mx-auto px-4 pb-3 text-black">
            <div className="flex items-center gap-2 flex-wrap">
              {Object.entries(activeFilters).map(([filterType, values]) =>
                values.map((value) => (
                  <span
                    key={`${filterType}-${value}`}
                    className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                  >
                    {value}
                    <button
                      onClick={() => {
                        const newFilters = {
                          ...activeFilters,
                          [filterType]: activeFilters[filterType].filter(
                            (v) => v !== value
                          ),
                        };
                        setActiveFilters(newFilters);
                        updateQueryParams(newFilters, sortConfig, searchQuery);
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {(activeFilters.valueChain?.length > 0 ||
        activeFilters.regions?.length > 0 ||
        activeFilters.date?.length > 0) && (
        <div className="border-b relative container mx-auto flex items-center justify-between py-2">
          <div className="px-4  text-black">
            <div className="flex items-center gap-2 flex-wrap">
              {Object.entries(activeFilters).map(([filterType, values]) =>
                values.map((value) => (
                  <span
                    key={`${filterType}-${value}`}
                    className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                  >
                    {value}
                    <button
                      onClick={() => {
                        const newFilters = {
                          ...activeFilters,
                          [filterType]: activeFilters[filterType].filter(
                            (v) => v !== value
                          ),
                        };
                        setActiveFilters(newFilters);
                        updateQueryParams(newFilters, sortConfig, searchQuery);
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </span>
                ))
              )}
            </div>
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
      )}
      <div className="container mx-auto px-4 py-8">
        {loading && socialAccountabilityData.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {socialAccountabilityData.map((card) => (
                <Card
                  key={card.id}
                  card={{
                    ...card,
                    title: `${card.valueChain} in ${card.region}`,
                  }}
                  onClick={() => handleCardClick(card)}
                />
              ))}
            </div>

            {socialAccountabilityData.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold text-gray-900">
                  No results found
                </h3>
                <p className="text-gray-600 mt-2">
                  Try adjusting your filters or search terms
                </p>
              </div>
            )}

            {hasMore && socialAccountabilityData.length > 0 && (
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
