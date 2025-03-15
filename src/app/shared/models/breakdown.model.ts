// Detailed models for the Production Breakdown feature

// Base interface for all breakdown items
export interface BreakdownItem {
  id: number;
  name?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Base interface for hierarchical items that can be expanded
export interface ExpandableItem extends BreakdownItem {
  isExpanded?: boolean;
  isSelected?: boolean;
}

export interface ProductionBreakdown {
  sequences: SequenceDetail[];
  unsequencedScenes: SceneDetail[];
}

export interface SequenceDetail extends ExpandableItem {
  scriptId: number;
  script?: any;
  scenes: SceneDetail[];
  prefix: string;
  number: number;
  title?: string; // For display consistency
}

export interface SceneDetail extends ExpandableItem {
  sceneNumber: string;
  setting?: string;
  timeOfDay?: string;
  sequenceId: number;
  sequence?: any;
  actionBeats: ActionBeatDetail[];
  characters?: SceneCharacter[];
  order_number: string;
  type: 'scene' | 'general' | 'transition';
  int_ext: 'interior' | 'exterior' | null;
  title: string;
  length?: string;
  day_night?: string;
}

export interface ActionBeatDetail extends ExpandableItem {
  sceneId: number;
  scene?: any;
  shots: ShotDetail[];
  number: string;
  type: 'action' | 'dialogue';
  title: string;
  characters?: ActionCharacter[];
}

export interface ShotDetail extends ExpandableItem {
  shotNumber: string;
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
  title: string;
  order_number: string;
  action?: string;
  assets?: ShotAsset[];
  assumptions?: ShotAssumption[];
  fx?: ShotFx[];
  media?: ShotMedia[];
}

// Selection interfaces
export interface BreakdownSelection {
  sequenceIds: number[];
  sceneIds: number[];
  actionBeatIds: number[];
  shotIds: number[];
}

// Relations and metadata interfaces
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

// Type guards
export function isSequence(item: BreakdownItem): item is SequenceDetail {
  return (item as SequenceDetail).scenes !== undefined;
}

export function isScene(item: BreakdownItem): item is SceneDetail {
  return (item as SceneDetail).actionBeats !== undefined &&
         (item as SceneDetail).sceneNumber !== undefined;
}

export function isActionBeat(item: BreakdownItem): item is ActionBeatDetail {
  return (item as ActionBeatDetail).shots !== undefined &&
         (item as ActionBeatDetail).sceneId !== undefined;
}

export function isShot(item: BreakdownItem): item is ShotDetail {
  return (item as ShotDetail).shotNumber !== undefined;
}
