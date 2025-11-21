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
import {
  CollaborationIcon,
  DataIcon,
  InvestIcon,
  UserIcon,
} from '@/components/Icons';
import InterestedSection from '@/components/ContactSection';
import Link from 'next/link';
import { H3, H5 } from '@/components/Heading';
import { Paragraph, ParagraphMD, ParagraphSM } from '@/components/Text';

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
              item.tagline || 'Empowering Investments, Building Resilience',
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
              <H3 variant="bold" className="mb-4">
                {about.tagline}
              </H3>
              <div className="text-lg text-gray-600 leading-relaxed mb-8">
                <MarkdownRenderer content={about.tagline_description} />
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href="/contact-us"
                  className="text-sm font-semibold text-white bg-primary-500 px-4 py-2 rounded-full hover:bg-white hover:text-primary-500 border hover:border-primary-500 flex items-center"
                >
                  Get In Touch
                </Link>
                <Link
                  href="/signup"
                  className="text-sm font-semibold text-primary-500 bg-white px-4 py-2 rounded-full hover:bg-primary-500 hover:text-white border border-primary-500 hover:border-primary-500 flex items-center"
                >
                  Sign up
                </Link>
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
              <H3 variant="bold" className="text-primary-500 mb-4">
                Our mission
              </H3>
              <div className="text-gray-600 leading-relaxed">
                <MarkdownRenderer content={about.our_mission} />
              </div>
            </div>
            {about.mission_image && (
              <div className="relative h-[400px] rounded-lg overflow-hidden">
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

      <section className="bg-white relative overflow-hidden py-20">
        <div
          className="hidden md:block absolute inset-0"
          style={{
            backgroundImage:
              "url('/images/graphic.svg'), url('/images/cubes.svg')",
            backgroundPosition: 'top right, left center',
            backgroundRepeat: 'no-repeat, no-repeat',
            backgroundSize: '200px auto, cover',
          }}
        />

        <div className="container mx-auto px-4 relative z-10 ">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-1">
              <H3 variant="bold" className="text-primary-500 mb-4">
                What we do
              </H3>

              {about.what_we_do && (
                <>
                  {(() => {
                    const content = about.what_we_do;
                    const sections = content.split(/\*\*([^*]+)\*\*/g);
                    const description = sections[0]?.trim();

                    return description ? (
                      <div className="text-gray-600 mb-6">
                        <ParagraphMD>{description}</ParagraphMD>
                      </div>
                    ) : null;
                  })()}
                </>
              )}

              <Link
                href="/signup"
                className={`inline-flex items-center px-8 py-2 rounded-full text-white font-bold transition-colors hover:bg-white border-2 border-primary-500 hover:text-primary-500 bg-primary-500`}
              >
                Sign Up
              </Link>
            </div>

            <div className="lg:col-span-2">
              {about.what_we_do && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                  {(() => {
                    const content = about.what_we_do;
                    const sections = content.split(/\*\*([^*]+)\*\*/g);

                    const services = [];
                    for (let i = 1; i < sections.length; i += 2) {
                      if (sections[i] && sections[i + 1]) {
                        services.push({
                          title: sections[i].trim(),
                          description: sections[i + 1].trim(),
                        });
                      }
                    }

                    const serviceIcons = {
                      'Data & Insights': <DataIcon className="w-6 h-6" />,
                      'Collaboration Space': (
                        <CollaborationIcon className="w-6 h-6" />
                      ),
                      'Capacity Strengthening': (
                        <UserIcon className="w-6 h-6" />
                      ),
                      'Investment Facilitation': (
                        <InvestIcon className="w-6 h-6" />
                      ),
                    };

                    const orderedServices = [];
                    const collaborationSpace = services.find(
                      (s) => s.title === 'Collaboration Space'
                    );
                    const dataInsights = services.find(
                      (s) => s.title === 'Data & Insights'
                    );
                    const capacity = services.find(
                      (s) => s.title === 'Capacity Strengthening'
                    );
                    const investment = services.find(
                      (s) => s.title === 'Investment Facilitation'
                    );

                    if (collaborationSpace)
                      orderedServices.push(collaborationSpace);
                    if (dataInsights) orderedServices.push(dataInsights);
                    if (capacity) orderedServices.push(capacity);
                    if (investment) orderedServices.push(investment);

                    return orderedServices.map((service, index) => (
                      <div key={index} className="text-black">
                        <div className="flex-shrink-0 text-primary-600 bg-primary-50 inline-flex p-4 rounded-full">
                          {serviceIcons[service.title] || (
                            <svg
                              className="w-12 h-12"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                          )}
                        </div>
                        <div>
                          <H5 variant="bold" className=" my-2">
                            {' '}
                            {service.title}
                          </H5>
                          <Paragraph>{service.description}</Paragraph>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <InterestedSection
        title="Join Us"
        description={<MarkdownRenderer content={about.join_us} />}
        buttonText="Sign up now"
        buttonLink="/signup"
      />
    </div>
  );
}
