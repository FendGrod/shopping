import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../service/auth.service';
import { Utilisateur, Role } from '../../../../model/utilisateur';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  currentUser: Utilisateur | null = null;
  isSuperAdmin = false;
  activeMenu = 'dashboard';

  @Output() menuChange = new EventEmitter<string>();

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.isSuperAdmin = this.currentUser?.role === Role.SUPER_ADMIN;
  }

  setActiveMenu(menu: string) {
    this.activeMenu = menu;
    this.menuChange.emit(menu);
  }

  logout() {
    this.authService.logout();
  }

  menus = [
    {
      group: 'Principal',
      items: [
        { label: 'Dashboard', icon: 'tachometer-alt', key: 'dashboard' }
      ]
    },
    {
      group: 'Gestion',
      items: [
        { label: 'Utilisateurs', icon: 'users', key: 'users' },
        { label: 'Produits', icon: 'box', key: 'products' },
        { label: 'Catégories', icon: 'tags', key: 'categories' },
        { label: 'Commandes', icon: 'shopping-cart', key: 'orders' }
      ]
    }
  ];

  superAdminMenu = [
    {
      group: 'Administration',
      items: [
        { label: 'Admins', icon: 'user-shield', key: 'admins' }
      ]
    }
  ];
}