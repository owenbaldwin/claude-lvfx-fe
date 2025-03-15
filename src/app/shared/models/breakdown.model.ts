// Breakdown models
export interface BreakdownItem {
  id: number;
  type?: string;
}

export interface BreakdownSelection {
  sequenceIds: number[];
  sceneIds: number[];
  actionBeatIds: number[];
  shotIds: number[];
}

export interface ProductionBreakdown {
  sequences: SequenceDetail[];
  unsequencedScenes: SceneDetail[];
}

// Type guards
export function isSequence(item: BreakdownItem): item is SequenceDetail {
  return item && 'prefix' in item && 'scenes' in item;
}

export function isScene(item: BreakdownItem): item is SceneDetail {
  return item && 'sceneNumber' in item && 'actionBeats' in item;
}

export function isActionBeat(item: BreakdownItem): item is ActionBeatDetail {
  return item && 'shots' in item && ('description' in item || 'title' in item);
}

export function isShot(item: BreakdownItem): item is ShotDetail {
  return item && 'shotNumber' in item;
}

// Sequence model
export interface SequenceDetail extends BreakdownItem {
  name?: string;
  prefix: string;
  number?: number;
  order_number?: string; // Changed to string to match sorting method
  scenes: SceneDetail[];
}

// Scene model
export interface SceneDetail extends BreakdownItem {
  sceneNumber: string;
  name?: string;
  title?: string;
  type?: string;
  sequenceId?: number; // Added field
  order_number?: string; // Added field
  actionBeats: ActionBeatDetail[];
}

// Action Beat model
export interface ActionBeatDetail extends BreakdownItem {
  number?: string;
  title?: string;
  description?: string;
  type?: string;
  sceneId?: number; // Added field
  shots: ShotDetail[];
}

// Shot model
export interface ShotDetail extends BreakdownItem {
  shotNumber: string;
  title?: string;
  description?: string;
  type?: string;
  status?: string;
  actionBeatId?: number; // Added field
  sceneId?: number; // Added field
  order_number?: string; // Added field
  assets?: ShotAsset[];
  fx?: ShotFx[];
  assumptions?: ShotAssumption[];
}

// Shot Asset model
export interface ShotAsset extends BreakdownItem {
  name: string;
  description?: string;
  type?: string;
  status?: string;
  shotId: number;
}

// Shot Assumption model 
export interface ShotAssumption extends BreakdownItem {
  description: string;
  type?: string;
  status?: string;
  shotId: number;
}

// Shot FX model
export interface ShotFx extends BreakdownItem {
  name: string;
  description?: string;
  type?: string;
  complexity?: string;
  status?: string;
  shotId: number;
}
