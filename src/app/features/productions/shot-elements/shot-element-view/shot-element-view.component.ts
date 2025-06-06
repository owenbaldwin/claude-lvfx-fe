import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Asset } from '@app/core/services/asset.service';
import { Assumption } from '@app/core/services/assumption.service';
import { Fx } from '@app/core/services/fx.service';
import { Complexity, ComplexityService } from '@app/core/services/complexity.service';
import { ShotAssetService } from '@app/core/services/shot-asset.service';
import { ShotAssumptionService } from '@app/core/services/shot-assumption.service';
import { ShotFxService } from '@app/core/services/shot-fx.service';

type ShotElement = Asset | Assumption | Fx;

@Component({
  selector: 'app-shot-element-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shot-element-view.component.html',
  styleUrl: './shot-element-view.component.scss'
})
export class ShotElementViewComponent implements OnInit {
  @Input() element!: ShotElement;
  @Input() elementType!: 'asset' | 'assumption' | 'fx';
  @Input() productionId!: number;
  @Input() sequenceId!: number;
  @Input() sceneId!: number;
  @Input() actionBeatId!: number;
  @Input() shotId!: number;
  @Output() elementDeleted = new EventEmitter<void>();

  complexity: Complexity | null = null;
  loading = true;
  deleting = false;

  constructor(
    private complexityService: ComplexityService,
    private shotAssetService: ShotAssetService,
    private shotAssumptionService: ShotAssumptionService,
    private shotFxService: ShotFxService
  ) {}

  ngOnInit(): void {
    if (this.element?.complexity_id) {
      this.loadComplexity();
    } else {
      this.loading = false;
    }
  }

  private loadComplexity(): void {
    this.complexityService.getOne(this.productionId, this.element.complexity_id)
      .subscribe({
        next: (complexity) => {
          this.complexity = complexity;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading complexity:', error);
          this.loading = false;
        }
      });
  }

  getElementTypeName(): string {
    switch (this.elementType) {
      case 'asset':
        return 'Asset';
      case 'assumption':
        return 'Assumption';
      case 'fx':
        return 'FX';
      default:
        return 'Element';
    }
  }

  softDelete(): void {
    if (!confirm(`Are you sure you want to remove this ${this.getElementTypeName().toLowerCase()} from the shot?`)) {
      return;
    }

    this.deleting = true;

    // First, we need to find the relationship ID by getting all relationships and finding the one that matches our element
    this.findAndDeleteRelationship();
  }

  private findAndDeleteRelationship(): void {
    switch (this.elementType) {
      case 'asset':
        this.shotAssetService.getAll(this.productionId, this.sequenceId, this.sceneId, this.actionBeatId, this.shotId)
          .subscribe({
            next: (shotAssets) => {
              const shotAsset = shotAssets.find(sa => sa.asset_id === this.element.id);
              if (shotAsset) {
                this.deleteAssetRelationship(shotAsset.id);
              } else {
                console.error('Shot asset relationship not found');
                this.deleting = false;
              }
            },
            error: (error) => {
              console.error('Error finding shot asset relationship:', error);
              this.deleting = false;
            }
          });
        break;

      case 'assumption':
        this.shotAssumptionService.getAll(this.productionId, this.sequenceId, this.sceneId, this.actionBeatId, this.shotId)
          .subscribe({
            next: (shotAssumptions) => {
              const shotAssumption = shotAssumptions.find(sa => sa.assumption_id === this.element.id);
              if (shotAssumption) {
                this.deleteAssumptionRelationship(shotAssumption.id);
              } else {
                console.error('Shot assumption relationship not found');
                this.deleting = false;
              }
            },
            error: (error) => {
              console.error('Error finding shot assumption relationship:', error);
              this.deleting = false;
            }
          });
        break;

      case 'fx':
        this.shotFxService.getAll(this.productionId, this.sequenceId, this.sceneId, this.actionBeatId, this.shotId)
          .subscribe({
            next: (shotFxs) => {
              const shotFx = shotFxs.find(sf => sf.fx_id === this.element.id);
              if (shotFx) {
                this.deleteFxRelationship(shotFx.id);
              } else {
                console.error('Shot FX relationship not found');
                this.deleting = false;
              }
            },
            error: (error) => {
              console.error('Error finding shot FX relationship:', error);
              this.deleting = false;
            }
          });
        break;
    }
  }

  private deleteAssetRelationship(relationshipId: number): void {
    this.shotAssetService.delete(this.productionId, this.sequenceId, this.sceneId, this.actionBeatId, this.shotId, relationshipId)
      .subscribe({
        next: () => {
          this.deleting = false;
          this.elementDeleted.emit();
        },
        error: (error) => {
          console.error('Error deleting shot asset relationship:', error);
          this.deleting = false;
        }
      });
  }

  private deleteAssumptionRelationship(relationshipId: number): void {
    this.shotAssumptionService.delete(this.productionId, this.sequenceId, this.sceneId, this.actionBeatId, this.shotId, relationshipId)
      .subscribe({
        next: () => {
          this.deleting = false;
          this.elementDeleted.emit();
        },
        error: (error) => {
          console.error('Error deleting shot assumption relationship:', error);
          this.deleting = false;
        }
      });
  }

  private deleteFxRelationship(relationshipId: number): void {
    this.shotFxService.delete(this.productionId, this.sequenceId, this.sceneId, this.actionBeatId, this.shotId, relationshipId)
      .subscribe({
        next: () => {
          this.deleting = false;
          this.elementDeleted.emit();
        },
        error: (error) => {
          console.error('Error deleting shot FX relationship:', error);
          this.deleting = false;
        }
      });
  }
}
