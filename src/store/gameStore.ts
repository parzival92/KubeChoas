import { create } from 'zustand';
import { generateChaosEvent, applyChaosEffects, resolveChaosEvent, calculateScore } from '@/utils/chaosEngine';

export interface Pod {
  id: string;
  name: string;
  namespace: string;
  status: 'Running' | 'Pending' | 'Failed' | 'CrashLoopBackOff' | 'Unknown';
  ready: string;
  restarts: number;
  age: string;
  cpu: number;
  memory: number;
  logs: string[];
}

export interface Service {
  id: string;
  name: string;
  namespace: string;
  type: string;
  clusterIp: string;
  externalIp: string;
  ports: string;
  age: string;
  status: 'Active' | 'Failed';
}

export interface Deployment {
  id: string;
  name: string;
  namespace: string;
  ready: string;
  upToDate: number;
  available: number;
  age: string;
  status: 'Available' | 'Failed' | 'Progressing';
}

export interface ChaosEvent {
  id: string;
  type: 'pod-crash' | 'high-cpu' | 'dns-failure' | 'service-down' | 'deployment-failed' |
  'cart-service-oom' | 'api-gateway-overload' | 'database-connection-exhausted' |
  'redis-cache-eviction' | 'rabbitmq-queue-full' | 'payment-service-timeout';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedResources: string[];
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
}

export interface GameScore {
  totalScore: number;
  mttr: number; // Mean Time To Resolution
  commandsUsed: number;
  incidentsResolved: number;
  proactiveChecks: number;
}

interface GameState {
  // Game Status
  isGameRunning: boolean;
  gameStartTime: Date | null;
  currentTime: Date;

  // Cluster Resources
  pods: Pod[];
  services: Service[];
  deployments: Deployment[];

  // Chaos Events
  chaosEvents: ChaosEvent[];
  activeEvents: ChaosEvent[];

  // Terminal
  terminalHistory: string[];
  currentCommand: string;

  // Scoring
  score: GameScore;

  // Actions
  startGame: () => void;
  stopGame: () => void;
  addChaosEvent: (event: ChaosEvent) => void;
  resolveChaosEvent: (eventId: string) => void;
  updatePod: (podId: string, updates: Partial<Pod>) => void;
  updateService: (serviceId: string, updates: Partial<Service>) => void;
  updateDeployment: (deploymentId: string, updates: Partial<Deployment>) => void;
  addTerminalOutput: (output: string) => void;
  setCurrentCommand: (command: string) => void;
  updateScore: (updates: Partial<GameScore>) => void;
  generateRandomChaosEvent: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  // Initial State
  isGameRunning: false,
  gameStartTime: null,
  currentTime: new Date(),

