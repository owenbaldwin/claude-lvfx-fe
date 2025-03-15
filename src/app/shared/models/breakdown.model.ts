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
  order_number?: number; // Added this property to fix the errors
  scenes: SceneDetail[];
}

// Scene model
export interface SceneDetail extends BreakdownItem {
  sceneNumber: string;
  name?: string;
  title?: string;
  type?: string;
  actionBeats: ActionBeatDetail[];
}

// Action Beat model
export interface ActionBeatDetail extends BreakdownItem {
  number?: string;
  title?: string;
  description?: string;
  type?: string;
  shots: ShotDetail[];
}

// Shot model
export interface ShotDetail extends BreakdownItem {
  shotNumber: string;
  title?: string;
  description?: string;
  type?: string;
  status?: string;
  assets?: any[];
  fx?: any[];
}
