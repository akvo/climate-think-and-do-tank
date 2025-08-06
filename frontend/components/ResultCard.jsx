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

export default function ResultCard({ result, viewMode, onClick }) {
  const isGridView = viewMode === 'grid';

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer ${
        isGridView ? '' : 'flex'
      }`}
      onClick={() => onClick(result)}
    >
      <div className={`relative ${isGridView ? 'h-64' : 'w-48 flex-shrink-0'}`}>
        {result.image ? (
          <Image
            src={getImageUrl(result.image)}
            alt={result.title}
            width={500}
            height={300}
            className="w-full h-full object-cover rounded-2xl"
            unoptimized
            onError={(e) => {
              const parentDiv = e.target.closest('.relative');
              if (parentDiv) {
                e.target.style.display = 'none';
                const fallbackDiv = document.createElement('div');
                fallbackDiv.className =
                  'w-full h-full bg-primary-500 flex items-center justify-center text-white text-2xl font-bold rounded-2xl';
                fallbackDiv.textContent = result.title.charAt(0).toUpperCase();
                parentDiv.innerHTML = '';
                parentDiv.appendChild(fallbackDiv);
              }
            }}
          />
        ) : (
          <div className="w-full h-full bg-primary-500 flex items-center justify-center text-white text-2xl font-bold rounded-2xl">
            {result.title.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="absolute top-4 left-4">
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium bg-primary-50 text-primary-600">
            {result.file ? (
              <FileText className="w-4 h-4" />
            ) : (
              <ExternalLink className="w-4 h-4" />
            )}
            {result.file ? 'Document' : 'Link'}
          </div>
        </div>
      </div>

      <div
        className={`p-6 flex-1 ${
          isGridView ? '' : 'flex flex-col justify-between'
        }`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-3 text-sm text-gray-500 justify-between">
              <div className="flex items-center gap-1 flex-wrap">
                <MapPin className="w-4 h-4 text-primary-500" />
                <div className="flex flex-wrap gap-1">
                  {(result.focusRegions?.length > 0
                    ? result.focusRegions
                    : ['No Region']
                  ).map((region, index) => (
                    <span key={index} className="text-primary-500 font-bold">
                      {region}
                      {index < result.focusRegions.length - 1 ? ',' : ''}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-black" />
                <span className="text-black font-bold">
                  {result.publishedAt ? result.publishedAt : 'No Date'}
                </span>
              </div>
            </div>
            <div className="flex gap-2 justify-between">
              <h3 className="font-bold text-lg text-gray-900 mb-3 group-hover:text-primary-600 transition-colors line-clamp-2">
                {result.title}
              </h3>

              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-primary-100 flex items-center justify-center transition-colors">
                  <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-primary-600" />
                </div>
              </div>
            </div>

            <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
              {result.description}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {result.topic && (
              <span className="px-2.5 py-1 bg-primary-50 text-primary-600 text-xs font-medium rounded-full border border-primary-100">
                {result.topic}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
