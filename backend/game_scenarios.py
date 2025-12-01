"""
Game Scenarios for KubeChaos
Pre-defined chaos engineering scenarios with objectives and scoring
"""

from typing import Dict, List, Any
from enum import Enum


class Difficulty(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"


class ScenarioCategory(str, Enum):
    POD_FAILURES = "pod_failures"
    NETWORK_ISSUES = "network_issues"
    RESOURCE_STRESS = "resource_stress"
    IO_PROBLEMS = "io_problems"
    COMPLEX_WORKFLOWS = "complex_workflows"


class GameScenario:
    """Represents a game scenario with chaos experiments"""
    
    def __init__(
        self,
        id: str,
        name: str,
        description: str,
        difficulty: Difficulty,
        category: ScenarioCategory,
        learning_objectives: List[str],
        chaos_config: Dict[str, Any],
        success_criteria: Dict[str, Any],
        hints: List[str],
        time_limit_seconds: int = 300,
        max_score: int = 1000
    ):
        self.id = id
        self.name = name
        self.description = description
        self.difficulty = difficulty
        self.category = category
        self.learning_objectives = learning_objectives
        self.chaos_config = chaos_config
        self.success_criteria = success_criteria
        self.hints = hints
        self.time_limit_seconds = time_limit_seconds
        self.max_score = max_score
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "difficulty": self.difficulty.value,
            "category": self.category.value,
            "learning_objectives": self.learning_objectives,
            "chaos_config": self.chaos_config,
            "success_criteria": self.success_criteria,
            "hints": self.hints,
            "time_limit_seconds": self.time_limit_seconds,
            "max_score": self.max_score
        }


# Level 1: Pod Chaos Basics
SCENARIO_POD_KILL_BASIC = GameScenario(
    id="pod-kill-basic",
    name="Pod Termination 101",
    description="A critical pod in your e-commerce application keeps crashing. Identify the failing pod and restore service availability.",
    difficulty=Difficulty.BEGINNER,
    category=ScenarioCategory.POD_FAILURES,
    learning_objectives=[
        "Identify crashed pods using kubectl",
        "Check pod logs for errors",
        "Understand pod restart policies",
        "Verify service recovery"
    ],
    chaos_config={
        "type": "PodChaos",
        "action": "pod-kill",
        "mode": "fixed",
        "value": "2",
        "selector": {
            "namespaces": ["ecommerce"],
            "labelSelectors": {
                "app": "payment-service"
            }
        },
        "duration": "180s"
    },
    success_criteria={
        "pods_running": True,
        "service_available": True,
        "max_downtime_seconds": 120
    },
    hints=[
        "Use 'kubectl get pods -n ecommerce' to see pod status",
        "Check logs with 'kubectl logs <pod-name> -n ecommerce'",
        "Deployments automatically restart failed pods",
        "Verify service endpoints are healthy"
    ],
    time_limit_seconds=180,
    max_score=500
)

SCENARIO_POD_FAILURE = GameScenario(
    id="pod-failure-intermediate",
    name="Persistent Pod Failures",
    description="Multiple pods are failing with CrashLoopBackOff. Debug the issue and implement a fix.",
    difficulty=Difficulty.INTERMEDIATE,
    category=ScenarioCategory.POD_FAILURES,
    learning_objectives=[
        "Diagnose CrashLoopBackOff errors",
        "Use kubectl describe for detailed info",
        "Scale deployments to maintain availability",
        "Implement rolling updates safely"
    ],
    chaos_config={
        "type": "PodChaos",
        "action": "pod-failure",
        "mode": "fixed",
        "value": "1",
        "selector": {
            "namespaces": ["ecommerce"],
            "labelSelectors": {
                "app": "product-catalog"
            }
        },
        "duration": "120s"
    },
    success_criteria={
        "healthy_replicas": 3,
        "service_available": True,
        "max_commands": 10
    },
    hints=[
        "Check which pods are in CrashLoopBackOff",
        "Describe pods to see detailed error messages",
        "You may need to scale up the deployment temporarily",
        "Monitor pod events for clues"
    ],
    time_limit_seconds=300,
    max_score=750
)

