import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../service/auth.service';
import { Role } from '../../../../model/utilisateur';
import { UtilisateurService } from '../../../../service/utilisateur-service';

declare var google: any;

@Component({
  selector: 'app-connexion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './connexion.component.html',
  styleUrls: ['./connexion.component.css']
})
export class ConnexionComponent implements OnInit {
  showLogin = true;
  showRegister = false;

  loginEmail = '';
  loginPassword = '';

  registerPrenom = '';
  registerNom = '';
  registerEmail = '';
  registerPassword = '';
  registerConfirmPassword = '';
  registerTelephone = '';
  registerAdresse = '';

  errorMessage = '';
  successMessage = '';

  private readonly GOOGLE_CLIENT_ID = '958920125370-dnmjo97qhslv35cr5aleive3lbg7hduu.apps.googleusercontent.com';

  constructor(
    private authService: AuthService,
    private router: Router,
    private utilisateurService :UtilisateurService
  ) {}

  ngOnInit() {
    this.loadGoogleScript();
  }

  loadGoogleScript() {
    if (typeof google !== 'undefined') {
      this.initGoogle();
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => this.initGoogle();
    document.head.appendChild(script);
  }

  initGoogle() {
    if (typeof google === 'undefined') return;
    
    google.accounts.id.initialize({
      client_id: this.GOOGLE_CLIENT_ID,
      callback: (response: any) => this.handleGoogleLogin(response)
    });
    
    const loginButton = document.getElementById('google-login-button');
    if (loginButton) {
      google.accounts.id.renderButton(loginButton, { 
        theme: 'outline', 
        size: 'large', 
        width: '100%',
        text: 'continue_with'
      });
    }
    
    const registerButton = document.getElementById('google-login-button-register');
    if (registerButton) {
      google.accounts.id.renderButton(registerButton, { 
        theme: 'outline', 
        size: 'large', 
        width: '100%',
        text: 'continue_with'
      });
    }
  }

  // ⭐ MODIFICATION ICI : Redirige vers la bonne page selon le rôle ⭐
  handleGoogleLogin(response: any) {
    console.log('Réponse Google reçue');
    
    const payload = this.decodeJwt(response.credential);
    console.log('Infos utilisateur:', payload);
    
    // Envoyer au backend Spring Boot
    this.utilisateurService.googleLogin(
  payload.email,
  payload.sub,
  payload.family_name || '',
  payload.given_name || ''
).subscribe({
  next: (data) => {
    console.log('Backend réponse:', data);

    localStorage.setItem('currentUser', JSON.stringify(data));

    if (data.role === 'ADMIN' || data.role === 'SUPER_ADMIN') {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/accueil']);
    }
  },
  error: (err) => {
    console.error('Erreur:', err);
    this.errorMessage = 'Erreur de connexion avec Google';
  }
});
  }

  decodeJwt(token: string): any {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  }

  // ⭐ MODIFICATION ICI : Redirige selon le rôle ⭐
  onLoginSubmit() {
    this.authService.login(this.loginEmail, this.loginPassword).then((success) => {
      if (success) {
        const user = this.authService.getCurrentUser();
        // Redirection selon le rôle
        if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/accueil']);
        }
      } else {
        this.errorMessage = 'Email ou mot de passe incorrect';
      }
    });
  }

  onRegisterSubmit() {
    if (this.registerPassword !== this.registerConfirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas';
      return;
    }

    const newUser = {
      email: this.registerEmail,
      motDePasse: this.registerPassword,
      nom: this.registerNom,
      prenom: this.registerPrenom,
      telephone: this.registerTelephone,
      adresse: this.registerAdresse,
      provider: 'LOCAL',
      providerId: '',
      role: Role.CLIENT
    };

    this.authService.register(newUser).then((success) => {
      if (success) {
        this.successMessage = 'Inscription réussie ! Redirection vers connexion...';
        setTimeout(() => {
          this.allerVersConnexion();
          // Option: pré-remplir l'email
          this.loginEmail = this.registerEmail;
        }, 2000);
      } else {
        this.errorMessage = 'Erreur lors de l\'inscription';
      }
    });
  }

  allerVersInscription() {
    this.showLogin = false;
    this.showRegister = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  allerVersConnexion() {
    this.showRegister = false;
    this.showLogin = true;
    this.errorMessage = '';
    this.successMessage = '';
  }
}