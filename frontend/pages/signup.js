import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { validateSignUp } from '@/helpers/utilities';
import {
  fetchOrganizationsAndSectors,
  signUp,
  resendVerification,
} from '@/store/slices/authSlice';
import Link from 'next/link';
import {
  ChevronDown,
  Globe,
  Link2,
  LinkIcon,
  MapPin,
  Plus,
  X,
} from 'lucide-react';

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
  const [showAdditionalDetails, setShowAdditionalDetails] = useState(true);
  const [showConfirmEmail, setShowConfirmEmail] = useState(false);
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
    console.log(additionalData);
    try {
      setIsSubmitting(true);
      await dispatch(
        signUp({
          ...formData,
          ...additionalData,
        })
      );

      setSteps((prevSteps) => [
        { ...prevSteps[0], completed: true },
        { ...prevSteps[1], completed: true, active: false },
        { ...prevSteps[2], active: true, completed: false },
      ]);

      setShowConfirmEmail(true);
    } catch (error) {
      setFormErrors({
        general: error.message || 'Signup failed. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {!showAdditionalDetails ? (
        <div className="flex min-h-screen bg-white">
          {/* Left Section */}
          <div className="w-1/2 p-12 flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full">
              <div className="mb-8">
                <h1 className="text-xl font-semibold flex items-center gap-1 text-black">
                  THINK
                  <span className="text-green-600">&</span>
                  DO TANK
                </h1>
              </div>

              <div className="mb-12">
                <h2 className="text-4xl font-bold flex items-center gap-2 text-black">
                  Welcome to the Think and Do Tank Network
                </h2>
                <p className="mt-4 text-gray-600">
                  Sign Up for your user account to access the platform's
                  features
                </p>
              </div>

              {/* General error message */}
              {formErrors.general && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
                  {formErrors.general}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Username Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-black"
                  >
                    Username
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Choose a username"
                    className={`w-full px-3 py-2 bg-gray-50 border placeholder-gray-500 text-black ${
                      formErrors.username
                        ? 'border-red-500 focus:ring-red-500 '
                        : 'border-gray-200 focus:ring-green-500'
                    } rounded-md focus:outline-none focus:ring-2 focus:border-transparent`}
                  />
                  {formErrors.username && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.username}
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-black"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="user@address.com"
                    className={`w-full px-3 py-2 bg-gray-50 border placeholder-gray-500 text-black ${
                      formErrors.email
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-200 focus:ring-green-500'
                    } rounded-md focus:outline-none focus:ring-2 focus:border-transparent`}
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
                    className="block text-sm font-medium text-black"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 bg-gray-50 border placeholder-gray-500 text-black ${
                      formErrors.password
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-200 focus:ring-green-500'
                    } rounded-md focus:outline-none focus:ring-2 focus:border-transparent`}
                  />
                  {formErrors.password && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.password}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Must be at least 8 characters with uppercase, lowercase,
                    number, and special character
                  </p>
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-black"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 bg-gray-50 border placeholder-gray-500 text-black ${
                      formErrors.confirmPassword
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-200 focus:ring-green-500'
                    } rounded-md focus:outline-none focus:ring-2 focus:border-transparent`}
                  />
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
                bg-zinc-900 
                text-white 
                py-2 
                rounded-md 
                transition-colors 
                duration-200
                ${
                  isSubmitting
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-zinc-800'
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
              </form>
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
}) => {
  const dispatch = useDispatch();
  const { organizations, sectors, country, roles } = useSelector(
    (state) => state.auth
  );

  const [formData, setFormData] = useState({
    organisation: '',
    sector: '',
    acceptTerms: false,
    topics: [],
    name: '',
    website: '',
    type: '',
    country: '',
  });

  const [isOrgModal, setIsOrgModal] = useState(false);
  useEffect(() => {
    console.log('Fetching organizations and sectors');
    dispatch(fetchOrganizationsAndSectors());
  }, []);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'acceptTerms' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  console.log(steps);

  return (
    <div className="flex min-h-screen">
      {/* Left Panel */}
      <div className="w-1/2 bg-zinc-900 p-12 text-white">
        <div className="mb-16">
          <h1 className="text-xl font-bold flex items-center gap-1">
            THINK
            <span className="text-green-500">&</span>
            DO TANK
          </h1>
        </div>

        {/* User Icon */}
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

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">
            Create your account in a few clicks
          </h2>
        </div>

        {/* Steps */}
        <div className="space-y-8">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center gap-4">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 
                ${
                  step.completed
                    ? 'border-green-500'
                    : step.active
                    ? 'border-white'
                    : 'border-zinc-700 text-zinc-700'
                }`}
              >
                {step.completed ? (
                  <svg
                    className="w-4 h-4 text-green-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.number
                )}
              </div>
              <span className={step.active ? 'text-white' : 'text-zinc-600'}>
                {step.label}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-auto pt-8">
          <p className="text-zinc-400">{form.email}</p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-1/2 p-12 bg-white">
        {steps.find((step) => step.active)?.number === 2 && (
          <div className="max-w-xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-black">
              Let's get started
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-black"
                >
                  Role
                </label>
                <select
                  id="role"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-500 text-black"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="">Select Role</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Organization name
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter your organization name"
                    className="flex-1 px-4 py-3 rounded-full bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={formData.organisation}
                    onChange={handleChange}
                  />
                  <button
                    onClick={() => setIsOrgModal(true)}
                    className="px-4 py-2 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-700 flex items-center gap-2"
                  >
                    Add Organization
                    <Plus size={20} />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="country"
                  className="block text-sm font-medium text-black"
                >
                  County
                </label>
                <select
                  id="country"
                  name="country"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-500 text-black"
                  value={formData.country}
                  onChange={handleChange}
                >
                  <option value="">Select Organization</option>
                  {country.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.country_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="sector"
                  className="block text-sm font-medium text-black"
                >
                  Sector
                </label>

                <select
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-500 text-black"
                  id="sector"
                  name="sector"
                  value={formData.sector}
                  onChange={handleChange}
                >
                  <option value="">Select Sector</option>
                  {sectors.map((sector) => (
                    <option key={sector.id} value={sector.id}>
                      {sector.sector_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  className="mt-1"
                  checked={formData.acceptTerms}
                  onChange={(e) =>
                    setFormData({ ...formData, acceptTerms: e.target.checked })
                  }
                />
                <label htmlFor="terms" className="text-sm text-black">
                  I accept the{' '}
                  <Link href="#" className="text-blue-600 hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and I'm authorised to accept for my organization
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`
                w-full 
                bg-zinc-900 
                text-white 
                py-2 
                rounded-md 
                transition-colors 
                duration-200
                ${
                  isSubmitting
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-zinc-800'
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
          Check your email
        </h2>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-gray-600 mb-4">
            We've sent a verification link to {user.email}. Please click the
            link to verify your account.
          </p>
          <p className="text-sm text-gray-500">
            If you don't see the email, check your spam folder or{' '}
            {getResendButton()}
          </p>
        </div>
      </div>
    </div>
  );
};

const OrganizationModal = ({ onClose, formData, setFormData }) => {
  const handleSubmit = (e) => {};

  const handleTopicSelect = (topic) => {
    setFormData((prev) => ({
      ...prev,
      topics: prev.topics.includes(topic)
        ? prev.topics.filter((t) => t !== topic)
        : [...prev.topics, topic],
    }));
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
          {/* Name */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Name</label>
            <input
              type="text"
              placeholder="Enter your organization name"
              className="w-full px-4 py-3 rounded-full bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
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

          {/* Organization Type */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Organization type
            </label>
            <div className="relative">
              <select
                className="w-full px-4 py-3 rounded-full bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none"
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
              >
                <option value="">Select organization type</option>
                <option value="ngo">NGO</option>
                <option value="company">Company</option>
                <option value="government">Government</option>
              </select>
              <ChevronDown
                className="absolute right-4 top-3.5 text-gray-400"
                size={20}
              />
            </div>
          </div>

          {/* Country */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Country</label>
            <div className="relative">
              <select
                className="w-full px-4 py-3 rounded-full bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none"
                value={formData.country}
                onChange={(e) =>
                  setFormData({ ...formData, country: e.target.value })
                }
              >
                <option value="">Select country</option>
                <option value="kenya">Kenya</option>
                <option value="uganda">Uganda</option>
                <option value="tanzania">Tanzania</option>
              </select>
              <ChevronDown
                className="absolute right-4 top-3.5 text-gray-400"
                size={20}
              />
            </div>
          </div>

          {/* Topics */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Topics</label>
            <div className="relative">
              <div className="flex flex-wrap gap-2 p-2 border border-gray-200 rounded-2xl bg-white min-h-[48px]">
                {formData.topics.map((topic) => (
                  <span
                    key={topic}
                    className="px-3 py-1 bg-gray-100 rounded-full text-sm flex items-center gap-1"
                  >
                    {topic}
                    <button
                      type="button"
                      onClick={() => handleTopicSelect(topic)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => handleTopicSelect('Agrifood')}
                  className={`mr-2 px-3 py-1 rounded-full text-sm ${
                    formData.topics.includes('Agrifood')
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  Agrifood
                </button>
                <button
                  type="button"
                  onClick={() => handleTopicSelect('Social Accountability')}
                  className={`px-3 py-1 rounded-full text-sm ${
                    formData.topics.includes('Social Accountability')
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  Social Accountability
                </button>
              </div>
            </div>
          </div>

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
