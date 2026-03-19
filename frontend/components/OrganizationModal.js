import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Download,
  Link as LinkIcon,
  ExternalLink,
  FileText,
  Copy,
  Check,
} from 'lucide-react';
import Image from 'next/image';
import { useModal } from '@/hooks/useModal';
import Button from './Button';

export default function KnowledgeHubModal({ isOpen, onClose, card }) {
  const overlayRef = useModal(isOpen, onClose);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareMenuRef = useRef(null);

  const getShareUrl = () => {
    if (!card) return '';
    if (card.webLink) {
      return card.webLink.includes('://') ? card.webLink : `https://${card.webLink}`;
    }
    return card.file || window.location.href;
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(e.target)) {
        setShowShareMenu(false);
      }
    };
    if (showShareMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showShareMenu]);

  useEffect(() => {
    if (!isOpen) {
      setShowShareMenu(false);
      setCopied(false);
    }
  }, [isOpen]);

  if (!isOpen || !card) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      ref={overlayRef}
    >
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="flex justify-between items-center mb-4 border-b pb-4">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="bg-primary-50 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium text-primary-500 flex items-center gap-1">
                {card.file ? (
                  <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                ) : card.webLink ? (
                  <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                ) : null}
                <span className="hidden sm:inline">
                  {card.file
                    ? 'Document'
                    : card.webLink
                    ? 'Link'
                    : card.type || 'Resource'}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1.5 sm:p-2 border rounded-full transition-colors"
              aria-label="Close modal"
              type="button"
            >
              <X size={16} className="sm:w-[18px] sm:h-[18px]" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8 border-b pb-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
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
                <span className="font-medium text-sm sm:text-base">
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
                <span className="text-sm sm:text-base">
                  {card.publishedAt
                    ? new Date(card.publishedAt).getFullYear()
                    : 'No Date'}
                </span>
              </div>
            </div>

            <div className="flex gap-2 sm:gap-3">
              <div className="relative" ref={shareMenuRef}>
                <Button
                  variant="outline"
                  onClick={() => setShowShareMenu(!showShareMenu)}
                >
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4"
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
                  <span className="hidden sm:inline pl-2">Share</span>
                </Button>

                {showShareMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    <a
                      href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(getShareUrl())}&text=${encodeURIComponent(card.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 transition-colors"
                      onClick={() => setShowShareMenu(false)}
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                      <span>X (Twitter)</span>
                    </a>
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl())}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 transition-colors"
                      onClick={() => setShowShareMenu(false)}
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#1877F2">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                      <span>Facebook</span>
                    </a>
                    <a
                      href={`https://api.whatsapp.com/send?text=${encodeURIComponent(card.title + ' ' + getShareUrl())}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 transition-colors"
                      onClick={() => setShowShareMenu(false)}
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#25D366">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      <span>WhatsApp</span>
                    </a>
                    <a
                      href={`mailto:?subject=${encodeURIComponent(card.title)}&body=${encodeURIComponent(card.title + '\n\n' + getShareUrl())}`}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 transition-colors"
                      onClick={() => setShowShareMenu(false)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>Email</span>
                    </a>
                    <div className="border-t border-gray-100 my-1" />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(getShareUrl()).then(() => {
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }).catch(() => {});
                      }}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 transition-colors w-full"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                      <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                    </button>
                  </div>
                )}
              </div>
              {card.file && (
                <a
                  href={card.file}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors text-sm sm:text-base"
                >
                  <Download size={14} className="sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Download</span>
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
                  className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors text-sm sm:text-base"
                >
                  <LinkIcon size={14} className="sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Open Link</span>
                </a>
              )}
            </div>
          </div>

          <div className="w-full h-48 sm:h-64 lg:h-80 bg-gray-200 rounded-2xl mb-6 sm:mb-8 overflow-hidden">
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

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
            {card.title}
          </h1>

          <div className="text-sm sm:text-base text-gray-800 mb-6 sm:mb-8 leading-relaxed">
            {card.description}
          </div>

          {card.topic && (
            <div className="mb-6 sm:mb-8">
              <div className="text-gray-500 text-xs sm:text-sm mb-2 sm:mb-3">
                Theme/Sector in this document:
              </div>
              <div className="flex gap-2 flex-wrap">
                <span className="px-2 sm:px-3 py-1 bg-primary-50 text-primary-500 text-xs sm:text-sm rounded-full border border-primary-100">
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
