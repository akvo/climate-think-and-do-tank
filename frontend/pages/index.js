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
                <h2 className="text-4xl font-bold text-gray-800 leading-tight mb-6">
                  Welcome to the{' '}
                  <span className="text-primary-400">
                    Kenya Drylands Investment Hub
                  </span>
                </h2>
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
                <h2 className="text-3xl font-bold mb-2">
                  Explore{' '}
                  <span className="text-primary-500">
                    Kenya&lsquo;s Drylands
                  </span>
                </h2>
                <p className="text-lg text-gray-700 mb-12">
                  KDIH focuses on eight priority counties: Turkana, Marsabit,
                  Isiolo, Samburu, Laikipia, Narok, Kajiado, and Taita Taveta.
                  These regions face the dual challenge of climate vulnerability
                  and untapped investment potential.
                </p>
              </div>
              <div>
                <Button className="min-w-[200px]">
                  Explore social accountability
                </Button>
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
