import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Produit } from '../model/produit';

@Injectable({
  providedIn: 'root'
})
export class ProduitService {
  private apiUrl = 'http://localhost:9091/api/produits';

  constructor(private http: HttpClient) {}

  create(produit: Produit): Observable<Produit> {
    return this.http.post<Produit>(`${this.apiUrl}/create`, produit);
  }

  readAll(): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${this.apiUrl}/readall`);
  }

  read(id: number): Observable<Produit> {
    return this.http.get<Produit>(`${this.apiUrl}/read/${id}`);
  }

  update(id: number, produit: Produit): Observable<Produit> {
    return this.http.put<Produit>(`${this.apiUrl}/update/${id}`, produit);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }

  findByCategorie(categorie: string): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${this.apiUrl}/categorie/${categorie}`);
  }

  findBySousCategorie(sousCategorie: string): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${this.apiUrl}/sous-categorie/${sousCategorie}`);
  }

  findByGenre(genre: string): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${this.apiUrl}/genre/${genre}`);
  }

  search(keyword: string): Observable<Produit[]> {
    const params = new HttpParams().set('keyword', keyword);
    return this.http.get<Produit[]>(`${this.apiUrl}/search`, { params });
  }

  importExcel(file: File): Observable<Produit[]> {
  const formData = new FormData();
  formData.append('file', file);
  return this.http.post<Produit[]>(`${this.apiUrl}/import-excel`, formData);
}
}