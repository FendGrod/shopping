import { Routes } from '@angular/router';
import { ConnexionComponent } from './features/auth/connexion/connexion.component';
import { AccueilComponent } from './features/client/pages/accueil/accueil.component';
import { ShoesComponent } from './features/client/pages/shoes/shoes.component';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { Role } from '../model/utilisateur';
// import { AdminGuard } from './guards/admin.guard';
import { AdminLayoutComponent } from './features/admin/pages/layout/admin-layout/admin-layout.component';
import { AdminDashboardComponent } from './features/admin/pages/admin-dashboard/admin-dashboard.component';
import { AdminUsersComponent } from './features/admin/pages/admin-users/admin-users.component';
import { AdminClientsComponent } from './features/admin/pages/admin-clients/admin-clients.component';
import { AdminProduitsComponent } from './features/admin/pages/admin-produits/admin-produits.component';

// import { AdminProductsComponent } from './pages/admin-products/admin-products.component';
// import { AdminOrdersComponent } from './pages/admin-orders/admin-orders.component';
// import { AdminCategoriesComponent } from './pages/admin-categories/admin-categories.component';

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
    path: "chaussures", 
    component: ShoesComponent,
    canActivate: [AuthGuard]
  },
  
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
      { path : "products",component:AdminProduitsComponent}
   
    ]
  },
  
  // Redirection par défaut
  { path: "**", redirectTo: "/connexion" }
];