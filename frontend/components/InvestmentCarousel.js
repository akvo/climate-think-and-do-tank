import { useState, useEffect } from 'react';
import Image from 'next/image';
import axios from 'axios';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { env } from '@/helpers/env-vars';
import { H3 } from './Heading';
import { ParagraphMD } from './Text';

const getImageUrl = (image) => {
  if (typeof image === 'string') return image;
  return image?.url || '/images/placeholder.jpg';
};

const IOPCard = ({ investment, onClick }) => {
  return (
    <Link
      href={`/iop/${investment.documentId}`}
      className="block bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer border border-primary-50"
    >
      <div className="relative h-48 sm:h-52 lg:h-56">
        <Image
          src={getImageUrl(investment.image)}
          alt={investment.title}
          fill
          className="object-cover"
          unoptimized
        />
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3 text-xs sm:text-sm">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500" />
            <span className="text-orange-500 font-medium">
              {investment.region}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
            <span className="text-gray-600">{investment.period}</span>
          </div>
        </div>

        <div className="flex items-start justify-between gap-3">
          <h3 className="font-bold text-base sm:text-lg text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-2 flex-1">
            {investment.title}
          </h3>
          <div className="flex-shrink-0 mt-1">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-100 group-hover:bg-orange-100 flex items-center justify-center transition-all group-hover:translate-x-1">
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 group-hover:text-orange-600" />
            </div>
          </div>
        </div>

        <p className="text-gray-600 text-xs sm:text-sm mt-3 line-clamp-2">
          {investment.description}
        </p>

        {investment.tags && investment.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-3 sm:mt-4">
            {investment.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 sm:px-3 py-0.5 sm:py-1 bg-orange-50 text-orange-600 text-xs font-medium rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
};

const InvestmentCarousel = () => {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [itemsPerSlide, setItemsPerSlide] = useState(3);

  useEffect(() => {
    const updateItemsPerSlide = () => {
      if (window.innerWidth < 640) {
        setItemsPerSlide(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerSlide(2);
      } else {
        setItemsPerSlide(3);
      }
    };

    updateItemsPerSlide();
    window.addEventListener('resize', updateItemsPerSlide);
    return () => window.removeEventListener('resize', updateItemsPerSlide);
  }, []);

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
              documentId: item.documentId,
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
                ? item?.picture_one
                : '/images/placeholder.jpg',
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

  useEffect(() => {
    setCurrentSlide(0);
  }, [itemsPerSlide]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
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
    <section className="py-8 sm:py-12 lg:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 border-t border-gray-200 pt-8 sm:pt-12 lg:pt-16">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6 sm:mb-8 lg:mb-10">
          <div className="mb-6 lg:mb-0">
            <H3 variant="bold" className="text-2xl sm:text-3xl lg:text-4xl">
              <span className="text-primary-500">Investment Opportunity</span>{' '}
              <span>Profiles (IOPs)</span>
            </H3>

            <ParagraphMD className="max-w-2xl mt-3 sm:mt-4 text-sm sm:text-base">
              Think and Do Tank Network: catalyzing investments in Kenya&apos;s
              Arid and Semi-Arid lands&quot; TO &quot;Kenya Drylands Investment
              Hub: your next step towards catalyzing climate action in
              Kenya&apos;s Arid and Semi-Arid lands
            </ParagraphMD>
          </div>
          <Link
            href="/investment-profiles"
            className="inline-flex items-center px-4 sm:px-6 py-2.5 sm:py-3 border border-[#6D8D55] rounded-full text-[#6D8D55] hover:bg-[#6D8D55] hover:text-white transition-colors font-bold text-sm sm:text-base w-full lg:w-auto justify-center mt-4 lg:mt-0"
          >
            Explore investment opportunities
          </Link>
        </div>

        <div className="relative">
          {totalSlides > 1 && (
            <>
              <button
                onClick={goToPrevSlide}
                className="absolute left-0 lg:-left-12 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 sm:p-3 shadow-lg z-10 hover:bg-gray-50 transition-colors"
                aria-label="Previous slide"
              >
                <ChevronLeft
                  size={20}
                  className="text-gray-700 sm:w-6 sm:h-6"
                />
              </button>
              <button
                onClick={goToNextSlide}
                className="absolute right-0 lg:-right-12 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 sm:p-3 shadow-lg z-10 hover:bg-gray-50 transition-colors"
                aria-label="Next slide"
              >
                <ChevronRight
                  size={20}
                  className="text-gray-700 sm:w-6 sm:h-6"
                />
              </button>
            </>
          )}

          <div
            className={`grid gap-4 sm:gap-5 lg:gap-6 ${
              itemsPerSlide === 1
                ? 'grid-cols-1'
                : itemsPerSlide === 2
                ? 'grid-cols-2'
                : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            }`}
          >
            {getCurrentSlideItems().map((investment) => (
              <IOPCard
                key={investment.id}
                investment={investment}
                onClick={() => {}}
              />
            ))}
          </div>
        </div>

        {totalSlides > 1 && (
          <div className="flex justify-center mt-6 sm:mt-8 gap-1.5 sm:gap-2">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1.5 sm:h-2 rounded-full transition-all ${
                  currentSlide === index
                    ? 'bg-orange-500 w-6 sm:w-8'
                    : 'bg-gray-300 hover:bg-gray-400 w-1.5 sm:w-2'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default InvestmentCarousel;
