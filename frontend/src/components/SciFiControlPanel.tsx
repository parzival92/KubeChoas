'use client';

import { useGameStore } from '@/store/gameStore';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Settings, History, BarChart2, StopCircle, Power, Zap, ChevronRight, Cpu } from 'lucide-react';

export default function SciFiControlPanel() {
    const {
        isGameRunning,
        startGame,
        stopGame,
        score,
        terminalHistory
    } = useGameStore();

    const [showScoreModal, setShowScoreModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);

    return (
        <Card className="bg-[#050a14]/90 backdrop-blur-xl shadow-[0_0_40px_rgba(189,0,255,0.1)] border border-cyber-pink/30 rounded-xl p-6 h-full relative overflow-hidden group flex flex-col">

            {/* Decorative corner accents */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyber-pink" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyber-pink" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyber-pink" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyber-pink" />

            <h2 className="text-xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyber-pink to-purple-500 flex items-center gap-2 tracking-wider uppercase">
                <Zap className="w-5 h-5 text-cyber-pink animate-pulse" />
                Chaos_Control
            </h2>

            {/* Main Launch Button */}
            <div className="mb-8 flex justify-center">
                {!isGameRunning ? (
                    <button
                        onClick={startGame}
                        className="group relative w-full py-6 bg-transparent border-2 border-emerald-500/50 text-emerald-400 font-bold text-lg uppercase tracking-widest hover:bg-emerald-500/10 hover:border-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all duration-300 overflow-hidden clip-path-polygon"
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            <Power className="w-6 h-6" /> Initialize
                        </span>
                        <div className="absolute inset-0 bg-emerald-500/5 transform skew-x-12 translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                    </button>
                ) : (
                    <button
                        onClick={stopGame}
                        className="group relative w-full py-6 bg-transparent border-2 border-red-500/50 text-red-400 font-bold text-lg uppercase tracking-widest hover:bg-red-500/10 hover:border-red-400 hover:shadow-[0_0_30px_rgba(239,68,68,0.4)] transition-all duration-300 overflow-hidden"
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            <StopCircle className="w-6 h-6" /> Terminate
                        </span>
                        <div className="absolute inset-0 bg-red-500/5 transform skew-x-12 translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                    </button>
                )}
            </div>

            {/* Quick Actions Grid */}
            <div className="mt-auto">
                <h3 className="text-xs font-bold mb-3 text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Cpu className="w-4 h-4" /> Modules
                </h3>
                <div className="grid grid-cols-1 gap-3">
                    <Button
                        className="w-full flex items-center justify-between bg-white/5 hover:bg-cyber-blue/10 border border-white/10 hover:border-cyber-blue/50 text-gray-300 hover:text-cyber-blue transition-all group"
                        onClick={() => setShowScoreModal(true)}
                    >
                        <span className="flex items-center gap-2"><BarChart2 className="w-4 h-4" /> Metrics</span>
                        <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Button>
                    <Button
                        className="w-full flex items-center justify-between bg-white/5 hover:bg-cyber-pink/10 border border-white/10 hover:border-cyber-pink/50 text-gray-300 hover:text-cyber-pink transition-all group"
                        onClick={() => setShowHistoryModal(true)}
                    >
                        <span className="flex items-center gap-2"><History className="w-4 h-4" /> Logs</span>
                        <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Button>
                    <Button
                        className="w-full flex items-center justify-between bg-white/5 hover:bg-yellow-400/10 border border-white/10 hover:border-yellow-400/50 text-gray-300 hover:text-yellow-400 transition-all group"
                        onClick={() => setShowSettingsModal(true)}
                    >
                        <span className="flex items-center gap-2"><Settings className="w-4 h-4" /> Config</span>
                        <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Button>
                </div>
            </div>

            {/* Modals */}
            <Dialog open={showScoreModal} onOpenChange={setShowScoreModal}>
                <DialogContent className="bg-[#050a14] border border-cyber-blue/30 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-cyber-blue">Mission Report</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2 font-mono">
                        <div className="flex justify-between"><span>Score:</span> <span className="text-yellow-400">{score.totalScore}</span></div>
                        <div className="flex justify-between"><span>MTTR:</span> <span className="text-cyber-blue">{score.mttr.toFixed(1)}s</span></div>
                        <div className="flex justify-between"><span>Resolved:</span> <span className="text-emerald-400">{score.incidentsResolved}</span></div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Placeholder for other modals */}
            <Dialog open={showHistoryModal} onOpenChange={setShowHistoryModal}>
                <DialogContent className="bg-[#050a14] border border-cyber-pink/30 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-cyber-pink">System Logs</DialogTitle>
                    </DialogHeader>
                    <div className="h-64 overflow-y-auto font-mono text-xs text-gray-300">
                        {terminalHistory.map((log, i) => (
                            <div key={i} className="border-b border-white/5 py-1">{log}</div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
                <DialogContent className="bg-[#050a14] border border-yellow-400/30 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-yellow-400">Configuration</DialogTitle>
                    </DialogHeader>
                    <div className="text-center text-gray-500 py-8">
                        Settings module unavailable in simulation mode.
                    </div>
                </DialogContent>
            </Dialog>

        </Card>
    );
}
