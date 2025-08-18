import React, { useState } from 'react';
import Button from './Button';

export default function HeroSection({
  searchTerm,
  setSearchTerm,
  pageTitle = 'Knowledge library',
  pageDescription,
  showSearch = true,
  searchText,
}) {
  const [searchValue, setSearchValue] = useState('');

  return (
    <div className="relative bg-gray-10 overflow-hidden">
      <div
        className="hidden md:block absolute inset-0"
        style={{
          backgroundImage:
            "url('/images/graphic.svg'), url('/images/cubes.svg')",
          backgroundPosition: 'right center, left center',
          backgroundRepeat: 'no-repeat, no-repeat',
          backgroundSize: 'auto, cover',
        }}
      />

      <div
        className="hidden sm:block md:hidden absolute inset-0"
        style={{
          backgroundImage:
            "url('/images/graphic.svg'), url('/images/cubes.svg')",
          backgroundPosition: 'right top, left bottom',
          backgroundRepeat: 'no-repeat, no-repeat',
          backgroundSize: '40%, 80%',
        }}
      />

      <div
        className="sm:hidden absolute inset-0"
        style={{
          backgroundImage: "url('/images/graphic.svg')",
          backgroundPosition: 'top right',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '20%',
        }}
      />
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-0 py-8 sm:py-12 md:py-16">
        <div className="max-w-2xl">
          <div className="mb-8 sm:mb-12">
            <h1 className="text-2xl/9 sm:text-3xl md:text-4xl lg:text-[48px]/[54px] font-extrabold text-black mb-3 sm:mb-4 leading-tight">
              {pageTitle}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-800">
              {pageDescription}
            </p>
          </div>
          {showSearch && (
            <div className="mb-6 sm:mb-8">
              <p className="text-sm sm:text-base text-gray-500 mb-2 sm:mb-[10px]">
                {searchText ? searchText : 'Search all knowledge library'}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 flex items-center bg-white border border-gray-200 rounded-full">
                  <svg
                    className="absolute left-3 sm:left-4 text-gray-400 w-4 sm:w-5 h-4 sm:h-5"
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
                    placeholder={searchText || 'Search...'}
                    value={searchValue}
                    onChange={(e) => {
                      setSearchValue(e.target.value);
                    }}
                    className="flex-1 pl-10 sm:pl-12 pr-3 sm:pr-4 h-10 sm:h-12 text-sm sm:text-base lg:text-lg bg-transparent border-none focus:outline-none text-black"
                  />
                  <Button
                    variant="primary"
                    size="md"
                    className="hidden lg:block px-4 sm:px-6 md:px-8 mx-1 text-sm sm:text-base bg-primary-500"
                    onClick={() => {
                      setSearchTerm(searchValue);
                    }}
                  >
                    Search
                  </Button>
                </div>
                <Button
                  variant="primary"
                  size="md"
                  className="sm:hidden w-full py-3 text-sm bg-primary-500"
                  onClick={() => {
                    setSearchTerm(searchValue);
                  }}
                >
                  Search
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 640px) {
          .relative.bg-gray-10 {
            background-size: 50%, 100% !important;
            background-position: right top, left center !important;
          }
        }
        @media (max-width: 768px) {
          .relative.bg-gray-10 {
            background-size: 60%, 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
