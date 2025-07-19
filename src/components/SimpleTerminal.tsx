'use client';

import { useState, useRef, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { executeCommand } from '@/utils/commandExecutor';

export default function SimpleTerminal() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [output, setOutput] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { 
    pods, 
    services, 
    deployments, 
    addTerminalOutput, 
    updateScore
  } = useGameStore();

  useEffect(() => {
    // Focus input on mount
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const command = input.trim();
    setHistory(prev => [...prev, `$ ${command}`]);
    setInput('');

    // Update score for command usage
    updateScore({ commandsUsed: useGameStore.getState().score.commandsUsed + 1 });

    try {
      const result = await executeCommand(command, { pods, services, deployments });
      setOutput(prev => [...prev, result]);
      addTerminalOutput(`$ ${command}`);
      addTerminalOutput(result);
    } catch (error) {
      const errorMessage = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setOutput(prev => [...prev, errorMessage]);
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
    <div className="h-full flex flex-col bg-black text-green-400 font-mono text-sm p-4">
      {/* Terminal Header */}
      <div className="mb-4">
        <div className="text-green-400 font-bold">Welcome to KubeChaos Terminal!</div>
        <div className="text-gray-400">Type &quot;help&quot; for available commands.</div>
        <div className="text-gray-400">Type &quot;kubectl get pods&quot; to see your cluster pods.</div>
      </div>

      {/* Terminal Output */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-1">
        {history.map((line, index) => (
          <div key={`history-${index}`} className="text-green-400">{line}</div>
        ))}
        {output.map((line, index) => (
          <div key={`output-${index}`} className="text-white whitespace-pre-wrap">{line}</div>
        ))}
      </div>

      {/* Terminal Input */}
      <form onSubmit={handleSubmit} className="flex items-center">
        <span className="text-green-400 mr-2">$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent text-green-400 outline-none border-none"
          placeholder="Enter command..."
          autoComplete="off"
        />
      </form>
    </div>
  );
} 