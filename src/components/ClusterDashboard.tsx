'use client';

import { useGameStore } from '@/store/gameStore';

export default function ClusterDashboard() {
  const { pods, services, deployments, activeEvents, score } = useGameStore();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Running':
      case 'Active':
      case 'Available':
        return 'text-green-400';
      case 'Pending':
      case 'Progressing':
        return 'text-yellow-400';
      case 'Failed':
      case 'CrashLoopBackOff':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-600';
      case 'high':
        return 'bg-orange-600';
      case 'medium':
        return 'bg-yellow-600';
      case 'low':
        return 'bg-blue-600';
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-green-400">Cluster Dashboard</h2>
      
      {/* Score Section */}
      <div className="mb-6 p-4 bg-gray-700 rounded-lg">
        <h3 className="text-lg font-semibold mb-3 text-white">Game Score</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{score.totalScore}</div>
            <div className="text-sm text-gray-300">Total Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{score.mttr.toFixed(1)}s</div>
            <div className="text-sm text-gray-300">MTTR</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">{score.incidentsResolved}</div>
            <div className="text-sm text-gray-300">Resolved</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{score.commandsUsed}</div>
            <div className="text-sm text-gray-300">Commands</div>
          </div>
        </div>
      </div>

      {/* Active Events */}
      {activeEvents.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-red-400">Active Chaos Events</h3>
          <div className="space-y-2">
            {activeEvents.map((event) => (
              <div key={event.id} className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${getSeverityColor(event.severity)}`}></div>
                    <span className="font-medium text-white">{event.type.replace('-', ' ').toUpperCase()}</span>
                  </div>
                  <span className="text-sm text-gray-300">{event.severity}</span>
                </div>
                <p className="text-sm text-gray-300 mt-1">{event.description}</p>
                <div className="text-xs text-gray-400 mt-1">
                  Affected: {event.affectedResources.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pods */}
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3 text-white">Pods</h3>
          <div className="space-y-2">
            {pods.map((pod) => (
              <div key={pod.id} className="p-2 bg-gray-600 rounded">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-white truncate">{pod.name}</span>
                  <span className={`text-xs ${getStatusColor(pod.status)}`}>{pod.status}</span>
                </div>
                <div className="text-xs text-gray-300 mt-1">
                  CPU: {pod.cpu} | Memory: {pod.memory}MB | Restarts: {pod.restarts}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Services */}
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3 text-white">Services</h3>
          <div className="space-y-2">
            {services.map((service) => (
              <div key={service.id} className="p-2 bg-gray-600 rounded">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-white truncate">{service.name}</span>
                  <span className={`text-xs ${getStatusColor(service.status)}`}>{service.status}</span>
                </div>
                <div className="text-xs text-gray-300 mt-1">
                  {service.type} | {service.clusterIp} | {service.ports}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Deployments */}
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3 text-white">Deployments</h3>
          <div className="space-y-2">
            {deployments.map((deployment) => (
              <div key={deployment.id} className="p-2 bg-gray-600 rounded">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-white truncate">{deployment.name}</span>
                  <span className={`text-xs ${getStatusColor(deployment.status)}`}>{deployment.status}</span>
                </div>
                <div className="text-xs text-gray-300 mt-1">
                  Ready: {deployment.ready} | Available: {deployment.available}/{deployment.upToDate}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-700 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-green-400">{pods.filter(p => p.status === 'Running').length}</div>
          <div className="text-xs text-gray-300">Running Pods</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-blue-400">{services.filter(s => s.status === 'Active').length}</div>
          <div className="text-xs text-gray-300">Active Services</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-purple-400">{deployments.filter(d => d.status === 'Available').length}</div>
          <div className="text-xs text-gray-300">Available Deployments</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-red-400">{activeEvents.length}</div>
          <div className="text-xs text-gray-300">Active Events</div>
        </div>
      </div>
    </div>
  );
} 