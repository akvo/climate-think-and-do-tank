import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto ">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-black">
                THINK <span className="text-green-600">&</span> DO TANK
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-8">
            <nav className="hidden md:flex space-x-8">
              <Link
                href="/stakeholder-directory"
                className="text-gray-900 hover:text-gray-600 px-3 py-2 text-sm font-medium"
              >
                Stakeholder Directory
              </Link>
              <Link
                href="/knowledge-hub"
                className="text-gray-900 hover:text-gray-600 px-3 py-2 text-sm font-medium border-b-2 border-green-500"
              >
                Knowledge Hub
              </Link>
            </nav>

            {/* User Profile */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-900">
                Ouma Odhiambo
              </span>
              <div className="relative w-8 h-8 rounded-full overflow-hidden">
                <Image
                  src="https://placehold.co/40x40"
                  alt="Profile picture"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
