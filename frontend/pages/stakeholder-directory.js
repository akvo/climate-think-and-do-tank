import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  ArrowDown,
  ArrowUp,
  Building,
  Globe,
  Link2,
  Linkedin,
  Mail,
  MapPin,
  Search,
  Sprout,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { useModal } from '@/hooks/useModal';
import {
  clearStakeholders,
  fetchStakeholders,
  fetchUserDetails,
  sendConnectionRequest,
} from '@/store/slices/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import TopicsFilter from '@/components/TopicFilter';
import LocationsFilter from '@/components/LocationFilter';
import { env } from '@/helpers/env-vars';
import { toast } from 'react-toastify';

export default function StakeholderDirectory() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [searchQuery, setSearchQuery] = useState('');
  const [openFilter, setOpenFilter] = useState(null);
  const [activeFilters, setActiveFilters] = useState({
    topics: [],
    focusRegions: [],
    type: [],
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStakeholder, setSelectedStakeholder] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  const { stakeholders, loading, error, currentPage, hasMore, user } =
    useSelector((state) => state.auth);

  const {
    topics = [],
    regions = [],
    organizations = [],
  } = useSelector((state) => state.auth);

  const filterOptions = {
    topics: [
      'All',
      ...topics
        .map((topic) => topic.name || topic.attributes?.name)
        .filter(Boolean),
    ],
    focusRegions: regions.map(
      (region) => region.name || region.attributes?.name
    ),
    type: ['Individual', 'Organization'],
  };

  useEffect(() => {
    if (!router.isReady) return;

    const filters = {
      topics: router.query.topics ? router.query.topics.split(',') : [],
      focusRegions: router.query.focusRegions
        ? router.query.focusRegions.split(',')
        : [],
      type: router.query.type ? router.query.type.split(',') : [],
    };

    setActiveFilters(filters);
    setSearchQuery(router.query.query || '');

    dispatch(clearStakeholders());
    dispatch(
      fetchStakeholders({
        page: 1,
        query: router.query.query || '',
        filters,
      })
    );
  }, [router, dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();

    const query = { ...router.query, query: searchQuery };
    if (!searchQuery) delete query.query;

    router.push(
      {
        pathname: router.pathname,
        query,
      },
      undefined,
      { shallow: true }
    );
  };

  const updateFilters = (newFilters) => {
    const query = {};
    if (searchQuery) query.query = searchQuery;
    if (newFilters.topics.length > 0)
      query.topics = newFilters.topics.join(',');
    if (newFilters.focusRegions.length > 0)
      query.focusRegions = newFilters.focusRegions.join(',');
    if (newFilters.type.length > 0) query.type = newFilters.type.join(',');

    router.push(
      {
        pathname: router.pathname,
        query: { ...query },
      },
      undefined,
      { shallow: true }
    );
  };

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

  const clearFilters = () => {
    const emptyFilters = {
      type: [],
      focusRegions: [],
      organizations: [],
    };
    setActiveFilters(emptyFilters);
    setSearchQuery('');

    const query = { ...router.query };
    delete query.topics;
    delete query.focusRegions;
    delete query.type;
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

  const loadMoreStakeholders = () => {
    dispatch(
      fetchStakeholders({
        page: currentPage + 1,
        query: searchQuery,
        filters: activeFilters,
      })
    );
  };

  const openStakeholderModal = (stakeholder) => {
    const enhancedStakeholder = {
      ...stakeholder,
      ...(stakeholder.type === 'Individual'
        ? {
            location: stakeholder.country,
            focusRegions: stakeholder.focusRegions,
            organization: stakeholder.organization,
            organizationWebsite: stakeholder.data.organisation.website,
            profession: stakeholder.data.stakeholder_role,
            valueChains: stakeholder.data.topics.map((topic) => topic.name),
            linkedin: stakeholder.data.linkedin,
            email: stakeholder.data.email,
            mutualConnections: {
              names: ['Kevin Ochieng'],
              count: 2,
            },
          }
        : {
            country: stakeholder.country,
            website: stakeholder.data.website,
            organizationType: stakeholder.data.type,
          }),
    };
    setSelectedStakeholder(enhancedStakeholder);
    setIsModalOpen(true);
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

  const toggleSortOrder = () => {
    setSortOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'));
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Search Section */}
      <div className="py-4 px-4 bg-[#f1f3f5]">
        <div className="container mx-auto">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <input
                type="text"
                placeholder="Try keywords like: 'tilapia' or 'horticulture'"
                className="w-full pl-4 pr-10 py-3 rounded-[26px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="absolute right-3 top-3.5 text-gray-400"
              >
                <Search size={20} />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Filters */}
      <div className="border-t border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
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
                      ? 'Focus regions'
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
                      {filterType === 'topics' ? (
                        <TopicsFilter
                          topics={filterOptions[filterType]}
                          onApply={(selectedTopics) => {
                            const topicsToApply = selectedTopics.includes('All')
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
                          locations={[
                            'All Locations',
                            ...filterOptions[filterType],
                          ]}
                          onApply={(selectedLocations) => {
                            const locationsToApply = selectedLocations.includes(
                              'All Locations'
                            )
                              ? []
                              : selectedLocations;

                            const newFilters = {
                              ...activeFilters,
                              [filterType]: locationsToApply,
                            };
                            setActiveFilters(newFilters);
                            updateFilters(newFilters);
                            setOpenFilter(null);
                          }}
                          name={'Focus Regions'}
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
              <div className="flex justify-end ">
                <button
                  onClick={toggleSortOrder}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                >
                  {sortOrder === 'asc' ? (
                    <>
                      <ArrowUp size={16} />
                      Sort A-Z
                    </>
                  ) : (
                    <>
                      <ArrowDown size={16} />
                      Sort Z-A
                    </>
                  )}
                </button>
              </div>
            </div>
            <button
              onClick={clearFilters}
              className="text-green-600 hover:text-green-700"
            >
              Clear filters
            </button>
          </div>
        </div>

        {(activeFilters.topics?.length > 0 ||
          activeFilters.focusRegions?.length > 0 ||
          activeFilters.type?.length > 0) && (
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
        )}
      </div>

      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        {loading && currentPage === 1 ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-green-500 rounded-full border-t-transparent"></div>
          </div>
        ) : stakeholders.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-500">
              No stakeholders found
            </h3>
            <p className="mt-2 text-gray-400">
              Try adjusting your filters or search terms
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {stakeholders
              .filter(
                (stakeholder) =>
                  stakeholder.type !== 'Individual' ||
                  stakeholder.data.documentId !== user?.documentId
              )
              .map((stakeholder, index) => (
                <div
                  key={`${stakeholder.type}-${stakeholder.id}-${index}`}
                  onClick={() => openStakeholderModal(stakeholder)}
                  className="bg-[#f8f9fa] rounded-lg p-4 flex flex-col  text-left hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="relative w-24 h-24 m-auto">
                    <Image
                      src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${stakeholder.image}`}
                      alt={stakeholder.name}
                      fill
                      className="rounded-full object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="text-xs font-semibold text-green-600 mb-0 mt-4 uppercase">
                    {stakeholder.type}
                  </div>
                  <h3 className="text-md font-semibold text-gray-900">
                    {stakeholder.name}
                  </h3>
                  {stakeholder.topics && stakeholder.topics.length > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      {stakeholder.topics.slice(0, 2).join(', ')}
                      {stakeholder.topics.length > 2 && '...'}
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}{' '}
        {hasMore && (
          <div className="flex justify-center mt-12">
            <button
              onClick={loadMoreStakeholders}
              disabled={loading && currentPage > 1}
              className="px-8 py-3  text-white rounded-[100px] hover:bg-green-700 transition-colors disabled:bg-zinc-400 bg-green-600 font-semibold"
            >
              {loading && currentPage > 1 ? (
                <div className="flex items-center">
                  <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-2"></div>
                  Loading...
                </div>
              ) : (
                'Load More'
              )}
            </button>
          </div>
        )}
      </div>

      <StakeholderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        stakeholder={selectedStakeholder}
      />
    </div>
  );
}

const StakeholderModal = ({ isOpen, onClose, stakeholder }) => {
  const dispatch = useDispatch();
  const overlayRef = useModal(isOpen, onClose);
  const { isAuthenticated, loading, user } = useSelector((state) => state.auth);
  const [userDetails, setUserDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingConnection, setLoadingConnection] = useState(false);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(null);

  const fetchUserDetailsHandler = useCallback(async () => {
    if (isOpen) {
      try {
        setIsLoading(true);
        setError(null);
        const details = await fetchUserDetails(stakeholder.id);
        setUserDetails(details);
        checkConnectionStatus(user, details);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
  }, [isOpen]);

  const checkConnectionStatus = (currentUser, targetStakeholderDetails) => {
    const sentRequest = currentUser.connection_requests_sent.some((sentReq) =>
      targetStakeholderDetails.connection_requests_received.find(
        (receivedReq) =>
          receivedReq.documentId === sentReq.documentId &&
          ['Pending', 'Accepted', 'Rejected'].includes(
            receivedReq.connection_status
          )
      )
    );
    const receivedRequest =
      targetStakeholderDetails.connection_requests_sent.some((sentReq) =>
        currentUser.connection_requests_received.find(
          (receivedReq) =>
            receivedReq.documentId === sentReq.documentId &&
            ['Pending', 'Accepted', 'Rejected'].includes(
              receivedReq.connection_status
            )
        )
      );

    if (sentRequest) {
      const actualRequest =
        targetStakeholderDetails.connection_requests_received.find((req) =>
          currentUser.connection_requests_sent.some(
            (sentReq) => sentReq.documentId === req.documentId
          )
        );

      switch (actualRequest.connection_status) {
        case 'Pending':
          setConnectionStatus('received_pending');
          break;
        case 'Accepted':
          setConnectionStatus('connected');
          break;
        case 'Rejected':
          setConnectionStatus('rejected');
          break;
        default:
          setConnectionStatus('not_connected');
      }
    } else if (receivedRequest) {
      const actualRequest = currentUser.connection_requests_received.find(
        (req) =>
          targetStakeholderDetails.connection_requests_sent.some(
            (sentReq) => sentReq.documentId === req.documentId
          )
      );

      switch (actualRequest.connection_status) {
        case 'Pending':
          setConnectionStatus('sent_pending');
          break;
        case 'Accepted':
          setConnectionStatus('connected');
          break;
        case 'Rejected':
          setConnectionStatus('rejected');
          break;
        default:
          setConnectionStatus('not_connected');
      }
    } else {
      setConnectionStatus('not_connected');
    }
  };

  useEffect(() => {
    fetchUserDetailsHandler();
  }, [fetchUserDetailsHandler]);

  if (!isOpen || !stakeholder) return null;

  const handleConnectRequest = async () => {
    try {
      setLoadingConnection(true);
      const result = await dispatch(
        sendConnectionRequest({
          requester: user.documentId,
          receiver: userDetails.documentId,
        })
      );

      if (sendConnectionRequest.fulfilled.match(result)) {
        toast.success('Connection request sent');
        onClose();
      } else {
        toast.error(result.payload);
      }
    } catch (error) {
      console.log(error);
      toast.error('Failed to send connection request');
    } finally {
      setLoadingConnection(false);
    }
  };

  const handleAcceptRequest = async () => {};

  const renderConnectionButton = () => {
    const currentUserDocumentId =
      user.connection_requests_sent.find((request) => request.documentId)
        ?.documentId ||
      user.connection_requests_received.find((request) => request.documentId)
        ?.documentId ||
      null;

    switch (connectionStatus) {
      case 'sent_pending':
        return (
          <button
            disabled
            className="px-8 py-2 border-2 border-gray-300 rounded-full text-gray-500 cursor-not-allowed"
          >
            Request Sent
          </button>
        );
      case 'received_pending':
        const isReceiver = userDetails.connection_requests_sent.some(
          (request) =>
            request.documentId === currentUserDocumentId &&
            request.connection_status === 'Pending'
        );

        return isReceiver ? (
          <button
            className="px-8 py-2 border-2 border-green-600 rounded-full text-green-600 hover:bg-green-50"
            onClick={handleAcceptRequest}
          >
            Accept Request
          </button>
        ) : (
          <button
            disabled
            className="px-8 py-2 border-2 border-gray-300 rounded-full text-gray-500 cursor-not-allowed"
          >
            Request Pending
          </button>
        );
      case 'connected':
        return (
          <button
            disabled
            className="px-8 py-2 border-2 border-green-600 rounded-full text-green-600"
          >
            Connected
          </button>
        );
      case 'rejected':
        return (
          <button className="px-8 py-2 border-2 border-red-600 rounded-full text-red-600">
            Request Rejected
          </button>
        );
      case 'not_connected':
      default:
        return (
          <button
            onClick={handleConnectRequest}
            disabled={loadingConnection}
            className={`px-8 py-2 border-2 border-zinc-900 rounded-full text-zinc-900 
            ${
              loadingConnection
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-zinc-50'
            }`}
          >
            {loadingConnection ? 'Sending...' : 'Connect'}
          </button>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      ref={overlayRef}
    >
      <div
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-8 pb-6 flex justify-between items-start border-b">
          <div className="text-green-600 text-sm font-semibold uppercase">
            {stakeholder.type}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 flex justify-between">
          <div className="space-y-6 flex-grow">
            <div>
              <h2 className="text-3xl font-bold mb-2 text-black">
                {stakeholder.name}
              </h2>

              {/* Profession/Title */}
              {stakeholder.profession && (
                <p className="text-gray-600 text-lg mb-2">
                  {stakeholder.profession}
                </p>
              )}

              {/* Mutual Connections */}
              {stakeholder.mutualConnections && (
                <p>
                  <span className="text-green-600">
                    {stakeholder.mutualConnections.names.join(', ')}
                  </span>
                  <span className="text-gray-600"> and </span>
                  <span className="text-green-600">
                    {stakeholder.mutualConnections.count - 1} other
                  </span>
                  <span className="text-gray-600"> mutual connection</span>
                </p>
              )}
            </div>

            <div className="space-y-4">
              {/* Location */}

              {stakeholder.type === 'Individual' && (
                <div className="flex items-center gap-3 text-gray-600">
                  <MapPin size={20} />
                  <span>{stakeholder.location || 'Kenya'}</span>
                </div>
              )}

              {/* Focus Regions */}
              {stakeholder.type === 'Individual' && (
                <div className="flex items-center gap-3 text-gray-600">
                  <Globe size={20} />
                  <span>
                    {stakeholder.focusRegions?.length
                      ? stakeholder.focusRegions.join(', ')
                      : 'Kijado, Marsabit, Turkana'}
                  </span>
                </div>
              )}

              {/* Organization (for Individuals) */}
              {stakeholder.type === 'Individual' &&
                stakeholder.organization && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <Building size={20} />
                    <a
                      href={stakeholder.organizationWebsite || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {stakeholder.organization}
                    </a>
                  </div>
                )}

              {/* Country (for Organizations) */}
              {stakeholder.type === 'Organization' && (
                <div className="flex items-center gap-3 text-gray-600">
                  <MapPin size={20} />
                  <span>{stakeholder.country || 'Not specified'}</span>
                </div>
              )}

              {/* Website */}
              {stakeholder.website && (
                <div className="flex items-center gap-3 text-gray-600">
                  <Link2 size={20} />
                  <a
                    href={stakeholder.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {stakeholder.website}
                  </a>
                </div>
              )}

              {/* Organization Type (for Organizations) */}
              {stakeholder.type === 'Organization' &&
                stakeholder.organizationType && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <Building size={20} />
                    <span>{stakeholder.organizationType}</span>
                  </div>
                )}

              {stakeholder.type === 'Individual' && (
                <div className="flex items-center gap-3 text-gray-600">
                  <Linkedin size={20} />
                  {connectionStatus === 'connected' ? (
                    <a
                      href={stakeholder.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {stakeholder.linkedin}
                    </a>
                  ) : (
                    <span className="text-gray-400">
                      LinkedIn Profile (Pending Connection)
                    </span>
                  )}
                </div>
              )}

              {stakeholder.type === 'Individual' && (
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail size={20} />
                  {connectionStatus === 'connected' ? (
                    <a
                      href={`mailto:${stakeholder.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {stakeholder.email}
                    </a>
                  ) : (
                    <span className="text-gray-400">
                      Email Address (Pending Connection)
                    </span>
                  )}
                </div>
              )}

              {/* Value Chains */}
              {stakeholder.valueChains?.length > 0 && (
                <div className="flex items-center gap-3 text-gray-600">
                  <Sprout size={20} />
                  <span>
                    {stakeholder.valueChains &&
                    stakeholder.valueChains.length > 0
                      ? stakeholder.valueChains.join(', ')
                      : 'No Value Chains Selected'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Profile Image */}
          <div className="relative w-64 h-64 ml-8">
            <div className="w-full h-full rounded-full bg-gray-100 overflow-hidden relative">
              <Image
                src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${stakeholder.image}`}
                alt={stakeholder.name}
                className="object-cover relative"
                unoptimized
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        {stakeholder.type === 'Individual' && isAuthenticated && (
          <div className="p-8 pt-6 flex justify-end border-t">
            {renderConnectionButton()}
          </div>
        )}
      </div>
    </div>
  );
};
