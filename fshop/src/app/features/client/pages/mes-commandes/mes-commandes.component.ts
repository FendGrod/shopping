import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../../shared/composant/header/header.component';
import { CommandeService } from '../../../../../service/commande.service';
import { Commande, LigneCommande } from '../../../../../model/commande';

declare var bootstrap: any;

@Component({
  selector: 'app-mes-commandes',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent],
  templateUrl: './mes-commandes.component.html',
  styleUrls: ['./mes-commandes.component.css']
})
export class MesCommandesComponent implements OnInit {
  
  commandes: Commande[] = [];
  isLoading = true;
  errorMessage = '';
  selectedCommande: Commande | null = null;
  selectedLignes: LigneCommande[] = [];  // ← AJOUTE
  private detailsModalInstance: any;

  constructor(private commandeService: CommandeService) {}

  ngOnInit() {
    this.loadCommandes();
  }

  loadCommandes() {
    this.isLoading = true;
    this.commandeService.mesCommandes().subscribe({
      next: (data) => {
        this.commandes = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.errorMessage = 'Erreur lors du chargement des commandes';
        this.isLoading = false;
      }
    });
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

  getStatutText(statut: string): string {
    switch(statut) {
      case 'EN_ATTENTE': return 'En attente';
      case 'CONFIRMEE': return 'Confirmée';
      case 'EXPEDIEE': return 'Expédiée';
      case 'LIVREE': return 'Livrée';
      case 'ANNULEE': return 'Annulée';
      default: return statut;
    }
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

  // ⭐ MODIFIE CETTE MÉTHODE ⭐
  voirDetails(commande: Commande) {
    this.selectedCommande = commande;
    
    // Récupérer les lignes de commande
    this.commandeService.getLignesByCommandeId(commande.id!).subscribe({
      next: (lignes) => {
        this.selectedLignes = lignes;
        const modalEl = document.getElementById('detailsModal');
        if (modalEl) {
          this.detailsModalInstance = new bootstrap.Modal(modalEl);
          this.detailsModalInstance.show();
        }
      },
      error: (err) => {
        console.error('Erreur chargement lignes:', err);
        this.selectedLignes = [];
        const modalEl = document.getElementById('detailsModal');
        if (modalEl) {
          this.detailsModalInstance = new bootstrap.Modal(modalEl);
          this.detailsModalInstance.show();
        }
      }
    });
  }
}