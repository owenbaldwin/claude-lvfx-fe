import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Asset } from '@app/core/services/asset.service';
import { Assumption } from '@app/core/services/assumption.service';
import { Fx } from '@app/core/services/fx.service';
import { Complexity, ComplexityService } from '@app/core/services/complexity.service';
import { ShotAssetService } from '@app/core/services/shot-asset.service';
import { ShotAssumptionService } from '@app/core/services/shot-assumption.service';
import { ShotFxService } from '@app/core/services/shot-fx.service';
import { ShotService } from '@app/core/services/shot.service';
import { AssetService } from '@app/core/services/asset.service';
import { AssumptionService } from '@app/core/services/assumption.service';
import { FxService } from '@app/core/services/fx.service';
import { Shot } from '@app/shared/models';
import { forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

type ShotElement = Asset | Assumption | Fx;

interface SearchableShot extends Shot {
  selected?: boolean;
  matchReason?: string;
  // Additional properties from Rails API joins
  sequence_prefix?: string;
  scene_number?: number;
  action_beat_number?: number;
  shot_number?: string;
}

type SearchScope = 'shots' | 'assets' | 'assumptions' | 'fx';

@Component({
  selector: 'app-shot-element-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
  @Output() elementAssigned = new EventEmitter<number[]>();

  complexity: Complexity | null = null;
  loading = true;
  deleting = false;

  // New properties for multi-shot assignment
  searchKeyword = '';
  searchScope: SearchScope = 'shots';
  searchResults: SearchableShot[] = [];
  isSearching = false;
  isAssigning = false;
  hasSearched = false;

  constructor(
    private complexityService: ComplexityService,
    private shotAssetService: ShotAssetService,
    private shotAssumptionService: ShotAssumptionService,
    private shotFxService: ShotFxService,
    private shotService: ShotService,
    private assetService: AssetService,
    private assumptionService: AssumptionService,
    private fxService: FxService
  ) {}

  ngOnInit(): void {
    console.log('ShotElementViewComponent ngOnInit - element:', this.element);
    console.log('ShotElementViewComponent ngOnInit - elementType:', this.elementType);
    console.log('ShotElementViewComponent ngOnInit - complexity_id:', this.element?.complexity_id);

    if (this.element?.complexity_id) {
      console.log('Loading complexity...');
      this.loadComplexity();
    } else {
      console.log('No complexity_id, setting loading to false');
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

    // Validate shotId before making API calls
    if (!this.shotId || this.shotId <= 0) {
      console.error('Invalid shot ID for deleting element relationship:', this.shotId);
      alert('Invalid shot ID. Cannot remove element from shot.');
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

  // New methods for multi-shot assignment
  getSearchScopeOptions(): { value: SearchScope; label: string }[] {
    return [
      { value: 'shots', label: 'shots' },
      { value: 'assets', label: 'assets' },
      { value: 'assumptions', label: 'assumptions' },
      { value: 'fx', label: 'fx' }
    ];
  }

  searchShots(): void {
    if (!this.searchKeyword.trim()) {
      return;
    }

    this.isSearching = true;
    this.hasSearched = false;
    this.searchResults = [];

    console.log('=== SEARCH DEBUG ===');
    console.log('Search keyword:', this.searchKeyword);
    console.log('Search scope:', this.searchScope);
    console.log('Production ID:', this.productionId);
    console.log('Current shot ID:', this.shotId);

    if (this.searchScope === 'shots') {
      this.searchInShots();
    } else {
      this.searchInElements();
    }
  }

  private searchInShots(): void {
    // Use the existing service method to get all shots in the production
    this.shotService.getAllShotsInProduction(this.productionId).subscribe({
      next: (allShots) => {
        console.log('=== SHOTS API RESPONSE ===');
        console.log('Raw API response:', allShots);

        const shotsArray = Array.isArray(allShots) ? allShots : (allShots ? [allShots] : []);
        console.log('Working with shots array of length:', shotsArray.length);

        // Filter out the current shot
        const otherShots = shotsArray.filter(shot => shot.id !== this.shotId);
        console.log('Shots excluding current shot (ID ' + this.shotId + '):', otherShots.length);

        // Search for keyword in shot descriptions
        const matchingShots = otherShots.filter(shot => {
          const description = shot.description || '';
          const matches = description.toLowerCase().includes(this.searchKeyword.toLowerCase());
          console.log('Shot', shot.id, 'description:', description, 'matches:', matches);
          return matches;
        });

        console.log('=== SEARCH RESULTS ===');
        console.log('Final matching shots:', matchingShots.length);

        this.searchResults = matchingShots.map(shot => ({
          ...shot,
          selected: false,
          matchReason: 'Shot description contains "' + this.searchKeyword + '"'
        }));

        this.isSearching = false;
        this.hasSearched = true;
      },
      error: (error) => {
        console.error('=== API ERROR ===');
        console.error('Error details:', error);
        this.isSearching = false;
        this.hasSearched = true;
        this.searchResults = [];
      }
    });
  }

  private searchInElements(): void {
    let searchObservable;

    switch (this.searchScope) {
      case 'assets':
        searchObservable = this.assetService.getAll(this.productionId);
        break;
      case 'assumptions':
        searchObservable = this.assumptionService.getAll(this.productionId);
        break;
      case 'fx':
        searchObservable = this.fxService.getAll(this.productionId);
        break;
      default:
        this.isSearching = false;
        this.hasSearched = true;
        return;
    }

    console.log(`=== SEARCHING IN ${this.searchScope.toUpperCase()} ===`);

    searchObservable.subscribe({
      next: (elements) => {
        console.log(`Found ${elements.length} ${this.searchScope}`);

        // Filter elements by keyword (search in name and description)
        const matchingElements = elements.filter(element => {
          const name = element.name || '';
          const description = element.description || '';
          const nameMatch = name.toLowerCase().includes(this.searchKeyword.toLowerCase());
          const descMatch = description.toLowerCase().includes(this.searchKeyword.toLowerCase());
          return nameMatch || descMatch;
        });

        console.log(`Found ${matchingElements.length} matching ${this.searchScope}`);

        if (matchingElements.length === 0) {
          this.searchResults = [];
          this.isSearching = false;
          this.hasSearched = true;
          return;
        }

        // Now find shots that have these elements assigned
        this.findShotsWithElements(matchingElements);
      },
      error: (error) => {
        console.error(`Error searching ${this.searchScope}:`, error);
        this.isSearching = false;
        this.hasSearched = true;
        this.searchResults = [];
      }
    });
  }

  private findShotsWithElements(matchingElements: any[]): void {
    // Get all shots in the production first
    this.shotService.getAllShotsInProduction(this.productionId).subscribe({
      next: (allShots) => {
        const shotsArray = Array.isArray(allShots) ? allShots : (allShots ? [allShots] : []);
        const otherShots = shotsArray.filter(shot => shot.id !== this.shotId);

        console.log(`Checking ${otherShots.length} shots for ${this.searchScope} assignments`);

        // For each shot, check if it has any of the matching elements
        const shotChecks = otherShots.map(shot => {
          if (this.searchScope === 'assets') {
            return this.shotAssetService.getAll(
              this.productionId, shot.sequenceId!, shot.sceneId!, shot.actionBeatId!, shot.id!
            ).pipe(
              map(relationships => this.processShotRelationships(shot, relationships, matchingElements)),
              catchError(() => {
                console.error(`Error checking ${this.searchScope} for shot ${shot.id}`);
                return of(null);
              })
            );
          } else if (this.searchScope === 'assumptions') {
            return this.shotAssumptionService.getAll(
              this.productionId, shot.sequenceId!, shot.sceneId!, shot.actionBeatId!, shot.id!
            ).pipe(
              map(relationships => this.processShotRelationships(shot, relationships, matchingElements)),
              catchError(() => {
                console.error(`Error checking ${this.searchScope} for shot ${shot.id}`);
                return of(null);
              })
            );
          } else if (this.searchScope === 'fx') {
            return this.shotFxService.getAll(
              this.productionId, shot.sequenceId!, shot.sceneId!, shot.actionBeatId!, shot.id!
            ).pipe(
              map(relationships => this.processShotRelationships(shot, relationships, matchingElements)),
              catchError(() => {
                console.error(`Error checking ${this.searchScope} for shot ${shot.id}`);
                return of(null);
              })
            );
          } else {
            return of(null);
          }
        });

        // Wait for all shot checks to complete
        if (shotChecks.length > 0) {
          forkJoin(shotChecks).subscribe({
            next: (results: any[]) => {
              this.searchResults = results.filter((result: any): result is SearchableShot => result !== null);
              console.log(`Found ${this.searchResults.length} shots with matching ${this.searchScope}`);
              this.isSearching = false;
              this.hasSearched = true;
            },
            error: (error) => {
              console.error('Error checking shots for elements:', error);
              this.isSearching = false;
              this.hasSearched = true;
              this.searchResults = [];
            }
          });
        } else {
          // No shots to check
          this.searchResults = [];
          this.isSearching = false;
          this.hasSearched = true;
        }
      },
      error: (error) => {
        console.error('Error getting shots:', error);
        this.isSearching = false;
        this.hasSearched = true;
        this.searchResults = [];
      }
    });
  }

  private processShotRelationships(shot: any, relationships: any, matchingElements: any[]): SearchableShot | null {
    const relationshipsArray = Array.isArray(relationships) ? relationships : [];
    const matchingElementIds = matchingElements.map(el => el.id);
    const hasMatchingElement = relationshipsArray.some((rel: any) => {
      const elementId = rel[`${this.searchScope.slice(0, -1)}_id`]; // remove 's' and add '_id'
      return matchingElementIds.includes(elementId);
    });

    if (hasMatchingElement) {
      // Find which elements match
      const shotElementIds = relationshipsArray.map((rel: any) => rel[`${this.searchScope.slice(0, -1)}_id`]);
      const matchingElementsInShot = matchingElements.filter(el => shotElementIds.includes(el.id));
      const elementNames = matchingElementsInShot.map(el => el.name).join(', ');

      return {
        ...shot,
        selected: false,
        matchReason: `Has ${this.searchScope.slice(0, -1)} matching "${this.searchKeyword}": ${elementNames}`
      } as SearchableShot;
    }
    return null;
  }

  private capitalizeFirst(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  toggleShotSelection(shot: SearchableShot): void {
    shot.selected = !shot.selected;
  }

  getSelectedShots(): SearchableShot[] {
    return this.searchResults.filter(shot => shot.selected);
  }

  assignToSelectedShots(): void {
    const selectedShots = this.getSelectedShots();
    if (selectedShots.length === 0) {
      return;
    }

    this.isAssigning = true;
    const selectedShotIds = selectedShots.map(shot => shot.id!);

    const assignmentObservables = selectedShots.map(shot => {
      switch (this.elementType) {
        case 'asset':
          return this.shotAssetService.create(
            this.productionId,
            shot.sequenceId!,
            shot.sceneId!,
            shot.actionBeatId!,
            shot.id!,
            { asset_id: this.element.id! }
          );
        case 'assumption':
          return this.shotAssumptionService.create(
            this.productionId,
            shot.sequenceId!,
            shot.sceneId!,
            shot.actionBeatId!,
            shot.id!,
            { assumption_id: this.element.id! }
          );
        case 'fx':
          return this.shotFxService.create(
            this.productionId,
            shot.sequenceId!,
            shot.sceneId!,
            shot.actionBeatId!,
            shot.id!,
            { fx_id: this.element.id! }
          );
        default:
          return of(null);
      }
    });

    forkJoin(assignmentObservables).subscribe({
      next: () => {
        this.isAssigning = false;
        console.log('Assignments completed successfully');

        // Update search results to deselect all shots and show success
        this.searchResults.forEach(shot => {
          shot.selected = false;
          if (selectedShots.some(selected => selected.id === shot.id)) {
            shot.matchReason = '✅ Successfully assigned "' + this.element.name + '"';
          }
        });

        // Emit the assignment event with the shot IDs that were updated
        this.elementAssigned.emit(selectedShotIds);

        // Keep the results visible so user can see the success state
        // Don't clear searchKeyword, searchResults, or hasSearched
        console.log('Assignment complete - search results updated with success indicators');
      },
      error: (error) => {
        console.error('Error assigning element to shots:', error);
        this.isAssigning = false;
        alert('Some assignments may have failed. Please check the console for details.');
      }
    });
  }
}
