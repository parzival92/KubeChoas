import { Pod, Service, Deployment, ChaosEvent } from '@/store/gameStore';

interface ClusterState {
  pods: Pod[];
  services: Service[];
  deployments: Deployment[];
  activeEvents: ChaosEvent[];
}

interface GameActions {
  resolveChaosEvent: (eventId: string) => void;
  updatePod: (podId: string, updates: Partial<Pod>) => void;
  updateService: (serviceId: string, updates: Partial<Service>) => void;
  updateDeployment: (deploymentId: string, updates: Partial<Deployment>) => void;
  setPods: (pods: Pod[]) => void;
  setServices: (services: Service[]) => void;
  setDeployments: (deployments: Deployment[]) => void;
}

export async function executeCommand(
  command: string,
  clusterState: ClusterState,
  actions: GameActions
): Promise<string> {
  const trimmedCommand = command.trim();

  if (!trimmedCommand) {
    return '';
  }

  // Parse kubectl commands
  if (trimmedCommand.startsWith('kubectl')) {
    return handleKubectlCommand(trimmedCommand, clusterState, actions);
  }

  // Handle other commands
  switch (trimmedCommand.toLowerCase()) {
    case 'help':
      return getHelpText();
    case 'clear':
      return 'Terminal cleared';
    case 'date':
      return new Date().toISOString();
    case 'whoami':
      return 'kubechaos-user';
    case 'pwd':
      return '/home/kubechaos-user';
    case 'ls':
      return 'cluster-state.json  logs/  config/';
    case 'ps':
      return 'PID TTY          TIME CMD\n1234 pts/0    00:00:00 bash\n5678 pts/0    00:00:00 kubectl';
    default:
      throw new Error(`Command not found: ${trimmedCommand}`);
  }
}


function handleKubectlCommand(command: string, clusterState: ClusterState, actions: GameActions): string {
  const parts = command.split(' ');

  if (parts.length < 2) {
    return 'Error: kubectl command requires arguments';
  }

  const subcommand = parts[1];
  const resource = parts[2];

  // Parse namespace flags
  let namespace: string | null = null;
  let allNamespaces = false;

  // Check for --all-namespaces or -A
  if (parts.includes('--all-namespaces') || parts.includes('-A')) {
    allNamespaces = true;
  } else {
    // Check for -n or --namespace
    const nIndex = parts.indexOf('-n');
    const namespaceIndex = parts.indexOf('--namespace');

    if (nIndex !== -1 && parts[nIndex + 1]) {
      namespace = parts[nIndex + 1];
    } else if (namespaceIndex !== -1 && parts[namespaceIndex + 1]) {
      namespace = parts[namespaceIndex + 1];
    } else {
      // Default to production namespace if not specified
      namespace = 'production';
    }
  }

  switch (subcommand) {
    case 'get':
      return handleKubectlGet(resource, namespace, allNamespaces, clusterState);
    case 'logs':
      return handleKubectlLogs(parts, namespace, clusterState);
    case 'describe':
      return handleKubectlDescribe(parts, namespace, clusterState);
    case 'exec':
      return handleKubectlExec(parts, clusterState);
    case 'port-forward':
      return handleKubectlPortForward(parts, clusterState);
    case 'apply':
      return handleKubectlApply(parts, clusterState, actions);
    case 'delete':
      return handleKubectlDelete(parts, namespace, clusterState, actions);
    case 'scale':
      return handleKubectlScale(parts, namespace, clusterState, actions);
    case 'rollout':
      return handleKubectlRollout(parts, namespace, clusterState, actions);
    default:
      throw new Error(`Unknown kubectl subcommand: ${subcommand}`);
  }
}

