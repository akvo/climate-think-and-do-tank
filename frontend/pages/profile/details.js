import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
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
import Button from '@/components/Button';

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
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800">
              No user data found
            </h2>
            <p className="text-gray-500 mt-2">Please try logging in again</p>
          </div>
        </div>
      </ProfileLayout>
    );
  }

  if (loading && !userProfile) {
    return (
      <ProfileLayout>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-500"></div>
        </div>
      </ProfileLayout>
    );
  }

  const FieldView = ({ label, children }) => (
    <div>
      <label className="block text-sm font-semibold text-gray-500 mb-1">
        {label}
      </label>
      <div className="text-black">{children}</div>
    </div>
  );

  const TagList = ({ items, emptyText = 'Not provided', color = 'primary' }) => {
    if (!items || items.length === 0) {
      return <p className="text-gray-400">{emptyText}</p>;
    }
    return (
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item.id}
            className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm font-medium"
          >
            {item.name}
          </span>
        ))}
      </div>
    );
  };

  return (
    <ProfileLayout>
      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-black">Profile Details</h2>
            {!editMode && (
              <Button
                onClick={() => setEditMode(true)}
                size="sm"
              >
                Edit Profile
              </Button>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-8">
              {/* Profile Image */}
              <div>
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
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-100">
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
                      width={96}
                      height={96}
                      onError={(e) => {
                        const fallbackEl = document.createElement('div');
                        fallbackEl.className =
                          'w-full h-full bg-primary-500 flex items-center justify-center text-white font-bold text-3xl';
                        fallbackEl.textContent = (
                          userProfile?.full_name || 'U'
                        )
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

              {/* Two column grid for basic fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  {editMode ? (
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-black">
                        Name
                      </label>
                      <input
                        type="text"
                        name="full_name"
                        value={formData?.full_name || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-full border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:outline-none text-sm"
                        placeholder="Enter your full name"
                      />
                    </div>
                  ) : (
                    <FieldView label="Name">
                      {userProfile?.full_name || 'Not provided'}
                    </FieldView>
                  )}
                </div>

                {/* Email */}
                <FieldView label="Email Address">
                  {userProfile?.email || 'Not provided'}
                </FieldView>

                {/* Organization */}
                <FieldView label="Organization">
                  {userProfile?.organisation?.name || 'Not provided'}
                </FieldView>

                {/* Country */}
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
                    />
                  ) : (
                    <FieldView label="Country of residence">
                      {userProfile?.country?.country_name || 'Not provided'}
                    </FieldView>
                  )}
                </div>

                {/* Role */}
                <div>
                  {editMode ? (
                    <CustomDropdown
                      id="stakeholder_role"
                      label="Role"
                      options={[
                        { id: 'Academia', label: 'Academia' },
                        { id: 'Governmental', label: 'Governmental' },
                        {
                          id: 'NGO / non-profit',
                          label: 'NGO / non-profit',
                        },
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
                    />
                  ) : (
                    <FieldView label="Role">
                      {userProfile?.stakeholder_role || 'Not provided'}
                    </FieldView>
                  )}
                </div>

                {/* LinkedIn */}
                <div>
                  {editMode ? (
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-black">
                        LinkedIn Profile
                      </label>
                      <input
                        type="url"
                        name="linkedin"
                        value={formData.linkedin || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-full border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:outline-none text-sm"
                        placeholder="https://linkedin.com/in/yourprofile"
                      />
                    </div>
                  ) : (
                    <FieldView label="LinkedIn Profile">
                      {userProfile?.linkedin ? (
                        <a
                          href={userProfile.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-500 hover:underline"
                        >
                          {userProfile.linkedin}
                        </a>
                      ) : (
                        'Not provided'
                      )}
                    </FieldView>
                  )}
                </div>
              </div>

              {/* Full width fields for multi-select */}
              <div className="space-y-6">
                {/* Focus Regions */}
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
                    />
                  ) : (
                    <FieldView label="Focus Region">
                      <TagList items={userProfile?.focus_regions} />
                    </FieldView>
                  )}
                </div>

                {/* Topics */}
                <div>
                  {editMode ? (
                    <CustomDropdown
                      id="topics"
                      label="Topics"
                      options={topics.map((topic) => ({
                        id: topic.id,
                        label: topic.name,
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
                    />
                  ) : (
                    <FieldView label="Topics">
                      <TagList items={userProfile?.topics} />
                    </FieldView>
                  )}
                </div>

                {/* Looking For */}
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
                    />
                  ) : (
                    <FieldView label="Looking For">
                      <TagList items={userProfile?.looking_fors} />
                    </FieldView>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {editMode && (
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    loading={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setEditMode(false)}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </form>

          {!editMode && (
            <div className="mt-8 pt-6 border-t border-gray-100 space-y-4">
              <button
                type="button"
                onClick={() => setShowDeleteDialog(true)}
                className="text-sm text-red-500 hover:text-red-600 font-medium"
              >
                Delete Account
              </button>

              <div className="p-4 bg-[#fafafa] rounded-xl">
                <p className="text-sm text-gray-500">
                  Need to change your email address or organization?{' '}
                  <Link
                    href="/contact-us"
                    className="font-semibold text-primary-500 hover:underline"
                  >
                    Contact us for assistance
                  </Link>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <svg
                  className="w-6 h-6 text-red-500"
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
                <h3 className="text-lg font-bold text-black">
                  Delete Account
                </h3>
                <p className="text-sm text-gray-500">
                  This action cannot be undone
                </p>
              </div>
            </div>
            <p className="text-gray-600 mb-6 text-sm">
              Are you sure you want to permanently delete your account? All
              your data will be lost forever.
            </p>
            <div className="flex gap-3">
              <Button
                variant="danger"
                onClick={handleDeleteAccount}
                className="flex-1"
              >
                Delete Account
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowDeleteDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </ProfileLayout>
  );
};

export default withAuth(ProfileDetails);
