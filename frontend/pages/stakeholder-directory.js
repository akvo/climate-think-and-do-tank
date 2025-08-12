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
  ChevronRight,
  Filter,
  User,
  ListFilter,
  Share2,
} from 'lucide-react';
import Image from 'next/image';
import { useModal } from '@/hooks/useModal';
import {
  acceptConnectionRequest,
  clearStakeholders,
  fetchStakeholders,
  fetchUserDetails,
  sendConnectionRequest,
} from '@/store/slices/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import debounce from 'lodash/debounce';
import { env } from '@/helpers/env-vars';
import { getImageUrl } from '@/helpers/utilities';
import HeroSection from '@/components/Hero';
import FilterSection from '@/components/FilterSection';

export default function StakeholderDirectory() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    topics: [],
    focusRegions: [],
    type: [],
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStakeholder, setSelectedStakeholder] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');

  const { stakeholders, loading, error, currentPage, hasMore, user, total } =
    useSelector((state) => state.auth);

  useEffect(() => {
    if (!router.isReady) return;

    const urlFilters = {
      topics: router.query.topics ? router.query.topics.split(',') : [],
      focusRegions: router.query.focusRegions
        ? router.query.focusRegions.split(',')
        : [],
      type: router.query.type ? router.query.type.split(',') : [],
    };

    setFilters(urlFilters);
    setSearchQuery(router.query.query || '');
    setSortOrder(router.query.sort || 'asc');

    dispatch(clearStakeholders());
    dispatch(
      fetchStakeholders({
        page: 1,
        query: router.query.query || '',
        filters: urlFilters,
        sortOrder: router.query.sort || 'asc',
      })
    );
  }, [router.isReady, router.query, dispatch]);

  const handleSearch = useCallback(
    debounce((query) => {
      setSearchQuery(query);
      updateUrlAndFetch(filters, query, sortOrder);
    }, 500),
    [filters, sortOrder]
  );

  const updateUrlAndFetch = useCallback(
    (newFilters, query, sort) => {
      const queryParams = {};
      if (query) queryParams.query = query;
      if (sort !== 'asc') queryParams.sort = sort;
      if (newFilters.focusRegions?.length > 0)
        queryParams.focusRegions = newFilters.focusRegions.join(',');
      if (newFilters.topics?.length > 0)
        queryParams.topics = newFilters.topics.join(',');
      if (newFilters.type?.length > 0)
        queryParams.type = newFilters.type.join(',');

      router.push(
        {
          pathname: router.pathname,
          query: queryParams,
        },
        undefined,
        { shallow: true }
      );
    },
    [router]
  );

  const handleFilterChange = (filterKey, values) => {
    const newFilters = {
      ...filters,
      [filterKey === 'topic'
        ? 'topics'
        : filterKey === 'region'
        ? 'focusRegions'
        : filterKey]: values,
    };
    setFilters(newFilters);
    updateUrlAndFetch(newFilters, searchQuery, sortOrder);
  };

  const handleClearFilters = () => {
    const emptyFilters = {
      focusRegions: [],
      topics: [],
      type: [],
    };
    setFilters(emptyFilters);
    setSearchQuery('');
    updateUrlAndFetch(emptyFilters, '', sortOrder);
  };

  const handleSortChange = () => {
    const newSort = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newSort);
    updateUrlAndFetch(filters, searchQuery, newSort);
  };

  const loadMoreStakeholders = () => {
    dispatch(
      fetchStakeholders({
        page: currentPage + 1,
        query: searchQuery,
        filters: filters,
        sortOrder: sortOrder,
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
            organizationWebsite: stakeholder.data.organisation?.website,
            profession: stakeholder.data.stakeholder_role,
            valueChains:
              stakeholder.data.topics?.map((topic) => topic.name) || [],
            linkedin: stakeholder.data.linkedin,
            email: stakeholder.data.email,
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

  const totalResults = total || stakeholders.length;

  console.log(filters);

  return (
    <div className="min-h-screen bg-white">
      <HeroSection
        searchTerm={searchQuery}
        setSearchTerm={handleSearch}
        pageTitle="Connect with stakeholders"
        pageDescription="Lorem ipsum dolor sit amet consectetur. Tempus vitae viverra duis ultricies cursus cras arcu."
        showSearch={true}
        searchText={'Search stakeholders by name, region, or topic'}
        searchPlaceholder="Kenya's arid land"
      />

      <div className="container mx-auto mt-[-31px] relative z-10">
        <FilterSection
          filters={{
            topic: filters.topics,
            region: filters.focusRegions,
            type: filters.type,
          }}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          visibleFilters={['region', 'topic', 'type']}
          isStakeholderDirectory={true}
          customLabels={{
            type: 'Type',
          }}
        />
      </div>

      <div className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="text-gray-600">
              <span className="font-bold text-primary-600">{totalResults}</span>
              <span className="text-gray-400"> Results</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sort by</span>
              <button
                onClick={handleSortChange}
                className="bg-white border border-primary-400 rounded-full px-4 py-2 text-sm font-medium text-primary-700 hover:bg-primary-50 flex items-center gap-2"
              >
                {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
                {sortOrder === 'asc' ? (
                  <ListFilter className="w-4 h-4" />
                ) : (
                  <ListFilter className="w-4 h-4 rotate-180" />
                )}
              </button>
            </div>
          </div>

          {loading && currentPage === 1 ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : stakeholders.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold text-gray-900">
                No stakeholders found
              </h3>
              <p className="text-gray-600 mt-2">
                Try adjusting your filters or search terms
              </p>
            </div>
          ) : (
            <>
              {/* Stakeholder Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {stakeholders
                  .filter(
                    (stakeholder) =>
                      stakeholder.type !== 'Individual' ||
                      stakeholder.data.documentId !== user?.documentId
                  )
                  .map((stakeholder, index) => (
                    <StakeholderCard
                      key={`${stakeholder.type}-${stakeholder.id}-${index}`}
                      stakeholder={stakeholder}
                      onClick={() => openStakeholderModal(stakeholder)}
                    />
                  ))}
              </div>

              {totalResults > 0 && (
                <div className="flex items-center justify-between mt-12">
                  <button
                    onClick={() => {
                      if (currentPage > 1) {
                        // Handle previous page
                      }
                    }}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← Previous
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-primary-100 text-primary-600 rounded">
                      {currentPage}
                    </span>
                  </div>

                  <button
                    onClick={loadMoreStakeholders}
                    disabled={!hasMore || loading}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <StakeholderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        stakeholder={selectedStakeholder}
        router={router}
      />
    </div>
  );
}

function StakeholderCard({ stakeholder, onClick }) {
  const isOrganization = stakeholder.type === 'Organization';

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-100 rounded-lg p-6 hover:shadow-lg transition-all duration-200 cursor-pointer group"
    >
      <div className="flex items-start gap-4">
        <div className="relative">
          <div className="relative w-16 h-16 flex-shrink-0">
            {stakeholder.image ? (
              <Image
                src={getImageUrl(stakeholder.image)}
                alt={stakeholder.name}
                fill
                className="rounded-full object-cover"
                unoptimized
                onError={(e) => {
                  e.target.style.display = 'none';
                  const parent = e.target.parentNode;
                  if (parent) {
                    parent.innerHTML = `
                      <div class="w-full h-full bg-gradient-to-br ${
                        isOrganization
                          ? 'from-primary-50 to-primary-600'
                          : 'from-primary-50 to-primary-600'
                      } rounded-full flex items-center justify-center text-white font-bold text-xl">
                        ${stakeholder.name.charAt(0).toUpperCase()}
                      </div>
                    `;
                  }
                }}
              />
            ) : (
              <div
                className={`w-full h-full rounded-full flex items-center justify-center text-white font-bold text-xl bg-gradient-to-br ${
                  isOrganization
                    ? 'from-primary-50 to-primary-600'
                    : 'from-primary-50 to-primary-600'
                }`}
              >
                {stakeholder.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div
            className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white bg-primary-600`}
          >
            {isOrganization ? (
              <Building className="w-3.5 h-3.5 text-white" />
            ) : (
              <User className="w-3.5 h-3.5 text-white" />
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {stakeholder.topics?.slice(0, 2).map((topic) => (
              <span
                key={topic}
                className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-primary-50 text-primary-500"
              >
                {topic}
              </span>
            ))}
            {stakeholder.topics?.length > 2 && (
              <span className="text-xs text-primary-400">
                +{stakeholder.topics.length - 2}
              </span>
            )}
          </div>

          <h3 className="font-semibold text-gray-900 text-lg mb-1 group-hover:text-primary-600 transition-colors">
            {stakeholder.name}
          </h3>

          {isOrganization ? (
            stakeholder.organizationType && (
              <p className="text-sm text-primary-500 mb-2 flex items-center gap-1">
                <span className="text-primary-400">Type:</span>{' '}
                {stakeholder.organizationType}
              </p>
            )
          ) : (
            <>
              {stakeholder.organization && (
                <p className="text-sm text-primary-600 mb-1 font-medium">
                  {stakeholder.organization}
                </p>
              )}
              {stakeholder.profession && (
                <p className="text-sm text-primary-500 italic">
                  {stakeholder.profession}
                </p>
              )}
            </>
          )}

          {(stakeholder.location || stakeholder.country) && (
            <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
              <MapPin className="w-3 h-3" />
              <span>{stakeholder.location || stakeholder.country}</span>
            </div>
          )}
        </div>

        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors flex-shrink-0 mt-6" />
      </div>
    </div>
  );
}

export const StakeholderModal = ({ isOpen, onClose, stakeholder, router }) => {
  const dispatch = useDispatch();
  const overlayRef = useModal(isOpen, onClose);
  const { isAuthenticated, loading, user } = useSelector((state) => state.auth);
  const [currentUser, setCurrentUser] = useState(null);
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
        const currentUserDetails = await fetchUserDetails(user.id);
        setCurrentUser(currentUserDetails);

        const details = await fetchUserDetails(stakeholder.id);
        setUserDetails(details);
        checkConnectionStatus(currentUserDetails, details);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
  }, [isOpen]);

  const checkConnectionStatus = (currentUser, targetStakeholderDetails) => {
    const sentRequest = currentUser.connection_requests_sent.some((sentReq) =>
      targetStakeholderDetails.connection_requests_received.some(
        (receivedReq) =>
          receivedReq.documentId === sentReq.documentId &&
          ['Pending', 'Accepted', 'Rejected'].includes(
            receivedReq.connection_status
          )
      )
    );

    const receivedRequest =
      targetStakeholderDetails.connection_requests_sent.some((sentReq) =>
        currentUser.connection_requests_received.some(
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
    } else if (receivedRequest) {
      const actualRequest = currentUser.connection_requests_received.find(
        (req) =>
          targetStakeholderDetails.connection_requests_sent.some(
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

  const handleAcceptRequest = async (id) => {
    try {
      setLoadingConnection(true);
      const result = await dispatch(
        acceptConnectionRequest({
          connectionId: id,
          requester: userDetails.documentId,
          receiver: currentUser.documentId,
        })
      );

      if (acceptConnectionRequest.fulfilled.match(result)) {
        toast.success('Connection request accepted');
        setConnectionStatus('connected');
      } else {
        toast.error(result.payload);
      }
    } catch (error) {
      console.log(error);
      toast.error('Failed to accept connection request');
    } finally {
      setLoadingConnection(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: stakeholder.name,
        text: `Check out ${stakeholder.name}'s profile`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  const renderConnectionButton = () => {
    switch (connectionStatus) {
      case 'sent_pending':
        return (
          <button
            disabled
            className="px-8 py-3 bg-gray-200 rounded-full text-gray-500 cursor-not-allowed font-medium"
          >
            Request Sent
          </button>
        );
      case 'received_pending':
        const isReceiver = currentUser?.connection_requests_received?.find(
          (req) =>
            userDetails?.connection_requests_sent.some(
              (sentReq) => sentReq.documentId === req.documentId
            )
        );

        return isReceiver ? (
          <button
            className="px-8 py-3 bg-green-600 rounded-full text-white hover:bg-green-700 font-medium transition-colors"
            onClick={() => handleAcceptRequest(isReceiver.documentId)}
            disabled={loadingConnection}
          >
            {loadingConnection ? 'Accepting...' : 'Accept Request'}
          </button>
        ) : (
          <button
            disabled
            className="px-8 py-3 bg-gray-200 rounded-full text-gray-500 cursor-not-allowed font-medium"
          >
            Request Pending
          </button>
        );
      case 'connected':
        return (
          <button
            disabled
            className="px-8 py-3 bg-green-100 rounded-full text-green-700 font-medium"
          >
            Connected
          </button>
        );
      case 'rejected':
        return (
          <button className="px-8 py-3 bg-red-100 rounded-full text-red-600 font-medium">
            Request Rejected
          </button>
        );
      case 'not_connected':
      default:
        return (
          <button
            onClick={handleConnectRequest}
            disabled={loadingConnection}
            className={`px-8 py-3 bg-[#B87B5C] rounded-full text-white font-medium
            ${
              loadingConnection
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-[#A06B4C] transition-colors'
            }`}
          >
            {loadingConnection ? 'Sending...' : 'Connect'}
          </button>
        );
    }
  };

  const getThemes = () => {
    return stakeholder.themes || ['Agriculture'];
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      ref={overlayRef}
    >
      <div
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative bg-white px-8 pt-8">
          <div className="inline-block px-4 py-1.5 bg-[#F5E6D8] text-[#B87B5C] rounded-full text-sm font-medium">
            {stakeholder.type}
          </div>

          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className=" flex items-center justify-between px-8 py-6 border-b flex-wrap">
          <div className="flex items-center gap-8 text-gray-600">
            {stakeholder.type === 'Individual' && (
              <>
                {stakeholder.type === 'Individual' && stakeholder.location && (
                  <div className="flex items-center gap-2">
                    <MapPin size={18} className="text-[#B87B5C]" />
                    <span>{stakeholder.location}</span>
                  </div>
                )}
                {stakeholder.focusRegions && (
                  <div className="flex items-center gap-2">
                    <Globe size={18} className="text-gray-500" />
                    <span>{stakeholder.focusRegions[0]}</span>
                  </div>
                )}
              </>
            )}
            {stakeholder.type === 'Organization' && stakeholder.country && (
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-[#B87B5C]" />
                <span>{stakeholder.country}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="px-6 py-2.5 border border-primary-400 rounded-full flex items-center gap-2 text-primary-400 hover:bg-primary-500 hover:text-white transition-colors"
            >
              <span className="font-medium">Share</span>
              <Share2 size={18} />
            </button>
            {stakeholder.type === 'Individual' &&
              isAuthenticated &&
              renderConnectionButton()}
            {stakeholder.type === 'Individual' && !isAuthenticated && (
              <button
                className="px-8 py-3 bg-[#B87B5C] rounded-full text-white font-medium hover:bg-[#A06B4C] transition-colors"
                onClick={() => router.push('/login')}
              >
                Connect
              </button>
            )}
          </div>
        </div>

        <div className="px-8 py-6">
          <div className="flex items-start gap-6 mb-8">
            <div className="relative w-20 h-20 flex-shrink-0">
              {stakeholder.image ? (
                <div className="w-full h-full rounded-full overflow-hidden bg-gray-100">
                  <Image
                    src={getImageUrl(stakeholder.image)}
                    alt={stakeholder.name}
                    className="object-cover"
                    fill
                    unoptimized
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentNode.innerHTML = `
                        <div class="w-full h-full flex items-center justify-center bg-[#B87B5C] text-white text-2xl font-bold rounded-full">
                          ${stakeholder.name.charAt(0).toUpperCase()}
                        </div>
                      `;
                    }}
                  />
                </div>
              ) : (
                <div className="w-full h-full rounded-full bg-[#B87B5C] flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {stakeholder.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            <div className="flex-grow">
              <h2 className="text-3xl font-bold text-gray-900 mb-1">
                {stakeholder.name}
              </h2>
              {stakeholder.type === 'Individual' &&
                stakeholder.organization && (
                  <p className="text-xl text-[#B87B5C] font-medium">
                    {stakeholder.organization}
                  </p>
                )}
              {stakeholder.profession && (
                <p className="text-gray-600 mt-1">{stakeholder.profession}</p>
              )}
            </div>
          </div>

          {stakeholder.bio && (
            <p className="text-gray-600 leading-relaxed mb-8">
              {stakeholder.bio}
            </p>
          )}

          {stakeholder.valueChains?.length > 0 && (
            <div className="border-t pt-6">
              <p className="text-gray-500 mb-3">
                Theme/Sector in this document:
              </p>
              <div className="flex flex-wrap gap-2">
                {stakeholder.valueChains.map((theme, index) => (
                  <span
                    key={index}
                    className="px-4 py-1.5 bg-[#FFF4ED] text-[#B87B5C] rounded-full text-sm"
                  >
                    {theme}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 space-y-3">
            {stakeholder.type === 'Individual' && (
              <>
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail size={18} />
                  {connectionStatus === 'connected' ? (
                    <a
                      href={`mailto:${stakeholder.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {stakeholder.email}
                    </a>
                  ) : (
                    <span className="text-gray-400">
                      Email (Connect to view)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-gray-600">
                  <Linkedin size={18} />
                  {connectionStatus === 'connected' ? (
                    <a
                      href={stakeholder.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      LinkedIn Profile
                    </a>
                  ) : (
                    <span className="text-gray-400">
                      LinkedIn (Connect to view)
                    </span>
                  )}
                </div>
              </>
            )}

            {stakeholder.website && (
              <div className="flex items-center gap-3 text-gray-600">
                <Link2 size={18} />
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
          </div>
        </div>
      </div>
    </div>
  );
};
