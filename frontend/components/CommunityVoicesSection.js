import { useState } from 'react';

const CommunityVoicesSection = ({ voices, county }) => {
  const [page, setPage] = useState(1);
  const perPage = 6;
  const pageCount = Math.ceil(voices?.length / perPage);
  const voicesToShow = voices?.slice((page - 1) * perPage, page * perPage);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {voicesToShow.map((voice, idx) => (
          <div key={idx} className="bg-[#FAFAFA] rounded-xl p-6 shadow-sm">
            <div className="font-bold mb-2">{voice.title}</div>
            <div className="text-gray-700 mb-4">{voice.description}</div>
            <div className="text-gray-500 text-right">
              {voice.voice_description}
            </div>
            <div className="text-gray-500 text-right">
              {voice.ward} - {county}
            </div>
          </div>
        ))}
      </div>
      {pageCount > 1 && (
        <div className="flex justify-center mt-4 gap-2">
          {[...Array(pageCount)].map((_, i) => (
            <button
              key={i}
              className={`px-3 py-1 rounded-full ${
                page === i + 1
                  ? 'bg-[#0DA2D7] text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommunityVoicesSection;
