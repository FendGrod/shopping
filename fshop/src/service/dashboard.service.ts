import { Injectable } from '@angular/core';
import { Observable, of, interval, map } from 'rxjs';

export interface DashboardStats {
  users: number;
  products: number;
  orders: number;
  revenue: number;
}

export interface Activity {
  id: number;
  type: 'user' | 'order' | 'product';
  message: string;
  date: Date;
}

export interface SalesData {
  labels: string[];
  datasets: { label: string; data: number[] }[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private activities: Activity[] = [];
  private nextId = 1;

  constructor() {
    // Initialiser quelques activités factices
    this.generateMockActivities();
    // Simuler des activités en temps réel toutes les 15 secondes
    interval(15000).subscribe(() => this.addRandomActivity());
  }

  private generateMockActivities() {
    const mockMessages = [
      'Nouvel utilisateur inscrit : jean.dupont@email.com',
      'Commande #1234 validée (125 000 FCFA)',
      'Produit "Nike Air Max" ajouté au stock',
      'Nouvelle catégorie "Accessoires" créée',
      'Utilisateur admin@shop.com a modifié son profil'
    ];
    for (let i = 0; i < 5; i++) {
      this.activities.push({
        id: this.nextId++,
        type: 'user',
        message: mockMessages[i % mockMessages.length],
        date: new Date(Date.now() - i * 3600000)
      });
    }
  }

 private addRandomActivity() {
  const types: ('user' | 'order' | 'product')[] = ['user', 'order', 'product'];
  const randomType = types[Math.floor(Math.random() * types.length)];
  let message = '';
  if (randomType === 'user') message = `Nouvel utilisateur inscrit : user${Math.floor(Math.random() * 1000)}@mail.com`;
  if (randomType === 'order') message = `Nouvelle commande #${Math.floor(Math.random() * 9000)} de ${Math.floor(Math.random() * 50000)} FCFA`;
  if (randomType === 'product') message = `Produit "${['T-shirt', 'Jean', 'Basket'][Math.floor(Math.random() * 3)]}" ajouté`;

  this.activities.unshift({
    id: this.nextId++,
    type: randomType, // maintenant OK
    message,
    date: new Date()
  });
  if (this.activities.length > 10) this.activities.pop();
}

  getStats(): Observable<DashboardStats> {
    // Simulation de données réelles (plus tard appels API)
    return of({
      users: 1248,
      products: 342,
      orders: 189,
      revenue: 12567890
    });
  }

  getRecentActivities(): Observable<Activity[]> {
    return of([...this.activities]);
  }

  getSalesData(): Observable<SalesData> {
    // Données pour le graphique (7 derniers jours)
    return of({
      labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
      datasets: [
        {
          label: 'Ventes (FCFA)',
          data: [125000, 98000, 142000, 187000, 210000, 256000, 198000]
        }
      ]
    });
  }

  getTopProducts(): Observable<any[]> {
    return of([
      { name: 'Nike Air Max', sales: 45, revenue: 3825000 },
      { name: 'Adidas Ultraboost', sales: 32, revenue: 3040000 },
      { name: 'Puma Suede', sales: 28, revenue: 1540000 },
      { name: 'Converse Chuck', sales: 24, revenue: 1152000 },
      { name: 'Vans Old Skool', sales: 19, revenue: 798000 }
    ]);
  }
}