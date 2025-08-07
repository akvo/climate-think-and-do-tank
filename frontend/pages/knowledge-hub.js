import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutGrid,
  List,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import HeroSection from '@/components/Hero';
import FilterSection from '@/components/FilterSection';
import { useDispatch, useSelector } from 'react-redux';
import debounce from 'lodash/debounce';
import {
  fetchKnowledgeHubs,
  clearKnowledgeHubs,
} from '@/store/slices/knowledgeHubSlice';
import { generatePageNumbers } from '@/helpers/utilities';
import { useRouter } from 'next/router';
import OrganizationModal from '@/components/OrganizationModal';
import ResultCard from '@/components/ResultCard';

const ResultsSection = ({
  knowledgeHubs,
  loading,
  onCardClick,
  sortOrder,
  onSortChange,
  resultsPerPage,
  total,
  onPageChange,
}) => {
  const [viewMode, setViewMode] = useState('list');
  const [currentPage, setCurrentPage] = useState(1);

  const totalResults = total;
  const currentResults = knowledgeHubs.length;

  const totalPages = Math.ceil(totalResults / resultsPerPage);
  const endResult = Math.min(currentPage * resultsPerPage, totalResults);

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="text-gray-600">
            <span className="font-bold text-primary-600">{endResult}</span>
            <span className="text-gray-400"> / {totalResults} Results</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sort by</span>
              <button
                onClick={onSortChange}
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

        {loading && knowledgeHubs.length === 0 ? (
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
              {knowledgeHubs.map((result) => (
                <ResultCard
                  key={result.id}
                  result={result}
                  viewMode={viewMode}
                  onClick={onCardClick}
                />
              ))}
            </div>

            {knowledgeHubs.length === 0 && !loading && (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold text-gray-900">
                  No results found
                </h3>
                <p className="text-gray-600 mt-2">
                  Try adjusting your filters or search terms
                </p>
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-12">
                <button
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="font-medium">Previous</span>
                </button>

                <div className="flex items-center gap-2">
                  {generatePageNumbers(currentPage, totalPages).map(
                    (page, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          typeof page === 'number' && onPageChange(page);
                          setCurrentPage(page);
                        }}
                        className={`w-10 h-10 rounded-[50%] font-medium transition-colors ${
                          page === currentPage
                            ? 'bg-primary-100 text-primary-600'
                            : page === '...'
                            ? 'text-gray-400 cursor-default'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                        disabled={page === '...'}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>

                <button
                  onClick={() => {
                    onPageChange(currentPage + 1);
                    setCurrentPage(currentPage + 1);
                  }}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="font-medium">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const KnowledgeLibrary = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const { knowledgeHubs, loading, currentPage, total } = useSelector(
    (state) => state.knowledgeHub
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filters, setFilters] = useState({
    region: [],
    topic: [],
    type: [],
    year: [],
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [resultsPerPage] = useState(12);

  useEffect(() => {
    if (!router.isReady) return;

    const urlFilters = {
      region: router.query.focusRegions
        ? router.query.focusRegions.split(',')
        : [],
      topic: router.query.topic ? router.query.topic.split(',') : [],
      type: router.query.type ? router.query.type.split(',') : [],
      year: router.query.date ? router.query.date.split(',') : [],
    };

    const sort = router.query.sort || 'desc';
    const query = router.query.query || '';

    setSortOrder(sort);
    setFilters(urlFilters);
    setSearchTerm(query);

    const apiFilters = {
      topic: urlFilters.topic,
      focusRegions: urlFilters.region,
      type: urlFilters.type,
      date: urlFilters.year,
    };

    dispatch(clearKnowledgeHubs());
    dispatch(
      fetchKnowledgeHubs({
        page: 1,
        query,
        filters: apiFilters,
        dateSort: sort,
        dateFilter: apiFilters.date.length > 0 ? apiFilters.date : null,
      })
    );
  }, [router.isReady, router.query, dispatch]);

  const updateUrlAndFetch = (newFilters, newQuery, newSort) => {
    const query = {};
    if (newQuery) query.query = newQuery;
    if (newSort) query.sort = newSort;
    if (newFilters.region.length > 0)
      query.focusRegions = newFilters.region.join(',');
    if (newFilters.topic.length > 0) query.topic = newFilters.topic.join(',');
    if (newFilters.type.length > 0) query.type = newFilters.type.join(',');
    if (newFilters.year.length > 0) query.date = newFilters.year.join(',');

    router.push(
      {
        pathname: router.pathname,
        query,
      },
      undefined,
      { shallow: true }
    );

    const apiFilters = {
      topic: newFilters.topic,
      focusRegions: newFilters.region,
      type: newFilters.type,
      date: newFilters.year,
    };

    dispatch(clearKnowledgeHubs());
    dispatch(
      fetchKnowledgeHubs({
        page: 1,
        query: newQuery,
        filters: apiFilters,
        dateSort: newSort,
        dateFilter: apiFilters.date.length > 0 ? apiFilters.date : null,
      })
    );
  };

  const handleFilterChange = (filterKey, values) => {
    const newFilters = {
      ...filters,
      [filterKey]: values,
    };
    setFilters(newFilters);
    updateUrlAndFetch(newFilters, searchTerm, sortOrder);
  };

  const handleClearFilters = () => {
    const emptyFilters = {
      region: [],
      topic: [],
      type: [],
      year: [],
    };
    setFilters(emptyFilters);
    setSearchTerm('');
    updateUrlAndFetch(emptyFilters, '', sortOrder);
  };

  const handleSearch = useCallback(
    debounce((query) => {
      setSearchTerm(query);
      updateUrlAndFetch(filters, query, sortOrder);
    }, 500),
    [filters, sortOrder]
  );

  const handleSortChange = () => {
    const newOrder = sortOrder === 'desc' ? 'asc' : 'desc';
    setSortOrder(newOrder);
    updateUrlAndFetch(filters, searchTerm, newOrder);
  };

  const handlePageChange = (page) => {
    const apiFilters = {
      topic: filters.topic,
      focusRegions: filters.region,
      type: filters.type,
      date: filters.year,
    };

    dispatch(clearKnowledgeHubs());
    dispatch(
      fetchKnowledgeHubs({
        page: page,
        query: searchTerm,
        filters: apiFilters,
        dateSort: sortOrder,
      })
    );
  };

  const handleCardClick = (card) => {
    setSelectedCard(card);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <HeroSection searchTerm={searchTerm} setSearchTerm={handleSearch} />

      <div className="container mx-auto mt-[-31px] relative z-10">
        <FilterSection
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          visibleFilters={['region', 'topic', 'type', 'year']}
        />
      </div>
      <ResultsSection
        knowledgeHubs={knowledgeHubs}
        loading={loading}
        onCardClick={handleCardClick}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        currentPage={currentPage}
        total={total}
        resultsPerPage={resultsPerPage}
        onPageChange={handlePageChange}
      />
      <OrganizationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        card={selectedCard}
        onCardClick={handleCardClick}
      />
    </div>
  );
};

export default KnowledgeLibrary;
