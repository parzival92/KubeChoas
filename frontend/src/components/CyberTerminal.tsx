'use client';

import { useState, useRef, useEffect } from 'react';
import { useGameStore, Pod, Service, Deployment } from '@/store/gameStore';
import { executeCommand } from '@/utils/commandExecutor';
import { Terminal, ChevronRight, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TerminalEntry {
    command: string;
    output: string;
}

export default function CyberTerminal() {
    const [input, setInput] = useState('');
    const [entries, setEntries] = useState<TerminalEntry[]>([]);
    const [isMaximized, setIsMaximized] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    const {
        pods,
        services,
        deployments,
        activeEvents,
        addTerminalOutput,
        updateScore,
        resolveChaosEvent,
        updatePod,
        updateService,
        updateDeployment
    } = useGameStore();

    const [loginTime, setLoginTime] = useState<string>('');
    const terminalContentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setLoginTime(new Date().toUTCString());
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    useEffect(() => {
        if (bottomRef.current && terminalContentRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, [entries]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const command = input.trim();
        setInput('');

        if (command.toLowerCase() === 'clear') {
            setEntries([]);
            addTerminalOutput('$ clear');
            addTerminalOutput('Terminal cleared');
            return;
        }

        updateScore({ commandsUsed: useGameStore.getState().score.commandsUsed + 1 });

        const actions = {
            resolveChaosEvent,
            updatePod,
            updateService,
            updateDeployment,
            setPods: (newPods: Pod[]) => useGameStore.setState({ pods: newPods }),
            setServices: (newServices: Service[]) => useGameStore.setState({ services: newServices }),
            setDeployments: (newDeployments: Deployment[]) => useGameStore.setState({ deployments: newDeployments })
        };

        try {
            const result = await executeCommand(
                command,
                { pods, services, deployments, activeEvents },
                actions
            );

            setEntries(prev => [...prev, { command, output: result }]);
            addTerminalOutput(`$ ${command}`);
            addTerminalOutput(result);

        } catch (error) {
            const errorMessage = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
            setEntries(prev => [...prev, { command, output: errorMessage }]);
            addTerminalOutput(`$ ${command}`);
            addTerminalOutput(errorMessage);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSubmit(e);
        }
    };

    return (
        <div className={`flex flex-col w-full ${isMaximized ? 'h-[80vh]' : 'h-[500px]'} rounded-xl overflow-hidden shadow-[0_0_40px_rgba(0,243,255,0.15)] border border-cyber-blue/30 bg-[#050a14]/90 backdrop-blur-xl font-mono text-sm transition-all duration-300 relative group`}>

            {/* Scanline effect */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-20 bg-[length:100%_2px,3px_100%] opacity-10" />

            {/* Terminal Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-cyber-blue/10 to-transparent border-b border-cyber-blue/20">
                <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 shadow-[0_0_8px_rgba(234,179,8,0.6)]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/80 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                    </div>
                </div>
                <div className="flex items-center gap-2 text-cyber-blue text-xs font-bold tracking-widest uppercase">
                    <Terminal className="w-3 h-3" />
                    <span>NETRUNNER_TERMINAL_V2.0</span>
                </div>
                <div className="flex items-center gap-2">
                    <Activity className="w-3 h-3 text-cyber-blue animate-pulse" />
                    <span className="text-[10px] text-cyber-blue/70">CONNECTED</span>
                </div>
            </div>

            {/* Terminal Content */}
            <div
                ref={terminalContentRef}
                className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar relative z-10"
                onClick={() => inputRef.current?.focus()}
            >
                {/* Welcome Message */}
                <div className="mb-6 space-y-1 font-cyber text-sm">
                    <div className="text-cyber-blue font-bold text-glow">SYSTEM INITIALIZED...</div>
                    <div className="text-gray-400">ACCESS LEVEL: <span className="text-cyber-pink">ROOT</span></div>
                    <div className="text-gray-400">PROTOCOL: <span className="text-cyber-blue">KUBE_CHAOS</span></div>
                    <div className="text-gray-500 text-xs mt-2">TIMESTAMP: {loginTime}</div>
                </div>

                {/* History */}
                <AnimatePresence>
                    {entries.map((entry, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-1"
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-cyber-pink font-bold">root@netrunner:~$</span>
                                <span className="text-gray-100">{entry.command}</span>
                            </div>
                            <div className="pl-0 text-gray-300 whitespace-pre-wrap leading-relaxed font-mono text-xs md:text-sm">
                                {entry.output.split('\n').map((line, i) => {
                                    if (line.includes('Error:')) return <span key={i} className="text-red-400 block text-glow-pink">{line}</span>;
                                    if (line.includes('WARN:')) return <span key={i} className="text-yellow-400 block">{line}</span>;
                                    if (line.includes('INFO:')) return <span key={i} className="text-cyber-blue block">{line}</span>;
                                    if (line.includes('SUCCESS:')) return <span key={i} className="text-emerald-400 block text-glow">{line}</span>;
                                    if (line.startsWith('NAME')) return <span key={i} className="text-gray-500 font-bold block border-b border-gray-700 pb-1 mb-1">{line}</span>;
                                    return <span key={i} className="block">{line}</span>;
                                })}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Input Line */}
                <div className="flex items-center gap-2 pt-2">
                    <span className="text-cyber-pink font-bold flex items-center">
                        root@netrunner
                        <ChevronRight className="w-3 h-3" />
                    </span>
                    <form onSubmit={handleSubmit} className="flex-1 flex items-center">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full bg-transparent border-none outline-none text-cyber-blue placeholder-gray-700 font-bold"
                            autoComplete="off"
                            spellCheck={false}
                            autoFocus
                        />
                        <span className="w-2 h-4 bg-cyber-blue animate-pulse ml-1 shadow-[0_0_8px_rgba(0,243,255,0.8)]"></span>
                    </form>
                </div>
                <div ref={bottomRef} />
            </div>

            <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          background: #050a14;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 0;
          border: 1px solid #00f3ff;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #00f3ff;
        }
      `}</style>
        </div>
    );
}
