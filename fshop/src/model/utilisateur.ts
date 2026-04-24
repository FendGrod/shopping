export interface Utilisateur{
    id?:number,
    nom :string,
    prenom:string;
    motDePasse:string,
    email :string,
    telephone:string;
    provider:string,
    providerId:string,
    adresse:string,
   dateCreation ?:Date,
    role :Role
}

export enum Role{
    ADMIN = 'ADMIN',
    SUPER_ADMIN ='SUPER_ADMIN',
    CLIENT='CLIENT'
}