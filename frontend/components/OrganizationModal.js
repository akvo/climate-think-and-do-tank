import React from 'react';
import {
  X,
  Download,
  Link as LinkIcon,
  ExternalLink,
  FileText,
} from 'lucide-react';
import Image from 'next/image';
import { useModal } from '@/hooks/useModal';

export default function KnowledgeHubModal({ isOpen, onClose, card }) {
  const overlayRef = useModal(isOpen, onClose);

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
                  {card.focusRegions?.join(', ') || 'No Region'}
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
                <span>
                  {card.publishedAt
                    ? new Date(card.publishedAt).getFullYear()
                    : 'No Date'}
                </span>
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
                src={card.image}
                alt={card.title}
                width={800}
                height={320}
                className="w-full h-full object-cover"
                unoptimized
                onError={(e) => {
                  e.target.src = '/images/placeholder.jpg';
                }}
              />
            ) : (
              <Image
                src="/images/placeholder.jpg"
                alt={card.title}
                width={800}
                height={320}
                className="w-full h-full object-cover"
                unoptimized
              />
            )}
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-6 leading-tight">
            {card.title}
          </h1>

          <div className="text-gray-600 mb-8 leading-relaxed">
            {card.description}
          </div>

          {card.topic && (
            <div className="mb-8">
              <div className="text-gray-500 text-sm mb-3">
                Theme/Sector in this document:
              </div>
              <div className="flex gap-2 flex-wrap">
                <span className="px-3 py-1 bg-primary-50 text-primary-500 text-sm rounded-full border border-primary-100">
                  {card.topic}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
