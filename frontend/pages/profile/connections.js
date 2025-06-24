import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import ProfileNavigation from '@/components/ProfileNavigation';
import withAuth from '@/components/withAuth';

import ProfileLayout from '@/components/ProfileLayout';
import { getCookie } from 'cookies-next';
import axios from 'axios';
import { env } from '@/helpers/env-vars';
import Image from 'next/image';
import { StakeholderModal } from '../stakeholder-directory';
import { useRouter } from 'next/router';

const MyConnections = () => {
  const router = useRouter();
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStakeholder, setSelectedStakeholder] = useState(null);

  const loadConnections = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      const receiverResponse = await axios.get(
        `${env('NEXT_PUBLIC_BACKEND_URL')}/api/stakeholder-connections`,
        {
          params: {
            filters: {
              receiver: user.id,
            },
            populate: [
              'requester',
              'requester.profile_image',
              'requester.topics',
              'receiver',
              'receiver.profile_image',
            ],
          },
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const requesterResponse = await axios.get(
        `${env('NEXT_PUBLIC_BACKEND_URL')}/api/stakeholder-connections`,
        {
          params: {
            filters: {
              requester: user.id,
            },
            populate: [
              'requester',
              'requester.profile_image',
              'requester.topics',
              'receiver',
              'receiver.profile_image',
              'receiver.topics',
            ],
          },
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const receivedConnections = receiverResponse.data.data.map(
        (connection) => ({
          id: connection.id,
          connection_status: connection.connection_status,
          documentId: connection.documentId,
          requester: connection.requester,
          receiver: connection.receiver,
          requesterDetails: connection.requester,
          isReceived: true,
        })
      );

      const sentConnections = requesterResponse.data.data.map((connection) => ({
        id: connection.id,
        connection_status: connection.connection_status,
        documentId: connection.documentId,
        requester: connection.requester,
        receiver: connection.receiver,
        requesterDetails: connection.receiver,
        isReceived: false,
      }));

      const allConnections = [...receivedConnections, ...sentConnections];

      setConnections({
        all: allConnections,
        accepted: allConnections.filter(
          (connection) => connection.connection_status === 'Accepted'
        ),
        pending: allConnections.filter(
          (connection) => connection.connection_status === 'Pending'
        ),
        rejected: allConnections.filter(
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

    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
          <p className="text-gray-600">Loading connections...</p>
        </div>
      );
    }

    if (filteredConnections.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          {activeTab === 'pending' ? (
            <>
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-500"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                No pending requests
              </h3>
              <p className="text-gray-500 text-center max-w-sm">
                You don't have any pending connection requests at the moment.
              </p>
            </>
          ) : activeTab === 'accepted' ? (
            <>
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-500"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                No connections yet
              </h3>
              <p className="text-gray-500 text-center max-w-sm">
                You haven't accepted any connection requests yet. Start building
                your network!
              </p>
            </>
          ) : activeTab === 'rejected' ? (
            <>
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-500"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                No rejected requests
              </h3>
              <p className="text-gray-500 text-center max-w-sm">
                You don't have any rejected connection requests.
              </p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-500"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                No connections
              </h3>
              <p className="text-gray-500 text-center max-w-sm">
                You don't have any connections yet. Connect with other
                stakeholders to expand your network.
              </p>
            </>
          )}
        </div>
      );
    }

    return filteredConnections.map((connection) => {
      const userData = connection.isReceived
        ? connection.requester
        : connection.receiver;
      const profileImage = userData?.profile_image;

      return (
        <div
          key={connection.id}
          className="flex items-center justify-between p-4 border-b hover:bg-gray-50 cursor-pointer"
          onClick={() => {
            console.log('clicked', connection);
            const enhancedStakeholder = {
              ...userData,
              location: userData.country,
              focusRegions: userData.focusRegions,
              organization: userData.organization,
              profession: userData.stakeholder_role,
              valueChains: userData.topics?.map((topic) => topic.name) || [],
              linkedin: userData.linkedin,
              email: userData.email,
              image: userData.profile_image,
              name: userData.full_name,
              type: 'Individual',
            };
            setSelectedStakeholder(enhancedStakeholder);
            setIsModalOpen(true);
          }}
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
              {profileImage?.url ? (
                <Image
                  src={`${env('NEXT_PUBLIC_BACKEND_URL')}${profileImage.url}`}
                  alt={userData?.full_name}
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-semibold text-lg">
                  {userData?.full_name
                    ? userData?.full_name?.charAt(0).toUpperCase()
                    : '?'}
                </div>
              )}
            </div>
            <div>
              <h3 className="font-semibold">{userData?.full_name}</h3>
              <p className="text-sm text-gray-500">
                {userData?.stakeholder_role}
              </p>
              <p className="text-xs text-gray-400">
                {connection.isReceived ? 'Received' : 'Sent'}
              </p>
            </div>
          </div>

          {activeTab === 'pending' && connection.isReceived && (
            <div className="space-x-2">
              <button
                className="px-4 py-2 text-md text-black rounded-[50px] border border-white hover:border-zinc-950"
                onClick={(e) => {
                  e.stopPropagation();
                  handleIgnoreRequest(connection.documentId);
                }}
              >
                Ignore
              </button>
              <button
                className="px-6 py-2 text-md text-black rounded-[50px] border hover:bg-green-500 hover:text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAcceptRequest(connection.documentId);
                }}
              >
                Accept
              </button>
            </div>
          )}

          {activeTab === 'pending' && !connection.isReceived && (
            <div className="text-sm text-gray-500">Waiting for response</div>
          )}

          <StakeholderModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            stakeholder={selectedStakeholder}
            router={router}
          />
        </div>
      );
    });
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
