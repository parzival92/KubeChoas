"""
Kubernetes Client for KubeChaos Game
Handles connection to Kubernetes cluster and resource operations
"""

from kubernetes import client, config
from kubernetes.client.rest import ApiException
from typing import Dict, List, Optional, Any
import logging

logger = logging.getLogger(__name__)


class KubernetesClient:
    """Client for interacting with Kubernetes API"""
    
    def __init__(self, kubeconfig_path: Optional[str] = None):
        """
        Initialize Kubernetes client
        
        Args:
            kubeconfig_path: Path to kubeconfig file. If None, uses default location
        """
        try:
            if kubeconfig_path:
                config.load_kube_config(config_file=kubeconfig_path)
            else:
                # Try in-cluster config first, then fall back to kubeconfig
                try:
                    config.load_incluster_config()
                    logger.info("Loaded in-cluster Kubernetes config")
                except config.ConfigException:
                    config.load_kube_config()
                    logger.info("Loaded Kubernetes config from kubeconfig")
            
            self.core_v1 = client.CoreV1Api()
            self.apps_v1 = client.AppsV1Api()
            self.custom_objects = client.CustomObjectsApi()
            self.connected = True
            logger.info("Kubernetes client initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Kubernetes client: {e}")
            self.connected = False
            raise
    
    def is_connected(self) -> bool:
        """Check if connected to Kubernetes cluster"""
        if not self.connected:
            return False
        
        try:
            # Try to list namespaces as a connectivity check
            self.core_v1.list_namespace(limit=1)
            return True
        except Exception as e:
            logger.error(f"Kubernetes connection check failed: {e}")
            return False
    
    def get_cluster_info(self) -> Dict[str, Any]:
        """Get basic cluster information"""
        try:
            version = client.VersionApi().get_code()
            nodes = self.core_v1.list_node()
            
            return {
                "connected": True,
                "version": version.git_version,
                "nodes": len(nodes.items),
                "platform": version.platform
            }
        except Exception as e:
            logger.error(f"Failed to get cluster info: {e}")
            return {"connected": False, "error": str(e)}
    
    # Pod Operations
    def list_pods(self, namespace: str = "default", label_selector: Optional[str] = None) -> List[Dict[str, Any]]:
        """List pods in a namespace"""
        try:
            pods = self.core_v1.list_namespaced_pod(
                namespace=namespace,
                label_selector=label_selector
            )
            
            return [{
                "name": pod.metadata.name,
                "namespace": pod.metadata.namespace,
                "status": pod.status.phase,
                "ready": sum(1 for c in pod.status.container_statuses if c.ready) if pod.status.container_statuses else 0,
                "total_containers": len(pod.spec.containers),
                "node": pod.spec.node_name,
                "ip": pod.status.pod_ip,
                "labels": pod.metadata.labels or {},
                "created": pod.metadata.creation_timestamp.isoformat() if pod.metadata.creation_timestamp else None
            } for pod in pods.items]
            
        except ApiException as e:
            logger.error(f"Failed to list pods: {e}")
            return []
    
    def get_pod(self, name: str, namespace: str = "default") -> Optional[Dict[str, Any]]:
        """Get detailed information about a specific pod"""
        try:
            pod = self.core_v1.read_namespaced_pod(name=name, namespace=namespace)
            
            containers = []
            if pod.status.container_statuses:
                for cs in pod.status.container_statuses:
                    containers.append({
                        "name": cs.name,
                        "ready": cs.ready,
                        "restart_count": cs.restart_count,
                        "state": self._get_container_state(cs.state)
                    })
            
            return {
                "name": pod.metadata.name,
                "namespace": pod.metadata.namespace,
                "status": pod.status.phase,
                "node": pod.spec.node_name,
                "ip": pod.status.pod_ip,
                "labels": pod.metadata.labels or {},
                "annotations": pod.metadata.annotations or {},
                "containers": containers,
                "conditions": [{"type": c.type, "status": c.status} for c in pod.status.conditions] if pod.status.conditions else [],
                "created": pod.metadata.creation_timestamp.isoformat() if pod.metadata.creation_timestamp else None
            }
            
        except ApiException as e:
            logger.error(f"Failed to get pod {name}: {e}")
            return None
    
    def get_pod_logs(self, name: str, namespace: str = "default", 
                     container: Optional[str] = None, tail_lines: int = 100) -> str:
        """Get logs from a pod"""
        try:
            logs = self.core_v1.read_namespaced_pod_log(
                name=name,
                namespace=namespace,
                container=container,
                tail_lines=tail_lines
            )
            return logs
        except ApiException as e:
            logger.error(f"Failed to get logs for pod {name}: {e}")
            return f"Error getting logs: {e.reason}"
    
    def delete_pod(self, name: str, namespace: str = "default") -> bool:
        """Delete a pod"""
        try:
            self.core_v1.delete_namespaced_pod(name=name, namespace=namespace)
            logger.info(f"Deleted pod {name} in namespace {namespace}")
            return True
        except ApiException as e:
            logger.error(f"Failed to delete pod {name}: {e}")
            return False
    
    # Service Operations
    def list_services(self, namespace: str = "default") -> List[Dict[str, Any]]:
        """List services in a namespace"""
        try:
            services = self.core_v1.list_namespaced_service(namespace=namespace)
            
            return [{
                "name": svc.metadata.name,
                "namespace": svc.metadata.namespace,
                "type": svc.spec.type,
                "cluster_ip": svc.spec.cluster_ip,
                "ports": [{"port": p.port, "target_port": str(p.target_port), "protocol": p.protocol} 
                         for p in svc.spec.ports] if svc.spec.ports else [],
                "selector": svc.spec.selector or {},
                "labels": svc.metadata.labels or {}
            } for svc in services.items]
            
        except ApiException as e:
            logger.error(f"Failed to list services: {e}")
            return []
    
    # Deployment Operations
    def list_deployments(self, namespace: str = "default") -> List[Dict[str, Any]]:
        """List deployments in a namespace"""
        try:
            deployments = self.apps_v1.list_namespaced_deployment(namespace=namespace)
            
            return [{
                "name": dep.metadata.name,
                "namespace": dep.metadata.namespace,
                "replicas": dep.spec.replicas,
                "ready_replicas": dep.status.ready_replicas or 0,
                "available_replicas": dep.status.available_replicas or 0,
                "labels": dep.metadata.labels or {},
                "selector": dep.spec.selector.match_labels if dep.spec.selector else {}
            } for dep in deployments.items]
            
        except ApiException as e:
            logger.error(f"Failed to list deployments: {e}")
            return []
    
    def scale_deployment(self, name: str, replicas: int, namespace: str = "default") -> bool:
        """Scale a deployment"""
        try:
            deployment = self.apps_v1.read_namespaced_deployment(name=name, namespace=namespace)
            deployment.spec.replicas = replicas
            self.apps_v1.patch_namespaced_deployment(name=name, namespace=namespace, body=deployment)
            logger.info(f"Scaled deployment {name} to {replicas} replicas")
            return True
        except ApiException as e:
            logger.error(f"Failed to scale deployment {name}: {e}")
            return False
    
    # Namespace Operations
    def list_namespaces(self) -> List[str]:
        """List all namespaces"""
        try:
            namespaces = self.core_v1.list_namespace()
            return [ns.metadata.name for ns in namespaces.items]
        except ApiException as e:
            logger.error(f"Failed to list namespaces: {e}")
            return []
    
    def create_namespace(self, name: str) -> bool:
        """Create a namespace"""
        try:
            namespace = client.V1Namespace(
                metadata=client.V1ObjectMeta(name=name)
            )
            self.core_v1.create_namespace(body=namespace)
            logger.info(f"Created namespace {name}")
            return True
        except ApiException as e:
            logger.error(f"Failed to create namespace {name}: {e}")
            return False
    
    # Helper Methods
    def _get_container_state(self, state) -> str:
        """Extract container state from status"""
        if state.running:
            return "running"
        elif state.waiting:
            return f"waiting: {state.waiting.reason}"
        elif state.terminated:
            return f"terminated: {state.terminated.reason}"
        return "unknown"
    
    def execute_kubectl_command(self, command: str, namespace: str = "default") -> Dict[str, Any]:
        """
        Simulate kubectl command execution
        This is a simplified version - in production, you'd parse and execute actual commands
        """
        parts = command.strip().split()
        
        if len(parts) < 2 or parts[0] != "kubectl":
            return {"error": "Invalid kubectl command"}
        
        action = parts[1]
        
        try:
            if action == "get":
                if len(parts) < 3:
                    return {"error": "Missing resource type"}
                
                resource_type = parts[2]
                
                if resource_type in ["pod", "pods"]:
                    pods = self.list_pods(namespace=namespace)
                    return {"output": self._format_pods_table(pods), "success": True}
                
                elif resource_type in ["service", "services", "svc"]:
                    services = self.list_services(namespace=namespace)
                    return {"output": self._format_services_table(services), "success": True}
                
                elif resource_type in ["deployment", "deployments", "deploy"]:
                    deployments = self.list_deployments(namespace=namespace)
                    return {"output": self._format_deployments_table(deployments), "success": True}
            
            elif action == "logs":
                if len(parts) < 3:
                    return {"error": "Missing pod name"}
                pod_name = parts[2]
                logs = self.get_pod_logs(pod_name, namespace=namespace)
                return {"output": logs, "success": True}
            
            elif action == "describe":
                if len(parts) < 4:
                    return {"error": "Missing resource type or name"}
                resource_type = parts[2]
                resource_name = parts[3]
                
                if resource_type == "pod":
                    pod = self.get_pod(resource_name, namespace=namespace)
                    if pod:
                        return {"output": self._format_pod_describe(pod), "success": True}
                    return {"error": f"Pod {resource_name} not found"}
            
            return {"error": f"Command '{action}' not yet implemented"}
            
        except Exception as e:
            return {"error": str(e), "success": False}
    
    def _format_pods_table(self, pods: List[Dict]) -> str:
        """Format pods as kubectl-style table"""
        if not pods:
            return "No resources found"
        
        lines = ["NAME                          READY   STATUS    RESTARTS   AGE"]
        for pod in pods:
            ready = f"{pod['ready']}/{pod['total_containers']}"
            lines.append(f"{pod['name']:<30} {ready:<7} {pod['status']:<9} 0          1d")
        
        return "\n".join(lines)
    
    def _format_services_table(self, services: List[Dict]) -> str:
        """Format services as kubectl-style table"""
        if not services:
            return "No resources found"
        
        lines = ["NAME                TYPE        CLUSTER-IP      PORT(S)"]
        for svc in services:
            ports = ",".join([f"{p['port']}/{p['protocol']}" for p in svc['ports']])
            lines.append(f"{svc['name']:<20} {svc['type']:<11} {svc['cluster_ip']:<15} {ports}")
        
        return "\n".join(lines)
    
    def _format_deployments_table(self, deployments: List[Dict]) -> str:
        """Format deployments as kubectl-style table"""
        if not deployments:
            return "No resources found"
        
        lines = ["NAME                READY   UP-TO-DATE   AVAILABLE   AGE"]
        for dep in deployments:
            ready = f"{dep['ready_replicas']}/{dep['replicas']}"
            lines.append(f"{dep['name']:<20} {ready:<7} {dep['replicas']:<12} {dep['available_replicas']:<11} 1d")
        
        return "\n".join(lines)
    
    def _format_pod_describe(self, pod: Dict) -> str:
        """Format pod details as kubectl describe output"""
        lines = [
            f"Name:         {pod['name']}",
            f"Namespace:    {pod['namespace']}",
            f"Status:       {pod['status']}",
            f"IP:           {pod['ip']}",
            f"Node:         {pod['node']}",
            "",
            "Containers:"
        ]
        
        for container in pod['containers']:
            lines.extend([
                f"  {container['name']}:",
                f"    State:         {container['state']}",
                f"    Ready:         {container['ready']}",
                f"    Restart Count: {container['restart_count']}"
            ])
        
        return "\n".join(lines)
