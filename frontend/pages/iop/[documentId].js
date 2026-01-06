import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import axios from 'axios';
import { env } from '@/helpers/env-vars';
import { MarkdownRenderer } from '@/components/MarkDownRenderer';
import Link from 'next/link';
import { getImageUrl } from '@/helpers/utilities';
import {
  Home,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  ArrowRight,
  Check,
  Upload,
  FileDown,
} from 'lucide-react';
import {
  RegionIcon,
  TwitterIcon,
  LinkedinIcon,
  ValueChainIcon,
} from '@/components/Icons';
import InterestedSection from '@/components/ContactSection';

export default function InvestmentOpportunityProfile() {
  const router = useRouter();
  const { documentId } = router.query;

  const [activeSection, setActiveSection] = useState('county_sector_overview');
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const sections = [
    {
      id: 'county_sector_overview',
      number: 1,
      name: 'County & Sector Overview',
      contentField: 'county_sector_overview',
      imageField: 'county_sector_overview_image',
      layout: 'text-image',
    },
    {
      id: 'value_chain_profile_status',
      number: 2,
      name: 'Value Chain Profile & Current Status',
      contentField: 'value_chain_profile_status',
      imageField: 'value_chain_profile_status_image',
      layout: 'text-image',
    },
    {
      id: 'market_opportunity_demand',
      number: 3,
      name: 'Market Opportunity & Demand Outlook',
      contentField: 'market_opportunity_demand',
      imageField: 'market_opportunity_demand_image',
      layout: 'text-image',
    },
    {
      id: 'investment_opportunity',
      number: 4,
      name: 'The Investment Opportunity',
      contentField: 'investment_opportunity',
      layout: 'two-columns',
    },
    {
      id: 'required_inputs_infrastructure',
      number: 5,
      name: 'Required Inputs, Infrastructure & Enablers',
      contentField: 'required_inputs_infrastructure',
      layout: 'grid-cards',
    },
    {
      id: 'investment_needs_financial',
      number: 6,
      name: 'Investment Needs & Financial Snapshot',
      contentField: 'investment_needs_financial',
      layout: 'financial',
    },
    {
      id: 'enabling_environment_policies',
      number: 7,
      name: 'Enabling Environment, Policies & Partnerships',
      contentField: 'enabling_environment_policies',
      imageField: 'enabling_environment_policies_image',
      layout: 'text-image',
    },
    {
      id: 'risks_mitigation',
      number: 8,
      name: 'Risks & Mitigation Measures',
      contentField: 'risks_mitigation',
      layout: 'two-columns',
    },
  ];

  useEffect(() => {
    if (!documentId) return;

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${env(
            'NEXT_PUBLIC_BACKEND_URL'
          )}/api/investment-opportunity-profiles/${documentId}?populate=*`
        );
        setProfile(response.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load investment opportunity profile');
        setLoading(false);
      }
    };

    fetchProfile();
  }, [documentId]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: profile?.value_chain?.name
          ? `${profile.value_chain.name} Value Chain in ${profile.region?.name} County`
          : 'Investment Opportunity',
        url: window.location.href,
      });
    }
  };

  const handleTwitterShare = () => {
    const text = profile?.value_chain?.name
      ? `${profile.value_chain.name} Value Chain in ${profile.region?.name} County`
      : 'Investment Opportunity';
    const url = typeof window !== 'undefined' ? window.location.href : '';
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        text
      )}&url=${encodeURIComponent(url)}`,
      '_blank'
    );
  };

  const handleLinkedInShare = () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        url
      )}`,
      '_blank'
    );
  };

  const getValueChainImage = (valueChainName) => {
    if (!valueChainName) return null;
    const name = valueChainName.toLowerCase();
    if (name.includes('livestock')) return '/images/livestock.svg';
    if (name.includes('fish') || name.includes('aqua')) return '/images/fish.svg';
    if (name.includes('agri') || name.includes('crop')) return '/images/agri.svg';
    return null;
  };

  const parseKeyHighlights = (text) => {
    if (!text) return [];
    // Try to extract key highlights from markdown content
    // Look for bullet points that might be key highlights
    const lines = text.split('\n');
    const highlights = [];
    let inHighlightsSection = false;

    for (const line of lines) {
      // Check if we're in a Key Highlights section
      if (
        line.toLowerCase().includes('key highlight') ||
        line.toLowerCase().includes('highlights')
      ) {
        inHighlightsSection = true;
        continue;
      }

      // Extract bullet points
      const bulletMatch = line.match(/^[-*•]\s*(.+)/);
      if (bulletMatch && inHighlightsSection) {
        highlights.push(bulletMatch[1].trim());
      }

      // Stop if we hit another section header
      if (
        inHighlightsSection &&
        line.match(/^#{1,3}\s/) &&
        !line.toLowerCase().includes('highlight')
      ) {
        break;
      }
    }

    return highlights;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-10 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">
            Loading investment opportunity...
          </p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-10 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {error || 'No data available'}
            </h3>
            <p className="text-gray-600 mb-6">
              {error
                ? 'Please try again later.'
                : 'This investment opportunity could not be found.'}
            </p>
            <button
              onClick={() => router.push('/investment-profiles')}
              className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
            >
              Back to Opportunities
            </button>
          </div>
        </div>
      </div>
    );
  }

  const imageUrl = profile.picture_one
    ? getImageUrl(profile.picture_one)
    : null;
  const formattedDate = formatDate(profile.publication_date);

  return (
    <div className="min-h-screen bg-white">
      <div className="">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link
              href="/investment-profiles"
              className="text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              <Home className="w-4 h-4" />
              <span>Invest</span>
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900">
              {profile.value_chain?.name} Value Chain in {profile.region?.name}{' '}
              County
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 pt-2">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-primary-50 text-primary-500 px-4 py-2 rounded-full flex items-center gap-2">
              <RegionIcon className="w-4 h-4" />
              <span className="font-medium">{profile.region?.name} County</span>
            </div>
          </div>
          <Link
            href="/investment-profiles"
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-full font-bold transition-colors flex items-center gap-2"
          >
            Invest
            <ArrowRight className="w-4 h-4 mt-[3px]" />
          </Link>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          {profile.value_chain?.name} Value Chain in {profile.region?.name}{' '}
          County
        </h1>

        {imageUrl && (
          <div className="relative w-full h-[500px] rounded-xl overflow-hidden mb-8">
            <Image
              src={imageUrl}
              alt="Investment Opportunity"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        )}

        {/* Published Info and Share Section */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6">
          <div className="flex flex-wrap items-start gap-8 md:gap-16">
            <div>
              <p className="text-sm text-gray-500 mb-1">Published by</p>
              <p className="font-semibold text-gray-900">
                Resilience Think and Do Tank
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Published on</p>
              <p className="font-semibold text-gray-900">{formattedDate}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Value chain</p>
              {getValueChainImage(profile.value_chain?.name) ? (
                <Image
                  src={getValueChainImage(profile.value_chain?.name)}
                  alt={profile.value_chain?.name}
                  width={28}
                  height={28}
                  className="h-7 w-auto"
                />
              ) : (
                <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full">
                  <ValueChainIcon className="w-4 h-4" />
                  <span className="font-medium text-gray-900">
                    {profile.value_chain?.name}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleTwitterShare}
              className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-primary-500 hover:border-primary-500 hover:text-white transition-colors group"
              aria-label="Share on Twitter"
            >
              <TwitterIcon className="w-5 h-5 group-hover:[&_path]:fill-white" />
            </button>
            <button
              onClick={handleLinkedInShare}
              className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-primary-500 hover:border-primary-500 hover:text-white transition-colors group"
              aria-label="Share on LinkedIn"
            >
              <LinkedinIcon className="w-5 h-5 group-hover:[&_path]:fill-white" />
            </button>
            <button
              onClick={handleShare}
              className="h-10 flex items-center gap-2 px-4 rounded-full border border-gray-300 hover:bg-primary-500 hover:border-primary-500 hover:text-white transition-colors group"
            >
              <span className="text-sm font-medium text-gray-700 group-hover:text-white">
                Share
              </span>
              <Upload className="w-4 h-4 text-gray-500 group-hover:text-white" />
            </button>
          </div>
        </div>

        {/* Key Highlights Section */}
        {(() => {
          // Try to get highlights from dedicated field
          let highlights = [];

          if (profile.key_highlights) {
            // If key_highlights is a string, split by newlines
            if (typeof profile.key_highlights === 'string') {
              highlights = profile.key_highlights
                .split('\n')
                .map((line) => line.replace(/^[-*•]\s*/, '').trim())
                .filter((line) => line.length > 0);
            } else if (Array.isArray(profile.key_highlights)) {
              highlights = profile.key_highlights;
            }
          }

          if (highlights.length === 0) return null;

          return (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Key Highlights
              </h2>
              <div className="grid md:grid-cols-2 gap-x-12 gap-y-4">
                {highlights.map((highlight, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-primary-500" />
                    </div>
                    <p className="text-gray-700">{highlight}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Snapshot Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="border rounded-2xl p-6">
            <h3 className="text-base font-medium text-gray-900 mb-4">
              Indicative CAPEX:
            </h3>
            <p className="text-3xl font-bold text-gray-900 mb-2">
              {profile.indicative_capex || 'KES 25–60 m'}
            </p>
            <p className="text-gray-500 text-sm">
              {profile.indicative_capex_subtitle || 'depending on scale and technology'}
            </p>
          </div>
          <div className="border rounded-2xl p-6">
            <h3 className="text-base font-medium text-gray-900 mb-4">
              Potential annual throughput
            </h3>
            <p className="text-3xl font-bold text-gray-900 mb-2">
              {profile.annual_throughput || '1,000–3,000 head'}
            </p>
            {profile.annual_throughput_subtitle && (
              <p className="text-gray-500 text-sm">
                {profile.annual_throughput_subtitle}
              </p>
            )}
          </div>
          <div className="border rounded-2xl p-6">
            <h3 className="text-base font-medium text-gray-900 mb-4">
              Payback period:
            </h3>
            <p className="text-3xl font-bold text-gray-900 mb-2">
              {profile.payback_period || '3–4 years'}
            </p>
            <p className="text-gray-500 text-sm">
              {profile.payback_period_subtitle || 'driven by strong margins on finished animals'}
            </p>
          </div>
          <div className="border rounded-2xl p-6">
            <h3 className="text-base font-medium text-gray-900 mb-4">
              Why Now?
            </h3>
            <p className="text-gray-500 leading-relaxed text-sm">
              {profile.why_now || 'Rising beef demand, county support for commercialization, and persistent supply-quality gaps create a timely opportunity for private-sector entry.'}
            </p>
          </div>
        </div>

        {/* The Investment Case Overview Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-500">
              The Investment Case Overview
            </h2>
            {profile.investment_pdf && (
              <a
                href={getImageUrl(profile.investment_pdf)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 border border-primary-500 text-primary-500 rounded-full hover:bg-primary-50 transition-colors"
              >
                <span className="text-sm font-medium">Investment opportunity (PDF)</span>
                <FileDown className="w-4 h-4" />
              </a>
            )}
          </div>

          <div className="grid lg:grid-cols-[280px_1fr] gap-8">
            {/* Mobile Dropdown Navigation */}
            <div className="lg:hidden relative mb-4">
              <button
                onClick={() => setMobileDropdownOpen(!mobileDropdownOpen)}
                className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded bg-primary-500 text-white flex items-center justify-center text-xs font-bold">
                    {sections.find((s) => s.id === activeSection)?.number}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {sections.find((s) => s.id === activeSection)?.name}
                  </span>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-gray-500 transition-transform ${
                    mobileDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {mobileDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-[300px] overflow-y-auto">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => {
                        setActiveSection(section.id);
                        setMobileDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 p-4 text-left transition-colors border-b border-gray-100 last:border-b-0 ${
                        activeSection === section.id
                          ? 'bg-primary-50'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          activeSection === section.id
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {section.number}
                      </span>
                      <span
                        className={`text-sm ${
                          activeSection === section.id
                            ? 'text-primary-500 font-medium'
                            : 'text-gray-600'
                        }`}
                      >
                        {section.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop Sidebar Navigation */}
            <div className="hidden lg:block space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-start gap-3 p-3 text-left transition-colors ${
                    activeSection === section.id
                      ? 'bg-white border-r-4 border-primary-500'
                      : 'bg-white hover:bg-primary-50'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      activeSection === section.id
                        ? 'bg-primary-500 text-white'
                        : 'bg-[#ACB5BD] text-white'
                    }`}
                  >
                    {section.number}
                  </span>
                  <span
                    className={`text-sm ${
                      activeSection === section.id
                        ? 'text-primary-500 font-medium'
                        : 'text-gray-600'
                    }`}
                  >
                    {section.name}
                  </span>
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div>
              {sections.map(
                (section) =>
                  activeSection === section.id && (
                    <div key={section.id}>
                      {/* Layout: Text + Image (50/50) */}
                      {section.layout === 'text-image' && (
                        <>
                          <div className="flex flex-col lg:flex-row gap-8">
                            <div className="w-full lg:w-1/2">
                              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                                {section.name}
                              </h3>
                              <div className="prose prose-lg max-w-none text-gray-700">
                                {profile[section.contentField] ? (
                                  <MarkdownRenderer
                                    content={profile[section.contentField]}
                                  />
                                ) : (
                                  <p className="text-gray-500 italic">
                                    No {section.name.toLowerCase()} information available.
                                  </p>
                                )}
                              </div>
                            </div>
                            {profile[section.imageField] && (
                              <div className="hidden lg:block w-1/2">
                                <div className="relative w-full min-h-[400px] rounded-xl overflow-hidden">
                                  <Image
                                    src={getImageUrl(profile[section.imageField])}
                                    alt={section.name}
                                    fill
                                    className="object-contain"
                                    unoptimized
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                          {profile[section.imageField] && (
                            <div className="lg:hidden mt-6">
                              <div className="relative h-[250px] rounded-xl overflow-hidden">
                                <Image
                                  src={getImageUrl(profile[section.imageField])}
                                  alt={section.name}
                                  fill
                                  className="object-contain"
                                  unoptimized
                                />
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {/* Layout: Two Columns with Checkmarks */}
                      {section.layout === 'two-columns' && (
                        <div>
                          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                            {section.name}
                          </h3>
                          <div className="prose prose-lg max-w-none text-gray-700 mb-8">
                            {profile[section.contentField] ? (
                              <MarkdownRenderer
                                content={profile[section.contentField]}
                              />
                            ) : (
                              <p className="text-gray-500 italic">
                                No {section.name.toLowerCase()} information available.
                              </p>
                            )}
                          </div>
                          {profile[`${section.id}_column1_title`] && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                              <div>
                                <h4 className="text-xl font-bold text-gray-900 mb-4">
                                  {profile[`${section.id}_column1_title`]}
                                </h4>
                                <div className="space-y-4">
                                  {profile[`${section.id}_column1_items`]?.map((item, idx) => (
                                    <div key={idx} className="flex items-start gap-3">
                                      <div className="w-5 h-5 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Check className="w-3 h-3 text-primary-500" />
                                      </div>
                                      <p className="text-gray-700">{item.text}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <h4 className="text-xl font-bold text-gray-900 mb-4">
                                  {profile[`${section.id}_column2_title`]}
                                </h4>
                                <div className="space-y-4">
                                  {profile[`${section.id}_column2_items`]?.map((item, idx) => (
                                    <div key={idx} className="flex items-start gap-3">
                                      <div className="w-5 h-5 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Check className="w-3 h-3 text-primary-500" />
                                      </div>
                                      <p className="text-gray-700">{item.text}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Layout: Grid Cards */}
                      {section.layout === 'grid-cards' && (
                        <div>
                          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                            {section.name}
                          </h3>
                          {profile[section.contentField] && (
                            <p className="text-gray-700 text-lg mb-8">
                              {profile[`${section.id}_subtitle`] || 'A successful operation requires:'}
                            </p>
                          )}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {profile[`${section.id}_cards`]?.map((card, idx) => (
                              <div
                                key={idx}
                                className="bg-gray-50 rounded-xl p-6 border border-gray-100"
                              >
                                <h4 className="font-semibold text-gray-900 mb-2">
                                  {card.title}
                                </h4>
                                <p className="text-gray-600 text-sm">
                                  {card.description}
                                </p>
                              </div>
                            ))}
                          </div>
                          {!profile[`${section.id}_cards`] && profile[section.contentField] && (
                            <div className="prose prose-lg max-w-none text-gray-700">
                              <MarkdownRenderer content={profile[section.contentField]} />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Layout: Financial */}
                      {section.layout === 'financial' && (
                        <div>
                          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                            {section.name}
                          </h3>

                          {profile[`${section.id}_capex_title`] && (
                            <>
                              <p className="text-gray-700 font-medium mb-4">
                                {profile[`${section.id}_capex_title`] || 'Indicative CAPEX:'}
                              </p>
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                                {profile[`${section.id}_capex_items`]?.map((item, idx) => (
                                  <div
                                    key={idx}
                                    className="bg-white rounded-xl p-4 border border-gray-200"
                                  >
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="text-xs text-gray-500">KES</span>
                                    </div>
                                    <p className="text-xl font-bold text-gray-900">
                                      {item.amount}
                                    </p>
                                    <p className="text-gray-600 text-sm mt-1">
                                      {item.description}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </>
                          )}

                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {profile[`${section.id}_operating_cost`] && (
                              <div className="border border-gray-200 rounded-xl p-6">
                                <h4 className="text-xl font-bold text-gray-900 mb-3">
                                  Operating cost
                                </h4>
                                <p className="text-gray-700">
                                  {profile[`${section.id}_operating_cost`]}
                                </p>
                              </div>
                            )}
                            {profile[`${section.id}_revenue_streams`] && (
                              <div className="border border-gray-200 rounded-xl p-6">
                                <h4 className="text-xl font-bold text-gray-900 mb-3">
                                  Revenue streams
                                </h4>
                                <p className="text-gray-700">
                                  {profile[`${section.id}_revenue_streams`]}
                                </p>
                              </div>
                            )}
                            {profile[`${section.id}_payback_period`] && (
                              <div className="border border-gray-200 rounded-xl p-6">
                                <h4 className="text-xl font-bold text-gray-900 mb-3">
                                  Estimated payback period
                                </h4>
                                <p className="text-gray-700">
                                  {profile[`${section.id}_payback_period`]}
                                </p>
                              </div>
                            )}
                          </div>

                          {!profile[`${section.id}_capex_items`] && profile[section.contentField] && (
                            <div className="prose prose-lg max-w-none text-gray-700 mt-6">
                              <MarkdownRenderer content={profile[section.contentField]} />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
              )}
            </div>
          </div>
        </div>

        <InterestedSection />

        <div className="bg-white rounded-2xl p-8 mt-16 border border-primary-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center flex-shrink-0 border border-orange-200">
              <AlertCircle className="w-6 h-6 text-primary-500" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">
                Disclaimer
              </h4>
              <p className="text-gray-600 leading-relaxed">
                This profile is for informational purposes only. All investments
                carry risk. Investors are encouraged to conduct their own due
                diligence and consult legal, financial, and technical experts
                before making investment decisions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
