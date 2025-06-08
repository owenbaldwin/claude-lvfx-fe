# Generate Shots Implementation

This implementation provides a complete Angular solution for generating shots from selected action beats using a job-based processing system with real-time polling.

## Architecture Overview

### 1. GenerateShotsService (`src/app/core/services/generate-shots.service.ts`)

The service handles all HTTP communications for the shot generation process:

```typescript
// Main methods:
generateShots(beatIds: number[]): Observable<{job_id: string}>
getJobStatus(jobId: string): Observable<JobStatusResponse>
getJobResults(jobId: string): Observable<GeneratedShotsResults>
```

**API Endpoints:**
- `POST /api/action_beats/generate_shots` - Initiates shot generation
- `GET /api/action_beats/generate_shots/:job_id/status` - Polls job status
- `GET /api/action_beats/generate_shots/:job_id/results` - Retrieves final results

### 2. GenerateShotsComponent (`src/app/features/productions/generate-shots/`)

A comprehensive component that handles:

#### State Management
- Loading/polling states with spinner
- Error handling with user-friendly messages
- Results display with shot grouping by action beat

#### RxJS Implementation
Uses advanced RxJS operators for robust polling:

```typescript
this.generateShotsService.generateShots(selectedIds)
  .pipe(
    tap(response => this.jobId = response.job_id),
    switchMap(response => this.pollJobStatus(response.job_id)),
    takeUntil(this.destroy$),
    catchError(error => this.handleError('Failed to start', error)),
    finalize(() => this.isGenerating = false)
  )
  .subscribe();
```

#### Polling Logic
```typescript
private pollJobStatus(jobId: string): Observable<any> {
  return timer(0, 2000).pipe(
    switchMap(() => this.generateShotsService.getJobStatus(jobId)),
    takeWhile(status => status.status !== 'completed' && status.status !== 'failed', true),
    // ... error handling and completion logic
  );
}
```

### 3. Integration with Production Breakdown

The component integrates seamlessly with the existing production breakdown interface:

#### Checkbox Selection
Automatically detects selected action beats using DOM queries:
```typescript
private getSelectedActionBeatIds(): number[] {
  const checkboxes = document.querySelectorAll('input[id^="check-actionB-"]:checked');
  // ... extraction logic
}
```

#### Modal Integration
Opens in a modal dialog accessible from the main production breakdown toolbar.

## Key Features

### ✅ Comprehensive Error Handling
- Network errors with retry functionality
- Job failure states with detailed error messages
- User-friendly snackbar notifications

### ✅ Real-time Status Updates
- 2-second polling interval
- Progress bar for jobs that report progress
- Status text updates (pending → processing → completed)

### ✅ Results Display
- Shots grouped by originating action beat
- Shot details including type, description, duration, notes
- Responsive grid layout for shot cards

### ✅ User Experience
- Loading spinners during processing
- Success notifications with shot count
- Clean, Material Design interface

## Usage Example

1. **Select Action Beats**: Check boxes next to desired action beats in the production breakdown
2. **Click Generate**: Press "Generate Shots" button in the toolbar
3. **Monitor Progress**: Watch real-time status updates and progress bar
4. **View Results**: Browse generated shots organized by action beat
5. **Generate More**: Reset and generate additional shots as needed

## File Structure

```
src/app/
├── core/services/
│   └── generate-shots.service.ts          # HTTP service for API calls
├── features/productions/
│   ├── generate-shots/
│   │   ├── generate-shots.component.ts    # Main component logic
│   │   ├── generate-shots.component.html  # Template with states
│   │   └── generate-shots.component.scss  # Responsive styling
│   └── production-breakdown/
│       ├── production-breakdown.component.ts   # Integration point
│       └── production-breakdown.component.html # Modal integration
```

## Dependencies

### Required Angular Material Modules
- `MatProgressSpinnerModule` - Loading spinners
- `MatButtonModule` - Action buttons
- `MatIconModule` - Status icons
- `MatCardModule` - Result cards
- `MatProgressBarModule` - Progress indicators
- `MatSnackBarModule` - Notifications

### Required RxJS Operators
- `switchMap` - Chaining API calls
- `timer` - Polling implementation
- `takeWhile` - Conditional polling
- `takeUntil` - Cleanup on destroy
- `tap` - Side effects
- `catchError` - Error handling
- `finalize` - Cleanup actions

## Backend API Requirements

The implementation expects these API endpoints:

### POST /api/action_beats/generate_shots
```json
// Request
{
  "action_beat_ids": [1, 2, 3]
}

// Response
{
  "job_id": "uuid-string"
}
```

### GET /api/action_beats/generate_shots/:job_id/status
```json
{
  "status": "pending|processing|completed|failed",
  "progress": 45,  // optional percentage
  "error": "Error message if failed"  // optional
}
```

### GET /api/action_beats/generate_shots/:job_id/results
```json
{
  "action_beats": {
    "1": {
      "action_beat_id": 1,
      "action_beat_text": "Hero draws sword",
      "shots": [
        {
          "id": 101,
          "shot_number": "010",
          "description": "Close-up of hero's hand gripping sword",
          "shot_type": "CU",
          "duration": 2.5,
          "notes": "Focus on emotional weight"
        }
      ]
    }
  },
  "total_shots": 5
}
```

## Installation

1. The service is already registered as `providedIn: 'root'`
2. `HttpClientModule` is already imported in `AppModule`
3. Add the component to your production breakdown imports
4. Wire up the modal as shown in the integration example

## Customization

### Polling Interval
Change the polling frequency by modifying the timer interval:
```typescript
// Currently 2 seconds, change to 5 seconds:
return timer(0, 5000).pipe(...)
```

### Styling
Customize the appearance by modifying `generate-shots.component.scss`:
- Colors and themes
- Card layouts
- Responsive breakpoints
- Animation effects

### Error Messages
Customize error handling in the `handleError` method:
```typescript
private handleError(message: string, error: any): void {
  // Custom error processing logic
}
```

This implementation provides a production-ready solution for shot generation with excellent user experience and robust error handling.
