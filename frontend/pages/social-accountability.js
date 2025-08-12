import React, { useState, useEffect, useCallback } from 'react';
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

export default function SocialAccountability() {
  const router = useRouter();
  const dispatch = useDispatch();

  const { regions = [], valueChains = [] } = useSelector((state) => state.auth);

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
        <KenyaMap regions={mapRegions} valueChain={selectedValueChain} />
      </div>
    </div>
  );
}
