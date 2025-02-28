import { useState } from 'react';
import Image from 'next/image';

export default function ConnectionsPage() {
  const [activeTab, setActiveTab] = useState('all');

  const connectionRequests = [
    {
      id: '1',
      name: 'Michael Johnson',
      role: 'Environmentalist',
      avatar: 'https://placehold.co/400x400',
      mutualConnections: 'Kevin Ochieng and 1 other mutual connection',
    },
    {
      id: '2',
      name: 'Samantha Joyce',
      role: 'Environmentalist',
      avatar: 'https://placehold.co/400x400',
      mutualConnections: 'Kevin Ochieng and 1 other mutual connection',
    },
    {
      id: '3',
      name: 'Oliver Ellis',
      role: 'Environmentalist',
      avatar: 'https://placehold.co/400x400',
      mutualConnections: 'Kevin Ochieng and 1 other mutual connection',
    },
    {
      id: '4',
      name: 'Diana Xavier',
      role: 'Environmentalist',
      avatar: 'https://placehold.co/400x400',
      mutualConnections: 'Kevin Ochieng and 1 other mutual connection',
    },
  ];

  const handleAccept = (id) => {
    // Handle accept logic
    console.log('Accepted:', id);
  };

  const handleIgnore = (id) => {
    // Handle ignore logic
    console.log('Ignored:', id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-black">
      <h1 className="text-2xl font-bold mb-6">My Connections</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-8">
          {['all', 'accepted', 'rejected'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 relative capitalize ${
                activeTab === tab
                  ? 'text-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600" />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Connection Requests */}
      <div className="space-y-4">
        <h2 className="text-sm font-medium text-gray-500">Latest reqests</h2>

        <div className="space-y-4">
          {connectionRequests.map((request) => (
            <div
              key={request.id}
              className="p-4 bg-white rounded-lg border-b pb-8 border-gray-100 flex items-center justify-between hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12">
                  <Image
                    src={request.avatar || '/placeholder.svg'}
                    alt={request.name}
                    fill
                    className="rounded-full object-cover"
                    unoptimized
                  />
                </div>
                <div>
                  <h3 className="font-medium">{request.name}</h3>
                  <p className="text-gray-600 text-sm">{request.role}</p>
                  <p className="text-gray-600 text-sm">
                    {request.mutualConnections}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleIgnore(request.id)}
                  className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
                >
                  Ignore
                </button>
                <button
                  onClick={() => handleAccept(request.id)}
                  className="px-4 py-2 text-sm border border-zinc-900 rounded-full hover:bg-gray-50"
                >
                  Accept
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
