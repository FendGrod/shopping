import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../../../shared/composant/sidebar/sidebar.component';
import { AdminHeaderComponent } from '../../../../../shared/composant/admin-header/admin-header.component';
import { RouterModule } from "@angular/router";

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, SidebarComponent, AdminHeaderComponent, RouterModule],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css'
})
export class AdminLayoutComponent {

  activeMenu = 'dashboard';
  sidebarOpen = false;  // ← changé : false par défaut sur mobile

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  onMenuChange(menu: string) {
    this.activeMenu = menu;
    // Sur mobile, fermer la sidebar après avoir cliqué sur un menu
    if (window.innerWidth <= 768) {
      this.sidebarOpen = false;
    }
  }

  // Optionnel : fermer la sidebar si on redimensionne au-dessus de mobile
  @HostListener('window:resize', ['$event'])
onResize(event: Event) {  // ← AJOUTE "event: Event"
  if (window.innerWidth > 768) {
    this.sidebarOpen = true;
  } else {
    this.sidebarOpen = false;
  }
}
}