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

const getCurrentTimestamp = () => new Date().toISOString();

const chaosEventTemplates: ChaosEventTemplate[] = [
  // Frontend/API Issues
  {
    type: 'api-gateway-overload',
    severity: 'critical',
    description: 'API Gateway is experiencing high CPU and memory usage due to traffic spike',
    affectedResources: ['api-gateway'],
    podEffects: (pod) => ({
      cpu: Math.min(95, pod.cpu + 70),
      memory: Math.min(480, pod.memory + 200),
      status: 'Running' as const,
      logs: [
        ...pod.logs,
        `${getCurrentTimestamp()} WARN: High request rate detected`,
        `${getCurrentTimestamp()} ERROR: Connection pool exhausted`,
        `${getCurrentTimestamp()} ERROR: Response time degraded to 5000ms`
      ]
    })
  },
  {
    type: 'pod-crash',
    severity: 'high',
    description: 'Web Frontend pod crashed due to out of memory error',
    affectedResources: ['web-frontend'],
    podEffects: (pod) => ({
      status: 'CrashLoopBackOff' as const,
      restarts: pod.restarts + 1,
      logs: [
        ...pod.logs,
        `${getCurrentTimestamp()} ERROR: JavaScript heap out of memory`,
        `${getCurrentTimestamp()} ERROR: Process exited with code 137`,
        `${getCurrentTimestamp()} INFO: Container restarting...`
      ]
    })
  },

  // Service-Specific Issues
  {
    type: 'cart-service-oom',
    severity: 'critical',
    description: 'Cart Service experiencing memory leak, causing OOM errors',
    affectedResources: ['cart-service'],
    podEffects: (pod) => ({
      memory: Math.min(500, pod.memory + 300),
      cpu: Math.min(80, pod.cpu + 40),
      logs: [
        ...pod.logs,
        `${getCurrentTimestamp()} WARN: Memory usage at 95%`,
        `${getCurrentTimestamp()} ERROR: Redis connection timeout`,
        `${getCurrentTimestamp()} ERROR: Unable to allocate memory for session data`
      ]
    })
  },
  {
    type: 'high-cpu',
    severity: 'medium',
    description: 'Product Service consuming excessive CPU due to inefficient query',
    affectedResources: ['product-service'],
    podEffects: (pod) => ({
      cpu: Math.min(90, pod.cpu + 60),
      logs: [
        ...pod.logs,
        `${getCurrentTimestamp()} WARN: Database query taking 8000ms`,
        `${getCurrentTimestamp()} WARN: CPU throttling detected`,
        `${getCurrentTimestamp()} ERROR: Request timeout after 10s`
      ]
    })
  },

  // Data Layer Issues
  {
    type: 'database-connection-exhausted',
    severity: 'critical',
    description: 'PostgreSQL connection pool exhausted, blocking new connections',
    affectedResources: ['postgres-primary'],
    podEffects: (pod) => ({
      cpu: Math.min(85, pod.cpu + 30),
      logs: [
        ...pod.logs,
        `${getCurrentTimestamp()} ERROR: FATAL: remaining connection slots are reserved`,
        `${getCurrentTimestamp()} ERROR: too many clients already`,
        `${getCurrentTimestamp()} WARN: Connection pool at 100/100`
      ]
    })
  },
  {
    type: 'redis-cache-eviction',
    severity: 'high',
    description: 'Redis cache experiencing high eviction rate due to memory pressure',
    affectedResources: ['redis-cache'],
    podEffects: (pod) => ({
      memory: Math.min(450, pod.memory + 180),
      logs: [
        ...pod.logs,
        `${getCurrentTimestamp()} WARN: Memory usage above 90%`,
        `${getCurrentTimestamp()} WARN: Evicting keys to free memory`,
        `${getCurrentTimestamp()} ERROR: Cache miss rate at 85%`
      ]
    })
  },
  {
    type: 'rabbitmq-queue-full',
    severity: 'high',
    description: 'RabbitMQ queue is full, order processing is blocked',
    affectedResources: ['rabbitmq'],
    podEffects: (pod) => ({
      memory: Math.min(400, pod.memory + 100),
      logs: [
        ...pod.logs,
        `${getCurrentTimestamp()} ERROR: Queue 'orders' has reached max length`,
        `${getCurrentTimestamp()} WARN: Rejecting new messages`,
        `${getCurrentTimestamp()} ERROR: Consumer lag at 10000 messages`
      ]
    })
  },

  // Network/Service Issues
  {
    type: 'dns-failure',
    severity: 'critical',
    description: 'DNS resolution failing for cross-namespace service discovery',
    affectedResources: ['product-service', 'cart-service'],
    serviceEffects: (service) => ({
      status: 'Failed' as const
    })
  },
  {
    type: 'service-down',
    severity: 'high',
    description: 'Order Service endpoints not responding',
    affectedResources: ['order-service'],
    serviceEffects: (service) => ({
      status: 'Failed' as const
    })
  },
  {
    type: 'deployment-failed',
    severity: 'critical',
    description: 'Product Service deployment rollout failed',
    affectedResources: ['product-service'],
    deploymentEffects: (deployment) => ({
      status: 'Failed' as const,
      available: 0,
      ready: '0/2'
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
      // Match if the pod name includes any of the affected resources (which are usually deployment names)
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
        cpu: pod.name.includes('redis') ? 0.2 : 0.1, // Reset CPU
        logs: [
          ...pod.logs,
          `${getCurrentTimestamp()} INFO: Issue resolved, pod is healthy`,
          `${getCurrentTimestamp()} INFO: Application running normally`
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
  // Assume target MTTR is 60 seconds
  const mttrBonus = Math.max(0, 60 - mttr) * 5;
  score += mttrBonus;

  // Penalty for excessive commands (inefficiency)
  // Allow 5 commands per incident without penalty
  const allowedCommands = incidentsResolved * 5;
  const commandPenalty = Math.max(0, commandsUsed - allowedCommands) * 2;
  score -= commandPenalty;

  // Bonus for proactive checks
  score += proactiveChecks * 5;

  return Math.max(0, score);
} 