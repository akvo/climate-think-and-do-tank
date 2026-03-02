import { useEffect, useState } from "react";
import { Provider, useDispatch } from "react-redux";
import { store } from "../store";
import "@/styles/globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useRouter } from "next/router";
import {
  checkAuthStatus,
  fetchOrganizationsAndRegions,
} from "@/store/slices/authSlice";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Script from "next/script";
import AuthProvider from "@/components/AuthProvider";
import { env } from "@/helpers/env-vars";

function AppContent({ Component, pageProps }) {
  const dispatch = useDispatch();
  const router = useRouter();

  const pagesWithoutHeader = ["/login", "/signup", "/admin"];
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

function LoadMotomoAnalytics() {
  const motomoSiteId = env('NEXT_PUBLIC_MOTOMO_SITE_ID');

  if (!motomoSiteId) {
    return null;
  }
  return (
    <Script id="motomo-analytics" strategy="afterInteractive">
      {`
var _paq = window._paq = window._paq || [];
/* tracker methods like "setCustomDimension" should be called before "trackPageView" */
_paq.push(['trackPageView']);
_paq.push(['enableLinkTracking']);
(function() {
  var u="https://matomo.cloud.akvo.org/";
  _paq.push(['setTrackerUrl', u+'matomo.php']);
  _paq.push(['setSiteId', '${motomoSiteId}']);
  var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
  g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
})();
      `}
    </Script>
  );
}

function LoadAkvoRag() {
  const [shouldLoadChat, setShouldLoadChat] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const accessKey = params.get("rag_access");
      if (accessKey === "RAG_qnaWr4g") {
        setShouldLoadChat(true);
      }
    }
  }, []);

  return (
    <>
      {/* Load AkvoRAG JS */}
      {shouldLoadChat && (
        <Script
          src="https://cdn.jsdelivr.net/npm/akvo-rag-js@1.1.5/dist/akvo-rag.js"
          strategy="afterInteractive"
          onLoad={() => {
            if (typeof window !== "undefined" && window.AkvoRAG) {
              window.AkvoRAG.initChat({
                title: "Kenya Drylands Assistant",
                kb_id: 36,
                wsURL: "wss://akvo-rag.akvotest.org/ws/chat",
              });
            } else {
              console.error("AkvoRAG is not available on window");
            }
          }}
        />
      )}
    </>
  );
}

function MyApp({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <LoadMotomoAnalytics />
      <LoadAkvoRag />
      <AuthProvider>
        <AppContent Component={Component} pageProps={pageProps} />
      </AuthProvider>
    </Provider>
  );
}

export default MyApp;
