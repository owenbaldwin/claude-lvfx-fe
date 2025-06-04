import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ScriptService } from '@app/core/services/script.service';
import { Script } from '@app/shared/models';

interface ColorOption {
  value: string;
  label: string;
  hex: string;
}

@Component({
  selector: 'app-script-upload',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatProgressBarModule
  ],
  templateUrl: './script-upload.component.html',
  styleUrl: './script-upload.component.scss'
})
export class ScriptUploadComponent {
  @Input() productionId!: number;
  @Output() uploadComplete = new EventEmitter<void>();
  @Output() uploadCancel = new EventEmitter<void>();

  uploadForm: FormGroup;
  selectedFile: File | null = null;
  uploading = false;

  colorOptions: ColorOption[] = [
    { value: 'white', label: 'White (Production)', hex: '#ffffff' },
    { value: 'blue', label: 'Blue (Revisions)', hex: '#4285f4' },
    { value: 'pink', label: 'Pink (Changes)', hex: '#ea4335' },
    { value: 'yellow', label: 'Yellow (Second Revisions)', hex: '#fbbc04' },
    { value: 'green', label: 'Green (Third Revisions)', hex: '#34a853' },
    { value: 'goldenrod', label: 'Goldenrod (Fourth Revisions)', hex: '#daa520' },
    { value: 'tan', label: 'Tan (Fifth Revisions)', hex: '#d2b48c' },
    { value: 'cherry', label: 'Cherry (Sixth Revisions)', hex: '#de3163' },
    { value: 'salmon', label: 'Salmon (Final Draft)', hex: '#fa8072' }
  ];

  constructor(
    private fb: FormBuilder,
    private scriptService: ScriptService,
    private snackBar: MatSnackBar
  ) {
    this.uploadForm = this.fb.group({
      file: ['', Validators.required],
      version_number: ['', [Validators.required, Validators.maxLength(20)]],
      color: ['', Validators.required],
      description: ['', Validators.maxLength(500)]
    });
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Validate file type
      if (file.type !== 'application/pdf') {
        this.snackBar.open('Please select a PDF file', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        return;
      }

      // Validate file size (50MB limit)
      const maxSize = 50 * 1024 * 1024; // 50MB in bytes
      if (file.size > maxSize) {
        this.snackBar.open('File size must be less than 50MB', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        return;
      }

      this.selectedFile = file;
      this.uploadForm.patchValue({ file: file.name });
      this.uploadForm.get('file')?.markAsTouched();
    }
  }

  removeFile(): void {
    this.selectedFile = null;
    this.uploadForm.patchValue({ file: '' });

    // Reset the file input
    const fileInput = document.getElementById('scriptFile') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  selectColor(color: string): void {
    this.uploadForm.patchValue({ color });
    this.uploadForm.get('color')?.markAsTouched();
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }


  // onSubmit(): void {
  //   // guard against invalid form or no file
  //   if (!this.uploadForm.valid || !this.selectedFile) {
  //     // mark touched to show validation
  //     Object.keys(this.uploadForm.controls).forEach(key =>
  //       this.uploadForm.get(key)?.markAsTouched()
  //     );
  //     return;
  //   }

  //   this.uploading = true;

  //   const formData = new FormData();
  //   formData.append('script[file]',             this.selectedFile);
  //   formData.append('script[version_number]',    this.uploadForm.get('version_number')!.value);
  //   formData.append('script[color]',            this.uploadForm.get('color')!.value);
  //   formData.append('script[production_id]',    this.productionId.toString());

  //   const description = this.uploadForm.get('description')!.value;
  //   if (description) {
  //     formData.append('script[description]', description);
  //   }

  //   this.scriptService.uploadScript(this.productionId, formData)
  //     .subscribe({
  //       next: (response: Script) => {
  //         this.snackBar.open('Script uploaded successfully', 'Close', {
  //           duration: 3000,
  //           panelClass: ['success-snackbar']
  //         });
  //         this.uploading = false;
  //         this.uploadComplete.emit();
  //       },
  //       error: (error: any) => {
  //         this.snackBar.open(
  //           error.message || 'Failed to upload script',
  //           'Close',
  //           {
  //             duration: 5000,
  //             panelClass: ['error-snackbar']
  //           }
  //         );
  //         this.uploading = false;
  //       }
  //     });
  // }

  onSubmit(): void {
    // 1) guard
    if (!this.uploadForm.valid || !this.selectedFile) {
      Object.keys(this.uploadForm.controls).forEach(key =>
        this.uploadForm.get(key)?.markAsTouched()
      );
      return;
    }

    this.uploading = true;

    // 2) build the multipart/form-data payload
    const form = new FormData();
    // 💥 use the un‐nested keys that Rails actually permits:
    form.append('file',             this.selectedFile!);
    form.append('version_number',   this.uploadForm.get('version_number')!.value);
    form.append('color',            this.uploadForm.get('color')!.value);
    if (this.uploadForm.get('description')!.value) {
      form.append('description', this.uploadForm.get('description')!.value);
    }
    // 3) fire the upload
    this.scriptService
      .uploadScript(this.productionId, form)
      .subscribe({
        next: (newScript) => {
          this.snackBar.open('Script uploaded!', 'Close', { duration: 3000 });
          this.uploading = false;
          this.uploadComplete.emit();
        },
        error: (err) => {
          this.snackBar.open(err.error?.errors?.join(', ') || 'Upload failed', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          this.uploading = false;
        }
      });
  }



  onCancel(): void {
    this.uploadCancel.emit();
  }
}
