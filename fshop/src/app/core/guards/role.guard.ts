import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../service/auth.service';
import { Role } from '../../../model/utilisateur';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(role: Role): boolean {
    const currentUser = this.authService.getCurrentUser();
    
    if (currentUser && currentUser.role === role) {
      return true;
    } else if (currentUser && currentUser.role === Role.SUPER_ADMIN) {
      // Super Admin a accès à tout
      return true;
    } else {
      this.router.navigate(['/accueil']);
      return false;
    }
  }
}