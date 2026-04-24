import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, interval, switchMap } from 'rxjs';

export interface Notification {
  id: number;
  titre: string;
  message: string;
  type: string;
  reference: string;
  lu: boolean;
  dateCreation: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = 'http://localhost:9091/api/notifications';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const userStr = localStorage.getItem('currentUser');
    const user = userStr ? JSON.parse(userStr) : null;
    const userId = user?.id || 0;
    return new HttpHeaders({ 'userId': userId.toString() });
  }

  getNonLues(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/non-lues`, {
      headers: this.getHeaders()
    });
  }

  getAll(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/all`, {
      headers: this.getHeaders()
    });
  }

  marquerLue(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/lue`, null, {
      headers: this.getHeaders()
    });
  }

  marquerToutLu(): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/tout-lu`, null, {
      headers: this.getHeaders()
    });
  }

  // Polling toutes les 10 secondes
  startPolling(): Observable<Notification[]> {
    return interval(10000).pipe(
      switchMap(() => this.getNonLues())
    );
  }
}