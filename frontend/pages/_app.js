import { Provider } from 'react-redux';
import { store } from '../store';
import '@/styles/globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useRouter } from 'next/router';

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  const pagesWithoutHeader = ['/login', '/signup', '/admin'];

  const shouldShowHeader = !pagesWithoutHeader.includes(router.pathname);

  return (
    <Provider store={store}>
      {shouldShowHeader && <Header />}
      <Component {...pageProps} />
      <Footer />
    </Provider>
  );
}

export default MyApp;
