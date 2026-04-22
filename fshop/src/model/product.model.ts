export interface Product {
  id: number;
  name: string;
  category: string;
  subCategory: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  stock: number;
  isNew?: boolean;
  isPromo?: boolean;
  description: string;
  sizes: string[];
  colors: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}