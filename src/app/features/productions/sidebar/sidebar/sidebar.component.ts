import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComplexitiesComponent } from '../complexities/complexities.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, ComplexitiesComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  @Input() productionId!: number;

  selectedSection: string = '';

  selectSection(section: string): void {
    this.selectedSection = this.selectedSection === section ? '' : section;
  }
}
