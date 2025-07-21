'use client';

import { useState, useRef, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { executeCommand } from '@/utils/commandExecutor';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Terminal } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface TerminalEntry {
  command: string;
  output: string;
}

export default function SimpleTerminal() {
  const [input, setInput] = useState('');
  const [entries, setEntries] = useState<TerminalEntry[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { 
    pods, 
    services, 
    deployments, 
    addTerminalOutput, 
    updateScore
  } = useGameStore();

  useEffect(() => {
    // Focus input on mount and after each command
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [entries.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const command = input.trim();
    setInput('');

    // Update score for command usage
    updateScore({ commandsUsed: useGameStore.getState().score.commandsUsed + 1 });

    try {
      const result = await executeCommand(command, { pods, services, deployments });
      setEntries(prev => [...prev, { command, output: result }]);
      addTerminalOutput(`$ ${command}`);
      addTerminalOutput(result);

      // Handle state updates for delete commands
      if (command.toLowerCase().includes('kubectl delete')) {
        handleDeleteCommand(command);
      }
      
      // Handle state updates for rollout restart commands
      if (command.toLowerCase().includes('kubectl rollout restart')) {
        handleRolloutRestartCommand(command);
      }

      // Automatically resolve chaos event for nginx-service if fixed
      const { activeEvents, resolveChaosEvent } = useGameStore.getState();
      if (
        command.toLowerCase().includes('kubectl delete service nginx-service') ||
        command.toLowerCase().includes('kubectl rollout restart deployment nginx-deployment')
      ) {
        const event = activeEvents.find(
          (e) =>
            (e.type === 'service-down' || e.type === 'dns-failure') &&
            e.affectedResources.includes('nginx-service') &&
            !e.resolved
        );
        if (event) {
          resolveChaosEvent(event.id);
        }
      }
      // Auto-resolve pod-crash events if rollout restart or delete is run for affected pod/deployment
      activeEvents.forEach(event => {
        if (
          event.type === 'pod-crash' &&
          event.affectedResources.some(resource => command.toLowerCase().includes(resource.toLowerCase())) &&
          !event.resolved
        ) {
          resolveChaosEvent(event.id);
        }
      });
    } catch (error) {
      const errorMessage = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setEntries(prev => [...prev, { command, output: errorMessage }]);
      addTerminalOutput(`$ ${command}`);
      addTerminalOutput(errorMessage);
    }
  };

  const handleDeleteCommand = (command: string) => {
    const parts = command.toLowerCase().split(' ');
    const resourceType = parts[2]; // pods, services, deployments
    const resourceName = parts[3]; // specific resource name

    if (resourceType === 'pod' || resourceType === 'pods') {
      // Remove the pod from the store
      const updatedPods = pods.filter(pod => !pod.name.includes(resourceName));
      useGameStore.setState({ pods: updatedPods });
    } else if (resourceType === 'service' || resourceType === 'services') {
      // Remove the service from the store
      const updatedServices = services.filter(service => !service.name.includes(resourceName));
      useGameStore.setState({ services: updatedServices });
    } else if (resourceType === 'deployment' || resourceType === 'deployments') {
      // Remove the deployment from the store
      const updatedDeployments = deployments.filter(deployment => !deployment.name.includes(resourceName));
      useGameStore.setState({ deployments: updatedDeployments });
    }
  };

  const handleRolloutRestartCommand = (command: string) => {
    const parts = command.toLowerCase().split(' ');
    const deploymentName = parts[3]; // deployment name after "rollout restart"

    // Find the deployment and update its status to restart it
    const updatedDeployments = deployments.map(deployment => {
      if (deployment.name.includes(deploymentName)) {
        return {
          ...deployment,
          status: 'Progressing' as const,
          ready: '0/1',
          available: 0
        };
      }
      return deployment;
    });

    // Also update related pods to show restart
    const updatedPods = pods.map(pod => {
      if (pod.name.includes(deploymentName)) {
        return {
          ...pod,
          status: 'Pending' as const,
          restarts: pod.restarts + 1,
          logs: [
            ...pod.logs,
            '2024-01-01T12:05:00Z INFO: Pod restarting due to deployment rollout',
            '2024-01-01T12:05:01Z INFO: Container starting...'
          ]
        };
      }
      return pod;
    });

    useGameStore.setState({ 
      deployments: updatedDeployments,
      pods: updatedPods
    });

    // Simulate the restart completing after a short delay
    setTimeout(() => {
      const finalDeployments = updatedDeployments.map(deployment => {
        if (deployment.name.includes(deploymentName)) {
          return {
            ...deployment,
            status: 'Available' as const,
            ready: '1/1',
            available: 1
          };
        }
        return deployment;
      });

      const finalPods = updatedPods.map(pod => {
        if (pod.name.includes(deploymentName)) {
          return {
            ...pod,
            status: 'Running' as const,
            logs: [
              ...pod.logs,
              '2024-01-01T12:05:05Z INFO: Pod restarted successfully',
              '2024-01-01T12:05:06Z INFO: Application running normally'
            ]
          };
        }
        return pod;
      });

      useGameStore.setState({ 
        deployments: finalDeployments,
        pods: finalPods
      });
    }, 2000); // 2 second delay to simulate restart
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col glass border border-blue-900/40 shadow-lg rounded-xl font-mono text-[15px] h-96 md:h-[500px] max-h-[70vh] min-h-[250px]">
      <div className="flex-1 overflow-y-auto px-3 pt-2 pb-1 custom-scrollbar">
        {/* Initial welcome/help text */}
        <div className="mb-4 p-4 rounded-lg bg-emerald-900/20 border border-emerald-400/20 space-y-2">
          <div className="text-2xl font-extrabold text-emerald-300 drop-shadow">Welcome to <span className="text-emerald-400">KubeChaos Terminal!</span></div>
          <div className="text-base text-gray-200 font-semibold">
            Type <span className="text-blue-400 font-bold">help</span> for available commands.
          </div>
          <div className="text-base text-blue-300 font-semibold">
            Type <span className="text-blue-400 font-extrabold">kubectl get pods</span> to see your cluster pods.
          </div>
        </div>
        {entries.map((entry, idx) => (
          <div key={idx} className="">
            <div className="flex items-center">
              <span className="text-[#6A9955] select-none">$</span>
              <span className="text-white ml-2">{entry.command}</span>
            </div>
            <div className="ml-6">
              {entry.output.split('\n').map((subLine, subIdx) => {
                // VSCode-like color coding for output
                if (/error|failed|not found|unknown/i.test(subLine)) {
                  return <pre key={subIdx} className="text-red-400 whitespace-pre">{subLine}</pre>;
                }
                if (/warn|warning/i.test(subLine)) {
                  return <pre key={subIdx} className="text-yellow-300 whitespace-pre">{subLine}</pre>;
                }
                if (/info|success|available|running/i.test(subLine)) {
                  return <pre key={subIdx} className="text-blue-300 whitespace-pre">{subLine}</pre>;
                }
                return <pre key={subIdx} className="text-white whitespace-pre">{subLine}</pre>;
              })}
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex items-center border-t border-[#333] px-3 py-2 bg-transparent">
        <span className="text-[#6A9955] select-none">$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent text-white outline-none border-none font-mono text-[15px] ml-2 tracking-wide focus:ring-0 block-cursor"
          autoComplete="off"
          spellCheck={false}
          style={{ caretColor: '#fff' }}
        />
      </form>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          background: #222;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 4px;
        }
        .block-cursor {
          caret-shape: block;
          caret-color: #fff;
        }
        input.block-cursor::selection {
          background: #264f78;
        }
      `}</style>
    </div>
  );
} 