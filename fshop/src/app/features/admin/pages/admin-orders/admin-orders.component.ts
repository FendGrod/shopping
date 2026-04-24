import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommandeService } from '../../../../../service/commande.service';
import { Commande, LigneCommande } from '../../../../../model/commande';

declare var bootstrap: any;

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-orders.component.html',
  styleUrls: ['./admin-orders.component.css']
})
export class AdminOrdersComponent implements OnInit {
  
  commandes: Commande[] = [];
  filteredCommandes: Commande[] = [];
  isLoading = true;
  errorMessage = '';
  
  // Filtres
  searchTerm = '';
  selectedStatut = '';
  dateDebut = '';
  dateFin = '';
  
  // Modal
  selectedCommande: Commande | null = null;
  selectedLignes: LigneCommande[] = [];
  nouveauStatut = '';
  statuts = ['EN_ATTENTE', 'CONFIRMEE', 'EXPEDIEE', 'LIVREE', 'ANNULEE'];
  statutsLabels: { [key: string]: string } = {
    'EN_ATTENTE': 'En attente',
    'CONFIRMEE': 'Confirmée',
    'EXPEDIEE': 'Expédiée',
    'LIVREE': 'Livrée',
    'ANNULEE': 'Annulée'
  };
  
  private detailsModalInstance: any;
  private statutModalInstance: any;

  constructor(private commandeService: CommandeService) {}

  ngOnInit() {
    this.loadCommandes();
  }

  loadCommandes() {
    this.isLoading = true;
    this.commandeService.getAllCommandes().subscribe({
      next: (data) => {
        this.commandes = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.errorMessage = 'Erreur lors du chargement des commandes';
        this.isLoading = false;
      }
    });
  }

  applyFilters() {
    let result = [...this.commandes];
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(c => 
        c.reference?.toLowerCase().includes(term) ||
        c.utilisateur?.nom?.toLowerCase().includes(term) ||
        c.utilisateur?.email?.toLowerCase().includes(term)
      );
    }
    
    if (this.selectedStatut) {
      result = result.filter(c => c.statut === this.selectedStatut);
    }
    
    if (this.dateDebut) {
      result = result.filter(c => new Date(c.dateCommande) >= new Date(this.dateDebut));
    }
    
    if (this.dateFin) {
      const fin = new Date(this.dateFin);
      fin.setHours(23, 59, 59);
      result = result.filter(c => new Date(c.dateCommande) <= fin);
    }
    
    this.filteredCommandes = result;
  }

  resetFilters() {
    this.searchTerm = '';
    this.selectedStatut = '';
    this.dateDebut = '';
    this.dateFin = '';
    this.applyFilters();
  }

  getStatutClass(statut: string): string {
    switch(statut) {
      case 'EN_ATTENTE': return 'bg-warning text-dark';
      case 'CONFIRMEE': return 'bg-info text-white';
      case 'EXPEDIEE': return 'bg-primary text-white';
      case 'LIVREE': return 'bg-success text-white';
      case 'ANNULEE': return 'bg-danger text-white';
      default: return 'bg-secondary text-white';
    }
  }

  voirDetails(commande: Commande) {
    this.selectedCommande = commande;
    this.commandeService.getLignesByCommandeId(commande.id!).subscribe({
      next: (lignes) => {
        this.selectedLignes = lignes;
        const modalEl = document.getElementById('detailsModal');
        if (modalEl) {
          this.detailsModalInstance = new bootstrap.Modal(modalEl);
          this.detailsModalInstance.show();
        }
      },
      error: (err) => console.error('Erreur chargement lignes', err)
    });
  }

  changerStatut(commande: Commande) {
    this.selectedCommande = commande;
    this.nouveauStatut = commande.statut;
    const modalEl = document.getElementById('statutModal');
    if (modalEl) {
      this.statutModalInstance = new bootstrap.Modal(modalEl);
      this.statutModalInstance.show();
    }
  }

  validerChangementStatut() {
    if (!this.selectedCommande || !this.nouveauStatut) return;
    
    this.commandeService.updateStatut(this.selectedCommande.id!, this.nouveauStatut).subscribe({
      next: () => {
        this.statutModalInstance.hide();
        this.loadCommandes();
      },
      error: (err) => console.error('Erreur changement statut', err)
    });
  }

  formatMoney(value: number): string {
    return value.toLocaleString('fr-FR') + ' FCFA';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}