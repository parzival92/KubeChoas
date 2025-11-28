# KubeChaos Setup Guide

Complete guide for setting up KubeChaos with Chaos Mesh on a local Kubernetes cluster.

## Prerequisites

- **macOS or Linux** (Windows WSL2 supported)
- **Docker** installed and running
- **8GB+ RAM** available for the cluster
- **curl** for running the installer

## Quick Setup (Recommended)

Run the one-command installer:

```bash
curl -sSL https://raw.githubusercontent.com/YOUR_REPO/main/setup/install.sh | bash
```

This automatically:
- ✅ Installs `kind` and `kubectl`
- ✅ Creates a 3-node Kubernetes cluster
- ✅ Installs Chaos Mesh v2.6.3
- ✅ Deploys demo e-commerce application
- ✅ Configures all namespaces and services

**Time:** ~5-10 minutes depending on your internet speed

## Manual Setup

If you prefer step-by-step installation:

### 1. Install kind

**macOS (Homebrew):**
```bash
brew install kind
```

**macOS/Linux (Direct):**
```bash
curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.20.0/kind-$(uname)-amd64
chmod +x ./kind
sudo mv ./kind /usr/local/bin/kind
```

### 2. Install kubectl

**macOS (Homebrew):**
```bash
brew install kubectl
```

**macOS/Linux (Direct):**
```bash
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/$(uname | tr '[:upper:]' '[:lower:]')/amd64/kubectl"
chmod +x kubectl
sudo mv kubectl /usr/local/bin/
```

### 3. Create Kubernetes Cluster

```bash
./setup/create-demo-cluster.sh kind
```

Or manually:

```bash
kind create cluster --name kubechaos --config - <<EOF
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
- role: worker
- role: worker
EOF
```

### 4. Install Chaos Mesh

```bash
./setup/install-chaos-mesh.sh
```

Or manually:

```bash
curl -sSL https://mirrors.chaos-mesh.org/v2.6.3/install.sh | bash -s -- --local kind
```

### 5. Deploy Demo Application

```bash
kubectl create namespace ecommerce
kubectl apply -f setup/demo-app.yaml
```

## Verify Installation

### Check Cluster

```bash
kubectl get nodes
```

Expected output:
```
NAME                      STATUS   ROLES           AGE   VERSION
kubechaos-control-plane   Ready    control-plane   5m    v1.27.3
kubechaos-worker          Ready    <none>          5m    v1.27.3
kubechaos-worker2         Ready    <none>          5m    v1.27.3
```

### Check Chaos Mesh

```bash
kubectl get pods -n chaos-mesh
```

All pods should be `Running`.

### Check Demo App

```bash
kubectl get pods -n ecommerce
```

Expected services:
- `payment-service` (3 replicas)
- `product-catalog` (2 replicas)
- `user-service` (2 replicas)
- `api-gateway` (2 replicas)
- `postgres` (1 replica)

## Start KubeChaos

### Backend

```bash
cd backend
pip install -r requirements.txt
python3 -m uvicorn main:app --reload --port 8000
```

Backend API: http://localhost:8000
API Docs: http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend UI: http://localhost:3000

## Access Chaos Mesh Dashboard (Optional)

```bash
kubectl port-forward -n chaos-mesh svc/chaos-dashboard 2333:2333
```

Open: http://localhost:2333

## Troubleshooting

### Cluster Won't Start

```bash
# Delete and recreate
kind delete cluster --name kubechaos
./setup/install.sh
```

### Pods Stuck in Pending

```bash
# Check node resources
kubectl describe nodes

# Check pod events
kubectl describe pod <pod-name> -n ecommerce
```

### Chaos Mesh Not Working

```bash
# Reinstall Chaos Mesh
kubectl delete namespace chaos-mesh
./setup/install-chaos-mesh.sh
```

### Backend Can't Connect to Cluster

Ensure your kubeconfig is set correctly:

```bash
kubectl config use-context kind-kubechaos
kubectl cluster-info
```

## Cleanup

### Delete Cluster

```bash
kind delete cluster --name kubechaos
```

### Remove kind

```bash
# macOS
brew uninstall kind

# Or delete binary
sudo rm /usr/local/bin/kind
```

## Next Steps

1. ✅ **Start the Game** - Open http://localhost:3000
2. 🎯 **Choose a Scenario** - Start with "Pod Termination 101"
3. 📚 **Learn kubectl** - Practice commands in the terminal
4. 🏆 **Progress** - Complete scenarios to unlock harder challenges

## Advanced Configuration

### Custom Cluster Size

Edit `setup/create-demo-cluster.sh` to add more worker nodes:

```yaml
nodes:
- role: control-plane
- role: worker
- role: worker
- role: worker  # Add more workers
```

### Different Kubernetes Version

```bash
kind create cluster --name kubechaos --image kindest/node:v1.28.0
```

### Resource Limits

Adjust in `setup/demo-app.yaml`:

```yaml
resources:
  requests:
    cpu: 200m      # Increase CPU
    memory: 256Mi  # Increase memory
```

## Support

- 📖 [Main README](../README.md)
- 🐛 [Report Issues](https://github.com/YOUR_REPO/issues)
- 💬 [Discussions](https://github.com/YOUR_REPO/discussions)
