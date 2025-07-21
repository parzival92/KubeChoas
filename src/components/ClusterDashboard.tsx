'use client';

import { useGameStore } from '@/store/gameStore';
import { Card } from '@/components/ui/card';
import { Server, Database, Layers, AlertTriangle, Activity, CheckCircle, Flame } from 'lucide-react';

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
    <Card className="bg-gray-900/80 backdrop-blur-md rounded-2xl shadow-2xl border border-purple-900/30 p-8">
      <h2 className="text-2xl font-extrabold mb-6 text-purple-400 flex items-center gap-2">
        <Activity className="w-6 h-6 text-purple-400 animate-pulse" />
        Cluster Dashboard
      </h2>
      {/* Score Section */}
      <div className="mb-8 p-4 bg-gray-800/80 rounded-xl flex flex-col md:flex-row gap-6 items-center justify-between shadow-inner border border-gray-700">
        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-400">{score.totalScore}</div>
            <div className="text-xs text-gray-300">Total Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{score.mttr.toFixed(1)}s</div>
            <div className="text-xs text-gray-300">MTTR</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">{score.incidentsResolved}</div>
            <div className="text-xs text-gray-300">Resolved</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{score.commandsUsed}</div>
            <div className="text-xs text-gray-300">Commands</div>
          </div>
        </div>
      </div>
      {/* Active Events */}
      {activeEvents.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3 text-red-400 flex items-center gap-2"><Flame className="w-5 h-5 animate-pulse" /> Active Chaos Events</h3>
          <div className="space-y-2">
            {activeEvents.map((event) => (
              <div key={event.id} className={`p-3 bg-red-900/30 border border-red-500/30 rounded-xl flex flex-col gap-1 shadow-lg animate-pulse`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`w-4 h-4 ${getSeverityColor(event.severity)}`} />
                    <span className="font-bold text-white tracking-wide">{event.type.replace('-', ' ').toUpperCase()}</span>
                  </div>
                  <span className={`text-xs font-bold uppercase ${getSeverityColor(event.severity)} px-2 py-1 rounded-full`}>{event.severity}</span>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Pods */}
        <div className="bg-gray-800/80 rounded-xl p-4 shadow-inner border border-gray-700">
          <h3 className="text-lg font-semibold mb-3 text-white flex items-center gap-2"><Database className="w-5 h-5 text-emerald-400" /> Pods</h3>
          <div className="space-y-2">
            {pods.map((pod) => (
              <div key={pod.id} className="p-2 bg-gray-700/80 rounded flex flex-col gap-1 border border-gray-600">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-white truncate flex items-center gap-1"><Database className="w-4 h-4 text-emerald-400" />{pod.name}</span>
                  <span className={`text-xs font-bold uppercase ${getStatusColor(pod.status)} px-2 py-1 rounded-full`}>{pod.status}</span>
                </div>
                <div className="text-xs text-gray-300 mt-1">
                  CPU: {pod.cpu} | Memory: {pod.memory}MB | Restarts: {pod.restarts}
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Services */}
        <div className="bg-gray-800/80 rounded-xl p-4 shadow-inner border border-gray-700">
          <h3 className="text-lg font-semibold mb-3 text-white flex items-center gap-2"><Server className="w-5 h-5 text-blue-400" /> Services</h3>
          <div className="space-y-2">
            {services.map((service) => (
              <div key={service.id} className="p-2 bg-gray-700/80 rounded flex flex-col gap-1 border border-gray-600">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-white truncate flex items-center gap-1"><Server className="w-4 h-4 text-blue-400" />{service.name}</span>
                  <span className={`text-xs font-bold uppercase ${getStatusColor(service.status)} px-2 py-1 rounded-full`}>{service.status}</span>
                </div>
                <div className="text-xs text-gray-300 mt-1">
                  {service.type} | {service.clusterIp} | {service.ports}
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Deployments */}
        <div className="bg-gray-800/80 rounded-xl p-4 shadow-inner border border-gray-700">
          <h3 className="text-lg font-semibold mb-3 text-white flex items-center gap-2"><Layers className="w-5 h-5 text-purple-400" /> Deployments</h3>
          <div className="space-y-2">
            {deployments.map((deployment) => (
              <div key={deployment.id} className="p-2 bg-gray-700/80 rounded flex flex-col gap-1 border border-gray-600">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-white truncate flex items-center gap-1"><Layers className="w-4 h-4 text-purple-400" />{deployment.name}</span>
                  <span className={`text-xs font-bold uppercase ${getStatusColor(deployment.status)} px-2 py-1 rounded-full`}>{deployment.status}</span>
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
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/80 rounded-xl p-3 text-center border border-gray-700">
          <div className="text-lg font-bold text-emerald-400 flex items-center justify-center gap-1"><Database className="w-5 h-5" />{pods.filter(p => p.status === 'Running').length}</div>
          <div className="text-xs text-gray-300">Running Pods</div>
        </div>
        <div className="bg-gray-800/80 rounded-xl p-3 text-center border border-gray-700">
          <div className="text-lg font-bold text-blue-400 flex items-center justify-center gap-1"><Server className="w-5 h-5" />{services.filter(s => s.status === 'Active').length}</div>
          <div className="text-xs text-gray-300">Active Services</div>
        </div>
        <div className="bg-gray-800/80 rounded-xl p-3 text-center border border-gray-700">
          <div className="text-lg font-bold text-purple-400 flex items-center justify-center gap-1"><Layers className="w-5 h-5" />{deployments.filter(d => d.status === 'Available').length}</div>
          <div className="text-xs text-gray-300">Available Deployments</div>
        </div>
        <div className="bg-gray-800/80 rounded-xl p-3 text-center border border-gray-700">
          <div className="text-lg font-bold text-red-400 flex items-center justify-center gap-1"><Flame className="w-5 h-5 animate-pulse" />{activeEvents.length}</div>
          <div className="text-xs text-gray-300">Active Events</div>
        </div>
      </div>
    </Card>
  );
} 