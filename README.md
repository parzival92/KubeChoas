# KubeChaos: Cluster Under Siege

A browser-based Kubernetes chaos engineering simulation game for SREs and DevOps engineers. Defend your **e-commerce microservices cluster** against continuous chaos attacks using familiar `kubectl` commands!

## 🎯 Game Concept

KubeChaos simulates a realistic e-commerce Kubernetes cluster under attack by various chaos events. As an SRE, you must:

- Monitor **18 pods** across **4 namespaces** in real-time
- Investigate incidents using `kubectl` commands with namespace support
- Resolve issues quickly to minimize MTTR (Mean Time To Resolution)
- Earn points based on efficiency and problem-solving skills

## 🏗️ Cluster Architecture

### Production Namespace (11 pods)
- **3x Web Frontend** - Next.js customer-facing application
- **2x API Gateway** - Request routing and load balancing
- **2x Product Service** - Product catalog management
- **2x Cart Service** - Shopping cart operations
- **2x Order Service** - Order processing and fulfillment

### Data Namespace (7 pods)
- **1x PostgreSQL Primary** - Primary database (StatefulSet)
- **1x PostgreSQL Replica** - Read replica for scaling
- **2x Redis Cache** - Session and data caching
- **3x RabbitMQ Cluster** - Message queue for async processing

### Additional Namespaces
- **Monitoring** - Prometheus & Grafana (future)
- **Ingress-System** - Load balancers and ingress controllers (future)

## 🚀 Features

### Core Gameplay
- **Realistic Terminal**: Full `kubectl` command support with namespace filtering
- **E-Commerce Chaos**: 10 realistic failure scenarios (API overload, cart OOM, DB exhaustion, etc.)
- **Live Dashboard**: Real-time cluster monitoring with namespace filter
- **Scoring System**: MTTR-based scoring with efficiency bonuses

### Chaos Events (10 Types)
1. **API Gateway Overload** - Traffic spike causing high CPU/memory
2. **Frontend Pod Crash** - Out of memory errors
3. **Cart Service OOM** - Memory leak with Redis timeouts
4. **Product Service High CPU** - Slow database queries
5. **Database Connection Exhausted** - PostgreSQL pool at capacity
6. **Redis Cache Eviction** - Memory pressure and cache misses
7. **RabbitMQ Queue Full** - Order processing blocked
8. **DNS Failure** - Cross-namespace resolution issues
9. **Service Down** - Endpoint failures
10. **Deployment Failed** - Rollout problems

### Commands Supported

#### Basic Commands
```bash
kubectl get pods                    # List pods (defaults to production namespace)
kubectl get services
kubectl get deployments
kubectl get namespaces              # List all 4 namespaces
```

#### Namespace Filtering
```bash
kubectl get pods -n production      # Production namespace
kubectl get pods -n data            # Data namespace
kubectl get pods --all-namespaces   # All pods with NAMESPACE column
kubectl get pods -A                 # Short form
```

#### Investigation
```bash
kubectl logs <pod-name>             # View pod logs
kubectl logs <pod> -n data          # Logs from data namespace
kubectl describe pod <name>         # Detailed pod info
kubectl describe service <name> -n production
```

#### Remediation
```bash
kubectl delete pod <name>           # Restart pod
kubectl rollout restart deployment <name>
kubectl scale deployment <name> --replicas=4
```

#### Utility
```bash
help                                # Show available commands
clear                               # Clear terminal
date, whoami, pwd, ls              # Unix utilities
```

## 🎨 UI Features

- **Namespace Filter Dropdown** - Filter dashboard by namespace
- **Color-Coded Badges** - Visual namespace identification
  - 🔵 Production (blue)
  - 🟣 Data (purple)
  - 🟢 Monitoring (green)
  - 🟠 Ingress-system (orange)
- **Real-Time Updates** - Live resource status
- **Chaos Event Alerts** - Prominent incident notifications

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 with TypeScript
- **Terminal**: Custom terminal implementation with glassmorphic design
- **State Management**: Zustand for game state
- **Styling**: Tailwind CSS with premium dark theme
- **Testing**: Playwright (39 tests, 100% passing)
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

5. **Run tests** (optional)
   ```bash
   npm run test      # Run Playwright tests
   npm run test:ui   # Run with UI
   ```

## 🎮 How to Play

1. **Start the Game**: Click "Start Chaos Game" to begin
2. **Monitor Dashboard**: Watch for active chaos events across namespaces
3. **Use Namespace Filter**: Select specific namespaces to focus on
4. **Investigate Issues**: 
   ```bash
   kubectl get pods -n production
   kubectl logs api-gateway-xxx
   kubectl describe pod cart-service-xxx
   ```
5. **Resolve Problems**: 
   ```bash
   kubectl delete pod <failing-pod>
   kubectl rollout restart deployment cart-service
   ```
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
├── app/                      # Next.js app router
├── components/               # React components
│   ├── SimpleTerminal.tsx    # Custom terminal with namespace support
│   ├── ClusterDashboard.tsx  # Dashboard with namespace filter
│   ├── GameControls.tsx
│   └── GameLoop.tsx          # Chaos event generator
├── store/                    # Zustand state management
│   └── gameStore.ts          # 18 pods, 9 services, 6 deployments
└── utils/                    # Game utilities
    ├── commandExecutor.ts    # kubectl command parser
    └── chaosEngine.ts        # 10 chaos event templates
```

### Running Tests
```bash
npm run test                  # Run all 39 tests
npm run test:ui               # Interactive test UI
```

**Test Coverage:**
- ✅ Game flow (start/stop)
- ✅ Terminal commands
- ✅ Namespace filtering
- ✅ Dashboard filtering
- ✅ Namespace badges
- ✅ E-commerce pods
- ✅ Cross-namespace operations

## 📚 Learning Objectives

This game teaches:
- **Kubernetes Basics**: Pods, Services, Deployments, Namespaces
- **kubectl Commands**: Real command syntax and usage
- **Troubleshooting**: Log analysis, resource inspection
- **SRE Practices**: MTTR optimization, incident response
- **Microservices**: Understanding service dependencies
- **Chaos Engineering**: Resilience testing concepts

## 🎯 Future Enhancements

### v1.1 - Advanced Features
- Service dependency graph visualization
- Resource usage charts per namespace
- More complex cascading failures
- Tutorial mode for beginners

### v2.0 - Real Kubernetes Integration
- Minikube/Kind cluster support
- Real kubectl command execution
- Actual cluster state monitoring
- Custom chaos injection

### v2.5 - Multiplayer Mode
- Team-based chaos battles
- Leaderboards
- Collaborative problem-solving
- Competitive scoring

### v3.0 - DevSecOps Layer
- Security vulnerabilities
- RBAC challenges
- Secret management
- Network policies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📊 Stats

- **18 Pods** across 4 namespaces
- **10 Chaos Event Types**
- **39 Passing Tests**
- **~500 Lines** of new code
- **9x Growth** from original cluster

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Inspired by real-world e-commerce SRE challenges
- Built for DevOps learning and training
- Designed to improve incident response skills
- Realistic failure scenarios from production systems

---

**Ready to defend your e-commerce cluster? Start the chaos! 🚀**
