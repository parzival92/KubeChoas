'use client';

import { useGameStore } from '@/store/gameStore';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Activity, Shield, Cpu, Wifi, Server, Database } from 'lucide-react';

export default function SystemStatusPanel() {
    const {
        isGameRunning,
        gameStartTime,
        score,
        activeEvents
    } = useGameStore();

    const [elapsedTime, setElapsedTime] = useState(0);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isGameRunning && gameStartTime) {
            interval = setInterval(() => {
                setElapsedTime(Math.floor((Date.now() - gameStartTime.getTime()) / 1000));
            }, 1000);
        } else {
            setElapsedTime(0);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isGameRunning, gameStartTime]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        const minsStr = mins < 10 ? `0${mins}` : `${mins}`;
        const secsStr = secs < 10 ? `0${secs}` : `${secs}`;
        return `${minsStr}:${secsStr}`;
    };

    return (
        <Card className="bg-[#050a14]/80 backdrop-blur-xl border border-white/10 rounded-xl p-4 h-full flex flex-col gap-4 relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2 border-b border-white/10 pb-2">
                <Activity className="w-4 h-4 text-cyber-blue animate-pulse" />
                <h3 className="text-xs font-bold text-cyber-blue uppercase tracking-widest">System Metrics</h3>
            </div>

            {/* Game Timer & Status */}
            <div className="space-y-1">
                <div className="text-[10px] text-gray-500 uppercase">Mission Time</div>
                <div className="font-mono text-2xl text-white font-bold tracking-wider">
                    {formatTime(elapsedTime)}
                </div>
                <div className={`text-[10px] font-bold uppercase tracking-widest ${isGameRunning ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isGameRunning ? '● SYSTEM ONLINE' : '○ SYSTEM OFFLINE'}
                </div>
            </div>

            {/* Score & Events */}
            <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/5 p-2 rounded border border-white/5">
                    <div className="text-[10px] text-gray-500 uppercase">Score</div>
                    <div className="font-mono text-lg text-yellow-400">{score.totalScore}</div>
                </div>
                <div className="bg-white/5 p-2 rounded border border-white/5">
                    <div className="text-[10px] text-gray-500 uppercase">Threats</div>
                    <div className="font-mono text-lg text-red-500">{activeEvents.length}</div>
                </div>
            </div>

            {/* Decorative Metrics (Static/Mock for visual density) */}
            <div className="mt-auto space-y-3 pt-4 border-t border-white/5">
                <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-gray-400">
                        <span className="flex items-center gap-1"><Cpu className="w-3 h-3" /> CPU Load</span>
                        <span>42%</span>
                    </div>
                    <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-cyber-blue w-[42%] animate-pulse" />
                    </div>
                </div>
                <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-gray-400">
                        <span className="flex items-center gap-1"><Database className="w-3 h-3" /> Memory</span>
                        <span>68%</span>
                    </div>
                    <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-cyber-pink w-[68%] animate-pulse" />
                    </div>
                </div>
                <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-gray-400">
                        <span className="flex items-center gap-1"><Wifi className="w-3 h-3" /> Network</span>
                        <span>1.2 GB/s</span>
                    </div>
                    <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-400 w-[85%] animate-pulse" />
                    </div>
                </div>
            </div>

            {/* Scanline overlay */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-20 bg-[length:100%_2px,3px_100%] opacity-10" />
        </Card>
    );
}
