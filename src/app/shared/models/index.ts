export interface User {
  id: number;
  name: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Production {
  id: number;
  title: string;
  description?: string;
  status: string;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductionUser {
  id: number;
  productionId: number;
  userId: number;
  role: string;
  user?: User;
  production?: Production;
  createdAt?: string;
  updatedAt?: string;
}

export interface Script {
  id: number;
  title: string;
  author?: string;
  version?: string;
  content?: string;
  productionId: number;
  production?: Production;
  createdAt?: string;
  updatedAt?: string;
}

export interface Sequence {
  id: number;
  name: string;
  description?: string;
  scriptId: number;
  script?: Script;
  scenes?: Scene[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Scene {
  id: number;
  sceneNumber: string;
  name?: string;
  description?: string;
  setting?: string;
  timeOfDay?: string;
  sequenceId: number;
  sequence?: Sequence;
  actionBeats?: ActionBeat[];
  shots?: Shot[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ActionBeat {
  id: number;
  description: string;
  characters?: string;
  sceneId: number;
  scene?: Scene;
  shots?: Shot[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Shot {
  id: number;
  shotNumber: string;
  description?: string;
  type?: string;
  camera?: string;
  framing?: string;
  movement?: string;
  notes?: string;
  duration?: number;
  status?: string;
  sceneId: number;
  actionBeatId?: number;
  scene?: Scene;
  actionBeat?: ActionBeat;
  createdAt?: string;
  updatedAt?: string;
}