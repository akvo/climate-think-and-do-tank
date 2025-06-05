import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import KenyaMap from '@/components/KenyaMap';
import axios from 'axios';
import { env } from '@/helpers/env-vars';
import { MarkdownRenderer } from '@/components/MarkDownRenderer';
import Link from 'next/link';
import CommunityVoicesSection from '@/components/CommunityVoicesSection';
import OtherMediaCarousel from '@/components/MediaCarousel';

export default function SocialAccountabilityPage() {
  const router = useRouter();
  const { documentId } = router.query;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('voices');

  useEffect(() => {
    if (!documentId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${env(
            'NEXT_PUBLIC_BACKEND_URL'
          )}/api/social-accountabilities/${documentId}?populate[0]=other_media_slider.files&populate[1]=community_voices&populate[2]=region&populate[3]=value_chain`
        );
        setData(response.data.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load social accountability data');
        setLoading(false);
      }
    };

    fetchData();
  }, [documentId]);

  if (loading) {
    return (
      <div className="w-full max-w-5xl mx-auto p-8 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">
          Loading social accountability information...
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
            onClick={() => router.push('/social-accountability')}
            className="mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded"
          >
            Back to Social Accountability
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="w-full max-w-5xl mx-auto p-8 text-center">
        <p className="text-gray-600">
          No data available for this social accountability entry.
        </p>
        <button
          onClick={() => router.push('/social-accountability')}
          className="mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded"
        >
          Back to Social Accountability
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto py-12">
        <h2 className="text-3xl font-semibold text-gray-800 mb-12 text-center">
          Social Accountability
        </h2>

        <div className="header text-center">
          <h3 className="text-2xl font-semibold mb-4 text-[#008A16] w-3/4 m-auto">
            {data.title || 'Social Accountability in Kenya'}
          </h3>
          <div className="prose prose-lg text-gray-700 w-[80%] m-auto">
            {data.description && (
              <MarkdownRenderer content={data.description} />
            )}
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-8 mt-12">
          <div className="md:w-1/2">
            <div className="rounded-lg p-4 flex items-center justify-center">
              <KenyaMap
                initialSelected={data.region?.name}
                onSelect={(newSelection) =>
                  router.push('/social-accountability?regions=' + newSelection)
                }
              />
            </div>
          </div>

          <div className="md:w-1/2 flex flex-col justify-center">
            <h3 className="text-2xl font-semibold mb-4 text-[#008A16] uppercase">
              {`${data.region?.name} County`}
            </h3>
            <div className="prose prose-lg text-gray-700">
              {data.description && (
                <MarkdownRenderer content={data.investment_priorities} />
              )}
            </div>
          </div>
        </div>

        <div className="py-12">
          <div className="prose prose-lg text-gray-700 ">
            {data.description && (
              <MarkdownRenderer content={data.county_statistics} />
            )}
          </div>
          <div className="prose prose-lg text-gray-700">
            For more information on investment opportunities in{' '}
            <span className="font-bold">{data.region?.name},</span>{' '}
            <Link
              href={`http://localhost:3000/investment-profiles?regions=${data.region?.name}`}
              className="text-[#008A16] font-bold hover:underline"
            >
              Read More
            </Link>
          </div>
        </div>

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
              : 'bg-transparent text-gray-600 hover:text-[#0DA2D7]'
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
              : 'bg-transparent text-gray-600 hover:text-[#0DA2D7]'
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
          {activeTab === 'voices' && data.community_voices?.length > 0 ? (
            <CommunityVoicesSection
              voices={data.community_voices}
              county={data.region?.name}
            />
          ) : (
            <div className="text-center text-gray-600">
              {activeTab === 'voices' &&
                'No community voices available for this region.'}
            </div>
          )}
          {activeTab === 'media' && (
            <OtherMediaCarousel media={data.other_media_slider} />
          )}
        </div>
      </div>
    </div>
  );
}
