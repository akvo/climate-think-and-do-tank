import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { env } from '@/helpers/env-vars';
import { getImageUrl } from '@/helpers/utilities';

const ProfileLayout = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  const router = useRouter();

  const navItems = [
    {
      href: '/profile/details',
      label: 'Profile Details',
      isActive: router.pathname === '/profile/details',
    },
    {
      href: '/profile/connections',
      label: 'Connections',
      isActive: router.pathname === '/profile/connections',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-black">
      <div className="container mx-auto bg-white shadow-md rounded-lg">
        {/* Profile Header */}
        <div className="flex items-center p-6 border-b">
          <div className="w-24 h-24 rounded-full overflow-hidden mr-6">
            <Image
              src={
                user?.profile_image && user?.profile_image.url
                  ? getImageUrl(user?.profile_image)
                  : ''
              }
              alt={user?.full_name}
              className="object-cover relative w-[100%] h-[100%]"
              unoptimized
              width={96}
              height={96}
              onError={(e) => {
                const fallbackEl = document.createElement('div');
                fallbackEl.className =
                  'w-full h-full bg-blue-500 flex items-center justify-center text-white font-bold text-6xl rounded-full';
                fallbackEl.textContent = (user?.full_name || 'U')
                  .charAt(0)
                  .toUpperCase();

                const parentNode = e.target.parentNode;
                if (parentNode) {
                  e.target.style.display = 'none';
                  parentNode.appendChild(fallbackEl);
                }
              }}
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user?.full_name}</h1>
            <p className="text-gray-600">{user?.email}</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex border-b">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-3 text-sm font-medium 
                hover:bg-gray-100 
                border-b-2 
                ${
                  item.isActive
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-600'
                }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Page Content */}
        <div>{children}</div>
      </div>
    </div>
  );
};

export default ProfileLayout;
