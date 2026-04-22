import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../service/auth.service';
import { Utilisateur } from '../../../../model/utilisateur';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-header.component.html',
  styleUrls: ['./admin-header.component.css']
})
export class AdminHeaderComponent {
  @Input() activeMenu = 'dashboard';
  currentUser: Utilisateur | null = null;

  constructor(private authService: AuthService) {
    this.currentUser = this.authService.getCurrentUser();
  }

  getMenuTitle(): string {
    const titles: { [key: string]: string } = {
      dashboard: 'Tableau de bord',
      users: 'Gestion des utilisateurs',
      products: 'Gestion des produits',
      orders: 'Gestion des commandes',
      categories: 'Gestion des catégories',
      admins: 'Gestion des administrateurs'
    };
    return titles[this.activeMenu] || 'Administration';
  }

  getMenuIcon(): string {
    const icons: { [key: string]: string } = {
      dashboard: 'tachometer-alt',
      users: 'users',
      products: 'box',
      orders: 'shopping-cart',
      categories: 'tags',
      admins: 'user-shield'
    };
    return icons[this.activeMenu] || 'cog';
  }

  logout() {
    this.authService.logout();
  }

  getUserName(): string {
    if (this.currentUser) {
      return `${this.currentUser.prenom} ${this.currentUser.nom}`;
    }
    return '';
  }
}