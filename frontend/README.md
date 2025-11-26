# KubeChaos Frontend

The frontend for KubeChaos - a Next.js application with a Cyberpunk Ops Center aesthetic.

## 🎨 Features

- **3D Cluster Visualization**: Real-time 3D view of your Kubernetes cluster using Three.js
- **Cyber Terminal**: Execute kubectl commands in a futuristic terminal interface
- **Control Panel**: Manage game state and view system metrics
- **Live Updates**: Polls backend every 2 seconds for real-time cluster state

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Backend server running on http://localhost:8000

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

### Build

```bash
npm run build
npm start
```

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── page.tsx        # Main page
│   │   ├── layout.tsx      # Root layout
│   │   └── globals.css     # Global styles
│   ├── components/         # React components
│   │   ├── Cluster3DVisualizer.tsx
│   │   ├── CyberTerminal.tsx
│   │   ├── SciFiControlPanel.tsx
│   │   └── SystemStatusPanel.tsx
│   ├── store/              # State management
│   │   └── gameStore.ts    # Zustand store with API calls
│   └── utils/              # Utility functions
├── public/                 # Static assets
├── tailwind.config.mjs     # Tailwind configuration
└── package.json
```

## 🎨 Design System

### Colors
- **Cyber Blue**: `#00f3ff`
- **Cyber Pink**: `#ff00ff`
- **Cyber Purple**: `#bd00ff`
- **Background**: `#050a14`

### Fonts
- **Sans**: Inter
- **Mono**: Fira Code
- **Cyber**: Orbitron

### Components
- **Glass Panels**: Glassmorphism with backdrop blur
- **Neon Effects**: Text glow and shadow effects
- **Animations**: Framer Motion for smooth transitions

## 🔌 API Integration

The frontend communicates with the backend via REST API:

```typescript
const API_BASE_URL = 'http://localhost:8000';

// Example API calls
await fetch(`${API_BASE_URL}/status`);
await fetch(`${API_BASE_URL}/start`, { method: 'POST' });
await fetch(`${API_BASE_URL}/command`, {
  method: 'POST',
  body: JSON.stringify({ command: 'kubectl get pods' })
});
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests with Playwright
npm run test:e2e
```

## 📦 Dependencies

### Core
- Next.js 15
- React 19
- TypeScript

### UI & Styling
- Tailwind CSS
- Framer Motion
- Radix UI
- Lucide React (Icons)

### 3D Graphics
- Three.js
- @react-three/fiber
- @react-three/drei

### State Management
- Zustand

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Tailwind
Custom theme configuration in `tailwind.config.mjs`

## 📝 License

MIT License
