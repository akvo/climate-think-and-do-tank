import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useRouter } from 'next/router';
import { useSearchParams } from 'next/navigation';
import OrganizationModal from '@/components/OrganizationModal';

// Dummy data
const dummyData = [
  {
    id: 1,
    type: 'FINANCING RESOURCE',
    title: 'Implementing Sustainable Low and Non-Chemical Development in SIDS',
    description:
      'Project focusing on sustainable development practices in Small Island Developing States, with emphasis on reducing chemical usage.',
    image: 'https://placehold.co/400x200',
    topic: 'Sustainability',
    location: 'Caribbean',
    organization: 'UNEP',
  },
  {
    id: 2,
    type: 'TECHNICAL GUIDE',
    title: 'Best Practices in Tilapia Farming',
    description:
      'Comprehensive guide on sustainable tilapia farming methods, including water management and feed optimization.',
    image: 'https://placehold.co/400x200',
    topic: 'Aquaculture',
    location: 'Southeast Asia',
    organization: 'FAO',
  },
  {
    id: 3,
    type: 'CASE STUDY',
    title: 'Urban Horticulture Success Stories',
    description:
      'Collection of successful urban farming initiatives from major cities, highlighting innovative growing techniques.',
    image: 'https://placehold.co/400x200',
    topic: 'Horticulture',
    location: 'Global',
    organization: 'World Bank',
  },
  {
    id: 4,
    type: 'FINANCING RESOURCE',
    title: 'Green Climate Fund for Agriculture',
    description:
      'Funding opportunities for climate-smart agriculture projects in developing nations.',
    image: 'https://placehold.co/400x200',
    topic: 'Climate Change',
    location: 'Africa',
    organization: 'GCF',
  },
  {
    id: 5,
    type: 'RESEARCH PAPER',
    title: 'Sustainable Fishing Practices in Pacific Islands',
    description:
      'Research on traditional and modern sustainable fishing methods in Pacific Island communities.',
    image: 'https://placehold.co/400x200',
    topic: 'Fisheries',
    location: 'Pacific',
    organization: 'WorldFish',
  },
  {
    id: 6,
    type: 'TECHNICAL GUIDE',
    title: 'Organic Certification Guidelines',
    description:
      'Step-by-step guide for obtaining organic certification for small-scale farmers.',
    image: 'https://placehold.co/400x200',
    topic: 'Organic Farming',
    location: 'Global',
    organization: 'IFOAM',
  },
];

// Filter options
const filterOptions = {
  topics: [
    'Sustainability',
    'Aquaculture',
    'Horticulture',
    'Climate Change',
    'Fisheries',
    'Organic Farming',
  ],
  locations: ['Caribbean', 'Southeast Asia', 'Global', 'Africa', 'Pacific'],
  organizations: ['UNEP', 'FAO', 'World Bank', 'GCF', 'WorldFish', 'IFOAM'],
};

// Simulated API call
const fetchData = async ({
  search = '',
  topics = [],
  locations = [],
  organizations = [],
  sortBy = 'title',
  sortOrder = 'asc',
  page = 1,
  perPage = 6,
}) => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  let filteredData = [...dummyData];

  // Apply filters
  if (search) {
    filteredData = filteredData.filter(
      (card) =>
        card.title.toLowerCase().includes(search.toLowerCase()) ||
        card.description.toLowerCase().includes(search.toLowerCase())
    );
  }

  if (topics.length > 0) {
    filteredData = filteredData.filter((card) => topics.includes(card.topic));
  }

  if (locations.length > 0) {
    filteredData = filteredData.filter((card) =>
      locations.includes(card.location)
    );
  }

  if (organizations.length > 0) {
    filteredData = filteredData.filter((card) =>
      organizations.includes(card.organization)
    );
  }

  // Apply sorting
  filteredData.sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'type':
        comparison = a.type.localeCompare(b.type);
        break;
      case 'organization':
        comparison = a.organization.localeCompare(b.organization);
        break;
      default:
        comparison = a.title.localeCompare(b.title);
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Calculate pagination
  const totalItems = filteredData.length;
  const start = (page - 1) * perPage;
  const paginatedData = filteredData.slice(start, start + perPage);

  return {
    data: paginatedData,
    total: totalItems,
    totalPages: Math.ceil(totalItems / perPage),
  };
};

