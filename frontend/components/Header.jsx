import { useState } from 'react';
import { logout } from '@/store/slices/authSlice';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';

export default function Header() {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const router = useRouter();

  const isActive = (path) => pathname === path;
  const { isAuthenticated, loading, user } = useSelector((state) => state.auth);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const handleLogout = () => {
    dispatch(logout());
    router.push('/signin');
  };

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/images/logo.png"
                alt="Kenya Drylands Investment Hub Logo"
                width={230}
                height={40}
                priority
              />
            </Link>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-6">
            <nav className="flex space-x-6">
              <Link
                href="/stakeholder-directory"
                className={`relative text-black px-3 py-8 text-md font-bold group
                  ${
                    isActive('/stakeholder-directory')
                      ? 'text-black bg-green-50'
                      : 'hover:text-zinc-600'
                  }`}
              >
                Stakeholder Directory
                <div
                  className={`absolute inset-0 bg-green-50 transition-opacity -z-10
                  ${
                    isActive('/stakeholder-directory')
                      ? 'opacity-100'
                      : 'opacity-0 group-hover:opacity-50'
                  }`}
                />
                <div
                  className={`absolute bottom-0 left-0 right-0 h-1 bg-green-700 transition-opacity
                  ${
                    isActive('/stakeholder-directory')
                      ? 'opacity-100'
                      : 'opacity-0 group-hover:opacity-50'
                  }`}
                />
              </Link>
              <Link
                href="/knowledge-hub"
                className={`relative text-black px-3 py-8 text-md font-bold group
                  ${
                    isActive('/knowledge-hub')
                      ? 'text-black bg-green-50'
                      : 'hover:text-zinc-600'
                  }`}
              >
                Knowledge Hub
                <div
                  className={`absolute inset-0 bg-green-50 transition-opacity -z-10
                  ${
                    isActive('/knowledge-hub')
                      ? 'opacity-100'
                      : 'opacity-0 group-hover:opacity-50'
                  }`}
                />
                <div
                  className={`absolute bottom-0 left-0 right-0 h-1 bg-green-700 transition-opacity
                  ${
                    isActive('/knowledge-hub')
                      ? 'opacity-100'
                      : 'opacity-0 group-hover:opacity-50'
                  }`}
                />
              </Link>
              <Link
                href="/investment-profiles"
                className={`relative text-black px-3 py-8 text-md font-bold group
                  ${
                    isActive('/investment-profiles')
                      ? 'text-black bg-green-50'
                      : 'hover:text-zinc-600'
                  }`}
              >
                Investment Profiles
                <div
                  className={`absolute inset-0 bg-green-50 transition-opacity -z-10
                  ${
                    isActive('/investment-profiles')
                      ? 'opacity-100'
                      : 'opacity-0 group-hover:opacity-50'
                  }`}
                />
                <div
                  className={`absolute bottom-0 left-0 right-0 h-1 bg-green-700 transition-opacity
                  ${
                    isActive('/investment-profiles')
                      ? 'opacity-100'
                      : 'opacity-0 group-hover:opacity-50'
                  }`}
                />
              </Link>
              <Link
                href="/social-accountability"
                className={`relative text-black px-3 py-8 text-md font-bold group
                  ${
                    isActive('/social-accountability')
                      ? 'text-black bg-green-50'
                      : 'hover:text-zinc-600'
                  }`}
              >
                Social Accountability
                <div
                  className={`absolute inset-0 bg-green-50 transition-opacity -z-10
                  ${
                    isActive('/social-accountability')
                      ? 'opacity-100'
                      : 'opacity-0 group-hover:opacity-50'
                  }`}
                />
                <div
                  className={`absolute bottom-0 left-0 right-0 h-1 bg-green-700 transition-opacity
                  ${
                    isActive('/social-accountability')
                      ? 'opacity-100'
                      : 'opacity-0 group-hover:opacity-50'
                  }`}
                />
              </Link>
            </nav>

            {/* Auth Buttons */}

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded-full text-black"
                >
                  <span className="font-semibold">
                    {user?.full_name || 'User'}
                  </span>
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    <Image
                      src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${user?.profile_image?.url}`}
                      alt={user?.full_name || 'User'}
                      width={100}
                      height={100}
                      className="object-cover w-[100%] h-[100%]"
                      unoptimized
                    />
                  </div>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg z-50 text-black">
                    <div className="px-4 py-3 border-b">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.full_name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user?.email}
                      </p>
                    </div>
                    <ul className="py-1 px-1">
                      <li>
                        <Link
                          href="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Profile
                        </Link>
                      </li>
                      <li>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Logout
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/signin"
                  className="px-6 py-2 text-sm font-semibold text-zinc-900 border border-zinc-800 rounded-full hover:bg-green-600 hover:text-white transition-colors hover:border-transparent"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-6 py-2 text-sm font-semibold text-white border bg-green-600 rounded-full hover:bg-white hover:text-zinc-800 transition-colors hover:border-green-600 hover:border"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
