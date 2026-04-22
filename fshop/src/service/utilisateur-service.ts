import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Utilisateur, Role } from '../model/utilisateur';

@Injectable({
  providedIn: 'root'
})
export class UtilisateurService {
  private apiUrl = 'http://localhost:9091/api/users';

  constructor(private http: HttpClient) {}

  create(utilisateur: Utilisateur): Observable<Utilisateur> {
    return this.http.post<Utilisateur>(`${this.apiUrl}/create`, utilisateur);
  }

  readAll(): Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(`${this.apiUrl}/readall`);
  }

  read(id: number): Observable<Utilisateur> {
    return this.http.get<Utilisateur>(`${this.apiUrl}/read/${id}`);
  }

  update(id: number, utilisateur: Utilisateur): Observable<Utilisateur> {
    return this.http.put<Utilisateur>(`${this.apiUrl}/update/${id}`, utilisateur);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }

  findByEmail(email: string): Observable<Utilisateur> {
    return this.http.get<Utilisateur>(`${this.apiUrl}/email/${email}`);
  }

  emailExists(email: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/email-exists/${email}`);
  }

  findByRole(role: Role): Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(`${this.apiUrl}/role/${role}`);
  }

  findByProvider(provider: string): Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(`${this.apiUrl}/provider/${provider}`);
  }

  countByRole(role: Role): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count/role/${role}`);
  }

  verifyPassword(email: string, motDePasse: string): Observable<boolean> {
    const params = new HttpParams()
      .set('email', email)
      .set('motDePasse', motDePasse);
    return this.http.post<boolean>(`${this.apiUrl}/verify-password`, null, { params });
  }

  googleLogin(email: string, providerId: string, nom: string, prenom: string): Observable<Utilisateur> {
    const params = new HttpParams()
      .set('email', email)
      .set('providerId', providerId)
      .set('nom', nom)
      .set('prenom', prenom);
    return this.http.post<Utilisateur>(`${this.apiUrl}/google-login`, null, { params });
  }

  getNouveauxUtilisateurs(jours: number): Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(`${this.apiUrl}/nouveaux/${jours}`);
  }
}