import random
import uuid
from datetime import datetime
from typing import List, Optional, Dict
from models import (
    Pod, Service, Deployment, ChaosEvent, GameScore, GameState,
    PodStatus, ServiceStatus, DeploymentStatus, ChaosEventType, ChaosSeverity
)

class GameManager:
    def __init__(self):
        self.is_game_running = False
        self.game_start_time: Optional[datetime] = None
        self.chaos_events: List[ChaosEvent] = []
        self.active_events: List[ChaosEvent] = []
        self.terminal_history: List[str] = [
            'Welcome to KubeChaos Terminal!',
            'Type "help" for available commands.',
            'Type "kubectl get pods" to see your cluster pods.',
            ''
        ]
        self.current_command = ''
        self.score = GameScore(
            totalScore=0,
            mttr=0,
            commandsUsed=0,
            incidentsResolved=0,
            proactiveChecks=0
        )
        self.pods = self._init_pods()
        self.services = self._init_services()
        self.deployments = self._init_deployments()

    def _init_pods(self) -> List[Pod]:
        return [
            Pod(id='pod-prod-1', name='web-frontend-7d9f8c6b5-abc12', namespace='production', status=PodStatus.Running, ready='1/1', restarts=0, age='3h', cpu=0.3, memory=128, logs=['[INFO] Next.js server started on port 3000', '[INFO] Ready to handle requests']),
            Pod(id='pod-prod-2', name='web-frontend-7d9f8c6b5-def34', namespace='production', status=PodStatus.Running, ready='1/1', restarts=0, age='3h', cpu=0.2, memory=125, logs=['[INFO] Next.js server started on port 3000', '[INFO] Ready to handle requests']),
            Pod(id='pod-prod-3', name='web-frontend-7d9f8c6b5-ghi56', namespace='production', status=PodStatus.Running, ready='1/1', restarts=0, age='3h', cpu=0.25, memory=130, logs=['[INFO] Next.js server started on port 3000', '[INFO] Ready to handle requests']),
            Pod(id='pod-prod-4', name='api-gateway-5c8d9e4f2-jkl78', namespace='production', status=PodStatus.Running, ready='1/1', restarts=0, age='2h', cpu=0.5, memory=256, logs=['[INFO] API Gateway listening on :8080', '[INFO] Connected to product-service', '[INFO] Connected to cart-service']),
            Pod(id='pod-prod-5', name='api-gateway-5c8d9e4f2-mno90', namespace='production', status=PodStatus.Running, ready='1/1', restarts=0, age='2h', cpu=0.4, memory=245, logs=['[INFO] API Gateway listening on :8080', '[INFO] Connected to product-service', '[INFO] Connected to cart-service']),
            Pod(id='pod-prod-6', name='product-service-9a7b6c5d4-pqr12', namespace='production', status=PodStatus.Running, ready='1/1', restarts=0, age='2h', cpu=0.3, memory=200, logs=['[INFO] Product service started', '[INFO] Connected to postgres-primary.data.svc.cluster.local', '[INFO] Cache connected to redis']),
            Pod(id='pod-prod-7', name='product-service-9a7b6c5d4-stu34', namespace='production', status=PodStatus.Running, ready='1/1', restarts=0, age='2h', cpu=0.35, memory=210, logs=['[INFO] Product service started', '[INFO] Connected to postgres-primary.data.svc.cluster.local', '[INFO] Cache connected to redis']),
            Pod(id='pod-prod-8', name='cart-service-3e4f5g6h7-vwx56', namespace='production', status=PodStatus.Running, ready='1/1', restarts=0, age='1h', cpu=0.2, memory=150, logs=['[INFO] Cart service initialized', '[INFO] Redis connection established', '[INFO] Ready to accept requests']),
            Pod(id='pod-prod-9', name='cart-service-3e4f5g6h7-yza78', namespace='production', status=PodStatus.Running, ready='1/1', restarts=0, age='1h', cpu=0.25, memory=155, logs=['[INFO] Cart service initialized', '[INFO] Redis connection established', '[INFO] Ready to accept requests']),
            Pod(id='pod-prod-10', name='order-service-8h9i0j1k2-bcd90', namespace='production', status=PodStatus.Running, ready='1/1', restarts=0, age='1h', cpu=0.4, memory=220, logs=['[INFO] Order service started', '[INFO] Database connection pool ready', '[INFO] RabbitMQ publisher connected']),
            Pod(id='pod-prod-11', name='order-service-8h9i0j1k2-efg12', namespace='production', status=PodStatus.Running, ready='1/1', restarts=0, age='1h', cpu=0.45, memory=230, logs=['[INFO] Order service started', '[INFO] Database connection pool ready', '[INFO] RabbitMQ publisher connected']),
            Pod(id='pod-data-1', name='postgres-primary-0', namespace='data', status=PodStatus.Running, ready='1/1', restarts=0, age='5h', cpu=0.8, memory=512, logs=['[INFO] PostgreSQL 15.3 starting', '[INFO] database system is ready to accept connections', '[INFO] Replication slot active']),
            Pod(id='pod-data-2', name='postgres-replica-0', namespace='data', status=PodStatus.Running, ready='1/1', restarts=0, age='5h', cpu=0.3, memory=450, logs=['[INFO] PostgreSQL 15.3 starting', '[INFO] entering standby mode', '[INFO] streaming replication successfully connected']),
            Pod(id='pod-data-3', name='redis-cache-6f7g8h9i0-abc12', namespace='data', status=PodStatus.Running, ready='1/1', restarts=0, age='4h', cpu=0.2, memory=256, logs=['[INFO] Redis 7.0.11 starting', '[INFO] Server initialized', '[INFO] Ready to accept connections']),
            Pod(id='pod-data-4', name='redis-cache-6f7g8h9i0-def34', namespace='data', status=PodStatus.Running, ready='1/1', restarts=0, age='4h', cpu=0.15, memory=240, logs=['[INFO] Redis 7.0.11 starting', '[INFO] Server initialized', '[INFO] Ready to accept connections']),
            Pod(id='pod-data-5', name='rabbitmq-0', namespace='data', status=PodStatus.Running, ready='1/1', restarts=0, age='4h', cpu=0.3, memory=300, logs=['[INFO] RabbitMQ 3.12.0 starting', '[INFO] Server startup complete', '[INFO] Cluster formed with 3 nodes']),
            Pod(id='pod-data-6', name='rabbitmq-1', namespace='data', status=PodStatus.Running, ready='1/1', restarts=0, age='4h', cpu=0.25, memory=280, logs=['[INFO] RabbitMQ 3.12.0 starting', '[INFO] Joined cluster', '[INFO] Ready to accept connections']),
            Pod(id='pod-data-7', name='rabbitmq-2', namespace='data', status=PodStatus.Running, ready='1/1', restarts=0, age='4h', cpu=0.28, memory=290, logs=['[INFO] RabbitMQ 3.12.0 starting', '[INFO] Joined cluster', '[INFO] Ready to accept connections'])
        ]

    def _init_services(self) -> List[Service]:
        return [
            Service(id='svc-prod-1', name='web-frontend', namespace='production', type='LoadBalancer', clusterIp='10.96.1.10', externalIp='34.123.45.67', ports='80:3000/TCP', age='3h', status=ServiceStatus.Active),
            Service(id='svc-prod-2', name='api-gateway', namespace='production', type='ClusterIP', clusterIp='10.96.1.20', externalIp='<none>', ports='8080:8080/TCP', age='2h', status=ServiceStatus.Active),
            Service(id='svc-prod-3', name='product-service', namespace='production', type='ClusterIP', clusterIp='10.96.1.30', externalIp='<none>', ports='8081:8081/TCP', age='2h', status=ServiceStatus.Active),
            Service(id='svc-prod-4', name='cart-service', namespace='production', type='ClusterIP', clusterIp='10.96.1.40', externalIp='<none>', ports='8082:8082/TCP', age='1h', status=ServiceStatus.Active),
            Service(id='svc-prod-5', name='order-service', namespace='production', type='ClusterIP', clusterIp='10.96.1.50', externalIp='<none>', ports='8083:8083/TCP', age='1h', status=ServiceStatus.Active),
            Service(id='svc-data-1', name='postgres-primary', namespace='data', type='ClusterIP', clusterIp='10.96.2.10', externalIp='<none>', ports='5432:5432/TCP', age='5h', status=ServiceStatus.Active),
            Service(id='svc-data-2', name='postgres-replica', namespace='data', type='ClusterIP', clusterIp='10.96.2.11', externalIp='<none>', ports='5432:5432/TCP', age='5h', status=ServiceStatus.Active),
            Service(id='svc-data-3', name='redis-cache', namespace='data', type='ClusterIP', clusterIp='10.96.2.20', externalIp='<none>', ports='6379:6379/TCP', age='4h', status=ServiceStatus.Active),
            Service(id='svc-data-4', name='rabbitmq', namespace='data', type='ClusterIP', clusterIp='10.96.2.30', externalIp='<none>', ports='5672:5672/TCP,15672:15672/TCP', age='4h', status=ServiceStatus.Active)
        ]

    def _init_deployments(self) -> List[Deployment]:
        return [
            Deployment(id='deploy-prod-1', name='web-frontend', namespace='production', ready='3/3', upToDate=3, available=3, age='3h', status=DeploymentStatus.Available),
            Deployment(id='deploy-prod-2', name='api-gateway', namespace='production', ready='2/2', upToDate=2, available=2, age='2h', status=DeploymentStatus.Available),
            Deployment(id='deploy-prod-3', name='product-service', namespace='production', ready='2/2', upToDate=2, available=2, age='2h', status=DeploymentStatus.Available),
            Deployment(id='deploy-prod-4', name='cart-service', namespace='production', ready='2/2', upToDate=2, available=2, age='1h', status=DeploymentStatus.Available),
            Deployment(id='deploy-prod-5', name='order-service', namespace='production', ready='2/2', upToDate=2, available=2, age='1h', status=DeploymentStatus.Available),
            Deployment(id='deploy-data-1', name='redis-cache', namespace='data', ready='2/2', upToDate=2, available=2, age='4h', status=DeploymentStatus.Available)
        ]

    def get_state(self) -> GameState:
        return GameState(
            isGameRunning=self.is_game_running,
            gameStartTime=self.game_start_time,
            currentTime=datetime.now(),
            pods=self.pods,
            services=self.services,
            deployments=self.deployments,
            chaosEvents=self.chaos_events,
            activeEvents=self.active_events,
            terminalHistory=self.terminal_history,
            currentCommand=self.current_command,
            score=self.score
        )

    def start_game(self):
        self.is_game_running = True
        self.game_start_time = datetime.now()
        self.chaos_events = []
        self.active_events = []
        self.score = GameScore(totalScore=0, mttr=0, commandsUsed=0, incidentsResolved=0, proactiveChecks=0)

    def stop_game(self):
        self.is_game_running = False
        self.game_start_time = None

    def generate_chaos_event(self):
        if not self.is_game_running or self.active_events:
            return

        templates = [
            {'type': ChaosEventType.api_gateway_overload, 'severity': ChaosSeverity.critical, 'desc': 'API Gateway overload', 'resources': ['api-gateway']},
            {'type': ChaosEventType.pod_crash, 'severity': ChaosSeverity.high, 'desc': 'Web Frontend pod crash', 'resources': ['web-frontend']},
            {'type': ChaosEventType.cart_service_oom, 'severity': ChaosSeverity.critical, 'desc': 'Cart Service OOM', 'resources': ['cart-service']},
            {'type': ChaosEventType.high_cpu, 'severity': ChaosSeverity.medium, 'desc': 'Product Service High CPU', 'resources': ['product-service']},
            {'type': ChaosEventType.database_connection_exhausted, 'severity': ChaosSeverity.critical, 'desc': 'DB Connection Exhausted', 'resources': ['postgres-primary']},
            {'type': ChaosEventType.redis_cache_eviction, 'severity': ChaosSeverity.high, 'desc': 'Redis Cache Eviction', 'resources': ['redis-cache']},
            {'type': ChaosEventType.rabbitmq_queue_full, 'severity': ChaosSeverity.high, 'desc': 'RabbitMQ Queue Full', 'resources': ['rabbitmq']},
            {'type': ChaosEventType.dns_failure, 'severity': ChaosSeverity.critical, 'desc': 'DNS Failure', 'resources': ['product-service', 'cart-service']},
            {'type': ChaosEventType.service_down, 'severity': ChaosSeverity.high, 'desc': 'Order Service Down', 'resources': ['order-service']},
            {'type': ChaosEventType.deployment_failed, 'severity': ChaosSeverity.critical, 'desc': 'Deployment Failed', 'resources': ['product-service']}
        ]
        
        template = random.choice(templates)
        event = ChaosEvent(
            id=f"chaos-{int(datetime.now().timestamp())}-{uuid.uuid4().hex[:8]}",
            type=template['type'],
            severity=template['severity'],
            description=template['desc'],
            affectedResources=template['resources'],
            timestamp=datetime.now(),
            resolved=False
        )
        
        self.chaos_events.append(event)
        self.active_events.append(event)
        self._apply_chaos_effects(event)

    def _apply_chaos_effects(self, event: ChaosEvent):
        # Simplified effect application logic
        for pod in self.pods:
            if any(r in pod.name for r in event.affectedResources):
                if event.type == ChaosEventType.pod_crash:
                    pod.status = PodStatus.CrashLoopBackOff
                    pod.restarts += 1
                    pod.logs.append(f"{datetime.now().isoformat()} ERROR: Process exited with code 137")
                elif event.type == ChaosEventType.high_cpu:
                    pod.cpu = min(95, pod.cpu + 60)
                    pod.logs.append(f"{datetime.now().isoformat()} WARN: CPU throttling detected")
                # Add more effects as needed...

    def resolve_event(self, event_id: str):
        event = next((e for e in self.active_events if e.id == event_id), None)
        if not event:
            return

        self.active_events = [e for e in self.active_events if e.id != event_id]
        for e in self.chaos_events:
            if e.id == event_id:
                e.resolved = True
                e.resolvedAt = datetime.now()

        # Restore resources
        for pod in self.pods:
            if any(r in pod.name for r in event.affectedResources):
                pod.status = PodStatus.Running
                pod.cpu = 0.2 # Reset to baseline
                pod.logs.append(f"{datetime.now().isoformat()} INFO: Issue resolved, pod is healthy")

        self.score.incidentsResolved += 1
        self.score.totalScore += 100 # Simplified scoring

    def execute_command(self, command: str) -> str:
        self.current_command = command
        self.terminal_history.append(f"$ {command}")
        
        parts = command.split()
        if not parts:
            return ""
            
        cmd = parts[0]
        
        output = ""
        if cmd == "help":
            output = "Available commands: help, get pods, get services, get deployments, resolve <event-id>"
        elif cmd == "kubectl":
            if len(parts) > 1:
                if parts[1] == "get":
                    if len(parts) > 2:
                        resource = parts[2]
                        if resource == "pods":
                            output = "\n".join([f"{p.name}\t{p.status}\t{p.ready}\t{p.restarts}\t{p.age}" for p in self.pods])
                        elif resource == "services":
                            output = "\n".join([f"{s.name}\t{s.type}\t{s.clusterIp}\t{s.ports}\t{s.age}" for s in self.services])
                        elif resource == "deployments":
                            output = "\n".join([f"{d.name}\t{d.ready}\t{d.upToDate}\t{d.available}\t{d.age}" for d in self.deployments])
                        else:
                            output = f"Unknown resource: {resource}"
                    else:
                        output = "Missing resource type. Try 'kubectl get pods'"
                else:
                    output = f"Unknown kubectl command: {parts[1]}"
            else:
                output = "kubectl requires arguments"
        elif cmd == "resolve":
            if len(parts) > 1:
                event_id = parts[1]
                self.resolve_event(event_id)
                output = f"Attempting to resolve event {event_id}..."
            else:
                output = "Usage: resolve <event-id>"
        elif cmd == "clear":
            self.terminal_history = []
            return ""
        else:
            output = f"Command not found: {cmd}"
            
        self.terminal_history.append(output)
        return output

game_manager = GameManager()
