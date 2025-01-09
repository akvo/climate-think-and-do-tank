// pages/verification-pending.js
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { resendVerification } from '../store/slices/authSlice';

export default function VerificationPending() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);
  const [resendStatus, setResendStatus] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/signup');
    }
  }, [user, router]);

  const handleResendVerification = async () => {
    if (loading) return;

    setResendStatus('sending');
    const result = await dispatch(resendVerification(user.email));

    if (result.payload?.success) {
      setResendStatus('success');
      // Reset status after 3 seconds
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
          Check your email
        </h2>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-gray-600 mb-4">
            We've sent a verification link to {user?.email}. Please click the
            link to verify your account.
          </p>
          <p className="text-sm text-gray-500">
            If you don't see the email, check your spam folder or
            {getResendButton()}
          </p>
        </div>
      </div>
    </div>
  );
}
