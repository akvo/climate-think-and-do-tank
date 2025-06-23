import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCookie } from 'cookies-next';
import axios from 'axios';
import { env } from '@/helpers/env-vars';
import { toast } from 'react-toastify';
import { logout } from '@/store/slices/authSlice';

const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const checkUserStatus = async () => {
    if (!isAuthenticated) return;

    try {
      const token = getCookie('token');
      if (!token) return;

      const response = await axios.get(
        `${env('NEXT_PUBLIC_BACKEND_URL')}/api/users/me`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const user = response.data;

      if (!user.approved || !user.confirmed) {
        dispatch(logout());

        if (!user.approved) {
          toast.error('Your account approval has been revoked');
        } else if (!user.confirmed) {
          toast.error('Your account confirmation has been revoked');
        }
      }
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        dispatch(logout());
        toast.error('Your account access has been revoked');
      }
    }
  };

  useEffect(() => {
    const handleFocus = () => {
      if (isAuthenticated) {
        checkUserStatus();
      }
    };

    let interval;
    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearInterval(interval);
      } else if (isAuthenticated) {
        checkUserStatus();
        interval = setInterval(checkUserStatus, 5 * 60 * 1000);
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    if (!document.hidden && isAuthenticated) {
      interval = setInterval(checkUserStatus, 5 * 60 * 1000);
    }

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, [isAuthenticated]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'auth-logout' && e.newValue === 'true') {
        dispatch(logout());
        toast.error('You have been signed out');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [dispatch]);

  return children;
};

export default AuthProvider;
