import { useState, useEffect } from 'react';
import { Search, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import axios from 'axios';
import { env } from '@/helpers/env-vars';
import { useRouter } from 'next/router';
import { getImageUrl } from '@/helpers/utilities';
import { H2 } from './Heading';
import { ParagraphMD } from './Text';
import Button from './Button';

const HeroSlider = ({ setData }) => {
  const router = useRouter();

  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [videoRef, setVideoRef] = useState(null);
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
          )}/api/homepage?populate=homepage_video`
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

          if (homepageData.homepage_video) {
            setVideoUrl(getImageUrl(homepageData.homepage_video));
          }
        }

        setLoading(false);
      } catch (err) {
        setError('Failed to load homepage data');
        setLoading(false);
      }
    };

    fetchHomepageData();
  }, []);

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

  const togglePlayPause = () => {
    if (videoRef) {
      if (isPlaying) {
        videoRef.pause();
      } else {
        videoRef.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <section
      className="relative overflow-hidden bg-gray-10"
      style={{
        backgroundImage: "url('/images/cubes.svg')",
        backgroundPosition: 'left center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
      }}
    >
      <div className="">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[500px]">
          <div className="max-w-2xl mx-auto px-6 pl-32">
            <div className="mb-12">
              <H2 className="font-extrabold text-primary-500">
                {heroData.title ||
                  'Welcome to the Kenya Drylands Investment Hub'}
              </H2>
              <ParagraphMD className="mt-4">
                {heroData.description ||
                  "Driving sustainable investment in agrifood, water, and energy across Kenya's drylands"}
              </ParagraphMD>
            </div>

            <div className="mb-8">
              <p className="text-[#818181] mb-[10px]">
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
                  <Button variant="primary" className="font-bold">
                    Search
                  </Button>
                </div>
              </form>
            </div>
          </div>

          <div className="relative">
            {videoUrl ? (
              <div className="relative min-h-[600px] max-h-[600px] overflow-hidden rounded-lg">
                <video
                  ref={(ref) => setVideoRef(ref)}
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                >
                  <source src={videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>

                <div className="absolute bottom-6 left-6 right-6 z-30 flex items-center justify-between">
                  <div className="flex gap-3">
                    <button
                      onClick={togglePlayPause}
                      className="bg-black/50 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                      aria-label={isPlaying ? 'Pause video' : 'Play video'}
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-[600px] bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center shadow-2xl">
                {loading ? (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                    <p className="text-primary-600">Loading video...</p>
                  </div>
                ) : (
                  <div className="text-center text-primary-600">
                    <div className="w-24 h-24 mx-auto mb-4 bg-primary-500 rounded-full flex items-center justify-center">
                      <Play className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold">Kenya Drylands</h3>
                    <p className="text-primary-500">Investment Hub</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSlider;
