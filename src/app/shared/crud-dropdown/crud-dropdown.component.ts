import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-crud-dropdown',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './crud-dropdown.component.html',
  styleUrl: './crud-dropdown.component.scss'
})
export class CrudDropdownComponent {
  @Input() entityLabel!: string;           // e.g., 'Sequence', 'Scene'
  @Input() elementId!: string | number;           // Unique ID
  @Input() addLabel: string = 'Add New';   // Optional custom label

  // Optional boolean inputs to control which options are shown
  @Input() showAdd: boolean = true;
  @Input() showEdit: boolean = true;
  @Input() showVersion: boolean = true;
  @Input() showDelete: boolean = true;

  @Output() add = new EventEmitter<void>();
  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();
  @Output() version = new EventEmitter<void>();
}
