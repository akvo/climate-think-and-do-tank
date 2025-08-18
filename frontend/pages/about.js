import { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronLeft } from 'lucide-react';
import { env } from '@/helpers/env-vars';
import Image from 'next/image';
import { MarkdownRenderer } from '@/components/MarkDownRenderer';
import { getImageUrl } from '@/helpers/utilities';
import HeroSection from '@/components/Hero';
import Button from '@/components/Button';
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
          `${BACKEND_URL}/api/about?populate=banner&populate=mission_image`
        );
        if (response.data && response.data.data) {
          const item = response.data.data;
          setAbout({
            title: item.title || 'Kenya Drylands Investment Hub',
            tagline:
              item.tagline || 'Empowering Investment, Building Resilience',
            tagline_description: item.tagline_description || '',
            banner_description: item.banner_description || '',
            our_mission: item.our_mission || '',
            what_we_do: item.what_we_do || '',
            where_we_work: item.where_we_work || '',
            join_us: item.join_us || '',
            banner: item.banner ? item.banner : null,
            mission_image: item.mission_image ? item.mission_image : null,
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
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
          className="flex items-center text-primary-600 hover:text-primary-700"
        >
          <ChevronLeft size={20} className="mr-1" /> Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <HeroSection
        pageTitle={
          <>
            About{' '}
            <span className="text-primary-500">
              Kenya Drylands Investment Hub
            </span>{' '}
            (KDIH)
          </>
        }
        pageDescription={about.banner_description}
        showSearch={false}
      />

      <section className="relative py-20 overflow-hidden pb-0">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative h-[400px] lg:h-[500px] rounded-lg overflow-hidden">
              {about.banner ? (
                <Image
                  src={getImageUrl(about.banner)}
                  alt="Kenya Drylands Investment Hub"
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center">
                  <Image
                    src="/images/placeholder.jpg"
                    alt="Kenya Drylands Investment Hub"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}
            </div>

            <div>
              <h2 className="text-4xl md:text-5xl/[54px] font-bold mb-6 text-black">
                {about.tagline}
              </h2>
              <div className="text-lg text-gray-600 leading-relaxed mb-8">
                <MarkdownRenderer content={about.tagline_description} />
              </div>

              <div className="flex flex-wrap gap-4">
                <Button size="sm">Get in touch</Button>
                <Button variant="outline">Sign up</Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <StatsGrid />
        </div>
      </section>

      <section className="py-20 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-primary-50 rounded-2xl">
            <div className="p-12">
              <h2 className="text-3xl md:text-4xl font-bold text-primary-600 mb-6">
                Our mission
              </h2>
              <div className="text-gray-600 leading-relaxed">
                <MarkdownRenderer content={about.our_mission} />
              </div>
            </div>
            {about.mission_image && (
              <div className="relative h-[400px] rounded-lg overflow-hidden shadow-lg">
                <Image
                  src={getImageUrl(about.mission_image)}
                  alt="Our Mission"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="py-20 bg-gray-50 relative overflow-hidden">
        <div
          className="hidden md:block absolute inset-0"
          style={{
            backgroundImage: "url('/images/graphic.svg')",
            backgroundPosition: 'right top',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'auto',
            opacity: 0.05,
          }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-600 mb-4">
              What we do
            </h2>
            {about.what_we_do && (
              <div className="max-w-3xl mx-auto text-gray-600 mb-8">
                <MarkdownRenderer content={about.what_we_do} />
              </div>
            )}
            <button className="bg-primary-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-primary-700 transition-colors">
              Sign up
            </button>
          </div>
        </div>
      </section>

      {/* Where We Work Section */}
      {about.where_we_work && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-600 mb-6 text-center">
              Where We Work
            </h2>
            <div className="max-w-4xl mx-auto text-gray-600 leading-relaxed">
              <MarkdownRenderer content={about.where_we_work} />
            </div>
          </div>
        </section>
      )}

      {/* Join Us Section */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-white relative overflow-hidden">
        <div
          className="hidden md:block absolute inset-0"
          style={{
            backgroundImage: "url('/images/cubes.svg')",
            backgroundPosition: 'left bottom',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'auto',
            opacity: 0.1,
          }}
        />

        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Join Us</h2>
          <div className="max-w-3xl mx-auto text-gray-600 mb-8 leading-relaxed">
            {about.join_us ? (
              <MarkdownRenderer content={about.join_us} />
            ) : (
              <p>
                Whether you're an investor, county officer, development partner,
                or grassroots leader, the Kenya Drylands Investment Hub is your
                space to connect, collaborate, and catalyze transformative
                action across the ASALs.
              </p>
            )}
          </div>
          <button className="bg-primary-600 text-white px-10 py-4 rounded-full font-semibold hover:bg-primary-700 transition-colors text-lg">
            Sign up now
          </button>
        </div>
      </section>
    </div>
  );
}
