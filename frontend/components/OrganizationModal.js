import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  X,
  Download,
  Link as LinkIcon,
  ExternalLink,
  FileText,
} from 'lucide-react';
import Image from 'next/image';
import { fetchRelatedKnowledgeHubs } from '@/store/slices/knowledgeHubSlice';
import { useModal } from '@/hooks/useModal';

export default function KnowledgeHubModal({
  isOpen,
  onClose,
  card,
  onCardClick,
}) {
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

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      ref={overlayRef}
    >
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex justify-between items-centre mb-4 border-b pb-4">
            <div className="flex items-center gap-4">
              <div className="bg-primary-50 px-3 py-1 rounded-full text-sm font-medium text-primary-500 flex items-center gap-1">
                {card.file ? (
                  <FileText className="w-4 h-4" />
                ) : card.webLink ? (
                  <ExternalLink className="w-4 h-4" />
                ) : null}
                {card.file
                  ? 'Document'
                  : card.webLink
                  ? 'Link'
                  : card.type || 'Resource'}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 border rounded-full transition-colors"
              aria-label="Close modal"
              type="button"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex justify-between items-center mb-8 border-b pb-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-1 text-primary-500">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="font-medium">
                  {card.focusRegions?.join(', ') || 'Location'}
                </span>
              </div>
              <div className="flex items-center gap-1 text-gray-600">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>{new Date(card.publishedAt).getFullYear()}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full text-gray-600 hover:bg-gray-100 transition-colors">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                  />
                </svg>
                Share
              </button>
              {card.file && (
                <a
                  href={card.file}
                  download
                  className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors"
                >
                  <Download size={16} />
                  Download
                </a>
              )}
              {card.webLink && (
                <a
                  href={(() => {
                    return card.webLink.includes('://')
                      ? card.webLink
                      : `https://${card.webLink}`;
                  })()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors"
                >
                  <LinkIcon size={16} />
                  Open Link
                </a>
              )}
            </div>
          </div>

          <div className="w-full h-80 bg-gray-200 rounded-2xl mb-8 overflow-hidden">
            {card.image ? (
              <Image
                src={card.image || '/placeholder.svg'}
                alt={card.title}
                width={800}
                height={320}
                className="w-full h-full object-cover"
                unoptimized
                onError={(e) => {
                  const parentDiv = e.target.closest('.w-full.h-80');
                  if (parentDiv) {
                    e.target.style.display = 'none';
                    const initialDiv = document.createElement('div');
                    initialDiv.className =
                      'w-full h-full bg-primary-500 flex items-center justify-center text-white text-4xl font-bold';
                    initialDiv.textContent = card.title.charAt(0).toUpperCase();
                    parentDiv.innerHTML = '';
                    parentDiv.appendChild(initialDiv);
                  }
                }}
              />
            ) : (
              <div className="w-full h-full bg-primary-500 flex items-center justify-center text-white text-4xl font-bold">
                {card.title.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-6 leading-tight">
            {card.title}
          </h1>

          <div className="text-gray-600 mb-8 leading-relaxed">
            {card.description}
          </div>

          <div className="mb-8">
            <div className="text-gray-500 text-sm mb-3">
              Theme/Sector in this document:
            </div>
            <div className="flex gap-2 flex-wrap">
              {card.thematicFocus?.map((theme, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-primary-50 text-primary-500 text-sm rounded-full border border-primary-100"
                >
                  {theme}
                </span>
              )) || (
                <>
                  <span className="px-3 py-1 bg-primary-50 text-primary-500 text-sm rounded-full border border-primary-100">
                    Agriculture
                  </span>
                  <span className="px-3 py-1 bg-primary-50 text-primary-500 text-sm rounded-full border border-primary-100">
                    Agriculture
                  </span>
                </>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-primary-500 mb-4">
              ASSOCIATED CONTENT
            </h3>
            {relatedLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
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
                      className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer border border-gray-100"
                      onClick={() => {
                        onCardClick(resource);
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label={`Open ${resource.title}`}
                    >
                      <div className="text-primary-500 text-xs font-semibold mb-2">
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
                          currentSlide === index
                            ? 'bg-primary-500'
                            : 'bg-gray-300'
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
