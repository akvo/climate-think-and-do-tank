import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { validateAdditionalDetails, validateSignUp } from '@/helpers/utilities';
import {
  signUp,
  resendVerification,
  fetchOrganizationsAndRegions,
  createOrganization,
} from '@/store/slices/authSlice';
import Link from 'next/link';
import { Eye, EyeOff, Link2, X } from 'lucide-react';
import CustomDropdown from '@/components/CustomDropdown';
import { VerifyEmailIcon } from '@/components/Icons';
import ImageUploader from '@/components/ImageUploader';

export default function SignUpForm() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdditionalDetails, setShowAdditionalDetails] = useState(false);
  const [showConfirmEmail, setShowConfirmEmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [steps, setSteps] = useState([
    { number: 1, label: 'Sign Up', completed: true },
    {
      number: 2,
      label: 'Basic Information',
      active: true,
      completed: false,
    },
    { number: 3, label: 'Confirm Email', active: false, completed: false },
  ]);

  const slides = [
    'https://placehold.co/600x400',
    'https://placehold.co/600x400',
    'https://placehold.co/600x400',
  ];
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    const currentFormData = {
      ...formData,
      [name]: value,
    };

    const validationErrors = validateSignUp(currentFormData);

    setFormErrors(validationErrors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const finalErrors = validateSignUp(formData);
    if (Object.keys(finalErrors).length > 0) {
      setFormErrors(finalErrors);
      return;
    }

    setSteps((prevSteps) => [
      { ...prevSteps[0], completed: true },
      { ...prevSteps[1], active: true },
      { ...prevSteps[2], active: true },
    ]);

    setShowAdditionalDetails(true);
  };

  const handleAdditionalDetailsSubmit = async (additionalData) => {
    try {
      setIsSubmitting(true);
      setFormErrors({});
      const result = await dispatch(
        signUp({
          ...formData,
          ...additionalData,
          username: formData.email,
          stakeholder_role: additionalData.role,
          full_name: additionalData.name,
          looking_fors: { id: additionalData.looking_fors },
          regions: additionalData.regions.map((r) => ({ id: r })),
          topics: additionalData.topics.map((r) => ({ id: r })),
          country: additionalData.country,
          organisation: { id: additionalData.organisation },
        })
      );

      if (signUp.rejected.match(result)) {
        const error = result.payload;

        if (error.fieldErrors && Object.keys(error.fieldErrors).length > 0) {
          setFormErrors({
            ...error.fieldErrors,
            general: error.message,
          });

          document
            .getElementById('error-summary')
            ?.scrollIntoView({ behavior: 'smooth' });
          return;
        }

        setFormErrors({
          general: error.message || 'Signup failed. Please try again.',
        });
        return;
      }

      setSteps((prevSteps) => [
        { ...prevSteps[0], completed: true },
        { ...prevSteps[1], completed: true, active: false },
        { ...prevSteps[2], active: true, completed: false },
      ]);

      setShowConfirmEmail(true);
    } catch (error) {
      console.error('Unexpected error during signup:', error);
      setFormErrors({
        general: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {!showAdditionalDetails ? (
        <div className="flex min-h-screen bg-white">
          <div className="w-1/2 p-12 flex flex-col justify-center min-h-screen">
            <Link href="/" className="mb-4 block">
              <Image
                src="/images/logo.png"
                alt="Kenya Drylands Investment Hub Logo"
                width={230}
                height={40}
                priority
              />
            </Link>
            <div className="flex-grow flex items-center">
              <div className="max-w-4xl mx-auto w-full">
                <div className="mb-12">
                  <h1 className="text-4xl font-bold text-black mb-6">
                    Welcome to the Think and Do Tank Network
                  </h1>
                  <p className="text-gray-600">
                    Sign Up for your user account to access the platform's
                    features
                  </p>
                </div>

                {formErrors.general && (
                  <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-full">
                    {formErrors.general}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      className={`w-full px-4 py-3 bg-gray-50 border placeholder:text-black text-black ${
                        formErrors.email ? 'border-red-500' : 'border-gray-200'
                      } rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                    />
                    {formErrors.email && (
                      <p className="mt-1 text-sm text-red-600">
                        {formErrors.email}
                      </p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 bg-gray-50 border placeholder:text-black text-black ${
                          formErrors.password
                            ? 'border-red-500'
                            : 'border-gray-200'
                        } rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent pr-10`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                      >
                        {showPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                    {formErrors.password && (
                      <p className="mt-1 text-sm text-red-600">
                        {formErrors.password}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div className="space-y-2">
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 bg-gray-50 border placeholder:text-black text-black ${
                          formErrors.confirmPassword
                            ? 'border-red-500'
                            : 'border-gray-200'
                        } rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent pr-10`}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                    {formErrors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">
                        {formErrors.confirmPassword}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`
                    w-full 
                    bg-green-600 
                    text-white 
                    py-3 
                    rounded-full 
                    transition-colors 
                    duration-200
                    ${
                      isSubmitting
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:bg-green-700'
                    }
                  `}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <svg
                          className="animate-spin h-5 w-5 mr-3"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Signing Up...
                      </div>
                    ) : (
                      'Sign Up'
                    )}
                  </button>

                  <div className="text-center text-sm text-gray-600 space-y-2">
                    <p>
                      By submitting your files to the platform, you acknowledge
                      that you agree to our{' '}
                      <a
                        href="/terms"
                        className="text-green-600 hover:underline"
                      >
                        Terms of Service
                      </a>{' '}
                      and{' '}
                      <a
                        href="/guidelines"
                        className="text-green-600 hover:underline"
                      >
                        Community Guidelines
                      </a>
                    </p>
                    <p>
                      Please be sure not to violate others' copyright or privacy
                      rights.{' '}
                      <a
                        href="/learn-more"
                        className="text-green-600 hover:underline"
                      >
                        Learn more
                      </a>
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Right Section - Image Carousel */}
          <div className="w-1/2 relative">
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-500 ${
                  currentSlide === index ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <Image
                  src={slide || 'https://placehold.co/600x400'}
                  alt={`Slide ${index + 1}`}
                  fill
                  className="object-cover"
                  priority={index === 0}
                  unoptimized
                />
              </div>
            ))}

            {/* Carousel Indicators */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    currentSlide === index ? 'bg-white' : 'bg-white/50'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <AdditionalDetails
          onSubmit={handleAdditionalDetailsSubmit}
          formData={formData}
          steps={steps}
          isSubmitting={isSubmitting}
          formErrors={formErrors}
          setFormErrors={setFormErrors}
        />
      )}
    </div>
  );
}

const AdditionalDetails = ({
  onSubmit,
  formData: form,
  steps,
  isSubmitting,
  formErrors,
  setFormErrors,
}) => {
  const dispatch = useDispatch();
  const { organizations, regions, lookingFors, roles, country, topics } =
    useSelector((state) => state.auth);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [formData, setFormData] = useState({
    organisation: '',
    sector: '',
    acceptTerms: false,
    topics: [],
    name: '',
    website: '',
    type: '',
    country: [],
    regions: [],
    org_name: '',
  });

  const [isOrgModal, setIsOrgModal] = useState(false);

  const filteredOrganizations = searchTerm
    ? organizations.filter((org) =>
        org.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : organizations;

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'acceptTerms' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validateAdditionalDetails(formData);

    if (Object.keys(validationErrors).length > 0) {
      validationErrors.general = 'Please fix the errors before continuing';

      setFormErrors(validationErrors);

      document
        .getElementById('error-summary')
        ?.scrollIntoView({ behavior: 'smooth' });

      return;
    }

    setFormErrors({});

    onSubmit(formData);
  };

  return (
    <div className="flex min-h-screen ">
      <div className="w-1/2 flex flex-col justify-center min-h-screen bg-zinc-900 p-12 text-white">
        <Link href="/" className="mb-4 block">
          <Image
            src="/images/logo-white.png"
            alt="Kenya Drylands Investment Hub Logo"
            width={230}
            height={40}
            priority
          />
        </Link>

        <div className="flex-grow flex items-center">
          <div className="max-w-4xl mx-auto w-full">
            <div className="mb-8">
              <div className="w-12 h-12 bg-zinc-700 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-zinc-400"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
            </div>

            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-2">
                Create your account in a few clicks
              </h2>
            </div>

            {/* Steps */}
            <div className="flex flex-col">
              {steps.map((step, index) => (
                <div key={step.number} className="flex">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center ${
                        step.completed
                          ? 'bg-transparent border-2 border-white'
                          : step.active
                          ? 'bg-zinc-600'
                          : 'bg-transparent border-2 border-white'
                      }`}
                    >
                      {step.completed ? (
                        <svg
                          className="w-8 h-8 text-white"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-3xl text-white">
                          {step.number}
                        </span>
                      )}
                    </div>

                    {index < steps.length - 1 && (
                      <div className="w-0.5 h-24 bg-white"></div>
                    )}
                  </div>

                  <div className="ml-12 mt-4">
                    <span className="text-2xl text-white">{step.label}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-auto pt-8">
              <p className="text-zinc-400">{form.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-1/2 p-12 bg-white flex items-center text-black">
        {steps.find((step) => step.active)?.number === 2 && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-black">
              Basic Information
            </h2>

            {formErrors.general && (
              <div
                id="error-summary"
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6"
              >
                <p className="font-medium">{formErrors.general}</p>
                {Object.keys(formErrors).length > 1 && (
                  <ul className="mt-2 list-disc pl-5">
                    {Object.entries(formErrors)
                      .filter(([key]) => key !== 'general')
                      .map(([field, message]) => (
                        <li key={field}>
                          {field.charAt(0).toUpperCase() + field.slice(1)}:{' '}
                          {message}
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="block text-lg font-medium text-gray-700"
                >
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  className="w-full p-4 py-2 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                />{' '}
                {formErrors.name && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="organization"
                  className="block text-lg font-medium text-gray-700"
                >
                  Organization name
                </label>
                <div className="relative flex gap-2 border border-gray-200 rounded-full p-1">
                  <div className="relative flex-1">
                    <input
                      id="organisation"
                      type="text"
                      placeholder="Enter your organisation name"
                      className="w-full p-4 py-2 bg-white rounded-full focus:outline-none"
                      name="organisation"
                      value={searchTerm || ''}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                    />

                    {showSuggestions && searchTerm && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {filteredOrganizations.length > 0 ? (
                          filteredOrganizations.map((org) => (
                            <div
                              key={org.id}
                              className="p-3 hover:bg-gray-50 cursor-pointer"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  organisation: org.id,
                                  organisationName: org.name,
                                });
                                setSearchTerm(org.name);
                                setShowSuggestions(false);
                              }}
                            >
                              {org.name}
                            </div>
                          ))
                        ) : (
                          <div className="p-3 text-gray-500">
                            No organizations found
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsOrgModal(true)}
                    className="px-6 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center gap-2 whitespace-nowrap"
                  >
                    Add Organization
                    <span className="font-bold">+</span>
                  </button>
                </div>
                {formErrors.organisation && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.organisation}
                  </p>
                )}
              </div>

              <CustomDropdown
                id="role"
                label="Role"
                options={[
                  { id: 'Investor', label: 'Investor' },
                  { id: 'Government', label: 'Government' },
                  { id: 'Farmer', label: 'Farmer' },
                  { id: 'NGO', label: 'NGO' },
                ]}
                isMulti={false}
                value={formData.role}
                onChange={(value) => setFormData({ ...formData, role: value })}
                placeholder="Enter your role"
              />

              <CustomDropdown
                id="country"
                label="Country of residence"
                options={
                  country &&
                  country.map((f) => {
                    return {
                      id: f.id,
                      label: f.country_name,
                    };
                  })
                }
                isMulti={false}
                value={formData.country}
                onChange={(value) =>
                  setFormData({ ...formData, country: value })
                }
                placeholder="Select country"
              />

              <CustomDropdown
                id="regions"
                label="Focus Region"
                options={
                  regions &&
                  regions.map((f) => {
                    return {
                      id: f.id,
                      label: f.name,
                    };
                  })
                }
                isMulti={true}
                value={formData.regions}
                onChange={(value) =>
                  setFormData({ ...formData, regions: value })
                }
                placeholder="Select regions"
              />

              <CustomDropdown
                id="topics"
                label="Topics"
                options={
                  topics &&
                  topics.map((f) => {
                    return {
                      id: f.id,
                      label: f.name,
                    };
                  })
                }
                isMulti={true}
                value={formData.topics}
                onChange={(value) =>
                  setFormData({ ...formData, topics: value })
                }
                placeholder="Select topics"
              />

              <CustomDropdown
                id="looking_fors"
                label="Looking for"
                options={
                  lookingFors &&
                  lookingFors.map((f) => {
                    return {
                      id: f.id,
                      label: f.name,
                    };
                  })
                }
                isMulti={false}
                value={formData.looking_fors}
                onChange={(value) =>
                  setFormData({ ...formData, looking_fors: value })
                }
                placeholder="Select option"
              />

              <div className="space-y-2">
                <label
                  htmlFor="linkedin"
                  className="block text-lg font-medium text-gray-700"
                >
                  Linkedin Profile
                </label>
                <div className="relative">
                  <input
                    id="linkedin"
                    type="text"
                    placeholder="https://www.linkedin.com/in/user-o-bb6123b2/"
                    className="w-full p-4 py-2 pl-6 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    name="linkedin"
                    value={formData.linkedin || ''}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-4 flex items-center text-gray-400"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                      ></path>
                    </svg>
                  </button>
                </div>
              </div>

              <div className="space-y-4 mt-6">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="newsletter"
                    className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={formData.newsletter || false}
                    onChange={(e) =>
                      setFormData({ ...formData, newsletter: e.target.checked })
                    }
                  />
                  <label
                    htmlFor="newsletter"
                    className="text-base text-gray-700"
                  >
                    Send me the latest News and Updates
                  </label>
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms"
                    className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={formData.acceptTerms || false}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        acceptTerms: e.target.checked,
                      })
                    }
                  />
                  <label htmlFor="terms" className="text-base text-gray-700">
                    I accept the{' '}
                    <span className="font-bold">Terms of Service</span> and I'm
                    authorised to accept for my organization
                  </label>{' '}
                </div>
                {formErrors.acceptTerms && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.acceptTerms}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`
                  w-full 
                  bg-green-600 
                  text-white 
                  py-2 
                  rounded-full 
                  text-lg
                  font-medium
                  transition-colors 
                  duration-200
                  ${
                    isSubmitting
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-green-700'
                  }
                `}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin h-5 w-5 mr-3"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Submitting...
                  </div>
                ) : (
                  'Continue'
                )}
              </button>
            </form>
          </div>
        )}
        {steps.find((step) => step.active)?.number === 3 && (
          <ConfirmEmail user={form} />
        )}
        {isOrgModal && (
          <OrganizationModal
            onClose={() => setIsOrgModal(false)}
            formData={formData}
            setFormData={setFormData}
            country={country}
            topics={topics}
            setSearchTerm={setSearchTerm}
          />
        )}
      </div>
    </div>
  );
};

const ConfirmEmail = ({ user }) => {
  const dispatch = useDispatch();
  const [resendStatus, setResendStatus] = useState('');
  const handleResendVerification = async () => {
    setResendStatus('sending');
    const result = await dispatch(resendVerification(user.email));

    if (result.payload?.sent) {
      setResendStatus('success');
      setTimeout(() => setResendStatus(''), 3000);
    } else {
      setResendStatus('error');
      setTimeout(() => setResendStatus(''), 3000);
    }
  };

  const getResendButton = () => {
    switch (resendStatus) {
      case 'sending':
        return (
          <button className="text-gray-400 cursor-not-allowed ml-1" disabled>
            Sending...
          </button>
        );
      case 'success':
        return (
          <span className="text-green-600 ml-1">Verification email sent!</span>
        );
      case 'error':
        return (
          <button
            className="text-red-600 hover:text-red-500 ml-1"
            onClick={handleResendVerification}
          >
            Failed, try again
          </button>
        );
      default:
        return (
          <button
            className="text-indigo-600 hover:text-indigo-500 ml-1"
            onClick={handleResendVerification}
          >
            click here to resend
          </button>
        );
    }
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-[100%] gap-2">
      <VerifyEmailIcon />
      <h2 className="text-3xl font-extrabold text-gray-900 mt-4">
        Verify your email
      </h2>{' '}
      <p className="text-gray-600 mb-4">
        We’ll send you a link to the email address you signed up with
      </p>
      <button className="px-4 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors min-w-72">
        Continue
      </button>
    </div>
  );
};

const OrganizationModal = ({
  onClose,
  formData,
  setFormData,
  country,
  topics,
  setSearchTerm,
}) => {
  const dispatch = useDispatch();

  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.org_name) {
      setError('Organization name is required');
      return;
    }

    if (!formData.type) {
      setError('Organization type is required');
      return;
    }

    if (!formData.country) {
      setError('Country is required');
      return;
    }

    const organizationData = {
      org_name: formData.org_name,
      website: formData.website,
      type: formData.type,
      country: formData.country,
      org_image: formData.org_image,
    };

    try {
      const resultAction = await dispatch(createOrganization(organizationData));

      if (createOrganization.fulfilled.match(resultAction)) {
        console.log(resultAction);
        const newOrganization = resultAction.payload.data;
        setFormData({
          ...formData,
          organisation: newOrganization.id,
          organisationName: newOrganization.name,
        });
        setSearchTerm(newOrganization.name);
        onClose();
      } else if (createOrganization.rejected.match(resultAction)) {
        setError(resultAction.payload || 'Failed to create organization');
      }
    } catch (error) {
      console.error('Error creating organization:', error);
      setError(error.message || 'An unexpected error occurred');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 text-black">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold">Add Organization</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded-lg">
              <p className="text-sm">{error}</p>
            </div>
          )}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Name</label>
            <input
              type="text"
              placeholder="Enter your organization name"
              className="w-full px-4 py-3 rounded-full bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={formData.org_name}
              onChange={(e) =>
                setFormData({ ...formData, org_name: e.target.value })
              }
            />
          </div>

          {/* Website */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Website</label>
            <div className="relative">
              <input
                type="url"
                placeholder="www.myorg.com"
                className="w-full px-4 py-3 rounded-full bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 pr-10"
                value={formData.website}
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
                }
              />
              <Link2
                className="absolute right-4 top-3.5 text-gray-400"
                size={20}
              />
            </div>
          </div>

          <CustomDropdown
            id="type"
            label="Organization type"
            options={[
              { id: 'NGO', label: 'NGO' },
              { id: 'Company', label: 'Company' },
            ]}
            isMulti={false}
            value={formData.type}
            onChange={(value) => setFormData({ ...formData, type: value })}
            placeholder="Select organization type"
          />

          <CustomDropdown
            id="country"
            label="Country"
            options={
              country &&
              country.map((f) => {
                return {
                  id: f.id,
                  label: f.country_name,
                };
              })
            }
            isMulti={false}
            value={formData.country}
            onChange={(value) => setFormData({ ...formData, country: value })}
            placeholder="Select country"
          />

          <ImageUploader
            value={formData.org_image_preview}
            onChange={(file) => {
              setFormData((prev) => ({
                ...prev,
                org_image: file,
                org_image_preview: file ? URL.createObjectURL(file) : null,
              }));
            }}
          />

          <button
            type="submit"
            className="w-full px-4 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
          >
            Save
          </button>
        </form>
      </div>
    </div>
  );
};
