import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import ProfileNavigation from '@/components/ProfileNavigation';
import withAuth from '@/components/withAuth';
import ProfileLayout from '@/components/ProfileLayout';
import ImageUploader from '@/components/ImageUploader';
import Image from 'next/image';
import {
  fetchUserProfile,
  logout,
  updateProfile,
} from '@/store/slices/authSlice';
import { toast } from 'react-toastify';
import { env } from '@/helpers/env-vars';
import { getImageUrl } from '@/helpers/utilities';
import CustomDropdown from '@/components/CustomDropdown';
import Link from 'next/link';
import { deleteCookie, getCookie } from 'cookies-next';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/router';

const ProfileDetails = () => {
  const router = useRouter();
  const { organizations, regions, lookingFors, roles, country, topics } =
    useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const [editMode, setEditMode] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    stakeholder_role: '',
    linkedin: '',
    focus_regions: [],
    looking_fors: [],
    topics: [],
    country: '',
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProfile = async () => {
    const token = getCookie('token');
    if (token) {
      try {
        setLoading(true);
        const response = await dispatch(fetchUserProfile());

        if (fetchUserProfile.fulfilled.match(response)) {
          setUserProfile(response.payload);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (userProfile) {
      setFormData({
        full_name: userProfile?.full_name || '',
        stakeholder_role: userProfile?.stakeholder_role || '',
        linkedin: userProfile?.linkedin || '',
        focus_regions:
          userProfile?.focus_regions?.map((region) => region.id) || [],
        looking_fors:
          userProfile?.looking_fors?.map((option) => option.id) || [],
        country: userProfile?.country?.id || '',
        topics: userProfile?.topics?.map((topic) => topic.id) || [],
      });
    }
  }, [userProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    setIsSubmitting(true);
    e.preventDefault();
    try {
      const updateData = {
        ...formData,
        profile_image: profileImage,
        id: userProfile.id,
      };

      const result = await dispatch(updateProfile(updateData));

      if (updateProfile.fulfilled.match(result)) {
        setEditMode(false);
        toast.success('Profile updated successfully');
        fetchProfile();
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Update failed', error);
      toast.error('An error occurred while updating profile');
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      const token = getCookie('token');

      const response = await fetch(
        `${env('NEXT_PUBLIC_BACKEND_URL')}/api/users/${userProfile.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        toast.success('Account deleted successfully');
        setShowDeleteDialog(false);

        dispatch(logout());
        deleteCookie('token');

        router.push('/login');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to delete account');
      }
    } catch (error) {
      toast.error('An error occurred while deleting your account');
    } finally {
      setLoading(false);
      setShowDeleteDialog(false);
    }
  };

  if (!userProfile && !loading) {
    return (
      <ProfileLayout>
        <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800">
              No user data found
            </h2>
            <p className="text-gray-600 mt-2">Please try logging in again</p>
          </div>
        </div>
      </ProfileLayout>
    );
  }

  if (loading && !userProfile) {
    return (
      <ProfileLayout>
        <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </ProfileLayout>
    );
  }

  return (
    <ProfileLayout>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="container mx-auto bg-white shadow-lg rounded-xl">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-8">
              Profile Details
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Image */}
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-3">
                  Profile Picture
                </label>
                {editMode ? (
                  <ImageUploader
                    src={
                      userProfile?.profile_image &&
                      userProfile?.profile_image.url
                        ? getImageUrl(userProfile?.profile_image)
                        : ''
                    }
                    onChange={setProfileImage}
                    placeholder="Upload Profile Picture"
                    user={userProfile}
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full overflow-hidden shadow-md">
                    <Image
                      src={
                        userProfile?.profile_image &&
                        userProfile?.profile_image.url
                          ? getImageUrl(userProfile?.profile_image)
                          : ''
                      }
                      alt={userProfile?.full_name || 'User'}
                      className="object-cover w-full h-full"
                      unoptimized
                      width={128}
                      height={128}
                      onError={(e) => {
                        const fallbackEl = document.createElement('div');
                        fallbackEl.className =
                          'w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-3xl';
                        fallbackEl.textContent = (userProfile?.full_name || 'U')
                          .charAt(0)
                          .toUpperCase();

                        const parentNode = e.target.parentNode;
                        if (parentNode) {
                          e.target.style.display = 'none';
                          parentNode.appendChild(fallbackEl);
                        }
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  Name
                </label>
                {editMode ? (
                  <input
                    type="text"
                    name="full_name"
                    value={formData?.full_name || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <p className="text-gray-900 py-2 px-1">
                    {userProfile?.full_name || 'Not provided'}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={userProfile?.email || ''}
                    disabled
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  Organization name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={userProfile?.organisation?.name || 'Not provided'}
                    disabled
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                {editMode ? (
                  <CustomDropdown
                    id="country"
                    label="Country of residence"
                    options={country.map((c) => ({
                      id: c.id,
                      label: c.country_name,
                    }))}
                    value={formData.country}
                    onChange={(value) =>
                      handleChange({
                        target: { name: 'country', value },
                      })
                    }
                    placeholder="Select your country"
                    searchable={true}
                    className="w-full"
                  />
                ) : (
                  <>
                    <label className="block text-lg font-medium text-gray-700 mb-2">
                      Country of residence
                    </label>
                    <p className="text-gray-900 py-2 px-1">
                      {userProfile?.country?.country_name || 'Not provided'}
                    </p>
                  </>
                )}
              </div>

              <div>
                {editMode ? (
                  <CustomDropdown
                    id="focus_regions"
                    label="Focus Region"
                    options={regions.map((region) => ({
                      id: region.id,
                      label: region.name,
                    }))}
                    isMulti={true}
                    value={formData.focus_regions}
                    onChange={(value) =>
                      handleChange({
                        target: { name: 'focus_regions', value },
                      })
                    }
                    placeholder="Select focus regions"
                    searchable={true}
                    className="w-full"
                  />
                ) : (
                  <>
                    <label className="block text-lg font-medium text-gray-700 mb-2">
                      Focus Region
                    </label>
                    <div className="py-2 px-1">
                      {userProfile?.focus_regions &&
                      userProfile.focus_regions.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {userProfile.focus_regions.map((region) => (
                            <span
                              key={region.id}
                              className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                            >
                              {region.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-900">Not provided</p>
                      )}
                    </div>
                  </>
                )}
              </div>
              <div>
                {editMode ? (
                  <CustomDropdown
                    id="topics"
                    label="Topics"
                    options={topics.map((region) => ({
                      id: region.id,
                      label: region.name,
                    }))}
                    isMulti={true}
                    value={formData.topics}
                    onChange={(value) =>
                      handleChange({
                        target: { name: 'topics', value },
                      })
                    }
                    placeholder="Select topics"
                    searchable={true}
                    className="w-full"
                  />
                ) : (
                  <>
                    <label className="block text-lg font-medium text-gray-700 mb-2">
                      Topics
                    </label>
                    <div className="py-2 px-1">
                      {userProfile?.topics && userProfile.topics.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {userProfile.topics.map((region) => (
                            <span
                              key={region.id}
                              className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                            >
                              {region.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-900">Not provided</p>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div>
                {editMode ? (
                  <CustomDropdown
                    id="looking_fors"
                    label="Looking For"
                    options={lookingFors.map((option) => ({
                      id: option.id,
                      label: option.name,
                    }))}
                    isMulti={true}
                    value={formData.looking_fors}
                    onChange={(value) =>
                      handleChange({
                        target: { name: 'looking_fors', value },
                      })
                    }
                    placeholder="What are you looking for?"
                    searchable={true}
                    className="w-full"
                  />
                ) : (
                  <>
                    <label className="block text-lg font-medium text-gray-700 mb-2">
                      Looking For
                    </label>
                    <div className="py-2 px-1">
                      {userProfile?.looking_fors &&
                      userProfile.looking_fors.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {userProfile.looking_fors.map((option) => (
                            <span
                              key={option.id}
                              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                            >
                              {option.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-900">Not provided</p>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Stakeholder Role */}
              <div>
                {editMode ? (
                  <CustomDropdown
                    id="stakeholder_role"
                    label="Stakeholder Role"
                    options={[
                      { id: 'Academia', label: 'Academia' },
                      { id: 'Governmental', label: 'Governmental' },
                      { id: 'NGO / non-profit', label: 'NGO / non-profit' },
                      {
                        id: 'Investor / private sector',
                        label: 'Investor / private sector',
                      },
                      {
                        id: 'Local communities / groups / cooperatives',
                        label: 'Local communities / groups / cooperatives',
                      },
                    ]}
                    value={formData.stakeholder_role}
                    onChange={(value) =>
                      handleChange({
                        target: { name: 'stakeholder_role', value },
                      })
                    }
                    placeholder="Select your role"
                    className="w-full"
                  />
                ) : (
                  <>
                    <label className="block text-lg font-medium text-gray-700 mb-2">
                      Role
                    </label>
                    <p className="text-gray-900 py-2 px-1">
                      {userProfile?.stakeholder_role || 'Not provided'}
                    </p>
                  </>
                )}
              </div>

              {/* LinkedIn */}
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  LinkedIn Profile
                </label>
                {editMode ? (
                  <input
                    type="url"
                    name="linkedin"
                    value={formData.linkedin || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                ) : (
                  <p className="text-gray-900 py-2 px-1">
                    {userProfile?.linkedin ? (
                      <a
                        href={userProfile.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        {userProfile.linkedin}
                      </a>
                    ) : (
                      'Not provided'
                    )}
                  </p>
                )}
              </div>

              {editMode && (
                <div className="pt-6 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 />
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditMode(false)}
                      className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </form>

            <div className="pt-6 ">
              {!editMode && (
                <div className="pt-6 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      type="button"
                      onClick={() => setEditMode(true)}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors font-medium"
                    >
                      Edit Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteDialog(true)}
                      className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors font-medium"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              )}

              {/* Contact Info */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  Need to change your email address or organization?
                  <Link
                    href="/contact-us"
                    className="font-medium text-blue-600 hover:text-blue-500 underline ml-1"
                  >
                    Contact us for assistance
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Delete Confirmation Dialog */}
          {showDeleteDialog && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl p-6 max-w-md w-full">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                    <svg
                      className="w-6 h-6 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Delete Account
                    </h3>
                    <p className="text-sm text-gray-600">
                      This action cannot be undone
                    </p>
                  </div>
                </div>
                <p className="text-gray-700 mb-6">
                  Are you sure you want to permanently delete your account? All
                  your data will be lost forever.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleDeleteAccount}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                  >
                    Delete Account
                  </button>
                  <button
                    onClick={() => setShowDeleteDialog(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProfileLayout>
  );
};

export default withAuth(ProfileDetails);
