import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { login, forgotPassword, resetPassword } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { H3 } from '@/components/Heading';
import { ParagraphMD } from '@/components/Text';
import Button from '@/components/Button';

export default function LoginForm() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    forgotPassword: false,
    showResetCode: false,
    resetCode: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  const slides = [
    {
      image: '/images/auth/auth-slide-2.jpg',
      quote: 'Speed meets strategy—navigate the investment landscape effortlessly with real-time insights and adaptive tools.',
      author: 'Kwame Mfugaji',
      location: 'Kajiado, Kenya',
    },
    {
      image: '/images/auth/auth-slide-4.jpg',
      quote: 'Capitalize on opportunities instantly with smart tools that keep you ahead in a dynamic market.',
      author: 'Kwame Mfugaji',
      location: 'Kajiado, Kenya',
    },
  ];

  const validateForm = () => {
    const errors = {};

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email address';
    }

    if (formData.forgotPassword) {
    } else if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.resetCode) {
      if (!formData.resetCode) {
        errors.resetCode = 'Reset code is required';
      }
      if (!formData.newPassword) {
        errors.newPassword = 'New password is required';
      }
      if (formData.newPassword !== formData.confirmNewPassword) {
        errors.confirmNewPassword = 'Passwords do not match';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setFormErrors({});

      if (formData.forgotPassword && formData.showResetCode) {
        const resetResult = await dispatch(
          resetPassword({
            email: formData.email,
            resetCode: formData.resetCode,
            newPassword: formData.newPassword,
          })
        );

        if (resetPassword.fulfilled.match(resetResult)) {
          setFormData({
            ...formData,
            forgotPassword: false,
            showResetCode: false,
            resetCode: '',
            newPassword: '',
            confirmNewPassword: '',
          });
          setFormErrors({ general: 'Password reset successfully' });
        } else {
          setFormErrors({
            general: resetResult.payload || 'Failed to reset password',
          });
        }
      } else if (formData.forgotPassword) {
        const forgotResult = await dispatch(forgotPassword(formData.email));

        if (forgotPassword.fulfilled.match(forgotResult)) {
          setFormData({
            ...formData,
            showResetCode: true,
            forgotPassword: true,
          });
        } else {
          setFormErrors({
            general: forgotResult.payload || 'Failed to send reset code',
          });
        }
      } else {
        const loginResult = await dispatch(
          login({ email: formData.email, password: formData.password })
        );

        if (login.fulfilled.match(loginResult)) {
          router.push('/');
        } else {
          setFormErrors({
            general: loginResult.payload || 'Login failed',
          });
        }
      }
    } catch (error) {
      console.error('Submission error:', error);
      setFormErrors({
        general: error.message || 'An unexpected error occurred',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.type === 'checkbox' ? e.target.checked : e.target.value,
    });
  };

  const handleForgotPassword = () => {
    setFormData({ ...formData, forgotPassword: true });
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white">
      <div className="w-full lg:w-1/2 p-6 sm:p-8 lg:p-12 flex flex-col justify-center min-h-screen lg:min-h-screen">
        <Link href="/" className="mb-4 block">
          <Image
            src="/images/logo.png"
            alt="Kenya Drylands Investment Hub Logo"
            width={230}
            height={40}
            priority
            className="w-48 sm:w-56 lg:w-60 h-auto"
          />
        </Link>

        <div className="flex-grow flex items-center">
          <div className="max-w-md lg:max-w-lg xl:max-w-xl mx-auto w-full">
            <div className="mb-8 lg:mb-12">
              <H3
                variant="bold"
                className="mb-3 lg:mb-4 text-2xl sm:text-3xl lg:text-4xl"
              >
                {formData.forgotPassword
                  ? 'Forgot your password'
                  : 'Welcome to the Kenya Drylands Investment Hub'}
              </H3>

              {formData.forgotPassword ? (
                <p className="text-gray-600 text-sm sm:text-base">
                  We&apos;ll send you a code to the email address you signed up
                  with
                </p>
              ) : (
                <ParagraphMD className="text-sm sm:text-base">
                  Login for your user account to access the platform&apos;s
                  features
                </ParagraphMD>
              )}
            </div>

            {formErrors.general && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm sm:text-base">
                {formErrors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {!formData.forgotPassword ? (
                <>
                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="block text-sm sm:text-md font-bold text-black"
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
                      className={`w-full px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-white border ${
                        formErrors.email
                          ? 'border-primary-500'
                          : 'border-gray-200'
                      } rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                    />
                    {formErrors.email && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600">
                        {formErrors.email}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="password"
                      className="block text-sm sm:text-md font-bold text-black"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        placeholder="Enter your password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleChange}
                        className={`w-full px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-white border ${
                          formErrors.password
                            ? 'border-red-500'
                            : 'border-gray-200'
                        } rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-10`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                      >
                        {showPassword ? (
                          <EyeOff size={18} className="sm:w-5 sm:h-5" />
                        ) : (
                          <Eye size={18} className="sm:w-5 sm:h-5" />
                        )}
                      </button>
                    </div>
                    {formErrors.password && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600">
                        {formErrors.password}
                      </p>
                    )}
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        className="text-xs sm:text-sm text-primary-500 font-bold hover:underline"
                      >
                        Forgot Password
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {!formData.forgotPassword ? (
                    <>
                      <div className="space-y-2">
                        <label
                          htmlFor="email"
                          className="block text-md font-bold text-black"
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
                          className={`w-full px-4 py-3 bg-white border  ${
                            formErrors.email
                              ? 'border-primary-500'
                              : 'border-gray-200'
                          } rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                        />
                        {formErrors.email && (
                          <p className="mt-1 text-sm text-red-600">
                            {formErrors.email}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="password"
                          className="block text-md font-bold text-black"
                        >
                          Password
                        </label>
                        <div className="relative">
                          <input
                            id="password"
                            name="password"
                            placeholder="Enter your password"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 bg-white border ${
                              formErrors.password
                                ? 'border-red-500'
                                : 'border-gray-200'
                            } rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-10`}
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
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={handleForgotPassword}
                            className="text-sm text-primary-500 font-bold hover:underline"
                          >
                            Forgot Password
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {!formData.showResetCode && (
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
                            className={`w-full px-4 py-3 bg-white border placeholder:text-black text-black ${
                              formErrors.email
                                ? 'border-red-500'
                                : 'border-gray-200'
                            } rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                          />
                          {formErrors.email && (
                            <p className="mt-1 text-sm text-red-600">
                              {formErrors.email}
                            </p>
                          )}

                          <div className="pt-6">
                            <Button
                              type="button"
                              disabled={isSubmitting}
                              onClick={handleSubmit}
                              className={`
                        w-full 
                      ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                            >
                              {isSubmitting ? 'Sending...' : 'Send Reset Code'}
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              disabled={isSubmitting}
                              onClick={() =>
                                setFormData({
                                  ...formData,
                                  forgotPassword: false,
                                })
                              }
                              className={`
                        w-full 
                        mt-2
                    `}
                            >
                              {'Back to Login'}
                            </Button>
                          </div>
                        </div>
                      )}

                      {formData.showResetCode && (
                        <>
                          <div className="space-y-2 text-black">
                            <label
                              htmlFor="resetCode"
                              className="block text-sm font-medium"
                            >
                              Reset Code
                            </label>
                            <input
                              id="resetCode"
                              name="resetCode"
                              type="text"
                              value={formData.resetCode}
                              onChange={handleChange}
                              className={`w-full px-4 py-3 bg-white border placeholder:text-black text-black ${
                                formErrors.resetCode
                                  ? 'border-red-500'
                                  : 'border-gray-200'
                              } rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                            />
                            {formErrors.resetCode && (
                              <p className="mt-1 text-sm text-red-600">
                                {formErrors.resetCode}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2 text-black">
                            <label
                              htmlFor="newPassword"
                              className="block text-sm font-medium"
                            >
                              New Password
                            </label>
                            <input
                              id="newPassword"
                              name="newPassword"
                              type="password"
                              value={formData.newPassword}
                              onChange={handleChange}
                              className={`w-full px-4 py-3 bg-white border placeholder:text-black text-black ${
                                formErrors.newPassword
                                  ? 'border-red-500'
                                  : 'border-gray-100'
                              } rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                            />
                            {formErrors.newPassword && (
                              <p className="mt-1 text-sm text-red-600">
                                {formErrors.newPassword}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2 text-black">
                            <label
                              htmlFor="confirmNewPassword"
                              className="block text-sm font-medium"
                            >
                              Confirm New Password
                            </label>
                            <input
                              id="confirmNewPassword"
                              name="confirmNewPassword"
                              type="password"
                              value={formData.confirmNewPassword}
                              onChange={handleChange}
                              className={`w-full px-4 py-3 bg-white border placeholder:text-black text-black ${
                                formErrors.confirmNewPassword
                                  ? 'border-red-500'
                                  : 'border-gray-200'
                              } rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                            />
                            {formErrors.confirmNewPassword && (
                              <p className="mt-1 text-sm text-red-600">
                                {formErrors.confirmNewPassword}
                              </p>
                            )}
                            <div className="pt-4">
                              <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`
                          w-full    
                        bg-primary-500 
                        text-white 
                          py-3 
                          rounded-full 
                          transition-colors 
                          duration-200
                          font-bold
                          ${
                            isSubmitting
                              ? 'opacity-50 cursor-not-allowed'
                              : 'hover:bg-zinc-800'
                          }
                        `}
                              >
                                {isSubmitting
                                  ? 'Resetting...'
                                  : 'Reset Password'}
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  )}

                  {!formData.forgotPassword && (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`
                    w-full 
                    font-bold
                    bg-primary-500 
                    text-white 
                    py-3 
                    rounded-full 
                    transition-colors 
                    duration-200
                    ${
                      isSubmitting
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:bg-primary-600'
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
                          Logging in...
                        </div>
                      ) : (
                        'Log In'
                      )}
                    </button>
                  )}
                </>
              )}

              {!formData.forgotPassword && (
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                  className={`w-full 
                ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
              `}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <svg
                        className="animate-spin h-4 w-4 sm:h-5 sm:w-5 mr-3"
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
                      Logging in...
                    </div>
                  ) : (
                    'Log In'
                  )}
                </Button>
              )}

              <p className="text-[#495057] flex items-center justify-center mt-4 gap-1 text-sm sm:text-base">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="text-primary-500 font-bold">
                  Sign up
                </Link>
              </p>

              <div className="text-center text-xs sm:text-sm text-gray-600 space-y-2">
                <p>
                  By submitting your files to the platform, you acknowledge that
                  you agree to our{' '}
                  <a href="/terms" className="text-primary-600 hover:underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a
                    href="/guidelines"
                    className="text-primary-600 hover:underline"
                  >
                    Community Guidelines
                  </a>
                </p>
                <p>
                  Please be sure not to violate others&apos; copyright or
                  privacy rights.{' '}
                  <a
                    href="/learn-more"
                    className="text-primary-600 hover:underline"
                  >
                    Learn more
                  </a>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="hidden lg:block lg:w-1/2 relative">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-500 ${
              currentSlide === index ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={slide.image}
              alt={`Slide ${index + 1}`}
              fill
              className="object-cover blur-[2px]"
              priority={index === 0}
            />
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 lg:p-12 text-white text-center">
              <p className="text-2xl lg:text-3xl xl:text-4xl font-bold leading-relaxed max-w-xl">
                {slide.quote}
              </p>
            </div>
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-white text-center z-10">
              <p className="font-extrabold text-xl">{slide.author}</p>
              <p className="text-white/80 font-semibold">{slide.location}</p>
            </div>
          </div>
        ))}

        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
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
  );
}
