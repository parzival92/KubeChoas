import ScenarioCard from './ScenarioCard';
import { Cloud, Flame, AlertTriangle } from 'lucide-react';

export default function TerminalPreview() {
    return (
        <div className="bg-[#1a1b26]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
            {/* Outer Terminal Window */}
            <div className="bg-[#0f1113] rounded-xl border border-white/5 shadow-xl overflow-hidden">
                {/* Outer Title bar */}
                <div className="bg-[#2a2d3a] px-4 py-2 flex items-center gap-2">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                        <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                        <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                    </div>
                </div>

                {/* Terminal content */}
                <div className="p-6 space-y-6">
                    <div className="font-mono text-sm text-[#9da1a6]">
                        Last login: Tue Apr 23 17:06:57 on console
                    </div>

                    {/* Inner Terminal Window */}
                    <div className="bg-[#0a0b0f] rounded-xl border border-white/5 overflow-hidden">
                        {/* Inner Title bar */}
                        <div className="bg-[#2a2d3a] px-4 py-2 flex items-center gap-2">
                            <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                                <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                                <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                            </div>
                        </div>

                        {/* Scenario Cards inside inner terminal */}
                        <div className="p-6 grid grid-cols-3 gap-4">
                            <ScenarioCard
                                title="Start Cluster"
                                icon={Cloud}
                                color="blue"
                                onClick={() => console.log('Start Cluster clicked')}
                            />
                            <ScenarioCard
                                title="Trigger Chaos"
                                icon={Flame}
                                color="orange"
                                onClick={() => console.log('Trigger Chaos clicked')}
                            />
                            <ScenarioCard
                                title="View Incidents"
                                icon={AlertTriangle}
                                color="yellow"
                                onClick={() => console.log('View Incidents clicked')}
                            />
                        </div>
                    </div>

                    {/* Command prompt */}
                    <div className="font-mono text-sm">
                        <span className="text-[#cfe9ff]">kubechaos@cluster ~% kubectl get pods</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
