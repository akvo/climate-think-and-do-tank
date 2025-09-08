import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Search,
  Download,
  MapPin,
  Users,
  Globe,
  TrendingUp,
  X,
  ChevronRight,
} from 'lucide-react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import debounce from 'lodash/debounce';
import FilterSection from '@/components/FilterSection';
import KenyaMap from '@/components/KenyaMap';
import {
  fetchSocialAccountabilityData,
  clearSocialAccountabilityData,
} from '@/store/slices/socialAccountabilitySlice';
import HeroSection from '@/components/Hero';
import OtherMediaCarousel from '@/components/MediaCarousel';
import CommunityVoicesSection from '@/components/CommunityVoicesSection';

export default function SocialAccountability() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('voices');

  const { regions = [], valueChains = [] } = useSelector((state) => state.auth);

  const {
    data: socialAccountabilityData = [],
    loading,
    error,
  } = useSelector((state) => state.socialAccountability);

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    region: [],
    valueChain: [],
  });

  useEffect(() => {
    if (!router.isReady) return;

    const urlFilters = {
      region: router.query.focusRegions
        ? router.query.focusRegions.split(',')
        : [],
      valueChain: router.query.valueChain
        ? router.query.valueChain.split(',')
        : [],
    };

    const query = router.query.query || '';

    setFilters(urlFilters);
    setSearchTerm(query);

    const apiFilters = {
      regions: urlFilters.region,
      valueChain: urlFilters.valueChain,
    };

    dispatch(
      fetchSocialAccountabilityData({
        page: 1,
        query,
        filters: apiFilters,
      })
    );
  }, [router.isReady, router.query, dispatch]);

  const updateUrlAndFetch = (newFilters, newQuery) => {
    const query = {};
    if (newQuery) query.query = newQuery;
    if (newFilters.region.length > 0)
      query.focusRegions = newFilters.region.join(',');
    if (newFilters.valueChain.length > 0)
      query.valueChain = newFilters.valueChain.join(',');

    router.push(
      {
        pathname: router.pathname,
        query,
      },
      undefined,
      { shallow: true }
    );

    const apiFilters = {
      regions: newFilters.region,
      valueChain: newFilters.valueChain,
    };

    dispatch(clearSocialAccountabilityData());
    dispatch(
      fetchSocialAccountabilityData({
        page: 1,
        query: newQuery,
        filters: apiFilters,
      })
    );
  };

  const handleFilterChange = (filterKey, values) => {
    const newFilters = {
      ...filters,
      [filterKey]: values,
    };
    setFilters(newFilters);
    updateUrlAndFetch(newFilters, searchTerm);
  };

  const handleClearFilters = () => {
    const emptyFilters = {
      region: [],
      valueChain: [],
    };
    setFilters(emptyFilters);
    setSearchTerm('');
    updateUrlAndFetch(emptyFilters, '');
  };

  const handleSearch = useCallback(
    debounce((query) => {
      setSearchTerm(query);
      updateUrlAndFetch(filters, query);
    }, 500),
    [filters]
  );

  const mapRegions =
    filters.region.length > 0
      ? filters.region.map((name) => ({ name, attributes: { name } }))
      : regions;

  const selectedValueChain =
    filters.valueChain.length > 0 ? filters.valueChain[0] : 'All';

  const allCommunityVoices = useMemo(() => {
    const voices = [];
    socialAccountabilityData.forEach((item) => {
      if (item.community_voices && Array.isArray(item.community_voices)) {
        item.community_voices.forEach((voice) => {
          voices.push({
            ...voice,
            region: item.region,
            valueChain: item.valueChain,
            parentId: item.id,
            parentTitle: item.title,
          });
        });
      }
    });
    return voices;
  }, [socialAccountabilityData]);

  const allOtherMedia = useMemo(() => {
    const media = [];
    socialAccountabilityData.forEach((item) => {
      if (item.other_media && Array.isArray(item.other_media)) {
        item.other_media.forEach((mediaItem) => {
          media.push({
            ...mediaItem,
            region: item.region,
            valueChain: item.valueChain,
            parentId: item.id,
            parentTitle: item.title,
          });
        });
      }
    });
    return media;
  }, [socialAccountabilityData]);

  const currentRegion = filters.region.length > 0 ? filters.region[0] : null;

  const handleMapCountySelect = (selectedCounties) => {
    const newFilters = {
      ...filters,
      region: selectedCounties,
    };
    setFilters(newFilters);
    updateUrlAndFetch(newFilters, searchTerm);
  };

  return (
    <div className="min-h-screen bg-gray-10">
      <HeroSection
        pageTitle="Social Accountability"
        pageDescription={
          "Through participatory tools like the Community Scorecard, local voices shape agri-food investment priorities across Kenya's drylands. This page showcases community-identified needs, investment opportunities, and personal perspectives—anchoring decisions in real, lived experiences."
        }
        searchTerm={searchTerm}
        setSearchTerm={handleSearch}
        showSearch={false}
      />

      <div className="container mx-auto mt-[-31px] relative z-10">
        <FilterSection
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          visibleFilters={['region', 'valueChain']}
        />
      </div>

      <div className="container mx-auto px-4 py-8">
        <KenyaMap
          valueChain={
            selectedValueChain && selectedValueChain !== 'All'
              ? selectedValueChain
              : null
          }
          initialSelected={filters.region}
          onSelect={handleMapCountySelect}
        />
      </div>

      {filters.region.length > 0 && (
        <div className="mx-auto py-8 px-4 text-black">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold mb-4">Community Voices</h2>
            <div className="flex gap-6 mb-8">
              <button
                onClick={() => setActiveTab('voices')}
                className={`
                font-semibold px-6 py-2 rounded-t-xl focus:outline-none
                transition
                ${
                  activeTab === 'voices'
                    ? 'bg-[#F7F9FA] text-gray-900 border-b-4 border-[#DFE4E8]'
                    : 'bg-transparent text-gray-600 hover:text-primary-500'
                }
                text-2xl
              `}
                style={{
                  borderBottom:
                    activeTab === 'voices'
                      ? '4px solid #DFE4E8'
                      : '4px solid transparent',
                }}
              >
                Highlighted Community Voices
              </button>
              <button
                onClick={() => setActiveTab('media')}
                className={`
                font-semibold px-6 py-2 rounded-t-xl focus:outline-none
                transition
               ${
                 activeTab === 'media'
                   ? 'bg-[#F7F9FA] text-gray-900 border-b-4 border-[#DFE4E8]'
                   : 'bg-transparent text-gray-600 hover:text-primary-500'
               }
                text-2xl
              `}
                style={{
                  borderBottom:
                    activeTab === 'media'
                      ? '4px solid #DFE4E8'
                      : '4px solid transparent',
                }}
              >
                Other Media
              </button>
            </div>
          </div>

          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0DA2D7]"></div>
            </div>
          )}

          {!loading && (
            <>
              {activeTab === 'voices' && (
                <CommunityVoicesSection
                  voices={allCommunityVoices}
                  county={currentRegion}
                />
              )}
              {activeTab === 'media' && (
                <OtherMediaCarousel media={allOtherMedia} />
              )}
            </>
          )}

          {!loading && socialAccountabilityData.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                No data available for the selected filters.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
