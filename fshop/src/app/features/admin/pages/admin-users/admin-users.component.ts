import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UtilisateurService } from '../../../../../service/utilisateur-service';
import { AuthService } from '../../../../../service/auth.service';
import { Utilisateur, Role } from '../../../../../model/utilisateur';

declare var bootstrap: any;

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css']
})
export class AdminUsersComponent implements OnInit {
  admins: Utilisateur[] = [];
  filteredAdmins: Utilisateur[] = [];
  searchNom = '';
  searchEmail = '';
  searchRole = '';                     // ← AJOUTÉ
  allRoles = [Role.ADMIN, Role.SUPER_ADMIN]; // ← AJOUTÉ

  modalTitle = '';
  isEditMode = false;
  currentAdmin: Utilisateur = this.emptyAdmin();
  availableRoles = [Role.ADMIN, Role.SUPER_ADMIN];
  currentUserId: number | null = null;

  private modalInstance: any;

  constructor(
    private utilisateurService: UtilisateurService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUser()?.id || null;
    this.loadAdmins();
  }

  loadAdmins(): void {
    this.utilisateurService.readAll().subscribe({
      next: (data) => {
        this.admins = data.filter(u => u.role === Role.ADMIN || u.role === Role.SUPER_ADMIN);
        this.applyFilters();
      },
      error: (err) => console.error('Erreur chargement admins', err)
    });
  }

  applyFilters(): void {
    this.filteredAdmins = this.admins.filter(admin => {
      const matchNom = !this.searchNom ||
        `${admin.prenom} ${admin.nom}`.toLowerCase().includes(this.searchNom.toLowerCase());
      const matchEmail = !this.searchEmail ||
        admin.email.toLowerCase().includes(this.searchEmail.toLowerCase());
      const matchRole = !this.searchRole || admin.role === this.searchRole;   // ← AJOUTÉ
      return matchNom && matchEmail && matchRole;
    });
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.modalTitle = 'Ajouter un administrateur';
    this.currentAdmin = this.emptyAdmin();
    this.currentAdmin.role = Role.ADMIN;
    this.showModal();
  }

  openEditModal(admin: Utilisateur): void {
    this.isEditMode = true;
    this.modalTitle = 'Modifier un administrateur';
    this.currentAdmin = { ...admin };
    this.currentAdmin.motDePasse = '';
    this.showModal();
  }

  saveAdmin(): void {
    if (this.isEditMode) {
      // Empêcher un admin de modifier son propre rôle
      if (this.currentAdmin.id === this.currentUserId) {
        const originalRole = this.admins.find(a => a.id === this.currentAdmin.id)?.role;
        if (originalRole) this.currentAdmin.role = originalRole;
      }
      this.utilisateurService.update(this.currentAdmin.id!, this.currentAdmin).subscribe({
        next: () => {
          this.closeModal();
          this.loadAdmins();
        },
        error: (err) => console.error('Erreur mise à jour', err)
      });
    } else {
      this.currentAdmin.provider = 'LOCAL';
      this.utilisateurService.create(this.currentAdmin).subscribe({
        next: () => {
          this.closeModal();
          this.loadAdmins();
        },
        error: (err) => console.error('Erreur création', err)
      });
    }
  }

  deleteAdmin(id: number): void {
    if (id === this.currentUserId) {
      alert('Vous ne pouvez pas supprimer votre propre compte.');
      return;
    }
    if (confirm('Supprimer définitivement cet administrateur ?')) {
      this.utilisateurService.delete(id).subscribe({
        next: () => this.loadAdmins(),
        error: (err) => console.error('Erreur suppression', err)
      });
    }
  }

  resetFilters(): void {
    this.searchNom = '';
    this.searchEmail = '';
    this.searchRole = '';      // ← AJOUTÉ
    this.applyFilters();
  }

  // ← COMPTEURS SÉPARÉS
  getTotalAdmins(): number {
    return this.admins.filter(a => a.role === Role.ADMIN).length;
  }

  getTotalSuperAdmins(): number {
    return this.admins.filter(a => a.role === Role.SUPER_ADMIN).length;
  }

  private emptyAdmin(): Utilisateur {
    return {
      nom: '',
      prenom: '',
      email: '',
      motDePasse: '',
      telephone: '',
      adresse: '',
      role: Role.ADMIN,
      provider: 'LOCAL',
      providerId: ''
    };
  }

  private showModal(): void {
    const modalEl = document.getElementById('adminModal');
    if (modalEl) {
      this.modalInstance = new bootstrap.Modal(modalEl);
      this.modalInstance.show();
    }
  }

  closeModal(): void {
    if (this.modalInstance) this.modalInstance.hide();
  }
}