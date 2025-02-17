import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { verifyEmail } from '../store/slices/authSlice';

export default function VerifyEmail() {
  const [verified, setVerified] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const { token } = router.query;
  const { loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      verifyToken();
    }
  }, [token]);

  const verifyToken = async () => {
    const result = await dispatch(verifyEmail(token));
    if (result.payload?.user?.id) {
      // Updated to match our response
      setVerified(true);
      setTimeout(() => {
        router.push('/signin');
      }, 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Verifying your email...</h2>
          <div className="mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600">
            Verification failed
          </h2>
          <p className="mt-2">{error}</p>
          <button
            onClick={() => router.push('/signin')}
            className="mt-4 text-blue-600 hover:text-blue-800 underline"
          >
            Return to login
          </button>
        </div>
      </div>
    );
  }

  if (verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-green-600">
            Email verified successfully!
          </h2>
          <p className="mt-2">Redirecting to login page...</p>
          <div className="mt-4">
            <p className="text-sm text-gray-600">Not redirected?</p>
            <button
              onClick={() => router.push('/signin')}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Click here to login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-xl font-semibold">
          Waiting for verification token...
        </h2>
        <div className="mt-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      </div>
    </div>
  );
}
