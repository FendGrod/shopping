import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProduitService } from '../../../../../service/produit.service';
import { Produit, Categorie, Genre } from '../../../../../model/produit';

declare var bootstrap: any;

@Component({
  selector: 'app-admin-produits',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-produits.component.html',
  styleUrls: ['./admin-produits.component.css']
})
export class AdminProduitsComponent implements OnInit {
  produits: Produit[] = [];
  filteredProduits: Produit[] = [];
  
  // Filtres
  searchNom = '';
  searchCategorie = '';
  searchGenre = '';
  
  categories = Object.values(Categorie);
  genres = Object.values(Genre);
  
  // Sélection multiple
  selectedProduits: number[] = [];
  selectAll = false;
  
  // Modal de formulaire
  modalTitle = '';
  isEditMode = false;
  currentProduit: Produit = this.emptyProduit();
  taillesInput = '';
  couleursInput = '';
  private modalInstance: any;
  
  // Modal de détail
  detailProduit: Produit | null = null;
  private detailModalInstance: any;

  constructor(private produitService: ProduitService) {}

  ngOnInit(): void {
    this.loadProduits();
  }

  loadProduits(): void {
    this.produitService.readAll().subscribe({
      next: (data) => {
        this.produits = data;
        this.applyFilters();
      },
      error: (err) => console.error('Erreur chargement produits', err)
    });
  }

  applyFilters(): void {
    this.filteredProduits = this.produits.filter(prod => {
      const matchNom = !this.searchNom || 
        prod.nom.toLowerCase().includes(this.searchNom.toLowerCase());
      const matchCategorie = !this.searchCategorie || prod.categorie === this.searchCategorie;
      const matchGenre = !this.searchGenre || prod.genre === this.searchGenre;
      return matchNom && matchCategorie && matchGenre;
    });
    this.updateSelectAll();
  }

  // ========== GESTION DES FILTRES ==========
  resetFilters(): void {
    this.searchNom = '';
    this.searchCategorie = '';
    this.searchGenre = '';
    this.applyFilters();
  }

  getTotalProduits(): number {
    return this.produits.length;
  }

  // ========== SÉLECTION MULTIPLE ==========
  toggleSelection(id: number): void {
    const index = this.selectedProduits.indexOf(id);
    if (index === -1) {
      this.selectedProduits.push(id);
    } else {
      this.selectedProduits.splice(index, 1);
    }
    this.updateSelectAll();
  }

  toggleSelectAll(): void {
    this.selectAll = !this.selectAll;
    if (this.selectAll) {
      this.selectedProduits = this.filteredProduits.map(p => p.id!);
    } else {
      this.selectedProduits = [];
    }
  }

  updateSelectAll(): void {
    this.selectAll = this.filteredProduits.length > 0 && 
                     this.selectedProduits.length === this.filteredProduits.length;
  }

deleteSelected(): void {
  if (this.selectedProduits.length === 0) {
    alert('Aucun produit sélectionné');
    return;
  }
  
  if (confirm(`Supprimer ${this.selectedProduits.length} produit(s) ?`)) {
    this.produitService.deleteAll(this.selectedProduits).subscribe({
      next: (response) => {
        console.log('Réponse:', response);
        this.loadProduits();
        this.selectedProduits = [];
        this.selectAll = false;
        alert('Produits supprimés avec succès');
      },
      error: (err) => {
        console.error('Erreur suppression multiple', err);
        alert('Erreur lors de la suppression');
      }
    });
  }
}

  // ========== MODAL AJOUT / MODIFICATION ==========
  openAddModal(): void {
    this.isEditMode = false;
    this.modalTitle = 'Ajouter un produit';
    this.currentProduit = this.emptyProduit();
    this.taillesInput = '';
    this.couleursInput = '';
    this.showModal();
  }

