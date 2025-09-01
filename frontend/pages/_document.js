import { Html, Head, Main, NextScript } from 'next/document';
import Script from 'next/script';
import { env } from '../helpers/env-vars.js';

export default function Document() {
  const piwikSiteId = env('NEXT_PUBLIC_PIWIK_SITE_ID');

  return (
    <Html lang="en">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link
          href="https://fonts.googleapis.com/css2?family=Assistant:wght@200..800&family=Roboto+Slab:wght@100..900&display=swap"
          rel="stylesheet"
        />

        {/* Load AkvoRAG CSS (if it has one) */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/akvo-rag-js@1.1.5/dist/akvo-rag.css"
        />
      </Head>
      <body className="antialiased">
        <Main />
        <Script strategy="beforeInteractive" src="/__ENV.js" />
        {piwikSiteId && (
          <Script strategy="beforeInteractive" id="piwik-analytics">
            {`
(function(window, document, dataLayerName, id) {
window[dataLayerName]=window[dataLayerName]||[],window[dataLayerName].push({start:(new Date).getTime(),event:"stg.start"});var scripts=document.getElementsByTagName('script')[0],tags=document.createElement('script');
var qP=[];dataLayerName!=="dataLayer"&&qP.push("data_layer_name="+dataLayerName);var qPString=qP.length>0?("?"+qP.join("&")):"";
tags.async=!0,tags.src="https://akvo.containers.piwik.pro/"+id+".js"+qPString,scripts.parentNode.insertBefore(tags,scripts);
!function(a,n,i){a[n]=a[n]||{};for(var c=0;c<i.length;c++)!function(i){a[n][i]=a[n][i]||{},a[n][i].api=a[n][i].api||function(){var a=[].slice.call(arguments,0);"string"==typeof a[0]&&window[dataLayerName].push({event:n+"."+i+":"+a[0],parameters:[].slice.call(arguments,1)})}}(i[c])}(window,"ppms",["tm","cm"]);
})(window, document, 'dataLayer', '${piwikSiteId}');
            `}
          </Script>
        )}
        <NextScript />
      </body>
    </Html>
  );
}