function handleKubectlGet(resource: string, namespace: string | null, allNamespaces: boolean, clusterState: ClusterState): string {
  let output = '';

  switch (resource) {
    case 'pods':
    case 'pod':
      // Filter pods by namespace
      const filteredPods = allNamespaces
        ? clusterState.pods
        : clusterState.pods.filter(pod => pod.namespace === namespace);

      if (allNamespaces) {
        output = 'NAMESPACE'.padEnd(15) + 'NAME'.padEnd(35) + 'READY'.padEnd(8) + 'STATUS'.padEnd(12) + 'RESTARTS'.padEnd(10) + 'AGE' + '\n';
        filteredPods.forEach(pod => {
          output += pod.namespace.padEnd(15) + pod.name.padEnd(35) + pod.ready.padEnd(8) + pod.status.padEnd(12) + String(pod.restarts).padEnd(10) + pod.age + '\n';
        });
      } else {
        output = 'NAME'.padEnd(35) + 'READY'.padEnd(8) + 'STATUS'.padEnd(12) + 'RESTARTS'.padEnd(10) + 'AGE' + '\n';
        filteredPods.forEach(pod => {
          output += pod.name.padEnd(35) + pod.ready.padEnd(8) + pod.status.padEnd(12) + String(pod.restarts).padEnd(10) + pod.age + '\n';
        });
      }
      break;

    case 'services':
    case 'service':
    case 'svc':
      // Filter services by namespace
      const filteredServices = allNamespaces
        ? clusterState.services
        : clusterState.services.filter(svc => svc.namespace === namespace);

      if (allNamespaces) {
        output = 'NAMESPACE'.padEnd(15) + 'NAME'.padEnd(18) + 'TYPE'.padEnd(12) + 'CLUSTER-IP'.padEnd(16) + 'EXTERNAL-IP'.padEnd(14) + 'PORT(S)'.padEnd(12) + 'AGE' + '\n';
        filteredServices.forEach(svc => {
          output += svc.namespace.padEnd(15) + svc.name.padEnd(18) + svc.type.padEnd(12) + svc.clusterIp.padEnd(16) + svc.externalIp.padEnd(14) + svc.ports.padEnd(12) + svc.age + '\n';
        });
      } else {
        output = 'NAME'.padEnd(18) + 'TYPE'.padEnd(12) + 'CLUSTER-IP'.padEnd(16) + 'EXTERNAL-IP'.padEnd(14) + 'PORT(S)'.padEnd(12) + 'AGE' + '\n';
        filteredServices.forEach(svc => {
          output += svc.name.padEnd(18) + svc.type.padEnd(12) + svc.clusterIp.padEnd(16) + svc.externalIp.padEnd(14) + svc.ports.padEnd(12) + svc.age + '\n';
        });
      }
      break;

    case 'deployments':
    case 'deployment':
    case 'deploy':
      // Filter deployments by namespace
      const filteredDeployments = allNamespaces
        ? clusterState.deployments
        : clusterState.deployments.filter(deploy => deploy.namespace === namespace);

      if (allNamespaces) {
        output = 'NAMESPACE'.padEnd(15) + 'NAME'.padEnd(22) + 'READY'.padEnd(10) + 'UP-TO-DATE'.padEnd(12) + 'AVAILABLE'.padEnd(12) + 'AGE' + '\n';
        filteredDeployments.forEach(deploy => {
          output += deploy.namespace.padEnd(15) + deploy.name.padEnd(22) + deploy.ready.padEnd(10) + String(deploy.upToDate).padEnd(12) + String(deploy.available).padEnd(12) + deploy.age + '\n';
        });
      } else {
        output = 'NAME'.padEnd(22) + 'READY'.padEnd(10) + 'UP-TO-DATE'.padEnd(12) + 'AVAILABLE'.padEnd(12) + 'AGE' + '\n';
        filteredDeployments.forEach(deploy => {
          output += deploy.name.padEnd(22) + deploy.ready.padEnd(10) + String(deploy.upToDate).padEnd(12) + String(deploy.available).padEnd(12) + deploy.age + '\n';
        });
      }
      break;

    case 'nodes':
      output = 'NAME'.padEnd(12) + 'STATUS'.padEnd(10) + 'ROLES'.padEnd(18) + 'AGE'.padEnd(6) + 'VERSION' + '\n';
      output += 'node-1'.padEnd(12) + 'Ready'.padEnd(10) + 'control-plane'.padEnd(18) + '2d'.padEnd(6) + 'v1.28.0' + '\n';
      output += 'node-2'.padEnd(12) + 'Ready'.padEnd(10) + '<none>'.padEnd(18) + '2d'.padEnd(6) + 'v1.28.0' + '\n';
      break;

    case 'namespaces':
    case 'namespace':
    case 'ns':
      output = 'NAME'.padEnd(20) + 'STATUS'.padEnd(10) + 'AGE' + '\n';
      output += 'production'.padEnd(20) + 'Active'.padEnd(10) + '5h' + '\n';
      output += 'data'.padEnd(20) + 'Active'.padEnd(10) + '5h' + '\n';
      output += 'monitoring'.padEnd(20) + 'Active'.padEnd(10) + '5h' + '\n';
      output += 'ingress-system'.padEnd(20) + 'Active'.padEnd(10) + '5h' + '\n';
      break;

    case 'all':
      output = handleKubectlGet('pods', namespace, allNamespaces, clusterState);
      output += '\n';
      output += handleKubectlGet('services', namespace, allNamespaces, clusterState);
      output += '\n';
      output += handleKubectlGet('deployments', namespace, allNamespaces, clusterState);
      break;

    default:
      throw new Error(`Unknown resource type: ${resource}`);
  }

  return output;
}

