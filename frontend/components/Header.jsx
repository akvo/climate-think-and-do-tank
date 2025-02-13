import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  const isActive = (path) => pathname === path;

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-500 rounded-lg" />
              <div className="text-zinc-900">
                <div className="text-sm font-bold leading-none">
                  Kenya Drylands
                </div>
                <div className="text-xs">Investment Hub.</div>
              </div>
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
            <div className="flex items-center gap-3">
              <Link
                href="/signin"
                className="px-6 py-2 text-sm font-medium text-zinc-900 border border-zinc-200 rounded-full hover:bg-gray-50 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="px-6 py-2 text-sm font-medium text-white bg-black rounded-full hover:bg-zinc-800 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
