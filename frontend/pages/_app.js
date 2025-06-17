import { useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { store } from '../store';
import '@/styles/globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useRouter } from 'next/router';
import {
  checkAuthStatus,
  fetchOrganizationsAndRegions,
} from '@/store/slices/authSlice';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AuthProvider from '@/components/AuthProvider';

function AppContent({ Component, pageProps }) {
  const dispatch = useDispatch();
  const router = useRouter();

  const pagesWithoutHeader = ['/login', '/signup', '/admin'];
  const shouldShowHeader = !pagesWithoutHeader.includes(router.pathname);

  useEffect(() => {
    dispatch(fetchOrganizationsAndRegions());
    dispatch(checkAuthStatus());
  }, [dispatch]);

  return (
    <>
      {shouldShowHeader && <Header />}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
      />
      <Component {...pageProps} />
      {shouldShowHeader && <Footer />}
    </>
  );
}

function MyApp({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <AuthProvider>
        <AppContent Component={Component} pageProps={pageProps} />
      </AuthProvider>
    </Provider>
  );
}

export default MyApp;
