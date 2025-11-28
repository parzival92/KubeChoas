#!/bin/bash
# Create a local Kubernetes cluster with demo application for KubeChaos
# Supports kind and minikube

set -e

echo "🎮 KubeChaos - Demo Cluster Setup"
echo "================================="
echo ""

CLUSTER_TYPE="${1:-kind}"  # kind or minikube

# Check prerequisites
if [ "$CLUSTER_TYPE" = "kind" ]; then
    if ! command -v kind &> /dev/null; then
        echo "❌ kind is not installed. Install with: brew install kind"
        exit 1
    fi
elif [ "$CLUSTER_TYPE" = "minikube" ]; then
    if ! command -v minikube &> /dev/null; then
        echo "❌ minikube is not installed. Install with: brew install minikube"
        exit 1
    fi
else
    echo "❌ Invalid cluster type. Use 'kind' or 'minikube'"
    exit 1
fi

# Create cluster
echo "🚀 Creating $CLUSTER_TYPE cluster..."
echo ""

if [ "$CLUSTER_TYPE" = "kind" ]; then
    # Create kind cluster
    cat <<EOF | kind create cluster --name kubechaos --config=-
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
- role: worker
- role: worker
EOF
    
    echo "✅ kind cluster 'kubechaos' created"
else
    # Create minikube cluster
    minikube start --profile kubechaos --nodes 3 --cpus 4 --memory 8192
    echo "✅ minikube cluster 'kubechaos' created"
fi

echo ""
echo "⏳ Waiting for cluster to be ready..."
kubectl wait --for=condition=Ready nodes --all --timeout=300s

echo ""
echo "📦 Creating namespaces..."
kubectl create namespace ecommerce || true
kubectl create namespace monitoring || true

echo ""
echo "🏪 Deploying demo e-commerce application..."

# Deploy demo application
kubectl apply -f - <<EOF
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
  type: ClusterIP
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
  type: ClusterIP
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
  type: ClusterIP
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
  type: LoadBalancer
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
  type: ClusterIP
EOF

echo ""
echo "⏳ Waiting for demo application to be ready..."
kubectl wait --for=condition=Available deployment --all -n ecommerce --timeout=300s

echo ""
echo "📊 Cluster Status:"
kubectl get nodes
echo ""
kubectl get pods -n ecommerce
echo ""

echo "🎉 Demo cluster setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Install Chaos Mesh: ./setup/install-chaos-mesh.sh"
echo "   2. Start backend: cd backend && python3 -m uvicorn main:app --reload"
echo "   3. Start frontend: cd frontend && npm run dev"
echo ""
echo "🎮 Happy chaos engineering!"
