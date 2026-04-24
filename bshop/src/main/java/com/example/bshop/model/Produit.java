package com.example.bshop.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "produit", uniqueConstraints = @UniqueConstraint(columnNames = "nom"))
public class Produit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true) // ← Ajout unique = true pour éviter doublons
    private String nom;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private Double prix;

    @Column(name = "prix_original")
    private Double prixOriginal; // Prix original pour les promotions

    @Column(nullable = false)
    private Integer stock;

    @Column(columnDefinition = "TEXT")
    private String imageUrl;

    @Column(nullable = false)
    private String categorie; // CHAUSSURES, VETEMENTS, ACCESSOIRES, SPORT

    private String sousCategorie; // HOMME, FEMME, ENFANT, SPORT, etc.

    private String genre; // HOMME, FEMME, ENFANT, UNISEXE

    private Double rating; // Note du produit (0-5)

    @Column(name = "is_promo")
    private Boolean isPromo = false; // Est-ce que le produit est en promo ?

    @Column(name = "is_new")
    private Boolean isNew = false; // Est-ce un nouveau produit ?

    @ElementCollection
    @CollectionTable(name = "produit_tailles", joinColumns = @JoinColumn(name = "produit_id"))
    @Column(name = "taille")
    private List<String> tailles = new ArrayList<>(); // Tailles disponibles

    @ElementCollection
    @CollectionTable(name = "produit_couleurs", joinColumns = @JoinColumn(name = "produit_id"))
    @Column(name = "couleur")
    private List<String> couleurs = new ArrayList<>(); // Couleurs disponibles

    @Column(name = "date_creation")
    private LocalDateTime dateCreation;

    @PrePersist
    protected void onCreate() {
        dateCreation = LocalDateTime.now();
        if (rating == null) rating = 0.0;
        if (isPromo == null) isPromo = false;
        if (isNew == null) isNew = false;
    }
}