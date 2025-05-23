import { Component, EventEmitter, Input, Output, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent {
  @Input() title: string = 'Modal Title';

  private _isOpen: boolean = false;

  @Input()
  set isOpen(value: boolean) {
    this._isOpen = value;
    if (this.cdr) {
      this.cdr.detectChanges();
    }
  }

  get isOpen(): boolean {
    return this._isOpen;
  }

  @Output() close = new EventEmitter<void>();

  constructor(private cdr: ChangeDetectorRef) {}

  closeModal(): void {
    this.isOpen = false;
    this.close.emit();
  }

  onOverlayClick(event: MouseEvent): void {
    this.closeModal();
  }
}
