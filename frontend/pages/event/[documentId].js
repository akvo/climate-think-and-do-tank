import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Head from 'next/head';
import Link from 'next/link';
import { ChevronLeft, Clock, MapPin, Users, Share2 } from 'lucide-react';
import axios from 'axios';
import { env } from '@/helpers/env-vars';
import { getImageUrl } from '@/helpers/utilities';
import { MarkdownRenderer } from '@/components/MarkDownRenderer';
import Button from '@/components/Button';

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
          `${BACKEND_URL}/api/events/${documentId}?populate[0]=image&populate[1]=regions`
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
            eventType: item.event_type || 'In Person',
            host: item.host_name || 'Kenya Drylands Investment Hub (KDIH)',
            address: item.address || '',
            mapLink: item.map_link || '',
            imageUrl: item.image?.url ? item.image : null,
            regions: item.regions ? item.regions.map((r) => r.name) : [],
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

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description.substring(0, 160),
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  function formatTimeWithAmPm(timeStr) {
    if (!timeStr) return '';
    const [hourStr, minStr] = timeStr.split(':');
    let hour = parseInt(hourStr, 10);
    const min = minStr || '00';
    const ampm = hour >= 12 ? 'pm' : 'am';
    hour = hour % 12;
    if (hour === 0) hour = 12;
    return `${hour}:${min.padStart(2, '0')} ${ampm}`;
  }

  const formatEventTime = () => {
    if (!event) return '';
    if (event.startTime && event.endTime) {
      return `${formatTimeWithAmPm(event.startTime)} - ${formatTimeWithAmPm(
        event.endTime
      )}`;
    } else if (event.startTime) {
      return `Starting at ${formatTimeWithAmPm(event.startTime)}`;
    } else if (event.endTime) {
      return `Ending at ${formatTimeWithAmPm(event.endTime)}`;
    }
    return '2:00 pm - 6:00 pm';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
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
        <title>{event.title} | Kenya Drylands Investment Hub</title>
        <meta
          name="description"
          content={event.description.substring(0, 160)}
        />
        <meta property="og:title" content={event.title} />
        <meta
          property="og:description"
          content={event.description.substring(0, 160)}
        />
      </Head>

      <div className="min-h-screen bg-white">
        {/* Breadcrumb */}
        <div className="bg-white ">
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
                {event.title.length > 50
                  ? event.title.substring(0, 47) + '...'
                  : event.title}
              </span>
            </nav>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Title and Date Row */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
            {/* Title and Description */}
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {event.title}
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                {event.description.split('\n')[0] ||
                  "An afternoon of learning, partnership, and local innovation in Isiolo's livestock sector. Saturday 26th July 2-6pm Meet changemakers and explore emerging climate-smart investments. RSVP through the KDIH platform."}
              </p>
            </div>

            <div className="bg-primary-50 rounded-xl p-4 text-center min-w-[100px] border border-primary-400">
              <p className="text-gray-600 text-sm font-medium mb-1">
                {event.eventDate
                  ? new Date(event.eventDate).toLocaleDateString('en-US', {
                      month: 'long',
                    })
                  : ''}
              </p>
              <p className="text-4xl font-bold text-primary-600 mb-1">
                {event.eventDate ? new Date(event.eventDate).getDate() : '26'}
              </p>
              <p className="text-gray-700 font-medium">
                {event.eventDate ? new Date(event.eventDate).getFullYear() : ''}
              </p>
            </div>
          </div>

          {event.imageUrl && (
            <div className="relative w-full h-[400px] md:h-[500px] rounded-xl overflow-hidden mb-8">
              <Image
                src={getImageUrl(event.imageUrl)}
                alt={event.title}
                fill
                className="object-cover"
                priority
                unoptimized
              />
            </div>
          )}

          <div className="flex flex-wrap md:flex-nowrap items-start justify-between gap-6 md:gap-8 mb-8 py-8 border-b">
            <div className="flex items-start gap-3">
              <Clock size={20} className="text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-black mb-1">Time</p>
                <p className="font-medium text-gray-900">{formatEventTime()}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin size={20} className="text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-black mb-1">Location</p>
                <p className="font-medium text-gray-900">
                  {event.address ||
                    'Isiolo Resort Conference Hall, Isiolo Town, Isiolo County, Kenya'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users size={20} className="text-black mt-0.5" />
              <div>
                <p className="text-sm text-black mb-1">Type of event</p>
                <p className="font-medium text-gray-900">{event.eventType}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-gray-400 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <div>
                <p className="text-sm text-black mb-1">Hosted by</p>
                <p className="font-medium text-gray-900">{event.host}</p>
              </div>
            </div>

            <div>
              <Button onClick={handleShare}>
                <Share2 size={16} className="mr-1" />
                <span className="font-medium">Share</span>
              </Button>
            </div>
          </div>

          {event.mapLink && (
            <div className="mb-8">
              <div
                className="w-full h-[400px] rounded-xl overflow-hidden map-embed-container"
                dangerouslySetInnerHTML={{ __html: event.mapLink }}
              />
            </div>
          )}

          <div className="prose prose-lg max-w-none mb-12 text-black">
            <h2 className="text-2xl font-bold mb-4">About This Event</h2>
            <MarkdownRenderer content={event.description} />
          </div>

          <div className="pt-8 border-t">
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
