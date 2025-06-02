import { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronLeft } from 'lucide-react';
import { env } from '@/helpers/env-vars';
import Image from 'next/image';
import { MarkdownRenderer } from '@/components/MarkDownRenderer';
import { getImageUrl } from '@/helpers/utilities';
import StatsGrid from '@/components/StatsGrid';

const BACKEND_URL = env('NEXT_PUBLIC_BACKEND_URL');

export default function About() {
  const [about, setAbout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleBack = () => window.history.back();

  useEffect(() => {
    const fetchAbout = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axios.get(
          `${BACKEND_URL}/api/about?populate=banner`
        );
        if (response.data && response.data.data) {
          const item = response.data.data;
          setAbout({
            title: item.title || '',
            tagline: item.tagline || '',
            tagline_description: item.tagline_description || '',
            our_mission: item.our_mission || '',
            what_we_do: item.what_we_do || '',
            where_we_work: item.where_we_work || '',
            join_us: item.join_us || '',
            banner: item.banner ? item.banner : null,
          });
        } else {
          setError('About page not found');
        }
      } catch (err) {
        setError('Failed to load About page');
      } finally {
        setLoading(false);
      }
    };
    fetchAbout();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error || !about) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-center items-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          {error || 'About page not found'}
        </h1>
        <button
          onClick={handleBack}
          className="flex items-center text-green-600 hover:text-green-700"
        >
          <ChevronLeft size={20} className="mr-1" /> Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="max-w-6xl mx-auto py-6">
        {/* Banner */}
        {about.banner && (
          <div className="w-full h-[450px] relative mb-8">
            <Image
              src={getImageUrl(about.banner)}
              alt="About Banner"
              className="object-cover w-full h-full rounded-lg shadow-md"
              fill
              unoptimized
            />
          </div>
        )}

        <div className="container mx-auto px-4 pb-12 pt-12">
          <h1 className="text-4xl font-bold mb-2">{about.title}</h1>
          <div className="flex flex-col md:flex-row gap-4 items-center my-8">
            <div className="md:basis-1/3 w-full md:w-auto">
              <p className="text-green-700 text-3xl">{about.tagline}</p>
            </div>
            <span className="hidden md:inline-block h-5 w-px bg-gray-300 mx-2"></span>
            <div className="md:basis-2/3 w-full md:w-auto">
              <p className="text-base text-gray-700 text-[14px]">
                <MarkdownRenderer content={about.tagline_description} />
              </p>
            </div>
          </div>

          <div className="mb-12 border-b border-gray-100 pb-12">
            <StatsGrid />
          </div>

          <Section title="Our Mission" body={about.our_mission} />
          <Section title="What We Do" body={about.what_we_do} />
          <Section title="Where We Work" body={about.where_we_work} />
          <Section title="Join Us" body={about.join_us} />
        </div>
      </div>
    </div>
  );
}

function Section({ title, body }) {
  if (!body) return null;
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-2">{title}</h2>
      <div className="prose prose-lg text-gray-800 max-w-none">
        <MarkdownRenderer content={body} />
      </div>
    </div>
  );
}
