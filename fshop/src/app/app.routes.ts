import { Routes } from '@angular/router';
import { ConnexionComponent } from './features/auth/connexion/connexion.component';
import { AccueilComponent } from './features/client/pages/accueil/accueil.component';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { Role } from '../model/utilisateur';
// import { AdminGuard } from './guards/admin.guard';
import { AdminLayoutComponent } from './features/admin/pages/layout/admin-layout/admin-layout.component';
import { AdminDashboardComponent } from './features/admin/pages/admin-dashboard/admin-dashboard.component';
import { AdminUsersComponent } from './features/admin/pages/admin-users/admin-users.component';
import { AdminClientsComponent } from './features/admin/pages/admin-clients/admin-clients.component';
import { AdminProduitsComponent } from './features/admin/pages/admin-produits/admin-produits.component';
import { ProduitsComponent } from './features/client/pages/produits/produits.component';
import { AProposComponent } from './features/client/pages/a-propos/a-propos.component';
import { ContactComponent } from './features/client/pages/contact/contact.component';
import { ConfirmationComponent } from './features/client/pages/confirmation/confirmation.component';
import { CommandeComponent } from './features/client/pages/commande/commande.component';
import { MesCommandesComponent } from './features/client/pages/mes-commandes/mes-commandes.component';
import { AdminOrdersComponent } from './features/admin/pages/admin-orders/admin-orders.component';



export const routes: Routes = [
  // Routes publiques
  { path: "", component: ConnexionComponent },
  { path: "connexion", component: ConnexionComponent },
  
  // Routes protégées pour clients
  { 
    path: "accueil", 
    component: AccueilComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: "produits", 
    component: ProduitsComponent,
    canActivate: [AuthGuard]
  },
  { path: "a-propos", component: AProposComponent, canActivate: [AuthGuard] },
  { path: "contact", component: ContactComponent, canActivate: [AuthGuard] },
  { path: "commande", component: CommandeComponent, canActivate: [AuthGuard] },
  { path: "confirmation/:reference", component: ConfirmationComponent, canActivate: [AuthGuard] },
  { path: "mes-commandes", component: MesCommandesComponent, canActivate: [AuthGuard] },


  
  // Routes pour Admin (layout avec sidebar)
  // Seul ADMIN ou SUPER_ADMIN peuvent accéder
  { 
    path: "admin", 
    component: AdminLayoutComponent, 
    canActivate: [AuthGuard, RoleGuard],
    data: { role: Role.ADMIN}, 
     // ← Ici on passe le rôle requis
    children: [
      { path: "", redirectTo: "dashboard", pathMatch: "full" },
      { path: "dashboard", component: AdminDashboardComponent },
      { path: "admins", component: AdminUsersComponent },
      { path : "clients",component:AdminClientsComponent},
      { path : "products",component:AdminProduitsComponent},
      { path: "orders", component: AdminOrdersComponent },
   
    ]
  },
  
  // Redirection par défaut
  { path: "**", redirectTo: "/connexion" }
];