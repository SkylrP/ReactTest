import { VideoSplitter } from "@/components/VideoSplitter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        <VideoSplitter />
      </main>
      <Footer />
    </div>
  );
}