  // Initial Cluster Resources - E-Commerce Microservices
  pods: [
    // Production Namespace - Frontend (3 replicas)
    {
      id: 'pod-prod-1',
      name: 'web-frontend-7d9f8c6b5-abc12',
      namespace: 'production',
      status: 'Running',
      ready: '1/1',
      restarts: 0,
      age: '3h',
      cpu: 0.3,
      memory: 128,
      logs: ['[INFO] Next.js server started on port 3000', '[INFO] Ready to handle requests']
    },
    {
      id: 'pod-prod-2',
      name: 'web-frontend-7d9f8c6b5-def34',
      namespace: 'production',
      status: 'Running',
      ready: '1/1',
      restarts: 0,
      age: '3h',
      cpu: 0.2,
      memory: 125,
      logs: ['[INFO] Next.js server started on port 3000', '[INFO] Ready to handle requests']
    },
    {
      id: 'pod-prod-3',
      name: 'web-frontend-7d9f8c6b5-ghi56',
      namespace: 'production',
      status: 'Running',
      ready: '1/1',
      restarts: 0,
      age: '3h',
      cpu: 0.25,
      memory: 130,
      logs: ['[INFO] Next.js server started on port 3000', '[INFO] Ready to handle requests']
    },

    // Production Namespace - API Gateway (2 replicas)
    {
      id: 'pod-prod-4',
      name: 'api-gateway-5c8d9e4f2-jkl78',
      namespace: 'production',
      status: 'Running',
      ready: '1/1',
      restarts: 0,
      age: '2h',
      cpu: 0.5,
      memory: 256,
      logs: ['[INFO] API Gateway listening on :8080', '[INFO] Connected to product-service', '[INFO] Connected to cart-service']
    },
    {
      id: 'pod-prod-5',
      name: 'api-gateway-5c8d9e4f2-mno90',
      namespace: 'production',
      status: 'Running',
      ready: '1/1',
      restarts: 0,
      age: '2h',
      cpu: 0.4,
      memory: 245,
      logs: ['[INFO] API Gateway listening on :8080', '[INFO] Connected to product-service', '[INFO] Connected to cart-service']
    },

    // Production Namespace - Product Service (2 replicas)
    {
      id: 'pod-prod-6',
      name: 'product-service-9a7b6c5d4-pqr12',
      namespace: 'production',
      status: 'Running',
      ready: '1/1',
      restarts: 0,
      age: '2h',
      cpu: 0.3,
      memory: 200,
      logs: ['[INFO] Product service started', '[INFO] Connected to postgres-primary.data.svc.cluster.local', '[INFO] Cache connected to redis']
    },
    {
      id: 'pod-prod-7',
      name: 'product-service-9a7b6c5d4-stu34',
      namespace: 'production',
      status: 'Running',
      ready: '1/1',
      restarts: 0,
      age: '2h',
      cpu: 0.35,
      memory: 210,
      logs: ['[INFO] Product service started', '[INFO] Connected to postgres-primary.data.svc.cluster.local', '[INFO] Cache connected to redis']
    },

    // Production Namespace - Cart Service (2 replicas)
    {
      id: 'pod-prod-8',
      name: 'cart-service-3e4f5g6h7-vwx56',
      namespace: 'production',
      status: 'Running',
      ready: '1/1',
      restarts: 0,
      age: '1h',
      cpu: 0.2,
      memory: 150,
      logs: ['[INFO] Cart service initialized', '[INFO] Redis connection established', '[INFO] Ready to accept requests']
    },
    {
      id: 'pod-prod-9',
      name: 'cart-service-3e4f5g6h7-yza78',
      namespace: 'production',
      status: 'Running',
      ready: '1/1',
      restarts: 0,
      age: '1h',
      cpu: 0.25,
      memory: 155,
      logs: ['[INFO] Cart service initialized', '[INFO] Redis connection established', '[INFO] Ready to accept requests']
    },

    // Production Namespace - Order Service (2 replicas)
    {
      id: 'pod-prod-10',
      name: 'order-service-8h9i0j1k2-bcd90',
      namespace: 'production',
      status: 'Running',
      ready: '1/1',
      restarts: 0,
      age: '1h',
      cpu: 0.4,
      memory: 220,
      logs: ['[INFO] Order service started', '[INFO] Database connection pool ready', '[INFO] RabbitMQ publisher connected']
    },
    {
      id: 'pod-prod-11',
      name: 'order-service-8h9i0j1k2-efg12',
      namespace: 'production',
      status: 'Running',
      ready: '1/1',
      restarts: 0,
      age: '1h',
      cpu: 0.45,
      memory: 230,
      logs: ['[INFO] Order service started', '[INFO] Database connection pool ready', '[INFO] RabbitMQ publisher connected']
    },

    // Data Namespace - PostgreSQL (StatefulSet)
    {
      id: 'pod-data-1',
      name: 'postgres-primary-0',
      namespace: 'data',
      status: 'Running',
      ready: '1/1',
      restarts: 0,
      age: '5h',
      cpu: 0.8,
      memory: 512,
      logs: ['[INFO] PostgreSQL 15.3 starting', '[INFO] database system is ready to accept connections', '[INFO] Replication slot active']
    },
    {
      id: 'pod-data-2',
      name: 'postgres-replica-0',
      namespace: 'data',
      status: 'Running',
      ready: '1/1',
      restarts: 0,
      age: '5h',
      cpu: 0.3,
      memory: 450,
      logs: ['[INFO] PostgreSQL 15.3 starting', '[INFO] entering standby mode', '[INFO] streaming replication successfully connected']
    },

    // Data Namespace - Redis Cache (2 replicas)
    {
      id: 'pod-data-3',
      name: 'redis-cache-6f7g8h9i0-abc12',
      namespace: 'data',
      status: 'Running',
      ready: '1/1',
      restarts: 0,
      age: '4h',
      cpu: 0.2,
      memory: 256,
      logs: ['[INFO] Redis 7.0.11 starting', '[INFO] Server initialized', '[INFO] Ready to accept connections']
    },
    {
      id: 'pod-data-4',
      name: 'redis-cache-6f7g8h9i0-def34',
      namespace: 'data',
      status: 'Running',
      ready: '1/1',
      restarts: 0,
      age: '4h',
      cpu: 0.15,
      memory: 240,
      logs: ['[INFO] Redis 7.0.11 starting', '[INFO] Server initialized', '[INFO] Ready to accept connections']
    },

    // Data Namespace - RabbitMQ Cluster (3 replicas)
    {
      id: 'pod-data-5',
      name: 'rabbitmq-0',
      namespace: 'data',
      status: 'Running',
      ready: '1/1',
      restarts: 0,
      age: '4h',
      cpu: 0.3,
      memory: 300,
      logs: ['[INFO] RabbitMQ 3.12.0 starting', '[INFO] Server startup complete', '[INFO] Cluster formed with 3 nodes']
    },
    {
      id: 'pod-data-6',
      name: 'rabbitmq-1',
      namespace: 'data',
      status: 'Running',
      ready: '1/1',
      restarts: 0,
      age: '4h',
      cpu: 0.25,
      memory: 280,
      logs: ['[INFO] RabbitMQ 3.12.0 starting', '[INFO] Joined cluster', '[INFO] Ready to accept connections']
    },
    {
      id: 'pod-data-7',
      name: 'rabbitmq-2',
      namespace: 'data',
      status: 'Running',
      ready: '1/1',
      restarts: 0,
      age: '4h',
      cpu: 0.28,
      memory: 290,
      logs: ['[INFO] RabbitMQ 3.12.0 starting', '[INFO] Joined cluster', '[INFO] Ready to accept connections']
    }
  ],

