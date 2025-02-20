import { useState } from 'react';
import { Lightbulb, Search } from 'lucide-react';
import KenyaMap from '@/components/KenyaMap';

export default function StakeholderMap() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCounty, setSelectedCounty] = useState(null);
  const [activeTab, setActiveTab] = useState('highlighted');

  const communityVoices = [
    {
      region: 'Turkana',
      title: 'Cold storage facilities',
      quote:
        '"As a fisherman in Kalokol, we lose almost half of our catch because there are no proper storage facilities. If we had cold storage units, we could store the fish longer, sell it at better prices, and even explore markets outside Turkana. This would change our lives and attract young people to fishing."',
    },
    {
      region: 'Marsabit',
      title: 'Slaughterhouses and fish feed manufacturing',
      quote:
        '"Our animals are our wealth, but we sell them at low prices because there is no way to add value here. A modern slaughterhouse would allow us to sell meat directly instead of just live animals. The fish farmers would also benefit if they had access to affordable feed."',
    },
    {
      region: 'Isiolo',
      title: 'Veterinary clinics and feed processing plants',
      quote:
        '"Diseases often kill our animals because we don\'t have regular veterinary services. With a mobile veterinary clinic, we could keep our animals healthy and productive. This would attract investors to the livestock sector because healthy animals mean better quality products."',
    },
    {
      region: 'Samburu',
      title: 'Livestock auction markets and digital platforms',
      quote:
        '"As a fisherman in Kalokol, we lose almost half of our catch because there are no proper storage facilities. If we had cold storage units, we could store the fish longer, sell it at better prices, and even explore markets outside Turkana. This would change our lives and attract young people to fishing."',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Search and Filters */}
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="mb-6">
            <div className="relative max-w-3xl mx-auto">
              <input
                type="text"
                placeholder="Try keywords like: 'tilapia' or 'horticulture'"
                className="w-full px-4 py-2 pr-10 border border-gray-200 rounded-md"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search
                className="absolute right-3 top-2.5 text-gray-400"
                size={20}
              />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex gap-6">
              <button className="text-gray-700 hover:text-gray-900 flex items-center gap-1">
                Value Chain
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
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <button className="text-gray-700 hover:text-gray-900 flex items-center gap-1">
                Focus Regions
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
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <button className="text-gray-700 hover:text-gray-900 flex items-center gap-1">
                Organizations
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
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>
            <button className="text-green-600 hover:text-green-700">
              Clear filters
            </button>
          </div>
        </div>
      </div>

      {/* Map and Info Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Map */}
          <div className="relative">
            <KenyaMap
              onSelectCounty={setSelectedCounty}
              selectedCounty={selectedCounty}
            />
          </div>

          {/* County Information */}
          <div className="space-y-6">
            {/* Title */}
            <div className="bg-[#f7f7f7] py-6 px-8 rounded-lg">
              <h2 className="text-3xl font-bold text-zinc-900">
                ASAL Counties
              </h2>
            </div>

            {/* Priorities Section */}
            <div className="bg-[#f7f7f7] p-8 rounded-lg">
              <div>
                <h3 className="text-xl font-bold text-zinc-900 mb-4">
                  Identified Community Top 3 Priorities
                </h3>
                <div className="bg-white rounded-2xl p-6 min-h-[100px] flex items-center">
                  <p className="text-gray-600 text-lg">
                    Select a county to find out more..
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-xl font-bold text-green-600 mb-4">
                  Investment Opportunity
                </h3>
                <div className="bg-[#ebffee] rounded-2xl p-6 min-h-[100px] flex items-center justify-between">
                  <p className="text-gray-600 text-lg">
                    Select a county to find out more..
                  </p>
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                    <Lightbulb className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-xl font-bold text-zinc-900 mb-4">
                  Potential Impact / Benefit
                </h3>
                <div className="bg-white rounded-2xl p-6 min-h-[100px] flex items-center">
                  <p className="text-gray-600 text-lg">
                    Select a county to find out more..
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Community Voices Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="border-b mb-8">
          <div className="flex gap-8">
            <button
              className={`pb-4 relative ${
                activeTab === 'highlighted' ? 'text-green-600' : 'text-gray-600'
              }`}
              onClick={() => setActiveTab('highlighted')}
            >
              Highlighted Community Voices
              {activeTab === 'highlighted' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600" />
              )}
            </button>
            <button
              className={`pb-4 relative ${
                activeTab === 'other' ? 'text-green-600' : 'text-gray-600'
              }`}
              onClick={() => setActiveTab('other')}
            >
              Other Media
              {activeTab === 'other' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600" />
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {communityVoices.map((voice, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg border border-gray-100"
            >
              <h3 className="font-bold mb-2">
                {voice.region}: {voice.title}
              </h3>
              <p className="text-gray-600 text-sm">{voice.quote}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
