export interface Produit {
    id?: number;
    nom: string;
    description: string;
    prix: number;
    stock: number;
    imageUrl: string;
    categorie: string;
    sousCategorie: string;
    genre: string;
    dateCreation?: Date;
}

export enum Categorie {
    CHAUSSURES = 'CHAUSSURES',
    VETEMENTS = 'VETEMENTS',
    ACCESSOIRES = 'ACCESSOIRES',
    SPORT = 'SPORT'
}

export enum Genre {
    HOMME = 'HOMME',
    FEMME = 'FEMME',
    ENFANT = 'ENFANT',
    UNISEXE = 'UNISEXE'
}