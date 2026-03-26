import React from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
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
    <div className="min-h-screen bg-[#fafafa] text-black">
      {/* Profile Header */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 py-8">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-gray-100 flex-shrink-0">
              <Image
                src={
                  user?.profile_image && user?.profile_image.url
                    ? getImageUrl(user?.profile_image)
                    : ''
                }
                alt={user?.full_name}
                className="object-cover w-full h-full"
                unoptimized
                width={96}
                height={96}
                onError={(e) => {
                  const fallbackEl = document.createElement('div');
                  fallbackEl.className =
                    'w-full h-full bg-primary-500 flex items-center justify-center text-white font-bold text-4xl';
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
              <h1 className="text-2xl sm:text-3xl font-bold">
                {user?.full_name}
              </h1>
              <p className="text-gray-500 text-sm sm:text-base mt-1">
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-5xl mx-auto px-6 sm:px-8">
          <div className="flex gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-5 py-3 text-sm font-semibold rounded-t-lg transition-colors
                  ${
                    item.isActive
                      ? 'border-b-2 border-primary-500 text-primary-500'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="max-w-5xl mx-auto px-6 sm:px-8 py-8">{children}</div>
    </div>
  );
};

export default ProfileLayout;
