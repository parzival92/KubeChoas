#!/bin/bash
# KubeChaos One-Command Setup
# Installs kind, creates cluster, installs Chaos Mesh, and deploys demo app
# Usage: curl -sSL https://raw.githubusercontent.com/YOUR_REPO/main/setup/install.sh | bash

set -e

echo "🎮 KubeChaos - Complete Setup"
echo "============================="
echo ""
echo "This script will:"
echo "  1. Install kind (if not present)"
echo "  2. Create a local Kubernetes cluster"
echo "  3. Install Chaos Mesh"
echo "  4. Deploy demo e-commerce application"
echo ""

# Detect OS
OS="$(uname -s)"
ARCH="$(uname -m)"

echo "📋 System Info:"
echo "   OS: $OS"
echo "   Architecture: $ARCH"
echo ""

# Install kind if not present
if ! command -v kind &> /dev/null; then
    echo "📦 Installing kind..."
    
    if [ "$OS" = "Darwin" ]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install kind
        else
            # Download binary directly
            curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.20.0/kind-darwin-amd64
            chmod +x ./kind
            sudo mv ./kind /usr/local/bin/kind
        fi
    elif [ "$OS" = "Linux" ]; then
        # Linux
        curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.20.0/kind-linux-amd64
        chmod +x ./kind
        sudo mv ./kind /usr/local/bin/kind
    else
        echo "❌ Unsupported OS: $OS"
        exit 1
    fi
    
    echo "✅ kind installed"
else
    echo "✅ kind already installed"
fi

# Check kubectl
if ! command -v kubectl &> /dev/null; then
    echo "📦 Installing kubectl..."
    
    if [ "$OS" = "Darwin" ]; then
        if command -v brew &> /dev/null; then
            brew install kubectl
        else
            curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/darwin/amd64/kubectl"
            chmod +x kubectl
            sudo mv kubectl /usr/local/bin/
        fi
    elif [ "$OS" = "Linux" ]; then
        curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
        chmod +x kubectl
        sudo mv kubectl /usr/local/bin/
    fi
    
    echo "✅ kubectl installed"
else
    echo "✅ kubectl already installed"
fi

echo ""
echo "🚀 Creating kind cluster 'kubechaos'..."

# Check if cluster already exists and delete it
if kind get clusters 2>/dev/null | grep -q "^kubechaos$"; then
    echo "⚠️  Cluster 'kubechaos' already exists. Deleting and recreating..."
    kind delete cluster --name kubechaos
fi

# Create kind cluster with custom config
cat <<EOF | kind create cluster --name kubechaos --config=-
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
  extraPortMappings:
  - containerPort: 30000
    hostPort: 30000
    protocol: TCP
- role: worker
- role: worker
EOF

echo "✅ Cluster created"

# Set kubectl context
kubectl cluster-info --context kind-kubechaos

echo ""
echo "⏳ Waiting for cluster to be ready..."
kubectl wait --for=condition=Ready nodes --all --timeout=300s

echo ""
echo "📦 Installing Chaos Mesh..."

# Install Chaos Mesh using official script
curl -sSL https://mirrors.chaos-mesh.org/v2.6.3/install.sh | bash -s -- --local kind

echo ""
echo "⏳ Waiting for Chaos Mesh to be ready..."
kubectl wait --for=condition=Ready pods --all -n chaos-mesh --timeout=300s

echo ""
echo "🏪 Creating namespaces..."
kubectl create namespace ecommerce 2>/dev/null || true
kubectl create namespace monitoring 2>/dev/null || true

echo ""
echo "🏪 Deploying demo e-commerce application..."

# Deploy demo application
kubectl apply -f https://raw.githubusercontent.com/YOUR_REPO/main/setup/demo-app.yaml 2>/dev/null || \
kubectl apply -f - <<'EOF'
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: payment-service
  namespace: ecommerce
  labels:
    app: payment-service
    tier: backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: payment-service
  template:
    metadata:
      labels:
        app: payment-service
        tier: backend
    spec:
      containers:
      - name: payment
        image: nginx:alpine
        ports:
        - containerPort: 80
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 500m
            memory: 512Mi
