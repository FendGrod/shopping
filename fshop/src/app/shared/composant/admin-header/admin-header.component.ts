import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../service/auth.service';
import { NotificationService, Notification } from '../../../../service/notification.service';
import { MessageService, Message } from '../../../../service/message.service';
import { Utilisateur } from '../../../../model/utilisateur';
import { Subscription } from 'rxjs';

declare var bootstrap: any;

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-header.component.html',
  styleUrls: ['./admin-header.component.css']
})
export class AdminHeaderComponent implements OnInit, OnDestroy {
  @Input() activeMenu = 'dashboard';
  currentUser: Utilisateur | null = null;
  
  // Notifications
  notifications: Notification[] = [];
  nonLuesCount = 0;
  private pollingSubscription: Subscription | null = null;
  private notificationModal: any;
  
  // Messages
  messages: Message[] = [];
  nonRepondusCount = 0;
  private messagesModal: any;
  selectedMessage: Message | null = null;
  reponseText = '';
  
  // Polling messages
  private messagesPollingSubscription: Subscription | null = null;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.loadNonLues();
    this.loadNonRepondus();
    this.startPolling();
    this.startMessagesPolling();
  }

  ngOnDestroy() {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
    if (this.messagesPollingSubscription) {
      this.messagesPollingSubscription.unsubscribe();
    }
  }

  // ========== NOTIFICATIONS ==========
  loadNonLues() {
    this.notificationService.getNonLues().subscribe({
      next: (data) => this.nonLuesCount = data.length,
      error: (err) => console.error(err)
    });
  }

  startPolling() {
    this.pollingSubscription = this.notificationService.startPolling().subscribe({
      next: (notifications) => {
        if (notifications.length > this.nonLuesCount) this.jouerSon();
        this.nonLuesCount = notifications.length;
      }
    });
  }

  jouerSon() {
    const audio = new Audio('/assets/notification.mp3');
    audio.play().catch(e => console.log('Son non joué', e));
  }

  openNotifications() {
    this.notificationService.getAll().subscribe({
      next: (notifications) => {
        this.notifications = notifications;
        this.notificationService.marquerToutLu().subscribe(() => this.nonLuesCount = 0);
        const modalEl = document.getElementById('notificationsModal');
        if (modalEl) {
          this.notificationModal = new bootstrap.Modal(modalEl);
          this.notificationModal.show();
        }
      }
    });
  }

  marquerLue(notificationId: number) {
    this.notificationService.marquerLue(notificationId).subscribe(() => {
      const notif = this.notifications.find(n => n.id === notificationId);
      if (notif) notif.lu = true;
      this.nonLuesCount = this.notifications.filter(n => !n.lu).length;
    });
  }

  // ========== MESSAGES ==========
  loadNonRepondus() {
    this.messageService.getNonRepondus().subscribe({
      next: (data) => this.nonRepondusCount = data.length,
      error: (err) => console.error(err)
    });
  }

  startMessagesPolling() {
    this.messagesPollingSubscription = this.messageService.getNonRepondus().subscribe({
      next: (messages) => {
        if (messages.length > this.nonRepondusCount) this.jouerSon();
        this.nonRepondusCount = messages.length;
      }
    });
    setTimeout(() => this.startMessagesPolling(), 15000);
  }

openMessages() {
  // Fermer le modal notifications s'il est ouvert
  if (this.notificationModal) {
    this.notificationModal.hide();
  }
  
  this.messageService.getAll().subscribe({
    next: (messages) => {
      this.messages = messages;
      const modalEl = document.getElementById('messagesModal');
      if (modalEl) {
        // S'assurer qu'il n'y a pas de backdrop existant
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(backdrop => backdrop.remove());
        document.body.classList.remove('modal-open');
        
        this.messagesModal = new bootstrap.Modal(modalEl);
        this.messagesModal.show();
      }
    }
  });
}

  openConversation(message: Message) {
    this.selectedMessage = message;
    this.reponseText = message.reponse || '';
  }

envoyerReponse() {
  if (!this.selectedMessage || !this.reponseText.trim()) return;
  
  this.messageService.repondre(this.selectedMessage.id, this.reponseText).subscribe({
    next: () => {
      // Rafraîchir les messages
      this.messageService.getAll().subscribe({
        next: (messages) => {
          this.messages = messages;
          // Mettre à jour le message sélectionné
          const updated = this.messages.find(m => m.id === this.selectedMessage?.id);
          if (updated) {
            this.selectedMessage = updated;
          }
          this.reponseText = '';
          this.loadNonRepondus();
        }
      });
    },
    error: (err) => console.error(err)
  });
}

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getMenuTitle(): string {
    const titles: { [key: string]: string } = {
      dashboard: 'Tableau de bord',
      clients: 'Gestion des clients',
      products: 'Gestion des produits',
      orders: 'Gestion des commandes',
      categories: 'Gestion des catégories',
      admins: 'Gestion des administrateurs',
      settings: 'Paramètres'
    };
    return titles[this.activeMenu] || 'Administration';
  }

  getMenuIcon(): string {
    const icons: { [key: string]: string } = {
      dashboard: 'tachometer-alt',
      clients: 'users',
      products: 'box',
      orders: 'shopping-cart',
      categories: 'tags',
      admins: 'user-shield',
      settings: 'cog'
    };
    return icons[this.activeMenu] || 'cog';
  }

  logout() {
    this.authService.logout();
  }

  getUserName(): string {
    if (this.currentUser) {
      return `${this.currentUser.prenom} ${this.currentUser.nom}`;
    }
    return '';
  }
}