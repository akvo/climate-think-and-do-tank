import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Head from 'next/head';
import { ChevronLeft, Newspaper } from 'lucide-react';
import axios from 'axios';
import { env } from '@/helpers/env-vars';
import { formatRegionsDisplay } from '@/helpers/utilities';

const BACKEND_URL = env('NEXT_PUBLIC_BACKEND_URL');

export default function NewsDetailPage() {
  const router = useRouter();
  const { documentId } = router.query;

  const [newsItem, setNewsItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [regions, setRegions] = useState([]);

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/regions`);
        if (response.data && response.data.data) {
          setRegions(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching regions:', error);
      }
    };

    fetchRegions();
  }, []);

  useEffect(() => {
    const fetchNewsItem = async () => {
      if (!documentId) return;

      setLoading(true);

      try {
        const response = await axios.get(
          `${BACKEND_URL}/api/news/${documentId}?populate=image&populate=regions`
        );

        if (response.data && response.data.data) {
          const item = response.data.data;

          const processedItem = {
            id: item.id,
            title: item.title || '',
            description: item.description || '',
            publicationDate: item.publication_date || null,
            regions: item.regions ? item.regions.map((r) => r.name) : [],
            imageUrl: item.image?.url
              ? `${BACKEND_URL}${item.image.url}`
              : null,
          };

          setNewsItem(processedItem);
        } else {
          setError('News article not found');
        }
      } catch (err) {
        console.error('Error fetching news article:', err);
        setError('Failed to load news article');
      } finally {
        setLoading(false);
      }
    };

    fetchNewsItem();
  }, [documentId]);

  const handleBack = () => {
    router.push('/news-events');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error || !newsItem) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-center items-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          {error || 'News article not found'}
        </h1>
        <button
          onClick={handleBack}
          className="flex items-center text-green-600 hover:text-green-700"
        >
          <ChevronLeft size={20} className="mr-1" /> Back to News & Events
        </button>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{newsItem.title} | Our Organization</title>
        <meta
          name="description"
          content={newsItem.description.substring(0, 160)}
        />
        {newsItem.imageUrl && (
          <>
            <meta property="og:image" content={newsItem.imageUrl} />
            <meta name="twitter:image" content={newsItem.imageUrl} />
          </>
        )}
        <meta property="og:title" content={newsItem.title} />
        <meta
          property="og:description"
          content={newsItem.description.substring(0, 160)}
        />
        <meta name="twitter:title" content={newsItem.title} />
        <meta
          name="twitter:description"
          content={newsItem.description.substring(0, 160)}
        />
      </Head>

      <div className="min-h-screen bg-white text-black">
        <div className="container mx-auto px-4 py-6">
          <button
            onClick={handleBack}
            className="flex items-center text-green-600 hover:text-green-700"
          >
            <ChevronLeft size={20} className="mr-1" /> Back to News & Events
          </button>
        </div>

        <div className="container mx-auto px-4 pb-16">
          <article className="mx-auto">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-sm text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full">
                  {formatRegionsDisplay(newsItem.regions, regions)}
                </span>

                <div className="flex items-center text-sm text-gray-500">
                  <Newspaper size={16} className="mr-1" />
                  <span>News</span>
                </div>

                {newsItem.publicationDate && (
                  <time className="text-sm text-gray-500">
                    {newsItem.publicationDate}
                  </time>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {newsItem.title}
              </h1>
            </div>

            {newsItem.imageUrl && (
              <div className="mb-8 relative w-full h-[300px] md:h-[400px] lg:h-[500px] rounded-lg overflow-hidden">
                <Image
                  src={newsItem.imageUrl}
                  alt={newsItem.title}
                  className="object-cover"
                  fill
                  unoptimized
                  priority
                />
              </div>
            )}

            {/* replace with markdown during merge */}
            <div className="prose prose-lg max-w-none">
              <div dangerouslySetInnerHTML={{ __html: newsItem.description }} />
            </div>
          </article>
        </div>
      </div>
    </>
  );
}