---
apiVersion: v1
kind: Service
metadata:
  name: payment-service
  namespace: ecommerce
spec:
  selector:
    app: payment-service
  ports:
  - port: 80
    targetPort: 80
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: product-catalog
  namespace: ecommerce
  labels:
    app: product-catalog
    tier: backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: product-catalog
  template:
    metadata:
      labels:
        app: product-catalog
        tier: backend
    spec:
      containers:
      - name: catalog
        image: nginx:alpine
        ports:
        - containerPort: 80
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 500m
            memory: 512Mi
---
apiVersion: v1
kind: Service
metadata:
  name: product-catalog
  namespace: ecommerce
spec:
  selector:
    app: product-catalog
  ports:
  - port: 80
    targetPort: 80
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-service
  namespace: ecommerce
  labels:
    app: user-service
    tier: backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: user-service
  template:
    metadata:
      labels:
        app: user-service
        tier: backend
    spec:
      containers:
      - name: user
        image: nginx:alpine
        ports:
        - containerPort: 80
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 500m
            memory: 512Mi
---
apiVersion: v1
kind: Service
metadata:
  name: user-service
  namespace: ecommerce
spec:
  selector:
    app: user-service
  ports:
  - port: 80
    targetPort: 80
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
  namespace: ecommerce
  labels:
    app: api-gateway
    tier: frontend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: api-gateway
  template:
    metadata:
      labels:
        app: api-gateway
        tier: frontend
    spec:
      containers:
      - name: gateway
        image: nginx:alpine
        ports:
        - containerPort: 80
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 500m
            memory: 512Mi
---
apiVersion: v1
kind: Service
metadata:
  name: api-gateway
  namespace: ecommerce
spec:
  selector:
    app: api-gateway
  ports:
  - port: 80
    targetPort: 80
    nodePort: 30000
  type: NodePort
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
  namespace: ecommerce
  labels:
    app: postgres
    tier: database
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
        tier: database
    spec:
      containers:
      - name: postgres
        image: postgres:15-alpine
        env:
        - name: POSTGRES_PASSWORD
          value: "password"
        - name: POSTGRES_DB
          value: "ecommerce"
        ports:
        - containerPort: 5432
        resources:
          requests:
            cpu: 200m
            memory: 256Mi
          limits:
            cpu: 1000m
            memory: 1Gi
---
apiVersion: v1
kind: Service
metadata:
  name: postgres
  namespace: ecommerce
spec:
  selector:
    app: postgres
  ports:
  - port: 5432
    targetPort: 5432
EOF

echo ""
echo "⏳ Waiting for demo application to be ready..."
kubectl wait --for=condition=Available deployment --all -n ecommerce --timeout=300s

echo ""
echo "🎉 Setup Complete!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Cluster Status:"
kubectl get nodes
echo ""
kubectl get pods -n ecommerce
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎮 Next Steps:"
echo ""
echo "1. Install Python dependencies:"
echo "   cd backend && pip3 install -r requirements.txt"
echo ""
echo "2. Start the backend:"
echo "   cd backend && python3 -m uvicorn main:app --reload --port 8000"
echo ""
echo "3. Access the API:"
echo "   http://localhost:8000"
echo "   API Documentation: http://localhost:8000/docs"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📚 Useful Commands:"
echo ""
echo "  View Chaos Mesh Dashboard:"
echo "    kubectl port-forward -n chaos-mesh svc/chaos-dashboard 2333:2333"
echo "    Open: http://localhost:2333"
echo ""
echo "  Check cluster status:"
echo "    kubectl get pods -n ecommerce"
echo "    kubectl get podchaos -n ecommerce"
echo ""
echo "  Delete cluster:"
echo "    kind delete cluster --name kubechaos"
echo ""
echo "Happy Chaos Engineering! 🎮"
