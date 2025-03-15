import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';

const ProfileNavigation = () => {
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);

  if (!user) return null;

  const navLinks = [
    { href: '/profile/details', label: 'Profile Details' },
    { href: '/profile/connections', label: 'Connections' },
  ];

  return (
    <>
      {/* Profile Header */}
      <div className="flex items-center p-6 border-b">
        <div className="w-24 h-24 rounded-full overflow-hidden mr-6">
          <img
            src={user.profile_image?.url || '/default-avatar.png'}
            alt={user.full_name}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{user.full_name}</h1>
          <p className="text-gray-600">{user.email}</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex border-b">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`px-4 py-3 text-sm font-medium 
              hover:bg-gray-100 
              border-b-2 
              ${
                router.pathname === link.href
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-600'
              }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </>
  );
};

export default ProfileNavigation;
