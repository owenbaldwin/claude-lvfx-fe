import { Injectable } from '@angular/core';
import { 
  CanActivate, 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot, 
  Router 
} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(private router: Router) {}
  
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // Check if user is logged in by looking for the token
    const token = localStorage.getItem('auth_token');
    
    if (token) {
      // Additional checks could be added here
      // For example, check if token is expired by decoding JWT
      return true;
    }
    
    // If not authenticated, redirect to login page
    this.router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url }});
    return false;
  }
}