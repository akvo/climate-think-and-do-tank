import { useEffect, useState } from "react";
import HeroSlider from "@/components/HeroSlider";
import KenyaMap from "@/components/KenyaMap";
import { MarkdownRenderer } from "@/components/MarkDownRenderer";
import InvestmentCarousel from "@/components/InvestmentCarousel";
import { useRouter } from "next/router";
import StatsGrid from "@/components/StatsGrid";
import Head from "next/head";
import Script from "next/script";

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
      <Head>
        {/* Load AkvoRAG CSS (if it has one) */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/akvo-rag-js@1.1.5/dist/akvo-rag.css"
        />
      </Head>

      {/* Load AkvoRAG JS */}
      {shouldLoadChat && (
        <Script
          src="https://cdn.jsdelivr.net/npm/akvo-rag-js@1.1.5/dist/akvo-rag.js"
          strategy="afterInteractive"
          onLoad={() => {
            if (typeof window !== "undefined" && window.AkvoRAG) {
              window.AkvoRAG.initChat({
                title: "Akvo RAG",
                kb_options: [
                  {
                    kb_id: 34,
                    label: "UNEP Knowledge Base",
                  },
                  {
                    kb_id: 28,
                    label: "Living Income Benchmark Knowledge Base",
                  },
                ],
                wsURL: "ws://akvo-rag.akvotest.org/ws/chat",
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

export default function HomePage() {
  const router = useRouter();

  const [data, setData] = useState({
    title: "",
    description: "",
  });

  return (
    <>
      <LoadAkvoRag />

      <main className="min-h-screen bg-white">
        <HeroSlider setData={setData} />

        <section className="bg-gray-50 py-20 text-gray-800 border-t border-gray-100">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-16 items-center">
              <div className="col-span-1 md:col-span-5">
                <h2 className="text-4xl font-bold text-gray-800 leading-tight mb-6">
                  {data.title}
                </h2>
              </div>
              <div className="col-span-1 md:col-span-7 space-y-8 text-[14px]">
                <MarkdownRenderer content={data.description} />
              </div>
            </div>

            <StatsGrid />
          </div>
        </section>

        <section className="py-16 text-black">
          <div className="container mx-auto px-4 flex justify-center">
            <KenyaMap
              onSelect={(selected) =>
                router.push(`/social-accountability?regions=${selected}`)
              }
            />
          </div>
        </section>

        <InvestmentCarousel />
      </main>
    </>
  );
}
