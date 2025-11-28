# KubeChaos Scenarios

This directory contains pre-defined Chaos Mesh experiment templates for KubeChaos game scenarios.

## Available Scenarios

### Level 1: Pod Chaos Basics
- **pod-kill-basic.yaml** - Kill random pods to test resilience

### Level 2: Network Chaos
- **network-delay-basic.yaml** - Add network latency to services

### Level 3: Resource Stress
- **cpu-stress-basic.yaml** - CPU pressure testing

## Usage

### Apply a scenario manually:
```bash
kubectl apply -f scenarios/pod-kill-basic.yaml
```

### Monitor the chaos experiment:
```bash
kubectl get podchaos -n ecommerce
kubectl describe podchaos game-pod-kill-basic -n ecommerce
```

### Delete the experiment:
```bash
kubectl delete -f scenarios/pod-kill-basic.yaml
```

## Game Integration

These scenarios are automatically loaded by the KubeChaos game backend. When you start a scenario through the game UI, the backend creates these experiments dynamically using the Chaos Mesh API.

## Creating Custom Scenarios

You can create your own scenarios by copying and modifying these templates. See the [Chaos Mesh documentation](https://chaos-mesh.org/docs/) for all available chaos types and options.
