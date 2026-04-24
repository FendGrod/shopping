import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CommandeService } from './commande.service';
import { UtilisateurService } from './utilisateur-service';
import { ProduitService } from './produit.service';

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

  constructor(
    private http: HttpClient,
    private commandeService: CommandeService,
    private utilisateurService: UtilisateurService,
    private produitService: ProduitService
  ) {}

  private getHeaders(): HttpHeaders {
    const userStr = localStorage.getItem('currentUser');
    const user = userStr ? JSON.parse(userStr) : null;
    const userId = user?.id || 0;
    return new HttpHeaders({ 'userId': userId.toString() });
  }

  getStats(): Observable<DashboardStats> {
    return new Observable(observer => {
      Promise.all([
        this.utilisateurService.readAll().toPromise(),
        this.produitService.readAll().toPromise(),
        this.commandeService.getAllCommandes().toPromise()
      ]).then(([users, produits, commandes]) => {
        const stats: DashboardStats = {
          users: users?.length || 0,
          products: produits?.length || 0,
          orders: commandes?.length || 0,
          revenue: commandes?.reduce((sum, c) => sum + c.total, 0) || 0
        };
        observer.next(stats);
        observer.complete();
      }).catch(err => {
        console.error('Erreur chargement stats', err);
        observer.next({ users: 0, products: 0, orders: 0, revenue: 0 });
        observer.complete();
      });
    });
  }

  getRecentActivities(): Observable<Activity[]> {
    return new Observable(observer => {
      Promise.all([
        this.commandeService.getAllCommandes().toPromise(),
        this.utilisateurService.readAll().toPromise(),
        this.produitService.readAll().toPromise()
      ]).then(([commandes, users, produits]) => {
        const activities: Activity[] = [];
        
        const dernieresCommandes = (commandes || []).slice(0, 5);
        dernieresCommandes.forEach(c => {
          activities.push({
            id: c.id!,
            type: 'order',
            message: `Nouvelle commande #${c.reference} de ${c.total.toLocaleString()} FCFA`,
            date: new Date(c.dateCommande)
          });
        });
        
        const derniersUsers = (users || []).slice(0, 3);
        derniersUsers.forEach(u => {
          activities.push({
            id: u.id!,
            type: 'user',
            message: `Nouvel utilisateur inscrit : ${u.prenom} ${u.nom}`,
           date: u.dateCreation ? new Date(u.dateCreation) : new Date()
          });
        });
        
        const derniersProduits = (produits || []).slice(0, 3);
        derniersProduits.forEach(p => {
          activities.push({
            id: p.id!,
            type: 'product',
            message: `Nouveau produit ajouté : ${p.nom}`,
            date: new Date(p.dateCreation!)
          });
        });
        
        activities.sort((a, b) => b.date.getTime() - a.date.getTime());
        observer.next(activities.slice(0, 10));
        observer.complete();
      }).catch(err => {
        console.error('Erreur chargement activités', err);
        observer.next([]);
        observer.complete();
      });
    });
  }

  getSalesData(): Observable<SalesData> {
    return new Observable(observer => {
      this.commandeService.getAllCommandes().subscribe({
        next: (commandes) => {
          const jours = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
          const ventesParJour = [0, 0, 0, 0, 0, 0, 0];
          
          const aujourdHui = new Date();
          const debutSemaine = new Date(aujourdHui);
          debutSemaine.setDate(aujourdHui.getDate() - 6);
          
          commandes.forEach(commande => {
            const dateCommande = new Date(commande.dateCommande);
            if (dateCommande >= debutSemaine) {
              const jourIndex = dateCommande.getDay();
              const indexMap: { [key: number]: number } = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 0: 6 };
              const idx = indexMap[jourIndex];
              if (idx !== undefined) {
                ventesParJour[idx] += commande.total;
              }
            }
          });
          
          observer.next({
            labels: jours,
            datasets: [{ label: 'Ventes (FCFA)', data: ventesParJour }]
          });
          observer.complete();
        },
        error: (err) => {
          console.error('Erreur chargement graphique', err);
          observer.next({
            labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
            datasets: [{ label: 'Ventes (FCFA)', data: [0, 0, 0, 0, 0, 0, 0] }]
          });
          observer.complete();
        }
      });
    });
  }

  getTopProducts(): Observable<any[]> {
    return new Observable(observer => {
      this.commandeService.getAllCommandes().subscribe({
        next: (commandes) => {
          const produitsVentes: { [key: string]: { name: string; sales: number; revenue: number } } = {};
          
          const lignesPromises = commandes.map(c => 
            this.commandeService.getLignesByCommandeId(c.id!).toPromise()
          );
          
          Promise.all(lignesPromises).then(toutesLignes => {
            toutesLignes.forEach(lignes => {
              (lignes || []).forEach(ligne => {
                if (!produitsVentes[ligne.produitNom]) {
                  produitsVentes[ligne.produitNom] = {
                    name: ligne.produitNom,
                    sales: 0,
                    revenue: 0
                  };
                }
                produitsVentes[ligne.produitNom].sales += ligne.quantite;
                produitsVentes[ligne.produitNom].revenue += ligne.prixUnitaire * ligne.quantite;
              });
            });
            
            const top = Object.values(produitsVentes)
              .sort((a, b) => b.sales - a.sales)
              .slice(0, 5);
            
            observer.next(top);
            observer.complete();
          }).catch(() => {
            observer.next([]);
            observer.complete();
          });
        },
        error: () => {
          observer.next([]);
          observer.complete();
        }
      });
    });
  }

  getCategorySalesStats(): Observable<{ name: string; percentage: number; color: string }[]> {
    return new Observable(observer => {
      this.commandeService.getAllCommandes().subscribe({
        next: (commandes) => {
          const categoryTotals: { [key: string]: number } = {};
          
          const categorieNoms: { [key: string]: string } = {
            'CHAUSSURES': 'Chaussures',
            'VETEMENTS': 'Vêtements',
            'ACCESSOIRES': 'Accessoires',
            'SPORT': 'Sport'
          };
          
          const couleurs: { [key: string]: string } = {
            'CHAUSSURES': 'bg-primary',
            'VETEMENTS': 'bg-success',
            'ACCESSOIRES': 'bg-warning',
            'SPORT': 'bg-info'
          };
          
          const processCommandes = async () => {
            for (const commande of commandes) {
              const lignes = await this.commandeService.getLignesByCommandeId(commande.id!).toPromise();
              for (const ligne of lignes || []) {
                const produit = await this.produitService.read(ligne.produitId).toPromise();
                if (produit) {
                  const cat = produit.categorie;
                  const montant = ligne.prixUnitaire * ligne.quantite;
                  categoryTotals[cat] = (categoryTotals[cat] || 0) + montant;
                }
              }
            }
            
            const total = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
            
            const result = Object.entries(categoryTotals)
              .filter(([_, montant]) => montant > 0)
              .map(([categorie, montant]) => ({
                name: categorieNoms[categorie] || categorie,
                percentage: total > 0 ? Math.round((montant / total) * 100) : 0,
                color: couleurs[categorie] || 'bg-secondary'
              }));
            
            observer.next(result);
            observer.complete();
          };
          
          processCommandes().catch(() => {
            observer.next([]);
            observer.complete();
          });
        },
        error: (err) => {
          console.error('Erreur', err);
          observer.next([]);
          observer.complete();
        }
      });
    });
  }
}