  services: [
    // Production Namespace Services
    {
      id: 'svc-prod-1',
      name: 'web-frontend',
      namespace: 'production',
      type: 'LoadBalancer',
      clusterIp: '10.96.1.10',
      externalIp: '34.123.45.67',
      ports: '80:3000/TCP',
      age: '3h',
      status: 'Active'
    },
    {
      id: 'svc-prod-2',
      name: 'api-gateway',
      namespace: 'production',
      type: 'ClusterIP',
      clusterIp: '10.96.1.20',
      externalIp: '<none>',
      ports: '8080:8080/TCP',
      age: '2h',
      status: 'Active'
    },
    {
      id: 'svc-prod-3',
      name: 'product-service',
      namespace: 'production',
      type: 'ClusterIP',
      clusterIp: '10.96.1.30',
      externalIp: '<none>',
      ports: '8081:8081/TCP',
      age: '2h',
      status: 'Active'
    },
    {
      id: 'svc-prod-4',
      name: 'cart-service',
      namespace: 'production',
      type: 'ClusterIP',
      clusterIp: '10.96.1.40',
      externalIp: '<none>',
      ports: '8082:8082/TCP',
      age: '1h',
      status: 'Active'
    },
    {
      id: 'svc-prod-5',
      name: 'order-service',
      namespace: 'production',
      type: 'ClusterIP',
      clusterIp: '10.96.1.50',
      externalIp: '<none>',
      ports: '8083:8083/TCP',
      age: '1h',
      status: 'Active'
    },

    // Data Namespace Services
    {
      id: 'svc-data-1',
      name: 'postgres-primary',
      namespace: 'data',
      type: 'ClusterIP',
      clusterIp: '10.96.2.10',
      externalIp: '<none>',
      ports: '5432:5432/TCP',
      age: '5h',
      status: 'Active'
    },
    {
      id: 'svc-data-2',
      name: 'postgres-replica',
      namespace: 'data',
      type: 'ClusterIP',
      clusterIp: '10.96.2.11',
      externalIp: '<none>',
      ports: '5432:5432/TCP',
      age: '5h',
      status: 'Active'
    },
    {
      id: 'svc-data-3',
      name: 'redis-cache',
      namespace: 'data',
      type: 'ClusterIP',
      clusterIp: '10.96.2.20',
      externalIp: '<none>',
      ports: '6379:6379/TCP',
      age: '4h',
      status: 'Active'
    },
    {
      id: 'svc-data-4',
      name: 'rabbitmq',
      namespace: 'data',
      type: 'ClusterIP',
      clusterIp: '10.96.2.30',
      externalIp: '<none>',
      ports: '5672:5672/TCP,15672:15672/TCP',
      age: '4h',
      status: 'Active'
    }
  ],

