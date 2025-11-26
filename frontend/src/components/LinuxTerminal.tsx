'use client';

import { useGameStore } from '@/store/gameStore';
import { useEffect, useRef, useState } from 'react';

export default function LinuxTerminal() {
    const { executeCommand, terminalHistory, fetchGameState } = useGameStore();
    const [input, setInput] = useState('');
    const terminalRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Fetch initial state
    useEffect(() => {
        fetchGameState();
    }, [fetchGameState]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [terminalHistory]);

    // Focus input on mount and click
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        await executeCommand(input);
        setInput('');
    };

    // Get current date/time for last login
    const now = new Date();
    const lastLogin = now.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    return (
        <div className="h-full w-full flex flex-col bg-black">
            {/* macOS Terminal Title Bar */}
            <div className="bg-[#3c3c3c] px-3 py-2 flex items-center gap-2 shrink-0">
                {/* Traffic Light Buttons */}
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f57]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#febc2e]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#28c840]"></div>
                </div>
                {/* Window Title */}
                <div className="flex-1 text-center text-[#b3b3b3] text-xs font-medium">
                    kubechaos — zsh — 170×46
                </div>
            </div>

            {/* Terminal Content */}
            <div
                className="flex-1 bg-[#1e1e1e] text-[#d4d4d4] font-mono text-lg flex flex-col overflow-hidden"
                onClick={() => inputRef.current?.focus()}
            >
                {/* Scrollable Output Area */}
                <div
                    ref={terminalRef}
                    className="flex-1 overflow-y-auto px-4 pt-3 pb-2"
                >
                    {/* Last Login Info */}
                    <div className="text-[#b3b3b3] mb-2">
                        Last login: {lastLogin} on console
                    </div>

                    {/* Command History */}
                    {terminalHistory.map((line, index) => (
                        <div key={index} className="whitespace-pre-wrap break-words leading-relaxed">
                            {line}
                        </div>
                    ))}
                </div>

                {/* Fixed Input Line at Bottom */}
                <form onSubmit={handleSubmit} className="flex items-center gap-2 px-4 pb-3 shrink-0">
                    <span className="text-[#d4d4d4] shrink-0">kubechaos@cluster ~ %</span>
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="flex-1 bg-transparent outline-none text-[#d4d4d4] caret-[#d4d4d4]"
                        spellCheck={false}
                        autoComplete="off"
                    />
                </form>
            </div>
        </div>
    );
}
