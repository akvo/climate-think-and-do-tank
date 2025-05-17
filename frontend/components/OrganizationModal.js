import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Download, Link as LinkIcon } from 'lucide-react';
import Image from 'next/image';
import { fetchRelatedKnowledgeHubs } from '@/store/slices/knowledgeHubSlice';
import { useModal } from '@/hooks/useModal';
import { getTruncatedFilename } from '@/helpers/utilities';

export default function KnowledgeHubModal({ isOpen, onClose, card }) {
  const overlayRef = useModal(isOpen, onClose);
  const dispatch = useDispatch();
  const [currentSlide, setCurrentSlide] = useState(0);

  const { relatedKnowledgeHubs, relatedLoading, relatedError } = useSelector(
    (state) => state.knowledgeHub
  );

  useEffect(() => {
    if (!isOpen || !card) return;

    dispatch(
      fetchRelatedKnowledgeHubs({
        thematicFocus: card.thematicFocus,
        currentResourceId: card.id,
      })
    );
  }, [isOpen, card, dispatch]);

  const handleNextSlide = () => {
    setCurrentSlide(
      (prev) => (prev + 1) % Math.ceil(relatedKnowledgeHubs.length / 4)
    );
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? Math.ceil(relatedKnowledgeHubs.length / 4) - 1 : prev - 1
    );
  };

  const getCurrentSlideResources = () => {
    const startIndex = currentSlide * 4;
    return relatedKnowledgeHubs.slice(startIndex, startIndex + 4);
  };

  if (!isOpen || !card) return null;

  console.log('KnowledgeHubModal', card);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      ref={overlayRef}
    >
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div className="flex-grow">
              <div className="text-green-600 text-sm font-semibold mb-2">
                {card.thematicFocus || 'RESOURCE'}
              </div>
              <h2 className="text-2xl font-bold mb-2 text-black flex gap-8 border-b items-end pb-2 justify-between">
                {card.title}
                <div className="flex items-center gap-6 text-sm text-gray-600 pl-6">
                  <div className="flex items-center gap-2">
                    {card.file && (
                      <a
                        href={card.file}
                        download
                        className="flex items-center gap-1 text-blue-600 hover:underline cursor-pointer"
                      >
                        <Download size={16} />
                        <span>{getTruncatedFilename(card.file)}</span>
                      </a>
                    )}
                    {card.webLink && (
                      <a
                        href={card.webLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        <LinkIcon size={16} />
                        {(() => {
                          try {
                            const fullUrl = card.webLink.includes('://')
                              ? card.webLink
                              : `https://${card.webLink}`;
                            return new URL(fullUrl).hostname;
                          } catch (error) {
                            return card.webLink;
                          }
                        })()}
                      </a>
                    )}
                  </div>
                </div>
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>

          {/* Resource Details */}
          <div className="grid grid-cols-3 gap-8 mb-8">
            <div className="col-span-1">
              <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                {card.image ? (
                  <Image
                    src={card.image}
                    alt={card.title}
                    width={500}
                    height={300}
                    className="w-full h-full object-cover"
                    unoptimized
                    onError={(e) => {
                      const parentDiv = e.target.closest('.w-full.h-48');
                      if (parentDiv) {
                        e.target.style.display = 'none';
                        const initialDiv = document.createElement('div');
                        initialDiv.className =
                          'w-full h-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold';
                        initialDiv.textContent = card.title
                          .charAt(0)
                          .toUpperCase();
                        parentDiv.innerHTML = '';
                        parentDiv.appendChild(initialDiv);
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                    {card.title.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
            <div className="col-span-2">
              <p className="text-gray-600 mb-4">
                {card.description}
                <div className="text-gray-800 text-md pt-4">
                  Year: {new Date(card.publishedAt).getFullYear()}
                </div>
              </p>
              <p className="text-green-600">{card.focusRegions.join(',')}</p>
            </div>
          </div>

          {/* Associated Content */}
          <div>
            <h3 className="text-lg font-semibold text-green-600 mb-4">
              ASSOCIATED CONTENT
            </h3>
            {relatedLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            ) : relatedError ? (
              <div className="text-red-600 text-center py-8">
                Failed to load related resources
              </div>
            ) : relatedKnowledgeHubs.length === 0 ? (
              <div className="text-gray-600 text-center py-8">
                No related resources found
              </div>
            ) : (
              <>
                <div className="grid grid-cols-4 gap-4">
                  {getCurrentSlideResources().map((resource, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="text-green-600 text-xs font-semibold mb-2">
                        {resource.type}
                      </div>
                      <h4 className="font-medium mb-2 text-black text-sm line-clamp-2">
                        {resource.title}
                      </h4>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {resource.description}
                      </p>
                    </div>
                  ))}
                </div>
                {relatedKnowledgeHubs.length > 4 && (
                  <div className="flex justify-center mt-4 gap-2 items-center">
                    <button
                      onClick={handlePrevSlide}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      ←
                    </button>
                    {Array.from({
                      length: Math.ceil(relatedKnowledgeHubs.length / 4),
                    }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          currentSlide === index ? 'bg-gray-800' : 'bg-gray-300'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                    <button
                      onClick={handleNextSlide}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
