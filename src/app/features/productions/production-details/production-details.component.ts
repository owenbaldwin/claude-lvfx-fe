import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ProductionService } from '@app/core/services/production.service';
import { ScriptService } from '@app/core/services/script.service';
import { ProductionUserService } from '@app/core/services/production-user.service';
import { Production, Script, ProductionUser } from '@app/shared/models';
import { ConfirmDialogComponent } from '@app/shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-production-details',
  templateUrl: './production-details.component.html',
  styleUrls: ['./production-details.component.scss']
})
export class ProductionDetailsComponent implements OnInit {
  production: Production | null = null;
  scripts: Script[] = [];
  productionUsers: ProductionUser[] = [];
  productionId: number = 0;
  loading = true;
  error = '';
  
  // Tab management
  selectedTabIndex = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productionService: ProductionService,
    private scriptService: ScriptService,
    private productionUserService: ProductionUserService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    // Check if there's a tab parameter in the URL
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.selectedTabIndex = this.getTabIndexFromName(params['tab']);
      }
    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.productionId = +id;
        this.loadProductionData(+id);
      } else {
        this.error = 'No production ID provided';
        this.loading = false;
      }
    });
  }

  loadProductionData(id: number): void {
    this.loading = true;

    this.productionService.getProduction(id).subscribe({
      next: (production) => {
        this.production = production;
        this.loadRelatedData(id);
      },
      error: (error) => {
        this.error = error.message || 'Failed to load production data';
        this.loading = false;
      }
    });
  }

  loadRelatedData(productionId: number): void {
    // Load scripts
    this.scriptService.getScriptsByProduction(productionId).subscribe({
      next: (scripts) => {
        this.scripts = scripts;
      },
      error: (error) => {
        console.error('Error loading scripts:', error);
      }
    });

    // Load production users
    this.productionUserService.getProductionUsersByProduction(productionId).subscribe({
      next: (users) => {
        this.productionUsers = users;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading production users:', error);
        this.loading = false;
      }
    });
  }

  editProduction(): void {
    if (this.production) {
      this.router.navigate(['/productions', this.production.id, 'edit']);
    }
  }

  deleteProduction(): void {
    if (!this.production) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Production',
        message: `Are you sure you want to delete "${this.production.title}"? This action cannot be undone and will remove all associated data.`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.productionService.deleteProduction(this.production!.id).subscribe({
          next: () => {
            this.snackBar.open('Production deleted successfully', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.router.navigate(['/productions']);
          },
          error: (error) => {
            this.snackBar.open(error.message || 'Failed to delete production', 'Close', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    });
  }

  createNewScript(): void {
    // Navigate to script creation page with production ID
    this.router.navigate(['/scripts/new'], { queryParams: { productionId: this.productionId } });
  }

  viewScript(scriptId: number): void {
    this.router.navigate(['/scripts', scriptId]);
  }

  addUser(): void {
    // Navigate to add user page with production ID
    this.router.navigate(['/productions', this.productionId, 'users', 'new']);
  }

  backToList(): void {
    this.router.navigate(['/productions']);
  }

  // Tab handling
  onTabChanged(index: number): void {
    // Update URL with the selected tab
    const tabName = this.getTabNameFromIndex(index);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: tabName },
      queryParamsHandling: 'merge'
    });
  }

  private getTabNameFromIndex(index: number): string {
    switch (index) {
      case 0: return 'overview';
      case 1: return 'breakdown';
      case 2: return 'budget';
      case 3: return 'assets';
      default: return 'overview';
    }
  }

  private getTabIndexFromName(name: string): number {
    switch (name.toLowerCase()) {
      case 'overview': return 0;
      case 'breakdown': return 1;
      case 'budget': return 2;
      case 'assets': return 3;
      default: return 0;
    }
  }
}
