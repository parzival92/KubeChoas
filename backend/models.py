from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from enum import Enum

class PodStatus(str, Enum):
    Running = 'Running'
    Pending = 'Pending'
    Failed = 'Failed'
    CrashLoopBackOff = 'CrashLoopBackOff'
    Unknown = 'Unknown'

class ServiceStatus(str, Enum):
    Active = 'Active'
    Failed = 'Failed'

class DeploymentStatus(str, Enum):
    Available = 'Available'
    Failed = 'Failed'
    Progressing = 'Progressing'

class ChaosEventType(str, Enum):
    pod_crash = 'pod-crash'
    high_cpu = 'high-cpu'
    dns_failure = 'dns-failure'
    service_down = 'service-down'
    deployment_failed = 'deployment-failed'
    cart_service_oom = 'cart-service-oom'
    api_gateway_overload = 'api-gateway-overload'
    database_connection_exhausted = 'database-connection-exhausted'
    redis_cache_eviction = 'redis-cache-eviction'
    rabbitmq_queue_full = 'rabbitmq-queue-full'
    payment_service_timeout = 'payment-service-timeout'

class ChaosSeverity(str, Enum):
    low = 'low'
    medium = 'medium'
    high = 'high'
    critical = 'critical'

class Pod(BaseModel):
    id: str
    name: str
    namespace: str
    status: PodStatus
    ready: str
    restarts: int
    age: str
    cpu: float
    memory: int
    logs: List[str]

class Service(BaseModel):
    id: str
    name: str
    namespace: str
    type: str
    clusterIp: str
    externalIp: str
    ports: str
    age: str
    status: ServiceStatus

class Deployment(BaseModel):
    id: str
    name: str
    namespace: str
    ready: str
    upToDate: int
    available: int
    age: str
    status: DeploymentStatus

class ChaosEvent(BaseModel):
    id: str
    type: ChaosEventType
    severity: ChaosSeverity
    description: str
    affectedResources: List[str]
    timestamp: datetime
    resolved: bool
    resolvedAt: Optional[datetime] = None

class GameScore(BaseModel):
    totalScore: int
    mttr: float
    commandsUsed: int
    incidentsResolved: int
    proactiveChecks: int

class GameState(BaseModel):
    isGameRunning: bool
    gameStartTime: Optional[datetime]
    currentTime: datetime
    pods: List[Pod]
    services: List[Service]
    deployments: List[Deployment]
    chaosEvents: List[ChaosEvent]
    activeEvents: List[ChaosEvent]
    terminalHistory: List[str]
    currentCommand: str
    score: GameScore
