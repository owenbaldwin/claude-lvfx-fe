// Detailed models for the Production Breakdown feature
// These are separate from but compatible with the basic models defined in index.ts

import { ActionBeat, Scene, Sequence, Shot } from '.';

export interface ProductionBreakdown {
  sequences: SequenceWithRelations[];
  unsequencedScenes: SceneWithRelations[];
}

// Instead of extending, we'll include all properties we need
export interface SequenceWithRelations {
  id: number;
  name: string;
  description?: string;
  scriptId: number;
  script?: any;
  scenes: SceneWithRelations[];
  createdAt?: string;
  updatedAt?: string;
  // Additional properties for the breakdown view
  prefix: string;
  order_number: number;
}

export interface SceneWithRelations {
  id: number;
  sceneNumber: string;
  name?: string;
  description?: string;
  setting?: string;
  timeOfDay?: string;
  sequenceId: number;
  sequence?: any;
  actionBeats: ActionBeatWithRelations[];
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

export interface ActionBeatWithRelations {
  id: number;
  description: string;
  sceneId: number;
  scene?: any;
  shots: ShotWithRelations[];
  createdAt?: string;
  updatedAt?: string;
  // Additional properties for the breakdown view
  number: string;
  type: 'action' | 'dialogue';
  title: string;
  characters?: ActionCharacter[];
}

export interface ShotWithRelations {
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
