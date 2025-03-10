// Detailed models for the Production Breakdown feature
// These are completely separate from the basic models defined in index.ts

// We do NOT import or extend any models from index.ts
// This avoids TypeScript errors from incompatible types

export interface ProductionBreakdown {
  sequences: SequenceDetail[];
  unsequencedScenes: SceneDetail[];
}

export interface SequenceDetail {
  id: number;
  name: string;
  description?: string;
  scriptId: number;
  script?: any;
  scenes: SceneDetail[];
  createdAt?: string;
  updatedAt?: string;
  // Additional properties for the breakdown view
  prefix: string;
  order_number: number;
}

export interface SceneDetail {
  id: number;
  sceneNumber: string;
  name?: string;
  description?: string;
  setting?: string;
  timeOfDay?: string;
  sequenceId: number;
  sequence?: any;
  actionBeats: ActionBeatDetail[];
  createdAt?: string;
  updatedAt?: string;
  // Additional properties for the breakdown view
  characters?: SceneCharacter[];
  order_number: string; 
  type: 'scene' | 'general' | 'transition';
  int_ext: 'interior' | 'exterior' | null;
  title: string;
  length?: string;
  day_night?: string;
}

export interface ActionBeatDetail {
  id: number;
  description: string;
  sceneId: number;
  scene?: any;
  shots: ShotDetail[];
  createdAt?: string;
  updatedAt?: string;
  // Additional properties for the breakdown view
  number: string;
  type: 'action' | 'dialogue';
  title: string;
  characters?: ActionCharacter[];
}

export interface ShotDetail {
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
  scene?: any;
  actionBeat?: any;
  createdAt?: string;
  updatedAt?: string;
  // Additional properties for the breakdown view
  title: string;
  order_number: string;
  action?: string;
  assets?: ShotAsset[];
  assumptions?: ShotAssumption[];
  fx?: ShotFx[];
  media?: ShotMedia[];
}

export interface SceneCharacter {
  id: number;
  scene_id: number;
  name: string;
}

export interface ActionCharacter {
  id: number;
  action_beat_id: number;
  name: string;
}

export interface ShotAsset {
  id: number;
  shot_id: number;
  name: string;
  description?: string;
}

export interface ShotAssumption {
  id: number;
  shot_id: number;
  name: string;
  description?: string;
}

export interface ShotFx {
  id: number;
  shot_id: number;
  name: string;
  description?: string;
}

export interface ShotMedia {
  id: number;
  shot_id: number;
  media_id: number;
  type: 'storyboard' | 'sketch';
  approved: string;
  media?: Media;
}

export interface Media {
  id: number;
  path: string;
  type: string;
}
