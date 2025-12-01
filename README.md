# KubeChaos - Kubernetes Chaos Engineering Training Game

A terminal-driven chaos engineering platform built on top of [Chaos Mesh](https://chaos-mesh.org) that helps SREs and DevOps engineers practice incident response skills in a safe, local Kubernetes environment.

## 🎮 What is KubeChaos?

KubeChaos transforms chaos engineering into an interactive learning experience. Instead of just reading about Kubernetes failures, you'll **actively respond to real chaos experiments** in a local cluster, building muscle memory for production incidents.

### Key Features

- 🎯 **Real Chaos Engineering** - Built on Chaos Mesh, not simulations
- 🏆 **Progressive Scenarios** - 8+ challenges from beginner to expert
- 📊 **Live Metrics** - Real-time cluster monitoring and MTTR tracking
- 🖥️ **Terminal-Driven** - Beautiful CLI interface with rich formatting
- 🎓 **Learning Focused** - Hints, objectives, and skill progression

## 🚀 Quick Start

### One-Command Setup

```bash
curl -sSL https://raw.githubusercontent.com/parzival92/main/setup/install.sh | bash
```

This will:
1. Install `kind` (Kubernetes in Docker)
2. Create a local Kubernetes cluster
3. Install Chaos Mesh
4. Deploy a demo e-commerce microservices app

### Manual Setup

If you prefer manual installation:

```bash
# Clone the repository
git clone https://github.com/parzival92/KubeChoas.git
cd KubeChoas

# Run setup script
./setup/install.sh
```

### Start Playing

```bash
# Install Python dependencies
cd backend
pip3 install -r requirements.txt

# Start the backend API
python3 -m uvicorn main:app --reload --port 8000

# In another terminal, use the CLI
python3 cli.py list                    # List available scenarios
python3 cli.py start pod-kill-basic    # Start a scenario
python3 cli.py status                  # Check current status
python3 cli.py hint                    # Get hints
python3 cli.py stop                    # Stop chaos experiments
```

## 📚 How to Play

1. **Choose a Scenario** - Use `python3 cli.py list` to see available challenges
2. **Chaos Begins** - Start a scenario with `python3 cli.py start <scenario-id>`
3. **Investigate** - Use kubectl commands to diagnose the issue
4. **Resolve** - Fix the problem and restore service health
5. **Learn** - Review your MTTR, commands used, and get feedback

### Example Scenarios

- **Pod Termination 101** - Handle pod crashes and CrashLoopBackOff
- **Network Latency Spike** - Debug slow response times
- **CPU Stress Response** - Scale resources under pressure
- **Cascade Failure Recovery** - Handle multi-service failures

## 🛠️ Tech Stack

### Backend
- **FastAPI** - REST API server
- **Kubernetes Python Client** - Cluster interaction
- **Chaos Mesh CRDs** - Real chaos experiments
- **Typer** - CLI framework
- **Rich** - Terminal formatting

### Infrastructure
- **kind** - Local Kubernetes cluster
- **Chaos Mesh** - CNCF chaos engineering platform
- **Demo App** - Microservices e-commerce application

## 🎯 Learning Objectives

By playing KubeChaos, you'll learn:

- ✅ Kubernetes troubleshooting with kubectl
- ✅ Pod lifecycle and restart policies
- ✅ Network debugging and service mesh concepts
- ✅ Resource management and autoscaling
- ✅ Incident response best practices
- ✅ Chaos engineering principles

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│         KubeChaos Game Layer            │
│  ┌──────────────┐    ┌──────────────┐  │
│  │     CLI      │───▶│   Backend    │  │
│  │   (Typer)    │    │   FastAPI    │  │
│  └──────────────┘    └──────┬───────┘  │
└────────────────────────────┼────────────┘
                             │
┌────────────────────────────┼────────────┐
│         Chaos Mesh Layer   │            │
│  ┌──────────────┐    ┌─────▼────────┐  │
│  │ Chaos CRDs   │◀───│  Controller  │  │
│  └──────┬───────┘    └──────────────┘  │
└─────────┼──────────────────────────────┘
          │
┌─────────▼──────────────────────────────┐
│      Kubernetes Cluster (kind)         │
│  ┌──────┐  ┌──────┐  ┌──────┐         │
│  │ Pods │  │ Svcs │  │Deploy│         │
│  └──────┘  └──────┘  └──────┘         │
└────────────────────────────────────────┘
```

## 🧪 Available Chaos Types

- **PodChaos** - Pod failures, kills, container kills ✅ **Works in Kind**
- **NetworkChaos** - Latency, packet loss, partitions ⚠️ Limited in Kind
- **StressChaos** - CPU and memory pressure ⚠️ Limited in Kind
- **IOChaos** - Disk I/O delays and failures ⚠️ Limited in Kind
- **TimeChaos** - Clock skew injection
- **DNSChaos** - DNS resolution errors
- **HTTPChaos** - HTTP request/response manipulation

> **⚠️ Environment Limitations**: When running with Kind (Kubernetes in Docker), only `PodChaos` scenarios work fully due to Chaos Mesh runtime detection limitations. For full scenario support, use Minikube or a cloud Kubernetes cluster. See [docs/ENVIRONMENT_LIMITATIONS.md](docs/ENVIRONMENT_LIMITATIONS.md) for details.


## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## 📝 License

MIT License - See [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Chaos Mesh](https://chaos-mesh.org) - The CNCF chaos engineering platform
- [Kubernetes](https://kubernetes.io) - Container orchestration
- [kind](https://kind.sigs.k8s.io) - Kubernetes in Docker

## 📧 Support

- 🐛 [Report Issues](https://github.com/parzival92/KubeChoas/issues)
- 💬 [Discussions](https://github.com/parzival92/KubeChoas/discussions)

---

**Ready to break things constructively?** 🎮 Start your chaos engineering journey today!
