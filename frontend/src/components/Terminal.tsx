'use client';

import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Command } from 'lucide-react';

const COMMON_COMMANDS = [
    'kubectl',
    'get',
    'pods',
    'services',
    'deployments',
    'resolve',
    'help',
    'clear'
];

export default function Terminal() {
    const { executeCommand, terminalHistory, fetchGameState } = useGameStore();

    // Local displayed history so "clear" can be instant (frontend-only)
    const [displayedHistory, setDisplayedHistory] = useState<string[]>([]);
    const [input, setInput] = useState('');
    const [suggestion, setSuggestion] = useState<string | null>(null);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const terminalRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    // Sync store -> local buffer
    useEffect(() => {
        setDisplayedHistory(terminalHistory);
    }, [terminalHistory]);

    // Fetch initial state
    useEffect(() => {
        fetchGameState();
    }, [fetchGameState]);

    // Auto-scroll when displayedHistory changes
    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [displayedHistory]);

    // Focus input on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const now = new Date();
    const lastLogin = now.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    const colorizeLine = (line: string) => {
        if (!line) return <span />;
        if (line.startsWith('ERROR') || line.startsWith('E:')) {
            return <span className="text-red-400">{line}</span>;
        }
        if (line.startsWith('WARN') || line.startsWith('⚠')) {
            return <span className="text-yellow-300">{line}</span>;
        }
        if (line.startsWith('✓') || line.startsWith('OK')) {
            return <span className="text-green-400">{line}</span>;
        }
        if (line.startsWith('$') || line.includes('kubectl')) {
            return <span className="text-[#cfe9ff]">{line}</span>;
        }
        return <span>{line}</span>;
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        const trimmed = input.trim();
        if (!trimmed) return;

        // Frontend-only clear
        if (trimmed === 'clear' || trimmed === 'cls') {
            setDisplayedHistory([]);
            setInput('');
            return;
        }

        // optimistic push to UI while store/back-end handles it
        setDisplayedHistory((h) => [...h, `$ ${trimmed}`]);
        await executeCommand(trimmed);
        setInput('');
        setSuggestion(null);
        setShowSuggestions(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        // Tab autocomplete
        if (e.key === 'Tab') {
            e.preventDefault();
            if (!input) {
                setInput(COMMON_COMMANDS[0] + ' ');
                return;
            }
            const match = COMMON_COMMANDS.find((c) => c.startsWith(input));
            if (match) {
                setInput(match + ' ');
                setSuggestion(null);
                setShowSuggestions(false);
            }
            return;
        }

        // Ctrl+L or Cmd+L clears the terminal
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l') {
            e.preventDefault();
            setDisplayedHistory([]);
            return;
        }

        // Up/Down for history could be added here later
    };

    const onChangeInput = (val: string) => {
        setInput(val);
        if (!val) {
            setSuggestion(null);
            setShowSuggestions(false);
            return;
        }
        const s = COMMON_COMMANDS.find((c) => c.startsWith(val));
        setSuggestion(s ?? null);
        setShowSuggestions(Boolean(s));
    };

    return (
        <div className="h-full w-full flex flex-col bg-black text-sm">
            {/* Titlebar */}
            <div className="bg-[#2f2f2f] px-3 py-2 flex items-center gap-3 shrink-0 select-none">
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                    <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                    <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                </div>
                <div className="flex-1 flex items-center justify-center gap-2 text-[#bfc2c6] text-xs font-medium tracking-wide opacity-80">
                    <Command className="w-3 h-3" />
                    <span>kubechaos — zhister — 20s&lt;44</span>
                </div>
            </div>

            {/* Terminal body */}
            <div
                className="flex-1 relative text-[#d4d4d4] font-mono leading-tight overflow-hidden"
                onClick={() => inputRef.current?.focus()}
                role="application"
                aria-label="kubechaos terminal"
                style={{
                    background:
                        'radial-gradient(circle at 10% 10%, rgba(255,255,255,0.01), transparent 2%), radial-gradient(circle at 90% 90%, rgba(255,255,255,0.01), transparent 2%), #0f1113'
                }}
            >
                <div ref={terminalRef} className="h-full overflow-y-auto px-4 pt-3 pb-4">
                    <div className="text-[#9da1a6] mb-2 text-xs">Last login: {lastLogin} on console</div>

                    {/* History */}
                    <div className="space-y-1">
                        {displayedHistory.map((line, i) => (
                            <div key={i} className="whitespace-pre-wrap break-words">
                                {colorizeLine(line)}
                            </div>
                        ))}
                    </div>

                    {/* Input row */}
                    {/* Input row */}
                    <div className="mt-4 px-1">
                        <form onSubmit={handleSubmit} className="relative group">
                            <div className="absolute inset-0 bg-white/5 rounded-lg border border-white/10 group-focus-within:border-white/20 transition-colors pointer-events-none" />
                            <input
                                ref={inputRef}
                                value={input}
                                onChange={(e) => onChangeInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                spellCheck={false}
                                autoComplete="off"
                                className="w-full bg-transparent py-2.5 px-3 outline-none text-[#d4d4d4] caret-[#d4d4d4] placeholder:text-white/20 font-mono text-sm relative z-10"
                                placeholder="type a-command - try 'kubectl get pods' or 'help'"
                            />
                        </form>

                        {showSuggestions && suggestion && (
                            <div className="mt-1 text-xs text-[#b6c2cc] px-1">
                                suggestion: <span className="text-[#cfe9ff]">{suggestion}</span> — press Tab to autocomplete
                            </div>
                        )}
                    </div>

                    {/* tiny help footer */}
                    <div className="mt-3 text-xs text-[#5a5f63] px-1 font-medium">
                        Available commands: help - get pods - get services - get deployments - resolve - Ctrl+L
                    </div>
                </div>
            </div>
        </div>
    );
}
