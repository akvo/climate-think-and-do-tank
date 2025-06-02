import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import axios from 'axios';
import { env } from '@/helpers/env-vars';
import { MarkdownRenderer } from '@/components/MarkDownRenderer';
import Link from 'next/link';
import { getImageUrl } from '@/helpers/utilities';

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
      name: 'The Investment Case',
      title: 'The Investment Case',
      contentField: 'the_investment_case_text',
      imageField: 'the_investment_case_image',
    },
    {
      id: 'business_blueprint_text',
      name: 'Business Blueprint',
      title: 'Business Blueprint',
      contentField: 'business_blueprint_text',
      imageField: 'business_blueprint_image',
    },
    {
      id: 'risk_and_impact_profile_text',
      name: 'Risk & Impact Profile',
      title: 'Risk & Impact Profile',
      contentField: 'risk_and_impact_profile_text',
      imageField: 'risk_and_impact_profile_image',
    },
    {
      id: 'closing_information_text',
      name: 'Investment Recommendation',
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

  if (loading) {
    return (
      <div className="w-full max-w-5xl mx-auto p-8 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">
          Loading investment opportunity profile...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-5xl mx-auto p-8 text-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>
            <strong>Error:</strong> {error}
          </p>
          <button
            onClick={() => router.push('/investment-opportunities')}
            className="mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded"
          >
            Back to Opportunities
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="w-full max-w-5xl mx-auto p-8 text-center">
        <p className="text-gray-600">
          No data available for this investment opportunity.
        </p>
        <button
          onClick={() => router.push('/investment-opportunities')}
          className="mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded"
        >
          Back to Opportunities
        </button>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';

    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const imageUrl = profile.picture_one
    ? getImageUrl(profile.picture_one)
    : null;

  const formattedDate = formatDate(profile.publication_date);

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto">
        <div className="bg-white border-b border-gray-200 py-8 my-12 mt-2">
          <div className="flex items-center flex-wrap gap-2 mb-4">
            <span className="text-sm text-gray-600">
              Investment Opportunity
            </span>
            {profile.region?.name && (
              <span className="text-sm text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full">
                {profile.region.name} County
              </span>
            )}
            {formattedDate && (
              <span className="text-sm text-gray-500">
                <time>{formattedDate}</time>
              </span>
            )}
          </div>

          {profile.value_chain?.name && (
            <h1 className="text-3xl md:text-4xl font-bold text-[#008A16] mb-2">
              {`${profile.value_chain?.name} Value Chain in ${profile.region?.name} County`}
            </h1>
          )}
        </div>

        {imageUrl && (
          <div className="relative w-full mb-8 flex items-center justify-center">
            <Image
              src={imageUrl}
              alt="Investment Opportunity"
              unoptimized
              height={400}
              width={800}
            />
          </div>
        )}

        <div className="bg-gray-100 p-6 my-6 mt-12 rounded-md">
          <h3 className="text-2xl font-semibold text-gray-700 mb-4">
            Investor snapshot
          </h3>

          <div className="text-gray-600 prose max-w-none">
            {profile.investor_snapshot_text && (
              <MarkdownRenderer content={profile.investor_snapshot_text} />
            )}
          </div>
        </div>

        <div className="px-4 py-4 flex justify-center space-x-4 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 rounded-md border transition-colors focus:outline-none m-1
              ${
                activeTab === tab.id
                  ? 'bg-green-500 text-white border-green-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span className="text-sm font-medium whitespace-nowrap">
                {tab.name}
              </span>
            </button>
          ))}
        </div>

        <div className="p-6 text-black">
          {tabs.map(
            (tab) =>
              activeTab === tab.id && (
                <div key={tab.id}>
                  <h3 className="text-3xl font-semibold text-gray-800 text-center mb-6">
                    {tab.title}
                  </h3>
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-2/5 flex items-start justify-center">
                      {profile[tab.imageField] ? (
                        <Image
                          src={getImageUrl(profile[tab.imageField])}
                          alt={`${tab.name} Visual`}
                          width={400}
                          height={400}
                          className="object-contain"
                          unoptimized
                        />
                      ) : (
                        <div className="h-64 w-full bg-gray-100 flex items-center justify-center text-gray-400 border rounded-md">
                          No image available
                        </div>
                      )}
                    </div>

                    <div className="w-full md:w-3/5">
                      <div className="text-gray-700 mb-6 text-sm">
                        {profile[tab.contentField] ? (
                          <MarkdownRenderer
                            content={profile[tab.contentField]}
                          />
                        ) : (
                          <p className="text-gray-500 italic">
                            No {tab.name.toLowerCase()} information available.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
          )}
        </div>

        <div className="my-12 space-y-6">
          <div>
            <h4 className="text-xl font-semibold text-gray-800 mb-2">
              Interested?
            </h4>
            <p className="text-gray-700 text-sm">
              To express interest, access additional data, or be connected to
              local stakeholders, contact the Kenya Drylands Investment Hub
              (DKIH):
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-2 text-black">
              <span className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-blue-500 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z"
                    clipRule="evenodd"
                  />
                </svg>
                <Link href={'/contact-us'}>Contact Us</Link>
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xl font-semibold text-gray-800 mb-2">
              Disclaimer
            </h4>
            <p className="text-gray-700 text-sm">
              {
                'This profile is for informational purposes only. All investments carry risk. Investors are encouraged to conduct their own due diligence and consult legal, financial, and technical experts before making investment decisions.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
