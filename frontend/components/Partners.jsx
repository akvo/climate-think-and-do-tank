import React from 'react';
import Image from 'next/image';

const PartnersSection = () => {
  const partners = [
    {
      id: 1,
      name: 'VO Partner',
      src: '/images/placeholder.jpg',
      width: 'w-24',
    },
    {
      id: 2,
      name: 'Government Partner 1',
      src: '/images/placeholder.jpg',
      width: 'w-16',
    },
    {
      id: 3,
      name: 'Institutional Partner 1',
      src: '/images/placeholder.jpg',
      width: 'w-16',
    },
    {
      id: 4,
      name: 'VNG International',
      src: '/images/placeholder.jpg',
      width: 'w-20',
    },
    {
      id: 5,
      name: 'Government Partner 2',
      src: '/images/placeholder.jpg',
      width: 'w-16',
    },
    {
      id: 6,
      name: 'Partner Seal',
      src: '/images/placeholder.jpg',
      width: 'w-16',
    },
    {
      id: 7,
      name: 'Institutional Partner 2',
      src: '/images/placeholder.jpg',
      width: 'w-16',
    },
    {
      id: 8,
      name: 'Organization Partner',
      src: '/images/placeholder.jpg',
      width: 'w-16',
    },
  ];

  return (
    <section className="py-16 overflow-hidden">
      <div className="text-center mb-12 px-4">
        <h3 className="text-[24px] font-bold text-black">
          Trusted by <span className="text-primary-500">Our Partners</span>
        </h3>
      </div>

      <div className="relative flex justify-center overflow-hidden">
        <div className="flex animate-marquee-delayed whitespace-nowrap items-center">
          {partners.map((partner) => (
            <div
              key={`set1-${partner.id}`}
              className={`inline-flex items-center justify-center h-16 ${partner.width} mx-6 relative flex-shrink-0`}
            >
              <Image
                src={partner.src}
                alt={partner.name}
                fill
                className="object-contain opacity-70 hover:opacity-100 transition-opacity"
                sizes="150px"
              />
            </div>
          ))}
        </div>

        <div
          className="flex animate-marquee-delayed whitespace-nowrap items-center"
          aria-hidden="true"
        >
          {partners.map((partner) => (
            <div
              key={`set2-${partner.id}`}
              className={`inline-flex items-center justify-center h-16 ${partner.width} mx-6 relative flex-shrink-0`}
            >
              <Image
                src={partner.src}
                alt={partner.name}
                fill
                className="object-contain opacity-70 hover:opacity-100 transition-opacity"
                sizes="150px"
              />
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
          /* Start centered, then animate */
          transform: translateX(0);
        }

        /* Keep items centered until animation starts */
        .animate-marquee-delayed:not(:hover) {
          animation-fill-mode: both;
        }

        .relative:hover .animate-marquee-delayed {
          animation-play-state: paused;
        }

        /* Center the container initially */
        .relative {
          justify-content: center;
        }
      `}</style>
    </section>
  );
};

export default PartnersSection;
