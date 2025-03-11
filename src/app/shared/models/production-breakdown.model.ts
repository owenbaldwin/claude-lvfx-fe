import { Production, Sequence, Scene, ActionBeat, Shot } from './index';

export interface ProductionBreakdown {
  production: Production;
  sequences: Sequence[];
  scenes: Scene[];
  actionBeats: ActionBeat[];
  shots: Shot[];
}
