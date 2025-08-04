import React, { useState } from 'react';
import Button from './Button';

export default function HeroSection({ searchTerm, setSearchTerm }) {
  const [searchValue, setSearchValue] = useState('');

  return (
    <div
      className="relative bg-gray-10 overflow-hidden"
      style={{
        backgroundImage: "url('/images/graphic.svg'), url('/images/cubes.svg')",
        backgroundPosition: 'right center, left center',
        backgroundRepeat: 'no-repeat, no-repeat',
        backgroundSize: 'auto, cover',
      }}
    >
      <div className="relative z-10 container mx-auto py-16">
        <div className="max-w-2xl">
          <div className="mb-12">
            <h1 className="text-[48px] font-extrabold text-black mb-4 leading-tight">
              Knowledge library
            </h1>
            <p className="text-xl text-gray-800">
              The latest industry news, interviews, technologies, and resources.
            </p>
          </div>

          <div className="mb-8">
            <p className="text-gray-500 mb-[10px]">
              Search all knowledge library
            </p>
            <div className="flex gap-3">
              <div className="relative flex-1 flex items-center bg-white border border-gray-200 rounded-full">
                <svg
                  className="absolute left-4 text-gray-400 w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Kenya's arid land"
                  value={searchValue}
                  onChange={(e) => {
                    setSearchValue(e.target.value);
                  }}
                  className="flex-1 pl-12 pr-4 h-12 text-lg bg-transparent border-none focus:outline-none text-black"
                />
                <Button
                  variant="primary"
                  size="md"
                  className="px-8 mx-1"
                  onClick={() => {
                    setSearchTerm(searchValue);
                  }}
                >
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
