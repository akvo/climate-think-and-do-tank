import { useState } from 'react';
import HeroSlider from '@/components/HeroSlider';
import KenyaMap from '@/components/KenyaMap';
import { MarkdownRenderer } from '@/components/MarkDownRenderer';
import InvestmentCarousel from '@/components/InvestmentCarousel';
import { useRouter } from 'next/router';
import StatsGrid from '@/components/StatsGrid';

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

        <section className="bg-gray-50 py-20 text-gray-800 border-t border-gray-100">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-16 items-center">
              <div className="col-span-1 md:col-span-5">
                <h2 className="text-4xl font-bold text-gray-800 leading-tight mb-6">
                  {data.title}
                </h2>
              </div>
              <div className="col-span-1 md:col-span-7 space-y-8 text-[14px]">
                <MarkdownRenderer content={data.description} />
              </div>
            </div>

            <StatsGrid />
          </div>
        </section>

        <section className="py-16 text-black">
          <div className="container mx-auto px-4 flex justify-center">
            <KenyaMap
              onSelect={(selected) =>
                router.push(`/social-accountability?regions=${selected}`)
              }
            />
          </div>
        </section>

        <InvestmentCarousel />
      </main>
    </>
  );
}
