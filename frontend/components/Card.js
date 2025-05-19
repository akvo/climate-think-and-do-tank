import { formatDate } from '@/helpers/utilities';
import { env } from '@/helpers/env-vars';
import Image from 'next/image';
import React from 'react';

const Card = ({ card, onClick }) => {
  const formattedDate = formatDate(card.publicationDate);

  return (
    <div
      className="bg-white rounded-lg overflow-hidden shadow-sm border cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onClick(card)}
    >
      <div className="relative">
        <div className="relative h-48 w-full">
          {card.imageUrl ? (
            <Image
              src={`${card.imageUrl}`}
              alt={card.title}
              fill
              className="object-cover"
              unoptimized
              onError={(e) => {
                e.target.style.display = 'none';
                const parent = e.target.parentNode;
                if (parent) {
                  parent.innerHTML = `
                  <div class="w-full h-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
                    ${card.title.charAt(0).toUpperCase()}
                  </div>
                `;
                } else {
                  console.warn('Image parent element not found');
                }
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <span className="text-gray-600 font-bold text-xl">
                {card.title.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {card.region && (
          <div className="absolute top-2 left-2 px-3 py-1 bg-black bg-opacity-50 text-white text-xs rounded-full">
            {card.region}
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-lg font-semibold text-black line-clamp-2 border-b pb-4 mb-4">
          {card.title}
        </h3>
        <div className="text-gray-500 text-xs text-right">{formattedDate}</div>
      </div>
    </div>
  );
};

export default Card;
