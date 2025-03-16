import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type ElementType = 'sequence' | 'scene' | 'actionBeat' | 'shot';

interface FormField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'textarea' | 'select';
  required?: boolean;
  options?: string[];
}


@Component({
  selector: 'app-element-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './element-form.component.html',
  styleUrls: ['./element-form.component.scss']
})
export class ElementFormComponent {
  @Input() element: any = {};
  @Input() type: ElementType = 'sequence';
  @Input() isEditing: boolean = false;

  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  get fields(): FormField[] {
    switch (this.type) {
      case 'sequence':
        return [
          { key: 'name', label: 'Name', type: 'text', required: true },
          { key: 'number', label: 'Number', type: 'number', required: true },
          { key: 'description', label: 'Description', type: 'textarea' }
        ];
      case 'scene':
        return [
          { key: 'number', label: 'Number', type: 'number', required: true },
          { key: 'name', label: 'Name', type: 'text' },
          { key: 'location', label: 'Location', type: 'text' },
          { key: 'timeOfDay', label: 'Time of Day', type: 'text' }
        ];
      case 'actionBeat':
        return [
          { key: 'number', label: 'Number', type: 'number', required: true },
          { key: 'description', label: 'Description', type: 'textarea', required: true },
          { key: 'type', label: 'Type', type: 'select', options: ['dialogue', 'action'], required: true }
        ];
      case 'shot':
        return [
          { key: 'number', label: 'Number', type: 'number', required: true },
          { key: 'description', label: 'Description', type: 'textarea' },
          { key: 'camera', label: 'Camera', type: 'text' },
          { key: 'framing', label: 'Framing', type: 'text' },
          { key: 'movement', label: 'Movement', type: 'text' },
          { key: 'duration', label: 'Duration (seconds)', type: 'number' }
        ];
      default:
        return [];
    }
  }


  onSubmit() {
    this.save.emit(this.element);
  }

  onCancel() {
    this.cancel.emit();
  }
}
