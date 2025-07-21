import { Pod, Service, Deployment } from '@/store/gameStore';

interface ClusterState {
  pods: Pod[];
  services: Service[];
  deployments: Deployment[];
}

export async function executeCommand(command: string, clusterState: ClusterState): Promise<string> {
  const trimmedCommand = command.trim();
  
  if (!trimmedCommand) {
    return '';
  }

  // Parse kubectl commands
  if (trimmedCommand.startsWith('kubectl')) {
    return handleKubectlCommand(trimmedCommand, clusterState);
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

function handleKubectlCommand(command: string, clusterState: ClusterState): string {
  const parts = command.split(' ');
  
  if (parts.length < 2) {
    return 'Error: kubectl command requires arguments';
  }

  const subcommand = parts[1];
  const resource = parts[2];
  const namespace = parts.find(part => part === '-n' || part === '--namespace') 
    ? parts[parts.indexOf('-n') + 1] || parts[parts.indexOf('--namespace') + 1]
    : 'default';

  switch (subcommand) {
    case 'get':
      return handleKubectlGet(resource, namespace, clusterState);
    case 'logs':
      return handleKubectlLogs(parts, clusterState);
    case 'describe':
      return handleKubectlDescribe(parts, clusterState);
    case 'exec':
      return handleKubectlExec(parts, clusterState);
    case 'port-forward':
      return handleKubectlPortForward(parts, clusterState);
    case 'apply':
      return handleKubectlApply(parts, clusterState);
    case 'delete':
      return handleKubectlDelete(parts, clusterState);
    case 'scale':
      return handleKubectlScale(parts, clusterState);
    case 'rollout':
      return handleKubectlRollout(parts, clusterState);
    default:
      throw new Error(`Unknown kubectl subcommand: ${subcommand}`);
  }
}

function handleKubectlGet(resource: string, namespace: string, clusterState: ClusterState): string {
  let output = '';
  
  switch (resource) {
    case 'pods':
    case 'pod':
      output = 'NAME'.padEnd(35) + 'READY'.padEnd(8) + 'STATUS'.padEnd(12) + 'RESTARTS'.padEnd(10) + 'AGE' + '\n';
      clusterState.pods.forEach(pod => {
        output += pod.name.padEnd(35) + pod.ready.padEnd(8) + pod.status.padEnd(12) + String(pod.restarts).padEnd(10) + pod.age + '\n';
      });
      break;
      
    case 'services':
    case 'service':
    case 'svc':
      output = 'NAME'.padEnd(18) + 'TYPE'.padEnd(12) + 'CLUSTER-IP'.padEnd(16) + 'EXTERNAL-IP'.padEnd(14) + 'PORT(S)'.padEnd(12) + 'AGE' + '\n';
      clusterState.services.forEach(svc => {
        output += svc.name.padEnd(18) + svc.type.padEnd(12) + svc.clusterIp.padEnd(16) + svc.externalIp.padEnd(14) + svc.ports.padEnd(12) + svc.age + '\n';
      });
      break;
      
    case 'deployments':
    case 'deployment':
    case 'deploy':
      output = 'NAME'.padEnd(22) + 'READY'.padEnd(10) + 'UP-TO-DATE'.padEnd(12) + 'AVAILABLE'.padEnd(12) + 'AGE' + '\n';
      clusterState.deployments.forEach(deploy => {
        output += deploy.name.padEnd(22) + deploy.ready.padEnd(10) + String(deploy.upToDate).padEnd(12) + String(deploy.available).padEnd(12) + deploy.age + '\n';
      });
      break;
      
    case 'nodes':
      output = 'NAME'.padEnd(12) + 'STATUS'.padEnd(10) + 'ROLES'.padEnd(18) + 'AGE'.padEnd(6) + 'VERSION' + '\n';
      output += 'node-1'.padEnd(12) + 'Ready'.padEnd(10) + 'control-plane'.padEnd(18) + '2d'.padEnd(6) + 'v1.28.0' + '\n';
      output += 'node-2'.padEnd(12) + 'Ready'.padEnd(10) + '<none>'.padEnd(18) + '2d'.padEnd(6) + 'v1.28.0' + '\n';
      break;
      
    case 'namespaces':
    case 'ns':
      output = 'NAME'.padEnd(20) + 'STATUS'.padEnd(10) + 'AGE' + '\n';
      output += 'default'.padEnd(20) + 'Active'.padEnd(10) + '2d' + '\n';
      output += 'kube-system'.padEnd(20) + 'Active'.padEnd(10) + '2d' + '\n';
      output += 'kube-public'.padEnd(20) + 'Active'.padEnd(10) + '2d' + '\n';
      break;
      
    case 'all':
      output = handleKubectlGet('pods', namespace, clusterState);
      output += '\n';
      output += handleKubectlGet('services', namespace, clusterState);
      output += '\n';
      output += handleKubectlGet('deployments', namespace, clusterState);
      break;
      
    default:
      throw new Error(`Unknown resource type: ${resource}`);
  }
  
  return output;
}

function handleKubectlLogs(parts: string[], clusterState: ClusterState): string {
  if (parts.length < 3) {
    return 'Error: kubectl logs requires a pod name';
  }
  
  const podName = parts[2];
  if (!podName) {
    return 'Error: Pod name is required';
  }
  
  const pod = clusterState.pods.find(p => p.name.includes(podName));
  
  if (!pod) {
    throw new Error(`Pod "${podName}" not found`);
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

function handleKubectlDescribe(parts: string[], clusterState: ClusterState): string {
  if (parts.length < 3) {
    return 'Error: kubectl describe requires a resource name';
  }
  
  const resourceName = parts[2];
  const resourceType = parts[1] || 'pod';
  
  let output = `Name:         ${resourceName}\n`;
  output += `Namespace:    default\n`;
  output += `Priority:     0\n`;
  output += `Node:         node-1/10.0.0.1\n`;
  output += `Start Time:   Mon, 01 Jan 2024 10:00:00 +0000\n`;
  output += `Labels:       app=${resourceName}\n`;
  output += `Annotations:  <none>\n`;
  output += `Status:       Running\n`;
  output += `IP:           10.244.0.1\n`;
  output += `Containers:\n`;
  output += `  ${resourceName}:\n`;
  output += `    Image:          nginx:latest\n`;
  output += `    Port:           80/TCP\n`;
  output += `    Host Port:      0/TCP\n`;
  output += `    State:          Running\n`;
  output += `      Started:      Mon, 01 Jan 2024 10:00:01 +0000\n`;
  output += `    Ready:          True\n`;
  output += `    Restart Count:  0\n`;
  output += `    Environment:    <none>\n`;
  output += `    Mounts:\n`;
  output += `      /var/run/secrets/kubernetes.io/serviceaccount from kube-api-access-xyz (ro)\n`;
  output += `Conditions:\n`;
  output += `  Type              Status\n`;
  output += `  Initialized       True\n`;
  output += `  Ready             True\n`;
  output += `  ContainersReady   True\n`;
  output += `  PodScheduled      True\n`;
  
  return output;
}

function handleKubectlExec(parts: string[], clusterState: ClusterState): string {
  return 'Interactive shell not available in simulation mode.\nUse "kubectl logs" to view container logs.';
}

function handleKubectlPortForward(parts: string[], clusterState: ClusterState): string {
  return 'Port forwarding not available in simulation mode.';
}

function handleKubectlApply(parts: string[], clusterState: ClusterState): string {
  return 'Resource applied successfully.';
}

function handleKubectlDelete(parts: string[], clusterState: ClusterState): string {
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
    resourceExists = clusterState.pods.some(pod => pod.name.includes(resourceName));
  } else if (resourceType === 'service' || resourceType === 'services') {
    resourceExists = clusterState.services.some(service => service.name.includes(resourceName));
  } else if (resourceType === 'deployment' || resourceType === 'deployments') {
    resourceExists = clusterState.deployments.some(deployment => deployment.name.includes(resourceName));
  }
  
  if (!resourceExists) {
    return `Error: ${resourceType} "${resourceName}" not found`;
  }
  
  return `${resourceType} "${resourceName}" deleted successfully.`;
}

function handleKubectlScale(parts: string[], clusterState: ClusterState): string {
  return 'Deployment scaled successfully.';
}

function handleKubectlRollout(parts: string[], clusterState: ClusterState): string {
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
    const deployment = clusterState.deployments.find(d => d.name.includes(resourceName));
    if (!deployment) {
      return `Error: deployment "${resourceName}" not found`;
    }
    
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