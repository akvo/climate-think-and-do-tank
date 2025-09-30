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

function LoadPiwikAnalytics() {
  const piwikSiteId = env('NEXT_PUBLIC_PIWIK_SITE_ID');

  if (!piwikSiteId) {
    return null;
  }

  return (
    <Script id="piwik-analytics" strategy="afterInteractive">
      {`
(function(window, document, dataLayerName, id) {
window[dataLayerName]=window[dataLayerName]||[],window[dataLayerName].push({start:(new Date).getTime(),event:"stg.start"});var scripts=document.getElementsByTagName('script')[0],tags=document.createElement('script');
var qP=[];dataLayerName!=="dataLayer"&&qP.push("data_layer_name="+dataLayerName);var qPString=qP.length>0?("?"+qP.join("&")):"";
tags.async=!0,tags.src="https://akvo.containers.piwik.pro/"+id+".js"+qPString,scripts.parentNode.insertBefore(tags,scripts);
!function(a,n,i){a[n]=a[n]||{};for(var c=0;c<i.length;c++)!function(i){a[n][i]=a[n][i]||{},a[n][i].api=a[n][i].api||function(){var a=[].slice.call(arguments,0);"string"==typeof a[0]&&window[dataLayerName].push({event:n+"."+i+":"+a[0],parameters:[].slice.call(arguments,1)})}}(i[c])}(window,"ppms",["tm","cm"]);
})(window, document, 'dataLayer', '${piwikSiteId}');
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
      <LoadPiwikAnalytics />
      <LoadAkvoRag />
      <AuthProvider>
        <AppContent Component={Component} pageProps={pageProps} />
      </AuthProvider>
    </Provider>
  );
}

export default MyApp;
