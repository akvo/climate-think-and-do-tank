import Link from 'next/link';
import Image from 'next/image';
import { Linkedin, Github, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#2B2B2B] text-white rounded-t-lg">
      <div className="max-w-7xl mx-auto px-8 py-16">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          {/* Logo */}
          <div className="md:col-span-3">
            <Link href="/" className="inline-block">
              <span className="text-xl font-bold">
                THINK <span className="text-green-500">&</span> DO TANK
              </span>
            </Link>
          </div>

          {/* About */}
          <div className="md:col-span-3">
            <h3 className="text-lg font-medium mb-4">About</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/approach"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Our Approach
                </Link>
              </li>
              <li>
                <Link
                  href="/vision"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Our vision and mission
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3">
            <h3 className="text-lg font-medium mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/social-accountability"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Social Accountability
                </Link>
              </li>
              <li>
                <Link
                  href="/news"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  News & Events
                </Link>
              </li>
            </ul>
          </div>

          {/* General */}
          <div className="md:col-span-3">
            <h3 className="text-lg font-medium mb-4">General</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/terms"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Terms of service
                </Link>
              </li>
              <li>
                <Link
                  href="/policies"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Policies and legal documents
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/contact-us"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Contact us
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Our blog
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center pt-8 border-t border-gray-700">
          <div className="mb-6 md:mb-0">
            <p className="text-gray-300 mb-2">
              We apply the principles of open source software, open content and
              open data to all of our work.
            </p>
            <Link
              href="/why-how"
              className="text-white hover:text-gray-300 transition-colors border-b border-white pb-0.5"
            >
              Find out why and how
            </Link>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4">
              <Link
                href="https://linkedin.com"
                className="text-gray-300 hover:text-white transition-colors"
              >
                <Linkedin size={24} />
              </Link>
              <Link
                href="https://github.com"
                className="text-gray-300 hover:text-white transition-colors"
              >
                <Github size={24} />
              </Link>
              <Link
                href="https://twitter.com"
                className="text-gray-300 hover:text-white transition-colors"
              >
                <Twitter size={24} />
              </Link>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-300">
              Powered by
              <Image
                src="/placeholder.svg?height=24&width=60"
                alt="Akvo"
                width={60}
                height={24}
                className="brightness-0 invert"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
