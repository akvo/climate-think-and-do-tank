import { useState, useRef } from 'react';
import Image from 'next/image';
import { searchContentAcrossTypes } from '@/store/slices/authSlice';

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState({
    organizations: {
      items: [],
      pagination: { total: 0, pageCount: 0, page: 1, pageSize: 10 },
    },
    sectors: {
      items: [],
      pagination: { total: 0, pageCount: 0, page: 1, pageSize: 10 },
    },
  });
  const searchTimeoutRef = useRef();

  const investments = [
    {
      image: 'https://placehold.co/300x400',
      category: 'Horticulture',
      title: 'Horticulture for Export',
      amount: 'KES 5,705,000',
      period: '/Annum',
    },
    {
      image: 'https://placehold.co/300x400',
      category: 'Agriculture',
      title: 'Silage Production Plant',
      amount: 'KES 1,205,000',
      period: '/Annum',
    },
    {
      image: 'https://placehold.co/300x400',
      category: 'Technology',
      title: 'Smart Irrigation Kits Startup',
      amount: 'KES 605,000',
      period: '/Annum',
    },
    {
      image: 'https://placehold.co/300x400',
      category: 'Agriculture',
      title: 'Greenhouse agriculture',
      amount: 'KES 1,490,000',
      period: '/Annum',
    },
  ];

  const handleSearch = async (searchQuery, currentPage = 1) => {
    if (!searchQuery.trim()) {
      setResults({
        organizations: {
          items: [],
          pagination: { total: 0, pageCount: 0, page: 1, pageSize: 10 },
        },
        sectors: {
          items: [],
          pagination: { total: 0, pageCount: 0, page: 1, pageSize: 10 },
        },
      });
      return;
    }

    try {
      const data = await searchContentAcrossTypes({
        query: searchQuery,
        page: currentPage,
        pageSize: 10,
      });
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(value, 1);
    }, 300);
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-24 text-black">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold mb-4">
            Investing in Agri-food, Water, and Energy in Kenya's ASALs
          </h1>
          <p className="text-gray-600 mb-8">
            The hub promotes collaboration, learning, and adaptive management,
            leveraging social accountability to strengthen community and
            institutional efforts, and disseminates insights for sustainable
            agrifood systems.
          </p>
          <div className="relative max-w-xl flex border border-gray-200 rounded-[40px] p-0.5">
            <input
              type="text"
              placeholder="Search all platform content"
              className="px-4 py-2 pr-12 rounded-[40px] flex-1"
              value={query}
              onChange={handleInputChange}
            />
            <button className="px-4 py-1 bg-zinc-900 text-white rounded-[100px]">
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-16 text-black">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-black">
            Connect. Convene. Catalyse.
          </h2>

          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-1 bg-white p-8 rounded-lg">
              <h3 className="text-2xl font-bold mb-4">Catalyse Investments</h3>
              <p className="text-gray-600 mb-8">
                We connect investments to investment opportunities in Kenya's
                drylands. Check out our tools to keep you ahead in a fast-moving
                market.
              </p>
              <button className="px-6 py-2 border-2 border-zinc-900 rounded-full hover:bg-gray-50">
                Learn More
              </button>
            </div>

            <div className="col-span-2 bg-white p-8 rounded-lg">
              <h3 className="text-2xl font-bold mb-4">
                Connect through our Stakeholder Directory
              </h3>
              <p className="text-gray-600 mb-8">
                Reach out to the people you need to build resilience in Kenya's
                drylands. Sign up and become part of our network.
              </p>
              <button className="px-6 py-2 border-2 border-zinc-900 rounded-full hover:bg-gray-50">
                Learn More
              </button>
            </div>

            <div className="col-span-2 bg-white p-8 rounded-lg">
              <h3 className="text-2xl font-bold mb-4">Knowledge Hub</h3>
              <p className="text-gray-600 mb-8">
                Find and download high-quality data to support your mission in
                Kenya's drylands.
              </p>
              <button className="px-6 py-2 border-2 border-zinc-900 rounded-full hover:bg-gray-50">
                Learn More
              </button>
            </div>

            <div className="col-span-1 bg-white p-8 rounded-lg">
              <h3 className="text-2xl font-bold mb-4">Social Accountability</h3>
              <p className="text-gray-600 mb-8">
                Our insights include the Social Accountabilty approach to make
                sure you make decisions that are rooted into Kenya's local
                context.
              </p>
              <button className="px-6 py-2 border-2 border-zinc-900 rounded-full hover:bg-gray-50">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-16 text-black">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-center text-gray-600 mb-8">Our Partners</h2>
          <div className="flex flex-wrap justify-center items-center gap-12">
            {[
              'Simavi',
              'SNV',
              'Lifewater',
              'unicef',
              'ONE',
              'idh',
              'nuffic',
            ].map((partner) => (
              <div
                key={partner}
                className="w-32 h-12 relative grayscale hover:grayscale-0 transition-all"
              >
                <Image
                  src={`https://placehold.co/128x48`}
                  alt={partner}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Investment Opportunities Section */}
      <section className="bg-gray-50 py-16 text-black">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">
            Investment Opportunity Profiles (IOPs)
          </h2>
          <p className="text-gray-600 mb-8">
            Think and Do Tank Network: the next step towards catalysing climate
            action in Kenya's Arid and Semi-Arid lands
          </p>
          <div className="grid md:grid-cols-4 gap-6">
            {investments.map((investment, index) => (
              <div key={index} className="bg-white rounded-lg overflow-hidden">
                <div className="relative h-48">
                  <Image
                    src={investment.image}
                    alt={investment.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm text-gray-600">
                      {investment.category}
                    </span>
                  </div>
                  <h3 className="font-medium mb-2">{investment.title}</h3>
                  <div className="text-sm text-gray-600">
                    <div>Amount Raised</div>
                    <div className="font-medium text-black">
                      {investment.amount}
                      <span className="text-gray-600">{investment.period}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Carousel Indicators */}
          <div className="flex justify-center mt-8 gap-2">
            {[0, 1, 2].map((index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  currentSlide === index ? 'bg-zinc-900' : 'bg-gray-300'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
