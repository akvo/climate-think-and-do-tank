import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { validateSignUp } from '@/helpers/utilities';
import { fetchOrganizationsAndSectors, signUp } from '@/store/slices/authSlice';
import Link from 'next/link';

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
    country: '',
    acceptTerms: false,
  });

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
                <label
                  htmlFor="organisation"
                  className="block text-sm font-medium text-black"
                >
                  Organization
                </label>
                <select
                  id="organisation"
                  name="organisation"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-500 text-black"
                  value={formData.organisation}
                  onChange={handleChange}
                >
                  <option value="">Select Organization</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.org_name}
                    </option>
                  ))}
                </select>
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
        {steps.find((step) => step.active)?.number === 3 && <ConfirmEmail />}
      </div>
    </div>
  );
};

const ConfirmEmail = ({ formData }) => {
  const [resendStatus, setResendStatus] = useState('');
  const handleResendVerification = async () => {
    if (loading) return;

    setResendStatus('sending');
    const result = await dispatch(resendVerification(user.email));

    if (result.payload?.success) {
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
            We've sent a verification link to {formData?.email}. Please click
            the link to verify your account.
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
