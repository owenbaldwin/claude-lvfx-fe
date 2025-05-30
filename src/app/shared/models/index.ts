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
  id?: number;
  prefix: string;
  name: string;
  number: number;
  description?: string;
  scriptId?: number;
  productionId: number;
  script?: Script;
  scenes?: Scene[];
  position?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Scene {
  id?: number;
  number: number;
  description?: string;
  location?: string;
  int_ext?: string;
  day_night?: string;
  length?: string;
  version_number?: number;
  color?: string;
  is_active?: boolean;
  sequenceId: number;
  productionId: number;
  createdAt?: string;
  updatedAt?: string;
}


export interface ActionBeat {
  id?: number;
  number: number;
  description: string;
  text?: string;
  beat_type: string;
  version_number?: number;
  is_active?: boolean;
  sceneId: number;
  sequenceId: number;
  productionId: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Shot {
  id?: number;
  number: string;
  description?: string;
  camera?: string;
  framing?: string;
  movement?: string;
  camera_angle?: string;
  camera_movement?: string;
  notes?: string;
  duration?: number;
  status?: string;
  vfx?: string;
  sequenceId: number;
  sceneId: number;
  actionBeatId: number;
  productionId: number;
  createdAt?: string;
  updatedAt?: string;
}
