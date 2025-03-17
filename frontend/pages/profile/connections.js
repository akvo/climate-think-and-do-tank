import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import ProfileNavigation from '@/components/ProfileNavigation';
import withAuth from '@/components/withAuth';

import ProfileLayout from '@/components/ProfileLayout';
import { getCookie } from 'cookies-next';
import axios from 'axios';
import { env } from '@/helpers/env-vars';

const MyConnections = () => {
  const { user } = useSelector((state) => state.auth);
  const [connections, setConnections] = useState({
    all: [],
    accepted: [],
    pending: [],
    rejected: [],
  });
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const token = getCookie('token');

  const loadConnections = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const response = await axios.get(
        `${env('NEXT_PUBLIC_BACKEND_URL')}/api/stakeholder-connections`,
        {
          params: {
            filters: {
              receiver: user.id,
            },
            populate: ['requester', 'receiver'],
          },
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const receivedConnections = response.data.data.map((connection) => ({
        id: connection.id,
        connection_status: connection.connection_status,
        documentId: connection.documentId,
        requester: connection.requester,
        receiver: connection.receiver,
        requesterDetails: connection.requester,
      }));

      setConnections({
        all: receivedConnections,
        accepted: receivedConnections.filter(
          (connection) => connection.connection_status === 'Accepted'
        ),
        pending: receivedConnections.filter(
          (connection) => connection.connection_status === 'Pending'
        ),
        rejected: receivedConnections.filter(
          (connection) => connection.connection_status === 'Rejected'
        ),
      });
    } catch (error) {
      console.error('Failed to load connections', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConnections();
  }, [user]);

  const handleIgnoreRequest = async (connectionId) => {
    try {
      await axios.put(
        `${env(
          'NEXT_PUBLIC_BACKEND_URL'
        )}/api/stakeholder-connections/${connectionId}`,
        {
          data: {
            connection_status: 'Rejected',
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      loadConnections();
    } catch (error) {
      console.error('Failed to ignore request', error);
    }
  };

  const handleAcceptRequest = async (connectionId) => {
    try {
      await axios.put(
        `${env(
          'NEXT_PUBLIC_BACKEND_URL'
        )}/api/stakeholder-connections/${connectionId}`,
        {
          data: {
            connection_status: 'Accepted',
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setActiveTab('Accepted'.toLowerCase());
      loadConnections();
    } catch (error) {
      console.error('Failed to accept request', error);
    }
  };

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
            <h3 className="font-semibold">{connection.requester?.full_name}</h3>
            <p className="text-sm text-gray-500">
              {connection.requester?.stakeholder_role ||
                connection.receiver?.stakeholder_role}
            </p>
          </div>
        </div>
        {activeTab === 'pending' && (
          <div className="space-x-2">
            <button
              className="px-4 py-2 text-md text-black rounded-[50px] border border-white hover:border-zinc-950"
              onClick={() => handleIgnoreRequest(connection.documentId)}
            >
              Ignore
            </button>
            <button
              className="px-6 py-2 text-md text-black rounded-[50px] border hover:bg-green-500 hover:text-white"
              onClick={() => handleAcceptRequest(connection.documentId)}
            >
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
