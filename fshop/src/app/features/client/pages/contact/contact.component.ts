import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from "../../../../shared/composant/header/header.component";
import { MessageService } from '../../../../../service/message.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit, OnDestroy {
  
  backgroundImages: string[] = [
    'https://images.unsplash.com/photo-1556742393-d75f468bfcb0?w=1600',
    'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1600',
    'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=1600',
    'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1600'
  ];
  currentImageIndex = 0;
  private intervalId: any;

  contactInfo = {
    nom: '',
    email: '',
    sujet: '',
    message: ''
  };

  submitted = false;
  errorMessage = '';
  isLoading = false;

  constructor(private messageService: MessageService) {}

  ngOnInit() {
    this.startImageSlider();
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  startImageSlider() {
    this.intervalId = setInterval(() => {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.backgroundImages.length;
    }, 4000);
  }

  onSubmit() {
    if (!this.contactInfo.nom || !this.contactInfo.email || !this.contactInfo.sujet || !this.contactInfo.message) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = '';
    
    this.messageService.envoyerMessage(this.contactInfo).subscribe({
      next: () => {
        this.submitted = true;
        this.contactInfo = { nom: '', email: '', sujet: '', message: '' };
        setTimeout(() => {
          this.submitted = false;
        }, 3000);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.errorMessage = 'Erreur lors de l\'envoi du message';
        this.isLoading = false;
      }
    });
  }
}