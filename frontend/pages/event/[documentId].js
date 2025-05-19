import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Head from 'next/head';
import { ChevronLeft, Calendar, MapPin } from 'lucide-react';
import axios from 'axios';
import { env } from '@/helpers/env-vars';

const BACKEND_URL = env('NEXT_PUBLIC_BACKEND_URL');

export default function EventDetailPage() {
  const router = useRouter();
  const { documentId } = router.query;

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
            startTime: item.start_time || null,
            endTime: item.end_time || null,
            eventType: item.event_type || 'General',
            host: item.host_name || 'Our Organization',
            address: item.address || '',
            mapLink: item.map_link || '',
            imageUrl: item.image?.url
              ? `${BACKEND_URL}${item.image.url}`
              : null,
          };

          setEvent(processedEvent);
        } else {
          setError('Event not found');
        }
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('Failed to load event');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [documentId]);

  const handleBack = () => {
    router.push('/news-events');
  };

  const formatEventTime = () => {
    let timeDisplay = '';

    if (event.startTime && event.endTime) {
      timeDisplay = `${event.startTime} - ${event.endTime}`;
    } else if (event.startTime) {
      timeDisplay = `Starting at ${event.startTime}`;
    } else if (event.endTime) {
      timeDisplay = `Ending at ${event.endTime}`;
    }

    return timeDisplay;
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
        {event.imageUrl && (
          <>
            <meta property="og:image" content={event.imageUrl} />
            <meta name="twitter:image" content={event.imageUrl} />
          </>
        )}
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

      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-6">
          <button
            onClick={handleBack}
            className="flex items-center text-green-600 hover:text-green-700"
          >
            <ChevronLeft size={20} className="mr-1" /> Back to News & Events
          </button>
        </div>

        <div className="container mx-auto px-4 pb-16 text-black">
          <div className="">
            <div className="mb-8 p-6 bg-gray-50 rounded-lg shadow-sm">
              <div className="flex flex-col gap-1 mb-2">
                <div className="text-sm text-gray-700 font-medium flex items-center gap-2">
                  <Calendar size={16} className="text-green-600" />
                  <span>
                    {event.eventDate} | {formatEventTime()} | {event.eventType}
                  </span>
                </div>
                <div className="text-lg font-bold text-gray-900 mt-2">
                  {event.title}
                </div>
                {event.host && (
                  <div className="text-gray-700 text-base">
                    <span className="font-semibold">Host:</span> {event.host}
                  </div>
                )}
                {event.address && (
                  <div className="text-gray-700 flex items-center mt-1">
                    <MapPin size={16} className="mr-1 text-red-500" />
                    <span>{event.address}</span>
                  </div>
                )}
              </div>
            </div>

            {event.imageUrl && (
              <div className="mb-8 relative w-full h-[300px] md:h-[400px] lg:h-[500px] rounded-lg overflow-hidden">
                <Image
                  src={event.imageUrl}
                  alt={event.title}
                  className="object-cover"
                  fill
                  unoptimized
                  priority
                />
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

            <div className="prose prose-lg max-w-none">
              <h2 className="text-2xl font-semibold mb-4">About This Event</h2>
              <div dangerouslySetInnerHTML={{ __html: event.description }} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