function handleKubectlLogs(parts: string[], namespace: string | null, clusterState: ClusterState): string {
  if (parts.length < 3) {
    return 'Error: kubectl logs requires a pod name';
  }

  const podName = parts[2];
  if (!podName) {
    return 'Error: Pod name is required';
  }

  // Filter by namespace if specified
  const pod = namespace
    ? clusterState.pods.find(p => p.name.includes(podName) && p.namespace === namespace)
    : clusterState.pods.find(p => p.name.includes(podName));

  if (!pod) {
    throw new Error(`Pod "${podName}" not found${namespace ? ` in namespace ${namespace}` : ''}`);
  }

  let output = `Logs for pod ${pod.name}:\n`;
  output += '==================================================\n';

  if (pod.logs && pod.logs.length > 0) {
    pod.logs.forEach(log => {
      output += `${log}\n`;
    });
  } else {
    output += 'No logs available\n';
  }

  return output;
}

function handleKubectlDescribe(parts: string[], namespace: string | null, clusterState: ClusterState): string {
  if (parts.length < 3) {
    return 'Error: kubectl describe requires a resource name';
  }

  const resourceName = parts[2];
  const resourceType = parts[1] || 'pod';

  // Find the actual resource to get real status
  let resource: any;
  if (resourceType.includes('pod')) {
    resource = namespace
      ? clusterState.pods.find(p => p.name.includes(resourceName) && p.namespace === namespace)
      : clusterState.pods.find(p => p.name.includes(resourceName));
  } else if (resourceType.includes('service')) {
    resource = namespace
      ? clusterState.services.find(s => s.name.includes(resourceName) && s.namespace === namespace)
      : clusterState.services.find(s => s.name.includes(resourceName));
  } else if (resourceType.includes('deploy')) {
    resource = namespace
      ? clusterState.deployments.find(d => d.name.includes(resourceName) && d.namespace === namespace)
      : clusterState.deployments.find(d => d.name.includes(resourceName));
  }

  if (!resource) {
    // Fallback for simulation if exact match fails but name is close
    // or just return error
    // For now, let's keep the mock output but update status if found
  }

  const status = resource ? (resource.status || 'Running') : 'Running';

  let output = '';
  output += '##HEADER##Name:         **' + resourceName + '**\n';
  output += 'Namespace:    ' + (resource?.namespace || namespace || 'production') + '\n';
  output += 'Priority:     0\n';
  output += 'Node:         node-1/10.0.0.1\n';
  output += 'Start Time:   Mon, 01 Jan 2024 10:00:00 +0000\n';
  output += 'Labels:       app=' + resourceName + '\n';
  output += 'Annotations:  <none>\n';
  output += 'Status:       **' + status + '**\n';
  output += 'IP:           10.244.0.1\n';
  output += '\n';
  output += '##HEADER##Conditions:\n';
  output += '  Type              Status\n';
  output += '  Initialized       True\n';
  output += '  Ready             True\n';
  output += '  ContainersReady   True\n';
  output += '  PodScheduled      True\n';
  return output;
}

