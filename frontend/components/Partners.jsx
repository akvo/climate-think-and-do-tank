import React from 'react';
import Image from 'next/image';

const PartnersSection = () => {
  const partners = [
    { id: 1, name: 'VO Partner', src: '/images/placholder.jpg', width: 'w-24' },
    {
      id: 2,
      name: 'Government Partner 1',
      src: '/images/placholder.jpg',
      width: 'w-16',
    },
    {
      id: 3,
      name: 'Institutional Partner 1',
      src: '/images/placholder.jpg',
      width: 'w-16',
    },
    {
      id: 4,
      name: 'VNG International',
      src: '/images/placholder.jpg',
      width: 'w-20',
    },
    {
      id: 5,
      name: 'Government Partner 2',
      src: '/images/placholder.jpg',
      width: 'w-16',
    },
    {
      id: 6,
      name: 'Partner Seal',
      src: '/images/placholder.jpg',
      width: 'w-16',
    },
    {
      id: 7,
      name: 'Institutional Partner 2',
      src: '/images/placholder.jpg',
      width: 'w-16',
    },
    {
      id: 8,
      name: 'Organization Partner',
      src: '/images/placholder.jpg',
      width: 'w-16',
    },
  ];

  return (
    <section className="py-16  overflow-hidden">
      <div className="text-center mb-12 px-4">
        <h3 className="text-[24px] font-bold text-black">
          Trusted by <span className="text-primary-500">Our Partners</span>
        </h3>
      </div>

      <div className="relative flex overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {partners.map((partner) => (
            <div
              key={`set1-${partner.id}`}
              className={`inline-flex items-center justify-center h-16 ${partner.width} mx-6 relative`}
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
          className="flex animate-marquee whitespace-nowrap"
          aria-hidden="true"
        >
          {partners.map((partner) => (
            <div
              key={`set2-${partner.id}`}
              className={`inline-flex items-center justify-center h-16 ${partner.width} mx-6 relative`}
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
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-100%);
          }
        }

        .animate-marquee {
          animation: marquee 25s linear infinite;
        }

        .relative:hover .animate-marquee {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};

export default PartnersSection;
