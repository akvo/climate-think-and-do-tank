import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { searchContentAcrossTypes } from '@/store/slices/authSlice';

export default function SearchResults() {
  const router = useRouter();
  const { q } = router.query;
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({
    organizations: { items: [] },
    investments: { items: [] },
    knowledgeHub: { items: [] },
  });
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (q) {
      setQuery(q);
      handleSearch(q);
    }
  }, [q]);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(
        {
          pathname: '/search-results',
          query: { q: query },
        },
        undefined,
        { shallow: true }
      );
      handleSearch(query);
    }
  };

  const handleSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults({
        organizations: { items: [] },
        investments: { items: [] },
        knowledgeHub: { items: [] },
      });
      return;
    }

    setLoading(true);
    try {
      const data = await searchContentAcrossTypes({
        query: searchQuery,
      });
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) =>
    dateString
      ? new Date(dateString).toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric',
        })
      : '';

  const totalResults =
    results.organizations.items.length +
    results.investments.items.length +
    results.knowledgeHub.items.length;

  const getFilteredResults = () => {
    switch (activeTab) {
      case 'organizations':
        return results.organizations.items;
      case 'investments':
        return results.investments.items;
      case 'knowledge':
        return results.knowledgeHub.items;
      default:
        return [
          ...results.organizations.items.map((item) => ({
            ...item,
            type: 'organization',
          })),
          ...results.investments.items.map((item) => ({
            ...item,
            type: 'investment',
          })),
          ...results.knowledgeHub.items.map((item) => ({
            ...item,
            type: 'knowledge',
          })),
        ];
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-6 text-black">Search Results</h1>

          <form onSubmit={handleSubmit} className="mb-6">
            <div className="bg-white rounded-[40px] shadow-md p-1.5 flex items-center">
              <div className="flex-1 flex items-center pl-4">
                <Search size={20} className="text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Search all platform content"
                  className="w-full py-3 bg-transparent outline-none text-black"
                  value={query}
                  onChange={handleInputChange}
                />
              </div>
              <button
                type="submit"
                className="px-8 py-3 bg-green-600 hover:bg-green-800 text-white rounded-[100px] font-medium transition-colors"
              >
                Search
              </button>
            </div>
          </form>

          <div className="flex justify-between items-center mb-6">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === 'all'
                    ? 'text-green-700 border-b-2 border-green-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                All ({totalResults})
              </button>
              <button
                onClick={() => setActiveTab('organizations')}
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === 'organizations'
                    ? 'text-green-700 border-b-2 border-green-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Organizations ({results.organizations.items.length})
              </button>
              <button
                onClick={() => setActiveTab('investments')}
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === 'investments'
                    ? 'text-green-700 border-b-2 border-green-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Investment Opportunities ({results.investments.items.length})
              </button>
              <button
                onClick={() => setActiveTab('knowledge')}
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === 'knowledge'
                    ? 'text-green-700 border-b-2 border-green-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Knowledge Hub ({results.knowledgeHub.items.length})
              </button>
            </div>
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : query && !totalResults ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600 mb-2">
              No results found for &quot;{query}&quot;
            </p>
            <p className="text-gray-500">
              Try adjusting your search terms or filters
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getFilteredResults().map((item, index) => {
              if (
                item.type === 'organization' ||
                activeTab === 'organizations'
              ) {
                return (
                  <Link
                    href={`/organizations/${item.id}`}
                    key={`org-${item.id || index}`}
                    className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 text-black"
                  >
                    <div className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden mr-4 flex-shrink-0">
                          <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600">
                            {item.attributes.name?.charAt(0) || 'O'}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-medium">
                            {item.attributes.name}
                          </h3>
                          <div className="text-sm text-gray-600">
                            Organization
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              } else if (
                item.type === 'investment' ||
                activeTab === 'investments'
              ) {
                return (
                  <Link
                    href={`/investment-opportunities/${item.id}`}
                    key={`inv-${item.id || index}`}
                    className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 text-black"
                  >
                    <div className="relative">
                      <div className="bg-green-500 text-white px-3 py-1 text-sm">
                        Investment Opportunity Profiles
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-sm text-gray-600">
                          {item.attributes.category || 'Investment'}
                        </span>
                      </div>
                      <h3 className="font-medium mb-2 line-clamp-2">
                        {item.attributes.title}
                      </h3>
                      <div className="text-sm text-gray-600">
                        <div>Published</div>
                        <div className="font-medium text-black">
                          {formatDate(item.attributes.publication_date) ||
                            'N/A'}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              } else {
                return (
                  <Link
                    href={`/knowledge-hub/${item.id}`}
                    key={`know-${item.id || index}`}
                    className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
                  >
                    <div className="relative">
                      <div className=" bg-amber-500 text-white px-3 py-1 text-sm">
                        Knowledge Hub
                      </div>
                    </div>
                    <div className="p-4 text-black">
                      <h3 className="font-medium mb-2 line-clamp-2 h-12">
                        {item.attributes.title}
                      </h3>
                      <p className="text-gray-700 text-sm line-clamp-3 mb-3">
                        {item.attributes.description ||
                          item.attributes.summary ||
                          ''}
                      </p>
                      <div className="text-sm text-gray-600">
                        {formatDate(item.attributes.published_at) || 'N/A'}
                      </div>
                    </div>
                  </Link>
                );
              }
            })}
          </div>
        )}
      </div>
    </div>
  );
}
