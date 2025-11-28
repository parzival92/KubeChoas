"""
Game Logic Manager for KubeChaos
Integrates with Kubernetes and Chaos Mesh for real chaos engineering
"""

from models import *
from k8s_client import KubernetesClient
from chaos_mesh_client import ChaosMeshClient
from game_scenarios import *
from kubernetes import client
from typing import Dict, List, Optional, Any
from datetime import datetime
import logging
import os

logger = logging.getLogger(__name__)


class GameManager:
    """Main game logic manager"""
    
    def __init__(self):
        self.game_state = self._initialize_state()
        self.k8s_client: Optional[KubernetesClient] = None
        self.chaos_client: Optional[ChaosMeshClient] = None
        self.simulation_mode = True  # Start in simulation mode
        
        # Try to connect to Kubernetes cluster
        self._initialize_clients()
    
    def _initialize_clients(self):
        """Initialize Kubernetes and Chaos Mesh clients"""
        try:
            # Try to connect to Kubernetes
            self.k8s_client = KubernetesClient()
            
            if self.k8s_client.is_connected():
                logger.info("Connected to Kubernetes cluster")
                self.simulation_mode = False
                
                # Initialize Chaos Mesh client
                self.chaos_client = ChaosMeshClient(self.k8s_client.custom_objects)
                
                if self.chaos_client.is_chaos_mesh_installed():
                    logger.info("Chaos Mesh detected - real mode enabled")
                else:
                    logger.warning("Chaos Mesh not installed - simulation mode")
                    self.simulation_mode = True
            else:
                logger.warning("Not connected to Kubernetes - simulation mode")
                self.simulation_mode = True
                
        except Exception as e:
            logger.error(f"Failed to initialize clients: {e}")
            logger.info("Running in simulation mode")
            self.simulation_mode = True
    
    def _initialize_state(self) -> GameState:
        """Initialize game state"""
        return GameState(
            isGameRunning=False,
            gameStartTime=None,
            currentTime=datetime.now(),
            pods=[],
            services=[],
            deployments=[],
            chaosEvents=[],
            activeEvents=[],
            terminalHistory=[],
            currentCommand="",
            score=GameScore(
                totalScore=0,
                mttr=0.0,
                commandsUsed=0,
                incidentsResolved=0,
                proactiveChecks=0
            )
        )
    
    def get_state(self) -> GameState:
        """Get current game state"""
        self.game_state.currentTime = datetime.now()
        return self.game_state
    
    def get_cluster_status(self) -> Dict[str, Any]:
        """Get Kubernetes cluster status"""
        if not self.k8s_client or self.simulation_mode:
            return {
                "connected": False,
                "chaos_mesh_installed": False,
                "mode": "simulation"
            }
        
        try:
            cluster_info = self.k8s_client.get_cluster_info()
            chaos_mesh_installed = self.chaos_client.is_chaos_mesh_installed() if self.chaos_client else False
            
            return {
                **cluster_info,
                "chaos_mesh_installed": chaos_mesh_installed,
                "mode": "real" if not self.simulation_mode else "simulation"
            }
        except Exception as e:
            logger.error(f"Failed to get cluster status: {e}")
            return {
                "connected": False,
                "chaos_mesh_installed": False,
                "error": str(e),
                "mode": "simulation"
            }
    
    # Game Control
    def start_game(self):
        """Start the game"""
        self.game_state.isGameRunning = True
        self.game_state.gameStartTime = datetime.now()
        logger.info("Game started")
    
    def stop_game(self):
        """Stop the game"""
        self.game_state.isGameRunning = False
        logger.info("Game stopped")
    
    def reset_game(self):
        """Reset game state"""
        self.game_state = self._initialize_state()
        logger.info("Game reset")
    
    # Command Execution
    def execute_command(self, command: str, namespace: str = "default") -> Dict[str, Any]:
        """Execute a kubectl command"""
        self.game_state.score.commandsUsed += 1
        
        if self.simulation_mode or not self.k8s_client:
            # Simulation mode - return mock data
            return self._execute_simulated_command(command)
        
        try:
            # Real mode - execute against actual cluster
            result = self.k8s_client.execute_kubectl_command(command, namespace)
            
            # Add to terminal history
            if result.get("success"):
                self.game_state.terminalHistory.append(f"$ {command}")
                self.game_state.terminalHistory.append(result.get("output", ""))
            else:
                self.game_state.terminalHistory.append(f"$ {command}")
                self.game_state.terminalHistory.append(f"Error: {result.get('error', 'Unknown error')}")
            
            return result
            
        except Exception as e:
            logger.error(f"Command execution failed: {e}")
            return {"error": str(e), "success": False}
    
    def _execute_simulated_command(self, command: str) -> Dict[str, Any]:
        """Execute command in simulation mode"""
        # Simple simulation for backward compatibility
        output = f"Simulated output for: {command}"
        
        if "get pods" in command:
            output = "NAME                          READY   STATUS    RESTARTS   AGE\npayment-service-abc123        1/1     Running   0          1d"
        elif "get services" in command:
            output = "NAME              TYPE        CLUSTER-IP      PORT(S)\npayment-service   ClusterIP   10.96.0.1       80/TCP"
        elif "help" in command:
            output = "Available commands:\n  kubectl get pods\n  kubectl get services\n  kubectl get deployments\n  kubectl logs <pod-name>\n  kubectl describe pod <pod-name>"
        
        self.game_state.terminalHistory.append(f"$ {command}")
        self.game_state.terminalHistory.append(output)
        
        return {"output": output, "success": True}
    
    # Scenario Management
    def list_scenarios(self) -> List[Dict[str, Any]]:
        """List all available scenarios"""
        return [s.to_dict() for s in ALL_SCENARIOS]
    
    def get_scenario(self, scenario_id: str) -> Optional[Dict[str, Any]]:
        """Get scenario by ID"""
        scenario = get_scenario_by_id(scenario_id)
        return scenario.to_dict() if scenario else None
    
    def get_scenarios_by_difficulty(self, difficulty: str) -> List[Dict[str, Any]]:
        """Get scenarios by difficulty"""
        try:
            diff = Difficulty(difficulty)
            scenarios = get_scenarios_by_difficulty(diff)
            return [s.to_dict() for s in scenarios]
        except ValueError:
            return []
    
    def start_scenario(self, scenario_id: str, namespace: str = "ecommerce") -> Optional[Dict[str, Any]]:
        """Start a game scenario"""
        scenario = get_scenario_by_id(scenario_id)
        if not scenario:
            logger.error(f"Scenario not found: {scenario_id}")
            return None
        
        if self.simulation_mode or not self.chaos_client:
            logger.warning("Cannot start real scenario in simulation mode")
            return {"error": "Simulation mode - real scenarios not available"}
        
        try:
            # Create chaos experiment based on scenario config
            chaos_config = scenario.chaos_config
            chaos_type = chaos_config.get("type")
            
            experiment_name = f"game-{scenario_id}"
            
            if chaos_type == "PodChaos":
                result = self.chaos_client.create_pod_chaos(
                    name=experiment_name,
                    namespace=namespace,
                    config=chaos_config
                )
            elif chaos_type == "NetworkChaos":
                result = self.chaos_client.create_network_chaos(
                    name=experiment_name,
                    namespace=namespace,
                    config=chaos_config
                )
            elif chaos_type == "StressChaos":
                result = self.chaos_client.create_stress_chaos(
                    name=experiment_name,
                    namespace=namespace,
                    config=chaos_config
                )
            elif chaos_type == "IOChaos":
                result = self.chaos_client.create_io_chaos(
                    name=experiment_name,
                    namespace=namespace,
                    config=chaos_config
                )
            else:
                logger.error(f"Unsupported chaos type: {chaos_type}")
                return None
            
            logger.info(f"Started scenario {scenario_id}")
            return result
            
        except Exception as e:
            logger.error(f"Failed to start scenario: {e}")
            return None
    
    # Chaos Experiment Management
    def list_chaos_experiments(self, namespace: str = "ecommerce") -> List[Dict[str, Any]]:
        """List all chaos experiments"""
        if self.simulation_mode or not self.chaos_client:
            return []
        
        try:
            return self.chaos_client.list_experiments(namespace)
        except Exception as e:
            logger.error(f"Failed to list experiments: {e}")
            return []
    
    def get_chaos_experiment(self, name: str, namespace: str, chaos_type: str) -> Optional[Dict[str, Any]]:
        """Get specific chaos experiment"""
        if self.simulation_mode or not self.chaos_client:
            return None
        
        try:
            return self.chaos_client.get_experiment(name, namespace, chaos_type)
        except Exception as e:
            logger.error(f"Failed to get experiment: {e}")
            return None
    
    def create_custom_chaos(self, chaos_type: str, name: str, namespace: str, config: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Create custom chaos experiment"""
        if self.simulation_mode or not self.chaos_client:
            return {"error": "Simulation mode - real chaos not available"}
        
        try:
            if chaos_type == "PodChaos":
                return self.chaos_client.create_pod_chaos(name, namespace, config)
            elif chaos_type == "NetworkChaos":
                return self.chaos_client.create_network_chaos(name, namespace, config)
            elif chaos_type == "StressChaos":
                return self.chaos_client.create_stress_chaos(name, namespace, config)
            elif chaos_type == "IOChaos":
                return self.chaos_client.create_io_chaos(name, namespace, config)
            else:
                return {"error": f"Unsupported chaos type: {chaos_type}"}
        except Exception as e:
            logger.error(f"Failed to create custom chaos: {e}")
            return None
    
    def pause_chaos_experiment(self, name: str, namespace: str, chaos_type: str) -> bool:
        """Pause chaos experiment"""
        if self.simulation_mode or not self.chaos_client:
            return False
        
        try:
            return self.chaos_client.pause_experiment(name, namespace, chaos_type)
        except Exception as e:
            logger.error(f"Failed to pause experiment: {e}")
            return False
    
    def resume_chaos_experiment(self, name: str, namespace: str, chaos_type: str) -> bool:
        """Resume chaos experiment"""
        if self.simulation_mode or not self.chaos_client:
            return False
        
        try:
            return self.chaos_client.resume_experiment(name, namespace, chaos_type)
        except Exception as e:
            logger.error(f"Failed to resume experiment: {e}")
            return False
    
    def delete_chaos_experiment(self, name: str, namespace: str, chaos_type: str) -> bool:
        """Delete chaos experiment"""
        if self.simulation_mode or not self.chaos_client:
            return False
        
        try:
            return self.chaos_client.delete_experiment(name, namespace, chaos_type)
        except Exception as e:
            logger.error(f"Failed to delete experiment: {e}")
            return False
    
    # Kubernetes Resource Operations
    def list_pods(self, namespace: str = "default") -> List[Dict[str, Any]]:
        """List pods"""
        if self.simulation_mode or not self.k8s_client:
            return []
        
        try:
            return self.k8s_client.list_pods(namespace)
        except Exception as e:
            logger.error(f"Failed to list pods: {e}")
            return []
    
    def get_pod(self, name: str, namespace: str = "default") -> Optional[Dict[str, Any]]:
        """Get pod details"""
        if self.simulation_mode or not self.k8s_client:
            return None
        
        try:
            return self.k8s_client.get_pod(name, namespace)
        except Exception as e:
            logger.error(f"Failed to get pod: {e}")
            return None
    
    def get_pod_logs(self, name: str, namespace: str = "default", tail_lines: int = 100) -> str:
        """Get pod logs"""
        if self.simulation_mode or not self.k8s_client:
            return "Simulation mode - no real logs available"
        
        try:
            return self.k8s_client.get_pod_logs(name, namespace, tail_lines=tail_lines)
        except Exception as e:
            logger.error(f"Failed to get pod logs: {e}")
            return f"Error: {str(e)}"
    
    def list_services(self, namespace: str = "default") -> List[Dict[str, Any]]:
        """List services"""
        if self.simulation_mode or not self.k8s_client:
            return []
        
        try:
            return self.k8s_client.list_services(namespace)
        except Exception as e:
            logger.error(f"Failed to list services: {e}")
            return []
    
    def list_deployments(self, namespace: str = "default") -> List[Dict[str, Any]]:
        """List deployments"""
        if self.simulation_mode or not self.k8s_client:
            return []
        
        try:
            return self.k8s_client.list_deployments(namespace)
        except Exception as e:
            logger.error(f"Failed to list deployments: {e}")
            return []
    
    def list_namespaces(self) -> List[str]:
        """List namespaces"""
        if self.simulation_mode or not self.k8s_client:
            return ["default", "kube-system"]
        
        try:
            return self.k8s_client.list_namespaces()
        except Exception as e:
            logger.error(f"Failed to list namespaces: {e}")
            return []
    
    # Legacy methods for backward compatibility
    def generate_chaos_event(self):
        """Generate chaos event (simulation mode)"""
        logger.info("Legacy chaos event generation called")
        pass
    
    def resolve_event(self, event_id: str):
        """Resolve chaos event (simulation mode)"""
        logger.info(f"Legacy event resolution called for {event_id}")
        pass


# Global game manager instance
game_manager = GameManager()
