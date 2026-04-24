import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Message {
  id: number;
  nom: string;
  email: string;
  sujet: string;
  contenu: string;
  reponse: string;
  estRepondu: boolean;
  dateEnvoi: Date;
  dateReponse: Date;
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private apiUrl = 'http://localhost:9091/api/messages';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const userStr = localStorage.getItem('currentUser');
    const user = userStr ? JSON.parse(userStr) : null;
    const userId = user?.id || 0;
    return new HttpHeaders({ 'userId': userId.toString() });
  }

  envoyerMessage(message: any): Observable<Message> {
    const userStr = localStorage.getItem('currentUser');
    const user = userStr ? JSON.parse(userStr) : null;
    if (user) {
      message.utilisateurId = user.id;
    }
    return this.http.post<Message>(`${this.apiUrl}/envoyer`, message);
  }

  getNonRepondus(): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/non-repondus`, {
      headers: this.getHeaders()
    });
  }

  getAll(): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/all`, {
      headers: this.getHeaders()
    });
  }

  getMesMessages(): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/mes-messages`, {
      headers: this.getHeaders()
    });
  }

  repondre(id: number, reponse: string): Observable<Message> {
    return this.http.put<Message>(`${this.apiUrl}/${id}/repondre`, { reponse }, {
      headers: this.getHeaders()
    });
  }
}