'use client';

import SimpleTerminal from '@/components/SimpleTerminal';
import GameControls from '@/components/GameControls';
import ClusterDashboard from '@/components/ClusterDashboard';
import GameLoop from '@/components/GameLoop';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto p-4">
        <header className="mb-6">
          <h1 className="text-4xl font-bold text-center text-green-400 mb-2">
            KubeChaos: Cluster Under Siege
          </h1>
          <p className="text-center text-gray-300">
            A DevOps Chaos Simulator Game for SREs & Engineers
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Terminal Section */}
          <div className="lg:col-span-2">
            <div className="bg-black rounded-lg h-96 overflow-hidden">
              <SimpleTerminal />
            </div>
          </div>

          {/* Game Controls */}
          <div className="lg:col-span-1">
            <GameControls />
          </div>
        </div>

        {/* Cluster Dashboard */}
        <div className="mt-6">
          <ClusterDashboard />
        </div>
      </div>
      
      {/* Game Loop - handles chaos events */}
      <GameLoop />
    </main>
  );
}
