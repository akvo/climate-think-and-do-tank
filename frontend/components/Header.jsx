import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-zinc-900">
                THINK <span className="text-green-600">&</span> DO TANK
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-8">
            <nav className="flex space-x-8">
              <Link
                href="/stakeholder-directory"
                className="relative text-zinc-900 hover:text-zinc-600 px-3 py-4 text-sm font-medium group"
              >
                Stakeholder Directory
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-500 opacity-0 group-hover:opacity-50 transition-opacity" />
              </Link>
              <Link
                href="/knowledge-hub"
                className="relative text-zinc-900 hover:text-zinc-600 px-3 py-4 text-sm font-medium group"
              >
                Knowledge Hub
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-500 opacity-0 group-hover:opacity-50 transition-opacity" />
              </Link>
              <Link
                href="/investment-profiles"
                className="relative text-zinc-900 hover:text-zinc-600 px-3 py-4 text-sm font-medium group"
              >
                Investment Profiles
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-500 opacity-0 group-hover:opacity-50 transition-opacity" />
              </Link>
              <Link
                href="/social-accountability"
                className="relative text-zinc-900 hover:text-zinc-600 px-3 py-4 text-sm font-medium group"
              >
                Social Accountability
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-500 opacity-0 group-hover:opacity-50 transition-opacity" />
              </Link>
            </nav>

            {/* User Profile */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-zinc-900">
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
