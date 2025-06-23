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
      <LoadAkvoRag />
      <AuthProvider>
        <AppContent Component={Component} pageProps={pageProps} />
      </AuthProvider>
    </Provider>
  );
}

export default MyApp;
