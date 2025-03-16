import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent {
  @Input() title: string = ''; // Modal title
  @Input() show: boolean = false; // Controls visibility
  @Output() close = new EventEmitter<void>(); // Emit when closing

  closeModal() {
    this.close.emit();
  }
}
