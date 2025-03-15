import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import ProfileNavigation from '@/components/ProfileNavigation';
import withAuth from '@/components/withAuth';

import ProfileLayout from '@/components/ProfileLayout';

const MyConnections = () => {
  const { user } = useSelector((state) => state.auth);
  const [connections, setConnections] = useState({
    all: [],
    accepted: [],
    pending: [],
    rejected: [],
  });
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const loadConnections = async () => {
      if (user) {
        const receivedRequests = user.connection_requests_received || [];
        const sentRequests = user.connection_requests_sent || [];

        const allConnections = [...receivedRequests, ...sentRequests];

        const acceptedConnections = allConnections.filter(
          (connection) => connection.connection_status === 'Accepted'
        );
        const pendingConnections = allConnections.filter(
          (connection) => connection.connection_status === 'Pending'
        );
        const rejectedConnections = allConnections.filter(
          (connection) => connection.connection_status === 'Rejected'
        );

        setConnections({
          all: allConnections,
          accepted: acceptedConnections,
          pending: pendingConnections,
          rejected: rejectedConnections,
        });
      }
    };

    loadConnections();
  }, [user]);

  console.log(user);
  const renderConnections = () => {
    const filteredConnections = connections[activeTab];

    return filteredConnections.map((connection) => (
      <div
        key={connection.id}
        className="flex items-center justify-between p-4 border-b hover:bg-gray-50"
      >
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-gray-200">
            {/* Profile Image */}
          </div>
          <div>
            <h3 className="font-semibold">
              {connection.documentId || connection.full_name}
            </h3>
            <p className="text-sm text-gray-500">
              {connection.requester?.stakeholder_role ||
                connection.receiver?.stakeholder_role}
            </p>
          </div>
        </div>
        {activeTab === 'pending' && (
          <div className="space-x-2">
            <button className="px-4 py-2 text-md text-black rounded-[50px] border border-white hover:border-zinc-950">
              Ignore
            </button>
            <button className="px-6 py-2 text-md  text-black rounded-[50px] border hover:bg-green-500 hover:text-white">
              Accept
            </button>
          </div>
        )}
      </div>
    ));
  };

  return (
    <ProfileLayout>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="container mx-auto bg-white shadow-md rounded-lg">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">My Connections</h2>

            <div className="flex border-b mb-4">
              {['All', 'Accepted', 'Pending', 'Rejected'].map((tab) => (
                <button
                  key={tab.toLowerCase()}
                  onClick={() => setActiveTab(tab.toLowerCase())}
                  className={`px-4 py-2 text-sm 
                    ${
                      activeTab === tab.toLowerCase()
                        ? 'border-b-2 border-green-500 font-semibold'
                        : 'text-gray-600'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {renderConnections()}
          </div>
        </div>
      </div>
    </ProfileLayout>
  );
};

export default withAuth(MyConnections);
