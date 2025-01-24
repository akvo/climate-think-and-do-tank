import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { login, forgotPassword, resetPassword } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { status, error, user } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    forgotPassword: false,
    resetCode: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    'https://picsum.photos/1200/800?random=1',
    'https://picsum.photos/1200/800?random=2',
    'https://picsum.photos/1200/800?random=3',
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
      if (formData.forgotPassword && formData.resetCode) {
        await dispatch(
          resetPassword({
            email: formData.email,
            resetCode: formData.resetCode,
            newPassword: formData.newPassword,
          })
        );
        setFormData({
          ...formData,
          forgotPassword: false,
          resetCode: '',
          newPassword: '',
          confirmNewPassword: '',
        });
        setFormErrors({ general: 'Password reset successfully' });
      } else if (formData.forgotPassword) {
        await dispatch(forgotPassword(formData.email));
        setFormData({ ...formData, resetCode: true, forgotPassword: false });
      } else {
        await dispatch(
          login({ email: formData.email, password: formData.password })
        );
        // Redirect to home page or dashboard
        router.push('/');
      }
    } catch (error) {
      console.log(error);
      setFormErrors({
        general: error.message || 'Invalid email or password',
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
    <div className="flex min-h-screen">
      {/* Left Section */}
      <div className="w-1/2 p-12 flex flex-col justify-center bg-white text-black">
        <div className="max-w-md mx-auto w-full">
          <div className="mb-12">
            <h1 className="text-xl font-bold flex items-center gap-1">
              THINK
              <span className="text-green-600">&</span>
              DO TANK
            </h1>
          </div>

          <div className="mb-8">
            <h2 className="text-4xl font-bold mb-4">
              Welcome to the Think and Do Tank Network
            </h2>
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link href="/signup" className="text-gray-900 underline">
                Create a account
              </Link>
            </p>
            <p className="text-sm text-gray-500">
              It takes less than a minute.
            </p>
          </div>

          {formErrors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
              {formErrors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!formData.forgotPassword ? (
              <>
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="user@address.com"
                    className={`w-full px-3 py-2 bg-gray-50 border ${
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

                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 bg-gray-50 border ${
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
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-sm text-gray-600 hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="user@address.com"
                    className={`w-full px-3 py-2 bg-gray-50 border ${
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
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleSubmit}
                    className={`
                      w-full 
                      bg-zinc-900 
                      text-white 
                      py-3 
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
                    {isSubmitting ? 'Sending...' : 'Send Reset Code'}
                  </button>
                </div>

                {formData.resetCode && (
                  <>
                    <div className="space-y-2">
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
                        className={`w-full px-3 py-2 bg-gray-50 border ${
                          formErrors.resetCode
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-200 focus:ring-green-500'
                        } rounded-md focus:outline-none focus:ring-2 focus:border-transparent`}
                      />
                      {formErrors.resetCode && (
                        <p className="mt-1 text-sm text-red-600">
                          {formErrors.resetCode}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
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
                        className={`w-full px-3 py-2 bg-gray-50 border ${
                          formErrors.newPassword
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-200 focus:ring-green-500'
                        } rounded-md focus:outline-none focus:ring-2 focus:border-transparent`}
                      />
                      {formErrors.newPassword && (
                        <p className="mt-1 text-sm text-red-600">
                          {formErrors.newPassword}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
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
                        className={`w-full px-3 py-2 bg-gray-50 border ${
                          formErrors.confirmNewPassword
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-200 focus:ring-green-500'
                        } rounded-md focus:outline-none focus:ring-2 focus:border-transparent`}
                      />
                      {formErrors.confirmNewPassword && (
                        <p className="mt-1 text-sm text-red-600">
                          {formErrors.confirmNewPassword}
                        </p>
                      )}
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`
                          w-full 
                          bg-zinc-900 
                          text-white 
                          py-3 
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
                        {isSubmitting ? 'Resetting...' : 'Reset Password'}
                      </button>
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
                  bg-zinc-900 
                  text-white 
                  py-3 
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
                {isSubmitting ? 'Logging in...' : 'Log In'}
              </button>
            )}
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
              src={slide}
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
  );
}
