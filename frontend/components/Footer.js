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
  <div className="md:col-span-3">
    <ParagraphMD className="mb-4">{title}</ParagraphMD>
    <ul className="space-y-3">
      {links.map((link) => (
        <li key={link.href}>
          <Link
            href={link.href}
            className="text-[#21252B] hover:text-gray-800 transition-colors font-bold"
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
        <div className="container mx-auto py-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            <div className="md:col-span-3">
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/images/logo.svg"
                  alt="Kenya Drylands Investment Hub Logo"
                  width={230}
                  height={40}
                  priority
                />
              </Link>

              <div className="flex items-center gap-2 text-sm text-black mt-8">
                Powered by
                <Image
                  src="/images/footer-logo.png"
                  alt="Akvo"
                  width={130}
                  height={40}
                  priority
                />
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

      <div className="container mx-auto py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="mb-6 md:mb-0">
            <p className="text-black mb-2">
              We apply the principles of open source software, open content and
              open data to all of our work.
            </p>
            <Link
              href="/why-how"
              className="text-black hover:text-gray-300 transition-colors border-b border-black pb-0.5"
            >
              Find out why and how
            </Link>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4">
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
                    <IconComponent className="w-6 h-6" />
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
