import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProduitService } from '../../../../../service/produit.service';
import { Produit } from '../../../../../model/produit';
import { AuthService } from '../../../../../service/auth.service';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from "../../../../shared/composant/header/header.component";

declare var bootstrap: any;

@Component({
  selector: 'app-produits',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent],
  templateUrl: './produits.component.html',
  styleUrls: ['./produits.component.css']
})
export class ProduitsComponent implements OnInit, OnDestroy {
  // Produits
  produits: Produit[] = [];
  filteredProduits: Produit[] = [];
  loading = true;

  // Filtres depuis l'URL
  selectedCategorie: string = '';
  selectedSousCategorie: string = '';
  
  // Filtres UI
  searchTerm: string = '';
  selectedGenre: string = '';
  genres: string[] = ['HOMME', 'FEMME', 'ENFANT', 'UNISEXE'];
  
  // Sous-catégories dynamiques
  sousCategories: string[] = [];
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 12;

  // Modal panier
  selectedProduit: Produit | null = null;
  selectedTaille: string = '';
  selectedCouleur: string = '';
  quantite: number = 1;
  quantiteMaxAtteinte: boolean = false;
  private modalInstance: any;

  // Slider
  backgroundImages: string[] = [];
  currentImageIndex = 0;
  private intervalId: any;
  private sub: any;

  constructor(
    private produitService: ProduitService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.sub = this.route.queryParams.subscribe(params => {
      this.selectedCategorie = params['categorie'] || '';
      this.selectedSousCategorie = params['sousCategorie'] || '';
      
      this.sousCategories = this.produitService.getSousCategories(this.selectedCategorie);
      this.setBackgroundImages(); 
      this.loadProduits();
    });
  }

  ngOnDestroy(): void {
    if (this.sub) this.sub.unsubscribe();
    if (this.intervalId) clearInterval(this.intervalId);
  }

  loadProduits(): void {
    this.loading = true;
    this.produitService.readAll().subscribe({
      next: (data) => {
        this.produits = data;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement produits', err);
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    let result = [...this.produits];

    if (this.selectedCategorie) {
      result = result.filter(p => p.categorie === this.selectedCategorie);
    }

    if (this.selectedSousCategorie) {
      result = result.filter(p => p.sousCategorie === this.selectedSousCategorie);
    }

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(p => 
        p.nom.toLowerCase().includes(term) || 
        p.description?.toLowerCase().includes(term)
      );
    }

    if (this.selectedGenre) {
      result = result.filter(p => p.genre === this.selectedGenre);
    }

    this.filteredProduits = result;
    this.currentPage = 1;
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedGenre = '';
    this.applyFilters();
  }

  get paginatedProduits(): Produit[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredProduits.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredProduits.length / this.itemsPerPage);
  }

  getRemise(produit: Produit): number {
    if (produit.prixOriginal && produit.prixOriginal > produit.prix) {
      return Math.round(((produit.prixOriginal - produit.prix) / produit.prixOriginal) * 100);
    }
    return 0;
  }

  getPageTitle(): string {
    if (this.selectedSousCategorie) {
      return `${this.selectedCategorie} - ${this.selectedSousCategorie}`;
    }
    return this.selectedCategorie || 'Tous nos produits';
  }

  // ========== MODAL AJOUT AU PANIER ==========
  openModal(produit: Produit): void {
    if (produit.stock === 0) return;
    
    this.selectedProduit = produit;
    this.selectedTaille = produit.tailles?.[0] || '';
    this.selectedCouleur = produit.couleurs?.[0] || '';
    this.quantite = 1;
    this.quantiteMaxAtteinte = false;
    this.showModal();
  }

  // Vérifier la quantité
  verifierQuantite(): void {
    if (this.selectedProduit) {
      this.quantiteMaxAtteinte = this.quantite >= this.selectedProduit.stock;
    }
  }

  ajouterAuPanier(): void {
    // Vérifier stock
    if (this.quantite > this.selectedProduit!.stock) {
      alert(`Stock insuffisant ! Il ne reste que ${this.selectedProduit!.stock} exemplaire(s).`);
      return;
    }
    
    // Vérifier connexion
    if (!this.authService.isLoggedIn()) {
      alert('Veuillez vous connecter pour ajouter au panier');
      this.router.navigate(['/connexion']);
      return;
    }

    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find((item: any) => 
      item.id === this.selectedProduit?.id && 
      item.taille === this.selectedTaille && 
      item.couleur === this.selectedCouleur
    );

    if (existingItem) {
      const nouvelleQuantite = existingItem.quantite + this.quantite;
      if (nouvelleQuantite > this.selectedProduit!.stock) {
        alert(`Stock insuffisant ! Vous avez déjà ${existingItem.quantite} dans le panier. Stock maximum: ${this.selectedProduit!.stock}`);
        return;
      }
      existingItem.quantite = nouvelleQuantite;
    } else {
      cart.push({
        id: this.selectedProduit?.id,
        nom: this.selectedProduit?.nom,
        prix: this.selectedProduit?.prix,
        imageUrl: this.selectedProduit?.imageUrl,
        taille: this.selectedTaille,
        couleur: this.selectedCouleur,
        quantite: this.quantite,
        stock: this.selectedProduit?.stock  
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    this.closeModal();
    alert('Produit ajouté au panier !');
    window.dispatchEvent(new Event('cartUpdated'));
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

  goToPage(page: number, event: Event): void {
    event.preventDefault();
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // ========== SLIDER IMAGES ==========
  setBackgroundImages(): void {
    const category = this.selectedCategorie || 'default';
    
    const images: { [key: string]: string[] } = {
      'CHAUSSURES': [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1600',
        'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=1600',
        'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=1600'
      ],
      'VETEMENTS': [
        'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600',
        'https://images.unsplash.com/photo-1441986301863-73d8c3d1e2b2?w=1600',
        'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=1600'
      ],
      'ACCESSOIRES': [
        'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=1600',
        'https://images.unsplash.com/photo-1584917865445-de89df76afd3?w=1600',
        'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=1600'
      ],
      'SPORT': [
        'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1600',
        'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=1600',
        'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1600'
      ],
      'default': [
        'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1600',
        'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600',
        'https://images.unsplash.com/photo-1441986301863-73d8c3d1e2b2?w=1600'
      ]
    };
    
    this.backgroundImages = images[category] || images['default'];
    this.currentImageIndex = 0;
    
    if (this.intervalId) clearInterval(this.intervalId);
    this.startImageSlider();
  }

  startImageSlider(): void {
    this.intervalId = setInterval(() => {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.backgroundImages.length;
    }, 4000);
  }

  // Ajoute ces méthodes dans la classe
decrementerQuantite(): void {
  if (this.quantite > 1) {
    this.quantite--;
    this.verifierQuantite();
  }
}

incrementerQuantite(): void {
  if (this.selectedProduit && this.quantite < this.selectedProduit.stock) {
    this.quantite++;
    this.verifierQuantite();
  }
}

onQuantiteChange(event: any): void {
  let value = parseInt(event.target.value);
  if (isNaN(value)) value = 1;
  if (this.selectedProduit) {
    if (value > this.selectedProduit.stock) {
      value = this.selectedProduit.stock;
    }
    if (value < 1) value = 1;
    this.quantite = value;
    this.verifierQuantite();
  }
}
}