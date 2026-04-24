import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Commande , LigneCommande } from '../model/commande';

@Injectable({
  providedIn: 'root'
})
export class CommandeService {
  private apiUrl = 'http://localhost:9091/api/commandes';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const userStr = localStorage.getItem('currentUser');
    const user = userStr ? JSON.parse(userStr) : null;
    const userId = user?.id || 0;
    
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'userId': userId.toString()
    });
  }

  creerCommande(commandeData: any): Observable<Commande> {
    return this.http.post<Commande>(`${this.apiUrl}/create`, commandeData, {
      headers: this.getHeaders()
    });
  }

  mesCommandes(): Observable<Commande[]> {
    return this.http.get<Commande[]>(`${this.apiUrl}/mes-commandes`, {
      headers: this.getHeaders()
    });
  }


 getLignesByCommandeId(commandeId: number): Observable<LigneCommande[]> {
    return this.http.get<LigneCommande[]>(`${this.apiUrl}/${commandeId}/lignes`, {
      headers: this.getHeaders()
    });
  }

  // Dans commande.service.ts, ajoute ces méthodes

getAllCommandes(): Observable<Commande[]> {
  return this.http.get<Commande[]>(`${this.apiUrl}/all`, {
    headers: this.getHeaders()
  });
}

updateStatut(commandeId: number, statut: string): Observable<Commande> {
  return this.http.put<Commande>(`${this.apiUrl}/${commandeId}/statut`, { statut }, {
    headers: this.getHeaders()
  });
}
}