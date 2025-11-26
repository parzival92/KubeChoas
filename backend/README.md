# KubeChaos Backend

The backend for KubeChaos - a Python FastAPI server providing REST API for the chaos engineering game.

## 🚀 Features

- **REST API**: 7 endpoints for game control and state management
- **Swagger Documentation**: Interactive API docs at `/docs`
- **Game Logic**: Chaos event generation and resolution
- **State Management**: In-memory game state with Pydantic models

## 📋 Prerequisites

- Python 3.9+
- pip

## 🛠️ Installation

```bash
pip install -r requirements.txt
```

## 🏃 Running the Server

```bash
python3 -m uvicorn main:app --reload --port 8000
```

The server will be available at:
- **API**: http://localhost:8000
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 📡 API Endpoints

### Game Control
- `POST /start` - Start the game
- `POST /stop` - Stop the game
- `GET /status` - Get current game state

### Commands
- `POST /command` - Execute a kubectl command
  ```json
  {
    "command": "kubectl get pods"
  }
  ```

### Chaos Events
- `POST /chaos/generate` - Generate a random chaos event
- `POST /chaos/resolve/{event_id}` - Resolve a chaos event

### Health
- `GET /` - Health check

## 🏗️ Project Structure

```
backend/
├── main.py           # FastAPI application and endpoints
├── models.py         # Pydantic models for data validation
├── game_logic.py     # Game state management and logic
└── requirements.txt  # Python dependencies
```

## 📊 Data Models

### Pod
```python
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
```

### ChaosEvent
```python
class ChaosEvent(BaseModel):
    id: str
    type: ChaosEventType
    severity: ChaosSeverity
    description: str
    affectedResources: List[str]
    timestamp: datetime
    resolved: bool
    resolvedAt: Optional[datetime]
```

### GameState
```python
class GameState(BaseModel):
    isGameRunning: bool
    gameStartTime: Optional[datetime]
    pods: List[Pod]
    services: List[Service]
    deployments: List[Deployment]
    chaosEvents: List[ChaosEvent]
    activeEvents: List[ChaosEvent]
    score: GameScore
```

## 🎮 Game Logic

### Initial State
- 18 pods across `production` and `data` namespaces
- 9 services (LoadBalancer and ClusterIP)
- 6 deployments

### Chaos Events
10 types of chaos events:
- `pod-crash`
- `high-cpu`
- `dns-failure`
- `service-down`
- `deployment-failed`
- `cart-service-oom`
- `api-gateway-overload`
- `database-connection-exhausted`
- `redis-cache-eviction`
- `rabbitmq-queue-full`

### Scoring
- Base: 100 points per incident resolved
- Simplified scoring (can be enhanced)

## 🔧 Configuration

### CORS
The backend allows requests from:
- http://localhost:3000
- http://localhost:3001
- http://localhost:3002
- http://localhost:3003

Update `main.py` to add more origins if needed.

## 🧪 Testing

```bash
# Install dev dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest
```

## 📝 Development

### Adding New Endpoints

1. Define the endpoint in `main.py`:
```python
@app.post("/new-endpoint")
def new_endpoint():
    return {"message": "Hello"}
```

2. Update models in `models.py` if needed
3. Add logic in `game_logic.py` if needed

### Hot Reload
The `--reload` flag enables hot reloading during development.

## 📦 Dependencies

- **fastapi**: Web framework
- **uvicorn**: ASGI server
- **pydantic**: Data validation

## 📝 License

MIT License
