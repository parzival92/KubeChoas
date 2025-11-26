# KubeChaos - Kubernetes Chaos Engineering Game

A DevOps chaos simulator game for SREs & Engineers. Defend your cluster against chaos attacks using real kubectl commands.

## �️ Architecture

This project is split into two separate applications:

- **Backend** (`/backend`): Python FastAPI server providing REST API with Swagger documentation
- **Frontend** (`/frontend`): Next.js application with a Cyberpunk Ops Center UI

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- npm or yarn

### Running the Backend

```bash
cd backend
pip install -r requirements.txt
python3 -m uvicorn main:app --reload --port 8000
```

The backend API will be available at:
- **API**: http://localhost:8000
- **Swagger Docs**: http://localhost:8000/docs

### Running the Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at http://localhost:3000

## 📚 Documentation

- **Backend API**: See Swagger documentation at http://localhost:8000/docs
- **Frontend**: See `frontend/README.md` for UI details
- **Game Plan**: See `KubeChaos_Initial_Game_Plan.docx` for original design

## 🎮 How to Play

1. Start both the backend and frontend servers
2. Open http://localhost:3000 in your browser
3. Click "Initialize" to start the game
4. Use the terminal to run kubectl commands
5. Resolve chaos events to earn points
6. Monitor your cluster in the 3D visualizer

## 🛠️ Tech Stack

### Backend
- FastAPI
- Pydantic
- Uvicorn

### Frontend
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Zustand (State Management)
- Three.js / React Three Fiber (3D Visualization)
- Framer Motion (Animations)

## � Project Structure

```
KubeChoas/
├── backend/              # Python FastAPI backend
│   ├── main.py          # API entry point
│   ├── models.py        # Pydantic models
│   ├── game_logic.py    # Game state management
│   └── requirements.txt # Python dependencies
├── frontend/            # Next.js frontend
│   ├── src/            # Source code
│   ├── public/         # Static assets
│   └── package.json    # Node dependencies
├── docs/               # Documentation
└── README.md           # This file
```

## 🧪 Testing

### Backend
```bash
cd backend
# Run tests (when implemented)
pytest
```

### Frontend
```bash
cd frontend
npm run test
npm run test:e2e
```

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## � Contact

For questions or support, please open an issue on GitHub.
