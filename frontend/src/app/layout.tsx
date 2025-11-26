import type { Metadata } from "next";
import { Orbitron, Fira_Code, Inter } from "next/font/google";
import "./globals.css";

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  display: "swap",
});

const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: "--font-fira-code",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
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
      <body className={`${inter.variable} ${orbitron.variable} ${firaCode.variable} bg-background min-h-screen text-foreground font-sans antialiased overflow-hidden`}>
        {children}
      </body>
    </html>
  );
}
