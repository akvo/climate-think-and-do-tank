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
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg">
          <ProfileNavigation />
        </div>
      </div>
    </ProfileLayout>
  );
};

export default ProfilePage;
