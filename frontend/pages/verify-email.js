// pages/verify-email.js
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
    if (!result.error) {
      setVerified(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Verifying your email...</h2>
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
      </div>
    </div>
  );
}
