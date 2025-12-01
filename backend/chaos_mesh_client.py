"""
Chaos Mesh Client for KubeChaos Game
Handles Chaos Mesh CRD operations and experiment management
"""

from kubernetes import client
from kubernetes.client.rest import ApiException
from typing import Dict, List, Optional, Any
import logging
import yaml
from datetime import datetime

logger = logging.getLogger(__name__)


class ChaosMeshClient:
    """Client for interacting with Chaos Mesh CRDs"""
    
    # Chaos Mesh API configuration
    CHAOS_MESH_GROUP = "chaos-mesh.org"
    CHAOS_MESH_VERSION = "v1alpha1"
    
    # Supported chaos types
    CHAOS_TYPES = {
        "PodChaos": "podchaos",
        "NetworkChaos": "networkchaos",
        "StressChaos": "stresschaos",
        "IOChaos": "iochaos",
        "TimeChaos": "timechaos",
        "KernelChaos": "kernelchaos",
        "DNSChaos": "dnschaos",
        "HTTPChaos": "httpchaos",
        "JVMChaos": "jvmchaos"
    }
    
    def __init__(self, custom_objects_api: client.CustomObjectsApi):
        """
        Initialize Chaos Mesh client
        
        Args:
            custom_objects_api: Kubernetes CustomObjectsApi instance
        """
        self.api = custom_objects_api
        logger.info("Chaos Mesh client initialized")
    
    def is_chaos_mesh_installed(self) -> bool:
        """Check if Chaos Mesh is installed in the cluster"""
        try:
            # Try to list PodChaos resources as a check
            self.api.list_cluster_custom_object(
                group=self.CHAOS_MESH_GROUP,
                version=self.CHAOS_MESH_VERSION,
                plural="podchaos",
                limit=1
            )
            logger.info("Chaos Mesh is installed")
            return True
        except ApiException as e:
            if e.status == 404:
                logger.warning("Chaos Mesh CRDs not found - Chaos Mesh may not be installed")
                return False
            logger.error(f"Error checking Chaos Mesh installation: {e}")
            return False
    
    # Experiment Creation
    def create_pod_chaos(self, name: str, namespace: str, config: Dict[str, Any]) -> Optional[Dict]:
        """
        Create a PodChaos experiment
        
        Args:
            name: Experiment name
            namespace: Namespace to create experiment in
            config: Chaos configuration including action, selector, etc.
        
        Returns:
            Created experiment object or None on failure
        """
        spec = {
            "action": config.get("action", "pod-kill"),
            "mode": config.get("mode", "one"),
            "selector": config.get("selector", {}),
            "duration": config.get("duration", "30s")
        }
        
        # Add value if mode is 'fixed' or 'fixed-percent'
        if "value" in config:
            spec["value"] = config["value"]
        
        # Add scheduler if present
        if "scheduler" in config:
            spec["scheduler"] = config["scheduler"]
        
        body = {
            "apiVersion": f"{self.CHAOS_MESH_GROUP}/{self.CHAOS_MESH_VERSION}",
            "kind": "PodChaos",
            "metadata": {
                "name": name,
                "namespace": namespace,
                "labels": {
                    "app": "kubechaos-game"
                }
            },
            "spec": spec
        }
        
        return self._create_chaos_experiment("podchaos", namespace, body)
    
    def create_network_chaos(self, name: str, namespace: str, config: Dict[str, Any]) -> Optional[Dict]:
        """Create a NetworkChaos experiment"""
        body = {
            "apiVersion": f"{self.CHAOS_MESH_GROUP}/{self.CHAOS_MESH_VERSION}",
            "kind": "NetworkChaos",
            "metadata": {
                "name": name,
                "namespace": namespace,
                "labels": {
                    "app": "kubechaos-game"
                }
            },
            "spec": {
                "action": config.get("action", "delay"),
                "mode": config.get("mode", "one"),
                "selector": config.get("selector", {}),
                "duration": config.get("duration", "30s"),
                "delay": config.get("delay", {
                    "latency": "100ms",
                    "correlation": "0",
                    "jitter": "0ms"
                }) if config.get("action") == "delay" else None,
                "loss": config.get("loss", {
                    "loss": "25",
                    "correlation": "0"
                }) if config.get("action") == "loss" else None
            }
        }
        
        # Remove None values
        body["spec"] = {k: v for k, v in body["spec"].items() if v is not None}
        
        return self._create_chaos_experiment("networkchaos", namespace, body)
    
    def create_stress_chaos(self, name: str, namespace: str, config: Dict[str, Any]) -> Optional[Dict]:
        """Create a StressChaos experiment"""
        body = {
            "apiVersion": f"{self.CHAOS_MESH_GROUP}/{self.CHAOS_MESH_VERSION}",
            "kind": "StressChaos",
            "metadata": {
                "name": name,
                "namespace": namespace,
                "labels": {
                    "app": "kubechaos-game"
                }
            },
            "spec": {
                "mode": config.get("mode", "one"),
                "selector": config.get("selector", {}),
                "duration": config.get("duration", "30s"),
                "stressors": {
                    "cpu": config.get("cpu", {
                        "workers": 1,
                        "load": 50
                    }) if config.get("stress_cpu") else None,
                    "memory": config.get("memory", {
                        "workers": 1,
                        "size": "256MB"
                    }) if config.get("stress_memory") else None
                }
            }
        }
        
        # Remove None values from stressors
        body["spec"]["stressors"] = {k: v for k, v in body["spec"]["stressors"].items() if v is not None}
        
        return self._create_chaos_experiment("stresschaos", namespace, body)
    
    def create_io_chaos(self, name: str, namespace: str, config: Dict[str, Any]) -> Optional[Dict]:
        """Create an IOChaos experiment"""
        body = {
            "apiVersion": f"{self.CHAOS_MESH_GROUP}/{self.CHAOS_MESH_VERSION}",
            "kind": "IOChaos",
            "metadata": {
                "name": name,
                "namespace": namespace,
                "labels": {
                    "app": "kubechaos-game"
                }
            },
            "spec": {
                "action": config.get("action", "latency"),
                "mode": config.get("mode", "one"),
                "selector": config.get("selector", {}),
                "duration": config.get("duration", "30s"),
                "volumePath": config.get("volume_path", "/var/lib"),
                "path": config.get("path", "/"),
                "delay": config.get("delay", "100ms") if config.get("action") == "latency" else None,
                "percent": config.get("percent", 50)
            }
        }
        
        body["spec"] = {k: v for k, v in body["spec"].items() if v is not None}
        
        return self._create_chaos_experiment("iochaos", namespace, body)
    
    def _create_chaos_experiment(self, plural: str, namespace: str, body: Dict) -> Optional[Dict]:
        """Generic method to create any chaos experiment"""
        try:
            result = self.api.create_namespaced_custom_object(
                group=self.CHAOS_MESH_GROUP,
                version=self.CHAOS_MESH_VERSION,
                namespace=namespace,
                plural=plural,
                body=body
            )
            logger.info(f"Created {plural} experiment: {body['metadata']['name']}")
            return result
        except ApiException as e:
            logger.error(f"Failed to create {plural} experiment: {e}")
            return None
    
    # Experiment Management
    def list_experiments(self, namespace: str = "default", chaos_type: Optional[str] = None) -> List[Dict]:
        """
        List chaos experiments
        
        Args:
            namespace: Namespace to list experiments from
            chaos_type: Specific chaos type to list (e.g., "PodChaos"), or None for all
        
        Returns:
            List of experiment objects
        """
        experiments = []
        
        types_to_list = [chaos_type] if chaos_type else self.CHAOS_TYPES.keys()
        
        for ctype in types_to_list:
            plural = self.CHAOS_TYPES.get(ctype)
            if not plural:
                continue
            
            try:
                result = self.api.list_namespaced_custom_object(
                    group=self.CHAOS_MESH_GROUP,
                    version=self.CHAOS_MESH_VERSION,
                    namespace=namespace,
                    plural=plural
                )
                
                for item in result.get("items", []):
                    experiments.append({
                        "name": item["metadata"]["name"],
                        "namespace": item["metadata"]["namespace"],
                        "type": item["kind"],
                        "status": self._extract_status(item),
                        "created": item["metadata"].get("creationTimestamp"),
                        "spec": item.get("spec", {})
                    })
                    
            except ApiException as e:
                logger.error(f"Failed to list {plural}: {e}")
        
        return experiments
    
    def get_experiment(self, name: str, namespace: str, chaos_type: str) -> Optional[Dict]:
        """Get details of a specific chaos experiment"""
        plural = self.CHAOS_TYPES.get(chaos_type)
        if not plural:
            logger.error(f"Unknown chaos type: {chaos_type}")
            return None
        
        try:
            result = self.api.get_namespaced_custom_object(
                group=self.CHAOS_MESH_GROUP,
                version=self.CHAOS_MESH_VERSION,
                namespace=namespace,
                plural=plural,
                name=name
            )
            
            return {
                "name": result["metadata"]["name"],
                "namespace": result["metadata"]["namespace"],
                "type": result["kind"],
                "status": self._extract_status(result),
                "spec": result.get("spec", {}),
                "created": result["metadata"].get("creationTimestamp")
            }
            
        except ApiException as e:
            logger.error(f"Failed to get {chaos_type} {name}: {e}")
            return None
    
    def delete_experiment(self, name: str, namespace: str, chaos_type: str) -> bool:
        """Delete a chaos experiment"""
        plural = self.CHAOS_TYPES.get(chaos_type)
        if not plural:
            logger.error(f"Unknown chaos type: {chaos_type}")
            return False
        
        try:
            self.api.delete_namespaced_custom_object(
                group=self.CHAOS_MESH_GROUP,
                version=self.CHAOS_MESH_VERSION,
                namespace=namespace,
                plural=plural,
                name=name
            )
            logger.info(f"Deleted {chaos_type} experiment: {name}")
            return True
        except ApiException as e:
            logger.error(f"Failed to delete {chaos_type} {name}: {e}")
            return False
    
    def pause_experiment(self, name: str, namespace: str, chaos_type: str) -> bool:
        """Pause a running chaos experiment"""
        plural = self.CHAOS_TYPES.get(chaos_type)
        if not plural:
            return False
        
        try:
            # Add annotation to pause
            patch = {
                "metadata": {
                    "annotations": {
                        "experiment.chaos-mesh.org/pause": "true"
                    }
                }
            }
            
            self.api.patch_namespaced_custom_object(
                group=self.CHAOS_MESH_GROUP,
                version=self.CHAOS_MESH_VERSION,
                namespace=namespace,
                plural=plural,
                name=name,
                body=patch
            )
            logger.info(f"Paused {chaos_type} experiment: {name}")
            return True
        except ApiException as e:
            logger.error(f"Failed to pause {chaos_type} {name}: {e}")
            return False
    
    def resume_experiment(self, name: str, namespace: str, chaos_type: str) -> bool:
        """Resume a paused chaos experiment"""
        plural = self.CHAOS_TYPES.get(chaos_type)
        if not plural:
            return False
        
        try:
            # Remove pause annotation
            patch = {
                "metadata": {
                    "annotations": {
                        "experiment.chaos-mesh.org/pause": None
                    }
                }
            }
            
            self.api.patch_namespaced_custom_object(
                group=self.CHAOS_MESH_GROUP,
                version=self.CHAOS_MESH_VERSION,
                namespace=namespace,
                plural=plural,
                name=name,
                body=patch
            )
            logger.info(f"Resumed {chaos_type} experiment: {name}")
            return True
        except ApiException as e:
            logger.error(f"Failed to resume {chaos_type} {name}: {e}")
            return False
    
    # Helper Methods
    def _extract_status(self, experiment: Dict) -> str:
        """Extract status from experiment object"""
        status = experiment.get("status", {})
        
        # Check for common status conditions
        conditions = status.get("conditions", [])
        if conditions:
            latest = conditions[-1]
            return latest.get("type", "Unknown")
        
        # Fallback to experiment phase
        return status.get("experiment", {}).get("phase", "Unknown")
    
    def create_from_yaml(self, yaml_content: str, namespace: str) -> Optional[Dict]:
        """Create chaos experiment from YAML definition"""
        try:
            manifest = yaml.safe_load(yaml_content)
            
            kind = manifest.get("kind")
            plural = self.CHAOS_TYPES.get(kind)
            
            if not plural:
                logger.error(f"Unknown chaos kind: {kind}")
                return None
            
            # Override namespace if specified
            manifest["metadata"]["namespace"] = namespace
            
            return self._create_chaos_experiment(plural, namespace, manifest)
            
        except Exception as e:
            logger.error(f"Failed to create experiment from YAML: {e}")
            return None
    
    def get_experiment_events(self, name: str, namespace: str) -> List[Dict]:
        """Get events related to a chaos experiment"""
        # This would require watching events - simplified for now
        return []
