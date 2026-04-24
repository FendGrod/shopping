import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from "../../../../shared/composant/header/header.component";

@Component({
  selector: 'app-a-propos',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent],
  templateUrl: './a-propos.component.html',
  styleUrls: ['./a-propos.component.css']
})
export class AProposComponent implements OnInit, OnDestroy {
  
  backgroundImages: string[] = [
    'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1600',
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600',
    'https://images.unsplash.com/photo-1441986301863-73d8c3d1e2b2?w=1600',
    'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=1600'
  ];
  currentImageIndex = 0;
  private intervalId: any;

  equipe = [
    { nom: 'Marie Diop', role: 'Fondatrice & CEO', image: 'https://randomuser.me/api/portraits/women/1.jpg', description: 'Passionnée de mode depuis 15 ans' },
    { nom: 'Amadou Diallo', role: 'Directeur commercial', image: 'https://randomuser.me/api/portraits/men/2.jpg', description: 'Expert en tendances' },
    { nom: 'Fatou Ndiaye', role: 'Responsable clientèle', image: 'https://randomuser.me/api/portraits/women/3.jpg', description: 'À votre écoute' }
  ];

  valeurs = [
    { titre: 'Qualité', description: 'Des produits rigoureusement sélectionnés', icon: 'fa-gem' },
    { titre: 'Accessibilité', description: 'Des prix justes pour tous', icon: 'fa-hand-holding-heart' },
    { titre: 'Service', description: 'Une équipe dédiée à votre satisfaction', icon: 'fa-headset' },
    { titre: 'Innovation', description: 'Toujours à la pointe des tendances', icon: 'fa-lightbulb' }
  ];

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
}