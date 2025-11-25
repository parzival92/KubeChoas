'use client';

import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Card } from '@/components/ui/card';
import { Server, Database, Layers, AlertTriangle, Activity, CheckCircle, Flame, Filter } from 'lucide-react';

export default function ClusterDashboard() {
  const { pods, services, deployments, activeEvents, score } = useGameStore();
  const [selectedNamespace, setSelectedNamespace] = useState<string>('all');

  // Get unique namespaces
  const namespaces = ['all', ...Array.from(new Set(pods.map(p => p.namespace)))];

  // Filter resources by namespace
  const filteredPods = selectedNamespace === 'all' ? pods : pods.filter(p => p.namespace === selectedNamespace);
  const filteredServices = selectedNamespace === 'all' ? services : services.filter(s => s.namespace === selectedNamespace);
  const filteredDeployments = selectedNamespace === 'all' ? deployments : deployments.filter(d => d.namespace === selectedNamespace);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Running':
      case 'Active':
      case 'Available':
        return 'text-emerald-400';
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
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'high':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'low':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getNamespaceBadgeColor = (namespace: string) => {
    switch (namespace) {
      case 'production':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
      case 'data':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/50';
      case 'monitoring':
        return 'bg-green-500/20 text-green-300 border-green-500/50';
      case 'ingress-system':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/50';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/50';
    }
  };

  return (
    <Card className="bg-[#0d1117]/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-8 h-full overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 flex items-center gap-2">
          <Activity className="w-6 h-6 text-purple-400 animate-pulse" />
          Cluster Dashboard
        </h2>

        {/* Namespace Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={selectedNamespace}
            onChange={(e) => setSelectedNamespace(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 hover:bg-white/10 transition-colors"
          >
            {namespaces.map(ns => (
              <option key={ns} value={ns} className="bg-gray-900">
                {ns === 'all' ? 'All Namespaces' : ns}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Score Section */}
      <div className="mb-8 p-4 bg-white/5 rounded-xl flex flex-col md:flex-row gap-6 items-center justify-between border border-white/5 backdrop-blur-sm">
        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-2 rounded-lg hover:bg-white/5 transition-colors">
            <div className="text-3xl font-bold text-emerald-400 drop-shadow-sm">{score.totalScore}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Total Score</div>
          </div>
          <div className="text-center p-2 rounded-lg hover:bg-white/5 transition-colors">
            <div className="text-3xl font-bold text-blue-400 drop-shadow-sm">{score.mttr.toFixed(1)}s</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">MTTR</div>
          </div>
          <div className="text-center p-2 rounded-lg hover:bg-white/5 transition-colors">
            <div className="text-3xl font-bold text-yellow-400 drop-shadow-sm">{score.incidentsResolved}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Resolved</div>
          </div>
          <div className="text-center p-2 rounded-lg hover:bg-white/5 transition-colors">
            <div className="text-3xl font-bold text-purple-400 drop-shadow-sm">{score.commandsUsed}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Commands</div>
          </div>
        </div>
      </div>

      {/* Active Events */}
      {activeEvents.length > 0 && (
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <h3 className="text-lg font-semibold mb-3 text-red-400 flex items-center gap-2">
            <Flame className="w-5 h-5 animate-pulse" /> Active Chaos Events
          </h3>
          <div className="space-y-3">
            {activeEvents.map((event) => (
              <div key={event.id} className={`p-4 rounded-xl flex flex-col gap-2 shadow-lg border backdrop-blur-sm ${getSeverityColor(event.severity)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="font-bold tracking-wide text-lg">{event.type.replace('-', ' ').toUpperCase()}</span>
                  </div>
                  <span className="text-xs font-bold uppercase px-2 py-1 rounded-full bg-black/20 border border-white/10">
                    {event.severity}
                  </span>
                </div>
                <p className="text-sm opacity-90">{event.description}</p>
                <div className="text-xs opacity-70 font-mono bg-black/20 p-2 rounded">
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
        <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex flex-col h-full">
          <h3 className="text-lg font-semibold mb-4 text-gray-200 flex items-center gap-2 border-b border-white/5 pb-2">
            <Database className="w-5 h-5 text-emerald-400" /> Pods
          </h3>
          <div className="space-y-2 flex-1 overflow-y-auto max-h-[300px] custom-scrollbar pr-2">
            {filteredPods.map((pod) => (
              <div key={pod.id} className="p-3 bg-black/20 hover:bg-white/10 transition-all rounded-lg border border-white/5 group">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-200 truncate flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${pod.status === 'Running' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`} />
                    {pod.name}
                  </span>
                  <span className={`text-[10px] font-bold uppercase ${getStatusColor(pod.status)} bg-black/40 px-2 py-0.5 rounded`}>{pod.status}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors font-mono pl-4">
                    CPU: {pod.cpu} | Mem: {pod.memory}MB
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getNamespaceBadgeColor(pod.namespace)}`}>
                    {pod.namespace}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Services */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex flex-col h-full">
          <h3 className="text-lg font-semibold mb-4 text-gray-200 flex items-center gap-2 border-b border-white/5 pb-2">
            <Server className="w-5 h-5 text-blue-400" /> Services
          </h3>
          <div className="space-y-2 flex-1 overflow-y-auto max-h-[300px] custom-scrollbar pr-2">
            {filteredServices.map((service) => (
              <div key={service.id} className="p-3 bg-black/20 hover:bg-white/10 transition-all rounded-lg border border-white/5 group">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-200 truncate flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${service.status === 'Active' ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-gray-500'}`} />
                    {service.name}
                  </span>
                  <span className={`text-[10px] font-bold uppercase ${getStatusColor(service.status)} bg-black/40 px-2 py-0.5 rounded`}>{service.status}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors font-mono pl-4">
                    {service.type} | {service.clusterIp}
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getNamespaceBadgeColor(service.namespace)}`}>
                    {service.namespace}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Deployments */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex flex-col h-full">
          <h3 className="text-lg font-semibold mb-4 text-gray-200 flex items-center gap-2 border-b border-white/5 pb-2">
            <Layers className="w-5 h-5 text-purple-400" /> Deployments
          </h3>
          <div className="space-y-2 flex-1 overflow-y-auto max-h-[300px] custom-scrollbar pr-2">
            {filteredDeployments.map((deployment) => (
              <div key={deployment.id} className="p-3 bg-black/20 hover:bg-white/10 transition-all rounded-lg border border-white/5 group">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-200 truncate flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${deployment.status === 'Available' ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]' : 'bg-yellow-500'}`} />
                    {deployment.name}
                  </span>
                  <span className={`text-[10px] font-bold uppercase ${getStatusColor(deployment.status)} bg-black/40 px-2 py-0.5 rounded`}>{deployment.status}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors font-mono pl-4">
                    Ready: {deployment.ready} | Avail: {deployment.available}
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getNamespaceBadgeColor(deployment.namespace)}`}>
                    {deployment.namespace}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5 hover:bg-white/10 transition-colors">
          <div className="text-lg font-bold text-emerald-400 flex items-center justify-center gap-2">
            <Database className="w-4 h-4" />
            {pods.filter(p => p.status === 'Running').length}
          </div>
          <div className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">Running Pods</div>
        </div>
        <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5 hover:bg-white/10 transition-colors">
          <div className="text-lg font-bold text-blue-400 flex items-center justify-center gap-2">
            <Server className="w-4 h-4" />
            {services.filter(s => s.status === 'Active').length}
          </div>
          <div className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">Active Services</div>
        </div>
        <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5 hover:bg-white/10 transition-colors">
          <div className="text-lg font-bold text-purple-400 flex items-center justify-center gap-2">
            <Layers className="w-4 h-4" />
            {deployments.filter(d => d.status === 'Available').length}
          </div>
          <div className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">Deployments</div>
        </div>
        <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5 hover:bg-white/10 transition-colors">
          <div className="text-lg font-bold text-red-400 flex items-center justify-center gap-2">
            <Flame className="w-4 h-4 animate-pulse" />
            {activeEvents.length}
          </div>
          <div className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">Active Events</div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </Card>
  );
} 