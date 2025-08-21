import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { H5 } from './Heading';
import { env } from '@/helpers/env-vars';
import { getImageUrl } from '@/helpers/utilities';
import Marquee from 'react-fast-marquee';

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

      <div className="relative overflow-hidden">
        <div className="whitespace-nowrap items-center">
          <Marquee
            gradient={false}
            speed={150}
            pauseOnHover={true}
            pauseOnClick={true}
            delay={0}
            play={true}
            direction="left"
          >
            {displayPartners.map((partner, index) => (
              <div
                key={`set1-${partner.id}-${index}`}
                className="h-20 min-w-[170px] max-w-[200px] w-auto mx-4 relative flex-shrink-0"
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
            ))}{' '}
          </Marquee>
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
