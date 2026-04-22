import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../../../../service/product.service';
import { HeaderComponent } from "../../../../shared/composant/header/header.component";

@Component({
  selector: 'app-shoes',
  standalone: true,  // ← Standalone component
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent],  // ← Importe tout ici
  templateUrl: './shoes.component.html',
  styleUrls: ['./shoes.component.css']
})
export class ShoesComponent implements OnInit {
  Math = Math;
  
  shoes: any[] = [];
  filteredShoes: any[] = [];
  searchTerm: string = '';
  selectedCategory: string = 'toutes';
  selectedPriceRange: string = 'all';
  sortBy: string = 'default';
  
  categories = [
    { value: 'toutes', label: 'Toutes' },
    { value: 'homme', label: 'Homme' },
    { value: 'femme', label: 'Femme' },
    { value: 'enfant', label: 'Enfant' },
    { value: 'sport', label: 'Sport' }
  ];
  
  priceRanges = [
    { value: 'all', label: 'Tous prix' },
    { value: '0-50000', label: 'Moins de 50 000 FCFA' },
    { value: '50000-80000', label: '50 000 - 80 000 FCFA' },
    { value: '80000-100000', label: '80 000 - 100 000 FCFA' },
    { value: '100000+', label: 'Plus de 100 000 FCFA' }
  ];
  
  sortOptions = [
    { value: 'default', label: 'Par défaut' },
    { value: 'price-asc', label: 'Prix croissant' },
    { value: 'price-desc', label: 'Prix décroissant' },
    { value: 'rating', label: 'Meilleures notes' },
    { value: 'newest', label: 'Nouveautés' }
  ];

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadShoes();
    
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.selectedCategory = params['category'];
        this.applyFilters();
      }
    });
  }

  loadShoes(): void {
    this.shoes = this.productService.getShoes();
    this.applyFilters();
  }

  onSearch(): void {
    this.applyFilters();
  }

  onCategoryChange(): void {
    this.applyFilters();
  }

  onPriceRangeChange(): void {
    this.applyFilters();
  }

  onSortChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let result = [...this.shoes];
    
    if (this.selectedCategory !== 'toutes') {
      result = result.filter(shoe => shoe.subCategory === this.selectedCategory);
    }
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(shoe => 
        shoe.name.toLowerCase().includes(term) ||
        shoe.description.toLowerCase().includes(term)
      );
    }
    
    if (this.selectedPriceRange !== 'all') {
      switch(this.selectedPriceRange) {
        case '0-50000':
          result = result.filter(shoe => shoe.price < 50000);
          break;
        case '50000-80000':
          result = result.filter(shoe => shoe.price >= 50000 && shoe.price <= 80000);
          break;
        case '80000-100000':
          result = result.filter(shoe => shoe.price >= 80000 && shoe.price <= 100000);
          break;
        case '100000+':
          result = result.filter(shoe => shoe.price > 100000);
          break;
      }
    }
    
    switch(this.sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        result = result.filter(shoe => shoe.isNew);
        break;
    }
    
    this.filteredShoes = result;
  }

  addToCart(shoe: any): void {
    console.log('Ajouté au panier:', shoe);
    alert(`${shoe.name} ajouté au panier !`);
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = 'toutes';
    this.selectedPriceRange = 'all';
    this.sortBy = 'default';
    this.applyFilters();
  }
}