import { create } from 'zustand';

const API_BASE_URL = 'http://localhost:8000';

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
  mttr: number;
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
  startGame: () => Promise<void>;
  stopGame: () => Promise<void>;
  fetchGameState: () => Promise<void>;
  executeCommand: (command: string) => Promise<string>;
  addTerminalOutput: (output: string) => void;
  setCurrentCommand: (command: string) => void;
  resolveChaosEvent: (eventId: string) => Promise<void>;
  updatePod: (podId: string, updates: Partial<Pod>) => void;
  updateService: (serviceId: string, updates: Partial<Service>) => void;
  updateDeployment: (deploymentId: string, updates: Partial<Deployment>) => void;
  updateScore: (updates: Partial<GameScore>) => void;
  generateRandomChaosEvent: () => Promise<void>;
}

export const useGameStore = create<GameState>((set, get) => ({
  // Initial State
  isGameRunning: false,
  gameStartTime: null,
  currentTime: new Date(),
  pods: [],
  services: [],
  deployments: [],
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
  startGame: async () => {
    try {
      await fetch(`${API_BASE_URL}/start`, { method: 'POST' });
      await get().fetchGameState();
    } catch (error) {
      console.error('Failed to start game:', error);
    }
  },

  stopGame: async () => {
    try {
      await fetch(`${API_BASE_URL}/stop`, { method: 'POST' });
      await get().fetchGameState();
    } catch (error) {
      console.error('Failed to stop game:', error);
    }
  },

  fetchGameState: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/status`);
      const data = await response.json();

      set({
        isGameRunning: data.isGameRunning,
        gameStartTime: data.gameStartTime ? new Date(data.gameStartTime) : null,
        currentTime: new Date(data.currentTime),
        pods: data.pods,
        services: data.services,
        deployments: data.deployments,
        chaosEvents: data.chaosEvents.map((e: any) => ({
          ...e,
          timestamp: new Date(e.timestamp),
          resolvedAt: e.resolvedAt ? new Date(e.resolvedAt) : undefined
        })),
        activeEvents: data.activeEvents.map((e: any) => ({
          ...e,
          timestamp: new Date(e.timestamp),
          resolvedAt: e.resolvedAt ? new Date(e.resolvedAt) : undefined
        })),
        terminalHistory: data.terminalHistory,
        currentCommand: data.currentCommand,
        score: data.score
      });
    } catch (error) {
      console.error('Failed to fetch game state:', error);
    }
  },

  executeCommand: async (command: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command })
      });
      const data = await response.json();

      // Fetch updated state after command execution
      await get().fetchGameState();

      return data.output || '';
    } catch (error) {
      console.error('Failed to execute command:', error);
      return 'Error: Failed to execute command';
    }
  },

  resolveChaosEvent: async (eventId: string) => {
    try {
      await fetch(`${API_BASE_URL}/chaos/resolve/${eventId}`, { method: 'POST' });
      await get().fetchGameState();
    } catch (error) {
      console.error('Failed to resolve chaos event:', error);
    }
  },

  generateRandomChaosEvent: async () => {
    try {
      await fetch(`${API_BASE_URL}/chaos/generate`, { method: 'POST' });
      await get().fetchGameState();
    } catch (error) {
      console.error('Failed to generate chaos event:', error);
    }
  },

  // Local state updates (for optimistic UI updates if needed)
  addTerminalOutput: (output: string) => {
    set((state) => ({
      terminalHistory: [...state.terminalHistory, output]
    }));
  },

  setCurrentCommand: (command: string) => {
    set({ currentCommand: command });
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

  updateScore: (updates: Partial<GameScore>) => {
    set((state) => ({
      score: { ...state.score, ...updates }
    }));
  }
}));