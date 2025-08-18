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
  const [heroData, setHeroData] = useState({
    title: '',
    description: '',
  });

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

          const heroInfo = {
            title: 'Welcome to the Kenya Drylands Investment Hub',
            description:
              "Driving sustainable investment in agrifood, water, and energy across Kenya's drylands",
          };

          setHeroData(heroInfo);
          setData({
            title: homepageData.homepage_blurb,
            description: homepageData.homepage_description,
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
    <section
      className="relative overflow-hidden bg-gray-10"
      style={{
        backgroundImage: "url('/images/cubes.svg')",
        backgroundPosition: ' left center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: ' cover',
      }}
    >
      <div className="">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[500px]">
          <div className="max-w-2xl mx-auto px-6 pl-32">
            <div className="mb-12">
              <h1 className="text-[48px] font-extrabold text-primary-500 mb-4 leading-tight">
                Welcome to the Kenya Drylands Investment Hub
              </h1>
              <p className="text-xl text-gray-800">
                Driving sustainable investment in agrifood, water, and energy
                across Kenya&apos;s drylands
              </p>
            </div>

            <div className="mb-8">
              <p className="text-gray-500 mb-[10px]">
                Search all platform content
              </p>
              <form onSubmit={handleSearch} className="flex gap-3">
                <div className="relative flex-1 flex items-center bg-white border border-gray-200 rounded-full shadow-sm">
                  <Search className="absolute left-4 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search all platform content.."
                    value={query}
                    onChange={handleInputChange}
                    className="flex-1 pl-12 pr-4 h-12 text-lg bg-transparent border-none focus:outline-none text-black focus:ring-2 focus:ring-primary-500 rounded-full"
                  />
                  <button
                    type="submit"
                    className="px-8 py-2 mx-1 bg-primary-600 hover:bg-primary-700 text-white rounded-full font-medium transition-colors"
                  >
                    Search
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="relative">
            {sliderData.length > 0 ? (
              <div className="relative min-h-[600px] max-h-[900px] overflow-hidden">
                {sliderData.map((slide, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                      index === currentSlide
                        ? 'opacity-100 z-10'
                        : 'opacity-0 z-0'
                    }`}
                  >
                    <Image
                      src={getImageUrl(slide.image)}
                      alt={`Slide ${index + 1}`}
                      fill
                      unoptimized
                      className="w-full h-full object-cover"
                      priority={index === currentSlide}
                    />
                  </div>
                ))}

                {sliderData.length > 1 && (
                  <div className="absolute bottom-6 left-0 right-0 z-30 flex justify-center space-x-3">
                    {sliderData.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          index === currentSlide
                            ? 'bg-white shadow-lg scale-110'
                            : 'bg-white/60 hover:bg-white/80'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-[500px] bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center shadow-2xl">
                <div className="text-center text-primary-600">
                  <div className="w-24 h-24 mx-auto mb-4 bg-primary-500 rounded-full flex items-center justify-center">
                    <Search className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold">Kenya Drylands</h3>
                  <p className="text-primary-500">Investment Hub</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSlider;
