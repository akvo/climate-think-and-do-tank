import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';

const LoadingSpinner = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
    <div className="w-16 h-16 border-4 border-t-4 border-green-500 rounded-full animate-spin"></div>
  </div>
);

const withAuth = (WrappedComponent) => {
  return (props) => {
    const router = useRouter();
    const { user, isAuthenticated, loading } = useSelector(
      (state) => state.auth
    );

    useEffect(() => {
      if (!isAuthenticated && !loading) {
        router.replace('/login');
      }
    }, [isAuthenticated, loading, router]);

    if (loading) {
      return <LoadingSpinner />;
    }

    if (!isAuthenticated) {
      return null;
    }

    // Render the wrapped component
    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
