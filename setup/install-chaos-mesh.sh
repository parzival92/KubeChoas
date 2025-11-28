#!/bin/bash
# Install Chaos Mesh on Kubernetes cluster
# Supports minikube, kind, and standard Kubernetes clusters

set -e

echo "🎮 KubeChaos - Chaos Mesh Installation Script"
echo "=============================================="
echo ""

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed. Please install kubectl first."
    exit 1
fi

# Check if cluster is accessible
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ Cannot connect to Kubernetes cluster. Please ensure your cluster is running."
    exit 1
fi

echo "✅ Connected to Kubernetes cluster"
kubectl cluster-info | head -n 1

# Check Kubernetes version
K8S_VERSION=$(kubectl version --short 2>/dev/null | grep Server | awk '{print $3}')
echo "📦 Kubernetes version: $K8S_VERSION"
echo ""

# Install Chaos Mesh
echo "📥 Installing Chaos Mesh..."
echo ""

# Add Chaos Mesh Helm repo
if command -v helm &> /dev/null; then
    echo "Using Helm to install Chaos Mesh..."
    helm repo add chaos-mesh https://charts.chaos-mesh.org
    helm repo update
    
    # Create namespace
    kubectl create namespace chaos-mesh || true
    
    # Install Chaos Mesh
    helm install chaos-mesh chaos-mesh/chaos-mesh \
        --namespace=chaos-mesh \
        --set chaosDaemon.runtime=containerd \
        --set chaosDaemon.socketPath=/run/containerd/containerd.sock \
        --set dashboard.create=true \
        --version 2.6.3
    
    echo ""
    echo "✅ Chaos Mesh installed via Helm"
else
    echo "Helm not found, using kubectl apply method..."
    
    # Install using kubectl
    curl -sSL https://mirrors.chaos-mesh.org/v2.6.3/install.sh | bash -s -- --local kind
    
    echo ""
    echo "✅ Chaos Mesh installed via kubectl"
fi

echo ""
echo "⏳ Waiting for Chaos Mesh pods to be ready..."
kubectl wait --for=condition=Ready pods --all -n chaos-mesh --timeout=300s

echo ""
echo "🎉 Chaos Mesh installation complete!"
echo ""
echo "📊 Chaos Mesh Dashboard:"
echo "   Run: kubectl port-forward -n chaos-mesh svc/chaos-dashboard 2333:2333"
echo "   Then open: http://localhost:2333"
echo ""
echo "🔍 Verify installation:"
echo "   kubectl get pods -n chaos-mesh"
echo ""
echo "🎮 You're ready to start KubeChaos!"
