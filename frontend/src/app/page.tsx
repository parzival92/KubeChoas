'use client';

import GameLoop from '@/components/GameLoop';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import TerminalPreview from '@/components/TerminalPreview';
import StatsSidebar from '@/components/StatsSidebar';

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-[#0a0b0f] via-[#141520] to-[#0a0b0f] relative overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <GameLoop />

      {/* Main Container */}
      <div className="relative z-10 min-h-screen flex flex-col p-8 gap-8">
        {/* Header */}
        <Header />

        {/* Main Content Grid */}
        <div className="flex-1 flex gap-6 items-start">
          {/* Left Sidebar */}
          <Sidebar />

          {/* Center Content */}
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-4xl">
              <TerminalPreview />
            </div>
          </div>

          {/* Right Sidebar */}
          <StatsSidebar />
        </div>
      </div>
    </main>
  );
}
