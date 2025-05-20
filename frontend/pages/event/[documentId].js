import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Head from 'next/head';
import Link from 'next/link';
import { ChevronLeft, Calendar, MapPin } from 'lucide-react';
import axios from 'axios';
import { env } from '@/helpers/env-vars';
import { getImageUrl } from '@/helpers/utilities';
// import MarkdownRenderer from '@/components/MarkdownRenderer'; // Uncomment if you have a renderer

const BACKEND_URL = env('NEXT_PUBLIC_BACKEND_URL');

export default function EventDetailPage() {
  const router = useRouter();
  const { documentId } = router.query;

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const breadcrumbSource = {
    name: 'News & Events',
    link: '/news-events',
  };

  useEffect(() => {
    const fetchEvent = async () => {
      if (!documentId) return;
      setLoading(true);
      try {
        const response = await axios.get(
          `${BACKEND_URL}/api/events/${documentId}?populate=image`
        );
        if (response.data && response.data.data) {
          const item = response.data.data;
          const processedEvent = {
            id: item.id,
            title: item.title || '',
            description: item.description || '',
            eventDate: item.event_date || null,
            publishedAt: item.publishedAt || item.event_date || null,
            startTime: item.start_time || null,
            endTime: item.end_time || null,
            eventType: item.event_type || 'General',
            host: item.host_name || 'Our Organization',
            address: item.address || '',
            mapLink: item.map_link || '',
            imageUrl: item.image?.url ? item.image : null,
          };
          setEvent(processedEvent);
        } else {
          setError('Event not found');
        }
      } catch (err) {
        setError('Failed to load event');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [documentId]);

  const handleBack = () => router.push('/news-events');

  const formatEventTime = () => {
    if (!event) return '';
    if (event.startTime && event.endTime) {
      return `${event.startTime} - ${event.endTime}`;
    } else if (event.startTime) {
      return `Starting at ${event.startTime}`;
    } else if (event.endTime) {
      return `Ending at ${event.endTime}`;
    }
    return '';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-center items-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          {error || 'Event not found'}
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
        <title>{event.title} | Our Organization</title>
        <meta
          name="description"
          content={event.description.substring(0, 160)}
        />
        <meta property="og:title" content={event.title} />
        <meta
          property="og:description"
          content={event.description.substring(0, 160)}
        />
        <meta name="twitter:title" content={event.title} />
        <meta
          name="twitter:description"
          content={event.description.substring(0, 160)}
        />
      </Head>

      {/* Breadcrumb Bar */}
      <div className="bg-[#EFFDF1] px-4 py-10">
        <div className="container mx-auto">
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
              {event.title.length > 50
                ? event.title.substring(0, 47) + '...'
                : event.title}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <article className="prose lg:prose-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-gray-600 mb-4">
            <div className="flex items-center gap-2 text-base">
              <Calendar size={18} className="text-green-600" />
              {event.eventDate && (
                <time dateTime={event.eventDate}>
                  {new Date(event.eventDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
              )}
              {formatEventTime() && <span> | {formatEventTime()}</span>}
              {event.eventType && <span> | {event.eventType}</span>}
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-[#008A16] mb-6">
            {event.title}
          </h1>

          {event.imageUrl && (
            <div className="mb-8 rounded-lg overflow-hidden max-w-3xl mx-auto relative h-[300px] md:h-[400px]">
              <Image
                src={getImageUrl(event.imageUrl)}
                alt={event.title}
                fill
                className="w-full h-auto object-cover"
                priority
                unoptimized
              />
            </div>
          )}

          {event.host && (
            <div className="text-gray-700 text-base mb-2">
              <span className="font-semibold">Host:</span> {event.host}
            </div>
          )}

          {event.address && (
            <div className="text-gray-700 flex items-center mb-2">
              <MapPin size={16} className="mr-1 text-red-500" />
              <span>{event.address}</span>
            </div>
          )}

          {event.mapLink && (
            <div className="my-6">
              <div
                className="w-full h-[300px] md:h-[400px] rounded-md overflow-hidden"
                dangerouslySetInnerHTML={{ __html: event.mapLink }}
              />
            </div>
          )}

          <h2 className="text-2xl font-semibold mb-4 mt-8 text-black">
            About This Event
          </h2>
          {/* If you want markdown support, use your renderer, otherwise fallback */}
          {/* <MarkdownRenderer content={event.description} /> */}
          <div
            dangerouslySetInnerHTML={{ __html: event.description }}
            className="text-black"
          />
        </article>
      </div>
    </>
  );
}
