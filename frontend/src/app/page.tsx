'use client';

import Terminal from '@/components/Terminal';
import GameLoop from '@/components/GameLoop';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0B0D0E] flex items-center justify-center p-6">
      <Terminal />
      <GameLoop />
    </div>
  );
}
