'use client';

import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '@/store/gameStore';

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
    const [input, setInput] = useState('');
    const [suggestion, setSuggestion] = useState<string | null>(null);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const terminalRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    // Fetch initial state
    useEffect(() => {
        fetchGameState();
    }, [fetchGameState]);

    // Auto-scroll to bottom when history changes
    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [terminalHistory]);

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
        // Very small "parser" to add color to lines starting with keywords
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
            // subtle color for commands
            return <span className="text-[#cfe9ff]">{line}</span>;
        }
        // default
        return <span>{line}</span>;
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        const trimmed = input.trim();
        if (!trimmed) return;
        // support local clear command
        if (trimmed === 'clear' || trimmed === 'cls') {
            // if your store supports clearing history, call it; else, emulate:
            // Ideally your store would expose clearTerminalHistory(); fallback:
            // (push a newline or reset local state — here we emit a fake clear)
            // For now, executeCommand('clear') so backend/game can handle it.
            await executeCommand(trimmed);
            setInput('');
            return;
        }

        await executeCommand(trimmed);
        setInput('');
        setSuggestion(null);
        setShowSuggestions(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        // Tab autocompletion
        if (e.key === 'Tab') {
            e.preventDefault();
            if (!input) {
                setSuggestion(COMMON_COMMANDS[0]);
                setInput(COMMON_COMMANDS[0] + ' ');
                return;
            }
            // find matching command
            const match = COMMON_COMMANDS.find((c) => c.startsWith(input));
            if (match) {
                setInput(match + (match === 'kubectl' ? ' ' : ' '));
                setSuggestion(null);
                setShowSuggestions(false);
            }
            return;
        }

        // Ctrl+L clears terminal (common shortcut)
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l') {
            e.preventDefault();
            executeCommand('clear');
            return;
        }

        // Up/Down arrow could implement history navigation (optional)
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            // Future: integrate with terminalHistory to allow browsing past commands
        }
    };

    const onChangeInput = (val: string) => {
        setInput(val);
        if (!val) {
            setSuggestion(null);
            setShowSuggestions(false);
            return;
        }
        // compute suggestion
        const s = COMMON_COMMANDS.find((c) => c.startsWith(val));
        setSuggestion(s ?? null);
        setShowSuggestions(Boolean(s));
    };

    return (
        <div className="h-full w-full flex flex-col bg-black text-sm">
            {/* Titlebar */}
            <div className="bg-[#2f2f2f] px-3 py-2 flex items-center gap-3 shrink-0 select-none">
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f57]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#febc2e]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#28c840]"></div>
                </div>
                <div className="flex-1 text-center text-[#bfc2c6] text-xs font-medium tracking-wide">
                    🖥 kubechaos — zsh — 170×46
                </div>
            </div>

            {/* Terminal body */}
            <div
                className="flex-1 relative text-[#d4d4d4] font-mono leading-tight overflow-hidden"
                onClick={() => inputRef.current?.focus()}
                role="application"
                aria-label="kubechaos terminal"
                style={{
                    // subtle textured background using gradients (no external asset)
                    background:
                        'radial-gradient(circle at 10% 10%, rgba(255,255,255,0.01), transparent 2%), radial-gradient(circle at 90% 90%, rgba(255,255,255,0.01), transparent 2%), #0f1113'
                }}
            >
                <div
                    ref={terminalRef}
                    className="h-full overflow-y-auto px-4 pt-3 pb-4"
                >
                    <div className="text-[#9da1a6] mb-2 text-xs">Last login: {lastLogin} on console</div>

                    {/* History */}
                    <div className="space-y-1">
                        {terminalHistory.map((line, i) => (
                            <div key={i} className="whitespace-pre-wrap break-words">
                                {colorizeLine(line)}
                            </div>
                        ))}
                    </div>

                    {/* Input row */}
                    <form onSubmit={handleSubmit} className="mt-2 flex items-start gap-3">
                        <div className="shrink-0 text-[#aeb6bd] select-none">kubechaos@cluster ~ %</div>

                        <div className="flex-1 min-w-0">
                            <div className="relative">
                                <input
                                    ref={inputRef}
                                    value={input}
                                    onChange={(e) => onChangeInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    spellCheck={false}
                                    autoComplete="off"
                                    className="w-full bg-transparent outline-none text-[#d4d4d4] caret-transparent placeholder:opacity-50"
                                    placeholder="type a command — try 'kubectl get pods' or 'help'"
                                />

                                {/* blinking block cursor */}
                                <span
                                    aria-hidden
                                    className="absolute right-auto top-0 -translate-y-0.5"
                                    style={{
                                        left: `${Math.min(0.5 + input.length * 0.6, 9999)}ch`
                                    }}
                                >
                                    {/* fallback animated cursor placed near input end */}
                                    <span className="inline-block animate-pulse text-[#d4d4d4]">▊</span>
                                </span>
                            </div>

                            {/* suggestion line */}
                            {showSuggestions && suggestion && (
                                <div className="mt-1 text-xs text-[#b6c2cc]">
                                    suggestion: <span className="text-[#cfe9ff]">{suggestion}</span> — press Tab to autocomplete
                                </div>
                            )}
                        </div>
                    </form>

                    {/* tiny help footer */}
                    <div className="mt-3 text-xs text-[#7f868b]">
                        Available commands: help · get pods · get services · get deployments · resolve &nbsp;
                        <span className="text-[#9aa6b0]">• Ctrl+L to clear</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
