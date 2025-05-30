import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ScriptService } from '@app/core/services/script.service';
import { Script } from '@app/shared/models';

@Component({
  selector: 'app-script-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './script-list.component.html',
  styleUrl: './script-list.component.scss'
})
export class ScriptListComponent implements OnInit {
  @Input() productionId!: number;

  scripts: Script[] = [];
  loading = false;
  error: string | null = null;

  constructor(private scriptService: ScriptService) {}

  ngOnInit(): void {
    console.log('ScriptListComponent ngOnInit - productionId:', this.productionId);
    if (this.productionId) {
      this.loadScripts();
    }
  }

  loadScripts(): void {
    console.log('Loading scripts for productionId:', this.productionId);
    this.loading = true;
    this.error = null;

    this.scriptService.getScriptsByProduction(this.productionId).subscribe({
      next: (scripts) => {
        console.log('Scripts loaded successfully:', scripts);
        this.scripts = scripts;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading scripts:', error);
        this.error = 'Failed to load scripts';
        this.loading = false;
      }
    });
  }

  getScriptColorHex(color: string): string {
    const colorMap: { [key: string]: string } = {
      'white': '#ffffff',
      'blue': '#4285f4',
      'pink': '#ea4335',
      'yellow': '#fbbc04',
      'green': '#34a853',
      'goldenrod': '#daa520',
      'tan': '#d2b48c',
      'cherry': '#de3163',
      'salmon': '#fa8072'
    };
    return colorMap[color] || '#ffffff';
  }

  getScriptColorLabel(color: string): string {
    const labelMap: { [key: string]: string } = {
      'white': 'Production',
      'blue': 'Revisions',
      'pink': 'Changes',
      'yellow': 'Second Revisions',
      'green': 'Third Revisions',
      'goldenrod': 'Fourth Revisions',
      'tan': 'Fifth Revisions',
      'cherry': 'Sixth Revisions',
      'salmon': 'Final Draft'
    };
    return labelMap[color] || 'Draft';
  }

  viewScript(script: Script): void {
    // TODO: Navigate to script detail view
    console.log('Viewing script:', script);
  }

  downloadScript(script: Script): void {
    // TODO: Implement script download
    console.log('Downloading script:', script);
  }

  trackByScriptId(index: number, script: Script): number {
    return script.id;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
