'use client';

import Cluster3DVisualizer from '@/components/Cluster3DVisualizer';
import CyberTerminal from '@/components/CyberTerminal';
import SciFiControlPanel from '@/components/SciFiControlPanel';
import SystemStatusPanel from '@/components/SystemStatusPanel';
import GameLoop from '@/components/GameLoop';
import { Activity, Shield, Cpu } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white font-sans selection:bg-cyber-pink selection:text-white overflow-hidden relative flex flex-col">

      <div className="container mx-auto p-4 flex-1 flex flex-col gap-4 relative z-10 min-h-0">
        {/* Header */}
        <header className="flex justify-between items-center p-4 border-b border-white/10 bg-black/40 backdrop-blur rounded-xl border border-white/5 shrink-0">
          <h1 className="text-2xl md:text-3xl font-cyber text-transparent bg-clip-text bg-gradient-to-r from-cyber-blue to-cyber-pink tracking-widest uppercase">
            KUBE_CHAOS // OPS_CENTER
          </h1>
          <div className="hidden md:flex gap-6 text-xs font-mono text-gray-400">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>SYSTEM: STABLE</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyber-blue" />
              <span>DEFENSE: ACTIVE</span>
            </div>
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-400" />
              <span>CORE: ONLINE</span>
            </div>
          </div>
        </header>

        {/* Main Content Grid - 3 Columns */}
        <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">

          {/* Left Column: System Status */}
          <div className="col-span-12 lg:col-span-2 min-h-0 h-full hidden lg:block">
            <SystemStatusPanel />
          </div>

          {/* Center Column: 3D Visualizer (Dominant) */}
          <div className="col-span-12 lg:col-span-8 min-h-0 h-full flex flex-col relative">
            <div className="absolute inset-0">
              <Cluster3DVisualizer />
            </div>
          </div>

          {/* Right Column: Controls */}
          <div className="col-span-12 lg:col-span-2 min-h-0 h-full hidden lg:block">
            <SciFiControlPanel />
          </div>
        </div>

        {/* Bottom Section: Terminal */}
        <div className="h-[250px] shrink-0">
          <CyberTerminal />
        </div>
      </div>

      <GameLoop />
    </main>
  );
}
