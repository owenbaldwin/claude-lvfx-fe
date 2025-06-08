import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { ProgressNotificationService, ProgressNotification } from '@app/core/services/progress-notification.service';

@Component({
  selector: 'app-progress-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './progress-notifications.component.html',
  styleUrls: ['./progress-notifications.component.scss']
})
export class ProgressNotificationsComponent implements OnInit, OnDestroy {
  notifications: ProgressNotification[] = [];
  private destroy$ = new Subject<void>();

  constructor(private progressService: ProgressNotificationService) {}

  ngOnInit(): void {
    this.progressService.getNotifications()
      .pipe(takeUntil(this.destroy$))
      .subscribe(notifications => {
        this.notifications = notifications.filter(n => n.visible);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackByNotificationId(index: number, notification: ProgressNotification): string {
    return notification.id;
  }

  dismissNotification(id: string): void {
    this.progressService.dismissNotification(id);
  }

  getProgressColor(status: string): string {
    switch (status) {
      case 'completed':
        return '#10b981'; // green
      case 'failed':
        return '#ef4444'; // red
      case 'processing':
        return '#3b82f6'; // blue
      default:
        return '#6b7280'; // gray
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'completed':
        return '✓';
      case 'failed':
        return '✗';
      case 'processing':
        return '⟳';
      default:
        return '●';
    }
  }
}
