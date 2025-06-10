import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import KenyaMap from '@/components/KenyaMap';
import axios from 'axios';
import { env } from '@/helpers/env-vars';
import { MarkdownRenderer } from '@/components/MarkDownRenderer';
import Link from 'next/link';
import CommunityVoicesSection from '@/components/CommunityVoicesSection';
import OtherMediaCarousel from '@/components/MediaCarousel';
import { formatDate } from '@/helpers/utilities';

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

  const formattedDate = formatDate(data.publication_date);

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto">
        <div className="bg-white border-b border-gray-200 py-8 my-12 mt-2">
          <div className="flex items-center flex-wrap gap-2 mb-4">
            <span className="text-sm text-gray-600">Social Accountability</span>
            {data.region?.name && (
              <span className="text-sm text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full">
                {data.region.name} County
              </span>
            )}

            {formattedDate && (
              <span className="text-sm text-gray-500">
                <time>{formattedDate}</time>
              </span>
            )}
          </div>

          {data.value_chain?.name && (
            <h1 className="text-3xl md:text-4xl font-bold text-[#008A16] mb-2 border-b border-gray-200 pb-4">
              {`${data.value_chain?.name} Value Chain in ${data.region?.name} County`}
            </h1>
          )}

          <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mt-4">
            {data.title || 'Social Accountability Report'}
          </h2>
          {data.description && (
            <div className="prose prose-lg text-gray-700 mt-4 max-w-none">
              <MarkdownRenderer content={data.description} />
            </div>
          )}
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
            <div className="prose prose-lg text-gray-700 max-w-none">
              {data.investment_priorities && (
                <MarkdownRenderer content={data.investment_priorities} />
              )}
            </div>
          </div>
        </div>

        <div className="py-12">
          <div className="prose prose-lg text-gray-700 max-w-none">
            For more information on investment opportunities in{' '}
            <span className="font-bold">{data.region?.name},</span>{' '}
            <Link
              href={`http://localhost:3000/investment-profiles?regions=${data.region?.name}`}
              className="text-[#008A16] font-bold hover:underline"
            >
              Read More
            </Link>
          </div>
          <div className="prose prose-lg text-gray-700 max-w-none  mt-6">
            {data.county_statistics && (
              <MarkdownRenderer content={data.county_statistics} />
            )}
          </div>
        </div>

        <div className="mx-auto py-8 px-4 text-black">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <h2 className="text-2xl font-bold">Community Voices</h2>
            <div className="flex gap-2 sm:gap-6">
              <button
                onClick={() => setActiveTab('voices')}
                className={`
            font-semibold px-4 sm:px-6 py-2 rounded-t-xl focus:outline-none
            transition text-sm sm:text-base lg:text-xl
            ${
              activeTab === 'voices'
                ? 'bg-[#F7F9FA] text-gray-900 border-b-4 border-[#DFE4E8]'
                : 'bg-transparent text-gray-600 hover:text-[#0DA2D7]'
            }
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
            font-semibold px-4 sm:px-6 py-2 rounded-t-xl focus:outline-none
            transition text-sm sm:text-base lg:text-xl
            ${
              activeTab === 'media'
                ? 'bg-[#F7F9FA] text-gray-900 border-b-4 border-[#DFE4E8]'
                : 'bg-transparent text-gray-600 hover:text-[#0DA2D7]'
            }
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

          <div className="mt-6">
            {activeTab === 'voices' && (
              <>
                {data.community_voices?.length > 0 ? (
                  <CommunityVoicesSection
                    voices={data.community_voices}
                    county={data.region?.name}
                  />
                ) : (
                  <div className="text-center text-gray-600 py-12">
                    <div className="max-w-md mx-auto">
                      <h3 className="text-lg font-medium mb-2">
                        No Community Voices Available
                      </h3>
                      <p className="text-sm">
                        Community voices for {data.region?.name} County are not
                        available at this time.
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === 'media' && (
              <>
                {data.other_media_slider?.length > 0 ? (
                  <OtherMediaCarousel media={data.other_media_slider} />
                ) : (
                  <div className="text-center text-gray-600 py-12">
                    <div className="max-w-md mx-auto">
                      <h3 className="text-lg font-medium mb-2">
                        No Media Available
                      </h3>
                      <p className="text-sm">
                        Media content for {data.region?.name} County is not
                        available at this time.
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
