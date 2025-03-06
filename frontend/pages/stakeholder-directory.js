import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Globe,
  Link2,
  Linkedin,
  MapPin,
  Search,
  Sprout,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { useModal } from '@/hooks/useModal';

export default function StakeholderDirectory() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [openFilter, setOpenFilter] = useState(null);
  const [activeFilters, setActiveFilters] = useState({
    topics: [],
    focusRegions: [],
    organizations: [],
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

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
  ];

  const allStakeholders = [...stakeholders, ...stakeholders, ...stakeholders];

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

  // Read query parameters on page load and router changes
  useEffect(() => {
    if (!router.isReady) return;

    const filters = {
      topics: router.query.topics ? router.query.topics.split(',') : [],
      focusRegions: router.query.focusRegions
        ? router.query.focusRegions.split(',')
        : [],
      organizations: router.query.organizations
        ? router.query.organizations.split(',')
        : [],
    };
    setActiveFilters(filters);
  }, [router.isReady, router.query]);

  // Update URL query parameters when filters change
  const updateFilters = (newFilters) => {
    const query = {};
    if (newFilters.topics.length > 0)
      query.topics = newFilters.topics.join(',');
    if (newFilters.focusRegions.length > 0)
      query.focusRegions = newFilters.focusRegions.join(',');
    if (newFilters.organizations.length > 0)
      query.organizations = newFilters.organizations.join(',');

    router.push(
      {
        pathname: router.pathname,
        query: { ...query },
      },
      undefined,
      { shallow: true }
    );
  };

  // Toggle filter option with URL update
  const toggleFilter = (filterType, option) => {
    const updatedFilters = { ...activeFilters };
    if (updatedFilters[filterType].includes(option)) {
      updatedFilters[filterType] = updatedFilters[filterType].filter(
        (item) => item !== option
      );
    } else {
      updatedFilters[filterType] = [...updatedFilters[filterType], option];
    }
    setActiveFilters(updatedFilters);
    updateFilters(updatedFilters);
  };

  // Clear all filters
  const clearFilters = () => {
    const emptyFilters = {
      topics: [],
      focusRegions: [],
      organizations: [],
    };
    setActiveFilters(emptyFilters);
    updateFilters(emptyFilters);
  };

  // Filter stakeholders based on active filters
  const filteredStakeholders = allStakeholders.filter((stakeholder) => {
    const topicsMatch =
      activeFilters.topics.length === 0 ||
      stakeholder.topics.some((topic) => activeFilters.topics.includes(topic));

    const regionsMatch =
      activeFilters.focusRegions.length === 0 ||
      stakeholder.focusRegions.some((region) =>
        activeFilters.focusRegions.includes(region)
      );

    const organizationsMatch =
      activeFilters.organizations.length === 0 ||
      stakeholder.organizations.some((org) =>
        activeFilters.organizations.includes(org)
      );

    return topicsMatch && regionsMatch && organizationsMatch;
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
              onClick={clearFilters}
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
              key={`${stakeholder.name}-${index}`}
              onClick={() => setIsModalOpen(true)}
              className="bg-[#f8f9fa] rounded-lg p-4 flex flex-col items-center text-center hover:shadow-md transition-shadow cursor-pointer"
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

      <IndividualModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}

const IndividualModal = ({ isOpen, onClose }) => {
  const overlayRef = useModal(isOpen, onClose);

  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      ref={overlayRef}
    >
      <div
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal content remains the same */}
        {/* Header */}
        <div className="p-8 pb-6 flex justify-between items-start border-b">
          <div className="text-green-600 text-sm font-semibold">INDIVIDUAL</div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 flex justify-between">
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold mb-2 text-black">
                Sarah Chebet
              </h2>
              <p className="text-gray-600 text-lg mb-2">Environmentalist</p>
              <p>
                <span className="text-green-600">Kevin Ochieng</span>
                <span className="text-gray-600"> and </span>
                <span className="text-green-600">1 other</span>
                <span className="text-gray-600"> mutual connection</span>
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-600">
                <MapPin size={20} />
                <span>Kenya</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Globe size={20} />
                <span>Global</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Link2 size={20} />
                <a
                  href="https://www.unep.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  https://www.unep.org/
                </a>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Linkedin size={20} />
                <a href="#" className="hover:underline">
                  Linked In Profile
                </a>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Sprout size={20} />
                <span>Crop</span>
              </div>
            </div>
          </div>

          <div className="relative w-64 h-64">
            <div className="w-full h-full rounded-full bg-gray-100 overflow-hidden">
              <Image
                src="https://placehold.co/400x400"
                alt="Sarah Chebet"
                fill
                className="object-cover position-relative"
                unoptimized
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 pt-6 flex justify-end border-t">
          <button className="px-8 py-2 border-2 border-zinc-900 rounded-full text-zinc-900 hover:bg-zinc-50 transition-colors">
            Connect
          </button>
        </div>
      </div>
    </div>
  );
};
