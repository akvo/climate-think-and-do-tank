import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { verifyEmail } from '../store/slices/authSlice';
import Image from 'next/image';
import Link from 'next/link';
import Button from '@/components/Button';
import { VerifyEmailIcon } from '@/components/Icons';

export default function VerifyEmail() {
  const [verified, setVerified] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const { confirmation } = router.query;
  const { loading, error } = useSelector((state) => state.auth);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: '/images/auth/auth-slide-2.jpg',
      quote:
        'Speed meets strategy\u2014navigate the investment landscape effortlessly with real-time insights and adaptive tools.',
      author: 'Kwame Mfugaji',
      location: 'Kajiado, Kenya',
    },
    {
      image: '/images/auth/auth-slide-4.jpg',
      quote:
        'Capitalize on opportunities instantly with smart tools that keep you ahead in a dynamic market.',
      author: 'Kwame Mfugaji',
      location: 'Kajiado, Kenya',
    },
  ];

  useEffect(() => {
    if (confirmation) {
      verifyToken();
    }
  }, [confirmation]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const verifyToken = async () => {
    const result = await dispatch(verifyEmail(confirmation));
    if (result.payload?.user?.id) {
      setVerified(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-500 mb-6"></div>
          <h2 className="text-2xl sm:text-3xl font-bold text-black mb-2">
            Verifying your email...
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Please wait while we confirm your email address
          </p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-black mb-2">
            Verification failed
          </h2>
          <p className="text-gray-600 text-sm sm:text-base mb-6">{error}</p>
          <Button className="min-w-72" onClick={() => router.push('/login')}>
            Return to Login
          </Button>
        </div>
      );
    }

    if (verified) {
      return (
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <svg
              className="w-8 h-8 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-black mb-2">
            Email verified successfully!
          </h2>
          <p className="text-gray-600 text-sm sm:text-base mb-6">
            Redirecting to login page...
          </p>
          <Button className="min-w-72" onClick={() => router.push('/login')}>
            Go to Login
          </Button>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center text-center">
        <VerifyEmailIcon />
        <h2 className="text-2xl sm:text-3xl font-bold text-black mb-2 mt-4">
          Waiting for verification...
        </h2>
        <p className="text-gray-600 text-sm sm:text-base">
          Please wait while we process your request
        </p>
      </div>
    );
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
            {renderContent()}
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