function handleKubectlExec(parts: string[], clusterState: ClusterState): string {
  return 'Interactive shell not available in simulation mode.\nUse "kubectl logs" to view container logs.';
}

function handleKubectlPortForward(parts: string[], clusterState: ClusterState): string {
  return 'Port forwarding not available in simulation mode.';
}

function handleKubectlApply(parts: string[], clusterState: ClusterState, actions: GameActions): string {
  // Check if applying a fix for service
  // In this simple game, apply usually fixes services or deployments
  // We can assume apply -f <file> works if the file matches a resource

  // Auto-resolve service issues if apply is used
  const serviceEvent = clusterState.activeEvents.find(e => e.type === 'service-down' || e.type === 'dns-failure');
  if (serviceEvent) {
    actions.resolveChaosEvent(serviceEvent.id);
    return 'Resource applied successfully. Service recovered.';
  }

  return 'Resource applied successfully.';
}

function handleKubectlDelete(parts: string[], namespace: string | null, clusterState: ClusterState, actions: GameActions): string {
  if (parts.length < 3) {
    return 'Error: kubectl delete requires a resource type and name';
  }

  const resourceType = parts[2];
  const resourceName = parts[3];

  if (!resourceName) {
    return 'Error: Resource name is required';
  }

  // Check if the resource exists
  let resourceExists = false;

  if (resourceType === 'pod' || resourceType === 'pods') {
    const pod = namespace
      ? clusterState.pods.find(pod => pod.name.includes(resourceName) && pod.namespace === namespace)
      : clusterState.pods.find(pod => pod.name.includes(resourceName));
    if (pod) {
      resourceExists = true;
      // Simulate pod deletion and recreation (restart)
      // 1. Mark as terminating (optional, but good for realism)
      // 2. Actually, just restart it for the game mechanics

      // Check if this fixes a pod-crash or high-cpu event
      const event = clusterState.activeEvents.find(e =>
        (e.type === 'pod-crash' || e.type === 'high-cpu') &&
        e.affectedResources.some(r => pod.name.includes(r))
      );

      if (event) {
        actions.resolveChaosEvent(event.id);
        return `pod "${pod.name}" deleted. Incident resolved.`;
      } else {
        // Just a normal delete/restart
        // We could implement actual delete logic here, but for the game, 
        // deleting a pod usually just restarts it if it's in a deployment.
        // Let's simulate a restart by updating restarts count and clearing logs
        actions.updatePod(pod.id, {
          restarts: pod.restarts + 1,
          status: 'Running',
          logs: [...pod.logs, `${new Date().toISOString()} INFO: Pod deleted and restarted`]
        });
        return `pod "${pod.name}" deleted.`;
      }
    }
  } else if (resourceType === 'service' || resourceType === 'services') {
    const service = namespace
      ? clusterState.services.find(service => service.name.includes(resourceName) && service.namespace === namespace)
      : clusterState.services.find(service => service.name.includes(resourceName));
    if (service) {
      resourceExists = true;
      // Check if this fixes a service event
      const event = clusterState.activeEvents.find(e =>
        (e.type === 'service-down' || e.type === 'dns-failure') &&
        e.affectedResources.includes(service.name)
      );

      if (event) {
        actions.resolveChaosEvent(event.id);
        return `service "${service.name}" deleted. Incident resolved.`;
      }
      return `service "${service.name}" deleted.`;
    }
  } else if (resourceType === 'deployment' || resourceType === 'deployments') {
    const deployment = clusterState.deployments.find(deployment => deployment.name.includes(resourceName));
    if (deployment) {
      resourceExists = true;
      // Check if this fixes a deployment event
      const event = clusterState.activeEvents.find(e =>
        e.type === 'deployment-failed' &&
        e.affectedResources.includes(deployment.name)
      );

      if (event) {
        actions.resolveChaosEvent(event.id);
        return `deployment.apps/${deployment.name} deleted. Incident resolved.`;
      }
      return `deployment.apps/${deployment.name} deleted.`;
    }
  }

  if (!resourceExists) {
    return `Error: ${resourceType} "${resourceName}" not found`;
  }

  return `${resourceType} "${resourceName}" deleted successfully.`;
}

