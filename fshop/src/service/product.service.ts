import { Injectable } from '@angular/core';
import { Product } from '../model/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  
 private shoes: Product[] = [
  {
    id: 1,
    name: "Nike Air Max 270",
    category: "chaussures",
    subCategory: "homme",
    price: 85000,
    originalPrice: 120000,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
    rating: 4.5,
    stock: 15,
    isPromo: true,
    description: "Chaussures confortables avec amorti Air Max, parfaites pour le quotidien.",
    sizes: ["39", "40", "41", "42", "43", "44"],
    colors: ["Noir", "Blanc", "Bleu"]
  },
  {
    id: 2,
    name: "Adidas Ultraboost 22",
    category: "chaussures",
    subCategory: "homme",
    price: 95000,
    image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500",
    rating: 4.8,
    stock: 8,
    isNew: true,
    description: "Le confort ultime pour la course à pied avec la technologie Boost.",
    sizes: ["40", "41", "42", "43", "44", "45"],
    colors: ["Blanc", "Gris", "Noir"]
  },
  {
    id: 3,
    name: "Puma Suede Classic",
    category: "chaussures",
    subCategory: "femme",
    price: 55000,
    originalPrice: 75000,
    image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=500",
    rating: 4.3,
    stock: 20,
    isPromo: true,
    description: "Classique intemporel en daim, confortable et stylée.",
    sizes: ["36", "37", "38", "39", "40"],
    colors: ["Noir", "Bleu marine", "Rouge"]
  },
  {
    id: 4,
    name: "New Balance 574",
    category: "chaussures",
    subCategory: "homme",
    price: 72000,
    image: "https://images.unsplash.com/photo-1539185441755-769473a23570?w=500",
    rating: 4.6,
    stock: 12,
    description: "Style rétro et confort moderne réunis.",
    sizes: ["40", "41", "42", "43", "44"],
    colors: ["Gris", "Marron", "Noir"]
  },
  {
    id: 5,
    name: "Converse Chuck Taylor",
    category: "chaussures",
    subCategory: "femme",
    price: 48000,
    image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=500",
    rating: 4.7,
    stock: 25,
    isNew: false,
    description: "Baskets iconiques en toile, polyvalentes et tendance.",
    sizes: ["36", "37", "38", "39", "40", "41"],
    colors: ["Noir", "Blanc", "Rouge"]
  },
  {
    id: 6,
    name: "Reebok Nano X2",
    category: "chaussures",
    subCategory: "sport",
    price: 89000,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
    rating: 4.9,
    stock: 5,
    isNew: true,
    description: "Chaussures de training hautes performances.",
    sizes: ["40", "41", "42", "43", "44"],
    colors: ["Noir", "Bleu", "Rouge"]
  },
  {
    id: 7,
    name: "Asics Gel-Kayano 29",
    category: "chaussures",
    subCategory: "sport",
    price: 110000,
    image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500",
    rating: 4.8,
    stock: 7,
    description: "Stabilité et amorti pour les coureurs exigeants.",
    sizes: ["39", "40", "41", "42", "43", "44", "45"],
    colors: ["Bleu", "Vert", "Noir"]
  },
  {
    id: 8,
    name: "Vans Old Skool",
    category: "chaussures",
    subCategory: "enfant",
    price: 42000,
    originalPrice: 55000,
    image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=500",
    rating: 4.5,
    stock: 18,
    isPromo: true,
    description: "Classique du skate, robuste et stylée.",
    sizes: ["30", "31", "32", "33", "34", "35", "36"],
    colors: ["Noir", "Blanc", "Checkered"]
  }
];

  getShoes(): Product[] {
    return this.shoes;
  }

  getShoeById(id: number): Product | undefined {
    return this.shoes.find(shoe => shoe.id === id);
  }

  searchShoes(keyword: string): Product[] {
    if (!keyword) return this.shoes;
    const searchTerm = keyword.toLowerCase();
    return this.shoes.filter(shoe => 
      shoe.name.toLowerCase().includes(searchTerm) ||
      shoe.description.toLowerCase().includes(searchTerm) ||
      shoe.subCategory.toLowerCase().includes(searchTerm)
    );
  }

  filterByCategory(subCategory: string): Product[] {
    if (subCategory === 'toutes') return this.shoes;
    return this.shoes.filter(shoe => shoe.subCategory === subCategory);
  }
}