# Level 2: Network Chaos
SCENARIO_NETWORK_DELAY = GameScenario(
    id="network-delay-basic",
    name="Latency Spike Investigation",
    description="Users are reporting slow response times. Network latency has been injected between services. Identify and mitigate the issue.",
    difficulty=Difficulty.BEGINNER,
    category=ScenarioCategory.NETWORK_ISSUES,
    learning_objectives=[
        "Monitor service response times",
        "Identify network-related issues",
        "Use kubectl port-forward for testing",
        "Understand service mesh basics"
    ],
    chaos_config={
        "type": "NetworkChaos",
        "action": "delay",
        "mode": "one",
        "selector": {
            "namespaces": ["ecommerce"],
            "labelSelectors": {
                "app": "api-gateway"
            }
        },
        "delay": {
            "latency": "500ms",
            "correlation": "100",
            "jitter": "50ms"
        },
        "duration": "90s"
    },
    success_criteria={
        "latency_below_ms": 100,
        "service_available": True
    },
    hints=[
        "Check service endpoints and connectivity",
        "Use kubectl logs to see request timing",
        "Network issues often show in application logs",
        "Consider checking service mesh configuration"
    ],
    time_limit_seconds=240,
    max_score=600
)

SCENARIO_NETWORK_PARTITION = GameScenario(
    id="network-partition-advanced",
    name="Network Partition Recovery",
    description="A network partition has isolated part of your cluster. Restore communication between services.",
    difficulty=Difficulty.ADVANCED,
    category=ScenarioCategory.NETWORK_ISSUES,
    learning_objectives=[
        "Diagnose network partitions",
        "Understand service discovery",
        "Implement circuit breakers",
        "Test service resilience"
    ],
    chaos_config={
        "type": "NetworkChaos",
        "action": "partition",
        "mode": "all",
        "selector": {
            "namespaces": ["ecommerce"],
            "labelSelectors": {
                "tier": "database"
            }
        },
        "direction": "to",
        "target": {
            "selector": {
                "namespaces": ["ecommerce"],
                "labelSelectors": {
                    "tier": "backend"
                }
            },
            "mode": "all"
        },
        "duration": "120s"
    },
    success_criteria={
        "all_services_communicating": True,
        "no_data_loss": True,
        "recovery_time_seconds": 60
    },
    hints=[
        "Check if services can reach each other",
        "DNS resolution might be affected",
        "Look for connection timeout errors",
        "Service mesh policies might need adjustment"
    ],
    time_limit_seconds=360,
    max_score=1200
)

# Level 3: Resource Stress
SCENARIO_CPU_STRESS = GameScenario(
    id="cpu-stress-basic",
    name="CPU Spike Response",
    description="A service is experiencing high CPU usage. Identify the affected pod and scale resources appropriately.",
    difficulty=Difficulty.BEGINNER,
    category=ScenarioCategory.RESOURCE_STRESS,
    learning_objectives=[
        "Monitor CPU usage with kubectl top",
        "Scale deployments horizontally",
        "Understand resource limits",
        "Implement autoscaling"
    ],
    chaos_config={
        "type": "StressChaos",
        "mode": "one",
        "selector": {
            "namespaces": ["ecommerce"],
            "labelSelectors": {
                "app": "product-catalog"
            }
        },
        "stressors": {
            "cpu": {
                "workers": 2,
                "load": 80
            }
        },
        "duration": "90s"
    },
    success_criteria={
        "cpu_usage_below_percent": 70,
        "service_responsive": True,
        "scaled_appropriately": True
    },
    hints=[
        "Use 'kubectl top pods' to see resource usage",
        "Scale the deployment with 'kubectl scale'",
        "Check if resource limits are set",
        "Consider implementing HPA (Horizontal Pod Autoscaler)"
    ],
    time_limit_seconds=240,
    max_score=650
)

SCENARIO_MEMORY_STRESS = GameScenario(
    id="memory-stress-intermediate",
    name="Memory Leak Mitigation",
    description="A memory leak is causing OOMKilled errors. Identify and resolve the issue before the entire service goes down.",
    difficulty=Difficulty.INTERMEDIATE,
    category=ScenarioCategory.RESOURCE_STRESS,
    learning_objectives=[
        "Diagnose OOMKilled errors",
        "Monitor memory usage",
        "Set appropriate resource limits",
        "Implement memory-based autoscaling"
    ],
    chaos_config={
        "type": "StressChaos",
        "mode": "fixed",
        "value": "2",
        "selector": {
            "namespaces": ["ecommerce"],
            "labelSelectors": {
                "app": "user-service"
            }
        },
        "stressors": {
            "memory": {
                "workers": 1,
                "size": "512MB"
            }
        },
        "duration": "120s"
    },
    success_criteria={
        "no_oom_kills": True,
        "memory_usage_stable": True,
        "all_pods_running": True
    },
    hints=[
        "Check pod status for OOMKilled",
        "Use kubectl describe to see resource limits",
        "You may need to adjust memory limits",
        "Consider restarting affected pods"
    ],
    time_limit_seconds=300,
    max_score=800
)

