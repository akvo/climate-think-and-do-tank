import { Html, Head, Main, NextScript } from "next/document";
import Script from "next/script";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body className="antialiased">
        <Main />
        <Script strategy="beforeInteractive" src="/__ENV.js" />
        <NextScript />
      </body>
    </Html>
  );
}
