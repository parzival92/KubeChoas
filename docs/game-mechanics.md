# KubeChaos Game Mechanics

Learn how KubeChaos scoring, progression, and gameplay work.

## Game Modes

### 🎓 Tutorial Mode (Simulation)
- No Kubernetes cluster required
- Simulated chaos events
- Learn kubectl commands safely
- Perfect for beginners

### 🎮 Real Mode (Chaos Mesh)
- Requires local Kubernetes cluster
- Real chaos experiments via Chaos Mesh
- Actual cluster impact
- True incident response training

## Scoring System

### Primary Metrics

#### MTTR (Mean Time To Resolution)
- **What**: Time from chaos start to resolution
- **Target**: < 2 minutes for beginner scenarios
- **Impact**: Primary score multiplier

#### Command Efficiency
- **What**: Number of commands used
- **Target**: Minimal commands to diagnose and fix
- **Impact**: Bonus points for efficiency

#### Blast Radius
- **What**: Number of affected resources
- **Target**: Minimize impact during resolution
- **Impact**: Penalty for unnecessary disruption

### Score Calculation

```
Base Score = 1000 points per scenario

Time Multiplier:
- < 1 min:  2.0x
- < 2 min:  1.5x
- < 3 min:  1.0x
- < 5 min:  0.5x
- > 5 min:  0.25x

Command Efficiency Bonus:
- Optimal commands: +500 points
- Good (< 10):      +250 points
- Average (< 20):   +100 points
- Many (> 20):      -100 points

Final Score = Base Score × Time Multiplier + Efficiency Bonus
```

## Progression System

### Difficulty Levels

#### 🟢 Beginner
- **Focus**: Basic kubectl commands
- **Scenarios**: Single failure types
- **Time Limit**: 5 minutes
- **Hints**: Detailed step-by-step

**Example Scenarios:**
- Pod Termination 101
- Network Delay Investigation
- CPU Spike Response

#### 🟡 Intermediate
- **Focus**: Multi-step diagnosis
- **Scenarios**: Combined failures
- **Time Limit**: 10 minutes
- **Hints**: General guidance

**Example Scenarios:**
- Persistent Pod Failures
- Memory Leak Mitigation
- Disk I/O Slowdown

#### 🟠 Advanced
- **Focus**: Complex troubleshooting
- **Scenarios**: Cascading failures
- **Time Limit**: 15 minutes
- **Hints**: Minimal

**Example Scenarios:**
- Network Partition Recovery
- Multi-Service Degradation
- Resource Exhaustion

#### 🔴 Expert
- **Focus**: Production-like incidents
- **Scenarios**: Real-world chaos
- **Time Limit**: 20 minutes
- **Hints**: None

**Example Scenarios:**
- Cascade Failure Recovery
- Zero-Downtime Migration
- Disaster Recovery Drill

### Unlocking Scenarios

- Complete 3 beginner scenarios → Unlock intermediate
- Complete 3 intermediate scenarios → Unlock advanced
- Complete 3 advanced scenarios → Unlock expert
- Achieve 80%+ score → Unlock bonus scenarios

## Gameplay Flow

### 1. Scenario Selection

```
┌─────────────────────────────┐
│  Choose Your Challenge      │
├─────────────────────────────┤
│  🟢 Pod Termination 101     │
│     Difficulty: Beginner    │
│     Time: 3 min             │
│     Score: 500 pts          │
│                             │
│  [Start Scenario]           │
└─────────────────────────────┘
```

### 2. Chaos Injection

- Scenario starts automatically
- Real chaos experiment created in cluster
- Timer begins
- Objectives displayed

### 3. Investigation Phase

**Available Tools:**
- Terminal with kubectl commands
- Cluster resource viewer
- Pod logs viewer
- Metrics dashboard

**Common Commands:**
```bash
kubectl get pods -n ecommerce
kubectl describe pod <name> -n ecommerce
kubectl logs <pod-name> -n ecommerce
kubectl get events -n ecommerce
```

### 4. Resolution Phase

**Actions:**
- Scale deployments
- Restart pods
- Update configurations
- Apply fixes

**Verification:**
- All pods running
- Services responding
- No errors in logs
- Metrics normalized

### 5. Completion & Review

```
┌─────────────────────────────┐
│  Scenario Complete! 🎉      │
├─────────────────────────────┤
│  MTTR: 1m 45s              │
│  Commands Used: 7           │
│  Score: 1,750 pts          │
│                             │
│  ⭐⭐⭐ (3/3 stars)         │
│                             │
│  What You Learned:          │
│  • Pod restart policies     │
│  • Deployment scaling       │
│  • Log analysis             │
└─────────────────────────────┘
```

## Achievements

### 🏆 Badges

- **First Blood** - Complete first scenario
- **Speed Demon** - MTTR < 1 minute
- **Efficiency Expert** - Resolve with < 5 commands
- **Detective** - Find root cause without hints
- **Surgeon** - Zero blast radius resolution
- **Chaos Master** - Complete all scenarios
- **Perfect Run** - 100% score on any scenario
- **Marathon Runner** - Complete 10 scenarios in one session

### 📊 Leaderboard

Track your progress:
- Total scenarios completed
- Average MTTR
- Best scores per scenario
- Overall rank

## Learning Objectives

### Beginner Scenarios

✅ kubectl basic commands  
✅ Pod lifecycle understanding  
✅ Service discovery  
✅ Log analysis  
✅ Resource status checking

### Intermediate Scenarios

✅ Deployment management  
✅ Resource scaling  
✅ Network troubleshooting  
✅ Performance analysis  
✅ Configuration debugging

### Advanced Scenarios

✅ Multi-service dependencies  
✅ Circuit breaker patterns  
✅ Graceful degradation  
✅ Incident prioritization  
✅ Root cause analysis

### Expert Scenarios

✅ Production incident response  
✅ Disaster recovery  
✅ Zero-downtime operations  
✅ Chaos engineering principles  
✅ SRE best practices

## Tips for Success

### 🎯 Strategy

1. **Read the Scenario** - Understand objectives first
2. **Check Overall Status** - `kubectl get all -n ecommerce`
3. **Identify Failures** - Look for non-Running pods
4. **Investigate Logs** - Check pod logs for errors
5. **Apply Fix** - Scale, restart, or reconfigure
6. **Verify** - Ensure all services healthy

### ⚡ Speed Tips

- Use tab completion in terminal
- Learn common kubectl shortcuts
- Memorize key commands
- Use labels for filtering
- Watch mode for real-time updates

### 🧠 Learning Tips

- Try without hints first
- Review your command history
- Compare with optimal solution
- Practice in tutorial mode
- Replay scenarios to improve

## Chaos Types Reference

### PodChaos
- `pod-kill` - Terminate pods
- `pod-failure` - Simulate failures
- `container-kill` - Kill containers

### NetworkChaos
- `delay` - Add latency
- `loss` - Packet loss
- `partition` - Network split

### StressChaos
- `cpu` - CPU pressure
- `memory` - Memory exhaustion

### IOChaos
- `latency` - Disk I/O delays
- `fault` - I/O errors

## Next Steps

1. 🎮 **Start Playing** - Choose your first scenario
2. 📚 **Learn kubectl** - Master the commands
3. 🏆 **Earn Achievements** - Complete challenges
4. 🎓 **Level Up** - Progress to harder scenarios
5. 🌟 **Master Chaos** - Become an SRE expert!
