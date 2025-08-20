import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Head from 'next/head';
import Link from 'next/link';
import { ChevronLeft, MapPin, Calendar, Share2 } from 'lucide-react';
import axios from 'axios';
import { env } from '@/helpers/env-vars';
import { getImageUrl, formatRegionsDisplay } from '@/helpers/utilities';
import { MarkdownRenderer } from '../../components/MarkDownRenderer';
import Button from '@/components/Button';

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
            imageUrl: item.image?.url ? getImageUrl(item.image) : null,
            author: item.author || null,
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

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: newsItem.title,
        text: newsItem.description.substring(0, 160),
        url: window.location.href,
      });
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
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
          className="flex items-center text-primary-600 hover:text-primary-700"
        >
          <ChevronLeft size={20} className="mr-1" /> Back to News & Events
        </button>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{newsItem.title} | Kenya Drylands Investment Hub</title>
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
      </Head>

      <div className="min-h-screen bg-white">
        <div className="bg-white">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center gap-2 text-sm">
              <Link href="/" className="text-gray-500 hover:text-gray-700">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
              </Link>
              <ChevronLeft size={16} className="text-gray-400 rotate-180" />
              <Link
                href="/news-events"
                className="text-gray-500 hover:text-gray-700"
              >
                News and events
              </Link>
              <ChevronLeft size={16} className="text-gray-400 rotate-180" />
              <span className="text-primary-600 font-medium">
                {newsItem.title.length > 50
                  ? newsItem.title.substring(0, 47) + '...'
                  : newsItem.title}
              </span>
            </nav>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {newsItem.regions && newsItem.regions.length > 0 && (
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center bg-primary-50 text-primary-600 px-3 py-1.5 rounded-full">
                <MapPin size={14} className="mr-1.5" />
                <span className="text-sm font-medium">
                  {formatRegionsDisplay(newsItem.regions, regions)}
                </span>
              </div>
            </div>
          )}

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            {newsItem.title}
          </h1>

          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            {newsItem.description.split('\n')[0]}
          </p>

          {newsItem.imageUrl && (
            <div className="relative w-full h-[400px] md:h-[500px] rounded-xl overflow-hidden mb-8">
              <Image
                src={newsItem.imageUrl}
                alt={newsItem.title}
                fill
                className="object-cover"
                priority
                unoptimized
              />
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-6 mb-8">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-sm text-gray-500">Published on</p>
                <p className="font-medium text-gray-900">
                  {newsItem.publicationDate
                    ? new Date(newsItem.publicationDate).toLocaleDateString(
                        'en-US',
                        {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        }
                      )
                    : 'June 15, 2025'}
                </p>
              </div>

              <Button onClick={handleShare}>
                <Share2 size={16} className="mr-1" />
                <span className="text-sm font-medium">Share</span>
              </Button>
            </div>
          </div>

          <article className="prose prose-lg  max-w-4xl m-auto">
            <div className="mb-8 text-black">
              <h2 className="text-2xl font-bold mb-4">Introduction</h2>
              <MarkdownRenderer content={newsItem.description} />
            </div>
          </article>

          <div className="mt-12 pt-8 border-t">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
            >
              <ChevronLeft size={20} />
              Back to News & Events
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
