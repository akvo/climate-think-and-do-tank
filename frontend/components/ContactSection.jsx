import React from 'react';
import Link from 'next/link';

const InterestedSection = ({
  title = 'Interested?',
  description = 'To express interest, access additional data, or be connected to local stakeholders, contact the Kenya Drylands Investment Hub (DKIH):',
  buttonText = 'Contact us',
  buttonLink = '/contact',
  backgroundColor = 'bg-gray-10',
  buttonColor = 'bg-primary-500 hover:bg-primary-600',
}) => {
  return (
    <section>
      <div
        className={`container mx-auto relative overflow-hidden ${backgroundColor} mb-12 rounded-3xl`}
        style={{
          backgroundImage:
            "url('/images/graphic.svg'), url('/images/graphic.svg')",
          backgroundRepeat: 'no-repeat, no-repeat',
          backgroundPosition: 'left bottom, right top',
          backgroundSize: '15%, 15%',
        }}
      >
        <div className="container mx-auto px-4  py-16  max-w-4xl relative z-10">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {title}
            </h2>
            <p className="text-lg md:text-xl text-gray-700 mb-10 max-w-3xl mx-auto">
              {description}
            </p>
            <Link
              href={buttonLink}
              className={`inline-flex items-center px-8 py-3 rounded-full text-white font-medium transition-colors hover:bg-white border border-primary-500 hover:text-primary-500 ${buttonColor}`}
            >
              {buttonText}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InterestedSection;
