'use client';

import Terminal from '@/components/Terminal';
import GameLoop from '@/components/GameLoop';

export default function Home() {
  return (
    <main className="h-screen w-screen overflow-hidden bg-black">
      <Terminal />
      <GameLoop />
    </main>
  );
}
