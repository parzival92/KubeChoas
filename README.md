# KubeChaos: Cluster Under Siege

A browser-based Kubernetes chaos engineering simulation game for SREs and DevOps engineers. Defend your cluster against continuous chaos attacks using familiar `kubectl` commands!

## 🎯 Game Concept

KubeChaos simulates a Kubernetes cluster under attack by various chaos events. As an SRE, you must:

- Monitor cluster resources in real-time
- Investigate incidents using `kubectl` commands
- Resolve issues quickly to minimize MTTR (Mean Time To Resolution)
- Earn points based on efficiency and problem-solving skills

## 🚀 Features

### Core Gameplay
- **Realistic Terminal**: Full `kubectl` command support with authentic output
- **Chaos Events**: Random incidents every 30 seconds (pod crashes, high CPU, DNS failures, etc.)
- **Live Dashboard**: Real-time cluster resource monitoring
- **Scoring System**: MTTR-based scoring with efficiency bonuses

### Chaos Events
- **Pod Crashes**: CrashLoopBackOff scenarios with detailed logs
- **High CPU Usage**: Resource pressure simulation
- **DNS Failures**: Service connectivity issues
- **Service Outages**: Endpoint failures
- **Deployment Failures**: Rollout problems

### Commands Supported
- `kubectl get pods/services/deployments`
- `kubectl logs <pod-name>`
- `kubectl describe <resource>`
- `kubectl exec`, `kubectl port-forward`
- `kubectl apply`, `kubectl delete`
- `kubectl scale`, `kubectl rollout`

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 with TypeScript
- **Terminal**: Custom terminal implementation (replaced xterm.js for stability)
- **State Management**: Zustand for game state
- **Styling**: Tailwind CSS
- **Chaos Engine**: Custom TypeScript implementation

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd KubeChoas
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎮 How to Play

1. **Start the Game**: Click "Start Chaos Game" to begin
2. **Monitor Dashboard**: Watch for active chaos events and resource status
3. **Use Terminal**: Type `kubectl get pods` to see current pod status
4. **Investigate Issues**: Use `kubectl logs <pod>` to check for errors
5. **Resolve Problems**: Apply fixes and monitor resolution
6. **Track Score**: Monitor your MTTR and efficiency metrics

## 🏆 Scoring System

- **Base Score**: 100 points per resolved incident
- **MTTR Bonus**: Faster resolution = higher score
- **Efficiency Penalty**: Excessive commands reduce score
- **Proactive Bonus**: Points for preventive monitoring

## 🔧 Development

### Project Structure
```
src/
├── app/                 # Next.js app router
├── components/          # React components
│   ├── SimpleTerminal.tsx    # Custom terminal implementation
│   ├── ClusterDashboard.tsx
│   ├── GameControls.tsx
│   └── GameLoop.tsx    # Chaos event generator
├── store/              # Zustand state management
│   └── gameStore.ts
└── utils/              # Game utilities
    ├── commandExecutor.ts
    └── chaosEngine.ts
```

### Key Components

- **SimpleTerminal**: Realistic kubectl command interface
- **ClusterDashboard**: Visual cluster resource monitoring
- **GameControls**: Start/stop game and view status
- **GameLoop**: Manages periodic chaos events
- **ChaosEngine**: Generates and applies chaos events

## 🎯 Future Enhancements

### v1.1 - Enhanced Chaos
- Multiple simultaneous incidents
- Stacked chaos effects
- More complex scenarios

### v2.0 - Real Kubernetes Integration
- Minikube/Kind cluster support
- Real kubectl command execution
- Actual cluster state monitoring

### v2.5 - Multiplayer Mode
- Team-based chaos battles
- Leaderboards
- Collaborative problem-solving

### v3.0 - DevSecOps Layer
- Security vulnerabilities
- RBAC challenges
- Secret management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Inspired by real-world SRE challenges
- Built for DevOps learning and training
- Designed to improve incident response skills

---

**Ready to defend your cluster? Start the chaos! 🚀**
