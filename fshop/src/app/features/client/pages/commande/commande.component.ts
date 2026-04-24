import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../../shared/composant/header/header.component';
import { CommandeService } from '../../../../../service/commande.service';

@Component({
  selector: 'app-commande',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent],
  templateUrl: './commande.component.html',
  styleUrls: ['./commande.component.css']
})
export class CommandeComponent implements OnInit {
  
  cartItems: any[] = [];
  totalPanier = 0;
  fraisLivraison = 0;
  totalCommande = 0;
  modeLivraison = 'DOMICILE';
  
  adresseLivraison = {
    adresse: '',
    ville: '',
    codePostal: '',
    telephone: ''
  };
  
  modePaiement = 'LIVRAISON';
  
  isLoading = false;
  errorMessage = '';

  constructor(
    private router: Router,
    private commandeService: CommandeService
  ) {}

  ngOnInit() {
     const backdrops = document.querySelectorAll('.modal-backdrop');
  backdrops.forEach(backdrop => backdrop.remove());
  document.body.classList.remove('modal-open');
  document.body.style.removeProperty('overflow');
  document.body.style.removeProperty('padding-right');
    this.loadCart();
  }

  loadCart() {
    const cart = localStorage.getItem('cart');
    this.cartItems = cart ? JSON.parse(cart) : [];
    
    if (this.cartItems.length === 0) {
      this.router.navigate(['/produits']);
    }
    
    this.calculerTotaux();
  }

  calculerTotaux() {
    this.totalPanier = this.cartItems.reduce((sum, item) => sum + (item.prix * item.quantite), 0);
    this.fraisLivraison = this.modeLivraison === 'DOMICILE' ? 2000 : 0;
    this.totalCommande = this.totalPanier + this.fraisLivraison;
  }

  onModeLivraisonChange() {
    this.calculerTotaux();
  }

  modifierQuantite(index: number, delta: number) {
    const nouvelleQuantite = this.cartItems[index].quantite + delta;
    if (nouvelleQuantite >= 1) {
      this.cartItems[index].quantite = nouvelleQuantite;
      localStorage.setItem('cart', JSON.stringify(this.cartItems));
      this.calculerTotaux();
    }
  }

  supprimerArticle(index: number) {
    this.cartItems.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(this.cartItems));
    this.calculerTotaux();
    
    if (this.cartItems.length === 0) {
      this.router.navigate(['/produits']);
    }
  }

  // ⭐ VÉRIFICATION DU STOCK LOCALEMENT ⭐
  verifierStock(): boolean {
    let stockOk = true;
    let messageErreur = '';

    for (const item of this.cartItems) {
      // Si l'article a un stock dans le localStorage (venant du backend)
      if (item.stock !== undefined && item.quantite > item.stock) {
        stockOk = false;
        messageErreur += `- ${item.nom} : seulement ${item.stock} disponible(s) (vous avez ${item.quantite})\n`;
      }
    }

    if (!stockOk) {
      this.errorMessage = `Stock insuffisant pour :\n${messageErreur}\nVeuillez réduire la quantité.`;
      return false;
    }
    return true;
  }

  validerCommande() {
    // Validation adresse
    if (!this.adresseLivraison.adresse) {
      this.errorMessage = 'Veuillez saisir votre adresse';
      return;
    }
    if (!this.adresseLivraison.ville) {
      this.errorMessage = 'Veuillez saisir votre ville';
      return;
    }
    if (!this.adresseLivraison.telephone) {
      this.errorMessage = 'Veuillez saisir votre numéro de téléphone';
      return;
    }
    
    // ⭐ VÉRIFICATION DU STOCK AVANT ENVOI ⭐
    if (!this.verifierStock()) {
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = '';
    
    const commandeData = {
      adresseLivraison: {
        adresse: this.adresseLivraison.adresse,
        ville: this.adresseLivraison.ville,
        codePostal: this.adresseLivraison.codePostal,
        telephone: this.adresseLivraison.telephone
      },
      modeLivraison: this.modeLivraison,
      modePaiement: this.modePaiement,
      items: this.cartItems.map(item => ({
        produitId: item.id,
        produitNom: item.nom,
        prixUnitaire: item.prix,
        quantite: item.quantite,
        taille: item.taille || '',
        couleur: item.couleur || ''
      }))
    };
    
    this.commandeService.creerCommande(commandeData).subscribe({
      next: (commande) => {
        localStorage.removeItem('cart');
        this.router.navigate(['/confirmation', commande.reference]);
      },
      error: (err) => {
        console.error('Erreur:', err);
        // ⭐ Message d'erreur du backend (si la vérif backend échoue) ⭐
        if (err.error && typeof err.error === 'string') {
          this.errorMessage = err.error;
        } else if (err.error && err.error.message) {
          this.errorMessage = err.error.message;
        } else {
          this.errorMessage = 'Erreur lors de la validation de la commande. Vérifiez le stock.';
        }
        this.isLoading = false;
      }
    });
  }

  formatMoney(value: number): string {
    return value.toLocaleString('fr-FR') + ' FCFA';
  }
}