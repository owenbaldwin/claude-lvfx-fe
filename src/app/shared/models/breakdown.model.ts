// Detailed models for the Production Breakdown feature
// These extend the basic models defined in index.ts

import { ActionBeat, Scene, Sequence, Shot } from '.';

export interface ProductionBreakdown {
  sequences: SequenceWithRelations[];
  unsequencedScenes: SceneWithRelations[];
}

export interface SequenceWithRelations extends Sequence {
  scenes: SceneWithRelations[];
  prefix: string;
  order_number: number;
}

export interface SceneWithRelations extends Scene {
  actionBeats: ActionBeatWithRelations[];
  characters?: SceneCharacter[];
  order_number: string; 
  type: 'scene' | 'general' | 'transition';
  int_ext: 'interior' | 'exterior' | null;
  title: string;
  length?: string;
  day_night?: string;
}

export interface ActionBeatWithRelations extends ActionBeat {
  shots: ShotWithRelations[];
  number: string;
  type: 'action' | 'dialogue';
  title: string;
  characters?: ActionCharacter[];
}

export interface ShotWithRelations extends Shot {
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
