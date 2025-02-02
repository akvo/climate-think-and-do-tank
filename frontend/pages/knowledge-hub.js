import { useState } from 'react';
import { Search } from 'lucide-react';
import OrganizationModal from '@/components/OrganizationModal';

// Dummy data with various properties for filtering
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

export default function KnowledgeHub() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    topics: [],
    locations: [],
    organizations: [],
  });
  const [openFilter, setOpenFilter] = useState(null);

  // Filter and search logic
  const filteredCards = dummyData.filter((card) => {
    // Search query filter
    const matchesSearch =
      searchQuery === '' ||
      card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.description.toLowerCase().includes(searchQuery.toLowerCase());

    // Check if card matches all active filters
    const matchesTopics =
      activeFilters.topics.length === 0 ||
      activeFilters.topics.includes(card.topic);
    const matchesLocations =
      activeFilters.locations.length === 0 ||
      activeFilters.locations.includes(card.location);
    const matchesOrganizations =
      activeFilters.organizations.length === 0 ||
      activeFilters.organizations.includes(card.organization);

    return (
      matchesSearch && matchesTopics && matchesLocations && matchesOrganizations
    );
  });

  // Toggle filter option
  const toggleFilter = (type, value) => {
    setActiveFilters((prev) => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter((item) => item !== value)
        : [...prev[type], value],
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setActiveFilters({
      topics: [],
      locations: [],
      organizations: [],
    });
    setSearchQuery('');
  };

  // Check if any filters are active
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
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search
                className="absolute right-3 top-2.5 text-gray-400"
                size={20}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b relative">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-6">
            {/* Topics Filter */}
            <div className="relative">
              <button
                className={`text-gray-700 hover:text-gray-900 flex items-center gap-1 ${
                  activeFilters.topics.length > 0
                    ? 'font-semibold text-green-600'
                    : ''
                }`}
                onClick={() =>
                  setOpenFilter(openFilter === 'topics' ? null : 'topics')
                }
              >
                Topics
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
              {openFilter === 'topics' && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                  {filterOptions.topics.map((topic) => (
                    <label
                      key={topic}
                      className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer  text-black"
                    >
                      <input
                        type="checkbox"
                        checked={activeFilters.topics.includes(topic)}
                        onChange={() => toggleFilter('topics', topic)}
                        className="mr-2"
                      />
                      {topic}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Location Filter */}
            <div className="relative">
              <button
                className={`text-gray-700 hover:text-gray-900 flex items-center gap-1 ${
                  activeFilters.locations.length > 0
                    ? 'font-semibold text-green-600'
                    : ''
                }`}
                onClick={() =>
                  setOpenFilter(openFilter === 'locations' ? null : 'locations')
                }
              >
                Location
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
              {openFilter === 'locations' && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                  {filterOptions.locations.map((location) => (
                    <label
                      key={location}
                      className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer text-black"
                    >
                      <input
                        type="checkbox"
                        checked={activeFilters.locations.includes(location)}
                        onChange={() => toggleFilter('locations', location)}
                        className="mr-2"
                      />
                      {location}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Organizations Filter */}
            <div className="relative">
              <button
                className={`text-gray-700 hover:text-gray-900 flex items-center gap-1 ${
                  activeFilters.organizations.length > 0
                    ? 'font-semibold text-green-600'
                    : ''
                }`}
                onClick={() =>
                  setOpenFilter(
                    openFilter === 'organizations' ? null : 'organizations'
                  )
                }
              >
                Organizations
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
              {openFilter === 'organizations' && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                  {filterOptions.organizations.map((org) => (
                    <label
                      key={org}
                      className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer text-black"
                    >
                      <input
                        type="checkbox"
                        checked={activeFilters.organizations.includes(org)}
                        onChange={() => toggleFilter('organizations', org)}
                        className="mr-2"
                      />
                      {org}
                    </label>
                  ))}
                </div>
              )}
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

      {/* Card Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCards.map((card) => (
            <div
              key={card.id}
              className="bg-white rounded-lg overflow-hidden shadow-sm border cursor-pointer"
              onClick={() => setIsModalOpen(true)}
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
                <h3 className="text-lg font-semibold mb-2 text-black">
                  {card.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">{card.description}</p>
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
                <button className="px-6 py-2 border border-gray-300 rounded-full text-sm hover:bg-gray-50 transition-colors text-black">
                  Learn More
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredCards.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900">
              No results found
            </h3>
            <p className="text-gray-600 mt-2">
              Try adjusting your filters or search terms
            </p>
          </div>
        )}

        {filteredCards.length >= 6 && (
          <div className="flex justify-center mt-12">
            <button className="px-8 py-3 bg-zinc-900 text-white rounded-md hover:bg-zinc-800 transition-colors">
              Load More
            </button>
          </div>
        )}
      </div>
      <OrganizationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
