export interface LigneCommande {
  id?: number;
  produitId: number;
  produitNom: string;
  prixUnitaire: number;
  quantite: number;
  taille?: string;
  couleur?: string;
}

export interface Commande {
  id?: number;
  reference: string;
  dateCommande: Date;
  totalProduits: number;
  fraisLivraison: number;
  total: number;
  adresse: string;
  ville: string;
  codePostal?: string;
  telephone: string;
  modeLivraison: string;
  modePaiement: string;
  statut: string;
  lignes?: LigneCommande[];
  
   utilisateur: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
  };  // ← AJOUTE CETTE LIGNE
}