import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import axios from 'axios';
import { env } from '@/helpers/env-vars';
import { MarkdownRenderer } from '@/components/MarkDownRenderer';
import Link from 'next/link';
import { getImageUrl } from '@/helpers/utilities';
import { Home, ChevronRight, AlertCircle, ArrowRight } from 'lucide-react';
import { RegionIcon } from '@/components/Icons';
import InterestedSection from '@/components/ContactSection';

export default function InvestmentOpportunityProfile() {
  const router = useRouter();
  const { documentId } = router.query;

  const [activeTab, setActiveTab] = useState('the_investment_case_text');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const tabs = [
    {
      id: 'the_investment_case_text',
      name: 'The investment case',
      title: 'The Investment Case',
      contentField: 'the_investment_case_text',
      imageField: 'the_investment_case_image',
    },
    {
      id: 'business_blueprint_text',
      name: 'Business blueprint',
      title: 'Business Blueprint',
      contentField: 'business_blueprint_text',
      imageField: 'business_blueprint_image',
    },
    {
      id: 'risk_and_impact_profile_text',
      name: 'Risk and impact profile',
      title: 'Risk & Impact Profile',
      contentField: 'risk_and_impact_profile_text',
      imageField: 'risk_and_impact_profile_image',
    },
    {
      id: 'closing_information_text',
      name: 'Investment recommendation',
      title: 'Investment Recommendation',
      contentField: 'closing_information_text',
      imageField: 'closing_information_image',
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
              onClick={() => router.push('/investment-opportunities')}
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
            {formattedDate && (
              <span className="text-sm text-gray-500">
                <time>{formattedDate}</time>
              </span>
            )}
          </div>
          <Link
            href="/investment-opportunities"
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

        {(() => {
          const snapshotText = profile.investor_snapshot_text || '';
          const extractContent = (text, marker) => {
            const escapedMarker = marker.replace(/[?]/g, '\\?');
            const regex = new RegExp(
              `\\*\\*${escapedMarker}\\*\\*\\s*:?\\s*([^\\n]+?)(?=\\n\\*\\*|\\n-|$)`,
              'i'
            );
            const match = text.match(regex);
            console.log(match);
            if (match) {
              if (marker === 'Interested?') {
                return match[1].trim();
              }
              return match[1].replace(/\[.*?\]\(.*?\)/g, '').trim();
            }
            return null;
          };

          const opportunity = extractContent(snapshotText, 'Opportunity');
          const roiEstimate = extractContent(snapshotText, 'ROI Estimate');
          const strategicFit = extractContent(snapshotText, 'Strategic Fit');
          const interested = extractContent(snapshotText, 'Interested?');

          const irrMatch = roiEstimate?.match(/IRR of (\d+–\d+%|\d+-\d+%)/i);
          const irrValue = irrMatch
            ? irrMatch[1].replace('-', '–')
            : 'IRR of 18–25%';

          return (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              <div className="border rounded-2xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Opportunity
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {opportunity ||
                    'Commercial beef fattening and export-oriented livestock aggregation in Taita Taveta County.'}
                </p>
              </div>
              <div className="border rounded-2xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  ROI Estimate
                </h3>
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  {irrValue}
                </p>
                <p className="text-gray-600 text-sm">
                  {roiEstimate ||
                    'Breakeven in 2–3 years; potential IRR of 18–25% depending on scale.'}
                </p>
              </div>
              <div className="border rounded-2xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Strategic fit
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {strategicFit ||
                    'Access to Mombasa port and regional markets, improving infrastructure, and county-backed livestock initiatives.'}
                </p>
              </div>
              <div className="border rounded-2xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Interested?
                </h3>
                <div className="text-gray-600 leading-relaxed">
                  {interested ? (
                    <MarkdownRenderer content={interested} />
                  ) : (
                    <p>
                      Reach out to the <strong>KDIH network</strong> for
                      connections, data, and support.
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        <div className="border-b border-gray-200 mb-8">
          <div className="flex gap-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 px-1 text-sm font-medium whitespace-nowrap transition-colors relative
                  ${
                    activeTab === tab.id
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        <div className="py-8">
          {tabs.map(
            (tab) =>
              activeTab === tab.id && (
                <div key={tab.id} className="grid md:grid-cols-2 gap-12">
                  <div className="relative h-[400px] rounded-xl overflow-hidden bg-gray-100">
                    {profile[tab.imageField] ? (
                      <Image
                        src={getImageUrl(profile[tab.imageField])}
                        alt={`${tab.name} Visual`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-400">
                          No image available
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">
                      {tab.title}
                    </h2>
                    <div className="prose prose-lg max-w-none text-black">
                      {profile[tab.contentField] ? (
                        <>
                          <MarkdownRenderer
                            content={profile[tab.contentField]}
                          />
                        </>
                      ) : (
                        <p className="text-gray-500 italic">
                          No {tab.name.toLowerCase()} information available.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
          )}
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
