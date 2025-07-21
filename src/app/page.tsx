'use client';

import SimpleTerminal from '@/components/SimpleTerminal';
import GameControls from '@/components/GameControls';
import ClusterDashboard from '@/components/ClusterDashboard';
import GameLoop from '@/components/GameLoop';
import { Card } from '@/components/ui/card';

export default function Home() {
  return (
    <main className="min-h-screen bg-transparent">
      <div className="container mx-auto p-4">
        {/* Hero Section */}
        <Card className="mb-8 p-8 bg-gradient-to-br from-gray-900/90 to-gray-800/80 shadow-xl border border-emerald-900/30">
          <h1 className="text-4xl md:text-5xl font-extrabold text-center text-emerald-400 mb-2 tracking-tight drop-shadow-lg">
            KubeChaos: <span className="text-white">Cluster Under Siege</span>
          </h1>
          <p className="text-center text-gray-300 text-lg max-w-2xl mx-auto mb-2">
            <span className="text-emerald-300 font-semibold">A DevOps Chaos Simulator Game</span> for SREs & Engineers
          </p>
          <p className="text-center text-gray-400 text-sm max-w-xl mx-auto">
            Defend your cluster against chaos attacks using real kubectl commands. Monitor, investigate, and resolve incidents in real time!
          </p>
        </Card>

        {/* Top Row: Terminal + Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Terminal Section */}
          <Card className="border border-emerald-900/40 shadow-lg flex flex-col h-full">
            <SimpleTerminal />
          </Card>

          {/* Game Controls */}
          <Card className="border border-blue-900/40 shadow-lg flex flex-col h-full">
            <GameControls />
          </Card>
        </div>

        {/* Cluster Dashboard - full width below */}
        <Card className="mt-8 bg-gray-900/90 border border-purple-900/40 shadow-lg">
          <ClusterDashboard />
        </Card>
      </div>
      {/* Game Loop - handles chaos events */}
      <GameLoop />
    </main>
  );
}
