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
  
  // Modal
  modalTitle = '';
  isEditMode = false;
  currentProduit: Produit = this.emptyProduit();
  private modalInstance: any;

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
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.modalTitle = 'Ajouter un produit';
    this.currentProduit = this.emptyProduit();
    this.showModal();
  }

  openEditModal(produit: Produit): void {
    this.isEditMode = true;
    this.modalTitle = 'Modifier un produit';
    this.currentProduit = { ...produit };
    this.showModal();
  }

  saveProduit(): void {
    if (this.isEditMode) {
      this.produitService.update(this.currentProduit.id!, this.currentProduit).subscribe({
        next: () => {
          this.closeModal();
          this.loadProduits();
        },
        error: (err) => console.error('Erreur mise à jour', err)
      });
    } else {
      this.produitService.create(this.currentProduit).subscribe({
        next: () => {
          this.closeModal();
          this.loadProduits();
        },
        error: (err) => console.error('Erreur création', err)
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

  resetFilters(): void {
    this.searchNom = '';
    this.searchCategorie = '';
    this.searchGenre = '';
    this.applyFilters();
  }

  getTotalProduits(): number {
    return this.produits.length;
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
      genre: Genre.HOMME
    };
  }

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

downloadTemplate(): void {
  // Créer un fichier Excel template
  const template = [
    ['Nom', 'Description', 'Prix', 'Stock', 'ImageUrl', 'Catégorie', 'SousCatégorie', 'Genre'],
    ['Nike Air Max', 'Chaussures confortables', 85000, 15, 'https://...', 'CHAUSSURES', 'Homme', 'HOMME'],
    ['T-shirt blanc', 'Coton bio', 15000, 50, 'https://...', 'VETEMENTS', 'Hauts', 'HOMME']
  ];
  
  // Convertir en CSV simple (ou utiliser SheetJS pour Excel)
  let csv = template.map(row => row.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'template_produits.csv';
  a.click();
  window.URL.revokeObjectURL(url);
}

// Sélection d'un fichier image
onFileSelected(event: any): void {
  const file = event.target.files[0];
  if (file) {
    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image valide');
      return;
    }
    
    // Vérifier la taille (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('L\'image ne doit pas dépasser 2MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.currentProduit.imageUrl = e.target.result; // Stocke en Base64
    };
    reader.readAsDataURL(file);
  }
}

// Supprimer l'image
removeImage(): void {
  this.currentProduit.imageUrl = '';
}
}