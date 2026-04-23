import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { UtilisateurService } from './utilisateur-service';
import { Utilisateur,Role } from '../model/utilisateur';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser: Utilisateur | null = null;

  constructor(
    private router: Router,
    private utilisateurService: UtilisateurService
  ) {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser);
    }
  }

  // Connexion classique
  login(email: string, motDePasse: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.utilisateurService.verifyPassword(email, motDePasse).subscribe({
        next: (isValid: boolean) => {
          if (isValid) {
            this.utilisateurService.findByEmail(email).subscribe({
              next: (user: Utilisateur) => {
               this.currentUser = user;
               localStorage.setItem('currentUser', JSON.stringify(user)); // ← cette ligne est essentielle
               resolve(true);

              },
              error: (err: Error) => {
                console.error(err);
                resolve(false);
              }
            });
          } else {
            resolve(false);
          }
        },
        error: (err: Error) => {
          console.error(err);
          resolve(false);
        }
      });
    });
  }

  // // Connexion Google (redirection Spring Boot)
  // googleLogin(): void {
  //   window.location.href = 'http://localhost:9091/oauth2/authorization/google';
  // }

  // Inscription
// Inscription
register(utilisateur: Utilisateur): Promise<boolean> {
  return new Promise((resolve) => {
    this.utilisateurService.create(utilisateur).subscribe({
      next: (user: Utilisateur) => {
        this.currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        resolve(true);
      },
      error: (err: Error) => {
        console.error('Erreur inscription:', err);
        resolve(false);
      }
    });
  });
}

 // Déconnexion
logout(): void {
  this.currentUser = null;
  localStorage.removeItem('currentUser');
  this.router.navigate(['/connexion']);
}

// Récupérer le rôle de l'utilisateur
getUserRole(): Role | null {
  return this.currentUser?.role || null;
}

// Vérifier si l'utilisateur est Admin ou Super Admin
isAdminOrSuperAdmin(): boolean {
  const role = this.currentUser?.role;
  return role === Role.ADMIN || role === Role.SUPER_ADMIN;
}

// Vérifier si connecté
isLoggedIn(): boolean {
  return this.currentUser !== null;
}

// Récupérer l'utilisateur
getCurrentUser(): Utilisateur | null {
  return this.currentUser;
}
}