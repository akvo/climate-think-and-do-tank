import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import Image from 'next/image';
import axios from 'axios';
import { env } from '@/helpers/env-vars';
import { useRouter } from 'next/router';
import { getImageUrl } from '@/helpers/utilities';

const HeroSlider = ({ setData }) => {
  const router = useRouter();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [sliderData, setSliderData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const fetchHomepageData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${env(
            'NEXT_PUBLIC_BACKEND_URL'
          )}/api/homepage?populate=hero_image_slider.files`
        );

        if (response.data && response.data.data) {
          const homepageData = response.data.data;
          setData({
            title: homepageData.homepage_blurb || '',
            description: homepageData.homepage_description || '',
          });
          if (
            homepageData.hero_image_slider &&
            Array.isArray(homepageData.hero_image_slider)
          ) {
            const slides = homepageData.hero_image_slider.map(
              (slide, index) => {
                const imageUrl =
                  slide.files && slide.files.length > 0 ? slide.files[0] : '';

                return {
                  image: imageUrl,
                };
              }
            );

            setSliderData(slides);
          }
        }

        setLoading(false);
      } catch (err) {
        setError('Failed to load slider data');
        setLoading(false);
      }
    };

    fetchHomepageData();
  }, []);

  useEffect(() => {
    if (sliderData.length === 0) return;

    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) =>
        prevSlide === sliderData.length - 1 ? 0 : prevSlide + 1
      );
    }, 5000);

    return () => clearInterval(timer);
  }, [sliderData.length]);

  if (loading) {
    return (
      <section className="relative overflow-hidden pb-12 h-[600px] bg-gray-100">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading slider content...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error && sliderData.length === 0) {
    return (
      <section className="relative overflow-hidden pb-12 h-[600px] bg-gray-100">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-red-600">
            <p>{error}</p>
          </div>
        </div>
      </section>
    );
  }

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push({
        pathname: '/search-results',
        query: { q: query },
      });
    }
  };

  return (
    <section className="relative overflow-hidden pb-12">
      <div className="relative h-[500px]">
        {sliderData.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30 z-10"></div>
            <Image
              src={getImageUrl(slide.image)}
              alt={slide.title}
              fill
              unoptimized
              className="w-full h-full object-cover"
              priority={index === currentSlide}
            />
          </div>
        ))}

        <div className="absolute bottom-8 left-0 right-0 z-30 flex justify-center space-x-3">
          {sliderData.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide ? 'bg-white' : 'bg-white/40'
              }`}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>

      <div className="bg-white pt-10 pb-4">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Welcome to the Kenya Drylands Investment Hub
            </h2>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <form
          onSubmit={handleSearch}
          className="max-w-2xl mx-auto bg-white/95 backdrop-blur-sm rounded-[40px] shadow-xl p-1.5 flex items-center"
        >
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
            className="px-8 py-3 bg-green-700 hover:bg-green-800 text-white rounded-[100px] font-medium transition-colors"
          >
            Search
          </button>
        </form>
      </div>
    </section>
  );
};

export default HeroSlider;
