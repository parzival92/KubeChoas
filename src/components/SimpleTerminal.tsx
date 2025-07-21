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
    } catch (error) {
      const errorMessage = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setOutput(prev => [...prev, errorMessage]);
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