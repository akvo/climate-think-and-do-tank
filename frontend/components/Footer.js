import Link from 'next/link';
import Image from 'next/image';
import { Linkedin, Github, Twitter } from 'lucide-react';
import { FacbookIcon, LinkedinIcon, TwitterIcon } from './Icons';
import { ParagraphMD } from './Text';

const footerLinks = {
  about: {
    title: 'About',
    links: [
      { href: '/', label: 'Home' },
      { href: '/about', label: 'About us' },
      { href: '/knowledge-hub', label: 'Knowledge hub' },
      { href: '/contact-us', label: 'Contact us' },
    ],
  },
  quickLinks: {
    title: 'Quick Links',
    links: [
      { href: '/social-accountability', label: 'Social accountability' },
      { href: '/investment-profiles', label: 'Investment profiles' },
      { href: '/stakeholder-directory', label: 'Stakeholder directory' },
      { href: '/news-events', label: 'News and events' },
    ],
  },
  general: {
    title: 'General',
    links: [
      { href: '/terms', label: 'Terms of service' },
      { href: '/policies', label: 'Policies and legal documents' },
      { href: '/faq', label: 'FAQ' },
      { href: '/blog', label: 'Our blog' },
    ],
  },
};

const socialLinks = [
  {
    href: 'https://twitter.com',
    icon: TwitterIcon,
    label: 'Twitter',
  },
  {
    href: 'https://linkedin.com',
    icon: LinkedinIcon,
    label: 'LinkedIn',
  },
  {
    href: 'https://facebook.com',
    icon: FacbookIcon,
    label: 'Facebook',
  },
];

const FooterSection = ({ title, links }) => (
  <div className="col-span-6 sm:col-span-4 lg:col-span-3">
    <ParagraphMD className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold">
      {title}
    </ParagraphMD>
    <ul className="space-y-2 sm:space-y-3">
      {links.map((link) => (
        <li key={link.href}>
          <Link
            href={link.href}
            className="text-[#21252B] hover:text-gray-800 transition-colors font-bold text-sm sm:text-base"
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

export default function Footer() {
  return (
    <footer className="bg-white text-black rounded-t-lg">
      <div className="bg-gray-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="grid grid-cols-6 sm:grid-cols-12 gap-6 sm:gap-8 lg:gap-12">
            <div className="col-span-6 sm:col-span-12 lg:col-span-3">
              <Link href="/" className="inline-flex items-center gap-2">
                <Image
                  src="/images/logo.svg"
                  alt="Kenya Drylands Investment Hub Logo"
                  width={230}
                  height={40}
                  priority
                  className="w-48 sm:w-56 lg:w-60 h-auto"
                />
              </Link>

              <div className="flex items-center gap-2 text-xs sm:text-sm text-black mt-6 sm:mt-8 font-bold">
                Powered by
                <Link
                  href={'https://akvo.org'}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image
                    src="/images/footer-logo.png"
                    alt="Akvo"
                    width={130}
                    height={40}
                    priority
                    className="w-24 sm:w-28 lg:w-32 h-auto"
                  />
                </Link>
              </div>
            </div>

            {Object.entries(footerLinks).map(([key, section]) => (
              <FooterSection
                key={key}
                title={section.title}
                links={section.links}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="order-2 lg:order-1">
            <p className="text-black mb-2 text-sm sm:text-base">
              We apply the principles of open source software, open content and
              open data to all of our work.
            </p>
            <Link
              href="/why-how"
              className="text-black hover:text-gray-600 transition-colors border-b border-black pb-0.5 text-sm sm:text-base inline-block"
            >
              Find out why and how
            </Link>
          </div>

          <div className="flex items-center gap-6 sm:gap-8 order-1 lg:order-2">
            <div className="flex items-center gap-3 sm:gap-4">
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <Link
                    key={social.href}
                    href={social.href}
                    className="text-black hover:text-gray-600 transition-colors"
                    aria-label={social.label}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
