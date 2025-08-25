import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, ChevronUp, ChevronDown, LayoutGrid, List } from 'lucide-react';
import { useRouter } from 'next/router';
import { useSearchParams } from 'next/navigation';
import OrganizationModal from '@/components/OrganizationModal';
import { useDispatch, useSelector } from 'react-redux';
import {
  clearInvestmentOpportunityProfiles,
  fetchInvestmentOpportunityProfiles,
} from '@/store/slices/investmentOpportunitySlice';
import debounce from 'lodash/debounce';
import HeroSection from '@/components/Hero';
import FilterSection from '@/components/FilterSection';
import ResultCard from '@/components/ResultCard';

export default function InvestmentOpportunityProfile() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const isInitialLoad = useRef(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({
    region: [],
    valueChain: [],
  });
  const [sortOrder, setSortOrder] = useState('desc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  const {
    investmentOpportunityProfiles,
    loading,
    error,
    currentPage,
    hasMore,
    total,
  } = useSelector((state) => state.investmentOpportunity);

  useEffect(() => {
    if (!router.isReady) return;

    if (isInitialLoad.current) {
      isInitialLoad.current = false;

      const urlFilters = {
        region: router.query.region ? router.query.region.split(',') : [],
        valueChain: router.query.valueChain
          ? router.query.valueChain.split(',')
          : [],
      };

      const sort = router.query.sort || 'desc';
      const query = router.query.query || '';

      setSortOrder(sort);
      setFilters(urlFilters);
      setSearchQuery(query);

      dispatch(clearInvestmentOpportunityProfiles());
      dispatch(
        fetchInvestmentOpportunityProfiles({
          page: 1,
          query,
          filters: urlFilters,
          dateSort: sort,
        })
      );
    }
  }, [router.isReady]);

  useEffect(() => {
    if (!router.isReady || isInitialLoad.current) return;

    const urlFilters = {
      region: router.query.region ? router.query.region.split(',') : [],
      valueChain: router.query.valueChain
        ? router.query.valueChain.split(',')
        : [],
    };

    const sort = router.query.sort || 'desc';
    const query = router.query.query || '';

    const filtersChanged =
      JSON.stringify(urlFilters) !== JSON.stringify(filters);
    const queryChanged = query !== searchQuery;
    const sortChanged = sort !== sortOrder;

    if (filtersChanged || queryChanged || sortChanged) {
      setSortOrder(sort);
      setFilters(urlFilters);
      setSearchQuery(query);

      dispatch(clearInvestmentOpportunityProfiles());
      dispatch(
        fetchInvestmentOpportunityProfiles({
          page: 1,
          query,
          filters: urlFilters,
          dateSort: sort,
        })
      );
    }
  }, [router.query]);

  const updateUrlAndFetch = useCallback(
    debounce((newFilters, newQuery, newSort) => {
      const query = {};
      if (newQuery) query.query = newQuery;
      if (newSort !== 'desc') query.sort = newSort;
      if (newFilters.region.length > 0)
        query.region = newFilters.region.join(',');
      if (newFilters.valueChain.length > 0)
        query.valueChain = newFilters.valueChain.join(',');

      const currentQuery = router.query;
      const hasChanges = JSON.stringify(query) !== JSON.stringify(currentQuery);

      if (hasChanges) {
        router.push(
          {
            pathname: router.pathname,
            query,
          },
          undefined,
          { shallow: true }
        );

        dispatch(clearInvestmentOpportunityProfiles());
        dispatch(
          fetchInvestmentOpportunityProfiles({
            page: 1,
            query: newQuery,
            filters: {
              regions: newFilters.region,
              valueChain: newFilters.valueChain,
            },
            dateSort: newSort,
          })
        );
      }
    }, 300),
    [router, dispatch]
  );

  const handleFilterChange = useCallback(
    (filterKey, values) => {
      setFilters((prev) => {
        const newFilters = {
          ...prev,
          [filterKey]: values,
        };

        updateUrlAndFetch(newFilters, searchQuery, sortOrder);

        return newFilters;
      });
    },
    [searchQuery, sortOrder, updateUrlAndFetch]
  );

  const handleSearch = useCallback(
    debounce((query) => {
      if (query !== searchQuery) {
        setSearchQuery(query);
        updateUrlAndFetch(filters, query, sortOrder);
      }
    }, 500),
    [filters, sortOrder, updateUrlAndFetch, searchQuery]
  );

  const handleSortChange = useCallback(() => {
    setSortOrder((prev) => {
      const newOrder = prev === 'desc' ? 'asc' : 'desc';
      updateUrlAndFetch(filters, searchQuery, newOrder);
      return newOrder;
    });
  }, [filters, searchQuery, updateUrlAndFetch]);

  const handleClearFilters = useCallback(() => {
    const emptyFilters = {
      region: [],
      valueChain: [],
    };

    setFilters(emptyFilters);
    setSearchQuery('');
    setSortOrder('desc');

    updateUrlAndFetch(emptyFilters, '', 'desc');
  }, [updateUrlAndFetch]);

  const handleCardClick = (card) => {
    if (card.documentId) {
      router.push('/iop/' + card.documentId);
    } else {
      setSelectedCard(card);
      setIsModalOpen(true);
    }
  };

  const handleLoadMore = () => {
    dispatch(
      fetchInvestmentOpportunityProfiles({
        page: currentPage + 1,
        query: searchQuery,
        filters: {
          regions: filters.region,
          valueChain: filters.valueChain,
        },
        dateSort: sortOrder,
      })
    );
  };

  const totalResults = total || investmentOpportunityProfiles.length;
  const currentResults = investmentOpportunityProfiles.length;

  return (
    <div className="min-h-screen bg-white">
      <HeroSection
        searchTerm={searchQuery}
        setSearchTerm={handleSearch}
        pageTitle={
          <>
            <span className="text-primary-500">Investment Opportunity</span>{' '}
            Profiles (IOPs)
          </>
        }
        searchText="Search for investment opportunities by region, value chain, or keyword"
        pageDescription="Explore curated climate-resilient investment opportunity profiles in agrifood, water and energy across Kenya’s ASALs. Interested? Reach out to the KDIH network."
      />

      <div className="container mx-auto mt-[-31px] relative z-10">
        <FilterSection
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          visibleFilters={['region', 'valueChain']}
          customLabels={{
            valueChain: 'Value Chain',
          }}
        />
      </div>

      <div className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="text-gray-600">
              <span className="font-bold text-primary-600">
                {currentResults}
              </span>
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

              <div className="flex items-center bg-white rounded-lg border border-gray-200 p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list'
                      ? 'bg-gray-100 text-gray-600'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-gray-100 text-gray-600'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {loading && investmentOpportunityProfiles.length === 0 ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <>
              <div
                className={`${
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'space-y-6'
                }`}
              >
                {investmentOpportunityProfiles.map((card) => (
                  <ResultCard
                    key={card.id}
                    result={{
                      ...card,
                      title: `${card.valueChain} Value Chain in ${card.region} County`,
                      focusRegions: card.region ? [card.region] : ['No Region'],
                      publishedAt: card.publicationDate || 'No Date',
                      topic: card.valueChain ? [card.valueChain] : [],
                      image: card.imageUrl,
                    }}
                    showLink={false}
                    viewMode={viewMode}
                    onClick={handleCardClick}
                  />
                ))}
              </div>

              {investmentOpportunityProfiles.length === 0 && !loading && (
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
                    onClick={handleLoadMore}
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

      <OrganizationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        card={selectedCard}
        onCardClick={handleCardClick}
      />
    </div>
  );
}
