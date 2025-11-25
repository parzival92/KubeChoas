import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KubeChaos - Kubernetes Chaos Engineering Game",
  description: "A DevOps chaos simulator game for SREs & Engineers. Defend your cluster against chaos attacks using real kubectl commands.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background min-h-screen text-white font-sans">
        {/* Sticky Header */}
        <header className="sticky top-0 z-30 w-full bg-gradient-to-b from-gray-950/90 to-gray-900/80 shadow-lg border-b border-gray-800">
          <div className="container mx-auto flex items-center justify-between py-4 px-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-extrabold tracking-tight text-emerald-400 select-none">
                KubeChaos
                <span className="block h-1 w-10 bg-emerald-500 rounded-full mt-1 animate-pulse" />
              </span>
            </div>
            <nav className="flex items-center gap-4">
              <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-emerald-400 transition-colors text-lg font-bold">GitHub</a>
              <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors text-lg font-bold">Docs</a>
              {/* Theme toggle placeholder */}
              {/* <Button variant="ghost" size="icon"><SunIcon /></Button> */}
            </nav>
          </div>
        </header>
        <main className="bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 min-h-screen pb-12">
          {children}
        </main>
      </body>
    </html>
  );
}
