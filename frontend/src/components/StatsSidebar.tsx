'use client';

import { useGameStore } from '@/store/gameStore';
import { Cloud, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

// Cloud with lightning icon component
function CloudLightningIcon() {
    return (
        <div className="relative w-24 h-24 flex items-center justify-center">
            <Cloud className="w-20 h-20 text-blue-400 stroke-[1.5]" />
            <Zap className="w-8 h-8 text-blue-400 fill-blue-400/20 absolute" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -20%)' }} />
        </div>
    );
}

export default function StatsSidebar() {
    const { pods, chaosEvents, activeEvents } = useGameStore();
    const [nextChaosIn, setNextChaosIn] = useState(14);

    // Countdown timer for next chaos event
    useEffect(() => {
        const interval = setInterval(() => {
            setNextChaosIn((prev) => (prev <= 0 ? 15 : prev - 1));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const runningPods = pods.filter(p => p.status === 'Running').length;
    const pendingPods = pods.filter(p => p.status === 'Pending').length;
    const crashedPods = pods.filter(p => p.status === 'Failed' || p.status === 'CrashLoopBackOff').length;

    return (
        <div className="w-72 space-y-4">
            {/* System Status Card */}
            <div className="bg-[#1a1b26]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-2xl">
                <h3 className="text-lg font-semibold text-white mb-4">
                    System Status
                </h3>

                <div className="space-y-4">
                    <StatItem
                        label="Pods Running"
                        value={runningPods}
                    />
                    <StatItem
                        label="Failures"
                        value={crashedPods}
                    />
                    <StatItem
                        label="Active Chaos Events"
                        value={activeEvents.length}
                    />
                </div>
            </div>

            {/* Cloud Icon Card */}
            <div className="bg-[#1a1b26]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-2xl">
                <div className="flex flex-col items-center">
                    <CloudLightningIcon />
                    <h3 className="text-xl font-semibold text-white mt-4 mb-6">
                        Pods Running
                    </h3>

                    <div className="w-full space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-400 text-sm">Failures</span>
                            <span className="text-white font-bold text-lg">{crashedPods}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-slate-400 text-sm">Active Chaos Events</span>
                            <span className="text-white font-bold text-lg">{activeEvents.length}</span>
                        </div>

                        <div className="pt-3 border-t border-white/5">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-400 text-sm">Next Chaos in:</span>
                                <span className="text-white font-bold text-lg">{nextChaosIn}s</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface StatItemProps {
    label: string;
    value: number;
}

function StatItem({ label, value }: StatItemProps) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">{label}</span>
            <span className="text-white font-bold text-2xl">{value}</span>
        </div>
    );
}
