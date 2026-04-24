import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Utilisateur } from '../../../../model/utilisateur';
import { AuthService } from '../../../../service/auth.service';
import { MessageService, Message } from '../../../../service/message.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

declare var bootstrap: any;

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  currentUser: Utilisateur | null = null;
  cartCount = 0;
  cartItems: any[] = [];
  totalPanier = 0;
  private cartUpdateListener: any;
  private cartModalInstance: any;
  
  // Messages
  messages: Message[] = [];
  nonRepondusCount = 0;
  private messagesModal: any;
  selectedMessage: Message | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.loadCart();
    
    this.cartUpdateListener = () => this.loadCart();
    window.addEventListener('cartUpdated', this.cartUpdateListener);
    
    // Charger les messages si connecté
    if (this.isLoggedIn()) {
      this.loadMessages();
    }
  }

  ngOnDestroy() {
    if (this.cartUpdateListener) {
      window.removeEventListener('cartUpdated', this.cartUpdateListener);
    }
  }

  loadCart() {
    const cart = localStorage.getItem('cart');
    this.cartItems = cart ? JSON.parse(cart) : [];
    this.cartCount = this.cartItems.reduce((sum, item) => sum + item.quantite, 0);
    this.totalPanier = this.cartItems.reduce((sum, item) => sum + (item.prix * item.quantite), 0);
  }

  loadMessages() {
    this.messageService.getMesMessages().subscribe({
      next: (data) => {
        this.messages = data;
        this.nonRepondusCount = data.filter(m => !m.estRepondu).length;
      },
      error: (err) => console.error('Erreur chargement messages', err)
    });
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  getUserName(): string {
    if (this.currentUser) {
      return `${this.currentUser.prenom} ${this.currentUser.nom}`;
    }
    return '';
  }

  logout() {
    this.authService.logout();
  }

  // ========== PANIER ==========
  openCartModal() {
    const modalEl = document.getElementById('cartModal');
    if (modalEl) {
      this.cartModalInstance = new bootstrap.Modal(modalEl);
      this.cartModalInstance.show();
    }
  }

  closeCartModal() {
    if (this.cartModalInstance) {
      this.cartModalInstance.hide();
    }
  }

  removeFromCart(index: number) {
    this.cartItems.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(this.cartItems));
    this.loadCart();
    window.dispatchEvent(new Event('cartUpdated'));
    
    if (this.cartItems.length === 0) {
      this.closeCartModal();
    }
  }

  clearCart() {
    if (confirm('Voulez-vous vraiment vider votre panier ?')) {
      localStorage.removeItem('cart');
      this.loadCart();
      this.closeCartModal();
      window.dispatchEvent(new Event('cartUpdated'));
    }
  }

  updateQuantity(index: number, newQuantity: number) {
    const item = this.cartItems[index];
    
    if (newQuantity < 1) {
      this.removeFromCart(index);
      return;
    }
    
    if (newQuantity > item.stock) {
      alert(`Stock insuffisant ! Il ne reste que ${item.stock} exemplaire(s) de "${item.nom}".`);
      return;
    }
    
    this.cartItems[index].quantite = newQuantity;
    localStorage.setItem('cart', JSON.stringify(this.cartItems));
    this.loadCart();
    window.dispatchEvent(new Event('cartUpdated'));
  }

  updateQuantityInput(index: number, event: any) {
    let newQuantity = parseInt(event.target.value);
    if (isNaN(newQuantity)) newQuantity = 1;
    
    const item = this.cartItems[index];
    if (newQuantity > item.stock) {
      alert(`Stock insuffisant ! Il ne reste que ${item.stock} exemplaire(s) de "${item.nom}".`);
      event.target.value = item.quantite;
      return;
    }
    
    if (newQuantity < 1) newQuantity = 1;
    
    this.cartItems[index].quantite = newQuantity;
    localStorage.setItem('cart', JSON.stringify(this.cartItems));
    this.loadCart();
    window.dispatchEvent(new Event('cartUpdated'));
  }

  panierInvalide(): boolean {
    return this.cartItems.some(item => item.quantite > item.stock);
  }

  checkout() {
    if (this.cartModalInstance) {
      this.cartModalInstance.hide();
    }
    setTimeout(() => {
      const backdrops = document.querySelectorAll('.modal-backdrop');
      backdrops.forEach(backdrop => backdrop.remove());
      document.body.classList.remove('modal-open');
      document.body.style.removeProperty('overflow');
      document.body.style.removeProperty('padding-right');
      this.router.navigate(['/commande']);
    }, 150);
  }

  // ========== MESSAGES ==========
  openMessages() {
    // Rafraîchir la liste
    this.messageService.getMesMessages().subscribe({
      next: (data) => {
        this.messages = data;
        this.nonRepondusCount = data.filter(m => !m.estRepondu).length;
        const modalEl = document.getElementById('messagesModal');
        if (modalEl) {
          this.messagesModal = new bootstrap.Modal(modalEl);
          this.messagesModal.show();
        }
      }
    });
  }

  openConversation(message: Message) {
    this.selectedMessage = message;
  }

  formatMoney(value: number): string {
    return value.toLocaleString('fr-FR') + ' FCFA';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatutText(estRepondu: boolean): string {
    return estRepondu ? 'Répondu' : 'En attente';
  }
}