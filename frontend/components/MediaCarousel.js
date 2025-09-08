import { useState, useEffect } from 'react';
import { env } from '@/helpers/env-vars';

const OtherMediaCarousel = ({ media }) => {
  const [start, setStart] = useState(0);

  const flattenFiles = (media || [])
    .map((mediaItem) =>
      (mediaItem.files || []).map((file) => ({
        ...file,
        parentId: mediaItem.id,
      }))
    )
    .flat();

  const getFileUrl = (file) =>
    file.url.startsWith('http')
      ? file.url
      : `${env('NEXT_PUBLIC_BACKEND_URL')}${file.url}`;

  const visibleFiles = flattenFiles.slice(start, start + 3);

  const canPrev = start > 0;
  const canNext = start + 3 < flattenFiles.length;

  useEffect(() => {
    if (start + 3 > flattenFiles.length && flattenFiles.length > 0) {
      setStart(Math.max(flattenFiles.length - 3, 0));
    }
  }, [flattenFiles.length]);

  return (
    <div className="relative w-full">
      <div className="flex justify-end mb-2 gap-2">
        <button
          onClick={() => setStart((s) => Math.max(s - 3, 0))}
          disabled={!canPrev}
          className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-40"
        >
          &#8592;
        </button>
        <button
          onClick={() =>
            setStart((s) => Math.min(s + 3, flattenFiles.length - 3))
          }
          disabled={!canNext}
          className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-40"
        >
          &#8594;
        </button>
      </div>
      <div className="flex gap-6">
        {visibleFiles.map((file) => (
          <div
            key={file.parentId}
            className="w-1/3 bg-gray-100 rounded-lg p-4 shadow flex flex-col items-center"
          >
            <video
              controls
              className="w-full h-48 rounded mb-2 bg-black"
              src={getFileUrl(file)}
            />
            <div className="text-sm text-gray-800 truncate w-full text-center">
              {file.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OtherMediaCarousel;
