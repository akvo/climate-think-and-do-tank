import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { searchContentAcrossTypes } from '@/store/slices/authSlice';
import HeroSlider from '@/components/HeroSlider';
import KenyaMap from '@/components/KenyaMap';
import { MarkdownRenderer } from '@/components/MarkDownRenderer';
import { env } from '@/helpers/env-vars';
import axios from 'axios';
import InvestmentCarousel from '@/components/InvestmentCarousel';
import { useRouter } from 'next/router';

export default function HomePage() {
  const router = useRouter();

  const [data, setData] = useState({
    title: '',
    description: '',
  });
  const [stats, setStats] = useState({
    investmentOpportunities: 0,
    knowledgeAssets: 0,
    users: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const requests = [
          axios.get(
            `${env(
              'NEXT_PUBLIC_BACKEND_URL'
            )}/api/investment-opportunity-profiles/count`
          ),
          axios.get(
            `${env('NEXT_PUBLIC_BACKEND_URL')}/api/knowledge-hubs/count`
          ),
          axios.get(`${env('NEXT_PUBLIC_BACKEND_URL')}/api/users/count`),
        ];

        const [investmentRes, knowledgeRes, usersRes] = await Promise.all(
          requests
        );

        setStats({
          investmentOpportunities: investmentRes.data || 0,
          knowledgeAssets: knowledgeRes.data || 0,
          users: usersRes.data || 0,
        });
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    };

    fetchStats();
  }, []);

  const formatNumber = (num) => {
    return num > 0 ? `${num}+` : '0';
  };

  return (
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 pt-12 border-t border-gray-100">
            <div className="text-center">
              <p className="text-5xl font-bold text-black mb-3">
                {formatNumber(stats.investmentOpportunities)}
              </p>
              <p className="text-lg text-black font-medium">
                Investment
                <br />
                Opportunities
                <br />
                Posted
              </p>
            </div>

            <div className="text-center">
              <p className="text-5xl font-bold text-black mb-3">
                {formatNumber(stats.knowledgeAssets)}
              </p>
              <p className="text-lg text-black font-medium">
                Uploaded
                <br />
                Knowledge
                <br />
                Assets
              </p>
            </div>

            <div className="text-center">
              <p className="text-5xl font-bold text-black mb-3">
                {formatNumber(stats.users)}
              </p>
              <p className="text-lg text-black font-medium">
                Users
                <br />
                Signed
                <br />
                Up
              </p>
            </div>
          </div>
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
  );
}
