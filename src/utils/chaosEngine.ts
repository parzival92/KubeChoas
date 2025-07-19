import { ChaosEvent, Pod, Service, Deployment } from '@/store/gameStore';

export interface ChaosEventTemplate {
  type: ChaosEvent['type'];
  severity: ChaosEvent['severity'];
  description: string;
  affectedResources: string[];
  podEffects?: (pod: Pod) => Partial<Pod>;
  serviceEffects?: (service: Service) => Partial<Service>;
  deploymentEffects?: (deployment: Deployment) => Partial<Deployment>;
}

const chaosEventTemplates: ChaosEventTemplate[] = [
  {
    type: 'pod-crash',
    severity: 'high',
    description: 'Pod is experiencing CrashLoopBackOff due to application error',
    affectedResources: ['nginx-deployment-6b474476c4'],
    podEffects: (pod) => ({
      status: 'CrashLoopBackOff' as const,
      restarts: pod.restarts + 3,
      logs: [
        ...pod.logs,
        '2024-01-01T12:00:00Z ERROR: Application failed to start',
        '2024-01-01T12:00:01Z ERROR: Configuration file not found',
        '2024-01-01T12:00:02Z ERROR: Container crashed, restarting...'
      ]
    })
  },
  {
    type: 'high-cpu',
    severity: 'medium',
    description: 'Pod is consuming excessive CPU resources',
    affectedResources: ['redis-deployment-8f5d4c2a1b'],
    podEffects: (pod) => ({
      cpu: pod.cpu + 2.5,
      logs: [
        ...pod.logs,
        '2024-01-01T12:00:00Z WARN: High CPU usage detected',
        '2024-01-01T12:00:01Z WARN: Memory pressure increasing'
      ]
    })
  },
  {
    type: 'dns-failure',
    severity: 'critical',
    description: 'DNS resolution is failing for service endpoints',
    affectedResources: ['nginx-service', 'redis-service'],
    serviceEffects: (service) => ({
      status: 'Failed' as const
    })
  },
  {
    type: 'service-down',
    severity: 'high',
    description: 'Service endpoints are not responding',
    affectedResources: ['nginx-service'],
    serviceEffects: (service) => ({
      status: 'Failed' as const
    })
  },
  {
    type: 'deployment-failed',
    severity: 'critical',
    description: 'Deployment rollout has failed',
    affectedResources: ['nginx-deployment'],
    deploymentEffects: (deployment) => ({
      status: 'Failed' as const,
      available: 0,
      ready: '0/1'
    })
  }
];

export function generateChaosEvent(): ChaosEvent {
  const template = chaosEventTemplates[Math.floor(Math.random() * chaosEventTemplates.length)];
  
  return {
    id: `chaos-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: template.type,
    severity: template.severity,
    description: template.description,
    affectedResources: template.affectedResources,
    timestamp: new Date(),
    resolved: false
  };
}

export function applyChaosEffects(
  event: ChaosEvent,
  pods: Pod[],
  services: Service[],
  deployments: Deployment[]
): {
  updatedPods: Pod[];
  updatedServices: Service[];
  updatedDeployments: Deployment[];
} {
  const template = chaosEventTemplates.find(t => t.type === event.type);
  if (!template) {
    return { updatedPods: pods, updatedServices: services, updatedDeployments: deployments };
  }

  let updatedPods = [...pods];
  let updatedServices = [...services];
  let updatedDeployments = [...deployments];

  // Apply pod effects
  if (template.podEffects) {
    updatedPods = updatedPods.map(pod => {
      if (event.affectedResources.some(resource => pod.name.includes(resource))) {
        return { ...pod, ...template.podEffects!(pod) };
      }
      return pod;
    });
  }

  // Apply service effects
  if (template.serviceEffects) {
    updatedServices = updatedServices.map(service => {
      if (event.affectedResources.includes(service.name)) {
        return { ...service, ...template.serviceEffects!(service) };
      }
      return service;
    });
  }

  // Apply deployment effects
  if (template.deploymentEffects) {
    updatedDeployments = updatedDeployments.map(deployment => {
      if (event.affectedResources.includes(deployment.name)) {
        return { ...deployment, ...template.deploymentEffects!(deployment) };
      }
      return deployment;
    });
  }

  return { updatedPods, updatedServices, updatedDeployments };
}

export function resolveChaosEvent(
  event: ChaosEvent,
  pods: Pod[],
  services: Service[],
  deployments: Deployment[]
): {
  updatedPods: Pod[];
  updatedServices: Service[];
  updatedDeployments: Deployment[];
} {
  let updatedPods = [...pods];
  let updatedServices = [...services];
  let updatedDeployments = [...deployments];

  // Restore affected resources to normal state
  updatedPods = updatedPods.map(pod => {
    if (event.affectedResources.some(resource => pod.name.includes(resource))) {
      return {
        ...pod,
        status: 'Running' as const,
        logs: [
          ...pod.logs,
          '2024-01-01T12:05:00Z INFO: Issue resolved, pod is healthy',
          '2024-01-01T12:05:01Z INFO: Application running normally'
        ]
      };
    }
    return pod;
  });

  updatedServices = updatedServices.map(service => {
    if (event.affectedResources.includes(service.name)) {
      return {
        ...service,
        status: 'Active' as const
      };
    }
    return service;
  });

  updatedDeployments = updatedDeployments.map(deployment => {
    if (event.affectedResources.includes(deployment.name)) {
      return {
        ...deployment,
        status: 'Available' as const,
        available: 1,
        ready: '1/1'
      };
    }
    return deployment;
  });

  return { updatedPods, updatedServices, updatedDeployments };
}

export function calculateScore(
  mttr: number,
  commandsUsed: number,
  incidentsResolved: number,
  proactiveChecks: number
): number {
  // Base score for resolving incidents
  let score = incidentsResolved * 100;
  
  // Bonus for fast resolution (lower MTTR = higher score)
  const mttrBonus = Math.max(0, 50 - mttr) * 2;
  score += mttrBonus;
  
  // Penalty for excessive commands (inefficiency)
  const commandPenalty = Math.max(0, commandsUsed - incidentsResolved * 3) * 5;
  score -= commandPenalty;
  
  // Bonus for proactive checks
  score += proactiveChecks * 10;
  
  return Math.max(0, score);
} 