  openEditModal(produit: Produit): void {
    this.isEditMode = true;
    this.modalTitle = 'Modifier un produit';
    this.currentProduit = { ...produit };
    this.taillesInput = produit.tailles ? produit.tailles.join(', ') : '';
    this.couleursInput = produit.couleurs ? produit.couleurs.join(', ') : '';
    this.showModal();
  }

  saveProduit(): void {
    // Vérifier que les champs requis sont remplis
    if (!this.currentProduit.nom || this.currentProduit.nom.length < 3) {
      alert('Le nom doit contenir au moins 3 caractères');
      return;
    }
    if (!this.currentProduit.prix || this.currentProduit.prix <= 0) {
      alert('Le prix doit être supérieur à 0');
      return;
    }
    
    // Traiter les tailles et couleurs
    if (this.taillesInput) {
      this.currentProduit.tailles = this.taillesInput.split(',').map(t => t.trim());
    }
    if (this.couleursInput) {
      this.currentProduit.couleurs = this.couleursInput.split(',').map(c => c.trim());
    }
    
    if (this.isEditMode) {
      this.produitService.update(this.currentProduit.id!, this.currentProduit).subscribe({
        next: () => {
          this.closeModal();
          this.loadProduits();
        },
        error: (err) => {
          console.error('Erreur mise à jour', err);
          alert(err.error?.message || 'Erreur lors de la mise à jour');
        }
      });
    } else {
      this.produitService.create(this.currentProduit).subscribe({
        next: () => {
          this.closeModal();
          this.loadProduits();
        },
        error: (err) => {
          console.error('Erreur création', err);
          alert(err.error?.message || 'Erreur lors de la création');
        }
      });
    }
  }

  deleteProduit(id: number): void {
    if (confirm('Voulez-vous vraiment supprimer ce produit ?')) {
      this.produitService.delete(id).subscribe({
        next: () => this.loadProduits(),
        error: (err) => console.error('Erreur suppression', err)
      });
    }
  }

  // ========== MODAL DÉTAIL PRODUIT ==========
  openDetailModal(produit: Produit): void {
    this.detailProduit = produit;
    this.showDetailModal();
  }

  // ========== IMPORT EXCEL ==========
  importExcel(event: any): void {
    const file = event.target.files[0];
    if (!file) return;
    
    this.produitService.importExcel(file).subscribe({
      next: () => {
        alert('Import réussi !');
        this.loadProduits();
      },
      error: (err) => console.error('Erreur import:', err)
    });
  }

  // ========== GESTION DES IMAGES ==========
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner une image valide');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert('L\'image ne doit pas dépasser 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.currentProduit.imageUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.currentProduit.imageUrl = '';
  }

  // ========== UTILITAIRES ==========
  getRemise(produit: Produit): number {
    if (produit.prixOriginal && produit.prixOriginal > produit.prix) {
      return Math.round(((produit.prixOriginal - produit.prix) / produit.prixOriginal) * 100);
    }
    return 0;
  }

  private emptyProduit(): Produit {
    return {
      nom: '',
      description: '',
      prix: 0,
      stock: 0,
      imageUrl: '',
      categorie: Categorie.CHAUSSURES,
      sousCategorie: '',
      genre: Genre.HOMME,
      rating: 0,
      isPromo: false,
      isNew: false,
      tailles: [],
      couleurs: []
    };
  }

  // ========== GESTION DES MODALS ==========
  private showModal(): void {
    const modalEl = document.getElementById('produitModal');
    if (modalEl) {
      this.modalInstance = new bootstrap.Modal(modalEl);
      this.modalInstance.show();
    }
  }

  closeModal(): void {
    if (this.modalInstance) this.modalInstance.hide();
  }

  private showDetailModal(): void {
    const modalEl = document.getElementById('detailModal');
    if (modalEl) {
      this.detailModalInstance = new bootstrap.Modal(modalEl);
      this.detailModalInstance.show();
    }
  }

  closeDetailModal(): void {
    if (this.detailModalInstance) this.detailModalInstance.hide();
  }
}