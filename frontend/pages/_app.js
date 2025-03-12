import { useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { store } from '../store';
import '@/styles/globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useRouter } from 'next/router';
import { fetchOrganizationsAndRegions } from '@/store/slices/authSlice';

function AppContent({ Component, pageProps }) {
  const dispatch = useDispatch();
  const router = useRouter();

  const pagesWithoutHeader = ['/login', '/signup', '/admin'];
  const shouldShowHeader = !pagesWithoutHeader.includes(router.pathname);

  useEffect(() => {
    dispatch(fetchOrganizationsAndRegions());
  }, [dispatch]);

  return (
    <>
      {shouldShowHeader && <Header />}
      <Component {...pageProps} />
      <Footer />
    </>
  );
}

function MyApp({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <AppContent Component={Component} pageProps={pageProps} />
    </Provider>
  );
}

export default MyApp;