export default function KnowledgeHub() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [allData, setAllData] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    topics: [],
    locations: [],
    organizations: [],
  });
  const [openFilter, setOpenFilter] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    field: 'title',
    order: 'asc',
  });

  // Load data based on current filters and sort
  const loadData = async (isLoadMore = false) => {
    setIsLoading(true);
    try {
      const result = await fetchData({
        search: searchQuery,
        ...activeFilters,
        sortBy: sortConfig.field,
        sortOrder: sortConfig.order,
        page: isLoadMore ? currentPage + 1 : 1,
      });

      if (isLoadMore) {
        setAllData((prev) => [...prev, ...result.data]);
        setCurrentPage((prev) => prev + 1);
      } else {
        setAllData(result.data);
        setCurrentPage(1);
      }

      setHasMore(result.data.length === 6);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize from URL params
  useEffect(() => {
    const handleInitialLoad = () => {
      const search = searchParams.get('search') || '';
      const topics =
        searchParams.get('topics')?.split(',').filter(Boolean) || [];
      const locations =
        searchParams.get('locations')?.split(',').filter(Boolean) || [];
      const organizations =
        searchParams.get('organizations')?.split(',').filter(Boolean) || [];
      const sortBy = searchParams.get('sortBy') || 'title';
      const sortOrder = searchParams.get('sortOrder') || 'asc';

      setSearchQuery(search);
      setActiveFilters({
        topics: topics.filter((t) => filterOptions.topics.includes(t)),
        locations: locations.filter((l) => filterOptions.locations.includes(l)),
        organizations: organizations.filter((o) =>
          filterOptions.organizations.includes(o)
        ),
      });
      setSortConfig({ field: sortBy, order: sortOrder });

      setAllData([]);
      setHasMore(true);
      setCurrentPage(1);
    };

    handleInitialLoad();
    loadData();
  }, [searchParams]);

  useEffect(() => {
    if (!isLoading) {
      loadData();
      updateQueryParams(activeFilters, sortConfig, searchQuery);
    }
  }, [activeFilters, sortConfig, searchQuery]);

  const updateQueryParams = (filters, sort, search) => {
    const params = new URLSearchParams();

    if (search) params.set('search', search);
    if (sort.field !== 'title') params.set('sortBy', sort.field);
    if (sort.order !== 'asc') params.set('sortOrder', sort.order);

    Object.entries(filters).forEach(([key, values]) => {
      if (values.length > 0) {
        params.set(key, values.join(','));
      }
    });

    router.push(`?${params.toString()}`, undefined, { shallow: true });
  };

  // Handle click outside filters
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openFilter && !event.target.closest('.filter-dropdown')) {
        setOpenFilter(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openFilter]);

  const toggleFilter = (type, value) => {
    setActiveFilters((prev) => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter((item) => item !== value)
        : [...prev[type], value],
    }));
  };

  const clearFilters = () => {
    setActiveFilters({
      topics: [],
      locations: [],
      organizations: [],
    });
    setSearchQuery('');
    setSortConfig({ field: 'title', order: 'asc' });
    setCurrentPage(1);
    setAllData([]);
    setHasMore(true);
  };

  const handleSort = (field) => {
    setSortConfig((prev) => ({
      field,
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  const handleCardClick = (card) => {
    setSelectedCard(card);
    setIsModalOpen(true);
  };

  const hasActiveFilters =
    Object.values(activeFilters).some((filter) => filter.length > 0) ||
    searchQuery !== '';

  return (
    <div className="min-h-screen bg-white">
      {/* Search Header */}
      <div className="bg-zinc-900 py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">Knowledge Hub</h1>
            <div className="relative w-96">
              <input
                type="text"
                placeholder="Try keywords like: 'tilapia' or 'horticulture'"
                className="w-full pl-4 pr-10 py-2 rounded-md bg-white text-black"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
              <Search
                className="absolute right-3 top-2.5 text-gray-400"
                size={20}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sort Options */}
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-500">Sort by:</span>
            {[
              { label: 'Title', value: 'title' },
              { label: 'Type', value: 'type' },
              { label: 'Organization', value: 'organization' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleSort(option.value)}
                className={`flex items-center gap-1 ${
                  sortConfig.field === option.value
                    ? 'text-green-600 font-semibold'
                    : 'text-gray-600'
                }`}
              >
                {option.label}
                {sortConfig.field === option.value && (
                  <span className="ml-1">
                    {sortConfig.order === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b relative">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-6">
            {Object.entries(filterOptions).map(([filterType, options]) => (
              <div key={filterType} className="relative filter-dropdown">
                <button
                  className={`text-gray-700 hover:text-gray-900 flex items-center gap-1 ${
                    activeFilters[filterType].length > 0
                      ? 'font-semibold text-green-600'
                      : ''
                  }`}
                  onClick={() =>
                    setOpenFilter(openFilter === filterType ? null : filterType)
                  }
                >
                  {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      openFilter === filterType ? 'transform rotate-180' : ''
                    }`}
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
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                    {options.map((option) => (
                      <label
                        key={option}
                        className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer text-black"
                      >
                        <input
                          type="checkbox"
                          checked={activeFilters[filterType].includes(option)}
                          onChange={() => toggleFilter(filterType, option)}
                          className="mr-2"
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}

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

      {/* Card Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allData.map((card) => (
                <div
                  key={card.id}
                  className="bg-white rounded-lg overflow-hidden shadow-sm border cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleCardClick(card)}
                >
                  <img
                    src={card.image}
                    alt=""
                    className="w-full h-48 object-cover bg-gray-100"
                  />
                  <div className="p-6">
                    <div className="text-green-600 text-xs font-semibold tracking-wider mb-2">
                      {card.type}
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-black line-clamp-2">
                      {card.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {card.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="px-2 py-1 bg-gray-100 text-xs rounded-full text-black">
                        {card.topic}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-xs rounded-full text-black">
                        {card.location}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-xs rounded-full text-black">
                        {card.organization}
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

            {allData.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold text-gray-900">
                  No results found
                </h3>
                <p className="text-gray-600 mt-2">
                  Try adjusting your filters or search terms
                </p>
              </div>
            )}

            {hasMore && allData.length > 0 && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={() => loadData(true)}
                  disabled={isLoading}
                  className="px-8 py-3 bg-zinc-900 text-white rounded-md hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading ? (
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
      <OrganizationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
