import { useState } from 'react';
import { logout } from '@/store/slices/authSlice';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { ChevronDown, ChevronUp, Menu, X } from 'lucide-react';
import { getImageUrl } from '@/helpers/utilities';

const menuItems = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  {
    label: 'Invest',
    dropdown: [
      { label: 'Social Accountability', path: '/social-accountability' },
      { label: 'Investment Opportunities', path: '/investment-profiles' },
    ],
  },
  { label: 'Connect', path: '/stakeholder-directory' },
  { label: 'Knowledge Hub', path: '/knowledge-hub' },
  {
    label: 'More',
    dropdown: [{ label: 'News and Events', path: '/news-events' }],
  },
];

export default function Header() {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const router = useRouter();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => pathname === path;

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  return (
    <header
      className={`border-b border-gray-200 bg-white text-black px-2 md:px-0 ${
        isAuthenticated ? 'py-2' : 'py-4'
      }`}
    >
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="relative min-w-[216px] h-[40px]">
          <Image
            src="/images/logo.png"
            alt="Logo"
            fill
            className="object-contain"
            priority
          />
        </Link>

        <div className="md:hidden">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <div
          className={`fixed top-0 right-0 h-full w-full bg-white z-50 p-6 shadow-lg transform transition-transform duration-300 ease-in-out md:hidden ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Image
                src="/images/logo.png"
                alt="Logo"
                width={216}
                height={40}
              />
            </div>
            <button onClick={() => setMobileMenuOpen(false)}>
              <X size={24} />
            </button>
          </div>
          <nav className="flex flex-col gap-2">
            {menuItems.map((item, idx) => (
              <div key={idx} className="relative">
                {!item.dropdown ? (
                  <Link
                    href={item.path}
                    className="block text-center border-b border-gray-100 py-2 font-semibold text-gray-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <div className="rounded-lg border px-4 py-3">
                    <p className="text-center font-semibold text-gray-700 mb-2">
                      {item.label}
                    </p>
                    <div className="flex flex-col gap-2">
                      {item.dropdown.map((sub) => (
                        <Link
                          key={sub.path}
                          href={sub.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className="text-center text-gray-700 font-medium"
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            <div className="mt-6 flex flex-col gap-2">
              <Link
                href="/contact-us"
                className="bg-primary-500 text-white text-center py-3 rounded-full font-bold"
              >
                Get in Touch
              </Link>
              <Link
                href="/signup"
                className="border-2 border-black text-black text-center py-3 rounded-full font-bold"
              >
                Sign up
              </Link>
              <Link
                href="/login"
                className="text-center py-2 font-semibold text-black"
              >
                Log in
              </Link>
            </div>
          </nav>
        </div>

        <nav className="hidden md:flex items-center gap-2">
          {menuItems.map((item, idx) => (
            <div key={idx} className="relative">
              {!item.dropdown ? (
                <Link
                  href={item.path}
                  className={`px-4 py-6 text-md font-bold relative group ${
                    isActive(item.path)
                      ? 'text-black bg-primary-50'
                      : 'hover:text-zinc-600'
                  }`}
                >
                  {item.label}
                  <div
                    className={`absolute bottom-0 left-0 right-0 h-1 bg-primary-500 transition-opacity ${
                      isActive(item.path)
                        ? 'opacity-100'
                        : 'opacity-0 group-hover:opacity-50'
                    }`}
                  />
                </Link>
              ) : (
                <>
                  <button
                    onClick={() =>
                      setMoreDropdownOpen((prev) =>
                        prev === item.label ? null : item.label
                      )
                    }
                    className="flex items-center px-4 py-2 text-md font-bold text-black hover:text-zinc-600"
                  >
                    {item.label}
                    {moreDropdownOpen === item.label ? (
                      <ChevronUp className="ml-1 w-4 h-4" />
                    ) : (
                      <ChevronDown className="ml-1 w-4 h-4" />
                    )}
                  </button>
                  {moreDropdownOpen === item.label && (
                    <div className="absolute left-0 mt-1 w-48 bg-white shadow-lg rounded-md z-50 overflow-hidden">
                      {item.dropdown.map((sub) => (
                        <Link
                          key={sub.path}
                          href={sub.path}
                          onClick={() => setMoreDropdownOpen(null)}
                          className={`block px-4 py-2 text-sm font-medium ${
                            isActive(sub.path)
                              ? 'bg-primary-50 text-black'
                              : 'text-black hover:bg-primary-50'
                          }`}
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}

          <div className="ml-6 flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded-full text-black"
                  >
                    <span className="font-semibold">
                      {user?.full_name || 'User'}
                    </span>
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      {user?.profile_image?.url ? (
                        <Image
                          src={getImageUrl(user.profile_image)}
                          alt={user?.full_name || 'User'}
                          width={40}
                          height={40}
                          className="object-cover w-full h-full"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white font-bold">
                          {(user?.full_name || 'U')[0].toUpperCase()}
                        </div>
                      )}
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
                            onClick={() => setDropdownOpen(false)}
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
                <Link
                  href="/contact-us"
                  className="text-sm font-semibold text-white bg-primary-500 px-4 py-1.5 rounded-full hover:bg-white hover:text-primary-500 border hover:border-primary-500"
                >
                  Get In Touch
                </Link>
              </div>
            ) : (
              <div className="flex gap-2 items-center">
                <Link
                  href="/login"
                  className="text-sm font-semibold text-zinc-900 hover:text-primary-500"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="text-sm font-semibold text-primary-500 border border-primary-500 px-4 py-1.5 rounded-full hover:bg-primary-500 hover:text-white"
                >
                  Sign Up
                </Link>
                <Link
                  href="/contact-us"
                  className="text-sm font-semibold text-white bg-primary-500 px-4 py-1.5 rounded-full hover:bg-white hover:text-primary-500 border hover:border-primary-500"
                >
                  Get In Touch
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
