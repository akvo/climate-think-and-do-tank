import { useState } from 'react';
import HeroSlider from '@/components/HeroSlider';
import KenyaMap from '@/components/KenyaMap';
import { MarkdownRenderer } from '@/components/MarkDownRenderer';
import InvestmentCarousel from '@/components/InvestmentCarousel';
import { useRouter } from 'next/router';
import StatsGrid from '@/components/StatsGrid';
import PartnersSection from '@/components/Partners';
import InterestedSection from '@/components/ContactSection';
import Button from '@/components/Button';
import { H3 } from '@/components/Heading';
import { ParagraphMD } from '@/components/Text';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();

  const [data, setData] = useState({
    title: '',
    description: '',
  });

  return (
    <>
      <main className="min-h-screen bg-white">
        <HeroSlider setData={setData} />

        <section className="bg-white py-20 text-gray-800 border-t border-gray-100">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-16 ">
              <div className="col-span-1 md:col-span-5">
                <H3 variant="bold">
                  Welcome to the{' '}
                  <span className="text-primary-500">
                    Kenya Drylands Investment Hub
                  </span>
                </H3>
              </div>
              <div className="col-span-1 md:col-span-7 space-y-8 text-[20px]">
                <MarkdownRenderer content={data.description} />
              </div>
            </div>

            <StatsGrid />
          </div>
        </section>

        <section className="py-16 text-black bg-gray-10 hidden md:block">
          <div className="container mx-auto px-4">
            <div className="flex items-start justify-between gap-6">
              <div>
                <H3 variant="bold" className="mb-4">
                  Explore{' '}
                  <span className="text-primary-500">
                    Kenya&lsquo;s Drylands
                  </span>
                </H3>
                <ParagraphMD>
                  KDIH focuses on eight priority counties: Turkana, Marsabit,
                  Isiolo, Samburu, Laikipia, Narok, Kajiado, and Taita Taveta.
                  These regions face the dual challenge of climate vulnerability
                  and untapped investment potential.
                </ParagraphMD>
              </div>
              <div>
                <Link
                  href="/social-accountability"
                  className="inline-flex items-center px-6 py-3 border border-primary-500 rounded-full text-primary-500 hover:bg-primary-500 hover:text-white transition-colors font-bold min-w-[300px] justify-center"
                >
                  Explore social accountability
                </Link>
              </div>
            </div>
          </div>
          <div className=" mx-auto px-4 flex justify-center">
            <KenyaMap
              onSelect={(selected) =>
                router.push(`/social-accountability?regions=${selected}`)
              }
            />
          </div>
        </section>

        <PartnersSection />

        <InvestmentCarousel />

        <InterestedSection />
      </main>
    </>
  );
}
