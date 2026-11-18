import React from 'react';
import { H3 } from './Heading';
import { ParagraphMD } from './Text';

const STEPS = [
  'Capacity building',
  'Community dialogue',
  'Identification of investment needs',
  'Community prioritization & ranking',
  'Validation of findings',
  'Sharing with county governments for endorsement',
  'Evidence-based investment decisions',
];

// Full-width white band; the extra bottom padding leaves room for the
// filter bar that overlaps its lower edge (mt-[-31px]) on the page.
export default function SocialAccountabilityProcess() {
  return (
    <section className="bg-white">
      <div className="container mx-auto pt-14 sm:pt-20 pb-16 sm:pb-20">
        <div className="text-center mb-10 sm:mb-16">
          <H3 variant="bold">Social Accountability process</H3>
          <ParagraphMD className="mt-3 text-gray-600">
            From Community Voices to Evidence-Based Investments
          </ParagraphMD>
        </div>

        {/* Vertical timeline on phones, a single row from lg up. */}
        <ol className="grid grid-cols-1 lg:grid-cols-7 gap-6 border-l-2 lg:border-l-0 lg:border-b-2 border-primary-500 pl-6 lg:pl-2 lg:pr-2 lg:pb-4">
          {STEPS.map((step, idx) => (
            <li
              key={step}
              className="flex lg:flex-col items-center lg:items-start gap-4 lg:gap-5"
            >
              <span className="w-9 h-9 rounded-md bg-primary-500 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                {idx + 1}
              </span>
              <span className="text-sm font-bold text-gray-900 uppercase leading-snug">
                {step}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
