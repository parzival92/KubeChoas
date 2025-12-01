# KubeChaos Environment Limitations

This document outlines the known limitations when running KubeChaos with Kind (Kubernetes in Docker) and Containerd runtime.

## Issue Summary

Chaos Mesh v2.6.3 has a runtime detection bug that prevents it from working correctly with Kind's Containerd runtime. The daemon ignores the `RUNTIME` environment variable and defaults to Docker detection, causing chaos injection failures.

## Scenario Compatibility

| Scenario Type | Status | Notes |
|:---|:---:|:---|
| **PodChaos** (pod-kill, pod-failure) | ✅ **Working** | Uses standard Kubernetes API |
| **NetworkChaos** (delay, partition, loss) | ❌ **Not Working** | Requires `ipset` kernel modules |
| **StressChaos** (CPU, Memory) | ❌ **Not Working** | Runtime detection bug |
| **IOChaos** (latency, fault) | ❌ **Not Working** | Runtime detection bug |

## Error Messages

### StressChaos & IOChaos
```
rpc error: code = Unknown desc = expected docker:// but got container
```
**Cause:** Chaos Mesh expects Docker runtime format but receives Containerd format.

### NetworkChaos
```
unable to flush ip sets for pod <pod-name>
```
**Cause:** Missing `ipset` kernel modules or insufficient privileges in Kind nodes.

## Working Scenarios

The following scenarios work perfectly in the current Kind setup:

1. **Pod Termination 101** (`pod-kill-basic`)
   - Kills pods to test Kubernetes self-healing
   - Uses `pod-kill` action

2. **Persistent Pod Failures** (`pod-failure-intermediate`)
   - Makes pods unavailable for a duration
   - Uses `pod-failure` action

## Solutions for Full Compatibility

### Option 1: Minikube (Recommended for Local Development)

```bash
# Install Minikube
brew install minikube

# Start cluster
minikube start --driver=docker --cpus=4 --memory=8192

# Install Chaos Mesh
curl -sSL https://mirrors.chaos-mesh.org/latest/install.sh | bash

# Deploy application
kubectl apply -f setup/ecommerce-cluster.yaml
```

### Option 2: Cloud Kubernetes Cluster (Production-Ready)

**Google Kubernetes Engine (GKE):**
```bash
gcloud container clusters create kubechaos \
  --num-nodes=3 \
  --machine-type=n1-standard-2 \
  --zone=us-central1-a
```

**AWS EKS or Azure AKS** also provide full compatibility.

### Option 3: Accept Limitations (Current Setup)

Continue using Kind with only `PodChaos` scenarios. This is sufficient for:
- Learning basic chaos engineering concepts
- Testing pod restart policies
- Demonstrating Kubernetes self-healing
- Development and testing of the KubeChaos platform itself

## Technical Details

### What We Attempted

1. Patched `chaos-daemon` DaemonSet with:
   - `RUNTIME=containerd`
   - `SOCKET_PATH=/run/containerd/containerd.sock`
   - Volume mount for containerd socket

2. Verified configuration:
   - Environment variables set correctly ✅
   - Socket exists at `/run/containerd/containerd.sock` ✅
   - Daemon pods restarted successfully ✅

3. Result:
   - Chaos Mesh daemon logs still show `"runtime": "docker"` ❌
   - Hardcoded detection logic ignores environment variables ❌

### Why It Doesn't Work

Chaos Mesh v2.6.3 has hardcoded runtime detection that:
1. Checks for Docker socket first
2. Falls back to Docker format assumptions
3. Ignores `RUNTIME` environment variable in Kind environments
4. Cannot properly parse Containerd container IDs

This is a known issue in the Chaos Mesh project when running in Kind clusters.

## Recommendations

- **For Learning**: Current Kind setup is sufficient with `PodChaos` scenarios
- **For Development**: Switch to Minikube for full scenario testing
- **For Production**: Use a cloud Kubernetes cluster

## References

- [Chaos Mesh GitHub Issues](https://github.com/chaos-mesh/chaos-mesh/issues)
- [Kind Documentation](https://kind.sigs.k8s.io/)
- [Minikube Documentation](https://minikube.sigs.k8s.io/)
