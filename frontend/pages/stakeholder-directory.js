import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Search } from 'lucide-react';
import Image from 'next/image';

export default function StakeholderDirectory() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [openFilter, setOpenFilter] = useState(null);
  const [activeFilters, setActiveFilters] = useState({
    topics: [],
    focusRegions: [],
    organizations: [],
  });

  const stakeholders = [
    {
      type: 'INDIVIDUAL',
      name: 'Sarah Chebet',
      image: 'https://placehold.co/200x200',
      topics: ['Agriculture', 'Environment'],
      focusRegions: ['Africa'],
      organizations: [],
    },
    {
      type: 'ORGANIZATION',
      name: 'United Nations Environment Programme (UNEP)',
      image: 'https://placehold.co/200x200',
      topics: ['Environment', 'Sustainability'],
      focusRegions: ['Global'],
      organizations: ['UNEP'],
    },
    {
      type: 'ORGANIZATION',
      name: 'Blue Life Ecoservices',
      image: 'https://placehold.co/200x200',
      topics: ['Marine Conservation'],
      focusRegions: ['Asia'],
      organizations: ['Blue Life'],
    },
    // Add more stakeholders with relevant properties
  ];

  // Repeat the array 3 times to show multiple rows
  const allStakeholders = [...stakeholders, ...stakeholders, ...stakeholders];

  // Extract unique filter options
  const filterOptions = {
    topics: [
      'Agriculture',
      'Environment',
      'Sustainability',
      'Marine Conservation',
    ],
    focusRegions: ['Africa', 'Global', 'Asia'],
    organizations: ['UNEP', 'Blue Life'],
  };

  // Read query parameters on page load
  useEffect(() => {
    const { query } = router;
    const filters = {
      topics: query.topics ? query.topics.split(',') : [],
      focusRegions: query.focusRegions ? query.focusRegions.split(',') : [],
      organizations: query.organizations ? query.organizations.split(',') : [],
    };
    setActiveFilters(filters);
  }, []);

  // Update URL query parameters when filters change
  useEffect(() => {
    const query = {};
    if (activeFilters.topics.length > 0)
      query.topics = activeFilters.topics.join(',');
    if (activeFilters.focusRegions.length > 0)
      query.focusRegions = activeFilters.focusRegions.join(',');
    if (activeFilters.organizations.length > 0)
      query.organizations = activeFilters.organizations.join(',');
    router.push({ pathname: router.pathname, query }, undefined, {
      shallow: true,
    });
  }, [activeFilters]);

  // Toggle filter option
  const toggleFilter = (filterType, option) => {
    setActiveFilters((prev) => {
      const updatedFilters = { ...prev };
      if (updatedFilters[filterType].includes(option)) {
        updatedFilters[filterType] = updatedFilters[filterType].filter(
          (item) => item !== option
        );
      } else {
        updatedFilters[filterType] = [...updatedFilters[filterType], option];
      }
      return updatedFilters;
    });
  };

  // Filter stakeholders based on active filters
  const filteredStakeholders = allStakeholders.filter((stakeholder) => {
    return (
      (activeFilters.topics.length === 0 ||
        activeFilters.topics.some((topic) =>
          stakeholder.topics.includes(topic)
        )) &&
      (activeFilters.focusRegions.length === 0 ||
        activeFilters.focusRegions.some((region) =>
          stakeholder.focusRegions.includes(region)
        )) &&
      (activeFilters.organizations.length === 0 ||
        activeFilters.organizations.some((org) =>
          stakeholder.organizations.includes(org)
        ))
    );
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Search Section */}
      <div className="py-4 px-4 bg-[#f1f3f5]">
        <div className="max-w-7xl mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Try keywords like: 'tilapia' or 'horticulture'"
              className="w-full pl-4 pr-10 py-3 rounded-[26px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search
              className="absolute right-3 top-3.5 text-gray-400"
              size={20}
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="border-t border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-6">
              {Object.keys(filterOptions).map((filterType) => (
                <div key={filterType} className="relative">
                  <button
                    onClick={() =>
                      setOpenFilter(
                        openFilter === filterType ? null : filterType
                      )
                    }
                    className="text-gray-700 hover:text-gray-900 flex items-center gap-1"
                  >
                    {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
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
                    <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                      {filterOptions[filterType].map((option) => (
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
            </div>
            <button
              onClick={() =>
                setActiveFilters({
                  topics: [],
                  focusRegions: [],
                  organizations: [],
                })
              }
              className="text-green-600 hover:text-green-700"
            >
              Clear filters
            </button>
          </div>
        </div>
      </div>

      {/* Stakeholder Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          {filteredStakeholders.map((stakeholder, index) => (
            <div
              key={index}
              className="bg-[#f8f9fa] rounded-lg p-4 flex flex-col items-center text-center hover:shadow-md transition-shadow"
            >
              <div className="relative w-24 h-24 mb-4">
                <Image
                  src={stakeholder.image || '/placeholder.svg'}
                  alt={stakeholder.name}
                  fill
                  className="rounded-full object-cover"
                  unoptimized
                />
              </div>
              <div className="text-xs font-semibold text-green-600 mb-2">
                {stakeholder.type}
              </div>
              <h3 className="text-sm font-medium text-gray-900">
                {stakeholder.name}
              </h3>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-12">
          <button className="px-8 py-3 bg-zinc-900 text-white rounded-md hover:bg-zinc-800 transition-colors">
            Load More
          </button>
        </div>
      </div>
    </div>
  );
}