  deployments: [
    // Production Namespace Deployments
    {
      id: 'deploy-prod-1',
      name: 'web-frontend',
      namespace: 'production',
      ready: '3/3',
      upToDate: 3,
      available: 3,
      age: '3h',
      status: 'Available'
    },
    {
      id: 'deploy-prod-2',
      name: 'api-gateway',
      namespace: 'production',
      ready: '2/2',
      upToDate: 2,
      available: 2,
      age: '2h',
      status: 'Available'
    },
    {
      id: 'deploy-prod-3',
      name: 'product-service',
      namespace: 'production',
      ready: '2/2',
      upToDate: 2,
      available: 2,
      age: '2h',
      status: 'Available'
    },
    {
      id: 'deploy-prod-4',
      name: 'cart-service',
      namespace: 'production',
      ready: '2/2',
      upToDate: 2,
      available: 2,
      age: '1h',
      status: 'Available'
    },
    {
      id: 'deploy-prod-5',
      name: 'order-service',
      namespace: 'production',
      ready: '2/2',
      upToDate: 2,
      available: 2,
      age: '1h',
      status: 'Available'
    },

    // Data Namespace Deployments (for Redis)
    {
      id: 'deploy-data-1',
      name: 'redis-cache',
      namespace: 'data',
      ready: '2/2',
      upToDate: 2,
      available: 2,
      age: '4h',
      status: 'Available'
    }
  ],

  chaosEvents: [],
  activeEvents: [],

  terminalHistory: [
    'Welcome to KubeChaos Terminal!',
    'Type "help" for available commands.',
    'Type "kubectl get pods" to see your cluster pods.',
    ''
  ],
  currentCommand: '',

  score: {
    totalScore: 0,
    mttr: 0,
    commandsUsed: 0,
    incidentsResolved: 0,
    proactiveChecks: 0
  },

  // Actions
  startGame: () => {
    set({
      isGameRunning: true,
      gameStartTime: new Date(),
      currentTime: new Date(),
      chaosEvents: [],
      activeEvents: [],
      score: {
        totalScore: 0,
        mttr: 0,
        commandsUsed: 0,
        incidentsResolved: 0,
        proactiveChecks: 0
      }
    });
  },

  stopGame: () => {
    set({
      isGameRunning: false,
      gameStartTime: null
    });
  },

  addChaosEvent: (event: ChaosEvent) => {
    set((state) => {
      // Apply chaos effects to cluster resources
      const { updatedPods, updatedServices, updatedDeployments } = applyChaosEffects(
        event,
        state.pods,
        state.services,
        state.deployments
      );

      return {
        chaosEvents: [...state.chaosEvents, event],
        activeEvents: [...state.activeEvents, event],
        pods: updatedPods,
        services: updatedServices,
        deployments: updatedDeployments
      };
    });
  },

  resolveChaosEvent: (eventId: string) => {
    set((state) => {
      const event = state.activeEvents.find(e => e.id === eventId);
      if (!event) return state;

      // Apply resolution effects to cluster resources
      const { updatedPods, updatedServices, updatedDeployments } = resolveChaosEvent(
        event,
        state.pods,
        state.services,
        state.deployments
      );

      // Calculate new score
      const newIncidentsResolved = state.score.incidentsResolved + 1;
      const newTotalScore = calculateScore(
        state.score.mttr,
        state.score.commandsUsed,
        newIncidentsResolved,
        state.score.proactiveChecks
      );

      return {
        activeEvents: state.activeEvents.filter(event => event.id !== eventId),
        chaosEvents: state.chaosEvents.map(event =>
          event.id === eventId
            ? { ...event, resolved: true, resolvedAt: new Date() }
            : event
        ),
        pods: updatedPods,
        services: updatedServices,
        deployments: updatedDeployments,
        score: {
          ...state.score,
          incidentsResolved: newIncidentsResolved,
          totalScore: newTotalScore
        }
      };
    });
  },

  updatePod: (podId: string, updates: Partial<Pod>) => {
    set((state) => ({
      pods: state.pods.map(pod =>
        pod.id === podId ? { ...pod, ...updates } : pod
      )
    }));
  },

  updateService: (serviceId: string, updates: Partial<Service>) => {
    set((state) => ({
      services: state.services.map(service =>
        service.id === serviceId ? { ...service, ...updates } : service
      )
    }));
  },

  updateDeployment: (deploymentId: string, updates: Partial<Deployment>) => {
    set((state) => ({
      deployments: state.deployments.map(deployment =>
        deployment.id === deploymentId ? { ...deployment, ...updates } : deployment
      )
    }));
  },

  addTerminalOutput: (output: string) => {
    set((state) => ({
      terminalHistory: [...state.terminalHistory, output]
    }));
  },

  setCurrentCommand: (command: string) => {
    set({ currentCommand: command });
  },

  updateScore: (updates: Partial<GameScore>) => {
    set((state) => ({
      score: { ...state.score, ...updates }
    }));
  },

  generateRandomChaosEvent: () => {
    const { activeEvents } = get();
    if (activeEvents.length === 0) {
      const event = generateChaosEvent();
      get().addChaosEvent(event);
    }
  }
})); 