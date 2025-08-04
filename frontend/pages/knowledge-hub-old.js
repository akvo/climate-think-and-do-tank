import { useState, useEffect, useCallback } from 'react';
import { ArrowDownWideNarrow, ArrowUpWideNarrow, Search } from 'lucide-react';
import { useRouter } from 'next/router';
import OrganizationModal from '@/components/OrganizationModal';
import { useDispatch, useSelector } from 'react-redux';
import LocationsFilter from '@/components/LocationFilter';
import Image from 'next/image';
import {
  fetchKnowledgeHubs,
  clearKnowledgeHubs,
} from '@/store/slices/knowledgeHubSlice';
import debounce from 'lodash/debounce';
import CheckboxFilter from '@/components/CheckboxFilter';
import { generateYearOptions, getImageUrl } from '@/helpers/utilities';

export default function KnowledgeHub() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [sortConfig, setSortConfig] = useState({
    field: 'date',
    order: 'desc',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [openFilter, setOpenFilter] = useState(null);
  const [activeFilters, setActiveFilters] = useState({
    topic: [],
    focusRegions: [],
    type: [],
    date: [],
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  const { knowledgeHubs, loading, error, currentPage, hasMore } = useSelector(
    (state) => state.knowledgeHub
  );

  const { topics = [], regions = [] } = useSelector((state) => state.auth);

  const filterOptions = {
    focusRegions: [
      'All Locations',
      ...regions.map((region) => region.name || region.attributes?.name),
    ],
    topic: [
      ...topics
        .map((topic) => topic.name || topic.attributes?.name)
        .filter(Boolean),
    ],
    type: ['File', 'Link'],
    date: [],
  };

  useEffect(() => {
    if (!router.isReady) return;

    const filters = {
      topic: router.query.topic ? router.query.topic.split(',') : [],
      focusRegions: router.query.focusRegions
        ? router.query.focusRegions.split(',')
        : [],
      type: router.query.type ? router.query.type.split(',') : [],
      date: router.query.date ? router.query.date.split(',') : [],
    };

    const sort = router.query.sort || 'desc';
    setSortConfig({
      field: 'date',
      order: sort,
    });

    setActiveFilters(filters);
    setSearchQuery(router.query.query || '');

    dispatch(clearKnowledgeHubs());
    dispatch(
      fetchKnowledgeHubs({
        page: 1,
        query: router.query.query || '',
        filters,
        dateSort: sort,
        dateFilter: filters.date.length > 0 ? filters.date : null,
      })
    );
  }, [router.isReady, router.query]);

  const updateFilters = (newFilters) => {
    const query = {};
    if (searchQuery) query.query = searchQuery;
    if (newFilters.topic.length > 0) query.topic = newFilters.topic.join(',');
    if (newFilters.focusRegions.length > 0)
      query.focusRegions = newFilters.focusRegions.join(',');
    if (newFilters.type.length > 0) query.type = newFilters.type.join(',');
    if (newFilters.date.length > 0) query.date = newFilters.date.join(',');

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
      topic: [],
      focusRegions: [],
      type: [],
      date: [],
    };
    setActiveFilters(emptyFilters);
    setSearchQuery('');

    const query = { ...router.query };
    delete query.topic;
    delete query.focusRegions;
    delete query.type;
    delete query.date;
    delete query.query;

    router.push(
      {
        pathname: router.pathname,
        query,
      },
      undefined,
      { shallow: true }
    );
  };

  const loadMoreKnowledgeHubs = () => {
    dispatch(
      fetchKnowledgeHubs({
        page: currentPage + 1,
        query: searchQuery,
        filters: activeFilters,
        dateSort: sortConfig.order,
      })
    );
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (openFilter && !e.target.closest('.filter-dropdown')) {
        setOpenFilter(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openFilter]);

  const handleSearch = useCallback(
    debounce((query) => {
      const queryParams = { ...router.query, query };

      if (!query) {
        delete queryParams.query;
      }

      router.push(
        {
          pathname: router.pathname,
          query: queryParams,
        },
        undefined,
        { shallow: true }
      );

      dispatch(
        fetchKnowledgeHubs({
          page: 1,
          query,
          filters: activeFilters,
          dateSort: sortConfig.order,
        })
      );
    }, 500),
    [sortConfig.order, activeFilters]
  );

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  const openCardModal = (card) => {
    setSelectedCard(card);
    setIsModalOpen(true);
  };

  const handleSort = () => {
    const newOrder = sortConfig.order === 'desc' ? 'asc' : 'desc';

    setSortConfig({
      field: 'date',
      order: newOrder,
    });

    dispatch(
      fetchKnowledgeHubs({
        page: 1,
        query: searchQuery,
        filters: activeFilters,
        dateSort: newOrder,
      })
    );
  };

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
                      {filterType === 'focusRegions'
                        ? 'Region'
                        : filterType === 'topic'
                        ? 'Topics'
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
                      <div className="absolute top-full left-0 mt-2 z-10 min-w-[300px]">
                        {filterType === 'topic' ? (
                          <CheckboxFilter
                            options={filterOptions[filterType]}
                            label={'Topics'}
                            initialSelected={
                              activeFilters[filterType].length === 0
                                ? [
                                    'All',
                                    ...filterOptions[filterType].filter(
                                      (option) => option !== 'All'
                                    ),
                                  ]
                                : activeFilters[filterType]
                            }
                            hasAllOption={true}
                            onApply={(selectedTopics) => {
                              const topicsToApply = selectedTopics.includes(
                                'All'
                              )
                                ? []
                                : selectedTopics;

                              const newFilters = {
                                ...activeFilters,
                                [filterType]: topicsToApply,
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
                        ) : filterType === 'focusRegions' ? (
                          <LocationsFilter
                            name="Region"
                            locations={[
                              'All Locations',
                              'No Specific Region',
                              ...filterOptions[filterType],
                            ]}
                            initialSelected={activeFilters[filterType]}
                            onApply={(selectedLocations) => {
                              const locationsToApply =
                                selectedLocations.includes('All Locations')
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

                              const newFilters = {
                                ...activeFilters,
                                [filterType]: yearsToApply,
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
                        ) : (
                          <CheckboxFilter
                            options={filterOptions[filterType] || []}
                            label={
                              filterType.charAt(0).toUpperCase() +
                              filterType.slice(1)
                            }
                            initialSelected={activeFilters[filterType] || []}
                            hasAllOption={false}
                            onApply={(selectedOptions) => {
                              const optionsToApply = selectedOptions.includes(
                                'All'
                              )
                                ? []
                                : selectedOptions.filter(
                                    (opt) => opt !== 'All'
                                  );

                              const newFilters = {
                                ...activeFilters,
                                [filterType]: optionsToApply,
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
                        )}
                      </div>
                    )}
                  </div>
                ))}{' '}
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
              <form onSubmit={handleSearchSubmit} className="w-96">
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
      </div>

      {(activeFilters.topic?.length > 0 ||
        activeFilters.focusRegions?.length > 0 ||
        activeFilters.type?.length > 0 ||
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
                        updateFilters(newFilters);
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
            {(activeFilters.topic.length > 0 ||
              activeFilters.focusRegions.length > 0 ||
              activeFilters.type.length > 0 ||
              activeFilters.date.length > 0) && (
              <button
                onClick={clearFilters}
                className="text-green-600 hover:text-green-700"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Card Grid */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {knowledgeHubs.map((card) => (
                <div
                  key={card.id}
                  className="bg-white rounded-lg overflow-hidden shadow-sm border cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => openCardModal(card)}
                >
                  <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                    {card.image ? (
                      <Image
                        src={getImageUrl(card.image)}
                        alt={card.title}
                        width={500}
                        height={300}
                        className="w-full h-full object-cover"
                        unoptimized
                        onError={(e) => {
                          const parentDiv = e.target.closest('.w-full.h-48');
                          if (parentDiv) {
                            e.target.style.display = 'none';
                            const initialDiv = document.createElement('div');
                            initialDiv.className =
                              'w-full h-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold';
                            initialDiv.textContent = card.title
                              .charAt(0)
                              .toUpperCase();
                            parentDiv.innerHTML = '';
                            parentDiv.appendChild(initialDiv);
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                        {card.title.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-green-600 text-xs font-semibold tracking-wider">
                        {card.topic}
                      </div>
                      {card.publishedAt && (
                        <div className="text-gray-500 text-xs">
                          Year: {new Date(card.publishedAt).getFullYear()}
                        </div>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-black line-clamp-2">
                      {card.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {card.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {card.focusRegions.map((region) => (
                        <span
                          key={region}
                          className="px-2 py-1 bg-gray-100 text-xs rounded-full text-black"
                        >
                          {region}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {knowledgeHubs.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold text-gray-900">
                  No results found
                </h3>
                <p className="text-gray-600 mt-2">
                  Try adjusting your filters or search terms
                </p>
              </div>
            )}

            {hasMore && knowledgeHubs.length > 0 && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={loadMoreKnowledgeHubs}
                  disabled={loading}
                  className="px-8 py-3  text-white rounded-[100px] hover:bg-green-700 transition-colors disabled:bg-zinc-400 bg-green-600 font-semibold"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-2"></div>
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

      {/* Modal Component - you'd need to create this */}
      <OrganizationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        card={selectedCard}
      />
    </div>
  );
}
