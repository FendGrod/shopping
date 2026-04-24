import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
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

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const currentUser = this.authService.getCurrentUser();
    const requiredRole = route.data['role'] as Role;

    console.log('=== RoleGuard DEBUG ===');
    console.log('currentUser:', currentUser);
    console.log('requiredRole:', requiredRole);
    console.log('currentUser?.role:', currentUser?.role);
    console.log('Role.SUPER_ADMIN:', Role.SUPER_ADMIN);

    if (!currentUser) {
      console.log('Pas d\'utilisateur -> redirection connexion');
      this.router.navigate(['/connexion']);
      return false;
    }

    if (currentUser.role === requiredRole || currentUser.role === Role.SUPER_ADMIN) {
      console.log('Accès autorisé');
      return true;
    }

    console.log('Accès refusé -> redirection accueil');
    this.router.navigate(['/accueil']);
    return false;
  }
}