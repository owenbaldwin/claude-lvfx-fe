import { Component, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {
  GenerateShotsService,
  GeneratedShotsResults,
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
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressBarModule,
    MatSnackBarModule
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
  results: GeneratedShotsResults | null = null;
  error: string | null = null;

  constructor(
    private generateShotsService: GenerateShotsService,
    private snackBar: MatSnackBar
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

    this.generateShotsService.generateShots(this.productionId, selectedIds)
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
  private loadResults(jobId: string): Observable<GeneratedShotsResults> {
    return this.generateShotsService.getJobResults(this.productionId, jobId).pipe(
      tap(results => {
        this.results = results;
        this.snackBar.open(`Successfully generated ${results.total_shots} shots!`, 'Close', {
          duration: 5000,
          panelClass: ['success-snackbar']
        });
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
    if (!this.results) return [];

    return Object.values(this.results.action_beats);
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
}
