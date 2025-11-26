from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from models import GameState
from game_logic import game_manager

app = FastAPI(title="KubeChaos API", description="Backend for KubeChaos Game")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CommandRequest(BaseModel):
    command: str

@app.get("/")
def read_root():
    return {"message": "KubeChaos API is running"}

@app.get("/status", response_model=GameState)
def get_status():
    return game_manager.get_state()

@app.post("/start")
def start_game():
    game_manager.start_game()
    return {"message": "Game started"}

@app.post("/stop")
def stop_game():
    game_manager.stop_game()
    return {"message": "Game stopped"}

@app.post("/command")
def execute_command(request: CommandRequest):
    output = game_manager.execute_command(request.command)
    return {"output": output}

@app.post("/chaos/generate")
def generate_chaos():
    game_manager.generate_chaos_event()
    return {"message": "Chaos event generation triggered"}

@app.post("/chaos/resolve/{event_id}")
def resolve_chaos(event_id: str):
    game_manager.resolve_event(event_id)
    return {"message": f"Event {event_id} resolution attempted"}