# Level 4: IO Chaos
SCENARIO_IO_LATENCY = GameScenario(
    id="io-latency-intermediate",
    name="Disk I/O Slowdown",
    description="Database queries are timing out due to slow disk I/O. Investigate and restore performance.",
    difficulty=Difficulty.INTERMEDIATE,
    category=ScenarioCategory.IO_PROBLEMS,
    learning_objectives=[
        "Diagnose I/O performance issues",
        "Monitor disk usage",
        "Understand persistent volumes",
        "Optimize database queries"
    ],
    chaos_config={
        "type": "IOChaos",
        "action": "latency",
        "mode": "one",
        "selector": {
            "namespaces": ["ecommerce"],
            "labelSelectors": {
                "app": "postgres"
            }
        },
        "volumePath": "/var/lib/postgresql",
        "path": "/var/lib/postgresql/data/**/*",
        "delay": "200ms",
        "percent": 80,
        "duration": "120s"
    },
    success_criteria={
        "query_time_below_ms": 100,
        "database_available": True,
        "no_connection_errors": True
    },
    hints=[
        "Check database logs for slow queries",
        "Monitor I/O wait times",
        "Persistent volume performance matters",
        "Consider connection pooling settings"
    ],
    time_limit_seconds=300,
    max_score=900
)

# Level 5: Complex Workflows
SCENARIO_CASCADE_FAILURE = GameScenario(
    id="cascade-failure-expert",
    name="Cascade Failure Recovery",
    description="A cascade failure is affecting multiple services. Implement circuit breakers and restore service gradually.",
    difficulty=Difficulty.EXPERT,
    category=ScenarioCategory.COMPLEX_WORKFLOWS,
    learning_objectives=[
        "Handle cascade failures",
        "Implement circuit breakers",
        "Prioritize service recovery",
        "Minimize blast radius"
    ],
    chaos_config={
        "type": "Workflow",
        "templates": [
            {
                "name": "kill-payment",
                "type": "PodChaos",
                "deadline": "30s",
                "podchaos": {
                    "action": "pod-kill",
                    "mode": "all",
                    "selector": {
                        "namespaces": ["ecommerce"],
                        "labelSelectors": {"app": "payment-service"}
                    }
                }
            },
            {
                "name": "network-delay-api",
                "type": "NetworkChaos",
                "deadline": "60s",
                "networkchaos": {
                    "action": "delay",
                    "mode": "all",
                    "selector": {
                        "namespaces": ["ecommerce"],
                        "labelSelectors": {"app": "api-gateway"}
                    },
                    "delay": {"latency": "1s"}
                }
            }
        ],
        "entry": "serial-chaos",
        "duration": "180s"
    },
    success_criteria={
        "all_services_recovered": True,
        "max_downtime_seconds": 180,
        "graceful_degradation": True,
        "circuit_breakers_active": True
    },
    hints=[
        "Recover services in dependency order",
        "Start with foundational services (database, cache)",
        "Then restore backend services",
        "Finally bring up frontend/gateway",
        "Monitor for cascade effects"
    ],
    time_limit_seconds=600,
    max_score=2000
)


# Scenario Registry
ALL_SCENARIOS = [
    SCENARIO_POD_KILL_BASIC,
    SCENARIO_POD_FAILURE,
    SCENARIO_NETWORK_DELAY,
    SCENARIO_NETWORK_PARTITION,
    SCENARIO_CPU_STRESS,
    SCENARIO_MEMORY_STRESS,
    SCENARIO_IO_LATENCY,
    SCENARIO_CASCADE_FAILURE
]


def get_scenario_by_id(scenario_id: str) -> GameScenario:
    """Get scenario by ID"""
    for scenario in ALL_SCENARIOS:
        if scenario.id == scenario_id:
            return scenario
    return None


def get_scenarios_by_difficulty(difficulty: Difficulty) -> List[GameScenario]:
    """Get all scenarios of a specific difficulty"""
    return [s for s in ALL_SCENARIOS if s.difficulty == difficulty]


def get_scenarios_by_category(category: ScenarioCategory) -> List[GameScenario]:
    """Get all scenarios in a category"""
    return [s for s in ALL_SCENARIOS if s.category == category]


def get_beginner_scenarios() -> List[GameScenario]:
    """Get beginner-friendly scenarios for tutorial"""
    return get_scenarios_by_difficulty(Difficulty.BEGINNER)
