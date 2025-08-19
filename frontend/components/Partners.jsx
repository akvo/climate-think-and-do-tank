import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { H5 } from './Heading';
import { env } from '@/helpers/env-vars';
import { getImageUrl } from '@/helpers/utilities';

const BACKEND_URL = env('NEXT_PUBLIC_BACKEND_URL');

const PartnersSection = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const response = await axios.get(
          `${BACKEND_URL}/api/partners?populate=logo`
        );

        if (response.data && response.data.data) {
          const formattedPartners = response.data.data.map((partner) => ({
            id: partner.id,
            name: partner.name || partner.title || 'Partner',
            src: partner.logo
              ? getImageUrl(partner.logo)
              : '/images/placeholder.jpg',
            order: partner.order || 0,
          }));

          setPartners(formattedPartners);
        }
      } catch (error) {
        console.error('Error fetching partners:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);

  if (!loading && partners.length === 0) {
    return null;
  }

  if (loading) {
    return (
      <section className="py-16 overflow-hidden">
        <div className="text-center mb-12 px-4">
          <H5 variant="bold">
            Trusted by <span className="text-primary-500">Our Partners</span>
          </H5>
        </div>
        <div className="flex justify-center items-center h-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      </section>
    );
  }

  const displayPartners =
    partners.length < 8 ? [...partners, ...partners, ...partners] : partners;

  return (
    <section className="py-16 overflow-hidden">
      <div className="text-center mb-12 px-4">
        <H5 variant="bold">
          Trusted by <span className="text-primary-500">Our Partners</span>
        </H5>
      </div>

      <div className="relative flex justify-center overflow-hidden">
        <div className="flex animate-marquee-delayed whitespace-nowrap items-center">
          {displayPartners.map((partner, index) => (
            <div
              key={`set1-${partner.id}-${index}`}
              className="inline-flex items-center justify-center h-20 min-w-[170px] max-w-[200px] w-auto mx-4 relative flex-shrink-0"
            >
              <div className="relative w-full h-full">
                <Image
                  src={partner.src}
                  alt={partner.name}
                  fill
                  className="object-contain hover:opacity-100 transition-opacity"
                  sizes="(max-width: 768px) 120px, 200px"
                  onError={(e) => {
                    e.target.src = '/images/placeholder.jpg';
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes marqueeFromCenter {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-100%);
          }
        }

        .animate-marquee-delayed {
          animation: marqueeFromCenter 25s linear infinite;
          animation-delay: 2s;
          transform: translateX(0);
        }

        .animate-marquee-delayed:not(:hover) {
          animation-fill-mode: both;
        }

        .relative:hover .animate-marquee-delayed {
          animation-play-state: paused;
        }

        .relative {
          justify-content: center;
        }
      `}</style>
    </section>
  );
};

export default PartnersSection;
