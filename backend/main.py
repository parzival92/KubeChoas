from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from models import GameState
from game_logic import game_manager
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="KubeChaos API", 
    description="Backend for KubeChaos - Chaos Engineering Training Game",
    version="2.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://localhost:3001", 
        "http://localhost:3002", 
        "http://localhost:3003"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Models
class CommandRequest(BaseModel):
    command: str
    namespace: Optional[str] = "default"

class ChaosExperimentRequest(BaseModel):
    scenario_id: str
    namespace: Optional[str] = "ecommerce"

class CustomChaosRequest(BaseModel):
    chaos_type: str  # PodChaos, NetworkChaos, etc.
    name: str
    namespace: str
    config: Dict[str, Any]

# Health & Status Endpoints
@app.get("/")
def read_root():
    return {
        "message": "KubeChaos API is running",
        "version": "2.0.0",
        "chaos_mesh_enabled": True
    }

@app.get("/health")
def health_check():
    """Health check endpoint"""
    cluster_status = game_manager.get_cluster_status()
    return {
        "status": "healthy",
        "cluster_connected": cluster_status.get("connected", False),
        "chaos_mesh_installed": cluster_status.get("chaos_mesh_installed", False)
    }

@app.get("/status", response_model=GameState)
def get_status():
    """Get current game state"""
    return game_manager.get_state()

@app.get("/cluster/info")
def get_cluster_info():
    """Get Kubernetes cluster information"""
    return game_manager.get_cluster_status()

# Game Control Endpoints
@app.post("/start")
def start_game():
    """Start the game"""
    try:
        game_manager.start_game()
        return {"message": "Game started", "success": True}
    except Exception as e:
        logger.error(f"Failed to start game: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/stop")
def stop_game():
    """Stop the game"""
    try:
        game_manager.stop_game()
        return {"message": "Game stopped", "success": True}
    except Exception as e:
        logger.error(f"Failed to stop game: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/reset")
