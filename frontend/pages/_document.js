import { Html, Head, Main, NextScript } from 'next/document';
import Script from 'next/script';

export default function Document() {
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
        <NextScript />
      </body>
    </Html>
  );
}