function handleKubectlScale(parts: string[], namespace: string | null, clusterState: ClusterState, actions: GameActions): string {
  return 'Deployment scaled successfully.';
}

function handleKubectlRollout(parts: string[], namespace: string | null, clusterState: ClusterState, actions: GameActions): string {
  if (parts.length < 4) {
    return 'Error: kubectl rollout requires subcommand and resource name';
  }

  const subcommand = parts[2];
  const resourceType = parts[3];
  const resourceName = parts[4];

  if (!resourceName) {
    return 'Error: Resource name is required';
  }

  if (subcommand === 'restart') {
    // Check if the deployment exists
    const deployment = namespace
      ? clusterState.deployments.find(d => d.name.includes(resourceName) && d.namespace === namespace)
      : clusterState.deployments.find(d => d.name.includes(resourceName));
    if (!deployment) {
      return `Error: deployment "${resourceName}" not found`;
    }

    // Check for events to resolve
    const event = clusterState.activeEvents.find(e =>
      e.affectedResources.some(r => deployment.name.includes(r))
    );

    if (event) {
      actions.resolveChaosEvent(event.id);
      return `deployment.apps/${resourceName} restarted. Incident resolved.`;
    }

    // Just restart
    actions.updateDeployment(deployment.id, {
      status: 'Progressing',
      available: 0
    });

    // Simulate restart delay
    setTimeout(() => {
      actions.updateDeployment(deployment.id, {
        status: 'Available',
        available: 1
      });
    }, 2000);

    return `deployment.apps/${resourceName} restarted`;
  }

  return `Rollout ${subcommand} completed successfully.`;
}

function getHelpText(): string {
  return `Available commands:

Kubernetes Commands:
  kubectl get pods                    - List all pods
  kubectl get services               - List all services
  kubectl get deployments            - List all deployments
  kubectl get nodes                  - List all nodes
  kubectl get namespaces             - List all namespaces
  kubectl logs <pod-name>           - View pod logs
  kubectl describe <resource>        - Describe a resource
  kubectl exec <pod-name> -- <cmd>  - Execute command in pod
  kubectl port-forward <pod> <port> - Port forward to pod
  kubectl apply -f <file>           - Apply configuration
  kubectl delete <resource>          - Delete resource
  kubectl scale deployment <name> <replicas> - Scale deployment
  kubectl rollout restart <deployment> - Restart deployment

System Commands:
  help                               - Show this help
  clear                              - Clear terminal
  date                               - Show current date
  whoami                             - Show current user
  pwd                                - Show current directory
  ls                                 - List files
  ps                                 - Show processes

Game Commands:
  start                              - Start the chaos game
  stop                               - Stop the game
  score                              - Show current score
  status                             - Show game status`;
} 