import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, takeWhile, switchMap, finalize } from 'rxjs';
import { ScriptService, ParseJobStatusResponse } from './script.service';
import { GenerateShotsService, JobStatusResponse } from './generate-shots.service';

export interface ProgressNotification {
  id: string;
  title: string;
  message: string;
  progress: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  currentStep?: string;
  error?: string;
  visible: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProgressNotificationService {
  private notifications$ = new BehaviorSubject<ProgressNotification[]>([]);

  constructor(
    private scriptService: ScriptService,
    private generateShotsService: GenerateShotsService
  ) {}

  getNotifications() {
    return this.notifications$.asObservable();
  }

  /**
   * Start monitoring a script parsing job
   */
  monitorScriptParsing(
    productionId: number,
    scriptId: number,
    jobId: string,
    scriptName: string
  ): void {
    const notification: ProgressNotification = {
      id: jobId,
      title: 'Parsing Script',
      message: `Parsing "${scriptName}"...`,
      progress: 0,
      status: 'pending',
      visible: true
    };

    this.addNotification(notification);

    // Poll for status updates every 2 seconds
    interval(2000)
      .pipe(
        switchMap(() => this.scriptService.getParseJobStatus(productionId, scriptId, jobId)),
        takeWhile((status: ParseJobStatusResponse) =>
          status.status === 'pending' || status.status === 'processing', true
        ),
        finalize(() => this.autoHideNotification(jobId))
      )
      .subscribe({
        next: (status: ParseJobStatusResponse) => {
          this.updateNotification(jobId, {
            progress: status.progress || 0,
            status: status.status,
            currentStep: status.current_step,
            error: status.error,
            message: this.getScriptParsingStatusMessage(status, scriptName)
          });
        },
        error: (error) => {
          this.updateNotification(jobId, {
            status: 'failed',
            error: 'Failed to get job status',
            message: `Failed to parse "${scriptName}"`
          });
        }
      });
  }

  /**
   * Start monitoring a shot generation job
   */
  monitorShotGeneration(
    productionId: number,
    jobId: string,
    beatCount: number
  ): void {
    const notification: ProgressNotification = {
      id: jobId,
      title: 'Generating Shots',
      message: `Generating shots for ${beatCount} action beats...`,
      progress: 0,
      status: 'pending',
      visible: true
    };

    this.addNotification(notification);

    // Poll for status updates every 2 seconds
    interval(2000)
      .pipe(
        switchMap(() => this.generateShotsService.getJobStatus(productionId, jobId)),
        takeWhile((status: JobStatusResponse) =>
          status.status === 'pending' || status.status === 'processing', true
        ),
        finalize(() => this.autoHideNotification(jobId))
      )
      .subscribe({
        next: (status: JobStatusResponse) => {
          this.updateNotification(jobId, {
            progress: status.progress || 0,
            status: status.status,
            error: status.error,
            message: this.getShotGenerationStatusMessage(status, beatCount)
          });
        },
        error: (error) => {
          this.updateNotification(jobId, {
            status: 'failed',
            error: 'Failed to get job status',
            message: `Failed to generate shots`
          });
        }
      });
  }

  private getScriptParsingStatusMessage(status: ParseJobStatusResponse, scriptName: string): string {
    switch (status.status) {
      case 'pending':
        return `Waiting to parse "${scriptName}"...`;
      case 'processing':
        return status.current_step || `Parsing "${scriptName}"...`;
      case 'completed':
        return `Successfully parsed "${scriptName}"`;
      case 'failed':
        return `Failed to parse "${scriptName}"`;
      default:
        return `Parsing "${scriptName}"...`;
    }
  }

  private getShotGenerationStatusMessage(status: JobStatusResponse, beatCount: number): string {
    switch (status.status) {
      case 'pending':
        return `Waiting to generate shots for ${beatCount} action beats...`;
      case 'processing':
        return `Generating shots for ${beatCount} action beats...`;
      case 'completed':
        return `Successfully generated shots for ${beatCount} action beats`;
      case 'failed':
        return `Failed to generate shots`;
      default:
        return `Generating shots for ${beatCount} action beats...`;
    }
  }

  private autoHideNotification(jobId: string): void {
    // Auto-hide the notification after 5 seconds if completed successfully
    setTimeout(() => {
      const current = this.notifications$.value;
      const updated = current.map(n =>
        n.id === jobId ? { ...n, visible: false } : n
      );
      this.notifications$.next(updated);
    }, 5000);
  }

  private addNotification(notification: ProgressNotification): void {
    const current = this.notifications$.value;
    this.notifications$.next([...current, notification]);
  }

  private updateNotification(id: string, updates: Partial<ProgressNotification>): void {
    const current = this.notifications$.value;
    const updated = current.map(notification =>
      notification.id === id ? { ...notification, ...updates } : notification
    );
    this.notifications$.next(updated);
  }

  dismissNotification(id: string): void {
    const current = this.notifications$.value;
    const updated = current.filter(notification => notification.id !== id);
    this.notifications$.next(updated);
  }

  clearAllNotifications(): void {
    this.notifications$.next([]);
  }
}
