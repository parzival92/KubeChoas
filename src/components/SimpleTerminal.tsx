'use client';

import { useState, useRef, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { executeCommand } from '@/utils/commandExecutor';
import { Terminal, Maximize2, Minimize2, X } from 'lucide-react';

interface TerminalEntry {
  command: string;
  output: string;
}

export default function SimpleTerminal() {
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
    // Focus input on mount and after each command
    if (inputRef.current) {
      inputRef.current.focus();
    }
    // Scroll to bottom within terminal container only
    if (bottomRef.current && terminalContentRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [entries.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const command = input.trim();
    setInput('');

    // Handle clear command specially
    if (command.toLowerCase() === 'clear') {
      setEntries([]);
      addTerminalOutput('$ clear');
      addTerminalOutput('Terminal cleared');
      return;
    }

    // Update score for command usage
    updateScore({ commandsUsed: useGameStore.getState().score.commandsUsed + 1 });

    // Create actions object for command executor
    const actions = {
      resolveChaosEvent,
      updatePod,
      updateService,
      updateDeployment,
      setPods: (newPods: any[]) => useGameStore.setState({ pods: newPods }),
      setServices: (newServices: any[]) => useGameStore.setState({ services: newServices }),
      setDeployments: (newDeployments: any[]) => useGameStore.setState({ deployments: newDeployments })
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
    <div className={`flex flex-col w-full ${isMaximized ? 'h-[80vh]' : 'h-[500px]'} rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-[#0d1117]/90 backdrop-blur-xl font-mono text-sm transition-all duration-300`}>
      {/* Terminal Header (Mac-style) */}
      <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-b from-[#2a2e34] to-[#1a1d21] border-b border-white/5">
        <div className="flex items-center gap-2">
          <button className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] hover:bg-[#ff5f56]/80 transition-colors focus:outline-none group flex items-center justify-center" aria-label="Close">
            <X className="w-2 h-2 text-[#4d0000] opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          <button className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] hover:bg-[#ffbd2e]/80 transition-colors focus:outline-none group flex items-center justify-center" aria-label="Minimize">
            <Minimize2 className="w-2 h-2 text-[#4d3300] opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          <button
            className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] hover:bg-[#27c93f]/80 transition-colors focus:outline-none group flex items-center justify-center"
            aria-label="Maximize"
            onClick={() => setIsMaximized(!isMaximized)}
          >
            <Maximize2 className="w-2 h-2 text-[#004d00] opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
        <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
          <Terminal className="w-3 h-3" />
          <span>root@k8s-master:~</span>
        </div>
        <div className="flex items-center gap-2 opacity-0"> {/* Spacer to center title */}
          <div className="w-3 h-3" />
          <div className="w-3 h-3" />
          <div className="w-3 h-3" />
        </div>
      </div>

      {/* Terminal Content */}
      <div
        ref={terminalContentRef}
        className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar"
        onClick={() => inputRef.current?.focus()}
      >
        {/* Welcome Message */}
        <div className="mb-6 space-y-1">
          <div className="text-emerald-400 font-bold">Welcome to KubeChaos v1.0.0</div>
          <div className="text-gray-400">Type <span className="text-blue-400">'help'</span> to see available commands.</div>
          <div className="text-gray-400">System status: <span className="text-emerald-400">ONLINE</span></div>
          <div className="text-gray-500 text-xs mt-2">Last login: {loginTime} on ttys001</div>
        </div>

        {/* History */}
        {entries.map((entry, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-emerald-500 font-bold">root@k8s-master:~$</span>
              <span className="text-gray-100">{entry.command}</span>
            </div>
            <div className="pl-0 text-gray-300 whitespace-pre-wrap leading-relaxed">
              {entry.output.split('\n').map((line, i) => {
                if (line.includes('Error:')) return <span key={i} className="text-red-400 block">{line}</span>;
                if (line.includes('WARN:')) return <span key={i} className="text-yellow-400 block">{line}</span>;
                if (line.includes('INFO:')) return <span key={i} className="text-blue-300 block">{line}</span>;
                if (line.includes('SUCCESS:')) return <span key={i} className="text-emerald-400 block">{line}</span>;
                if (line.startsWith('NAME')) return <span key={i} className="text-gray-500 font-bold block border-b border-gray-700 pb-1 mb-1">{line}</span>;
                return <span key={i} className="block">{line}</span>;
              })}
            </div>
          </div>
        ))}

        {/* Input Line */}
        <div className="flex items-center gap-2 pt-2">
          <span className="text-emerald-500 font-bold">root@k8s-master:~$</span>
          <form onSubmit={handleSubmit} className="flex-1 flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent border-none outline-none text-gray-100 placeholder-gray-600"
              autoComplete="off"
              spellCheck={false}
              autoFocus
            />
            <span className="w-2 h-5 bg-emerald-500 animate-pulse ml-1"></span>
          </form>
        </div>
        <div ref={bottomRef} />
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 10px;
          background: #0d1117;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #30363d;
          border-radius: 5px;
          border: 2px solid #0d1117;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #484f58;
        }
      `}</style>
    </div>
  );
}