def reset_game():
    """Reset game state"""
    try:
        game_manager.reset_game()
        return {"message": "Game reset", "success": True}
    except Exception as e:
        logger.error(f"Failed to reset game: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Kubectl Command Execution
@app.post("/command")
def execute_command(request: CommandRequest):
    """Execute a kubectl command"""
    try:
        result = game_manager.execute_command(request.command, request.namespace)
        return result
    except Exception as e:
        logger.error(f"Command execution failed: {e}")
        return {"output": f"Error: {str(e)}", "success": False}

# Scenario Management
@app.get("/scenarios")
def list_scenarios():
    """List all available game scenarios"""
    return game_manager.list_scenarios()

@app.get("/scenarios/{scenario_id}")
def get_scenario(scenario_id: str):
    """Get details of a specific scenario"""
    scenario = game_manager.get_scenario(scenario_id)
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")
    return scenario

@app.get("/scenarios/difficulty/{difficulty}")
def get_scenarios_by_difficulty(difficulty: str):
    """Get scenarios by difficulty level"""
    return game_manager.get_scenarios_by_difficulty(difficulty)

@app.post("/scenarios/{scenario_id}/start")
def start_scenario(scenario_id: str, namespace: Optional[str] = "ecommerce"):
    """Start a game scenario (creates chaos experiment)"""
    try:
        result = game_manager.start_scenario(scenario_id, namespace)
        if not result:
            raise HTTPException(status_code=400, detail="Failed to start scenario")
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
            
        return {
            "message": f"Scenario {scenario_id} started",
            "experiment": result,
            "success": True
        }
    except Exception as e:
        logger.error(f"Failed to start scenario: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Chaos Experiment Management
@app.get("/chaos/experiments")
def list_experiments(namespace: Optional[str] = "ecommerce"):
    """List all active chaos experiments"""
    try:
        experiments = game_manager.list_chaos_experiments(namespace)
        return {"experiments": experiments, "count": len(experiments)}
    except Exception as e:
        logger.error(f"Failed to list experiments: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/chaos/experiments/{experiment_name}")
def get_experiment(experiment_name: str, namespace: Optional[str] = "ecommerce", chaos_type: Optional[str] = "PodChaos"):
    """Get details of a specific chaos experiment"""
    try:
        experiment = game_manager.get_chaos_experiment(experiment_name, namespace, chaos_type)
        if not experiment:
            raise HTTPException(status_code=404, detail="Experiment not found")
        return experiment
    except Exception as e:
        logger.error(f"Failed to get experiment: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chaos/experiments/custom")
def create_custom_experiment(request: CustomChaosRequest):
    """Create a custom chaos experiment"""
    try:
        result = game_manager.create_custom_chaos(
            chaos_type=request.chaos_type,
            name=request.name,
            namespace=request.namespace,
            config=request.config
        )
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create experiment")
        return {
            "message": "Chaos experiment created",
            "experiment": result,
            "success": True
        }
    except Exception as e:
        logger.error(f"Failed to create custom experiment: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chaos/experiments/{experiment_name}/pause")
def pause_experiment(experiment_name: str, namespace: Optional[str] = "ecommerce", chaos_type: Optional[str] = "PodChaos"):
    """Pause a running chaos experiment"""
    try:
        success = game_manager.pause_chaos_experiment(experiment_name, namespace, chaos_type)
        if not success:
            raise HTTPException(status_code=400, detail="Failed to pause experiment")
        return {"message": "Experiment paused", "success": True}
    except Exception as e:
        logger.error(f"Failed to pause experiment: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chaos/experiments/{experiment_name}/resume")
def resume_experiment(experiment_name: str, namespace: Optional[str] = "ecommerce", chaos_type: Optional[str] = "PodChaos"):
    """Resume a paused chaos experiment"""
    try:
        success = game_manager.resume_chaos_experiment(experiment_name, namespace, chaos_type)
        if not success:
            raise HTTPException(status_code=400, detail="Failed to resume experiment")
        return {"message": "Experiment resumed", "success": True}
    except Exception as e:
        logger.error(f"Failed to resume experiment: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/chaos/experiments/{experiment_name}")
def delete_experiment(experiment_name: str, namespace: Optional[str] = "ecommerce", chaos_type: Optional[str] = "PodChaos"):
    """Delete a chaos experiment"""
    try:
        success = game_manager.delete_chaos_experiment(experiment_name, namespace, chaos_type)
        if not success:
            raise HTTPException(status_code=400, detail="Failed to delete experiment")
        return {"message": "Experiment deleted", "success": True}
    except Exception as e:
        logger.error(f"Failed to delete experiment: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Legacy Chaos Endpoints (for backward compatibility)
@app.post("/chaos/generate")
def generate_chaos():
    """Generate a chaos event (legacy - simulation mode)"""
    game_manager.generate_chaos_event()
    return {"message": "Chaos event generation triggered"}

@app.post("/chaos/resolve/{event_id}")
def resolve_chaos(event_id: str):
    """Resolve a chaos event (legacy - simulation mode)"""
    game_manager.resolve_event(event_id)
    return {"message": f"Event {event_id} resolution attempted"}

# Kubernetes Resource Endpoints
@app.get("/k8s/pods")
def list_pods(namespace: Optional[str] = "default"):
    """List pods in a namespace"""
    try:
        pods = game_manager.list_pods(namespace)
        return {"pods": pods, "count": len(pods)}
    except Exception as e:
        logger.error(f"Failed to list pods: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/k8s/pods/{pod_name}")
def get_pod(pod_name: str, namespace: Optional[str] = "default"):
    """Get details of a specific pod"""
    try:
        pod = game_manager.get_pod(pod_name, namespace)
        if not pod:
            raise HTTPException(status_code=404, detail="Pod not found")
        return pod
    except Exception as e:
        logger.error(f"Failed to get pod: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/k8s/pods/{pod_name}/logs")
def get_pod_logs(pod_name: str, namespace: Optional[str] = "default", tail_lines: Optional[int] = 100):
    """Get logs from a pod"""
    try:
        logs = game_manager.get_pod_logs(pod_name, namespace, tail_lines)
        return {"logs": logs}
    except Exception as e:
        logger.error(f"Failed to get pod logs: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/k8s/services")
def list_services(namespace: Optional[str] = "default"):
    """List services in a namespace"""
    try:
        services = game_manager.list_services(namespace)
        return {"services": services, "count": len(services)}
    except Exception as e:
        logger.error(f"Failed to list services: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/k8s/deployments")
def list_deployments(namespace: Optional[str] = "default"):
    """List deployments in a namespace"""
    try:
        deployments = game_manager.list_deployments(namespace)
        return {"deployments": deployments, "count": len(deployments)}
    except Exception as e:
        logger.error(f"Failed to list deployments: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/k8s/namespaces")
def list_namespaces():
    """List all namespaces"""
    try:
        namespaces = game_manager.list_namespaces()
        return {"namespaces": namespaces, "count": len(namespaces)}
    except Exception as e:
        logger.error(f"Failed to list namespaces: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
