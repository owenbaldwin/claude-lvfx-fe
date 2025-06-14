import { Component, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSliderModule } from '@angular/material/slider';
import {
  GenerateShotsService,
  GeneratedShotsResults,
  GeneratedShotsJobResults,
  JobStatusResponse,
  GeneratedShot
} from '@app/core/services/generate-shots.service';
import {
  Observable,
  Subject,
  timer,
  EMPTY,
  BehaviorSubject
} from 'rxjs';
import {
  switchMap,
  takeUntil,
  takeWhile,
  tap,
  catchError,
  finalize
} from 'rxjs/operators';

@Component({
  selector: 'app-generate-shots',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatSliderModule
  ],
  templateUrl: './generate-shots.component.html',
  styleUrls: ['./generate-shots.component.scss']
})
export class GenerateShotsComponent implements OnDestroy {
  @Input() productionId!: number;

  private destroy$ = new Subject<void>();
  private selectedActionBeatIds$ = new BehaviorSubject<number[]>([]);

  // State management
  isGenerating = false;
  isPolling = false;
  jobId: string | null = null;
  jobStatus: JobStatusResponse | null = null;
  results: GeneratedShotsJobResults | null = null;
  error: string | null = null;
  shotsPerBeat: number = 1;

  constructor(
    private generateShotsService: GenerateShotsService,
    private snackBar: MatSnackBar
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Clear all selected action beat checkboxes
   */
  private clearSelectedActionBeats(): void {
    const checkboxes = document.querySelectorAll('input[id^="check-actionB-"]:checked') as NodeListOf<HTMLInputElement>;
    console.log(`🔄 Clearing ${checkboxes.length} selected action beat checkboxes`);

    checkboxes.forEach(checkbox => {
      checkbox.checked = false;
      const actionBeatId = checkbox.getAttribute('data-actionbeat-id');
      console.log(`✅ Unchecked action beat ${actionBeatId}`);
    });

    console.log('🧹 All action beat checkboxes cleared');
  }

  /**
   * Get selected action beat IDs from checkboxes
   */
  private getSelectedActionBeatIds(): number[] {
    const checkboxes = document.querySelectorAll('input[id^="check-actionB-"]:checked') as NodeListOf<HTMLInputElement>;
    const ids: number[] = [];

    checkboxes.forEach(checkbox => {
      const id = checkbox.getAttribute('data-actionbeat-id');
      if (id) {
        ids.push(parseInt(id, 10));
      }
    });

    return ids;
  }

  /**
   * Start the shot generation process
   */
  generateShots(): void {
    const selectedIds = this.getSelectedActionBeatIds();
    console.log('Selected action beat IDs:', selectedIds);
    console.log('Shots per beat:', this.shotsPerBeat);

    if (selectedIds.length === 0) {
      this.snackBar.open('Please select at least one action beat', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.resetState();
    this.isGenerating = true;
    this.selectedActionBeatIds$.next(selectedIds);

    this.generateShotsService.generateShots(this.productionId, selectedIds, this.shotsPerBeat)
      .pipe(
        tap(response => {
          this.jobId = response.job_id;
          this.snackBar.open(`Shot generation started (Job ID: ${this.jobId})`, 'Close', {
            duration: 5000
          });
        }),
        switchMap(response => this.pollJobStatus(response.job_id)),
        takeUntil(this.destroy$),
        catchError(error => {
          this.handleError('Failed to start shot generation', error);
          return EMPTY;
        }),
        finalize(() => {
          this.isGenerating = false;
        })
      )
      .subscribe();
  }

  /**
   * Poll job status until completion
   */
  private pollJobStatus(jobId: string): Observable<any> {
    this.isPolling = true;

    return timer(0, 2000).pipe(
      switchMap(() => this.generateShotsService.getJobStatus(this.productionId, jobId)),
      tap(status => {
        this.jobStatus = status;
        console.log('Job status:', status);
      }),
      takeWhile(status => status.status !== 'completed' && status.status !== 'failed', true),
      switchMap(status => {
        if (status.status === 'completed') {
          return this.loadResults(jobId);
        } else if (status.status === 'failed') {
          throw new Error(status.error || 'Job failed');
        }
        return [status]; // Return the status as an array to maintain Observable chain
      }),
      catchError(error => {
        this.handleError('Failed to check job status', error);
        return EMPTY;
      }),
      finalize(() => {
        this.isPolling = false;
      })
    );
  }

  /**
   * Load the results once job is completed
   */
  private loadResults(jobId: string): Observable<GeneratedShotsJobResults> {
    return this.generateShotsService.getJobResults(this.productionId, jobId).pipe(
      tap(results => {
        console.log('=== SHOT GENERATION RESULTS RECEIVED ===');
        console.log('Full results:', results);

        this.results = results;
        this.snackBar.open(`Successfully generated ${results.results.shots_created} shots!`, 'Close', {
          duration: 5000,
          panelClass: ['success-snackbar']
        });

        // Add a delay to ensure DOM is updated and then dispatch refresh events
        setTimeout(() => {
          console.log('=== DISPATCHING REFRESH EVENTS ===');
          console.log('Results structure:', results);

          // The actual action beats data is nested under results.results
          const actualResults = results.results;
          console.log('Actual results:', actualResults);

          // Dispatch refresh events for each action beat that had shots generated
          if (actualResults && actualResults.shots_by_beat) {
            const actionBeatIds = Object.keys(actualResults.shots_by_beat);
            console.log('Action beat IDs in results:', actionBeatIds);

            actionBeatIds.forEach(actionBeatIdStr => {
              const actionBeatId = parseInt(actionBeatIdStr, 10);
              const shots = actualResults.shots_by_beat[actionBeatIdStr];

              console.log(`Processing action beat ${actionBeatId}:`, shots);

              if (shots && shots.length > 0) {
                console.log(`🚀 DISPATCHING refresh event for action beat ${actionBeatId} with ${shots.length} new shots`);

                // Strategy 1: Standard document event
                const refreshEvent = new CustomEvent('refreshShotList', {
                  detail: { actionBeatId: actionBeatId },
                  bubbles: true
                });
                document.dispatchEvent(refreshEvent);
                console.log(`📡 Document event dispatched for action beat ${actionBeatId}`);

                // Strategy 2: Window event (in case document events aren't working)
                const windowEvent = new CustomEvent('refreshShotList', {
                  detail: { actionBeatId: actionBeatId },
                  bubbles: true
                });
                window.dispatchEvent(windowEvent);
                console.log(`🪟 Window event dispatched for action beat ${actionBeatId}`);

                // Strategy 3: Direct DOM manipulation to trigger refresh
                const actionBeatElements = document.querySelectorAll(`[data-actionbeat-id="${actionBeatId}"]`);
                console.log(`Found ${actionBeatElements.length} elements with action beat ID ${actionBeatId}`);

                console.log(`✅ Multiple events dispatched for action beat ${actionBeatId}`);
              } else {
                console.log(`❌ No shots found for action beat ${actionBeatId}`);
                console.log('Shots array:', shots);
              }
            });

            // Strategy 4: Global refresh event for all shot lists
            console.log('🌍 DISPATCHING GLOBAL REFRESH EVENT');
            const globalRefreshEvent = new CustomEvent('refreshAllShotLists', {
              detail: { actionBeatIds: actionBeatIds.map(id => parseInt(id, 10)) },
              bubbles: true
            });
            document.dispatchEvent(globalRefreshEvent);
            window.dispatchEvent(globalRefreshEvent);
            console.log(`🌍 Global refresh events dispatched for action beats: ${actionBeatIds.join(', ')}`);

            console.log('=== ALL REFRESH EVENTS DISPATCHED ===');

            // Clear the selected checkboxes after successful generation
            this.clearSelectedActionBeats();
          } else {
            console.log('❌ No shots_by_beat found in results');
            console.log('Available keys in actualResults:', actualResults ? Object.keys(actualResults) : 'actualResults is null/undefined');
          }
        }, 500); // Reduced delay from 1000ms to 500ms for faster refresh
      }),
      catchError(error => {
        this.handleError('Failed to load results', error);
        return EMPTY;
      })
    );
  }

  /**
   * Handle errors and display user-friendly messages
   */
  private handleError(message: string, error: any): void {
    console.error(message, error);
    this.error = `${message}: ${error.message || error}`;
    this.snackBar.open(this.error, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  /**
   * Reset component state
   */
  resetState(): void {
    this.jobId = null;
    this.jobStatus = null;
    this.results = null;
    this.error = null;
    this.isGenerating = false;
    this.isPolling = false;
  }

  /**
   * Get action beat results as array for easier template iteration
   */
  getActionBeatResults(): Array<{
    action_beat_id: number;
    action_beat_text: string;
    shots: GeneratedShot[];
  }> {
    if (!this.results || !this.results.results || !this.results.results.shots_by_beat) return [];

    const actionBeatResults: Array<{
      action_beat_id: number;
      action_beat_text: string;
      shots: GeneratedShot[];
    }> = [];

    // Convert the shots_by_beat object to the expected array format
    Object.entries(this.results.results.shots_by_beat).forEach(([actionBeatIdStr, shots]) => {
      const actionBeatId = parseInt(actionBeatIdStr, 10);

      actionBeatResults.push({
        action_beat_id: actionBeatId,
        action_beat_text: `Action Beat ${actionBeatId}`, // We don't have the text in the response, so use a default
        shots: shots || []
      });
    });

    return actionBeatResults;
  }

  /**
   * Get status display text
   */
  getStatusText(): string {
    if (!this.jobStatus) return 'Initializing...';

    switch (this.jobStatus.status) {
      case 'pending':
        return 'Queued for processing...';
      case 'processing':
        return `Processing... ${this.jobStatus.progress ? `(${this.jobStatus.progress}%)` : ''}`;
      case 'completed':
        return 'Completed successfully!';
      case 'failed':
        return 'Failed to generate shots';
      default:
        return 'Unknown status';
    }
  }

  /**
   * Check if we should show the progress bar
   */
  shouldShowProgress(): boolean {
    return this.jobStatus?.progress !== undefined && this.jobStatus.progress > 0;
  }

  /**
   * Get progress percentage
   */
  getProgress(): number {
    return this.jobStatus?.progress || 0;
  }

  /**
   * Handle shots per beat slider change
   */
  onShotsPerBeatChange(event: any): void {
    this.shotsPerBeat = event.target.value;
  }

  /**
   * Format slider label for display
   */
  formatSliderLabel(value: number): string {
    return `${value}`;
  }
}
