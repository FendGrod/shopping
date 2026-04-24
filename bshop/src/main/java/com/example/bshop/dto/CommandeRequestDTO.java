package com.example.bshop.dto;

import lombok.Data;
import java.util.List;

@Data
public class CommandeRequestDTO {

    private AdresseLivraisonDTO adresseLivraison;
    private String modeLivraison;
    private String modePaiement;
    private List<PanierItemDTO> items;

    @Data
    public static class AdresseLivraisonDTO {
        private String adresse;
        private String ville;
        private String codePostal;
        private String telephone;
    }

    @Data
    public static class PanierItemDTO {
        private Long produitId;
        private String produitNom;
        private Double prixUnitaire;
        private Integer quantite;
        private String taille;
        private String couleur;
    }
}