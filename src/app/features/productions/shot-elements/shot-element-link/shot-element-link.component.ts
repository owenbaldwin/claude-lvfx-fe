import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { AssetService, Asset } from '@app/core/services/asset.service';
import { AssumptionService, Assumption } from '@app/core/services/assumption.service';
import { FxService, Fx } from '@app/core/services/fx.service';
import { ShotAssetService } from '@app/core/services/shot-asset.service';
import { ShotAssumptionService } from '@app/core/services/shot-assumption.service';
import { ShotFxService } from '@app/core/services/shot-fx.service';
import { forkJoin, of } from 'rxjs';

type LinkableElement = Asset | Assumption | Fx;

@Component({
  selector: 'app-shot-element-link',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './shot-element-link.component.html',
  styleUrl: './shot-element-link.component.scss'
})
export class ShotElementLinkComponent implements OnInit, OnChanges {
  @Input() elementType!: 'asset' | 'assumption' | 'fx';
  @Input() productionId!: number;
  @Input() sequenceId!: number;
  @Input() sceneId!: number;
  @Input() actionBeatId!: number;
  @Input() shotId!: number;
  @Input() isVisible: boolean = false;
  @Output() elementsLinked = new EventEmitter<void>();

  linkForm: FormGroup;
  allElements: LinkableElement[] = [];
  loading = true;
  linking = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private assetService: AssetService,
    private assumptionService: AssumptionService,
    private fxService: FxService,
    private shotAssetService: ShotAssetService,
    private shotAssumptionService: ShotAssumptionService,
    private shotFxService: ShotFxService
  ) {
    this.linkForm = this.fb.group({
      selectedElements: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadElements();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isVisible'] && changes['isVisible'].currentValue === true) {
      this.loadElements();
    }
  }

  loadElements(): void {
    this.loading = true;
    this.error = null;

    // Validate shotId before making API calls
    if (!this.shotId || this.shotId <= 0) {
      console.error('Invalid shot ID for loading elements:', this.shotId);
      this.error = 'Invalid shot ID. Cannot load elements.';
      this.loading = false;
      return;
    }

    let allElementsService$;
    let assignedElementsService$;

    switch (this.elementType) {
      case 'asset':
        allElementsService$ = this.assetService.getAll(this.productionId);
        assignedElementsService$ = this.shotAssetService.getAll(
          this.productionId,
          this.sequenceId,
          this.sceneId,
          this.actionBeatId,
          this.shotId
        );
        break;
      case 'assumption':
        allElementsService$ = this.assumptionService.getAll(this.productionId);
        assignedElementsService$ = this.shotAssumptionService.getAll(
          this.productionId,
          this.sequenceId,
          this.sceneId,
          this.actionBeatId,
          this.shotId
        );
        break;
      case 'fx':
        allElementsService$ = this.fxService.getAll(this.productionId);
        assignedElementsService$ = this.shotFxService.getAll(
          this.productionId,
          this.sequenceId,
          this.sceneId,
          this.actionBeatId,
          this.shotId
        );
        break;
      default:
        allElementsService$ = of([]);
        assignedElementsService$ = of([]);
    }

    forkJoin({
      allElements: allElementsService$,
      assignedElements: assignedElementsService$
    }).subscribe({
      next: ({ allElements, assignedElements }) => {
        // Extract the IDs of already assigned elements
        const assignedElementIds = new Set(
          assignedElements.map((assignment: any) => {
            switch (this.elementType) {
              case 'asset':
                return assignment.asset?.id || assignment.asset_id;
              case 'assumption':
                return assignment.assumption?.id || assignment.assumption_id;
              case 'fx':
                return assignment.fx?.id || assignment.fx_id;
              default:
                return null;
            }
          }).filter(id => id !== null)
        );

        // Filter out already assigned elements
        this.allElements = allElements.filter(element =>
          !assignedElementIds.has(element.id)
        );

        this.initializeCheckboxes();
        this.loading = false;
      },
      error: (error) => {
        console.error(`Error loading ${this.elementType}s:`, error);
        this.error = `Failed to load ${this.elementType}s. Please try again.`;
        this.loading = false;
      }
    });
  }

  private initializeCheckboxes(): void {
    const checkboxes = this.allElements.map(() => this.fb.control(false));
    this.linkForm.setControl('selectedElements', this.fb.array(checkboxes));
  }

  getSelectedElements(): LinkableElement[] {
    const selectedIndices: number[] = [];
    const formArray = this.linkForm.get('selectedElements')?.value || [];

    formArray.forEach((isSelected: boolean, index: number) => {
      if (isSelected) {
        selectedIndices.push(index);
      }
    });

    return selectedIndices.map(index => this.allElements[index]);
  }

  getSelectedElementsFormArray(): FormArray {
    return this.linkForm.get('selectedElements') as FormArray;
  }

  getElementTypeLabel(): string {
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

  linkSelectedElements(): void {
    const selectedElements = this.getSelectedElements();

    if (selectedElements.length === 0) {
      return;
    }

    // Validate shotId before making API calls
    if (!this.shotId || this.shotId <= 0) {
      console.error('Invalid shot ID for linking elements:', this.shotId);
      this.error = 'Invalid shot ID. Cannot link elements.';
      return;
    }

    this.linking = true;
    this.error = null;

    const linkObservables = selectedElements.map(element => {
      switch (this.elementType) {
        case 'asset':
          return this.shotAssetService.create(
            this.productionId,
            this.sequenceId,
            this.sceneId,
            this.actionBeatId,
            this.shotId,
            { asset_id: element.id }
          );
        case 'assumption':
          return this.shotAssumptionService.create(
            this.productionId,
            this.sequenceId,
            this.sceneId,
            this.actionBeatId,
            this.shotId,
            { assumption_id: element.id }
          );
        case 'fx':
          return this.shotFxService.create(
            this.productionId,
            this.sequenceId,
            this.sceneId,
            this.actionBeatId,
            this.shotId,
            { fx_id: element.id }
          );
        default:
          return of(null);
      }
    });

    forkJoin(linkObservables).subscribe({
      next: () => {
        console.log(`Successfully linked ${selectedElements.length} ${this.elementType}(s) to shot ${this.shotId}`);
        this.linking = false;
        this.elementsLinked.emit();
      },
      error: (error) => {
        console.error(`Error linking ${this.elementType}s:`, error);
        this.error = `Failed to link ${this.elementType}s. Please try again.`;
        this.linking = false;
      }
    });
  }

  get selectedCount(): number {
    return this.getSelectedElements().length;
  }
}
