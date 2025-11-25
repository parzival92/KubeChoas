# kubectl Command Reference for KubeChaos

Complete guide to all supported kubectl commands in the KubeChaos e-commerce cluster simulation.

## Table of Contents
- [Resource Listing](#resource-listing)
- [Namespace Operations](#namespace-operations)
- [Investigation Commands](#investigation-commands)
- [Remediation Commands](#remediation-commands)
- [Utility Commands](#utility-commands)

---

## Resource Listing

### Get Pods
```bash
# List pods in default namespace (production)
kubectl get pods

# List pods in specific namespace
kubectl get pods -n production
kubectl get pods -n data

# List all pods across all namespaces
kubectl get pods --all-namespaces
kubectl get pods -A  # Short form

# Expected output (production):
NAME                                    READY   STATUS    RESTARTS   AGE
web-frontend-7d9f8c6b5-abc12           1/1     Running   0          3h
web-frontend-7d9f8c6b5-def34           1/1     Running   0          3h
api-gateway-5c8d9e4f2-jkl78            1/1     Running   0          2h
product-service-9a7b6c5d4-pqr12        1/1     Running   0          2h
cart-service-3e4f5g6h7-vwx56           1/1     Running   0          1h
order-service-8h9i0j1k2-bcd90          1/1     Running   0          1h
```

### Get Services
```bash
# List services
kubectl get services
kubectl get svc  # Short form

# With namespace
kubectl get services -n production
kubectl get services -n data

# All namespaces
kubectl get services --all-namespaces

# Expected output (production):
NAME              TYPE           CLUSTER-IP    EXTERNAL-IP      PORT(S)
web-frontend      LoadBalancer   10.96.1.10    34.123.45.67     80:3000/TCP
api-gateway       ClusterIP      10.96.1.20    <none>           8080:8080/TCP
product-service   ClusterIP      10.96.1.30    <none>           8081:8081/TCP
```

### Get Deployments
```bash
# List deployments
kubectl get deployments
kubectl get deploy  # Short form

# With namespace
kubectl get deployments -n production
kubectl get deployments -n data

# Expected output:
NAME              READY   UP-TO-DATE   AVAILABLE   AGE
web-frontend      3/3     3            3           3h
api-gateway       2/2     2            2           2h
product-service   2/2     2            2           2h
```

### Get All Resources
```bash
# Get pods, services, and deployments
kubectl get all

# With namespace
kubectl get all -n production
kubectl get all -n data
```

---

## Namespace Operations

### List Namespaces
```bash
kubectl get namespaces
kubectl get ns  # Short form

# Expected output:
NAME              STATUS   AGE
production        Active   5h
data              Active   5h
monitoring        Active   5h
ingress-system    Active   5h
```

### Default Namespace
The default namespace for all commands (when `-n` is not specified) is **production**.

---

## Investigation Commands

### View Pod Logs
```bash
# View logs from production namespace (default)
kubectl logs web-frontend-7d9f8c6b5-abc12

# View logs from specific namespace
kubectl logs postgres-primary-0 -n data
kubectl logs redis-cache-6f7g8h9i0-abc12 -n data

# Expected output:
Logs for pod web-frontend-7d9f8c6b5-abc12:
==================================================
[INFO] Next.js server started on port 3000
[INFO] Ready to handle requests
```

### Describe Resources
```bash
# Describe pod
kubectl describe pod web-frontend-7d9f8c6b5-abc12
kubectl describe pod postgres-primary-0 -n data

# Describe service
kubectl describe service api-gateway
kubectl describe service redis-cache -n data

# Describe deployment
kubectl describe deployment product-service
kubectl describe deployment redis-cache -n data

# Expected output includes:
Name:         web-frontend-7d9f8c6b5-abc12
Namespace:    production
Status:       Running
IP:           10.244.0.1
Conditions:
  Type              Status
  Initialized       True
  Ready             True
```

---

## Remediation Commands

### Delete Pod (Restart)
```bash
# Delete pod to trigger restart
kubectl delete pod web-frontend-7d9f8c6b5-abc12
kubectl delete pod cart-service-3e4f5g6h7-vwx56

# With namespace
kubectl delete pod postgres-primary-0 -n data
kubectl delete pod redis-cache-6f7g8h9i0-abc12 -n data

# Note: Pods managed by deployments will automatically restart
```

### Rollout Restart
```bash
# Restart all pods in a deployment
kubectl rollout restart deployment cart-service
kubectl rollout restart deployment product-service

# With namespace
kubectl rollout restart deployment redis-cache -n data

# This triggers a rolling restart of all pods in the deployment
```

### Scale Deployment
```bash
# Scale deployment to specific replica count
kubectl scale deployment api-gateway --replicas=4
kubectl scale deployment product-service --replicas=3

# With namespace
kubectl scale deployment redis-cache --replicas=3 -n data
```

---

## Utility Commands

### Help
```bash
help

# Shows available commands:
Available commands:
  kubectl get [pods|services|deployments|namespaces|all]
  kubectl logs <pod-name> [-n namespace]
  kubectl describe <resource> <name> [-n namespace]
  kubectl delete pod <name> [-n namespace]
  kubectl rollout restart deployment <name> [-n namespace]
  kubectl scale deployment <name> --replicas=N [-n namespace]
  
  Utility commands:
  help, clear, date, whoami, pwd, ls, ps
```

### Clear Terminal
```bash
clear

# Clears all terminal output
```

### Unix Utilities
```bash
date      # Show current timestamp
whoami    # Show current user (kubechaos-user)
pwd       # Show current directory
ls        # List files
ps        # Show processes
```

---

## Common Troubleshooting Workflows

### Scenario 1: API Gateway Overload
```bash
# 1. Check pod status
kubectl get pods -n production

# 2. Identify high CPU pod
kubectl describe pod api-gateway-5c8d9e4f2-jkl78

# 3. Check logs
kubectl logs api-gateway-5c8d9e4f2-jkl78

# 4. Scale up to handle load
kubectl scale deployment api-gateway --replicas=4
```

### Scenario 2: Cart Service Memory Leak
```bash
# 1. Check pod status
kubectl get pods

# 2. View logs for OOM errors
kubectl logs cart-service-3e4f5g6h7-vwx56

# 3. Restart the deployment
kubectl rollout restart deployment cart-service
```

### Scenario 3: Database Connection Exhausted
```bash
# 1. Check data namespace pods
kubectl get pods -n data

# 2. Check postgres logs
kubectl logs postgres-primary-0 -n data

# 3. Describe for detailed status
kubectl describe pod postgres-primary-0 -n data

# 4. Restart if needed
kubectl delete pod postgres-primary-0 -n data
```

### Scenario 4: Redis Cache Issues
```bash
# 1. Check cache pods
kubectl get pods -n data

# 2. View redis logs
kubectl logs redis-cache-6f7g8h9i0-abc12 -n data

# 3. Scale if needed
kubectl scale deployment redis-cache --replicas=3 -n data
```

---

## Tips & Best Practices

### Namespace Awareness
- Always specify `-n` when working with non-production resources
- Use `--all-namespaces` to get a cluster-wide view
- Remember: production is the default namespace

### Efficient Troubleshooting
1. Start with `kubectl get pods` to identify failing pods
2. Use `kubectl logs` to check for errors
3. Use `kubectl describe` for detailed status
4. Apply remediation (delete, rollout, scale)

### Command Shortcuts
- `kubectl get pods -A` instead of `--all-namespaces`
- `kubectl get svc` instead of `services`
- `kubectl get deploy` instead of `deployments`
- `kubectl get ns` instead of `namespaces`

### Monitoring
- Regularly check `kubectl get all` for overview
- Monitor active chaos events in dashboard
- Track MTTR for scoring optimization

---

## Error Messages

### Common Errors

**Pod not found:**
```
Error: Pod "web-frontend-xxx" not found in namespace production
```
Solution: Check namespace or verify pod name

**Namespace not specified:**
```
Error: Pod "postgres-primary-0" not found
```
Solution: Add `-n data` flag

**Invalid resource type:**
```
Error: Unknown resource type: pod
```
Solution: Use correct resource name (pods, not pod)

---

## Quick Reference Card

| Command | Description |
|---------|-------------|
| `kubectl get pods` | List production pods |
| `kubectl get pods -n data` | List data namespace pods |
| `kubectl get pods -A` | List all pods |
| `kubectl logs <pod>` | View pod logs |
| `kubectl describe pod <name>` | Detailed pod info |
| `kubectl delete pod <name>` | Restart pod |
| `kubectl rollout restart deployment <name>` | Restart deployment |
| `kubectl scale deployment <name> --replicas=N` | Scale deployment |
| `kubectl get namespaces` | List namespaces |
| `help` | Show all commands |
| `clear` | Clear terminal |

---

**Master these commands to become a KubeChaos champion! 🏆**
