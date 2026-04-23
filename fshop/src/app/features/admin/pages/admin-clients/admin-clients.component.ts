import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UtilisateurService } from '../../../../../service/utilisateur-service';
import { AuthService } from '../../../../../service/auth.service';
import { Utilisateur, Role } from '../../../../../model/utilisateur';

declare var bootstrap: any;

@Component({
  selector: 'app-admin-clients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-clients.component.html',
  styleUrls: ['./admin-clients.component.css']
})
export class AdminClientsComponent implements OnInit {
  clients: Utilisateur[] = [];
  filteredClients: Utilisateur[] = [];
  searchNom = '';
  searchEmail = '';

  modalTitle = '';
  currentClient: Utilisateur = this.emptyClient();
  private modalInstance: any;

  constructor(
    private utilisateurService: UtilisateurService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.utilisateurService.readAll().subscribe({
      next: (data) => {
        this.clients = data.filter(u => u.role === Role.CLIENT);
        this.applyFilters();
      },
      error: (err) => console.error('Erreur chargement clients', err)
    });
  }

  applyFilters(): void {
    this.filteredClients = this.clients.filter(client => {
      const matchNom = !this.searchNom || 
        `${client.prenom} ${client.nom}`.toLowerCase().includes(this.searchNom.toLowerCase());
      const matchEmail = !this.searchEmail || 
        client.email.toLowerCase().includes(this.searchEmail.toLowerCase());
      return matchNom && matchEmail;
    });
  }

  openEditModal(client: Utilisateur): void {
    this.modalTitle = 'Modifier un client';
    this.currentClient = { ...client };
    this.currentClient.motDePasse = ''; // ne pas afficher
    this.showModal();
  }

  saveClient(): void {
    this.utilisateurService.update(this.currentClient.id!, this.currentClient).subscribe({
      next: () => {
        this.closeModal();
        this.loadClients();
      },
      error: (err) => console.error('Erreur mise à jour', err)
    });
  }

  deleteClient(id: number): void {
    if (confirm('Supprimer définitivement ce client ?')) {
      this.utilisateurService.delete(id).subscribe({
        next: () => this.loadClients(),
        error: (err) => console.error('Erreur suppression', err)
      });
    }
  }

  resetFilters(): void {
    this.searchNom = '';
    this.searchEmail = '';
    this.applyFilters();
  }

  getTotalClients(): number {
    return this.clients.length;
  }

  private emptyClient(): Utilisateur {
    return {
      nom: '',
      prenom: '',
      email: '',
      motDePasse: '',
      telephone: '',
      adresse: '',
      role: Role.CLIENT,
      provider: 'LOCAL',
      providerId: ''
    };
  }

  private showModal(): void {
    const modalEl = document.getElementById('clientModal');
    if (modalEl) {
      this.modalInstance = new bootstrap.Modal(modalEl);
      this.modalInstance.show();
    }
  }

  closeModal(): void {
    if (this.modalInstance) this.modalInstance.hide();
  }
}