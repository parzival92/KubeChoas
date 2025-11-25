# E-Commerce Microservices Implementation Walkthrough

## Overview

Successfully transformed KubeChaos from a simple 2-pod cluster to a realistic e-commerce microservices architecture with 18 pods across multiple namespaces, complete with namespace filtering, enhanced chaos events, and improved UI.

---

## Phase 1: E-Commerce Cluster Setup ✅

### Changes Made

#### Updated Cluster Architecture
Replaced the simple nginx/redis cluster with a realistic e-commerce microservices setup:

**Production Namespace** (11 pods):
- 3x `web-frontend` - Next.js frontend application
- 2x `api-gateway` - API routing and load balancing
- 2x `product-service` - Product catalog management
- 2x `cart-service` - Shopping cart operations
- 2x `order-service` - Order processing

**Data Namespace** (7 pods):
- 1x `postgres-primary-0` - Primary database (StatefulSet)
- 1x `postgres-replica-0` - Read replica (StatefulSet)
- 2x `redis-cache` - Caching layer
- 3x `rabbitmq` - Message queue cluster

#### Files Modified
- [`gameStore.ts`](file:///Users/parzival/Documents/Developer/KubeChoas/src/store/gameStore.ts) - Added 18 pods, 9 services, 6 deployments with realistic configurations

### Key Features
- Realistic service dependencies (frontend → API → services → database)
- Proper resource allocation (CPU, memory)
- Authentic log messages
- StatefulSets for databases
- Multi-replica deployments for high availability

---

## Phase 2: Namespace Support ✅

### Changes Made

#### Command Executor Updates
Enhanced all kubectl commands to support namespace filtering:

**New Flags:**
- `-n <namespace>` / `--namespace <namespace>` - Filter by specific namespace
- `--all-namespaces` / `-A` - Show resources across all namespaces
- Default namespace: `production` (changed from `default`)

**Updated Commands:**
```bash
kubectl get pods                    # Shows production namespace
kubectl get pods -n data            # Shows data namespace
kubectl get pods --all-namespaces   # Shows all with NAMESPACE column
kubectl get namespaces              # Lists: production, data, monitoring, ingress-system
kubectl logs <pod> -n <namespace>   # Namespace-aware logs
kubectl describe <resource> -n <ns> # Namespace-aware describe
kubectl delete <resource> -n <ns>   # Namespace-aware delete
```

#### Files Modified
- [`commandExecutor.ts`](file:///Users/parzival/Documents/Developer/KubeChoas/src/utils/commandExecutor.ts#L57-L111) - Updated all kubectl handlers with namespace support

### Implementation Details
- Namespace parsing logic in `handleKubectlCommand`
- Filtered resource lookups in all subcommands
- NAMESPACE column added to `--all-namespaces` output
- Cross-namespace resource filtering

---

## Phase 3: Enhanced Chaos Events ✅

### Changes Made

#### New Event Types
Added 10 e-commerce specific chaos scenarios:

1. **API Gateway Overload** (Critical)
   - High CPU/memory from traffic spike
   - Connection pool exhausted
   - Response time degradation

2. **Frontend Pod Crash** (High)
   - JavaScript heap out of memory
   - Process exit code 137

3. **Cart Service OOM** (Critical)
   - Memory leak detected
   - Redis connection timeout
   - Session data allocation failure

4. **Product Service High CPU** (Medium)
   - Slow database queries (8000ms)
   - CPU throttling
   - Request timeouts

5. **Database Connection Exhausted** (Critical)
   - PostgreSQL connection pool at 100/100
   - "Too many clients" error
   - Reserved connection slots full

6. **Redis Cache Eviction** (High)
   - Memory usage above 90%
   - High eviction rate
   - Cache miss rate at 85%

7. **RabbitMQ Queue Full** (High)
   - Order queue at max length
   - Rejecting new messages
   - Consumer lag at 10000 messages

8. **DNS Failure** (Critical)
   - Cross-namespace resolution issues

9. **Service Down** (High)
   - Order service unresponsive

10. **Deployment Failed** (Critical)
    - Product service rollout failure

#### Files Modified
- [`gameStore.ts`](file:///Users/parzival/Documents/Developer/KubeChoas/src/store/gameStore.ts#L40-L45) - Extended ChaosEvent type
- [`chaosEngine.ts`](file:///Users/parzival/Documents/Developer/KubeChoas/src/utils/chaosEngine.ts#L15-L145) - Added 10 new chaos event templates

### Realistic Failure Scenarios
- Authentic error messages from real systems
- Service-specific failure modes
- Resource exhaustion patterns
- Cross-service dependencies

---

## Phase 4: UI Enhancements ✅

### Changes Made

#### Namespace Filter Dropdown
Added a filter dropdown in the dashboard header:
- Shows all available namespaces
- "All Namespaces" option to view everything
- Real-time filtering of pods, services, and deployments

#### Namespace Badges
Added color-coded namespace badges to all resources:
- **Production**: Blue (`bg-blue-500/20`)
- **Data**: Purple (`bg-purple-500/20`)
- **Monitoring**: Green (`bg-green-500/20`)
- **Ingress-system**: Orange (`bg-orange-500/20`)

#### Files Modified
- [`ClusterDashboard.tsx`](file:///Users/parzival/Documents/Developer/KubeChoas/src/components/ClusterDashboard.tsx) - Added namespace filter and badges

### UI Improvements
- Namespace filter dropdown with icon
- Color-coded badges for visual organization
- Filtered resource counts
- Improved resource card layout

---

## Testing & Verification

### Manual Testing Commands

```bash
# Test namespace filtering
kubectl get namespaces
kubectl get pods
kubectl get pods -n data
kubectl get pods --all-namespaces

# Test services
kubectl get services -n production
kubectl get services -n data

# Test logs
kubectl logs web-frontend-7d9f8c6b5-abc12
kubectl logs postgres-primary-0 -n data

# Test describe
kubectl describe pod api-gateway-5c8d9e4f2-jkl78
kubectl describe service redis-cache -n data

# Start game and observe chaos events
```

### Expected Behavior
1. **Namespace Filtering**: Commands correctly filter by namespace
2. **Default Namespace**: Commands default to `production` when no `-n` flag
3. **All Namespaces**: `--all-namespaces` shows NAMESPACE column
4. **UI Filter**: Dashboard filter updates resource lists in real-time
5. **Namespace Badges**: All resources show colored namespace badges
6. **Chaos Events**: Realistic e-commerce failures appear during gameplay

---

## Phase 5: Testing & Verification ✅

### Changes Made

#### Updated Playwright Tests
Added 7 new end-to-end tests for e-commerce cluster features:

1. **Namespace Listing** - Tests `kubectl get namespaces` command
2. **Namespace Filtering** - Tests `-n` flag with production and data namespaces
3. **All Namespaces Flag** - Tests `--all-namespaces` shows NAMESPACE column
4. **E-Commerce Pods** - Verifies new service names in dashboard
5. **Namespace Filter Dropdown** - Tests UI filter component
6. **Dashboard Filtering** - Tests real-time resource filtering
7. **Namespace Badges** - Verifies colored badges on resources

#### Files Modified
- [`game-flow.spec.ts`](file:///Users/parzival/Documents/Developer/KubeChoas/tests/game-flow.spec.ts) - Added 7 new tests

### Test Results
```
Running 39 tests using 5 workers
  39 passed (19.0s)
```

**Test Coverage:**
- ✅ Homepage loading and title
- ✅ Game start/stop functionality
- ✅ Terminal command execution
- ✅ Dashboard resource display
- ✅ Namespace listing and filtering
- ✅ Cross-namespace operations
- ✅ UI namespace filter
- ✅ Namespace badges

### Key Improvements
- Fixed option element visibility issues
- Used `toContainText` for more reliable text matching
- Added proper wait times for async operations
- Improved selector specificity

---

## Summary Statistics

### Cluster Growth
- **Before**: 2 pods, 2 services, 2 deployments (1 namespace)
- **After**: 18 pods, 9 services, 6 deployments (4 namespaces)
- **Growth**: 9x more resources, 4x more namespaces

### Code Changes
- **Files Modified**: 3 core files
- **Lines Added**: ~500 lines
- **New Features**: 4 major phases
- **Chaos Events**: 10 new scenarios

### Feature Additions
- ✅ Multi-namespace architecture
- ✅ Namespace filtering (`-n`, `--all-namespaces`)
- ✅ E-commerce microservices (18 pods)
- ✅ Realistic chaos events (10 types)
- ✅ UI namespace filter dropdown
- ✅ Color-coded namespace badges
- ✅ Cross-namespace service discovery

---

## Next Steps (Optional)

### Phase 5: Testing
- Update Playwright tests for new cluster
- Test namespace filtering
- Verify chaos scenarios

### Phase 6: Advanced Features
- Service dependency graph visualization
- Resource usage charts per namespace
- Multi-region deployments
- Auto-scaling scenarios

---

## Conclusion

Successfully transformed KubeChaos into a realistic e-commerce chaos engineering simulator with:
- Production-grade microservices architecture
- Multi-namespace support with filtering
- Realistic failure scenarios
- Enhanced UI with namespace organization

The game now provides a much more authentic Kubernetes troubleshooting experience with real-world e-commerce failure patterns.
