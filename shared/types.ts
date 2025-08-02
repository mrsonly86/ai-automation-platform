export interface AIAgent {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'analysis' | 'business' | 'design' | 'development' | 'testing' | 'devops' | 'coordination' | 'architecture';
  color: string;
}

export interface Integration {
  id: string;
  name: string;
  icon: string;
  category: 'deployment' | 'development' | 'cloud' | 'business';
  connected: boolean;
}

export interface SolutionTab {
  id: string;
  name: string;
  description: string;
  services: SolutionService[];
}

export interface SolutionService {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface DeploymentStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  progress: number;
}

export interface Metrics {
  integrations: number;
  uptime: string;
  connections: number;
  support: string;
}

export interface Project {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed';
  progress: number;
  lastUpdated: Date;
}