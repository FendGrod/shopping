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
    const requiredRole = route.data['role'] as Role; // ← Récupère le rôle depuis les données de la route

    if (!currentUser) {
      this.router.navigate(['/connexion']);
      return false;
    }

    // Vérifie si l'utilisateur a le rôle requis ou est SUPER_ADMIN
    if (currentUser.role === requiredRole || currentUser.role === Role.SUPER_ADMIN) {
      return true;
    }

    this.router.navigate(['/accueil']);
    return false;
  }
}