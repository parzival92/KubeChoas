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
  type: 'pod-crash' | 'high-cpu' | 'dns-failure' | 'service-down' | 'deployment-failed';
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
  
  // Initial Cluster Resources
  pods: [
    {
      id: 'pod-1',
      name: 'nginx-deployment-6b474476c4',
      namespace: 'default',
      status: 'Running',
      ready: '1/1',
      restarts: 0,
      age: '2h',
      cpu: 0.1,
      memory: 2.5,
      logs: ['2024-01-01T10:00:00Z INFO: nginx started', '2024-01-01T10:00:01Z INFO: listening on port 80']
    },
    {
      id: 'pod-2',
      name: 'redis-deployment-8f5d4c2a1b',
      namespace: 'default',
      status: 'Running',
      ready: '1/1',
      restarts: 0,
      age: '1h',
      cpu: 0.2,
      memory: 15.3,
      logs: ['2024-01-01T09:00:00Z INFO: Redis server started', '2024-01-01T09:00:01Z INFO: Ready to accept connections']
    }
  ],
  
  services: [
    {
      id: 'svc-1',
      name: 'nginx-service',
      namespace: 'default',
      type: 'ClusterIP',
      clusterIp: '10.96.1.100',
      externalIp: '<none>',
      ports: '80:80/TCP',
      age: '2h',
      status: 'Active'
    },
    {
      id: 'svc-2',
      name: 'redis-service',
      namespace: 'default',
      type: 'ClusterIP',
      clusterIp: '10.96.1.101',
      externalIp: '<none>',
      ports: '6379:6379/TCP',
      age: '1h',
      status: 'Active'
    }
  ],
  
  deployments: [
    {
      id: 'deploy-1',
      name: 'nginx-deployment',
      namespace: 'default',
      ready: '1/1',
      upToDate: 1,
      available: 1,
      age: '2h',
      status: 'Available'
    },
    {
      id: 'deploy-2',
      name: 'redis-deployment',
      namespace: 'default',
      ready: '1/1',
      upToDate: 1,
      available: 1,
      age: '1h',
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