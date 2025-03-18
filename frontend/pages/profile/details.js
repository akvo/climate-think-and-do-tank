import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import ProfileNavigation from '@/components/ProfileNavigation';
import withAuth from '@/components/withAuth';
import ProfileLayout from '@/components/ProfileLayout';
import ImageUploader from '@/components/ImageUploader';
import Image from 'next/image';
import { updateProfile } from '@/store/slices/authSlice';
import { toast } from 'react-toastify';

const ProfileDetails = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [editMode, setEditMode] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    stakeholder_role: user?.stakeholder_role || '',
    linkedin: user?.linkedin || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        ...formData,
        profile_image: profileImage,
        id: user.id,
      };

      const result = await dispatch(updateProfile(updateData));

      if (updateProfile.fulfilled.match(result)) {
        setEditMode(false);
        toast.success('Profile updated successfully');
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Update failed', error);
      toast.error('An error occurred while updating profile');
    }
  };

  if (!user) return null;

  return (
    <ProfileLayout>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="container mx-auto bg-white shadow-md rounded-lg">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">Profile Details</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Image
                </label>
                {editMode ? (
                  <ImageUploader
                    src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${user?.profile_image?.url}`}
                    onChange={setProfileImage}
                    className="w-64"
                    placeholder="Upload Profile Picture"
                  />
                ) : (
                  <div className="w-64 h-64 rounded-full overflow-hidden">
                    <Image
                      src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${user?.profile_image?.url}`}
                      alt={user?.full_name}
                      className="object-cover relative w-[100%] h-[100%]"
                      unoptimized
                      width={256}
                      height={256}
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                {editMode ? (
                  <input
                    type="text"
                    name="full_name"
                    value={formData?.full_name}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  />
                ) : (
                  <p className="text-gray-900">{user?.full_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <p className="text-gray-900">{user?.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Stakeholder Role
                </label>
                {editMode ? (
                  <select
                    name="stakeholder_role"
                    value={formData.stakeholder_role}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  >
                    <option value="Investor">Investor</option>
                    <option value="Government">Government</option>
                    <option value="Farmer">Farmer</option>
                    <option value="NGO">NGO</option>
                  </select>
                ) : (
                  <p className="text-gray-900">{user?.stakeholder_role}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  LinkedIn
                </label>
                {editMode ? (
                  <input
                    type="text"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  />
                ) : (
                  <p className="text-gray-900">
                    {user?.linkedin || 'Not provided'}
                  </p>
                )}
              </div>

              <div className="pt-4">
                {editMode ? (
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditMode(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditMode(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProfileLayout>
  );
};

export default withAuth(ProfileDetails);
