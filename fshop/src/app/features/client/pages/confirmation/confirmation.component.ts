import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { HeaderComponent } from '../../../../shared/composant/header/header.component';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent],
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.css']
})
export class ConfirmationComponent implements OnInit {
  
  reference: string = '';
  
  constructor(private route: ActivatedRoute) {}
  
  ngOnInit() {
    this.reference = this.route.snapshot.params['reference'];
  }
}