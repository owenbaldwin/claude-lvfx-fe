import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { ProductionService } from '@app/core/services/production.service';
import { Production } from '@app/shared/models';
import { ConfirmDialogComponent } from '@app/shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-productions-list',
  templateUrl: './productions-list.component.html',
  styleUrls: ['./productions-list.component.scss']
})
export class ProductionsListComponent implements OnInit {
  productions: Production[] = [];
  dataSource = new MatTableDataSource<Production>([]);
  displayedColumns: string[] = ['title', 'status', 'startDate', 'endDate', 'actions'];
  loading = true;
  error = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private productionService: ProductionService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadProductions();
  }

  loadProductions(): void {
    this.loading = true;
    this.productionService.getProductions()
      .subscribe({
        next: (productions) => {
          this.productions = productions;
          this.dataSource.data = productions;
          this.loading = false;

          // Apply paginator and sort after data is loaded
          setTimeout(() => {
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
          });
        },
        error: (error) => {
          this.error = error.message || 'An error occurred while loading productions';
          this.loading = false;
        }
      });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  navigateToProductionDetails(id: number): void {
    this.router.navigate(['/productions', id]);
  }

  navigateToProductionEdit(id: number, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/productions', id, 'edit']);
  }

  openDeleteDialog(id: number, title: string, event: Event): void {
    event.stopPropagation();
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Production',
        message: `Are you sure you want to delete "${title}"? This action cannot be undone.`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteProduction(id);
      }
    });
  }

  deleteProduction(id: number): void {
    this.productionService.deleteProduction(id)
      .subscribe({
        next: () => {
          this.snackBar.open('Production deleted successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadProductions();
        },
        error: (error) => {
          this.snackBar.open(error.message || 'Failed to delete production', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  createNewProduction(): void {
    this.router.navigate(['/productions/new']);
  }
}