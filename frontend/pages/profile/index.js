import { useRouter } from 'next/router';
import { useEffect } from 'react';
import ProfileNavigation from '@/components/ProfileNavigation';
import ProfileLayout from '@/components/ProfileLayout';

const ProfilePage = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace('/profile/details');
  }, []);

  return (
    <ProfileLayout>
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-500"></div>
      </div>
    </ProfileLayout>
  );
};

export default ProfilePage;
