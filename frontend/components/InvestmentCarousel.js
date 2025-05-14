import { useState, useEffect } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { env } from '@/helpers/env-vars';

const InvestmentCarousel = () => {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const itemsPerSlide = 4;

  useEffect(() => {
    const fetchInvestments = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${env(
            'NEXT_PUBLIC_BACKEND_URL'
          )}/api/investment-opportunity-profiles?populate[0]=picture_one&populate[1]=region&populate[2]=value_chain&pagination[limit]=12&sort=createdAt:desc`
        );

        if (response.data && response.data.data) {
          const formattedInvestments = response.data.data.map((item) => {
            return {
              id: item.id,
              title: `${item.value_chain.name} In ${item.region.name}`,
              region: item.region.name,
              amount: '$0',
              period: item.publication_date
                ? new Date(item.publication_date).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })
                : '',
              image: item?.picture_one?.url
                ? `${env('NEXT_PUBLIC_BACKEND_URL')}${item?.picture_one?.url}`
                : '/images/placholder.jpg',
            };
          });

          setInvestments(formattedInvestments);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching investments:', err);
        setError('Failed to load investment opportunities');
        setLoading(false);
      }
    };

    fetchInvestments();
  }, []);

  const totalSlides = Math.ceil(investments.length / itemsPerSlide);

  const getCurrentSlideItems = () => {
    const startIndex = currentSlide * itemsPerSlide;
    return investments.slice(startIndex, startIndex + itemsPerSlide);
  };

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-600 p-8">{error}</div>;
  }

  if (investments.length === 0) {
    return (
      <div className="text-center text-gray-600 p-8">
        No investment opportunities available at this time.
      </div>
    );
  }

  return (
    <section className="bg-gray-50 py-16 text-black">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-6 text-center">
          Latest Opportunity Profiles
        </h2>

        <div className="relative">
          <button
            onClick={goToPrevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 bg-white rounded-full p-2 shadow-lg z-10 hover:bg-gray-100"
            aria-label="Previous slide"
          >
            <ChevronLeft size={24} />
          </button>

          <div className="grid md:grid-cols-4 gap-6">
            {getCurrentSlideItems().map((investment, index) => (
              <div
                key={investment.id || index}
                className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
              >
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
                      {investment.region}
                    </span>
                  </div>
                  <h3 className="font-medium mb-2 line-clamp-2">
                    {investment.title}
                  </h3>
                  <div className="text-sm text-gray-600">
                    <div className="font-medium text-black">
                      <span className="text-gray-600">{investment.period}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={goToNextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 bg-white rounded-full p-2 shadow-lg z-10 hover:bg-gray-100"
            aria-label="Next slide"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        <div className="flex justify-center mt-8 gap-2">
          {Array.from({ length: totalSlides }).map((_, index) => (
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
  );
};

export default InvestmentCarousel;
