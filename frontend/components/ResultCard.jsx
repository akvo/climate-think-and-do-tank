import React from 'react';
import Image from 'next/image';
import {
  FileText,
  ExternalLink,
  MapPin,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import { getImageUrl } from '@/helpers/utilities';

export default function ResultCard({ result, viewMode, onClick, showLink }) {
  const isGridView = viewMode === 'grid';

  return (
    <div
      className={`bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer ${
        isGridView ? '' : 'flex flex-col sm:flex-row'
      }`}
      onClick={() => onClick(result)}
    >
      <div
        className={`relative ${
          isGridView
            ? 'h-48 sm:h-56 md:h-64'
            : 'h-48 sm:h-auto sm:w-36 md:w-48 flex-shrink-0'
        }`}
      >
        {result.image ? (
          <Image
            src={getImageUrl(result.image)}
            alt={result.title}
            width={500}
            height={300}
            className="w-full h-full object-cover rounded-lg sm:rounded-xl md:rounded-2xl"
            unoptimized
            onError={(e) => {
              const parentDiv = e.target.closest('.relative');
              if (parentDiv) {
                e.target.style.display = 'none';
                const fallbackDiv = document.createElement('div');
                fallbackDiv.className =
                  'w-full h-full bg-primary-500 flex items-center justify-center text-white text-xl sm:text-2xl font-bold rounded-lg sm:rounded-xl md:rounded-2xl';
                fallbackDiv.textContent = result.title.charAt(0).toUpperCase();
                parentDiv.innerHTML = '';
                parentDiv.appendChild(fallbackDiv);
              }
            }}
          />
        ) : (
          <div className="w-full h-full bg-primary-500 flex items-center justify-center text-white text-xl sm:text-2xl font-bold rounded-lg sm:rounded-xl md:rounded-2xl">
            {result.title.charAt(0).toUpperCase()}
          </div>
        )}

        {showLink && (
          <div className="absolute top-2 sm:top-3 md:top-4 left-2 sm:left-3 md:left-4">
            <div className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium bg-primary-50 text-primary-600">
              {result.file ? (
                <FileText className="w-3 sm:w-4 h-3 sm:h-4" />
              ) : (
                <ExternalLink className="w-3 sm:w-4 h-3 sm:h-4" />
              )}
              <span className="hidden sm:inline">
                {result.file ? 'Document' : 'Link'}
              </span>
            </div>
          </div>
        )}
      </div>

      <div
        className={`p-4 sm:p-5 md:p-6 flex-1 ${
          isGridView ? '' : 'flex flex-col justify-between'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 sm:mb-4">
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2 sm:mb-3 text-xs sm:text-sm text-gray-500 sm:justify-between">
              <div className="flex items-center gap-1 flex-wrap">
                <MapPin className="w-3 sm:w-4 h-3 sm:h-4 text-primary-500 flex-shrink-0" />
                <div className="flex flex-wrap gap-1">
                  {(result.focusRegions?.length > 0
                    ? result.focusRegions
                    : ['No Region']
                  ).map((region, index) => (
                    <span
                      key={index}
                      className="text-primary-500 font-medium sm:font-bold"
                    >
                      {region}
                      {index < result.focusRegions.length - 1 ? ',' : ''}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Calendar className="w-3 sm:w-4 h-3 sm:h-4 text-gray-600 sm:text-black" />
                <span className="text-gray-600 sm:text-black font-medium sm:font-bold">
                  {result.publishedAt ? result.publishedAt : 'No Date'}
                </span>
              </div>
            </div>

            <div className="flex gap-2 justify-between mb-2 sm:mb-3">
              <h3 className="font-bold text-base sm:text-lg text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                {result.title}
              </h3>

              <div className="flex-shrink-0">
                <div className="w-6 sm:w-7 md:w-8 h-6 sm:h-7 md:h-8 rounded-full bg-gray-100 group-hover:bg-primary-100 flex items-center justify-center transition-colors">
                  <ArrowRight className="w-3 sm:w-4 h-3 sm:h-4 text-gray-500 group-hover:text-primary-600" />
                </div>
              </div>
            </div>

            <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3 md:line-clamp-2">
              {result.description}
            </p>
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {result.topic && (
              <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-primary-50 text-primary-600 text-[10px] sm:text-xs font-medium rounded-full border border-primary-100">
                {result.topic}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
