import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Head from 'next/head';
import Link from 'next/link';
import { ChevronLeft, Newspaper } from 'lucide-react';
import axios from 'axios';
import { env } from '@/helpers/env-vars';
import { getImageUrl, formatRegionsDisplay } from '@/helpers/utilities';
import { MarkdownRenderer } from '../../components/MarkDownRenderer';

const BACKEND_URL = env('NEXT_PUBLIC_BACKEND_URL');

export default function NewsDetailPage() {
  const router = useRouter();
  const { documentId } = router.query;

  const [newsItem, setNewsItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [regions, setRegions] = useState([]);

  const breadcrumbSource = {
    name: 'News & Events',
    link: '/news-events',
  };

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
            imageUrl: item.image?.url ? getImageUrl(item.image) : null,
          };
          setNewsItem(processedItem);
        } else {
          setError('News article not found');
        }
      } catch (err) {
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

      <div className="bg-[#EFFDF1] px-4 py-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-md font-semibold">
            <Link href="/" className="text-gray-700 hover:underline">
              Home
            </Link>
            <span className="text-gray-500">/</span>
            {breadcrumbSource && (
              <>
                <Link
                  href={breadcrumbSource.link}
                  className="text-gray-700 hover:underline"
                >
                  {breadcrumbSource.name}
                </Link>
                <span className="text-gray-500">/</span>
              </>
            )}
            <span className="text-[#008A16]">
              {newsItem.title.length > 50
                ? newsItem.title.substring(0, 47) + '...'
                : newsItem.title}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto py-12 text-black">
        <article className="prose lg:prose-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-gray-600 mb-4">
            <div className="flex items-center gap-2 text-base">
              <Newspaper size={18} className="text-green-600" />
              <span>News</span>
              {newsItem.regions && newsItem.regions.length > 0 && (
                <span className="ml-3 text-sm text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full">
                  {formatRegionsDisplay(newsItem.regions, regions)}
                </span>
              )}
              {newsItem.publicationDate && (
                <span className="ml-3 text-sm text-gray-500">
                  <time dateTime={newsItem.publicationDate}>
                    {new Date(newsItem.publicationDate).toLocaleDateString(
                      'en-US',
                      {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      }
                    )}
                  </time>
                </span>
              )}
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-[#008A16] mb-6">
            {newsItem.title}
          </h1>

          {newsItem.imageUrl && (
            <div className="mb-8 rounded-lg overflow-hidden max-w-3xl mx-auto relative h-[300px] md:h-[400px]">
              <Image
                src={newsItem.imageUrl}
                alt={newsItem.title}
                fill
                className="w-full h-auto object-cover"
                priority
                unoptimized
              />
            </div>
          )}

          <MarkdownRenderer content={newsItem.description} />
        </article>
      </div>
    </>
  );
}
